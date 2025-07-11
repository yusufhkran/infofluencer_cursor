from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.shortcuts import render
from django.http import JsonResponse
from .models import GA4Token, YouTubeToken
from apps.company.scripts.instagram_reports import get_comprehensive_instagram_data, get_instagram_basic_info, get_media_comprehensive, get_demographics_comprehensive, get_user_insights_comprehensive, get_story_insights, calculate_advanced_metrics
from .models import InstagramToken
from apps.accounts.models import CompanyProfile


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def fetch_all_analytics_data(request):
    # ... orijinal fonksiyon içeriği ...
    pass


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def instagram_report(request):
    user = request.user
    try:
        company_profile = CompanyProfile.objects.get(user=user)
        token = InstagramToken.objects.filter(company=company_profile).first()
        if not token or not token.instagram_business_account_id or not token.access_token:
            return Response({"success": False, "error": "Instagram hesabı bağlı değil veya token eksik."}, status=400)
        ig_id = token.instagram_business_account_id
        page_token = token.access_token
        results = get_comprehensive_instagram_data(ig_id, page_token)
        return Response({"success": True, "data": results})
    except CompanyProfile.DoesNotExist:
        return Response({"success": False, "error": "Şirket profili bulunamadı."}, status=404)
    except Exception as e:
        return Response({"success": False, "error": str(e)}, status=500)


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
