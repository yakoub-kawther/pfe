from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.permissions import AllowAny
from .serializers import LoginSerializer


def get_tokens(account):
    refresh = RefreshToken()
    refresh['account_id'] = account.id
    refresh['role']       = account.role.name
    refresh['full_name']  = (
        account.student.person.first_name
        if account.student
        else account.employee.person.first_name
    )
    return {
        'refresh': str(refresh),
        'access':  str(refresh.access_token),
    }


class LoginView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        serializer = LoginSerializer(data=request.data)

        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        account   = serializer.validated_data['account']
        role      = serializer.validated_data['role']
        full_name = serializer.validated_data['full_name']
        tokens    = get_tokens(account)

        return Response({
            'role':      role,
            'full_name': full_name,
            'access':    tokens['access'],
            'refresh':   tokens['refresh'],
        }, status=status.HTTP_200_OK)


class LogoutView(APIView):

    def post(self, request):
        try:
            refresh = request.data.get('refresh')
            token   = RefreshToken(refresh)
            token.blacklist()
            return Response({"detail": "Logged out successfully."}, status=status.HTTP_200_OK)
        except Exception:
            return Response({"detail": "Invalid token."}, status=status.HTTP_400_BAD_REQUEST)
