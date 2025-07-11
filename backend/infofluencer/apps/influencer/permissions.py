from rest_framework.permissions import BasePermission

class IsInfluencer(BasePermission):
    """Sadece is_influencer=True olan kullanıcılar erişebilir."""
    def has_permission(self, request, view):
        user = request.user
        return hasattr(user, 'is_influencer') and user.is_influencer 