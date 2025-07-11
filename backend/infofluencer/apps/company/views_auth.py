"""
GA4 ve YouTube OAuth bağlantı, token yönetimi ve bağlantı durumu endpointlerini içerir.
"""

import os
from django.conf import settings
from django.http import HttpResponseRedirect, JsonResponse
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from django.views.decorators.csrf import csrf_exempt
from google_auth_oauthlib.flow import Flow
from apps.accounts.models import CompanyProfile
from apps.company.models import GA4Token, YouTubeToken, OAuthState, InstagramToken
from django.shortcuts import redirect
from django.utils import timezone
from django.db import transaction
import requests
from django.urls import reverse
from urllib.parse import urlencode
from .helpers import is_known, percent_distribution, top_n
import logging
from google.oauth2.credentials import Credentials
from google.auth.transport.requests import Request

# OAuth ayarları
if settings.DEBUG:
    os.environ["OAUTHLIB_INSECURE_TRANSPORT"] = "1"


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def disconnect_youtube(request):
    """Kullanıcının YouTube bağlantısını koparır (token siler)."""
    try:
        company_profile = CompanyProfile.objects.get(user=request.user)
        YouTubeToken.objects.filter(company=company_profile).delete()
        return Response({"success": True, "message": "YouTube bağlantısı koparıldı"})
    except CompanyProfile.DoesNotExist:
        return Response(
            {"success": False, "error": "Company profile not found"}, status=404
        )
    except Exception as e:
        return Response({"success": False, "error": str(e)}, status=500)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def disconnect_ga4(request):
    """Kullanıcının GA4 bağlantısını koparır (token siler)."""
    try:
        company_profile = CompanyProfile.objects.get(user=request.user)
        GA4Token.objects.filter(company=company_profile).delete()
        return Response({"success": True, "message": "GA4 bağlantısı koparıldı"})
    except CompanyProfile.DoesNotExist:
        return Response(
            {"success": False, "error": "Company profile not found"}, status=404
        )
    except Exception as e:
        return Response({"success": False, "error": str(e)}, status=500)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def start_ga4_oauth(request):
    """GA4 OAuth akışını başlatır, kullanıcıya Google OAuth URL'si döner."""
    try:
        company_profile = CompanyProfile.objects.get(user=request.user)
        state = f"ga4_{company_profile.id}_{timezone.now().timestamp()}"
        OAuthState.objects.update_or_create(
            company=company_profile, provider="ga4", defaults={"state": state}
        )
        params = {
            "client_id": settings.GOOGLE_CLIENT_ID,
            "redirect_uri": settings.GA4_REDIRECT_URI,
            "response_type": "code",
            "scope": "https://www.googleapis.com/auth/analytics.readonly",
            "access_type": "offline",
            "state": state,
            "prompt": "consent",
        }
        url = f"https://accounts.google.com/o/oauth2/v2/auth?{urlencode(params)}"
        logging.warning(f"GA4 OAUTH PARAMS: {params}")
        logging.warning(f"GA4 OAUTH URL: {url}")
        print("GA4 OAUTH PARAMS:", params)
        print("GA4 OAUTH URL:", url)
        return Response({"success": True, "auth_url": url, "state": state, "debug": params})
    except Exception as e:
        logging.error(f"GA4 OAUTH ERROR: {e}")
        print("GA4 OAUTH ERROR:", e)
        return Response({"success": False, "error": str(e)}, status=500)


