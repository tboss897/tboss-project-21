from django.urls import path
from .views import StudentViewSet, student_detail, student_update, student_deactivate, get_qr_code, regenerate_qr_code, link_parent

urlpatterns = [
    path('', StudentViewSet.as_view({'get': 'list', 'post': 'create'}), name='student_list'),
    path('link-parent/', link_parent, name='link_parent'),
    path('<int:student_id>/', student_detail, name='student_detail'),
    path('<int:student_id>/update/', student_update, name='student_update'),
    path('<int:student_id>/deactivate/', student_deactivate, name='student_deactivate'),
    path('<int:student_id>/qr/', get_qr_code, name='get_qr_code'),
    path('<int:student_id>/qr/regenerate/', regenerate_qr_code, name='regenerate_qr_code'),
]
