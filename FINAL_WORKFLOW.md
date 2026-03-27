# ✅ FINAL WORKFLOW - Participant Registration & Check-in System

## 📋 Konfigurasi Final (Berdasarkan Diskusi)

### 🎯 Settings Summary

| Fitur | Konfigurasi |
|-------|-------------|
| **AI Photo** | ✅ Wajib |
| **Fallback AI Gagal** | ✅ Pakai foto original |
| **Style per Tiket** | ✅ Ya (VIP premium style) |
| **Bio** | ⬜ Opsional, bebas karakter |
| **Template Bio** | ✅ Ya, ada pilihan template |
| **Durasi Display** | 5 detik |
| **Foto Display** | AI jika ada, kalau tidak original |
| **Sound Effect** | ✅ Ya (ding sound) |
| **Multiple Screen** | ❌ Single screen |
| **Format Download** | PNG |
| **QR + Foto** | Terpisah (2 button download) |
| **Kirim Email** | ❌ Tidak |
| **Storage** | Selama event (15 hari) |
| **Delete Foto** | ❌ Tidak bisa |

---

## 🔄 FINAL WORKFLOW

### Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           REGISTRATION FLOW                                  │
└─────────────────────────────────────────────────────────────────────────────┘

     ┌─────────────┐
     │   START     │
     └──────┬──────┘
            │
            ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  STEP 1: FORM REGISTRASI                                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  📝 Data yang diisi:                                                         │
│  ├── Nama Lengkap * (wajib)                                                 │
│  ├── Email * (wajib)                                                        │
│  ├── No. Telepon * (wajib)                                                  │
│  ├── Jenis Tiket * (wajib) - dropdown                                       │
│  ├── Bio (opsional)                                                         │
│  │   └── Template pilihan:                                                  │
│  │       • "Saya seorang [profesi] dengan passion di [bidang]..."          │
│  │       • "Hobi saya [hobi] dan saya suka [preferensi]..."                 │
│  │       • Free text (bebas karakter)                                       │
│  └── Upload Foto * (wajib)                                                  │
│                                                                              │
│  [SUBMIT]                                                                    │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  STEP 2: AI GENERATION (Background Process)                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ⏳ Loading Screen (10-30 detik):                                            │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │  ████████████████████░░░░░░░░  65%                                  │    │
│  │                                                                      │    │
│  │  ⏳ Menganalisa foto...                                              │    │
│  │  ⏳ Processing AI...                                                 │    │
│  │  ⏳ Generating personalized photo...                                 │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
│  Process:                                                                    │
│  ├── Generate AI Photo berdasarkan bio + foto original                      │
│  ├── Jika AI gagal → gunakan foto original                                  │
│  ├── Style berbeda berdasarkan tipe tiket (VIP premium)                     │
│  └── Generate QR Code unik                                                  │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  STEP 3: SUCCESS PAGE - DOWNLOAD TICKET                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ✅ REGISTRASI BERHASIL!                                                     │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                                                                      │    │
│  │   ┌───────────────────────────┐  ┌───────────────────────────┐     │    │
│  │   │                           │  │                           │     │    │
│  │   │   [AI GENERATED FOTO]     │  │      [QR CODE]            │     │    │
│  │   │                           │  │                           │     │    │
│  │   │         📷                │  │    █▀▀▀▀▀▀▀▀▀▀█          │     │    │
│  │   │                           │  │    █ █▀▀▀▀▀▀█ █          │     │    │
│  │   │   John Doe                │  │    █ █      █ █          │     │    │
│  │   │   VIP Ticket              │  │    █ ████████ █          │     │    │
│  │   │   Tech Conference 2024    │  │    ████████████          │     │    │
│  │   │                           │  │                           │     │    │
│  │   └───────────────────────────┘  └───────────────────────────┘     │    │
│  │                                                                      │    │
│  │   ─────────────────────────────────────────────────────────────     │    │
│  │                                                                      │    │
│  │   📥 DOWNLOAD:                                                      │    │
│  │                                                                      │    │
│  │   ┌────────────────────────┐  ┌────────────────────────┐           │    │
│  │   │   📥 DOWNLOAD FOTO    │  │   📥 DOWNLOAD QR CODE   │           │    │
│  │   │      (PNG)             │  │        (PNG)            │           │    │
│  │   └────────────────────────┘  └────────────────────────┘           │    │
│  │                                                                      │    │
│  │   ID: TC2024-001234                                                 │    │
│  │   Ticket: VIP - Tech Conference 2024                                │    │
│  │                                                                      │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
│  ⚠️ Simpan QR Code Anda untuk check-in di event!                            │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
            │
            ▼
     ┌─────────────┐
     │    END      │
     └─────────────┘


