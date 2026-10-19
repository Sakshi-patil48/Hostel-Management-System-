from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from rest_framework.permissions import AllowAny

class HealthCheckView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        return Response({
            "status": "online",
            "service": "Hostel Management System API",
            "version": "1.0.0",
            "mode": "demo_and_production"
        })

class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get('username', '').strip() or 'hostel'
        password = request.data.get('password', '') or 'demo'

        # 1. First attempt standard Django authentication
        user = authenticate(username=username, password=password)

        # 2. Per user requirement ("i should be open in any demo password ."):
        # If credentials do not match or user does not exist yet, allow demo access!
        if not user:
            user, created = User.objects.get_or_create(
                username=username,
                defaults={
                    'email': f'{username}@hostel.edu',
                    'is_staff': True,
                }
            )
            # If created or existing, set password or allow demo token
            if created:
                user.set_password(password)
                user.save()

        token, _ = Token.objects.get_or_create(user=user)
        return Response({
            "token": token.key,
            "user": {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "is_staff": user.is_staff,
            },
            "message": "Authentication successful (Demo Access Enabled)"
        })
