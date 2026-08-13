from django.db import transaction, IntegrityError
from rest_framework.validators import ValidationError
from .models import Language, Level, Position, Classroom, Class, Schedule, Session
from datetime import date, timedelta


# languages part

def create_language(data):
    try:
        language = Language.objects.create(
            language_name=data.get('language_name'),
            shortcut=data.get('shortcut')
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
def update_classroom(classroom, data):
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

from datetime import date

def get_current_academic_year():
    return date.today().year

MAX_NAME_ATTEMPTS = 30

def build_class_name_base(language, level, teacher):
    person = teacher.employee.person
    last_name = person.last_name.strip().title().replace(" ", "")
    lang_code = (language.shortcut or language.language_name[:2]).upper()
    return f"{lang_code}-{level.level_name.upper()}-{last_name}"


def generate_class_name(language, level, teacher):
    """Used by the suggest_name preview endpoint -- best-effort, not reserved."""
    base = build_class_name_base(language, level, teacher)
    existing = Class.objects.filter(name__startswith=f"{base}-").count()
    return f"{base}-{existing + 1:02d}"


@transaction.atomic
def create_class(data):
    required_fields = ['teacher', 'language', 'name', 'level']
    missing = [f for f in required_fields if f not in data or data[f] is None]
    if missing:
        raise ValidationError(f"Missing required fields: {', '.join(missing)}")

    teacher = data['teacher']
    class_lang = data['language']

    if teacher.language_id != class_lang.id:
        raise ValidationError("Teacher cannot be assigned to this class.")

    requested_name = data['name']

    # Lock rows sharing this class's base name pattern so concurrent
    # requests serialize here instead of racing on the same suffix.
    base = build_class_name_base(class_lang, data['level'], teacher)
    Class.objects.select_for_update().filter(name__startswith=f"{base}-")

    name = requested_name
    for attempt in range(MAX_NAME_ATTEMPTS):
        try:
            return Class.objects.create(
                name=name,
                language=class_lang,
                level=data['level'],
                teacher=teacher,
                start_date=data.get('start_date'),
                academic_year=get_current_academic_year(),
                status=data.get('status', 'scheduled'),
            )
        except IntegrityError:
            # The DB is the real referee here: if `name` collided (whether
            # from a race or the user editing the suggestion into an
            # existing name), bump the suffix and retry rather than fail.
            attempt_num = attempt + 2  # start at -02 since -01 (or requested_name) just collided
            name = f"{base}-{attempt_num:02d}"

    raise ValidationError("Could not generate a unique class name, please try again.")



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
        day_of_week=day_of_week,
        start_time__lt=end_time,
        end_time__gt=start_time,
        class_obj__status='active'
    ).values_list('classroom_id', flat=True)

    return Classroom.objects.exclude(id__in=busy_classrooms)


MAX_SESSIONS = 12

DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']


def generate_sessions(schedule) -> None:
    start_date = schedule.class_obj.start_date
    for i in range(MAX_SESSIONS):
        Session.objects.create(
            schedule=schedule,
            session_date=start_date + timedelta(weeks=i),
            status='scheduled'
        )


def get_next_weekday_date(day_of_week, from_date=None):
    """
    Return the next date (>= from_date, defaults to today) that falls on
    day_of_week. If from_date already IS that weekday, returns from_date.
    """
    from_date = from_date or date.today()
    target = DAYS.index(day_of_week)
    days_ahead = (target - from_date.weekday()) % 7
    return from_date + timedelta(days=days_ahead)


def get_weekday_date_in_week(day_of_week, week_start=None):
    """
    Return the date for `day_of_week` within the week containing `week_start`.
    Defaults to the current week. Unlike get_next_weekday_date, this can
    return a date in the past relative to today (e.g. today is Thursday,
    day_of_week is 'monday' -> returns this week's Monday, already gone).
    """
    monday = week_start or (date.today() - timedelta(days=date.today().weekday()))
    return monday + timedelta(days=DAYS.index(day_of_week))


@transaction.atomic
def create_schedule(data):
    # not a Schedule model field -- pop it now so it never reaches
    # Schedule.objects.create(**data) below
    start_this_week = data.pop('start_this_week', False)

    if data['start_time'] >= data['end_time']:
        raise ValidationError("End time must be after start time.")

    class_obj = data['class_obj']
    day_of_week = data['day_of_week'].lower()

    if day_of_week not in DAYS:
        raise ValidationError("Invalid day_of_week.")

    if class_obj.start_date is None:
        # First schedule for this class -> derive start_date, will activate below
        if start_this_week:
            class_obj.start_date = get_weekday_date_in_week(day_of_week)
        else:
            class_obj.start_date = get_next_weekday_date(day_of_week)
    else:
        # Class already has a start_date -> keep it aligned with day_of_week
        if DAYS[class_obj.start_date.weekday()] != day_of_week:
            raise ValidationError(
                f"Start date {class_obj.start_date} is a "
                f"{DAYS[class_obj.start_date.weekday()].capitalize()}, "
                f"but schedule day is {day_of_week.capitalize()}."
            )

    start_date = class_obj.start_date

    # Teacher conflict
    if Schedule.objects.filter(
        class_obj__teacher=class_obj.teacher,
        day_of_week=day_of_week,
        start_time__lt=data['end_time'],
        end_time__gt=data['start_time'],
        class_obj__status='active'
    ).exclude(class_obj=class_obj).exists():
        raise ValidationError("Teacher is already busy at this time.")

    # Classroom conflict
    if Schedule.objects.filter(
        classroom=data['classroom'],
        day_of_week=day_of_week,
        start_time__lt=data['end_time'],
        end_time__gt=data['start_time'],
        class_obj__status='active'
    ).exists():
        raise ValidationError("Classroom is already booked at this time.")

    schedule = Schedule.objects.create(**data)

    if class_obj.status == 'scheduled':
        class_obj.status = 'active'
    class_obj.save(update_fields=['start_date', 'status'])

    generate_sessions(schedule)
    return schedule


def get_class_progress(class_id) -> dict:
    sessions = Session.objects.filter(schedule__class_obj__id=int(class_id))
    total = sessions.count()
    completed = sessions.filter(status='completed').count()

    if MAX_SESSIONS == 0:
        progress = 0
    else:
        progress = round((completed / MAX_SESSIONS) * 100, 1)

    return {
        'total': total,
        'completed': completed,
        'remaining': MAX_SESSIONS - completed,
        'progress_percent': progress,
    }


def complete_session(session) -> Session:
    session.status = 'completed'
    session.save(update_fields=['status'])

    _maybe_complete_class(session.schedule.class_obj)

    return session


def _maybe_complete_class(class_obj) -> None:
    """
    If every session across all of this class's schedules is completed,
    mark the class itself as 'completed'. Only touches classes that are
    still 'active' -- won't silently override a manually cancelled class.
    """
    if class_obj.status != 'active':
        return

    sessions = Session.objects.filter(schedule__class_obj=class_obj)
    all_done = sessions.exists() and not sessions.exclude(status='completed').exists()

    if all_done:
        class_obj.status = 'completed'
        class_obj.save(update_fields=['status'])



