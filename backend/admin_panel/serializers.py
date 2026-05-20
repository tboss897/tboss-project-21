from rest_framework import serializers
from authentication.models import User
from students.models import Student
from wallets.models import Wallet
from payments.models import Transaction


class DashboardStatsSerializer(serializers.Serializer):
    total_students = serializers.IntegerField()
    total_wallets = serializers.IntegerField()
    total_transactions_today = serializers.DecimalField(max_digits=15, decimal_places=2)
    total_balance = serializers.DecimalField(max_digits=15, decimal_places=2)
    active_sellers = serializers.IntegerField()


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['user_id', 'name', 'email', 'role', 'status', 'is_active', 'created_at']
        read_only_fields = ['user_id', 'created_at']


class UserCreateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    phone = serializers.CharField(required=False, allow_blank=True, default='')
    location = serializers.CharField(required=False, allow_blank=True, default='')
    service_type = serializers.CharField(required=False, allow_blank=True, default='')
    
    class Meta:
        model = User
        fields = ['name', 'email', 'password', 'role', 'phone', 'location', 'service_type']
    
    def create(self, validated_data):
        password = validated_data.pop('password')
        phone = validated_data.pop('phone', '')
        location = validated_data.pop('location', '')
        service_type = validated_data.pop('service_type', '')
        
        from django.db import transaction
        with transaction.atomic():
            user = User(**validated_data)
            user.set_password(password)
            user.save()
            
            if user.role == 'parent':
                from authentication.profiles import ParentProfile
                ParentProfile.objects.create(user=user, phone=phone)
            elif user.role == 'seller':
                from authentication.profiles import SellerProfile
                SellerProfile.objects.create(
                    user=user,
                    location=location,
                    service_type=service_type,
                    store_status='active'
                )
            return user



class UserSuspendSerializer(serializers.Serializer):
    is_active = serializers.BooleanField()


class AdminTransactionSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='wallet.student.full_name', read_only=True)
    student_matric_no = serializers.CharField(source='wallet.student.matric_no', read_only=True)
    seller_name = serializers.CharField(source='seller.name', read_only=True, allow_null=True)
    
    class Meta:
        model = Transaction
        fields = ['transaction_id', 'student_name', 'student_matric_no', 'seller_name', 'amount', 'type', 'transaction_date', 'payment_status', 'description']
        read_only_fields = ['transaction_id', 'transaction_date']


class ReportRequestSerializer(serializers.Serializer):
    report_type = serializers.ChoiceField(choices=['transactions', 'wallets', 'students', 'sellers'])
    date_from = serializers.DateField(required=False)
    date_to = serializers.DateField(required=False)
