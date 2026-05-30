import datetime
import csv
from django.http import HttpResponse
from django.db.models import Sum, Count, Avg, Q
from django.db.models.functions import TruncMonth, TruncYear
from django.utils import timezone

from rest_framework import viewsets, status, permissions, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser
from django_filters.rest_framework import DjangoFilterBackend

from .models import Category, Transaction, Budget
from .serializers import CategorySerializer, TransactionSerializer, BudgetSerializer


# ─── Category ViewSet ─────────────────────────────────────────────────────────
class CategoryViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = CategorySerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name']
    ordering_fields = ['name', 'id']
    ordering = ['name']

    def get_queryset(self):
        return Category.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        tx_count = Transaction.objects.filter(user=request.user, category=instance).count()
        if tx_count > 0:
            return Response(
                {"detail": f"Cannot delete: {tx_count} transaction(s) use this category."},
                status=status.HTTP_400_BAD_REQUEST
            )
        self.perform_destroy(instance)
        return Response(status=status.HTTP_204_NO_CONTENT)


# ─── Transaction ViewSet ──────────────────────────────────────────────────────
class TransactionViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = TransactionSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['transaction_type', 'category', 'is_recurring', 'payment_method']
    search_fields = ['description', 'category__name']
    ordering_fields = ['date', 'amount', 'created_at']
    ordering = ['-date', '-created_at']

    def get_queryset(self):
        qs = Transaction.objects.filter(user=self.request.user).select_related('category')
        params = self.request.query_params

        start_date = params.get('start_date')
        end_date = params.get('end_date')
        min_amount = params.get('min_amount')
        max_amount = params.get('max_amount')
        month = params.get('month')   # format: YYYY-MM
        year = params.get('year')

        if start_date:
            qs = qs.filter(date__gte=start_date)
        if end_date:
            qs = qs.filter(date__lte=end_date)
        if min_amount:
            qs = qs.filter(amount__gte=min_amount)
        if max_amount:
            qs = qs.filter(amount__lte=max_amount)
        if month:
            try:
                y, m = map(int, month.split('-'))
                qs = qs.filter(date__year=y, date__month=m)
            except (ValueError, AttributeError):
                pass
        if year:
            qs = qs.filter(date__year=year)

        return qs

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=False, methods=['get'], url_path='summary')
    def summary(self, request):
        """Quick totals for the current month."""
        today = timezone.now().date()
        qs = Transaction.objects.filter(
            user=request.user,
            date__year=today.year,
            date__month=today.month
        )
        income = qs.filter(transaction_type='income').aggregate(t=Sum('amount'))['t'] or 0
        expense = qs.filter(transaction_type='expense').aggregate(t=Sum('amount'))['t'] or 0
        return Response({
            'month': today.strftime('%B %Y'),
            'income': float(income),
            'expense': float(expense),
            'savings': float(income) - float(expense),
        })


# ─── Budget ViewSet ───────────────────────────────────────────────────────────
class BudgetViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = BudgetSerializer
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['category']
    ordering = ['-month']

    def get_queryset(self):
        qs = Budget.objects.filter(user=self.request.user).select_related('category')
        month = self.request.query_params.get('month')
        year = self.request.query_params.get('year')
        if month:
            try:
                y, m = map(int, month.split('-'))
                qs = qs.filter(month__year=y, month__month=m)
            except (ValueError, AttributeError):
                pass
        if year:
            qs = qs.filter(month__year=year)
        return qs

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


