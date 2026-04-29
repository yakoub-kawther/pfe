from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from django.db import transaction

from .models import Inscription
from .serializers import InscriptionSerializer, InscriptionDetailSerializer
from apps.persons.models import Student
from apps.academic.models import Class

ACTIVE_STATUSES = ('confirmed',)



class CreateInscriptionView(APIView):
    def post(self, request):
        student_id = request.data.get('student_id')
        class_id   = request.data.get('class_id')

        if not student_id or not class_id:
            return Response(
                {'detail': 'student_id and class_id are required.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        student   = get_object_or_404(Student, pk=student_id)
        class_obj = get_object_or_404(Class,   pk=class_id)

        
        if class_obj.status != 'active':
            return Response(
                {'detail': f'Cannot enroll in a class with status "{class_obj.status}".'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        
        if Inscription.objects.filter(student=student, status__in=ACTIVE_STATUSES).exists():
            return Response(
                {'detail': 'Student already has an active inscription.'},
                status=status.HTTP_409_CONFLICT,
            )

        
        if Inscription.objects.filter(student=student, class_id=class_obj).exists():
            return Response(
                {'detail': 'Student is already enrolled in this class.'},
                status=status.HTTP_409_CONFLICT,
            )

        inscription = Inscription.objects.create(
            student=student,
            class_id=class_obj,
            status='confirmed',
        )
        return Response(InscriptionSerializer(inscription).data, status=status.HTTP_201_CREATED)



class UpdateInscriptionView(APIView):
    def patch(self, request, inscription_id):
        inscription = get_object_or_404(Inscription, pk=inscription_id)

        
        if inscription.status != 'confirmed':
            return Response(
                {'detail': f'Cannot update an inscription with status "{inscription.status}".'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        
        if 'student' in request.data or 'student_id' in request.data:
            return Response(
                {'detail': 'Cannot change the student of an inscription.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        serializer = InscriptionSerializer(inscription, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



class CancelInscriptionView(APIView):
    def patch(self, request, inscription_id):
        inscription = get_object_or_404(Inscription, pk=inscription_id)

        if inscription.status == 'cancelled':
            return Response(
                {'detail': 'Inscription is already cancelled.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if inscription.status != 'confirmed':
            return Response(
                {'detail': f'Cannot cancel an inscription with status "{inscription.status}".'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        inscription.status = 'cancelled'
        inscription.save(update_fields=['status'])
        return Response({'detail': 'Inscription cancelled successfully.', 'id': inscription.pk})



class StudentInscriptionHistoryView(APIView):
    def get(self, request, student_id):
        student = get_object_or_404(Student, pk=student_id)

        inscriptions = (
            Inscription.objects
            .filter(student=student)
            .select_related('class_idlanguage', 'class_idlevel')
            .order_by('-inscription_date')
        )

        return Response({
            'student_id':   student.pk,
            'student_name': f"{student.person.first_name} {student.person.last_name}",
            'total':        inscriptions.count(),
            'history':      InscriptionDetailSerializer(inscriptions, many=True).data,
        })



class StudentCurrentInscriptionView(APIView):
    def get(self, request, student_id):
        student = get_object_or_404(Student, pk=student_id)

        inscription = (
            Inscription.objects
            .filter(student=student, status__in=ACTIVE_STATUSES)
            .select_related('class_idlanguage', 'class_idlevel')
            .order_by('-inscription_date')
            .first()
        )

        if not inscription:
            return Response(
                {'detail': 'No active inscription found for this student.'},
                status=status.HTTP_404_NOT_FOUND,
            )

        return Response(InscriptionDetailSerializer(inscription).data)



def _transition_student(student_id, new_class_id, transition_type):
    student   = get_object_or_404(Student, pk=student_id)
    new_class = get_object_or_404(Class,   pk=new_class_id)

    if new_class.status != 'active':
        return Response(
            {'detail': f'Target class status is "{new_class.status}". Must be active.'},
            status=status.HTTP_400_BAD_REQUEST,
        )

    
    current = (
        Inscription.objects
        .filter(student=student, status__in=ACTIVE_STATUSES)
        .order_by('-inscription_date')
        .first()
    )

    if not current:
        return Response(
            {'detail': 'No active inscription found. Cannot proceed.'},
            status=status.HTTP_400_BAD_REQUEST,
        )

    
    if Inscription.objects.filter(student=student, class_id=new_class).exists():
        return Response(
            {'detail': 'Student already has a record in the target class.'},
            status=status.HTTP_409_CONFLICT,
        )

    with transaction.atomic():
       
        current.status = transition_type
        current.save(update_fields=['status'])

        
        new_inscription = Inscription.objects.create(
            student=student,
            class_id=new_class,
            status='confirmed',
        )
        return Response(
        {
            'detail':                  f'Student {transition_type} successfully.',
            'previous_inscription_id': current.pk,
            'new_inscription':         InscriptionSerializer(new_inscription).data,
        },
        status=status.HTTP_201_CREATED,
    )



class PromoteStudentView(APIView):
    def post(self, request, student_id):
        new_class_id = request.data.get('new_class_id')
        if not new_class_id:
            return Response(
                {'detail': 'new_class_id is required.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        return _transition_student(student_id, new_class_id, transition_type='promoted')



class RepeatLevelView(APIView):
    def post(self, request, student_id):
        new_class_id = request.data.get('new_class_id')
        if not new_class_id:
            return Response(
                {'detail': 'new_class_id is required.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        return _transition_student(student_id, new_class_id, transition_type='repeated')
