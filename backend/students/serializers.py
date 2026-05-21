from rest_framework import serializers
from .models import Student, QRCode


class StudentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Student
        fields = ['student_id', 'full_name', 'matric_no', 'department', 'level', 'email', 'is_active', 'created_at']
        read_only_fields = ['student_id', 'created_at']


class StudentCreateSerializer(serializers.ModelSerializer):
    pin = serializers.CharField(write_only=True, min_length=4, max_length=6)
    
    class Meta:
        model = Student
        fields = ['full_name', 'matric_no', 'department', 'level', 'email', 'pin']
    
    def create(self, validated_data):
        pin = validated_data.pop('pin')
        student = Student(**validated_data)
        student.set_pin(pin)
        student.save()
        
        # Create wallet for the student
        from wallets.models import Wallet
        Wallet.objects.create(student=student)
        
        # Generate initial QR code
        QRCode.objects.create(
            student=student,
            qr_data=QRCode.generate_qr_data(student.student_id)
        )
        
        return student


class StudentDetailSerializer(serializers.ModelSerializer):
    qr_code = serializers.SerializerMethodField()
    
    class Meta:
        model = Student
        fields = ['student_id', 'full_name', 'matric_no', 'department', 'level', 'email', 'is_active', 'qr_code', 'created_at']
        read_only_fields = ['student_id', 'created_at', 'qr_code']
    
    def get_qr_code(self, obj):
        try:
            active_qr = obj.qr_codes.filter(is_active=True).first()
            if active_qr:
                return {
                    'qr_id': active_qr.qr_id,
                    'qr_data': active_qr.qr_data,
                    'generated_date': active_qr.generated_date
                }
        except QRCode.DoesNotExist:
            pass
        return None


class QRCodeSerializer(serializers.ModelSerializer):
    class Meta:
        model = QRCode
        fields = ['qr_id', 'qr_data', 'is_active', 'generated_date']
        read_only_fields = ['qr_id', 'generated_date']
