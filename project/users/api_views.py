from django.contrib.auth import get_user_model
from rest_framework import status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError

from .serializers import (
    RegisterSerializer, UserSerializer,
    ProfileUpdateSerializer, ChangePasswordSerializer
)

User = get_user_model()


# ─── Register ─────────────────────────────────────────────────────────────────
class RegisterView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            refresh = RefreshToken.for_user(user)
            return Response({
                'user': UserSerializer(user, context={'request': request}).data,
                'access': str(refresh.access_token),
                'refresh': str(refresh),
                'message': 'Account created successfully.',
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ─── Profile View ─────────────────────────────────────────────────────────────
class ProfileView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get(self, request):
        serializer = UserSerializer(request.user, context={'request': request})
        return Response(serializer.data)

    def patch(self, request):
        profile = request.user.profile
        serializer = ProfileUpdateSerializer(
            profile,
            data=request.data,
            partial=True,
            context={'request': request}
        )
        if serializer.is_valid():
            serializer.save()
            return Response(
                UserSerializer(request.user, context={'request': request}).data
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ─── Change Password ──────────────────────────────────────────────────────────
class ChangePasswordView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        user = request.user
        if not user.check_password(serializer.validated_data['old_password']):
            return Response(
                {'old_password': 'Incorrect current password.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        user.set_password(serializer.validated_data['new_password'])
        user.save()
        return Response({'message': 'Password changed successfully.'})


# ─── Logout (Blacklist refresh token) ────────────────────────────────────────
class LogoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data.get('refresh')
            if not refresh_token:
                return Response(
                    {'detail': 'Refresh token required.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response({'message': 'Logged out successfully.'})
        except TokenError:
            return Response(
                {'detail': 'Invalid or expired refresh token.'},
                status=status.HTTP_400_BAD_REQUEST
            )


# ─── Theme Preference ─────────────────────────────────────────────────────────
class ThemeView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request):
        theme = request.data.get('theme')
        if theme not in ('light', 'dark'):
            return Response(
                {'detail': 'Invalid theme. Use "light" or "dark".'},
                status=status.HTTP_400_BAD_REQUEST
            )
        request.user.profile.theme_preference = theme
        request.user.profile.save(update_fields=['theme_preference'])
        return Response({'theme': theme})
