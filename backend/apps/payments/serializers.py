from rest_framework import serializers
from apps.payments.models import Payment


class PaymentSerializer(serializers.ModelSerializer):

    inscription_id = serializers.IntegerField(source='inscription.id', read_only=True)
    student_id     = serializers.IntegerField(source='inscription.student_id', read_only=True)
    student_name   = serializers.SerializerMethodField()
    language       = serializers.SerializerMethodField()
    class_name     = serializers.SerializerMethodField()

    class Meta:
        model = Payment
        fields = [
            'id',
            'inscription_id',
            'student_id',
            'student_name',
            'language',
            'class_name',
            'amount',
            'status',
            'payment_date',
            'remark',
        ]
        read_only_fields = fields

    def get_student_name(self, obj):
        person = obj.inscription.student.person
        return f"{person.first_name} {person.last_name}"

    def get_language(self, obj):
        return str(obj.inscription.enrolled_class.language)

    def get_class_name(self, obj):
        return obj.inscription.enrolled_class.name

class PaymentUpdateSerializer(serializers.Serializer):

    amount = serializers.DecimalField(max_digits=10, decimal_places=2, min_value=0, required=False)
    status = serializers.ChoiceField(choices=Payment.Status.choices, required=False)
    remark = serializers.CharField(required=False, allow_blank=True)


class PaymentCreateSerializer(serializers.Serializer):

    inscription_id = serializers.IntegerField()
    amount         = serializers.DecimalField(max_digits=10, decimal_places=2, min_value=0)
    method         = serializers.CharField(max_length=50, required=False, default='cash')


class MonthlyRevenueSerializer(serializers.Serializer):

    month      = serializers.IntegerField()
    month_name = serializers.CharField()
    total      = serializers.DecimalField(max_digits=12, decimal_places=2)


class RevenueStatsSerializer(serializers.Serializer):

    year         = serializers.IntegerField()
    stats        = MonthlyRevenueSerializer(many=True)
    annual_total = serializers.DecimalField(max_digits=14, decimal_places=2)