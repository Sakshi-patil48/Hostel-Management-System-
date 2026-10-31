#!/usr/bin/env bash
echo "========================================================"
echo "  G H Raisoni 3D Hostel Management System"
echo "  Mode: Standalone Frontend (Zero Backend Required)"
echo "========================================================"
cd frontend
if [ ! -d "node_modules" ]; then
    echo "[1/2] Installing frontend dependencies..."
    npm install
fi
echo "[2/2] Starting development server..."
echo "Application will be available at:"
echo "http://localhost:5173"
npm run dev
