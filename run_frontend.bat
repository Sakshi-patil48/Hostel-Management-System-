@echo off
title G H Raisoni Hostel Management System
echo ========================================================
echo   G H Raisoni 3D Hostel Management System
echo   Mode: Standalone Frontend (Zero Backend Required)
echo ========================================================
echo.
cd frontend
if not exist node_modules (
    echo [1/2] Installing frontend dependencies...
    call npm install
)
echo [2/2] Starting development server...
echo.
echo Application will be available at:
echo http://localhost:5173
echo.
call npm run dev
pause
