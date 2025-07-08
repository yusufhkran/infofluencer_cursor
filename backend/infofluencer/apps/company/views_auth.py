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
from .models import GA4Token, YouTubeToken, OAuthState
from django.shortcuts import redirect
from django.utils import timezone
from django.db import transaction
import requests
from django.urls import reverse
from urllib.parse import urlencode
from .helpers import is_known, percent_distribution, top_n

# OAuth ayarları
if settings.DEBUG:
    os.environ["OAUTHLIB_INSECURE_TRANSPORT"] = "1"


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def ga4_auth_start(request):
    """Start GA4 OAuth Flow - Frontend uyumlu response format"""
    try:
        company_profile = CompanyProfile.objects.get(user=request.user)
        scopes = [
            "https://www.googleapis.com/auth/analytics.readonly",
            "https://www.googleapis.com/auth/analytics.edit",
            "https://www.googleapis.com/auth/analytics.manage.users.readonly",
            "https://www.googleapis.com/auth/analytics.provision",
            "openid",
            "https://www.googleapis.com/auth/userinfo.email",
            "https://www.googleapis.com/auth/userinfo.profile",
        ]
        flow = Flow.from_client_config(
            {
                "web": {
                    "client_id": settings.GOOGLE_CLIENT_ID,
                    "client_secret": settings.GOOGLE_CLIENT_SECRET,
                    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                    "token_uri": "https://oauth2.googleapis.com/token",
                }
            },
            scopes=scopes,
            redirect_uri="http://127.0.0.1:8000/api/company/auth/ga4/callback/",
        )
        authorization_url, state = flow.authorization_url(
            access_type="offline", include_granted_scopes="true", prompt="consent"
        )
        OAuthState.objects.update_or_create(
            company=company_profile, provider="ga4", defaults={"state": state}
        )
        return Response(
            {
                "success": True,
                "data": {"auth_url": authorization_url, "state": state},
                "message": "GA4 authorization URL created successfully",
            }
        )
    except CompanyProfile.DoesNotExist:
        return Response(
            {"success": False, "error": "Company profile not found"}, status=404
        )
    except Exception as e:
        return Response(
            {
                "success": False,
                "error": str(e),
                "message": "Failed to start GA4 authorization",
            },
            status=500,
        )


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def youtube_auth_start(request):
    """Start YouTube OAuth Flow - Frontend uyumlu response format"""
    try:
        company_profile = CompanyProfile.objects.get(user=request.user)
        flow = Flow.from_client_config(
            {
                "web": {
                    "client_id": settings.YOUTUBE_CLIENT_ID,
                    "client_secret": settings.YOUTUBE_CLIENT_SECRET,
                    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                    "token_uri": "https://oauth2.googleapis.com/token",
                }
            },
            scopes=[
                "https://www.googleapis.com/auth/youtube.readonly",
                "https://www.googleapis.com/auth/yt-analytics.readonly",
                "openid",
                "https://www.googleapis.com/auth/userinfo.email",
            ],
            redirect_uri="http://127.0.0.1:8000/api/company/auth/youtube/callback/",
        )
        authorization_url, state = flow.authorization_url(
            access_type="offline", prompt="consent"
        )
        OAuthState.objects.update_or_create(
            company=company_profile, provider="youtube", defaults={"state": state}
        )
        return Response(
            {
                "success": True,
                "data": {"auth_url": authorization_url, "state": state},
                "message": "YouTube authorization URL created successfully",
            }
        )
    except CompanyProfile.DoesNotExist:
        return Response(
            {"success": False, "error": "Company profile not found"}, status=404
        )
    except Exception as e:
        return Response(
            {
                "success": False,
                "error": str(e),
                "message": "Failed to start YouTube authorization",
            },
            status=500,
        )


@csrf_exempt
@api_view(["GET"])
@permission_classes([AllowAny])
def ga4_auth_callback(request):
    """GA4 OAuth Callback Handler"""
    state = request.GET.get("state")
    code = request.GET.get("code")
    if not state or not code:
        frontend_url = f"{settings.FRONTEND_URL}/dashboard?error=missing_parameters"
        return HttpResponseRedirect(frontend_url)
    try:
        state_record = OAuthState.objects.get(state=state, provider="ga4")
        company_profile = state_record.company
        import requests
        from datetime import datetime, timedelta

        token_url = "https://oauth2.googleapis.com/token"
        token_data = {
            "client_id": settings.GOOGLE_CLIENT_ID,
            "client_secret": settings.GOOGLE_CLIENT_SECRET,
            "code": code,
            "grant_type": "authorization_code",
            "redirect_uri": "http://127.0.0.1:8000/api/company/auth/ga4/callback/",
        }
        response = requests.post(token_url, data=token_data)
        token_response = response.json()
        if response.status_code != 200:
            frontend_url = (
                f"{settings.FRONTEND_URL}/dashboard?error=token_exchange_failed"
            )
            return HttpResponseRedirect(frontend_url)
        expires_in = token_response.get("expires_in", 3600)
        from datetime import datetime, timedelta

        token_expiry = datetime.now() + timedelta(seconds=expires_in)
        GA4Token.objects.update_or_create(
            company=company_profile,
            defaults={
                "access_token": token_response["access_token"],
                "refresh_token": token_response.get("refresh_token"),
                "token_expiry": token_expiry,
            },
        )
        state_record.delete()
        frontend_url = f"{settings.FRONTEND_URL}/dashboard?ga4_connected=true"
        return HttpResponseRedirect(frontend_url)
    except OAuthState.DoesNotExist:
        frontend_url = f"{settings.FRONTEND_URL}/dashboard?error=invalid_state"
        return HttpResponseRedirect(frontend_url)
    except Exception as e:
        frontend_url = f"{settings.FRONTEND_URL}/dashboard?error=ga4_auth_failed"
        return HttpResponseRedirect(frontend_url)


