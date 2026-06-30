# apps/accounts/admin.py

from django.contrib import admin
from django.contrib.auth.hashers import make_password
from django import forms
from .models import Account, Role


@admin.register(Role)
class RoleAdmin(admin.ModelAdmin):
    list_display  = ['id', 'name']
    search_fields = ['name']


class AccountAdminForm(forms.ModelForm):
    password_hash = forms.CharField(
        widget=forms.PasswordInput(render_value=False),
        required=False,
        label="Password"
    )

    class Meta:
        model = Account
        fields = '__all__'


@admin.register(Account)
class AccountAdmin(admin.ModelAdmin):
    form           = AccountAdminForm
    list_display   = ['id', 'role', 'status', 'created_at']
    list_filter    = ['role', 'status']
    search_fields  = ['student__person__first_name',
                      'employee__person__first_name']
    readonly_fields = ['created_at']

    def save_model(self, request, obj, form, change):
        raw = form.cleaned_data.get('password_hash')
        if raw and not raw.startswith('pbkdf2_'):
            obj.password_hash = make_password(raw)
        super().save_model(request, obj, form, change)