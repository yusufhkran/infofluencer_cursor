# apps/company/urls.py - Temizlenmiş versiyon

from django.urls import path
from . import views

urlpatterns = [
    # ✅ Analytics bağlantı durumları (500 hatası çözümü)
    path('analytics/connections/', views.analytics_connections, name='analytics_connections'),
    
    # ✅ Dashboard data endpoints
    path('dashboard/overview/', views.dashboard_overview, name='dashboard_overview'),
    path('dashboard/audience/', views.audience_insights, name='audience_insights'),  
    path('dashboard/traffic/', views.traffic_analysis, name='traffic_analysis'),
    path('dashboard/fetch-all/', views.fetch_all_analytics_data, name='fetch_all_analytics_data'),
    
    # ✅ OAuth authentication endpoints
    path('auth/ga4/start/', views.ga4_auth_start, name='ga4_auth_start'),
    path('auth/ga4/callback/', views.ga4_auth_callback, name='ga4_auth_callback'),
    path('auth/youtube/start/', views.youtube_auth_start, name='youtube_auth_start'),
    path('auth/youtube/callback/', views.youtube_auth_callback, name='youtube_auth_callback'),
    path('auth/instagram/start/', views.instagram_auth_start, name='instagram_auth_start'),
    path('auth/instagram/callback/', views.instagram_auth_callback, name='instagram_auth_callback'),
    
    # ✅ Influencer endpoints
    path('influencer/dashboard/overview/', views.influencer_overview, name='influencer_overview'),
]