from django.db import models
from apps.accounts.models import CompanyProfile

# Base Models
class GA4Token(models.Model):
    company = models.OneToOneField(CompanyProfile, on_delete=models.CASCADE, related_name='ga4_token')
    access_token = models.TextField()
    refresh_token = models.TextField(null=True, blank=True)
    token_expiry = models.DateTimeField(null=True, blank=True)
    property_id = models.CharField(max_length=50, null=True, blank=True)
    last_data_fetch = models.DateTimeField(null=True, blank=True)  # 🆕 YENİ ALAN
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
class YouTubeToken(models.Model):
    company = models.OneToOneField(CompanyProfile, on_delete=models.CASCADE, related_name='youtube_token')
    access_token = models.TextField()
    refresh_token = models.TextField(null=True, blank=True)
    token_expiry = models.DateTimeField(null=True, blank=True)
    channel_id = models.CharField(max_length=100, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

class OAuthState(models.Model):
    company = models.ForeignKey(CompanyProfile, on_delete=models.CASCADE)
    provider = models.CharField(max_length=20, choices=[('ga4', 'GA4'), ('youtube', 'YouTube')])
    state = models.CharField(max_length=255, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)

# ===== GA4 REPORT MODELS =====

class GA4UserAcquisitionSourceData(models.Model):
    """User Acquisition Source Report Data"""
    company = models.ForeignKey(CompanyProfile, on_delete=models.CASCADE, related_name='ga4_acquisition_data')
    acquisition_source = models.CharField(max_length=255)
    new_users = models.IntegerField()
    sessions = models.IntegerField()
    engagement_rate = models.FloatField()
    user_engagement_duration = models.FloatField()
    conversions = models.IntegerField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ['company', 'acquisition_source']
        indexes = [
            models.Index(fields=['company', 'acquisition_source']),
        ]

class GA4SessionSourceMediumData(models.Model):
    """Session Source Medium Report Data"""
    company = models.ForeignKey(CompanyProfile, on_delete=models.CASCADE, related_name='ga4_session_data')
    session_source_medium = models.CharField(max_length=255)
    sessions = models.IntegerField()
    conversions = models.IntegerField()
    engagement_rate = models.FloatField()
    event_count = models.IntegerField()
    bounce_rate = models.FloatField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ['company', 'session_source_medium']

class GA4OperatingSystemData(models.Model):
    """Operating System Report Data"""
    company = models.ForeignKey(CompanyProfile, on_delete=models.CASCADE, related_name='ga4_os_data')
    operating_system = models.CharField(max_length=100)
    active_users = models.IntegerField()
    engaged_sessions = models.IntegerField()
    engagement_rate = models.FloatField()
    user_engagement_duration = models.FloatField()
    event_count = models.FloatField()
    bounce_rate = models.FloatField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ['company', 'operating_system']

class GA4UserGenderData(models.Model):
    """User Gender Report Data"""
    company = models.ForeignKey(CompanyProfile, on_delete=models.CASCADE, related_name='ga4_gender_data')
    gender = models.CharField(max_length=50)
    sessions = models.IntegerField()
    engagement_rate = models.IntegerField()
    user_engagement_duration = models.FloatField()
    event_count = models.FloatField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ['company', 'gender']

class GA4DeviceCategoryData(models.Model):
    """Device Category Report Data"""
    company = models.ForeignKey(CompanyProfile, on_delete=models.CASCADE, related_name='ga4_device_data')
    device_category = models.CharField(max_length=100)
    active_users = models.IntegerField()
    engaged_sessions = models.IntegerField()
    user_engagement_duration = models.FloatField()
    event_count = models.FloatField()
    bounce_rate = models.FloatField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ['company', 'device_category']

class GA4CountryData(models.Model):
    """Country Report Data"""
    company = models.ForeignKey(CompanyProfile, on_delete=models.CASCADE, related_name='ga4_country_data')
    country = models.CharField(max_length=100)
    active_users = models.IntegerField()
    new_users = models.IntegerField()
    sessions = models.IntegerField()
    user_engagement_duration = models.FloatField()
    event_count = models.FloatField()
    engagement_rate = models.FloatField()
    conversions = models.FloatField()
    bounce_rate = models.FloatField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ['company', 'country']

class GA4CityData(models.Model):
    """City Report Data"""
    company = models.ForeignKey(CompanyProfile, on_delete=models.CASCADE, related_name='ga4_city_data')
    city = models.CharField(max_length=100)
    active_users = models.IntegerField()
    sessions = models.IntegerField()
    user_engagement_duration = models.FloatField()
    event_count = models.FloatField()
    conversions = models.FloatField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ['company', 'city']

class GA4AgeData(models.Model):
    """Age Report Data"""
    company = models.ForeignKey(CompanyProfile, on_delete=models.CASCADE, related_name='ga4_age_data')
    age = models.CharField(max_length=50)
    active_users = models.IntegerField()
    sessions = models.IntegerField()
    user_engagement_duration = models.FloatField()
    event_count = models.FloatField()
    conversions = models.FloatField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ['company', 'age']

# ===== YOUTUBE REPORT MODELS =====

class YouTubeTrafficSourceData(models.Model):
    """YouTube Traffic Source Report Data"""
    company = models.ForeignKey(CompanyProfile, on_delete=models.CASCADE, related_name='youtube_traffic_data')
    insight_traffic_source_type = models.CharField(max_length=100)
    views = models.IntegerField()
    average_view_duration = models.FloatField()
    estimated_minutes_watched = models.FloatField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ['company', 'insight_traffic_source_type']

class YouTubeDeviceTypeData(models.Model):
    """YouTube Device Type Report Data"""
    company = models.ForeignKey(CompanyProfile, on_delete=models.CASCADE, related_name='youtube_device_data')
    device_type = models.CharField(max_length=100)
    views = models.IntegerField()
    average_view_duration = models.FloatField()
    estimated_minutes_watched = models.FloatField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ['company', 'device_type']

class YouTubeAgeGroupData(models.Model):
    """YouTube Age Group Report Data"""
    company = models.ForeignKey(CompanyProfile, on_delete=models.CASCADE, related_name='youtube_age_data')
    age_group = models.CharField(max_length=50)
    gender = models.CharField(max_length=50)
    viewer_percentage = models.FloatField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ['company', 'age_group', 'gender']

class YouTubeTopSubscribersData(models.Model):
    """YouTube Top Subscribers Report Data"""
    company = models.ForeignKey(CompanyProfile, on_delete=models.CASCADE, related_name='youtube_subscribers_data')
    video_id = models.CharField(max_length=100)
    subscribers_gained = models.IntegerField()
    subscribers_lost = models.IntegerField()
    views = models.IntegerField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ['company', 'video_id']