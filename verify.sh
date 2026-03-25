#!/bin/bash
echo "🚀 Starting automated verification..."

# 1. Check Backend
echo "Checking Backend..."
cd backend
npm install > /dev/null 2>&1
npm start &
BACKEND_PID=$!
sleep 3
if curl -s http://localhost:8000/api/dashboard > /dev/null; then
  echo "✅ Backend is UP and responding to API calls."
else
  echo "❌ Backend FAILED to respond."
  kill $BACKEND_PID
  exit 1
fi
kill $BACKEND_PID

# 2. Check Frontend Build
echo "Checking Frontend Build..."
cd ../frontend
npm install > /dev/null 2>&1
if npm run build; then
  echo "✅ Frontend Build SUCCESSFUL (Vite + Tailwind 4)."
else
  echo "❌ Frontend Build FAILED."
  exit 1
fi

echo "🎉 ALL SYSTEMS GO!"
