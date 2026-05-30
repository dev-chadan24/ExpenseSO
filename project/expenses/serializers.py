from rest_framework import serializers
from django.db.models import Sum
from .models import Category, Transaction, Budget


class CategorySerializer(serializers.ModelSerializer):
    transaction_count = serializers.SerializerMethodField()
    total_spent = serializers.SerializerMethodField()
    total_income = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = [
            'id', 'name', 'icon', 'color',
            'transaction_count', 'total_spent', 'total_income',
        ]
        read_only_fields = ['id']

    def _get_user(self):
        request = self.context.get('request')
        return request.user if request else None

    def get_transaction_count(self, obj):
        user = self._get_user()
        if user:
            return Transaction.objects.filter(user=user, category=obj).count()
        return 0

    def get_total_spent(self, obj):
        user = self._get_user()
        if user:
            result = Transaction.objects.filter(
                user=user, category=obj, transaction_type='expense'
            ).aggregate(total=Sum('amount'))['total']
            return float(result) if result else 0.0
        return 0.0

    def get_total_income(self, obj):
        user = self._get_user()
        if user:
            result = Transaction.objects.filter(
                user=user, category=obj, transaction_type='income'
            ).aggregate(total=Sum('amount'))['total']
            return float(result) if result else 0.0
        return 0.0


class TransactionSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    category_color = serializers.CharField(source='category.color', read_only=True)
    category_icon = serializers.CharField(source='category.icon', read_only=True)
    amount = serializers.DecimalField(max_digits=10, decimal_places=2, coerce_to_string=False)

    class Meta:
        model = Transaction
        fields = [
            'id', 'transaction_type', 'amount', 'date',
            'category', 'category_name', 'category_color', 'category_icon',
            'description', 'payment_method',
            'is_recurring', 'recurrence_frequency',
            'created_at',
        ]
        read_only_fields = ['id', 'created_at']

    def validate_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError("Amount must be greater than 0.")
        return value

    def validate(self, attrs):
        user = self.context['request'].user
        category = attrs.get('category')
        if category and category.user != user:
            raise serializers.ValidationError({"category": "This category does not belong to you."})
        return attrs


class BudgetSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    category_color = serializers.CharField(source='category.color', read_only=True)
    category_icon = serializers.CharField(source='category.icon', read_only=True)
    spent = serializers.SerializerMethodField()
    percentage = serializers.SerializerMethodField()
    remaining = serializers.SerializerMethodField()
    over_budget = serializers.SerializerMethodField()
    amount = serializers.DecimalField(max_digits=10, decimal_places=2, coerce_to_string=False)

    class Meta:
        model = Budget
        fields = [
            'id', 'category', 'category_name', 'category_color', 'category_icon',
            'amount', 'month', 'spent', 'percentage', 'remaining', 'over_budget',
        ]
        read_only_fields = ['id']

    def get_spent(self, obj):
        return float(obj.get_spent())

    def get_percentage(self, obj):
        return obj.percentage_spent

    def get_remaining(self, obj):
        return max(0.0, float(obj.amount) - float(obj.get_spent()))

    def get_over_budget(self, obj):
        return float(obj.get_spent()) > float(obj.amount)

    def validate(self, attrs):
        user = self.context['request'].user
        category = attrs.get('category')
        if category and category.user != user:
            raise serializers.ValidationError({"category": "This category does not belong to you."})
        return attrs
