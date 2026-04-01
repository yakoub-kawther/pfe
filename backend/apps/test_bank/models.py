from django.db import models
from apps.academic.models import Class
from apps.accounts.models import Account


class Test(models.Model):

    class Component(models.TextChoices):
        ORAL = 'oral', 'Oral'
        WRITTEN = 'written', 'Written'

    class Status(models.TextChoices):
        PENDING = 'pending', 'Pending'
        APPROVED = 'approved', 'Approved'
        REJECTED = 'rejected', 'Rejected'

    class_obj = models.ForeignKey(
        Class,
        on_delete=models.SET_NULL,
        null=True,
        blank=True  # placement test can be NULL
    )

    component = models.CharField(
        max_length=10,
        choices=Component.choices
    )

    date = models.DateField()

    file_path = models.CharField(
        max_length=255,
        null=True,
        blank=True
    )

    created_by = models.ForeignKey(
        Account,
        on_delete=models.CASCADE,
        related_name='created_tests'
    )

    approved_by = models.ForeignKey(
        Account,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='approved_tests'
    )

    status = models.CharField(
        max_length=8,
        choices=Status.choices,
        default=Status.PENDING
    )

    class Meta:
        db_table = 'test'

    def __str__(self):
        return f"{self.component} test on {self.date} ({self.status})"
    


from apps.persons.models import Student


class Note(models.Model):
    test = models.ForeignKey(Test, on_delete=models.CASCADE)
    student = models.ForeignKey(Student, on_delete=models.CASCADE)
    mark = models.FloatField()
    is_passed = models.BooleanField(default=False)

    class Meta:
        db_table = 'note'
        constraints = [
            models.UniqueConstraint(
                fields=['test', 'student'],
                name='unique_test_student'
            ),
            models.CheckConstraint(
                condition=models.Q(mark__gte=0) & models.Q(mark__lte=100),
                name='mark_between_0_100'
            )
        ]

    def __str__(self):
        return f"{self.student} - {self.test}: {self.mark}"