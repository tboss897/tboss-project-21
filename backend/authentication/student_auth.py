from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from students.models import Student
from django.shortcuts import get_object_or_404
import redis
from django.conf import settings

# Redis client for lockout tracking
try:
    r_client = redis.Redis(
        host=settings.REDIS_HOST,
        port=settings.REDIS_PORT,
        db=settings.REDIS_DB,
        password=getattr(settings, 'REDIS_PASSWORD', None),
        decode_responses=True
    )
except Exception:
    r_client = None


@api_view(['POST'])
@permission_classes([AllowAny])
def student_login_view(request):
    """
    Authenticate student via matric_no and PIN.
    Returns limited-scope JWT token with student claims.
    """
    matric_no = request.data.get('matric_no')
    pin = request.data.get('pin')
    
    if not matric_no or not pin:
        return Response(
            {'error': 'Both matric_no and pin are required'},
            status=status.HTTP_400_BAD_REQUEST
        )
        
    lockout_key = f"student_lockout:{matric_no}"
    attempts_key = f"student_attempts:{matric_no}"
    
    # Check lockout status
    if r_client:
        try:
            if r_client.get(lockout_key):
                ttl = r_client.ttl(lockout_key)
                return Response(
                    {'error': f'Student login locked due to too many failed attempts. Try again in {ttl} seconds.'},
                    status=status.HTTP_429_TOO_MANY_REQUESTS
                )
        except Exception:
            pass
            
    try:
        student = Student.objects.get(matric_no=matric_no)
        
        if student.check_pin(pin):
            if not student.is_active:
                return Response(
                    {'error': 'Student account is deactivated'},
                    status=status.HTTP_403_FORBIDDEN
                )
                
            # Clear attempts on success
            if r_client:
                try:
                    r_client.delete(attempts_key)
                    r_client.delete(lockout_key)
                except Exception:
                    pass
                    
            # Generate custom RefreshToken with student claims
            refresh = RefreshToken()
            refresh['user_id'] = f"student_{student.student_id}"
            refresh['role'] = 'student'
            refresh['student_id'] = student.student_id
            refresh['wallet_id'] = getattr(student, 'wallet', None) and student.wallet.wallet_id
            refresh['name'] = student.full_name
            
            # Get serialized student data (simulate a profile output)
            student_data = {
                'student_id': student.student_id,
                'full_name': student.full_name,
                'matric_no': student.matric_no,
                'department': student.department,
                'level': student.level,
                'email': student.email,
                'wallet_id': getattr(student, 'wallet', None) and student.wallet.wallet_id
            }
            
            return Response({
                'access': str(refresh.access_token),
                'refresh': str(refresh),
                'student': student_data
            }, status=status.HTTP_200_OK)
        else:
            # Increment failed attempts
            if r_client:
                try:
                    attempts = r_client.incr(attempts_key)
                    if attempts == 1:
                        r_client.expire(attempts_key, 900)  # 15 min window
                    if attempts >= 3:
                        r_client.setex(lockout_key, 900, "locked")
                        r_client.delete(attempts_key)
                except Exception:
                    pass
                    
            return Response(
                {'error': 'Invalid PIN'},
                status=status.HTTP_401_UNAUTHORIZED
            )
            
    except Student.DoesNotExist:
        return Response(
            {'error': 'Invalid matriculation number'},
            status=status.HTTP_401_UNAUTHORIZED
        )
