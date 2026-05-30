from django.db import models
from django.utils import timezone
from users.models import CustomUser
from django.db.models import Sum

class Category(models.Model):
    name = models.CharField(max_length=100)
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    icon = models.CharField(max_length=50, blank=True, null=True, default='fa-ellipsis-h')  # FontAwesome class
    color = models.CharField(max_length=7, default='#6B7280')  # Hex color for styling/charts
    
    class Meta:
        verbose_name_plural = 'Categories'
        unique_together = ['name', 'user']
    
    def __str__(self):
        return self.name

class Transaction(models.Model):
    TRANSACTION_TYPES = [
        ('expense', 'Expense'),
        ('income', 'Income'),
    ]
    
    RECURRENCE_CHOICES = [
        ('none', 'One-time'),
        ('daily', 'Daily'),
        ('weekly', 'Weekly'),
        ('monthly', 'Monthly'),
        ('yearly', 'Yearly'),
    ]

    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    transaction_type = models.CharField(max_length=10, choices=TRANSACTION_TYPES, default='expense')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    date = models.DateField(default=timezone.now)
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, blank=True)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    payment_method = models.CharField(max_length=50, blank=True)
    
    # Recurring transaction features
    is_recurring = models.BooleanField(default=False)
    recurrence_frequency = models.CharField(max_length=20, choices=RECURRENCE_CHOICES, default='none')
    
    class Meta:
        ordering = ['-date', '-created_at']
    
    def __str__(self):
        return f"{self.transaction_type.capitalize()}: {self.amount} for {self.category or 'Uncategorized'} on {self.date}"

class Budget(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    category = models.ForeignKey(Category, on_delete=models.CASCADE)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    month = models.DateField()  # Will use the first day of the month
    
    class Meta:
        unique_together = ['user', 'category', 'month']
    
    def __str__(self):
        month_year = self.month.strftime('%B %Y')
        return f"{self.category.name} budget ({month_year}): {self.amount}"
        
    def get_spent(self):
        # Calculate amount spent in this category for this budget's month
        start_date = self.month.replace(day=1)
        # Handle next month calculation safely
        if start_date.month == 12:
            end_date = start_date.replace(year=start_date.year + 1, month=1, day=1)
        else:
            end_date = start_date.replace(month=start_date.month + 1, day=1)
            
        spent = Transaction.objects.filter(
            user=self.user,
            category=self.category,
            transaction_type='expense',
            date__gte=start_date,
            date__lt=end_date
        ).aggregate(Sum('amount'))['amount__sum'] or 0
        
        return spent

    @property
    def percentage_spent(self):
        spent = self.get_spent()
        if self.amount > 0:
            return min(round((spent / self.amount) * 100, 1), 100.0)
        return 0.0