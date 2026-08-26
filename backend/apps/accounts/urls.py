# apps/accounts/urls.py

from django.urls import path
from .views import (
    LoginView,
    LogoutView,
    RefreshView,
    ResetPasswordView,
    AccountDetailView,
    AccountListView,
    CreateAccountView,
    ToggleAccountStatusView , 
    AdminPasswordResetView
)

urlpatterns = [
    path('login/',          LoginView.as_view(),         name='login'),
    path('logout/',         LogoutView.as_view(),         name='logout'),
    path('refresh/',        RefreshView.as_view(),        name='refresh'),
    path('reset-password/', ResetPasswordView.as_view(),  name='reset-password'),
    path('me/',             AccountDetailView.as_view(),  name='me'),
    path('accounts/',       AccountListView.as_view(),    name='account-list'),
    path('create-account/', CreateAccountView.as_view(),  name='create-account'),
    path('<int:account_id>/toggle-status/', ToggleAccountStatusView.as_view(), name='toggle-account-status'),
    path('accounts/<int:account_id>/admin-reset-password/', AdminPasswordResetView.as_view()),
]