┌─────────────────────────────────────────────────────────────────────────────┐
│                           CHECK-IN FLOW                                      │
└─────────────────────────────────────────────────────────────────────────────┘

     ┌─────────────┐
     │   START     │
     └──────┬──────┘
            │
            ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  STATE 1: IDLE SCREEN                                                        │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                                                                      │    │
│  │                    TECH CONFERENCE 2024                             │    │
│  │                    📅 15 Februari 2024                              │    │
│  │                                                                      │    │
│  │              ┌───────────────────────────────┐                      │    │
│  │              │                               │                      │    │
│  │              │      📷                        │                      │    │
│  │              │                               │                      │    │
│  │              │    SCAN QR CODE               │                      │    │
│  │              │    untuk check-in             │                      │    │
│  │              │                               │                      │    │
│  │              └───────────────────────────────┘                      │    │
│  │                                                                      │    │
│  │   ┌──────────────┐  ┌──────────────┐  ┌──────────────┐             │    │
│  │   │ Total        │  │ Last 5min    │  │ Queue        │             │    │
│  │   │   234        │  │    12        │  │     5        │             │    │
│  │   └──────────────┘  └──────────────┘  └──────────────┘             │    │
│  │                                                                      │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
            │
            │ (QR Code Scanned)
            ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  STATE 2: CHECKING (1-2 detik)                                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                                                                      │    │
│  │              ┌───────────────────────────────┐                      │    │
│  │              │                               │                      │    │
│  │              │       ⏳                       │                      │    │
│  │              │   MEMPROSES...                │                      │    │
│  │              │   ████████████░░░░ 60%        │                      │    │
│  │              │                               │                      │    │
│  │              └───────────────────────────────┘                      │    │
│  │                                                                      │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
│  🔊 Sound: Loading beep                                                     │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  STATE 3: SUCCESS (5 detik)                                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                                                                      │    │
│  │                  🎉 SELAMAT DATANG! 🎉                              │    │
│  │                                                                      │    │
│  │              ┌───────────────────────────────┐                      │    │
│  │              │      [AI GENERATED FOTO]      │                      │    │
│  │              │            📷                 │                      │    │
│  │              │      JOHN DOE                 │                      │    │
│  │              │      VIP - A001               │                      │    │
│  │              │                               │                      │    │
│  │              │   ✓ Check-in Berhasil!        │                      │    │
│  │              │   Welcome to Tech Conference! │                      │    │
│  │              └───────────────────────────────┘                      │    │
│  │                                                                      │    │
│  │   ┌──────────────┐  ┌──────────────┐  ┌──────────────┐             │    │
│  │   │ Total        │  │ Last 5min    │  │ Queue        │             │    │
│  │   │   235 (+1)   │  │    13 (+1)   │  │     4        │             │    │
│  │   └──────────────┘  └──────────────┘  └──────────────┘             │    │
│  │                                                                      │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
│  🔊 Sound: Ding! (success sound)                                            │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
            │
            │ (After 5 seconds)
            ▼
     ┌─────────────┐
     │ RETURN TO   │
     │ IDLE SCREEN │
     └─────────────┘
