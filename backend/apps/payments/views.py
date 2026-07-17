from decimal import Decimal
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.pagination import PageNumberPagination
from django.db.models import Q

from apps.payments.models import Payment
from apps.payments import services
from apps.payments.serializers import (
    PaymentSerializer,
    PaymentCreateSerializer,
    PaymentUpdateSerializer,
    MonthlyRevenueSerializer,
    RevenueStatsSerializer,
)
from apps.payments.exceptions import (
    PaymentAlreadyExistsError,
    PaymentNotFoundError,
    InvalidPaymentStatusError,
    InscriptionNotFoundError,
)


class PaymentsPagination(PageNumberPagination):
    page_size = 25


class PaymentViewSet(viewsets.ViewSet):
    """
    Router-registered — same pattern as InscriptionViewSet.

    GET    /api/payments/                        -> list (paginated, ?search=)
    POST   /api/payments/                         -> create
    GET    /api/payments/<pk>/                    -> retrieve
    PATCH  /api/payments/<pk>/                    -> partial_update
    PATCH  /api/payments/<pk>/confirm/             -> confirm
    PATCH  /api/payments/<pk>/cancel/              -> cancel
    GET    /api/payments/pending/                  -> pending
    GET    /api/payments/student/<student_id>/     -> student_payments
    GET    /api/payments/inscription/<inscription_id>/ -> by_inscription
    GET    /api/payments/stats/monthly/            -> stats_monthly
    GET    /api/payments/stats/annual/             -> stats_annual
    """

    def get_permissions(self):
        # Mirrors the exact per-endpoint permissions from the old APIViews.
        if self.action in ('confirm', 'partial_update'):
            from apps.accounts.permissions import IsAdminOrSuperAdmin
            return [IsAuthenticated(), IsAdminOrSuperAdmin()]
        if self.action in ('cancel', 'stats_monthly', 'stats_annual'):
            return [IsAdminUser()]
        return [IsAuthenticated()]

    # ── standard actions ──────────────────────────────────

    def list(self, request):
        queryset = (
            Payment.objects
            .filter(
                Q(inscription__enrolled_class__status='active') | ~Q(status=Payment.Status.PAID)
            )
            .select_related(
                'inscription',
                'inscription__student',
                'inscription__student__person',
                'inscription__enrolled_class',
            )
            .order_by('inscription__student_id', '-payment_date')
        )

        search = request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(inscription__student__person__first_name__icontains=search) |
                Q(inscription__student__person__last_name__icontains=search)
            )

        status_filter = request.query_params.get('status')
        if status_filter and status_filter != 'All':
            queryset = queryset.filter(status=status_filter)

        paginator = PaymentsPagination()
        page = paginator.paginate_queryset(queryset, request)
        serializer = PaymentSerializer(page, many=True)
        return paginator.get_paginated_response(serializer.data)

    def create(self, request):
        serializer = PaymentCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        data = serializer.validated_data
        try:
            payment = services.create_payment(
                inscription_id=data['inscription_id'],
                amount=data['amount'],
                method=data.get('method', 'cash'),
            )
        except InscriptionNotFoundError as e:
            return Response({'detail': str(e)}, status=status.HTTP_404_NOT_FOUND)
        except PaymentAlreadyExistsError as e:
            return Response({'detail': str(e)}, status=status.HTTP_409_CONFLICT)

        return Response(PaymentSerializer(payment).data, status=status.HTTP_201_CREATED)

    def retrieve(self, request, pk=None):
        try:
            payment = Payment.objects.select_related('inscription').get(id=pk)
        except Payment.DoesNotExist:
            return Response({'detail': f'Payment with id={pk} not found.'}, status=status.HTTP_404_NOT_FOUND)
        return Response(PaymentSerializer(payment).data)

    def partial_update(self, request, pk=None):
        serializer = PaymentUpdateSerializer(data=request.data, partial=True)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        data = serializer.validated_data
        try:
            payment = services.update_payment(
                payment_id=pk,
                amount=data.get('amount'),
                status=data.get('status'),
                remark=data.get('remark'),
            )
        except PaymentNotFoundError as e:
            return Response({'detail': str(e)}, status=status.HTTP_404_NOT_FOUND)

        return Response(PaymentSerializer(payment).data)

    # ── custom actions ────────────────────────────────────

    @action(detail=True, methods=['patch'])
    def confirm(self, request, pk=None):
        try:
            payment = services.confirm_payment(pk)
        except PaymentNotFoundError as e:
            return Response({'detail': str(e)}, status=status.HTTP_404_NOT_FOUND)
        except InvalidPaymentStatusError as e:
            return Response({'detail': str(e)}, status=status.HTTP_400_BAD_REQUEST)

        return Response(PaymentSerializer(payment).data)

    @action(detail=True, methods=['patch'])
    def cancel(self, request, pk=None):
        try:
            services.cancel_payment(pk)
        except PaymentNotFoundError as e:
            return Response({'detail': str(e)}, status=status.HTTP_404_NOT_FOUND)
        except InvalidPaymentStatusError as e:
            return Response({'detail': str(e)}, status=status.HTTP_400_BAD_REQUEST)

        return Response({'detail': f'Payment {pk} cancelled successfully.'}, status=status.HTTP_200_OK)

    @action(detail=False, methods=['get'])
    def pending(self, request):
        payments = services.get_pending_payments()
        return Response(PaymentSerializer(payments, many=True).data)

    @action(detail=False, methods=['get'], url_path='student/(?P<student_id>[^/.]+)')
    def student_payments(self, request, student_id=None):
        payments = services.get_student_payments(student_id)
        return Response(PaymentSerializer(payments, many=True).data)

    @action(detail=False, methods=['get'], url_path='inscription/(?P<inscription_id>[^/.]+)')
    def by_inscription(self, request, inscription_id=None):
        try:
            payment = services.get_payment_by_inscription(inscription_id)
        except PaymentNotFoundError as e:
            return Response({'detail': str(e)}, status=status.HTTP_404_NOT_FOUND)

        return Response(PaymentSerializer(payment).data)

    @action(detail=False, methods=['get'], url_path='stats/monthly')
    def stats_monthly(self, request):
        try:
            month = int(request.query_params.get('month', 0))
            year = int(request.query_params.get('year', 0))
        except ValueError:
            return Response({'detail': 'month and year must be integers.'}, status=status.HTTP_400_BAD_REQUEST)

        if not (1 <= month <= 12) or year < 2000:
            return Response({'detail': 'Provide a valid month (1-12) and year.'}, status=status.HTTP_400_BAD_REQUEST)

        total = services.get_monthly_revenue(month, year)
        return Response({'month': month, 'year': year, 'total': total})

    @action(detail=False, methods=['get'], url_path='stats/annual')
    def stats_annual(self, request):
        try:
            year = int(request.query_params.get('year', 0))
        except ValueError:
            return Response({'detail': 'year must be an integer.'}, status=status.HTTP_400_BAD_REQUEST)

        if year < 2000:
            return Response({'detail': 'Provide a valid year (>= 2000).'}, status=status.HTTP_400_BAD_REQUEST)

        stats = services.get_revenue_stats(year)
        annual_total = sum(s['total'] for s in stats)

        return Response({
            'year': year,
            'stats': MonthlyRevenueSerializer(stats, many=True).data,
            'annual_total': annual_total,
        })