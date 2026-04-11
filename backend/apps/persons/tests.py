# apps/persons/tests.py

from datetime import date, timedelta

from django.test import TestCase
from rest_framework import status
from rest_framework.test import APITestCase

from apps.academic.models import Language, Position
from .models import Parent, ParentStudent, Person, Student, Employee, Teacher


# ─────────────────────────────────────────────
#  URLs
# ─────────────────────────────────────────────

STUDENTS_URL  = "/api/persons/students/"
PARENTS_URL   = "/api/persons/parents/"
EMPLOYEES_URL = "/api/persons/employees/"
TEACHERS_URL  = "/api/persons/teachers/"

ADULT_DOB = str(date.today() - timedelta(days=365 * 20))
MINOR_DOB = str(date.today() - timedelta(days=365 * 10))


# ═══════════════════════════════════════════════════════
#  STUDENT TESTS
# ═══════════════════════════════════════════════════════

class StudentCreateTests(APITestCase):

    def _base_student(self, overrides=None):
        data = {
            "first_name"   : "Ali",
            "last_name"    : "Benali",
            "gender"       : "male",
            "phone"        : "0551000001",
            "email"        : "ali@example.com",
            "date_of_birth": ADULT_DOB,
        }
        if overrides:
            data.update(overrides)
        return data

    def _base_parent(self, overrides=None):
        data = {
            "first_name"  : "Omar",
            "last_name"   : "Benali",
            "gender"      : "male",
            "phone"       : "0551999001",
            "email"       : "parent@example.com",
            "relationship": "father",
        }
        if overrides:
            data.update(overrides)
        return data

    def test_create_adult_student_without_parent(self):
        response = self.client.post(STUDENTS_URL, self._base_student(), format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(Student.objects.filter(person__phone="0551000001").exists())

    def test_create_minor_student_with_parent(self):
        # Create parent first
        parent_resp = self.client.post(PARENTS_URL, self._base_parent(), format="json")
        self.assertEqual(parent_resp.status_code, status.HTTP_201_CREATED)

        # Get parent pk correctly
        parent_id = parent_resp.data["person"]["id"]

        # Create minor student
        data = self._base_student({
            "phone"        : "0551000002",
            "email"        : "minor@example.com",
            "date_of_birth": MINOR_DOB,
            "parent_id"    : parent_id,
        })
        response = self.client.post(STUDENTS_URL, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        # ParentStudent link must exist
        self.assertTrue(
            ParentStudent.objects.filter(parent_id=parent_id).exists()
        )

    def test_create_student_with_optional_fields(self):
        data = self._base_student({
            "phone"       : "0551000003",
            "email"       : "sc@example.com",
            "special_case": "Hearing impaired",
            "address"     : "123 Rue Didouche",
        })
        response = self.client.post(STUDENTS_URL, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        student = Student.objects.get(person__phone="0551000003")
        self.assertEqual(student.special_case, "Hearing impaired")

    def test_create_minor_student_without_parent_fails(self):
        data = self._base_student({
            "phone"        : "0551000004",
            "email"        : "nop@example.com",
            "date_of_birth": MINOR_DOB,
        })
        response = self.client.post(STUDENTS_URL, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("parent_id", str(response.data))

    def test_create_student_duplicate_phone_fails(self):
        self.client.post(STUDENTS_URL, self._base_student(), format="json")
        dupe = self._base_student({"email": "other@example.com"})
        response = self.client.post(STUDENTS_URL, dupe, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("phone", str(response.data))

    def test_create_student_duplicate_email_fails(self):
        self.client.post(STUDENTS_URL, self._base_student(), format="json")
        dupe = self._base_student({"phone": "0551000005"})
        response = self.client.post(STUDENTS_URL, dupe, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("email", str(response.data))

    def test_create_student_future_dob_fails(self):
        data = self._base_student({
            "phone"        : "0551000006",
            "email"        : "future@example.com",
            "date_of_birth": str(date.today() + timedelta(days=1)),
        })
        response = self.client.post(STUDENTS_URL, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("date_of_birth", str(response.data))

    def test_create_student_missing_required_fields_fails(self):
        response = self.client.post(STUDENTS_URL, {}, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        for field in ("first_name", "last_name", "gender", "date_of_birth"):
            self.assertIn(field, str(response.data))

    def test_create_student_invalid_gender_fails(self):
        data = self._base_student({
            "phone" : "0551000007",
            "email" : "g@e.com",
            "gender": "robot"
        })
        response = self.client.post(STUDENTS_URL, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("gender", str(response.data))


class StudentListRetrieveTests(APITestCase):

    def setUp(self):
        person = Person.objects.create(
            first_name="Yacine", last_name="K",
            gender="male", phone="0600000001"
        )
        self.student = Student.objects.create(
            person=person, date_of_birth=date(2000, 1, 1)
        )

    def test_list_students(self):
        response = self.client.get(STUDENTS_URL)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(response.data), 1)

    def test_retrieve_student(self):
        response = self.client.get(f"{STUDENTS_URL}{self.student.pk}/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["person"]["first_name"], "Yacine")

    def test_retrieve_nonexistent_student_returns_404(self):
        response = self.client.get(f"{STUDENTS_URL}99999/")
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)


class StudentUpdateTests(APITestCase):

    def setUp(self):
        person = Person.objects.create(
            first_name="Lina", last_name="B", gender="female",
            phone="0600000010", email="lina@example.com"
        )
        self.student = Student.objects.create(
            person=person, date_of_birth=date(2000, 6, 15)
        )

    def test_partial_update_special_case(self):
        response = self.client.patch(
            f"{STUDENTS_URL}{self.student.pk}/",
            {"special_case": "Dyslexia"},
            format="json"
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.student.refresh_from_db()
        self.assertEqual(self.student.special_case, "Dyslexia")

    def test_partial_update_phone(self):
        response = self.client.patch(
            f"{STUDENTS_URL}{self.student.pk}/",
            {"phone": "0600000099"},
            format="json"
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.student.person.refresh_from_db()
        self.assertEqual(self.student.person.phone, "0600000099")


# ═══════════════════════════════════════════════════════
#  PARENT TESTS
# ═══════════════════════════════════════════════════════

class ParentCreateTests(APITestCase):

    def _base_parent(self, overrides=None):
        data = {
            "first_name"  : "Fatima",
            "last_name"   : "Bouzid",
            "gender"      : "female",
            "phone"       : "0661000001",
            "email"       : "fatima@example.com",
            "relationship": "mother",
        }
        if overrides:
            data.update(overrides)
        return data

    def test_create_parent_success(self):
        response = self.client.post(PARENTS_URL, self._base_parent(), format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(Parent.objects.filter(person__phone="0661000001").exists())

    def test_create_parent_with_existing_students(self):
        person  = Person.objects.create(
            first_name="S", last_name="S",
            gender="male", phone="0600000020"
        )
        student = Student.objects.create(
            person=person, date_of_birth=date(2010, 1, 1)
        )
        data = self._base_parent({"student_ids": [student.pk]})
        response = self.client.post(PARENTS_URL, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(ParentStudent.objects.filter(student=student).exists())

    def test_create_parent_invalid_relationship_fails(self):
        data = self._base_parent({"relationship": "uncle"})
        response = self.client.post(PARENTS_URL, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("relationship", str(response.data))

    def test_create_parent_missing_relationship_fails(self):
        data = self._base_parent()
        data.pop("relationship")
        response = self.client.post(PARENTS_URL, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("relationship", str(response.data))

    def test_create_parent_duplicate_phone_fails(self):
        self.client.post(PARENTS_URL, self._base_parent(), format="json")
        dupe = self._base_parent({"email": "other2@example.com"})
        response = self.client.post(PARENTS_URL, dupe, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("phone", str(response.data))

    def test_create_parent_invalid_student_ids_fails(self):
        # student_ids (plural) with invalid id should fail
        data = self._base_parent({"student_ids": [59999999]})
        response = self.client.post(PARENTS_URL, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class ParentListRetrieveTests(APITestCase):

    def setUp(self):
        person = Person.objects.create(
            first_name="Djamel", last_name="A",
            gender="male", phone="0662000001"
        )
        self.parent = Parent.objects.create(
            person=person, relationship="father"
        )

    def test_list_parents(self):
        response = self.client.get(PARENTS_URL)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(response.data), 1)

    def test_retrieve_parent(self):
        response = self.client.get(f"{PARENTS_URL}{self.parent.pk}/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["relationship"], "father")

    def test_retrieve_nonexistent_parent_returns_404(self):
        response = self.client.get(f"{PARENTS_URL}99999/")
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)


# ═══════════════════════════════════════════════════════
#  EMPLOYEE TESTS
# ═══════════════════════════════════════════════════════

class EmployeeCreateTests(APITestCase):

    def setUp(self):
        self.position = Position.objects.create(name="Administrator")

    def _base_employee(self, overrides=None):
        data = {
            "first_name" : "Karim",
            "last_name"  : "Hadj",
            "gender"     : "male",
            "phone"      : "0771000001",
            "email"      : "karim@example.com",
            "hire_date"  : str(date.today() - timedelta(days=30)),
            "position_id": self.position.pk,
        }
        if overrides:
            data.update(overrides)
        return data

    def test_create_employee_success(self):
        response = self.client.post(EMPLOYEES_URL, self._base_employee(), format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(Employee.objects.filter(person__phone="0771000001").exists())

    def test_created_employee_is_active(self):
        data = self._base_employee({"phone": "0771000099", "email": "karim2@example.com"})
        response = self.client.post(EMPLOYEES_URL, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        employee = Employee.objects.get(person__phone="0771000099")
        self.assertEqual(employee.status, "active")

    def test_create_employee_future_hire_date_fails(self):
        data = self._base_employee({
            "hire_date": str(date.today() + timedelta(days=1))
        })
        response = self.client.post(EMPLOYEES_URL, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("hire_date", str(response.data))

    def test_create_employee_invalid_position_fails(self):
        data = self._base_employee({"position_id": 99999})
        response = self.client.post(EMPLOYEES_URL, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("position_id", str(response.data))

    def test_create_employee_missing_hire_date_fails(self):
        data = self._base_employee()
        data.pop("hire_date")
        response = self.client.post(EMPLOYEES_URL, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("hire_date", str(response.data))

    def test_create_employee_duplicate_phone_fails(self):
        self.client.post(EMPLOYEES_URL, self._base_employee(), format="json")
        dupe = self._base_employee({"email": "other3@example.com"})
        response = self.client.post(EMPLOYEES_URL, dupe, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("phone", str(response.data))


class EmployeeListRetrieveTests(APITestCase):

    def setUp(self):
        position = Position.objects.create(name="Clerk")
        person   = Person.objects.create(
            first_name="Nour", last_name="D",
            gender="female", phone="0771000010"
        )
        self.employee = Employee.objects.create(
            person=person, hire_date=date(2022, 1, 1),
            position=position, status="active"
        )

    def test_list_employees(self):
        response = self.client.get(EMPLOYEES_URL)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(response.data), 1)

    def test_retrieve_employee(self):
        response = self.client.get(f"{EMPLOYEES_URL}{self.employee.pk}/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["person"]["first_name"], "Nour")

    def test_retrieve_nonexistent_employee_returns_404(self):
        response = self.client.get(f"{EMPLOYEES_URL}99999/")
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)


# ═══════════════════════════════════════════════════════
#  TEACHER TESTS
# ═══════════════════════════════════════════════════════

class TeacherCreateTests(APITestCase):

    def setUp(self):
        self.position = Position.objects.create(name="Teacher Position")
        self.language = Language.objects.create(
            language_name="Arabic", shortcut="AR"
        )

    def _base_teacher(self, overrides=None):
        data = {
            "first_name" : "Sara",
            "last_name"  : "Amrani",
            "gender"     : "female",
            "phone"      : "0881000001",
            "email"      : "sara@example.com",
            "hire_date"  : str(date.today() - timedelta(days=60)),
            "position_id": self.position.pk,
            "language_id": self.language.pk,
        }
        if overrides:
            data.update(overrides)
        return data

    def test_create_teacher_minimal(self):
        response = self.client.post(TEACHERS_URL, self._base_teacher(), format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(Teacher.objects.filter(
            employee__person__phone="0881000001"
        ).exists())

    def test_create_teacher_with_language(self):
        data = self._base_teacher({
            "phone"      : "0881000002",
            "email"      : "sara2@example.com",
            "language_id": self.language.pk,
        })
        response = self.client.post(TEACHERS_URL, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        teacher = Teacher.objects.get(employee__person__phone="0881000002")
        self.assertEqual(teacher.language_id, self.language.pk)

    def test_create_teacher_with_qualifications(self):
        data = self._base_teacher({
            "phone"         : "0881000003",
            "email"         : "sara3@example.com",
            "qualifications": "MSc in Mathematics",
        })
        response = self.client.post(TEACHERS_URL, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        teacher = Teacher.objects.get(employee__person__phone="0881000003")
        self.assertEqual(teacher.qualifications, "MSc in Mathematics")

    def test_create_teacher_is_not_head_by_default(self):
        response = self.client.post(TEACHERS_URL, self._base_teacher(), format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        teacher = Teacher.objects.get(employee__person__phone="0881000001")
        self.assertFalse(teacher.is_head_teacher)

    def test_create_teacher_invalid_language_fails(self):
        data = self._base_teacher({"language_id": 99999})
        response = self.client.post(TEACHERS_URL, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("language_id", str(response.data))

    def test_create_teacher_future_hire_date_fails(self):
        data = self._base_teacher({
            "hire_date": str(date.today() + timedelta(days=5))
        })
        response = self.client.post(TEACHERS_URL, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("hire_date", str(response.data))


class TeacherListRetrieveTests(APITestCase):

    def setUp(self):
        position = Position.objects.create(name="Senior Teacher")
        person   = Person.objects.create(
            first_name="Riad", last_name="M",
            gender="male", phone="0881000010"
        )
        employee = Employee.objects.create(
            person=person, hire_date=date(2020, 9, 1),
            position=position, status="active"
        )
        self.teacher = Teacher.objects.create(
            employee=employee,
            language=Language.objects.create(
                language_name="English", shortcut="EN"
            )
        )

    def test_list_teachers(self):
        response = self.client.get(TEACHERS_URL)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(response.data), 1)

    def test_retrieve_teacher(self):
        response = self.client.get(f"{TEACHERS_URL}{self.teacher.pk}/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(
            response.data["employee"]["person"]["first_name"], "Riad"
        )

    def test_retrieve_nonexistent_teacher_returns_404(self):
        response = self.client.get(f"{TEACHERS_URL}99999/")
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)


# ═══════════════════════════════════════════════════════
#  SERVICE UNIT TESTS
# ═══════════════════════════════════════════════════════

class CreateStudentServiceTests(TestCase):

    def test_creates_person_and_student(self):
        from .services import create_student
        student = create_student({
            "first_name"   : "Unit",
            "last_name"    : "Test",
            "gender"       : "male",
            "phone"        : "0900000001",
            "date_of_birth": date(2000, 1, 1),
        })
        self.assertIsInstance(student, Student)
        self.assertEqual(student.person.phone, "0900000001")

    def test_links_parent_when_parent_id_given(self):
        from .services import create_student, create_parent
        parent = create_parent({
            "first_name"  : "P",
            "last_name"   : "P",
            "gender"      : "male",
            "phone"       : "0900000002",
            "relationship": "father",
        })
        student = create_student({
            "first_name"   : "C",
            "last_name"    : "C",
            "gender"       : "male",
            "phone"        : "0900000003",
            "date_of_birth": date(2015, 6, 1),
            "parent_id"    : parent.pk,
        })
        self.assertTrue(
            ParentStudent.objects.filter(
                parent=parent, student=student
            ).exists()
        )

    def test_no_parent_link_when_parent_id_missing(self):
        from .services import create_student
        student = create_student({
            "first_name"   : "A",
            "last_name"    : "B",
            "gender"       : "female",
            "phone"        : "0900000004",
            "date_of_birth": date(2000, 3, 3),
        })
        self.assertFalse(ParentStudent.objects.filter(student=student).exists())


class CreateParentServiceTests(TestCase):

    def test_creates_person_and_parent(self):
        from .services import create_parent
        parent = create_parent({
            "first_name"  : "P1",
            "last_name"   : "L",
            "gender"      : "female",
            "phone"       : "0900000010",
            "relationship": "mother",
        })
        self.assertIsInstance(parent, Parent)
        self.assertEqual(parent.relationship, "mother")

    def test_links_students_on_create(self):
        from .services import create_parent
        person  = Person.objects.create(
            first_name="S", last_name="S",
            gender="male", phone="0900000011"
        )
        student = Student.objects.create(
            person=person, date_of_birth=date(2012, 1, 1)
        )
        parent = create_parent({
            "first_name"  : "P2",
            "last_name"   : "L",
            "gender"      : "male",
            "phone"       : "0900000012",
            "relationship": "father",
            "student_ids" : [student.pk],
        })
        self.assertTrue(
            ParentStudent.objects.filter(
                parent=parent, student=student
            ).exists()
        )


class CreateEmployeeServiceTests(TestCase):

    def test_creates_person_and_employee(self):
        from .services import create_employee
        position = Position.objects.create(name="Accountant")
        employee = create_employee({
            "first_name" : "E",
            "last_name"  : "E",
            "gender"     : "male",
            "phone"      : "0900000020",
            "hire_date"  : date(2023, 1, 1),
            "position_id": position.pk,
        })
        self.assertIsInstance(employee, Employee)
        self.assertEqual(employee.status, "active")

    def test_employee_end_date_is_null_on_create(self):
        from .services import create_employee
        position = Position.objects.create(name="Librarian")
        employee = create_employee({
            "first_name" : "F",
            "last_name"  : "F",
            "gender"     : "female",
            "phone"      : "0900000021",
            "hire_date"  : date(2023, 5, 1),
            "position_id": position.pk,
        })
        self.assertIsNone(employee.end_date)


class DeactivateEmployeeServiceTests(TestCase):

    def setUp(self):
        from .services import create_employee
        position     = Position.objects.create(name="Staff")
        self.employee = create_employee({
            "first_name" : "G",
            "last_name"  : "G",
            "gender"     : "male",
            "phone"      : "0900000030",
            "hire_date"  : date(2020, 1, 1),
            "position_id": position.pk,
        })

    def test_deactivate_sets_status_and_end_date(self):
        from .services import deactivate_employee
        deactivate_employee(self.employee.pk)
        self.employee.refresh_from_db()
        self.assertEqual(self.employee.status, "inactive")
        self.assertEqual(self.employee.end_date, date.today())

    def test_deactivate_already_inactive_raises(self):
        from django.core.exceptions import ValidationError
        from .services import deactivate_employee
        deactivate_employee(self.employee.pk)
        with self.assertRaises(ValidationError):
            deactivate_employee(self.employee.pk)

    def test_deactivate_nonexistent_raises(self):
        from django.core.exceptions import ValidationError
        from .services import deactivate_employee
        with self.assertRaises(ValidationError):
            deactivate_employee(99999)


class HeadTeacherServiceTests(TestCase):

    def setUp(self):
        from .services import create_teacher
        position     = Position.objects.create(name="Math Teacher")
        language     = Language.objects.create(
            language_name="French", shortcut="FR"
        )
        self.teacher = create_teacher({
            "first_name" : "H",
            "last_name"  : "H",
            "gender"     : "male",
            "phone"      : "0900000040",
            "hire_date"  : date(2021, 9, 1),
            "position_id": position.pk,
            "language_id": language.pk,
        })

    def test_promote_to_head_teacher(self):
        from .services import promote_to_head_teacher
        promote_to_head_teacher(self.teacher.pk)
        self.teacher.refresh_from_db()
        self.assertTrue(self.teacher.is_head_teacher)

    def test_promote_already_head_raises(self):
        from django.core.exceptions import ValidationError
        from .services import promote_to_head_teacher
        promote_to_head_teacher(self.teacher.pk)
        with self.assertRaises(ValidationError):
            promote_to_head_teacher(self.teacher.pk)

    def test_demote_from_head_teacher(self):
        from .services import promote_to_head_teacher, demote_from_head_teacher
        promote_to_head_teacher(self.teacher.pk)
        demote_from_head_teacher(self.teacher.pk)
        self.teacher.refresh_from_db()
        self.assertFalse(self.teacher.is_head_teacher)

    def test_demote_non_head_raises(self):
        from django.core.exceptions import ValidationError
        from .services import demote_from_head_teacher
        with self.assertRaises(ValidationError):
            demote_from_head_teacher(self.teacher.pk)

    def test_promote_nonexistent_teacher_raises(self):
        from django.core.exceptions import ValidationError
        from .services import promote_to_head_teacher
        with self.assertRaises(ValidationError):
            promote_to_head_teacher(99999)