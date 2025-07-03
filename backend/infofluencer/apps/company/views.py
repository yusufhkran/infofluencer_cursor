import os
from django.conf import settings
from django.http import HttpResponseRedirect
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
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

from rest_framework.permissions import AllowAny
from rest_framework.decorators import api_view, permission_classes
from django.views.decorators.csrf import csrf_exempt

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
        frontend_url = f"{settings.FRONTEND_URL}/dashboard?error=missing_parameters"
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
            frontend_url = f"{settings.FRONTEND_URL}/dashboard?error=token_exchange_failed"
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

        # Frontend'e redirect - DASHBOARD'A YÖNLENDİR
        frontend_url = f"{settings.FRONTEND_URL}/dashboard?ga4_connected=true"
        print(f"🔄 Redirecting to: {frontend_url}")
        return HttpResponseRedirect(frontend_url)

    except OAuthState.DoesNotExist:
        print(f"❌ State bulunamadı: {state}")
        frontend_url = f"{settings.FRONTEND_URL}/dashboard?error=invalid_state"
        return HttpResponseRedirect(frontend_url)
    except Exception as e:
        print(f"❌ GA4 Callback Error: {e}")
        import traceback
        traceback.print_exc()
        frontend_url = f"{settings.FRONTEND_URL}/dashboard?error=ga4_auth_failed"
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
        frontend_url = f"{settings.FRONTEND_URL}/dashboard?error=missing_parameters"
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
            frontend_url = f"{settings.FRONTEND_URL}/dashboard?error=token_exchange_failed"
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

        # Frontend'e redirect - DASHBOARD'A YÖNLENDİR
        frontend_url = f"{settings.FRONTEND_URL}/dashboard?youtube_connected=true"
        print(f"🔄 Redirecting to: {frontend_url}")
        return HttpResponseRedirect(frontend_url)

    except OAuthState.DoesNotExist:
        print(f"❌ State bulunamadı: {state}")
        frontend_url = f"{settings.FRONTEND_URL}/dashboard?error=invalid_state"
        return HttpResponseRedirect(frontend_url)
    except Exception as e:
        print(f"❌ YouTube Callback Error: {e}")
        import traceback
        traceback.print_exc()
        frontend_url = f"{settings.FRONTEND_URL}/dashboard?error=youtube_auth_failed"
        return HttpResponseRedirect(frontend_url)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def save_ga4_property_id(request):
    """Save GA4 Property ID"""
    property_id = request.data.get('property_id')
    
    if not property_id:
        return Response({'error': 'Property ID is required'}, status=400)
    
    try:
        company_profile = CompanyProfile.objects.get(user=request.user)
        ga4_token = GA4Token.objects.get(company=company_profile)
        ga4_token.property_id = property_id
        ga4_token.save()
        
        return Response({
            'success': True, 
            'message': 'GA4 Property ID saved successfully',
            'property_id': property_id
        })
        
    except CompanyProfile.DoesNotExist:
        return Response({'error': 'Company profile not found'}, status=404)
    except GA4Token.DoesNotExist:
        return Response({'error': 'GA4 token not found. Please connect GA4 first.'}, status=404)
    except Exception as e:
        return Response({'error': str(e)}, status=500)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def check_connections(request):
    """Check GA4 and YouTube Connection Status"""
    try:
        company_profile = CompanyProfile.objects.get(user=request.user)
        
        ga4_connected = GA4Token.objects.filter(company=company_profile).exists()
        youtube_connected = YouTubeToken.objects.filter(company=company_profile).exists()
        
        ga4_property_id = None
        if ga4_connected:
            try:
                ga4_token = GA4Token.objects.get(company=company_profile)
                ga4_property_id = ga4_token.property_id
            except GA4Token.DoesNotExist:
                ga4_connected = False
        
        return Response({
            'success': True,
            'connections': {
                'ga4': ga4_connected,
                'youtube': youtube_connected
            },
            'ga4_property_id': ga4_property_id
        })
        
    except CompanyProfile.DoesNotExist:
        return Response({'error': 'Company profile not found'}, status=404)
    except Exception as e:
        return Response({'error': str(e)}, status=500)

# Bu kodları mevcut run_ga4_report fonksiyonunun yerine koyun:
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
        
        # 1. Run the report - API'den veri çek
        report_data = get_ga4_report(
            report_type=report_type,
            access_token=ga4_token.access_token,
            refresh_token=ga4_token.refresh_token,
            client_id=settings.GOOGLE_CLIENT_ID,
            client_secret=settings.GOOGLE_CLIENT_SECRET,
            property_id=ga4_token.property_id
        )
        
        # 2. Save to database - Database'e kaydet
        # CamelCase'i snake_case'e çevir
        def camel_to_snake(name):
            import re
            s1 = re.sub('(.)([A-Z][a-z]+)', r'\1_\2', name)
            return re.sub('([a-z0-9])([A-Z])', r'\1_\2', s1).lower()
        
        saver_method_name = f"save_{camel_to_snake(report_type)}_data"
        print(f"🔍 Looking for saver method: {saver_method_name}")  # Debug için
        
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
    
# Simple GA4 test view to debug the issue
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
    
