# 🏨 G H Raisoni 3D Hostel Management System (College Minor Project)

A complete, production-ready college minor project built with **React 18 + Vite** for the frontend and **Python Django REST Framework** for the backend, styled with an interactive modern 3D aesthetic, glassmorphism, and personalized with the actual **G H Raisoni Hostel Building** photograph.

---

## 🎨 Visual Identity & Architecture

- **Login Page (`/`)**:
  - Full-screen architectural background using the actual **G H Raisoni Hostel photograph** (crisp HD resolution, zero over-zoom, full building view).
  - Centered pastel-pink glassmorphic card with smooth cursor-tracking **3D tilt effect** (`perspective(1200px)`).
  - Floating 3D hostel house illustration with ground drop-shadow.
  - One-click demo login redirecting directly to the **Manage Rooms** module.
- **Top Header**:
  - Prominently displays **`G H RAISONI HOSTEL`** with 3D text shadow and responsive scaling.
  - User avatar pill, interactive **Logout**, and red 3D **Exit** controls.
- **Persistent Pastel-Pink Sidebar**:
  - Houses persistent navigation for all 14 hostel management modules with active route indicators and mobile drawer.

---

## 🧭 Navigation & Modules

| # | Sidebar Item | Route | Key Features & Actions |
|---|---|---|---|
| 1 | **Dashboard** | `/dashboard` | Live metrics, occupancy progress, fee collection, attendance %, recent activities & quick actions |
| 2 | **Manage Room** | `/dashboard/rooms` | Search & filter by floor/section/type, add room, edit room, view bed status, delete room (with safety locks) |
| 3 | **New Student** | `/dashboard/new-student` | Register student with ID, guardian details, address, course, and instant bed allocation prompt |
| 4 | **Update & Delete Students** | `/dashboard/students` | Search by ID/name, view profile modal, edit details, and safe deletion protection |
| 5 | **Room Allocation** | `/dashboard/allocation` | Assign beds, prevent double-booking & overcapacity, transfer, and checkout/release beds |
| 6 | **Student Fees** | `/dashboard/fees` | Generate fee invoices, record offline payments, calculate balances, and instant printable receipts |
| 7 | **All Student Living (Ledger)** | `/dashboard/payments` | Complete audit ledger of authorized offline payments with printable vouchers |
| 8 | **Leaved Students** | `/dashboard/leaved-students` | Alumni & graduated residents registry with one-click re-activation |
| 9 | **Student Attendance** | `/dashboard/attendance` | Daily roll-call (Present / Absent / Leave), date selector, quick-mark, and duplicate prevention |
| 10 | **Complaints & Maintenance** | `/dashboard/complaints` | Lodge facility tickets (electricity, plumbing, wifi, mess), technician status updates & resolution notes |
| 11 | **Notices & Announcements** | `/dashboard/notices` | Publish, edit, and target campus circulars (All Residents, Staff, or specific wings) |
| 12 | **New Employee & Staff** | `/dashboard/employees` | Manage wardens, caretakers, security supervisors, electricians, and mess staff profiles |
| 13 | **Employee Payment** | `/dashboard/employee-payments` | Disburse monthly staff compensation and record salary vouchers |
| 14 | **Reports & Analytics** | `/dashboard/reports` | Live calculated statistics, printable audit sheets, and **one-click CSV downloads** |
| 15 | **Profile & Settings** | `/dashboard/settings` | Admin profile, password change, and backend architecture specs |

---

## 🏢 Room Hierarchy: Floors & Sections

The hostel accommodates residents across 3 main floors with dedicated sections:
- **Hostel Floors**: `Floor 1`, `Floor 2`, and `Floor 3`.
- **Room Sections**: Each floor features **Room A**, **Room B**, and **Room C** sections.
- **Dynamic Bed Capacity**: Adding or expanding room capacity dynamically generates individual bed slots (`Bed-1`, `Bed-2`, etc.).

---

## 🔒 Security & Data Integrity Protections

1. **Capacity Floor Protection**: A room's bed capacity cannot be reduced below its number of currently occupied beds.
2. **Negative Value Validation**: Rent and capacity values cannot be negative.
3. **Safe Deletion Policy**: A room cannot be deleted if there are active resident allocations.
4. **Input Sanitization**: All form payloads are trimmed and strictly type-cast to prevent malformed queries and script injections.
5. **Partial Updates**: Django DRF `update()` supports `partial=True`, ensuring seamless edits without field data loss.
6. **Query Parameter Sanitization**: Backend query filters safely handle empty strings, `undefined`, or non-numeric inputs.
7. **Database Backups**: Automated backups stored in `backend/backups/`.

---

## ⚡ Quick Start Guide

### 1. Frontend (React + Vite)
```bash
cd frontend

# Install dependencies
npm install

# Run Vite development server
npm run dev
```
Runs at: **[http://localhost:5173](http://localhost:5173)**.

### 2. Backend (Python Django REST Framework)
```bash
cd backend

# Install dependencies (including PostgreSQL & SQLite support)
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# (Optional) Seed demonstration database records if needed
python manage.py seed_data

# Run development server
python manage.py runserver 127.0.0.1:8000
```
API runs at: **[http://127.0.0.1:8000/api/](http://127.0.0.1:8000/api/)**.

---

## 🔑 Login & Demo Credentials

As configured for rapid viva examination:
- **Default Username:** `hostel`
- **Default Password:** `admin1` *(or any demo password of your choice)*
- **Direct Redirect:** Automatically opens `/dashboard/rooms` upon sign-in.

---

## 🗄️ Database & Production Deployment

- **Local Development:** Defaults to SQLite (`backend/db.sqlite3`).
- **Production (PostgreSQL):** Set `DATABASE_URL` in environment or `.env`:
  ```bash
  DATABASE_URL=postgres://user:password@host:port/database_name
  ```
  Compatible with Supabase, Neon, Render, Railway, AWS RDS, and Docker.

---

## 🧪 Automated Testing

Run the Django test suite:
```bash
cd backend
python manage.py test hostel_app
```
Compile frontend production build:
```bash
cd frontend
npm run build
```
