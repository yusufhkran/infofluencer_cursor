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
    start_ga4_oauth,
    ga4_oauth_callback,
    start_youtube_oauth,
    youtube_oauth_callback,
    get_youtube_connection_status,
    disconnect_youtube,
    disconnect_ga4,
)
from .views_settings import account_info, api_connections, notification_preferences, security_settings, billing_info

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
    path("auth/youtube/start/", start_youtube_oauth, name="start_youtube_oauth"),
    path(
        "auth/youtube/callback/", youtube_oauth_callback, name="youtube_oauth_callback"
    ),
    path(
        "auth/youtube/connection/",
        get_youtube_connection_status,
        name="get_youtube_connection_status",
    ),
    path("auth/youtube/disconnect/", disconnect_youtube, name="disconnect_youtube"),
    path("auth/ga4/disconnect/", disconnect_ga4, name="disconnect_ga4"),
    path('settings/account/', account_info, name='account_info'),
    path('settings/api-connections/', api_connections, name='api_connections'),
    path('settings/notifications/', notification_preferences, name='notification_preferences'),
    path('settings/security/', security_settings, name='security_settings'),
    path('settings/billing/', billing_info, name='billing_info'),
]
