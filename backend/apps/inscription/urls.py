from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import InscriptionViewSet, EnrollmentGrowthViewSet

router = DefaultRouter()
router.register('growth', EnrollmentGrowthViewSet, basename='enrollment-growth')
router.register('', InscriptionViewSet, basename='inscription')

urlpatterns = [
    path('', include(router.urls)),
]