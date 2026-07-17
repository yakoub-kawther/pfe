from decimal import Decimal
from django.utils import timezone
from django.db import transaction

from apps.payments.models import Payment
from apps.payments.exceptions import (
    PaymentAlreadyExistsError,
    PaymentNotFoundError,
    InvalidPaymentStatusError,
    InscriptionNotFoundError,
)
from apps.inscription.models import Inscription



def create_payment(inscription_id: int, amount: Decimal, method: str = None, remark: str = '') -> Payment:
    try:
        inscription = Inscription.objects.get(id=inscription_id)
    except Inscription.DoesNotExist:
        raise InscriptionNotFoundError(f"Inscription with id={inscription_id} not found.")

    if Payment.objects.filter(inscription=inscription).exists():
        raise PaymentAlreadyExistsError(
            f"A payment already exists for inscription id={inscription_id}."
        )

    payment = Payment.objects.create(
        inscription=inscription,
        amount=amount,
        status=Payment.Status.PENDING,
        remark=remark,
    )

    return payment


@transaction.atomic
def confirm_payment(payment_id: int) -> Payment:
    payment = _get_payment_or_raise(payment_id)

    if payment.status == Payment.Status.PAID:
        raise InvalidPaymentStatusError(
            f"Payment id={payment_id} is already paid."
        )

    if payment.status == Payment.Status.OVERDUE:
        raise InvalidPaymentStatusError(
            f"Payment id={payment_id} is overdue and cannot be confirmed directly."
        )

    # Mark payment as paid
    payment.status = Payment.Status.PAID
    payment.payment_date = timezone.now()
    payment.save(update_fields=['status', 'payment_date'])

    # Confirm the inscription
    inscription = payment.inscription
    inscription.status = Inscription.STATUS_CONFIRMED   # adjust field name if different
    inscription.save(update_fields=['status'])

    # Trigger notification
    _send_payment_confirmation_notification(payment)

    return payment


@transaction.atomic
def cancel_payment(payment_id: int) -> Payment:
    payment = _get_payment_or_raise(payment_id)

    if payment.status == Payment.Status.PAID:
        raise InvalidPaymentStatusError(
            f"Payment id={payment_id} is already paid and cannot be cancelled."
        )

    # Cancel inscription
    inscription = payment.inscription
    inscription.status = Inscription.Status.CANCELLED   # adjust field name if different
    inscription.save(update_fields=['status'])

    # Delete the payment record so a new one can be created later if needed
    payment.delete()

    return payment



def get_student_payments(student_id: int) -> list:
    """
    student_id == person_id because Student uses person as its primary key.
    """
    payments = (
        Payment.objects
        .filter(inscription__student_id=student_id)   # correct — student PK = person PK
        .select_related(
            'inscription',
            'inscription__student',
            'inscription__student__person',   
            'inscription__enrolled_class',    
        )
        .order_by('-payment_date')
    )
    return list(payments)


def get_payment_by_inscription(inscription_id: int) -> Payment:
    try:
        return Payment.objects.select_related('inscription').get(
            inscription_id=inscription_id
        )
    except Payment.DoesNotExist:
        raise PaymentNotFoundError(
            f"No payment found for inscription id={inscription_id}."
        )


def get_pending_payments() -> list:
    payments = (
        Payment.objects
        .filter(status=Payment.Status.PENDING)
        .select_related('inscription', 'inscription__student', 'inscription__enrolled_class')
        .order_by('payment_date')
    )
    return list(payments)



def get_monthly_revenue(month: int, year: int) -> Decimal:
    from django.db.models import Sum

    result = Payment.objects.filter(
        status=Payment.Status.PAID,
        payment_date__year=year,
        payment_date__month=month,
    ).aggregate(total=Sum('amount'))

    return result['total'] or Decimal('0.00')


def get_revenue_stats(year: int) -> list:
    from django.db.models import Sum
    from django.db.models.functions import TruncMonth

    monthly = (
        Payment.objects
        .filter(status=Payment.Status.PAID, payment_date__year=year)
        .annotate(month=TruncMonth('payment_date'))
        .values('month')
        .annotate(total=Sum('amount'))
        .order_by('month')
    )

    # Build a full 12-month map (months with no revenue → 0)
    revenue_map = {entry['month'].month: entry['total'] for entry in monthly}

    stats = [
        {
            'month': m,
            'month_name': _month_name(m),
            'total': revenue_map.get(m, Decimal('0.00')),
        }
        for m in range(1, 13)
    ]

    return stats




def _get_payment_or_raise(payment_id: int) -> Payment:
    try:
        return Payment.objects.select_related('inscription').get(id=payment_id)
    except Payment.DoesNotExist:
        raise PaymentNotFoundError(f"Payment with id={payment_id} not found.")


def _send_payment_confirmation_notification(payment: Payment) -> None:
   
    # Example: send_email(payment.inscription.student.email, ...)
    print(
        f"[NOTIFICATION] Payment confirmed for inscription "
        f"#{payment.inscription.id} — amount: {payment.amount}"
    )


def _month_name(month: int) -> str:
    import calendar
    return calendar.month_name[month]





@transaction.atomic
def update_payment(payment_id: int, amount: Decimal = None, status: str = None, remark: str = None) -> Payment:
    payment = _get_payment_or_raise(payment_id)

    fields = []
    if amount is not None:
        payment.amount = amount
        fields.append('amount')

    if status is not None:
        was_paid = payment.status == Payment.Status.PAID
        payment.status = status
        fields.append('status')

        if status == Payment.Status.PAID and not was_paid:
            payment.payment_date = timezone.now()
            fields.append('payment_date')

    if remark is not None:
        payment.remark = remark
        fields.append('remark')

    if fields:
        payment.save(update_fields=fields)

    return payment