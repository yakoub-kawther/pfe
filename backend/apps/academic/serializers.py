from rest_framework import serializers
from rest_framework.validators import UniqueValidator

from .services import create_language, update_language
from .models import Language, Position , Level , Classroom



class PositionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Position
        fields = ['id', 'name']






# language serializers

class LanguageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Language
        fields = ['id', 'language_name', 'shortcut']


class LanguageCreateSerializer(serializers.ModelSerializer):
        class Meta:
          model = Language
          fields = ['id', 'language_name', 'shortcut']
    

        def create(self, validated_data):
           return create_language(validated_data)

        def update(self, instance, validated_data):
           return update_language(instance, validated_data)
        


# Level serializers

class LevelSerializer(serializers.ModelSerializer):
    class Meta:
        model = Level
        fields = ['id', 'level_name']


class LevelCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Level
        fields = ['level_name']
    
    def create(self, validated_data):
        from .services import create_level
        return create_level(validated_data)
    
    def update(self, instance, validated_data):
        from .services import update_level
        return update_level(instance, validated_data)
    

# Classroom serializers

class ClassroomSerializer(serializers.ModelSerializer):
    class Meta:
        model = Classroom
        fields = ['id', 'name', 'capacity']


class ClassroomCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Classroom
        fields = ['name', 'capacity']
    
    def create(self, validated_data):
        from .services import create_classroom
        return create_classroom(validated_data)
    
    def update(self, instance, validated_data):
        from .services import update_classroom
        return update_classroom(instance, validated_data)
    

# position serializers
class PositionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Position
        fields = ['id', 'name']


class PositionCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Position
        fields = ['name']
    
    def create(self, validated_data):
        from .services import create_position
        return create_position(validated_data)
    
    def update(self, instance, validated_data):
        from .services import update_position
        return update_position(instance, validated_data)