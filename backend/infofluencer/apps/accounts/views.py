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


@api_view(["POST"])
@permission_classes([AllowAny])
def register(request):
    print("🚀 BACKEND REGISTER CALLED")
    print(f"📋 Request data: {request.data}")

    serializer = UserRegistrationSerializer(data=request.data)
    if serializer.is_valid():
        print("✅ Serializer is valid")
        user = serializer.save()
        print(f"✅ User created: {user}")

        response_data = {
            "message": "User created successfully",
            "user_id": user.id,
            "email": user.email,
            "user_type": request.data.get("userType"),
        }

        print(f"📤 Sending response: {response_data}")
        return Response(response_data, status=status.HTTP_201_CREATED)
    else:
        print(f"❌ Serializer errors: {serializer.errors}")
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["GET"])
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
        user_type = "company"
        profile_data = {
            "work_email": company_profile.work_email,
            "first_name": company_profile.first_name,
            "last_name": company_profile.last_name,
            "created_at": company_profile.created_at.isoformat(),
            "isPro": company_profile.isPro,
            "isBasic": company_profile.isBasic,
            "isFree": company_profile.isFree,
        }
        print(f"✅ Found company profile: {company_profile}")
    except CompanyProfile.DoesNotExist:
        print("❌ No company profile found")

        # Influencer profile kontrolü
        try:
            influencer_profile = InfluencerProfile.objects.get(user=user)
            user_type = "influencer"
            profile_data = {
                "email": influencer_profile.email,
                "first_name": influencer_profile.first_name,
                "last_name": influencer_profile.last_name,
                "instagram_handle": influencer_profile.instagram_handle,
                "youtube_channel_id": influencer_profile.youtube_channel_id,
                "created_at": influencer_profile.created_at.isoformat(),
            }
            print(f"✅ Found influencer profile: {influencer_profile}")
        except InfluencerProfile.DoesNotExist:
            print("❌ No influencer profile found")
            user_type = "admin"

    print(f"📋 Final user_type: {user_type}")
    print("==========================")

    return Response(
        {
            "id": user.id,
            "email": user.email,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "user_type": user_type,
            "profile": profile_data,
        }
    )


from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.permissions import IsAuthenticated


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def logout(request):
    """Logout user by blacklisting refresh token"""
    try:
        refresh_token = request.data.get("refresh")
        if refresh_token:
            token = RefreshToken(refresh_token)
            token.blacklist()

        return Response(
            {"success": True, "message": "Successfully logged out"},
            status=status.HTTP_200_OK,
        )
    except Exception as e:
        return Response(
            {"success": False, "message": "Logout failed"},
            status=status.HTTP_400_BAD_REQUEST,
        )


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def upgrade_to_pro(request):
    user = request.user
    try:
        company_profile = CompanyProfile.objects.get(user=user)
        company_profile.isPro = True
        company_profile.isBasic = False
        company_profile.isFree = False
        company_profile.save()
        return Response({"success": True, "message": "Proya geçiş başarılı."})
    except CompanyProfile.DoesNotExist:
        return Response({"success": False, "error": "Company profile not found."}, status=404)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def update_membership(request):
    user = request.user
    plan = request.data.get('plan')
    if plan not in ['free', 'basic', 'pro']:
        return Response({"success": False, "error": "Geçersiz plan."}, status=400)
    try:
        company_profile = CompanyProfile.objects.get(user=user)
        company_profile.isPro = plan == 'pro'
        company_profile.isBasic = plan == 'basic'
        company_profile.isFree = plan == 'free'
        company_profile.save()
        return Response({"success": True, "message": f"{plan.capitalize()} üyeliğine geçiş başarılı."})
    except CompanyProfile.DoesNotExist:
        return Response({"success": False, "error": "Company profile not found."}, status=404)
