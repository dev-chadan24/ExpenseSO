from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .api_views import (
    RegisterView, ProfileView, ChangePasswordView,
    LogoutView, ThemeView,
)

urlpatterns = [
    # JWT Auth
    path('login/', TokenObtainPairView.as_view(), name='api-login'),
    path('token/refresh/', TokenRefreshView.as_view(), name='api-token-refresh'),
    path('logout/', LogoutView.as_view(), name='api-logout'),

    # User management
    path('register/', RegisterView.as_view(), name='api-register'),
    path('profile/', ProfileView.as_view(), name='api-profile'),
    path('change-password/', ChangePasswordView.as_view(), name='api-change-password'),
    path('theme/', ThemeView.as_view(), name='api-theme'),
]
