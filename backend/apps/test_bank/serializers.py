from rest_framework import serializers
from .models import Note


class NoteSerializer(serializers.ModelSerializer):
    """Used for reading — single note record."""
    student_name = serializers.SerializerMethodField()
    class_name   = serializers.SerializerMethodField()

    class Meta:
        model  = Note
        fields = [
            'id', 'inscription', 'component',
            'mark', 'is_passed', 'date',
            'student_name', 'class_name',
        ]
        read_only_fields = ['is_passed', 'date']

    def get_student_name(self, obj):
        person = obj.inscription.student.person
        return f"{person.first_name} {person.last_name}"

    def get_class_name(self, obj):
        return obj.inscription.enrolled_class.name


class NoteCreateSerializer(serializers.Serializer):
    """Used for creating a note."""
    inscription_id = serializers.IntegerField()
    component      = serializers.ChoiceField(choices=Note.Component.choices)
    mark           = serializers.FloatField(min_value=0, max_value=100)


class NoteUpdateSerializer(serializers.Serializer):
    """Used for updating a note."""
    mark = serializers.FloatField(min_value=0, max_value=100)


class FinalResultSerializer(serializers.Serializer):
    """Used for final result of an inscription."""
    oral       = serializers.FloatField(allow_null=True)
    written    = serializers.FloatField(allow_null=True)
    final_mark = serializers.FloatField(allow_null=True)
    is_passed  = serializers.BooleanField(allow_null=True)
    detail     = serializers.CharField(required=False)