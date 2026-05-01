from rest_framework import serializers
from apps.payments.models import Payment


class PaymentSerializer(serializers.ModelSerializer):

    inscription_id = serializers.IntegerField(source='inscription.id', read_only=True)
    student_name = serializers.SerializerMethodField()
    level_name = serializers.SerializerMethodField()

    class Meta:
        model = Payment
        fields = [
            'id',
            'inscription_id',
            'student_name',
            'level_name',
            'amount',
            'status',
            'payment_date',
        ]
        read_only_fields = fields

    def get_student_name(self, obj):
        student = obj.inscription.student
        return f"{student.first_name} {student.last_name}"

    def get_level_name(self, obj):
        return str(obj.inscription.level)


class PaymentCreateSerializer(serializers.Serializer):

    inscription_id = serializers.IntegerField()
    amount = serializers.DecimalField(max_digits=10, decimal_places=2, min_value=0)
    method = serializers.CharField(max_length=50, required=False, default='cash')


class MonthlyRevenueSerializer(serializers.Serializer):

    month = serializers.IntegerField()
    month_name = serializers.CharField()
    total = serializers.DecimalField(max_digits=12, decimal_places=2)


class RevenueStatsSerializer(serializers.Serializer):

    year = serializers.IntegerField()
    stats = MonthlyRevenueSerializer(many=True)
    annual_total = serializers.DecimalField(max_digits=14, decimal_places=2)