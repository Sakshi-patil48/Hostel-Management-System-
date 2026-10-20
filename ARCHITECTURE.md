# Architecture & Engineering Guide — G H Raisoni Hostel Management System

This document outlines the architectural blueprint, structural directory organization, state management flow, modular API layer, and coding conventions for the **G H Raisoni 3D Hostel Management System**.

---

## 1. High-Level Architectural Overview

The system follows a modern decoupled architecture:
- **Frontend**: Single Page Application built on **React 19**, **Vite**, and **React Router DOM v7**, styled with a custom light lavender-and-white theme, 3D CSS perspective effects, and Lucide React icons.
- **State Management**: Built-in, zero-dependency **React Context** providers (`AuthContext`, `ThemeContext`, `NotificationContext`) combined in `AppProviders.jsx`.
- **Business Logic Layer**: Decoupled from UI views via specialized custom hooks (`useRooms`, `useStudents`, `useFees`, `useDashboard`).
- **API Layer**: Domain-driven client modules under `src/services/api/` with unified error handling, timeout abort controllers, and backward-compatible facades (`hostelService`, `authService`).
- **Backend**: **Django 5.x** with **Django REST Framework (DRF)**, token authentication, SQLite (`db.sqlite3`), and CORS headers.

---

## 2. Directory Layout

```
beautiful-nobel/
├── ARCHITECTURE.md                  # This architecture and design document
├── README.md                        # Project overview and quickstart guide
├── backend/                         # Django REST Framework Backend
│   ├── .env.example                 # Template for Django environment configuration
│   ├── db.sqlite3                   # Relational database (16 rooms, 31 beds, 10 students)
│   ├── manage.py                    # Django administration CLI
│   ├── requirements.txt             # Python dependencies
│   ├── hostel_backend/              # Django Project Core
│   │   ├── settings.py              # Central settings with resilient .env loader
│   │   ├── urls.py                  # Root URL configuration (/admin/, /api/)
│   │   ├── views.py                 # HealthCheckView and LoginView
│   │   ├── wsgi.py                  # WSGI entrypoint
│   │   └── asgi.py                  # ASGI entrypoint
│   └── hostel_app/                  # Core Hostel Management Domain App
│       ├── models.py                # Database models (Rooms, Beds, Students, Fees, etc.)
│       ├── views.py                 # DRF ViewSets with filtering and validation
│       ├── serializers.py           # Model serializers with relationship nesting
│       ├── urls.py                  # API route registrations via DefaultRouter
│       ├── tests.py                 # Automated unit tests (8 passing test cases)
│       └── admin.py                 # Django admin registrations
│
└── frontend/                        # React 19 + Vite Frontend Application
    ├── .env                         # Local Vite environment variables
    ├── .env.example                 # Vite environment variable template
    ├── package.json                 # Node.js project manifest
    ├── vite.config.js               # Vite build configuration
    ├── index.html                   # HTML5 shell
    └── src/
        ├── App.jsx                  # Route definitions and page mounting
        ├── main.jsx                 # Root entrypoint with ErrorBoundary and AppProviders
        ├── dashboard.css            # 3D transforms, theme variables, glass panels
        ├── index.css                # Global reset, typography, and utility classes
        ├── assets/                  # Logos, campus photos, and icons
        ├── config/
        │   └── env.js               # Centralized environment constants
        ├── context/
        │   ├── AuthContext.jsx      # Authentication and session state
        │   ├── ThemeContext.jsx     # Light / Dark mode state and DOM sync
        │   ├── NotificationContext.jsx # Live system alerts and unread counts
        │   └── AppProviders.jsx     # Composition wrapper for all contexts
        ├── hooks/
        │   ├── useAuth.js           # Auth hook
        │   ├── useTheme.js          # Theme hook
        │   ├── useNotifications.js  # Notifications hook
        │   ├── useCountUp.js        # Numeric count-up animation hook
        │   ├── useRooms.js          # Room filters, modals, and CRUD logic
        │   ├── useStudents.js       # Student directory and editing logic
        │   ├── useFees.js           # Fees, payments, and receipt generation
        │   └── useDashboard.js      # Dashboard summary and live KPI metrics
        ├── components/
        │   ├── common/              # Universal shared components
        │   │   ├── ErrorBoundary.jsx # Global error boundary with recovery UI
        │   │   ├── Modal.jsx        # Base accessible dialog modal
        │   │   ├── ConfirmModal.jsx # Confirmation dialog
        │   │   ├── SearchBar.jsx    # Search input with clear button
        │   │   ├── StatusBadge.jsx  # Uniform status chips
        │   │   ├── MetricCard.jsx   # 3D interactive metric card
        │   │   ├── TiltCard.jsx     # 3D cursor-tracking perspective wrapper
        │   │   └── FeedbackBanner.jsx # Accessible inline alerts and toasts
        │   ├── layout/
        │   │   ├── DashboardLayout.jsx # App chrome, sidebar, and navbar
        │   │   ├── CampusBackground.jsx # 3D Parallax campus background
        │   │   └── HostelIllustration.jsx # Campus vector graphic
        │   ├── auth/
        │   │   ├── LoginCard.jsx    # 3D Tilted login panel
        │   │   ├── LoginForm.jsx    # Credentials form with demo support
        │   │   └── ForgotPasswordModal.jsx # Password recovery modal
        │   └── modals/
        │       └── PrintableReceiptModal.jsx # Printable payment receipt
        ├── services/
        │   ├── api/                 # Modular Domain API Clients
        │   │   ├── client.js        # Core HTTP client with DRF error parser
        │   │   ├── auth.api.js      # Sign-in, health check, token verification
        │   │   ├── rooms.api.js     # Blocks, rooms, and beds
        │   │   ├── students.api.js  # Student directory and admissions
        │   │   ├── allocations.api.js # Bed allocations and checkouts
        │   │   ├── fees.api.js      # Fees, payments, and receipts
        │   │   ├── operations.api.js # Attendance and complaints
        │   │   ├── notices.api.js   # Official circulars
        │   │   ├── staff.api.js     # Employees and payroll
        │   │   ├── reports.api.js   # CSV exports and summaries
        │   │   └── dashboard.api.js # Consolidated operations dashboard
        │   ├── authService.js       # Backward-compatible auth facade
        │   └── hostelService.js     # Backward-compatible hostel domain facade
        ├── utils/
        │   ├── formatters.js        # Currency (INR), date, and section formatters
        │   └── useCountUp.js        # Backward-compatible hook re-export
        └── pages/                   # Clean presentational route views
            ├── DashboardHome.jsx    # KPI cards and overview
            ├── ManageRooms.jsx      # Rooms table and floor filters
            ├── NewStudent.jsx       # Student admission form
            ├── ManageStudents.jsx   # Student directory table
            ├── RoomAllocationPage.jsx # Bed allocation workflow
            ├── StudentFeesPage.jsx  # Fee records and payment collection
            ├── PaymentHistoryPage.jsx # Historical transaction logs
            ├── LeavedStudentsPage.jsx # Former students / alumni
            ├── AttendancePage.jsx   # Daily roll call grid
            ├── ComplaintsPage.jsx   # Maintenance tickets
            ├── NoticesPage.jsx      # Campus notices
            ├── EmployeesPage.jsx    # Staff management
            ├── EmployeePaymentsPage.jsx # Staff salary disbursement
            ├── ReportsPage.jsx      # CSV report downloads
            └── ProfileSettingsPage.jsx # Administrative preferences
```

