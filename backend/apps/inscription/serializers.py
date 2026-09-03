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
    """Minimal — used for create / update responses. Includes payment status."""
    payment_status = serializers.SerializerMethodField()
    payment_id     = serializers.SerializerMethodField()

    class Meta:
        model  = Inscription
        fields = ['id', 'student', 'enrolled_class', 'inscription_date', 'status', 'payment_id', 'payment_status']
        read_only_fields = ['inscription_date']

    def get_payment_status(self, obj):
        payment = getattr(obj, 'payment', None)
        return payment.status if payment else None

    def get_payment_id(self, obj):
        payment = getattr(obj, 'payment', None)
        return payment.id if payment else None


class InscriptionDetailSerializer(serializers.ModelSerializer):
    """Full detail — used for history & current enrollment."""
    class_info     = ClassSummarySerializer(source='enrolled_class', read_only=True)
    student_name   = serializers.SerializerMethodField()
    payment_status = serializers.SerializerMethodField()
    payment_id     = serializers.SerializerMethodField()

    class Meta:
        model  = Inscription
        fields = [
            'id',
            'student',
            'student_name',
            'class_info',
            'inscription_date',
            'status',
            'payment_id',
            'payment_status',
        ]
        read_only_fields = ['inscription_date', 'student']

    def get_student_name(self, obj):
        person = obj.student.person
        return f"{person.first_name} {person.last_name}"

    def get_payment_status(self, obj):
        payment = getattr(obj, 'payment', None)
        return payment.status if payment else None

    def get_payment_id(self, obj):
        payment = getattr(obj, 'payment', None)
        return payment.id if payment else None


class TransitionSerializer(serializers.Serializer):
    """Used for promote and repeat actions."""
    new_class_id = serializers.IntegerField()



class EnrollmentGrowthPointSerializer(serializers.Serializer):
    month = serializers.DateField()
    net   = serializers.IntegerField()
    total = serializers.IntegerField()