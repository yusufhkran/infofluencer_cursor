import os
from django.conf import settings
from django.http import HttpResponseRedirect
from django.utils import timezone
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from django.views.decorators.csrf import csrf_exempt
from google_auth_oauthlib.flow import Flow
from apps.accounts.models import CompanyProfile
from .models import GA4Token, YouTubeToken, OAuthState
from .scripts.ga4_reports import get_ga4_report
from .scripts.youtube_reports import get_youtube_report
from .scripts.data_savers import GA4DataSaver, YouTubeDataSaver

# OAuth ayarları
if settings.DEBUG:
    os.environ['OAUTHLIB_INSECURE_TRANSPORT'] = '1'

# Available report types
GA4_REPORT_TYPES = [
    'userAcquisitionSource', 'sessionSourceMedium', 'operatingSystem',
    'userGender', 'deviceCategory', 'country', 'city', 'age'
]

YOUTUBE_REPORT_TYPES = [
    'trafficSource', 'ageGroup', 'deviceType', 'topSubscribers'
]

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def company_dashboard(request):
    """Company dashboard API endpoint"""
    try:
        company_profile = CompanyProfile.objects.get(user=request.user)
        return Response({
            'message': f'Welcome to company dashboard, {company_profile.first_name}!',
            'user_type': 'company',
            'user_id': request.user.id,
            'email': request.user.email,
            'company_name': company_profile.work_email.split('@')[1] if company_profile.work_email else None
        })
    except CompanyProfile.DoesNotExist:
        return Response({'error': 'Company profile not found'}, status=404)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def analytics_dashboard(request):
    """Analytics Integration Dashboard"""
    try:
        company_profile = CompanyProfile.objects.get(user=request.user)
        
        # Check connections
        ga4_connected = GA4Token.objects.filter(company=company_profile).exists()
        youtube_connected = YouTubeToken.objects.filter(company=company_profile).exists()
        
        return Response({
            'success': True,
            'connections': {
                'ga4': ga4_connected,
                'youtube': youtube_connected
            },
            'available_report_types': {
                'ga4': GA4_REPORT_TYPES,
                'youtube': YOUTUBE_REPORT_TYPES
            }
        })
    except CompanyProfile.DoesNotExist:
        return Response({'error': 'Company profile not found'}, status=404)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def ga4_auth_start(request):
    """Start GA4 OAuth Flow with Full Permissions"""
    try:
        company_profile = CompanyProfile.objects.get(user=request.user)
        
        # ✅ FULL GA4 SCOPES - Tüm izinler
        scopes = [
            'https://www.googleapis.com/auth/analytics.readonly',
            'https://www.googleapis.com/auth/analytics.edit',
            'https://www.googleapis.com/auth/analytics.manage.users.readonly',
            'https://www.googleapis.com/auth/analytics.provision',
            'openid',
            'https://www.googleapis.com/auth/userinfo.email',
            'https://www.googleapis.com/auth/userinfo.profile'
        ]
        
        print(f"🔄 Starting GA4 auth with scopes: {scopes}")
        
        # OAuth Flow oluştur
        flow = Flow.from_client_config(
            {
                "web": {
                    "client_id": settings.GOOGLE_CLIENT_ID,
                    "client_secret": settings.GOOGLE_CLIENT_SECRET,
                    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                    "token_uri": "https://oauth2.googleapis.com/token"
                }
            },
            scopes=scopes,
            redirect_uri="http://127.0.0.1:8000/api/company/auth/ga4/callback/"
        )

        authorization_url, state = flow.authorization_url(
            access_type='offline',
            include_granted_scopes='true',
            prompt='consent'  # ✅ Yeni izinler için consent zorunlu
        )

        print(f"✅ Authorization URL created: {authorization_url[:100]}...")

        # State'i kaydet
        OAuthState.objects.update_or_create(
            company=company_profile,
            provider='ga4',
            defaults={'state': state}
        )

        return Response({
            'success': True,
            'authorization_url': authorization_url,
            'state': state
        })

    except CompanyProfile.DoesNotExist:
        return Response({'error': 'Company profile not found'}, status=404)
    except Exception as e:
        print(f"❌ GA4 Auth Start Error: {e}")
        return Response({'error': str(e)}, status=500)

