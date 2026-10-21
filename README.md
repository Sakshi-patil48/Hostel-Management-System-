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

## 💻 How to Open & Run in VS Code

Follow these simple steps to run the complete project on your computer using Visual Studio Code.

### Step 1: Open the Project in VS Code
1. Open **Visual Studio Code**.
2. Click **File > Open Folder...** (or press <kbd>Ctrl</kbd> + <kbd>K</kbd>, <kbd>Ctrl</kbd> + <kbd>O</kbd>).
3. Select and open the project root folder.

---

### Step 2: Open the Terminal in VS Code
To run commands, open the integrated terminal in VS Code:
- **Keyboard Shortcut**: Press <kbd>Ctrl</kbd> + <kbd>`</kbd> (Ctrl + Backtick, the key above <kbd>Tab</kbd>)
- **Or via Top Menu**: Click **Terminal** from the top menu bar → **New Terminal**.

---

### Step 3: Run the Backend (Terminal 1)
In your first terminal tab, run:

```bash
# 1. Navigate to the backend folder
cd backend

# 2. Install Python dependencies
python -m pip install -r requirements.txt

# 3. Apply database migrations
python manage.py migrate

# 4. Start the Django server
python manage.py runserver 127.0.0.1:8000
```
> ✅ **Backend is now live at**: [http://127.0.0.1:8000/api/](http://127.0.0.1:8000/api/)  
> Health check: [http://127.0.0.1:8000/api/health/](http://127.0.0.1:8000/api/health/)

---

### Step 4: Run the Frontend (Terminal 2)
1. Open a **second terminal tab** in VS Code by clicking the **`+`** icon in the terminal panel (or press <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>`</kbd>).
2. Run:

```bash
# 1. Navigate to the frontend folder
cd frontend

# 2. Install Node dependencies
npm install

# 3. Start the Vite development server
npm run dev
```
> ✅ **Frontend is now live at**: [http://localhost:5173/](http://localhost:5173/)

---

### ⚡ Pro Tip (Run Both with One Shortcut!)
The repository includes pre-configured VS Code tasks.  
Simply press <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>B</kbd> in VS Code to automatically launch both the Django Backend and Vite Frontend side-by-side!

---

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
