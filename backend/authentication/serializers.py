from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth.password_validation import validate_password
from .models import User


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['role'] = user.role
        token['user_id'] = user.user_id
        token['name'] = user.name
        return token


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    role = serializers.ChoiceField(choices=['student', 'parent', 'seller', 'admin'])


class PasswordResetSerializer(serializers.Serializer):
    email = serializers.EmailField()


class UserSerializer(serializers.ModelSerializer):
    phone = serializers.SerializerMethodField()
    location = serializers.SerializerMethodField()
    service_type = serializers.SerializerMethodField()
    status = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['user_id', 'name', 'email', 'role', 'phone', 'location', 'service_type', 'status', 'is_active']
        read_only_fields = ['user_id', 'is_active']

    def get_phone(self, obj):
        if obj.role == 'parent':
            try:
                return obj.parent_profile.phone
            except Exception:
                return ''
        return ''

    def get_location(self, obj):
        if obj.role == 'seller':
            try:
                return obj.seller_profile.location
            except Exception:
                return ''
        return ''

    def get_service_type(self, obj):
        if obj.role == 'seller':
            try:
                return obj.seller_profile.service_type
            except Exception:
                return ''
        return ''

    def get_status(self, obj):
        if obj.role == 'seller':
            try:
                return obj.seller_profile.store_status
            except Exception:
                return ''
        return 'active'

