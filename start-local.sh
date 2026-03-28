#!/bin/bash

# ===========================================
# EVENTIFY - Local Development Quick Start
# ===========================================

set -e

echo "======================================"
echo "   EVENTIFY Local Development Setup   "
echo "======================================"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Check Docker
if ! command -v docker &> /dev/null; then
    echo -e "${YELLOW}Docker not found. Please install Docker or setup PostgreSQL manually.${NC}"
    exit 1
fi

# Step 1: Start PostgreSQL
echo -e "${BLUE}[1/4] Starting PostgreSQL container...${NC}"
if docker ps | grep -q eventify-postgres; then
    echo -e "${GREEN}PostgreSQL already running${NC}"
else
    docker rm -f eventify-postgres 2>/dev/null || true
    docker run --name eventify-postgres \
        -e POSTGRES_USER=eventify_user \
        -e POSTGRES_PASSWORD=eventify_password \
        -e POSTGRES_DB=eventify \
        -p 5432:5432 \
        -d postgres:15
    sleep 3
    echo -e "${GREEN}PostgreSQL started${NC}"
fi

# Step 2: Run Migrations
echo -e "${BLUE}[2/4] Running database migrations...${NC}"
sleep 2
psql -h localhost -U eventify_user -d eventify -f database/cloudsql-schema.sql 2>/dev/null || {
    echo -e "${YELLOW}Migration may have already run or psql not available${NC}"
    echo "Run manually: psql -h localhost -U eventify_user -d eventify -f database/cloudsql-schema.sql"
}
echo -e "${GREEN}Database ready${NC}"

# Step 3: Setup Backend
echo -e "${BLUE}[3/4] Setting up backend...${NC}"
cd backend

# Create .env if not exists
if [ ! -f .env ]; then
    cat > .env << 'EOF'
SERVER_PORT=8080
APP_ENV=development
DATABASE_URL=postgres://eventify_user:eventify_password@localhost:5432/eventify?sslmode=disable
JWT_SECRET=local-development-jwt-secret-min-32-characters
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
STORAGE_TYPE=local
UPLOAD_DIR=./uploads
MIDTRANS_MERCHANT_ID=your-merchant-id
MIDTRANS_SERVER_KEY=your-server-key
MIDTRANS_CLIENT_KEY=your-client-key
MIDTRANS_IS_SANDBOX=true
FRONTEND_URL=http://localhost:3000
EOF
    echo -e "${GREEN}Created backend/.env${NC}"
    echo -e "${YELLOW}Please update backend/.env with your credentials${NC}"
fi

# Create uploads directory
mkdir -p uploads

cd ..

# Step 4: Setup Frontend
echo -e "${BLUE}[4/4] Setting up frontend...${NC}"

# Create .env.local if not exists
if [ ! -f .env.local ]; then
    cat > .env.local << 'EOF'
NEXT_PUBLIC_API_URL=http://localhost:8080/api
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
NEXTAUTH_SECRET=local-nextauth-secret-min-32-characters
NEXTAUTH_URL=http://localhost:3000
NEXT_PUBLIC_MIDTRANS_CLIENT_KEY=your-client-key
NEXT_PUBLIC_APP_NAME=EVENTIFY
NEXT_PUBLIC_APP_URL=http://localhost:3000
EOF
    echo -e "${GREEN}Created .env.local${NC}"
    echo -e "${YELLOW}Please update .env.local with your credentials${NC}"
fi

# Install dependencies if needed
if [ ! -d node_modules ]; then
    echo -e "${BLUE}Installing frontend dependencies...${NC}"
    bun install || npm install
fi

# Summary
echo ""
echo -e "${GREEN}======================================${NC}"
echo -e "${GREEN}   Setup Complete!                   ${NC}"
echo -e "${GREEN}======================================${NC}"
echo ""
echo -e "${YELLOW}Next Steps:${NC}"
echo ""
echo "1. Update credentials in:"
echo "   - backend/.env (Google OAuth, Midtrans)"
echo "   - .env.local (Google OAuth)"
echo ""
echo "2. Start backend (Terminal 1):"
echo "   cd backend && go run cmd/main.go"
echo ""
echo "3. Start frontend (Terminal 2):"
echo "   bun run dev"
echo ""
echo "4. Open browser:"
echo "   http://localhost:3000"
echo ""
echo "5. Configure Google OAuth redirect URI:"
echo "   http://localhost:3000/auth/callback"
echo ""
