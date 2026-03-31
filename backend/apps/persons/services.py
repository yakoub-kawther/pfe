# apps/persons/services.py

from django.db import transaction
from django.core.exceptions import ValidationError
from datetime import date

from .models import Person, Student, Parent, ParentStudent, Employee, Teacher














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
def create_student(data):
    
    person = create_person(data)

    student = Student(
        person=person,
        date_of_birth=data['date_of_birth'],
        special_case=data.get('special_case')
    )
    student.full_clean()
    student.save()

    #link the parent 
    parent_id = data.get('parent_id')
    if parent_id:
        parent = Parent.objects.filter(pk=parent_id).first()
        if parent:
            ParentStudent.objects.get_or_create(
                parent  = parent,
                student = student
            )
    
    return student



@transaction.atomic
def create_employee(data):
    
    
    person = create_person(data)

    employee = Employee.objects.create(
        person=person,
        hire_date=data['hire_date'],
        position_id=data.get('position_id'),  #
        status='active'
    )
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
        for student in students:
            ParentStudent.objects.get_or_create(parent=parent, student=student)

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