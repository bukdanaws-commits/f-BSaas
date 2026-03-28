# EVENTIFY - Local Development Guide

## Panduan Test Lokal Sebelum Deploy ke GCP

Panduan ini akan membantu Anda test arsitektur GCP Native secara lokal:
- PostgreSQL lokal
- Google OAuth flow
- File upload ke local storage

---

## Prerequisites

Pastikan sudah terinstall:
- **Node.js 20+** atau **Bun**
- **Go 1.21+**
- **PostgreSQL 15+** (atawa Docker)
- **Git**

---

## Step 1: Setup PostgreSQL Lokal

### Option A: Install PostgreSQL Langsung

```bash
# macOS
brew install postgresql@15
brew services start postgresql@15

# Ubuntu/Debian
sudo apt install postgresql-15
sudo systemctl start postgresql

# Windows
# Download installer dari https://www.postgresql.org/download/windows/
```

### Option B: Gunakan Docker (Recommended)

```bash
# Pull dan run PostgreSQL container
docker run --name eventify-postgres \
    -e POSTGRES_USER=eventify_user \
    -e POSTGRES_PASSWORD=eventify_password \
    -e POSTGRES_DB=eventify \
    -p 5432:5432 \
    -d postgres:15

# Check container running
docker ps | grep eventify-postgres
```

### Verifikasi PostgreSQL

```bash
# Connect to PostgreSQL
psql -h localhost -U eventify_user -d eventify

# Expected output:
# psql (15.x)
# Type "help" for help.
# 
# eventify=>
```

---

## Step 2: Setup Database Schema

```bash
# Clone repository (jika belum)
git clone -b gcp-native https://github.com/bukdanaws-commits/f-BSaas.git eventify-gcp
cd eventify-gcp

# Run database migrations
psql -h localhost -U eventify_user -d eventify -f database/cloudsql-schema.sql

# Expected output:
# CREATE EXTENSION
# CREATE TABLE
# CREATE INDEX
# INSERT 0 4
# ...
```

### Verifikasi Tables

```bash
psql -h localhost -U eventify_user -d eventify -c "\dt"

# Expected output:
#                    List of relations
#  Schema |         Name          | Type  |     Owner      
# --------+-----------------------+-------+----------------
#  public | booths                | table | eventify_user
#  public | checkin_records       | table | eventify_user
#  public | claim_records         | table | eventify_user
#  public | credit_settings       | table | eventify_user
#  public | credit_transactions   | table | eventify_user
#  public | credit_wallets        | table | eventify_user
#  public | display_queue         | table | eventify_user
#  public | event_staff           | table | eventify_user
#  public | events                | table | eventify_user
#  public | memberships           | table | eventify_user
#  public | menu_categories       | table | eventify_user
#  public | menu_items            | table | eventify_user
#  public | participants          | table | eventify_user
#  public | pricing_packages      | table | eventify_user
#  public | scan_logs             | table | eventify_user
#  public | stock_logs            | table | eventify_user
#  public | tenants               | table | eventify_user
#  public | ticket_types          | table | eventify_user
#  public | users                 | table | eventify_user
```

---

## Step 3: Setup Backend (Golang)

### 3.1 Configure Environment

```bash
cd backend

# Create .env file
cat > .env << 'EOF'
# Server
SERVER_PORT=8080
APP_ENV=development

# Database (Local PostgreSQL)
DATABASE_URL=postgres://eventify_user:eventify_password@localhost:5432/eventify?sslmode=disable

# JWT Secret
JWT_SECRET=local-development-jwt-secret-min-32-characters

# Google OAuth (replace with your credentials)
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret

# Storage (Local)
STORAGE_TYPE=local
UPLOAD_DIR=./uploads

# Midtrans (replace with your credentials)
MIDTRANS_MERCHANT_ID=your-merchant-id
MIDTRANS_SERVER_KEY=your-server-key
MIDTRANS_CLIENT_KEY=your-client-key
MIDTRANS_IS_SANDBOX=true

# Frontend
FRONTEND_URL=http://localhost:3000
EOF
```

### 3.2 Install Dependencies & Run

```bash
# Download Go dependencies
go mod tidy
go mod download

# Run backend
go run cmd/main.go

# Expected output:
# [INFO] Starting EVENTIFY Backend...
# [INFO] Connected to database: eventify
# [INFO] Server running on port: 8080
# [INFO] Local storage initialized: ./uploads
```

