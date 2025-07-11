# apps/company/urls.py - Temizlenmiş versiyon

from django.urls import path
from .views_dashboard import (
    dashboard_overview,
    audience_insights,
    audience_insights_combined,
    traffic_analysis,
    influencer_overview,
)
from .views_property import (
    save_ga4_property_id,
    get_ga4_property_id,
    check_ga4_connection,
)
from .views_auth import (
    ga4_oauth_callback,
    youtube_oauth_callback,
    disconnect_youtube,
    disconnect_ga4,
    start_ga4_oauth,
    start_youtube_oauth,
    get_youtube_connection_status,
    disconnect_instagram,
    get_instagram_connection_status,
    get_instagram_account_details,
    company_instagram_connect,
    company_instagram_callback,
)
from .views_settings import account_info, api_connections, notification_preferences, security_settings, billing_info
from .views_data import (
    instagram_report, 
    instagram_basic_info, 
    instagram_media_data, 
    instagram_demographics, 
    instagram_insights, 
    instagram_stories, 
    instagram_calculated_metrics, 
    instagram_analysis_web, 
    refresh_instagram_data,
    ga4_report,
    youtube_report
)

urlpatterns = [
    # Dashboard data endpoints
    path("dashboard/overview/", dashboard_overview, name="dashboard_overview"),
    path("dashboard/audience/", audience_insights, name="audience_insights"),
    path("dashboard/traffic/", traffic_analysis, name="traffic_analysis"),
    path(
        "dashboard/audience/combined/",
        audience_insights_combined,
        name="audience_insights_combined",
    ),
    path(
        "influencer/dashboard/overview/",
        influencer_overview,
        name="influencer_overview",
    ),
    # GA4 Property ID management
    path("auth/ga4/property/", save_ga4_property_id, name="save_ga4_property_id"),
    path("auth/ga4/property/get/", get_ga4_property_id, name="get_ga4_property_id"),
    path("auth/ga4/connection/", check_ga4_connection, name="check_ga4_connection"),
    # OAuth authentication endpoints
    path("auth/ga4/start/", start_ga4_oauth, name="start_ga4_oauth"),
    path("auth/ga4/callback/", ga4_oauth_callback, name="ga4_oauth_callback"),
    path(
        "auth/youtube/callback/", youtube_oauth_callback, name="youtube_oauth_callback"
    ),
    path("auth/youtube/start/", start_youtube_oauth, name="start_youtube_oauth"),
    path("auth/youtube/disconnect/", disconnect_youtube, name="disconnect_youtube"),
    path("auth/ga4/disconnect/", disconnect_ga4, name="disconnect_ga4"),
    path('auth/youtube/connection/', get_youtube_connection_status, name='get_youtube_connection_status'),
    # Instagram OAuth endpoints
    path("auth/instagram/disconnect/", disconnect_instagram, name="disconnect_instagram"),
    path('auth/instagram/connection/', get_instagram_connection_status, name='get_instagram_connection_status'),
    path('auth/instagram/account/', get_instagram_account_details, name='get_instagram_account_details'),
    path('settings/account/', account_info, name='account_info'),
    path('settings/api-connections/', api_connections, name='api_connections'),
    path('settings/notifications/', notification_preferences, name='notification_preferences'),
    path('settings/security/', security_settings, name='security_settings'),
    path('settings/billing/', billing_info, name='billing_info'),
]

urlpatterns += [
    # Instagram Analytics endpoints
    path('reports/instagram/', instagram_report, name='instagram_report'),
    path('analytics/instagram/basic/', instagram_basic_info, name='instagram_basic_info'),
    path('analytics/instagram/media/', instagram_media_data, name='instagram_media_data'),
    path('analytics/instagram/demographics/', instagram_demographics, name='instagram_demographics'),
    path('analytics/instagram/insights/', instagram_insights, name='instagram_insights'),
    path('analytics/instagram/stories/', instagram_stories, name='instagram_stories'),
    path('analytics/instagram/calculated/', instagram_calculated_metrics, name='instagram_calculated_metrics'),
    path('analytics/instagram/refresh/', refresh_instagram_data, name='refresh_instagram_data'),
    path('analytics/instagram/web/', instagram_analysis_web, name='instagram_analysis_web'),
    path('analytics/connections/', api_connections, name='analytics_connections'),
    path('auth/instagram/simple-connect/', company_instagram_connect, name='company_instagram_simple_connect'),
    path('auth/instagram/simple-callback/', company_instagram_callback, name='company_instagram_simple_callback'),
    path('reports/ga4/', ga4_report, name='ga4_report'),
    path('reports/youtube/', youtube_report, name='youtube_report'),
]
