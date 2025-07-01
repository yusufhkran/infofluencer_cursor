# infofluencer/urls.py

from django.contrib import admin
from django.urls import path, include
from django.shortcuts import redirect

def home_redirect(request):
    return redirect('/api/')

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # API Routes
    path('api/auth/', include('apps.accounts.urls')),
    path('api/company/', include('apps.company.urls')),
    path('api/influencer/', include('apps.influencer.urls')),
    
    # Root redirect
    path('', home_redirect, name='home'),
    path('api/', include('rest_framework.urls')),  # DRF browsable API
]