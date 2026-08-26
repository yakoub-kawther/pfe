from django.db import IntegrityError
from django.db.models import Sum, Q, Exists, OuterRef
from django.utils import timezone
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from .models import Salary
from .serializers import SalarySerializer, SalaryUpdateSerializer, SalaryCreateSerializer
from apps.persons.models import Employee , Teacher
from apps.notifications.models import Notification
from apps.notifications import services as notif_services


def apply_salary_changes(salary, validated_data):
    """
    Single place that applies amount/status/remark changes and keeps
    payment_date in sync with status. Used by both SalaryDetailView's
    update and SalaryMarkPaidView.
    """
    for field in ('amount', 'status', 'remark'):
        if field in validated_data:
            setattr(salary, field, validated_data[field])

    if salary.status == Salary.Status.PAID and not salary.payment_date:
        salary.payment_date = timezone.now()
    elif salary.status == Salary.Status.PENDING:
        salary.payment_date = None

    salary.save()
    return salary


class SalaryListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        queryset = Salary.objects.select_related('employee').all()

        employee_id = request.query_params.get('employee')
        status_filter = request.query_params.get('status')
        month = request.query_params.get('month')
        year = request.query_params.get('year')

        if employee_id:
            queryset = queryset.filter(employee_id=employee_id)
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        if month:
            if not month.isdigit() or not (1 <= int(month) <= 12):
                return Response(
                    {"error": "Invalid month. Use a value between 1 and 12."},
                    status=status.HTTP_400_BAD_REQUEST
                )
            queryset = queryset.filter(month=month)
        if year:
            queryset = queryset.filter(year=year)

        queryset = queryset.order_by('-year', '-month')
        serializer = SalarySerializer(queryset, many=True)

        total = queryset.aggregate(total=Sum('amount'))['total'] or 0

        return Response({
            "count": queryset.count(),
            "total_amount": total,
            "results": serializer.data
        })

    def post(self, request):
        serializer = SalaryCreateSerializer(data=request.data)
        if serializer.is_valid():
            try:
                salary = serializer.save()
            except IntegrityError:
                return Response(
                    {"error": "A salary already exists for this employee for this month/year."},
                    status=status.HTTP_400_BAD_REQUEST
                )
            return Response(
                SalarySerializer(salary).data,
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class SalaryDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get_object(self, pk):
        return get_object_or_404(Salary.objects.select_related('employee'), pk=pk)

    def get(self, request, pk):
        salary = self.get_object(pk)
        return Response(SalarySerializer(salary).data)

    def put(self, request, pk):
        return self._update(request, pk)

    def patch(self, request, pk):
        return self._update(request, pk, partial=True)

    def _update(self, request, pk, partial=False):
        salary = self.get_object(pk)
        serializer = SalaryUpdateSerializer(data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        apply_salary_changes(salary, serializer.validated_data)
        return Response(SalarySerializer(salary).data)

    def delete(self, request, pk):
        salary = self.get_object(pk)
        salary.delete()
        return Response(
            {"message": "Salary deleted successfully."},
            status=status.HTTP_204_NO_CONTENT
        )


class SalaryMarkPaidView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, pk):
        salary = get_object_or_404(Salary, pk=pk)

        if salary.status == Salary.Status.PAID:
            return Response(
                {"message": "This salary is already marked as paid."},
                status=status.HTTP_400_BAD_REQUEST
            )

        apply_salary_changes(salary, {'status': Salary.Status.PAID})
        return Response(
            {"message": "Salary marked as paid.", "data": SalarySerializer(salary).data},
            status=status.HTTP_200_OK
        )


class SalaryNotifyView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        salary = get_object_or_404(Salary.objects.select_related('employee'), pk=pk)

        # Account.employee is a OneToOneField(Employee), so the reverse
        # accessor off an Employee instance is `.account` (no related_name set).
        account = getattr(salary.employee, 'account', None)
        if not account:
            return Response(
                {'detail': 'This employee has no account to notify.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        title = request.data.get('title') or 'Salary Notification'
        body = request.data.get('body') or ''
        if not body:
            return Response({'detail': 'body is required.'}, status=status.HTTP_400_BAD_REQUEST)

        notification_type = request.data.get('notification_type', Notification.Type.SALARY)
        if notification_type not in Notification.Type.values:
            notification_type = Notification.Type.SALARY

        notif_services.send_notification(
            sender=request.user,
            receivers=[account],
            notification_type=notification_type,
            title=title,
            body=body,
        )
        return Response(status=status.HTTP_201_CREATED)


class EmployeeSalaryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, employee_id):
        employee = get_object_or_404(Employee, pk=employee_id)

        year = request.query_params.get('year')
        if year:
            if not year.isdigit():
                return Response(
                    {"error": "year must be an integer."},
                    status=status.HTTP_400_BAD_REQUEST
                )
            year = int(year)
        else:
            year = timezone.now().year

        salaries = Salary.objects.filter(employee_id=employee_id, year=year)
        by_month = {s.month: s for s in salaries}

        today = timezone.now().date()
        results = []

        for month_num in range(1, 13):
            is_due = (
                (year, month_num) <= (today.year, today.month)
                and (year > employee.hire_date.year or
                     (year == employee.hire_date.year and month_num >= employee.hire_date.month))
            )

            # Don't invent "due" months after an employee's end date
            if employee.end_date and (year, month_num) > (employee.end_date.year, employee.end_date.month):
                is_due = False

            if month_num in by_month:
                results.append(SalarySerializer(by_month[month_num]).data)
            elif is_due:
                results.append({
                    "id": None,
                    "employee": employee_id,
                    "employee_name": str(employee),
                    "amount": None,
                    "month": month_num,
                    "year": year,
                    "payment_date": None,
                    "status": Salary.Status.PENDING,
                    "remark": None,
                })

        from decimal import Decimal

        total_paid = sum(
          (Decimal(r['amount']) for r in results
          if r['status'] == Salary.Status.PAID and r['amount']),
          Decimal('0')
         )
        total_pending = sum(
           (Decimal(r['amount']) for r in results
           if r['status'] == Salary.Status.PENDING and r['amount']),
           Decimal('0')
         )

        return Response({
            "employee_id": employee_id,
            "total_paid": total_paid,
            "total_pending": total_pending,
            "salaries": results
        })



    
class SalaryStatsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        total_paid = Salary.objects.filter(status=Salary.Status.PAID).aggregate(total=Sum('amount'))['total'] or 0
        total_pending = Salary.objects.filter(status=Salary.Status.PENDING).aggregate(total=Sum('amount'))['total'] or 0

        return Response({
            "total_paid": total_paid,
            "total_pending": total_pending,
            "total_overall": total_paid + total_pending,
            "count_paid": Salary.objects.filter(status=Salary.Status.PAID).count(),
            "count_pending": Salary.objects.filter(status=Salary.Status.PENDING).count(),
        })


class SalaryTableView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        year = request.query_params.get('year')
        search = request.query_params.get('search', '').strip()
        position_filter = request.query_params.get('position', '').strip()

        if not year or not year.isdigit():
            return Response(
                {"error": "year is required and must be an integer."},
                status=status.HTTP_400_BAD_REQUEST
            )
        year = int(year)

        candidates = Employee.objects.select_related('person', 'position')

        if search:
            candidates = candidates.filter(
                Q(person__first_name__icontains=search) |
                Q(person__last_name__icontains=search)
            )

        if position_filter and position_filter != 'All':
            if position_filter == 'Teacher':
                candidates = candidates.filter(teacher__isnull=False)
            else:
                candidates = candidates.filter(position__name=position_filter)

        candidates = list(candidates)

        salaries = Salary.objects.filter(
            employee_id__in=[e.pk for e in candidates],
            year=year
        )

        by_employee = {}
        for s in salaries:
            by_employee.setdefault(s.employee_id, {})[s.month] = {
                "id": s.id,
                "amount": s.amount,
                "status": s.status,
                "payment_date": s.payment_date,
                "remark": s.remark,
            }

        today = timezone.now().date()

        results = []
        for employee in candidates:
            months = dict(by_employee.get(employee.pk, {}))
            has_unpaid = any(m['status'] == Salary.Status.PENDING for m in months.values())

            for month_num in range(1, 13):
                if month_num in months:
                    continue

                is_due = (
                    (year, month_num) <= (today.year, today.month)
                    and (year > employee.hire_date.year or
                         (year == employee.hire_date.year and month_num >= employee.hire_date.month))
                )

                # Don't invent "due" months after an employee's end date
                if employee.end_date and (year, month_num) > (employee.end_date.year, employee.end_date.month):
                    is_due = False

                if is_due:
                    months[month_num] = {
                        "id": None,
                        "amount": None,
                        "status": Salary.Status.PENDING,
                        "payment_date": None,
                        "remark": None,
                    }
                    has_unpaid = True

            # Active employees always show. Inactive ones only show if they still owe something.
            if employee.status != 'active' and not has_unpaid:
                continue

            results.append({
                "employee_id": employee.pk,
                "full_name": f"{employee.person.first_name} {employee.person.last_name}",
                "position": employee.position.name if employee.position else None,
                "hire_date": employee.hire_date,
                "months": months,
            })

        return Response({
            "year": year,
            "count": len(results),
            "results": results,
        })


    
class SalaryUpsertView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request):
        employee_id = request.data.get('employee')
        month = request.data.get('month')
        year = request.data.get('year')

        if not all([employee_id, month, year]):
            return Response(
                {"error": "employee, month and year are required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        salary, created = Salary.objects.get_or_create(
            employee_id=employee_id, month=month, year=year,
            defaults={'amount': request.data.get('amount') or 0, 'status': Salary.Status.PENDING}
        )

        serializer = SalaryUpdateSerializer(data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        apply_salary_changes(salary, serializer.validated_data)

        return Response(
            SalarySerializer(salary).data,
            status=status.HTTP_201_CREATED if created else status.HTTP_200_OK
        )