@csrf_exempt
@api_view(["GET"])
@permission_classes([AllowAny])
def youtube_auth_callback(request):
    """YouTube OAuth Callback Handler"""
    state = request.GET.get("state")
    code = request.GET.get("code")
    if not state or not code:
        frontend_url = f"{settings.FRONTEND_URL}/dashboard?error=missing_parameters"
        return HttpResponseRedirect(frontend_url)
    try:
        state_record = OAuthState.objects.get(state=state, provider="youtube")
        company_profile = state_record.company
        import requests
        from datetime import datetime, timedelta

        token_url = "https://oauth2.googleapis.com/token"
        token_data = {
            "client_id": settings.YOUTUBE_CLIENT_ID,
            "client_secret": settings.YOUTUBE_CLIENT_SECRET,
            "code": code,
            "grant_type": "authorization_code",
            "redirect_uri": "http://127.0.0.1:8000/api/company/auth/youtube/callback/",
        }
        response = requests.post(token_url, data=token_data)
        token_response = response.json()
        if response.status_code != 200:
            frontend_url = (
                f"{settings.FRONTEND_URL}/dashboard?error=token_exchange_failed"
            )
            return HttpResponseRedirect(frontend_url)
        expires_in = token_response.get("expires_in", 3600)
        from datetime import datetime, timedelta

        token_expiry = datetime.now() + timedelta(seconds=expires_in)
        YouTubeToken.objects.update_or_create(
            company=company_profile,
            defaults={
                "access_token": token_response["access_token"],
                "refresh_token": token_response.get("refresh_token"),
                "token_expiry": token_expiry,
            },
        )
        state_record.delete()
        frontend_url = f"{settings.FRONTEND_URL}/dashboard?youtube_connected=true"
        return HttpResponseRedirect(frontend_url)
    except OAuthState.DoesNotExist:
        frontend_url = f"{settings.FRONTEND_URL}/dashboard?error=invalid_state"
        return HttpResponseRedirect(frontend_url)
    except Exception as e:
        frontend_url = f"{settings.FRONTEND_URL}/dashboard?error=youtube_auth_failed"
        return HttpResponseRedirect(frontend_url)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def instagram_auth_start(request):
    return Response(
        {
            "success": False,
            "message": "Instagram integration coming soon",
            "status": "development",
        }
    )


@csrf_exempt
def instagram_auth_callback(request):
    return JsonResponse(
        {"success": False, "message": "Instagram integration coming soon"}
    )


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_youtube_connection_status(request):
    """Kullanıcının YouTube bağlantı durumunu kontrol eder."""
    try:
        company_profile = CompanyProfile.objects.get(user=request.user)
        token = (
            YouTubeToken.objects.filter(company=company_profile)
            .order_by("-created_at")
            .first()
        )
        if token and token.access_token:
            return Response({"success": True, "connected": True})
        else:
            return Response({"success": True, "connected": False})
    except CompanyProfile.DoesNotExist:
        return Response(
            {"success": False, "error": "Company profile not found"}, status=404
        )
    except Exception as e:
        return Response({"success": False, "error": str(e)}, status=500)


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


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def start_ga4_oauth(request):
    """GA4 OAuth akışını başlatır, kullanıcıyı Google'a yönlendirir."""
    try:
        company_profile = CompanyProfile.objects.get(user=request.user)
        state = f"ga4_{company_profile.id}_{timezone.now().timestamp()}"
        OAuthState.objects.update_or_create(
            company=company_profile, provider="ga4", defaults={"state": state}
        )
        params = {
            "client_id": settings.GA4_CLIENT_ID,
            "redirect_uri": settings.GA4_REDIRECT_URI,
            "response_type": "code",
            "scope": "https://www.googleapis.com/auth/analytics.readonly",
            "access_type": "offline",
            "state": state,
            "prompt": "consent",
        }
        url = f"https://accounts.google.com/o/oauth2/v2/auth?{urlencode(params)}"
        return Response({"auth_url": url})
    except Exception as e:
        return Response({"success": False, "error": str(e)}, status=500)


@api_view(["GET"])
def ga4_oauth_callback(request):
    """Google'dan dönen callback'i işler, token'ı kaydeder."""
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
            "client_id": settings.GA4_CLIENT_ID,
            "client_secret": settings.GA4_CLIENT_SECRET,
            "redirect_uri": settings.GA4_REDIRECT_URI,
            "grant_type": "authorization_code",
        }
        resp = requests.post("https://oauth2.googleapis.com/token", data=data)
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


@api_view(["GET"])
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
        return Response({"auth_url": url})
    except Exception as e:
        return Response({"success": False, "error": str(e)}, status=500)


@api_view(["GET"])
def youtube_oauth_callback(request):
    """YouTube'dan dönen callback'i işler, token'ı kaydeder."""
    code = request.GET.get("code")
    state = request.GET.get("state")
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
        resp = requests.post("https://oauth2.googleapis.com/token", data=data)
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
            return redirect(settings.FRONTEND_URL + "/dashboard?youtube_connected=1")
        else:
            return Response(
                {"success": False, "error": "Failed to fetch token"}, status=400
            )
    except OAuthState.DoesNotExist:
        return Response({"success": False, "error": "Invalid state"}, status=400)
    except Exception as e:
        return Response({"success": False, "error": str(e)}, status=500)


def refresh_ga4_token(company_profile):
    token = (
        GA4Token.objects.filter(company=company_profile).order_by("-created_at").first()
    )
    if not token or not token.refresh_token:
        return None
    data = {
        "client_id": settings.GA4_CLIENT_ID,
        "client_secret": settings.GA4_CLIENT_SECRET,
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
