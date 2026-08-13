from django.urls import path
from . import views

app_name = 'salary'

urlpatterns = [
    path('', views.SalaryListCreateView.as_view(), name='salary-list-create'),
    path('table/', views.SalaryTableView.as_view(), name='salary-table'),   # ← add this, ABOVE '<int:pk>/'
    path('<int:pk>/', views.SalaryDetailView.as_view(), name='salary-detail'),
    path('<int:pk>/mark-paid/', views.SalaryMarkPaidView.as_view(), name='salary-mark-paid'),
    path('employee/<int:employee_id>/', views.EmployeeSalaryView.as_view(), name='salary-by-employee'),
    path('stats/', views.SalaryStatsView.as_view(), name='salary-stats'),
    path('upsert/', views.SalaryUpsertView.as_view(), name='salary-upsert'),
]