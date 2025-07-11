# apps/accounts/urls.py

from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import CustomTokenObtainPairView, register, user_profile, logout, upgrade_to_pro, update_membership

urlpatterns = [
    path('company_login/', CustomTokenObtainPairView.as_view(), name='company_login'),
    path('company_register/', register, name='company_register'),
    # JWT Authentication
    path("login/", CustomTokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("register/", register, name="register"),
    path("profile/", user_profile, name="user_profile"),
    path("logout/", logout, name="logout"),
    path('upgrade_to_pro/', upgrade_to_pro, name='upgrade_to_pro'),
]

urlpatterns += [
    path('update_membership/', update_membership, name='update_membership'),
]