@csrf_exempt
@api_view(['GET'])
@permission_classes([AllowAny])
def ga4_auth_callback(request):
    print("🚀🚀🚀 GA4 CALLBACK ÇALIŞTI - AUTHENTICATION BYPASS! 🚀🚀🚀")
    
    state = request.GET.get('state')
    code = request.GET.get('code')
    
    print(f"🔄 State: {state}")
    print(f"🔄 Code: {code[:20] if code else 'None'}...")
    
    if not state or not code:
        frontend_url = f"{settings.FRONTEND_URL}/analytics?error=missing_parameters"
        return HttpResponseRedirect(frontend_url)

    try:
        # State doğrula
        state_record = OAuthState.objects.get(state=state, provider='ga4')
        company_profile = state_record.company

        print(f"✅ State doğrulandı - Company: {company_profile}")

        # ✅ FIX: URL'den tüm scope'ları al ve flow'u onlarla oluştur
        full_scope_string = request.GET.get('scope', '')
        returned_scopes = full_scope_string.replace('%20', ' ').split()
        
        print(f"🔍 Returned scopes: {returned_scopes}")

        # ✅ Manuel token exchange (scope validation bypass)
        import requests
        from datetime import datetime, timedelta
        
        token_url = "https://oauth2.googleapis.com/token"
        token_data = {
            'client_id': settings.GOOGLE_CLIENT_ID,
            'client_secret': settings.GOOGLE_CLIENT_SECRET,
            'code': code,
            'grant_type': 'authorization_code',
            'redirect_uri': "http://127.0.0.1:8000/api/company/auth/ga4/callback/"
        }
        
        response = requests.post(token_url, data=token_data)
        token_response = response.json()
        
        if response.status_code != 200:
            print(f"❌ Token exchange failed: {token_response}")
            frontend_url = f"{settings.FRONTEND_URL}/analytics?error=token_exchange_failed"
            return HttpResponseRedirect(frontend_url)
        
        # Token expiry hesapla
        expires_in = token_response.get('expires_in', 3600)  # Default 1 hour
        token_expiry = datetime.now() + timedelta(seconds=expires_in)

        print(f"✅ Token alındı")

        # Token'ı kaydet
        GA4Token.objects.update_or_create(
            company=company_profile,
            defaults={
                'access_token': token_response['access_token'],
                'refresh_token': token_response.get('refresh_token'),
                'token_expiry': token_expiry
            }
        )

        print(f"✅ Token kaydedildi")

        # State'i sil
        state_record.delete()

        # Frontend'e redirect - ANALYTICS SAYFASINA YÖNLENDİR
        frontend_url = f"{settings.FRONTEND_URL}/analytics?ga4_connected=true"
        print(f"🔄 Redirecting to: {frontend_url}")
        return HttpResponseRedirect(frontend_url)

    except OAuthState.DoesNotExist:
        print(f"❌ State bulunamadı: {state}")
        frontend_url = f"{settings.FRONTEND_URL}/analytics?error=invalid_state"
        return HttpResponseRedirect(frontend_url)
    except Exception as e:
        print(f"❌ GA4 Callback Error: {e}")
        import traceback
        traceback.print_exc()
        frontend_url = f"{settings.FRONTEND_URL}/analytics?error=ga4_auth_failed"
        return HttpResponseRedirect(frontend_url)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def youtube_auth_start(request):
    """Start YouTube OAuth Flow"""
    try:
        company_profile = CompanyProfile.objects.get(user=request.user)
        
        flow = Flow.from_client_config(
            {
                "web": {
                    "client_id": settings.YOUTUBE_CLIENT_ID,
                    "client_secret": settings.YOUTUBE_CLIENT_SECRET,
                    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                    "token_uri": "https://oauth2.googleapis.com/token"
                }
            },
            scopes=[
                'https://www.googleapis.com/auth/youtube.readonly',
                'https://www.googleapis.com/auth/yt-analytics.readonly',
                'openid',
                'https://www.googleapis.com/auth/userinfo.email'
            ],
            redirect_uri="http://127.0.0.1:8000/api/company/auth/youtube/callback/"
        )

        authorization_url, state = flow.authorization_url(
            access_type='offline',
            prompt='consent'
        )

        # State'i kaydet
        OAuthState.objects.update_or_create(
            company=company_profile,
            provider='youtube',
            defaults={'state': state}
        )

        return Response({
            'success': True,
            'authorization_url': authorization_url,
            'state': state
        })

    except CompanyProfile.DoesNotExist:
        return Response({'error': 'Company profile not found'}, status=404)
    except Exception as e:
        return Response({'error': str(e)}, status=500)

