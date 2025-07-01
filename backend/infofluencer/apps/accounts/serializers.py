# backend/infofluencer/apps/accounts/serializers.py

from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth.models import User
from .models import CompanyProfile, InfluencerProfile

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    username_field = 'email'
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        
        # Email field ekle
        self.fields['email'] = serializers.EmailField()
        self.fields['user_type'] = serializers.CharField()  # Frontend: user_type (LoginPage.js'te)
        
        # Username field'ı varsa sil
        if 'username' in self.fields:
            del self.fields['username']

    def validate(self, attrs):
        email = attrs.get('email')
        password = attrs.get('password')
        user_type = attrs.get('user_type')
        
        # Email ile user bul
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            raise serializers.ValidationError('Invalid email or password')
        
        # Password check
        if not user.check_password(password):
            raise serializers.ValidationError('Invalid email or password')
        
        # User type validation
        if user_type == 'company':
            if not hasattr(user, 'companyprofile'):
                raise serializers.ValidationError('This account is not a company account')
        elif user_type == 'influencer':
            if not hasattr(user, 'influencerprofile'):
                raise serializers.ValidationError('This account is not an influencer account')
        else:
            raise serializers.ValidationError('Invalid user type')
        
        # Set username for parent validation
        attrs['username'] = user.username
        
        # Call parent validation
        data = super().validate(attrs)
        
        # Add custom claims
        data['user_type'] = user_type
        data['user_id'] = user.id
        data['email'] = user.email
        data['first_name'] = user.first_name
        data['last_name'] = user.last_name
        
        return data

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        
        # Add custom claims
        token['email'] = user.email
        token['first_name'] = user.first_name
        token['last_name'] = user.last_name
        
        # Determine user type
        if hasattr(user, 'companyprofile'):
            token['user_type'] = 'company'
        elif hasattr(user, 'influencerprofile'):
            token['user_type'] = 'influencer'
        else:
            token['user_type'] = 'admin'
        
        return token

class UserRegistrationSerializer(serializers.Serializer):
    # Frontend'den gelen field isimleri - RegisterPage.js'te kullanılan
    email = serializers.EmailField()
    password = serializers.CharField(min_length=8)
    firstName = serializers.CharField(max_length=100)
    lastName = serializers.CharField(max_length=100)
    company = serializers.CharField(max_length=200, required=False)  # Company için
    userType = serializers.ChoiceField(choices=['company', 'influencer'])
    
    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError('A user with this email already exists.')
        return value
    
    def create(self, validated_data):
        # User oluştur - Django User modeli için first_name/last_name kullan
        user = User.objects.create_user(
            username=validated_data['email'],  # Username olarak email kullan
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data['firstName'],
            last_name=validated_data['lastName']
        )
        
        # User type'a göre profile oluştur - mevcut model yapınızı kullanarak
        if validated_data['userType'] == 'company':
            CompanyProfile.objects.create(
                user=user,
                work_email=validated_data['email'],  # Mevcut model: work_email
                first_name=validated_data['firstName'],  # Mevcut model: first_name
                last_name=validated_data['lastName']  # Mevcut model: last_name
            )
        elif validated_data['userType'] == 'influencer':
            InfluencerProfile.objects.create(
                user=user,
                email=validated_data['email'],  # Mevcut model: email
                first_name=validated_data['firstName'],  # Mevcut model: first_name
                last_name=validated_data['lastName']  # Mevcut model: last_name
                # instagram_handle ve youtube_channel_id boş bırakılacak (nullable)
            )
        
        return user