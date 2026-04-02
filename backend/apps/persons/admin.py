from django.contrib import admin
from .models import Person, Student, Parent, Employee, Teacher, Position, ParentStudent

class ParentStudentInline(admin.TabularInline):
    model = ParentStudent
    extra = 1

class ParentAdmin(admin.ModelAdmin):
    inlines = [ParentStudentInline]

admin.site.register(Person)
admin.site.register(Student)
admin.site.register(Parent, ParentAdmin)
admin.site.register(Employee)
admin.site.register(Teacher)
admin.site.register(Position)