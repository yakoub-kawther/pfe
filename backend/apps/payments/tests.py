from decimal import Decimal
from unittest.mock import patch
from django.test import TestCase
from django.utils import timezone

from apps.payments.models import Payment
from apps.payments import services
from apps.payments.exceptions import (
    PaymentAlreadyExistsError,
    PaymentNotFoundError,
    InvalidPaymentStatusError,
    InscriptionNotFoundError,
)


class PaymentServicesTestCase(TestCase):
    def _make_inscription(self, status='pending'):
        from apps.inscription.models import Inscription
        return Inscription.objects.create(status=status)

    def _make_payment(self, inscription=None, amount='100.00', pay_status=Payment.Status.PENDING):
        inscription = inscription or self._make_inscription()
        return Payment.objects.create(
            inscription=inscription,
            amount=Decimal(amount),
            status=pay_status,
        )


    def test_create_payment_success(self):
        inscription = self._make_inscription()
        payment = services.create_payment(inscription.id, Decimal('150.00'))

        self.assertEqual(payment.status, Payment.Status.PENDING)
        self.assertEqual(payment.amount, Decimal('150.00'))
        self.assertEqual(payment.inscription, inscription)

    def test_create_payment_inscription_not_found(self):
        with self.assertRaises(InscriptionNotFoundError):
            services.create_payment(99999, Decimal('100.00'))

    def test_create_payment_already_exists(self):
        inscription = self._make_inscription()
        services.create_payment(inscription.id, Decimal('100.00'))

        with self.assertRaises(PaymentAlreadyExistsError):
            services.create_payment(inscription.id, Decimal('100.00'))


    @patch('apps.payment.services._send_payment_confirmation_notification')
    def test_confirm_payment_success(self, mock_notify):
        payment = self._make_payment()
        confirmed = services.confirm_payment(payment.id)

        self.assertEqual(confirmed.status, Payment.Status.PAID)
        mock_notify.assert_called_once_with(confirmed)

    def test_confirm_payment_not_found(self):
        with self.assertRaises(PaymentNotFoundError):
            services.confirm_payment(99999)

    @patch('apps.payment.services._send_payment_confirmation_notification')
    def test_confirm_payment_already_paid(self, mock_notify):
        payment = self._make_payment(pay_status=Payment.Status.PAID)
        with self.assertRaises(InvalidPaymentStatusError):
            services.confirm_payment(payment.id)



    def test_cancel_payment_success(self):
        payment = self._make_payment()
        payment_id = payment.id
        services.cancel_payment(payment_id)

        self.assertFalse(Payment.objects.filter(id=payment_id).exists())

    def test_cancel_paid_payment_raises(self):
        payment = self._make_payment(pay_status=Payment.Status.PAID)
        with self.assertRaises(InvalidPaymentStatusError):
            services.cancel_payment(payment.id)


    def test_get_student_payments_returns_all(self):
        inscription1 = self._make_inscription()
        inscription2 = self._make_inscription()
        
        self._make_payment(inscription=inscription1)
        self._make_payment(inscription=inscription2)

        student_id = inscription1.student_id
        payments = services.get_student_payments(student_id)
        self.assertGreaterEqual(len(payments), 1)

    

    def test_get_pending_payments(self):
        self._make_payment(pay_status=Payment.Status.PENDING)
        self._make_payment(pay_status=Payment.Status.PAID)

        pending = services.get_pending_payments()
        self.assertTrue(all(p.status == Payment.Status.PENDING for p in pending))

    

    @patch('apps.payment.services._send_payment_confirmation_notification')
    def test_get_monthly_revenue(self, mock_notify):
        payment = self._make_payment(amount='200.00')
        services.confirm_payment(payment.id)

        now = timezone.now()
        total = services.get_monthly_revenue(now.month, now.year)
        self.assertEqual(total, Decimal('200.00'))

    

    def test_get_revenue_stats_has_12_months(self):
        stats = services.get_revenue_stats(2025)
        self.assertEqual(len(stats), 12)

    def test_get_revenue_stats_zero_for_empty_months(self):
        stats = services.get_revenue_stats(1900)   # no data year
        totals = [s['total'] for s in stats]
        self.assertTrue(all(t == Decimal('0.00') for t in totals))    