import csv
import secrets
import random
from datetime import timedelta
from decimal import Decimal
from django.db.models import Sum, Count, Q
from django.http import HttpResponse
from django.utils import timezone
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from .permissions import IsStaffOrReadOnly, IsAdminOrWarden, IsStudentOwnerOrStaff

from .models import (
    HostelBlock, Room, Bed, Student, RoomAllocation,
    FeeRecord, Payment, Attendance, AttendanceSession, Complaint, Notice,
    Employee, EmployeePayment
)
from .serializers import (
    HostelBlockSerializer, RoomSerializer, BedSerializer,
    StudentSerializer, RoomAllocationSerializer, FeeRecordSerializer,
    PaymentSerializer, AttendanceSerializer, AttendanceSessionSerializer,
    StudentPortalAttendanceSerializer, StudentPortalProfileSerializer,
    ComplaintSerializer, NoticeSerializer, EmployeeSerializer, EmployeePaymentSerializer
)

class HostelBlockViewSet(viewsets.ModelViewSet):
    queryset = HostelBlock.objects.all().order_by('name')
    serializer_class = HostelBlockSerializer
    permission_classes = [IsStaffOrReadOnly]

class RoomViewSet(viewsets.ModelViewSet):
    queryset = Room.objects.all().select_related('block').prefetch_related('beds', 'allocations').order_by('room_number')
    serializer_class = RoomSerializer
    permission_classes = [IsStaffOrReadOnly]

    def get_queryset(self):
        qs = super().get_queryset()
        block_id = self.request.query_params.get('block')
        room_type = self.request.query_params.get('room_type')
        status_filter = self.request.query_params.get('status')
        floor = self.request.query_params.get('floor')
        search = self.request.query_params.get('search')

        if block_id and block_id not in ('undefined', 'null', ''):
            try:
                qs = qs.filter(block_id=int(block_id))
            except (ValueError, TypeError):
                pass
        if room_type and room_type not in ('undefined', 'null', ''):
            qs = qs.filter(room_type=room_type)
        if status_filter and status_filter not in ('undefined', 'null', ''):
            qs = qs.filter(status=status_filter)
        if floor and floor not in ('undefined', 'null', ''):
            try:
                qs = qs.filter(floor=int(floor))
            except (ValueError, TypeError):
                pass
        if search:
            search_clean = search.strip().lower()
            section_map = {'room a': 1, 'room b': 2, 'room c': 3, 'room d': 4}
            if search_clean in section_map:
                qs = qs.filter(Q(room_number__icontains=search) | Q(block__name__icontains=search) | Q(floor=section_map[search_clean]))
            else:
                qs = qs.filter(Q(room_number__icontains=search) | Q(block__name__icontains=search))
        return qs

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response(serializer.data)

    def destroy(self, request, *args, **kwargs):
        room = self.get_object()
        active_allocs = room.allocations.filter(status='active').count()
        if active_allocs > 0:
            return Response(
                {"error": f"Cannot delete Room {room.room_number}. There are {active_allocs} active student allocations. Please transfer or checkout students first."},
                status=status.HTTP_400_BAD_REQUEST
            )
        return super().destroy(request, *args, **kwargs)

class BedViewSet(viewsets.ModelViewSet):
    queryset = Bed.objects.all().select_related('room').order_by('room__room_number', 'bed_number')
    serializer_class = BedSerializer
    permission_classes = [IsStaffOrReadOnly]

    def get_queryset(self):
        qs = super().get_queryset()
        room_id = self.request.query_params.get('room')
        available_only = self.request.query_params.get('available')
        if room_id:
            qs = qs.filter(room_id=room_id)
        if available_only == 'true':
            qs = qs.filter(is_occupied=False)
        return qs

