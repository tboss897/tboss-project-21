from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import login_view, logout_view, password_reset_view, user_profile_view
from .student_auth import student_login_view

urlpatterns = [
    path('login/', login_view, name='login'),
    path('student/login/', student_login_view, name='student_login'),
    path('logout/', logout_view, name='logout'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('password/reset/', password_reset_view, name='password_reset'),
    path('profile/', user_profile_view, name='user_profile'),
]
