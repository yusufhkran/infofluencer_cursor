# apps/influencer/urls.py

from django.urls import path
from .views import influencer_dashboard

urlpatterns = [
    path("dashboard/", influencer_dashboard, name="influencer_dashboard"),
]
