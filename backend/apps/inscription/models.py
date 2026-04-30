from django.db import models
from apps.persons.models import Student
from apps.academic.models import Class


class Inscription(models.Model):

    STATUS_CONFIRMED = 'confirmed'
    STATUS_CANCELLED = 'cancelled'
    STATUS_PROMOTED  = 'promoted'
    STATUS_REPEATED  = 'repeated'

    STATUS_CHOICES = [
        (STATUS_CONFIRMED, 'Confirmed'),
        (STATUS_CANCELLED, 'Cancelled'),
        (STATUS_PROMOTED,  'Promoted'),
        (STATUS_REPEATED,  'Repeated'),
    ]

    student          = models.ForeignKey(Student, on_delete=models.CASCADE)
    enrolled_class   = models.ForeignKey(Class,   on_delete=models.CASCADE, db_column='class_id')
    inscription_date = models.DateTimeField(auto_now_add=True)
    status           = models.CharField(max_length=20, choices=STATUS_CHOICES, default=STATUS_CONFIRMED)

    class Meta:
        db_table = 'inscription'
        constraints = [
            models.UniqueConstraint(
                fields=['student', 'enrolled_class'],
                name='unique_student_enrolled_class'
            )
        ]

    def __str__(self):
        return f"{self.student} → {self.enrolled_class} [{self.status}]"