@csrf_exempt
@api_view(['GET'])
@permission_classes([AllowAny])
def youtube_auth_callback(request):
    """Handle YouTube OAuth Callback"""
    print("🚀🚀🚀 YOUTUBE CALLBACK ÇALIŞTI! 🚀🚀🚀")
    
    state = request.GET.get('state')
    code = request.GET.get('code')
    
    print(f"🔄 State: {state}")
    print(f"🔄 Code: {code[:20] if code else 'None'}...")
    
    if not state or not code:
        frontend_url = f"{settings.FRONTEND_URL}/analytics?error=missing_parameters"
        return HttpResponseRedirect(frontend_url)

    try:
        # State doğrula
        state_record = OAuthState.objects.get(state=state, provider='youtube')
        company_profile = state_record.company

        print(f"✅ State doğrulandı - Company: {company_profile}")

        # Manuel token exchange (GA4 ile aynı yöntem)
        import requests
        from datetime import datetime, timedelta
        
        token_url = "https://oauth2.googleapis.com/token"
        token_data = {
            'client_id': settings.YOUTUBE_CLIENT_ID,
            'client_secret': settings.YOUTUBE_CLIENT_SECRET,
            'code': code,
            'grant_type': 'authorization_code',
            'redirect_uri': "http://127.0.0.1:8000/api/company/auth/youtube/callback/"
        }
        
        response = requests.post(token_url, data=token_data)
        token_response = response.json()
        
        if response.status_code != 200:
            print(f"❌ Token exchange failed: {token_response}")
            frontend_url = f"{settings.FRONTEND_URL}/analytics?error=token_exchange_failed"
            return HttpResponseRedirect(frontend_url)
        
        # Token expiry hesapla
        expires_in = token_response.get('expires_in', 3600)  # Default 1 hour
        token_expiry = datetime.now() + timedelta(seconds=expires_in)

        print(f"✅ Token alındı")

        # Token'ı kaydet
        YouTubeToken.objects.update_or_create(
            company=company_profile,
            defaults={
                'access_token': token_response['access_token'],
                'refresh_token': token_response.get('refresh_token'),
                'token_expiry': token_expiry
            }
        )

        print(f"✅ Token kaydedildi")

        # State'i sil
        state_record.delete()

        # Frontend'e redirect - ANALYTICS SAYFASINA YÖNLENDİR
        frontend_url = f"{settings.FRONTEND_URL}/analytics?youtube_connected=true"
        print(f"🔄 Redirecting to: {frontend_url}")
        return HttpResponseRedirect(frontend_url)

    except OAuthState.DoesNotExist:
        print(f"❌ State bulunamadı: {state}")
        frontend_url = f"{settings.FRONTEND_URL}/analytics?error=invalid_state"
        return HttpResponseRedirect(frontend_url)
    except Exception as e:
        print(f"❌ YouTube Callback Error: {e}")
        import traceback
        traceback.print_exc()
        frontend_url = f"{settings.FRONTEND_URL}/analytics?error=youtube_auth_failed"
        return HttpResponseRedirect(frontend_url)

# =============================================================================
# 🆕 YENİ SİSTEM: OTOMATIK VERİ ÇEKME FONKSİYONLARI
# =============================================================================

def fetch_all_ga4_data_sync(company_id):
    """Synchronously fetch all GA4 data"""
    try:
        company_profile = CompanyProfile.objects.get(id=company_id)
        ga4_token = GA4Token.objects.get(company=company_profile)
        
        if not ga4_token.property_id:
            print(f"❌ No Property ID for company {company_id}")
            return
        
        print(f"🚀 Starting full data fetch for company: {company_profile.first_name}")
        
        # Tüm rapor tiplerini çek
        report_types = [
            'userAcquisitionSource', 'sessionSourceMedium', 'operatingSystem',
            'userGender', 'deviceCategory', 'country', 'city', 'age'
        ]
        
        successful_reports = 0
        total_records = 0
        
        for report_type in report_types:
            try:
                print(f"🔄 Fetching {report_type}...")
                
                # Veriyi çek
                report_data = get_ga4_report(
                    report_type=report_type,
                    access_token=ga4_token.access_token,
                    refresh_token=ga4_token.refresh_token,
                    client_id=settings.GOOGLE_CLIENT_ID,
                    client_secret=settings.GOOGLE_CLIENT_SECRET,
                    property_id=ga4_token.property_id
                )
                
                # Veritabanına kaydet
                def camel_to_snake(name):
                    import re
                    s1 = re.sub('(.)([A-Z][a-z]+)', r'\1_\2', name)
                    return re.sub('([a-z0-9])([A-Z])', r'\1_\2', s1).lower()
                
                saver_method_name = f"save_{camel_to_snake(report_type)}_data"
                
                if hasattr(GA4DataSaver, saver_method_name):
                    saver_method = getattr(GA4DataSaver, saver_method_name)
                    saver_method(company_profile.id, report_data)
                    successful_reports += 1
                    total_records += len(report_data)
                    print(f"✅ {report_type}: {len(report_data)} records saved")
                else:
                    print(f"⚠️ No saver method for {report_type}")
                    
            except Exception as e:
                print(f"❌ Error fetching {report_type}: {e}")
                continue
        
        print(f"🎉 Data fetch completed: {successful_reports}/{len(report_types)} reports, {total_records} total records")
        
        # Data fetch status'u güncelle
        ga4_token.last_data_fetch = timezone.now()
        ga4_token.save()
        
        return {
            'success': True,
            'successful_reports': successful_reports,
            'total_records': total_records,
            'total_report_types': len(report_types)
        }
        
    except Exception as e:
        print(f"❌ Critical error in data fetch: {e}")
        return {
            'success': False,
            'error': str(e)
        }

# Celery task (eğer Celery kullanılıyorsa)
try:
    from celery import shared_task
    
    @shared_task
    def fetch_all_ga4_data_async(company_id):
        """Asynchronously fetch all GA4 data"""
        return fetch_all_ga4_data_sync(company_id)
