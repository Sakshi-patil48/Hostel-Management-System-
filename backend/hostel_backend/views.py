from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from rest_framework.permissions import AllowAny
from rest_framework.throttling import ScopedRateThrottle
import re
from hostel_app.models import Student

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
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = 'login'

    def post(self, request):
        role = request.data.get('role', 'admin').strip().lower()
        username = request.data.get('username', '').strip()
        password = request.data.get('password', '') or 'demo'

        if role == 'student' or Student.objects.filter(student_id__iexact=username).exists() or username.upper().startswith('ID-'):
            return StudentLoginView().handle_student_login(username=username, password=password)

        username = username or 'hostel'

        # 1. First attempt standard Django authentication
        user = authenticate(username=username, password=password)

        # 2. Per demo system requirement:
        # If credentials do not match or user does not exist yet, allow demo staff access!
        if not user:
            user, created = User.objects.get_or_create(
                username=username,
                defaults={
                    'email': f'{username}@hostel.edu',
                    'is_staff': True,
                }
            )
            if created:
                user.set_password(password)
                user.save()

        token, _ = Token.objects.get_or_create(user=user)
        return Response({
            "token": token.key,
            "role": "admin",
            "user": {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "is_staff": user.is_staff,
            },
            "message": "Authentication successful (Staff/Admin Access)"
        })


class StudentLoginView(APIView):
    permission_classes = [AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = 'login'

    def post(self, request):
        student_id = request.data.get('student_id') or request.data.get('username', '')
        password = request.data.get('password', '') or 'demo'
        return self.handle_student_login(username=student_id, password=password)

    def handle_student_login(self, username, password):
        raw_id = (username or '').strip()
        if not raw_id:
            return Response(
                {"error": "Please provide a valid Student ID (e.g., ID-101 or HST-2026-001)."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # 1. Exact match
        student = Student.objects.filter(student_id__iexact=raw_id).first()

        # 2. Friendly ID format support: e.g. ID-101 -> HST-2026-001
        if not student and raw_id.upper().startswith('ID-'):
            try:
                num = int(raw_id.split('-')[-1])
                if num > 100:
                    candidate_code = f"HST-2026-{(num - 100):03d}"
                    student = Student.objects.filter(student_id__iexact=candidate_code).first()
            except (ValueError, IndexError):
                pass

        # 3. Substring match fallback
        if not student:
            student = Student.objects.filter(student_id__icontains=raw_id).first()

        if not student:
            return Response(
                {"error": f"Student with ID '{raw_id}' was not found in the hostel registry."},
                status=status.HTTP_404_NOT_FOUND
            )

        # Link or create non-staff user account for this student
        user = student.user
        if not user:
            user_username = f"std_{student.student_id.lower().replace('-', '_')}"
            user, created = User.objects.get_or_create(
                username=user_username,
                defaults={
                    'email': student.email or f"{user_username}@student.ghr.edu",
                    'first_name': student.full_name[:30],
                    'is_staff': False,
                }
            )
            student.user = user
            student.save()

        token, _ = Token.objects.get_or_create(user=user)

        # Calculate friendly display ID (HST-2026-001 -> ID-101)
        match = re.search(r'(\d+)$', student.student_id or '')
        display_id = f"ID-{100 + int(match.group(1))}" if match else student.student_id

        alloc = student.allocations.filter(status='active').first()
        student_data = {
            "id": student.id,
            "student_id": student.student_id,
            "display_id": display_id,
            "full_name": student.full_name,
            "email": student.email,
            "phone": student.phone,
            "course": student.course,
            "year_of_study": student.year_of_study,
            "status": student.status,
            "current_room": alloc.room.room_number if alloc else None,
            "current_bed": alloc.bed.bed_number if alloc else None,
            "block_name": alloc.room.block.name if alloc else None,
        }

        return Response({
            "token": token.key,
            "role": "student",
            "user": {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "is_staff": False,
            },
            "student": student_data,
            "message": f"Welcome back, {student.full_name}!"
        })

