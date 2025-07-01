# backend/infofluencer/apps/accounts/views.py

from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import CustomTokenObtainPairSerializer, UserRegistrationSerializer
from .models import CompanyProfile, InfluencerProfile

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
    
    # Determine user type and get profile - Database query ile kontrol
    user_type = None
    profile_data = {}
    
    print(f"=== USER PROFILE DEBUG ===")
    print(f"User: {user}")
    
    # Company profile kontrolü
    try:
        company_profile = CompanyProfile.objects.get(user=user)
        user_type = 'company'
        profile_data = {
            'work_email': company_profile.work_email,
            'first_name': company_profile.first_name,
            'last_name': company_profile.last_name,
            'created_at': company_profile.created_at.isoformat()
        }
        print(f"✅ Found company profile: {company_profile}")
    except CompanyProfile.DoesNotExist:
        print("❌ No company profile found")
        
        # Influencer profile kontrolü
        try:
            influencer_profile = InfluencerProfile.objects.get(user=user)
            user_type = 'influencer'
            profile_data = {
                'email': influencer_profile.email,
                'first_name': influencer_profile.first_name,
                'last_name': influencer_profile.last_name,
                'instagram_handle': influencer_profile.instagram_handle,
                'youtube_channel_id': influencer_profile.youtube_channel_id,
                'created_at': influencer_profile.created_at.isoformat()
            }
            print(f"✅ Found influencer profile: {influencer_profile}")
        except InfluencerProfile.DoesNotExist:
            print("❌ No influencer profile found")
            user_type = 'admin'
    
    print(f"📋 Final user_type: {user_type}")
    print("==========================")
    
    return Response({
        'id': user.id,
        'email': user.email,
        'first_name': user.first_name,
        'last_name': user.last_name,
        'user_type': user_type,
        'profile': profile_data
    })