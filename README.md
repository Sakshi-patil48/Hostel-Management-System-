# 🏨 G H Raisoni 3D Hostel Management System

A modern, production-grade hostel management web application designed for **G H Raisoni Institute of Engineering & Business Management, Jalgaon**. Built with a decoupled **Django REST Framework** backend and a responsive **React 19 + Vite** frontend featuring 3D isometric room visualization, role-based access control (RBAC), and an automated **Student Attendance & QR Roll Call Portal**.

---

## ⚡ Quickstart (Run Manually / In VS Code)

### Prerequisites
- **Python 3.10+** (with `pip`)
- **Node.js 18+** (with `npm`)

### 1. Start Django Backend

Open a terminal in the project root:
```bash
cd backend
python -m pip install -r requirements.txt
python manage.py migrate
python manage.py runserver 127.0.0.1:8000
```
- **Backend API**: [http://127.0.0.1:8000/api/](http://127.0.0.1:8000/api/)
- **Health Check**: [http://127.0.0.1:8000/api/health/](http://127.0.0.1:8000/api/health/)

### 2. Start Vite Frontend

Open a second terminal in the project root:
```bash
cd frontend
npm install
npm run dev
```
- **Web App**: [http://localhost:5173/](http://localhost:5173/)

> **VS Code Tip**: Pre-configured launch and task profiles are included in `.vscode/`. Simply press `Ctrl + Shift + B` to start both servers, or use the `Run & Debug` panel (`F5`).

---

## 🔑 Login Credentials

| Role | Username / ID | Password | Access / Landing Page |
|---|---|---|---|
| **Chief Warden / Staff** | `hostel` | `password123` | Full Administrative Dashboard (`/dashboard`) |
| **Resident Student** | `ID-101` | *(any or blank)* | Dedicated Attendance Portal (`/dashboard/student-attendance-portal`) |

---

## 📁 Clean Repository Layout

```
beautiful-nobel/
├── backend/            # Django REST Framework API, models, and migrations
├── frontend/           # React 19 SPA, 3D CSS visualizer, and API client
├── docs/               # Project reports, security policies, and screenshots
│   ├── GHRCEM_Hostel_Management_System_Project_Report.pdf  # Full 31-page academic report
│   ├── SECURITY.md     # OWASP security policies & RBAC matrix
│   └── screenshots/    # High-resolution UI captures
├── .vscode/            # Visual Studio Code launch & build tasks
├── .gitignore          # Strict isolation of secrets and databases
├── ARCHITECTURE.md     # Technical engineering & architecture blueprint
└── README.md           # This quickstart guide
```

---

## ✨ Key Capabilities

- **3D Room & Bed Matrix**: Visualizes occupancy across floors with interactive availability status.
- **QR & 6-Digit PIN Roll Call**: Time-limited curfew sessions with live countdowns and duplicate-check protection.
- **Dedicated Student Portal**: Friendly resident IDs (`ID-101`), attendance metrics, and 1-click verification.
- **Full-Stack Security Hardening**: API rate-limiting (15 req/min on login), recursive XSS sanitization, and CORS whitelist.
- **Comprehensive Academic Report**: 31-page capstone report with 35 viva voce preparation questions located in `docs/`.

---

## 🧪 Testing

```bash
# Run backend test suite (12 tests)
cd backend && python manage.py test

# Build frontend production bundle
cd frontend && npm run build
```

---

## 📄 License & Attribution

Developed for **G H Raisoni Institute of Engineering & Business Management, Jalgaon**. All rights reserved.
