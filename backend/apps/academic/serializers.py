from rest_framework import serializers
from rest_framework.validators import UniqueValidator
from .models import Language, Position



class PositionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Position
        fields = ['id', 'name']


class LanguageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Language
        fields = ['id', 'language_name', 'shortcut']
