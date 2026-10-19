from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
from decimal import Decimal

class HostelBlock(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True, default='')
    total_floors = models.PositiveIntegerField(default=3)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

class Room(models.Model):
    ROOM_TYPE_CHOICES = [
        ('single', 'Single Bed'),
        ('double', 'Double Sharing (2 Beds)'),
        ('triple', 'Triple Sharing (3 Beds)'),
        ('dorm', 'Dormitory (4 Beds)'),
    ]
    STATUS_CHOICES = [
        ('active', 'Operational'),
        ('maintenance', 'Under Maintenance'),
        ('inactive', 'Inactive'),
    ]

    room_number = models.CharField(max_length=20, unique=True)
    block = models.ForeignKey(HostelBlock, on_delete=models.CASCADE, related_name='rooms')
    floor = models.PositiveIntegerField(default=1)
    room_type = models.CharField(max_length=20, choices=ROOM_TYPE_CHOICES, default='double')
    capacity = models.PositiveIntegerField(default=2)
    monthly_rent = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('4500.00'))
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    amenities = models.CharField(max_length=255, blank=True, default='Attached Bathroom, Wi-Fi, Ceiling Fan, Balcony')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Room {self.room_number} ({self.block.name})"

    @property
    def occupied_beds_count(self):
        return self.allocations.filter(status='active').count()

    @property
    def available_beds_count(self):
        return max(0, self.capacity - self.occupied_beds_count)

    @property
    def is_full(self):
        return self.available_beds_count <= 0

class Bed(models.Model):
    room = models.ForeignKey(Room, on_delete=models.CASCADE, related_name='beds')
    bed_number = models.CharField(max_length=20)
    is_occupied = models.BooleanField(default=False)

    class Meta:
        unique_together = ('room', 'bed_number')

    def __str__(self):
        return f"{self.room.room_number} - {self.bed_number}"

class Student(models.Model):
    STATUS_CHOICES = [
        ('active', 'Living in Hostel'),
        ('leaved', 'Leaved / Alumni'),
        ('suspended', 'Suspended'),
    ]

    student_id = models.CharField(max_length=30, unique=True)
    user = models.OneToOneField(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='student_profile')
    full_name = models.CharField(max_length=150)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=20)
    guardian_name = models.CharField(max_length=150)
    guardian_phone = models.CharField(max_length=20)
    address = models.TextField(blank=True, default='')
    course = models.CharField(max_length=100, default='B.Tech CSE')
    year_of_study = models.CharField(max_length=30, default='2nd Year')
    admission_date = models.DateField(default=timezone.localdate)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.student_id} - {self.full_name}"

    @property
    def current_allocation(self):
        return self.allocations.filter(status='active').first()

class RoomAllocation(models.Model):
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('transferred', 'Transferred'),
        ('checked_out', 'Checked Out / Released'),
    ]

    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='allocations')
    room = models.ForeignKey(Room, on_delete=models.CASCADE, related_name='allocations')
    bed = models.ForeignKey(Bed, on_delete=models.CASCADE, related_name='allocations')
    allocated_date = models.DateField(default=timezone.localdate)
    checkout_date = models.DateField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    remarks = models.TextField(blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.student.full_name} -> {self.room.room_number} ({self.bed.bed_number})"

class FeeRecord(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('partial', 'Partially Paid'),
        ('paid', 'Fully Paid'),
        ('overdue', 'Overdue'),
    ]

    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='fee_records')
    title = models.CharField(max_length=150, default='Hostel & Mess Term Fee')
    academic_term = models.CharField(max_length=50, default='Fall Term 2026')
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    due_date = models.DateField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.student.full_name} - {self.title} (₹{self.total_amount})"

    @property
    def amount_paid(self):
        total = self.payments.aggregate(models.Sum('amount_paid'))['amount_paid__sum']
        return total or Decimal('0.00')

    @property
    def balance_amount(self):
        return max(Decimal('0.00'), self.total_amount - self.amount_paid)

class Payment(models.Model):
    PAYMENT_METHOD_CHOICES = [
        ('cash', 'Cash (Front Desk)'),
        ('bank_transfer', 'Bank Transfer / NEFT'),
        ('upi_offline', 'UPI (QR Code Offline Verified)'),
        ('cheque', 'Cheque / DD'),
    ]

    receipt_number = models.CharField(max_length=50, unique=True)
    fee_record = models.ForeignKey(FeeRecord, on_delete=models.CASCADE, related_name='payments')
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='payments')
    amount_paid = models.DecimalField(max_digits=10, decimal_places=2)
    payment_date = models.DateField(default=timezone.localdate)
    payment_method = models.CharField(max_length=30, choices=PAYMENT_METHOD_CHOICES, default='cash')
    transaction_reference = models.CharField(max_length=100, blank=True, default='')
    remarks = models.TextField(blank=True, default='')
    recorded_by = models.CharField(max_length=100, default='Hostel Warden')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Receipt #{self.receipt_number} - ₹{self.amount_paid} ({self.student.full_name})"

