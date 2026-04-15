from django.db import models
from apps.persons.models import Student
from apps.academic.models import Class  # adjust if your path is different


class Inscription(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE)
    class_id = models.ForeignKey(Class, on_delete=models.CASCADE , db_column='class_id' )

    inscription_date = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'inscription'
        constraints = [
            models.UniqueConstraint(
                fields=['student', 'class_id'],
                name='unique_student_class'
            )
        ]

    def __str__(self):
        return f"{self.student} → {self.class_id}"