except ImportError:
    # Celery yoksa dummy function
    def fetch_all_ga4_data_async(company_id):
        return fetch_all_ga4_data_sync(company_id)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def save_ga4_property_id(request):
    """Save GA4 Property ID and Auto-Fetch All Data"""
    property_id = request.data.get('property_id')
    
    if not property_id:
        return Response({'error': 'Property ID is required'}, status=400)
    
    try:
        company_profile = CompanyProfile.objects.get(user=request.user)
        ga4_token = GA4Token.objects.get(company=company_profile)
        ga4_token.property_id = property_id
        ga4_token.save()
        
        print(f"🔄 Saving Property ID: {property_id}")
        print(f"✅ Property ID saved: {ga4_token.property_id}")
        
        # 🚀 OTOMATIK TÜM VERİLERİ ÇEK
        try:
            # Celery varsa async, yoksa sync çalıştır
            try:
                fetch_all_ga4_data_async.delay(company_profile.id)
                print(f"🚀 Background data fetch started for company: {company_profile.id}")
                fetch_status = 'Background fetch started'
            except:
                # Fallback - sync olarak çek
                print(f"🔄 Running sync data fetch...")
                result = fetch_all_ga4_data_sync(company_profile.id)
                fetch_status = f"Sync fetch completed: {result.get('successful_reports', 0)} reports"
                
        except Exception as e:
            print(f"⚠️ Data fetch error: {e}")
            fetch_status = 'Data fetch failed, can be done manually'
        
        return Response({
            'success': True, 
            'message': 'GA4 Property ID saved and data fetch started',
            'property_id': property_id,
            'data_fetch_status': fetch_status
        })
        
    except CompanyProfile.DoesNotExist:
        return Response({'error': 'Company profile not found'}, status=404)
    except GA4Token.DoesNotExist:
        return Response({'error': 'GA4 token not found. Please connect GA4 first.'}, status=404)
    except Exception as e:
        return Response({'error': str(e)}, status=500)

