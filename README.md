# 🏨 G H Raisoni 3D Hostel Management System

A full-stack, production-hardened residential hostel management application built for **G H Raisoni Institute of Engineering & Business Management, Jalgaon**. Features a high-performance **React 19 + Vite** frontend, a scalable **Django REST Framework** backend, interactive 3D aesthetics, role-based access control, rate limiting, and an automated **Student Attendance & QR Roll Call Portal**.

---

## 🏗️ System Architecture & Folder Structure

```
beautiful-nobel/
├── backend/
│   ├── hostel_app/                 # Core Hostel Management Domain App
│   │   ├── migrations/             # Schema migrations
│   │   ├── management/commands/    # Seed data & administrative utilities
│   │   ├── models.py               # Normalized DB schema (Students, Rooms, Fees, Attendance, etc.)
│   │   ├── serializers.py          # DRF Serializers with friendly display ID mapping
│   │   ├── permissions.py          # Custom RBAC permissions (IsStaffOrReadOnly, IsAdminOrWarden)
│   │   ├── views.py                # ViewSets for CRUD, analytics, and CSV exports
│   │   ├── urls.py                 # API router endpoints
│   │   └── tests.py                # Automated Django test suite (12 unit tests)
│   ├── hostel_backend/             # Django Project Configuration
│   │   ├── settings.py             # Security headers, CORS whitelist, throttling, DB configs
│   │   ├── urls.py                 # Root URL router & auth endpoints
│   │   └── views.py                # Throttled login & student authentication endpoints
│   ├── backups/                    # Automated local database snapshots (.gitignored)
│   ├── .env.example                # Template for environment configuration
│   ├── manage.py                   # Django CLI management utility
│   └── requirements.txt            # Python dependencies
│
├── frontend/
│   ├── src/
│   │   ├── assets/                 # Campus images, official logos, icons
│   │   ├── components/             # Reusable UI components
│   │   │   ├── common/             # ProtectedRoute, MetricCard, StatusBadge, FeedbackBanner
│   │   │   ├── DashboardLayout.jsx # Role-aware navigation drawer & sidebar
│   │   │   └── LoginForm.jsx       # 3D interactive login card
│   │   ├── config/
│   │   │   └── env.js              # Centralized environment configuration
│   │   ├── context/
│   │   │   ├── AuthContext.jsx     # Authentication state & session provider
│   │   │   ├── ThemeContext.jsx    # Light / Dark mode state provider
│   │   │   └── NotificationContext.jsx # Real-time alerts & notice count
│   │   ├── hooks/                  # useAuth, useTheme, useNotifications
│   │   ├── pages/                  # Route views (Dashboard, Attendance, Rooms, Fees, etc.)
│   │   │   ├── StudentAttendancePortal.jsx # Simplified roll call portal (PIN & QR)
│   │   │   └── StudentAttendancePortal.css # Scoped high-contrast stylesheet
│   │   ├── services/               # Scalable API layer
│   │   │   ├── api/                # Modular domain clients (auth, rooms, fees, etc.)
│   │   │   ├── hostelService.js    # Aggregated facade service
│   │   │   └── authService.js      # Auth facade service
│   │   ├── utils/                  # formatters.js, security.js (XSS sanitization)
│   │   ├── App.jsx                 # Routes with ProtectedRoute & RBAC guards
│   │   └── main.jsx                # App entrypoint
│   ├── package.json                # Lean dependencies (React 19, Lucide, QRCode)
│   └── vite.config.js              # Vite bundler configuration
│
├── SECURITY.md                     # Comprehensive security policy & audit checklist
├── README.md                       # Project documentation & deployment manual
└── .gitignore                      # Strict isolation of .env, SQLite, and secrets
```

---

## 🛡️ Security Hardening Highlights

1. **Role-Based Access Control (RBAC)**:
   - Route guards (`ProtectedRoute.jsx`) protect `/dashboard` from unauthenticated direct URL access.
   - Administrative sections (Staff Directory, Payroll, Manage Rooms, Student Registration) are accessible strictly to staff/warden accounts.
   - Resident students have a focused view containing their attendance check-in, fees ledger, complaint tracker, and notices.
2. **Brute-Force Protection & Rate Limiting**:
   - `ScopedRateThrottle` restricts login attempts to **15 requests/minute** per IP.
   - Global rate limiter caps anonymous requests at **120 requests/minute** and user requests at **1200 requests/minute**.
3. **Database Security**:
   - Local SQLite files (`backend/db.sqlite3`) and backups are untracked from Git to prevent repository data leaks.
4. **Input Sanitization & XSS Prevention**:
   - React JSX automatic encoding.
   - Automatic client-side sanitization on outgoing JSON bodies (`client.js` via `security.js`).
   - Zero usage of `dangerouslySetInnerHTML` or `eval()`.
