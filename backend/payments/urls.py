from django.urls import path
from .views import payment_scan, payment_process, payment_receipt

urlpatterns = [
    path('scan/', payment_scan, name='payment_scan'),
    path('process/', payment_process, name='payment_process'),
    path('<int:transaction_id>/', payment_receipt, name='payment_receipt'),
]
