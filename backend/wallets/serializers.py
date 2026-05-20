from rest_framework import serializers
from .models import Wallet
from payments.models import Transaction


class WalletSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.full_name', read_only=True)
    student_matric_no = serializers.CharField(source='student.matric_no', read_only=True)
    
    class Meta:
        model = Wallet
        fields = ['wallet_id', 'student', 'student_name', 'student_matric_no', 'balance', 'status', 'updated_at']
        read_only_fields = ['wallet_id', 'updated_at']


class WalletTopupSerializer(serializers.Serializer):
    amount = serializers.DecimalField(max_digits=10, decimal_places=2, min_value=0.01)
    description = serializers.CharField(max_length=255, required=False, allow_blank=True)


class WalletLimitSerializer(serializers.Serializer):
    daily_limit = serializers.DecimalField(max_digits=10, decimal_places=2, min_value=0, required=False, allow_null=True)
    monitoring_enabled = serializers.BooleanField(required=False)


class WalletStatusSerializer(serializers.Serializer):
    status = serializers.ChoiceField(choices=['active', 'suspended', 'closed'])


class TransactionSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='wallet.student.full_name', read_only=True)
    seller_name = serializers.CharField(source='seller.name', read_only=True, allow_null=True)
    
    class Meta:
        model = Transaction
        fields = ['transaction_id', 'wallet', 'student_name', 'seller', 'seller_name', 'amount', 'type', 'transaction_date', 'payment_status', 'description']
        read_only_fields = ['transaction_id', 'transaction_date']
