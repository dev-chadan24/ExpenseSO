from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils.translation import gettext_lazy as _
from PIL import Image
import os

class CustomUser(AbstractUser):
    email = models.EmailField(_('email address'), unique=True)
    
    # Additional fields
    is_email_verified = models.BooleanField(default=False)
    
    # Required by AbstractUser
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']
    
    def __str__(self):
        return self.email


class Profile(models.Model):
    THEME_CHOICES = [
        ('light', 'Light Mode'),
        ('dark', 'Dark Mode'),
    ]

    CURRENCY_SYMBOLS = {
        'USD': '$',
        'EUR': '€',
        'GBP': '£',
        'JPY': '¥',
        'CNY': '¥',
        'INR': '₹',
    }

    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE)
    image = models.ImageField(default='default.jpg', upload_to='profile_pics')
    currency = models.CharField(max_length=3, default='USD')
    monthly_budget = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    phone = models.CharField(max_length=15, blank=True)
    bio = models.TextField(blank=True, max_length=500)
    theme_preference = models.CharField(max_length=10, choices=THEME_CHOICES, default='light')
    
    def __str__(self):
        return f'{self.user.username} Profile'
    
    def get_currency_symbol(self):
        return self.CURRENCY_SYMBOLS.get(self.currency, self.currency)
    
    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        
        # Safe Pillow image resizing (handling exceptions if file is missing/inaccessible)
        try:
            if self.image and os.path.exists(self.image.path):
                # Don't resize the default profile picture
                if not self.image.name.endswith('default.jpg'):
                    img = Image.open(self.image.path)
                    if img.height > 300 or img.width > 300:
                        output_size = (300, 300)
                        img.thumbnail(output_size)
                        img.save(self.image.path)
        except Exception:
            # Silence error if image cannot be processed/opened (e.g. storage issues)
            pass