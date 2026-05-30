from django import forms
from .models import Transaction, Category, Budget
from django.utils import timezone

class DateInput(forms.DateInput):
    input_type = 'date'

class TransactionForm(forms.ModelForm):
    class Meta:
        model = Transaction
        fields = ['transaction_type', 'amount', 'date', 'category', 'description', 'payment_method', 'is_recurring', 'recurrence_frequency']
        widgets = {
            'date': DateInput(),
            'description': forms.Textarea(attrs={'rows': 3, 'placeholder': 'Optional notes about this transaction...'}),
        }
    
    def __init__(self, *args, **kwargs):
        self.user = kwargs.pop('user', None)
        super().__init__(*args, **kwargs)
        
        # Filter categories by user
        if self.user:
            self.fields['category'].queryset = Category.objects.filter(user=self.user)
            
        # Add custom CSS classes and placeholders
        for field_name, field in self.fields.items():
            if field_name not in ['is_recurring']:
                field.widget.attrs.update({'class': 'form-control'})
            else:
                field.widget.attrs.update({'class': 'form-check-input'})
                
        # Customize labels and choices
        self.fields['transaction_type'].widget.attrs.update({'class': 'form-select'})
        self.fields['category'].widget.attrs.update({'class': 'form-select'})
        self.fields['recurrence_frequency'].widget.attrs.update({'class': 'form-select'})


class CategoryForm(forms.ModelForm):
    ICON_CHOICES = [
        ('fa-shopping-cart', 'Shopping'),
        ('fa-utensils', 'Food'),
        ('fa-home', 'Housing'),
        ('fa-car', 'Transportation'),
        ('fa-medkit', 'Healthcare'),
        ('fa-graduation-cap', 'Education'),
        ('fa-gamepad', 'Entertainment'),
        ('fa-tshirt', 'Clothing'),
        ('fa-gift', 'Gifts'),
        ('fa-piggy-bank', 'Savings'),
        ('fa-credit-card', 'Debt'),
        ('fa-file-invoice-dollar', 'Bills'),
        ('fa-heart', 'Lifestyle'),
        ('fa-laptop', 'Technology'),
        ('fa-ellipsis-h', 'Other'),
    ]
    
    icon = forms.ChoiceField(choices=ICON_CHOICES, required=True, widget=forms.Select(attrs={'class': 'form-select'}))
    
    class Meta:
        model = Category
        fields = ['name', 'icon', 'color']
        widgets = {
            'color': forms.TextInput(attrs={'type': 'color', 'class': 'form-control form-control-color w-100', 'style': 'height: 45px;'}),
        }
    
    def __init__(self, *args, **kwargs):
        self.user = kwargs.pop('user', None)
        super().__init__(*args, **kwargs)
        self.fields['name'].widget.attrs.update({'class': 'form-control', 'placeholder': 'e.g. Subscriptions'})


class BudgetForm(forms.ModelForm):
    class Meta:
        model = Budget
        fields = ['category', 'amount', 'month']
        widgets = {
            'month': DateInput(),
        }
    
    def __init__(self, *args, **kwargs):
        self.user = kwargs.pop('user', None)
        super().__init__(*args, **kwargs)
        
        # Filter categories by user
        if self.user:
            self.fields['category'].queryset = Category.objects.filter(user=self.user)
            
        # Default to the first day of the current month
        if not self.instance.pk:
            today = timezone.now().date()
            self.fields['month'].initial = today.replace(day=1)
        
        # Add custom CSS classes
        for field_name, field in self.fields.items():
            if field_name == 'category':
                field.widget.attrs.update({'class': 'form-select'})
            else:
                field.widget.attrs.update({'class': 'form-control'})


class DateRangeForm(forms.Form):
    start_date = forms.DateField(widget=DateInput(attrs={'class': 'form-control'}))
    end_date = forms.DateField(widget=DateInput(attrs={'class': 'form-control'}))
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        
        # Default date range to current month
        today = timezone.now().date()
        first_day = today.replace(day=1)
        
        # Set initial values if not provided
        if not self.is_bound:
            self.fields['start_date'].initial = first_day
            self.fields['end_date'].initial = today


class TransactionFilterForm(forms.Form):
    transaction_type = forms.ChoiceField(
        choices=[('', 'All Types'), ('expense', 'Expenses'), ('income', 'Income')],
        required=False,
        widget=forms.Select(attrs={'class': 'form-select'})
    )
    category = forms.ModelChoiceField(
        queryset=None,
        required=False,
        widget=forms.Select(attrs={'class': 'form-select'})
    )
    min_amount = forms.DecimalField(
        required=False,
        min_value=0,
        widget=forms.NumberInput(attrs={'class': 'form-control', 'placeholder': 'Min'})
    )
    max_amount = forms.DecimalField(
        required=False,
        min_value=0,
        widget=forms.NumberInput(attrs={'class': 'form-control', 'placeholder': 'Max'})
    )
    start_date = forms.DateField(
        required=False,
        widget=DateInput(attrs={'class': 'form-control'})
    )
    end_date = forms.DateField(
        required=False,
        widget=DateInput(attrs={'class': 'form-control'})
    )
    
    def __init__(self, *args, **kwargs):
        self.user = kwargs.pop('user', None)
        super().__init__(*args, **kwargs)
        
        # Filter categories by user
        if self.user:
            self.fields['category'].queryset = Category.objects.filter(user=self.user)
            self.fields['category'].empty_label = "All Categories"
        else:
            self.fields['category'].queryset = Category.objects.none()