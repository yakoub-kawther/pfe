from django.shortcuts import render

# Create your views here.
# apps/academic/views.py

from rest_framework import viewsets, status
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db import transaction
from django.core.exceptions import ValidationError

from .models import Language , Level , Position , Classroom , Class, Schedule
from .serializers import LanguageSerializer, LanguageCreateSerializer, LevelCreateSerializer , LevelSerializer , ClassroomCreateSerializer , LevelCreateSerializer , PositionCreateSerializer , PositionSerializer , ClassroomSerializer , ClassSerializer , ClassCreateSerializer , ScheduleSerializer , ScheduleCreateSerializer
from .services import create_language, update_language , get_teacher_busy_times , get_available_classrooms 

# language part
class LanguageViewSet(viewsets.ModelViewSet):
    
    
    queryset = Language.objects.all()

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
    queryset = Class.objects.select_related('language', 'level', 'teacher').all()

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return ClassCreateSerializer
        return ClassSerializer

    def perform_create(self, serializer):
        from .services import create_class
        with transaction.atomic():
            class_obj = create_class(serializer.validated_data)
        serializer.instance = class_obj

    def perform_update(self, serializer):
        from .services import update_class
        with transaction.atomic():
            class_obj = update_class(serializer.instance, serializer.validated_data)
        serializer.instance = class_obj





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
                {'error': e.message},
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

    # ── Step 4: Create schedule ──
    def create(self, request):
        serializer = ScheduleCreateSerializer(data=request.data)
        
        if serializer.is_valid():
            try:
             schedule = serializer.save()
             return Response(
                ScheduleSerializer(schedule).data,
                status=status.HTTP_201_CREATED
             )
            except ValidationError as e:  # ← catch service errors
             return Response(
                {'error': e.message},
                status=status.HTTP_400_BAD_REQUEST
             )
        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )