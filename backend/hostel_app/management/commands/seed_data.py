import random
from decimal import Decimal
from django.core.management.base import BaseCommand
from django.utils import timezone
from django.contrib.auth.models import User
from hostel_app.models import (
    HostelBlock, Room, Bed, Student, RoomAllocation,
    FeeRecord, Payment, Attendance, Complaint, Notice,
    Employee, EmployeePayment
)

class Command(BaseCommand):
    help = 'Seeds realistic demonstration data for Hostel Management System'

    def handle(self, *args, **options):
        self.stdout.write("Seeding hostel management system data...")

        # 1. Superuser
        if not User.objects.filter(username='hostel').exists():
            User.objects.create_superuser('hostel', 'admin@hostel.edu', 'admin1')
            self.stdout.write("Created default superuser: hostel / admin1")

        # 2. Hostel Blocks (Floors)
        block_a, _ = HostelBlock.objects.get_or_create(
            name="Floor 1",
            defaults={"description": "First Floor Residency", "total_floors": 3}
        )
        block_b, _ = HostelBlock.objects.get_or_create(
            name="Floor 2",
            defaults={"description": "Second Floor Residency with Balcony View", "total_floors": 3}
        )
        block_c, _ = HostelBlock.objects.get_or_create(
            name="Floor 3",
            defaults={"description": "Third Floor PG & Scholar Residency", "total_floors": 3}
        )

        # 3. Rooms & Beds
        rooms_specs = [
            # Block A
            ("101", block_a, 1, "double", 2, Decimal("4500.00"), "Attached Bath, Wi-Fi, Balcony"),
            ("102", block_a, 1, "double", 2, Decimal("4500.00"), "Attached Bath, Wi-Fi, Garden Facing"),
            ("103", block_a, 1, "triple", 3, Decimal("3500.00"), "Spacious Room, Wi-Fi, Study Tables"),
            ("104", block_a, 1, "single", 1, Decimal("6500.00"), "Private Single AC Room, Attached Bath"),
            ("201", block_a, 2, "double", 2, Decimal("4500.00"), "2nd Floor Balcony, Wi-Fi"),
            ("202", block_a, 2, "triple", 3, Decimal("3500.00"), "Wi-Fi, Wardrobes, Study Desks"),
            ("203", block_a, 3, "double", 2, Decimal("4500.00"), "Attached Bath, Wi-Fi, Balcony"),
            # Floor 2
            ("B-101", block_b, 1, "double", 2, Decimal("4800.00"), "Quiet Zone, Attached Bath, Wi-Fi"),
            ("B-102", block_b, 1, "double", 2, Decimal("4800.00"), "Attached Bath, Wi-Fi, Balcony"),
            ("B-201", block_b, 2, "triple", 3, Decimal("3800.00"), "Sunny View, Wi-Fi, Storage Lockers"),
            ("B-202", block_b, 3, "triple", 3, Decimal("3800.00"), "Sunny View, Wi-Fi, Study Desks"),
            # Floor 3
            ("PG-101", block_c, 1, "single", 1, Decimal("7000.00"), "AC Single Scholar Suite, Silent Wing"),
            ("PG-102", block_c, 1, "single", 1, Decimal("7000.00"), "AC Single Scholar Suite, High-Speed LAN"),
            ("PG-201", block_c, 2, "single", 1, Decimal("7000.00"), "AC Single Scholar Suite, Silent Wing"),
            ("PG-202", block_c, 3, "single", 1, Decimal("7000.00"), "AC Single Scholar Suite, High-Speed LAN"),
        ]

        created_rooms = []
        for r_num, blk, flr, r_type, cap, rent, amen in rooms_specs:
            room, created = Room.objects.get_or_create(
                room_number=r_num,
                defaults={
                    "block": blk,
                    "floor": flr,
                    "room_type": r_type,
                    "capacity": cap,
                    "monthly_rent": rent,
                    "amenities": amen,
                    "status": "active",
                }
            )
            created_rooms.append(room)
            # Ensure beds exist
            for b_idx in range(1, cap + 1):
                Bed.objects.get_or_create(
                    room=room,
                    bed_number=f"Bed-{b_idx}",
                    defaults={"is_occupied": False}
                )

        # 4. Students
        students_data = [
            ("HST-2026-001", "Aarav Sharma", "aarav.sharma@college.edu", "9876543210", "Rajesh Sharma", "9876500001", "Flat 402, Green Enclave, Delhi", "B.Tech Computer Science", "3rd Year", "active"),
            ("HST-2026-002", "Priya Patel", "priya.patel@college.edu", "9876543211", "Kirit Patel", "9876500002", "12 Royal Palms, Ahmedabad", "B.Tech Information Tech", "2nd Year", "active"),
            ("HST-2026-003", "Rohan Verma", "rohan.verma@college.edu", "9876543212", "Sunil Verma", "9876500003", "88 Civil Lines, Jaipur", "B.Tech Mechanical Engg", "3rd Year", "active"),
            ("HST-2026-004", "Ananya Deshmukh", "ananya.d@college.edu", "9876543213", "Vilas Deshmukh", "9876500004", "45 Shivaji Park, Pune", "MCA Software Engg", "1st Year", "active"),
            ("HST-2026-005", "Kabir Mehta", "kabir.mehta@college.edu", "9876543214", "Deepak Mehta", "9876500005", "B-14 Sector 62, Noida", "B.Tech Electronics & Comm", "2nd Year", "active"),
            ("HST-2026-006", "Sneha Iyer", "sneha.iyer@college.edu", "9876543215", "Ramanathan Iyer", "9876500006", "31 Anna Nagar, Chennai", "B.Tech AI & Data Science", "1st Year", "active"),
            ("HST-2026-007", "Vikram Singh", "vikram.singh@college.edu", "9876543216", "Manjit Singh", "9876500007", "72 Model Town, Ludhiana", "B.Tech Civil Engg", "4th Year", "active"),
            ("HST-2026-008", "Ishaan Malhotra", "ishaan.m@college.edu", "9876543217", "Rakesh Malhotra", "9876500008", "19 DLF Phase 2, Gurugram", "B.Tech Computer Science", "2nd Year", "active"),
            ("HST-2026-009", "Meera Nambiar", "meera.n@college.edu", "9876543218", "Gopinath Nambiar", "9876500009", "5 Kaloor, Kochi", "Ph.D. Computer Vision", "Research", "active"),
            ("HST-2026-010", "Aditya Kulkarni", "aditya.k@college.edu", "9876543219", "Anil Kulkarni", "9876500010", "104 Baner Road, Pune", "B.Tech Electrical", "4th Year", "leaved"),
        ]

        created_students = []
        for s_id, s_name, s_email, s_phone, g_name, g_phone, addr, crs, yr, st in students_data:
            student, _ = Student.objects.get_or_create(
                student_id=s_id,
                defaults={
                    "full_name": s_name,
                    "email": s_email,
                    "phone": s_phone,
                    "guardian_name": g_name,
                    "guardian_phone": g_phone,
                    "address": addr,
                    "course": crs,
                    "year_of_study": yr,
                    "status": st,
                }
            )
            created_students.append(student)

        # 5. Room Allocations
        # Allocate first 7 active students to beds
        active_students = [s for s in created_students if s.status == 'active']
        all_beds = list(Bed.objects.filter(is_occupied=False).order_by('room__room_number', 'bed_number'))

        for idx, student in enumerate(active_students[:7]):
            if idx < len(all_beds):
                target_bed = all_beds[idx]
                alloc, alloc_created = RoomAllocation.objects.get_or_create(
                    student=student,
                    status='active',
                    defaults={
                        "room": target_bed.room,
                        "bed": target_bed,
                        "remarks": f"Standard academic session allotment for {student.year_of_study}."
                    }
                )
                if alloc_created:
                    target_bed.is_occupied = True
                    target_bed.save()

        # 6. Fee Records & Payments
        for s in active_students:
            fee, _ = FeeRecord.objects.get_or_create(
                student=s,
                title="Fall Semester 2026 Hostel & Mess Fee",
                academic_term="Semester 1 - 2026",
                defaults={
                    "total_amount": Decimal("48000.00"),
                    "due_date": timezone.now().date() + timezone.timedelta(days=15),
                    "status": "pending"
                }
            )

        # Add payments for some students
        paid_students = active_students[:4]
        for idx, s in enumerate(paid_students):
            fee = s.fee_records.first()
            if fee and fee.payments.count() == 0:
                amount = Decimal("48000.00") if idx % 2 == 0 else Decimal("25000.00")
                Payment.objects.create(
                    receipt_number=f"RCPT-2026-00{idx+1}",
                    fee_record=fee,
                    student=s,
                    amount_paid=amount,
                    payment_date=timezone.now().date() - timezone.timedelta(days=random.randint(1, 10)),
                    payment_method="bank_transfer" if idx % 2 == 0 else "upi_offline",
                    transaction_reference=f"TXN-SBI-{random.randint(100000, 999999)}",
                    remarks="Authorized front-desk verified payment.",
                    recorded_by="Warden Office Accountant"
                )
                if amount >= fee.total_amount:
                    fee.status = "paid"
                else:
                    fee.status = "partial"
                fee.save()

        # 7. Attendance for Today
        today = timezone.now().date()
        for idx, s in enumerate(active_students):
            st = "present" if idx != 2 and idx != 5 else ("absent" if idx == 2 else "on_leave")
            Attendance.objects.get_or_create(
                student=s,
                date=today,
                defaults={
                    "status": st,
                    "remarks": "Regular biometric/warden evening roll call.",
                    "marked_by": "Night Warden Supervisor"
                }
            )

        # 8. Complaints
        complaints_specs = [
            (active_students[0], "101", "electricity", "Study table light socket not delivering power", "The 3-pin outlet next to Bed-1 sparks occasionally when plugging in laptop charger.", "pending", "high"),
            (active_students[1], "102", "plumbing", "Geyser hot water flow is very slow", "Water pressure in bathroom shower is low during morning peak hours.", "in_progress", "medium"),
            (active_students[2], "103", "wifi", "5GHz Wi-Fi signal drops in corner of room", "Wi-Fi disconnects frequently during online lectures.", "resolved", "low"),
            (active_students[3], "B-101", "carpentry", "Wardrobe hinge is loose", "Bottom hinge of clothes cupboard needs tightening.", "pending", "low"),
            (active_students[4], "PG-101", "mess", "Request for extra fruit counter in morning mess", "Need fresh fruit options in breakfast for athletic diet.", "in_progress", "medium"),
        ]

        for s, r_num, cat, title, desc, c_st, prio in complaints_specs:
            Complaint.objects.get_or_create(
                student=s,
                title=title,
                defaults={
                    "student_name": s.full_name,
                    "room_number": r_num,
                    "category": cat,
                    "description": desc,
                    "status": c_st,
                    "priority": prio,
                    "submission_date": today - timezone.timedelta(days=random.randint(1, 5)),
                    "resolution_notes": "Electrician scheduled for inspection." if c_st == "in_progress" else ("Router rebooted and channel frequency adjusted." if c_st == "resolved" else "")
                }
            )

        # 9. Notices
        notices_data = [
            ("Hostel Annual Cultural & Sports Meet 2026", "Registrations are now open for inter-hostel cricket, football, badminton, and chess tournaments. Submit team rosters to the sports coordinator by Friday.", "Chief Warden", "urgent", "all"),
            ("Revised Dining Hall & Mess Timings", "Breakfast: 7:30 AM - 9:30 AM | Lunch: 12:30 PM - 2:30 PM | Dinner: 7:30 PM - 9:45 PM. Students are requested to bring their RFID dining cards.", "Mess Committee", "high", "all"),
            ("Routine Electrical & Wi-Fi Maintenance Schedule", "North Wing (Block A) will undergo scheduled Wi-Fi access point firmware upgrades this Saturday between 2:00 PM and 5:00 PM.", "Campus IT Infrastructure", "normal", "block_a"),
            ("Semester Fee Balance Settlement Reminder", "Residents with outstanding hostel or mess fee balances are requested to clear all dues before mid-term exams to avoid late fines.", "Accounts Office", "high", "all"),
        ]

        for title, desc, auth, prio, aud in notices_data:
            Notice.objects.get_or_create(
                title=title,
                defaults={
                    "description": desc,
                    "author": auth,
                    "priority": prio,
                    "audience": aud,
                    "is_published": True,
                    "publication_date": today - timezone.timedelta(days=random.randint(0, 4))
                }
            )

        # 10. Employees & Staff
        employees_data = [
            ("EMP-001", "Dr. Vikramaditya Rathore", "warden", "9811223344", "warden@hostel.edu", Decimal("65000.00"), "active"),
            ("EMP-002", "Sunita Nair", "assistant_warden", "9811223345", "sunita.nair@hostel.edu", Decimal("45000.00"), "active"),
            ("EMP-003", "Harish Chandra", "accountant", "9811223346", "accounts@hostel.edu", Decimal("40000.00"), "active"),
            ("EMP-004", "Ram Swaroop", "caretaker", "9811223347", "", Decimal("28000.00"), "active"),
            ("EMP-005", "Dhananjay Yadav", "security", "9811223348", "", Decimal("24000.00"), "active"),
            ("EMP-006", "Mohan Lal", "electrician", "9811223349", "", Decimal("26000.00"), "active"),
            ("EMP-007", "Gurmeet Singh", "mess_head", "9811223350", "mess@hostel.edu", Decimal("35000.00"), "active"),
        ]

        for e_id, e_name, e_role, e_phone, e_email, e_sal, e_st in employees_data:
            emp, _ = Employee.objects.get_or_create(
                employee_id=e_id,
                defaults={
                    "full_name": e_name,
                    "role": e_role,
                    "phone": e_phone,
                    "email": e_email,
                    "monthly_salary": e_sal,
                    "status": e_st,
                }
            )
            # Add salary voucher
            if emp.salary_payments.count() == 0:
                EmployeePayment.objects.create(
                    voucher_number=f"SAL-2026-00{emp.id}",
                    employee=emp,
                    amount=e_sal,
                    salary_month="October 2026",
                    payment_date=today - timezone.timedelta(days=10),
                    payment_method="bank_transfer",
                    remarks="Monthly salary credited via electronic fund transfer."
                )

        self.stdout.write(self.style.SUCCESS("Successfully seeded comprehensive hostel management data!"))
