from rest_framework import serializers
from rest_framework.validators import UniqueValidator
from django.utils import timezone

from .services import create_language, update_language
from .models import Language, Position, Level, Classroom, Class, Schedule, Session
from apps.persons.models import Teacher



class PositionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Position
        fields = ['id', 'name']


# language serializers

class LanguageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Language
        fields = ['id', 'language_name', 'shortcut']


class LanguageCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Language
        fields = ['id', 'language_name', 'shortcut']

    def create(self, validated_data):
        return create_language(validated_data)

    def update(self, instance, validated_data):
        return update_language(instance, validated_data)


# Level serializers

class LevelSerializer(serializers.ModelSerializer):
    class Meta:
        model = Level
        fields = ['id', 'level_name']


class LevelCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Level
        fields = ['level_name']

    def create(self, validated_data):
        from .services import create_level
        return create_level(validated_data)

    def update(self, instance, validated_data):
        from .services import update_level
        return update_level(instance, validated_data)


# Classroom serializers

class ClassroomSerializer(serializers.ModelSerializer):
    class Meta:
        model = Classroom
        fields = ['id', 'name', 'capacity']


class ClassroomCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Classroom
        fields = ['name', 'capacity']

    def create(self, validated_data):
        from .services import create_classroom
        return create_classroom(validated_data)

    def update(self, instance, validated_data):
        from .services import update_classroom
        return update_classroom(instance, validated_data)


# position serializers

class PositionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Position
        fields = ['id', 'name']


class PositionCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Position
        fields = ['name']

    def create(self, validated_data):
        from .services import create_position
        return create_position(validated_data)

    def update(self, instance, validated_data):
        from .services import update_position
        return update_position(instance, validated_data)


# ──────────────────────────────
# CLASS
# ──────────────────────────────

class ClassCreateSerializer(serializers.ModelSerializer):
    language   = serializers.PrimaryKeyRelatedField(queryset=Language.objects.all())
    level      = serializers.PrimaryKeyRelatedField(queryset=Level.objects.all())
    teacher    = serializers.PrimaryKeyRelatedField(queryset=Teacher.objects.all())
    # start_date is no longer required at class-creation time -- it gets
    # derived automatically from the class's first schedule (see
    # ScheduleCreateSerializer / services.create_schedule)
    start_date = serializers.DateField(required=False, allow_null=True)

    class Meta:
        model  = Class
        fields = [
            'name', 'language', 'level',
            'teacher', 'start_date', 'status'
        ]

    def validate_start_date(self, value):
        if value is not None and value < timezone.now().date():
            raise serializers.ValidationError("Start date cannot be in the past.")
        return value

    def create(self, validated_data):
        from .services import create_class
        return create_class(validated_data)

    def update(self, instance, validated_data):
        from .services import update_class
        return update_class(instance, validated_data)


class ClassSerializer(serializers.ModelSerializer):
    language_name = serializers.CharField(source='language.language_name', read_only=True)
    level_name    = serializers.CharField(source='level.level_name', read_only=True)
    teacher_name  = serializers.SerializerMethodField()

    class Meta:
        model  = Class
        fields = [
            'id', 'name',
            'language', 'language_name',
            'level', 'level_name',
            'teacher', 'teacher_name',
            'start_date', 'status'
        ]

    def get_teacher_name(self, obj):
        person = obj.teacher.employee.person
        return f"{person.first_name} {person.last_name}"


# ──────────────────────────────
# SCHEDULE
# ──────────────────────────────

class ScheduleCreateSerializer(serializers.ModelSerializer):
    # Not a Schedule model field -- write-only flag consumed by
    # services.create_schedule to decide how to derive the class's
    # start_date when this is the class's first schedule. Popped out of
    # validated_data by the service before Schedule.objects.create(**data).
    start_this_week = serializers.BooleanField(required=False, default=False, write_only=True)

    class Meta:
        model  = Schedule
        fields = [
            'class_obj', 'classroom',
            'day_of_week', 'start_time', 'end_time',
            'start_this_week',
        ]

    def validate_day_of_week(self, value):
        valid_days = [
            'monday', 'tuesday', 'wednesday',
            'thursday', 'friday', 'saturday', 'sunday'
        ]
        if value.lower() not in valid_days:
            raise serializers.ValidationError("Invalid day of week.")
        return value.lower()

    def create(self, validated_data):
        from .services import create_schedule
        return create_schedule(validated_data)


class ScheduleSerializer(serializers.ModelSerializer):
    classroom = ClassroomSerializer(read_only=True)

    class Meta:
        model  = Schedule
        fields = [
            'id', 'class_obj', 'classroom',
            'day_of_week', 'start_time', 'end_time'
        ]


class BusyTimeSerializer(serializers.Serializer):
    day_of_week = serializers.CharField()
    start_time  = serializers.TimeField()
    end_time    = serializers.TimeField()


class SessionSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Session
        fields = ['id', 'schedule', 'session_date', 'status']


class SessionDetailSerializer(serializers.ModelSerializer):
    start_time = serializers.TimeField(source='schedule.start_time', read_only=True)
    end_time   = serializers.TimeField(source='schedule.end_time',   read_only=True)
    classroom  = serializers.CharField(source='schedule.classroom.name', read_only=True)

    class Meta:
        model  = Session
        fields = ['id', 'session_date', 'status', 'start_time', 'end_time', 'classroom']