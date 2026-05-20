from django.db import models
from wallets.models import Wallet
from authentication.models import User


class Transaction(models.Model):
    TRANSACTION_TYPE_CHOICES = [
        ('payment', 'Payment'),
        ('topup', 'Top-up'),
        ('refund', 'Refund'),
    ]
    
    PAYMENT_STATUS_CHOICES = [
        ('successful', 'Successful'),
        ('failed', 'Failed'),
        ('declined', 'Declined'),
    ]
    
    transaction_id = models.AutoField(primary_key=True)
    wallet = models.ForeignKey(Wallet, on_delete=models.CASCADE, related_name='transactions')
    seller = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='transactions')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    type = models.CharField(max_length=20, choices=TRANSACTION_TYPE_CHOICES)
    transaction_date = models.DateTimeField(auto_now_add=True)
    payment_status = models.CharField(max_length=20, choices=PAYMENT_STATUS_CHOICES)
    description = models.CharField(max_length=255, blank=True)
    
    class Meta:
        ordering = ['-transaction_date']
        indexes = [
            models.Index(fields=['transaction_date']),
            models.Index(fields=['wallet', 'transaction_date']),
            models.Index(fields=['payment_status']),
        ]
    
    def __str__(self):
        return f"{self.type} - ₦{self.amount:,.2f} ({self.payment_status})"
