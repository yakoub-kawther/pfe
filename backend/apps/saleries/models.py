from django.db import models
from apps.persons.models import Employee


class Salary(models.Model):

    class Status(models.TextChoices):
        PAID = 'paid', 'Paid'
        PENDING = 'pending', 'Pending'

    employee = models.ForeignKey(Employee, on_delete=models.CASCADE)
    amount   = models.DecimalField(max_digits=10, decimal_places=2)

    month = models.PositiveSmallIntegerField()   # 1–12, fixed forever
    year  = models.PositiveSmallIntegerField()

    payment_date = models.DateTimeField(null=True, blank=True)  # only set once actually paid
    status       = models.CharField(max_length=7, choices=Status.choices, default=Status.PENDING)
    remark       = models.TextField(blank=True, default='')

    class Meta:
        db_table = 'salary'
        unique_together = ('employee', 'month', 'year')

    def __str__(self):
        return f"{self.employee} - {self.month}/{self.year} ({self.status})"