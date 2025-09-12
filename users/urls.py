from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import RegisterView
from .auth import RoleAwareTokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView

class RoleAwareTokenObtainPairView(TokenObtainPairView):
    serializer_class = RoleAwareTokenObtainPairSerializer

urlpatterns = [
    path("auth/register/", RegisterView.as_view(), name="register"),
    path("auth/token/", RoleAwareTokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("auth/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
]
