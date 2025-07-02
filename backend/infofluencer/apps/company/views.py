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
    """Start GA4 OAuth Flow"""
    try:
        company_profile = CompanyProfile.objects.get(user=request.user)
        
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
            scopes=[
                'https://www.googleapis.com/auth/analytics.readonly',
                'openid',
                'https://www.googleapis.com/auth/userinfo.email'
            ],
            redirect_uri="http://127.0.0.1:8000/api/company/auth/ga4/callback/"  # ✅ Sabit URI
        )

        authorization_url, state = flow.authorization_url(
            access_type='offline',
            include_granted_scopes='true',
            prompt='consent'
        )

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
        return Response({'error': str(e)}, status=500)

from rest_framework.permissions import AllowAny
from rest_framework.decorators import api_view, permission_classes
from django.views.decorators.csrf import csrf_exempt

@csrf_exempt
@api_view(['GET'])
@permission_classes([AllowAny])  # ✅ Explicit AllowAny
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

        # Flow oluştur
        flow = Flow.from_client_config(
            {
                "web": {
                    "client_id": settings.GOOGLE_CLIENT_ID,
                    "client_secret": settings.GOOGLE_CLIENT_SECRET,
                    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                    "token_uri": "https://oauth2.googleapis.com/token"
                }
            },
            scopes=[
                'https://www.googleapis.com/auth/analytics.readonly',
                'openid',
                'https://www.googleapis.com/auth/userinfo.email'
            ],
            state=state,
            redirect_uri="http://127.0.0.1:8000/api/company/auth/ga4/callback/"
        )

        # Token al
        flow.fetch_token(authorization_response=request.build_absolute_uri())
        credentials = flow.credentials

        print(f"✅ Token alındı")

        # Token'ı kaydet
        GA4Token.objects.update_or_create(
            company=company_profile,
            defaults={
                'access_token': credentials.token,
                'refresh_token': credentials.refresh_token,
                'token_expiry': credentials.expiry
            }
        )

        print(f"✅ Token kaydedildi")

        # State'i sil
        state_record.delete()

        # Frontend'e redirect
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
    state = request.GET.get('state')
    code = request.GET.get('code')
    
    if not state or not code:
        frontend_url = f"{settings.FRONTEND_URL}/analytics?error=missing_parameters"
        return HttpResponseRedirect(frontend_url)

    try:
        # State doğrula
        state_record = OAuthState.objects.get(state=state, provider='youtube')
        company_profile = state_record.company

        # Flow oluştur
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
            state=state,
            redirect_uri="http://127.0.0.1:8000/api/company/auth/youtube/callback/"  # ✅ Sabit URI
        )

        # Token al
        flow.fetch_token(authorization_response=request.build_absolute_uri())
        credentials = flow.credentials

        # Token'ı kaydet
        YouTubeToken.objects.update_or_create(
            company=company_profile,
            defaults={
                'access_token': credentials.token,
                'refresh_token': credentials.refresh_token,
                'token_expiry': credentials.expiry
            }
        )

        # State'i sil
        state_record.delete()

        # Frontend'e redirect
        frontend_url = f"{settings.FRONTEND_URL}/analytics?youtube_connected=true"
        return HttpResponseRedirect(frontend_url)

    except OAuthState.DoesNotExist:
        frontend_url = f"{settings.FRONTEND_URL}/analytics?error=invalid_state"
        return HttpResponseRedirect(frontend_url)
    except Exception as e:
        print(f"YouTube Callback Error: {e}")  # ✅ Debug için
        frontend_url = f"{settings.FRONTEND_URL}/analytics?error=youtube_auth_failed"
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
        saver_method_name = f"save_{report_type.lower()}_data"
        if hasattr(GA4DataSaver, saver_method_name):
            saver_method = getattr(GA4DataSaver, saver_method_name)
            saver_method(company_profile.id, report_data)
        
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
        saver_method_name = f"save_{report_type.lower()}_data"
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