from django.shortcuts import render

# Create your views here.
# apps/academic/views.py

from rest_framework import viewsets, status
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db import transaction

# never actually caught anything from the service layer.
from rest_framework.exceptions import ValidationError
from rest_framework.filters import SearchFilter
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.decorators import action


from .models import Language, Level, Position, Classroom, Class, Schedule
from .serializers import LanguageSerializer, LanguageCreateSerializer, LevelCreateSerializer, LevelSerializer, ClassroomCreateSerializer, LevelCreateSerializer, PositionCreateSerializer, PositionSerializer, ClassroomSerializer, ClassSerializer, ClassCreateSerializer, ScheduleSerializer, ScheduleCreateSerializer
from .services import create_language, update_language, get_teacher_busy_times, get_available_classrooms

# language part
class LanguageViewSet(viewsets.ModelViewSet):
    queryset = Language.objects.all()
    filter_backends = [SearchFilter]
    search_fields   = ['language_name', 'shortcut']

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return LanguageCreateSerializer
        return LanguageSerializer

    def perform_create(self, serializer):
        language = create_language(serializer.validated_data)
        serializer.instance = language
        return language

    def perform_update(self, serializer):
        language = update_language(serializer.instance, serializer.validated_data)
        return language

    def get_object(self):
        return get_object_or_404(Language, pk=self.kwargs.get('pk'))


# level part
class LevelViewSet(viewsets.ModelViewSet):
    queryset = Level.objects.all()

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return LevelCreateSerializer
        from .serializers import LevelSerializer
        return LevelSerializer

    def perform_create(self, serializer):
        from .services import create_level
        level = create_level(serializer.validated_data)
        serializer.instance = level
        return level

    def perform_update(self, serializer):
        from .services import update_level
        level = update_level(serializer.instance, serializer.validated_data)
        return level

    def get_object(self):
        return get_object_or_404(Level, pk=self.kwargs.get('pk'))

# calassroom part

class ClassroomViewSet(viewsets.ModelViewSet):
    queryset = Classroom.objects.all()

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return ClassroomCreateSerializer
        from .serializers import ClassroomSerializer
        return ClassroomSerializer

    def perform_create(self, serializer):
        from .services import create_classroom
        classroom = create_classroom(serializer.validated_data)
        serializer.instance = classroom
        return classroom

    def perform_update(self, serializer):
        from .services import update_classroom
        classroom = update_classroom(serializer.instance, serializer.validated_data)
        return classroom

    def get_object(self):
        return get_object_or_404(Classroom, pk=self.kwargs.get('pk'))


# position part

class PositionViewSet(viewsets.ModelViewSet):
    queryset = Position.objects.all()

    def get_queryset(self):
        return Position.objects.exclude(name__iexact='teacher')

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return PositionCreateSerializer
        return PositionSerializer

    def perform_create(self, serializer):
        from .services import create_position
        position = create_position(serializer.validated_data)
        serializer.instance = position
        return position

    def perform_update(self, serializer):
        from .services import update_position
        position = update_position(serializer.instance, serializer.validated_data)
        return position

    def get_object(self):
        return get_object_or_404(Position, pk=self.kwargs.get('pk'))


# class part

from rest_framework import viewsets
from django.db import transaction

