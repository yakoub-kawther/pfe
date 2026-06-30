from django.urls import path
from apps.payments import views

app_name = 'payment'

urlpatterns = [

    
    # POST   /api/payments/                       
    path('', views.CreatePaymentView.as_view(), name='create'),

    # PATCH  /api/payments/<id>/confirm/            
    path('<int:payment_id>/confirm/', views.ConfirmPaymentView.as_view(), name='confirm'),

    # PATCH  /api/payments/<id>/cancel/             
    path('<int:payment_id>/cancel/', views.CancelPaymentView.as_view(), name='cancel'),

    
    # GET    /api/payments/pending/                 
    path('pending/', views.PendingPaymentsView.as_view(), name='pending'),

    # GET    /api/payments/student/<id>/           
    path('student/<int:student_id>/', views.StudentPaymentsView.as_view(), name='student-payments'),

    # GET    /api/payments/inscription/<id>/        
    path('inscription/<int:inscription_id>/', views.PaymentByInscriptionView.as_view(), name='by-inscription'),

    
    # GET    /api/payments/stats/monthly/?month=1&year=2025
    path('stats/monthly/', views.MonthlyRevenueView.as_view(), name='stats-monthly'),

    # GET    /api/payments/stats/annual/?year=2025
    path('stats/annual/', views.RevenueStatsView.as_view(), name='stats-annual'),
]