from django import forms
from django.contrib.auth.forms import UserCreationForm
from .models import CustomUser, Profile

class UserRegisterForm(UserCreationForm):
    email = forms.EmailField(required=True, widget=forms.EmailInput(attrs={'placeholder': 'Enter your email address'}))
    
    class Meta:
        model = CustomUser
        fields = ['username', 'email']
        
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Add custom CSS classes and placeholders to all fields
        for field_name, field in self.fields.items():
            field.widget.attrs.update({'class': 'form-control'})


class UserUpdateForm(forms.ModelForm):
    email = forms.EmailField(required=True)
    
    class Meta:
        model = CustomUser
        fields = ['username', 'email']
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        for field_name, field in self.fields.items():
            field.widget.attrs.update({'class': 'form-control'})


class ProfileUpdateForm(forms.ModelForm):
    CURRENCY_CHOICES = [
        ('USD', 'US Dollar ($)'),
        ('EUR', 'Euro (€)'),
        ('GBP', 'British Pound (£)'),
        ('JPY', 'Japanese Yen (¥)'),
        ('CNY', 'Chinese Yuan (¥)'),
        ('INR', 'Indian Rupee (₹)'),
    ]
    
    currency = forms.ChoiceField(choices=CURRENCY_CHOICES, widget=forms.Select(attrs={'class': 'form-select'}))
    monthly_budget = forms.DecimalField(max_digits=10, decimal_places=2, widget=forms.NumberInput(attrs={'class': 'form-control'}))
    phone = forms.CharField(max_length=15, required=False, widget=forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'e.g. +1234567890'}))
    bio = forms.CharField(required=False, widget=forms.Textarea(attrs={'class': 'form-control', 'rows': 3, 'placeholder': 'Tell us a bit about yourself...'}))
    theme_preference = forms.ChoiceField(choices=Profile.THEME_CHOICES, widget=forms.Select(attrs={'class': 'form-select'}))
    
    class Meta:
        model = Profile
        fields = ['image', 'currency', 'monthly_budget', 'phone', 'bio', 'theme_preference']
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Style image field
        self.fields['image'].widget.attrs.update({'class': 'form-control'})