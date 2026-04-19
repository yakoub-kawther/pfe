from django.db import models
from apps.academic.models import Language , Position


class Person(models.Model):
    first_name = models.CharField(max_length=50)
    last_name  = models.CharField(max_length=50)
    gender     = models.CharField(max_length=10, choices=[
        ('male','Male'),
        ('female','Female')
    ])
    phone      = models.CharField(max_length=20, unique=True, null=True, blank=True)
    email      = models.CharField(max_length=100, unique=True, null=True, blank=True)
    address    = models.CharField(max_length=255, null=True, blank=True)

    class Meta:
        db_table = 'person'

    def __str__(self):
        return f"{self.first_name} {self.last_name}"


class Student(models.Model):
    person        = models.OneToOneField(Person, on_delete=models.CASCADE, primary_key=True)
    date_of_birth = models.DateField()
    special_case  = models.CharField(max_length=255, null=True, blank=True)

    
    
    class Meta:
        db_table = 'student'

    def __str__(self):
        return self.person.first_name


class Parent(models.Model):
    person       = models.OneToOneField(Person, on_delete=models.CASCADE, primary_key=True)
    relationship = models.CharField(max_length=10, choices=[
        ('father','Father'),
        ('mother','Mother'),
        ('other','Other')
    ])
    students     = models.ManyToManyField(Student, through='ParentStudent')

    
    
    class Meta:
        db_table = 'parent'

    def __str__(self):
        return self.person.first_name


class ParentStudent(models.Model):
    parent  = models.ForeignKey(Parent, on_delete=models.CASCADE)
    student = models.ForeignKey(Student, on_delete=models.CASCADE)

    class Meta:
        db_table = 'parent_student'
        unique_together = ('parent', 'student')

    def __str__(self):
        return f"{self.parent} - {self.student}"





class Employee(models.Model):
    person    = models.OneToOneField(Person, on_delete=models.CASCADE, primary_key=True)
    hire_date = models.DateField()
    end_date  = models.DateField(null=True, blank=True)
    status    = models.CharField(max_length=10, choices=[
        ('active','Active'),
        ('inactive','Inactive')
    ], default='active')
    position  = models.ForeignKey(Position, on_delete=models.SET_NULL, null=True)

    
    
    class Meta:
        db_table = 'employee'

    def __str__(self):
        return self.person.first_name


class Teacher(models.Model):
    employee        = models.OneToOneField(Employee, on_delete=models.CASCADE, primary_key=True)
    qualifications  = models.TextField(null=True, blank=True)
    language        = models.ForeignKey(Language, on_delete=models.SET_NULL, null=True)
    is_head_teacher = models.BooleanField(default=False)

    class Meta:
        db_table = 'teacher'

    def __str__(self):
        return self.employee.person.first_name
