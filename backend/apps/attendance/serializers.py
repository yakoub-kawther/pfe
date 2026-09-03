from rest_framework import serializers
from .models import Attendance
from apps.persons.models import Student


class AttendanceSerializer(serializers.ModelSerializer):
    """Used for reading — single attendance record."""

    class Meta:
        model  = Attendance
        fields = ['id', 'session', 'student', 'status', 'marked_at']
        read_only_fields = ['marked_at']


class AttendanceItemSerializer(serializers.Serializer):
    """Single item inside bulk mark payload."""
    student_id = serializers.IntegerField()
    status     = serializers.ChoiceField(choices=Attendance.Status.choices)


class BulkAttendanceSerializer(serializers.Serializer):
    """Used for bulk marking attendance."""
    session_id      = serializers.IntegerField()
    attendance_list = AttendanceItemSerializer(many=True)

    def validate_attendance_list(self, value):
        if not value:
            raise serializers.ValidationError("Attendance list cannot be empty.")

        # Check for duplicate student_ids
        student_ids = [item['student_id'] for item in value]
        if len(student_ids) != len(set(student_ids)):
            raise serializers.ValidationError("Duplicate students in attendance list.")

        return value


class UpdateAttendanceSerializer(serializers.Serializer):
    """Used for correcting a single attendance record."""
    status = serializers.ChoiceField(choices=Attendance.Status.choices)


class StudentAttendanceSerializer(serializers.ModelSerializer):
    """Used for student attendance history."""
    session_date = serializers.DateTimeField(source='session.session_date', read_only=True)
    session_status = serializers.CharField(source='session.status', read_only=True)

    class Meta:
        model  = Attendance
        fields = ['id', 'session', 'session_date', 'session_status', 'status', 'marked_at']
        read_only_fields = ['marked_at']


class ClassAttendanceSummarySerializer(serializers.Serializer):
    person_id    = serializers.IntegerField(source='pk')
    student_name = serializers.SerializerMethodField()
    total        = serializers.IntegerField()
    present      = serializers.IntegerField()
    absences     = serializers.IntegerField()
    absence_rate = serializers.SerializerMethodField()

    def get_student_name(self, obj):
        return f"{obj.person.first_name} {obj.person.last_name}"

    def get_absence_rate(self, obj):
        if obj.total == 0:
            return 0.0
        return round((obj.absences / obj.total) * 100, 1)



class AttendanceOverviewSerializer(serializers.Serializer):
    present         = serializers.IntegerField()
    absent          = serializers.IntegerField()
    total           = serializers.IntegerField()
    percent_present = serializers.FloatField()