class StudentViewSet(viewsets.ModelViewSet):
    queryset = Student.objects.all().prefetch_related('allocations', 'fee_records').order_by('-created_at')
    serializer_class = StudentSerializer
    permission_classes = [IsStaffOrReadOnly]

    def get_queryset(self):
        qs = super().get_queryset()
        search = self.request.query_params.get('search')
        status_filter = self.request.query_params.get('status')
        course = self.request.query_params.get('course')

        if search:
            qs = qs.filter(
                Q(student_id__icontains=search) |
                Q(full_name__icontains=search) |
                Q(email__icontains=search) |
                Q(phone__icontains=search)
            )
        if status_filter:
            qs = qs.filter(status=status_filter)
        if course:
            qs = qs.filter(course__icontains=course)
        return qs

    def destroy(self, request, *args, **kwargs):
        student = self.get_object()
        active_alloc = student.allocations.filter(status='active').first()
        if active_alloc:
            return Response(
                {"error": f"Cannot delete student {student.full_name}. They are currently allocated to Room {active_alloc.room.room_number}. Please checkout or release their bed first."},
                status=status.HTTP_400_BAD_REQUEST
            )
        return super().destroy(request, *args, **kwargs)

class RoomAllocationViewSet(viewsets.ModelViewSet):
    queryset = RoomAllocation.objects.all().select_related('student', 'room', 'bed').order_by('-created_at')
    serializer_class = RoomAllocationSerializer
    permission_classes = [IsStaffOrReadOnly]

    def get_queryset(self):
        qs = super().get_queryset()
        status_filter = self.request.query_params.get('status')
        student_id = self.request.query_params.get('student')
        room_id = self.request.query_params.get('room')
        if status_filter:
            qs = qs.filter(status=status_filter)
        if student_id:
            qs = qs.filter(student_id=student_id)
        if room_id:
            qs = qs.filter(room_id=room_id)
        return qs

    @action(detail=True, methods=['post'])
    def checkout(self, request, pk=None):
        allocation = self.get_object()
        if allocation.status != 'active':
            return Response({"error": "Only active allocations can be checked out."}, status=status.HTTP_400_BAD_REQUEST)

        allocation.status = 'checked_out'
        allocation.checkout_date = timezone.now().date()
        allocation.remarks = (allocation.remarks + " | Checked out on " + str(timezone.now().date())).strip(' |')
        allocation.bed.is_occupied = False
        allocation.bed.save()
        allocation.save()

        return Response({"message": f"Student {allocation.student.full_name} checked out from Room {allocation.room.room_number}."})

class FeeRecordViewSet(viewsets.ModelViewSet):
    queryset = FeeRecord.objects.all().select_related('student').prefetch_related('payments').order_by('-due_date')
    serializer_class = FeeRecordSerializer
    permission_classes = [IsStaffOrReadOnly]

    def get_queryset(self):
        qs = super().get_queryset()
        status_filter = self.request.query_params.get('status')
        student_id = self.request.query_params.get('student')
        search = self.request.query_params.get('search')
        if status_filter:
            qs = qs.filter(status=status_filter)
        if student_id:
            qs = qs.filter(student_id=student_id)
        if search:
            qs = qs.filter(Q(student__full_name__icontains=search) | Q(student__student_id__icontains=search))
        return qs

class PaymentViewSet(viewsets.ModelViewSet):
    queryset = Payment.objects.all().select_related('student', 'fee_record').order_by('-payment_date', '-created_at')
    serializer_class = PaymentSerializer
    permission_classes = [IsStaffOrReadOnly]

    def get_queryset(self):
        qs = super().get_queryset()
        search = self.request.query_params.get('search')
        student_id = self.request.query_params.get('student')
        if search:
            qs = qs.filter(
                Q(receipt_number__icontains=search) |
                Q(student__full_name__icontains=search) |
                Q(student__student_id__icontains=search)
            )
        if student_id:
            qs = qs.filter(student_id=student_id)
        return qs

