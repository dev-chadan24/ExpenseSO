from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser, Profile

@admin.register(CustomUser)
class CustomUserAdmin(UserAdmin):
    list_display = ('email', 'username', 'is_staff', 'is_email_verified')
    ordering = ('email',)

@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'currency', 'monthly_budget', 'theme_preference')
    list_filter = ('currency', 'theme_preference')
    search_fields = ('user__username', 'user__email')