# infofluencer/urls.py

from django.contrib import admin
from django.urls import path, include
from rest_framework.decorators import api_view, permission_classes

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # API Routes
    path('api/auth/', include('apps.accounts.urls')),
    path('api/company/', include('apps.company.urls')),
    path('api/influencer/', include('apps.influencer.urls')),
    
    # DRF Auth URLs (farklı path'te)
    path('api-auth/', include('rest_framework.urls')),
]