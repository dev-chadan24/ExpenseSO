from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.http import JsonResponse


def api_root(request):
    return JsonResponse({
        'message': 'FinTrack API v1',
        'endpoints': {
            'auth': '/api/auth/',
            'transactions': '/api/transactions/',
            'categories': '/api/categories/',
            'budgets': '/api/budgets/',
            'dashboard': '/api/dashboard/',
            'analytics': '/api/analytics/',
            'reports': '/api/reports/',
            'export_csv': '/api/export/csv/',
        }
    })


urlpatterns = [
    path('admin/', admin.site.urls),

    # ── REST API ──────────────────────────────────────────
    path('api/', api_root, name='api-root'),
    path('api/auth/', include('users.api_urls')),
    path('api/', include('expenses.api_urls')),

    # ── Legacy Django template views (kept for admin fallback) ──
    path('', include('expenses.urls')),
    path('users/', include('users.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)