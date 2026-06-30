from decimal import Decimal
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, IsAdminUser

from apps.payments import services
from apps.payments.serializers import (
    PaymentSerializer,
    PaymentCreateSerializer,
    MonthlyRevenueSerializer,
    RevenueStatsSerializer,
)
from apps.payments.exceptions import (
    PaymentAlreadyExistsError,
    PaymentNotFoundError,
    InvalidPaymentStatusError,
    InscriptionNotFoundError,
)



class CreatePaymentView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
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


class ConfirmPaymentView(APIView):
    from apps.accounts.permissions import IsAdminOrSuperAdmin
    permission_classes = [IsAuthenticated, IsAdminOrSuperAdmin]

    def patch(self, request, payment_id):
        try:
            payment = services.confirm_payment(payment_id)
        except PaymentNotFoundError as e:
            return Response({'detail': str(e)}, status=status.HTTP_404_NOT_FOUND)
        except InvalidPaymentStatusError as e:
            return Response({'detail': str(e)}, status=status.HTTP_400_BAD_REQUEST)

        return Response(PaymentSerializer(payment).data)


class CancelPaymentView(APIView):
    
    permission_classes = [IsAdminUser]

    def patch(self, request, payment_id):
        try:
            services.cancel_payment(payment_id)
        except PaymentNotFoundError as e:
            return Response({'detail': str(e)}, status=status.HTTP_404_NOT_FOUND)
        except InvalidPaymentStatusError as e:
            return Response({'detail': str(e)}, status=status.HTTP_400_BAD_REQUEST)

        return Response(
            {'detail': f'Payment {payment_id} cancelled successfully.'},
            status=status.HTTP_200_OK,
        )



class StudentPaymentsView(APIView): 
    permission_classes = [IsAuthenticated]

    def get(self, request, student_id):
        payments = services.get_student_payments(student_id)
        return Response(PaymentSerializer(payments, many=True).data)


class PaymentByInscriptionView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, inscription_id):
        try:
            payment = services.get_payment_by_inscription(inscription_id)
        except PaymentNotFoundError as e:
            return Response({'detail': str(e)}, status=status.HTTP_404_NOT_FOUND)

        return Response(PaymentSerializer(payment).data)


class PendingPaymentsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        payments = services.get_pending_payments()
        return Response(PaymentSerializer(payments, many=True).data)



class MonthlyRevenueView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        try:
            month = int(request.query_params.get('month', 0))
            year = int(request.query_params.get('year', 0))
        except ValueError:
            return Response(
                {'detail': 'month and year must be integers.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not (1 <= month <= 12) or year < 2000:
            return Response(
                {'detail': 'Provide a valid month (1-12) and year.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        total = services.get_monthly_revenue(month, year)
        return Response({'month': month, 'year': year, 'total': total})


class RevenueStatsView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        try:
            year = int(request.query_params.get('year', 0))
        except ValueError:
            return Response(
                {'detail': 'year must be an integer.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if year < 2000:
            return Response(
                {'detail': 'Provide a valid year (>= 2000).'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        stats = services.get_revenue_stats(year)
        annual_total = sum(s['total'] for s in stats)

        return Response({
            'year': year,
            'stats': MonthlyRevenueSerializer(stats, many=True).data,
            'annual_total': annual_total,
        })