from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager
from django.db import models
from django.utils import timezone
from django.conf import settings
import base64

# InfluencerUserManager ve InfluencerUser sınıfları kaldırıldı

class InstagramToken(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='instagram_tokens')
    access_token = models.CharField(max_length=512)  # Şifreli saklanacak (örn. base64)
    expires_at = models.DateTimeField()
    instagram_user_id = models.CharField(max_length=64)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = models.Manager()

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
