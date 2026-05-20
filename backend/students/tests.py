from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase
from rest_framework import status
from .models import Student, QRCode

User = get_user_model()


class StudentModelTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email='student@example.com',
            password='testpass123',
            name='Test Student',
            role='student'
        )

    def test_create_student(self):
        student = Student.objects.create(
            user=self.user,
            matric_no='MAT12345',
            department='Computer Science',
            level='100'
        )
        self.assertEqual(student.matric_no, 'MAT12345')
        self.assertEqual(student.department, 'Computer Science')
        self.assertEqual(student.level, '100')
        self.assertTrue(student.is_active)

    def test_qr_code_generation(self):
        student = Student.objects.create(
            user=self.user,
            matric_no='MAT12345',
            department='Computer Science',
            level='100'
        )
        qr_code = QRCode.objects.create(student=student)
        self.assertIsNotNone(qr_code.qr_data)
        self.assertEqual(qr_code.student, student)


class StudentAPITest(APITestCase):
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

    def test_list_students_as_admin(self):
        self.client.force_authenticate(user=self.admin_user)
        response = self.client.get('/api/v1/students/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_get_student_detail(self):
        self.client.force_authenticate(user=self.admin_user)
        response = self.client.get(f'/api/v1/students/{self.student.student_id}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['matric_no'], 'MAT12345')
