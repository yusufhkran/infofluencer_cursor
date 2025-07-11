from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager
from django.db import models
from django.utils import timezone
from django.conf import settings
import base64

class InfluencerUserManager(BaseUserManager):
    def create_user(self, email, name, surname, password=None, **extra_fields):
        if not email:
            raise ValueError('Email is required')
        email = self.normalize_email(email)
        user = self.model(email=email, name=name, surname=surname, **extra_fields)
        if password:
            user.set_password(password)
        else:
            raise ValueError('Password is required')
        user.save(using=self._db)
        return user

    def create_superuser(self, email, name, surname, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_influencer', True)
        return self.create_user(email, name, surname, password, **extra_fields)

class InfluencerUser(AbstractBaseUser, PermissionsMixin):
    email = models.EmailField(unique=True)
    name = models.CharField(max_length=50)
    surname = models.CharField(max_length=50)
    password = models.CharField(max_length=128)
    created_at = models.DateTimeField(default=timezone.now)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    is_influencer = models.BooleanField(default=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['name', 'surname']

    objects = InfluencerUserManager()

    def __str__(self):
        return self.email

class InstagramToken(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='instagram_tokens')
    access_token = models.CharField(max_length=512)  # Şifreli saklanacak (örn. base64)
    expires_at = models.DateTimeField()
    instagram_user_id = models.CharField(max_length=64)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def set_token(self, raw_token):
        # Basit base64 ile encode (örn. EncryptedField yoksa)
        if raw_token:
            self.access_token = base64.b64encode(raw_token.encode('utf-8')).decode('utf-8')

    def get_token(self):
        try:
            return base64.b64decode(self.access_token.encode('utf-8')).decode('utf-8')
        except Exception:
            return None

    def __str__(self):
        return f"InstagramToken({str(self.user)})"
