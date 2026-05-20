from django.db import models
import hmac
import hashlib
from django.conf import settings


class Student(models.Model):
    student_id = models.AutoField(primary_key=True)
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='student_profile'
    )
    full_name = models.CharField(max_length=100)
    matric_no = models.CharField(max_length=50, unique=True)
    department = models.CharField(max_length=100, blank=True, null=True)
    level = models.CharField(max_length=20, blank=True, null=True)
    email = models.EmailField(unique=True)
    pin_hash = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)
    
    def set_pin(self, pin):
        import bcrypt
        self.pin_hash = bcrypt.hashpw(pin.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    
    def check_pin(self, pin):
        import bcrypt
        try:
            return bcrypt.checkpw(pin.encode('utf-8'), self.pin_hash.encode('utf-8'))
        except Exception:
            return False
    
    def __str__(self):
        return f"{self.full_name} ({self.matric_no})"


class ParentStudent(models.Model):
    """
    Linking model to associate a parent User with a Student they monitor.
    """
    parent = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='monitored_students'
    )
    student = models.ForeignKey(
        Student,
        on_delete=models.CASCADE,
        related_name='linked_parents'
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'parent_students'
        unique_together = ('parent', 'student')

    def __str__(self):
        return f"Parent {self.parent.name} -> Student {self.student.full_name}"



class QRCode(models.Model):
    qr_id = models.AutoField(primary_key=True)
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='qr_codes')
    qr_data = models.TextField()
    is_active = models.BooleanField(default=True)
    generated_date = models.DateTimeField(auto_now_add=True)
    
    @classmethod
    def generate_qr_data(cls, student_id):
        qr_string = f"SSW|{student_id}|{cls._get_timestamp()}"
        signature = hmac.new(
            settings.QR_HMAC_SECRET.encode('utf-8'),
            qr_string.encode('utf-8'),
            hashlib.sha256
        ).hexdigest()
        return f"{qr_string}|{signature}"
    
    @staticmethod
    def _get_timestamp():
        from datetime import datetime
        return datetime.utcnow().isoformat()
    
    @classmethod
    def verify_qr_signature(cls, qr_data):
        try:
            parts = qr_data.split('|')
            if len(parts) != 4:
                return False
            
            qr_string = '|'.join(parts[:3])
            signature = parts[3]
            
            expected_signature = hmac.new(
                settings.QR_HMAC_SECRET.encode('utf-8'),
                qr_string.encode('utf-8'),
                hashlib.sha256
            ).hexdigest()
            
            return hmac.compare_digest(signature, expected_signature)
        except Exception:
            return False
    
    def __str__(self):
        return f"QR for {self.student.full_name} (Active: {self.is_active})"
