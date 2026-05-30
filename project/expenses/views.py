from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.db.models import Sum, Avg, Count
from django.http import HttpResponse, JsonResponse
from django.utils import timezone
from django.db.models.functions import TruncMonth
import csv
import datetime
import json

from .models import Transaction, Category, Budget
from .forms import TransactionForm, CategoryForm, BudgetForm, DateRangeForm, TransactionFilterForm

@login_required
def dashboard(request):
    today = timezone.now().date()
    first_day_of_month = today.replace(day=1)
    
    # User profile data
    profile = request.user.profile
    monthly_budget = profile.monthly_budget
    currency = profile.get_currency_symbol()
    
    # Get this month's transactions
    month_transactions = Transaction.objects.filter(
        user=request.user,
        date__year=today.year,
        date__month=today.month
    )
    
    # Calculate Income & Expenses
    total_income = month_transactions.filter(transaction_type='income').aggregate(Sum('amount'))['amount__sum'] or 0
    total_expense = month_transactions.filter(transaction_type='expense').aggregate(Sum('amount'))['amount__sum'] or 0
    
    net_savings = total_income - total_expense
    savings_rate = round((net_savings / total_income * 100), 1) if total_income > 0 else 0
    
    budget_used_percentage = round((total_expense / monthly_budget * 100), 1) if monthly_budget > 0 else 0
    
    # Category spending breakdown
    expenses_by_category = month_transactions.filter(transaction_type='expense').values(
        'category__name', 'category__color', 'category__icon'
    ).annotate(
        total=Sum('amount')
    ).order_by('-total')
    
    # Recent transactions
    recent_transactions = Transaction.objects.filter(user=request.user).order_by('-date', '-created_at')[:6]
    
    # Budgets actual vs limit
    category_budgets = Budget.objects.filter(
        user=request.user,
        month__year=today.year,
        month__month=today.month
    ).select_related('category')
    
    budget_vs_actual = []
    for budget in category_budgets:
        spent = budget.get_spent()
        percentage = budget.percentage_spent
        budget_vs_actual.append({
            'id': budget.pk,
            'category': budget.category.name,
            'color': budget.category.color,
            'icon': budget.category.icon,
            'budget': budget.amount,
            'spent': spent,
            'percentage': percentage,
            'over_budget': spent > budget.amount,
            'over_budget_amount': max(spent - budget.amount, 0)
        })
    
    # Pre-populate data for 6 months chart
    six_months_ago = today - datetime.timedelta(days=180)
    monthly_data = Transaction.objects.filter(
        user=request.user,
        date__gte=six_months_ago
    ).annotate(
        month=TruncMonth('date')
    ).values('month', 'transaction_type').annotate(
        total=Sum('amount')
    ).order_by('month')
    
    # Restructure monthly data for lines
    chart_months = []
    income_data = {}
    expense_data = {}
    
    # Get unique sorted list of months in last 6 months
    temp_date = six_months_ago
    while temp_date <= today:
        m_str = temp_date.strftime('%b %Y')
        if m_str not in chart_months:
            chart_months.append(m_str)
        temp_date += datetime.timedelta(days=28)
    
    # Adjust last month if today is missed
    today_str = today.strftime('%b %Y')
    if today_str not in chart_months:
        chart_months.append(today_str)
        
    for m in chart_months:
        income_data[m] = 0
        expense_data[m] = 0
        
    for data in monthly_data:
        m_label = data['month'].strftime('%b %Y')
        if m_label in income_data:
            if data['transaction_type'] == 'income':
                income_data[m_label] = float(data['total'])
            else:
                expense_data[m_label] = float(data['total'])
                
    context = {
        'total_income': total_income,
        'total_expense': total_expense,
        'net_savings': net_savings,
        'savings_rate': savings_rate,
        'monthly_budget': monthly_budget,
        'budget_used_percentage': budget_used_percentage,
        'expenses_by_category': expenses_by_category,
        'recent_transactions': recent_transactions,
        'budget_vs_actual': budget_vs_actual,
        'chart_months': json.dumps(chart_months),
        'chart_income': json.dumps([income_data[m] for m in chart_months]),
        'chart_expense': json.dumps([expense_data[m] for m in chart_months]),
        'currency': currency,
    }
    
    return render(request, 'expenses/dashboard.html', context)


