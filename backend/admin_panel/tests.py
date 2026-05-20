from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase
from rest_framework import status
from .models import ParentStudentLink
from students.models import Student

User = get_user_model()


class ParentStudentLinkModelTest(TestCase):
    def setUp(self):
        self.parent = User.objects.create_user(
            email='parent@example.com',
            password='parentpass123',
            name='Test Parent',
            role='parent'
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

    def test_create_parent_student_link(self):
        link = ParentStudentLink.objects.create(
            parent=self.parent,
            student=self.student
        )
        self.assertEqual(link.parent, self.parent)
        self.assertEqual(link.student, self.student)
        self.assertTrue(link.is_active)


class AdminAPITest(APITestCase):
    def setUp(self):
        self.admin_user = User.objects.create_user(
            email='admin@example.com',
            password='adminpass123',
            name='Admin User',
            role='admin'
        )
        self.parent = User.objects.create_user(
            email='parent@example.com',
            password='parentpass123',
            name='Test Parent',
            role='parent'
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

    def test_admin_dashboard(self):
        self.client.force_authenticate(user=self.admin_user)
        response = self.client.get('/api/v1/admin/dashboard/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_admin_users_list(self):
        self.client.force_authenticate(user=self.admin_user)
        response = self.client.get('/api/v1/admin/users/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_suspend_user(self):
        self.client.force_authenticate(user=self.admin_user)
        response = self.client.put(f'/api/v1/admin/users/{self.parent.user_id}/suspend/', {
            'is_active': False
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
