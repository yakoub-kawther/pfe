from django.urls import path
from . import views

app_name = 'salary'

urlpatterns = [
    
    path('', views.SalaryListCreateView.as_view(), name='salary-list-create'),

    path('<int:pk>/', views.SalaryDetailView.as_view(), name='salary-detail'),

    path('<int:pk>/mark-paid/', views.SalaryMarkPaidView.as_view(), name='salary-mark-paid'),

    path('employee/<int:employee_id>/', views.EmployeeSalaryView.as_view(), name='salary-by-employee'),

    path('stats/', views.SalaryStatsView.as_view(), name='salary-stats'),
]