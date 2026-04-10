from rest_framework import serializers
from rest_framework.validators import UniqueValidator

from .services import create_language, update_language
from .models import Language, Position , Level , Classroom , Class , Schedule , Session
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
    


# class part

from rest_framework import serializers
from django.utils import timezone

class ClassCreateSerializer(serializers.ModelSerializer):
    language = serializers.PrimaryKeyRelatedField(queryset=Language.objects.all())
    level    = serializers.PrimaryKeyRelatedField(queryset=Level.objects.all())
    teacher  = serializers.PrimaryKeyRelatedField(queryset=Teacher.objects.all())

    class Meta:
        model  = Class
        fields = [
            'name', 'language', 'level',
            'teacher', 'start_date', 'status'
        ]

    def validate_start_date(self, value):
        if value < timezone.now().date():
            raise serializers.ValidationError("Start date cannot be in the past.")
        return value

    def create(self, validated_data):
        from .services import create_class
        return create_class(validated_data)

    def update(self, instance, validated_data):
        from .services import update_class
        return update_class(instance, validated_data)

class ClassSerializer(serializers.ModelSerializer):
    language = LanguageSerializer(read_only=True)
    level    = LevelSerializer(read_only=True)
    teacher  = serializers.StringRelatedField(read_only=True)

    class Meta:
        model  = Class
        fields = [
            'id', 'name', 'language', 'level',
            'teacher', 'start_date', 'status'
        ]



# ──────────────────────────────
# SCHEDULE
# ──────────────────────────────

class ScheduleSerializer(serializers.ModelSerializer):
    
    classroom = ClassroomSerializer(read_only=True)

    class Meta:
        model  = Schedule
        fields = [
            'id', 'class_obj', 'classroom',
            'day_of_week', 'start_time', 'end_time'
        ]


class ScheduleCreateSerializer(serializers.ModelSerializer):
    

    class Meta:
        model  = Schedule
        fields = [
            'class_obj', 'classroom',
            'day_of_week', 'start_time', 'end_time'
        ]

    def validate_day_of_week(self, value):
        valid_days = [
            'monday', 'tuesday', 'wednesday',
            'thursday', 'friday', 'saturday', 'sunday'
        ]
        if value.lower() not in valid_days:
            raise serializers.ValidationError("Invalid day of week.")
        return value.lower()

    def validate(self, data):
        if data['start_time'] >= data['end_time']:
            raise serializers.ValidationError({
                'end_time': "End time must be after start time."
            })
        return data

    def create(self, validated_data):
        from .services import create_schedule
        return create_schedule(validated_data)


# we add this for consistance api response 
class BusyTimeSerializer(serializers.Serializer):
    
    day_of_week = serializers.CharField()
    start_time  = serializers.TimeField()
    end_time    = serializers.TimeField()