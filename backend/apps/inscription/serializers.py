from rest_framework import serializers
from .models import Inscription
from apps.academic.models import Class


class ClassSummarySerializer(serializers.ModelSerializer):
    language = serializers.StringRelatedField()
    level    = serializers.StringRelatedField()

    class Meta:
        model  = Class
        fields = ['id', 'name', 'language', 'level', 'start_date', 'status']


class InscriptionSerializer(serializers.ModelSerializer):
    """Minimal – used for create / update responses."""

    class Meta:
        model  = Inscription
        fields = ['id', 'student', 'class_id', 'inscription_date', 'status']
        read_only_fields = ['inscription_date', 'student']  


class InscriptionDetailSerializer(serializers.ModelSerializer):
    """Full detail – used for history & current enrollment."""

    class_info   = ClassSummarySerializer(source='class_id', read_only=True)
    student_name = serializers.SerializerMethodField()

    class Meta:
        model  = Inscription
        fields = [
            'id',
            'student',
            'student_name',
            'class_info',
            'inscription_date',
            'status',
        ]
        read_only_fields = ['inscription_date', 'student']

    def get_student_name(self, obj):
        person = obj.student.person
        return f"{person.first_name} {person.last_name}"