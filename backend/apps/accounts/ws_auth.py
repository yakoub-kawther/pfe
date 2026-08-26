from urllib.parse import parse_qs
from channels.db import database_sync_to_async
from rest_framework_simplejwt.tokens import AccessToken
from rest_framework_simplejwt.exceptions import TokenError
from .models import Account


@database_sync_to_async
def get_account_from_token(token_str):
    try:
        validated_token = AccessToken(token_str)
        account_id = validated_token.get('account_id')
        return Account.objects.get(pk=account_id)
    except (TokenError, Account.DoesNotExist) as e:
        print(">>> WS AUTH FAILED:", repr(e))
        return None


class JWTAuthMiddleware:
    """Reads ?token=xxx from the WebSocket URL and attaches the Account to scope['user']."""

    def __init__(self, app):
        self.app = app

    async def __call__(self, scope, receive, send):
        query_string = scope.get("query_string", b"").decode()
        params = parse_qs(query_string)
        token = params.get("token", [None])[0]

        scope["user"] = await get_account_from_token(token) if token else None
        return await self.app(scope, receive, send)