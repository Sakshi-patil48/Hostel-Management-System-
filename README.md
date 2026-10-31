# 🏨 G H Raisoni - 3D Hostel Management System

A modern, full-stack web application designed for **G H Raisoni Institute of Engineering & Business Management, Jalgaon** to automate hostel operations, replace manual paper registers, and provide real-time 3D room tracking and student night roll call.

---

## 📖 About the Project

The **G H Raisoni 3D Hostel Management System** is built to solve everyday hostel administration challenges with a smooth, interactive experience:

- **3D Room & Bed Matrix**: Visualizes hostel floors in an isometric layout showing real-time room availability, bed occupancy, and student allocations.
- **QR & PIN Student Attendance**: Wardens can generate a live, time-limited QR code session with a 6-digit countdown PIN for night curfew roll calls.
- **Dedicated Student Portal**: Students log in using their simple Student ID (e.g., `ID-101`) to mark attendance via QR scan, 6-digit PIN, or biometric camera check-in, and view their monthly attendance history.
- **Room & Fee Management**: Real-time room allocation, bed assignment, fee payment status tracking, and student directories.
- **Full-Stack Security**: Protected API endpoints, token authentication, rate limiting, and role-based access control (RBAC).

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 19 (Single Page Application)
- **Build Tool**: Vite (Ultra-fast build & HMR)
- **Styling**: Tailwind CSS & Vanilla CSS 3D Transforms
- **Icons**: Lucide React
- **QR Scanning & Generation**: `qrcode.react` (SVG QR generation) & `html5-qrcode` (Live camera scanning)

### Backend
- **Framework**: Python 3.10+ & Django 5.x
- **API Engine**: Django REST Framework (DRF)
- **Database**: SQLite (Zero configuration, pre-loaded demo records)
- **Security & Headers**: Django CORS Headers, Django Rate Limiting, Token Authentication

### Developer Environment
- **IDE**: Visual Studio Code (pre-configured `.vscode/` launch & compound build tasks)

---

## ⚡ Instant Quick Start (Runs on ANY Laptop with Zero Extensions!)

> [!TIP]
> **Zero Backend & Zero Extensions Required!**  
> All project data (students, rooms, beds, allocations, fee payments, attendance roll calls, QR curfew sessions, complaints, notices, and staff payroll) is managed and persisted directly inside browser **LocalStorage**. You do **not** need Python installed, you do **not** need any VS Code extensions, and you do **not** need to start a database server!

### How to Run on ANY Laptop:

#### Option A: One-Click Startup (Windows)
Double-click **`run_frontend.bat`** in the project root folder. It will install dependencies if needed and open the app!

#### Option B: Terminal Command (Windows, Mac, Linux)
Open your terminal in the project folder and run:
```bash
# 1. Start directly from project root:
npm start

# OR manually navigate:
cd frontend
npm install
npm run dev
```

Open your browser at **[http://localhost:5173/](http://localhost:5173/)**:
- **Default Login**: `hostel` / `admin1` (or any demo password of your choice).
- **Student Portal Login**: Enter any student ID like `HST-2026-001` or `ID-101`.
- All modifications persist across browser restarts!
- Need to restore fresh sample data? Go to **Profile & Settings** and click **"Reset Sample Data"**.

---

### Optional: Full-Stack Mode with Python Django Backend
If you also wish to run the Django backend server:
```bash
cd backend
python -m pip install -r requirements.txt
python manage.py migrate
python manage.py runserver 127.0.0.1:8000
```

## 🔑 Important Details (Credentials & URLs)

### Live Access URLs
- **Frontend Web Application**: [http://localhost:5173/](http://localhost:5173/)
- **Backend API**: [http://127.0.0.1:8000/api/](http://127.0.0.1:8000/api/)
- **Backend Health Check**: [http://127.0.0.1:8000/api/health/](http://127.0.0.1:8000/api/health/)

### Login Credentials

| Role | Username / ID | Password | Access / Landing Page |
|---|---|---|---|
| **Chief Warden / Staff** | `hostel` | `password123` | Full Administrative Dashboard (`/dashboard`) |
| **Resident Student** | `ID-101` *(or ID-102)* | *(any or leave blank)* | Student Attendance Portal (`/dashboard/student-attendance-portal`) |

---

## ⚠️ Important Things to Keep in Mind

1. **Keep Backend Running First**: Always start the backend terminal before opening the web app in your browser so the frontend can fetch room and student data.
2. **Project Report & Documentation**: The full 31-page academic project report (SRS, diagrams, viva voce preparation) is located inside the **`docs/`** folder:
   - PDF: [`docs/GHRCEM_Hostel_Management_System_Project_Report.pdf`](./docs/GHRCEM_Hostel_Management_System_Project_Report.pdf)
   - Security Audit: [`docs/SECURITY.md`](./docs/SECURITY.md)
   - UI Screenshots: [`docs/screenshots/`](./docs/screenshots/)
3. **Running Automated Tests**:
   - Backend tests (12 tests): `cd backend && python manage.py test`
   - Frontend build test: `cd frontend && npm run build`
4. **No Database Configuration Needed**: The pre-configured SQLite database is already bundled with sample rooms, beds, and students ready for demonstration.

---

## 📄 License & Attribution
Developed for **G H Raisoni Institute of Engineering & Business Management, Jalgaon**. All rights reserved.
