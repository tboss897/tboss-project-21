from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase
from rest_framework import status
from .models import Transaction
from students.models import Student
from wallets.models import Wallet

User = get_user_model()


class TransactionModelTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email='student@example.com',
            password='testpass123',
            name='Test Student',
            role='student'
        )
        self.student = Student.objects.create(
            user=self.user,
            matric_no='MAT12345',
            department='Computer Science',
            level='100'
        )
        self.wallet = Wallet.objects.create(
            student=self.student,
            balance=1000.00,
            daily_limit=5000.00
        )
        self.seller = User.objects.create_user(
            email='seller@example.com',
            password='sellerpass123',
            name='Test Seller',
            role='seller'
        )

    def test_create_transaction(self):
        transaction = Transaction.objects.create(
            wallet=self.wallet,
            seller=self.seller,
            amount=500.00,
            type='payment',
            payment_status='successful'
        )
        self.assertEqual(transaction.amount, 500.00)
        self.assertEqual(transaction.type, 'payment')
        self.assertEqual(transaction.payment_status, 'successful')


class PaymentAPITest(APITestCase):
    def setUp(self):
        self.seller_user = User.objects.create_user(
            email='seller@example.com',
            password='sellerpass123',
            name='Test Seller',
            role='seller'
        )
        self.student_user = User.objects.create_user(
            email='student@example.com',
            password='testpass123',
            name='Test Student',
            role='student'
        )
        self.student = Student.objects.create(
            user=self.student_user,
            matric_no='MAT12345',
            department='Computer Science',
            level='100'
        )
        self.wallet = Wallet.objects.create(
            student=self.student,
            balance=1000.00,
            daily_limit=5000.00
        )

    def test_payment_scan(self):
        self.client.force_authenticate(user=self.seller_user)
        response = self.client.post('/api/v1/payments/scan/', {
            'matric_no': 'MAT12345'
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_payment_process(self):
        self.client.force_authenticate(user=self.seller_user)
        response = self.client.post('/api/v1/payments/process/', {
            'wallet_id': self.wallet.wallet_id,
            'amount': 500.00,
            'pin': '123456'
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