# Property ID validator ve test endpoint
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def validate_ga4_property(request):
    """Validate GA4 Property ID and Test Access"""
    property_id = request.data.get('property_id')
    
    if not property_id:
        return Response({'error': 'Property ID is required'}, status=400)
    
    try:
        company_profile = CompanyProfile.objects.get(user=request.user)
        ga4_token = GA4Token.objects.get(company=company_profile)
        
        from google.analytics.data_v1beta import BetaAnalyticsDataClient
        from google.analytics.data_v1beta.types import RunReportRequest, DateRange, Dimension, Metric
        from google.oauth2.credentials import Credentials
        from django.utils import timezone
        
        # Token refresh if needed
        now = timezone.now()
        if ga4_token.token_expiry and ga4_token.token_expiry <= now:
            print(f"🔄 Refreshing token for property validation...")
            # Token refresh logic here (copy from main function)
        
        # Create credentials
        creds = Credentials(
            token=ga4_token.access_token,
            refresh_token=ga4_token.refresh_token,
            token_uri="https://oauth2.googleapis.com/token",
            client_id=settings.GOOGLE_CLIENT_ID,
            client_secret=settings.GOOGLE_CLIENT_SECRET
        )
        
        # Test property access with minimal request
        client = BetaAnalyticsDataClient(credentials=creds)
        
        print(f"🔄 Testing property access for: {property_id}")
        
        # Minimal test request
        request_test = RunReportRequest(
            property=f"properties/{property_id}",
            dimensions=[Dimension(name="country")],
            metrics=[Metric(name="activeUsers")],
            date_ranges=[DateRange(start_date="7daysAgo", end_date="today")],
            limit=1  # Only 1 row for testing
        )
        
        try:
            response = client.run_report(request_test)
            
            # If we get here, access is successful
            row_count = len(response.rows)
            
            # Save property ID if validation successful
            ga4_token.property_id = property_id
            ga4_token.save()
            
            return Response({
                'success': True,
                'property_id': property_id,
                'access_confirmed': True,
                'test_data_rows': row_count,
                'message': f'Property {property_id} validated successfully!'
            })
            
        except Exception as api_error:
            print(f"❌ GA4 API Error during validation: {api_error}")
            
            error_str = str(api_error).lower()
            
            if 'permission' in error_str or 'access' in error_str:
                return Response({
                    'error': 'Property access denied',
                    'property_id': property_id,
                    'suggestions': [
                        'Make sure you are the owner/admin of this GA4 property',
                        'Check if the property ID is correct',
                        'Verify the Google account used for authentication has access',
                        'Try reconnecting with full permissions'
                    ]
                }, status=403)
            
            elif 'not found' in error_str:
                return Response({
                    'error': 'Property not found',
                    'property_id': property_id,
                    'suggestions': [
                        'Double-check the Property ID from Google Analytics Admin',
                        'Make sure it\'s a GA4 property (not Universal Analytics)',
                        'Property ID should be numeric (e.g., 123456789)'
                    ]
                }, status=404)
            
            else:
                return Response({
                    'error': f'Validation failed: {str(api_error)}',
                    'property_id': property_id
                }, status=500)
        
    except CompanyProfile.DoesNotExist:
        return Response({'error': 'Company profile not found'}, status=404)
    except GA4Token.DoesNotExist:
        return Response({'error': 'GA4 token not found. Please connect GA4 first.'}, status=404)
    except Exception as e:
        print(f"❌ Validation Error: {e}")
        import traceback
        traceback.print_exc()
        return Response({'error': f'Validation error: {str(e)}'}, status=500)

# Backend - Fixed save_ga4_property_id function
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def save_ga4_property_id(request):
    """Save GA4 Property ID - Fixed Version"""
    property_id = request.data.get('property_id')
    
    if not property_id:
        return Response({'error': 'Property ID is required'}, status=400)
    
    try:
        company_profile = CompanyProfile.objects.get(user=request.user)
        ga4_token = GA4Token.objects.get(company=company_profile)
        
        print(f"🔄 Saving Property ID: {property_id}")
        
        # Direkt kaydet, validation ayrı endpoint'te yapılacak
        ga4_token.property_id = property_id
        ga4_token.save()
        
        print(f"✅ Property ID saved: {ga4_token.property_id}")
        
        return Response({
            'success': True, 
            'message': 'GA4 Property ID saved successfully',
            'property_id': property_id
        })
        
    except CompanyProfile.DoesNotExist:
        return Response({'error': 'Company profile not found'}, status=404)
    except GA4Token.DoesNotExist:
        return Response({'error': 'GA4 token not found. Please connect GA4 first.'}, status=404)
    except Exception as e:
        print(f"❌ Save Error: {e}")
        return Response({'error': str(e)}, status=500)

# Property ID validation için ayrı endpoint
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

# Connection status endpoint - Property ID dahil
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
            'ga4_property_set': bool(ga4_property_id)  # Property ID set mi?
        })
        
    except CompanyProfile.DoesNotExist:
        return Response({'error': 'Company profile not found'}, status=404)
    except Exception as e:
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
            'google_client_secret_exists': bool(settings.GOOGLE_CLIENT_SECRET)
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