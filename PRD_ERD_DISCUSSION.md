# 📋 PRD & ERD - Sistem yang Sudah Ada (PTHAKI)

## 🔍 ANALISA SISTEM YANG SUDAH DIBUAT

Berdasarkan repository: `https://github.com/bukdanaws-commits/pthaki`

---

## 1. 📊 ARSITEKTUR SISTEM YANG ADA

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      SISTEM YANG SUDAH DIBUAT                                │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                           FRONTEND (Next.js)                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   PUBLIC PAGES                    │   PROTECTED PAGES                        │
│   ────────────                    │   ───────────────                        │
│   • Landing Page                  │   • Admin Dashboard                      │
│   • Participant Registration      │   • Panitia Dashboard                    │
│   • Ticket View                   │   • Scanner Operations                   │
│                                   │   • Display Monitor                      │
│                                   │   • Reports View                         │
│                                                                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                           API ROUTES                                         │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   /api/auth/*          - Authentication (login, logout, session)            │
│   /api/checkin         - Check-in operations                                │
│   /api/claim           - Food/drink claims                                  │
│   /api/participants/*  - Participant CRUD                                   │
│   /api/booths          - Booth management                                   │
│   /api/menu            - Menu items                                         │
│   /api/stats           - Dashboard statistics                               │
│   /api/display/*       - Display queue operations                           │
│   /api/landing/*       - Public landing data                                │
│                                                                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                           DATABASE                                           │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   Supabase (PostgreSQL) dengan Prisma-like ORM wrapper                      │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. 👥 USER ROLES YANG ADA

| Role | Akses | Fitur |
|------|-------|-------|
| **Admin** | Full access | Semua fitur + user management + event config |
| **Panitia** | Scanner only | Check-in scanner + Claim scanner |
| **Participant** | Public | Registration + View ticket |

---

## 3. 🗄️ ERD (ENTITY RELATIONSHIP DIAGRAM) YANG ADA

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           DATABASE SCHEMA                                    │
└─────────────────────────────────────────────────────────────────────────────┘

┌──────────────────┐       ┌──────────────────┐
│    AdminUser     │       │      Event       │
├──────────────────┤       ├──────────────────┤
│ id               │       │ id               │
│ email            │       │ name             │
│ password (hash)  │       │ date             │
│ role             │       │ location         │
│ assignedType     │       │ branding colors  │
│ assignedId       │       │ social links     │
│ createdAt        │       │ checkInDesks (4) │
└──────────────────┘       │ announcements    │
                           │ schedules        │
                           │ sponsors         │
                           └────────┬─────────┘
                                    │
                                    │ 1:N
                                    ▼
┌──────────────────┐       ┌──────────────────┐
│   Participant    │       │    CheckIn       │
├──────────────────┤       ├──────────────────┤
│ id               │◄──────│ id               │
│ eventId          │──────►│ participantId    │
│ name             │       │ deskNumber (1-4) │
│ email            │       │ checkedInAt      │
│ phone            │       └──────────────────┘
│ company          │
│ qrCode           │       ┌──────────────────┐
│ isCheckedIn      │       │  DisplayQueue    │
│ checkedInAt      │       ├──────────────────┤
│ foodClaims       │       │ id               │
│ drinkClaims      │       │ participantId    │
│ photoUrl         │       │ name             │
│ aiAvatarUrl      │       │ company          │
│ ticketType       │       │ photoUrl         │
│ createdAt        │       │ isDisplayed      │
└────────┬─────────┘       └──────────────────┘
         │
         │ 1:N
         ▼
┌──────────────────┐       ┌──────────────────┐
│     Claim        │       │    MenuItem      │
├──────────────────┤       ├──────────────────┤
│ id               │       │ id               │
│ participantId    │       │ eventId          │
│ menuItemId       │──────►│ categoryId       │
│ boothId          │       │ name             │
│ claimedAt        │       │ type (food/drink)│
└──────────────────┘       │ stock            │
                           └────────┬─────────┘
                                    │
         ┌──────────────────────────┤
         │                          │
         ▼                          ▼
┌──────────────────┐       ┌──────────────────┐
│   MenuCategory   │       │      Booth       │
├──────────────────┤       ├──────────────────┤
│ id               │       │ id               │
│ eventId          │       │ eventId          │
│ name             │       │ name             │
│ type (food/drink)│       │ type (food/drink)│
└──────────────────┘       └──────────────────┘


┌──────────────────┐       ┌──────────────────┐
│    ScanLog       │       │   EventStats     │
├──────────────────┤       ├──────────────────┤
│ id               │       │ id               │
│ type (checkin/   │       │ eventId          │
│      claim)      │       │ totalCheckIns    │
│ participantId    │       │ totalClaims      │
│ result           │       │ updatedAt        │
│ device           │       └──────────────────┘
│ createdAt        │
└──────────────────┘
```

---

## 4. 📋 FITUR YANG SUDAH DIBUAT

### ✅ SUDAH ADA

| # | Fitur | Status | Lokasi |
|---|-------|--------|--------|
| 1 | Landing Page Event | ✅ Ada | `LandingPage.tsx` |
| 2 | Participant Registration | ✅ Ada | `ParticipantLandingPage.tsx` |
| 3 | Photo Upload | ✅ Ada | Registration form |
| 4 | AI Avatar Generation | ✅ Ada | Registration flow |
| 5 | QR Code Generation | ✅ Ada | `lib/qrcode.ts` |
| 6 | Ticket Download | ✅ Ada | Post-registration |
| 7 | Admin Login/Register | ✅ Ada | `LoginPage.tsx` |
| 8 | Admin Dashboard | ✅ Ada | `AdminDashboard.tsx` |
| 9 | Panitia Dashboard | ✅ Ada | `PanitiaDashboard.tsx` |
| 10 | Check-in Scanner (4 Desk) | ✅ Ada | `CheckinSection.tsx` |
| 11 | F&B Claim Scanner | ✅ Ada | `ClaimSection.tsx` |
| 12 | Display Monitor | ✅ Ada | `DisplayMonitorSection.tsx` |
| 13 | Booth Management | ✅ Ada | `AdminSection.tsx` |
| 14 | Menu Management | ✅ Ada | `AdminSection.tsx` |
| 15 | Reports View | ✅ Ada | `ReportsView.tsx` |
| 16 | Participant Management | ✅ Ada | `AdminSection.tsx` |
| 17 | Scan Logs | ✅ Ada | Database schema |

### ❌ BELUM ADA (Yang Dibutuhkan dari Diskusi Sebelumnya)

| # | Fitur | Status | Catatan |
|---|-------|--------|---------|
| 1 | Google OAuth Login | ❌ Belum | Saat ini pakai email/password |
| 2 | Multi-tenant (EO System) | ❌ Belum | Single event system |
| 3 | Tenant/Company Management | ❌ Belum | Tidak ada model Tenant |
| 4 | Credit System | ❌ Belum | Tidak ada wallet/credits |
| 5 | Event Setup Wizard | ❌ Belum | Event hardcoded, tidak ada form setup |
| 6 | Event Segments | ❌ Belum | Tidak ada multi-step setup |
| 7 | F&B Claim Limits Config | ❌ Belum | Hardcoded (2 food, 1 drink) |
| 8 | Ticket Types with Price | ❌ Belum | Tidak ada harga tiket |
| 9 | Event Banner Upload | ❌ Belum | Tidak ada di registration |
| 10 | Welcome Message Config | ❌ Belum | Tidak bisa custom |

---

## 5. 🔄 WORKFLOW YANG SUDAH ADA

### A. Registration Flow (Saat Ini)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    REGISTRATION FLOW (YANG ADA)                              │
└─────────────────────────────────────────────────────────────────────────────┘

User buka Landing Page
         │
         ▼
Isi Form Registration:
  ├── Nama
  ├── Email
  ├── Telepon
  ├── Perusahaan
  └── Upload Foto
         │
         ▼
Generate:
  ├── QR Code (otomatis)
  └── AI Avatar (opsional)
         │
         ▼
Download Ticket (QR + Avatar)
         │
         ▼
SELESAI
```

### B. Check-in Flow (Saat Ini)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    CHECK-IN FLOW (YANG ADA)                                  │
└─────────────────────────────────────────────────────────────────────────────┘

Admin/Panitia buka Scanner
         │
         ▼
Pilih Desk (1-4)
         │
         ▼
Scan QR Code:
  ├── Camera scan
  ├── Upload image
  ├── Manual input
  └── Email search
         │
         ▼
Verifikasi Participant
         │
    ┌────┴────┐
    │         │
    ▼         ▼
 SUCCESS   ALREADY CHECKED IN
    │         │
    ▼         ▼
Update DB   Show warning
    │
    ▼
Add to Display Queue
    │
    ▼
SELESAI
```

### C. F&B Claim Flow (Saat Ini)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    F&B CLAIM FLOW (YANG ADA)                                 │
└─────────────────────────────────────────────────────────────────────────────┘

Admin/Panitia buka Claim Scanner
         │
         ▼
Pilih Booth:
  ├── Food Booth
  └── Drink Booth
         │
         ▼
Scan QR Code Participant
         │
         ▼
Show Participant Info:
  ├── Nama
  ├── Food Claims Remaining (default 2)
  └── Drink Claims Remaining (default 1)
         │
         ▼
Pilih Menu Item
         │
         ▼
Validasi:
  ├── Cek stock
  └── Cek claim limit
         │
    ┌────┴────┐
    │         │
    ▼         ▼
 SUCCESS   FAILED (limit/stock)
    │
    ▼
Update:
  ├── Stock -1
  ├── Claim count +1
  └── Create Claim record
    │
    ▼
SELESAI
```

---

## 6. ❓ PERTANYAAN DISKUSI

### A. Multi-Tenant System

| # | Pertanyaan | Jawaban |
|---|------------|---------|
| A1 | Apakah sistem harus jadi multi-tenant (banyak EO)? | ⬜ Ya  ⬐ Tidak (single event) |
| A2 | Setiap EO punya data terpisah? | ⬜ Ya  ⬐ Tidak |
| A3 | Super Admin untuk manage semua EO? | ⬜ Ya  ⬐ Tidak |

### B. Login System

| # | Pertanyaan | Jawaban |
|---|------------|---------|
| B1 | Tetap pakai email/password atau ganti ke Google OAuth? | ⬐ Email/Pass  ⬐ Google Only  ⬐ Keduanya |
| B2 | First user jadi admin tetap dipertahankan? | ⬜ Ya  ⬐ Tidak |

### C. Credit System

| # | Pertanyaan | Jawaban |
|---|------------|---------|
| C1 | Apakah perlu credit system untuk check-in/claim? | ⬜ Ya  ⬐ Tidak (gratis) |
| C2 | Credit untuk apa saja? | ⬐ Check-in  ⬐ Claim  ⬐ AI Photo  ⬐ Semua |
| C3 | Payment gateway untuk top-up? | ⬐ Ya  ⬐ Tidak (manual) |

### D. Event Setup

| # | Pertanyaan | Jawaban |
|---|------------|---------|
| D1 | Event setup pakai wizard (multi-step)? | ⬜ Ya  ⬐ Tidak (single form) |
| D2 | Berapa segment dalam setup? | ⬐ 3  ⬐ 4  ⬐ 5 segment |
| D3 | F&B claim limits bisa di-config? | ⬜ Ya  ⬐ Tidak (fixed) |
| D4 | Ticket types bisa custom (VIP, Regular, etc)? | ⬜ Ya  ⬐ Tidak |

### E. F&B Configuration

| # | Pertanyaan | Jawaban |
|---|------------|---------|
| E1 | Default max food claims? | ⬐ 2  ⬐ 4  ⬐ Custom |
| E2 | Default max drink claims? | ⬐ 1  ⬐ 2  ⬐ Custom |
| E3 | Per participant atau per ticket type? | ⬐ Per participant  ⬐ Per ticket type |
| E4 | Booth bisa punya menu berbeda? | ⬜ Ya  ⬐ Tidak |

### F. Display Monitor

| # | Pertanyaan | Jawaban |
|---|------------|---------|
| F1 | Welcome message bisa custom? | ⬜ Ya  ⬐ Tidak |
| F2 | Durasi tampil berapa detik? | ⬐ 3  ⬐ 5  ⬐ 10  ⬐ Custom |
| F3 | Sound effect? | ⬜ Ya  ⬐ Tidak |
| F4 | Tampilkan foto AI atau original? | ⬐ AI  ⬐ Original  ⬐ Keduanya |

---

## 7. 🆚 PERBANDINGAN SISTEM

### Yang Sudah Ada vs Yang Dibutuhkan

| Fitur | Sudah Ada | Dibutuhkan (Diskusi) | Gap |
|-------|-----------|---------------------|-----|
| Login | Email/Password | Google OAuth | Perlu tambah |
| Multi-tenant | ❌ | ✅ | Perlu buat baru |
| Credit System | ❌ | ✅ | Perlu buat baru |
| Event Setup | Hardcoded | Wizard Form | Perlu buat baru |
| F&B Config | Fixed (2F, 1D) | Configurable | Perlu ubah |
| Ticket Types | ❌ | ✅ | Perlu buat baru |
| Display Config | ❌ | ✅ | Perlu buat baru |

---

## 8. 📝 NEXT STEPS (Setelah Diskusi)

Berdasarkan jawaban dari pertanyaan di atas, saya akan:

1. **Finalize PRD** - Dokumen kebutuhan produk yang lengkap
2. **Update ERD** - Schema database yang diperlukan
3. **Create Implementation Plan** - Prioritas dan timeline
4. **Start Coding** - Setelah semua disetujui

---

## 📋 SILAKAN JAWAB PERTANYAAN DI ATAS

Format jawaban:
```
A1: Ya
A2: Ya
A3: Ya

B1: Google Only
B2: Tidak

C1: Ya
C2: Semua
C3: Midtrans

D1: Ya (5 segment)
D2: 5 segment
D3: Ya
D4: Ya

E1: 4 (custom)
E2: 2 (custom)
E3: Per ticket type
E4: Ya

F1: Ya
F2: 5 detik
F3: Ya
F4: AI jika ada
```

Setelah Anda jawab, saya akan buat PRD final dan ERD yang lengkap! 🚀