# =============================================================================
# 🆕 YENİ DASHBOARD ENDPOİNTLERİ
# =============================================================================

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def analytics_overview(request):
    """Ana Analytics Overview Dashboard"""
    try:
        company_profile = CompanyProfile.objects.get(user=request.user)
        
        # Import models
        from .models import (
            GA4UserAcquisitionSourceData, GA4SessionSourceMediumData, 
            GA4CountryData, GA4DeviceCategoryData, GA4AgeData
        )
        
        # 1. Genel İstatistikler
        user_acquisition = GA4UserAcquisitionSourceData.objects.filter(company=company_profile)
        country_data = GA4CountryData.objects.filter(company=company_profile)
        device_data = GA4DeviceCategoryData.objects.filter(company=company_profile)
        
        # Toplam metrikler
        total_users = sum([item.new_users for item in user_acquisition])
        total_sessions = sum([item.sessions for item in user_acquisition])
        avg_engagement = sum([item.engagement_rate for item in user_acquisition]) / len(user_acquisition) if user_acquisition else 0
        
        # 2. Top 5 Acquisition Sources
        top_sources = user_acquisition.order_by('-new_users')[:5]
        top_sources_data = [
            {
                'source': item.acquisition_source,
                'new_users': item.new_users,
                'sessions': item.sessions,
                'engagement_rate': round(item.engagement_rate, 2)
            }
            for item in top_sources
        ]
        
        # 3. Top 5 Countries
        top_countries = country_data.order_by('-active_users')[:5]
        top_countries_data = [
            {
                'country': item.country,
                'active_users': item.active_users,
                'sessions': item.sessions,
                'engagement_rate': round(item.engagement_rate, 2)
            }
            for item in top_countries
        ]
        
        # 4. Device Categories
        device_breakdown = [
            {
                'device': item.device_category,
                'users': item.active_users,
                'bounce_rate': round(item.bounce_rate, 2)
            }
            for item in device_data
        ]
        
        # 5. Last data fetch
        try:
            ga4_token = GA4Token.objects.get(company=company_profile)
            last_data_fetch = ga4_token.last_data_fetch
        except:
            last_data_fetch = None
        
        return Response({
            'success': True,
            'overview': {
                'total_users': total_users,
                'total_sessions': total_sessions,
                'avg_engagement_rate': round(avg_engagement, 2),
                'data_last_updated': last_data_fetch
            },
            'top_sources': top_sources_data,
            'top_countries': top_countries_data,
            'device_breakdown': device_breakdown
        })
        
    except CompanyProfile.DoesNotExist:
        return Response({'error': 'Company profile not found'}, status=404)
    except Exception as e:
        return Response({'error': str(e)}, status=500)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def audience_insights(request):
    """Audience Demographics Dashboard"""
    try:
        company_profile = CompanyProfile.objects.get(user=request.user)
        
        from .models import GA4AgeData, GA4UserGenderData, GA4CountryData
        
        # Yaş dağılımı
        age_data = GA4AgeData.objects.filter(company=company_profile).order_by('-active_users')
        age_distribution = [
            {
                'age_group': item.age,
                'users': item.active_users,
                'sessions': item.sessions,
                'engagement_duration': round(item.user_engagement_duration, 1)
            }
            for item in age_data
        ]
        
        # Cinsiyet dağılımı (eğer veri varsa)
        try:
            gender_data = GA4UserGenderData.objects.filter(company=company_profile)
            gender_distribution = [
                {
                    'gender': item.gender,
                    'sessions': item.sessions,
                    'engagement_rate': round(item.engagement_rate, 2)
                }
                for item in gender_data
            ]
        except:
            gender_distribution = []
        
        # Coğrafi dağılım (tüm ülkeler)
        country_data = GA4CountryData.objects.filter(company=company_profile).order_by('-active_users')
        geographic_distribution = [
            {
                'country': item.country,
                'users': item.active_users,
                'sessions': item.sessions,
                'bounce_rate': round(item.bounce_rate, 2)
            }
            for item in country_data
        ]
        
        return Response({
            'success': True,
            'age_distribution': age_distribution,
            'gender_distribution': gender_distribution,
            'geographic_distribution': geographic_distribution
        })
        
    except Exception as e:
        return Response({'error': str(e)}, status=500)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def traffic_analysis(request):
    """Traffic Sources and Behavior Analysis"""
    try:
        company_profile = CompanyProfile.objects.get(user=request.user)
        
        from .models import (
            GA4UserAcquisitionSourceData, GA4SessionSourceMediumData, 
            GA4DeviceCategoryData, GA4OperatingSystemData
        )
        
        # Acquisition channels
        acquisition_data = GA4UserAcquisitionSourceData.objects.filter(company=company_profile)
        acquisition_analysis = [
            {
                'source': item.acquisition_source,
                'new_users': item.new_users,
                'sessions': item.sessions,
                'engagement_rate': round(item.engagement_rate, 2),
                'conversions': item.conversions,
                'user_engagement_duration': round(item.user_engagement_duration, 1)
            }
            for item in acquisition_data.order_by('-new_users')
        ]
        
        # Session sources
        session_data = GA4SessionSourceMediumData.objects.filter(company=company_profile)
        session_analysis = [
            {
                'source_medium': item.session_source_medium,
                'sessions': item.sessions,
                'conversions': item.conversions,
                'engagement_rate': round(item.engagement_rate, 2),
                'bounce_rate': round(item.bounce_rate, 2)
            }
            for item in session_data.order_by('-sessions')
        ]
        
        # Technology breakdown
        device_data = GA4DeviceCategoryData.objects.filter(company=company_profile)
        technology_breakdown = {
            'devices': [
                {
                    'category': item.device_category,
                    'users': item.active_users,
                    'sessions': item.engaged_sessions,
                    'bounce_rate': round(item.bounce_rate, 2)
                }
                for item in device_data
            ]
        }
        
        # Operating systems (if available)
        try:
            os_data = GA4OperatingSystemData.objects.filter(company=company_profile)
            technology_breakdown['operating_systems'] = [
                {
                    'os': item.operating_system,
                    'users': item.active_users,
                    'sessions': item.engaged_sessions,
                    'engagement_rate': round(item.engagement_rate, 2)
                }
                for item in os_data.order_by('-active_users')[:10]
            ]
        except:
            technology_breakdown['operating_systems'] = []
        
        return Response({
            'success': True,
            'acquisition_channels': acquisition_analysis,
            'session_sources': session_analysis,
            'technology_breakdown': technology_breakdown
        })
        
    except Exception as e:
        return Response({'error': str(e)}, status=500)

