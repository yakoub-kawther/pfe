# apps/accounts/authentication.py

from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken
from .models import Account

# token checker for accounts
class AccountJWTAuthentication(JWTAuthentication):
    
    def get_user(self, validated_token):
        print(">>> AccountJWTAuthentication.get_user called")
        account_id = validated_token.get('account_id')
        if not account_id:
            raise InvalidToken('Token contained no recognizable user identification')
        try:
            return Account.objects.get(pk=account_id)
        except Account.DoesNotExist:
            raise InvalidToken('Account not found')