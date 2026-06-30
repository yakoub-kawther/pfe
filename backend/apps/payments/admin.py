from django.contrib import admin
from django.utils.html import format_html
from apps.payments.models import Payment
from apps.payments import services
from apps.payments.exceptions import InvalidPaymentStatusError


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):

    list_display = [
        'id',
        'student_name',
        'level_name',
        'amount',
        'colored_status',
        'payment_date',
    ]
    list_filter = ['status', 'payment_date']
    search_fields = [
        'inscriptionstudentfirst_name',
        'inscriptionstudentlast_name',
    ]
    readonly_fields = ['payment_date', 'status', 'inscription', 'amount']
    ordering = ['-payment_date']
    actions = ['action_confirm_payments', 'action_cancel_payments']

    # ── Display helpers ───────────────────────────────────

    @admin.display(description='Student')
    def student_name(self, obj):
        s = obj.inscription.student
        return f"{s.first_name} {s.last_name}"

    @admin.display(description='Level')
    def level_name(self, obj):
        return str(obj.inscription.level)

    @admin.display(description='Status')
    def colored_status(self, obj):
        colors = {
            Payment.Status.PAID: 'green',
            Payment.Status.PENDING: 'orange',
            Payment.Status.OVERDUE: 'red',
        }
        color = colors.get(obj.status, 'black')
        return format_html(
            '<span style="color: {}; font-weight: bold;">{}</span>',
            color,
            obj.get_status_display(),
        )

    # ── Bulk actions ──────────────────────────────────────

    @admin.action(description='✅ Confirm selected payments')
    def action_confirm_payments(self, request, queryset):
        confirmed = 0
        errors = 0
        for payment in queryset:
            try:
                services.confirm_payment(payment.id)
                confirmed += 1
            except InvalidPaymentStatusError:
                errors += 1

        if confirmed:
            self.message_user(request, f'{confirmed} payment(s) confirmed successfully.')
        if errors:
            self.message_user(
                request,
                f'{errors} payment(s) could not be confirmed (already paid or overdue).',
                level='warning',
            )

    @admin.action(description='❌ Cancel selected payments')
    def action_cancel_payments(self, request, queryset):
        cancelled = 0
        errors = 0
        for payment in queryset:
            try:
                services.cancel_payment(payment.id)
                cancelled += 1
            except InvalidPaymentStatusError:
                errors += 1

        if cancelled:
            self.message_user(request, f'{cancelled} payment(s) cancelled.')
        if errors:
            self.message_user(
                request,
                f'{errors} payment(s) could not be cancelled (already paid).',
                level='warning',
            )