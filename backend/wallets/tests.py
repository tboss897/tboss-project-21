from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase
from rest_framework import status
from .models import Wallet
from students.models import Student

User = get_user_model()


class WalletModelTest(TestCase):
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

    def test_create_wallet(self):
        wallet = Wallet.objects.create(
            student=self.student,
            balance=1000.00,
            daily_limit=5000.00
        )
        self.assertEqual(wallet.balance, 1000.00)
        self.assertEqual(wallet.daily_limit, 5000.00)
        self.assertEqual(wallet.status, 'active')

    def test_credit_wallet(self):
        wallet = Wallet.objects.create(
            student=self.student,
            balance=1000.00,
            daily_limit=5000.00
        )
        wallet.credit(500.00)
        self.assertEqual(wallet.balance, 1500.00)

    def test_debit_wallet(self):
        wallet = Wallet.objects.create(
            student=self.student,
            balance=1000.00,
            daily_limit=5000.00
        )
        wallet.debit(500.00)
        self.assertEqual(wallet.balance, 500.00)


class WalletAPITest(APITestCase):
    def setUp(self):
        self.admin_user = User.objects.create_user(
            email='admin@example.com',
            password='adminpass123',
            name='Admin User',
            role='admin'
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

    def test_get_wallet_detail(self):
        self.client.force_authenticate(user=self.student_user)
        response = self.client.get(f'/api/v1/wallets/{self.wallet.wallet_id}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['balance'], '1000.00')

    def test_topup_wallet(self):
        self.client.force_authenticate(user=self.admin_user)
        response = self.client.post(f'/api/v1/wallets/{self.wallet.wallet_id}/topup/', {
            'amount': 500.00
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
