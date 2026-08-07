#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}🔍 Checking for processes on ports 3001 and 5173...${NC}"

# Kill process on port 3001 (backend)
if lsof -ti:3001 > /dev/null 2>&1; then
  PID=$(lsof -ti:3001)
  echo -e "${YELLOW}Killing process on port 3001 (PID: $PID)${NC}"
  kill -9 $PID 2>/dev/null || sudo kill -9 $PID
fi

# Kill process on port 5173 (frontend)
if lsof -ti:5173 > /dev/null 2>&1; then
  PID=$(lsof -ti:5173)
  echo -e "${YELLOW}Killing process on port 5173 (PID: $PID)${NC}"
  kill -9 $PID 2>/dev/null || sudo kill -9 $PID
fi

sleep 1

echo -e "${GREEN}✓ Ports cleared${NC}"
echo -e "${GREEN}Starting GK Mart Backend (port 3001) and Frontend (port 5173)...${NC}\n"

# Start backend and frontend in parallel
(cd backend && NODE_ENV=development npm run dev) &
BACKEND_PID=$!

sleep 2

(cd frontend && npm run dev) &
FRONTEND_PID=$!

echo -e "${GREEN}✓ Backend started (PID: $BACKEND_PID)${NC}"
echo -e "${GREEN}✓ Frontend started (PID: $FRONTEND_PID)${NC}"
echo -e "${GREEN}✓ Backend: http://localhost:3001${NC}"
echo -e "${GREEN}✓ Frontend: http://localhost:5173${NC}"
echo -e "\n${YELLOW}Press Ctrl+C to stop both services${NC}\n"

# Wait for both processes
wait $BACKEND_PID $FRONTEND_PID
