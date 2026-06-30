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
            'payment_date',
            'status',
        ]

    def get_employee_name(self, obj):
        return str(obj.employee)

    def validate_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError("Le montant doit être supérieur à 0.")
        return value


class SalaryUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Salary
        fields = ['amount', 'payment_date', 'status']

    def validate_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError("must be grater then 0.")
        return value


class SalaryStatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = Salary
        fields = ['status']