class ClassViewSet(viewsets.ModelViewSet):
    # avoid N+1 quieries
    queryset = Class.objects.select_related('language', 'level', 'teacher').all()

    filter_backends  = [DjangoFilterBackend, SearchFilter]

    # ?status=active  or  ?status=inactive
    filterset_fields = ['status', 'teacher']

    # ?search=ahmed  searches across these fields
    search_fields    = [
        'name',
        'language__language_name',
        'level__level_name',
        'teacher__employee__person__first_name',
        'teacher__employee__person__last_name',
    ]

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return ClassCreateSerializer
        return ClassSerializer

    def perform_create(self, serializer):
        # create_class can raise ValidationError (e.g. teacher/language
        # mismatch, duplicate name+start_date). Left uncaught, DRF's default
        # exception handler still turns it into a 400 automatically since
        # it's an APIException subclass -- but we handle it explicitly for
        # a consistent {'error': ...} response shape across the app.
        from .services import create_class
        try:
            with transaction.atomic():
                class_obj = create_class(serializer.validated_data)
            serializer.instance = class_obj
        except ValidationError as e:
            raise ValidationError({'error': e.detail})

    def perform_update(self, serializer):
        from .services import update_class
        try:
            with transaction.atomic():
                class_obj = update_class(serializer.instance, serializer.validated_data)
            serializer.instance = class_obj
        except ValidationError as e:
            raise ValidationError({'error': e.detail})


    @action(detail=False, methods=['get'])
    def suggest_name(self, request):
        from .services import generate_class_name
        from apps.persons.models import Teacher

        language_id = request.query_params.get('language')
        level_id    = request.query_params.get('level')
        teacher_id  = request.query_params.get('teacher')

        if not all([language_id, level_id, teacher_id]):
            return Response(
                {'error': 'language, level and teacher are required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        language = get_object_or_404(Language, pk=language_id)
        level    = get_object_or_404(Level, pk=level_id)
        teacher  = get_object_or_404(Teacher, pk=teacher_id)

        return Response({'name': generate_class_name(language, level, teacher)})


    


from rest_framework.decorators import action

class ScheduleViewSet(viewsets.ModelViewSet):

    queryset = Schedule.objects.all()
    serializer_class = ScheduleSerializer

    # ── Step 2: Get teacher busy times ──
    @action(detail=False, methods=['get'])
    def teacher_busy(self, request):
        class_id = request.query_params.get('class_id')
        if not class_id:
            return Response(
                {'error': 'class_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        try:
            busy_times = get_teacher_busy_times(class_id)
            return Response(busy_times)
        except ValidationError as e:
            return Response(
                {'error': e.detail},
                status=status.HTTP_400_BAD_REQUEST
            )

    # ──  Get available classrooms ──
    @action(detail=False, methods=['get'])
    def available_classrooms(self, request):
        day_of_week = request.query_params.get('day_of_week')
        start_time  = request.query_params.get('start_time')
        end_time    = request.query_params.get('end_time')

        if not all([day_of_week, start_time, end_time]):
            return Response(
                {'error': 'day_of_week, start_time and end_time are required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        classrooms = get_available_classrooms(
            day_of_week, start_time, end_time
        )
        serializer = ClassroomSerializer(classrooms, many=True)
        return Response(serializer.data)



    @action(detail=False, methods=['get'])
    def schedulable_classes(self, request):
        classes = Class.objects.filter(
            status='scheduled'
        ).select_related('language', 'level', 'teacher')
        serializer = ClassSerializer(classes, many=True)
        return Response(serializer.data)

    # ── Step 4: Create schedule ──
    def create(self, request):
        # ScheduleCreateSerializer now also accepts an optional
        # write-only `start_this_week` bool, forwarded through to
        # services.create_schedule via validated_data.
        serializer = ScheduleCreateSerializer(data=request.data)

        if serializer.is_valid():
            try:
                schedule = serializer.save()
                return Response(
                    ScheduleSerializer(schedule).data,
                    status=status.HTTP_201_CREATED
                )
            except ValidationError as e:  # ← now correctly catches service errors
                return Response(
                    {'error': e.detail},
                    status=status.HTTP_400_BAD_REQUEST
                )
        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )

    def list(self, request):
        class_id = request.query_params.get('class_obj')
        qs = Schedule.objects.select_related('classroom').all()
        if class_id:
            qs = qs.filter(class_obj_id=class_id)
        serializer = ScheduleSerializer(qs, many=True)
        return Response(serializer.data)


from .serializers import SessionSerializer
from .services import get_class_progress
from .models import Session
from .serializers import SessionDetailSerializer
class SessionViewSet(viewsets.ModelViewSet):
    queryset         = Session.objects.all()
    serializer_class = SessionSerializer
    http_method_names = ['get', 'head', 'options', 'patch']

    @action(detail=True, methods=['patch'])
    def complete(self, request, pk=None):
        from .services import complete_session
        session = self.get_object()
        session = complete_session(session)
        return Response(SessionSerializer(session).data)

    def partial_update(self, request, *args, **kwargs):
        # Block the default PATCH /sessions/<id>/ so every status change
        # goes through complete_session() — that's what triggers the
        # class-completion check. Bypassing it would leave classes stuck
        # 'active' forever even after every session is done.
        return Response(
            {'detail': 'Use PATCH /sessions/<id>/complete/ instead.'},
            status=status.HTTP_405_METHOD_NOT_ALLOWED,
        )

    @action(detail=False, methods=['get'])
    def progress(self, request):
        class_id = request.query_params.get('class_id')

        if not class_id:
            return Response(
                {'detail': 'class_id is required.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        return Response(get_class_progress(class_id))

    def list(self, request):
        class_id = request.query_params.get('class_obj')
        sessions = Session.objects.select_related(
            'schedule__classroom'
        ).all()
        if class_id:
            sessions = sessions.filter(schedule__class_obj_id=class_id)
        serializer = SessionDetailSerializer(sessions, many=True)
        return Response(serializer.data)