# ─── Dashboard View ───────────────────────────────────────────────────────────
class DashboardView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        today = timezone.now().date()
        user = request.user
        profile = user.profile

        # ── Current month stats ──────────────────────────────────────────────
        month_qs = Transaction.objects.filter(
            user=user,
            date__year=today.year,
            date__month=today.month
        )
        total_income = float(
            month_qs.filter(transaction_type='income').aggregate(t=Sum('amount'))['t'] or 0
        )
        total_expense = float(
            month_qs.filter(transaction_type='expense').aggregate(t=Sum('amount'))['t'] or 0
        )
        net_savings = total_income - total_expense
        savings_rate = round((net_savings / total_income * 100), 1) if total_income > 0 else 0
        monthly_budget = float(profile.monthly_budget)
        budget_used_pct = round((total_expense / monthly_budget * 100), 1) if monthly_budget > 0 else 0

        # ── Category breakdown (expenses) ────────────────────────────────────
        cat_breakdown = list(
            month_qs.filter(transaction_type='expense')
            .values('category__name', 'category__color', 'category__icon', 'category__id')
            .annotate(total=Sum('amount'))
            .order_by('-total')
        )
        expenses_by_category = [
            {
                'id': c['category__id'],
                'name': c['category__name'] or 'Uncategorized',
                'color': c['category__color'] or '#6B7280',
                'icon': c['category__icon'] or 'fa-tag',
                'total': float(c['total']),
            }
            for c in cat_breakdown
        ]

        # ── Recent transactions ──────────────────────────────────────────────
        recent_qs = Transaction.objects.filter(user=user).select_related('category').order_by('-date', '-created_at')[:8]
        recent_transactions = TransactionSerializer(recent_qs, many=True, context={'request': request}).data

        # ── 6-month area chart ────────────────────────────────────────────────
        six_months_ago = today.replace(day=1) - datetime.timedelta(days=5 * 30)
        monthly_agg = (
            Transaction.objects.filter(user=user, date__gte=six_months_ago)
            .annotate(month=TruncMonth('date'))
            .values('month', 'transaction_type')
            .annotate(total=Sum('amount'))
            .order_by('month')
        )

        # Build ordered month labels
        chart_months = []
        temp = six_months_ago.replace(day=1)
        while temp <= today.replace(day=1):
            chart_months.append(temp.strftime('%b %Y'))
            if temp.month == 12:
                temp = temp.replace(year=temp.year + 1, month=1)
            else:
                temp = temp.replace(month=temp.month + 1)

        income_map = {m: 0.0 for m in chart_months}
        expense_map = {m: 0.0 for m in chart_months}

        for row in monthly_agg:
            label = row['month'].strftime('%b %Y')
            if label in income_map:
                if row['transaction_type'] == 'income':
                    income_map[label] = float(row['total'])
                else:
                    expense_map[label] = float(row['total'])

        chart_data = [
            {
                'month': m,
                'income': income_map[m],
                'expense': expense_map[m],
                'savings': income_map[m] - expense_map[m],
            }
            for m in chart_months
        ]

        # ── Budget progress ──────────────────────────────────────────────────
        budgets_qs = Budget.objects.filter(
            user=user,
            month__year=today.year,
            month__month=today.month
        ).select_related('category')

        budget_progress = []
        for b in budgets_qs:
            spent = float(b.get_spent())
            budget_amount = float(b.amount)
            budget_progress.append({
                'id': b.pk,
                'category': b.category.name,
                'color': b.category.color,
                'icon': b.category.icon or 'fa-tag',
                'budget': budget_amount,
                'spent': spent,
                'remaining': max(0.0, budget_amount - spent),
                'percentage': b.percentage_spent,
                'over_budget': spent > budget_amount,
            })

        # ── All-time stats ───────────────────────────────────────────────────
        all_time = Transaction.objects.filter(user=user)
        all_income = float(all_time.filter(transaction_type='income').aggregate(t=Sum('amount'))['t'] or 0)
        all_expense = float(all_time.filter(transaction_type='expense').aggregate(t=Sum('amount'))['t'] or 0)
        tx_count = all_time.count()

        return Response({
            # Current month
            'total_income': total_income,
            'total_expense': total_expense,
            'net_savings': net_savings,
            'savings_rate': savings_rate,
            'monthly_budget': monthly_budget,
            'budget_used_percentage': budget_used_pct,
            # User settings
            'currency': profile.currency,
            'currency_symbol': profile.get_currency_symbol(),
            'theme': profile.theme_preference,
            # Lists
            'expenses_by_category': expenses_by_category,
            'recent_transactions': recent_transactions,
            'budget_progress': budget_progress,
            'chart_data': chart_data,
            # All-time
            'all_time_income': all_income,
            'all_time_expense': all_expense,
            'all_time_savings': all_income - all_expense,
            'total_transactions': tx_count,
        })


