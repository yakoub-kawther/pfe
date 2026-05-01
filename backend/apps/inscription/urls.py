from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import InscriptionViewSet

router = DefaultRouter()
router.register('', InscriptionViewSet, basename='inscription')

urlpatterns = [
    path('', include(router.urls)),
]