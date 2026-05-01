from rest_framework import status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.viewsets import GenericViewSet
from rest_framework.permissions import IsAuthenticated

from .models import Inscription
from .serializers import (
    InscriptionSerializer,
    InscriptionDetailSerializer,
    TransitionSerializer,
)
from .services import (
    create_inscription,
    update_inscription,
    cancel_inscription,
    get_student_history,
    get_student_current,
    promote_student,
    repeat_student,
)
from apps.accounts.permissions import IsAdminOrSuperAdmin


class InscriptionViewSet(GenericViewSet):

    def get_permissions(self):
        if self.action in ('history', 'current'):
            return [IsAuthenticated()]
        return [IsAuthenticated(), IsAdminOrSuperAdmin()]

    # ─────────────────────────────────────────
    # POST /inscriptions/
    # ─────────────────────────────────────────
    def create(self, request):
        student_id = request.data.get('student_id')
        class_id   = request.data.get('class_id')

        if not student_id or not class_id:
            return Response(
                {'detail': 'student_id and class_id are required.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            inscription = create_inscription(student_id, class_id)
        except ValueError as e:
            return Response({'detail': str(e)}, status=status.HTTP_400_BAD_REQUEST)

        return Response(
            InscriptionSerializer(inscription).data,
            status=status.HTTP_201_CREATED,
        )

    # ─────────────────────────────────────────
    # PATCH /inscriptions/{id}/
    # ─────────────────────────────────────────
    def partial_update(self, request, pk=None):
        try:
            inscription = update_inscription(pk, request.data)
        except ValueError as e:
            return Response({'detail': str(e)}, status=status.HTTP_400_BAD_REQUEST)

        return Response(InscriptionSerializer(inscription).data)

    # ─────────────────────────────────────────
    # POST /inscriptions/{id}/cancel/
    # ─────────────────────────────────────────
    @action(detail=True, methods=['post'], url_path='cancel')
    def cancel(self, request, pk=None):
        try:
            inscription = cancel_inscription(pk)
        except ValueError as e:
            return Response({'detail': str(e)}, status=status.HTTP_400_BAD_REQUEST)

        return Response({
            'detail': 'Inscription cancelled successfully.',
            'id': inscription.pk,
        })

    # ─────────────────────────────────────────
    # GET /inscriptions/student/{id}/history/
    # ─────────────────────────────────────────
    @action(detail=False, methods=['get'], url_path='student/(?P<student_id>[^/.]+)/history')
    def history(self, request, student_id=None):
        student, inscriptions = get_student_history(student_id)

        return Response({
            'student_id':   student.pk,
            'student_name': f"{student.person.first_name} {student.person.last_name}",
            'total':        inscriptions.count(),
            'history':      InscriptionDetailSerializer(inscriptions, many=True).data,
        })

    # ─────────────────────────────────────────
    # GET /inscriptions/student/{id}/current/
    # ─────────────────────────────────────────
    @action(detail=False, methods=['get'], url_path='student/(?P<student_id>[^/.]+)/current')
    def current(self, request, student_id=None):
        inscription = get_student_current(student_id)

        if not inscription:
            return Response(
                {'detail': 'No active inscription found for this student.'},
                status=status.HTTP_404_NOT_FOUND,
            )

        return Response(InscriptionDetailSerializer(inscription).data)

    # ─────────────────────────────────────────
    # POST /inscriptions/student/{id}/promote/
    # ─────────────────────────────────────────
    @action(detail=False, methods=['post'], url_path='student/(?P<student_id>[^/.]+)/promote')
    def promote(self, request, student_id=None):
        serializer = TransitionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            current, new_inscription = promote_student(
                student_id,
                serializer.validated_data['new_class_id']
            )
        except ValueError as e:
            return Response({'detail': str(e)}, status=status.HTTP_400_BAD_REQUEST)

        return Response({
            'detail': 'Student promoted successfully.',
            'previous_inscription_id': current.pk,
            'new_inscription': InscriptionSerializer(new_inscription).data,
        }, status=status.HTTP_201_CREATED)

    # ─────────────────────────────────────────
    # POST /inscriptions/student/{id}/repeat/
    # ─────────────────────────────────────────
    @action(detail=False, methods=['post'], url_path='student/(?P<student_id>[^/.]+)/repeat')
    def repeat(self, request, student_id=None):
        serializer = TransitionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            current, new_inscription = repeat_student(
                student_id,
                serializer.validated_data['new_class_id']
            )
        except ValueError as e:
            return Response({'detail': str(e)}, status=status.HTTP_400_BAD_REQUEST)

        return Response({
            'detail': 'Student repeated successfully.',
            'previous_inscription_id': current.pk,
            'new_inscription': InscriptionSerializer(new_inscription).data,
        }, status=status.HTTP_201_CREATED)