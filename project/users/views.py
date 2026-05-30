from django.shortcuts import render, redirect
from django.contrib import messages
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.contrib.auth import update_session_auth_hash
from django.contrib.auth.forms import PasswordChangeForm
import json

from .forms import UserRegisterForm, UserUpdateForm, ProfileUpdateForm

def register(request):
    if request.user.is_authenticated:
        return redirect('dashboard')
        
    if request.method == 'POST':
        form = UserRegisterForm(request.POST)
        if form.is_valid():
            form.save()
            username = form.cleaned_data.get('username')
            messages.success(request, f'Account created for {username}! You can now log in.')
            return redirect('login')
    else:
        form = UserRegisterForm()
    return render(request, 'users/register.html', {'form': form})


@login_required
def profile(request):
    if request.method == 'POST':
        u_form = UserUpdateForm(request.POST, instance=request.user)
        p_form = ProfileUpdateForm(request.POST, request.FILES, instance=request.user.profile)
        password_form = PasswordChangeForm(request.user, request.POST)
        
        # Check which form was submitted (Profile Update or Password Change)
        if 'update_profile' in request.POST:
            if u_form.is_valid() and p_form.is_valid():
                u_form.save()
                p_form.save()
                messages.success(request, 'Your profile details have been successfully updated!')
                return redirect('profile')
            else:
                messages.error(request, 'Please correct the errors in the profile form.')
        elif 'change_password' in request.POST:
            if password_form.is_valid():
                user = password_form.save()
                update_session_auth_hash(request, user)  # Keep the user logged in
                messages.success(request, 'Your password was successfully updated!')
                return redirect('profile')
            else:
                messages.error(request, 'Please correct the errors in the password form.')
    else:
        u_form = UserUpdateForm(instance=request.user)
        p_form = ProfileUpdateForm(instance=request.user.profile)
        password_form = PasswordChangeForm(request.user)
    
    context = {
        'u_form': u_form,
        'p_form': p_form,
        'password_form': password_form,
    }
    
    return render(request, 'users/profile.html', context)


@login_required
def update_theme(request):
    """
    Asynchronously save user's theme preference (light or dark mode) via AJAX.
    """
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            theme = data.get('theme')
            if theme in ['light', 'dark']:
                profile = request.user.profile
                profile.theme_preference = theme
                profile.save()
                return JsonResponse({'status': 'success', 'theme': theme})
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=400)
            
    return JsonResponse({'status': 'error', 'message': 'Invalid request method'}, status=400)