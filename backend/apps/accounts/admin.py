# apps/accounts/admin.py

from django.contrib import admin
from .models import Account, Role


@admin.register(Role)
class RoleAdmin(admin.ModelAdmin):
    list_display  = ['id', 'name']
    search_fields = ['name']


@admin.register(Account)
class AccountAdmin(admin.ModelAdmin):
    list_display   = ['id', 'role', 'status', 'created_at' , 'password_hash']
    list_filter    = ['role', 'status']
    search_fields  = ['student__person__first_name',
                      'employee__person__first_name']
    readonly_fields = ['created_at']