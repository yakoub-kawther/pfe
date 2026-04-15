from django.test import TestCase


# Create your tests here.

from django.core.exceptions import ValidationError
from datetime import date, timedelta

from apps.academic.models import Language, Position
from .services import (
    create_person, create_student, create_teacher, create_parent,
    deactivate_employee, promote_to_head_teacher, demote_from_head_teacher
)
from .models import Person, Student, Teacher, Parent, Employee, ParentStudent


class PersonServicesTestCase(TestCase):

    def setUp(self):
        
        self.person_data = {
            'first_name': 'Aymen',
            'last_name': 'Kawther',
            'gender': 'male',
            'phone': '0555555555',
            'email': 'aymen@example.com',
            'address': '123 Street'
        }

        
        self.student_data = {
            **self.person_data, #○to avoid repetition
            'date_of_birth': date.today() - timedelta(days=365*20),  # 20 years old
            'special_case': None,
        }

        
        self.position = Position.objects.create(name='Math Teacher') # obj to get pk
        self.language = Language.objects.create(language_name='English')

        # Teacher data
        self.teacher_data = {
            **self.person_data,
            'hire_date': date.today(),
            'position_id': self.position.pk,
            'qualifications': 'Math',
            'language_id': self.language.pk,
            'is_head_teacher': False
        }

        # recreate parent data to avoid phone conflict with student
        self.parent_data = {
             'first_name' : 'Mohammed',
             'last_name'  : 'Benali',
             'gender'     : 'male',
             'phone'      : '0666666666',  # ← different phone
             'email'      : 'parent@example.com',
             'address'    : '456 Street',
             'relationship': 'father'
        }

    
    def test_create_person_success(self):
        person = create_person(self.person_data)
        self.assertIsInstance(person, Person)
        self.assertEqual(person.first_name, 'Aymen')

    def same_phone(self):
        create_person(self.person_data)
        with self.assertRaises(ValidationError):
            create_person(self.person_data)  

    
    def test_create_student_success(self):
        student = create_student(self.student_data)
        self.assertIsInstance(student, Student)
        self.assertEqual(student.date_of_birth, self.student_data['date_of_birth'])

    def test_create_minor_student_without_parent(self):
     data = {
        **self.student_data,
        'phone': '0777777777',
        'email': 'minor@example.com',
        'date_of_birth': date.today() - timedelta(days=365 * 10),  # 10 years old
        # no parent_id
     }
     data.pop('special_case')
     response = self.client.post('/api/persons/students/', data, format='json')
     self.assertEqual(response.status_code, 400)
     self.assertIn('parent_id', response.data)

    def test_create_minor_student_with_parent(self):
        # Create parent
        parent = create_parent(self.parent_data)

        # Minor student data
        data = self.student_data.copy()
        data['date_of_birth'] = date.today() - timedelta(days=365*10)  # 10 years old
        data['parent_id'] = parent.person_id
        student = create_student(data)

        self.assertIsInstance(student, Student)
        self.assertTrue(
        ParentStudent.objects.filter(
            parent=parent,
            student=student
        ).exists()
        )
        

    
    def test_create_parent_success(self):
        parent = create_parent(self.parent_data)
        self.assertIsInstance(parent, Parent)

    
    def test_create_teacher_success(self):
        teacher = create_teacher(self.teacher_data)
        self.assertIsInstance(teacher, Teacher)
        self.assertFalse(teacher.is_head_teacher)

    
    def test_promote_and_demote_teacher(self):
        teacher = create_teacher(self.teacher_data)
        promote_to_head_teacher(teacher.employee_id)
        teacher.refresh_from_db()
        self.assertTrue(teacher.is_head_teacher)
        demote_from_head_teacher(teacher.employee_id)
        teacher.refresh_from_db()
        self.assertFalse(teacher.is_head_teacher)

    
    def test_deactivate_employee(self):
        teacher = create_teacher(self.teacher_data)
        employee = teacher.employee
        deactivate_employee(employee.person_id)
        employee.refresh_from_db()
        self.assertEqual(employee.status, 'inactive')

