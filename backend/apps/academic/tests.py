from django.test import TestCase
from rest_framework.test import APIClient
from datetime import date
 
from apps.persons.models import Person, Employee, Teacher
from apps.academic.models import Language, Level, Classroom, Class, Schedule , Position
 
 
class ScheduleTest(TestCase):
 
    def setUp(self):
        self.client = APIClient()
 
        # ── Create Person ──
        person = Person.objects.create(
            first_name = "Alice",
            last_name  = "Martin",
            gender     = "female",
            phone      = "0555123456"
        )
 
        # ── Create Position ──
        position = Position.objects.create(name="teacher")
 
        # ── Create Employee ──
        employee = Employee.objects.create(
            person    = person,
            hire_date = date(2024, 1, 1),
            position  = position,
            status    = "active"
        )
 
        # ── Create Teacher ──
        self.teacher = Teacher.objects.create(
            employee = employee
        )
 
        # ── Create Language ──
        language = Language.objects.create(
            language_name = "English",
            shortcut      = "EN"
        )
 
        # ── Create Level ──
        level = Level.objects.create(
            level_name = "B2"
        )
 
        # ── Create Classroom ──
        self.classroom = Classroom.objects.create(
            name     = "Room 101",
            capacity = 20
        )
 
        # ── Create Class 1 (to schedule) ──
        self.class1 = Class.objects.create(
            name       = "English B2 Group A",
            teacher    = self.teacher,
            language   = language,
            level      = level,
            status     = 'active',
            start_date = date(2026, 1, 1),
        )
 
        # ── Create Class 2 (same teacher, already scheduled) ──
        self.class2 = Class.objects.create(
            name       = "English B2 Group B",
            teacher    = self.teacher,
            language   = language,
            level      = level,
            status     = 'active',
            start_date = date(2026, 1, 1),
        )
 
        # ── Pre-existing conflicting schedule ──
        Schedule.objects.create(
            class_obj   = self.class2,
            classroom   = self.classroom,
            day_of_week = 'friday',
            start_time  = '11:00',
            end_time    = '13:00',
        )
 
    # ──────────────────────────────
    # VALID SCHEDULE
    # ──────────────────────────────
 
    def test_valid_schedule(self):
        """Test creating a valid schedule with no conflicts."""
        response = self.client.post("/api/academic/schedules/", {
            "class_obj"  : self.class1.pk,
            "classroom"  : self.classroom.pk,
            "day_of_week": "friday",
            "start_time" : "09:00:00",
            "end_time"   : "11:00:00"
        }, format='json')
        self.assertEqual(response.status_code, 201)
 
    # ──────────────────────────────
    # TEACHER CONFLICT
    # ──────────────────────────────
 
    def test_conflict(self):
        """Test that teacher conflict returns 400."""
        response = self.client.post("/api/academic/schedules/", {
            "class_obj"  : self.class1.pk,
            "classroom"  : self.classroom.pk,
            "day_of_week": "friday",
            "start_time" : "11:30:00",
            "end_time"   : "12:30:00"
        }, format='json')
        self.assertEqual(response.status_code, 400)
        self.assertIn("Teacher is already busy", str(response.data))
 
    # ──────────────────────────────
    # CLASSROOM CONFLICT
    # ──────────────────────────────
 
    def test_classroom_conflict(self):
        """Test that classroom conflict returns 400."""
        # Create another teacher
        person2 = Person.objects.create(
            first_name = "Bob",
            last_name  = "Smith",
            gender     = "male",
            phone      = "0666123456"
        )
        position = Position.objects.get(name="teacher")
        employee2 = Employee.objects.create(
            person    = person2,
            hire_date = date(2024, 1, 1),
            position  = position,
            status    = "active"
        )
        teacher2 = Teacher.objects.create(employee=employee2)
 
        language = Language.objects.get(language_name="English")
        level    = Level.objects.get(level_name="B2")
 
        class3 = Class.objects.create(
            name       = "English B2 Group C",
            teacher    = teacher2,
            language   = language,
            level      = level,
            status     = 'active',
            start_date = date(2026, 1, 1),
        )
 
        response = self.client.post("/api/academic/schedules/", {
            "class_obj"  : class3.pk,
            "classroom"  : self.classroom.pk,
            "day_of_week": "friday",
            "start_time" : "11:30:00",
            "end_time"   : "12:30:00"
        }, format='json')
        self.assertEqual(response.status_code, 400)
        self.assertIn("Classroom is already booked", str(response.data))