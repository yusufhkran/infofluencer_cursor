from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import GA4Token, YouTubeToken


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def fetch_all_analytics_data(request):
    # ... orijinal fonksiyon içeriği ...
    pass
