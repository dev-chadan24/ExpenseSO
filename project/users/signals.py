from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import CustomUser, Profile
from expenses.models import Category

@receiver(post_save, sender=CustomUser)
def create_profile(sender, instance, created, **kwargs):
    if created:
        Profile.objects.create(user=instance)
        # Seed default premium categories
        default_categories = [
            {'name': 'Food', 'color': '#f43f5e', 'icon': 'utensils'},
            {'name': 'Housing', 'color': '#6366f1', 'icon': 'home'},
            {'name': 'Utilities', 'color': '#06b6d4', 'icon': 'zap'},
            {'name': 'Transportation', 'color': '#f59e0b', 'icon': 'car'},
            {'name': 'Entertainment', 'color': '#a855f7', 'icon': 'tv'},
            {'name': 'Salary', 'color': '#10d9a0', 'icon': 'briefcase'},
            {'name': 'Investments', 'color': '#3b82f6', 'icon': 'trending-up'},
            {'name': 'Others', 'color': '#6B7280', 'icon': 'tag'},
        ]
        for cat in default_categories:
            Category.objects.get_or_create(
                user=instance,
                name=cat['name'],
                defaults={'color': cat['color'], 'icon': cat['icon']}
            )

@receiver(post_save, sender=CustomUser)
def save_profile(sender, instance, **kwargs):
    instance.profile.save()