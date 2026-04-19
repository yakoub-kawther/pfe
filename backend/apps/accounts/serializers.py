from rest_framework import serializers
from .models import Account
from .services import login




class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        try:
            account = login(data['username'], data['password'])
        except ValueError as exc:
            raise serializers.ValidationError(str(exc))

        return {'account': account}


class TokenSerializer(serializers.Serializer):
   
    access  = serializers.CharField()
    refresh = serializers.CharField()

class AccountSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()
    role = serializers.CharField(source='role.name', read_only=True)

    class Meta:
        model = Account
        fields = [
            'id',
            'username',
            'role',
            'full_name',
            'status',
            'created_at'
        ]
        read_only_fields = fields

    def get_full_name(self, obj):
        if obj.student:
            return f"{obj.student.person.first_name} {obj.student.person.last_name}"
        if obj.employee:
            return f"{obj.employee.person.first_name} {obj.employee.person.last_name}"
        return None




class PasswordResetSerializer(serializers.Serializer):
    old_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True, min_length=8)

    def validate_new_password(self, value):
        
        if len(value) < 8:
            raise serializers.ValidationError(
                "Password must be at least 8 characters long."
            )
        return value