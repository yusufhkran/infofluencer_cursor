# apps/influencer/urls.py

from django.urls import path
from .views import InfluencerRegisterView, InfluencerLoginView, instagram_connect, instagram_callback, instagram_report
from .views_data import instagram_full_report

urlpatterns = [
    path('register/', InfluencerRegisterView.as_view(), name='influencer_register'),
    path('login/', InfluencerLoginView.as_view(), name='influencer_login'),
    path('instagram/connect/', instagram_connect, name='instagram_connect'),
    path('instagram/callback/', instagram_callback, name='instagram_callback'),
    path('instagram/report/', instagram_report, name='instagram_report'),
    path('instagram/full_report/', instagram_full_report, name='instagram_full_report'),
]
