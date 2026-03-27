#!/bin/bash
# Start all services for Eventify

cd /home/z/my-project

# Start API Service
echo "Starting API Service..."
cd /home/z/my-project/mini-services/api-service
node index.js &
API_PID=$!
echo "API PID: $API_PID"

# Start Next.js Dev Server
echo "Starting Next.js..."
cd /home/z/my-project
bun run dev &
NEXT_PID=$!
echo "Next.js PID: $NEXT_PID"

echo ""
echo "Services started!"
echo "API: http://localhost:8080"
echo "Frontend: http://localhost:3000"
