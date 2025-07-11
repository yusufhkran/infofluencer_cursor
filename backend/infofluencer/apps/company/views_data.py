from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.shortcuts import render
from django.http import JsonResponse
from .models import (
    GA4Token,
    YouTubeToken,
    GA4AgeData,
    GA4UserGenderData,
    GA4CountryData,
    GA4CityData,
    GA4UserAcquisitionSourceData,
    GA4SessionSourceMediumData,
    GA4DeviceCategoryData,
    GA4OperatingSystemData,
    YouTubeAgeGroupData,
    InstagramReport,
    GA4Report,
    YouTubeReport,
)
from apps.company.scripts.instagram_reports import get_comprehensive_instagram_data, get_instagram_basic_info, get_media_comprehensive, get_demographics_comprehensive, get_user_insights_comprehensive, get_story_insights, calculate_advanced_metrics
from .models import InstagramToken
from apps.accounts.models import CompanyProfile
from django.conf import settings


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def fetch_all_analytics_data(request):
    # ... orijinal fonksiyon içeriği ...
    pass


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def instagram_report(request):
    try:
        company_profile = CompanyProfile.objects.get(user=request.user)
        report = InstagramReport.objects.filter(company=company_profile).first()
        if report:
            return Response({
                "success": True,
                "data": {
                    "basic_info": report.basic_info,
                    "media_data": report.media_data,
                    "demographics": report.demographics,
                    "user_insights": report.user_insights,
                    "calculated_metrics": report.calculated_metrics,
                }
            })
        else:
            # Token ve business account id kontrolü
            token = InstagramToken.objects.filter(company=company_profile).first()
            if not token or not token.instagram_business_account_id or not token.access_token:
                return Response({"success": False, "error": "Instagram hesabı bağlı değil veya token eksik."}, status=400)
            ig_id = token.instagram_business_account_id
            page_token = token.access_token
            data = get_comprehensive_instagram_data(ig_id, page_token)
            InstagramReport.objects.create(
                company=company_profile,
                basic_info=data.get("basic_info", {}),
                media_data=data.get("media_data", {}),
                demographics=data.get("demographics", {}),
                user_insights=data.get("user_insights", {}),
                calculated_metrics=data.get("calculated_metrics", {}),
            )
            return Response({"success": True, "data": data})
    except Exception as e:
        return Response({"success": False, "error": str(e)})


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def instagram_basic_info(request):
    """Instagram hesap temel bilgileri"""
    user = request.user
    try:
        company_profile = CompanyProfile.objects.get(user=user)
        token = InstagramToken.objects.filter(company=company_profile).first()
        if not token or not token.instagram_business_account_id or not token.access_token:
            return Response({"success": False, "error": "Instagram hesabı bağlı değil."}, status=400)
        
        basic_info = get_instagram_basic_info(token.instagram_business_account_id, token.access_token)
        if basic_info:
            return Response({"success": True, "data": basic_info})
        else:
            return Response({"success": False, "error": "Temel bilgiler alınamadı."}, status=500)
    except Exception as e:
        return Response({"success": False, "error": str(e)}, status=500)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def instagram_media_data(request):
    """Instagram medya verileri"""
    user = request.user
    try:
        company_profile = CompanyProfile.objects.get(user=user)
        token = InstagramToken.objects.filter(company=company_profile).first()
        if not token or not token.instagram_business_account_id or not token.access_token:
            return Response({"success": False, "error": "Instagram hesabı bağlı değil."}, status=400)
        
        media_data = get_media_comprehensive(token.instagram_business_account_id, token.access_token)
        if media_data:
            return Response({"success": True, "data": media_data})
        else:
            return Response({"success": False, "error": "Medya verileri alınamadı."}, status=500)
    except Exception as e:
        return Response({"success": False, "error": str(e)}, status=500)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def instagram_demographics(request):
    """Instagram demografik verileri"""
    user = request.user
    try:
        company_profile = CompanyProfile.objects.get(user=user)
        token = InstagramToken.objects.filter(company=company_profile).first()
        if not token or not token.instagram_business_account_id or not token.access_token:
            return Response({"success": False, "error": "Instagram hesabı bağlı değil."}, status=400)
        
        demographics = get_demographics_comprehensive(token.instagram_business_account_id, token.access_token)
        if demographics:
            return Response({"success": True, "data": demographics})
        else:
            return Response({"success": False, "error": "Demografik veriler alınamadı."}, status=500)
    except Exception as e:
        return Response({"success": False, "error": str(e)}, status=500)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def instagram_insights(request):
    """Instagram insights verileri"""
    user = request.user
    try:
        company_profile = CompanyProfile.objects.get(user=user)
        token = InstagramToken.objects.filter(company=company_profile).first()
        if not token or not token.instagram_business_account_id or not token.access_token:
            return Response({"success": False, "error": "Instagram hesabı bağlı değil."}, status=400)
        
        insights = get_user_insights_comprehensive(token.instagram_business_account_id, token.access_token)
        if insights:
            return Response({"success": True, "data": insights})
        else:
            return Response({"success": False, "error": "Insights verileri alınamadı."}, status=500)
    except Exception as e:
        return Response({"success": False, "error": str(e)}, status=500)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def instagram_stories(request):
    """Instagram story verileri"""
    user = request.user
    try:
        company_profile = CompanyProfile.objects.get(user=user)
        token = InstagramToken.objects.filter(company=company_profile).first()
        if not token or not token.instagram_business_account_id or not token.access_token:
            return Response({"success": False, "error": "Instagram hesabı bağlı değil."}, status=400)
        
        stories = get_story_insights(token.instagram_business_account_id, token.access_token)
        if stories:
            return Response({"success": True, "data": stories})
        else:
            return Response({"success": False, "error": "Story verileri alınamadı."}, status=500)
    except Exception as e:
        return Response({"success": False, "error": str(e)}, status=500)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def instagram_calculated_metrics(request):
    """Instagram hesaplanmış metrikler"""
    user = request.user
    try:
        company_profile = CompanyProfile.objects.get(user=user)
        token = InstagramToken.objects.filter(company=company_profile).first()
        if not token or not token.instagram_business_account_id or not token.access_token:
            return Response({"success": False, "error": "Instagram hesabı bağlı değil."}, status=400)
        
        # Önce tüm verileri topla
        results = {}
        basic_info = get_instagram_basic_info(token.instagram_business_account_id, token.access_token)
        if basic_info:
            results['basic_info'] = basic_info
        
        user_insights = get_user_insights_comprehensive(token.instagram_business_account_id, token.access_token)
        if user_insights:
            results['user_insights'] = user_insights
        
        media_data = get_media_comprehensive(token.instagram_business_account_id, token.access_token)
        if media_data:
            results['media_data'] = media_data
        
        story_insights = get_story_insights(token.instagram_business_account_id, token.access_token)
        if story_insights:
            results['story_insights'] = story_insights
        
        # Hesaplanmış metrikleri hesapla
        calculated_metrics = calculate_advanced_metrics(results)
        if calculated_metrics:
            return Response({"success": True, "data": calculated_metrics})
        else:
            return Response({"success": False, "error": "Hesaplanmış metrikler oluşturulamadı."}, status=500)
    except Exception as e:
        return Response({"success": False, "error": str(e)}, status=500)


