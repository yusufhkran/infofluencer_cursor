# apps/influencer/views.py

from rest_framework.decorators import api_view
from rest_framework.response import Response

@api_view(['GET'])
def influencer_dashboard(request):
    """Influencer dashboard API endpoint"""
    return Response({
        'message': f'Welcome to influencer dashboard, {request.user.first_name}!',
        'user_type': 'influencer',
        'user_id': request.user.id,
        'email': request.user.email
    })