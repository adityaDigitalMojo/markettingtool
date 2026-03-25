#!/bin/bash

# Mojo Marketing Agent - Master Validation Script
# Usage: ./test-all.sh [node|python]

BACKEND_TYPE=${1:-node}
PORT=8000

echo "🚀 Starting System Validation (Backend: $BACKEND_TYPE)..."

# 1. Start Backend in background
if [ "$BACKEND_TYPE" == "node" ]; then
    echo "📦 Starting Node.js Backend..."
    cd backend && npm start > backend.log 2>&1 &
    BACKEND_PID=$!
else
    echo "🐍 Starting Python Backend..."
    cd backend && python3 main.py > backend.log 2>&1 &
    BACKEND_PID=$!
fi

# 2. Start Frontend in background
echo "⚛️ Starting Vite Frontend..."
cd frontend && npm run dev > frontend.log 2>&1 &
FRONTEND_PID=$!

# 3. Wait for services to be ready
echo "⏳ Waiting for services to initialize..."
sleep 10

# 4. Run Playwright Tests
echo "🎭 Running E2E Tests..."
cd frontend && npx playwright test

TEST_RESULT=$?

# 5. Cleanup
echo "🧹 Cleaning up background processes..."
kill $BACKEND_PID
kill $FRONTEND_PID

if [ $TEST_RESULT -eq 0 ]; then
    echo "✅ ALL TESTS PASSED! System is stable."
    exit 0
else
    echo "❌ TESTS FAILED. Check backend.log and frontend.log for details."
    exit 1
fi
