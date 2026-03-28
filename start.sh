#!/bin/bash
# Eventify Startup Script

echo "🚀 Starting Eventify Services..."

# Kill any existing processes
pkill -f "bun run dev" 2>/dev/null
pkill -f "bun index" 2>/dev/null
sleep 1

# Start API Service
echo "Starting API Service on port 8080..."
cd /home/z/my-project/mini-services/api-service
exec bun index.ts &
sleep 2

# Start Next.js
echo "Starting Next.js on port 3000..."
cd /home/z/my-project
exec bun run dev &

echo ""
echo "✅ Services started!"
echo "Frontend: http://localhost:3000"
echo "API: http://localhost:8080"
echo "Gateway: http://localhost:81"

# Keep script running
wait
