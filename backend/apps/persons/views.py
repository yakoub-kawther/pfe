
from django.shortcuts import render

# Create your views here.

# apps/persons/views.py

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.core.exceptions import ValidationError
from rest_framework.permissions import AllowAny

from .models import Student, Parent, Employee, Teacher
#from apps.academic.models import Position
from .serializers import (
    StudentSerializer, StudentCreateSerializer,
    ParentSerializer, ParentCreateSerializer,
    EmployeeSerializer, EmployeeCreateSerializer,
    TeacherSerializer, TeacherCreateSerializer,
)

from .services import (
    
    deactivate_employee,
    promote_to_head_teacher,
    demote_from_head_teacher
)


class StudentViewSet(viewsets.ViewSet):
    permission_classes = [AllowAny]
    def list(self, request):
        students = Student.objects.select_related('person').all()
        serializer = StudentSerializer(students, many=True)
        
        return Response(serializer.data)

    def create(self, request):
        serializer = StudentCreateSerializer(data=request.data)
        if serializer.is_valid():
            student = serializer.save()
            return Response(
                StudentSerializer(student).data,
                status=status.HTTP_201_CREATED
            )
        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )
    # get one student
    def retrieve(self, request, pk=None):
        student = Student.objects.select_related('person').filter(pk=pk).first()
        if not student:
            return Response(
                {'error': 'Student not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        return Response(StudentSerializer(student).data)

    def update(self, request, pk=None):
        student = Student.objects.select_related('person').filter(pk=pk).first()
        if not student:
            return Response(
                {'error': 'Student not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        serializer = StudentCreateSerializer(
            student, #existing obj
            data=request.data, # new data 
            partial=True  # update only some fields
        )
        if serializer.is_valid(raise_exception=True):
            serializer.save()
            return Response(StudentSerializer(student).data)
        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )

    



class ParentViewSet(viewsets.ViewSet):

    def list(self, request):
        parents = Parent.objects.select_related('person').all()
        serializer = ParentSerializer(parents, many=True)
        return Response(serializer.data)

    def create(self, request):
        serializer = ParentCreateSerializer(data=request.data)
        if serializer.is_valid():
            parent = serializer.save()
            return Response(
                ParentSerializer(parent).data,
                status=status.HTTP_201_CREATED
            )
        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )
     
    def retrieve(self, request, pk=None):
        parent = Parent.objects.select_related('person').filter(pk=pk).first()
        if not parent:
            return Response(
                {'error': 'Parent not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        return Response(ParentSerializer(parent).data)

    def update(self, request, pk=None):
        parent = Parent.objects.select_related('person').filter(pk=pk).first()
        if not parent:
            return Response(
                {'error': 'Parent not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        serializer = ParentCreateSerializer(
            parent,
            data=request.data,
            partial=True
        )
        if serializer.is_valid():
            serializer.save()
            return Response(ParentSerializer(parent).data)
        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )



class EmployeeViewSet(viewsets.ViewSet):

    def list(self, request):
        employees = Employee.objects.select_related('person', 'position').all()
        serializer = EmployeeSerializer(employees, many=True)
        return Response(serializer.data)

    def create(self, request):
        serializer = EmployeeCreateSerializer(data=request.data)
        if serializer.is_valid():
            employee = serializer.save()
            return Response(
                EmployeeSerializer(employee).data,
                status=status.HTTP_201_CREATED
            )
        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )

    def retrieve(self, request, pk=None):
        employee = Employee.objects.select_related('person', 'position').filter(pk=pk).first()
        if not employee:
            return Response(
                {'error': 'Employee not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        return Response(EmployeeSerializer(employee).data)

    def update(self, request, pk=None):
        employee = Employee.objects.select_related('person', 'position').filter(pk=pk).first()
        if not employee:
            return Response(
                {'error': 'Employee not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        serializer = EmployeeCreateSerializer(
            employee,
            data=request.data,
            partial=True
        )
        if serializer.is_valid():
            serializer.save()
            return Response(EmployeeSerializer(employee).data)
        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )



class TeacherViewSet(viewsets.ViewSet):

    def list(self, request):
        teachers = Teacher.objects.select_related(
            'employee__person',
            'employee__position'
        ).all()
        serializer = TeacherSerializer(teachers, many=True)
        return Response(serializer.data)

    def create(self, request):
        serializer = TeacherCreateSerializer(data=request.data)
        if serializer.is_valid():
            teacher = serializer.save()
            return Response(
                TeacherSerializer(teacher).data,
                status=status.HTTP_201_CREATED
            )
        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )

    def retrieve(self, request, pk=None):
        teacher = Teacher.objects.select_related(
            'employee__person',
            'employee__position'
        ).filter(pk=pk).first()
        if not teacher:
            return Response(
                {'error': 'Teacher not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        return Response(TeacherSerializer(teacher).data)

    def update(self, request, pk=None):
        teacher = Teacher.objects.select_related(
            'employee__person',
            'employee__position'
        ).filter(pk=pk).first()
        if not teacher:
            return Response(
                {'error': 'Teacher not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        serializer = TeacherCreateSerializer(
            teacher,
            data=request.data,
            partial=True
        )
        if serializer.is_valid():
            serializer.save()
            return Response(TeacherSerializer(teacher).data)
        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )
    

    @action(detail=True, methods=['post'])
    def promote(self, request, pk=None):
        try:
            teacher = promote_to_head_teacher(pk)
            return Response(TeacherSerializer(teacher).data)
        except ValidationError as e:
            return Response(
                {'error': e.message},
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=True, methods=['post'])
    def demote(self, request, pk=None):
        try:
            teacher = demote_from_head_teacher(pk)
            return Response(TeacherSerializer(teacher).data)
        except ValidationError as e:
            return Response(
                {'error': e.message},
                status=status.HTTP_400_BAD_REQUEST
            )
    


    # Already handled through:
    @action(detail=True, methods=['post'])
    def deactivate(self, request, pk=None):
        try:
         deactivate_employee(pk)
         return Response({'message': 'Employee  deactivated'})
        except ValidationError as e:
         return Response(
            {'error': e.message},
            status=status.HTTP_400_BAD_REQUEST
         )

