from django.shortcuts import render

# Create your views here.
# apps/academic/views.py

from rest_framework import viewsets, status
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db import transaction
from django.core.exceptions import ValidationError

from .models import Language , Level , Position , Classroom
from .serializers import LanguageSerializer, LanguageCreateSerializer, LevelCreateSerializer , LevelSerializer , ClassroomCreateSerializer , LevelCreateSerializer , PositionCreateSerializer , PositionSerializer
from .services import create_language, update_language

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