@login_required
def expense_list(request):
    transactions = Transaction.objects.filter(user=request.user)
    filter_form = TransactionFilterForm(request.GET, user=request.user)
    
    # Apply filters if valid
    if filter_form.is_valid():
        data = filter_form.cleaned_data
        
        if data.get('transaction_type'):
            transactions = transactions.filter(transaction_type=data['transaction_type'])
            
        if data.get('category'):
            transactions = transactions.filter(category=data['category'])
            
        if data.get('min_amount'):
            transactions = transactions.filter(amount__gte=data['min_amount'])
            
        if data.get('max_amount'):
            transactions = transactions.filter(amount__lte=data['max_amount'])
            
        if data.get('start_date'):
            transactions = transactions.filter(date__gte=data['start_date'])
            
        if data.get('end_date'):
            transactions = transactions.filter(date__lte=data['end_date'])
            
    # Simple search description
    q = request.GET.get('q')
    if q:
        transactions = transactions.filter(description__icontains=q)
        
    context = {
        'transactions': transactions,
        'filter_form': filter_form,
        'currency': request.user.profile.get_currency_symbol()
    }
    
    return render(request, 'expenses/transaction_list.html', context)


@login_required
def add_expense(request):
    if request.method == 'POST':
        form = TransactionForm(request.POST, user=request.user)
        if form.is_valid():
            transaction = form.save(commit=False)
            transaction.user = request.user
            transaction.save()
            messages.success(request, f"{transaction.transaction_type.capitalize()} added successfully!")
            return redirect('expense-list')
    else:
        form = TransactionForm(user=request.user)
        # Default category if empty
        form.fields['transaction_type'].initial = 'expense'
        
    context = {
        'form': form,
        'title': 'Add Transaction',
        'is_edit': False
    }
    return render(request, 'expenses/transaction_form.html', context)


@login_required
def update_expense(request, pk):
    transaction = get_object_or_404(Transaction, pk=pk, user=request.user)
    if request.method == 'POST':
        form = TransactionForm(request.POST, instance=transaction, user=request.user)
        if form.is_valid():
            form.save()
            messages.success(request, f"{transaction.transaction_type.capitalize()} updated successfully!")
            return redirect('expense-list')
    else:
        form = TransactionForm(instance=transaction, user=request.user)
        
    context = {
        'form': form,
        'title': 'Edit Transaction',
        'is_edit': True
    }
    return render(request, 'expenses/transaction_form.html', context)


@login_required
def delete_expense(request, pk):
    transaction = get_object_or_404(Transaction, pk=pk, user=request.user)
    if request.method == 'POST':
        t_type = transaction.transaction_type
        transaction.delete()
        messages.success(request, f"{t_type.capitalize()} deleted successfully!")
        return redirect('expense-list')
        
    context = {
        'transaction': transaction
    }
    return render(request, 'expenses/transaction_confirm_delete.html', context)


@login_required
def category_list(request):
    categories = Category.objects.filter(user=request.user)
    
    # Calculate transactions count per category
    category_data = []
    for cat in categories:
        tx_count = Transaction.objects.filter(user=request.user, category=cat).count()
        total_spent = Transaction.objects.filter(user=request.user, category=cat, transaction_type='expense').aggregate(Sum('amount'))['amount__sum'] or 0
        category_data.append({
            'category': cat,
            'count': tx_count,
            'total_spent': total_spent
        })
        
    context = {
        'categories': category_data
    }
    return render(request, 'expenses/category_list.html', context)


@login_required
def add_category(request):
    if request.method == 'POST':
        form = CategoryForm(request.POST, user=request.user)
        if form.is_valid():
            category = form.save(commit=False)
            category.user = request.user
            category.save()
            messages.success(request, 'Category created successfully!')
            return redirect('category-list')
    else:
        form = CategoryForm(user=request.user)
        
    context = {
        'form': form,
        'title': 'Add Category'
    }
    return render(request, 'expenses/category_form.html', context)


@login_required
def update_category(request, pk):
    category = get_object_or_404(Category, pk=pk, user=request.user)
    if request.method == 'POST':
        form = CategoryForm(request.POST, instance=category, user=request.user)
        if form.is_valid():
            form.save()
            messages.success(request, 'Category updated successfully!')
            return redirect('category-list')
    else:
        form = CategoryForm(instance=category, user=request.user)
        
    context = {
        'form': form,
        'title': 'Edit Category'
    }
    return render(request, 'expenses/category_form.html', context)


@login_required
def delete_category(request, pk):
    category = get_object_or_404(Category, pk=pk, user=request.user)
    if request.method == 'POST':
        # Safely nullify associated transactions instead of blocking delete, or clear them
        Transaction.objects.filter(category=category, user=request.user).update(category=None)
        category.delete()
        messages.success(request, 'Category deleted successfully!')
        return redirect('category-list')
        
    context = {
        'category': category
    }
    return render(request, 'expenses/category_confirm_delete.html', context)


@login_required
def budget_list(request):
    today = timezone.now().date()
    current_month = today.replace(day=1)
    
    budgets = Budget.objects.filter(
        user=request.user,
        month__year=current_month.year,
        month__month=current_month.month
    ).select_related('category')
    
    budget_data = []
    for budget in budgets:
        spent = budget.get_spent()
        percentage = budget.percentage_spent
        budget_data.append({
            'budget': budget,
            'spent': spent,
            'percentage': percentage,
            'remaining': max(budget.amount - spent, 0),
            'over_spent': max(spent - budget.amount, 0)
        })
        
    context = {
        'budgets': budget_data,
        'current_month': current_month,
        'currency': request.user.profile.get_currency_symbol()
    }
    return render(request, 'expenses/budget_list.html', context)


@login_required
def add_budget(request):
    if request.method == 'POST':
        form = BudgetForm(request.POST, user=request.user)
        if form.is_valid():
            category = form.cleaned_data['category']
            month = form.cleaned_data['month']
            
            existing_budget = Budget.objects.filter(
                user=request.user,
                category=category,
                month__year=month.year,
                month__month=month.month
            ).first()
            
            if existing_budget:
                existing_budget.amount = form.cleaned_data['amount']
                existing_budget.save()
                messages.success(request, f"Budget for {category.name} updated successfully!")
            else:
                budget = form.save(commit=False)
                budget.user = request.user
                budget.month = budget.month.replace(day=1)
                budget.save()
                messages.success(request, 'Budget created successfully!')
                
            return redirect('budget-list')
    else:
        form = BudgetForm(user=request.user)
        
    context = {
        'form': form,
        'title': 'Set Budget'
    }
    return render(request, 'expenses/budget_form.html', context)


@login_required
def update_budget(request, pk):
    budget = get_object_or_404(Budget, pk=pk, user=request.user)
    if request.method == 'POST':
        form = BudgetForm(request.POST, instance=budget, user=request.user)
        if form.is_valid():
            budget = form.save(commit=False)
            budget.month = budget.month.replace(day=1)
            budget.save()
            messages.success(request, 'Budget updated successfully!')
            return redirect('budget-list')
    else:
        form = BudgetForm(instance=budget, user=request.user)
        
    context = {
        'form': form,
        'title': 'Edit Budget'
    }
    return render(request, 'expenses/budget_form.html', context)


@login_required
def delete_budget(request, pk):
    budget = get_object_or_404(Budget, pk=pk, user=request.user)
    if request.method == 'POST':
        budget.delete()
        messages.success(request, 'Budget deleted successfully!')
        return redirect('budget-list')
        
    context = {
        'budget': budget
    }
    return render(request, 'expenses/budget_confirm_delete.html', context)


