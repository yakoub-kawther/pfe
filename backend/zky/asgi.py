import os
from django.core.asgi import get_asgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'zky.settings')

# This line MUST come before importing anything that touches models/apps
django_asgi_app = get_asgi_application()

from channels.routing import ProtocolTypeRouter, URLRouter
from apps.accounts.ws_auth import JWTAuthMiddleware
from apps.notifications import routing as notif_routing

application = ProtocolTypeRouter({
    "http": django_asgi_app,
    "websocket": JWTAuthMiddleware(
        URLRouter(
            notif_routing.websocket_urlpatterns
        )
    ),
})