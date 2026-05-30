from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Profile

User = get_user_model()


class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = [
            'currency', 'monthly_budget', 'phone', 'bio',
            'theme_preference', 'image',
        ]


class UserSerializer(serializers.ModelSerializer):
    profile = ProfileSerializer(read_only=True)
    full_name = serializers.SerializerMethodField()
    avatar_url = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            'id', 'email', 'username', 'first_name', 'last_name',
            'full_name', 'avatar_url', 'profile',
        ]
        read_only_fields = ['id']

    def get_full_name(self, obj):
        name = f"{obj.first_name} {obj.last_name}".strip()
        return name if name else obj.username

    def get_avatar_url(self, obj):
        request = self.context.get('request')
        try:
            if obj.profile.image and request:
                return request.build_absolute_uri(obj.profile.image.url)
        except Exception:
            pass
        return None


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    password2 = serializers.CharField(write_only=True, label='Confirm password')

    class Meta:
        model = User
        fields = ['email', 'username', 'first_name', 'last_name', 'password', 'password2']

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("This username is already taken.")
        return value

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password2": "Passwords do not match."})
        return attrs

    def create(self, validated_data):
        validated_data.pop('password2')
        password = validated_data.pop('password')
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user


class ProfileUpdateSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(source='user.email', required=False)
    first_name = serializers.CharField(source='user.first_name', required=False)
    last_name = serializers.CharField(source='user.last_name', required=False)
    username = serializers.CharField(source='user.username', required=False)

    class Meta:
        model = Profile
        fields = [
            'email', 'first_name', 'last_name', 'username',
            'currency', 'monthly_budget', 'phone', 'bio',
            'theme_preference', 'image',
        ]

    def update(self, instance, validated_data):
        user_data = validated_data.pop('user', {})
        # Update user fields
        user = instance.user
        for attr, value in user_data.items():
            setattr(user, attr, value)
        user.save()
        # Update profile fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance


class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True, min_length=8)
    new_password2 = serializers.CharField(required=True, label='Confirm new password')

    def validate(self, attrs):
        if attrs['new_password'] != attrs['new_password2']:
            raise serializers.ValidationError({"new_password2": "New passwords do not match."})
        return attrs
