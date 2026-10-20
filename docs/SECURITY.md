# Security Policy & Architecture

## Security Overview

The **G H Raisoni Hostel Management System** is designed with defense-in-depth principles to protect institutional data, resident privacy, and staff operations. This document outlines the security controls, authentication safeguards, access control policies, and procedures for reporting security vulnerabilities.

---

## 1. Authentication & Session Management

- **Dual-Layer Authentication**:
  - **Token Authentication**: Secure, cryptographically random Django REST Framework tokens (`rest_framework.authtoken`) for stateless API interactions between the React SPA frontend and Django backend.
  - **Session Authentication**: Used for Django administration views with secure, HTTP-only session cookies.
- **Credential Storage & Password Hashing**:
  - Passwords are never stored in plaintext.
  - Hashing utilizes standard PBKDF2 with a SHA256 cryptographic hash and unique per-user salts (720,000 iterations).
- **Session Protection**:
  - `SESSION_COOKIE_HTTPONLY = True` (prevents JavaScript access to session cookies).
  - `CSRF_COOKIE_HTTPONLY = True` and `CSRF_COOKIE_SAMESITE = 'Lax'`.
  - Production deployments enforce `SESSION_COOKIE_SECURE = True` and `CSRF_COOKIE_SECURE = True` over HTTPS.

---

## 2. Role-Based Access Control (RBAC)

The application implements granular Role-Based Access Control across both the backend REST API and the frontend client routes:

| Role | Permissions & Scope |
|---|---|
| **Chief Warden / Admin** | Full access to rooms, beds, student registrations, payroll, financial ledgers, audit logs, and roll call session generation. |
| **Hostel Staff** | Read/write access to room allocations, daily attendance, complaints, and notices. Restricted from payroll changes. |
| **Resident Student** | Self-service access to Student Attendance Portal (6-digit PIN check-in), attendance calendar, personal fee receipts, maintenance tickets, and notices. Cannot access staff directories, room creation, or payroll. |

- **Backend Enforcement**:
  - Viewsets use `IsStaffOrReadOnly` and `IsAdminOrWarden` custom permissions (`backend/hostel_app/permissions.py`).
  - Unauthenticated write operations (POST, PUT, PATCH, DELETE) are rejected with `401 Unauthorized` or `403 Forbidden`.
- **Frontend Route Guards**:
  - Protected routes are wrapped with `<ProtectedRoute allowedRoles={['admin', 'warden', 'staff']}>` (`frontend/src/components/common/ProtectedRoute.jsx`).
  - Unauthenticated access redirects immediately to the login view.
  - Students attempting to access staff routes receive a friendly "Access Restricted (RBAC)" screen.

---

## 3. Rate Limiting & Brute-Force Prevention

To mitigate credential stuffing, brute-force attacks, and Denial of Service (DoS):

- **Login Endpoint Throttling**:
  - Scoped rate limiter (`ScopedRateThrottle`) limits login attempts to **15 requests per minute** per IP (`throttle_scope = 'login'`).
- **Anonymous User Throttling**:
  - Limited to **120 requests per minute** for unauthenticated clients.
- **Authenticated User Throttling**:
  - Limited to **1200 requests per minute** for authenticated active sessions.

---

## 4. Input Sanitization & XSS Mitigation

- **React DOM Escaping**: React escapes all data rendered in JSX by default.
- **Zero Raw HTML Injection**: The application contains **zero instances** of `dangerouslySetInnerHTML` or `eval()`.
- **Automatic Client-Side Sanitization**: Outgoing JSON payloads sent via `client.js` pass through `sanitizeFormPayload()`, stripping embedded `<script>`, `<iframe>`, `javascript:` protocols, and null bytes (`\0`).
- **Parameterized ORM Queries**: All database queries use the Django ORM query builder (`Student.objects.filter(...)`), eliminating raw SQL injection vulnerabilities.

---

## 5. Network & HTTP Security Headers

Configured via Django's SecurityMiddleware (`backend/hostel_backend/settings.py`):

```python
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = 'DENY'
SESSION_COOKIE_HTTPONLY = True
CSRF_COOKIE_HTTPONLY = True
SESSION_COOKIE_SAMESITE = 'Lax'
CSRF_COOKIE_SAMESITE = 'Lax'
```

- **Clickjacking Protection**: `X-Frame-Options: DENY` prevents the portal from being embedded in malicious iframes.
- **MIME Sniffing Prevention**: `X-Content-Type-Options: nosniff` forces browsers to respect declared MIME types.
- **Cross-Origin Resource Sharing (CORS)**: Strict origin whitelist (`CORS_ALLOWED_ORIGINS`). Insecure wildcard origins with credentials (`CORS_ALLOW_ALL_ORIGINS = True` with `CORS_ALLOW_CREDENTIALS = True`) are strictly disallowed.

---

## 6. Secrets & Database Isolation

- **No Secrets in Version Control**:
  - Environment templates (`.env.example`) contain placeholders only.
  - Real environment files (`.env`, `.env.local`) are strictly excluded in `.gitignore`.
- **Database Files Untracked**:
  - SQLite database files (`db.sqlite3`, `*.sqlite3`, `*.db`) and database backups (`backend/backups/`) are untracked from Git to prevent leakage of resident records or session tokens.

---

## 7. Reporting a Vulnerability

If you discover a security vulnerability in this project, please report it responsibly:
1. Email: `security@ghr.edu` or open a private security advisory on GitHub.
2. Please provide detailed reproduction steps, the affected component, and potential impact.
3. Allow up to 48 hours for an acknowledgment before disclosing publicly.