@api_view(["GET"])
@permission_classes([AllowAny])
def ga4_oauth_callback(request):
    """Google'dan dönen callback'i işler, token'ı kaydeder."""
    print('GA4 CALLBACK ÇALIŞTI')
    code = request.GET.get("code")
    state = request.GET.get("state")
    if not code or not state:
        return Response(
            {"success": False, "error": "Missing code or state"}, status=400
        )
    try:
        state_record = OAuthState.objects.get(state=state, provider="ga4")
        company_profile = state_record.company
        data = {
            "code": code,
            "client_id": settings.GOOGLE_CLIENT_ID,
            "client_secret": settings.GOOGLE_CLIENT_SECRET,
            "redirect_uri": settings.GA4_REDIRECT_URI,
            "grant_type": "authorization_code",
        }
        resp = requests.post("https://oauth2.googleapis.com/token", data=data)
        print('GOOGLE TOKEN RESPONSE:', resp.status_code, resp.text)
        if resp.status_code == 200:
            token_data = resp.json()
            GA4Token.objects.update_or_create(
                company=company_profile,
                defaults={
                    "access_token": token_data["access_token"],
                    "refresh_token": token_data.get("refresh_token"),
                    "token_expiry": timezone.now()
                    + timezone.timedelta(seconds=token_data.get("expires_in", 3600)),
                },
            )
            return redirect(settings.FRONTEND_URL + "/dashboard?ga4_connected=1")
        else:
            return Response(
                {"success": False, "error": "Failed to fetch token"}, status=400
            )
    except OAuthState.DoesNotExist:
        return Response({"success": False, "error": "Invalid state"}, status=400)
    except Exception as e:
        return Response({"success": False, "error": str(e)}, status=500)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def start_youtube_oauth(request):
    """YouTube OAuth akışını başlatır, kullanıcıyı Google'a yönlendirir."""
    try:
        company_profile = CompanyProfile.objects.get(user=request.user)
        state = f"yt_{company_profile.id}_{timezone.now().timestamp()}"
        OAuthState.objects.update_or_create(
            company=company_profile, provider="youtube", defaults={"state": state}
        )
        params = {
            "client_id": settings.YOUTUBE_CLIENT_ID,
            "redirect_uri": settings.YOUTUBE_REDIRECT_URI,
            "response_type": "code",
            "scope": "https://www.googleapis.com/auth/youtube.readonly",
            "access_type": "offline",
            "state": state,
            "prompt": "consent",
        }
        url = f"https://accounts.google.com/o/oauth2/v2/auth?{urlencode(params)}"
        # DEBUG LOG
        print("YOUTUBE OAUTH PARAMS:", params)
        print("YOUTUBE OAUTH REDIRECT URI:", settings.YOUTUBE_REDIRECT_URI)
        print("YOUTUBE OAUTH URL:", url)
        return Response({"success": True, "auth_url": url, "state": state})
    except Exception as e:
        return Response({"success": False, "error": str(e)}, status=500)


@api_view(["GET"])
@permission_classes([AllowAny])
def youtube_oauth_callback(request):
    """YouTube'dan dönen callback'i işler, token'ı kaydeder."""
    code = request.GET.get("code")
    state = request.GET.get("state")
    # DEBUG LOG
    print("YOUTUBE CALLBACK ÇALIŞTI")
    print("YOUTUBE CALLBACK CODE:", code)
    print("YOUTUBE CALLBACK STATE:", state)
    print("YOUTUBE CALLBACK REDIRECT URI:", settings.YOUTUBE_REDIRECT_URI)
    if not code or not state:
        return Response(
            {"success": False, "error": "Missing code or state"}, status=400
        )
    try:
        state_record = OAuthState.objects.get(state=state, provider="youtube")
        company_profile = state_record.company
        data = {
            "code": code,
            "client_id": settings.YOUTUBE_CLIENT_ID,
            "client_secret": settings.YOUTUBE_CLIENT_SECRET,
            "redirect_uri": settings.YOUTUBE_REDIRECT_URI,
            "grant_type": "authorization_code",
        }
        print("YOUTUBE TOKEN REQUEST DATA:", data)
        resp = requests.post("https://oauth2.googleapis.com/token", data=data)
        print("YOUTUBE TOKEN RESPONSE:", resp.status_code, resp.text)
        if resp.status_code == 200:
            token_data = resp.json()
            YouTubeToken.objects.update_or_create(
                company=company_profile,
                defaults={
                    "access_token": token_data["access_token"],
                    "refresh_token": token_data.get("refresh_token"),
                    "token_expiry": timezone.now()
                    + timezone.timedelta(seconds=token_data.get("expires_in", 3600)),
                },
            )
            print("YOUTUBE TOKEN ALINDI!", token_data)
            logging.warning(f"YOUTUBE TOKEN ALINDI! {token_data}")
            return redirect(settings.FRONTEND_URL + "/dashboard?youtube_connected=1")
        else:
            return Response(
                {"success": False, "error": "Failed to fetch token"}, status=400
            )
    except OAuthState.DoesNotExist:
        return Response({"success": False, "error": "Invalid state"}, status=400)
    except Exception as e:
        return Response({"success": False, "error": str(e)}, status=500)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_youtube_connection_status(request):
    """Kullanıcının YouTube bağlantı durumu: {connected: true/false}"""
    try:
        company_profile = CompanyProfile.objects.get(user=request.user)
        connected = YouTubeToken.objects.filter(company=company_profile).exists()
        return Response({"connected": connected})
    except CompanyProfile.DoesNotExist:
        return Response({"connected": False})


