from django.db import models
from apps.accounts.models import Account


class Notification(models.Model):

    class Type(models.TextChoices):
        SCHEDULE_CHANGE = 'schedule_change', 'Schedule Change'
        PAYMENT_REMINDER = 'payment_reminder', 'Payment Reminder'
        ABSENCE_ALERT = 'absence_alert', 'Absence Alert'
        MEETING = 'meeting', 'Meeting'
        SALARY = 'salary', 'Salary'
        GENERAL = 'general', 'General'

    sender = models.ForeignKey(Account, on_delete=models.CASCADE)
    type = models.CharField(max_length=25, choices=Type.choices)

    title = models.CharField(max_length=150)
    body = models.TextField()

    sent_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'notification'

    def __str__(self):
        return f"{self.title} ({self.type})"
    


class NotificationReceiver(models.Model):
    notification = models.ForeignKey(Notification, on_delete=models.CASCADE)
    receiver = models.ForeignKey(Account, on_delete=models.CASCADE)

    class Meta:
        db_table = 'notification_receiver'
        constraints = [
            models.UniqueConstraint(
                fields=['notification', 'receiver'],
                name='unique_notification_receiver'
            )
        ]

    def __str__(self):
        return f"{self.notification} → {self.receiver}"