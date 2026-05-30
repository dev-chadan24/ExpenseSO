from rest_framework.authentication import BaseAuthentication
from rest_framework_simplejwt.authentication import JWTAuthentication
from django.contrib.auth import get_user_model

User = get_user_model()

class BypassAuthentication(BaseAuthentication):
    def authenticate(self, request):
        # 1. Try standard JWT Authentication first to keep login features active
        try:
            jwt_auth = JWTAuthentication()
            validated = jwt_auth.authenticate(request)
            if validated is not None:
                return validated
        except Exception:
            pass

        # 2. Bypass: Always return the admin user or first superuser if JWT is missing or invalid
        try:
            user = User.objects.get(username='admin')
            return (user, None)
        except User.DoesNotExist:
            user = User.objects.filter(is_superuser=True).first()
            if user:
                return (user, None)
            user = User.objects.first()
            if user:
                return (user, None)
        return None
