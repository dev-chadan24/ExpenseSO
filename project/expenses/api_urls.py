from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .api_views import (
    CategoryViewSet, TransactionViewSet, BudgetViewSet,
    DashboardView, AnalyticsView, ReportsView, ExportCSVView,
)

router = DefaultRouter()
router.register(r'categories', CategoryViewSet, basename='api-categories')
router.register(r'transactions', TransactionViewSet, basename='api-transactions')
router.register(r'budgets', BudgetViewSet, basename='api-budgets')

urlpatterns = [
    path('', include(router.urls)),
    path('dashboard/', DashboardView.as_view(), name='api-dashboard'),
    path('analytics/', AnalyticsView.as_view(), name='api-analytics'),
    path('reports/', ReportsView.as_view(), name='api-reports'),
    path('export/csv/', ExportCSVView.as_view(), name='api-export-csv'),
]
