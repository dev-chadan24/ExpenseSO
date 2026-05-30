from django.contrib import admin
from .models import Transaction, Category, Budget

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'user', 'icon', 'color')
    list_filter = ('user',)
    search_fields = ('name',)

@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = ('user', 'transaction_type', 'amount', 'date', 'category', 'payment_method', 'is_recurring')
    list_filter = ('user', 'transaction_type', 'category', 'date', 'is_recurring')
    search_fields = ('description', 'payment_method')
    date_hierarchy = 'date'

@admin.register(Budget)
class BudgetAdmin(admin.ModelAdmin):
    list_display = ('user', 'category', 'amount', 'month')
    list_filter = ('user', 'category', 'month')