### 3.3 Test Backend API

```bash
# Test health endpoint
curl http://localhost:8080/health

# Expected output:
# {"status":"ok","timestamp":"2024-..."}

# Test pricing packages
curl http://localhost:8080/api/pricing/packages

# Expected output:
# {"success":true,"data":[...]}
```

---

## Step 4: Setup Frontend (Next.js)

### 4.1 Configure Environment

```bash
cd .. # back to root

# Create .env.local file
cat > .env.local << 'EOF'
# API URL (Backend)
NEXT_PUBLIC_API_URL=http://localhost:8080/api

# Google OAuth (replace with your credentials)
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com

# NextAuth
NEXTAUTH_SECRET=local-nextauth-secret-min-32-characters
NEXTAUTH_URL=http://localhost:3000

# Midtrans (replace with your credentials)
NEXT_PUBLIC_MIDTRANS_CLIENT_KEY=your-client-key

# App
NEXT_PUBLIC_APP_NAME=EVENTIFY
NEXT_PUBLIC_APP_URL=http://localhost:3000
EOF
```

### 4.2 Install Dependencies & Run

```bash
# Install dependencies
bun install
# or: npm install

# Run frontend
bun run dev
# or: npm run dev

# Expected output:
#   ▲ Next.js 16.x.x
#   - Local:        http://localhost:3000
#   - Environments: .env.local
# 
#  ✓ Starting...
#  ✓ Ready in 2.5s
```

### 4.3 Access Frontend

Open browser: **http://localhost:3000**

You should see the EVENTIFY login page.

---

## Step 5: Test Google OAuth Flow

### 5.1 Configure Google OAuth Redirect URI

