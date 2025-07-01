# backend/infofluencer/apps/accounts/views.py

from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import CustomTokenObtainPairSerializer, UserRegistrationSerializer

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    serializer = UserRegistrationSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        return Response({
            'message': 'User created successfully',
            'user_id': user.id,
            'email': user.email,
            'user_type': request.data.get('userType')
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
def user_profile(request):
    """Get current user profile"""
    user = request.user
    
    # Determine user type and get profile
    user_type = None
    profile_data = {}
    
    if hasattr(user, 'companyprofile'):
        user_type = 'company'
        profile_data = {
            'work_email': user.companyprofile.work_email,
            'created_at': user.companyprofile.created_at
        }
    elif hasattr(user, 'influencerprofile'):
        user_type = 'influencer'
        profile_data = {
            'instagram_handle': user.influencerprofile.instagram_handle,
            'youtube_channel_id': user.influencerprofile.youtube_channel_id,
            'created_at': user.influencerprofile.created_at
        }
    else:
        user_type = 'admin'
    
    return Response({
        'id': user.id,
        'email': user.email,
        'first_name': user.first_name,
        'last_name': user.last_name,
        'user_type': user_type,
        'profile': profile_data
    })