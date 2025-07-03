from django.urls import path
from . import views

urlpatterns = [
    # Dashboard
    path('dashboard/', views.company_dashboard, name='company_dashboard'),
    path('analytics/', views.analytics_dashboard, name='analytics_dashboard'),
    path('analytics/connections/', views.check_connections, name='check_connections'),
    
    # GA4 OAuth
    path('auth/ga4/start/', views.ga4_auth_start, name='ga4_auth_start'),
    path('auth/ga4/callback/', views.ga4_auth_callback, name='ga4_auth_callback'),
    path('auth/ga4/property/', views.save_ga4_property_id, name='save_ga4_property_id'),
    
    # YouTube OAuth
    path('auth/youtube/start/', views.youtube_auth_start, name='youtube_auth_start'),
    path('auth/youtube/callback/', views.youtube_auth_callback, name='youtube_auth_callback'),
    
    # Reports
    path('reports/ga4/run/', views.run_ga4_report, name='run_ga4_report'),
    path('reports/youtube/run/', views.run_youtube_report, name='run_youtube_report'),
    path('reports/saved/', views.get_saved_report_from_db, name='get_saved_report'),

    path('auth/ga4/validate/', views.validate_ga4_property, name='validate_ga4_property'),
    path('debug/ga4/', views.ga4_debug_info, name='ga4_debug_info'),
]