from django.contrib import admin
from django.urls import path, include
from .views import HealthCheckView, LoginView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/health/', HealthCheckView.as_view(), name='api-health'),
    path('api/auth/login/', LoginView.as_view(), name='api-login'),
    path('api/', include('hostel_app.urls')),
]
