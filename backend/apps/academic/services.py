from django.db import transaction, IntegrityError
from django.core.exceptions import ValidationError
from .models import Language , Level , Position , Classroom
@transaction.atomic

# languages part

def create_language(data):
        try:
          language = Language.objects.create(
            language_name = data.get('language_name'),
            shortcut      = data.get('shortcut')
         )
          return language
        except IntegrityError:
          raise ValidationError("Language already exists.")


@transaction.atomic
def update_language(language, data):
    language.language_name = data.get('language_name', language.language_name)
    language.shortcut = data.get('shortcut', language.shortcut)
    try:
        language.save()
    except IntegrityError:
        raise ValidationError("Language already exists.")

    return language



# levels part
@transaction.atomic
def create_level(data):
    
    
    try:
        return Level.objects.create(level_name=data['level_name'])
        
    except IntegrityError:
        raise ValidationError("level already exists.")

@transaction.atomic   
def update_level(level, data):
    level.level_name = data.get('level_name', level.level_name)
    
    try:
        level.save()
    except IntegrityError:
        raise ValidationError("Level already exists.")
    return level


# classrooms part
@transaction.atomic
def create_classroom(data):
    try:
        return Classroom.objects.create(
            name=data['name'],
            capacity=data['capacity']
        )
    except IntegrityError:
        raise ValidationError("Classroom with this name already exists.")
    
    


@transaction.atomic
def update_classroom(classroom , data):
    classroom.name = data.get('name', classroom.name)
    classroom.capacity = data.get('capacity', classroom.capacity)
    
    try:
        classroom.save()
    except IntegrityError:
        raise ValidationError("Classroom with this name already exists.")
  
    return classroom


# position part
def create_position(data):
    try:
        return Position.objects.create(
            name=data['name']
        )
    except IntegrityError:
        raise ValidationError("Position with this name already exists.")

@transaction.atomic
def update_position(position, data):
    position.name = data.get('name', position.name)
    try:
        position.save()
    except IntegrityError:
        raise ValidationError("Position with this name already exists.")
    return position
     



