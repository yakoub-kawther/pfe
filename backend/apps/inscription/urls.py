from django.urls import path
from .views import (
    CreateInscriptionView,
    UpdateInscriptionView,
    CancelInscriptionView,
    StudentInscriptionHistoryView,
    StudentCurrentInscriptionView,
    PromoteStudentView,
    RepeatLevelView,
)

urlpatterns = [
    # CRUD
    path('', CreateInscriptionView.as_view(),name='inscription-create'),
    path('<int:inscription_id>/update/',UpdateInscriptionView.as_view(),name='inscription-update'),
    path('<int:inscription_id>/cancel/',CancelInscriptionView.as_view(),name='inscription-cancel'),

    # Student queries
    path('student/<int:student_id>/history/',StudentInscriptionHistoryView.as_view(),  name='inscription-history'),
    path('student/<int:student_id>/current/',StudentCurrentInscriptionView.as_view(),  name='inscription-current'),

    # Transitions
    path('student/<int:student_id>/promote/',PromoteStudentView.as_view(),name='inscription-promote'),
    path('student/<int:student_id>/repeat/',RepeatLevelView.as_view(),name='inscription-repeat'),
]