# apps/company/views.py

from rest_framework.decorators import api_view
from rest_framework.response import Response

@api_view(['GET'])
def company_dashboard(request):
    """Company dashboard API endpoint"""
    return Response({
        'message': f'Welcome to company dashboard, {request.user.first_name}!',
        'user_type': 'company',
        'user_id': request.user.id,
        'email': request.user.email
    })