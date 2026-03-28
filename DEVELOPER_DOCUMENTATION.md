# 📚 EVENTIFY - Developer Documentation

> SaaS Multi-Tenant Event Management System

---

## 📑 Table of Contents

1. [Project Overview](#1-project-overview)
2. [Architecture](#2-architecture)
3. [Technology Stack](#3-technology-stack)
4. [Directory Structure](#4-directory-structure)
5. [Database Schema](#5-database-schema)
6. [Authentication & Authorization](#6-authentication--authorization)
7. [API Endpoints](#7-api-endpoints)
8. [Frontend Components](#8-frontend-components)
9. [State Management](#9-state-management)
10. [Workflows](#10-workflows)
11. [Setup & Installation](#11-setup--installation)
12. [Development Guidelines](#12-development-guidelines)
13. [Deployment](#13-deployment)

---

## 1. Project Overview

### 1.1 Description

Eventify is a **SaaS Multi-Tenant Event Management System** that enables multiple Event Organizers (EO) to manage their events, participants, check-ins, and F&B claims through a unified platform.

### 1.2 Key Features

| Feature | Description |
|---------|-------------|
| **Multi-Tenant** | Multiple EO (Event Organizers) on single platform |
| **3 Dashboards** | Super Admin, EO Owner, Crew |
| **Event Management** | Create, edit, duplicate events with 5-step wizard |
| **Participant Management** | Import, export, CRUD operations |
| **QR Check-in** | Camera scan, manual input, email search |
| **F&B Claims** | Food & beverage distribution tracking |
| **Credit System** | Pay-per-use with Midtrans integration |
| **Real-time Display** | Welcome screen for check-ins |

### 1.3 User Roles

| Role | Access Level | Dashboard |
|------|--------------|-----------|
| **Super Admin** | Platform Owner | Full platform management |
| **Owner** | EO Owner | Full EO management |
| **Admin** | EO Admin | Full event access within EO |
| **Crew** | Event Staff | Check-in & F&B claim only |

---

## 2. Architecture

### 2.1 System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           EVENTIFY ARCHITECTURE                              │
└─────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────────┐
│                              FRONTEND (Next.js 16)                           │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │ Super Admin │  │  EO Owner   │  │    Crew     │  │   Public    │         │
│  │  Dashboard  │  │  Dashboard  │  │  Dashboard  │  │    Pages    │         │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘         │
│                                                                              │
│  State: Zustand | UI: shadcn/ui | Styling: Tailwind CSS 4                   │
└────────────────────────────────────┬─────────────────────────────────────────┘
                                     │
                                     ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│                           API GATEWAY (Caddy)                                │
│                           Port: 3000                                         │
└────────────────────────────────────┬─────────────────────────────────────────┘
                                     │
          ┌──────────────────────────┼──────────────────────────┐
          │                          │                          │
          ▼                          ▼                          ▼
┌──────────────────┐    ┌──────────────────┐    ┌──────────────────┐
│  Next.js API     │    │  Go Fiber API    │    │  WebSocket       │
│  Routes          │    │  Backend         │    │  Service         │
│  (Port 3000)     │    │  (Port 3030)     │    │  (Port 3003)     │
│                  │    │                  │    │                  │
│  - Auth Proxy    │    │  - Business API  │    │  - Real-time     │
│  - DB Check      │    │  - CRUD          │    │  - Display Queue │
│  - File Upload   │    │  - QR Validate   │    │  - Notifications │
└────────┬─────────┘    └────────┬─────────┘    └────────┬─────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                                 ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│                        DATABASE (Supabase PostgreSQL)                        │
│                                                                              │
│  Tables: users, tenants, memberships, credit_wallets, credit_transactions,  │
│          events, ticket_types, participants, checkins, booths,              │
│          menu_categories, menu_items, claims, display_queue, scan_logs      │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

### 2.2 Request Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           REQUEST FLOW                                       │
└─────────────────────────────────────────────────────────────────────────────┘

User Action
     │
     ▼
┌─────────────────┐
│ React Component │
│ (Client Side)   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Zustand Store   │
│ (State Mgmt)    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐     ┌─────────────────┐
│ API Client      │────►│ Caddy Gateway   │
│ (lib/api-client)│     │ (Port 3000)     │
└────────┬────────┘     └────────┬────────┘
         │                       │
         │                       ▼
         │              ┌─────────────────┐
         │              │ XTransformPort  │
         │              │ Query Param     │
         │              └────────┬────────┘
         │                       │
         ▼                       ▼
┌─────────────────────────────────────────────┐
│              Go Fiber Backend               │
│              (Port 3030)                    │
├─────────────────────────────────────────────┤
│  1. Middleware: CORS, Auth, Rate Limit     │
│  2. Handler: Validate Request              │
│  3. Service: Business Logic                │
│  4. Repository: Database Operations        │
│  5. Response: JSON                         │
└─────────────────────────────────────────────┘
```

---

## 3. Technology Stack

### 3.1 Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| **Next.js** | 16.x | React Framework (App Router) |
| **TypeScript** | 5.x | Type Safety |
| **Tailwind CSS** | 4.x | Styling |
| **shadcn/ui** | Latest | UI Components |
| **Zustand** | Latest | State Management |
| **Framer Motion** | Latest | Animations |
| **Lucide React** | Latest | Icons |
| **html5-qrcode** | Latest | QR Scanner |

### 3.2 Backend

| Technology | Version | Purpose |
|------------|---------|---------|
| **Go** | 1.21+ | Backend Language |
| **Go Fiber** | 2.x | Web Framework |
| **PostgreSQL** | 15+ | Database (Supabase) |
| **JWT** | - | Authentication |
| **Midtrans** | - | Payment Gateway |

### 3.3 Infrastructure

| Service | Purpose |
|---------|---------|
| **Supabase** | PostgreSQL Database + Auth |
| **Caddy** | Reverse Proxy / Gateway |
| **Bun** | JavaScript Runtime |
| **Docker** | Containerization |

---

## 4. Directory Structure

```
/home/z/my-project/
│
├── src/                          # Frontend Source
│   ├── app/                      # Next.js App Router
│   │   ├── page.tsx              # Entry point (redirect logic)
│   │   ├── layout.tsx            # Root layout
│   │   ├── globals.css           # Global styles
│   │   │
│   │   ├── (auth)/               # Auth Route Group
│   │   │   ├── layout.tsx
│   │   │   └── login/
│   │   │       └── page.tsx      # Login page
│   │   │
│   │   ├── (dashboard)/          # Dashboard Route Group
│   │   │   ├── layout.tsx
│   │   │   │
│   │   │   ├── super-admin/      # Super Admin Dashboard
│   │   │   │   ├── layout.tsx
│   │   │   │   ├── page.tsx      # Dashboard
│   │   │   │   ├── tenants/      # Kelola EO
│   │   │   │   ├── billing/
│   │   │   │   ├── analytics/
│   │   │   │   └── settings/
│   │   │   │
│   │   │   ├── eo/               # EO Owner Dashboard
│   │   │   │   ├── layout.tsx
│   │   │   │   ├── page.tsx      # Dashboard
│   │   │   │   ├── events/       # My Events
│   │   │   │   ├── participants/ # Participants ⭐
│   │   │   │   ├── fnb-settings/ # F&B Settings
│   │   │   │   ├── team/         # Team & Crew
│   │   │   │   ├── credits/      # Credits
│   │   │   │   ├── reports/      # Reports
│   │   │   │   └── settings/
│   │   │   │
│   │   │   └── crew/             # Crew Dashboard
│   │   │       ├── layout.tsx
│   │   │       ├── page.tsx      # Dashboard
│   │   │       ├── checkin/      # Check-in Scanner
│   │   │       ├── claim/        # F&B Claim
│   │   │       └── display/      # Display Monitor
│   │   │
│   │   └── api/                  # API Routes
│   │       ├── route.ts          # Health check
│   │       ├── db-check/         # DB connection check
│   │       ├── auth/[...nextauth]/
│   │       └── proxy/[...path]/  # API proxy to Go backend
│   │
│   ├── components/               # React Components
│   │   ├── admin/                # Super Admin components
│   │   │   └── SuperAdminDashboard.tsx
│   │   │
│   │   ├── eo-dashboard/         # EO Owner components
│   │   │   ├── EODashboardContent.tsx
│   │   │   └── EventSetupWizard.tsx
│   │   │
│   │   ├── crew/                 # Crew components
│   │   │   ├── CrewDashboard.tsx
│   │   │   ├── CheckinSection.tsx
│   │   │   ├── ClaimSection.tsx
│   │   │   └── DisplayMonitorSection.tsx
│   │   │
│   │   ├── dashboard/            # Shared dashboard components
│   │   │   ├── DashboardLayout.tsx
│   │   │   ├── DashboardSidebar.tsx
│   │   │   └── StatsCard.tsx
│   │   │
│   │   ├── ui/                   # shadcn/ui components (30+)
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── table.tsx
│   │   │   └── ...
│   │   │
│   │   └── providers/            # Context providers
│   │       └── SessionProvider.tsx
│   │
│   ├── stores/                   # Zustand State Management
│   │   ├── auth-store.ts         # Auth state
│   │   ├── data-store.ts         # Data state
│   │   └── mock-store.ts         # Mock data + Demo login
│   │
│   ├── lib/                      # Utilities
│   │   ├── api-client.ts         # API client
│   │   ├── supabase.ts           # Supabase client
│   │   ├── mock-data.ts          # Mock data
│   │   ├── mock-api.ts           # Mock API functions
│   │   └── utils.ts              # Utility functions
│   │
│   ├── hooks/                    # Custom React hooks
│   │   ├── use-auth.ts
│   │   ├── use-mobile.ts
│   │   └── use-toast.ts
│   │
│   ├── config/                   # Configuration
│   │   └── menu.ts               # Menu configuration
│   │
│   └── types/                    # TypeScript types
│       └── database.ts           # Database types
│
├── backend/                      # Go Fiber Backend
│   ├── cmd/
│   │   └── main.go               # Entry point
│   │
│   ├── internal/
│   │   ├── config/               # Configuration
│   │   │   └── config.go
│   │   │
│   │   ├── database/             # Database connection
│   │   │   └── database.go
│   │   │
│   │   ├── models/               # Data models
│   │   │   └── models.go
│   │   │
│   │   ├── repository/           # Data access layer
│   │   │   └── *.go
│   │   │
│   │   ├── services/             # Business logic
│   │   │   └── *.go
│   │   │
│   │   ├── handlers/             # HTTP handlers
│   │   │   ├── auth.go
│   │   │   ├── events.go
│   │   │   ├── participants.go
│   │   │   ├── checkin.go
│   │   │   ├── fnb.go
│   │   │   ├── claims.go
│   │   │   ├── display.go
│   │   │   ├── credits.go
│   │   │   └── admin.go
│   │   │
│   │   ├── middleware/           # HTTP middleware
│   │   │   ├── auth.go
│   │   │   └── cors.go
│   │   │
│   │   └── utils/                # Utilities
│   │       ├── jwt.go
│   │       └── response.go
│   │
│   ├── go.mod
│   ├── go.sum
│   ├── Dockerfile
│   └── README.md
│
├── mini-services/                # Microservices
│   └── api-service/              # WebSocket service
│       ├── index.ts
│       └── package.json
│
├── supabase/                     # Database scripts
│   ├── schema.sql
│   ├── fix-rls-and-tables.sql
│   └── FIX_DATABASE.sql
│
├── prisma/                       # Prisma (if used)
│   └── schema.prisma
│
├── public/                       # Static files
│   └── logo.svg
│
├── examples/                     # Example code
│   └── websocket/
│
├── package.json
├── bun.lock
├── tailwind.config.ts
├── tsconfig.json
├── next.config.ts
├── Caddyfile                     # Gateway config
├── PRD_FINAL_APPROVED.md         # Product Requirements
└── DEVELOPER_DOCUMENTATION.md    # This file
```

---

## 5. Database Schema

### 5.1 Entity Relationship Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           DATABASE SCHEMA                                    │
└─────────────────────────────────────────────────────────────────────────────┘

                              ┌─────────────┐
                              │   users     │
                              │ (Google ID) │
                              └──────┬──────┘
                                     │
           ┌─────────────────────────┼─────────────────────────┐
           │                         │                         │
           ▼                         ▼                         ▼
    ┌─────────────┐          ┌─────────────┐          ┌─────────────┐
    │   tenants   │          │ memberships │          │  operated   │
    │    (EO)     │          │             │          │  checkins   │
    └──────┬──────┘          └─────────────┘          └─────────────┘
           │
           │
    ┌──────┴──────┐
    │             │
    ▼             ▼
┌─────────────┐  ┌─────────────────┐
│credit_wallet│  │ credit_transac- │
│             │──│ tions           │
└─────────────┘  └─────────────────┘
    │
    │
    ▼
┌─────────────┐
│   events    │
└──────┬──────┘
       │
       ├──────────────────────┬─────────────────────┐
       │                      │                     │
       ▼                      ▼                     ▼
┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│ ticket_types│       │ event_staff │       │   booths    │
└──────┬──────┘       └─────────────┘       └──────┬──────┘
       │                                           │
       │                                           │
       ▼                                           ▼
┌─────────────┐                            ┌─────────────┐
│participants │────────────────────────────│ menu_items  │
└──────┬──────┘                            └──────┬──────┘
       │                                          │
       │                                          │
       ▼                                          ▼
┌─────────────┐                            ┌─────────────┐
│  checkins   │                            │   claims    │
└─────────────┘                            └─────────────┘
       │
       │
       ▼
┌─────────────┐       ┌─────────────┐
│ display_    │       │  scan_logs  │
│   queue     │       │             │
└─────────────┘       └─────────────┘
```

### 5.2 Table Definitions

#### users
```sql
CREATE TABLE users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         VARCHAR(255) UNIQUE NOT NULL,
  name          VARCHAR(255),
  avatar_url    TEXT,
  google_id     VARCHAR(255) UNIQUE,
  is_super_admin BOOLEAN DEFAULT false,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);
```

#### tenants (EO)
```sql
CREATE TABLE tenants (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        VARCHAR(255) NOT NULL,
  slug        VARCHAR(255) UNIQUE,
  owner_id    UUID REFERENCES users(id),
  status      VARCHAR(50) DEFAULT 'pending', -- pending, active, suspended
  verified_at TIMESTAMPTZ,
  phone       VARCHAR(50),
  address     TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);
```

#### memberships
```sql
CREATE TABLE memberships (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id   UUID REFERENCES users(id) NOT NULL,
  tenant_id UUID REFERENCES tenants(id) NOT NULL,
  role      VARCHAR(50) DEFAULT 'crew', -- owner, admin, crew
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, tenant_id)
);
```

#### credit_wallets
```sql
CREATE TABLE credit_wallets (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     UUID REFERENCES tenants(id) UNIQUE NOT NULL,
  balance       INTEGER DEFAULT 0,
  bonus_balance INTEGER DEFAULT 0,
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);
```

#### credit_transactions
```sql
CREATE TABLE credit_transactions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     UUID REFERENCES tenants(id) NOT NULL,
  type          VARCHAR(50) NOT NULL, -- purchase, usage, bonus, refund
  amount        INTEGER NOT NULL,
  reference_type VARCHAR(100),
  reference_id   UUID,
  description    TEXT,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);
```

#### events
```sql
CREATE TABLE events (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id               UUID REFERENCES tenants(id) NOT NULL,
  name                    VARCHAR(255) NOT NULL,
  title                   VARCHAR(255),
  description             TEXT,
  banner_url              TEXT,
  start_date              TIMESTAMPTZ,
  end_date                TIMESTAMPTZ,
  location                VARCHAR(500),
  category                VARCHAR(100),
  capacity                INTEGER DEFAULT 0,
  
  -- Display Settings
  welcome_message         VARCHAR(500) DEFAULT 'Selamat Datang!',
  display_duration        INTEGER DEFAULT 5,
  enable_sound            BOOLEAN DEFAULT false,
  check_in_desks          INTEGER DEFAULT 4,
  
  -- F&B Defaults
  default_max_food_claims  INTEGER DEFAULT 4,
  default_max_drink_claims INTEGER DEFAULT 2,
  
  -- Storage
  storage_days            INTEGER DEFAULT 15,
  status                  VARCHAR(50) DEFAULT 'draft', -- draft, active, completed
  
  created_at              TIMESTAMPTZ DEFAULT NOW(),
  updated_at              TIMESTAMPTZ DEFAULT NOW()
);
```

#### ticket_types
```sql
CREATE TABLE ticket_types (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id  UUID REFERENCES events(id) NOT NULL,
  name      VARCHAR(100) NOT NULL, -- VIP, Regular, Student
  price     INTEGER DEFAULT 0,
  quota     INTEGER DEFAULT 0,
  features  JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### participants
```sql
CREATE TABLE participants (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     UUID REFERENCES tenants(id) NOT NULL,
  event_id      UUID REFERENCES events(id) NOT NULL,
  
  -- Personal Info
  name          VARCHAR(255) NOT NULL,
  email         VARCHAR(255) NOT NULL,
  phone         VARCHAR(50),
  company       VARCHAR(255),          -- ✨ Optional
  job_title     VARCHAR(255),          -- ✨ Optional
  dietary_restrictions TEXT,           -- ✨ Optional
  
  -- Ticket
  ticket_type_id UUID REFERENCES ticket_types(id),
  
  -- QR Code
  qr_code       VARCHAR(50) UNIQUE NOT NULL, -- Format: HKI-2025-XXXX
  
  -- Photo & AI
  original_photo_url TEXT,
  ai_photo_url       TEXT,
  bio               TEXT,
  
  -- Check-in
  is_checked_in  BOOLEAN DEFAULT false,
  checked_in_at  TIMESTAMPTZ,
  checkin_count  INTEGER DEFAULT 0,
  
  -- F&B Claims (per participant)
  food_claims    INTEGER DEFAULT 0,
  drink_claims   INTEGER DEFAULT 0,
  max_food_claims INTEGER DEFAULT 4,
  max_drink_claims INTEGER DEFAULT 2,
  
  -- Status
  is_active      BOOLEAN DEFAULT true,
  is_blacklisted BOOLEAN DEFAULT false,
  
  -- Metadata
  meta          JSONB,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW(),
  expires_at    TIMESTAMPTZ,
  
  UNIQUE(event_id, email)
);
```

#### checkins
```sql
CREATE TABLE checkins (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id      UUID REFERENCES events(id) NOT NULL,
  participant_id UUID REFERENCES participants(id) UNIQUE NOT NULL,
  operator_id   UUID REFERENCES users(id),
  desk_number   INTEGER DEFAULT 1,
  checked_in_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### booths
```sql
CREATE TABLE booths (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id  UUID REFERENCES events(id) NOT NULL,
  name      VARCHAR(255) NOT NULL,
  type      VARCHAR(50) NOT NULL, -- food, drink, both
  is_active BOOLEAN DEFAULT true
);
```

#### menu_categories
```sql
CREATE TABLE menu_categories (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id  UUID REFERENCES events(id) NOT NULL,
  name      VARCHAR(255) NOT NULL,
  type      VARCHAR(50) NOT NULL -- food, drink
);
```

#### menu_items
```sql
CREATE TABLE menu_items (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id    UUID REFERENCES events(id) NOT NULL,
  category_id UUID REFERENCES menu_categories(id),
  name        VARCHAR(255) NOT NULL,
  stock       INTEGER DEFAULT 0,
  is_active   BOOLEAN DEFAULT true
);
```

#### claims
```sql
CREATE TABLE claims (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id      UUID REFERENCES events(id) NOT NULL,
  participant_id UUID REFERENCES participants(id) NOT NULL,
  menu_item_id  UUID REFERENCES menu_items(id) NOT NULL,
  booth_id      UUID REFERENCES booths(id),
  claimed_at    TIMESTAMPTZ DEFAULT NOW()
);
```

#### display_queue
```sql
CREATE TABLE display_queue (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id      UUID REFERENCES events(id) NOT NULL,
  participant_id UUID REFERENCES participants(id),
  name          VARCHAR(255) NOT NULL,
  photo_url     TEXT,
  is_displayed  BOOLEAN DEFAULT false,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);
```

#### scan_logs
```sql
CREATE TABLE scan_logs (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     UUID REFERENCES tenants(id),
  event_id      UUID REFERENCES events(id),
  participant_id UUID REFERENCES participants(id),
  type          VARCHAR(50), -- checkin, claim
  result        VARCHAR(50), -- success, failed, duplicate
  device        VARCHAR(255),
  created_at    TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 6. Authentication & Authorization

### 6.1 Authentication Flow (Google OAuth)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        GOOGLE OAUTH FLOW                                     │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   User      │────►│   Google    │────►│  Callback   │────►│  Backend    │
│  Click Login│     │   OAuth     │     │   URL       │     │  Verify     │
└─────────────┘     └─────────────┘     └─────────────┘     └──────┬──────┘
                                                                   │
                                                                   ▼
                                                         ┌─────────────────┐
                                                         │ Check if user   │
                                                         │ exists in DB    │
                                                         └────────┬────────┘
                                                                  │
                                          ┌─────────────────────┴─────────────┐
                                          │                                   │
                                          ▼                                   ▼
                                  ┌─────────────┐                     ┌─────────────┐
                                  │ NEW USER    │                     │ EXISTING    │
                                  │             │                     │ USER        │
                                  │ 1. Create   │                     │ 1. Get user │
                                  │    User     │                     │ 2. Get role │
                                  │ 2. Create   │                     │ 3. Get tenant│
                                  │    Tenant   │                     └──────┬──────┘
                                  │ 3. Create   │                            │
                                  │    Wallet   │                            │
                                  │    (550cr)  │                            │
                                  │ 4. Create   │                            │
                                  │    Membership                           │
                                  └──────┬──────┘                            │
                                         │                                   │
                                         └─────────────────┬─────────────────┘
                                                           │
                                                           ▼
                                                  ┌─────────────────┐
                                                  │ Generate JWT    │
                                                  │ Token           │
                                                  └────────┬────────┘
                                                           │
                                                           ▼
                                                  ┌─────────────────┐
                                                  │ Redirect to     │
                                                  │ Dashboard based │
                                                  │ on role         │
                                                  └─────────────────┘
```

### 6.2 JWT Token Structure

```json
{
  "sub": "user-uuid",
  "email": "user@example.com",
  "name": "John Doe",
  "role": "owner",
  "tenant_id": "tenant-uuid",
  "is_super_admin": false,
  "iat": 1710489600,
  "exp": 1710576000
}
```

### 6.3 Role-Based Access Control

| Resource | Super Admin | Owner | Admin | Crew |
|----------|-------------|-------|-------|------|
| **Platform Stats** | ✅ | ❌ | ❌ | ❌ |
| **All Tenants** | ✅ | ❌ | ❌ | ❌ |
| **Own Tenant** | ❌ | ✅ | ✅ | ❌ |
| **Events (CRUD)** | ❌ | ✅ | ✅ | ❌ |
| **Participants (CRUD)** | ❌ | ✅ | ✅ | ❌ |
| **Check-in** | ❌ | ✅ | ✅ | ✅ |
| **F&B Claim** | ❌ | ✅ | ✅ | ✅ |
| **Display Monitor** | ❌ | ✅ | ✅ | ✅ |
| **Crew Management** | ❌ | ✅ | ✅ | ❌ |
| **Credits** | ❌ | ✅ | ✅ | ❌ |
| **Reports** | ❌ | ✅ | ✅ | ❌ |

---

## 7. API Endpoints

### 7.1 Base URL

```
Development: http://localhost:3000/api/proxy?XTransformPort=3030
Production: https://api.eventify.id
```

### 7.2 Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/auth/google` | Google OAuth login |
| `POST` | `/auth/refresh` | Refresh JWT token |
| `POST` | `/auth/logout` | Logout user |
| `GET` | `/auth/me` | Get current user |

### 7.3 Super Admin Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/admin/stats` | Platform statistics |
| `GET` | `/admin/tenants` | List all tenants |
| `GET` | `/admin/tenants/:id` | Get tenant details |
| `PATCH` | `/admin/tenants/:id/approve` | Approve tenant |
| `PATCH` | `/admin/tenants/:id/suspend` | Suspend tenant |
| `GET` | `/admin/billing` | Platform billing overview |
| `GET` | `/admin/analytics` | Platform analytics |
| `GET` | `/admin/transactions` | All transactions |

### 7.4 Event Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/events` | List events (tenant-scoped) |
| `GET` | `/events/:id` | Get event details |
| `POST` | `/events` | Create event (50 credits) |
| `PUT` | `/events/:id` | Update event |
| `DELETE` | `/events/:id` | Delete event |
| `POST` | `/events/:id/duplicate` | Duplicate event |

### 7.5 Participant Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/participants` | List participants (pagination, filter) |
| `GET` | `/participants/stats` | Participant statistics |
| `GET` | `/participants/:id` | Get participant details |
| `POST` | `/participants` | Create participant |
| `POST` | `/participants/bulk` | Bulk import (skip duplicates) |
| `PUT` | `/participants/:id` | Update participant |
| `PATCH` | `/participants/:id/blacklist` | Blacklist participant |
| `DELETE` | `/participants/:id` | Delete participant |
| `DELETE` | `/participants/bulk` | Bulk delete |
| `GET` | `/participants/export/csv` | Export to CSV |
| `GET` | `/participants/export/pdf` | Export to PDF |
| `POST` | `/participants/:id/send-qr` | Send QR via Email/WA |
| `GET` | `/participants/:id/qr` | Get QR code image |

### 7.6 Check-in Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/checkin` | Process check-in (1 credit) |
| `POST` | `/checkin/validate` | Validate QR code |
| `GET` | `/checkin/recent` | Recent check-ins |
| `GET` | `/checkin/stats` | Check-in statistics |

### 7.7 F&B Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/fnb/settings` | Get F&B settings |
| `PUT` | `/fnb/settings` | Update F&B settings |
| `GET` | `/fnb/booths` | List booths |
| `POST` | `/fnb/booths` | Create booth |
| `PUT` | `/fnb/booths/:id` | Update booth |
| `DELETE` | `/fnb/booths/:id` | Delete booth |
| `GET` | `/fnb/menu` | List menu items |
| `POST` | `/fnb/menu` | Create menu item |
| `PUT` | `/fnb/menu/:id` | Update menu item |
| `DELETE` | `/fnb/menu/:id` | Delete menu item |
| `POST` | `/fnb/claim` | Process F&B claim (1 credit) |
| `GET` | `/fnb/claims` | List claims |
| `GET` | `/fnb/stats` | F&B statistics |

### 7.8 Display Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/display/queue` | Get display queue |
| `POST` | `/display/queue` | Add to queue |
| `PATCH` | `/display/queue/:id/displayed` | Mark as displayed |
| `DELETE` | `/display/queue/:id` | Remove from queue |

### 7.9 Credit Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/credits/balance` | Get credit balance |
| `GET` | `/credits/transactions` | List transactions |
| `POST` | `/credits/purchase` | Purchase credits (Midtrans) |
| `POST` | `/credits/callback` | Midtrans callback |

### 7.10 Crew Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/crew` | List crew members |
| `POST` | `/crew/invite` | Invite crew member |
| `PUT` | `/crew/:id` | Update crew member |
| `DELETE` | `/crew/:id` | Remove crew member |

### 7.11 Report Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/reports/overview` | Overview statistics |
| `GET` | `/reports/checkins` | Check-in report |
| `GET` | `/reports/claims` | F&B claims report |
| `GET` | `/reports/revenue` | Revenue report |

### 7.12 File Upload Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/upload` | Upload file (banner/photo) |
| `DELETE` | `/api/upload?url=<path>` | Delete uploaded file |

#### File Upload Configuration

```typescript
// Allowed file types
const ALLOWED_TYPES = {
  banner: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  photo: ['image/jpeg', 'image/png', 'image/webp'],
}

// Max file sizes
const MAX_SIZES = {
  banner: 5 * 1024 * 1024, // 5MB
  photo: 2 * 1024 * 1024,  // 2MB
}
```

#### Upload Request Example

```typescript
// Frontend usage
const formData = new FormData()
formData.append('file', file)
formData.append('type', 'banner') // or 'photo'

const response = await fetch('/api/upload', {
  method: 'POST',
  body: formData
})

const result = await response.json()
// result.data.url = '/uploads/banners/banner-1234567890-abc123.jpg'
```

#### File Storage Location

```
public/
└── uploads/
    ├── banners/     # Event banner images
    │   └── banner-{timestamp}-{random}.jpg
    └── photos/      # Participant photos
        └── photo-{timestamp}-{random}.jpg
```

#### Delete File Example

```typescript
const response = await fetch(`/api/upload?url=${encodeURIComponent('/uploads/banners/banner-xxx.jpg')}`, {
  method: 'DELETE'
})
```

---

## 8. Frontend Components

### 8.1 Component Hierarchy

```
App
├── SessionProvider
│   └── DashboardLayout
│       ├── DashboardSidebar
│       │   └── Menu Items
│       └── Main Content
│           ├── Header
│           ├── Page Content
│           │   ├── StatsCard
│           │   ├── DataTable
│           │   ├── Forms
│           │   └── Dialogs
│           └── Footer
```

### 8.2 Key Components

#### StatsCard
```tsx
interface StatsCardProps {
  title: string
  value: string | number
  description?: string
  icon: LucideIcon
  variant?: 'default' | 'gradient'
  gradientFrom?: string
  gradientTo?: string
}

// Usage
<StatsCard
  title="Total Peserta"
  value={250}
  icon={Users}
  variant="gradient"
  gradientFrom="from-blue-500"
  gradientTo="to-blue-600"
/>
```

#### DataTable
```tsx
interface DataTableProps<T> {
  data: T[]
  columns: ColumnDef<T>[]
  pagination?: {
    page: number
    pageSize: number
    total: number
  }
  onRowSelect?: (ids: string[]) => void
  onRowClick?: (row: T) => void
}
```

#### Dialog Components
```tsx
// Confirm Dialog
<AlertDialog open={open} onOpenChange={setOpen}>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Confirm Action</AlertDialogTitle>
      <AlertDialogDescription>Are you sure?</AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>Cancel</AlertDialogCancel>
      <AlertDialogAction>Confirm</AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>

// Form Dialog
<Dialog open={open} onOpenChange={setOpen}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Add Participant</DialogTitle>
      <DialogDescription>Fill in the details</DialogDescription>
    </DialogHeader>
    <form>...</form>
    <DialogFooter>
      <Button variant="outline">Cancel</Button>
      <Button>Save</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

### 8.3 shadcn/ui Components Used

| Component | File | Usage |
|-----------|------|-------|
| Button | `ui/button.tsx` | Actions, forms |
| Card | `ui/card.tsx` | Containers, stats |
| Table | `ui/table.tsx` | Data tables |
| Dialog | `ui/dialog.tsx` | Modals |
| DropdownMenu | `ui/dropdown-menu.tsx` | Actions menu |
| Select | `ui/select.tsx` | Dropdowns |
| Input | `ui/input.tsx` | Form fields |
| Badge | `ui/badge.tsx` | Status, labels |
| Progress | `ui/progress.tsx` | Progress bars |
| Checkbox | `ui/checkbox.tsx` | Selection |
| Switch | `ui/switch.tsx` | Toggle |
| Tabs | `ui/tabs.tsx` | Tab navigation |
| Toast | `ui/toast.tsx` | Notifications |
| ScrollArea | `ui/scroll-area.tsx` | Scrollable content |
| AlertDialog | `ui/alert-dialog.tsx` | Confirmations |

---

## 9. State Management

### 9.1 Store Structure (Zustand)

```typescript
// stores/auth-store.ts
interface AuthState {
  currentUser: CurrentUser | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  
  loginWithGoogle: (googleToken: string) => Promise<void>
  logout: () => void
  fetchCurrentUser: () => Promise<void>
  clearError: () => void
}

// stores/data-store.ts
interface DataState {
  events: Event[]
  participants: Participant[]
  checkins: Checkin[]
  claims: Claim[]
  users: User[]
  memberships: Membership[]
  creditTransactions: CreditTransaction[]
  
  // Actions
  addEvent: (event: Event) => void
  updateEvent: (id: string, data: Partial<Event>) => void
  deleteEvent: (id: string) => void
  
  addParticipant: (participant: Participant) => void
  updateParticipant: (id: string, data: Partial<Participant>) => void
  deleteParticipant: (id: string) => void
  
  // ... more actions
}

// stores/mock-store.ts (Demo Mode)
interface MockStore extends AuthState, DataState {
  demoLogin: (role: 'super_admin' | 'owner' | 'crew') => void
  
  // Computed hooks
  useTenantStats: () => Stats
  useTenantEvents: () => Event[]
  useTenantWallet: () => CreditWallet
}
```

### 9.2 Usage Examples

```tsx
// In component
import { useAuthStore, useDataStore } from '@/stores/mock-store'

function MyComponent() {
  const currentUser = useAuthStore(state => state.currentUser)
  const { events, addEvent } = useDataStore()
  const stats = useTenantStats()
  
  // ...
}
```

---

## 10. Workflows

### 10.1 Participant Management Workflow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    PARTICIPANT MANAGEMENT WORKFLOW                           │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────┐
│ EO Owner opens  │
│ Participants    │
│ page            │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                              │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐           │
│  │   VIEW     │  │   SEARCH   │  │   FILTER   │  │   SORT     │           │
│  │   List     │  │   by name/ │  │   by       │  │   by date/ │           │
│  │            │  │   email    │  │   status   │  │   name     │           │
│  └────────────┘  └────────────┘  └────────────┘  └────────────┘           │
│                                                                              │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐           │
│  │   ADD      │  │   IMPORT   │  │   EXPORT   │  │   BULK     │           │
│  │   Single   │  │   CSV/XLS  │  │   CSV/PDF  │  │   DELETE   │           │
│  └────────────┘  └────────────┘  └────────────┘  └────────────┘           │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           CRUD OPERATIONS                                    │
│                                                                              │
│  CREATE:                                                                     │
│  ┌────────────┐    ┌────────────┐    ┌────────────┐    ┌────────────┐      │
│  │ Fill Form  │───►│ Validate   │───►│ Generate   │───►│ Save to    │      │
│  │            │    │ Required   │    │ QR Code    │    │ Database   │      │
│  └────────────┘    └────────────┘    └────────────┘    └────────────┘      │
│                                                                              │
│  UPDATE:                                                                     │
│  ┌────────────┐    ┌────────────┐    ┌────────────┐                         │
│  │ Edit Form  │───►│ Validate   │───►│ Update DB  │                         │
│  └────────────┘    └────────────┘    └────────────┘                         │
│                                                                              │
│  DELETE:                                                                     │
│  ┌────────────┐    ┌────────────┐    ┌────────────┐                         │
│  │ Confirm    │───►│ Remove     │───►│ Refresh    │                         │
│  │ Dialog     │    │ from DB    │    │ List       │                         │
│  └────────────┘    └────────────┘    └────────────┘                         │
│                                                                              │
│  BLACKLIST:                                                                  │
│  ┌────────────┐    ┌────────────┐    ┌────────────┐                         │
│  │ Confirm    │───►│ Set        │───►│ Update     │                         │
│  │ Dialog     │    │ blacklist  │    │ Status     │                         │
│  └────────────┘    └────────────┘    └────────────┘                         │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 10.2 Check-in Workflow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         CHECK-IN WORKFLOW                                    │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────┐
│ Crew opens      │
│ Check-in page   │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         SELECT DESK                                          │
│                                                                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐                    │
│  │  Desk 1  │  │  Desk 2  │  │  Desk 3  │  │  Desk 4  │                    │
│  │  Main    │  │  Side    │  │  VIP     │  │  Express │                    │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘                    │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         SCAN METHOD                                          │
│                                                                              │
│  ┌───────────────────┐  ┌───────────────────┐  ┌───────────────────┐        │
│  │   CAMERA SCAN     │  │   UPLOAD IMAGE    │  │   MANUAL INPUT    │        │
│  │                   │  │                   │  │                   │        │
│  │  ┌─────────────┐  │  │  ┌─────────────┐  │  │  ┌─────────────┐  │        │
│  │  │             │  │  │  │   Drag &    │  │  │  │ HKI-2025-   │  │        │
│  │  │   Camera    │  │  │  │   Drop      │  │  │  │    XXXX     │  │        │
│  │  │   Preview   │  │  │  │   Zone      │  │  │  └─────────────┘  │        │
│  │  │             │  │  │  └─────────────┘  │  │                   │        │
│  │  └─────────────┘  │  │                   │  │  [CHECK IN]       │        │
│  │                   │  │  [Select File]    │  │                   │        │
│  └───────────────────┘  └───────────────────┘  └───────────────────┘        │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         VALIDATION                                           │
│                                                                              │
│  ┌─────────────────┐                                                        │
│  │ Decode QR Code  │                                                        │
│  └────────┬────────┘                                                        │
│           │                                                                 │
│           ▼                                                                 │
│  ┌─────────────────────────────────────────────────────────────────┐        │
│  │ CHECK DATABASE:                                                  │        │
│  │                                                                  │        │
│  │ 1. Participant exists? ─── No ──► ERROR: Not found              │        │
│  │ 2. Already checked in? ── Yes ──► WARNING: Duplicate            │        │
│  │ 3. Blacklisted? ───────── Yes ──► ERROR: Blacklisted            │        │
│  │ 4. Valid? ──────────────── Yes ──► SUCCESS: Check-in            │        │
│  │                                                                  │        │
│  └─────────────────────────────────────────────────────────────────┘        │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         SUCCESS RESULT                                       │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────┐        │
│  │                                                                  │        │
│  │   ┌───────┐                                                     │        │
│  │   │  JD   │  John Doe                                          │        │
│  │   └───────┘  Tech Corp                                         │        │
│  │              john@example.com                                   │        │
│  │                                                                  │        │
│  │   ┌──────────────────────────────────────────────────────┐      │        │
│  │   │ ✅ Check-in Berhasil!                                 │      │        │
│  │   │    Desk: 1 | Time: 10:30:45                          │      │        │
│  │   └──────────────────────────────────────────────────────┘      │        │
│  │                                                                  │        │
│  │   - Deduct 1 credit from tenant                                 │        │
│  │   - Add to display queue                                        │        │
│  │   - Log scan event                                              │        │
│  │                                                                  │        │
│  │   [Scan Peserta Lain]                                           │        │
│  │                                                                  │        │
│  └─────────────────────────────────────────────────────────────────┘        │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 10.3 F&B Claim Workflow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         F&B CLAIM WORKFLOW                                   │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────┐
│ Crew opens      │
│ Claim page      │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         STEP 1: SCAN PARTICIPANT                             │
│                                                                              │
│  Same as Check-in workflow (Camera/Upload/Manual)                           │
│                                                                              │
│  Result: Show participant info + F&B claims status                          │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────┐        │
│  │   ┌───────┐                                                     │        │
│  │   │  JD   │  John Doe                                          │        │
│  │   └───────┘  Tech Corp                                         │        │
│  │                                                                  │        │
│  │   Food Claims: 2/4 remaining     Drink Claims: 1/2 remaining   │        │
│  │                                                                  │        │
│  └─────────────────────────────────────────────────────────────────┘        │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         STEP 2: SELECT BOOTH                                 │
│                                                                              │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐                │
│  │   🍽️ Food      │  │   🍽️ Food      │  │   🥤 Drink     │                │
│  │   Booth 1      │  │   Booth 2      │  │   Station      │                │
│  │                │  │                │  │                │                │
│  │   2 items      │  │   2 items      │  │   2 items      │                │
│  └────────────────┘  └────────────────┘  └────────────────┘                │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         STEP 3: SELECT MENU ITEM                             │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────┐        │
│  │  Nasi Box A                              Stock: 45  [Select]    │        │
│  │  Nasi + Ayam Goreng                                            │        │
│  │  ────────────────────────────────────────────────────────────  │        │
│  │  Nasi Box B                              Stock: 30  [Select]    │        │
│  │  Nasi + Rendang                                                │        │
│  │  ────────────────────────────────────────────────────────────  │        │
│  │  Snack Box                               Stock: 80  [Select]    │        │
│  │  Berbagai snack                                                 │        │
│  └─────────────────────────────────────────────────────────────────┘        │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         STEP 4: PROCESS CLAIM                                │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────┐        │
│  │                                                                  │        │
│  │  Validation:                                                    │        │
│  │  1. Participant has remaining claims?                           │        │
│  │  2. Menu item has stock?                                        │        │
│  │  3. Booth type matches menu type?                               │        │
│  │                                                                  │        │
│  │  On Success:                                                    │        │
│  │  - Increment participant's claim count                          │        │
│  │  - Decrement menu item stock                                    │        │
│  │  - Deduct 1 credit from tenant                                  │        │
│  │  - Log claim event                                              │        │
│  │                                                                  │        │
│  │  ┌──────────────────────────────────────────────────────┐       │        │
│  │  │ ✅ Claim Berhasil!                                    │       │        │
│  │  │    Item: Nasi Box A                                   │       │        │
│  │  │    Remaining: Food 1/4 | Drink 1/2                   │       │        │
│  │  └──────────────────────────────────────────────────────┘       │        │
│  │                                                                  │        │
│  │  [Scan Peserta Lain]                                            │        │
│  │                                                                  │        │
│  └─────────────────────────────────────────────────────────────────┘        │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 10.4 Event Management Workflow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         EVENT MANAGEMENT WORKFLOW                            │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────┐
│ EO Owner opens  │
│ Events page     │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              EVENTS LIST VIEW                                │
│                                                                              │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐           │
│  │   SEARCH   │  │   FILTER   │  │   VIEW     │  │   CREATE   │           │
│  │   by name  │  │   status   │  │   Grid     │  │   NEW      │           │
│  └────────────┘  └────────────┘  └────────────┘  └────────────┘           │
│                                                                              │
│  Event Cards:                                                                │
│  ┌─────────────────────────────────────────────────────────────────┐        │
│  │ [Banner Image]                                                   │        │
│  │ Category Badge | Event Name                                      │        │
│  │ 📅 Date | 📍 Location                                            │        │
│  │ 👥 Participants: X / Capacity                                    │        │
│  │ [Edit] [Duplicate] [Delete]                                      │        │
│  └─────────────────────────────────────────────────────────────────┘        │
│                                                                              │
│  Pagination: 6 events per page                                              │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         CREATE EVENT WIZARD (6 Steps)                        │
│                                                                              │
│  Step 1: BASIC INFO                                                         │
│  ┌────────────────────────────────────────────────────────────────┐         │
│  │ - Event Name * (required)                                       │         │
│  │ - Tagline / Title                                               │         │
│  │ - Category * (Technology, Business, Music, etc.)               │         │
│  │ - Description                                                   │         │
│  │ - Banner Image (Upload or URL)                                  │         │
│  │   • Max file size: 5MB                                          │         │
│  │   • Allowed types: JPEG, PNG, WebP, GIF                        │         │
│  │   • Stored in: /public/uploads/banners/                        │         │
│  └────────────────────────────────────────────────────────────────┘         │
│                                                                              │
│  Step 2: DATE & LOCATION                                                    │
│  ┌────────────────────────────────────────────────────────────────┐         │
│  │ - Start Date & Time * (required)                                │         │
│  │ - End Date & Time                                               │         │
│  │ - Location * (required)                                         │         │
│  └────────────────────────────────────────────────────────────────┘         │
│                                                                              │
│  Step 3: TICKETS & CAPACITY                                                 │
│  ┌────────────────────────────────────────────────────────────────┐         │
│  │ - Maximum Capacity * (required)                                 │         │
│  │ - Number of Check-in Desks                                      │         │
│  │ - Note: Ticket types configured after event creation            │         │
│  └────────────────────────────────────────────────────────────────┘         │
│                                                                              │
│  Step 4: DISPLAY SETTINGS                                                   │
│  ┌────────────────────────────────────────────────────────────────┐         │
│  │ - Welcome Message (default: "Selamat Datang!")                  │         │
│  │ - Display Duration (default: 5 seconds)                         │         │
│  │ - Data Storage Days (default: 15 days)                          │         │
│  │ - Sound Effects: Enable/Disable                                 │         │
│  └────────────────────────────────────────────────────────────────┘         │
│                                                                              │
│  Step 5: F&B SETTINGS                                                       │
│  ┌────────────────────────────────────────────────────────────────┐         │
│  │ - Max Food Claims per Participant (default: 4)                  │         │
│  │ - Max Drink Claims per Participant (default: 2)                 │         │
│  │ - Note: Booths & Menu configured in F&B Settings page           │         │
│  └────────────────────────────────────────────────────────────────┘         │
│                                                                              │
│  Step 6: PREVIEW                                                            │
│  ┌────────────────────────────────────────────────────────────────┐         │
│  │ - Review all settings                                           │         │
│  │ - [Save as Draft] or [Publish Event]                            │         │
│  └────────────────────────────────────────────────────────────────┘         │
│                                                                              │
│  Credit Check: Creating event costs 50 credits                              │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         DELETE EVENT CONFIRMATION                            │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────┐        │
│  │ ⚠️ Delete Event                                                  │        │
│  │                                                                  │        │
│  │ Are you sure you want to delete "Event Name"?                   │        │
│  │ This action cannot be undone. All participants, check-ins,      │        │
│  │ and F&B claims associated with this event will also be deleted. │        │
│  │                                                                  │        │
│  │ [Cancel] [Delete Event]                                          │        │
│  └─────────────────────────────────────────────────────────────────┘        │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 10.5 Banner Upload Workflow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         BANNER UPLOAD WORKFLOW                               │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────┐
│ User clicks     │
│ Upload button   │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         FILE SELECTION                                       │
│                                                                              │
│  - Native file picker opens                                                 │
│  - Accept filters: image/jpeg, image/png, image/webp, image/gif            │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         CLIENT-SIDE VALIDATION                               │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────┐        │
│  │ Check 1: File type                                               │        │
│  │   - Allowed: JPEG, PNG, WebP, GIF                                │        │
│  │   - Rejected: SVG, BMP, TIFF, etc.                               │        │
│  │                                                                  │        │
│  │ Check 2: File size                                               │        │
│  │   - Banner: Max 5MB                                              │        │
│  │   - Photo: Max 2MB                                               │        │
│  │                                                                  │        │
│  │ If invalid → Show error toast, reject file                       │        │
│  └─────────────────────────────────────────────────────────────────┘        │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         UPLOAD TO SERVER                                     │
│                                                                              │
│  POST /api/upload                                                           │
│  Content-Type: multipart/form-data                                          │
│                                                                              │
│  FormData:                                                                  │
│  - file: [binary]                                                           │
│  - type: "banner" | "photo"                                                 │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         SERVER PROCESSING                                    │
│                                                                              │
│  1. Validate file type again (security)                                     │
│  2. Validate file size again (security)                                     │
│  3. Generate unique filename: banner-{timestamp}-{random}.{ext}            │
│  4. Create directory if not exists: /public/uploads/banners/               │
│  5. Write file to disk                                                      │
│  6. Return public URL: /uploads/banners/banner-xxx.jpg                      │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         RESPONSE                                             │
│                                                                              │
│  {                                                                          │
│    "success": true,                                                         │
│    "data": {                                                                │
│      "url": "/uploads/banners/banner-1234567890-abc123.jpg",               │
│      "filename": "banner-1234567890-abc123.jpg",                           │
│      "size": 102400,                                                        │
│      "type": "image/jpeg"                                                   │
│    }                                                                        │
│  }                                                                          │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         UI UPDATE                                            │
│                                                                              │
│  - Show success toast                                                       │
│  - Display banner preview                                                   │
│  - Enable "Remove" button on hover                                          │
│  - Store URL in form data                                                   │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 11. Setup & Installation

### 11.1 Prerequisites

- Node.js 18+ or Bun
- Go 1.21+
- PostgreSQL (Supabase)
- Google OAuth credentials

### 11.2 Environment Variables

```bash
# .env.local

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx
DATABASE_URL=postgresql://...

# Google OAuth
GOOGLE_CLIENT_ID=xxx
GOOGLE_CLIENT_SECRET=xxx

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRY=24h

# Midtrans
MIDTRANS_SERVER_KEY=xxx
MIDTRANS_CLIENT_KEY=xxx
MIDTRANS_IS_PRODUCTION=false

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 11.3 Installation

```bash
# Clone repository
git clone https://github.com/bukdanaws-commits/f-BSaas.git
cd f-BSaas

# Install frontend dependencies
bun install

# Run database migrations
bun run db:push

# Start development server
bun run dev

# In another terminal, start Go backend
cd backend
go mod tidy
go run cmd/main.go
```

### 11.4 Database Setup

```bash
# Run Supabase SQL scripts
# 1. Create tables: supabase/schema.sql
# 2. Fix RLS: supabase/fix-rls-and-tables.sql

# Or use Prisma (if configured)
bun run db:push
```

---

## 12. Development Guidelines

### 12.1 Code Style

- **TypeScript**: Strict mode enabled
- **ESLint**: Run `bun run lint` before commit
- **Formatting**: Use Prettier
- **Imports**: Use `@/` alias for src imports

### 12.2 Component Guidelines

```tsx
// Component structure
'use client'  // If client-side

import { useState } from 'react'
import { ComponentName } from '@/components/ui/component'
import { useStore } from '@/stores/store-name'

interface ComponentProps {
  // Props with JSDoc comments
}

export default function Component({ prop }: ComponentProps) {
  // 1. Hooks
  const [state, setState] = useState()
  const store = useStore()
  
  // 2. Computed values
  const computed = useMemo(() => {}, [])
  
  // 3. Callbacks
  const handleClick = useCallback(() => {}, [])
  
  // 4. Effects
  useEffect(() => {}, [])
  
  // 5. Render
  return (
    <div>
      {/* Content */}
    </div>
  )
}
```

### 12.3 API Client Usage

```tsx
import { api } from '@/lib/api-client'

// GET request
const response = await api.get('/participants', {
  page: 1,
  limit: 10,
  status: 'checked_in'
})

// POST request
const newParticipant = await api.post('/participants', {
  name: 'John Doe',
  email: 'john@example.com'
})

// PUT request
const updated = await api.put('/participants/123', {
  name: 'Jane Doe'
})

// DELETE request
await api.delete('/participants/123')
```

### 12.4 Error Handling

```tsx
import { useToast } from '@/hooks/use-toast'

function MyComponent() {
  const { toast } = useToast()
  
  const handleSubmit = async () => {
    try {
      await api.post('/endpoint', data)
      toast({
        title: 'Berhasil',
        description: 'Data berhasil disimpan'
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Terjadi kesalahan',
        variant: 'destructive'
      })
    }
  }
}
```

### 12.5 Git Commit Convention

```
feat: Add new feature
fix: Fix bug
docs: Update documentation
style: Code formatting
refactor: Code refactoring
test: Add tests
chore: Maintenance tasks

Examples:
feat(participants): Add bulk delete functionality
fix(checkin): Fix QR scanner not working on iOS
docs(api): Update endpoint documentation
```

---

## 13. Deployment

### 13.1 Production Build

```bash
# Frontend
bun run build

# Backend
cd backend
go build -o server cmd/main.go
```

### 13.2 Docker Deployment

```dockerfile
# Frontend Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
CMD ["npm", "start"]

# Backend Dockerfile
FROM golang:1.21-alpine
WORKDIR /app
COPY go.* ./
RUN go mod download
COPY . .
RUN go build -o server cmd/main.go
CMD ["./server"]
```

### 13.3 Environment Checklist

- [ ] Supabase production database
- [ ] Google OAuth production credentials
- [ ] Midtrans production keys
- [ ] JWT secret (secure random string)
- [ ] CORS configured
- [ ] Rate limiting enabled
- [ ] Error logging (Sentry, etc.)
- [ ] SSL certificates
- [ ] CDN for static assets

---

## 📞 Support

For questions or issues, contact:
- **Developer**: Goopps.id Team
- **Email**: dev@goopps.id
- **Documentation**: This file

---

*Last Updated: March 2024*
*Version: 1.0.0*
