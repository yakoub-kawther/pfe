from rest_framework import status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.viewsets import GenericViewSet
from rest_framework.permissions import IsAuthenticated
from apps.accounts.permissions import IsAdminOrSuperAdmin, IsTeacher, IsNotStudent

from .models import Attendance
from .serializers import (
    AttendanceSerializer,
    BulkAttendanceSerializer,
    UpdateAttendanceSerializer,
    StudentAttendanceSerializer,
    ClassAttendanceSummarySerializer,
)
from .services import (
    mark_attendance,
    update_attendance,
    bulk_mark_attendance,
    get_session_attendance,
    get_student_attendance,
    get_class_attendance_summary,
    get_absent_students,
    calculate_absence_rate,
)
# from accounts.permissions import IsAdminOrSuperAdmin, IsTeacher , IsNotStudent


class AttendanceViewSet(GenericViewSet):

    def get_permissions(self):
     if self.action in ('session_attendance', 'student_attendance',
                       'class_summary', 'absent_students', 'absence_rate'):
        return [IsAuthenticated()]
     return [IsAuthenticated(), IsNotStudent()]

    # ─────────────────────────────────────────
    # POST /attendance/mark/
    # ─────────────────────────────────────────
    @action(detail=False, methods=['post'], url_path='mark')
    def mark(self, request):
        session_id = request.data.get('session_id')
        student_id = request.data.get('student_id')
        status_val = request.data.get('status')

        if not all([session_id, student_id, status_val]):
            return Response(
                {'detail': 'session_id, student_id and status are required.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            attendance = mark_attendance(session_id, student_id, status_val)
        except ValueError as e:
            return Response({'detail': str(e)}, status=status.HTTP_400_BAD_REQUEST)

        return Response(
            AttendanceSerializer(attendance).data,
            status=status.HTTP_201_CREATED,
        )

    # ─────────────────────────────────────────
    # POST /attendance/bulk-mark/
    # ─────────────────────────────────────────
    @action(detail=False, methods=['post'], url_path='bulk-mark')
    def bulk_mark(self, request):
        serializer = BulkAttendanceSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            created = bulk_mark_attendance(
                session_id=serializer.validated_data['session_id'],
                attendance_list=serializer.validated_data['attendance_list'],
            )
        except ValueError as e:
            return Response({'detail': str(e)}, status=status.HTTP_400_BAD_REQUEST)

        return Response(
            {'detail': f'{len(created)} attendance records marked.'},
            status=status.HTTP_201_CREATED,
        )

    # ─────────────────────────────────────────
    # PATCH /attendance/{id}/update/
    # ─────────────────────────────────────────
    @action(detail=True, methods=['patch'], url_path='update')
    def update_record(self, request, pk=None):
        serializer = UpdateAttendanceSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            attendance = update_attendance(pk, serializer.validated_data['status'])
        except ValueError as e:
            return Response({'detail': str(e)}, status=status.HTTP_400_BAD_REQUEST)

        return Response(AttendanceSerializer(attendance).data)

    # ─────────────────────────────────────────
    # GET /attendance/session/{id}/
    # ─────────────────────────────────────────
    @action(detail=False, methods=['get'], url_path='session/(?P<session_id>[^/.]+)')
    def session_attendance(self, request, session_id=None):
        records = get_session_attendance(session_id)
        return Response(AttendanceSerializer(records, many=True).data)

    # ─────────────────────────────────────────
    # GET /attendance/student/{id}/class/{id}/
    # ─────────────────────────────────────────
    @action(detail=False, methods=['get'],
            url_path='student/(?P<student_id>[^/.]+)/class/(?P<class_id>[^/.]+)')
    def student_attendance(self, request, student_id=None, class_id=None):
        records = get_student_attendance(student_id, class_id)
        return Response(StudentAttendanceSerializer(records, many=True).data)

    # ─────────────────────────────────────────
    # GET /attendance/class/{id}/summary/
    # ─────────────────────────────────────────
    @action(detail=False, methods=['get'],
            url_path='class/(?P<class_id>[^/.]+)/summary')
    def class_summary(self, request, class_id=None):
        summary = get_class_attendance_summary(class_id)
        return Response(ClassAttendanceSummarySerializer(summary, many=True).data)

    # ─────────────────────────────────────────
    # GET /attendance/session/{id}/absent/
    # ─────────────────────────────────────────
    @action(detail=False, methods=['get'],
            url_path='session/(?P<session_id>[^/.]+)/absent')
    def absent_students(self, request, session_id=None):
        records = get_absent_students(session_id)
        return Response(AttendanceSerializer(records, many=True).data)

    # ─────────────────────────────────────────
    # GET /attendance/student/{id}/class/{id}/rate/
    # ─────────────────────────────────────────
    @action(detail=False, methods=['get'],
            url_path='student/(?P<student_id>[^/.]+)/class/(?P<class_id>[^/.]+)/rate')
    def absence_rate(self, request, student_id=None, class_id=None):
        rate = calculate_absence_rate(student_id, class_id)
        return Response({'absence_rate': rate})