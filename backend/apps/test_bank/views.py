from django.shortcuts import render

# Create your views here.
from rest_framework import status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.viewsets import GenericViewSet
from rest_framework.permissions import IsAuthenticated

from .models import Note
from .serializers import (
    NoteSerializer,
    NoteCreateSerializer,
    NoteUpdateSerializer,
    FinalResultSerializer,
)
from .sevices import (
    create_note,
    update_note,
    get_student_notes,
    get_class_notes,
    get_note_by_inscription,
    calculate_final_result,
)
from apps.accounts.permissions import IsNotStudent


class NoteViewSet(GenericViewSet):

    def get_permissions(self):
        if self.action in ('student_notes', 'class_notes',
                           'inscription_note', 'final_result'):
            return [IsAuthenticated()]
        return [IsAuthenticated(), IsNotStudent()]

    # ─────────────────────────────────────────
    # POST /notes/
    # ─────────────────────────────────────────
    def create(self, request):
        serializer = NoteCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            note = create_note(
                inscription_id=serializer.validated_data['inscription_id'],
                component=serializer.validated_data['component'],
                mark=serializer.validated_data['mark'],
            )
        except ValueError as e:
            return Response({'detail': str(e)}, status=status.HTTP_400_BAD_REQUEST)

        return Response(NoteSerializer(note).data, status=status.HTTP_201_CREATED)

    # ─────────────────────────────────────────
    # PUT /notes/{id}/
    # ─────────────────────────────────────────
    def update(self, request, pk=None):
        serializer = NoteUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            note = update_note(pk, serializer.validated_data['mark'])
        except ValueError as e:
            return Response({'detail': str(e)}, status=status.HTTP_400_BAD_REQUEST)

        return Response(NoteSerializer(note).data)

    # ─────────────────────────────────────────
    # GET /notes/
    # ─────────────────────────────────────────
    def list(self, request):
        notes = Note.objects.select_related(
            'inscription__student__person',
            'inscription__enrolled_class'
        ).order_by('-date')
        return Response(NoteSerializer(notes, many=True).data)

    # ─────────────────────────────────────────
    # GET /notes/{id}/
    # ─────────────────────────────────────────
    def retrieve(self, request, pk=None):
        note = Note.objects.select_related(
            'inscription__student__person',
            'inscription__enrolled_class'
        ).get(pk=pk)
        return Response(NoteSerializer(note).data)

    # ─────────────────────────────────────────
    # GET /notes/student/?student_id=1
    # ─────────────────────────────────────────
    @action(detail=False, methods=['get'], url_path='student')
    def student_notes(self, request):
        student_id = request.query_params.get('student_id')
        if not student_id:
            return Response(
                {'detail': 'student_id is required.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        notes = get_student_notes(student_id)
        return Response(NoteSerializer(notes, many=True).data)

    # ─────────────────────────────────────────
    # GET /notes/class/?class_id=1
    # ─────────────────────────────────────────
    @action(detail=False, methods=['get'], url_path='class')
    def class_notes(self, request):
        class_id = request.query_params.get('class_id')
        if not class_id:
            return Response(
                {'detail': 'class_id is required.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        notes = get_class_notes(class_id)
        return Response(NoteSerializer(notes, many=True).data)

    # ─────────────────────────────────────────
    # GET /notes/inscription/?inscription_id=1
    # ─────────────────────────────────────────
    @action(detail=False, methods=['get'], url_path='inscription')
    def inscription_note(self, request):
        inscription_id = request.query_params.get('inscription_id')
        if not inscription_id:
            return Response(
                {'detail': 'inscription_id is required.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        note = get_note_by_inscription(inscription_id)
        return Response(NoteSerializer(note).data)

    # ─────────────────────────────────────────
    # GET /notes/inscription/{id}/result/
    # ─────────────────────────────────────────
    @action(detail=False, methods=['get'],
            url_path='inscription/(?P<inscription_id>[^/.]+)/result')
    def final_result(self, request, inscription_id=None):
        result = calculate_final_result(inscription_id)
        return Response(FinalResultSerializer(result).data)