# =============================================================================
# ESKİ SİSTEM FONKSİYONLARI (UYUMLULUK İÇİN)
# =============================================================================

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def check_connections(request):
    """Check GA4 and YouTube Connection Status with Property ID"""
    try:
        company_profile = CompanyProfile.objects.get(user=request.user)
        
        ga4_connected = GA4Token.objects.filter(company=company_profile).exists()
        youtube_connected = YouTubeToken.objects.filter(company=company_profile).exists()
        
        ga4_property_id = None
        if ga4_connected:
            try:
                ga4_token = GA4Token.objects.get(company=company_profile)
                ga4_property_id = ga4_token.property_id
                print(f"🔍 Current GA4 Property ID: {ga4_property_id}")
            except GA4Token.DoesNotExist:
                ga4_connected = False
        
        return Response({
            'success': True,
            'connections': {
                'ga4': ga4_connected,
                'youtube': youtube_connected
            },
            'ga4_property_id': ga4_property_id,
            'ga4_property_set': bool(ga4_property_id)
        })
        
    except CompanyProfile.DoesNotExist:
        return Response({'error': 'Company profile not found'}, status=404)
    except Exception as e:
        return Response({'error': str(e)}, status=500)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def run_ga4_report(request):
    """Run GA4 Report and Save to Database"""
    report_type = request.data.get('report_type')
    
    if report_type not in GA4_REPORT_TYPES:
        return Response({'error': 'Invalid GA4 report type'}, status=400)
    
    try:
        company_profile = CompanyProfile.objects.get(user=request.user)
        ga4_token = GA4Token.objects.get(company=company_profile)
        
        if not ga4_token.property_id:
            return Response({'error': 'GA4 Property ID not set. Please set it first.'}, status=400)
        
        print(f"🚀 GA4 Report Request - Report Type: {report_type}")
        print(f"✅ Company Profile Found: {company_profile.first_name} - {company_profile.user.email}")
        print(f"✅ GA4 Token Found: Property ID: {ga4_token.property_id}")
        
        # Token expiry kontrolü
        from django.utils import timezone
        now = timezone.now()
        if ga4_token.token_expiry and ga4_token.token_expiry <= now:
            print(f"⚠️ Token expired, will be refreshed automatically")
        else:
            print(f"✅ Token is still valid")
        
        print(f"🔄 Calling GA4 API...")
        
        # 1. Run the report - API'den veri çek
        report_data = get_ga4_report(
            report_type=report_type,
            access_token=ga4_token.access_token,
            refresh_token=ga4_token.refresh_token,
            client_id=settings.GOOGLE_CLIENT_ID,
            client_secret=settings.GOOGLE_CLIENT_SECRET,
            property_id=ga4_token.property_id
        )
        
        print(f"✅ GA4 Report Data Retrieved: {len(report_data)} records")
        
        # 2. Save to database - Database'e kaydet
        # CamelCase'i snake_case'e çevir
        def camel_to_snake(name):
            import re
            s1 = re.sub('(.)([A-Z][a-z]+)', r'\1_\2', name)
            return re.sub('([a-z0-9])([A-Z])', r'\1_\2', s1).lower()
        
        saver_method_name = f"save_{camel_to_snake(report_type)}_data"
        print(f"🔍 Looking for saver method: {saver_method_name}")
        
        if hasattr(GA4DataSaver, saver_method_name):
            saver_method = getattr(GA4DataSaver, saver_method_name)
            saver_method(company_profile.id, report_data)
            print(f"✅ Data saved to database")
        else:
            print(f"⚠️ Saver method not found: {saver_method_name}")
        
        return Response({
            'success': True,
            'report_type': report_type,
            'record_count': len(report_data),
            'message': f'{report_type} report generated and saved successfully'
        })
        
    except CompanyProfile.DoesNotExist:
        return Response({'error': 'Company profile not found'}, status=404)
    except GA4Token.DoesNotExist:
        return Response({'error': 'GA4 token not found. Please connect GA4 first.'}, status=404)
    except Exception as e:
        print(f"❌ GA4 Report Error: {e}")
        import traceback
        traceback.print_exc()
        return Response({'error': str(e)}, status=500)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def run_youtube_report(request):
    """Run YouTube Report and Save to Database"""
    report_type = request.data.get('report_type')
    
    if report_type not in YOUTUBE_REPORT_TYPES:
        return Response({'error': 'Invalid YouTube report type'}, status=400)
    
    try:
        company_profile = CompanyProfile.objects.get(user=request.user)
        youtube_token = YouTubeToken.objects.get(company=company_profile)
        
        # 1. Run the report - API'den veri çek
        report_data = get_youtube_report(
            report_type=report_type,
            access_token=youtube_token.access_token,
            refresh_token=youtube_token.refresh_token,
            client_id=settings.YOUTUBE_CLIENT_ID,
            client_secret=settings.YOUTUBE_CLIENT_SECRET
        )
        
        # 2. Save to database - Database'e kaydet
        def camel_to_snake(name):
            import re
            s1 = re.sub('(.)([A-Z][a-z]+)', r'\1_\2', name)
            return re.sub('([a-z0-9])([A-Z])', r'\1_\2', s1).lower()
        
        saver_method_name = f"save_{camel_to_snake(report_type)}_data"
        
        if hasattr(YouTubeDataSaver, saver_method_name):
            saver_method = getattr(YouTubeDataSaver, saver_method_name)
            saver_method(company_profile.id, report_data)
            
        return Response({
            'success': True,
            'report_type': report_type,
            'record_count': len(report_data),
            'message': f'{report_type} report generated and saved successfully'
        })
        
    except CompanyProfile.DoesNotExist:
        return Response({'error': 'Company profile not found'}, status=404)
    except YouTubeToken.DoesNotExist:
        return Response({'error': 'YouTube token not found. Please connect YouTube first.'}, status=404)
    except Exception as e:
        return Response({'error': str(e)}, status=500)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_saved_report_from_db(request):
    """Get Saved Report from Database"""
    source = request.GET.get('source')  # 'ga4' or 'youtube'
    report_type = request.GET.get('report_type')
    
    try:
        company_profile = CompanyProfile.objects.get(user=request.user)
        
        # Import models here to avoid circular imports
        from .models import (
            GA4UserAcquisitionSourceData, GA4SessionSourceMediumData, GA4OperatingSystemData,
            GA4UserGenderData, GA4DeviceCategoryData, GA4CountryData, GA4CityData, GA4AgeData,
            YouTubeTrafficSourceData, YouTubeDeviceTypeData, YouTubeAgeGroupData, YouTubeTopSubscribersData
        )
        
        # Model mapping
        model_mapping = {
            'ga4': {
                'userAcquisitionSource': GA4UserAcquisitionSourceData,
                'sessionSourceMedium': GA4SessionSourceMediumData,
                'operatingSystem': GA4OperatingSystemData,
                'userGender': GA4UserGenderData,
                'deviceCategory': GA4DeviceCategoryData,
                'country': GA4CountryData,
                'city': GA4CityData,
                'age': GA4AgeData,
            },
            'youtube': {
                'trafficSource': YouTubeTrafficSourceData,
                'deviceType': YouTubeDeviceTypeData,
                'ageGroup': YouTubeAgeGroupData,
                'topSubscribers': YouTubeTopSubscribersData,
            }
        }
        
        if source not in model_mapping or report_type not in model_mapping[source]:
            return Response({'error': 'Invalid source or report type'}, status=400)
        
        model_class = model_mapping[source][report_type]
        queryset = model_class.objects.filter(company=company_profile)
        
        # Convert to dict (exclude Django internal fields)
        data = list(queryset.values())
        
        # Remove Django internal fields
        cleaned_data = []
        for item in data:
            cleaned_item = {k: v for k, v in item.items() 
                           if k not in ['id', 'company_id', 'created_at', 'updated_at']}
            cleaned_data.append(cleaned_item)
        
        return Response({
            'success': True,
            'source': source,
            'report_type': report_type,
            'data': cleaned_data,
            'record_count': len(cleaned_data)
        })
        
    except CompanyProfile.DoesNotExist:
        return Response({'error': 'Company profile not found'}, status=404)
    except Exception as e:
        return Response({'error': str(e)}, status=500)

