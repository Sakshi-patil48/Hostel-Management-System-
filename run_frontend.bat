@echo off
title G H Raisoni Hostel Management System
echo ========================================================
echo   G H Raisoni 3D Hostel Management System
echo   Mode: Standalone Frontend (Zero Backend Required)
echo ========================================================
echo.

:: 1. Check if Node.js is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed on this laptop.
    echo.
    echo To run this web application on a fresh laptop, you only need
    echo the free Node.js runtime (no extensions or database needed).
    echo.
    echo 1. Download Node.js from: https://nodejs.org
    echo 2. Run the installer (Click Next, Next, Finish)
    echo 3. Re-run this file!
    echo.
    echo Opening https://nodejs.org in your browser...
    start https://nodejs.org
    echo.
    pause
    exit /b 1
)

cd frontend

:: 2. Check and install dependencies if first time
if not exist node_modules (
    echo [1/2] Installing frontend dependencies (one-time setup)...
    call npm install
)

:: 3. Launch Development Server
echo [2/2] Starting local web server...
echo.
echo Application URL: http://localhost:5173
echo.
start http://localhost:5173
call npm run dev
pause
