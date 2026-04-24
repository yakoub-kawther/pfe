from django.db import transaction, IntegrityError
from rest_framework.validators import ValidationError
from .models import Language , Level , Position , Classroom , Class , Schedule , Session
from datetime import timedelta


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
     


# class part 



@transaction.atomic
def create_class(data):
    # Validate required fields are present
    required_fields = ['teacher', 'language', 'name', 'level', 'start_date']
    missing = [f for f in required_fields if f not in data or data[f] is None]
    if missing:
        raise ValidationError(f"Missing required fields: {', '.join(missing)}")

    teacher = data['teacher']
    class_lang = data['language']

    # Validate teacher-language compatibility
    if teacher.language_id != class_lang.id:
        raise ValidationError("Teacher cannot be assigned to this class.")

    # Isolate DB errors to the create call only
    try:
        return Class.objects.create(
            name=data['name'],
            language=class_lang,
            level=data['level'],
            teacher=teacher,
            start_date=data['start_date'],
            status=data.get('status', 'active'),
        )
    except IntegrityError:
        raise ValidationError("A class with this name and start date already exists.")


@transaction.atomic
def update_class(class_obj, data):
    for field in ['name', 'language', 'level', 'teacher', 'start_date', 'status']:
        if field in data:
            setattr(class_obj, field, data[field])

    try:
        class_obj.save()
    except IntegrityError:
        raise ValidationError("Class with this name and start date already exists.")

    return class_obj




# schedule part


def get_active_classes():
    return Class.objects.filter(
        status='active'
    ).select_related('language', 'level', 'teacher') 



def get_teacher_busy_times(class_id):
    
    class_obj = Class.objects.filter(pk=class_id).first()
    if not class_obj:
        raise ValidationError("Class not found.")
    
    
    
    busy_times = Schedule.objects.filter(
    class_obj__teacher=class_obj.teacher,
    class_obj__status='active'
    ).exclude(
    class_obj=class_obj
    ).values('day_of_week', 'start_time', 'end_time')

    return list(busy_times)




def get_available_classrooms(day_of_week, start_time, end_time):
    
    busy_classrooms = Schedule.objects.filter(
        day_of_week    = day_of_week,
        start_time__lt = end_time,
        end_time__gt   = start_time,
        class_obj__status = 'active'
    ).values_list('classroom_id', flat=True)

    return Classroom.objects.exclude(id__in=busy_classrooms)




@transaction.atomic
def create_schedule(data):
    if data['start_time'] >= data['end_time']:
        raise ValidationError("End time must be after start time.")

    # Teacher conflict FIRST
    if Schedule.objects.filter(
        class_obj__teacher=data['class_obj'].teacher,
        day_of_week=data['day_of_week'],
        start_time__lt=data['end_time'],
        end_time__gt=data['start_time'],
        class_obj__status='active'
    ).exclude(class_obj=data['class_obj']).exists():
        raise ValidationError("Teacher is already busy at this time.")

    # Classroom conflict SECOND
    if Schedule.objects.filter(
        classroom=data['classroom'],
        day_of_week=data['day_of_week'],
        start_time__lt=data['end_time'],
        end_time__gt=data['start_time'],
        class_obj__status='active'
    ).exists():
        raise ValidationError("Classroom is already booked at this time.")

    schedule = Schedule.objects.create(**data)
    # generate_sessions(schedule)
    return schedule




MAX_SESSIONS = 16


def create_session(schedule):
    total = Session.objects.filter(schedule__class_obj=schedule.class_obj).count()

    if total >= MAX_SESSIONS:
        raise ValidationError("This class has reached the maximum of 16 sessions.")

    return Session.objects.create(
        schedule=schedule,
        status='scheduled'
    )


def complete_session(session):
    session.status = 'completed'
    session.save()


def reschedule_session(session, new_date):
    session.session_date = new_date
    session.status       = 'rescheduled'
    session.save()


def get_class_progress(class_id):
    sessions  = Session.objects.filter(schedule__class_obj__id=class_id)
    total     = sessions.count()
    completed = sessions.filter(status='completed').count()

    return {
        'total':            total,
        'completed':        completed,
        'remaining':        MAX_SESSIONS - completed,
        'progress_percent': round((completed / MAX_SESSIONS) * 100, 1)
    }