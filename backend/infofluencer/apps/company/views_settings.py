"""
Ayarlar (Settings) ile ilgili endpointler: Hesap bilgisi, API bağlantıları, bildirim tercihleri, güvenlik, fatura/ödeme.
"""
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from apps.accounts.models import CompanyProfile
from .models import ApiConnection, NotificationPreference, SecuritySetting, BillingInfo

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def account_info(request):
    """
    Kullanıcının hesap ve firma bilgilerini getirir/günceller.
    """
    try:
        company_profile = CompanyProfile.objects.get(user=request.user)
        if request.method == 'GET':
            data = {
                'company_name': company_profile.company_name,
                'contact_person': company_profile.contact_person,
                'position': company_profile.position,
                'phone': company_profile.phone,
                'logo': company_profile.logo.url if company_profile.logo else None,
                'profile_image': company_profile.profile_image.url if company_profile.profile_image else None,
            }
            return Response({'success': True, 'data': data})
        elif request.method == 'POST':
            for field in ['company_name', 'contact_person', 'position', 'phone']:
                if field in request.data:
                    setattr(company_profile, field, request.data[field])
            company_profile.save()
            return Response({'success': True, 'message': 'Hesap bilgisi güncellendi'})
    except CompanyProfile.DoesNotExist:
        return Response({'success': False, 'error': 'Company profile not found'}, status=404)

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def api_connections(request):
    """
    Kullanıcının API bağlantılarını (GA4, YouTube, Instagram) getirir/günceller.
    """
    try:
        company_profile = CompanyProfile.objects.get(user=request.user)
        if request.method == 'GET':
            connections = ApiConnection.objects.filter(company=company_profile)
            data = [
                {
                    'provider': c.provider,
                    'is_active': c.is_active,
                    'last_connected': c.last_connected,
                } for c in connections
            ]
            return Response({'success': True, 'data': data})
        elif request.method == 'POST':
            provider = request.data.get('provider')
            is_active = request.data.get('is_active', True)
            obj, created = ApiConnection.objects.update_or_create(
                company=company_profile, provider=provider,
                defaults={'is_active': is_active}
            )
            return Response({'success': True, 'message': 'API bağlantısı güncellendi'})
    except CompanyProfile.DoesNotExist:
        return Response({'success': False, 'error': 'Company profile not found'}, status=404)

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def notification_preferences(request):
    """
    Kullanıcının bildirim tercihlerini getirir/günceller.
    """
    try:
        company_profile = CompanyProfile.objects.get(user=request.user)
        if request.method == 'GET':
            prefs, _ = NotificationPreference.objects.get_or_create(company=company_profile)
            data = {
                'email_reports': prefs.email_reports,
                'campaign_end': prefs.campaign_end,
                'integration_error': prefs.integration_error,
                'push_enabled': prefs.push_enabled,
            }
            return Response({'success': True, 'data': data})
        elif request.method == 'POST':
            prefs, _ = NotificationPreference.objects.get_or_create(company=company_profile)
            for field in ['email_reports', 'campaign_end', 'integration_error', 'push_enabled']:
                if field in request.data:
                    setattr(prefs, field, request.data[field])
            prefs.save()
            return Response({'success': True, 'message': 'Bildirim tercihleri güncellendi'})
    except CompanyProfile.DoesNotExist:
        return Response({'success': False, 'error': 'Company profile not found'}, status=404)

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def security_settings(request):
    """
    Kullanıcının güvenlik ve şifre ayarlarını getirir/günceller.
    """
    try:
        company_profile = CompanyProfile.objects.get(user=request.user)
        if request.method == 'GET':
            sec, _ = SecuritySetting.objects.get_or_create(company=company_profile)
            data = {
                'two_factor_enabled': sec.two_factor_enabled,
                'last_password_change': sec.last_password_change,
            }
            return Response({'success': True, 'data': data})
        elif request.method == 'POST':
            sec, _ = SecuritySetting.objects.get_or_create(company=company_profile)
            if 'two_factor_enabled' in request.data:
                sec.two_factor_enabled = request.data['two_factor_enabled']
            sec.save()
            return Response({'success': True, 'message': 'Güvenlik ayarları güncellendi'})
    except CompanyProfile.DoesNotExist:
        return Response({'success': False, 'error': 'Company profile not found'}, status=404)

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def billing_info(request):
    """
    Kullanıcının fatura ve ödeme bilgilerini getirir/günceller.
    """
    try:
        company_profile = CompanyProfile.objects.get(user=request.user)
        if request.method == 'GET':
            billing, _ = BillingInfo.objects.get_or_create(company=company_profile)
            data = {
                'active_plan': billing.active_plan,
                'card_last4': billing.card_last4,
                'auto_renew': billing.auto_renew,
            }
            return Response({'success': True, 'data': data})
        elif request.method == 'POST':
            billing, _ = BillingInfo.objects.get_or_create(company=company_profile)
            for field in ['active_plan', 'card_last4', 'auto_renew']:
                if field in request.data:
                    setattr(billing, field, request.data[field])
            billing.save()
            return Response({'success': True, 'message': 'Fatura/ödeme bilgisi güncellendi'})
    except CompanyProfile.DoesNotExist:
        return Response({'success': False, 'error': 'Company profile not found'}, status=404) 