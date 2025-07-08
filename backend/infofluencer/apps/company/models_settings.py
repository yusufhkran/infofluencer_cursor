"""
Ayarlar (Settings) ile ilgili modeller: Hesap bilgisi, API bağlantıları, bildirim tercihleri, güvenlik, fatura/ödeme.
"""
from django.db import models
from django.contrib.auth.models import User

class CompanyProfile(models.Model):
    """
    Firma ve kullanıcıya ait temel bilgiler.
    """
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    company_name = models.CharField(max_length=255)
    contact_person = models.CharField(max_length=100)
    position = models.CharField(max_length=100, blank=True)
    phone = models.CharField(max_length=30, blank=True)
    logo = models.ImageField(upload_to='company_logos/', blank=True, null=True)
    profile_image = models.ImageField(upload_to='profile_images/', blank=True, null=True)
    # ... diğer alanlar ...

class ApiConnection(models.Model):
    """
    Kullanıcının API bağlantılarını (GA4, YouTube, Instagram) tutar.
    """
    company = models.ForeignKey(CompanyProfile, on_delete=models.CASCADE)
    provider = models.CharField(max_length=30)  # 'ga4', 'youtube', 'instagram'
    access_token = models.TextField(blank=True, null=True)
    refresh_token = models.TextField(blank=True, null=True)
    is_active = models.BooleanField(default=False)
    last_connected = models.DateTimeField(auto_now=True)
    # ... diğer alanlar ...

class NotificationPreference(models.Model):
    """
    Kullanıcının bildirim tercihleri.
    """
    company = models.OneToOneField(CompanyProfile, on_delete=models.CASCADE)
    email_reports = models.BooleanField(default=True)
    campaign_end = models.BooleanField(default=True)
    integration_error = models.BooleanField(default=True)
    push_enabled = models.BooleanField(default=False)
    # ... diğer alanlar ...

class SecuritySetting(models.Model):
    """
    Kullanıcının güvenlik ve şifre ayarları.
    """
    company = models.OneToOneField(CompanyProfile, on_delete=models.CASCADE)
    two_factor_enabled = models.BooleanField(default=False)
    last_password_change = models.DateTimeField(auto_now=True)
    # ... diğer alanlar ...

class BillingInfo(models.Model):
    """
    Kullanıcının fatura ve ödeme bilgileri.
    """
    company = models.OneToOneField(CompanyProfile, on_delete=models.CASCADE)
    active_plan = models.CharField(max_length=30, default='free')
    card_last4 = models.CharField(max_length=4, blank=True)
    stripe_customer_id = models.CharField(max_length=100, blank=True)
    auto_renew = models.BooleanField(default=True)
    # ... diğer alanlar ... 