@login_required
def expense_report(request):
    if request.method == 'POST':
        form = DateRangeForm(request.POST)
        if form.is_valid():
            start_date = form.cleaned_data['start_date']
            end_date = form.cleaned_data['end_date']
        else:
            today = timezone.now().date()
            start_date = today.replace(day=1)
            end_date = today
    else:
        today = timezone.now().date()
        start_date = today.replace(day=1)
        end_date = today
        form = DateRangeForm(initial={'start_date': start_date, 'end_date': end_date})
        
    # Get transactions in date range
    transactions = Transaction.objects.filter(
        user=request.user,
        date__gte=start_date,
        date__lte=end_date
    )
    
    # Statistics
    total_income = transactions.filter(transaction_type='income').aggregate(Sum('amount'))['amount__sum'] or 0
    total_expense = transactions.filter(transaction_type='expense').aggregate(Sum('amount'))['amount__sum'] or 0
    net_savings = total_income - total_expense
    
    # Category spending (expenses only)
    by_category = transactions.filter(transaction_type='expense').values(
        'category__name', 'category__color'
    ).annotate(
        total=Sum('amount'),
        count=Count('id')
    ).order_by('-total')
    
    for item in by_category:
        item['percentage'] = round((item['total'] / total_expense * 100), 1) if total_expense > 0 else 0
        
    # Group by date for chart
    by_date_expense = transactions.filter(transaction_type='expense').values('date').annotate(
        total=Sum('amount')
    ).order_by('date')
    
    by_date_income = transactions.filter(transaction_type='income').values('date').annotate(
        total=Sum('amount')
    ).order_by('date')
    
    # Build timeline dictionary
    timeline = {}
    temp_d = start_date
    while temp_d <= end_date:
        d_str = temp_d.strftime('%Y-%m-%d')
        timeline[d_str] = {'income': 0, 'expense': 0}
        temp_d += datetime.timedelta(days=1)
        
    for item in by_date_income:
        d_str = item['date'].strftime('%Y-%m-%d')
        if d_str in timeline:
            timeline[d_str]['income'] = float(item['total'])
            
    for item in by_date_expense:
        d_str = item['date'].strftime('%Y-%m-%d')
        if d_str in timeline:
            timeline[d_str]['expense'] = float(item['total'])
            
    sorted_dates = sorted(timeline.keys())
    chart_dates = sorted_dates
    chart_income = [timeline[d]['income'] for d in sorted_dates]
    chart_expense = [timeline[d]['expense'] for d in sorted_dates]
    
    # Day counts
    day_count = (end_date - start_date).days + 1
    daily_avg = total_expense / day_count if day_count > 0 else 0
    
    context = {
        'form': form,
        'transactions': transactions,
        'total_income': total_income,
        'total_expense': total_expense,
        'net_savings': net_savings,
        'daily_avg': daily_avg,
        'start_date': start_date,
        'end_date': end_date,
        'by_category': by_category,
        'chart_dates': json.dumps(chart_dates),
        'chart_income': json.dumps(chart_income),
        'chart_expense': json.dumps(chart_expense),
        'currency': request.user.profile.get_currency_symbol(),
    }
    return render(request, 'expenses/reports.html', context)


