/**
 * LocalDatabase - Comprehensive Frontend Client-Side Storage Engine
 * Persists all Hostel Management System state directly in browser localStorage.
 * Runs 100% standalone on any laptop with zero backend/database dependencies.
 */

const STORAGE_KEY = 'ghr_hostel_db_v1';

export const INITIAL_SEED_DATA = {
  "blocks": [
    {
      "id": 1,
      "name": "Floor 1",
      "description": "Main Undergraduate Residency for Engineering & Sciences",
      "total_floors": 3,
      "rooms_count": 8
    },
    {
      "id": 2,
      "name": "Floor 2",
      "description": "Deluxe Residency with Balcony View",
      "total_floors": 3,
      "rooms_count": 4
    },
    {
      "id": 3,
      "name": "Floor 3",
      "description": "Postgraduate & Research Scholar Residency",
      "total_floors": 2,
      "rooms_count": 4
    }
  ],
  "rooms": [
    {
      "id": 1,
      "room_number": "101",
      "block": 1,
      "block_name": "Floor 1",
      "floor": 1,
      "section_name": "Room A",
      "room_type": "double",
      "capacity": 2,
      "monthly_rent": "4500.0",
      "status": "active",
      "amenities": "Attached Bath, Wi-Fi, Balcony",
      "occupied_beds_count": 2,
      "available_beds_count": 0,
      "is_full": true,
      "beds": [
        {
          "id": 1,
          "room": 1,
          "room_number": "101",
          "bed_number": "Bed-1",
          "is_occupied": true
        },
        {
          "id": 2,
          "room": 1,
          "room_number": "101",
          "bed_number": "Bed-2",
          "is_occupied": true
        }
      ]
    },
    {
      "id": 2,
      "room_number": "102",
      "block": 1,
      "block_name": "Floor 1",
      "floor": 1,
      "section_name": "Room A",
      "room_type": "double",
      "capacity": 2,
      "monthly_rent": "4500.0",
      "status": "active",
      "amenities": "Attached Bath, Wi-Fi, Garden Facing",
      "occupied_beds_count": 2,
      "available_beds_count": 0,
      "is_full": true,
      "beds": [
        {
          "id": 3,
          "room": 2,
          "room_number": "102",
          "bed_number": "Bed-1",
          "is_occupied": true
        },
        {
          "id": 4,
          "room": 2,
          "room_number": "102",
          "bed_number": "Bed-2",
          "is_occupied": true
        }
      ]
    },
    {
      "id": 3,
      "room_number": "103",
      "block": 1,
      "block_name": "Floor 1",
      "floor": 1,
      "section_name": "Room A",
      "room_type": "triple",
      "capacity": 3,
      "monthly_rent": "3500.0",
      "status": "active",
      "amenities": "Spacious Room, Wi-Fi, Study Tables",
      "occupied_beds_count": 3,
      "available_beds_count": 0,
      "is_full": true,
      "beds": [
        {
          "id": 5,
          "room": 3,
          "room_number": "103",
          "bed_number": "Bed-1",
          "is_occupied": true
        },
        {
          "id": 6,
          "room": 3,
          "room_number": "103",
          "bed_number": "Bed-2",
          "is_occupied": true
        },
        {
          "id": 7,
          "room": 3,
          "room_number": "103",
          "bed_number": "Bed-3",
          "is_occupied": true
        }
      ]
    },
    {
      "id": 4,
      "room_number": "104",
      "block": 1,
      "block_name": "Floor 1",
      "floor": 1,
      "section_name": "Room A",
      "room_type": "single",
      "capacity": 1,
      "monthly_rent": "6500.0",
      "status": "active",
      "amenities": "Private Single AC Room, Attached Bath",
      "occupied_beds_count": 0,
      "available_beds_count": 1,
      "is_full": false,
      "beds": [
        {
          "id": 8,
          "room": 4,
          "room_number": "104",
          "bed_number": "Bed-1",
          "is_occupied": false
        }
      ]
    },
    {
      "id": 5,
      "room_number": "201",
      "block": 1,
      "block_name": "Floor 1",
      "floor": 2,
      "section_name": "Room B",
      "room_type": "double",
      "capacity": 2,
      "monthly_rent": "4500.0",
      "status": "active",
      "amenities": "2nd Floor Balcony, Wi-Fi",
      "occupied_beds_count": 0,
      "available_beds_count": 2,
      "is_full": false,
      "beds": [
        {
          "id": 9,
          "room": 5,
          "room_number": "201",
          "bed_number": "Bed-1",
          "is_occupied": false
        },
        {
          "id": 10,
          "room": 5,
          "room_number": "201",
          "bed_number": "Bed-2",
          "is_occupied": false
        }
      ]
    },
    {
      "id": 6,
      "room_number": "202",
      "block": 1,
      "block_name": "Floor 1",
      "floor": 2,
      "section_name": "Room B",
      "room_type": "triple",
      "capacity": 3,
      "monthly_rent": "3500.0",
      "status": "active",
      "amenities": "Wi-Fi, Wardrobes, Study Desks",
      "occupied_beds_count": 0,
      "available_beds_count": 3,
      "is_full": false,
      "beds": [
        {
          "id": 11,
          "room": 6,
          "room_number": "202",
          "bed_number": "Bed-1",
          "is_occupied": false
        },
        {
          "id": 12,
          "room": 6,
          "room_number": "202",
          "bed_number": "Bed-2",
          "is_occupied": false
        },
        {
          "id": 13,
          "room": 6,
          "room_number": "202",
          "bed_number": "Bed-3",
          "is_occupied": false
        }
      ]
    },
    {
      "id": 7,
      "room_number": "B-101",
      "block": 2,
      "block_name": "Floor 2",
      "floor": 1,
      "section_name": "Room A",
      "room_type": "double",
      "capacity": 2,
      "monthly_rent": "4800.0",
      "status": "active",
      "amenities": "Quiet Zone, Attached Bath, Wi-Fi",
      "occupied_beds_count": 0,
      "available_beds_count": 2,
      "is_full": false,
      "beds": [
        {
          "id": 14,
          "room": 7,
          "room_number": "B-101",
          "bed_number": "Bed-1",
          "is_occupied": false
        },
        {
          "id": 15,
          "room": 7,
          "room_number": "B-101",
          "bed_number": "Bed-2",
          "is_occupied": false
        }
      ]
    },
    {
      "id": 8,
      "room_number": "B-102",
      "block": 2,
      "block_name": "Floor 2",
      "floor": 1,
      "section_name": "Room A",
      "room_type": "double",
      "capacity": 2,
      "monthly_rent": "4800.0",
      "status": "active",
      "amenities": "Attached Bath, Wi-Fi, Balcony",
      "occupied_beds_count": 0,
      "available_beds_count": 2,
      "is_full": false,
      "beds": [
        {
          "id": 16,
          "room": 8,
          "room_number": "B-102",
          "bed_number": "Bed-1",
          "is_occupied": false
        },
        {
          "id": 17,
          "room": 8,
          "room_number": "B-102",
          "bed_number": "Bed-2",
          "is_occupied": false
        }
      ]
    },
    {
      "id": 9,
      "room_number": "B-201",
      "block": 2,
      "block_name": "Floor 2",
      "floor": 2,
      "section_name": "Room B",
      "room_type": "triple",
      "capacity": 3,
      "monthly_rent": "3800.0",
      "status": "active",
      "amenities": "Sunny View, Wi-Fi, Storage Lockers",
      "occupied_beds_count": 0,
      "available_beds_count": 3,
      "is_full": false,
      "beds": [
        {
          "id": 18,
          "room": 9,
          "room_number": "B-201",
          "bed_number": "Bed-1",
          "is_occupied": false
        },
        {
          "id": 19,
          "room": 9,
          "room_number": "B-201",
          "bed_number": "Bed-2",
          "is_occupied": false
        },
        {
          "id": 20,
          "room": 9,
          "room_number": "B-201",
          "bed_number": "Bed-3",
          "is_occupied": false
        }
      ]
    },
    {
      "id": 10,
      "room_number": "PG-101",
      "block": 3,
      "block_name": "Floor 3",
      "floor": 1,
      "section_name": "Room A",
      "room_type": "single",
      "capacity": 1,
      "monthly_rent": "7000.0",
      "status": "active",
      "amenities": "AC Single Scholar Suite, Silent Wing",
      "occupied_beds_count": 0,
      "available_beds_count": 1,
      "is_full": false,
      "beds": [
        {
          "id": 21,
          "room": 10,
          "room_number": "PG-101",
          "bed_number": "Bed-1",
          "is_occupied": false
        }
      ]
    },
    {
      "id": 11,
      "room_number": "PG-102",
      "block": 3,
      "block_name": "Floor 3",
      "floor": 1,
      "section_name": "Room A",
      "room_type": "single",
      "capacity": 1,
      "monthly_rent": "7000.0",
      "status": "active",
      "amenities": "AC Single Scholar Suite, High-Speed LAN",
      "occupied_beds_count": 0,
      "available_beds_count": 1,
      "is_full": false,
      "beds": [
        {
          "id": 22,
          "room": 11,
          "room_number": "PG-102",
          "bed_number": "Bed-1",
          "is_occupied": false
        }
      ]
    },
    {
      "id": 12,
      "room_number": "484",
      "block": 1,
      "block_name": "Floor 1",
      "floor": 3,
      "section_name": "Room C",
      "room_type": "double",
      "capacity": 2,
      "monthly_rent": "4500.0",
      "status": "active",
      "amenities": "Attached Bath, Wi-Fi, Balcony",
      "occupied_beds_count": 0,
      "available_beds_count": 2,
      "is_full": false,
      "beds": [
        {
          "id": 23,
          "room": 12,
          "room_number": "484",
          "bed_number": "Bed-1",
          "is_occupied": false
        },
        {
          "id": 24,
          "room": 12,
          "room_number": "484",
          "bed_number": "Bed-2",
          "is_occupied": false
        }
      ]
    },
    {
      "id": 13,
      "room_number": "203",
      "block": 1,
      "block_name": "Floor 1",
      "floor": 3,
      "section_name": "Room C",
      "room_type": "double",
      "capacity": 2,
      "monthly_rent": "4500.0",
      "status": "active",
      "amenities": "Attached Bath, Wi-Fi, Balcony",
      "occupied_beds_count": 0,
      "available_beds_count": 2,
      "is_full": false,
      "beds": [
        {
          "id": 25,
          "room": 13,
          "room_number": "203",
          "bed_number": "Bed-1",
          "is_occupied": false
        },
        {
          "id": 26,
          "room": 13,
          "room_number": "203",
          "bed_number": "Bed-2",
          "is_occupied": false
        }
      ]
    },
    {
      "id": 14,
      "room_number": "B-202",
      "block": 2,
      "block_name": "Floor 2",
      "floor": 3,
      "section_name": "Room C",
      "room_type": "triple",
      "capacity": 3,
      "monthly_rent": "3800.0",
      "status": "active",
      "amenities": "Sunny View, Wi-Fi, Study Desks",
      "occupied_beds_count": 0,
      "available_beds_count": 3,
      "is_full": false,
      "beds": [
        {
          "id": 27,
          "room": 14,
          "room_number": "B-202",
          "bed_number": "Bed-1",
          "is_occupied": false
        },
        {
          "id": 28,
          "room": 14,
          "room_number": "B-202",
          "bed_number": "Bed-2",
          "is_occupied": false
        },
        {
          "id": 29,
          "room": 14,
          "room_number": "B-202",
          "bed_number": "Bed-3",
          "is_occupied": false
        }
      ]
    },
    {
      "id": 15,
      "room_number": "PG-201",
      "block": 3,
      "block_name": "Floor 3",
      "floor": 2,
      "section_name": "Room B",
      "room_type": "single",
      "capacity": 1,
      "monthly_rent": "7000.0",
      "status": "active",
      "amenities": "AC Single Scholar Suite, Silent Wing",
      "occupied_beds_count": 0,
      "available_beds_count": 1,
      "is_full": false,
      "beds": [
        {
          "id": 30,
          "room": 15,
          "room_number": "PG-201",
          "bed_number": "Bed-1",
          "is_occupied": false
        }
      ]
    },
    {
      "id": 16,
      "room_number": "PG-202",
      "block": 3,
      "block_name": "Floor 3",
      "floor": 3,
      "section_name": "Room C",
      "room_type": "single",
      "capacity": 1,
      "monthly_rent": "7000.0",
      "status": "active",
      "amenities": "AC Single Scholar Suite, High-Speed LAN",
      "occupied_beds_count": 0,
      "available_beds_count": 1,
      "is_full": false,
      "beds": [
        {
          "id": 31,
          "room": 16,
          "room_number": "PG-202",
          "bed_number": "Bed-1",
          "is_occupied": false
        }
      ]
    }
  ],
  "beds": [
    {
      "id": 1,
      "room": 1,
      "room_number": "101",
      "bed_number": "Bed-1",
      "is_occupied": true
    },
    {
      "id": 2,
      "room": 1,
      "room_number": "101",
      "bed_number": "Bed-2",
      "is_occupied": true
    },
    {
      "id": 3,
      "room": 2,
      "room_number": "102",
      "bed_number": "Bed-1",
      "is_occupied": true
    },
    {
      "id": 4,
      "room": 2,
      "room_number": "102",
      "bed_number": "Bed-2",
      "is_occupied": true
    },
    {
      "id": 5,
      "room": 3,
      "room_number": "103",
      "bed_number": "Bed-1",
      "is_occupied": true
    },
    {
      "id": 6,
      "room": 3,
      "room_number": "103",
      "bed_number": "Bed-2",
      "is_occupied": true
    },
    {
      "id": 7,
      "room": 3,
      "room_number": "103",
      "bed_number": "Bed-3",
      "is_occupied": true
    },
    {
      "id": 8,
      "room": 4,
      "room_number": "104",
      "bed_number": "Bed-1",
      "is_occupied": false
    },
    {
      "id": 9,
      "room": 5,
      "room_number": "201",
      "bed_number": "Bed-1",
      "is_occupied": false
    },
    {
      "id": 10,
      "room": 5,
      "room_number": "201",
      "bed_number": "Bed-2",
      "is_occupied": false
    },
    {
      "id": 11,
      "room": 6,
      "room_number": "202",
      "bed_number": "Bed-1",
      "is_occupied": false
    },
    {
      "id": 12,
      "room": 6,
      "room_number": "202",
      "bed_number": "Bed-2",
      "is_occupied": false
    },
    {
      "id": 13,
      "room": 6,
      "room_number": "202",
      "bed_number": "Bed-3",
      "is_occupied": false
    },
    {
      "id": 14,
      "room": 7,
      "room_number": "B-101",
      "bed_number": "Bed-1",
      "is_occupied": false
    },
    {
      "id": 15,
      "room": 7,
      "room_number": "B-101",
      "bed_number": "Bed-2",
      "is_occupied": false
    },
    {
      "id": 16,
      "room": 8,
      "room_number": "B-102",
      "bed_number": "Bed-1",
      "is_occupied": false
    },
    {
      "id": 17,
      "room": 8,
      "room_number": "B-102",
      "bed_number": "Bed-2",
      "is_occupied": false
    },
    {
      "id": 18,
      "room": 9,
      "room_number": "B-201",
      "bed_number": "Bed-1",
      "is_occupied": false
    },
    {
      "id": 19,
      "room": 9,
      "room_number": "B-201",
      "bed_number": "Bed-2",
      "is_occupied": false
    },
    {
      "id": 20,
      "room": 9,
      "room_number": "B-201",
      "bed_number": "Bed-3",
      "is_occupied": false
    },
    {
      "id": 21,
      "room": 10,
      "room_number": "PG-101",
      "bed_number": "Bed-1",
      "is_occupied": false
    },
    {
      "id": 22,
      "room": 11,
      "room_number": "PG-102",
      "bed_number": "Bed-1",
      "is_occupied": false
    },
    {
      "id": 23,
      "room": 12,
      "room_number": "484",
      "bed_number": "Bed-1",
      "is_occupied": false
    },
    {
      "id": 24,
      "room": 12,
      "room_number": "484",
      "bed_number": "Bed-2",
      "is_occupied": false
    },
    {
      "id": 25,
      "room": 13,
      "room_number": "203",
      "bed_number": "Bed-1",
      "is_occupied": false
    },
    {
      "id": 26,
      "room": 13,
      "room_number": "203",
      "bed_number": "Bed-2",
      "is_occupied": false
    },
    {
      "id": 27,
      "room": 14,
      "room_number": "B-202",
      "bed_number": "Bed-1",
      "is_occupied": false
    },
    {
      "id": 28,
      "room": 14,
      "room_number": "B-202",
      "bed_number": "Bed-2",
      "is_occupied": false
    },
    {
      "id": 29,
      "room": 14,
      "room_number": "B-202",
      "bed_number": "Bed-3",
      "is_occupied": false
    },
    {
      "id": 30,
      "room": 15,
      "room_number": "PG-201",
      "bed_number": "Bed-1",
      "is_occupied": false
    },
    {
      "id": 31,
      "room": 16,
      "room_number": "PG-202",
      "bed_number": "Bed-1",
      "is_occupied": false
    }
  ],
  "students": [
    {
      "id": 1,
      "student_id": "HST-2026-001",
      "full_name": "Aarav Sharma",
      "email": "aarav.sharma@college.edu",
      "phone": "9876543210",
      "guardian_name": "Rajesh Sharma",
      "guardian_phone": "9876500001",
      "address": "Flat 402, Green Enclave, Delhi",
      "course": "B.Tech Computer Science",
      "year_of_study": "3rd Year",
      "admission_date": "2026-10-19",
      "status": "active",
      "current_room": "101",
      "current_bed": "Bed-1",
      "current_allocation_id": 1,
      "total_fee_due": 0.0
    },
    {
      "id": 2,
      "student_id": "HST-2026-002",
      "full_name": "Priya Patel",
      "email": "priya.patel@college.edu",
      "phone": "9876543211",
      "guardian_name": "Kirit Patel",
      "guardian_phone": "9876500002",
      "address": "12 Royal Palms, Ahmedabad",
      "course": "B.Tech Information Tech",
      "year_of_study": "2nd Year",
      "admission_date": "2026-10-19",
      "status": "active",
      "current_room": "101",
      "current_bed": "Bed-2",
      "current_allocation_id": 2,
      "total_fee_due": 23000.0
    },
    {
      "id": 3,
      "student_id": "HST-2026-003",
      "full_name": "Rohan Verma",
      "email": "rohan.verma@college.edu",
      "phone": "9876543212",
      "guardian_name": "Sunil Verma",
      "guardian_phone": "9876500003",
      "address": "88 Civil Lines, Jaipur",
      "course": "B.Tech Mechanical Engg",
      "year_of_study": "3rd Year",
      "admission_date": "2026-10-19",
      "status": "active",
      "current_room": "102",
      "current_bed": "Bed-1",
      "current_allocation_id": 3,
      "total_fee_due": 0.0
    },
    {
      "id": 4,
      "student_id": "HST-2026-004",
      "full_name": "Ananya Deshmukh",
      "email": "ananya.d@college.edu",
      "phone": "9876543213",
      "guardian_name": "Vilas Deshmukh",
      "guardian_phone": "9876500004",
      "address": "45 Shivaji Park, Pune",
      "course": "MCA Software Engg",
      "year_of_study": "1st Year",
      "admission_date": "2026-10-19",
      "status": "active",
      "current_room": "102",
      "current_bed": "Bed-2",
      "current_allocation_id": 4,
      "total_fee_due": 23000.0
    },
    {
      "id": 5,
      "student_id": "HST-2026-005",
      "full_name": "Kabir Mehta",
      "email": "kabir.mehta@college.edu",
      "phone": "9876543214",
      "guardian_name": "Deepak Mehta",
      "guardian_phone": "9876500005",
      "address": "B-14 Sector 62, Noida",
      "course": "B.Tech Electronics & Comm",
      "year_of_study": "2nd Year",
      "admission_date": "2026-10-19",
      "status": "active",
      "current_room": "103",
      "current_bed": "Bed-1",
      "current_allocation_id": 5,
      "total_fee_due": 48000.0
    },
    {
      "id": 6,
      "student_id": "HST-2026-006",
      "full_name": "Sneha Iyer",
      "email": "sneha.iyer@college.edu",
      "phone": "9876543215",
      "guardian_name": "Ramanathan Iyer",
      "guardian_phone": "9876500006",
      "address": "31 Anna Nagar, Chennai",
      "course": "B.Tech AI & Data Science",
      "year_of_study": "1st Year",
      "admission_date": "2026-10-19",
      "status": "active",
      "current_room": "103",
      "current_bed": "Bed-2",
      "current_allocation_id": 6,
      "total_fee_due": 48000.0
    },
    {
      "id": 7,
      "student_id": "HST-2026-007",
      "full_name": "Vikram Singh",
      "email": "vikram.singh@college.edu",
      "phone": "9876543216",
      "guardian_name": "Manjit Singh",
      "guardian_phone": "9876500007",
      "address": "72 Model Town, Ludhiana",
      "course": "B.Tech Civil Engg",
      "year_of_study": "4th Year",
      "admission_date": "2026-10-19",
      "status": "active",
      "current_room": "103",
      "current_bed": "Bed-3",
      "current_allocation_id": 7,
      "total_fee_due": 48000.0
    },
    {
      "id": 8,
      "student_id": "HST-2026-008",
      "full_name": "Ishaan Malhotra",
      "email": "ishaan.m@college.edu",
      "phone": "9876543217",
      "guardian_name": "Rakesh Malhotra",
      "guardian_phone": "9876500008",
      "address": "19 DLF Phase 2, Gurugram",
      "course": "B.Tech Computer Science",
      "year_of_study": "2nd Year",
      "admission_date": "2026-10-19",
      "status": "active",
      "current_room": null,
      "current_bed": null,
      "current_allocation_id": null,
      "total_fee_due": 48000.0
    },
    {
      "id": 9,
      "student_id": "HST-2026-009",
      "full_name": "Meera Nambiar",
      "email": "meera.n@college.edu",
      "phone": "9876543218",
      "guardian_name": "Gopinath Nambiar",
      "guardian_phone": "9876500009",
      "address": "5 Kaloor, Kochi",
      "course": "Ph.D. Computer Vision",
      "year_of_study": "Research",
      "admission_date": "2026-10-19",
      "status": "active",
      "current_room": null,
      "current_bed": null,
      "current_allocation_id": null,
      "total_fee_due": 48000.0
    },
    {
      "id": 10,
      "student_id": "HST-2026-010",
      "full_name": "Aditya Kulkarni",
      "email": "aditya.k@college.edu",
      "phone": "9876543219",
      "guardian_name": "Anil Kulkarni",
      "guardian_phone": "9876500010",
      "address": "104 Baner Road, Pune",
      "course": "B.Tech Electrical",
      "year_of_study": "4th Year",
      "admission_date": "2026-10-19",
      "status": "leaved",
      "current_room": null,
      "current_bed": null,
      "current_allocation_id": null,
      "total_fee_due": 0.0
    }
  ],
  "allocations": [
    {
      "id": 1,
      "student": 1,
      "student_name": "Aarav Sharma",
      "student_code": "HST-2026-001",
      "room": 1,
      "room_number": "101",
      "bed": 1,
      "bed_name": "Bed-1",
      "allocated_date": "2026-10-19",
      "checkout_date": null,
      "status": "active",
      "remarks": "Standard academic session allotment for 3rd Year."
    },
    {
      "id": 2,
      "student": 2,
      "student_name": "Priya Patel",
      "student_code": "HST-2026-002",
      "room": 1,
      "room_number": "101",
      "bed": 2,
      "bed_name": "Bed-2",
      "allocated_date": "2026-10-19",
      "checkout_date": null,
      "status": "active",
      "remarks": "Standard academic session allotment for 2nd Year."
    },
    {
      "id": 3,
      "student": 3,
      "student_name": "Rohan Verma",
      "student_code": "HST-2026-003",
      "room": 2,
      "room_number": "102",
      "bed": 3,
      "bed_name": "Bed-1",
      "allocated_date": "2026-10-19",
      "checkout_date": null,
      "status": "active",
      "remarks": "Standard academic session allotment for 3rd Year."
    },
    {
      "id": 4,
      "student": 4,
      "student_name": "Ananya Deshmukh",
      "student_code": "HST-2026-004",
      "room": 2,
      "room_number": "102",
      "bed": 4,
      "bed_name": "Bed-2",
      "allocated_date": "2026-10-19",
      "checkout_date": null,
      "status": "active",
      "remarks": "Standard academic session allotment for 1st Year."
    },
    {
      "id": 5,
      "student": 5,
      "student_name": "Kabir Mehta",
      "student_code": "HST-2026-005",
      "room": 3,
      "room_number": "103",
      "bed": 5,
      "bed_name": "Bed-1",
      "allocated_date": "2026-10-19",
      "checkout_date": null,
      "status": "active",
      "remarks": "Standard academic session allotment for 2nd Year."
    },
    {
      "id": 6,
      "student": 6,
      "student_name": "Sneha Iyer",
      "student_code": "HST-2026-006",
      "room": 3,
      "room_number": "103",
      "bed": 6,
      "bed_name": "Bed-2",
      "allocated_date": "2026-10-19",
      "checkout_date": null,
      "status": "active",
      "remarks": "Standard academic session allotment for 1st Year."
    },
    {
      "id": 7,
      "student": 7,
      "student_name": "Vikram Singh",
      "student_code": "HST-2026-007",
      "room": 3,
      "room_number": "103",
      "bed": 7,
      "bed_name": "Bed-3",
      "allocated_date": "2026-10-19",
      "checkout_date": null,
      "status": "active",
      "remarks": "Standard academic session allotment for 4th Year."
    }
  ],
  "fees": [
    {
      "id": 1,
      "student": 1,
      "student_name": "Aarav Sharma",
      "student_code": "HST-2026-001",
      "title": "Fall Semester 2026 Hostel & Mess Fee",
      "academic_term": "Semester 1 - 2026",
      "total_amount": 48000.0,
      "due_date": "2026-11-03",
      "status": "paid",
      "amount_paid": 48000.0,
      "balance_amount": 0.0,
      "payments": [
        {
          "id": 1,
          "receipt_number": "RCPT-2026-001",
          "fee_record": 1,
          "fee_title": "Fall Semester 2026 Hostel & Mess Fee",
          "student": 1,
          "student_name": "Aarav Sharma",
          "student_code": "HST-2026-001",
          "amount_paid": 48000.0,
          "payment_date": "2026-10-10",
          "payment_method": "bank_transfer",
          "transaction_reference": "TXN-SBI-381455",
          "remarks": "Authorized front-desk verified payment.",
          "recorded_by": "Warden Office Accountant"
        }
      ]
    },
    {
      "id": 2,
      "student": 2,
      "student_name": "Priya Patel",
      "student_code": "HST-2026-002",
      "title": "Fall Semester 2026 Hostel & Mess Fee",
      "academic_term": "Semester 1 - 2026",
      "total_amount": 48000.0,
      "due_date": "2026-11-03",
      "status": "partial",
      "amount_paid": 25000.0,
      "balance_amount": 23000.0,
      "payments": [
        {
          "id": 2,
          "receipt_number": "RCPT-2026-002",
          "fee_record": 2,
          "fee_title": "Fall Semester 2026 Hostel & Mess Fee",
          "student": 2,
          "student_name": "Priya Patel",
          "student_code": "HST-2026-002",
          "amount_paid": 25000.0,
          "payment_date": "2026-10-09",
          "payment_method": "upi_offline",
          "transaction_reference": "TXN-SBI-424383",
          "remarks": "Authorized front-desk verified payment.",
          "recorded_by": "Warden Office Accountant"
        }
      ]
    },
    {
      "id": 3,
      "student": 3,
      "student_name": "Rohan Verma",
      "student_code": "HST-2026-003",
      "title": "Fall Semester 2026 Hostel & Mess Fee",
      "academic_term": "Semester 1 - 2026",
      "total_amount": 48000.0,
      "due_date": "2026-11-03",
      "status": "paid",
      "amount_paid": 48000.0,
      "balance_amount": 0.0,
      "payments": [
        {
          "id": 3,
          "receipt_number": "RCPT-2026-003",
          "fee_record": 3,
          "fee_title": "Fall Semester 2026 Hostel & Mess Fee",
          "student": 3,
          "student_name": "Rohan Verma",
          "student_code": "HST-2026-003",
          "amount_paid": 48000.0,
          "payment_date": "2026-10-16",
          "payment_method": "bank_transfer",
          "transaction_reference": "TXN-SBI-700795",
          "remarks": "Authorized front-desk verified payment.",
          "recorded_by": "Warden Office Accountant"
        }
      ]
    },
    {
      "id": 4,
      "student": 4,
      "student_name": "Ananya Deshmukh",
      "student_code": "HST-2026-004",
      "title": "Fall Semester 2026 Hostel & Mess Fee",
      "academic_term": "Semester 1 - 2026",
      "total_amount": 48000.0,
      "due_date": "2026-11-03",
      "status": "partial",
      "amount_paid": 25000.0,
      "balance_amount": 23000.0,
      "payments": [
        {
          "id": 4,
          "receipt_number": "RCPT-2026-004",
          "fee_record": 4,
          "fee_title": "Fall Semester 2026 Hostel & Mess Fee",
          "student": 4,
          "student_name": "Ananya Deshmukh",
          "student_code": "HST-2026-004",
          "amount_paid": 25000.0,
          "payment_date": "2026-10-16",
          "payment_method": "upi_offline",
          "transaction_reference": "TXN-SBI-829698",
          "remarks": "Authorized front-desk verified payment.",
          "recorded_by": "Warden Office Accountant"
        }
      ]
    },
    {
      "id": 5,
      "student": 5,
      "student_name": "Kabir Mehta",
      "student_code": "HST-2026-005",
      "title": "Fall Semester 2026 Hostel & Mess Fee",
      "academic_term": "Semester 1 - 2026",
      "total_amount": 48000.0,
      "due_date": "2026-11-03",
      "status": "pending",
      "amount_paid": 0.0,
      "balance_amount": 48000.0,
      "payments": []
    },
    {
      "id": 6,
      "student": 6,
      "student_name": "Sneha Iyer",
      "student_code": "HST-2026-006",
      "title": "Fall Semester 2026 Hostel & Mess Fee",
      "academic_term": "Semester 1 - 2026",
      "total_amount": 48000.0,
      "due_date": "2026-11-03",
      "status": "pending",
      "amount_paid": 0.0,
      "balance_amount": 48000.0,
      "payments": []
    },
    {
      "id": 7,
      "student": 7,
      "student_name": "Vikram Singh",
      "student_code": "HST-2026-007",
      "title": "Fall Semester 2026 Hostel & Mess Fee",
      "academic_term": "Semester 1 - 2026",
      "total_amount": 48000.0,
      "due_date": "2026-11-03",
      "status": "pending",
      "amount_paid": 0.0,
      "balance_amount": 48000.0,
      "payments": []
    },
    {
      "id": 8,
      "student": 8,
      "student_name": "Ishaan Malhotra",
      "student_code": "HST-2026-008",
      "title": "Fall Semester 2026 Hostel & Mess Fee",
      "academic_term": "Semester 1 - 2026",
      "total_amount": 48000.0,
      "due_date": "2026-11-03",
      "status": "pending",
      "amount_paid": 0.0,
      "balance_amount": 48000.0,
      "payments": []
    },
    {
      "id": 9,
      "student": 9,
      "student_name": "Meera Nambiar",
      "student_code": "HST-2026-009",
      "title": "Fall Semester 2026 Hostel & Mess Fee",
      "academic_term": "Semester 1 - 2026",
      "total_amount": 48000.0,
      "due_date": "2026-11-03",
      "status": "pending",
      "amount_paid": 0.0,
      "balance_amount": 48000.0,
      "payments": []
    }
  ],
  "payments": [
    {
      "id": 1,
      "receipt_number": "RCPT-2026-001",
      "fee_record": 1,
      "fee_title": "Fall Semester 2026 Hostel & Mess Fee",
      "student": 1,
      "student_name": "Aarav Sharma",
      "student_code": "HST-2026-001",
      "amount_paid": 48000.0,
      "payment_date": "2026-10-10",
      "payment_method": "bank_transfer",
      "transaction_reference": "TXN-SBI-381455",
      "remarks": "Authorized front-desk verified payment.",
      "recorded_by": "Warden Office Accountant"
    },
    {
      "id": 2,
      "receipt_number": "RCPT-2026-002",
      "fee_record": 2,
      "fee_title": "Fall Semester 2026 Hostel & Mess Fee",
      "student": 2,
      "student_name": "Priya Patel",
      "student_code": "HST-2026-002",
      "amount_paid": 25000.0,
      "payment_date": "2026-10-09",
      "payment_method": "upi_offline",
      "transaction_reference": "TXN-SBI-424383",
      "remarks": "Authorized front-desk verified payment.",
      "recorded_by": "Warden Office Accountant"
    },
    {
      "id": 3,
      "receipt_number": "RCPT-2026-003",
      "fee_record": 3,
      "fee_title": "Fall Semester 2026 Hostel & Mess Fee",
      "student": 3,
      "student_name": "Rohan Verma",
      "student_code": "HST-2026-003",
      "amount_paid": 48000.0,
      "payment_date": "2026-10-16",
      "payment_method": "bank_transfer",
      "transaction_reference": "TXN-SBI-700795",
      "remarks": "Authorized front-desk verified payment.",
      "recorded_by": "Warden Office Accountant"
    },
    {
      "id": 4,
      "receipt_number": "RCPT-2026-004",
      "fee_record": 4,
      "fee_title": "Fall Semester 2026 Hostel & Mess Fee",
      "student": 4,
      "student_name": "Ananya Deshmukh",
      "student_code": "HST-2026-004",
      "amount_paid": 25000.0,
      "payment_date": "2026-10-16",
      "payment_method": "upi_offline",
      "transaction_reference": "TXN-SBI-829698",
      "remarks": "Authorized front-desk verified payment.",
      "recorded_by": "Warden Office Accountant"
    }
  ],
  "attendance": [
    {
      "id": 1,
      "student": 1,
      "student_name": "Aarav Sharma",
      "student_code": "HST-2026-001",
      "room_number": "101",
      "date": "2026-10-19",
      "status": "present",
      "remarks": "Regular biometric/warden evening roll call.",
      "marked_by": "Night Warden Supervisor"
    },
    {
      "id": 2,
      "student": 2,
      "student_name": "Priya Patel",
      "student_code": "HST-2026-002",
      "room_number": "101",
      "date": "2026-10-19",
      "status": "present",
      "remarks": "Regular biometric/warden evening roll call.",
      "marked_by": "Night Warden Supervisor"
    },
    {
      "id": 3,
      "student": 3,
      "student_name": "Rohan Verma",
      "student_code": "HST-2026-003",
      "room_number": "102",
      "date": "2026-10-19",
      "status": "absent",
      "remarks": "Regular biometric/warden evening roll call.",
      "marked_by": "Night Warden Supervisor"
    },
    {
      "id": 4,
      "student": 4,
      "student_name": "Ananya Deshmukh",
      "student_code": "HST-2026-004",
      "room_number": "102",
      "date": "2026-10-19",
      "status": "present",
      "remarks": "Regular biometric/warden evening roll call.",
      "marked_by": "Night Warden Supervisor"
    },
    {
      "id": 5,
      "student": 5,
      "student_name": "Kabir Mehta",
      "student_code": "HST-2026-005",
      "room_number": "103",
      "date": "2026-10-19",
      "status": "present",
      "remarks": "Regular biometric/warden evening roll call.",
      "marked_by": "Night Warden Supervisor"
    },
    {
      "id": 6,
      "student": 6,
      "student_name": "Sneha Iyer",
      "student_code": "HST-2026-006",
      "room_number": "103",
      "date": "2026-10-19",
      "status": "on_leave",
      "remarks": "Regular biometric/warden evening roll call.",
      "marked_by": "Night Warden Supervisor"
    },
    {
      "id": 7,
      "student": 7,
      "student_name": "Vikram Singh",
      "student_code": "HST-2026-007",
      "room_number": "103",
      "date": "2026-10-19",
      "status": "present",
      "remarks": "Regular biometric/warden evening roll call.",
      "marked_by": "Night Warden Supervisor"
    },
    {
      "id": 8,
      "student": 8,
      "student_name": "Ishaan Malhotra",
      "student_code": "HST-2026-008",
      "room_number": "N/A",
      "date": "2026-10-19",
      "status": "present",
      "remarks": "Regular biometric/warden evening roll call.",
      "marked_by": "Night Warden Supervisor"
    },
    {
      "id": 9,
      "student": 9,
      "student_name": "Meera Nambiar",
      "student_code": "HST-2026-009",
      "room_number": "N/A",
      "date": "2026-10-19",
      "status": "present",
      "remarks": "Regular biometric/warden evening roll call.",
      "marked_by": "Night Warden Supervisor"
    },
    {
      "id": 10,
      "student": 1,
      "student_name": "Aarav Sharma",
      "student_code": "HST-2026-001",
      "room_number": "101",
      "date": "2026-10-30",
      "status": "present",
      "remarks": "Regular biometric/warden evening roll call.",
      "marked_by": "Night Warden Supervisor"
    },
    {
      "id": 11,
      "student": 2,
      "student_name": "Priya Patel",
      "student_code": "HST-2026-002",
      "room_number": "101",
      "date": "2026-10-30",
      "status": "present",
      "remarks": "Regular biometric/warden evening roll call.",
      "marked_by": "Night Warden Supervisor"
    },
    {
      "id": 12,
      "student": 3,
      "student_name": "Rohan Verma",
      "student_code": "HST-2026-003",
      "room_number": "102",
      "date": "2026-10-30",
      "status": "absent",
      "remarks": "Regular biometric/warden evening roll call.",
      "marked_by": "Night Warden Supervisor"
    },
    {
      "id": 13,
      "student": 4,
      "student_name": "Ananya Deshmukh",
      "student_code": "HST-2026-004",
      "room_number": "102",
      "date": "2026-10-30",
      "status": "present",
      "remarks": "Regular biometric/warden evening roll call.",
      "marked_by": "Night Warden Supervisor"
    },
    {
      "id": 14,
      "student": 5,
      "student_name": "Kabir Mehta",
      "student_code": "HST-2026-005",
      "room_number": "103",
      "date": "2026-10-30",
      "status": "present",
      "remarks": "Regular biometric/warden evening roll call.",
      "marked_by": "Night Warden Supervisor"
    },
    {
      "id": 15,
      "student": 6,
      "student_name": "Sneha Iyer",
      "student_code": "HST-2026-006",
      "room_number": "103",
      "date": "2026-10-30",
      "status": "on_leave",
      "remarks": "Regular biometric/warden evening roll call.",
      "marked_by": "Night Warden Supervisor"
    },
    {
      "id": 16,
      "student": 7,
      "student_name": "Vikram Singh",
      "student_code": "HST-2026-007",
      "room_number": "103",
      "date": "2026-10-30",
      "status": "present",
      "remarks": "Regular biometric/warden evening roll call.",
      "marked_by": "Night Warden Supervisor"
    },
    {
      "id": 17,
      "student": 8,
      "student_name": "Ishaan Malhotra",
      "student_code": "HST-2026-008",
      "room_number": "N/A",
      "date": "2026-10-30",
      "status": "present",
      "remarks": "Regular biometric/warden evening roll call.",
      "marked_by": "Night Warden Supervisor"
    },
    {
      "id": 18,
      "student": 9,
      "student_name": "Meera Nambiar",
      "student_code": "HST-2026-009",
      "room_number": "N/A",
      "date": "2026-10-30",
      "status": "present",
      "remarks": "Regular biometric/warden evening roll call.",
      "marked_by": "Night Warden Supervisor"
    }
  ],
  "complaints": [
    {
      "id": 1,
      "student": 1,
      "student_name": "Aarav Sharma",
      "room_number": "101",
      "category": "electricity",
      "title": "Study table light socket not delivering power",
      "description": "The 3-pin outlet next to Bed-1 sparks occasionally when plugging in laptop charger.",
      "status": "pending",
      "priority": "high",
      "submission_date": "2026-10-17",
      "resolution_notes": "",
      "resolved_at": null
    },
    {
      "id": 2,
      "student": 2,
      "student_name": "Priya Patel",
      "room_number": "102",
      "category": "plumbing",
      "title": "Geyser hot water flow is very slow",
      "description": "Water pressure in bathroom shower is low during morning peak hours.",
      "status": "in_progress",
      "priority": "medium",
      "submission_date": "2026-10-17",
      "resolution_notes": "Electrician scheduled for inspection.",
      "resolved_at": null
    },
    {
      "id": 3,
      "student": 3,
      "student_name": "Rohan Verma",
      "room_number": "103",
      "category": "wifi",
      "title": "5GHz Wi-Fi signal drops in corner of room",
      "description": "Wi-Fi disconnects frequently during online lectures.",
      "status": "resolved",
      "priority": "low",
      "submission_date": "2026-10-18",
      "resolution_notes": "Router rebooted and channel frequency adjusted.",
      "resolved_at": null
    },
    {
      "id": 4,
      "student": 4,
      "student_name": "Ananya Deshmukh",
      "room_number": "B-101",
      "category": "carpentry",
      "title": "Wardrobe hinge is loose",
      "description": "Bottom hinge of clothes cupboard needs tightening.",
      "status": "pending",
      "priority": "low",
      "submission_date": "2026-10-18",
      "resolution_notes": "",
      "resolved_at": null
    },
    {
      "id": 5,
      "student": 5,
      "student_name": "Kabir Mehta",
      "room_number": "PG-101",
      "category": "mess",
      "title": "Request for extra fruit counter in morning mess",
      "description": "Need fresh fruit options in breakfast for athletic diet.",
      "status": "in_progress",
      "priority": "medium",
      "submission_date": "2026-10-17",
      "resolution_notes": "Electrician scheduled for inspection.",
      "resolved_at": null
    }
  ],
  "notices": [
    {
      "id": 1,
      "title": "Hostel Annual Cultural & Sports Meet 2026",
      "description": "Registrations are now open for inter-hostel cricket, football, badminton, and chess tournaments. Submit team rosters to the sports coordinator by Friday.",
      "author": "Chief Warden",
      "publication_date": "2026-10-18",
      "is_published": true,
      "priority": "urgent",
      "audience": "all"
    },
    {
      "id": 2,
      "title": "Revised Dining Hall & Mess Timings",
      "description": "Breakfast: 7:30 AM - 9:30 AM | Lunch: 12:30 PM - 2:30 PM | Dinner: 7:30 PM - 9:45 PM. Students are requested to bring their RFID dining cards.",
      "author": "Mess Committee",
      "publication_date": "2026-10-18",
      "is_published": true,
      "priority": "high",
      "audience": "all"
    },
    {
      "id": 3,
      "title": "Routine Electrical & Wi-Fi Maintenance Schedule",
      "description": "North Wing (Block A) will undergo scheduled Wi-Fi access point firmware upgrades this Saturday between 2:00 PM and 5:00 PM.",
      "author": "Campus IT Infrastructure",
      "publication_date": "2026-10-15",
      "is_published": true,
      "priority": "normal",
      "audience": "block_a"
    },
    {
      "id": 4,
      "title": "Semester Fee Balance Settlement Reminder",
      "description": "Residents with outstanding hostel or mess fee balances are requested to clear all dues before mid-term exams to avoid late fines.",
      "author": "Accounts Office",
      "publication_date": "2026-10-17",
      "is_published": true,
      "priority": "high",
      "audience": "all"
    }
  ],
  "employees": [
    {
      "id": 1,
      "employee_id": "EMP-001",
      "full_name": "Dr. Vikramaditya Rathore",
      "role": "warden",
      "phone": "9811223344",
      "email": "warden@hostel.edu",
      "joining_date": "2026-10-19",
      "monthly_salary": 65000.0,
      "status": "active"
    },
    {
      "id": 2,
      "employee_id": "EMP-002",
      "full_name": "Sunita Nair",
      "role": "assistant_warden",
      "phone": "9811223345",
      "email": "sunita.nair@hostel.edu",
      "joining_date": "2026-10-19",
      "monthly_salary": 45000.0,
      "status": "active"
    },
    {
      "id": 3,
      "employee_id": "EMP-003",
      "full_name": "Harish Chandra",
      "role": "accountant",
      "phone": "9811223346",
      "email": "accounts@hostel.edu",
      "joining_date": "2026-10-19",
      "monthly_salary": 40000.0,
      "status": "active"
    },
    {
      "id": 4,
      "employee_id": "EMP-004",
      "full_name": "Ram Swaroop",
      "role": "caretaker",
      "phone": "9811223347",
      "email": "",
      "joining_date": "2026-10-19",
      "monthly_salary": 28000.0,
      "status": "active"
    },
    {
      "id": 5,
      "employee_id": "EMP-005",
      "full_name": "Dhananjay Yadav",
      "role": "security",
      "phone": "9811223348",
      "email": "",
      "joining_date": "2026-10-19",
      "monthly_salary": 24000.0,
      "status": "active"
    },
    {
      "id": 6,
      "employee_id": "EMP-006",
      "full_name": "Mohan Lal",
      "role": "electrician",
      "phone": "9811223349",
      "email": "",
      "joining_date": "2026-10-19",
      "monthly_salary": 26000.0,
      "status": "active"
    },
    {
      "id": 7,
      "employee_id": "EMP-007",
      "full_name": "Gurmeet Singh",
      "role": "mess_head",
      "phone": "9811223350",
      "email": "mess@hostel.edu",
      "joining_date": "2026-10-19",
      "monthly_salary": 35000.0,
      "status": "active"
    }
  ],
  "employee_payments": [
    {
      "id": 1,
      "voucher_number": "SAL-2026-001",
      "employee": 1,
      "employee_name": "Dr. Vikramaditya Rathore",
      "employee_code": "EMP-001",
      "payment_date": "2026-10-09",
      "amount": 65000.0,
      "salary_month": "October 2026",
      "payment_method": "bank_transfer",
      "remarks": "Monthly salary credited via electronic fund transfer."
    },
    {
      "id": 2,
      "voucher_number": "SAL-2026-002",
      "employee": 2,
      "employee_name": "Sunita Nair",
      "employee_code": "EMP-002",
      "payment_date": "2026-10-09",
      "amount": 45000.0,
      "salary_month": "October 2026",
      "payment_method": "bank_transfer",
      "remarks": "Monthly salary credited via electronic fund transfer."
    },
    {
      "id": 3,
      "voucher_number": "SAL-2026-003",
      "employee": 3,
      "employee_name": "Harish Chandra",
      "employee_code": "EMP-003",
      "payment_date": "2026-10-09",
      "amount": 40000.0,
      "salary_month": "October 2026",
      "payment_method": "bank_transfer",
      "remarks": "Monthly salary credited via electronic fund transfer."
    },
    {
      "id": 4,
      "voucher_number": "SAL-2026-004",
      "employee": 4,
      "employee_name": "Ram Swaroop",
      "employee_code": "EMP-004",
      "payment_date": "2026-10-09",
      "amount": 28000.0,
      "salary_month": "October 2026",
      "payment_method": "bank_transfer",
      "remarks": "Monthly salary credited via electronic fund transfer."
    },
    {
      "id": 5,
      "voucher_number": "SAL-2026-005",
      "employee": 5,
      "employee_name": "Dhananjay Yadav",
      "employee_code": "EMP-005",
      "payment_date": "2026-10-09",
      "amount": 24000.0,
      "salary_month": "October 2026",
      "payment_method": "bank_transfer",
      "remarks": "Monthly salary credited via electronic fund transfer."
    },
    {
      "id": 6,
      "voucher_number": "SAL-2026-006",
      "employee": 6,
      "employee_name": "Mohan Lal",
      "employee_code": "EMP-006",
      "payment_date": "2026-10-09",
      "amount": 26000.0,
      "salary_month": "October 2026",
      "payment_method": "bank_transfer",
      "remarks": "Monthly salary credited via electronic fund transfer."
    },
    {
      "id": 7,
      "voucher_number": "SAL-2026-007",
      "employee": 7,
      "employee_name": "Gurmeet Singh",
      "employee_code": "EMP-007",
      "payment_date": "2026-10-09",
      "amount": 35000.0,
      "salary_month": "October 2026",
      "payment_method": "bank_transfer",
      "remarks": "Monthly salary credited via electronic fund transfer."
    }
  ],
  "attendance_sessions": [
    {
      "id": 1,
      "title": "Night Curfew Verification",
      "session_type": "curfew",
      "session_code": "842915",
      "session_token": "sess_tok_9b7c8d9e2a1f4e3c8b7a6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a",
      "created_by": "Chief Warden",
      "start_time": "2026-10-31T20:00:00.000Z",
      "end_time": "2026-10-31T23:59:59.000Z",
      "is_active": true,
      "attendees": [
        1,
        2,
        3
      ]
    }
  ]
};

