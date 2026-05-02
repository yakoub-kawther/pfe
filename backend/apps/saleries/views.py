from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from django.db.models import Sum
from .models import Salary as saleries
from .serializers import SalarySerializer, SalaryUpdateSerializer


class SalaryListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        queryset = saleries.objects.select_related('employee').all()

        # Filtres optionnels via query params
        employee_id = request.query_params.get('employee')
        status_filter = request.query_params.get('status')
        month = request.query_params.get('month')   # format: YYYY-MM
        year = request.query_params.get('year')

        if employee_id:
            queryset = queryset.filter(employee_id=employee_id)
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        if month:
            try:
                year_part, month_part = month.split('-')
                queryset = queryset.filter(
                    payment_date__year=year_part,
                    payment_date__month=month_part
                )
            except ValueError:
                return Response(
                    {"error": "Format du mois invalide. Utilisez YYYY-MM."},
                    status=status.HTTP_400_BAD_REQUEST
                )
        if year:
            queryset = queryset.filter(payment_date__year=year)

        queryset = queryset.order_by('-payment_date')
        serializer = SalarySerializer(queryset, many=True)

        total = queryset.aggregate(total=Sum('amount'))['total'] or 0

        return Response({
            "count": queryset.count(),
            "total_amount": total,
            "results": serializer.data
        })

    def post(self, request):
        serializer = SalarySerializer(data=request.data)
        if serializer.is_valid():
            salary = serializer.save()
            return Response(
                SalarySerializer(salary).data,
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class SalaryDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get_object(self, pk):
        return get_object_or_404(saleries.objects.select_related('employee'), pk=pk)

    def get(self, request, pk):
        salary = self.get_object(pk)
        serializer = SalarySerializer(salary)
        return Response(serializer.data)

    def put(self, request, pk):
        salary = self.get_object(pk)
        serializer = SalaryUpdateSerializer(salary, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(SalarySerializer(salary).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def patch(self, request, pk):
        salary = self.get_object(pk)
        serializer = SalaryUpdateSerializer(salary, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(SalarySerializer(salary).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        salary = self.get_object(pk)
        salary.delete()
        return Response(
            {"message": "Salaire supprimé avec succès."},
            status=status.HTTP_204_NO_CONTENT
        )


class SalaryMarkPaidView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, pk):
        salary = get_object_or_404(saleries, pk=pk)

        if salary.status == saleries.Status.PAID:
            return Response(
                {"message": "Ce salaire est déjà marqué comme payé."},
                status=status.HTTP_400_BAD_REQUEST
            )

        salary.status = saleries.Status.PAID
        salary.save()
        return Response(
            {"message": "Salaire marqué comme payé.", "data": SalarySerializer(salary).data},
            status=status.HTTP_200_OK
        )


class EmployeeSalaryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, employee_id):
        salaries = saleries.objects.filter(
            employee_id=employee_id
        ).order_by('-payment_date')

        if not salaries.exists():
            return Response(
                {"message": "Aucun salaire trouvé pour cet employé."},
                status=status.HTTP_404_NOT_FOUND
            )

        total_paid = salaries.filter(
            status=saleries.Status.PAID
        ).aggregate(total=Sum('amount'))['total'] or 0

        total_pending = salaries.filter(
            status=saleries.Status.PENDING
        ).aggregate(total=Sum('amount'))['total'] or 0

        serializer = SalarySerializer(salaries, many=True)
        return Response({
            "employee_id": employee_id,
            "total_paid": total_paid,
            "total_pending": total_pending,
            "salaries": serializer.data
        })


class SalaryStatsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        total_paid = saleries.objects.filter(
            status=saleries.Status.PAID
        ).aggregate(total=Sum('amount'))['total'] or 0

        total_pending = saleries.objects.filter(
            status=saleries.Status.PENDING
        ).aggregate(total=Sum('amount'))['total'] or 0

        return Response({
            "total_paid": total_paid,
            "total_pending": total_pending,
            "total_overall": total_paid + total_pending,
            "count_paid": saleries.objects.filter(status=saleries.Status.PAID).count(),
            "count_pending": saleries.objects.filter(status=saleries.Status.PENDING).count(),
        })