1. Go to [Google Cloud Console > Credentials](https://console.cloud.google.com/apis/credentials)
2. Find your OAuth 2.0 Client ID
3. Add authorized redirect URI:
   ```
   http://localhost:3000/auth/callback
   ```
4. Add authorized JavaScript origin:
   ```
   http://localhost:3000
   ```
5. Click Save

### 5.2 Test OAuth Flow

1. Open **http://localhost:3000/login**
2. Click **"Continue with Google"** button
3. You'll be redirected to Google login page
4. Select your Google account
5. Grant permissions
6. You'll be redirected back to:
   ```
   http://localhost:3000/auth/callback?code=4/0AX...
   ```
7. Backend will exchange code for token
8. You'll be redirected to dashboard

### 5.3 Verify User Created in Database

```bash
psql -h localhost -U eventify_user -d eventify -c "SELECT id, email, name, is_super_admin FROM users;"

# Expected output:
#  id                                   | email                    | name           | is_super_admin 
# --------------------------------------+--------------------------+----------------+----------------
#  xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx | your.email@gmail.com     | Your Name      | f
```

---

## Step 6: Test File Upload

### 6.1 Create Upload Directory

```bash
mkdir -p backend/uploads/images
```

### 6.2 Test Upload API

```bash
# Create test file
echo "test content" > /tmp/test.txt

# Upload file (requires auth token)
curl -X POST http://localhost:8080/api/upload \
    -H "Authorization: Bearer YOUR_JWT_TOKEN" \
    -F "file=@/tmp/test.txt" \
    -F "folder=test"

# Expected output:
# {
#   "success": true,
#   "data": {
#     "url": "http://localhost:3000/uploads/test/YOUR_USER_ID/test.txt",
#     "filename": "test.txt",
#     "size": 12,
#     "mime_type": "text/plain"
#   }
# }
```

### 6.3 Test Image Upload

```bash
# Create test image (or use existing)
curl -X POST http://localhost:8080/api/upload/image \
    -H "Authorization: Bearer YOUR_JWT_TOKEN" \
    -F "image=@/path/to/image.png" \
    -F "purpose=profile"

# Expected output:
# {
#   "success": true,
#   "data": {
#     "url": "http://localhost:3000/uploads/images/profile/YOUR_USER_ID/xxx.png",
#     ...
#   }
# }
```

---

## Step 7: Test Dashboard Features

### 7.1 EO Dashboard

1. Login with Google OAuth
2. You'll be redirected to `/eo`
3. Test features:
   - Create Event
   - Add Participants
   - Setup F&B (Booths & Menu Items)
   - Invite Team Members

### 7.2 Crew Dashboard

1. From EO dashboard, invite a crew member
2. Login as crew member
3. Access `/crew` dashboard
4. Test features:
   - Check-in participant
   - Claim food/drink

### 7.3 Super Admin Dashboard

1. Set user as super admin in database:
   ```sql
   UPDATE users SET is_super_admin = true WHERE email = 'your.email@gmail.com';
   ```
2. Login again
3. Access `/super-admin` dashboard
4. Test features:
   - View all tenants
   - Manage users
   - View analytics

---

## Quick Start Script

Use the provided script for quick setup:

```bash
# Run quick start script
chmod +x start-local.sh
./start-local.sh
```

This will:
1. Start PostgreSQL container
2. Run database migrations
3. Create .env files from templates
4. Provide next steps

---

## Troubleshooting

### PostgreSQL Connection Error

```bash
# Check PostgreSQL running
docker ps | grep eventify-postgres
# or
pg_isready -h localhost -p 5432

# Check connection string
echo $DATABASE_URL
# Should be: postgres://eventify_user:eventify_password@localhost:5432/eventify?sslmode=disable
```

### Backend Won't Start

```bash
# Check Go version
go version
# Should be: go version go1.21.x

# Check dependencies
go mod verify

# Check port 8080 not in use
lsof -i :8080
```

### Frontend Won't Start

```bash
# Check Node/Bun version
node -v  # v20.x.x
bun -v   # 1.x.x

# Clear cache and reinstall
rm -rf node_modules .next
bun install

# Check port 3000 not in use
lsof -i :3000
```

### OAuth Redirect Error

1. Check Google Cloud Console credentials
2. Ensure redirect URI matches exactly:
   ```
   http://localhost:3000/auth/callback
   ```
3. Check backend logs for errors
4. Verify frontend NEXT_PUBLIC_GOOGLE_CLIENT_ID matches

### Database Migration Error

```bash
# Drop and recreate database
psql -h localhost -U eventify_user -d postgres -c "DROP DATABASE IF EXISTS eventify;"
psql -h localhost -U eventify_user -d postgres -c "CREATE DATABASE eventify;"

# Run migrations again
psql -h localhost -U eventify_user -d eventify -f database/cloudsql-schema.sql
```

---

## Quick Commands Reference

```bash
# Start PostgreSQL (Docker)
docker start eventify-postgres

# Start Backend
cd backend && go run cmd/main.go

# Start Frontend
bun run dev

# View Backend logs
# Check terminal output

# View Frontend logs
# Check terminal output

# Connect to Database
psql -h localhost -U eventify_user -d eventify

# Reset Database
docker rm -f eventify-postgres
docker run --name eventify-postgres \
    -e POSTGRES_USER=eventify_user \
    -e POSTGRES_PASSWORD=eventify_password \
    -e POSTGRES_DB=eventify \
    -p 5432:5432 \
    -d postgres:15
psql -h localhost -U eventify_user -d eventify -f database/cloudsql-schema.sql
```

---

## Architecture Overview (Local)

```
┌─────────────────────────────────────────────────────────────────┐
│                    LOCAL DEVELOPMENT                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   Browser (localhost:3000)                                      │
│        │                                                         │
│        ▼                                                         │
│   ┌────────────────┐                                             │
│   │   Frontend     │                                             │
│   │   (Next.js)    │                                             │
│   │   Port: 3000   │                                             │
│   └────────┬───────┘                                             │
│            │ API Requests                                         │
│            ▼                                                      │
│   ┌────────────────┐     ┌────────────────┐                     │
│   │   Backend      │────▶│   PostgreSQL   │                     │
│   │   (Golang)     │     │   (Docker)     │                     │
│   │   Port: 8080   │     │   Port: 5432   │                     │
│   └────────┬───────┘     └────────────────┘                     │
│            │                                                      │
│            ▼                                                      │
│   ┌────────────────┐                                             │
│   │   Local File   │                                             │
│   │   Storage      │                                             │
│   │   ./uploads    │                                             │
│   └────────────────┘                                             │
│                                                                  │
│   External: Google OAuth API                                     │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Next Steps After Local Testing

1. ✅ All tests pass → Ready for GCP deployment
2. Set environment variables with your credentials
3. Run `./deploy-gcp-native.sh` 
4. Follow `DEPLOYMENT_STEPS.md` for production deployment