def refresh_ga4_token(company_profile):
    token = (
        GA4Token.objects.filter(company=company_profile).order_by("-created_at").first()
    )
    if not token or not token.refresh_token:
        return None
    data = {
        "client_id": settings.GOOGLE_CLIENT_ID,
        "client_secret": settings.GOOGLE_CLIENT_SECRET,
        "refresh_token": token.refresh_token,
        "grant_type": "refresh_token",
    }
    resp = requests.post("https://oauth2.googleapis.com/token", data=data)
    if resp.status_code == 200:
        token_data = resp.json()
        token.access_token = token_data["access_token"]
        token.token_expiry = timezone.now() + timezone.timedelta(
            seconds=token_data.get("expires_in", 3600)
        )
        token.save()
        return token
    return None

def get_fresh_ga4_credentials(company_profile):
    token = GA4Token.objects.filter(company=company_profile).order_by("-created_at").first()
    if not token or not token.access_token or not token.refresh_token:
        return None
    creds = Credentials(
        token=token.access_token,
        refresh_token=token.refresh_token,
        token_uri="https://oauth2.googleapis.com/token",
        client_id=settings.GOOGLE_CLIENT_ID,
        client_secret=settings.GOOGLE_CLIENT_SECRET,
    )
    if creds.expired and creds.refresh_token:
        creds.refresh(Request())
        token.access_token = creds.token
        token.token_expiry = timezone.now() + timezone.timedelta(seconds=3600)
        token.save()
    return creds

def get_fresh_youtube_credentials(company_profile):
    """YouTube token'ını yeniler ve taze credentials döner."""
    try:
        token = YouTubeToken.objects.get(company=company_profile)
        if token.token_expiry and token.token_expiry <= timezone.now():
            # Token'ı yenile
            data = {
                "client_id": settings.YOUTUBE_CLIENT_ID,
                "client_secret": settings.YOUTUBE_CLIENT_SECRET,
                "refresh_token": token.refresh_token,
                "grant_type": "refresh_token",
            }
            resp = requests.post("https://oauth2.googleapis.com/token", data=data)
            if resp.status_code == 200:
                token_data = resp.json()
                token.access_token = token_data["access_token"]
                token.token_expiry = timezone.now() + timezone.timedelta(
                    seconds=token_data.get("expires_in", 3600)
                )
                token.save()
        return token.access_token
    except YouTubeToken.DoesNotExist:
        return None
    except Exception as e:
        logging.error(f"YouTube token refresh error: {e}")
        return None


# ===== INSTAGRAM OAUTH FUNCTIONS =====

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def disconnect_instagram(request):
    """Kullanıcının Instagram bağlantısını koparır (token siler)."""
    try:
        company_profile = CompanyProfile.objects.get(user=request.user)
        InstagramToken.objects.filter(company=company_profile).delete()
        return Response({"success": True, "message": "Instagram bağlantısı koparıldı"})
    except CompanyProfile.DoesNotExist:
        return Response(
            {"success": False, "error": "Company profile not found"}, status=404
        )
    except Exception as e:
        return Response({"success": False, "error": str(e)}, status=500)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def start_instagram_oauth(request):
    """Instagram OAuth akışını başlatır, kullanıcıyı Facebook'a yönlendirir."""
    try:
        company_profile = CompanyProfile.objects.get(user=request.user)
        state = f"ig_{company_profile.id}_{timezone.now().timestamp()}"
        OAuthState.objects.update_or_create(
            company=company_profile, provider="instagram", defaults={"state": state}
        )
        
        params = {
            "client_id": settings.INSTAGRAM_APP_ID,
            "redirect_uri": settings.INSTAGRAM_REDIRECT_URI,
            "response_type": "code",
            "scope": "pages_show_list,pages_read_engagement,instagram_basic,instagram_manage_insights,instagram_manage_comments,business_management",
            "state": state,
        }
        url = f"https://www.facebook.com/v22.0/dialog/oauth?{urlencode(params)}"
        
        # DEBUG LOG
        print("INSTAGRAM OAUTH PARAMS:", params)
        print("INSTAGRAM OAUTH REDIRECT URI:", settings.INSTAGRAM_REDIRECT_URI)
        print("INSTAGRAM OAUTH URL:", url)
        
        return Response({"success": True, "auth_url": url, "state": state})
    except Exception as e:
        return Response({"success": False, "error": str(e)}, status=500)


