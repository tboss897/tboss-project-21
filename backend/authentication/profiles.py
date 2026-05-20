from django.db import models
from django.conf import settings


class ParentProfile(models.Model):
    """
    Extended profile for users with role='parent'.
    Stores monitoring preferences and contact info.
    """
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='parent_profile',
        primary_key=True
    )
    phone = models.CharField(max_length=20, blank=True, default='')
    monitoring_enabled = models.BooleanField(default=False)
    daily_limit = models.DecimalField(
        max_digits=10, decimal_places=2, null=True, blank=True,
        help_text='Maximum daily spending limit in NGN. NULL means no limit.'
    )
    
    class Meta:
        db_table = 'parent_profiles'
    
    def __str__(self):
        return f"ParentProfile: {self.user.name}"


class SellerProfile(models.Model):
    """
    Extended profile for users with role='seller'.
    Stores vendor/store-specific information.
    """
    STORE_STATUS_CHOICES = [
        ('active', 'Active'),
        ('suspended', 'Suspended'),
        ('closed', 'Closed'),
    ]
    
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='seller_profile',
        primary_key=True
    )
    location = models.CharField(max_length=100, blank=True, default='')
    service_type = models.CharField(
        max_length=50, blank=True, default='',
        help_text='e.g. Food & Beverage, Bookstore, Supplies'
    )
    store_status = models.CharField(
        max_length=20, choices=STORE_STATUS_CHOICES, default='active'
    )
    
    class Meta:
        db_table = 'seller_profiles'
    
    def __str__(self):
        return f"SellerProfile: {self.user.name} ({self.location})"