def instagram_analysis_web(request):
    """Instagram analizi web arayüzü"""
    user = request.user
    try:
        company_profile = CompanyProfile.objects.get(user=user)
        token = InstagramToken.objects.filter(company=company_profile).first()
        
        context = {
            'has_instagram': bool(token and token.instagram_business_account_id and token.access_token),
            'instagram_username': token.username if token else None,
        }
        
        return render(request, 'company/instagram_analysis.html', context)
    except CompanyProfile.DoesNotExist:
        return render(request, 'company/instagram_analysis.html', {'has_instagram': False})


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def refresh_instagram_data(request):
    """Instagram verilerini yenile"""
    user = request.user
    try:
        company_profile = CompanyProfile.objects.get(user=user)
        token = InstagramToken.objects.filter(company=company_profile).first()
        if not token or not token.instagram_business_account_id or not token.access_token:
            return Response({"success": False, "error": "Instagram hesabı bağlı değil."}, status=400)
        
        # Kapsamlı analizi çalıştır
        results = get_comprehensive_instagram_data(token.instagram_business_account_id, token.access_token)
        
        # Token'ın son güncelleme zamanını güncelle
        from datetime import datetime
        token.last_data_fetch = datetime.now()
        token.save()
        
        return Response({"success": True, "data": results, "message": "Veriler başarıyla yenilendi."})
    except Exception as e:
        return Response({"success": False, "error": str(e)}, status=500)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def ga4_report(request):
    from django.conf import settings
    from apps.company.scripts.ga4_reports import get_ga4_report
    try:
        company_profile = CompanyProfile.objects.get(user=request.user)
        report = GA4Report.objects.filter(company=company_profile).first()
        if report:
            return Response({"success": True, "data": report.report_data})
        # --- Eğer veri yoksa API'den çek ---
        token = GA4Token.objects.filter(company=company_profile).first()
        if not token or not token.access_token or not token.property_id:
            return Response({"success": False, "error": "GA4 bağlantısı veya property ID eksik."}, status=400)
        # Client ID ve secret settings.py'den
        client_id = getattr(settings, "GOOGLE_CLIENT_ID", None)
        client_secret = getattr(settings, "GOOGLE_CLIENT_SECRET", None)
        if not client_id or not client_secret:
            return Response({"success": False, "error": "GA4 client ID veya secret eksik."}, status=400)
        # API'den veri çek
        try:
            # Örnek: summary, traffic_sources, device_categories, geo, daily gibi anahtarlar bekleniyor
            # Burada tek bir toplu fonksiyon yoksa, birden fazla rapor çekip birleştirilebilir
            summary = get_ga4_report("userAcquisitionSource", token.access_token, token.refresh_token, client_id, client_secret, token.property_id)
            traffic_sources = get_ga4_report("userAcquisitionSource", token.access_token, token.refresh_token, client_id, client_secret, token.property_id)
            device_categories = get_ga4_report("deviceCategory", token.access_token, token.refresh_token, client_id, client_secret, token.property_id)
            geo = get_ga4_report("country", token.access_token, token.refresh_token, client_id, client_secret, token.property_id)
            daily = []  # Günlük kullanıcı için ek fonksiyon eklenebilir
            # Demografik veriler
            age_data = get_ga4_report("age", token.access_token, token.refresh_token, client_id, client_secret, token.property_id)
            gender_data = get_ga4_report("userGender", token.access_token, token.refresh_token, client_id, client_secret, token.property_id)
            report_data = {
                "summary": {
                    "total_users": sum([item.get("new_users", 0) for item in summary]),
                    "conversions": sum([item.get("conversions", 0) for item in summary]),
                    "conversion_rate": 0,  # Eklenebilir
                    "avg_session_duration": 0,  # Eklenebilir
                },
                "traffic_sources": traffic_sources,
                "device_categories": device_categories,
                "geo": geo,
                "daily": daily,
                "demographics": {
                    "age": age_data,
                    "gender": gender_data,
                }
            }
            GA4Report.objects.create(company=company_profile, report_data=report_data)
            return Response({"success": True, "data": report_data})
        except Exception as e:
            return Response({"success": False, "error": f"GA4 API hatası: {str(e)}"}, status=500)
    except Exception as e:
        return Response({"success": False, "error": str(e)})

