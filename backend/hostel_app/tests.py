from decimal import Decimal
from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from django.utils import timezone
from .models import (
    HostelBlock, Room, Bed, Student, RoomAllocation,
    FeeRecord, Payment, Attendance, Complaint, Notice,
    Employee
)

class HostelSystemTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.block = HostelBlock.objects.create(name="Floor 1", total_floors=3)
        self.room = Room.objects.create(
            room_number="101",
            block=self.block,
            floor=1,
            room_type="double",
            capacity=2,
            monthly_rent=Decimal("4500.00"),
            status="active"
        )
        # Bed objects are auto-created in serializer, but in direct model creation:
        self.bed1 = Bed.objects.create(room=self.room, bed_number="Bed-1", is_occupied=False)
        self.bed2 = Bed.objects.create(room=self.room, bed_number="Bed-2", is_occupied=False)

        self.student = Student.objects.create(
            student_id="HST-TEST-001",
            full_name="Test Student",
            email="test.student@hostel.edu",
            phone="9876543210",
            guardian_name="Test Guardian",
            guardian_phone="9876500001",
            status="active"
        )

    def test_demo_login_any_password(self):
        """Verify login allows any demo password as specified by user"""
        res = self.client.post('/api/auth/login/', {
            'username': 'any_user',
            'password': 'any_password_123'
        }, format='json')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertIn('token', res.data)
        self.assertEqual(res.data['user']['username'], 'any_user')

    def test_room_allocation_and_bed_occupancy(self):
        """Verify room allocation marks bed as occupied and prevents double allocation"""
        # Allocate bed1 to student
        res = self.client.post('/api/allocations/', {
            'student': self.student.id,
            'room': self.room.id,
            'bed': self.bed1.id,
            'status': 'active'
        }, format='json')
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)

        self.bed1.refresh_from_db()
        self.assertTrue(self.bed1.is_occupied)

        # Try to allocate same student again while active - should fail
        res_dup = self.client.post('/api/allocations/', {
            'student': self.student.id,
            'room': self.room.id,
            'bed': self.bed2.id,
            'status': 'active'
        }, format='json')
        self.assertEqual(res_dup.status_code, status.HTTP_400_BAD_REQUEST)

    def test_safe_room_deletion_prevention(self):
        """Verify room with active student allocation cannot be deleted"""
        RoomAllocation.objects.create(
            student=self.student,
            room=self.room,
            bed=self.bed1,
            status='active'
        )
        res = self.client.delete(f'/api/rooms/{self.room.id}/')
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("Cannot delete", res.data['error'])

    def test_checkout_frees_bed(self):
        """Verify checking out a student marks the bed as vacant"""
        alloc = RoomAllocation.objects.create(
            student=self.student,
            room=self.room,
            bed=self.bed1,
            status='active'
        )
        self.bed1.is_occupied = True
        self.bed1.save()

        res = self.client.post(f'/api/allocations/{alloc.id}/checkout/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)

        self.bed1.refresh_from_db()
        self.assertFalse(self.bed1.is_occupied)

    def test_fee_record_and_payment_balance(self):
        """Verify recording a payment recalculates fee balance and status"""
        fee = FeeRecord.objects.create(
            student=self.student,
            title="Term Fee",
            academic_term="Fall 2026",
            total_amount=Decimal("40000.00"),
            due_date=timezone.now().date(),
            status="pending"
        )
        self.assertEqual(fee.balance_amount, Decimal("40000.00"))

        # Pay partial amount
        pay_res = self.client.post('/api/payments/', {
            'fee_record': fee.id,
            'student': self.student.id,
            'amount_paid': '25000.00',
            'payment_method': 'bank_transfer',
            'remarks': 'Partial fee payment'
        }, format='json')
        self.assertEqual(pay_res.status_code, status.HTTP_201_CREATED)

        fee.refresh_from_db()
        self.assertEqual(fee.balance_amount, Decimal("15000.00"))
        self.assertEqual(fee.status, 'partial')

    def test_attendance_bulk_mark_and_duplicate_prevention(self):
        """Verify attendance marking does not create duplicate entries for same date"""
        today = str(timezone.now().date())
        res = self.client.post('/api/attendance/bulk_mark/', {
            'records': [
                {'student_id': self.student.id, 'status': 'present', 'remarks': 'Roll call test'}
            ],
            'date': today
        }, format='json')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(Attendance.objects.filter(student=self.student, date=today).count(), 1)

        # Update attendance for same student on same date
        res2 = self.client.post('/api/attendance/bulk_mark/', {
            'records': [
                {'student_id': self.student.id, 'status': 'on_leave', 'remarks': 'Medical leave'}
            ],
            'date': today
        }, format='json')
        self.assertEqual(res2.status_code, status.HTTP_200_OK)
        # Should still be exactly 1 record updated to 'on_leave'
        self.assertEqual(Attendance.objects.filter(student=self.student, date=today).count(), 1)
        self.assertEqual(Attendance.objects.get(student=self.student, date=today).status, 'on_leave')

    def test_dashboard_summary_endpoint(self):
        """Verify dashboard summary returns live aggregated statistics"""
        res = self.client.get('/api/dashboard/summary/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertIn('metrics', res.data)
        self.assertEqual(res.data['metrics']['total_students'], 1)
        self.assertEqual(res.data['metrics']['total_rooms'], 1)

    def test_csv_export_endpoint(self):
        """Verify CSV export endpoint returns text/csv download"""
        res = self.client.get('/api/reports/export/students/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res['Content-Type'], 'text/csv')
        self.assertIn('HST-TEST-001', res.content.decode('utf-8'))