@api_view(["GET"])
@permission_classes([AllowAny])
def instagram_oauth_callback(request):
    """Instagram'dan dönen callback'i işler, token'ı kaydeder."""
    code = request.GET.get("code")
    state = request.GET.get("state")
    
    # DEBUG LOG
    print("INSTAGRAM CALLBACK ÇALIŞTI")
    print("INSTAGRAM CALLBACK CODE:", code)
    print("INSTAGRAM CALLBACK STATE:", state)
    
    if not code or not state:
        return Response(
            {"success": False, "error": "Missing code or state"}, status=400
        )
    
    try:
        state_record = OAuthState.objects.get(state=state, provider="instagram")
        company_profile = state_record.company
        
        # Access token al
        data = {
            "client_id": settings.INSTAGRAM_APP_ID,
            "redirect_uri": settings.INSTAGRAM_REDIRECT_URI,
            "client_secret": settings.INSTAGRAM_APP_SECRET,
            "code": code,
            "grant_type": "authorization_code",
        }
        
        print("INSTAGRAM TOKEN REQUEST DATA:", data)
        resp = requests.post("https://graph.facebook.com/v22.0/oauth/access_token", data=data)
        print("INSTAGRAM TOKEN RESPONSE:", resp.status_code, resp.text)
        
        if resp.status_code == 200:
            token_data = resp.json()
            access_token = token_data.get("access_token")
            
            if not access_token:
                return Response(
                    {"success": False, "error": "Access token alınamadı"}, status=400
                )
            
            # Kısa ömürlü access_token'ı uzun ömürlüye çevir
            ll_resp = requests.get(
                "https://graph.instagram.com/access_token",
                params={
                    "grant_type": "ig_exchange_token",
                    "client_secret": settings.INSTAGRAM_APP_SECRET,
                    "access_token": access_token
                },
                timeout=10
            )
            print("INSTAGRAM LONG-LIVED TOKEN RESPONSE:", ll_resp.status_code, ll_resp.text)
            if ll_resp.status_code == 200:
                ll_token_data = ll_resp.json()
                access_token = ll_token_data.get("access_token")
                expires_in = ll_token_data.get("expires_in", 3600)
            else:
                return Response({"success": False, "error": "Uzun ömürlü access token alınamadı", "details": ll_resp.text}, status=400)
            
            # Instagram business account ID'sini al
            instagram_account_id = None
            facebook_page_id = None
            
            try:
                # Kullanıcının sayfalarını al
                pages_resp = requests.get(
                    'https://graph.facebook.com/v22.0/me/accounts',
                    params={'access_token': access_token},
                    timeout=10
                )
                
                if pages_resp.status_code == 200:
                    pages_data = pages_resp.json()
                    
                    if 'data' in pages_data and pages_data['data']:
                        for page in pages_data['data']:
                            page_id = page['id']
                            page_token = page['access_token']
                            
                            # Instagram hesabını kontrol et
                            ig_resp = requests.get(
                                f'https://graph.facebook.com/v22.0/{page_id}',
                                params={
                                    'fields': 'connected_instagram_account',
                                    'access_token': page_token
                                },
                                timeout=10
                            )
                            
                            if ig_resp.status_code == 200:
                                ig_data = ig_resp.json()
                                
                                if 'connected_instagram_account' in ig_data:
                                    instagram_account_id = ig_data['connected_instagram_account']['id']
                                    facebook_page_id = page_id
                                    break
            except Exception as e:
                print(f"Instagram account detection error: {e}")
            
            # Token'ı kaydet
            InstagramToken.objects.update_or_create(
                company=company_profile,
                defaults={
                    "access_token": access_token,
                    "instagram_business_account_id": instagram_account_id,
                    "facebook_page_id": facebook_page_id,
                    "token_expiry": timezone.now() + timezone.timedelta(seconds=expires_in),
                },
            )
            
            return redirect(settings.FRONTEND_URL + "/dashboard/connections?success=1")
        else:
            return Response(
                {"success": False, "error": "Failed to fetch token"}, status=400
            )
    
    except OAuthState.DoesNotExist:
        return Response({"success": False, "error": "Invalid state"}, status=400)
    except Exception as e:
        return Response({"success": False, "error": str(e)}, status=500)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_instagram_connection_status(request):
    """Instagram bağlantı durumunu kontrol eder."""
    try:
        company_profile = CompanyProfile.objects.get(user=request.user)
        print(f"[DEBUG] Instagram connection: company_profile id={company_profile.id}")
        token = InstagramToken.objects.filter(company=company_profile).first()
        print(f"[DEBUG] Instagram connection: token={token}")
        
        if token:
            # Token'ın geçerliliğini kontrol et
            if token.token_expiry and token.token_expiry <= timezone.now():
                print(f"[DEBUG] Instagram connection: token expired at {token.token_expiry}, now={timezone.now()}")
                # Token süresi dolmuş, sil
                token.delete()
                return Response({"connected": False, "message": "Token expired"})
            print(f"[DEBUG] Instagram connection: valid token, instagram_account_id={token.instagram_business_account_id}, facebook_page_id={token.facebook_page_id}")
            return Response({
                "connected": True,
                "instagram_account_id": token.instagram_business_account_id,
                "facebook_page_id": token.facebook_page_id,
                "last_connected": token.updated_at  # 'last_connected' yerine 'updated_at' kullanıldı
            })
        else:
            print(f"[DEBUG] Instagram connection: No token found for company_profile id={company_profile.id}")
            return Response({"connected": False, "message": "No token found"})
    
    except CompanyProfile.DoesNotExist:
        print(f"[DEBUG] Instagram connection: Company profile not found for user id={request.user.id}")
        return Response(
            {"success": False, "error": "Company profile not found"}, status=404
        )
    except Exception as e:
        print(f"[DEBUG] Instagram connection: Exception occurred: {e}")
        return Response({"success": False, "error": str(e)}, status=500)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_instagram_account_details(request):
    print(f"[DEBUG] Kullanıcı: {request.user}, Authenticated: {request.user.is_authenticated}")
    print(f"[DEBUG] Request headers: {request.headers}")
    print(f"[DEBUG] Request COOKIES: {request.COOKIES}")
    try:
        company_profile = CompanyProfile.objects.get(user=request.user)
        token = InstagramToken.objects.filter(company=company_profile).first()
        if not token or not token.access_token or not token.instagram_business_account_id:
            return Response({"success": False, "error": "Bağlı Instagram hesabı bulunamadı."}, status=404)
        ig_id = token.instagram_business_account_id
        access_token = token.access_token
        resp = requests.get(
            f'https://graph.facebook.com/v17.0/{ig_id}',
            params={
                'fields': 'username,profile_picture_url,name',
                'access_token': access_token
            },
            timeout=10
        )
        if resp.status_code != 200:
            return Response({"success": False, "error": "Instagram hesabı bilgileri alınamadı.", "details": resp.text}, status=400)
        data = resp.json()
        return Response({
            "success": True,
            "username": data.get('username'),
            "profile_picture_url": data.get('profile_picture_url'),
            "name": data.get('name')
        })
    except Exception as e:
        return Response({"success": False, "error": str(e)}, status=500)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def list_facebook_pages_and_instagram_accounts(request):
    """Kullanıcının sahip olduğu tüm Facebook sayfalarını ve bunlara bağlı Instagram hesaplarını listeler."""
    try:
        company_profile = CompanyProfile.objects.get(user=request.user)
        print(f"[DEBUG] Kullanıcı id: {request.user.id}, company_profile id: {company_profile.id}")
        token = InstagramToken.objects.filter(company=company_profile).first()
        if not token or not token.access_token:
            print("[DEBUG] Geçerli Instagram access_token yok.")
            return Response({"success": False, "error": "No valid Instagram access token found."}, status=400)
        access_token = token.access_token
        print(f"[DEBUG] Kullanılan access_token: {access_token}")
        # Facebook sayfalarını çek
        pages_resp = requests.get(
            'https://graph.facebook.com/v22.0/me/accounts',
            params={'access_token': access_token},
            timeout=10
        )
        print(f"[DEBUG] Facebook /me/accounts response: {pages_resp.status_code} {pages_resp.text}")
        if pages_resp.status_code != 200:
            return Response({"success": False, "error": "Failed to fetch Facebook pages", "details": pages_resp.text}, status=400)
        pages_data = pages_resp.json().get('data', [])
        result = []
        for page in pages_data:
            page_id = page['id']
            page_name = page.get('name')
            page_token = page['access_token']
            print(f"[DEBUG] Page: id={page_id}, name={page_name}, page_token={page_token}")
            # Bağlı Instagram hesabını çek
            ig_resp = requests.get(
                f'https://graph.facebook.com/v22.0/{page_id}',
                params={
                    'fields': 'connected_instagram_account',
                    'access_token': page_token
                },
                timeout=10
            )
            print(f"[DEBUG] IG resp for page {page_id}: {ig_resp.status_code} {ig_resp.text}")
            ig_account = None
            if ig_resp.status_code == 200:
                ig_data = ig_resp.json()
                if 'connected_instagram_account' in ig_data:
                    ig_account = ig_data['connected_instagram_account']
                    print(f"[DEBUG] Page {page_id} bağlı Instagram hesabı: {ig_account}")
                else:
                    print(f"[DEBUG] Page {page_id} için bağlı Instagram hesabı yok.")
            else:
                print(f"[DEBUG] Page {page_id} için IG API hatası: {ig_resp.status_code}")
            result.append({
                'page_id': page_id,
                'page_name': page_name,
                'instagram_account': ig_account
            })
        print(f"[DEBUG] Sonuç: {result}")
        return Response({"success": True, "accounts": result})
    except Exception as e:
        print(f"[DEBUG] Exception: {e}")
        return Response({"success": False, "error": str(e)}, status=500)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def save_selected_instagram_account(request):
    """Kullanıcının seçtiği Instagram hesabı ve Facebook sayfa ID'sini kaydeder."""
    try:
        company_profile = CompanyProfile.objects.get(user=request.user)
        page_id = request.data.get('page_id')
        instagram_account_id = request.data.get('instagram_account_id')
        if not page_id or not instagram_account_id:
            return Response({"success": False, "error": "page_id ve instagram_account_id zorunlu."}, status=400)
        token = InstagramToken.objects.filter(company=company_profile).first()
        if not token:
            return Response({"success": False, "error": "Önce Instagram OAuth başlatılmalı."}, status=400)
        token.instagram_business_account_id = instagram_account_id
        token.facebook_page_id = page_id
        token.save()
        return Response({"success": True})
    except Exception as e:
        return Response({"success": False, "error": str(e)}, status=500)

