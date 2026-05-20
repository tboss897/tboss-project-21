from django.urls import path
from .views import wallet_detail, wallet_topup, wallet_transactions, wallet_set_limit, wallet_set_status

urlpatterns = [
    path('<int:wallet_id>/', wallet_detail, name='wallet_detail'),
    path('<int:wallet_id>/topup/', wallet_topup, name='wallet_topup'),
    path('<int:wallet_id>/transactions/', wallet_transactions, name='wallet_transactions'),
    path('<int:wallet_id>/limit/', wallet_set_limit, name='wallet_set_limit'),
    path('<int:wallet_id>/status/', wallet_set_status, name='wallet_set_status'),
]
