from django.db import models
from students.models import Student


class Wallet(models.Model):
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('suspended', 'Suspended'),
        ('closed', 'Closed'),
    ]
    
    wallet_id = models.AutoField(primary_key=True)
    student = models.OneToOneField(Student, on_delete=models.CASCADE, related_name='wallet')
    balance = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    daily_limit = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    monitoring_enabled = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def can_debit(self, amount):
        return self.status == 'active' and self.balance >= amount
    
    def debit(self, amount):
        from django.db import transaction
        with transaction.atomic():
            wallet = Wallet.objects.select_for_update().get(pk=self.pk)
            if not wallet.can_debit(amount):
                raise ValueError("Insufficient balance or wallet not active")
            wallet.balance -= amount
            wallet.save()
            self.balance = wallet.balance
    
    def credit(self, amount):
        if amount <= 0:
            raise ValueError("Credit amount must be positive")
        from django.db import transaction
        with transaction.atomic():
            wallet = Wallet.objects.select_for_update().get(pk=self.pk)
            wallet.balance += amount
            wallet.save()
            self.balance = wallet.balance
    
    def __str__(self):
        return f"Wallet for {self.student.full_name} - ₦{self.balance:,.2f}"
