# backend/infofluencer/apps/accounts/serializers.py

from rest_framework import serializers
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from .models import CompanyProfile, InfluencerProfile
import re


class CustomTokenObtainPairSerializer(serializers.Serializer):
    """Tamamen custom JWT serializer - parent'tan inherit etmiyoruz"""

    email = serializers.EmailField()
    password = serializers.CharField()
    user_type = serializers.CharField()

    def validate(self, attrs):
        print("=== CUSTOM VALIDATION START ===")
        email = attrs.get("email")
        password = attrs.get("password")
        user_type = attrs.get("user_type")

        print(f"Email: {email}")
        print(f"Password: {password}")
        print(f"User type: {user_type}")

        # Manuel authentication - email ile
        user = authenticate(username=email, password=password)

        if user is None:
            print("❌ Authentication failed")
            raise serializers.ValidationError(
                "The email or password you entered is incorrect. Please try again."
            )

        if not user.is_active:
            print("❌ User not active")
            raise serializers.ValidationError(
                "Your account has been disabled. Please contact support for assistance."
            )

        print(f"✅ User authenticated: {user}")

        # User type validation
        if user_type == "company":
            try:
                company_profile = CompanyProfile.objects.get(user=user)
                print(f"✅ Company profile found: {company_profile}")
            except CompanyProfile.DoesNotExist:
                print("❌ Company profile not found")
                raise serializers.ValidationError(
                    "This account is registered as an influencer. Please use the influencer login."
                )
        elif user_type == "influencer":
            try:
                influencer_profile = InfluencerProfile.objects.get(user=user)
                print(f"✅ Influencer profile found: {influencer_profile}")
            except InfluencerProfile.DoesNotExist:
                print("❌ Influencer profile not found")
                raise serializers.ValidationError(
                    "This account is registered as a company. Please use the company login."
                )
        else:
            print("❌ Invalid user type")
            raise serializers.ValidationError("Please select a valid account type.")

        # JWT token oluştur
        refresh = RefreshToken.for_user(user)

        # Custom claims ekle
        refresh["email"] = user.email
        refresh["first_name"] = user.first_name
        refresh["last_name"] = user.last_name
        refresh["user_type"] = user_type

        print("✅ Tokens created successfully")
        print("=== CUSTOM VALIDATION END ===")

        return {
            "refresh": str(refresh),
            "access": str(refresh.access_token),
            "user": {
                "id": user.id,
                "email": user.email,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "user_type": user_type,
            },
        }


class UserRegistrationSerializer(serializers.Serializer):
    # Frontend'den gelen field isimleri - RegisterPage.js'te kullanılan
    email = serializers.EmailField()
    password = serializers.CharField(min_length=8)
    firstName = serializers.CharField(max_length=100)
    lastName = serializers.CharField(max_length=100)
    company = serializers.CharField(max_length=200, required=False)  # Company için
    userType = serializers.ChoiceField(choices=["company", "influencer"])

    # Personal email domains that are NOT allowed for company accounts
    PERSONAL_EMAIL_DOMAINS = {
        "gmail.com",
        "yahoo.com",
        "hotmail.com",
        "outlook.com",
        "live.com",
        "icloud.com",
        "me.com",
        "mac.com",
        "aol.com",
        "yandex.com",
        "mail.ru",
        "protonmail.com",
        "tutanota.com",
        "zoho.com",
        "gmx.com",
        "web.de",
        "fastmail.com",
        "hushmail.com",
    }

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError(
                "An account with this email address already exists. Please use a different email or try logging in."
            )
        return value

    def validate(self, attrs):
        email = attrs.get("email")
        user_type = attrs.get("userType")

        # Company email validation
        if user_type == "company":
            email_domain = email.split("@")[1].lower() if "@" in email else ""

            if email_domain in self.PERSONAL_EMAIL_DOMAINS:
                raise serializers.ValidationError(
                    {
                        "email": "Please use your company email address. Personal email addresses (Gmail, Yahoo, etc.) are not allowed for business accounts."
                    }
                )

            # Additional validation: check if domain looks like a company domain
            if not self._is_valid_company_domain(email_domain):
                raise serializers.ValidationError(
                    {
                        "email": "Please enter a valid company email address. The domain should be your company's official domain."
                    }
                )

        return attrs

    def _is_valid_company_domain(self, domain):
        """Check if domain looks like a valid company domain"""
        if not domain:
            return False

        # Basic domain validation
        domain_pattern = re.compile(
            r"^[a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9]*\.[a-zA-Z]{2,}$"
        )

        if not domain_pattern.match(domain):
            return False

        # Check if it's not a common free email service
        if domain in self.PERSONAL_EMAIL_DOMAINS:
            return False

        # Additional checks for suspicious domains
        suspicious_patterns = [
            r".*temp.*",  # temporary email services
            r".*throwaway.*",
            r".*disposable.*",
            r".*10minutemail.*",
            r".*guerrillamail.*",
        ]

        for pattern in suspicious_patterns:
            if re.match(pattern, domain, re.IGNORECASE):
                return False

        return True

    def create(self, validated_data):
        # User oluştur - Django User modeli için first_name/last_name kullan
        user = User.objects.create_user(
            username=validated_data["email"],  # Username olarak email kullan
            email=validated_data["email"],
            password=validated_data["password"],
            first_name=validated_data["firstName"],
            last_name=validated_data["lastName"],
        )

        # User type'a göre profile oluştur - mevcut model yapınızı kullanarak
        if validated_data["userType"] == "company":
            CompanyProfile.objects.create(
                user=user,
                work_email=validated_data["email"],  # Mevcut model: work_email
                first_name=validated_data["firstName"],  # Mevcut model: first_name
                last_name=validated_data["lastName"],  # Mevcut model: last_name
            )
        elif validated_data["userType"] == "influencer":
            InfluencerProfile.objects.create(
                user=user,
                email=validated_data["email"],  # Mevcut model: email
                first_name=validated_data["firstName"],  # Mevcut model: first_name
                last_name=validated_data["lastName"],  # Mevcut model: last_name
                # instagram_handle ve youtube_channel_id boş bırakılacak (nullable)
            )

        return user
