from rest_framework import serializers
from .models import InfluencerUser
from django.contrib.auth.password_validation import validate_password
from django.core.validators import EmailValidator
from django.contrib.auth import authenticate
from django.core.exceptions import ObjectDoesNotExist

class InfluencerRegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8, validators=[validate_password])
    email = serializers.EmailField(validators=[EmailValidator()])
    name = serializers.CharField(max_length=50)
    surname = serializers.CharField(max_length=50)

    class Meta:
        model = InfluencerUser
        fields = ('email', 'name', 'surname', 'password')

    def create(self, validated_data):
        user = InfluencerUser.objects.create_user(
            email=validated_data['email'],
            name=validated_data['name'],
            surname=validated_data['surname'],
            password=validated_data['password']
        )
        return user

    def validate_email(self, value):
        if InfluencerUser.objects.filter(email=value).exists():
            raise serializers.ValidationError('Bu email ile zaten bir kullanıcı var.')
        return value

class InfluencerLoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        try:
            user = InfluencerUser.objects.get(email=data['email'])
        except ObjectDoesNotExist:
            raise serializers.ValidationError('Geçersiz email veya şifre.')
        if not user.check_password(data['password']):
            raise serializers.ValidationError('Geçersiz email veya şifre.')
        if not user.is_active:
            raise serializers.ValidationError('Kullanıcı aktif değil.')
        data['user'] = user
        return data 