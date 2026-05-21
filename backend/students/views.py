from rest_framework import status, generics, viewsets
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import Student, QRCode, ParentStudent
from .serializers import StudentSerializer, StudentCreateSerializer, StudentDetailSerializer, QRCodeSerializer
from authentication.permissions import IsAdmin, IsAdminOrParent, IsAdminOrStudent, IsParent



class StudentViewSet(viewsets.ModelViewSet):
    queryset = Student.objects.all()
    
    def get_serializer_class(self):
        if self.action == 'create':
            return StudentCreateSerializer
        elif self.action in ['retrieve', 'list']:
            return StudentDetailSerializer
        return StudentSerializer
    
    def get_permissions(self):
        if self.action in ['list', 'create']:
            return [IsAdmin()]
        return [IsAdminOrParent()]
    
    def perform_create(self, serializer):
        serializer.save()


@api_view(['GET'])
@permission_classes([IsAdminOrParent])
def student_detail(request, student_id):
    student = get_object_or_404(Student, student_id=student_id)
    serializer = StudentDetailSerializer(student)
    return Response(serializer.data)


@api_view(['PUT'])
@permission_classes([IsAdmin])
def student_update(request, student_id):
    student = get_object_or_404(Student, student_id=student_id)
    serializer = StudentSerializer(student, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['DELETE'])
@permission_classes([IsAdmin])
def student_deactivate(request, student_id):
    student = get_object_or_404(Student, student_id=student_id)
    student.is_active = False
    student.save()
    return Response({'message': 'Student deactivated successfully'})


@api_view(['GET'])
@permission_classes([IsAdminOrStudent])
def get_qr_code(request, student_id):
    student = get_object_or_404(Student, student_id=student_id)
    try:
        qr_code = student.qr_codes.filter(is_active=True).first()
        if qr_code:
            serializer = QRCodeSerializer(qr_code)
            return Response(serializer.data)
        return Response(
            {'error': 'No active QR code found for this student'},
            status=status.HTTP_404_NOT_FOUND
        )
    except QRCode.DoesNotExist:
        return Response(
            {'error': 'No QR code found for this student'},
            status=status.HTTP_404_NOT_FOUND
        )


@api_view(['POST'])
@permission_classes([IsAdmin])
def regenerate_qr_code(request, student_id):
    student = get_object_or_404(Student, student_id=student_id)
    
    # Deactivate all existing QR codes
    student.qr_codes.all().update(is_active=False)
    
    # Generate new QR code
    new_qr_data = QRCode.generate_qr_data(student.student_id)
    new_qr = QRCode.objects.create(
        student=student,
        qr_data=new_qr_data,
        is_active=True
    )
    
    serializer = QRCodeSerializer(new_qr)
    return Response(serializer.data, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([IsParent])
def link_parent(request):
    """
    Link a parent user to a student's profile.
    Requires matriculation number and wallet ID.
    """
    matric_no = request.data.get('matric_no')
    wallet_id = request.data.get('wallet_id')
    
    if not matric_no or not wallet_id:
        return Response(
            {'error': 'Both matric_no and wallet_id are required'},
            status=status.HTTP_400_BAD_REQUEST
        )
        
    try:
        student = Student.objects.get(matric_no=matric_no, wallet__wallet_id=wallet_id)
    except Student.DoesNotExist:
        return Response(
            {'error': 'Invalid matriculation number or wallet ID. Please check the details and try again.'},
            status=status.HTTP_404_NOT_FOUND
        )
        
    link, created = ParentStudent.objects.get_or_create(parent=request.user, student=student)
    
    if created:
        message = 'Student successfully linked to your account.'
    else:
        message = 'Student is already linked to your account.'
        
    return Response(
        {
            'message': message,
            'student': {
                'student_id': student.student_id,
                'full_name': student.full_name,
                'matric_no': student.matric_no
            }
        },
        status=status.HTTP_200_OK
    )


@api_view(['GET'])
@permission_classes([IsParent])
def parent_linked_students(request):
    """
    Get all student profiles linked to this parent.
    """
    linked_relations = ParentStudent.objects.filter(parent=request.user)
    students = [rel.student for rel in linked_relations]
    
    from payments.serializers import StudentInfoSerializer
    serializer = StudentInfoSerializer(students, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