5. **CORS & HTTP Security Headers**:
   - Strict CORS origin whitelist (`CORS_ALLOWED_ORIGINS`).
   - `X-Frame-Options: DENY` (prevents clickjacking).
   - `X-Content-Type-Options: nosniff` (prevents MIME-sniffing).
   - `SESSION_COOKIE_HTTPONLY = True` & `SameSite: Lax`.

---

## 📱 Student Attendance Portal (Roll Call & QR)

The Student Attendance Portal simplifies curfew and assembly check-ins:

### How It Works:
1. **Warden Starts Roll Call**:
   - Warden opens the **Warden Roll Call QR** tab and clicks **"Generate Live QR & PIN Session"**.
   - A time-limited **6-digit PIN** (e.g., `482195`) and a large **QR Code** display on the screen.
2. **Student Self Check-In**:
   - Resident student opens the portal on their device.
   - Student enters the 6-digit PIN displayed on the warden's screen (or clicks **`⚡ Autofill [482195]`** if in the same room).
   - Student clicks **"Mark Present Now"** $\rightarrow$ verified in 1 second!
   - Alternatively, students can tap **"Prefer camera? Click here to scan QR code"** to scan the warden's QR code.
3. **Friendly Student IDs**:
   - Displays clean, friendly identifiers like **`ID-101`**, **`ID-102`**, **`ID-103`** across badges, dropdowns, and tables.
   - Transparently maps to canonical database identifiers (`HST-2026-001`).

---

## 🧭 Navigation & Core Modules

| # | Sidebar Module | Route | Access Level | Description |
|---|---|---|---|---|
| 1 | **Dashboard** | `/dashboard` | All Users | Live KPI cards, occupancy rates, fee summaries, recent activities |
| 2 | **Manage Rooms** | `/dashboard/rooms` | Staff Only | Room capacities, floor/section filtering, bed occupancies, safe deletion |
| 3 | **Student Registration** | `/dashboard/new-student` | Staff Only | Onboarding wizard with guardian details and instant bed allocation |
| 4 | **Student Directory** | `/dashboard/students` | Staff Only | Search, edit student profile, transfer allocations, safe checkout |
| 5 | **Room Allocation** | `/dashboard/allocation` | Staff Only | Double-booking prevention, bed assignment, and checkout records |
| 6 | **Student Attendance Portal** | `/dashboard/student-attendance-portal` | All Users | 6-digit PIN roll call, 1-click autofill, QR scanner, monthly % analytics |
| 7 | **Student Fees** | `/dashboard/fees` | All Users | Fee invoices, balance calculation, offline payment records |
| 8 | **Payment History** | `/dashboard/payments` | All Users | Complete audit trail of fee transactions and printable vouchers |
| 9 | **Complaints & Maintenance**| `/dashboard/complaints` | All Users | Ticket submission for electrical, plumbing, mess, and wifi issues |
| 10 | **Notices & Circulars** | `/dashboard/notices` | All Users | Campus circulars and urgent curfew notifications |
| 11 | **Staff Directory** | `/dashboard/employees` | Staff Only | Warden, security, technician, and housekeeping employee records |
| 12 | **Employee Payroll** | `/dashboard/employee-payments` | Admin Only | Monthly salary disbursements and compensation history |
| 13 | **Reports & Analytics** | `/dashboard/reports` | Staff Only | Live data summaries and **1-click CSV report export** |
| 14 | **Settings** | `/dashboard/settings` | All Users | Profile configuration, password updates, theme preference |

---

## ⚡ Quick Start & Installation

### 1. Backend Setup (Django REST Framework)

```powershell
cd backend

# 1. Install dependencies
pip install -r requirements.txt

# 2. Run database migrations
python manage.py migrate

# 3. (Optional) Populate seed data
python manage.py seed_data

# 4. Start development server
python manage.py runserver 127.0.0.1:8000
```
- API Base URL: `http://127.0.0.1:8000/api/`
- Health check: `http://127.0.0.1:8000/api/health/`

### 2. Frontend Setup (React + Vite)

```powershell
cd frontend

# 1. Install dependencies
npm install

# 2. Start Vite dev server
npm run dev
```
- Application URL: `http://localhost:5173`

---

## 🔑 Demo Credentials

| Role | Username / ID | Password | Landing Page |
|---|---|---|---|
| **Chief Warden / Staff** | `hostel` or `admin` | `admin1` | `/dashboard/rooms` |
| **Resident Student** | `ID-101` (or `HST-2026-001`) | `demo` | `/dashboard/student-attendance-portal` |

---

## 🧪 Testing & Verification

Run backend automated tests:
```powershell
cd backend
python manage.py test
```
*(All 12 unit tests pass: authentication, room allocations, checkouts, and safe deletions)*

Compile frontend production build:
```powershell
cd frontend
npm run build
```
*(Transformed 2,024 modules, 0 compile errors)*

---

## 📄 License & Attribution

Designed and maintained for **G H Raisoni Institute of Engineering & Business Management, Jalgaon**. All rights reserved.
