from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db import transaction
from django.utils import timezone
from datetime import timedelta
import time
from .models import Transaction
from students.models import Student, QRCode
from wallets.models import Wallet
from .serializers import PaymentScanSerializer, PaymentProcessSerializer, PaymentReceiptSerializer, StudentInfoSerializer
from authentication.permissions import IsSeller, IsAdminOrSeller
from authentication.rate_limiting import rate_limit, check_duplicate_payment, generate_payment_lock_key


@api_view(['POST'])
@permission_classes([IsSeller])
@rate_limit(limit=10, period=60)
def payment_scan(request):
    serializer = PaymentScanSerializer(data=request.data)
    
    if serializer.is_valid():
        qr_data = serializer.validated_data.get('qr_data')
        matric_no = serializer.validated_data.get('matric_no')
        
        student = None
        
        # Try to identify student by QR code or matric number
        if qr_data:
            # Verify QR signature
            if not QRCode.verify_qr_signature(qr_data):
                return Response(
                    {'error': 'Invalid QR code signature'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Extract student ID from QR data
            try:
                parts = qr_data.split('|')
                student_id = int(parts[1])
                student = get_object_or_404(Student, student_id=student_id)
            except (IndexError, ValueError):
                return Response(
                    {'error': 'Invalid QR code format'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        elif matric_no:
            student = get_object_or_404(Student, matric_no=matric_no)
        else:
            return Response(
                {'error': 'Either QR code or matric number is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if student has an active wallet
        try:
            wallet = student.wallet
        except Wallet.DoesNotExist:
            return Response(
                {'error': 'Student does not have a wallet'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Return student information
        student_serializer = StudentInfoSerializer(student)
        return Response(student_serializer.data, status=status.HTTP_200_OK)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsSeller])
@rate_limit(limit=10, period=60)
def payment_process(request):
    serializer = PaymentProcessSerializer(data=request.data)
    
    if serializer.is_valid():
        wallet_id = serializer.validated_data['wallet_id']
        amount = serializer.validated_data['amount']
        pin = serializer.validated_data['pin']
        description = serializer.validated_data.get('description', 'Payment')
        
        # Check for duplicate payment using deduplication lock
        timestamp = int(time.time())
        if check_duplicate_payment(wallet_id, amount, timestamp):
            return Response(
                {'error': 'Duplicate payment detected'},
                status=status.HTTP_409_CONFLICT
            )
        
        wallet = get_object_or_404(Wallet, wallet_id=wallet_id)
        student = wallet.student
        
        # Verify PIN
        if not student.check_pin(pin):
            return Response(
                {'error': 'Invalid PIN'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        # Check wallet status
        if wallet.status != 'active':
            return Response(
                {'error': 'Wallet is not active'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Check sufficient balance
        if not wallet.can_debit(amount):
            return Response(
                {'error': 'Insufficient balance'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check daily spending limit if parental monitoring is enabled
        if wallet.monitoring_enabled and wallet.daily_limit is not None:
            from django.db.models import Sum
            today_start = timezone.now().replace(hour=0, minute=0, second=0, microsecond=0)
            today_spent = Transaction.objects.filter(
                wallet=wallet,
                type='payment',
                payment_status='successful',
                transaction_date__gte=today_start
            ).aggregate(total=Sum('amount'))['total'] or 0
            
            if today_spent + amount > wallet.daily_limit:
                return Response(
                    {'error': f'Daily spending limit of ₦{wallet.daily_limit:,.2f} exceeded. Remaining: ₦{max(0, wallet.daily_limit - today_spent):,.2f}.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        # Acquire deduplication lock
        from authentication.rate_limiting import DeduplicationLock
        lock = DeduplicationLock()
        lock_key = generate_payment_lock_key(wallet_id, amount, timestamp)
        
        if not lock.acquire(lock_key, ttl=30):
            return Response(
                {'error': 'Payment already in progress'},
                status=status.HTTP_409_CONFLICT
            )
        
        try:
            with transaction.atomic():
                # Debit the wallet
                wallet.debit(amount)
                
                # Create transaction record
                transaction_obj = Transaction.objects.create(
                    wallet=wallet,
                    seller=request.user,
                    amount=amount,
                    type='payment',
                    payment_status='successful',
                    description=description
                )
            
            # TODO: Send notification to parent
            
            receipt_serializer = PaymentReceiptSerializer(transaction_obj)
            return Response(receipt_serializer.data, status=status.HTTP_200_OK)
        finally:
            lock.release(lock_key)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAdminOrSeller])
def payment_receipt(request, transaction_id):
    transaction_obj = get_object_or_404(Transaction, transaction_id=transaction_id)
    serializer = PaymentReceiptSerializer(transaction_obj)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAdminOrSeller])
def payment_list(request):
    if request.user.role == 'admin':
        transactions = Transaction.objects.all()
    else:
        transactions = Transaction.objects.filter(seller=request.user)
        
    # Apply standard ordering
    transactions = transactions.order_by('-transaction_date')
    
    # Optional limit query parameter
    limit = request.query_params.get('limit')
    if limit:
        transactions = transactions[:int(limit)]
        
    serializer = PaymentReceiptSerializer(transactions, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)

