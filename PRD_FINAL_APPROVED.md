# 📋 PRD FINAL - SaaS Event Management System (APPROVED)

## ✅ STATUS: APPROVED & READY TO IMPLEMENT

---

## 🎯 RINGKASAN JAWABAN USER

| # | Pertanyaan | Jawaban Final |
|---|------------|---------------|
| 1 | Super Admin manual atau ada UI? | ✅ **Ada UI khusus** - Sidebar sama dengan EO, beda menu saja |
| 2 | EO Owner bisa invite crew via email? | ✅ **Ya** - Bisa masukkan email dan password |
| 3 | Crew di-assign ke event tertentu? | ✅ **Hanya event yang di-setup EO tersebut** |
| 4 | F&B limits per tipe tiket atau per participant? | ✅ **Per participant** |
| 5 | Harga tiket wajib atau bisa gratis? | ✅ **Opsional** - Jika berbayar baru ada harga |

---

## 🏗️ ARSITEKTUR FINAL

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    SAAS EVENT MANAGEMENT SYSTEM                              │
│                         (Platform Multi-Tenant)                              │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                              3 DASHBOARD                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌────────────────────┐  ┌────────────────────┐  ┌────────────────────┐    │
│  │   SUPER ADMIN      │  │    EO OWNER        │  │      CREW          │    │
│  │   (Pemilik SaaS)   │  │    (Pemilik EO)    │  │    (Panitia)       │    │
│  ├────────────────────┤  ├────────────────────┤  ├────────────────────┤    │
│  │                    │  │                    │  │                    │    │
│  │ Menu:              │  │ Menu:              │  │ Menu:              │    │
│  │ • Dashboard        │  │ • Dashboard        │  │ • Check-in         │    │
│  │ • Kelola EO        │  │ • My Events        │  │ • F&B Claim        │    │
│  │ • Billing          │  │ • Participants     │  │                    │    │
│  │ • Analytics        │  │ • F&B Settings     │  │                    │    │
│  │ • Settings         │  │ • Crew             │  │                    │    │
│  │                    │  │ • Credit/Billing   │  │                    │    │
│  │                    │  │ • Reports          │  │                    │    │
│  │                    │  │                    │  │                    │    │
│  │ ⚠️ Sidebar SAMA    │  │ ⚠️ Sidebar SAMA    │  │ ⚠️ Sidebar SAMA    │    │
│  │    dengan EO       │  │    dengan Super    │  │    dengan EO       │    │
│  │    (beda menu)     │  │    Admin           │  │                    │    │
│  │                    │  │                    │  │                    │    │
│  └────────────────────┘  └────────────────────┘  └────────────────────┘    │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 🔐 LOGIN FLOW (Google OAuth Only)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           LOGIN FLOW                                         │
└─────────────────────────────────────────────────────────────────────────────┘

User buka aplikasi
         │
         ▼
┌─────────────────────┐
│  LOGIN PAGE         │
│                     │
│  [🔵 Sign in with   │
│      Google]        │
│                     │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Google OAuth        │
│ - Select account    │
│ - Grant permission  │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────────────────────────────────────────────────┐
│                    CHECK USER ROLE                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ USER BARU?                                               │   │
│  │                                                          │   │
│  │ → Create User record                                     │   │
│  │ → Create Tenant (EO)                                     │   │
│  │ → Create Wallet (500 credits + 50 bonus)                 │   │
│  │ → Create Membership (role: owner)                        │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ REDIRECT BERDASARKAN ROLE:                               │   │
│  │                                                          │   │
│  │ if (user.isSuperAdmin) → SUPER ADMIN DASHBOARD           │   │
│  │ if (user.role === 'owner') → EO OWNER DASHBOARD          │   │
│  │ if (user.role === 'crew') → CREW DASHBOARD               │   │
│  │                                                          │   │
│  │ ⚠️ Crew hanya bisa akses event dari EO yang invite       │   │
│  │                                                          │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 💰 CREDIT SYSTEM

### A. Welcome Bonus

| User Baru | Credits |
|-----------|---------|
| Balance | 500 credits |
| Bonus | 50 credits |
| **Total** | **550 credits** |

### B. Credit Usage

| Aktivitas | Credit Cost |
|-----------|-------------|
| Create Event | 50 credits |
| Check-in peserta | 1 credit |
| F&B Claim | 1 credit |
| AI Photo Generation | 2 credits |

### C. Top-up Packages (Midtrans)

