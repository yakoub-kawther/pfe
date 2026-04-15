# apps/academic/urls.py

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import LanguageViewSet , LevelViewSet , ClassroomViewSet , PositionViewSet , ScheduleViewSet , ClassViewSet
router = DefaultRouter()
router.register('languages', LanguageViewSet, basename='language')
router.register('levels', LevelViewSet , basename='level')
router.register('classrooms', ClassroomViewSet , basename='classroom')
router.register('positions', PositionViewSet , basename='position')
router.register('classes' , ClassViewSet , basename='class')
router.register('schedules', ScheduleViewSet , basename='schedule')

urlpatterns = [
    path('', include(router.urls)),
]