class AttendanceViewSet(viewsets.ModelViewSet):
    queryset = Attendance.objects.all().select_related('student').order_by('-date', 'student__full_name')
    serializer_class = AttendanceSerializer
    permission_classes = [IsStaffOrReadOnly]

    def get_queryset(self):
        qs = super().get_queryset()
        date_param = self.request.query_params.get('date')
        status_param = self.request.query_params.get('status')
        student_id = self.request.query_params.get('student')
        if date_param:
            qs = qs.filter(date=date_param)
        if status_param:
            qs = qs.filter(status=status_param)
        if student_id:
            qs = qs.filter(student_id=student_id)
        return qs

    @action(detail=False, methods=['post'])
    def bulk_mark(self, request):
        records = request.data.get('records', [])
        date_str = request.data.get('date') or str(timezone.now().date())
        marked_by = request.data.get('marked_by', 'Hostel Warden')

        saved = 0
        for item in records:
            student_id = item.get('student_id')
            status_val = item.get('status', 'present')
            remarks = item.get('remarks', '')
            if student_id:
                Attendance.objects.update_or_create(
                    student_id=student_id,
                    date=date_str,
                    defaults={'status': status_val, 'remarks': remarks, 'marked_by': marked_by}
                )
                saved += 1
        return Response({"message": f"Successfully updated attendance for {saved} students on {date_str}."})

    @action(detail=False, methods=['get'])
    def audit(self, request):
        today = timezone.localdate()
        date_param = request.query_params.get('date') or today
        attendances = Attendance.objects.filter(date=date_param).select_related('student', 'session').order_by('-verified_at', '-created_at')
        methods_count = attendances.values('method').annotate(count=Count('id'))
        serializer = self.get_serializer(attendances, many=True)
        return Response({
            "date": str(date_param),
            "total_marked": attendances.count(),
            "method_breakdown": {item['method']: item['count'] for item in methods_count},
            "records": serializer.data
        })


class AttendanceSessionViewSet(viewsets.ModelViewSet):
    queryset = AttendanceSession.objects.all().order_by('-created_at')
    serializer_class = AttendanceSessionSerializer
    permission_classes = [IsStaffOrReadOnly]

    def create(self, request, *args, **kwargs):
        title = request.data.get('title', '').strip() or 'Evening Curfew Roll Call'
        session_type = request.data.get('session_type', 'evening_roll_call')
        duration_minutes = int(request.data.get('duration_minutes', 15))
        created_by = request.data.get('created_by', 'Chief Hostel Warden')

        # Generate unique token and 6-digit PIN
        token = secrets.token_urlsafe(32)
        code = f"{random.randint(100000, 999999)}"
        while AttendanceSession.objects.filter(code=code, is_active=True).exists():
            code = f"{random.randint(100000, 999999)}"

        expires_at = timezone.now() + timedelta(minutes=duration_minutes)

        # Deactivate any previous active sessions
        AttendanceSession.objects.filter(is_active=True).update(is_active=False)

        session = AttendanceSession.objects.create(
            title=title,
            session_type=session_type,
            date=timezone.localdate(),
            token=token,
            code=code,
            expires_at=expires_at,
            created_by=created_by,
            is_active=True
        )

        serializer = self.get_serializer(session)
        return Response({
            "message": "Live attendance session created successfully.",
            "session": serializer.data
        }, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['get'])
    def active(self, request):
        now = timezone.now()
        session = AttendanceSession.objects.filter(is_active=True, expires_at__gt=now).first()
        if not session:
            return Response({"active": False, "session": None})

        attendees = Attendance.objects.filter(session=session).select_related('student').order_by('-verified_at')[:30]
        attendee_list = [
            {
                "id": a.id,
                "student_id": a.student.student_id,
                "student_name": a.student.full_name,
                "method": a.method,
                "verified_at": a.verified_at,
                "room_number": a.student.allocations.filter(status='active').first().room.room_number if a.student.allocations.filter(status='active').first() else 'N/A'
            }
            for a in attendees
        ]

        total_hostel_students = Student.objects.filter(status='active').count()

        return Response({
            "active": True,
            "session": self.get_serializer(session).data,
            "total_students": total_hostel_students,
            "checked_in_count": session.attendees_count,
            "recent_attendees": attendee_list
        })

    @action(detail=True, methods=['post'])
    def close(self, request, pk=None):
        session = self.get_object()
        session.is_active = False
        session.save()
        return Response({"message": f"Session '{session.title}' closed successfully.", "is_active": False})


