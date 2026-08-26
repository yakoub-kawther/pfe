from rest_framework import status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.viewsets import GenericViewSet
from rest_framework.permissions import IsAuthenticated

from .models import NotificationReceiver
from .serializers import NotificationSerializer, NotificationCreateSerializer , SentNotificationSerializer
from .services import (
    mark_as_read,
    mark_all_as_read,
    get_my_notifications,
    
    get_my_sent_notifications,
)
from apps.accounts.permissions import IsNotStudent # adjust to your permission class


class NotificationViewSet(GenericViewSet):

    def get_permissions(self):
        if self.action == 'send':
            return [IsAuthenticated(), IsNotStudent()]
        return [IsAuthenticated()]

    
    def list(self, request):
        qs = get_my_notifications(request.user.id)
        serializer = NotificationSerializer(qs, many=True)
        return Response(serializer.data)

    
    @action(detail=False, methods=['post'], url_path='send')
    def send(self, request):
        serializer = NotificationCreateSerializer(
            data=request.data,
            context={'request': request}
        )
        serializer.is_valid(raise_exception=True)
        notification = serializer.save()
        return Response(
            {"detail": "Notification sent successfully.", "notification_id": notification.id},
            status=status.HTTP_201_CREATED,
        )

    
    @action(detail=True, methods=['post'], url_path='read')
    def read(self, request, pk=None):
        try:
            nr = mark_as_read(notification_receiver_id=pk)
        except NotificationReceiver.DoesNotExist:
            return Response(
                {"detail": "Notification not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        if nr.receiver_id != request.user.id:
            return Response(
                {"detail": "Not allowed."},
                status=status.HTTP_403_FORBIDDEN,
            )

        return Response({"detail": "Marked as read."})

    
    @action(detail=False, methods=['post'], url_path='read-all')
    def read_all(self, request):
        count = mark_all_as_read(request.user.id)
        return Response({"detail": f"{count} notifications marked as read."})


    @action(detail=False, methods=['get'], url_path='sent')
    def sent(self, request):
      qs = get_my_sent_notifications(request.user.id)
      serializer = SentNotificationSerializer(qs, many=True)
      return Response(serializer.data)