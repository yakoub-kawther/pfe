from django.db import models
from apps.persons.models import Employee


class Salary(models.Model):

    class Status(models.TextChoices):
        PAID = 'paid', 'Paid'
        PENDING = 'pending', 'Pending'

    employee = models.ForeignKey(
        Employee,
        on_delete=models.CASCADE
    )

    amount = models.DecimalField(
        max_digits=10,
        decimal_places=2
    )

    payment_date = models.DateField()

    status = models.CharField(
        max_length=7,
        choices=Status.choices,
        default=Status.PENDING
    )

    class Meta:
        db_table = 'salary'

    def __str__(self):
        return f"{self.employee} - {self.amount} ({self.status})"