@login_required
def analytics_view(request):
    today = timezone.now().date()
    year = today.year
    
    # Query transactions of the current year grouped by month
    transactions = Transaction.objects.filter(user=request.user, date__year=year)
    monthly_summary = transactions.annotate(
        month=TruncMonth('date')
    ).values('month', 'transaction_type').annotate(
        total=Sum('amount')
    ).order_by('month')
    
    months = [datetime.date(year, i, 1).strftime('%B') for i in range(1, 13)]
    monthly_income = [0] * 12
    monthly_expense = [0] * 12
    
    for item in monthly_summary:
        m_index = item['month'].month - 1
        if item['transaction_type'] == 'income':
            monthly_income[m_index] = float(item['total'])
        else:
            monthly_expense[m_index] = float(item['total'])
            
    # Category totals
    category_summary = transactions.filter(transaction_type='expense').values(
        'category__name', 'category__color'
    ).annotate(
        total=Sum('amount')
    ).order_by('-total')
    
    context = {
        'year': year,
        'months': json.dumps(months),
        'monthly_income': json.dumps(monthly_income),
        'monthly_expense': json.dumps(monthly_expense),
        'category_summary': category_summary,
        'currency': request.user.profile.get_currency_symbol()
    }
    return render(request, 'expenses/analytics.html', context)


@login_required
def export_expenses_csv(request):
    start_date = request.GET.get('start_date')
    end_date = request.GET.get('end_date')
    transaction_type = request.GET.get('transaction_type')
    
    transactions = Transaction.objects.filter(user=request.user)
    
    if start_date:
        transactions = transactions.filter(date__gte=start_date)
    if end_date:
        transactions = transactions.filter(date__lte=end_date)
    if transaction_type:
        transactions = transactions.filter(transaction_type=transaction_type)
        
    response = HttpResponse(content_type='text/csv')
    response['Content-Disposition'] = f'attachment; filename="transactions_{timezone.now().date()}.csv"'
    
    writer = csv.writer(response)
    writer.writerow(['Date', 'Type', 'Category', 'Amount', 'Description', 'Payment Method', 'Recurring'])
    
    for tx in transactions:
        writer.writerow([
            tx.date.strftime('%Y-%m-%d'),
            tx.transaction_type.capitalize(),
            tx.category.name if tx.category else 'Uncategorized',
            tx.amount,
            tx.description,
            tx.payment_method,
            'Yes' if tx.is_recurring else 'No'
        ])
        
    return response


@login_required
def api_chart_data(request):
    """
    JSON API endpoint for dashboard and reports to dynamically update chart colors or data.
    """
    today = timezone.now().date()
    six_months_ago = today - datetime.timedelta(days=180)
    
    # 6 Months Line Chart Data
    monthly_data = Transaction.objects.filter(
        user=request.user,
        date__gte=six_months_ago
    ).annotate(
        month=TruncMonth('date')
    ).values('month', 'transaction_type').annotate(
        total=Sum('amount')
    ).order_by('month')
    
    chart_months = []
    income_data = {}
    expense_data = {}
    
    temp_date = six_months_ago
    while temp_date <= today:
        m_str = temp_date.strftime('%b %Y')
        if m_str not in chart_months:
            chart_months.append(m_str)
        temp_date += datetime.timedelta(days=28)
        
    today_str = today.strftime('%b %Y')
    if today_str not in chart_months:
        chart_months.append(today_str)
        
    for m in chart_months:
        income_data[m] = 0
        expense_data[m] = 0
        
    for data in monthly_data:
        m_label = data['month'].strftime('%b %Y')
        if m_label in income_data:
            if data['transaction_type'] == 'income':
                income_data[m_label] = float(data['total'])
            else:
                expense_data[m_label] = float(data['total'])
                
    # Category Pie/Donut Chart Data for current month
    month_categories = Transaction.objects.filter(
        user=request.user,
        transaction_type='expense',
        date__year=today.year,
        date__month=today.month
    ).values('category__name', 'category__color').annotate(
        total=Sum('amount')
    ).order_by('-total')
    
    pie_labels = []
    pie_values = []
    pie_colors = []
    
    for item in month_categories:
        pie_labels.append(item['category__name'] or 'Uncategorized')
        pie_values.append(float(item['total']))
        pie_colors.append(item['category__color'] or '#6b7280')
        
    return JsonResponse({
        'months': chart_months,
        'income': [income_data[m] for m in chart_months],
        'expense': [expense_data[m] for m in chart_months],
        'categories': {
            'labels': pie_labels,
            'values': pie_values,
            'colors': pie_colors
        }
    })