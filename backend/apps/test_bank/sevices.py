from django.shortcuts import get_object_or_404
from apps.inscription.models import Inscription
from .models import Note

PASS_MARK = 50.0


def create_note(inscription_id: int, component: str, mark: float) -> Note:
    inscription = get_object_or_404(Inscription, pk=inscription_id)

    if component not in Note.Component.values:
        raise ValueError("Invalid component. Must be 'oral' or 'written'.")

    if Note.objects.filter(inscription=inscription, component=component).exists():
        raise ValueError(f"A {component} note already exists for this inscription.")

    if not (0 <= mark <= 100):
        raise ValueError("Mark must be between 0 and 100.")

    return Note.objects.create(
        inscription=inscription,
        component=component,
        mark=mark,
        is_passed=mark >= PASS_MARK,
    )


def update_note(note_id: int, mark: float) -> Note:
    note = get_object_or_404(Note, pk=note_id)

    if not (0 <= mark <= 100):
        raise ValueError("Mark must be between 0 and 100.")

    note.mark      = mark
    note.is_passed = mark >= PASS_MARK
    note.save(update_fields=['mark', 'is_passed'])

    return note


def get_student_notes(student_id: int):
    return (
        Note.objects
        .filter(inscription__student__person_id=student_id)
        .select_related('inscription', 'inscription__enrolled_class')
        .order_by('-date')
    )


def get_class_notes(class_id: int):
    return (
        Note.objects
        .filter(inscription__enrolled_class__id=class_id)
        .select_related('inscription', 'inscription__student__person')
        .order_by('inscription__student__person__first_name')
    )


def get_note_by_inscription(inscription_id: int) -> Note:
    return get_object_or_404(Note, inscription_id=inscription_id)



def calculate_final_result(inscription_id: int) -> dict:
    notes   = Note.objects.filter(inscription_id=inscription_id)
    oral    = notes.filter(component=Note.Component.ORAL).first()
    written = notes.filter(component=Note.Component.WRITTEN).first()

    if not written:
        return {
            'oral':       oral.mark if oral else None,
            'written':    None,
            'final_mark': None,
            'is_passed':  None,
            'detail':     'Written note is required to calculate final result.'
        }

    if oral:
        final_mark = (oral.mark + written.mark) / 2
    else:
        final_mark = written.mark

    return {
        'oral':       oral.mark if oral else None,
        'written':    written.mark,
        'final_mark': round(final_mark, 2),
        'is_passed':  final_mark >= PASS_MARK,
        'detail':     None,
    }