from django.utils import timezone
from django.db import transaction
from apps.accounts.models import Account
from .models import Notification, NotificationReceiver


# ─────────────────────────────────────────
# Core
# ─────────────────────────────────────────

@transaction.atomic
def send_notification(sender, receivers: list, notification_type: str, title: str, body: str) -> Notification:
    receivers = list(set(receivers))
    if not receivers:
        raise ValueError("Receivers list cannot be empty")

    notification = Notification.objects.create(
        sender=sender,
        type=notification_type,
        title=title,
        body=body,
    )

    NotificationReceiver.objects.bulk_create(
        [
            NotificationReceiver(notification=notification, receiver=receiver)
            for receiver in receivers
        ],
        batch_size=1000
    )

    return notification


# ─────────────────────────────────────────
# Sending helpers
# ─────────────────────────────────────────

def send_to_class(sender, class_id: int, notification_type: str, title: str, body: str) -> Notification:
    """Send to all students in a class."""
    receivers = list(
        Account.objects.filter(student__subscription_id=class_id).distinct()
    )
    return send_notification(sender, receivers, notification_type, title, body)


def send_to_all_students(sender, notification_type: str, title: str, body: str) -> Notification:
    """Send to every student in the system."""
    receivers = list(
        Account.objects.filter(student__isnull=False).distinct()
    )
    return send_notification(sender, receivers, notification_type, title, body)


def send_to_all_teachers(sender, notification_type: str, title: str, body: str) -> Notification:
    """Send to every teacher in the system."""
    receivers = list(
        Account.objects.filter(teacher__isnull=False).distinct()
    )
    return send_notification(sender, receivers, notification_type, title, body)


# ─────────────────────────────────────────
# Read management
# ─────────────────────────────────────────

def mark_as_read(notification_receiver_id: int) -> NotificationReceiver:
    nr = NotificationReceiver.objects.get(id=notification_receiver_id)

    if not nr.is_read:
        nr.is_read = True
        nr.read_at = timezone.now()
        nr.save(update_fields=['is_read', 'read_at'])

    return nr


def mark_all_as_read(account_id: int) -> int:
    """Returns how many were marked as read."""
    updated = NotificationReceiver.objects.filter(
        receiver_id=account_id,
        is_read=False,
    ).update(is_read=True, read_at=timezone.now())

    return updated


# ─────────────────────────────────────────
# Queries
# ─────────────────────────────────────────

def get_my_notifications(account_id: int):
    return (
        NotificationReceiver.objects
        .filter(receiver_id=account_id)
        .select_related('notification', 'notification__sender')
        .order_by('-notification__sent_at')
    )


# ─────────────────────────────────────────
# Automatic triggers
# ─────────────────────────────────────────

def auto_absence_alert(student_id: int) -> Notification | None:
    student_account = Account.objects.get(student__id=student_id)
    system = Account.objects.filter(is_system=True).first()

    if not system:
        raise ValueError("System account not configured")

    already_sent = NotificationReceiver.objects.filter(
        receiver=student_account,
        notification__type=Notification.Type.ABSENCE_ALERT,
        notification__sent_at__month=timezone.now().month,
        notification__sent_at__year=timezone.now().year,
    ).exists()

    if already_sent:
        return None

    return send_notification(
        sender=system,
        receivers=[student_account],
        notification_type=Notification.Type.ABSENCE_ALERT,
        title="Absence Limit Exceeded",
        body=(
            f"Dear {student_account.get_full_name()}, "
            "you have exceeded the allowed number of absences. "
            "Please contact your supervisor."
        ),
    )