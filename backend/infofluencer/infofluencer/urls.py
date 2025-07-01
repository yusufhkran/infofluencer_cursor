# infofluencer/urls.py

from django.contrib import admin
from django.urls import path, include
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

@api_view(['GET'])
@permission_classes([AllowAny])
def api_root(request):
    """InfoFluencer API Root"""
    return Response({
        'message': 'Welcome to InfoFluencer API',
        'version': '1.0',
        'endpoints': {
            'auth': {
                'login': '/api/auth/login/',
                'register': '/api/auth/register/',
                'profile': '/api/auth/profile/',
                'refresh': '/api/auth/refresh/',
            },
            'company': {
                'dashboard': '/api/company/dashboard/',
            },
            'influencer': {
                'dashboard': '/api/influencer/dashboard/',
            }
        },
        'admin': '/admin/',
    })

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # API Routes
    path('api/auth/', include('apps.accounts.urls')),
    path('api/company/', include('apps.company.urls')),
    path('api/influencer/', include('apps.influencer.urls')),
    
    # API Root
    path('api/', api_root, name='api_root'),
    path('', api_root, name='home'),
    
    # DRF Auth URLs (farklı path'te)
    path('api-auth/', include('rest_framework.urls')),
]