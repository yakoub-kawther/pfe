from rest_framework import serializers
from .models import Salary


class SalarySerializer(serializers.ModelSerializer):
    employee_name = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Salary
        fields = [
            'id',
            'employee',
            'employee_name',
            'amount',
            'month',
            'year',
            'payment_date',
            'status',
            'remark',
        ]
        read_only_fields = ['id', 'employee', 'employee_name', 'month', 'year', 'payment_date']

    def get_employee_name(self, obj):
        return str(obj.employee)


class SalaryUpdateSerializer(serializers.Serializer):
    amount = serializers.DecimalField(max_digits=10, decimal_places=2, required=False)
    status = serializers.ChoiceField(choices=Salary.Status.choices, required=False)
    remark = serializers.CharField(required=False, allow_blank=True)

    def validate_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError("Le montant doit être supérieur à 0.")
        return value


class SalaryStatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = Salary
        fields = ['status']


class SalaryCreateSerializer(serializers.ModelSerializer):
    """Create only — employee/month/year are writable here,
    unlike SalarySerializer where they're locked read-only."""

    class Meta:
        model = Salary
        fields = ['id', 'employee', 'amount', 'month', 'year', 'status', 'remark']
        read_only_fields = ['id']

    def validate_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError("Le montant doit être supérieur à 0.")
        return value