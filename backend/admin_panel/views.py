from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db.models import Sum, Count, Q
from django.utils import timezone
from datetime import datetime, timedelta
from authentication.models import User
from students.models import Student
from wallets.models import Wallet
from payments.models import Transaction
from .serializers import DashboardStatsSerializer, UserSerializer, UserCreateSerializer, UserSuspendSerializer, AdminTransactionSerializer, ReportRequestSerializer
from authentication.permissions import IsAdmin


@api_view(['GET'])
@permission_classes([IsAdmin])
def admin_dashboard(request):
    # Calculate dashboard statistics
    total_students = Student.objects.count()
    total_wallets = Wallet.objects.count()
    
    today = timezone.now().date()
    transactions_today = Transaction.objects.filter(transaction_date__date=today)
    total_transactions_today = transactions_today.aggregate(total=Sum('amount'))['total'] or 0
    
    total_balance = Wallet.objects.aggregate(total=Sum('balance'))['total'] or 0
    active_sellers = User.objects.filter(role='seller', seller_profile__store_status='active').count()
    
    stats = {
        'total_students': total_students,
        'total_wallets': total_wallets,
        'total_transactions_today': float(total_transactions_today),
        'total_balance': float(total_balance),
        'active_sellers': active_sellers
    }
    
    serializer = DashboardStatsSerializer(stats)
    return Response(serializer.data)


@api_view(['GET', 'POST'])
@permission_classes([IsAdmin])
def admin_users(request):
    if request.method == 'GET':
        role = request.query_params.get('role')
        users = User.objects.all()
        
        if role:
            users = users.filter(role=role)
        
        serializer = UserSerializer(users, many=True)
        return Response(serializer.data)
    
    elif request.method == 'POST':
        serializer = UserCreateSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['PUT'])
@permission_classes([IsAdmin])
def admin_suspend_user(request, user_id):
    user = get_object_or_404(User, user_id=user_id)
    serializer = UserSuspendSerializer(data=request.data)
    
    if serializer.is_valid():
        user.is_active = serializer.validated_data['is_active']
        user.save()
        return Response(
            {'message': 'User status updated successfully'},
            status=status.HTTP_200_OK
        )
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAdmin])
def admin_transactions(request):
    transactions = Transaction.objects.all()
    
    # Apply filters
    status_filter = request.query_params.get('status')
    if status_filter:
        transactions = transactions.filter(payment_status=status_filter)
    
    date_from = request.query_params.get('date_from')
    date_to = request.query_params.get('date_to')
    
    if date_from:
        transactions = transactions.filter(transaction_date__date__gte=date_from)
    if date_to:
        transactions = transactions.filter(transaction_date__date__lte=date_to)
    
    serializer = AdminTransactionSerializer(transactions, many=True)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAdmin])
def admin_reports(request):
    serializer = ReportRequestSerializer(data=request.data)
    
    if serializer.is_valid():
        report_type = serializer.validated_data['report_type']
        date_from = serializer.validated_data.get('date_from')
        date_to = serializer.validated_data.get('date_to')
        
        # Generate report based on type
        if report_type == 'transactions':
            data = Transaction.objects.all()
        elif report_type == 'wallets':
            data = Wallet.objects.all()
        elif report_type == 'students':
            data = Student.objects.all()
        elif report_type == 'sellers':
            data = User.objects.filter(role='seller')
        
        # Apply date filters if provided
        if date_from and hasattr(data, 'filter'):
            data = data.filter(created_at__date__gte=date_from)
        if date_to and hasattr(data, 'filter'):
            data = data.filter(created_at__date__lte=date_to)
        
        # Return basic report data
        return Response({
            'report_type': report_type,
            'date_from': str(date_from) if date_from else None,
            'date_to': str(date_to) if date_to else None,
            'count': data.count() if hasattr(data, 'count') else len(data),
            'data': list(data.values())[:100]  # Limit to 100 records
        })
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
