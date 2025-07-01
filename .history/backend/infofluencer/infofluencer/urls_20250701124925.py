# infofluencer/urls.py

from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('apps.accounts.urls')),
    path('api/company/', include('apps.company.urls')),
    path('api/influencer/', include('apps.influencer.urls')),
]