| Package | Credits | Price | Bonus |
|---------|---------|-------|-------|
| Starter | 500 | Rp 50.000 | +50 |
| Growth | 2.500 | Rp 225.000 | +250 |
| Business | 5.000 | Rp 400.000 | +500 |
| Enterprise | 25.000 | Rp 1.750.000 | +2.500 |

---

## 📝 EVENT SETUP WIZARD (5 SEGMENTS)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        EVENT SETUP WIZARD                                    │
└─────────────────────────────────────────────────────────────────────────────┘

Progress: ████████████████████ 100%

┌─────────┐   ┌─────────┐   ┌─────────┐   ┌─────────┐   ┌─────────┐
│   1     │   │   2     │   │   3     │   │   4     │   │   5     │
│ EVENT   │──▶│  F&B    │──▶│ TICKET  │──▶│ DISPLAY │──▶│ REVIEW  │
│  INFO   │   │ SETTING │   │ TYPES   │   │SETTING  │   │ & SAVE  │
└─────────┘   └─────────┘   └─────────┘   └─────────┘   └─────────┘
```

### SEGMENT 1: EVENT INFO

| Field | Type | Required |
|-------|------|----------|
| Banner Image | Image Upload | Opsional |
| Nama Event | Text | ✅ Wajib |
| Judul/Tagline | Text | Opsional |
| Deskripsi | Textarea | Opsional |
| Tanggal Mulai | DateTime | ✅ Wajib |
| Tanggal Selesai | DateTime | ✅ Wajib |
| Lokasi | Text | ✅ Wajib |
| Kategori | Select | ✅ Wajib |
| Kapasitas | Number | ✅ Wajib |

### SEGMENT 2: F&B SETTINGS

| Field | Default | Configurable |
|-------|---------|--------------|
| Aktifkan Makanan | Ya | ✅ |
| Max Makanan per Peserta | 4 | ✅ |
| Aktifkan Minuman | Ya | ✅ |
| Max Minuman per Peserta | 2 | ✅ |
| Multi Booth | Ya | ✅ |

**F&B Limits: PER PARTICIPANT** (sama untuk semua peserta)

**Menu Items:**
- Tambah makanan (nama, stok)
- Tambah minuman (nama, stok)
- Setup booth (nama, tipe, menu tersedia)

### SEGMENT 3: TICKET TYPES

| Field | Keterangan |
|-------|------------|
| Nama Tipe | VIP, Regular, Student, dll |
| Harga | **Opsional** - Kosongkan jika gratis |
| Kuota | Jumlah tiket tersedia |
| F&B Claim | **Diambil dari Segment 2** (per participant) |

### SEGMENT 4: DISPLAY SETTINGS

| Field | Default |
|-------|---------|
| Welcome Message | "Selamat Datang!" |
| Durasi Tampil | 5 detik |
| Foto Ditampilkan | AI jika ada, kalau tidak original |
| Sound Effect | Tidak |

### SEGMENT 5: REVIEW & SAVE

- Summary semua setting
- Credit estimation
- Save event

---

## 👥 CREW MANAGEMENT

### Invite Crew

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        INVITE CREW / PANITIA                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                                                                      │    │
│  │  Nama Crew: [____________________________]                          │    │
│  │                                                                      │    │
│  │  Email:     [____________________________]                          │    │
│  │                                                                      │    │
│  │  Password:  [____________________________]                          │    │
│  │                                                                      │    │
│  │  Role:      [▼ Crew]                                                │    │
│  │             - Crew (Check-in & Claim)                               │    │
│  │             - Admin (Full access event)                             │    │
│  │                                                                      │    │
│  │  ⚠️ Crew hanya bisa akses event dari EO ini                         │    │
│  │                                                                      │    │
│  │              [CANCEL]              [INVITE CREW]                     │    │
│  │                                                                      │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 🗄️ DATABASE SCHEMA (FINAL)

```prisma
// =====================================
// USERS & AUTHENTICATION
// =====================================
model User {
  id          String   @id @default(cuid())
  email       String   @unique
  name        String?
  avatarUrl   String?
  googleId    String?  @unique
  isSuperAdmin Boolean @default(false)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  ownedTenants   Tenant[]      @relation("TenantOwner")
  memberships    Membership[]
  operatedCheckins Checkin[]
  
  @@map("users")
}

