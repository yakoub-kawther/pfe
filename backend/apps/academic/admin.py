from django.contrib import admin
from .models import Language , Position , Level , Classroom ,Class , Schedule , Session

# Register your models here.

admin.site.register(Language)
admin.site.register(Position)
admin.site.register(Level)
admin.site.register(Classroom)
admin.site.register(Schedule)
admin.site.register(Session)
admin.site.register(Class)