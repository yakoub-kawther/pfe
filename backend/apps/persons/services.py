# apps/persons/services.py

from django.db import transaction
from django.core.exceptions import ValidationError
from datetime import date

from .models import Person, Student, Parent, ParentStudent, Employee, Teacher


MINOR_AGE_LIMIT = 18


# ──────────────────────────────
# VALIDATION UTILITIES
# ──────────────────────────────

def validate_person_data(data):
    """Ensure phone and email are unique."""
    if Person.objects.filter(phone=data.get('phone')).exists():
        raise ValidationError("Phone number already exists.")
    if data.get('email') and Person.objects.filter(email=data['email']).exists():
        raise ValidationError("Email already exists.")


def calculate_age(birth_date):
    """Calculate age based on birth date."""
    today = date.today()
    return today.year - birth_date.year - ((today.month, today.day) < (birth_date.month, birth_date.day))


def validate_hire_date(data):
    """Ensure hire_date is provided for employees."""
    if not data.get('hire_date'):
        raise ValidationError("Hire date is required.")


# ──────────────────────────────
# PERSON CREATION
# ──────────────────────────────

def create_person(data):
    """Validate and create a Person record."""
    validate_person_data(data)
    return Person.objects.create(
        first_name=data['first_name'],
        last_name=data['last_name'],
        gender=data['gender'],
        phone=data['phone'],
        email=data.get('email'),
        address=data.get('address')
    )


# ──────────────────────────────
# STUDENT CREATION
# ──────────────────────────────

@transaction.atomic
def create_student(data):
    """
    Create a Student record with optional parent linking.
    Accounts and roles are handled by accounts app separately.
    """
    person = create_person(data)

    student = Student(
        person=person,
        date_of_birth=data['date_of_birth'],
        special_case=data.get('special_case')
    )
    student.full_clean()
    student.save()

    age = calculate_age(student.date_of_birth)
    if age < MINOR_AGE_LIMIT:
        parent_id = data.get('parent_id')
        if not parent_id:
            raise ValidationError("Minor students must have a parent linked.")
        parent = Parent.objects.filter(pk=parent_id).first()
        if not parent:
            raise ValidationError("Parent not found.")
        ParentStudent.objects.get_or_create(parent=parent, student=student)

    return student


# ──────────────────────────────
# EMPLOYEE / TEACHER CREATION
# ──────────────────────────────

@transaction.atomic
def create_employee(data):
    """
    Create an Employee record.
    Accounts and roles are handled in the accounts/academic app.
    """
    validate_hire_date(data)
    person = create_person(data)

    employee = Employee.objects.create(
        person=person,
        hire_date=data['hire_date'],
        position_id=data.get('position_id'),  # validation moved to academic service
        status='active'
    )
    return employee


@transaction.atomic
def create_teacher(data):
    """
    Create a Teacher record.
    Employee creation is separated.
    """
    employee = create_employee(data)

    teacher = Teacher(
        employee=employee,
        qualifications=data.get('qualifications'),
        language_id=data.get('language_id'),
        is_head_teacher=data.get('is_head_teacher', False)
    )
    teacher.full_clean()
    teacher.save()
    return teacher


# ──────────────────────────────
# PARENT CREATION
# ──────────────────────────────

@transaction.atomic
def create_parent(data):
    """
    Create a Parent record with optional student linking.
    """
    person = create_person(data)
    parent = Parent(person=person, relationship=data['relationship'])
    parent.full_clean()
    parent.save()

    student_ids = data.get('student_ids', [])
    if student_ids:
        students = Student.objects.filter(pk__in=student_ids)
        if len(students) != len(student_ids):
            raise ValidationError("Some students not found.")
        for student in students:
            ParentStudent.objects.get_or_create(parent=parent, student=student)

    return parent


# ──────────────────────────────
# EMPLOYEE STATUS MANAGEMENT
# ──────────────────────────────

@transaction.atomic
def deactivate_employee(employee_id):
    """
    Deactivate an employee.
    Accounts are managed separately in accounts app.
    """
    employee = Employee.objects.filter(pk=employee_id).first()
    if not employee:
        raise ValidationError("Employee not found.")
    if employee.status == 'inactive':
        raise ValidationError("Employee is already inactive.")

    employee.status = 'inactive'
    employee.end_date = date.today()
    employee.save()
    return employee


# ──────────────────────────────
# HEAD TEACHER PROMOTION / DEMOTION
# ──────────────────────────────

@transaction.atomic
def promote_to_head_teacher(teacher_id):
    teacher = Teacher.objects.filter(pk=teacher_id).first()
    if not teacher:
        raise ValidationError("Teacher not found.")
    if teacher.is_head_teacher:
        raise ValidationError("Teacher is already a head teacher.")

    teacher.is_head_teacher = True
    teacher.save()
    return teacher


@transaction.atomic
def demote_from_head_teacher(teacher_id):
    teacher = Teacher.objects.filter(pk=teacher_id).first()
    if not teacher:
        raise ValidationError("Teacher not found.")
    if not teacher.is_head_teacher:
        raise ValidationError("Teacher is not a head teacher.")

    teacher.is_head_teacher = False
    teacher.save()
    return teacher