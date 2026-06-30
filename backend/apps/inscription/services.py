from django.db import transaction
from django.shortcuts import get_object_or_404

from apps.persons.models import Student
from apps.academic.models import Class
from .models import Inscription


ACTIVE_STATUSES = ('confirmed',)


@transaction.atomic
def create_inscription(student_id: int, class_id: int) -> Inscription:
    from apps.payments.models import Payment

    student        = get_object_or_404(Student, pk=student_id)
    enrolled_class = get_object_or_404(Class, pk=class_id)

    i = Inscription.objects.latest('inscription_date')
    print(i)
    print(Payment.objects.filter(inscription=i).exists())

    if enrolled_class.status != 'active':
        raise ValueError(f'Cannot enroll in a class with status "{enrolled_class.status}".')

    if Inscription.objects.filter(student=student, enrolled_class=enrolled_class).exists():
        raise ValueError('Student is already enrolled in this class.')

    inscription = Inscription.objects.create(
        student=student,
        enrolled_class=enrolled_class,
        status=Inscription.STATUS_CONFIRMED,
    )

    Payment.objects.create(
        inscription=inscription,
        amount=0,
        status=Payment.Status.PENDING,
    )

    return inscription


def update_inscription(inscription_id: int, data: dict) -> Inscription:
    inscription = get_object_or_404(Inscription, pk=inscription_id)

    if inscription.status != Inscription.STATUS_CONFIRMED:
        raise ValueError(f'Cannot update an inscription with status "{inscription.status}".')

    if 'student' in data or 'student_id' in data:
        raise ValueError('Cannot change the student of an inscription.')

    if 'enrolled_class' in data or 'class_id' in data:
        raise ValueError('Cannot change the class directly. Use promote or repeat instead.')

    for attr, value in data.items():
        setattr(inscription, attr, value)
    inscription.save()

    return inscription


def cancel_inscription(inscription_id: int) -> Inscription:
    inscription = get_object_or_404(Inscription, pk=inscription_id)

    if inscription.status == Inscription.STATUS_CANCELLED:
        raise ValueError('Inscription is already cancelled.')

    if inscription.status != Inscription.STATUS_CONFIRMED:
        raise ValueError(f'Cannot cancel an inscription with status "{inscription.status}".')

    inscription.status = Inscription.STATUS_CANCELLED
    inscription.save(update_fields=['status'])

    return inscription


def get_student_history(student_id: int):
    student = get_object_or_404(Student, pk=student_id)

    inscriptions = (
        Inscription.objects
        .filter(student=student)
        .select_related('enrolled_class__language', 'enrolled_class__level')
        .order_by('-inscription_date')
    )

    return student, inscriptions


def get_student_current(student_id: int) -> Inscription | None:
    student = get_object_or_404(Student, pk=student_id)

    return (
        Inscription.objects
        .filter(student=student, status__in=ACTIVE_STATUSES)
        .select_related('enrolled_class__language', 'enrolled_class__level')
        .order_by('-inscription_date')
        .first()
    )


def _transition_student(student_id: int, new_class_id: int, transition_type: str) -> Inscription:
    from apps.payments.models import Payment

    student   = get_object_or_404(Student, pk=student_id)
    new_class = get_object_or_404(Class, pk=new_class_id)

    if new_class.status != 'active':
        raise ValueError(f'Target class status is "{new_class.status}". Must be active.')

    current = (
        Inscription.objects
        .filter(student=student, status__in=ACTIVE_STATUSES)
        .order_by('-inscription_date')
        .first()
    )

    if not current:
        raise ValueError('No active inscription found. Cannot proceed.')

    if Inscription.objects.filter(student=student, enrolled_class=new_class).exists():
        raise ValueError('Student already has a record in the target class.')

    with transaction.atomic():
        current.status = transition_type
        current.save(update_fields=['status'])

        new_inscription = Inscription.objects.create(
            student=student,
            enrolled_class=new_class,
            status=Inscription.STATUS_CONFIRMED,
        )

        Payment.objects.create(
            inscription=new_inscription,
            amount=0,
            status=Payment.Status.PENDING,
        )

    return current, new_inscription


def promote_student(student_id: int, new_class_id: int):
    return _transition_student(student_id, new_class_id, Inscription.STATUS_PROMOTED)


def repeat_student(student_id: int, new_class_id: int):
    return _transition_student(student_id, new_class_id, Inscription.STATUS_REPEATED)