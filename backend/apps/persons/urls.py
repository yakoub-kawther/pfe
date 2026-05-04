# apps/persons/urls.py

from django.urls import path, include
from rest_framework.routers import DefaultRouter


from .views import (
    EmployeeWithoutTeacherListView,
    StudentViewSet,
    ParentViewSet,
    EmployeeViewSet,
    TeacherViewSet,
)

router = DefaultRouter()
router.register('students',  StudentViewSet,  basename='student')
router.register('parents',   ParentViewSet,   basename='parent')
router.register('employees', EmployeeViewSet, basename='employee')
router.register('teachers',  TeacherViewSet,  basename='teacher')


urlpatterns = [
    # path('api/persons/employees/non-teachers/', EmployeeWithoutTeacherListView.as_view()),
    path('', include(router.urls)),
    
]