```

---

## 🎨 UI MOCKUP FINAL

### Registration Page

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  🎫 TECH CONFERENCE 2024 - REGISTRATION                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                                                                      │    │
│  │   Nama Lengkap *          [________________________________]        │    │
│  │                                                                      │    │
│  │   Email *                 [________________________________]        │    │
│  │                                                                      │    │
│  │   No. Telepon *           [________________________________]        │    │
│  │                                                                      │    │
│  │   Jenis Tiket *           [VIP ▼]                                   │    │
│  │                           ┌──────────────────────────────┐          │    │
│  │                           │ VIP - Rp 500.000            │          │    │
│  │                           │ Regular - Rp 250.000        │          │    │
│  │                           │ Student - Rp 100.000        │          │    │
│  │                           └──────────────────────────────┘          │    │
│  │                                                                      │    │
│  │   ─────────────────────────────────────────────────────────────     │    │
│  │                                                                      │    │
│  │   Bio / Tentang Diri (untuk AI Photo):                              │    │
│  │   [Pilih Template ▼]                                                 │    │
│  │   ┌──────────────────────────────────────────────────────────────┐  │    │
│  │   │ 📝 Template 1: Profesional                                    │  │    │
│  │   │    "Saya seorang [profesi] dengan passion di [bidang]..."     │  │    │
│  │   │                                                               │  │    │
│  │   │ 📝 Template 2: Casual                                         │  │    │
│  │   │    "Hobi saya [hobi] dan saya suka [preferensi]..."           │  │    │
│  │   │                                                               │  │    │
│  │   │ 📝 Template 3: Custom                                         │  │    │
│  │   │    Tulis bio Anda sendiri...                                  │  │    │
│  │   └──────────────────────────────────────────────────────────────┘  │    │
│  │                                                                      │    │
│  │   ┌──────────────────────────────────────────────────────────────┐  │    │
│  │   │ Saya seorang software engineer dengan passion di bidang      │  │    │
│  │   │ AI dan machine learning. Hobi fotografi dan traveling.       │  │    │
│  │   │ Gaya saya casual dan suka warna biru.                        │  │    │
│  │   │                                                              │  │    │
│  │   │ (Opsional - untuk hasil AI yang lebih personal)              │  │    │
│  │   └──────────────────────────────────────────────────────────────┘  │    │
│  │                                                                      │    │
│  │   ─────────────────────────────────────────────────────────────     │    │
│  │                                                                      │    │
│  │   Upload Foto *                                                     │    │
│  │   ┌──────────────────────────────────────────────────────────────┐  │    │
│  │   │                                                              │  │    │
│  │   │              [DRAG & DROP FOTO DISINI]                       │  │    │
│  │   │                                                              │  │    │
│  │   │                     atau                                     │  │    │
│  │   │                                                              │  │    │
│  │   │                  [📁 PILIH FILE]                             │  │    │
│  │   │                                                              │  │    │
│  │   │              Format: JPG, PNG (Max 5MB)                      │  │    │
│  │   │                                                              │  │    │
│  │   └──────────────────────────────────────────────────────────────┘  │    │
│  │                                                                      │    │
│  │   ☑️ Saya setuju foto saya diproses dengan AI                      │    │
│  │                                                                      │    │
│  │   [DAFTAR SEKARANG]                                                 │    │
│  │                                                                      │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Success Page with Download

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  ✅ REGISTRASI BERHASIL!                                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                                                                      │    │
│  │           🎉 SELAMAT! Anda terdaftar di:                            │    │
│  │              TECH CONFERENCE 2024                                    │    │
│  │                                                                      │    │
│  │   ┌───────────────────────────────────────────────────────────────┐ │    │
│  │   │                                                               │ │    │
│  │   │  ┌──────────────────────┐  ┌──────────────────────┐          │ │    │
│  │   │  │                      │  │                      │          │ │    │
│  │   │  │  [AI GENERATED FOTO] │  │     [QR CODE]        │          │ │    │
│  │   │  │                      │  │                      │          │ │    │
│  │   │  │        📷            │  │   █▀▀▀▀▀▀▀▀▀▀█      │          │ │    │
│  │   │  │                      │  │   █ █▀▀▀▀▀▀█ █      │          │ │    │
│  │   │  │   John Doe           │  │   █ █      █ █      │          │ │    │
│  │   │  │   VIP Ticket         │  │   █ ████████ █      │          │ │    │
│  │   │  │   ID: TC2024-001234  │  │   ████████████      │          │ │    │
│  │   │  │                      │  │                      │          │ │    │
│  │   │  └──────────────────────┘  └──────────────────────┘          │ │    │
│  │   │                                                               │ │    │
│  │   │  ─────────────────────────────────────────────────────────── │ │    │
│  │   │                                                               │ │    │
│  │   │  📥 DOWNLOAD TICKET ANDA:                                     │ │    │
│  │   │                                                               │ │    │
│  │   │  ┌────────────────────────┐  ┌────────────────────────┐      │ │    │
│  │   │  │  📥 DOWNLOAD FOTO     │  │  📥 DOWNLOAD QR CODE    │      │ │    │
│  │   │  │       (PNG)           │  │        (PNG)            │      │ │    │
│  │   │  │                       │  │                         │      │ │    │
│  │   │  └────────────────────────┘  └────────────────────────┘      │ │    │
│  │   │                                                               │ │    │
│  │   │  ─────────────────────────────────────────────────────────── │ │    │
│  │   │                                                               │ │    │
│  │   │  ⚠️ PENTING:                                                  │ │    │
│  │   │  • Simpan QR Code untuk check-in di event                    │ │    │
│  │   │  • Foto akan ditampilkan di layar saat check-in              │ │    │
│  │   │  • Data disimpan selama 15 hari (durasi event)               │ │    │
│  │   │                                                               │ │    │
│  │   └───────────────────────────────────────────────────────────────┘ │    │
│  │                                                                      │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 🗄️ DATABASE SCHEMA UPDATE

### Prisma Schema

```prisma
model Participant {
  id              String   @id @default(cuid())
  tenantId        String
  eventId         String
  name            String
  email           String
  phone           String?
  
  // Ticket
  ticketType      String   // VIP, Regular, Student
  ticketPrice     Int      @default(0)
  
  // QR Code
  qrCode          String   @unique
  qrHash          String?
  
  // Photo & AI
  originalPhotoUrl String?  // Foto upload original
  aiPhotoUrl       String?  // Foto hasil AI
  bio              String?  // Bio untuk AI prompt
  photoStyle       String   @default("professional")
  aiGeneratedAt    DateTime?
  aiGenerationStatus String @default("pending") // pending, processing, success, failed
  
  // Check-in
  isCheckedIn     Boolean  @default(false)
  checkedInAt     DateTime?
  checkinCount    Int      @default(0)
  
  // Status
  isActive        Boolean  @default(true)
  isBlacklisted   Boolean  @default(false)
  
  // Metadata
  meta            Json?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  expiresAt       DateTime? // 15 hari setelah event
  
  // Relations
  tenant          Tenant   @relation(fields: [tenantId], references: [id])
  event           Event    @relation(fields: [eventId], references: [id])
  checkins        Checkin[]
  claims          Claim[]
  
  @@unique([eventId, email])
  @@index([qrCode])
  @@index([eventId, isCheckedIn])
}

