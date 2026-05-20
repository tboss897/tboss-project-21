from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db import transaction
from .models import Wallet
from payments.models import Transaction
from .serializers import WalletSerializer, WalletTopupSerializer, WalletLimitSerializer, WalletStatusSerializer, TransactionSerializer
from authentication.permissions import IsAdmin, IsAdminOrParent, IsAdminOrParentOrStudent, IsAdminOrSeller


@api_view(['GET'])
@permission_classes([IsAdminOrParentOrStudent])
def wallet_detail(request, wallet_id):
    wallet = get_object_or_404(Wallet, wallet_id=wallet_id)
    serializer = WalletSerializer(wallet)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAdminOrParent])
def wallet_topup(request, wallet_id):
    wallet = get_object_or_404(Wallet, wallet_id=wallet_id)
    serializer = WalletTopupSerializer(data=request.data)
    
    if serializer.is_valid():
        amount = serializer.validated_data['amount']
        description = serializer.validated_data.get('description', 'Wallet top-up')
        
        with transaction.atomic():
            # Credit the wallet
            wallet.credit(amount)
            
            # Create transaction record
            Transaction.objects.create(
                wallet=wallet,
                amount=amount,
                type='topup',
                payment_status='successful',
                description=description
            )
        
        return Response(
            {'message': 'Wallet topped up successfully', 'new_balance': float(wallet.balance)},
            status=status.HTTP_200_OK
        )
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAdminOrParentOrStudent])
def wallet_transactions(request, wallet_id):
    wallet = get_object_or_404(Wallet, wallet_id=wallet_id)
    transactions = wallet.transactions.all()
    
    # Apply filters
    limit = request.query_params.get('limit')
    if limit:
        transactions = transactions[:int(limit)]
    
    serializer = TransactionSerializer(transactions, many=True)
    return Response(serializer.data)


@api_view(['PUT'])
@permission_classes([IsAdminOrParent])
def wallet_set_limit(request, wallet_id):
    wallet = get_object_or_404(Wallet, wallet_id=wallet_id)
    serializer = WalletLimitSerializer(data=request.data)
    
    if serializer.is_valid():
        # If the requester is a parent, verify they are linked to this student
        if request.user.role == 'parent':
            from students.models import ParentStudent
            if not ParentStudent.objects.filter(parent=request.user, student=wallet.student).exists():
                return Response(
                    {'error': 'You are not linked to this student and cannot set limits.'},
                    status=status.HTTP_403_FORBIDDEN
                )
        
        # Update settings on the wallet
        wallet.daily_limit = serializer.validated_data.get('daily_limit', wallet.daily_limit)
        wallet.monitoring_enabled = serializer.validated_data.get('monitoring_enabled', wallet.monitoring_enabled)
        wallet.save()
        
        return Response(
            {'message': 'Wallet limit settings updated successfully'},
            status=status.HTTP_200_OK
        )
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['PUT'])
@permission_classes([IsAdmin])
def wallet_set_status(request, wallet_id):
    wallet = get_object_or_404(Wallet, wallet_id=wallet_id)
    serializer = WalletStatusSerializer(data=request.data)
    
    if serializer.is_valid():
        wallet.status = serializer.validated_data['status']
        wallet.save()
        return Response(
            {'message': 'Wallet status updated successfully'},
            status=status.HTTP_200_OK
        )
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
