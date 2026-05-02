from django.contrib import admin
from .models import Salary


@admin.register(Salary)
class SalaryAdmin(admin.ModelAdmin):
    list_display = ['employee', 'amount', 'payment_date', 'status']
    list_filter = ['status', 'payment_date']
    search_fields = ['employee__first_name', 'employee__last_name']
    ordering = ['-payment_date']
    list_editable = ['status']

    actions = ['mark_as_paid', 'mark_as_pending']

    def mark_as_paid(self, request, queryset):
        updated = queryset.update(status=Salary.Status.PAID)
        self.message_user(request, f"{updated} salaire(s) marqué(s) comme payé(s).")
    mark_as_paid.short_description = "Marquer comme payé"

    def mark_as_pending(self, request, queryset):
        updated = queryset.update(status=Salary.Status.PENDING)
        self.message_user(request, f"{updated} salaire(s) marqué(s) comme en attente.")
    mark_as_pending.short_description = "Marquer comme en attente"