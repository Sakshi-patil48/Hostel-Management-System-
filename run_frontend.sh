#!/usr/bin/env bash
echo "========================================================"
echo "  G H Raisoni 3D Hostel Management System"
echo "  Mode: Standalone Frontend (Zero Backend Required)"
echo "========================================================"
echo ""

if ! command -v node &> /dev/null; then
    echo "[ERROR] Node.js is not installed on this machine."
    echo "Please install Node.js from https://nodejs.org and re-run this script."
    exit 1
fi

cd frontend

if [ ! -d "node_modules" ]; then
    echo "[1/2] Installing frontend dependencies (one-time setup)..."
    npm install
fi

echo "[2/2] Starting local web server..."
echo "Application URL: http://localhost:5173"
echo ""

if which xdg-open > /dev/null; then
    xdg-open http://localhost:5173 &
elif which open > /dev/null; then
    open http://localhost:5173 &
fi

npm run dev
