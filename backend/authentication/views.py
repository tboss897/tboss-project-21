from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from django.contrib.auth import get_user_model
from .serializers import LoginSerializer, PasswordResetSerializer, CustomTokenObtainPairSerializer, UserSerializer

User = get_user_model()


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


from rest_framework_simplejwt.tokens import RefreshToken
import redis

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
def login_view(request):
    serializer = LoginSerializer(data=request.data)
    if serializer.is_valid():
        email = serializer.validated_data['email']
        password = serializer.validated_data['password']
        role = serializer.validated_data['role']
        
        lockout_key = f"login_lockout:{email}"
        attempts_key = f"login_attempts:{email}"
        
        # Check lockout status
        if r_client:
            try:
                if r_client.get(lockout_key):
                    ttl = r_client.ttl(lockout_key)
                    return Response(
                        {'error': f'Account locked due to too many failed attempts. Try again in {ttl} seconds.'},
                        status=status.HTTP_429_TOO_MANY_REQUESTS
                    )
            except Exception:
                pass
        
        try:
            user = User.objects.get(email=email, role=role)
            if user.check_password(password):
                if not user.is_active:
                    return Response(
                        {'error': 'Account is locked or inactive'},
                        status=status.HTTP_403_FORBIDDEN
                    )
                
                # Clear attempts on success
                if r_client:
                    try:
                        r_client.delete(attempts_key)
                        r_client.delete(lockout_key)
                    except Exception:
                        pass
                
                # Generate simplejwt token directly
                refresh = RefreshToken.for_user(user)
                refresh['role'] = user.role
                refresh['user_id'] = user.user_id
                refresh['name'] = user.name
                
                return Response({
                    'access': str(refresh.access_token),
                    'refresh': str(refresh),
                    'user': UserSerializer(user).data
                }, status=status.HTTP_200_OK)
            else:
                # Increment failed attempts
                if r_client:
                    try:
                        attempts = r_client.incr(attempts_key)
                        if attempts == 1:
                            r_client.expire(attempts_key, 900)  # 15 mins window
                        if attempts >= 3:
                            r_client.setex(lockout_key, 900, "locked")
                            r_client.delete(attempts_key)
                    except Exception:
                        pass
                
                return Response(
                    {'error': 'Invalid credentials'},
                    status=status.HTTP_401_UNAUTHORIZED
                )
        except User.DoesNotExist:
            return Response(
                {'error': 'Invalid credentials'},
                status=status.HTTP_401_UNAUTHORIZED
            )
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_view(request):
    try:
        refresh_token = request.data.get('refresh')
        if refresh_token:
            from rest_framework_simplejwt.token_blacklist.models import BlacklistedToken, OutstandingToken
            try:
                token = OutstandingToken.objects.get(token=refresh_token)
                BlacklistedToken.objects.get_or_create(token=token)
            except OutstandingToken.DoesNotExist:
                pass
        
        return Response(
            {'message': 'Successfully logged out'},
            status=status.HTTP_200_OK
        )
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_400_BAD_REQUEST
        )


@api_view(['POST'])
@permission_classes([AllowAny])
def password_reset_view(request):
    serializer = PasswordResetSerializer(data=request.data)
    if serializer.is_valid():
        email = serializer.validated_data['email']
        try:
            user = User.objects.get(email=email)
            # TODO: Send password reset email via SendGrid
            return Response(
                {'message': 'Password reset email sent if account exists'},
                status=status.HTTP_200_OK
            )
        except User.DoesNotExist:
            return Response(
                {'message': 'Password reset email sent if account exists'},
                status=status.HTTP_200_OK
            )
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_profile_view(request):
    serializer = UserSerializer(request.user)
    return Response(serializer.data, status=status.HTTP_200_OK)