# ─── Analytics View ──────────────────────────────────────────────────────────
class AnalyticsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        year = int(request.query_params.get('year', timezone.now().year))

        # Monthly breakdown for full year
        yearly_qs = (
            Transaction.objects.filter(user=user, date__year=year)
            .annotate(month=TruncMonth('date'))
            .values('month', 'transaction_type')
            .annotate(total=Sum('amount'))
            .order_by('month')
        )

        months = [datetime.date(year, m, 1).strftime('%b') for m in range(1, 13)]
        income_by_month = {m: 0.0 for m in months}
        expense_by_month = {m: 0.0 for m in months}

        for row in yearly_qs:
            label = row['month'].strftime('%b')
            if row['transaction_type'] == 'income':
                income_by_month[label] = float(row['total'])
            else:
                expense_by_month[label] = float(row['total'])

        yearly_chart = [
            {
                'month': m,
                'income': income_by_month[m],
                'expense': expense_by_month[m],
                'savings': income_by_month[m] - expense_by_month[m],
            }
            for m in months
        ]

        # Top categories for year
        top_categories = list(
            Transaction.objects.filter(user=user, date__year=year, transaction_type='expense')
            .values('category__name', 'category__color')
            .annotate(total=Sum('amount'), count=Count('id'))
            .order_by('-total')[:8]
        )

        # Year totals
        year_income = sum(income_by_month.values())
        year_expense = sum(expense_by_month.values())

        # Available years with data
        years_with_data = list(
            Transaction.objects.filter(user=user)
            .values_list('date__year', flat=True)
            .distinct()
            .order_by('-date__year')
        )

        return Response({
            'year': year,
            'yearly_chart': yearly_chart,
            'top_categories': [
                {
                    'name': c['category__name'] or 'Uncategorized',
                    'color': c['category__color'] or '#6B7280',
                    'total': float(c['total']),
                    'count': c['count'],
                }
                for c in top_categories
            ],
            'year_income': year_income,
            'year_expense': year_expense,
            'year_savings': year_income - year_expense,
            'available_years': years_with_data,
        })


# ─── Reports View ─────────────────────────────────────────────────────────────
class ReportsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        today = timezone.now().date()
        start_date = request.query_params.get('start_date', (today - datetime.timedelta(days=30)).isoformat())
        end_date = request.query_params.get('end_date', today.isoformat())

        qs = Transaction.objects.filter(
            user=user,
            date__gte=start_date,
            date__lte=end_date
        ).select_related('category')

        income = float(qs.filter(transaction_type='income').aggregate(t=Sum('amount'))['t'] or 0)
        expense = float(qs.filter(transaction_type='expense').aggregate(t=Sum('amount'))['t'] or 0)

        # By category
        by_category = list(
            qs.filter(transaction_type='expense')
            .values('category__name', 'category__color', 'category__icon')
            .annotate(total=Sum('amount'), count=Count('id'))
            .order_by('-total')
        )

        # By day (trend line)
        by_day = list(
            qs.values('date', 'transaction_type')
            .annotate(total=Sum('amount'))
            .order_by('date')
        )

        transactions = TransactionSerializer(
            qs.order_by('-date', '-created_at'),
            many=True, context={'request': request}
        ).data

        return Response({
            'start_date': start_date,
            'end_date': end_date,
            'total_income': income,
            'total_expense': expense,
            'net': income - expense,
            'by_category': [
                {
                    'name': c['category__name'] or 'Uncategorized',
                    'color': c['category__color'] or '#6B7280',
                    'icon': c['category__icon'] or 'fa-tag',
                    'total': float(c['total']),
                    'count': c['count'],
                }
                for c in by_category
            ],
            'by_day': [
                {
                    'date': str(d['date']),
                    'type': d['transaction_type'],
                    'total': float(d['total']),
                }
                for d in by_day
            ],
            'transactions': transactions,
        })


# ─── Export CSV View ──────────────────────────────────────────────────────────
class ExportCSVView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        today = timezone.now().date()
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')

        qs = Transaction.objects.filter(user=user).select_related('category')
        if start_date:
            qs = qs.filter(date__gte=start_date)
        if end_date:
            qs = qs.filter(date__lte=end_date)
        qs = qs.order_by('-date')

        response = HttpResponse(content_type='text/csv')
        filename = f"fintrack_export_{today}.csv"
        response['Content-Disposition'] = f'attachment; filename="{filename}"'
        response['Access-Control-Expose-Headers'] = 'Content-Disposition'

        writer = csv.writer(response)
        writer.writerow(['Date', 'Type', 'Amount', 'Category', 'Description', 'Payment Method', 'Recurring'])

        for tx in qs:
            writer.writerow([
                tx.date,
                tx.transaction_type,
                tx.amount,
                tx.category.name if tx.category else 'Uncategorized',
                tx.description,
                tx.payment_method,
                'Yes' if tx.is_recurring else 'No',
            ])

        return response
