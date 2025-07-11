# apps/influencer/views.py

from rest_framework import generics, status
from rest_framework.response import Response
from .models import InfluencerUser
from .serializers import InfluencerRegisterSerializer, InfluencerLoginSerializer
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from django.conf import settings
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view, permission_classes
from django.utils import timezone
from django.http import JsonResponse, HttpResponseBadRequest
import requests
from .models import InstagramToken
from .permissions import IsInfluencer
from django.shortcuts import redirect


def get_tokens_for_user(user):
    """Kullanıcı için JWT access ve refresh token üretir."""
    refresh = RefreshToken.for_user(user)
    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }

class InfluencerRegisterView(generics.CreateAPIView):
    """Influencer kullanıcı kaydı için endpoint."""
    queryset = InfluencerUser.objects.all()
    serializer_class = InfluencerRegisterSerializer
    permission_classes = [AllowAny]

    def perform_create(self, serializer):
        user = serializer.save()
        self.tokens = get_tokens_for_user(user)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(self.tokens, status=status.HTTP_201_CREATED, headers=headers)

class InfluencerLoginView(APIView):
    """Influencer kullanıcı girişi için endpoint."""
    serializer_class = InfluencerLoginSerializer
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        tokens = get_tokens_for_user(user)
        return Response(tokens, status=status.HTTP_200_OK)

# Instagram OAuth config
# Değişkenleri doğrudan settings üzerinden al
META_CLIENT_ID = settings.META_CLIENT_ID
META_CLIENT_SECRET = settings.META_CLIENT_SECRET
META_REDIRECT_URI = getattr(settings, 'META_REDIRECT_URI', 'http://localhost:8000/api/influencer/instagram/callback/')
META_OAUTH_SCOPES = 'pages_show_list,instagram_basic,instagram_manage_insights,pages_read_engagement'
META_OAUTH_URL = f'https://www.facebook.com/v20.0/dialog/oauth?client_id={META_CLIENT_ID}&redirect_uri={META_REDIRECT_URI}&scope={META_OAUTH_SCOPES}&response_type=code&state=ig_connect'

# 1. Instagram OAuth bağlantı başlatma
@api_view(['GET'])
@permission_classes([IsAuthenticated, IsInfluencer])
def instagram_connect(request):
    if not settings.DEBUG:
        return HttpResponseBadRequest('Sadece geliştirme ortamında kullanılabilir.')
    return JsonResponse({'auth_url': META_OAUTH_URL})

# 2. Instagram OAuth callback/token alma
@api_view(['GET'])
@permission_classes([AllowAny])  # JWT ile korumalı olmasın!
def instagram_callback(request):
    if not settings.DEBUG:
        return HttpResponseBadRequest('Sadece geliştirme ortamında kullanılabilir.')
    code = request.GET.get('code')
    error = request.GET.get('error')
    if error:
        return JsonResponse({'error': error}, status=400)
    if not code:
        return JsonResponse({'error': 'Yetkilendirme kodu alınamadı.'}, status=400)
    # Token alma
    token_resp = requests.get(
        'https://graph.facebook.com/v20.0/oauth/access_token',
        params={
            'client_id': META_CLIENT_ID,
            'redirect_uri': META_REDIRECT_URI,
            'client_secret': META_CLIENT_SECRET,
            'code': code
        },
        timeout=10
    )
    if token_resp.status_code != 200:
        return JsonResponse({'error': 'Token alınamadı', 'detail': token_resp.text}, status=400)
    token_data = token_resp.json()
    access_token = token_data.get('access_token')
    expires_in = token_data.get('expires_in')
    if not access_token:
        return JsonResponse({'error': 'Access token alınamadı'}, status=400)
    # Kullanıcıyı frontend dashboard'a yönlendir
    frontend_url = f"http://localhost:3000/influencer/dashboard?ig_token={access_token}&expires_in={expires_in}"
    return redirect(frontend_url)

# 3. Instagram rapor/veri çekme
@api_view(['GET'])
@permission_classes([IsAuthenticated, IsInfluencer])
def instagram_report(request):
    if not settings.DEBUG:
        return HttpResponseBadRequest('Sadece geliştirme ortamında kullanılabilir.')
    user = request.user
    try:
        ig_token = InstagramToken.objects.filter(user=user).latest('created_at')
        access_token = ig_token.get_token()
    except InstagramToken.DoesNotExist:
        return JsonResponse({'error': 'Instagram hesabı bağlı değil.'}, status=400)
    # Örnek: Profil ve medya verisi çek
    profile_url = 'https://graph.facebook.com/v20.0/me?fields=id,username,account_type,media_count&access_token=' + access_token
    profile_resp = requests.get(profile_url, timeout=10)
    profile = profile_resp.json() if profile_resp.status_code == 200 else {}
    media_url = 'https://graph.facebook.com/v20.0/me/media?fields=id,media_type,media_url,caption,timestamp&limit=5&access_token=' + access_token
    media_resp = requests.get(media_url, timeout=10)
    media = media_resp.json().get('data', []) if media_resp.status_code == 200 else []
    return JsonResponse({
        'profile': profile,
        'media': media,
        'report_generated_at': timezone.now().isoformat()
    })