# =============================================================================
# DEBUG VE TEST FONKSİYONLARI
# =============================================================================

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def test_ga4_simple(request):
    """Simple GA4 Test - Minimal implementation to debug"""
    
    try:
        company_profile = CompanyProfile.objects.get(user=request.user)
        ga4_token = GA4Token.objects.get(company=company_profile)
        
        if not ga4_token.property_id:
            return Response({'error': 'GA4 Property ID not set'}, status=400)
        
        print(f"🔄 Testing GA4 connection...")
        print(f"   - Property ID: {ga4_token.property_id}")
        print(f"   - Token exists: {bool(ga4_token.access_token)}")
        
        # Minimal GA4 API test
        from google.analytics.data_v1beta import BetaAnalyticsDataClient
        from google.analytics.data_v1beta.types import RunReportRequest, DateRange, Dimension, Metric
        from google.oauth2.credentials import Credentials
        
        try:
            # Create credentials
            creds = Credentials(
                token=ga4_token.access_token,
                refresh_token=ga4_token.refresh_token,
                token_uri="https://oauth2.googleapis.com/token",
                client_id=settings.GOOGLE_CLIENT_ID,
                client_secret=settings.GOOGLE_CLIENT_SECRET
            )
            
            print(f"✅ Credentials created")
            
            # Create client
            client = BetaAnalyticsDataClient(credentials=creds)
            print(f"✅ Client created")
            
            # Simple request - sadece temel metrikler
            request = RunReportRequest(
                property=f"properties/{ga4_token.property_id}",
                dimensions=[Dimension(name="country")],
                metrics=[Metric(name="activeUsers")],
                date_ranges=[DateRange(start_date="7daysAgo", end_date="today")]
            )
            
            print(f"🔄 Making API request...")
            response = client.run_report(request)
            print(f"✅ API request successful")
            
            # Parse response
            data = []
            for row in response.rows:
                data.append({
                    "country": row.dimension_values[0].value,
                    "active_users": int(row.metric_values[0].value)
                })
            
            print(f"✅ Data parsed: {len(data)} rows")
            
            return Response({
                'success': True,
                'message': 'GA4 connection test successful',
                'property_id': ga4_token.property_id,
                'data_count': len(data),
                'sample_data': data[:5] if data else []  # İlk 5 satır
            })
            
        except Exception as api_error:
            print(f"❌ GA4 API Error: {api_error}")
            import traceback
            traceback.print_exc()
            
            return Response({
                'error': f'GA4 API Error: {str(api_error)}',
                'error_type': type(api_error).__name__
            }, status=500)
        
    except CompanyProfile.DoesNotExist:
        return Response({'error': 'Company profile not found'}, status=404)
    except GA4Token.DoesNotExist:
        return Response({'error': 'GA4 token not found'}, status=404)
    except Exception as e:
        print(f"❌ Unexpected Error: {e}")
        import traceback
        traceback.print_exc()
        return Response({'error': f'Unexpected error: {str(e)}'}, status=500)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def validate_ga4_property_id(request):
    """Validate GA4 Property ID Access"""
    property_id = request.data.get('property_id')
    
    if not property_id:
        return Response({'error': 'Property ID is required'}, status=400)
    
    try:
        company_profile = CompanyProfile.objects.get(user=request.user)
        ga4_token = GA4Token.objects.get(company=company_profile)
        
        from google.analytics.data_v1beta import BetaAnalyticsDataClient
        from google.analytics.data_v1beta.types import RunReportRequest, DateRange, Dimension, Metric
        from google.oauth2.credentials import Credentials
        
        # Create credentials
        creds = Credentials(
            token=ga4_token.access_token,
            refresh_token=ga4_token.refresh_token,
            token_uri="https://oauth2.googleapis.com/token",
            client_id=settings.GOOGLE_CLIENT_ID,
            client_secret=settings.GOOGLE_CLIENT_SECRET
        )
        
        # Test property access
        client = BetaAnalyticsDataClient(credentials=creds)
        
        print(f"🔄 Testing property access for: {property_id}")
        
        request_test = RunReportRequest(
            property=f"properties/{property_id}",
            dimensions=[Dimension(name="country")],
            metrics=[Metric(name="activeUsers")],
            date_ranges=[DateRange(start_date="7daysAgo", end_date="today")],
            limit=1
        )
        
        try:
            response = client.run_report(request_test)
            row_count = len(response.rows)
            
            print(f"✅ Property access successful: {row_count} rows")
            
            return Response({
                'success': True,
                'property_id': property_id,
                'access_confirmed': True,
                'test_data_rows': row_count,
                'message': f'Property {property_id} is accessible!'
            })
            
        except Exception as api_error:
            print(f"❌ Property access failed: {api_error}")
            
            error_str = str(api_error).lower()
            
            if 'permission' in error_str or 'access' in error_str:
                return Response({
                    'success': False,
                    'error': 'No access to this property',
                    'property_id': property_id,
                    'suggestions': [
                        'Make sure you own this GA4 property',
                        'Check if Property ID is correct',
                        'Verify your Google account has admin access'
                    ]
                }, status=403)
            
            return Response({
                'success': False,
                'error': f'Validation failed: {str(api_error)}',
                'property_id': property_id
            }, status=500)
        
    except Exception as e:
        print(f"❌ Validation Error: {e}")
        return Response({'error': str(e)}, status=500)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def ga4_debug_info(request):
    """Get GA4 Debug Information"""
    try:
        company_profile = CompanyProfile.objects.get(user=request.user)
        ga4_token = GA4Token.objects.get(company=company_profile)
        
        from django.utils import timezone
        
        # Token info
        now = timezone.now()
        is_expired = ga4_token.token_expiry and ga4_token.token_expiry <= now
        
        debug_info = {
            'token_exists': bool(ga4_token.access_token),
            'token_length': len(ga4_token.access_token) if ga4_token.access_token else 0,
            'refresh_token_exists': bool(ga4_token.refresh_token),
            'property_id': ga4_token.property_id,
            'token_expiry': ga4_token.token_expiry.isoformat() if ga4_token.token_expiry else None,
            'is_token_expired': is_expired,
            'minutes_until_expiry': int((ga4_token.token_expiry - now).total_seconds() / 60) if ga4_token.token_expiry and not is_expired else None,
            'google_client_id_prefix': settings.GOOGLE_CLIENT_ID[:20] + '...' if settings.GOOGLE_CLIENT_ID else None,
            'google_client_secret_exists': bool(settings.GOOGLE_CLIENT_SECRET),
            'last_data_fetch': ga4_token.last_data_fetch.isoformat() if ga4_token.last_data_fetch else None
        }
        
        return Response({
            'success': True,
            'debug_info': debug_info,
            'suggestions': [
                'If token is expired, try generating a new report (auto-refresh)',
                'If property_id is null, set it in the dashboard',
                'If permission error persists, reconnect with full permissions',
                'Make sure you are admin/owner of the GA4 property'
            ]
        })
        
    except CompanyProfile.DoesNotExist:
        return Response({'error': 'Company profile not found'}, status=404)
    except GA4Token.DoesNotExist:
        return Response({'error': 'GA4 token not found'}, status=404)
    except Exception as e:
        return Response({'error': str(e)}, status=500)

# =============================================================================
# MANUAL DATA FETCH ENDPOINT (FALLBACK)
# =============================================================================

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def fetch_all_data_manual(request):
    """Manually trigger full data fetch"""
    try:
        company_profile = CompanyProfile.objects.get(user=request.user)
        ga4_token = GA4Token.objects.get(company=company_profile)
        
        if not ga4_token.property_id:
            return Response({'error': 'GA4 Property ID not set'}, status=400)
        
        print(f"🚀 Manual data fetch triggered by user: {company_profile.user.email}")
        
        # Run sync data fetch
        result = fetch_all_ga4_data_sync(company_profile.id)
        
        if result['success']:
            return Response({
                'success': True,
                'message': 'Data fetch completed successfully',
                'successful_reports': result['successful_reports'],
                'total_records': result['total_records'],
                'total_report_types': result['total_report_types']
            })
        else:
            return Response({
                'success': False,
                'error': result['error']
            }, status=500)
        
    except CompanyProfile.DoesNotExist:
        return Response({'error': 'Company profile not found'}, status=404)
    except GA4Token.DoesNotExist:
        return Response({'error': 'GA4 token not found'}, status=404)
    except Exception as e:
        return Response({'error': str(e)}, status=500)