# apps/academic/models.py
from django.db import models

class Language(models.Model):
    language_name = models.CharField(max_length=50, unique=True)
    shortcut      = models.CharField(max_length=10, null=True, blank=True)

    class Meta:
        db_table = 'language'

    def __str__(self):
        return self.language_name


class Level(models.Model):
    level_name = models.CharField(max_length=10, unique=True)

    class Meta:
        db_table = 'level'

    def __str__(self):
        return self.level_name


class Classroom(models.Model):
    name     = models.CharField(max_length=20)
    capacity = models.IntegerField()

    class Meta:
        db_table = 'classroom'

    def __str__(self):
        return self.name


class Class(models.Model):
    name       = models.CharField(max_length=50)
    language   = models.ForeignKey(Language, on_delete=models.RESTRICT)
    level      = models.ForeignKey(Level, on_delete=models.RESTRICT)
    teacher    = models.ForeignKey('persons.Teacher', on_delete=models.RESTRICT)
    start_date = models.DateField()
    status     = models.CharField(max_length=10, choices=[
        ('active','Active'),
        ('completed','Completed'),
        ('cancelled','Cancelled')
    ], default='active')

    class Meta:
        db_table = 'class'
        unique_together = ('name', 'start_date')

    def __str__(self):
        return self.name


class Schedule(models.Model):
    class_obj  = models.ForeignKey(Class, on_delete=models.CASCADE , db_column  = 'class_id')
    classroom  = models.ForeignKey(Classroom, on_delete=models.RESTRICT)
    day_of_week = models.CharField(max_length=20)
    start_time = models.TimeField()
    end_time   = models.TimeField(null=True , blank=True)

    class Meta:
        db_table = 'schedule'

    def __str__(self):
        return f"{self.class_obj} - {self.day_of_week}"


class Session(models.Model):
    schedule     = models.ForeignKey(Schedule, on_delete=models.CASCADE)
    session_date = models.DateTimeField(auto_now_add=True)
    status       = models.CharField(max_length=20, null=True, blank=True)

    class Meta:
        db_table = 'session'

    def __str__(self):
        return f"{self.schedule} - {self.session_date}"


class Position(models.Model):
    name = models.CharField(max_length=50, unique=True)

    class Meta:
        db_table = 'position'

    def __str__(self):
        return self.name
