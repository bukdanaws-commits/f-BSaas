# Eventify Backend API

SaaS Event Management System - Golang Fiber Backend

## 🚀 Quick Start

### 1. Setup Environment
```bash
cp .env.example .env
# Edit .env with your credentials
```

### 2. Install Dependencies
```bash
go mod tidy
```

### 3. Run Server
```bash
go run cmd/main.go
```

Server will run on `http://localhost:8080`

## 📁 Project Structure

```
backend/
├── cmd/
│   └── main.go              # Entry point
├── internal/
│   ├── config/              # Configuration
│   ├── database/            # Database connection
│   ├── handlers/            # API handlers
│   │   ├── auth.go          # Authentication
│   │   ├── events.go        # Events CRUD
│   │   ├── participants.go  # Participants
│   │   ├── checkin.go       # Check-in
│   │   ├── claims.go        # F&B Claims
│   │   └── credits.go       # Credit system
│   ├── middleware/          # Middleware
│   │   ├── auth.go          # JWT Auth
│   │   └── cors.go          # CORS
│   ├── models/              # Data models
│   └── utils/               # Utilities
│       ├── jwt.go           # JWT utilities
│       └── response.go      # Response helpers
├── migrations/              # SQL migrations
├── go.mod
├── go.sum
└── .env
```

## 🔌 API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/auth/google` | Get Google OAuth URL |
| POST | `/api/auth/google/callback` | Google OAuth callback |
| POST | `/api/auth/google/login` | Login with Google token |
| GET | `/api/auth/me` | Get current user |

### Events
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/events` | Get all events |
| POST | `/api/events` | Create event |
| GET | `/api/events/:id` | Get event by ID |
| PUT | `/api/events/:id` | Update event |
| DELETE | `/api/events/:id` | Delete event |
| POST | `/api/events/:id/duplicate` | Duplicate event |
| GET | `/api/events/:id/stats` | Get event stats |

### Participants
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/events/:event_id/participants` | Get participants |
| POST | `/api/events/:event_id/participants` | Create participant |
| POST | `/api/events/:event_id/participants/import` | Import CSV |
| GET | `/api/participants/qr/:qr_code` | Get by QR code |
| GET | `/api/participants/:id` | Get participant |
| PUT | `/api/participants/:id` | Update participant |
| DELETE | `/api/participants/:id` | Delete participant |

### Check-in
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/checkin` | QR Check-in |
| POST | `/api/checkin/manual` | Manual check-in |
| POST | `/api/checkin/undo/:id` | Undo check-in |
| GET | `/api/checkin/history/:event_id` | Check-in history |

### Claims (F&B)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/claims` | F&B Claim |
| POST | `/api/claims/quick` | Quick claim |
| GET | `/api/claims/history/:event_id` | Claim history |

### Credits
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/credits/wallet` | Get wallet |
| GET | `/api/credits/transactions` | Transaction history |
| POST | `/api/credits/purchase` | Purchase credits |

### Pricing
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/pricing/packages` | Get packages |
| POST | `/api/pricing/packages/:id/purchase` | Purchase package |

### Admin (Super Admin Only)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/credit-settings` | Get credit settings |
| PUT | `/api/admin/credit-settings` | Update settings |
| POST | `/api/admin/tenants/:id/credits` | Add credits to tenant |

## 🔐 Authentication

All protected endpoints require JWT token in header:
```
Authorization: Bearer <token>
```

## 📝 Environment Variables

| Variable | Description |
|----------|-------------|
| `SERVER_PORT` | Server port (default: 8080) |
| `APP_ENV` | Environment (development/production) |
| `FRONTEND_URL` | Frontend URL for CORS |
| `JWT_SECRET` | JWT signing secret |
| `GOOGLE_CLIENT_ID` | Google OAuth Client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth Secret |
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_SERVICE_KEY` | Supabase service role key |
| `DATABASE_URL` | PostgreSQL connection string |
| `MIDTRANS_MERCHANT_ID` | Midtrans Merchant ID |
| `MIDTRANS_SERVER_KEY` | Midtrans Server Key |
| `MIDTRANS_CLIENT_KEY` | Midtrans Client Key |

## 🏗️ Tech Stack

- **Framework**: Fiber v2
- **Database**: PostgreSQL (Supabase)
- **ORM**: GORM
- **Auth**: JWT + Google OAuth
- **Payment**: Midtrans
