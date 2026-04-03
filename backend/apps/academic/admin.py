from django.contrib import admin
from .models import Language , Position , Level , Classroom

# Register your models here.

admin.site.register(Language)
admin.site.register(Position)
admin.site.register(Level)
admin.site.register(Classroom)