function getNextId(list) {
  if (!list || list.length === 0) return 1;
  return Math.max(...list.map(item => Number(item.id) || 0)) + 1;
}

export function loadDB() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      saveDB(INITIAL_SEED_DATA);
      return JSON.parse(JSON.stringify(INITIAL_SEED_DATA));
    }
    const parsed = JSON.parse(raw);
    if (!parsed || !parsed.rooms || !parsed.students) {
      saveDB(INITIAL_SEED_DATA);
      return JSON.parse(JSON.stringify(INITIAL_SEED_DATA));
    }
    return parsed;
  } catch (err) {
    console.error('Error loading local database from localStorage, resetting to seed data:', err);
    saveDB(INITIAL_SEED_DATA);
    return JSON.parse(JSON.stringify(INITIAL_SEED_DATA));
  }
}

export function saveDB(db) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  } catch (err) {
    console.error('Error saving local database to localStorage:', err);
  }
}

export const localDatabase = {
  resetDatabase() {
    saveDB(INITIAL_SEED_DATA);
    return JSON.parse(JSON.stringify(INITIAL_SEED_DATA));
  },

  getRawData() {
    return loadDB();
  },

  // 1. Dashboard Metrics
  getDashboardSummary() {
    const db = loadDB();
    const today = new Date().toISOString().split('T')[0];

    const total_students = db.students.length;
    const active_students = db.students.filter(s => s.status === 'active').length;
    const leaved_students = db.students.filter(s => s.status === 'leaved').length;

    const total_rooms = db.rooms.length;
    let total_beds = 0;
    let occupied_beds = 0;

    db.rooms.forEach(r => {
      const beds = r.beds || [];
      total_beds += beds.length;
      occupied_beds += beds.filter(b => b.is_occupied).length;
    });

    const vacant_beds = Math.max(0, total_beds - occupied_beds);
    const occupancy_rate = total_beds > 0 ? Number(((occupied_beds / total_beds) * 100).toFixed(1)) : 0;

    let total_billed = 0;
    db.fees.forEach(f => {
      total_billed += Number(f.total_amount) || 0;
    });

    let total_collected = 0;
    db.payments.forEach(p => {
      total_collected += Number(p.amount_paid) || 0;
    });

    const total_pending = Math.max(0, total_billed - total_collected);

    // Today attendance
    const todayAtt = db.attendance.filter(a => a.date === today);
    const present_count = todayAtt.filter(a => a.status === 'present').length;
    const absent_count = todayAtt.filter(a => a.status === 'absent').length;
    const leave_count = todayAtt.filter(a => a.status === 'on_leave' || a.status === 'leave').length;
    const att_rate = active_students > 0 ? Number(((present_count / active_students) * 100).toFixed(1)) : 100.0;

    const open_complaints = db.complaints.filter(c => c.status === 'pending' || c.status === 'in_progress').length;

    const recent_students = [...db.students].reverse().slice(0, 5);
    const recent_payments = [...db.payments].reverse().slice(0, 5);
    const pending_complaints = db.complaints.filter(c => c.status === 'pending').slice(0, 5);
    const latest_notices = db.notices.filter(n => n.is_published).slice(0, 4);

    const blocks_occupancy = db.blocks.map(b => {
      const bRooms = db.rooms.filter(r => r.block === b.id);
      let bBeds = 0;
      let bOcc = 0;
      bRooms.forEach(r => {
        const beds = r.beds || [];
        bBeds += beds.length;
        bOcc += beds.filter(bed => bed.is_occupied).length;
      });
      return {
        block: b.name,
        total_beds: bBeds,
        occupied_beds: bOcc,
        vacant_beds: Math.max(0, bBeds - bOcc),
      };
    });

    return {
      metrics: {
        total_students,
        active_students,
        leaved_students,
        total_rooms,
        total_beds,
        occupied_beds,
        vacant_beds,
        occupancy_rate,
        total_billed,
        total_collected,
        total_pending,
        attendance_today: {
          present: present_count,
          absent: absent_count,
          leave: leave_count,
          rate: att_rate,
          date: today,
        },
        open_complaints,
      },
      recent_students,
      recent_payments,
      pending_complaints,
      latest_notices,
      blocks_occupancy,
    };
  },

  // 2. Blocks
  getBlocks() {
    const db = loadDB();
    return db.blocks.map(b => ({
      ...b,
      rooms_count: db.rooms.filter(r => r.block === b.id).length,
    }));
  },

  // 3. Rooms
  getRooms(params = {}) {
    const db = loadDB();
    let result = [...db.rooms];

    if (params.block && params.block !== 'undefined' && params.block !== 'null' && params.block !== '') {
      result = result.filter(r => String(r.block) === String(params.block));
    }
    if (params.room_type && params.room_type !== 'undefined' && params.room_type !== 'null' && params.room_type !== '') {
      result = result.filter(r => r.room_type === params.room_type);
    }
    if (params.status && params.status !== 'undefined' && params.status !== 'null' && params.status !== '') {
      result = result.filter(r => r.status === params.status);
    }
    if (params.floor && params.floor !== 'undefined' && params.floor !== 'null' && params.floor !== '') {
      result = result.filter(r => String(r.floor) === String(params.floor));
    }
    if (params.search && params.search.trim()) {
      const q = params.search.trim().toLowerCase();
      result = result.filter(r =>
        (r.room_number && r.room_number.toLowerCase().includes(q)) ||
        (r.block_name && r.block_name.toLowerCase().includes(q)) ||
        (r.section_name && r.section_name.toLowerCase().includes(q))
      );
    }
    return result;
  },

  createRoom(data) {
    const db = loadDB();
    const newId = getNextId(db.rooms);
    const capacity = Number(data.capacity) || 2;
    const blockId = Number(data.block) || 1;
    const blockObj = db.blocks.find(b => b.id === blockId) || db.blocks[0];

    const beds = [];
    for (let i = 1; i <= capacity; i++) {
      const bedId = getNextId(db.beds) + i - 1;
      const bedObj = {
        id: bedId,
        room: newId,
        room_number: data.room_number,
        bed_number: `Bed-${i}`,
        is_occupied: false,
      };
      beds.push(bedObj);
      db.beds.push(bedObj);
    }

    const sectionMap = { 1: 'Room A', 2: 'Room B', 3: 'Room C', 4: 'Room D' };
    const floorNum = Number(data.floor) || 1;

    const newRoom = {
      id: newId,
      room_number: data.room_number,
      block: blockId,
      block_name: blockObj ? blockObj.name : `Floor ${floorNum}`,
      floor: floorNum,
      section_name: sectionMap[floorNum] || `Room ${floorNum}`,
      room_type: data.room_type || 'double',
      capacity,
      monthly_rent: String(Number(data.monthly_rent || 4500).toFixed(2)),
      status: data.status || 'active',
      amenities: data.amenities || '',
      occupied_beds_count: 0,
      available_beds_count: capacity,
      is_full: false,
      beds,
    };

    db.rooms.push(newRoom);
    saveDB(db);
    return newRoom;
  },

  updateRoom(id, data) {
    const db = loadDB();
    const roomIndex = db.rooms.findIndex(r => r.id === Number(id));
    if (roomIndex === -1) throw new Error('Room not found');

    const existing = db.rooms[roomIndex];
    const newCapacity = data.capacity !== undefined ? Number(data.capacity) : existing.capacity;

    const occupiedCount = (existing.beds || []).filter(b => b.is_occupied).length;
    if (newCapacity < occupiedCount) {
      throw new Error(`Cannot reduce capacity to ${newCapacity}. There are currently ${occupiedCount} active student allocations in this room.`);
    }

    let beds = existing.beds || [];
    if (newCapacity > beds.length) {
      for (let i = beds.length + 1; i <= newCapacity; i++) {
        const bedId = getNextId(db.beds) + i;
        const newBed = {
          id: bedId,
          room: existing.id,
          room_number: data.room_number || existing.room_number,
          bed_number: `Bed-${i}`,
          is_occupied: false,
        };
        beds.push(newBed);
        db.beds.push(newBed);
      }
    } else if (newCapacity < beds.length) {
      const vacantBeds = beds.filter(b => !b.is_occupied);
      const toRemoveCount = beds.length - newCapacity;
      const removedIds = new Set(vacantBeds.slice(-toRemoveCount).map(b => b.id));
      beds = beds.filter(b => !removedIds.has(b.id));
      db.beds = db.beds.filter(b => !removedIds.has(b.id));
    }

    const blockId = data.block !== undefined ? Number(data.block) : existing.block;
    const blockObj = db.blocks.find(b => b.id === blockId) || db.blocks[0];
    const floorNum = data.floor !== undefined ? Number(data.floor) : existing.floor;
    const sectionMap = { 1: 'Room A', 2: 'Room B', 3: 'Room C', 4: 'Room D' };

    const updated = {
      ...existing,
      ...data,
      id: existing.id,
      capacity: newCapacity,
      block: blockId,
      block_name: blockObj ? blockObj.name : `Floor ${floorNum}`,
      floor: floorNum,
      section_name: sectionMap[floorNum] || `Room ${floorNum}`,
      occupied_beds_count: occupiedCount,
      available_beds_count: Math.max(0, newCapacity - occupiedCount),
      is_full: occupiedCount >= newCapacity,
      beds,
    };

    db.rooms[roomIndex] = updated;
    saveDB(db);
    return updated;
  },

  deleteRoom(id) {
    const db = loadDB();
    const room = db.rooms.find(r => r.id === Number(id));
    if (!room) throw new Error('Room not found');

    const activeAlloc = db.allocations.filter(a => a.room === room.id && a.status === 'active');
    if (activeAlloc.length > 0) {
      throw new Error(`Cannot delete Room ${room.room_number}. There are ${activeAlloc.length} active student allocations. Please transfer or checkout students first.`);
    }

    db.rooms = db.rooms.filter(r => r.id !== Number(id));
    db.beds = db.beds.filter(b => b.room !== Number(id));
    saveDB(db);
    return { success: true, message: `Room ${room.room_number} deleted successfully.` };
  },

  // 4. Beds
  getBeds(params = {}) {
    const db = loadDB();
    let result = [...db.beds];
    if (params.room) {
      result = result.filter(b => String(b.room) === String(params.room));
    }
    if (params.available === 'true' || params.is_occupied === 'false') {
      result = result.filter(b => !b.is_occupied);
    } else if (params.is_occupied === 'true') {
      result = result.filter(b => b.is_occupied);
    }
    return result;
  },

  // 5. Students
  getStudents(params = {}) {
    const db = loadDB();
    let result = [...db.students];

    if (params.status && params.status !== 'undefined' && params.status !== 'null' && params.status !== '') {
      result = result.filter(s => s.status === params.status);
    }
    if (params.course && params.course !== 'undefined' && params.course !== 'null' && params.course !== '') {
      result = result.filter(s => s.course === params.course);
    }
    if (params.search && params.search.trim()) {
      const q = params.search.trim().toLowerCase();
      result = result.filter(s =>
        (s.full_name && s.full_name.toLowerCase().includes(q)) ||
        (s.student_id && s.student_id.toLowerCase().includes(q)) ||
        (s.email && s.email.toLowerCase().includes(q)) ||
        (s.phone && s.phone.includes(q))
      );
    }
    return result;
  },

  getStudent(id) {
    const db = loadDB();
    const student = db.students.find(s => s.id === Number(id));
    if (!student) throw new Error('Student not found');
    return student;
  },

  createStudent(data) {
    const db = loadDB();
    const newId = getNextId(db.students);
    const studentCode = data.student_id ? data.student_id.trim() : `HST-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;

    const newStudent = {
      id: newId,
      student_id: studentCode,
      full_name: data.full_name,
      email: data.email,
      phone: data.phone,
      guardian_name: data.guardian_name || '',
      guardian_phone: data.guardian_phone || '',
      address: data.address || '',
      course: data.course || 'B.Tech Computer Science',
      year_of_study: data.year_of_study || '1st Year',
      admission_date: data.admission_date || new Date().toISOString().split('T')[0],
      status: data.status || 'active',
      current_room: null,
      current_bed: null,
      current_allocation_id: null,
      total_fee_due: 0,
    };

    db.students.push(newStudent);
    saveDB(db);
    return newStudent;
  },

  updateStudent(id, data) {
    const db = loadDB();
    const index = db.students.findIndex(s => s.id === Number(id));
    if (index === -1) throw new Error('Student not found');

    const updated = {
      ...db.students[index],
      ...data,
      id: db.students[index].id,
    };

    db.students[index] = updated;
    saveDB(db);
    return updated;
  },

  deleteStudent(id) {
    const db = loadDB();
    const student = db.students.find(s => s.id === Number(id));
    if (!student) throw new Error('Student not found');

    const activeAlloc = db.allocations.find(a => a.student === student.id && a.status === 'active');
    if (activeAlloc) {
      this.checkoutAllocation(activeAlloc.id);
    }

    db.students = db.students.filter(s => s.id !== Number(id));
    saveDB(db);
    return { success: true, message: `Student ${student.full_name} deleted successfully.` };
  },

  // 6. Room Allocation
  getAllocations(params = {}) {
    const db = loadDB();
    let result = [...db.allocations];
    if (params.status && params.status !== 'undefined' && params.status !== 'null' && params.status !== '') {
      result = result.filter(a => a.status === params.status);
    }
    return result;
  },

  createAllocation(data) {
    const db = loadDB();
    const studentId = Number(data.student);
    const roomId = Number(data.room);
    const bedId = Number(data.bed);

    const student = db.students.find(s => s.id === studentId);
    if (!student) throw new Error('Student not found');

    const room = db.rooms.find(r => r.id === roomId);
    if (!room) throw new Error('Room not found');

    const bed = db.beds.find(b => b.id === bedId);
    if (!bed) throw new Error('Bed not found');

    const existingActive = db.allocations.find(a => a.student === studentId && a.status === 'active');
    if (existingActive) {
      throw new Error('Student already has an active room allocation. Please transfer or release their existing bed first.');
    }

    if (bed.is_occupied) {
      throw new Error(`${bed.bed_number} in Room ${room.room_number} is already occupied.`);
    }

    const activeAllocsInRoom = db.allocations.filter(a => a.room === roomId && a.status === 'active').length;
    if (activeAllocsInRoom >= room.capacity) {
      throw new Error(`Room ${room.room_number} has reached maximum capacity (${room.capacity} beds).`);
    }

    bed.is_occupied = true;

    const roomBed = (room.beds || []).find(b => b.id === bedId);
    if (roomBed) roomBed.is_occupied = true;
    const occCount = (room.beds || []).filter(b => b.is_occupied).length;
    room.occupied_beds_count = occCount;
    room.available_beds_count = Math.max(0, room.capacity - occCount);
    room.is_full = occCount >= room.capacity;

    const newId = getNextId(db.allocations);
    const today = new Date().toISOString().split('T')[0];

    const newAlloc = {
      id: newId,
      student: studentId,
      student_name: student.full_name,
      student_code: student.student_id,
      room: roomId,
      room_number: room.room_number,
      bed: bedId,
      bed_name: bed.bed_number,
      allocated_date: data.allocated_date || today,
      checkout_date: null,
      status: 'active',
      remarks: data.remarks || 'Standard academic session bed allotment.',
    };

    db.allocations.push(newAlloc);

    student.current_room = room.room_number;
    student.current_bed = bed.bed_number;
    student.current_allocation_id = newId;

    saveDB(db);
    return newAlloc;
  },

  checkoutAllocation(id) {
    const db = loadDB();
    const alloc = db.allocations.find(a => a.id === Number(id));
    if (!alloc) throw new Error('Allocation record not found');

    const today = new Date().toISOString().split('T')[0];
    alloc.status = 'checked_out';
    alloc.checkout_date = today;

    const bed = db.beds.find(b => b.id === alloc.bed);
    if (bed) bed.is_occupied = false;

    const room = db.rooms.find(r => r.id === alloc.room);
    if (room) {
      const roomBed = (room.beds || []).find(b => b.id === alloc.bed);
      if (roomBed) roomBed.is_occupied = false;
      const occCount = (room.beds || []).filter(b => b.is_occupied).length;
      room.occupied_beds_count = occCount;
      room.available_beds_count = Math.max(0, room.capacity - occCount);
      room.is_full = occCount >= room.capacity;
    }

    const student = db.students.find(s => s.id === alloc.student);
    if (student && student.current_allocation_id === alloc.id) {
      student.current_room = null;
      student.current_bed = null;
      student.current_allocation_id = null;
    }

    saveDB(db);
    return alloc;
  },

  // 7. Fees & Payments
  getFees(params = {}) {
    const db = loadDB();
    let result = [...db.fees];
    if (params.status && params.status !== 'undefined' && params.status !== 'null' && params.status !== '') {
      result = result.filter(f => f.status === params.status);
    }
    if (params.search && params.search.trim()) {
      const q = params.search.trim().toLowerCase();
      result = result.filter(f =>
        (f.student_name && f.student_name.toLowerCase().includes(q)) ||
        (f.student_code && f.student_code.toLowerCase().includes(q)) ||
        (f.title && f.title.toLowerCase().includes(q))
      );
    }
    return result;
  },

  createFee(data) {
    const db = loadDB();
    const student = db.students.find(s => s.id === Number(data.student));
    if (!student) throw new Error('Student not found');

    const totalAmount = Number(data.total_amount) || 0;
    const newId = getNextId(db.fees);

    const newFee = {
      id: newId,
      student: student.id,
      student_name: student.full_name,
      student_code: student.student_id,
      title: data.title || 'Semester Hostel Fee',
      academic_term: data.academic_term || 'Fall Term 2026',
      total_amount: totalAmount,
      due_date: data.due_date || new Date().toISOString().split('T')[0],
      status: 'pending',
      amount_paid: 0,
      balance_amount: totalAmount,
      payments: [],
    };

    db.fees.push(newFee);
    student.total_fee_due = (student.total_fee_due || 0) + totalAmount;

    saveDB(db);
    return newFee;
  },

  getPayments(params = {}) {
    const db = loadDB();
    let result = [...db.payments];
    if (params.search && params.search.trim()) {
      const q = params.search.trim().toLowerCase();
      result = result.filter(p =>
        (p.receipt_number && p.receipt_number.toLowerCase().includes(q)) ||
        (p.student_name && p.student_name.toLowerCase().includes(q)) ||
        (p.student_code && p.student_code.toLowerCase().includes(q)) ||
        (p.fee_title && p.fee_title.toLowerCase().includes(q))
      );
    }
    return result;
  },

  recordPayment(data) {
    const db = loadDB();
    const fee = db.fees.find(f => f.id === Number(data.fee_record));
    if (!fee) throw new Error('Fee record not found');

    const student = db.students.find(s => s.id === (data.student ? Number(data.student) : fee.student));
    const amount = Number(data.amount_paid) || 0;

    if (amount <= 0) throw new Error('Payment amount must be greater than zero.');
    if (amount > fee.balance_amount) {
      throw new Error(`Payment amount (₹${amount}) cannot exceed outstanding balance (₹${fee.balance_amount}).`);
    }

    const today = new Date().toISOString().split('T')[0];
    const receiptNo = data.receipt_number || `RCPT-${today.replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`;
    const newId = getNextId(db.payments);

    const newPayment = {
      id: newId,
      receipt_number: receiptNo,
      fee_record: fee.id,
      fee_title: fee.title,
      student: student ? student.id : fee.student,
      student_name: student ? student.full_name : fee.student_name,
      student_code: student ? student.student_id : fee.student_code,
      amount_paid: amount,
      payment_date: data.payment_date || today,
      payment_method: data.payment_method || 'bank_transfer',
      transaction_reference: data.transaction_reference || `TXN-OFFLINE-${Math.floor(100000 + Math.random() * 900000)}`,
      remarks: data.remarks || 'Authorized front-desk verified payment.',
      recorded_by: data.recorded_by || 'Hostel Accounts Desk',
    };

    db.payments.push(newPayment);

    fee.amount_paid = (Number(fee.amount_paid) || 0) + amount;
    fee.balance_amount = Math.max(0, (Number(fee.total_amount) || 0) - fee.amount_paid);
    fee.status = fee.balance_amount <= 0 ? 'paid' : 'partial';
    if (!fee.payments) fee.payments = [];
    fee.payments.push(newPayment);

    if (student) {
      student.total_fee_due = Math.max(0, (student.total_fee_due || 0) - amount);
    }

    saveDB(db);
    return newPayment;
  },

  // 8. Attendance
  getAttendance(params = {}) {
    const db = loadDB();
    let result = [...db.attendance];
    if (params.date) {
      result = result.filter(a => a.date === params.date);
    }
    if (params.student) {
      result = result.filter(a => String(a.student) === String(params.student));
    }
    return result;
  },

  markAttendanceBulk(records = [], date, marked_by = 'Hostel Warden') {
    const db = loadDB();
    const targetDate = date || new Date().toISOString().split('T')[0];

    records.forEach(rec => {
      const studentId = Number(rec.student_id);
      const student = db.students.find(s => s.id === studentId);
      const existingIndex = db.attendance.findIndex(a => a.student === studentId && a.date === targetDate);

      if (existingIndex !== -1) {
        db.attendance[existingIndex].status = rec.status;
        db.attendance[existingIndex].remarks = rec.remarks || '';
        db.attendance[existingIndex].marked_by = marked_by;
      } else {
        const newId = getNextId(db.attendance);
        db.attendance.push({
          id: newId,
          student: studentId,
          student_name: student ? student.full_name : '',
          student_code: student ? student.student_id : '',
          room_number: student ? (student.current_room || 'N/A') : 'N/A',
          date: targetDate,
          status: rec.status,
          remarks: rec.remarks || '',
          marked_by,
        });
      }
    });

    saveDB(db);
    return { success: true, count: records.length, date: targetDate };
  },

  // 9. Complaints
  getComplaints(params = {}) {
    const db = loadDB();
    let result = [...db.complaints];
    if (params.status && params.status !== 'undefined' && params.status !== 'null' && params.status !== '') {
      result = result.filter(c => c.status === params.status);
    }
    if (params.category && params.category !== 'undefined' && params.category !== 'null' && params.category !== '') {
      result = result.filter(c => c.category === params.category);
    }
    if (params.search && params.search.trim()) {
      const q = params.search.trim().toLowerCase();
      result = result.filter(c =>
        (c.title && c.title.toLowerCase().includes(q)) ||
        (c.student_name && c.student_name.toLowerCase().includes(q)) ||
        (c.room_number && c.room_number.includes(q))
      );
    }
    return result;
  },

  createComplaint(data) {
    const db = loadDB();
    const newId = getNextId(db.complaints);
    const today = new Date().toISOString().split('T')[0];

    const newComplaint = {
      id: newId,
      student: data.student ? Number(data.student) : 1,
      student_name: data.student_name || 'Hostel Resident',
      room_number: data.room_number || '101',
      category: data.category || 'electricity',
      title: data.title,
      description: data.description || '',
      status: 'pending',
      priority: data.priority || 'medium',
      submission_date: today,
      resolution_notes: '',
      resolved_at: null,
    };

    db.complaints.push(newComplaint);
    saveDB(db);
    return newComplaint;
  },

  updateComplaint(id, data) {
    const db = loadDB();
    const index = db.complaints.findIndex(c => c.id === Number(id));
    if (index === -1) throw new Error('Complaint not found');

    const today = new Date().toISOString().split('T')[0];
    const isNowResolved = data.status === 'resolved';

    const updated = {
      ...db.complaints[index],
      ...data,
      id: db.complaints[index].id,
      resolved_at: isNowResolved ? (data.resolved_at || today) : null,
    };

    db.complaints[index] = updated;
    saveDB(db);
    return updated;
  },

  // 10. Notices
  getNotices() {
    const db = loadDB();
    return db.notices;
  },

  createNotice(data) {
    const db = loadDB();
    const newId = getNextId(db.notices);
    const today = new Date().toISOString().split('T')[0];

    const newNotice = {
      id: newId,
      title: data.title,
      description: data.description || '',
      author: data.author || 'Office of Chief Warden',
      publication_date: today,
      is_published: data.is_published !== undefined ? Boolean(data.is_published) : true,
      priority: data.priority || 'normal',
      audience: data.audience || 'all',
    };

    db.notices.push(newNotice);
    saveDB(db);
    return newNotice;
  },

  updateNotice(id, data) {
    const db = loadDB();
    const index = db.notices.findIndex(n => n.id === Number(id));
    if (index === -1) throw new Error('Notice not found');

    const updated = {
      ...db.notices[index],
      ...data,
      id: db.notices[index].id,
    };

    db.notices[index] = updated;
    saveDB(db);
    return updated;
  },

  deleteNotice(id) {
    const db = loadDB();
    db.notices = db.notices.filter(n => n.id !== Number(id));
    saveDB(db);
    return { success: true };
  },

  // 11. Employees & Payroll
  getEmployees(params = {}) {
    const db = loadDB();
    let result = [...db.employees];
    if (params.role && params.role !== 'undefined' && params.role !== 'null' && params.role !== '') {
      result = result.filter(e => e.role === params.role);
    }
    if (params.status && params.status !== 'undefined' && params.status !== 'null' && params.status !== '') {
      result = result.filter(e => e.status === params.status);
    }
    if (params.search && params.search.trim()) {
      const q = params.search.trim().toLowerCase();
      result = result.filter(e =>
        (e.full_name && e.full_name.toLowerCase().includes(q)) ||
        (e.employee_id && e.employee_id.toLowerCase().includes(q)) ||
        (e.email && e.email.toLowerCase().includes(q))
      );
    }
    return result;
  },

  createEmployee(data) {
    const db = loadDB();
    const newId = getNextId(db.employees);
    const code = data.employee_id || `EMP-${Math.floor(100 + Math.random() * 900)}`;

    const newEmp = {
      id: newId,
      employee_id: code,
      full_name: data.full_name,
      role: data.role || 'caretaker',
      phone: data.phone || '',
      email: data.email || '',
      joining_date: data.joining_date || new Date().toISOString().split('T')[0],
      monthly_salary: Number(data.monthly_salary) || 25000,
      status: data.status || 'active',
    };

    db.employees.push(newEmp);
    saveDB(db);
    return newEmp;
  },

  updateEmployee(id, data) {
    const db = loadDB();
    const index = db.employees.findIndex(e => e.id === Number(id));
    if (index === -1) throw new Error('Employee not found');

    const updated = {
      ...db.employees[index],
      ...data,
      id: db.employees[index].id,
    };

    db.employees[index] = updated;
    saveDB(db);
    return updated;
  },

  deleteEmployee(id) {
    const db = loadDB();
    db.employees = db.employees.filter(e => e.id !== Number(id));
    saveDB(db);
    return { success: true };
  },

  getEmployeePayments() {
    const db = loadDB();
    return db.employee_payments;
  },

  recordEmployeePayment(data) {
    const db = loadDB();
    const emp = db.employees.find(e => e.id === Number(data.employee));
    const today = new Date().toISOString().split('T')[0];
    const newId = getNextId(db.employee_payments);

    const newPayment = {
      id: newId,
      voucher_number: data.voucher_number || `SAL-${today.substring(0, 4)}-${Math.floor(100 + Math.random() * 900)}`,
      employee: emp ? emp.id : Number(data.employee),
      employee_name: emp ? emp.full_name : '',
      employee_code: emp ? emp.employee_id : '',
      payment_date: data.payment_date || today,
      amount: Number(data.amount) || (emp ? emp.monthly_salary : 25000),
      salary_month: data.salary_month || 'October 2026',
      payment_method: data.payment_method || 'bank_transfer',
      remarks: data.remarks || 'Monthly salary credited via electronic fund transfer.',
    };

    db.employee_payments.push(newPayment);
    saveDB(db);
    return newPayment;
  },

  // 12. Attendance Sessions (Warden QR Curfew System)
  getAttendanceSessions() {
    const db = loadDB();
    return db.attendance_sessions || [];
  },

  createAttendanceSession(data = {}) {
    const db = loadDB();
    if (!db.attendance_sessions) db.attendance_sessions = [];

    // Close any previous active session
    db.attendance_sessions.forEach(s => { s.is_active = false; });

    const newId = getNextId(db.attendance_sessions);
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const token = 'sess_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const now = new Date();
    const durationMin = Number(data.duration_minutes) || 15;
    const endTime = new Date(now.getTime() + durationMin * 60000);

    const newSession = {
      id: newId,
      title: data.title || 'Night Curfew Verification',
      session_type: data.session_type || 'curfew',
      session_code: code,
      session_token: token,
      code,
      token,
      created_by: data.created_by || 'Chief Warden',
      start_time: now.toISOString(),
      end_time: endTime.toISOString(),
      duration_minutes: durationMin,
      is_active: true,
      attendees: [],
    };

    db.attendance_sessions.push(newSession);
    saveDB(db);

    return {
      session: {
        ...newSession,
        remaining_seconds: durationMin * 60,
      },
      message: 'Live roll call session created successfully.',
    };
  },

  getActiveAttendanceSession() {
    const db = loadDB();
    const active = (db.attendance_sessions || []).find(s => s.is_active);
    if (!active) {
      return { active: false, session: null };
    }

    const now = new Date();
    const end = new Date(active.end_time);
    const remaining_seconds = Math.max(0, Math.floor((end - now) / 1000));

    if (remaining_seconds <= 0) {
      active.is_active = false;
      saveDB(db);
      return { active: false, session: null };
    }

    const attendeesList = (active.attendees || []).map(attId => {
      const s = db.students.find(st => st.id === attId);
      return {
        id: attId,
        student_id: s ? s.student_id : `HST-${attId}`,
        full_name: s ? s.full_name : 'Student',
        room_number: s ? s.current_room || '101' : '101',
        time: new Date().toLocaleTimeString(),
        method: 'QR Code',
      };
    });

    return {
      active: true,
      session: {
        ...active,
        code: active.session_code,
        token: active.session_token,
        remaining_seconds,
      },
      total_students: db.students.length,
      checked_in_count: (active.attendees || []).length,
      recent_attendees: attendeesList,
    };
  },

  closeAttendanceSession(sessionId) {
    const db = loadDB();
    const session = (db.attendance_sessions || []).find(s => s.id === Number(sessionId));
    if (session) {
      session.is_active = false;
      saveDB(db);
    }
    return { success: true, message: 'Session closed.' };
  },

  getAttendanceAuditLog(date) {
    const db = loadDB();
    const targetDate = date || new Date().toISOString().split('T')[0];
    const records = db.attendance.filter(a => a.date === targetDate).map(a => ({
      ...a,
      verification_method: a.remarks && a.remarks.includes('PIN') ? '6-Digit PIN' : 'QR Code Scan',
      timestamp: a.date + 'T21:30:00Z',
    }));
    return {
      date: targetDate,
      total_records: records.length,
      records,
    };
  },

  // 13. Student Self-Service Attendance Portal
  getStudentProfile(studentId) {
    const db = loadDB();
    let student = null;
    if (studentId) {
      student = db.students.find(s => s.student_id === studentId || String(s.id) === String(studentId));
    }
    if (!student) {
      student = db.students[0] || {
        id: 1,
        student_id: 'HST-2026-001',
        full_name: 'Aarav Sharma',
        course: 'B.Tech Computer Science',
        year_of_study: '3rd Year',
        current_room: '101',
        current_bed: 'Bed-1',
      };
    }

    const alloc = db.allocations.find(a => a.student === student.id && a.status === 'active');
    const room = alloc ? db.rooms.find(r => r.id === alloc.room) : null;
    const block = room ? db.blocks.find(b => b.id === room.block) : null;

    return {
      ...student,
      assigned_room: student.current_room || (room ? room.room_number : '101'),
      assigned_bed: student.current_bed || (alloc ? alloc.bed_name : 'Bed-1'),
      block_name: block ? block.name : 'Floor 1 (Main Block)',
    };
  },

  getStudentAttendanceHistory(studentId) {
    const db = loadDB();
    let student = null;
    if (studentId) {
      student = db.students.find(s => s.student_id === studentId || String(s.id) === String(studentId));
    }
    if (!student) student = db.students[0];

    const studentAtt = db.attendance.filter(a => a.student === (student ? student.id : 1));
    const today = new Date().toISOString().split('T')[0];
    const todayRec = studentAtt.find(a => a.date === today) || null;

    const presentCount = studentAtt.filter(a => a.status === 'present').length;
    const totalRecords = Math.max(1, studentAtt.length);
    const percentage = Number(((presentCount / totalRecords) * 100).toFixed(1));

    return {
      stats: {
        total_sessions: totalRecords,
        present_count: presentCount,
        absent_count: studentAtt.filter(a => a.status === 'absent').length,
        leave_count: studentAtt.filter(a => a.status === 'on_leave' || a.status === 'leave').length,
        attendance_percentage: percentage,
      },
      history: studentAtt.slice(-15).reverse(),
      today_record: todayRec,
    };
  },

  studentCheckIn(payload = {}) {
    const db = loadDB();
    const today = new Date().toISOString().split('T')[0];

    let student = null;
    if (payload.student_id) {
      student = db.students.find(s => s.student_id === payload.student_id || String(s.id) === String(payload.student_id));
    }
    if (!student) student = db.students[0];

    const activeSession = (db.attendance_sessions || []).find(s => s.is_active);
    if (!activeSession) {
      throw new Error('No active attendance session is running. Please wait for the Warden to start roll call.');
    }

    // Verify session code or token if provided
    if (payload.session_code && payload.session_code !== activeSession.session_code) {
      throw new Error(`Invalid 6-digit session PIN. Active PIN is ${activeSession.session_code}.`);
    }

    // Record check-in in active session
    if (!activeSession.attendees) activeSession.attendees = [];
    if (!activeSession.attendees.includes(student.id)) {
      activeSession.attendees.push(student.id);
    }

    // Upsert into main attendance table
    const existingIndex = db.attendance.findIndex(a => a.student === student.id && a.date === today);
    const checkinTime = new Date().toLocaleTimeString();
    const methodStr = payload.method === 'session_code' ? '6-Digit PIN Verification' : 'Dynamic QR Scan';

    if (existingIndex !== -1) {
      db.attendance[existingIndex].status = 'present';
      db.attendance[existingIndex].remarks = `Self check-in via ${methodStr} at ${checkinTime}.`;
    } else {
      const newId = getNextId(db.attendance);
      db.attendance.push({
        id: newId,
        student: student.id,
        student_name: student.full_name,
        student_code: student.student_id,
        room_number: student.current_room || '101',
        date: today,
        status: 'present',
        remarks: `Self check-in via ${methodStr} at ${checkinTime}.`,
        marked_by: 'Student Self-Service Portal',
      });
    }

    saveDB(db);

    return {
      success: true,
      message: `Attendance marked Present for ${student.full_name} (${student.student_id}) via ${methodStr}!`,
      checkin_time: checkinTime,
      student_id: student.student_id,
      room_number: student.current_room || '101',
    };
  },

  // 14. Direct Browser CSV Export
  exportCSV(reportType) {
    const db = loadDB();
    let csvRows = [];
    let filename = `hostel_${reportType}_report_${new Date().toISOString().split('T')[0]}.csv`;

    if (reportType === 'students') {
      csvRows.push(['Student ID', 'Full Name', 'Email', 'Phone', 'Course', 'Year', 'Status', 'Room', 'Bed', 'Admission Date']);
      db.students.forEach(s => {
        csvRows.push([
          s.student_id,
          s.full_name,
          s.email,
          s.phone,
          s.course,
          s.year_of_study,
          s.status,
          s.current_room || 'Unassigned',
          s.current_bed || 'N/A',
          s.admission_date,
        ]);
      });
    } else if (reportType === 'rooms') {
      csvRows.push(['Room Number', 'Block', 'Floor', 'Type', 'Capacity', 'Occupied Beds', 'Available Beds', 'Status', 'Monthly Rent']);
      db.rooms.forEach(r => {
        csvRows.push([
          r.room_number,
          r.block_name,
          r.floor,
          r.room_type,
          r.capacity,
          r.occupied_beds_count,
          r.available_beds_count,
          r.status,
          r.monthly_rent,
        ]);
      });
    } else if (reportType === 'fees') {
      csvRows.push(['Fee Title', 'Student ID', 'Student Name', 'Total Amount', 'Due Date', 'Status', 'Amount Paid', 'Balance']);
      db.fees.forEach(f => {
        csvRows.push([
          f.title,
          f.student_code,
          f.student_name,
          f.total_amount,
          f.due_date,
          f.status,
          f.amount_paid,
          f.balance_amount,
        ]);
      });
    } else if (reportType === 'complaints') {
      csvRows.push(['Title', 'Category', 'Student', 'Room', 'Priority', 'Status', 'Submission Date', 'Resolution Notes']);
      db.complaints.forEach(c => {
        csvRows.push([
          c.title,
          c.category,
          c.student_name,
          c.room_number,
          c.priority,
          c.status,
          c.submission_date,
          c.resolution_notes || '',
        ]);
      });
    } else if (reportType === 'employees') {
      csvRows.push(['Employee ID', 'Full Name', 'Role', 'Phone', 'Email', 'Joining Date', 'Monthly Salary', 'Status']);
      db.employees.forEach(e => {
        csvRows.push([
          e.employee_id,
          e.full_name,
          e.role,
          e.phone,
          e.email,
          e.joining_date,
          e.monthly_salary,
          e.status,
        ]);
      });
    } else {
      csvRows.push(['Error', 'Invalid report type requested']);
    }

    const csvContent = csvRows
      .map(row => row.map(val => `"${String(val || '').replace(/"/g, '""')}"`).join(','))
      .join('\n');

    let blobUrl = '';
    if (typeof Blob !== 'undefined') {
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      blobUrl = URL.createObjectURL(blob);
    } else {
      blobUrl = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvContent);
    }

    if (typeof document !== 'undefined') {
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }

    return blobUrl;
  },
};
