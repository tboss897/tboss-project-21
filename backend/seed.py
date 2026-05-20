"""
Seed script for SmartSchool Wallet development database.
Run with: venv/bin/python manage.py shell < seed.py
"""
import os, django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from authentication.models import User
from authentication.profiles import ParentProfile, SellerProfile
from students.models import Student, QRCode, ParentStudent
from wallets.models import Wallet

print("=== Seeding SmartSchool Wallet DB ===")

# --- 1. Admin ---
admin, _ = User.objects.get_or_create(email='admin@ssw.ng', defaults={
    'name': 'Super Admin',
    'role': 'admin',
    'is_staff': True,
    'is_superuser': True
})
admin.set_password('admin1234')
admin.save()
print(f"  Admin: {admin.email} / admin1234")

# --- 2. Parent ---
parent, _ = User.objects.get_or_create(email='parent@ssw.ng', defaults={
    'name': 'Mrs Adeyemi',
    'role': 'parent'
})
parent.set_password('parent1234')
parent.save()
ParentProfile.objects.get_or_create(user=parent, defaults={'phone': '08012345678'})
print(f"  Parent: {parent.email} / parent1234")

# --- 3. Seller ---
seller, _ = User.objects.get_or_create(email='seller@ssw.ng', defaults={
    'name': 'Mama Tuck Shop',
    'role': 'seller'
})
seller.set_password('seller1234')
seller.save()
SellerProfile.objects.get_or_create(user=seller, defaults={
    'location': 'Block A, Ground Floor',
    'service_type': 'Food & Beverage',
    'store_status': 'active'
})
print(f"  Seller: {seller.email} / seller1234")

# --- 4. Students ---
students_data = [
    {'matric_no': 'SSW/2024/001', 'full_name': 'Tunde Adeyemi', 'email': 'tunde@student.ssw.ng',
     'department': 'Science', 'level': 'SS2', 'pin': '1234'},
    {'matric_no': 'SSW/2024/002', 'full_name': 'Chioma Okafor', 'email': 'chioma@student.ssw.ng',
     'department': 'Arts', 'level': 'SS1', 'pin': '5678'},
]

for s_data in students_data:
    pin = s_data.pop('pin')
    student, created = Student.objects.get_or_create(matric_no=s_data['matric_no'], defaults=s_data)
    if created:
        student.set_pin(pin)
        student.save()
        # Create wallet
        Wallet.objects.get_or_create(student=student, defaults={'balance': 5000.00})
        # Generate QR code
        qr_data = QRCode.generate_qr_data(student.student_id)
        QRCode.objects.get_or_create(student=student, defaults={'qr_data': qr_data, 'is_active': True})
        print(f"  Student: {student.matric_no} / PIN: {pin}")
    else:
        print(f"  Student: {student.matric_no} (already exists)")

# --- 5. Link parent to first student ---
first_student = Student.objects.first()
if first_student:
    link, _ = ParentStudent.objects.get_or_create(parent=parent, student=first_student)
    print(f"  Linked: {parent.name} -> {first_student.full_name}")

print("=== Seed complete ===")
