from django.db import transaction
from django.shortcuts import get_object_or_404
from django.db.models import Count, Q

from apps.persons.models import Student
from apps.academic.models import Session
from .models import Attendance
from apps.notifications.services import auto_absence_alert


ABSENCE_LIMIT = 0.30  


# ─────────────────────────────────────────
# Core
# ─────────────────────────────────────────

def mark_attendance(session_id: int, student_id: int, status: str) -> Attendance:
    session = get_object_or_404(Session, pk=session_id)
    student = get_object_or_404(Student, pk=student_id)

    if session.status == 'completed':
        raise ValueError("Cannot mark attendance for a completed session.")

    if status not in Attendance.Status.values:
        raise ValueError("Invalid attendance status")

    class_obj = session.schedule.class_obj

    is_enrolled = student.inscription.filter(
        enrolled_class=class_obj,
        status='confirmed'
    ).exists()

    if not is_enrolled:
        raise ValueError("Student is not enrolled in this class.")

    if Attendance.objects.filter(session=session, student=student).exists():
        raise ValueError("Attendance already marked for this student.")

    return Attendance.objects.create(
        session=session,
        student=student,
        status=status,
    )


def get_class_attendance_summary(class_id: int):
    return (
        Student.objects
        .filter(
            inscription__enrolled_class__id=class_id,
            inscription__status='confirmed'
        )
        .annotate(
            total=Count('attendances', filter=Q(
                attendances__session__schedule__class_obj__id=class_id
            )),
            absences=Count('attendances', filter=Q(
                attendances__status=Attendance.Status.ABSENT,
                attendances__session__schedule__class_obj__id=class_id
            )),
            present=Count('attendances', filter=Q(
                attendances__status=Attendance.Status.PRESENT,
                attendances__session__schedule__class_obj__id=class_id
            )),
        )
    )

@transaction.atomic
def bulk_mark_attendance(session_id: int, attendance_list: list) -> list:
    session = get_object_or_404(Session, pk=session_id)

    if session.status == 'completed':
        raise ValueError("Cannot mark attendance for a completed session.")

    class_obj = session.schedule.class_obj
    student_ids = [item['student_id'] for item in attendance_list]

    students = {
        s.pk: s for s in Student.objects.filter(pk__in=student_ids).select_related('person')
    }

    enrolled_ids = set(
        Student.objects.filter(
            pk__in=student_ids,
            inscription__enrolled_class=class_obj,
            inscription__status='confirmed'
        ).values_list('pk', flat=True)
    )

    records = []
    for item in attendance_list:
        student = students.get(item['student_id'])

        if not student:
            raise ValueError(f"Student {item['student_id']} not found")

        if item['status'] not in Attendance.Status.values:
            raise ValueError(f"Invalid status for student {student.pk}")

        if student.pk not in enrolled_ids:
            raise ValueError(f"Student {student.pk} is not enrolled in this class.")

        records.append(Attendance(
            session=session,
            student=student,
            status=item['status'],
        ))

    created = []
    for record in records:
        obj, _ = Attendance.objects.update_or_create(
            session=record.session,
            student=record.student,
            defaults={'status': record.status},
        )
        created.append(obj)  # ← inside the loop

    from apps.academic.services import complete_session
    complete_session(session)

    for student_id in student_ids:
        check_absence_alert(student_id, class_obj.id)

    return created
# ─────────────────────────────────────────
# Queries
# ─────────────────────────────────────────

def get_session_attendance(session_id: int):
    return (
        Attendance.objects
        .filter(session_id=session_id)
        .select_related('student')
    )


def get_student_attendance(student_id: int, class_id: int):
    return (
        Attendance.objects
        .filter(
            student_id=student_id,
            session__schedule__class_obj__id=class_id
        )
        .select_related('session')
        .order_by('session__session_date')
    )


def get_class_attendance_summary(class_id: int):
    return (
        Student.objects
        .filter(
            inscription__enrolled_class__id=class_id,
            inscription__status='confirmed'
        )
        .annotate(
            total=Count('attendances', filter=Q(
                attendances__session__schedule__class_obj__id=class_id
            )),
            absences=Count('attendances', filter=Q(
                attendances__status=Attendance.Status.ABSENT,
                attendances__session__schedule__class_obj__id=class_id
            )),
            present=Count('attendances', filter=Q(
                attendances__status=Attendance.Status.PRESENT,
                attendances__session__schedule__class_obj__id=class_id
            )),
        )
    )

def get_absent_students(session_id: int):
    return (
        Attendance.objects
        .filter(session_id=session_id, status=Attendance.Status.ABSENT)
        .select_related('student')
    )


# ─────────────────────────────────────────
# Absence tracking
# ─────────────────────────────────────────

def calculate_absence_rate(student_id: int, class_id: int) -> float:
    stats = Attendance.objects.filter(
        student_id=student_id,
        session__schedule__class_obj__id=class_id
    ).aggregate(
        total=Count('id'),
        absences=Count('id', filter=Q(status=Attendance.Status.ABSENT))
    )

    if stats['total'] == 0:
        return 0.0

    return round((stats['absences'] / stats['total']) * 100, 1)


def check_absence_alert(student_id: int, class_id: int) -> None:
    rate = calculate_absence_rate(student_id, class_id)

    if rate >= ABSENCE_LIMIT * 100:
        auto_absence_alert(student_id)


def update_attendance(attendance_id: int, status: str) -> Attendance:
    if status not in Attendance.Status.values:
        raise ValueError("Invalid attendance status")

    attendance = get_object_or_404(Attendance, pk=attendance_id)
    attendance.status = status
    attendance.save(update_fields=['status'])

    return attendance


