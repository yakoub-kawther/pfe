from django.db import models
from apps.inscription.models import Inscription


class Note(models.Model):
    
    class Component(models.TextChoices):
        ORAL    = 'oral',    'Oral'
        WRITTEN = 'written', 'Written'

    inscription = models.ForeignKey(Inscription, on_delete=models.CASCADE, related_name='notes',null=True)
    component   = models.CharField(max_length=10, choices=Component.choices , default=Component.ORAL)
    mark        = models.FloatField(default=0)
    is_passed   = models.BooleanField(default=False)
    date        = models.DateField(auto_now_add=True)

    class Meta:
        db_table = 'note'
        constraints = [
            models.UniqueConstraint(
                fields=['inscription', 'component'],
                name='unique_inscription_component'
            ),
            models.CheckConstraint(
                condition=models.Q(mark__gte=0) & models.Q(mark__lte=100),
                name='mark_between_0_100'
            )
        ]

    def __str__(self):
        return f"{self.inscription.student} - {self.component}: {self.mark}"