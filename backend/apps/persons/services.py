# apps/persons/services.py

from django.db import transaction
from rest_framework.exceptions import ValidationError
from datetime import date

from .models import Person, Student, Parent,  Employee, Teacher




def create_person(data):
    
    
    return Person.objects.create(
        first_name=data['first_name'],
        last_name=data['last_name'],
        gender=data['gender'],
        phone=data['phone'],
        email=data.get('email'),
        address=data.get('address')
    )


@transaction.atomic
def update_person(person, data):
    person.first_name = data.get('first_name', person.first_name)
    person.last_name = data.get('last_name', person.last_name)
    person.gender = data.get('gender', person.gender)
    person.phone = data.get('phone', person.phone)
    person.email = data.get('email', person.email)
    person.address = data.get('address', person.address)
    person.save()
    return person



@transaction.atomic
def create_student(data):
    
    
    parent_id = data.get('parent_id')
    parent = Parent.objects.filter(pk=parent_id).first() if parent_id else None

    person = create_person(data)

    student = Student(
        person        = person,
        date_of_birth = data['date_of_birth'],
        special_case  = data.get('special_case'),
        parent        = parent,
    )
    student.full_clean()
    student.save()

    return student


@transaction.atomic
def update_student(student, data):
    update_person(student.person, data)

    student.date_of_birth = data.get('date_of_birth', student.date_of_birth)
    student.special_case  = data.get('special_case',  student.special_case)

    if 'parent_id' in data:
        parent_id      = data['parent_id']
        student.parent = Parent.objects.filter(pk=parent_id).first() if parent_id else None

    student.full_clean()
    student.save()
    return student


from apps.accounts.services import create_account  

POSITION_ROLE_MAP = {
    'secretary': 'admin',
    'manager':   'superadmin',
}

@transaction.atomic
def create_employee(data):
    person   = create_person(data)
    employee = Employee.objects.create(
        person=person,
        hire_date=data.get('hire_date'),
        position_id=data.get('position_id'),
        status=data.get('status', 'active'),
    )

    # ── Auto-create account if position requires it ──
    position_name = employee.position.name.lower()
    role          = POSITION_ROLE_MAP.get(position_name)

    if role:
        username = data.get('username')
        password = data.get('password')

        if not username or not password:
            raise ValidationError({
                'username': 'Username and password are required for this position.'
            })

        create_account(
            person=employee,       
            role_name=role,
            username=username,
            raw_password=password,
        )

    return employee

@transaction.atomic
def update_employee(employee, data):
    person = update_person(employee.person, data)

    old_position_name = employee.position.name.lower() if employee.position else None

    # Update employee fields
    employee.hire_date   = data.get('hire_date',    employee.hire_date)
    employee.status      = data.get('status',       employee.status)
    if 'position_id' in data:
        employee.position_id = data['position_id']
    employee.save()

    new_position_name = employee.position.name.lower() if employee.position else None
    new_role          = POSITION_ROLE_MAP.get(new_position_name)
    old_role          = POSITION_ROLE_MAP.get(old_position_name)

    from apps.accounts.models import Account

    existing_account = Account.objects.filter(employee=employee).first()

    if new_role:
        username = data.get('username')
        password = data.get('password')

        if existing_account:
            
            if username:
                existing_account.username = username
            if password:
                from django.contrib.auth.hashers import make_password
                existing_account.password_hash = make_password(password)
            # Update role if position changed
            if old_role != new_role:
                from apps.accounts.models import Role
                existing_account.role = Role.objects.get(name=new_role)
            existing_account.save()
        else:
            
            if not username or not password:
                raise ValidationError({
                    'username': 'Username and password are required for this position.'
                })
            create_account(
                person=employee,
                role_name=new_role,
                username=username,
                raw_password=password,
            )
    else:
        #
        if existing_account:
            existing_account.delete()

    return employee


@transaction.atomic
def create_teacher(data):
    
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


@transaction.atomic
def update_teacher(teacher, data):
    employee = update_employee(teacher.employee, data)

    teacher.qualifications = data.get('qualifications', teacher.qualifications)
    teacher.language_id = data.get('language_id', teacher.language_id)
    teacher.is_head_teacher = data.get('is_head_teacher', teacher.is_head_teacher)
    teacher.save()
    return teacher


@transaction.atomic
def create_parent(data):
    
    person = create_person(data)
    parent = Parent(person=person, relationship=data['relationship'])
    parent.full_clean()
    parent.save()

    student_ids = data.get('student_ids', [])
    if student_ids:
        students = Student.objects.filter(pk__in=student_ids)
        if len(students) != len(student_ids):
            raise ValidationError("Some students not found.")
        # for student in students:
        #     ParentStudent.objects.get_or_create(parent=parent, student=student)

    return parent

@transaction.atomic
def update_parent(parent, data):
    update_person(parent.person, data)

    parent.relationship = data.get('relationship', parent.relationship)
    parent.save()

    student_ids = data.get('student_ids')
    if student_ids is not None:
        students = Student.objects.filter(pk__in=student_ids)
        if len(students) != len(student_ids):
            raise ValidationError("Some students not found.")
        # Update each student's parent FK
        Student.objects.filter(pk__in=student_ids).update(parent=parent)

    return parent



@transaction.atomic
def deactivate_employee(employee_id):
    
    employee = Employee.objects.filter(pk=employee_id).first()
    if not employee:
        raise ValidationError("Employee not found.")
    if employee.status == 'inactive':
        raise ValidationError("Employee is already inactive.")

    employee.status = 'inactive'
    employee.end_date = date.today()
    employee.save()
    return employee


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



