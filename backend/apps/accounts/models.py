from django.db import models
from apps.persons.models import Student, Employee
from django.contrib.auth.hashers import make_password


class Role(models.Model):
    name = models.CharField(max_length=50, unique=True)

    class Meta:
        db_table = 'role'

    def str(self):
        return self.name


class Account(models.Model):
    username      = models.CharField(max_length=20, unique=True)
    role          = models.ForeignKey(Role, on_delete=models.RESTRICT)
    password_hash = models.CharField(max_length=255)
    status        = models.CharField(max_length=10, choices=[
        ('active',   'Active'),
        ('inactive', 'Inactive')
    ], default='active')
    created_at    = models.DateTimeField(auto_now_add=True)

    student  = models.OneToOneField(Student,  on_delete=models.CASCADE, null=True, blank=True)
    employee = models.OneToOneField(Employee, on_delete=models.CASCADE, null=True, blank=True)

    class Meta:
        db_table = 'account'
        constraints = [
            models.CheckConstraint(
                condition=(
                    models.Q(student__isnull=False, employee__isnull=True) |
                    models.Q(student__isnull=True,  employee__isnull=False)
                ),
                name='one_person_only'
            )
        ]

    def save(self, *args, **kwargs):
        if not self.password_hash.startswith('pbkdf2_'):
            self.password_hash = make_password(self.password_hash)
        super().save(*args, **kwargs)

    def str(self):
        if self.student:
            return f"{self.username} - {self.role}"
        return f"{self.username} - {self.role}"