model Event {
  // ... existing fields
  
  // Display Settings
  displayMessage  String?  @default("Selamat Datang!")
  displayDuration Int      @default(5) // detik
  enableSound     Boolean  @default(true)
  
  // Storage
  storageDays     Int      @default(15) // hari
}
```

---

## 🔧 TECHNICAL IMPLEMENTATION

### API Endpoints

```
POST /api/participants/register
├── Body: { name, email, phone, ticketType, bio, photo (file) }
├── Process:
│   ├── Upload foto ke storage
│   ├── Generate QR Code
│   ├── Trigger AI Photo Generation (async)
│   └── Return participant data
└── Response: { participant, qrCodeUrl, aiPhotoUrl (processing) }

POST /api/ai/generate-photo
├── Body: { participantId }
├── Process:
│   ├── Get participant data + bio
│   ├── Build AI prompt based on bio + ticket type
│   ├── Call z-ai-web-dev-sdk for image generation
│   ├── Save AI photo to storage
│   └── Update participant record
└── Response: { aiPhotoUrl }

GET /api/participants/:id/ticket
├── Response: { qrCodeUrl, aiPhotoUrl, participantData }

GET /api/display/:eventId/status
├── Response: { state, participant, stats }

WS /api/display/:eventId
├── Events: checkin, stats_update, idle
```

---

## ⏱️ TIMELINE IMPLEMENTASI

| Phase | Task | Estimasi |
|-------|------|----------|
| **Phase 1** | Database Schema | ✅ Done |
| **Phase 2** | Registration Form UI | 30 menit |
| **Phase 3** | Photo Upload & QR Generation | 20 menit |
| **Phase 4** | AI Photo Generation API | 30 menit |
| **Phase 5** | Success Page & Download | 20 menit |
| **Phase 6** | Check-in Display Screen | 40 menit |
| **Phase 7** | WebSocket Real-time | 30 menit |
| **Phase 8** | Sound Effects | 10 menit |
| **Total** | | ~3 jam |

---

*Document Version: 2.0 (Final)*
*Ready for Implementation*
