from rest_framework import serializers
from django.contrib.auth.hashers import check_password
from .models import Account


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        username = data.get('username')
        password = data.get('password')

        
        try:
            account = Account.objects.select_related(
                'role',
                'student',
                'employee',
            ).get(username=username)
        except Account.DoesNotExist:
            raise serializers.ValidationError("username or password is incorrect.")

        
        if account.status != 'active':
            raise serializers.ValidationError("Account is inactive.")

        
        if not check_password(password, account.password_hash):
            raise serializers.ValidationError("username or password is incorrect.")

        data['account']   = account
        data['role']      = account.role.name
        if account.student:
            data['full_name'] = f"{account.student.first_name} {account.student.last_name}"
        else:
            data['full_name'] = f"{account.employee.first_name} {account.employee.last_name}"

        return data