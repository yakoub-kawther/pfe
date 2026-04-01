from django.db import models
from apps.academic.models import Session  
from apps.persons.models import Student


class Attendance(models.Model):

    class Status(models.TextChoices):
        PRESENT = 'present', 'Present'
        ABSENT = 'absent', 'Absent'

    session = models.ForeignKey(Session, on_delete=models.CASCADE)
    student = models.ForeignKey(Student, on_delete=models.CASCADE)
    status = models.CharField(
        max_length=7,
        choices=Status.choices
    )

    class Meta:
        db_table = 'attendance'
        constraints = [
            models.UniqueConstraint(
                fields=['session', 'student'],
                name='unique_session_student'
            )
        ]

    def __str__(self):
        return f"{self.student} - {self.session}: {self.status}"