class StudentPortalViewSet(viewsets.ViewSet):
    permission_classes = [AllowAny]

    def _get_student(self, request):
        # 1. If user is authenticated and linked to student
        if request.user.is_authenticated:
            student = getattr(request.user, 'student_profile', None)
            if student:
                return student
            student = Student.objects.filter(user=request.user).first()
            if student:
                return student
            student = Student.objects.filter(student_id__iexact=request.user.username).first()
            if student:
                return student

        # 2. Support student_id passed as query parameter or body for demo/testing convenience
        student_id = request.query_params.get('student_id') or request.data.get('student_id')
        if student_id:
            raw = str(student_id).strip()
            student = Student.objects.filter(student_id__iexact=raw).first()
            if student:
                return student
            # Friendly ID format: e.g. ID-101 -> HST-2026-001
            if raw.upper().startswith('ID-'):
                try:
                    num = int(raw.split('-')[-1])
                    if num > 100:
                        candidate_code = f"HST-2026-{(num - 100):03d}"
                        student = Student.objects.filter(student_id__iexact=candidate_code).first()
                        if student:
                            return student
                except (ValueError, IndexError):
                    pass
            fallback = Student.objects.filter(student_id__icontains=raw).first()
            if fallback:
                return fallback

        # 3. Fallback to first active student for dev/preview
        return Student.objects.filter(status='active').first()

    @action(detail=False, methods=['get'])
    def profile(self, request):
        student = self._get_student(request)
        if not student:
            return Response({"error": "No student record identified."}, status=status.HTTP_404_NOT_FOUND)

        serializer = StudentPortalProfileSerializer(student)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def attendance(self, request):
        student = self._get_student(request)
        if not student:
            return Response({"error": "No student record identified."}, status=status.HTTP_404_NOT_FOUND)

        today = timezone.localdate()
        today_record = Attendance.objects.filter(student=student, date=today).first()

        records = Attendance.objects.filter(student=student).order_by('-date')
        total_days = records.count()
        present_days = records.filter(status='present').count()
        percentage = round((present_days / total_days * 100), 1) if total_days > 0 else 100.0

        records_data = StudentPortalAttendanceSerializer(records[:60], many=True).data

        return Response({
            "student_id": student.student_id,
            "student_name": student.full_name,
            "today_date": str(today),
            "today_status": today_record.status if today_record else None,
            "today_record": StudentPortalAttendanceSerializer(today_record).data if today_record else None,
            "stats": {
                "total_days": total_days,
                "present_days": present_days,
                "absent_days": records.filter(status='absent').count(),
                "leave_days": records.filter(status='on_leave').count(),
                "percentage": percentage,
                "month_name": today.strftime('%B %Y')
            },
            "history": records_data
        })

    @action(detail=False, methods=['post'], url_path='check-in')
    def check_in(self, request):
        student = self._get_student(request)
        if not student:
            return Response(
                {"error": "Student identity could not be verified. Please log in as a student."},
                status=status.HTTP_401_UNAUTHORIZED
            )

        session_token = request.data.get('session_token', '').strip()
        session_code = request.data.get('session_code', '').strip()
        method = request.data.get('method', 'qr_code')
        if method not in ['qr_code', 'session_code', 'face_verified', 'manual']:
            method = 'qr_code'

        # Find the session
        session = None
        if session_token:
            session = AttendanceSession.objects.filter(token=session_token, is_active=True).first()
        elif session_code:
            session = AttendanceSession.objects.filter(code=session_code, is_active=True).first()
        else:
            session = AttendanceSession.objects.filter(is_active=True, expires_at__gt=timezone.now()).first()

        if not session:
            return Response(
                {"error": "Invalid or expired attendance session. Please scan a live QR code or enter a valid 6-digit code."},
                status=status.HTTP_400_BAD_REQUEST
            )

        if session.is_expired:
            session.is_active = False
            session.save()
            return Response(
                {"error": "This attendance session has expired. Please ask the warden to start a new roll call session."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Duplicate check
        existing = Attendance.objects.filter(student=student, date=session.date).first()
        if existing:
            return Response(
                {
                    "error": f"Attendance already marked for today ({existing.date}) as '{existing.status.upper()}'. Duplicate check-in is not permitted.",
                    "already_marked": True,
                    "record": StudentPortalAttendanceSerializer(existing).data
                },
                status=status.HTTP_409_CONFLICT
            )

        now = timezone.now()
        ip = request.META.get('REMOTE_ADDR', '')
        device_info = request.data.get('device_info', '')[:200]

        remarks_map = {
            'qr_code': 'Self Check-in via Camera QR Scan',
            'session_code': 'Self Check-in via 6-digit PIN',
            'face_verified': 'Self Check-in via Biometric Camera Verification'
        }

        record = Attendance.objects.create(
            student=student,
            session=session,
            date=session.date,
            status='present',
            method=method,
            verified_at=now,
            ip_address=ip,
            device_info=device_info,
            remarks=remarks_map.get(method, f'Self Check-in via {method}'),
            marked_by='Student Portal'
        )

        return Response(
            {
                "message": f"Attendance successfully marked as PRESENT for {student.full_name}!",
                "student_id": student.student_id,
                "student_name": student.full_name,
                "date": str(session.date),
                "verified_at": now.isoformat(),
                "method": method,
                "session_title": session.title,
                "record": StudentPortalAttendanceSerializer(record).data
            },
            status=status.HTTP_201_CREATED
        )

class ComplaintViewSet(viewsets.ModelViewSet):
    queryset = Complaint.objects.all().select_related('student').order_by('-submission_date', '-created_at')
    serializer_class = ComplaintSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        qs = super().get_queryset()
        status_filter = self.request.query_params.get('status')
        category = self.request.query_params.get('category')
        search = self.request.query_params.get('search')
        if status_filter:
            qs = qs.filter(status=status_filter)
        if category:
            qs = qs.filter(category=category)
        if search:
            qs = qs.filter(Q(title__icontains=search) | Q(student_name__icontains=search) | Q(room_number__icontains=search))
        return qs

class NoticeViewSet(viewsets.ModelViewSet):
    queryset = Notice.objects.all().order_by('-publication_date', '-created_at')
    serializer_class = NoticeSerializer
    permission_classes = [IsStaffOrReadOnly]

    def get_queryset(self):
        qs = super().get_queryset()
        published_only = self.request.query_params.get('published_only')
        if published_only == 'true':
            qs = qs.filter(is_published=True)
        return qs

class EmployeeViewSet(viewsets.ModelViewSet):
    queryset = Employee.objects.all().prefetch_related('salary_payments').order_by('full_name')
    serializer_class = EmployeeSerializer
    permission_classes = [IsAdminOrWarden]

    def get_queryset(self):
        qs = super().get_queryset()
        role = self.request.query_params.get('role')
        status_filter = self.request.query_params.get('status')
        search = self.request.query_params.get('search')
        if role:
            qs = qs.filter(role=role)
        if status_filter:
            qs = qs.filter(status=status_filter)
        if search:
            qs = qs.filter(Q(full_name__icontains=search) | Q(employee_id__icontains=search))
        return qs

class EmployeePaymentViewSet(viewsets.ModelViewSet):
    queryset = EmployeePayment.objects.all().select_related('employee').order_by('-payment_date')
    serializer_class = EmployeePaymentSerializer
    permission_classes = [IsAdminOrWarden]

class DashboardSummaryView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        today = timezone.now().date()

        # Students
        total_students = Student.objects.count()
        active_students = Student.objects.filter(status='active').count()
        leaved_students = Student.objects.filter(status='leaved').count()

        # Rooms & Beds
        total_rooms = Room.objects.count()
        total_beds = Bed.objects.count()
        occupied_beds = Bed.objects.filter(is_occupied=True).count()
        vacant_beds = max(0, total_beds - occupied_beds)
        occupancy_rate = round((occupied_beds / total_beds * 100), 1) if total_beds > 0 else 0.0

        # Fees
        total_billed = FeeRecord.objects.aggregate(Sum('total_amount'))['total_amount__sum'] or Decimal('0.00')
        total_collected = Payment.objects.aggregate(Sum('amount_paid'))['amount_paid__sum'] or Decimal('0.00')
        total_pending = max(Decimal('0.00'), total_billed - total_collected)

        # Today's Attendance
        today_att = Attendance.objects.filter(date=today)
        present_count = today_att.filter(status='present').count()
        absent_count = today_att.filter(status='absent').count()
        leave_count = today_att.filter(status='on_leave').count()
        att_rate = round((present_count / active_students * 100), 1) if active_students > 0 else 100.0

        # Complaints
        open_complaints = Complaint.objects.filter(status__in=['pending', 'in_progress']).count()

        # Recent activities
        recent_students = StudentSerializer(Student.objects.order_by('-created_at')[:5], many=True).data
        recent_payments = PaymentSerializer(Payment.objects.order_by('-created_at')[:5], many=True).data
        pending_complaints_list = ComplaintSerializer(Complaint.objects.filter(status='pending').order_by('-submission_date')[:5], many=True).data
        latest_notices_list = NoticeSerializer(Notice.objects.filter(is_published=True).order_by('-publication_date')[:4], many=True).data

        # Occupancy by Block chart data
        blocks_data = []
        for b in HostelBlock.objects.all():
            b_rooms = b.rooms.all()
            b_beds = Bed.objects.filter(room__in=b_rooms).count()
            b_occ = Bed.objects.filter(room__in=b_rooms, is_occupied=True).count()
            blocks_data.append({
                "block": b.name,
                "total_beds": b_beds,
                "occupied_beds": b_occ,
                "vacant_beds": max(0, b_beds - b_occ),
            })

        return Response({
            "metrics": {
                "total_students": total_students,
                "active_students": active_students,
                "leaved_students": leaved_students,
                "total_rooms": total_rooms,
                "total_beds": total_beds,
                "occupied_beds": occupied_beds,
                "vacant_beds": vacant_beds,
                "occupancy_rate": occupancy_rate,
                "total_billed": float(total_billed),
                "total_collected": float(total_collected),
                "total_pending": float(total_pending),
                "attendance_today": {
                    "present": present_count,
                    "absent": absent_count,
                    "leave": leave_count,
                    "rate": att_rate,
                    "date": str(today),
                },
                "open_complaints": open_complaints,
            },
            "recent_students": recent_students,
            "recent_payments": recent_payments,
            "pending_complaints": pending_complaints_list,
            "latest_notices": latest_notices_list,
            "blocks_occupancy": blocks_data,
        })

class ExportReportCSVView(APIView):
    permission_classes = [IsStaffOrReadOnly]

    def get(self, request, report_type):
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = f'attachment; filename="hostel_{report_type}_report_{timezone.now().strftime("%Y%m%d")}.csv"'

        writer = csv.writer(response)

        if report_type == 'students':
            writer.writerow(['Student ID', 'Full Name', 'Email', 'Phone', 'Course', 'Year', 'Status', 'Room', 'Bed', 'Admission Date'])
            for s in Student.objects.all():
                alloc = s.allocations.filter(status='active').first()
                r_num = alloc.room.room_number if alloc else 'Unassigned'
                b_num = alloc.bed.bed_number if alloc else 'N/A'
                writer.writerow([s.student_id, s.full_name, s.email, s.phone, s.course, s.year_of_study, s.status, r_num, b_num, s.admission_date])

        elif report_type == 'rooms':
            writer.writerow(['Room Number', 'Block', 'Floor', 'Type', 'Capacity', 'Occupied Beds', 'Available Beds', 'Status', 'Monthly Rent'])
            for r in Room.objects.all():
                writer.writerow([r.room_number, r.block.name, r.floor, r.get_room_type_display(), r.capacity, r.occupied_beds_count, r.available_beds_count, r.get_status_display(), r.monthly_rent])

        elif report_type == 'fees':
            writer.writerow(['Receipt / Fee Title', 'Student ID', 'Student Name', 'Total Amount', 'Due Date', 'Status', 'Amount Paid', 'Balance'])
            for f in FeeRecord.objects.all():
                writer.writerow([f.title, f.student.student_id, f.student.full_name, f.total_amount, f.due_date, f.get_status_display(), f.amount_paid, f.balance_amount])

        elif report_type == 'complaints':
            writer.writerow(['Title', 'Category', 'Student', 'Room', 'Priority', 'Status', 'Submission Date', 'Resolution Notes'])
            for c in Complaint.objects.all():
                writer.writerow([c.title, c.get_category_display(), c.student_name, c.room_number, c.get_priority_display(), c.get_status_display(), c.submission_date, c.resolution_notes])

        elif report_type == 'employees':
            writer.writerow(['Employee ID', 'Full Name', 'Role', 'Phone', 'Email', 'Joining Date', 'Monthly Salary', 'Status'])
            for e in Employee.objects.all():
                writer.writerow([e.employee_id, e.full_name, e.get_role_display(), e.phone, e.email, e.joining_date, e.monthly_salary, e.get_status_display()])

        else:
            writer.writerow(['Error', 'Invalid report type requested'])

        return response
