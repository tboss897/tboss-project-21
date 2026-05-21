from rest_framework import serializers
from .models import Transaction
from students.models import Student, QRCode


class PaymentScanSerializer(serializers.Serializer):
    qr_data = serializers.CharField(required=False, allow_blank=True)
    matric_no = serializers.CharField(required=False, allow_blank=True)


class PaymentProcessSerializer(serializers.Serializer):
    wallet_id = serializers.IntegerField()
    amount = serializers.DecimalField(max_digits=10, decimal_places=2, min_value=0.01)
    pin = serializers.CharField(min_length=4, max_length=6)
    description = serializers.CharField(max_length=255, required=False, allow_blank=True)


class PaymentReceiptSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='wallet.student.full_name', read_only=True)
    student_matric_no = serializers.CharField(source='wallet.student.matric_no', read_only=True)
    seller_name = serializers.CharField(source='seller.name', read_only=True, allow_null=True)
    remaining_balance = serializers.SerializerMethodField()
    
    class Meta:
        model = Transaction
        fields = ['transaction_id', 'student_name', 'student_matric_no', 'seller_name', 'amount', 'type', 'transaction_date', 'payment_status', 'description', 'remaining_balance']
        read_only_fields = ['transaction_id', 'transaction_date']
    
    def get_remaining_balance(self, obj):
        return obj.wallet.balance


class StudentInfoSerializer(serializers.ModelSerializer):
    wallet_id = serializers.IntegerField(source='wallet.wallet_id', read_only=True)
    wallet_balance = serializers.DecimalField(max_digits=10, decimal_places=2, source='wallet.balance', read_only=True)
    wallet_status = serializers.CharField(source='wallet.status', read_only=True)
    
    class Meta:
        model = Student
        fields = ['student_id', 'full_name', 'matric_no', 'department', 'level', 'wallet_id', 'wallet_balance', 'wallet_status']
