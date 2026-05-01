# views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken

from .serializers import (
    LoginSerializer,
    AccountSerializer,
    PasswordResetSerializer,
    TokenSerializer,
)
from . import services


# takes user acc and create JWT token

def _build_tokens(account) -> dict:
    
    refresh = RefreshToken()
    refresh['account_id'] = account.id
    refresh['role']       = account.role.name
    refresh['full_name']  = account.username   # uses the model property
    return {
        'access':  str(refresh.access_token),
        'refresh': str(refresh),
    }




class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        account = serializer.validated_data['account']
        tokens  = _build_tokens(account)

        return Response({
            'role':      account.role.name,
            'full_name': account.username,
            **tokens,               # access + refresh
        }, status=status.HTTP_200_OK)




class LogoutView(APIView):
    
    #
    permission_classes = [IsAuthenticated]

    def post(self, request):
        refresh = request.data.get('refresh')
        if not refresh:
            return Response(
                {"detail": "refresh token is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        try:
            services.logout(refresh)
        except ValueError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)

        return Response({"detail": "Logged out successfully."}, status=status.HTTP_200_OK)




class RefreshView(APIView):
    
    permission_classes = [AllowAny]

    def post(self, request):
        refresh = request.data.get('refresh')
        if not refresh:
            return Response(
                {"detail": "refresh token is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        try:
            result = services.refresh_token(refresh)
            print("result:", result)
        except ValueError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_401_UNAUTHORIZED)

        
        return Response(result, status=status.HTTP_200_OK)




class ResetPasswordView(APIView):
    
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = PasswordResetSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        account_id   = request.auth.get('account_id')
        old_password = serializer.validated_data['old_password']
        new_password = serializer.validated_data['new_password']

        try:
            services.reset_password(account_id, old_password, new_password)
        except ValueError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)

        return Response({"detail": "Password updated successfully."}, status=status.HTTP_200_OK)




class AccountDetailView(APIView):
    
    permission_classes = [IsAuthenticated]

    def get(self, request):
        account_id = request.auth.get('account_id')
        try:
            from .models import Account
            account = Account.objects.select_related(
                'role', 'student', 'employee'
            ).get(pk=account_id)
        except Account.DoesNotExist:
            return Response({"detail": "Account not found."}, status=status.HTTP_404_NOT_FOUND)

        serializer = AccountSerializer(account)
        return Response(serializer.data, status=status.HTTP_200_OK)


# views.py - add this class

class CreateAccountView(APIView):
    permission_classes = [AllowAny]  # or AllowAny if you want it open

    def post(self, request):
        from apps.persons.models import Student, Employee

        person_type = request.data.get('person_type')  # 'student' or 'employee'
        person_id   = request.data.get('person_id')
        role_name   = request.data.get('role')
        username    = request.data.get('username')
        password    = request.data.get('password')

        if not all([person_type, person_id, role_name, username, password]):
            return Response({"detail": "All fields are required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            if person_type == 'student':
                person = Student.objects.get(pk=person_id)
            elif person_type == 'employee':
                person = Employee.objects.get(pk=person_id)
            else:
                return Response({"detail": "person_type must be 'student' or 'employee'."}, status=status.HTTP_400_BAD_REQUEST)
        except (Student.DoesNotExist, Employee.DoesNotExist):
            return Response({"detail": "Person not found."}, status=status.HTTP_404_NOT_FOUND)

        try:
            account = services.create_account(
                person=person,
                role_name=role_name,
                username=username,
                raw_password=password,
            )
        except ValueError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)

        return Response(AccountSerializer(account).data, status=status.HTTP_201_CREATED)
    

# views.py

class ToggleAccountStatusView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, account_id):
        from .models import Account
        try:
            account = Account.objects.get(pk=account_id)
        except Account.DoesNotExist:
            return Response({"detail": "Account not found."}, status=status.HTTP_404_NOT_FOUND)

        account.status = 'inactive' if account.status == 'active' else 'active'
        account.save()

        return Response({
            "detail": f"Account {account.status}d successfully.",
            "status": account.status
        }, status=status.HTTP_200_OK)