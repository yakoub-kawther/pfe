from rest_framework import serializers
from apps.accounts.models import Account
from .models import Notification, NotificationReceiver


class SenderSerializer(serializers.ModelSerializer):
    class Meta:
        model = Account
        fields = ['id', 'username']


class NotificationSerializer(serializers.ModelSerializer):
    sender = SenderSerializer(source='notification.sender', read_only=True)
    notification_id = serializers.IntegerField(source='notification.id', read_only=True)
    type = serializers.CharField(source='notification.type', read_only=True)
    title = serializers.CharField(source='notification.title', read_only=True)
    body = serializers.CharField(source='notification.body', read_only=True)
    sent_at = serializers.DateTimeField(source='notification.sent_at', read_only=True)

    class Meta:
        model = NotificationReceiver
        fields = [
            'id',
            'notification_id',
            'sender',
            'type',
            'title',
            'body',
            'sent_at',
            'is_read',
            'read_at',
        ]

class NotificationCreateSerializer(serializers.Serializer):
    notification_type = serializers.ChoiceField(choices=Notification.Type.choices)
    title = serializers.CharField(max_length=150)
    body = serializers.CharField()
    target = serializers.ChoiceField(choices=[
        ('specific', 'Specific Receivers'),
        ('class', 'Entire Class'),
        ('all_students', 'All Students'),
        ('all_teachers', 'All Teachers'),
    ])
    receiver_ids = serializers.ListField(
        child=serializers.IntegerField(),
        required=False,
    )
    class_id = serializers.IntegerField(required=False)

    def validate(self, data):
        target = data.get('target')
        if target == 'specific' and not data.get('receiver_ids'):
            raise serializers.ValidationError({
                "receiver_ids": "Required when target is 'specific'."
            })
        if target == 'class' and not data.get('class_id'):
            raise serializers.ValidationError({
                "class_id": "Required when target is 'class'."
            })
        return data

    def validate_receiver_ids(self, value):
        value = list(set(value))
        existing_ids = set(
            Account.objects.filter(id__in=value).values_list('id', flat=True)
        )
        invalid = set(value) - existing_ids
        if invalid:
            raise serializers.ValidationError(
                f"These account IDs do not exist: {invalid}"
            )
        return value
    

    def create(self, validated_data):
     from .services import (
        send_notification,
        send_to_class,
        send_to_all_students,
        send_to_all_teachers,
     )

     sender = self.context['request'].user
     target = validated_data['target']
     notification_type = validated_data['notification_type']
     title = validated_data['title']
     body = validated_data['body']

     if target == 'specific':
        receivers = list(Account.objects.filter(id__in=validated_data['receiver_ids']))
        return send_notification(sender, receivers, notification_type, title, body)

     elif target == 'class':
        return send_to_class(sender, validated_data['class_id'], notification_type, title, body)

     elif target == 'all_students':
        return send_to_all_students(sender, notification_type, title, body)

     elif target == 'all_teachers':
        return send_to_all_teachers(sender, notification_type, title, body)