---

## 3. State Management Architecture

State is split across three layers:
1. **Global App State (React Context)**:
   - `AuthContext`: Holds active session user, role, authentication token, and provides `login()`, `logout()`, `updateProfile()`.
   - `ThemeContext`: Manages light/dark mode preference, persists to `localStorage`, and keeps `data-theme` attribute on the DOM synchronized.
   - `NotificationContext`: Manages unread badge counts, live alerts, and dismiss/read actions.
2. **Domain Business Logic (Custom Hooks)**:
   - Decoupled from JSX views. Manages API communication, loading flags, filter query state, modal open/close states, and form validation.
3. **Local Component State (`useState`)**:
   - Used strictly for ephemeral UI state (e.g. accordion open/close, mouse tilt coordinates).

---

## 4. API Layer & Error Handling

- **Base Client (`services/api/client.js`)**:
  - Automatically appends Django DRF `Authorization: Token <token>` header if present.
  - Implements an `AbortController` timeout (default 8,000ms).
  - Normalizes DRF field validation errors (e.g. `{"room_number": ["Room number is required."]}`) into friendly user strings.
- **Global Error Boundary (`components/common/ErrorBoundary.jsx`)**:
  - Catches any unexpected React render exceptions and renders a helpful crash recovery panel with "Reload Page" and "Return to Dashboard" options.
- **In-App Feedback (`FeedbackBanner.jsx`)**:
  - Replaces invasive browser `window.alert()` calls with smooth, non-blocking dismissible alert banners.

---

## 5. Verification & Testing

- **Frontend Compilation**: `cd frontend && npm run build` (Builds cleanly in <1s with 0 errors).
- **Backend Test Suite**: `cd backend && python manage.py test` (8 test cases pass in <1s).
- **Database Safety**: Database records are never mutated by migrations or refactoring.