class Attendance(models.Model):
    STATUS_CHOICES = [
        ('present', 'Present'),
        ('absent', 'Absent'),
        ('on_leave', 'On Leave / Permitted'),
    ]

    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='attendance_records')
    date = models.DateField(default=timezone.localdate)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='present')
    remarks = models.CharField(max_length=200, blank=True, default='')
    marked_by = models.CharField(max_length=100, default='Hostel Supervisor')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('student', 'date')

    def __str__(self):
        return f"{self.date} - {self.student.full_name} ({self.status})"

class Complaint(models.Model):
    CATEGORY_CHOICES = [
        ('electricity', 'Electrical / Power Failure'),
        ('plumbing', 'Water Supply & Plumbing'),
        ('carpentry', 'Furniture & Carpentry'),
        ('cleaning', 'Cleanliness & Sanitation'),
        ('wifi', 'Wi-Fi & Internet'),
        ('mess', 'Mess & Food Quality'),
        ('other', 'Other Facilities'),
    ]
    STATUS_CHOICES = [
        ('pending', 'Pending / Under Review'),
        ('in_progress', 'Technician Assigned'),
        ('resolved', 'Resolved & Closed'),
    ]
    PRIORITY_CHOICES = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('urgent', 'Urgent / Emergency'),
    ]

    student = models.ForeignKey(Student, on_delete=models.SET_NULL, null=True, blank=True, related_name='complaints')
    student_name = models.CharField(max_length=150, default='Resident Student')
    room_number = models.CharField(max_length=20, blank=True, default='')
    category = models.CharField(max_length=30, choices=CATEGORY_CHOICES, default='electricity')
    title = models.CharField(max_length=200)
    description = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    priority = models.CharField(max_length=20, choices=PRIORITY_CHOICES, default='medium')
    submission_date = models.DateField(default=timezone.localdate)
    resolution_notes = models.TextField(blank=True, default='')
    resolved_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"[{self.status.upper()}] {self.title} - Room {self.room_number}"

class Notice(models.Model):
    PRIORITY_CHOICES = [
        ('low', 'General'),
        ('normal', 'Important'),
        ('high', 'High Priority'),
        ('urgent', 'Urgent Announcement'),
    ]
    AUDIENCE_CHOICES = [
        ('all', 'All Hostel Residents'),
        ('block_a', 'Block A Only'),
        ('block_b', 'Block B Only'),
        ('staff', 'Hostel Staff'),
    ]

    title = models.CharField(max_length=200)
    description = models.TextField()
    author = models.CharField(max_length=100, default='Office of Chief Warden')
    publication_date = models.DateField(default=timezone.localdate)
    is_published = models.BooleanField(default=True)
    priority = models.CharField(max_length=20, choices=PRIORITY_CHOICES, default='normal')
    audience = models.CharField(max_length=20, choices=AUDIENCE_CHOICES, default='all')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title

class Employee(models.Model):
    ROLE_CHOICES = [
        ('warden', 'Chief Warden'),
        ('assistant_warden', 'Assistant Warden'),
        ('accountant', 'Accountant / Cashier'),
        ('caretaker', 'Hostel Caretaker'),
        ('security', 'Security Supervisor'),
        ('electrician', 'Chief Electrician'),
        ('plumber', 'Plumbing Technician'),
        ('mess_head', 'Mess Manager'),
    ]
    STATUS_CHOICES = [
        ('active', 'Active Duty'),
        ('on_leave', 'On Approved Leave'),
        ('resigned', 'Relieved / Resigned'),
    ]

    employee_id = models.CharField(max_length=30, unique=True)
    full_name = models.CharField(max_length=150)
    role = models.CharField(max_length=30, choices=ROLE_CHOICES, default='caretaker')
    phone = models.CharField(max_length=20)
    email = models.EmailField(blank=True, default='')
    joining_date = models.DateField(default=timezone.localdate)
    monthly_salary = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('25000.00'))
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.employee_id} - {self.full_name} ({self.get_role_display()})"

class EmployeePayment(models.Model):
    PAYMENT_METHOD_CHOICES = [
        ('bank_transfer', 'Direct Bank Transfer (NEFT/RTGS)'),
        ('cash', 'Cash Voucher'),
        ('cheque', 'Account Payee Cheque'),
    ]

    voucher_number = models.CharField(max_length=50, unique=True)
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='salary_payments')
    payment_date = models.DateField(default=timezone.localdate)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    salary_month = models.CharField(max_length=50, default='October 2026')
    payment_method = models.CharField(max_length=30, choices=PAYMENT_METHOD_CHOICES, default='bank_transfer')
    remarks = models.TextField(blank=True, default='Monthly salary disbursed successfully.')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.voucher_number} - {self.employee.full_name} (₹{self.amount})"
