from rest_framework import serializers
from django.db import transaction
from decimal import Decimal
from django.utils import timezone
from .models import (
    HostelBlock, Room, Bed, Student, RoomAllocation,
    FeeRecord, Payment, Attendance, Complaint, Notice,
    Employee, EmployeePayment
)

class HostelBlockSerializer(serializers.ModelSerializer):
    rooms_count = serializers.IntegerField(source='rooms.count', read_only=True)

    class Meta:
        model = HostelBlock
        fields = ['id', 'name', 'description', 'total_floors', 'rooms_count', 'created_at']

class BedSerializer(serializers.ModelSerializer):
    room_number = serializers.CharField(source='room.room_number', read_only=True)

    class Meta:
        model = Bed
        fields = ['id', 'room', 'room_number', 'bed_number', 'is_occupied']

class RoomSerializer(serializers.ModelSerializer):
    block_name = serializers.CharField(source='block.name', read_only=True)
    section_name = serializers.SerializerMethodField()
    occupied_beds_count = serializers.ReadOnlyField()
    available_beds_count = serializers.ReadOnlyField()
    is_full = serializers.ReadOnlyField()
    beds = BedSerializer(many=True, read_only=True)

    class Meta:
        model = Room
        fields = [
            'id', 'room_number', 'block', 'block_name', 'floor', 'section_name',
            'room_type', 'capacity', 'monthly_rent', 'status',
            'amenities', 'occupied_beds_count', 'available_beds_count',
            'is_full', 'beds', 'created_at'
        ]

    def get_section_name(self, obj):
        mapping = {1: 'Room A', 2: 'Room B', 3: 'Room C', 4: 'Room D', 5: 'Room E'}
        return mapping.get(obj.floor, f"Room {chr(64 + obj.floor) if 1 <= obj.floor <= 26 else obj.floor}")

    def validate(self, attrs):
        capacity = attrs.get('capacity')
        if self.instance and capacity is not None:
            active_allocs = self.instance.allocations.filter(status='active').count()
            if capacity < active_allocs:
                raise serializers.ValidationError({
                    'capacity': f"Cannot reduce capacity to {capacity}. There are currently {active_allocs} active student allocations in this room."
                })
        monthly_rent = attrs.get('monthly_rent')
        if monthly_rent is not None and monthly_rent < 0:
            raise serializers.ValidationError({'monthly_rent': "Monthly rent cannot be negative."})
        return attrs

    def create(self, validated_data):
        room = super().create(validated_data)
        # Automatically generate default beds for the capacity
        for i in range(1, room.capacity + 1):
            Bed.objects.create(room=room, bed_number=f"Bed-{i}", is_occupied=False)
        return room

    def update(self, instance, validated_data):
        old_capacity = instance.capacity
        room = super().update(instance, validated_data)
        new_capacity = room.capacity
        if new_capacity > old_capacity:
            existing_beds_count = room.beds.count()
            for i in range(existing_beds_count + 1, new_capacity + 1):
                Bed.objects.get_or_create(room=room, bed_number=f"Bed-{i}", defaults={'is_occupied': False})
        return room

class StudentSerializer(serializers.ModelSerializer):
    current_room = serializers.SerializerMethodField()
    current_bed = serializers.SerializerMethodField()
    current_allocation_id = serializers.SerializerMethodField()
    total_fee_due = serializers.SerializerMethodField()

    class Meta:
        model = Student
        fields = [
            'id', 'student_id', 'full_name', 'email', 'phone',
            'guardian_name', 'guardian_phone', 'address', 'course',
            'year_of_study', 'admission_date', 'status',
            'current_room', 'current_bed', 'current_allocation_id',
            'total_fee_due', 'created_at'
        ]

    def get_current_room(self, obj):
        alloc = obj.allocations.filter(status='active').first()
        return alloc.room.room_number if alloc else None

    def get_current_bed(self, obj):
        alloc = obj.allocations.filter(status='active').first()
        return alloc.bed.bed_number if alloc else None

    def get_current_allocation_id(self, obj):
        alloc = obj.allocations.filter(status='active').first()
        return alloc.id if alloc else None

    def get_total_fee_due(self, obj):
        unpaid = 0
        for fee in obj.fee_records.all():
            unpaid += fee.balance_amount
        return float(unpaid)

class RoomAllocationSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.full_name', read_only=True)
    student_code = serializers.CharField(source='student.student_id', read_only=True)
    room_number = serializers.CharField(source='room.room_number', read_only=True)
    bed_name = serializers.CharField(source='bed.bed_number', read_only=True)
    allocated_date = serializers.DateField(required=False, default=timezone.localdate)

    class Meta:
        model = RoomAllocation
        fields = [
            'id', 'student', 'student_name', 'student_code',
            'room', 'room_number', 'bed', 'bed_name',
            'allocated_date', 'checkout_date', 'status',
            'remarks', 'created_at'
        ]

    def validate(self, attrs):
        student = attrs.get('student')
        room = attrs.get('room')
        bed = attrs.get('bed')
        status_val = attrs.get('status', 'active')

        if status_val == 'active':
            # Check if student already has an active allocation
            active_alloc = RoomAllocation.objects.filter(student=student, status='active')
            if self.instance:
                active_alloc = active_alloc.exclude(pk=self.instance.pk)
            if active_alloc.exists():
                raise serializers.ValidationError("Student already has an active room allocation. Please transfer or release their existing bed first.")

            # Check if bed is already occupied by someone else
            if bed.is_occupied:
                active_bed_alloc = RoomAllocation.objects.filter(bed=bed, status='active')
                if self.instance:
                    active_bed_alloc = active_bed_alloc.exclude(pk=self.instance.pk)
                if active_bed_alloc.exists():
                    raise serializers.ValidationError(f"{bed.bed_number} in Room {room.room_number} is already occupied.")

            # Check capacity
            current_count = room.allocations.filter(status='active').count()
            if not self.instance and current_count >= room.capacity:
                raise serializers.ValidationError(f"Room {room.room_number} has reached maximum capacity ({room.capacity} beds).")

        return attrs

    def create(self, validated_data):
        with transaction.atomic():
            alloc = super().create(validated_data)
            if alloc.status == 'active':
                alloc.bed.is_occupied = True
                alloc.bed.save()
            return alloc

    def update(self, instance, validated_data):
        with transaction.atomic():
            old_bed = instance.bed
            old_status = instance.status

            updated_alloc = super().update(instance, validated_data)

            if updated_alloc.status in ['checked_out', 'transferred']:
                updated_alloc.bed.is_occupied = False
                updated_alloc.bed.save()
                if not updated_alloc.checkout_date:
                    updated_alloc.checkout_date = timezone.localdate()
                    updated_alloc.save()
            elif updated_alloc.status == 'active':
                if old_bed.id != updated_alloc.bed.id:
                    old_bed.is_occupied = False
                    old_bed.save()
                updated_alloc.bed.is_occupied = True
                updated_alloc.bed.save()

            return updated_alloc

class PaymentSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.full_name', read_only=True)
    student_code = serializers.CharField(source='student.student_id', read_only=True)
    fee_title = serializers.CharField(source='fee_record.title', read_only=True)
    receipt_number = serializers.CharField(required=False, default='')
    payment_date = serializers.DateField(required=False, default=timezone.localdate)

    class Meta:
        model = Payment
        fields = [
            'id', 'receipt_number', 'fee_record', 'fee_title',
            'student', 'student_name', 'student_code',
            'amount_paid', 'payment_date', 'payment_method',
            'transaction_reference', 'remarks', 'recorded_by', 'created_at'
        ]

    def create(self, validated_data):
        with transaction.atomic():
            # Generate receipt number if not provided
            if not validated_data.get('receipt_number'):
                import random
                validated_data['receipt_number'] = f"RCPT-{timezone.localdate().strftime('%Y%m%d')}-{random.randint(1000, 9999)}"

            payment = super().create(validated_data)
            
            # Recalculate fee status
            fee = payment.fee_record
            if fee.balance_amount <= Decimal('0.00'):
                fee.status = 'paid'
            elif fee.amount_paid > Decimal('0.00'):
                fee.status = 'partial'
            fee.save()

            return payment

class FeeRecordSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.full_name', read_only=True)
    student_code = serializers.CharField(source='student.student_id', read_only=True)
    amount_paid = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    balance_amount = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    payments = PaymentSerializer(many=True, read_only=True)

    class Meta:
        model = FeeRecord
        fields = [
            'id', 'student', 'student_name', 'student_code',
            'title', 'academic_term', 'total_amount', 'due_date',
            'status', 'amount_paid', 'balance_amount', 'payments', 'created_at'
        ]

class AttendanceSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.full_name', read_only=True)
    student_code = serializers.CharField(source='student.student_id', read_only=True)
    room_number = serializers.SerializerMethodField()

    class Meta:
        model = Attendance
        fields = [
            'id', 'student', 'student_name', 'student_code', 'room_number',
            'date', 'status', 'remarks', 'marked_by', 'created_at'
        ]

    def get_room_number(self, obj):
        alloc = obj.student.allocations.filter(status='active').first()
        return alloc.room.room_number if alloc else 'N/A'

class ComplaintSerializer(serializers.ModelSerializer):
    class Meta:
        model = Complaint
        fields = [
            'id', 'student', 'student_name', 'room_number',
            'category', 'title', 'description', 'status',
            'priority', 'submission_date', 'resolution_notes',
            'resolved_at', 'created_at'
        ]

class NoticeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notice
        fields = [
            'id', 'title', 'description', 'author', 'publication_date',
            'is_published', 'priority', 'audience', 'created_at'
        ]

class EmployeePaymentSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source='employee.full_name', read_only=True)
    employee_code = serializers.CharField(source='employee.employee_id', read_only=True)

    class Meta:
        model = EmployeePayment
        fields = [
            'id', 'voucher_number', 'employee', 'employee_name', 'employee_code',
            'payment_date', 'amount', 'salary_month', 'payment_method',
            'remarks', 'created_at'
        ]

class EmployeeSerializer(serializers.ModelSerializer):
    salary_payments = EmployeePaymentSerializer(many=True, read_only=True)

    class Meta:
        model = Employee
        fields = [
            'id', 'employee_id', 'full_name', 'role', 'phone',
            'email', 'joining_date', 'monthly_salary', 'status',
            'salary_payments', 'created_at'
        ]
