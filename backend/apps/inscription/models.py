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
    class_id         = models.ForeignKey(Class,   on_delete=models.CASCADE, db_column='class_id')
    inscription_date = models.DateTimeField(auto_now_add=True)
    status           = models.CharField(max_length=20, choices=STATUS_CHOICES, default=STATUS_CONFIRMED)

    class Meta:
        db_table = 'inscription'
        constraints = [
            models.UniqueConstraint(
                fields=['student', 'class_id'],
                name='unique_student_class'
            )
        ]

    def __str__(self):
        return f"{self.student} → {self.class_id} [{self.status}]"