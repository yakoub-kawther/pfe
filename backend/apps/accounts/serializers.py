from rest_framework import serializers
from django.contrib.auth.hashers import check_password
from .models import Account


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        username = data.get('username')
        password = data.get('password')

        # 1. find account
        try:
            account = Account.objects.select_related(
                'role',
                'student__person',
                'employee__person',
            ).get(username=username)
        except Account.DoesNotExist:
            raise serializers.ValidationError("username or password is incorrect.")

        # 2. check status
        if account.status != 'active':
            raise serializers.ValidationError("Account is inactive.")

        # 3. check password
        if not check_password(password, account.password_hash):
            raise serializers.ValidationError("username or password is incorrect.")

        # 4. get person info
        if account.student:
            person = account.student.person
        else:
            person = account.employee.person

        data['account']   = account
        data['role']      = account.role.name
        data['full_name'] = f"{person.first_name} {person.last_name}"

        return data