YOUTUBE_REPORT_TYPES = [
    'trafficSource', 'ageGroup', 'deviceType'
]

def fetch_youtube_reports_for_company(company_profile):
    from .scripts.youtube_reports import get_youtube_report
    from django.conf import settings
    import sys
    from apps.company.models import YouTubeReport
    youtube_token = YouTubeToken.objects.filter(company=company_profile).first()
    if not youtube_token:
        print('[YouTubeReport][DEBUG] YouTube bağlantısı yok.', file=sys.stderr)
        return False, ['YouTube bağlantısı yok.']
    successful = 0
    failed = 0
    errors = []
    # Tüm raporları tek bir JSON'da biriktir
    combined_report_data = {}
    for report_type in YOUTUBE_REPORT_TYPES:
        try:
            print(f'[YouTubeReport][DEBUG] {report_type} raporu çekiliyor...', file=sys.stderr)
            data = get_youtube_report(
                report_type=report_type,
                access_token=youtube_token.access_token,
                refresh_token=youtube_token.refresh_token,
                client_id=settings.YOUTUBE_CLIENT_ID,
                client_secret=settings.YOUTUBE_CLIENT_SECRET
            )
            print(f'[YouTubeReport][DEBUG] {report_type} API response: {data}', file=sys.stderr)
            # Her rapor tipini kendi anahtarında biriktir
            if report_type == 'trafficSource':
                combined_report_data['traffic_sources'] = data
            elif report_type == 'ageGroup':
                combined_report_data['age_groups'] = data
            elif report_type == 'deviceType':
                combined_report_data['device_types'] = data
            successful += 1
        except Exception as e:
            failed += 1
            print(f'[YouTubeReport][ERROR] {report_type} hatası: {e}', file=sys.stderr)
            errors.append(f"{report_type}: {str(e)}")
    # Eğer en az bir rapor çekildiyse, kaydet
    if successful > 0:
        report, created = YouTubeReport.objects.get_or_create(
            company=company_profile,
            defaults={'report_data': {}}
        )
        report_data = report.report_data or {}
        report_data.update(combined_report_data)
        report.report_data = report_data
        report.save()
        print(f'[YouTubeReport][DEBUG] Tüm raporlar YouTubeReport tablosuna kaydedildi.', file=sys.stderr)
        return True, []
    print(f'[YouTubeReport][DEBUG] Sonuç: {successful} başarılı, {failed} başarısız', file=sys.stderr)
    return False, errors

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def fetch_youtube_reports(request):
    try:
        company_profile = CompanyProfile.objects.get(user=request.user)
        success, errors = fetch_youtube_reports_for_company(company_profile)
        return Response({
            'success': success,
            'errors': errors
        })
    except Exception as e:
        return Response({'success': False, 'error': str(e)}, status=500)

