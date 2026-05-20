from django.urls import path
from .views import admin_dashboard, admin_users, admin_suspend_user, admin_transactions, admin_reports

urlpatterns = [
    path('dashboard/', admin_dashboard, name='admin_dashboard'),
    path('users/', admin_users, name='admin_users'),
    path('users/<int:user_id>/suspend/', admin_suspend_user, name='admin_suspend_user'),
    path('transactions/', admin_transactions, name='admin_transactions'),
    path('reports/', admin_reports, name='admin_reports'),
]
