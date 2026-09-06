from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.core.exceptions import ValidationError
from rest_framework.permissions import AllowAny
from django.db.models import OuterRef, Subquery, Q

from .models import Student, Parent, Employee, Teacher
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

from apps.inscription.models import Inscription


class StudentViewSet(viewsets.ViewSet):
    permission_classes = [AllowAny]

    def _students_with_latest_inscription(self):
        latest = Inscription.objects.filter(
            student=OuterRef('pk')
        ).order_by('-inscription_date')

        return Student.objects.select_related(
            'person', 'parent__person'
        ).annotate(
            latest_status=Subquery(latest.values('status')[:1]),
            latest_class_name=Subquery(latest.values('enrolled_class__name')[:1]),
        )

    def list(self, request):
        students = Student.objects.select_related('person', 'parent__person').all()
        serializer = StudentSerializer(students, many=True)
        return Response(serializer.data)

    def retrieve(self, request, pk=None):
        student = Student.objects.select_related('person', 'parent__person').filter(pk=pk).first()
        if not student:
            return Response({'error': 'Student not found'}, status=status.HTTP_404_NOT_FOUND)
        return Response(StudentSerializer(student).data)

    # ── Never enrolled, or their latest inscription was cancelled ──
    @action(detail=False, methods=['get'], url_path='waitlisted')
    def waitlisted(self, request):
        students = self._students_with_latest_inscription().filter(
            Q(latest_status__isnull=True) | Q(latest_status=Inscription.STATUS_CANCELLED)
        )
        serializer = StudentSerializer(students, many=True)
        return Response(serializer.data)

    # ── Promoted or repeated, awaiting placement into a new class ──
    @action(detail=False, methods=['get'], url_path='needs-placement')
    def needs_placement(self, request):
        students = self._students_with_latest_inscription().filter(
            latest_status__in=[Inscription.STATUS_PROMOTED, Inscription.STATUS_REPEATED]
        )
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

    def update(self, request, pk=None):
        student = Student.objects.select_related('person').filter(pk=pk).first()
        if not student:
            return Response(
                {'error': 'Student not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        serializer = StudentCreateSerializer(
            student,
            data=request.data,
            partial=True
        )
        if serializer.is_valid(raise_exception=True):
            serializer.save()
            return Response(StudentSerializer(student).data)
        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )
    def partial_update(self, request, pk=None):
      return self.update(request, pk)


    class StudentViewSet(viewsets.ModelViewSet):
     serializer_class = StudentSerializer

     @action(detail=True, methods=['post'], url_path='set-status')
     def set_status(self, request, pk=None):
        student = Student.objects.filter(pk=pk).first()
        if not student:
            return Response({'error': 'Student not found'}, status=status.HTTP_404_NOT_FOUND)

        new_status = request.data.get('status')
        if new_status not in ('active', 'inactive'):
            return Response(
                {'error': "status must be 'active' or 'inactive'"},
                status=status.HTTP_400_BAD_REQUEST
            )

        student.status = new_status
        student.save(update_fields=['status'])
        return Response(StudentSerializer(student).data)

  



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
        # print("FIRST EMPLOYEE DATA:", serializer.data[0] if serializer.data else "empty")
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

    @action(detail=False, methods=['get'], url_path='non-teachers')
    def non_teachers(self, request):
      queryset = Employee.objects.filter(
        teacher__isnull=True
      ).select_related('person', 'position')

      status_param = request.query_params.get('status')
      if status_param:
        queryset = queryset.filter(status__iexact=status_param)

      search = request.query_params.get('search')
      if search:
        queryset = queryset.filter(
            Q(person__first_name__icontains=search) |
            Q(person__last_name__icontains=search) |
            Q(person__phone__icontains=search) |
            Q(position__name__icontains=search)
        )

      serializer = EmployeeSerializer(queryset, many=True)
      return Response(serializer.data)


class TeacherViewSet(viewsets.ViewSet):

    def list(self, request):
      teachers = Teacher.objects.select_related(
        'employee__person',
        'employee__position'
      ).all()

      status_param = request.query_params.get('employee__status')
      if status_param:
        teachers = teachers.filter(employee__status__iexact=status_param)

      is_head_teacher = request.query_params.get('is_head_teacher')
      if is_head_teacher is not None:
        teachers = teachers.filter(is_head_teacher=(is_head_teacher.lower() == 'true'))

      search = request.query_params.get('search')
      if search:
        teachers = teachers.filter(
            Q(employee__person__first_name__icontains=search) |
            Q(employee__person__last_name__icontains=search) |
            Q(employee__person__phone__icontains=search) |
            Q(language__language_name__icontains=search)
        )

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
    
    def partial_update(self, request, pk=None):
       return self.update(request, pk)



from rest_framework import generics

class EmployeeWithoutTeacherListView(generics.ListAPIView):
    serializer_class = EmployeeSerializer

    def get_queryset(self):
        return Employee.objects.filter(
            teacher__isnull=True
        ).select_related('person', 'position')
