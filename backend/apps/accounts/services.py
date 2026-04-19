# services.py

from django.contrib.auth.hashers import check_password, make_password
from django.db import models, transaction
from .models import Account, Role
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError




def login(username: str, password: str) -> Account:
    try:
        # to query all data in one query for better proformence
        account = Account.objects.select_related(
            'role', 'student', 'employee'
        ).get(username=username)
    except Account.DoesNotExist:
        raise ValueError("Username or password is incorrect.")

    if account.status != 'active':
        raise ValueError("Invalid credentials.")

    if not check_password(password, account.password_hash):
        raise ValueError("Username or password is incorrect.")

    return account


def logout(refresh_token_str: str) -> None:
    
    try:
        token = RefreshToken(refresh_token_str)
        token.blacklist()
    except TokenError:
        raise ValueError("Invalid or already-revoked token.")


def refresh_token(refresh_token_str: str) -> dict:
    from rest_framework_simplejwt.tokens import RefreshToken
    from rest_framework_simplejwt.exceptions import TokenError

    try:
        token = RefreshToken(refresh_token_str)
        return {'access': str(token.access_token)}
    except TokenError:
        raise ValueError("Invalid or expired refresh token.")


def reset_password(account_id: int, old_password: str, new_password: str) -> None:
    try:
        account = Account.objects.get(pk=account_id)
    except Account.DoesNotExist:
        raise ValueError("Account not found.")

    if not check_password(old_password, account.password_hash):
        raise ValueError("Old password is incorrect.")

    
    if check_password(new_password, account.password_hash):
        raise ValueError("New password must differ from the current password.")

    account.password_hash = make_password(new_password)
    account.save(update_fields=['password_hash'])


# acc management

def create_account(person, role_name: str,  username: str, raw_password: str) -> Account:
    from apps.persons.models import Student, Employee

    try:
        role = Role.objects.get(name=role_name)
    except Role.DoesNotExist:
        raise ValueError("Invalid role.")

    #
    if isinstance(person, Student) and role.name != 'student':
        raise ValueError("Student must have 'student' role.")
    if isinstance(person, Employee) and role.name == 'student':
        raise ValueError("Employee cannot have 'student' role.")


    hashed_password = make_password(raw_password)

    with transaction.atomic():
        kwargs = dict(
            username=username,
            
            role=role,
            password_hash=hashed_password,
        )

        if isinstance(person, Student):
            kwargs['student'] = person
        elif isinstance(person, Employee):
            kwargs['employee'] = person
        else:
            raise ValueError(f"Unsupported person type: {type(person)}")

        return Account.objects.create(**kwargs)


def deactivate_account(account_id: int) -> Account:
    return _set_status(account_id, 'inactive')


def activate_account(account_id: int) -> Account:
    return _set_status(account_id, 'active')


def get_account_by_person(person_id: int) -> Account:
    account = (
        Account.objects
        .select_related('role', 'student', 'employee')
        .filter(
            models.Q(student_id=person_id) |
            models.Q(employee_id=person_id)
        )
        .first()
    )

    if not account:
        raise ValueError(f"No account found for person_id={person_id}.")

    return account


def _set_status(account_id: int, new_status: str) -> Account:
    try:
        account = Account.objects.get(pk=account_id)
    except Account.DoesNotExist:
        raise ValueError("Account not found.")

    account.status = new_status
    account.save(update_fields=['status'])
    return account