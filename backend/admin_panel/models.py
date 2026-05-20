from django.db import models
from authentication.models import User


class ParentStudentLink(models.Model):
    parent = models.ForeignKey(User, on_delete=models.CASCADE, related_name='linked_students')
    student_id = models.IntegerField()  # Reference to Student.student_id
    linked_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['parent', 'student_id']
    
    def __str__(self):
        return f"{self.parent.name} -> Student ID: {self.student_id}"