// =====================================
// TENANT (EO - Event Organizer)
// =====================================
model Tenant {
  id         String    @id @default(cuid())
  name       String
  slug       String?   @unique
  ownerId    String?
  status     String    @default("pending") // pending, active, suspended
  verifiedAt DateTime?
  phone      String?
  address    String?
  createdAt  DateTime  @default(now())
  updatedAt  DateTime  @updatedAt
  
  owner              User                @relation("TenantOwner", fields: [ownerId], references: [id])
  memberships        Membership[]
  creditWallet       CreditWallet?
  events             Event[]
  participants       Participant[]
  scanLogs           ScanLog[]
  creditTransactions CreditTransaction[]
  
  @@map("tenants")
}

// =====================================
// MEMBERSHIP (User-Tenant Relationship)
// =====================================
model Membership {
  id        String   @id @default(cuid())
  userId    String
  tenantId  String
  role      String   @default("crew") // owner, admin, crew
  createdAt DateTime @default(now())
  
  user   User   @relation(fields: [userId], references: [id])
  tenant Tenant @relation(fields: [tenantId], references: [id])
  
  @@unique([userId, tenantId])
  @@map("memberships")
}

// =====================================
// CREDIT SYSTEM
// =====================================
model CreditWallet {
  id           String   @id @default(cuid())
  tenantId     String   @unique
  balance      Int      @default(0)
  bonusBalance Int      @default(0)
  updatedAt    DateTime @updatedAt
  
  tenant       Tenant             @relation(fields: [tenantId], references: [id])
  transactions CreditTransaction[]
  
  @@map("credit_wallets")
}

model CreditTransaction {
  id            String   @id @default(cuid())
  tenantId      String
  type          String   // purchase, usage, bonus, refund
  amount        Int
  referenceType String?
  referenceId   String?
  description   String?
  createdAt     DateTime @default(now())
  
  tenant Tenant @relation(fields: [tenantId], references: [id])
  
  @@map("credit_transactions")
}

// =====================================
// EVENT
// =====================================
model Event {
  id             String    @id @default(cuid())
  tenantId       String
  name           String
  title          String?
  description    String?
  bannerUrl      String?
  startDate      DateTime?
  endDate        DateTime?
  location       String?
  category       String?
  capacity       Int       @default(0)
  
  // Display Settings
  welcomeMessage String?   @default("Selamat Datang!")
  displayDuration Int      @default(5)
  enableSound    Boolean   @default(false)
  checkInDesks   Int       @default(4)
  
  // Storage
  storageDays    Int       @default(15)
  
  // Status
  status         String    @default("draft") // draft, active, completed
  
  createdAt      DateTime  @default(now())
  updatedAt      DateTime  @updatedAt
  
  tenant        Tenant[]          @relation(fields: [tenantId], references: [id])
  ticketTypes   TicketType[]
  participants  Participant[]
  checkins      Checkin[]
  booths        Booth[]
  menuCategories MenuCategory[]
  menuItems     MenuItem[]
  claims        Claim[]
  scanLogs      ScanLog[]
  displayQueue  DisplayQueue[]
  
  @@map("events")
}

// =====================================
// TICKET TYPE
// =====================================
model TicketType {
  id        String  @id @default(cuid())
  eventId   String
  name      String  // VIP, Regular, Student
  price     Int     @default(0) // Opsional - 0 = gratis
  quota     Int     @default(0)
  features  Json?   // Prioritas check-in, reserved seating, etc.
  
  event        Event        @relation(fields: [eventId], references: [id])
  participants Participant[]
  
  @@map("ticket_types")
}

// =====================================
// PARTICIPANT
// =====================================
model Participant {
  id        String   @id @default(cuid())
  tenantId  String
  eventId   String
  
  // Personal Info
  name      String
  email     String
  phone     String?
  
  // Ticket
  ticketTypeId String?
  ticketType   TicketType? @relation(fields: [ticketTypeId], references: [id])
  
  // QR Code
  qrCode      String  @unique
  
  // Photo & AI
  originalPhotoUrl String?
  aiPhotoUrl       String?
  bio              String?
  
  // Check-in
  isCheckedIn  Boolean   @default(false)
  checkedInAt  DateTime?
  checkinCount Int       @default(0)
  
  // F&B Claims (per participant - sama untuk semua)
  foodClaims   Int       @default(0)
  drinkClaims  Int       @default(0)
  maxFoodClaims Int      @default(4)  // Default dari event
  maxDrinkClaims Int     @default(2)  // Default dari event
  
  // Status
  isActive      Boolean  @default(true)
  isBlacklisted Boolean  @default(false)
  
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt
  
  tenant   Tenant      @relation(fields: [tenantId], references: [id])
  event    Event       @relation(fields: [eventId], references: [id])
  checkins Checkin[]
  claims   Claim[]
  
  @@unique([eventId, email])
  @@map("participants")
}

