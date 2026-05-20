from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken, AuthenticationFailed
from django.utils.translation import gettext_lazy as _
from students.models import Student


class VirtualStudentUser:
    """
    Mock user object returned by authentication for student role tokens.
    Implements standard Django User attributes required by DRF.
    """
    def __init__(self, student):
        self.student = student
        self.user_id = student.student_id
        self.id = student.student_id
        self.name = student.full_name
        self.email = student.email
        self.role = 'student'
        self.is_active = student.is_active
        self.is_authenticated = True
        self.is_staff = False
        self.is_superuser = False

    def __str__(self):
        return f"Student: {self.name} ({self.student.matric_no})"

    def has_perm(self, perm, obj=None):
        return False

    def has_perms(self, perm_list, obj=None):
        return False

    def has_module_perms(self, app_label):
        return False


class CustomJWTAuthentication(JWTAuthentication):
    """
    Extends JWTAuthentication to handle 'student' role tokens by returning
    a VirtualStudentUser instead of querying the User model database table.
    """
    def get_user(self, validated_token):
        role = validated_token.get('role')
        
        if role == 'student':
            student_id = validated_token.get('student_id')
            if not student_id:
                raise InvalidToken(_('Token contained no student identifier'))
            
            try:
                student = Student.objects.get(pk=student_id)
            except Student.DoesNotExist:
                raise AuthenticationFailed(_('No student found matching this token'))
            
            if not student.is_active:
                raise AuthenticationFailed(_('Student account is inactive'))
                
            return VirtualStudentUser(student)
            
        return super().get_user(validated_token)