def format_youtube_report_for_frontend(report_data):
    # 0 veri içerenleri filtrele yardımcı fonksiyonlar
    def filter_nonzero_views(items):
        return [item for item in items if item.get('views', 0) > 0]
    def filter_nonzero_percentage(items):
        return [item for item in items if item.get('viewerPercentage', 0) > 0]
    # Filtrelenmiş veriler
    filtered_traffic_sources = filter_nonzero_views(report_data.get("traffic_sources", []))
    filtered_age_groups = filter_nonzero_percentage(report_data.get("age_groups", []))
    filtered_device_types = filter_nonzero_views(report_data.get("device_types", []))
    # Özet metrikler
    summary = {
        "total_views": sum([src.get("views", 0) for src in filtered_traffic_sources]),
        "total_likes": 0,  # Eğer varsa ekle
        "total_comments": 0,  # Eğer varsa ekle
        "subscribers_gained": 0,  # Eğer varsa ekle
    }
    # Günlük izlenme ve abone artışı (elinde varsa)
    daily = report_data.get("daily", [])
    # En popüler videolar (elinde varsa)
    top_videos = report_data.get("top_videos", [])
    # Audience (demografi, ilgi alanı vs.)
    audience = {
        "age_groups": filtered_age_groups,
        "interest_category": report_data.get("interest_categories", []),
        "gender_age_interest": filtered_age_groups,  # Şimdilik aynı veri, ileride birleştirilebilir
    }
    # Ek: device_types ve traffic_sources'ı da döndür (grafiklerde kullanmak için)
    return {
        "summary": summary,
        "top_videos": top_videos,
        "daily": daily,
        "audience": audience,
        "traffic_sources": filtered_traffic_sources,
        "device_types": filtered_device_types,
    }

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def youtube_report(request):
    import sys
    try:
        company_profile = CompanyProfile.objects.get(user=request.user)
        print('[YouTubeReport][DEBUG] Kullanıcı için company_profile bulundu.', file=sys.stderr)
        report = YouTubeReport.objects.filter(company=company_profile).first()
        if report:
            print('[YouTubeReport][DEBUG] DBde rapor bulundu, direkt dönülüyor.', file=sys.stderr)
            formatted = format_youtube_report_for_frontend(report.report_data)
            return Response({'success': True, 'data': formatted})
        print('[YouTubeReport][DEBUG] DBde rapor yok, APIden çekilecek.', file=sys.stderr)
        success, errors = fetch_youtube_reports_for_company(company_profile)
        if success:
            report = YouTubeReport.objects.filter(company=company_profile).first()
            if report:
                print('[YouTubeReport][DEBUG] API sonrası rapor kaydedildi ve dönülüyor.', file=sys.stderr)
                formatted = format_youtube_report_for_frontend(report.report_data)
                return Response({'success': True, 'data': formatted, 'message': 'Veri API üzerinden güncellendi.'})
            else:
                print('[YouTubeReport][ERROR] API çağrısı başarılı ama veri kaydedilemedi.', file=sys.stderr)
                return Response({'success': False, 'error': 'API çağrısı başarılı ama veri kaydedilemedi.'}, status=500)
        else:
            print(f'[YouTubeReport][ERROR] Veri yok ve API çağrısı başarısız. Hatalar: {errors}', file=sys.stderr)
            return Response({'success': False, 'error': 'Veri yok ve API çağrısı başarısız.', 'api_error': errors}, status=500)
    except Exception as e:
        print(f'[YouTubeReport][ERROR] Genel hata: {e}', file=sys.stderr)
        return Response({'success': False, 'error': str(e)}, status=500)