# ========== INSTAGRAM TOKEN REFRESH ENDPOINT =============
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def refresh_instagram_token(request):
    """Mevcut uzun ömürlü Instagram access_token'ı yeniler ve kaydeder."""
    try:
        company_profile = CompanyProfile.objects.get(user=request.user)
        token = InstagramToken.objects.filter(company=company_profile).first()
        if not token or not token.access_token:
            return Response({"success": False, "error": "Önce Instagram hesabı bağlanmalı."}, status=400)
        # Token'ı yenile
        resp = requests.get(
            "https://graph.instagram.com/refresh_access_token",
            params={
                "grant_type": "ig_refresh_token",
                "access_token": token.access_token
            },
            timeout=10
        )
        print("INSTAGRAM REFRESH TOKEN RESPONSE:", resp.status_code, resp.text)
        if resp.status_code == 200:
            data = resp.json()
            token.access_token = data.get("access_token", token.access_token)
            expires_in = data.get("expires_in", 3600)
            token.token_expiry = timezone.now() + timezone.timedelta(seconds=expires_in)
            token.save()
            return Response({"success": True, "access_token": token.access_token, "expires_in": expires_in})
        else:
            return Response({"success": False, "error": "Token yenileme başarısız", "details": resp.text}, status=400)
    except CompanyProfile.DoesNotExist:
        return Response({"success": False, "error": "Company profile not found"}, status=404)
    except Exception as e:
        return Response({"success": False, "error": str(e)}, status=500)
