from django.urls import path
from . import views

urlpatterns = [
    path('', views.dashboard, name='dashboard'),
    
    # Transaction (Expense/Income) routes
    path('transactions/', views.expense_list, name='expense-list'),
    path('transactions/add/', views.add_expense, name='add-expense'),
    path('transactions/<int:pk>/update/', views.update_expense, name='update-expense'),
    path('transactions/<int:pk>/delete/', views.delete_expense, name='delete-expense'),
    
    # Category routes
    path('categories/', views.category_list, name='category-list'),
    path('categories/add/', views.add_category, name='add-category'),
    path('categories/<int:pk>/update/', views.update_category, name='update-category'),
    path('categories/<int:pk>/delete/', views.delete_category, name='delete-category'),
    
    # Budget routes
    path('budgets/', views.budget_list, name='budget-list'),
    path('budgets/add/', views.add_budget, name='add-budget'),
    path('budgets/<int:pk>/update/', views.update_budget, name='update-budget'),
    path('budgets/<int:pk>/delete/', views.delete_budget, name='delete-budget'),
    
    # Reports & Analytics
    path('reports/', views.expense_report, name='expense-report'),
    path('analytics/', views.analytics_view, name='analytics'),
    path('export-csv/', views.export_expenses_csv, name='export-csv'),
    
    # APIs
    path('api/chart-data/', views.api_chart_data, name='api-chart-data'),
]