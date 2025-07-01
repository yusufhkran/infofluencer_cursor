# apps/accounts/serializers.py

from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth.models import User
from .models import CompanyProfile, InfluencerProfile

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    username_field = 'email'
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['email'] = serializers.EmailField()
        self.fields['user_type'] = serializers.CharField()
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

class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True)
    user_type = serializers.ChoiceField(choices=['company', 'influencer'])
    
    class Meta:
        model = User
        fields = ['email', 'first_name', 'last_name', 'password', 'password_confirm', 'user_type']
    
    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError("Passwords don't match")
        
        if User.objects.filter(email=attrs['email']).exists():
            raise serializers.ValidationError("Email already exists")
        
        return attrs
    
    def create(self, validated_data):
        user_type = validated_data.pop('user_type')
        validated_data.pop('password_confirm')
        
        # Create user
        user = User.objects.create_user(
            username=validated_data['email'],
            email=validated_data['email'],
            first_name=validated_data['first_name'],
            last_name=validated_data['last_name'],
            password=validated_data['password']
        )
        
        # Create profile based on user type
        if user_type == 'company':
            CompanyProfile.objects.create(
                user=user,
                work_email=validated_data['email'],
                first_name=validated_data['first_name'],
                last_name=validated_data['last_name']
            )
        elif user_type == 'influencer':
            InfluencerProfile.objects.create(
                user=user,
                email=validated_data['email'],
                first_name=validated_data['first_name'],
                last_name=validated_data['last_name']
            )
        
        return user