from django.db import models
from apps.inscription.models import Inscription


class Payment(models.Model):

    class Status(models.TextChoices):
        PAID = 'paid', 'Paid'
        PENDING = 'pending', 'Pending'
        OVERDUE = 'overdue', 'Overdue'

    inscription = models.OneToOneField(
        Inscription,
        on_delete=models.CASCADE
    )

    amount = models.DecimalField(max_digits=10, decimal_places=2)

    payment_date = models.DateTimeField(
        null=True,
        blank=True,
        auto_now_add=True
    )

    status = models.CharField(
        max_length=10,
        choices=Status.choices,
        default=Status.PENDING
    )

    class Meta:
        db_table = 'payment'

    def __str__(self):
        return f"{self.inscription} - {self.status}"