// =====================================
// CHECKIN
// =====================================
model Checkin {
  id            String   @id @default(cuid())
  eventId       String
  participantId String   @unique
  operatorId    String?
  deskNumber    Int      @default(1)
  checkedInAt   DateTime @default(now())
  
  event       Event       @relation(fields: [eventId], references: [id])
  participant Participant @relation(fields: [participantId], references: [id])
  
  @@map("checkins")
}

// =====================================
// F&B - BOOTH
// =====================================
model Booth {
  id          String  @id @default(cuid())
  eventId     String
  name        String
  type        String  // food, drink, both
  
  event  Event   @relation(fields: [eventId], references: [id])
  claims Claim[]
  
  @@map("booths")
}

// =====================================
// F&B - MENU
// =====================================
model MenuCategory {
  id      String @id @default(cuid())
  eventId String
  name    String
  type    String // food, drink
  
  event     Event      @relation(fields: [eventId], references: [id])
  menuItems MenuItem[]
  
  @@map("menu_categories")
}

model MenuItem {
  id         String  @id @default(cuid())
  eventId    String
  categoryId String?
  name       String
  stock      Int     @default(0)
  
  event    Event         @relation(fields: [eventId], references: [id])
  category MenuCategory? @relation(fields: [categoryId], references: [id])
  claims   Claim[]
  
  @@map("menu_items")
}

// =====================================
// F&B - CLAIM
// =====================================
model Claim {
  id            String   @id @default(cuid())
  eventId       String
  participantId String
  menuItemId    String
  boothId       String?
  claimedAt     DateTime @default(now())
  
  event       Event       @relation(fields: [eventId], references: [id])
  participant Participant @relation(fields: [participantId], references: [id])
  menuItem    MenuItem    @relation(fields: [menuItemId], references: [id])
  booth       Booth?      @relation(fields: [boothId], references: [id])
  
  @@map("claims")
}

// =====================================
// DISPLAY QUEUE
// =====================================
model DisplayQueue {
  id            String   @id @default(cuid())
  eventId       String
  participantId String?
  name          String
  photoUrl      String?
  isDisplayed   Boolean  @default(false)
  createdAt     DateTime @default(now())
  
  event Event @relation(fields: [eventId], references: [id])
  
  @@map("display_queue")
}

// =====================================
// SCAN LOG
// =====================================
model ScanLog {
  id            String    @id @default(cuid())
  tenantId      String
  eventId       String?
  participantId String?
  type          String?   // checkin, claim
  result        String?   // success, failed, duplicate
  device        String?
  createdAt     DateTime  @default(now())
  
  tenant      Tenant?      @relation(fields: [tenantId], references: [id])
  event       Event?       @relation(fields: [eventId], references: [id])
  participant Participant? @relation(fields: [participantId], references: [id])
  
  @@map("scan_logs")
}
```

---

## 🚀 IMPLEMENTATION PLAN

### Phase 1: Foundation
1. Database Schema (Prisma)
2. Authentication (Google OAuth)
3. User & Tenant Creation Flow
4. Credit Wallet System

### Phase 2: Super Admin Dashboard
1. Dashboard Layout
2. EO/Tenant Management
3. Billing Overview
4. Platform Analytics

### Phase 3: EO Owner Dashboard
1. Dashboard Layout
2. Event Setup Wizard (5 Segments)
3. Crew Management
4. Credit & Billing (Midtrans)

### Phase 4: Crew Dashboard
1. Check-in Scanner
2. F&B Claim Scanner
3. Real-time Stats

### Phase 5: Public Pages
1. Landing Page
2. Registration Form
3. Ticket Download

### Phase 6: Display & Real-time
1. Display Monitor
2. WebSocket Updates
3. AI Photo Generation

---

## ✅ READY TO IMPLEMENT

**PRD ini sudah APPROVED dan siap untuk implementasi!**

Semua requirement sudah jelas:
- ✅ 3 Dashboard (Super Admin, EO Owner, Crew)
- ✅ Login Google OAuth Only
- ✅ Credit System dengan Midtrans
- ✅ Event Setup 5 Segments
- ✅ F&B Configurable (4 makanan, 2 minuman per participant)
- ✅ Multi-tenant (banyak EO)
- ✅ Crew management via email & password

---

*Document Version: Final*
*Status: APPROVED*
*Last Updated: 2024*
