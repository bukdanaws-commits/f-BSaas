# 🎟️ ANALISA WORKFLOW - Participant Registration & Check-in Display

## 📋 Daftar Isi
1. [Overview Flow](#1-overview-flow)
2. [Participant Registration Flow](#2-participant-registration-flow)
3. [AI Photo Generation Flow](#3-ai-photo-generation-flow)
4. [Check-in Screen Monitor](#4-check-in-screen-monitor)
5. [Data & Database Schema](#5-data--database-schema)
6. [Technical Implementation](#6-technical-implementation)
7. [Pertanyaan Diskusi](#7-pertanyaan-diskusi)

---

## 1. Overview Flow

### 🔄 Complete System Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        COMPLETE WORKFLOW                                     │
└─────────────────────────────────────────────────────────────────────────────┘

┌──────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   PENDAFTARAN │     │  AI GENERATE  │     │    QR + FOTO  │     │   CHECK-IN   │
│  PARTICIPANT  │ ──► │    FOTO       │ ──► │    DOWNLOAD   │ ──► │   DISPLAY    │
└──────────────┘     └──────────────┘     └──────────────┘     └──────────────┘
       │                    │                    │                    │
       ▼                    ▼                    ▼                    ▼
  - Isi data         - Generate AI        - QR Code unik       - Welcome screen
  - Upload foto        berdasarkan bio    - Foto AI            - Nama + Foto
  - Submit             peserta            - Download PDF       - Event info


┌─────────────────────────────────────────────────────────────────────────────┐
│                    CHECK-IN SCREEN MONITOR (Big Display)                     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │                                                                     │   │
│   │           🎉 SELAMAT DATANG DI TECH CONFERENCE 2024 🎉              │   │
│   │                                                                     │   │
│   │   ┌───────────────────────────────────────────────────────────┐    │   │
│   │   │                    [AI GENERATED FOTO]                     │    │   │
│   │   │                                                           │    │   │
│   │   │                        📷                                 │    │   │
│   │   │                                                           │    │   │
│   │   └───────────────────────────────────────────────────────────┘    │   │
│   │                                                                     │   │
│   │                      👤 JOHN DOE                                    │   │
│   │                   🎫 VIP - A001                                     │   │
│   │                                                                     │   │
│   │   ─────────────────────────────────────────────────────────────    │   │
│   │                                                                     │   │
│   │   Total Check-in: 234  │  Queue: 5  │  Time: 10:35:22              │   │
│   │                                                                     │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Participant Registration Flow

### 📝 Step-by-Step Registration

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        REGISTRATION FORM PAGE                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   🎫 TECH CONFERENCE 2024 - REGISTRATION                                     │
│                                                                              │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │  STEP 1: DATA DIRI                                                  │   │
│   ├─────────────────────────────────────────────────────────────────────┤   │
│   │                                                                      │   │
│   │   Nama Lengkap *     [____________________________]                 │   │
│   │                                                                      │   │
│   │   Email *            [____________________________]                 │   │
│   │                                                                      │   │
│   │   No. Telepon *      [____________________________]                 │   │
│   │                                                                      │   │
│   │   Jenis Tiket *      [VIP ▼]  - Rp 500.000                         │   │
│   │                                                                      │   │
│   │   ──────────────────────────────────────────────────────────────    │   │
│   │                                                                      │   │
│   │   BIO / TENTANG DIRI (untuk AI Photo Generation):                   │   │
│   │   ┌─────────────────────────────────────────────────────────────┐   │   │
│   │   │ Saya seorang software engineer dengan passion di bidang     │   │   │
│   │   │ AI dan machine learning. Hobi fotografi dan traveling.      │   │   │
│   │   │ Gaya saya casual dan suka warna biru.                       │   │   │
│   │   │                                                             │   │   │
│   │   │ (Min 50 karakter untuk hasil AI yang lebih personal)        │   │   │
│   │   └─────────────────────────────────────────────────────────────┘   │   │
│   │                                                                      │   │
│   │   [Selanjutnya: Upload Foto →]                                      │   │
│   │                                                                      │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘

                                    ▼

┌─────────────────────────────────────────────────────────────────────────────┐
│                        UPLOAD FOTO PAGE                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   📸 UPLOAD FOTO PROFIL                                                      │
│                                                                              │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │                                                                      │   │
│   │   ┌─────────────────────────────────────────────────────────────┐   │   │
│   │   │                                                             │   │   │
│   │   │              [DRAG & DROP FOTO DISINI]                      │   │   │
│   │   │                                                             │   │   │
│   │   │                     atau                                    │   │   │
│   │   │                                                             │   │   │
│   │   │                  [📁 PILIH FILE]                            │   │   │
│   │   │                                                             │   │   │
│   │   │              Format: JPG, PNG (Max 5MB)                     │   │   │
│   │   │                                                             │   │   │
│   │   └─────────────────────────────────────────────────────────────┘   │   │
│   │                                                                      │   │
│   │   PREVIEW:                                                           │   │
│   │   ┌───────────┐                                                      │   │
│   │   │           │                                                      │   │
│   │   │   [IMG]   │  Foto asli Anda                                      │   │
│   │   │           │                                                      │   │
│   │   └───────────┘                                                      │   │
│   │                                                                      │   │
│   │   ☑️ Saya setuju foto saya diproses dengan AI untuk                 │   │
│   │      menghasilkan foto personalized                                  │   │
│   │                                                                      │   │
│   │   [← Kembali]              [SUBMIT & GENERATE AI FOTO →]            │   │
│   │                                                                      │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘

                                    ▼

┌─────────────────────────────────────────────────────────────────────────────┐
│                        AI GENERATING PAGE                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   ✨ MEMPROSES FOTO DENGAN AI...                                             │
│                                                                              │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │                                                                      │   │
│   │                    ████████████████████  75%                        │   │
│   │                                                                      │   │
│   │   ⏳ Menganalisa bio Anda...                                        │   │
│   │   ⏳ Generating personalized photo...                               │   │
│   │   ⏳ Creating QR Code...                                            │   │
│   │                                                                      │   │
│   │   ┌───────────────────────────────────────────────────────────┐    │   │
│   │   │                                                           │    │   │
│   │   │    [SPINNER/ANIMATION - AI generating photo]              │    │   │
│   │   │                                                           │    │   │
│   │   └───────────────────────────────────────────────────────────┘    │   │
│   │                                                                      │   │
│   │   Proses ini membutuhkan waktu 10-30 detik                         │   │
│   │                                                                      │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘

                                    ▼

┌─────────────────────────────────────────────────────────────────────────────┐
│                        SUCCESS & DOWNLOAD PAGE                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   ✅ REGISTRASI BERHASIL!                                                    │
│                                                                              │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │                                                                      │   │
│   │   ┌───────────────────────────┐  ┌───────────────────────────┐     │   │
│   │   │                           │  │                           │     │   │
│   │   │   [AI GENERATED FOTO]     │  │      [QR CODE]            │     │   │
│   │   │                           │  │                           │     │   │
│   │   │         📷                │  │    █▀▀▀▀▀▀▀▀▀▀█          │     │   │
│   │   │                           │  │    █ █▀▀▀▀▀▀█ █          │     │   │
│   │   │   Foto personal           │  │    █ █      █ █          │     │   │
│   │   │   berdasarkan bio Anda    │  │    █ ████████ █          │     │   │
│   │   │                           │  │    █    QR     █          │     │   │
│   │   │   John Doe                │  │    ████████████          │     │   │
│   │   │   VIP - Tech Conference   │  │                           │     │   │
│   │   │                           │  │   ID: TC2024-001234      │     │   │
│   │   └───────────────────────────┘  └───────────────────────────┘     │   │
│   │                                                                      │   │
│   │   ──────────────────────────────────────────────────────────────    │   │
│   │                                                                      │   │
│   │   [📥 DOWNLOAD QR CODE]    [📥 DOWNLOAD FOTO AI]                    │   │
│   │                                                                      │   │
│   │   [📥 DOWNLOAD SEMUA (PDF)]                                         │   │
│   │                                                                      │   │
│   │   ──────────────────────────────────────────────────────────────    │   │
│   │                                                                      │   │
│   │   📧 Konfirmasi juga dikirim ke email: john@email.com              │   │
│   │                                                                      │   │
│   │   [Selesai - Kembali ke Beranda]                                    │   │
│   │                                                                      │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. AI Photo Generation Flow

### 🤖 AI Generation Process

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        AI PHOTO GENERATION FLOW                              │
└─────────────────────────────────────────────────────────────────────────────┘

INPUT DATA:
┌─────────────────────────────────────────────────────────────────────────────┐
│  1. Foto Original (upload user)                                              │
│  2. Bio/Tentang Diri (text description)                                      │
│  3. Event Theme (conference, music festival, etc.)                           │
│  4. Ticket Type (VIP, Regular, etc.)                                         │
│  5. Event Branding (colors, logo, etc.)                                      │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                        AI PROMPT ENGINEERING                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  Contoh Prompt Generation:                                                   │
│                                                                              │
│  "Create a professional event photo for Tech Conference 2024.               │
│   Subject: John Doe, software engineer passionate about AI.                 │
│   Style: Casual professional, wearing blue tones (user preference).         │
│   Background: Tech-themed with subtle AI elements, modern conference        │
│   atmosphere. Include event branding.                                        │
│   Mood: Friendly, approachable, tech-savvy.                                 │
│   Ticket Type: VIP - add premium elements."                                  │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                        AI IMAGE GENERATION                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌───────────────┐     ┌───────────────┐     ┌───────────────┐             │
│  │ INPUT FOTO    │     │ AI PROCESSING │     │ OUTPUT FOTO   │             │
│  │   (User)      │ ──► │  (z-ai-sdk)   │ ──► │  (Generated)  │             │
│  │               │     │               │     │               │             │
│  │   [Original]  │     │  - Style      │     │  [Personalized│             │
│  │               │     │  - Theme      │     │   Event Photo]│             │
│  │               │     │  - Branding   │     │               │             │
│  └───────────────┘     └───────────────┘     └───────────────┘             │
│                                                                              │
│  Process Time: 10-30 detik                                                  │
│  Output: 800x800px atau 1024x1024px                                         │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
OUTPUT:
┌─────────────────────────────────────────────────────────────────────────────┐
│  ✅ AI Generated Photo                                                       │
│  ✅ QR Code (dengan ID unik)                                                 │
│  ✅ Combined Image (Foto + QR + Event Info)                                  │
│  ✅ PDF Ticket (ready to print)                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 🎨 AI Photo Style Options

| Ticket Type | Style Element |
|-------------|---------------|
| **VIP** | Premium background, gold accents, exclusive frame |
| **Regular** | Standard event theme, clean design |
| **Speaker** | Professional spotlight, speaker badge |
| **Sponsor** | Brand integration, premium placement |

---

## 4. Check-in Screen Monitor

### 🖥️ Big Display Screen Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    CHECK-IN SCREEN MONITOR (Layar Besar)                     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │                                                                     │   │
│   │                    TECH CONFERENCE 2024                             │   │
│   │                  📅 15 Februari 2024                                │   │
│   │                                                                     │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │                                                                     │   │
│   │                                                                     │   │
│   │                  🎉 SELAMAT DATANG! 🎉                              │   │
│   │                                                                     │   │
│   │           ┌───────────────────────────────────┐                     │   │
│   │           │                                   │                     │   │
│   │           │      [AI GENERATED FOTO]          │                     │   │
│   │           │                                   │                     │   │
│   │           │            📷                     │                     │   │
│   │           │                                   │                     │   │
│   │           │      John Doe                     │                     │   │
│   │           │      VIP Ticket                   │                     │   │
│   │           │                                   │                     │   │
│   │           └───────────────────────────────────┘                     │   │
│   │                                                                     │   │
│   │              ✓ Check-in Berhasil!                                   │   │
│   │              Welcome to Tech Conference 2024!                       │   │
│   │                                                                     │   │
│   │              Silakan menuju ke Main Hall                            │   │
│   │                                                                     │   │
│   │                                                                     │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│   ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐         │
│   │  Total Check-in  │  │  Last 5 Minutes  │  │   Queue Now      │         │
│   │      234         │  │       12         │  │       5          │         │
│   └──────────────────┘  └──────────────────┘  └──────────────────┘         │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘


ANIMATION FLOW:
┌────────────────┐     ┌────────────────┐     ┌────────────────┐
│   IDLE STATE   │     │  CHECK-IN IN   │     │  SUCCESS STATE │
│                │ ──► │   PROGRESS     │ ──► │   (3 detik)    │
│  Waiting for   │     │   Loading...   │     │                │
│  scan...       │     │                │     │  Show photo    │
│                │     │                │     │  + welcome     │
└────────────────┘     └────────────────┘     └────────────────┘
        ▲                                             │
        │                                             │
        └─────────────────────────────────────────────┘
                      (Return to idle)
```

### 📊 Screen States

```
STATE 1: IDLE (Menunggu Scan)
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│                    TECH CONFERENCE 2024                             │
│                                                                     │
│              ┌───────────────────────────────┐                      │
│              │                               │                      │
│              │      📷                       │                      │
│              │                               │                      │
│              │    SCAN QR CODE               │                      │
│              │    untuk check-in             │                      │
│              │                               │                      │
│              └───────────────────────────────┘                      │
│                                                                     │
│         Total Check-in: 234  |  Waiting: Scanning...               │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘

STATE 2: CHECKING (Memproses)
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│                    TECH CONFERENCE 2024                             │
│                                                                     │
│              ┌───────────────────────────────┐                      │
│              │                               │                      │
│              │       ⏳                       │                      │
│              │   MEMPROSES...                │                      │
│              │                               │                      │
│              │   ████████████░░░░ 60%        │                      │
│              │                               │                      │
│              └───────────────────────────────┘                      │
│                                                                     │
│         Total Check-in: 234  |  Processing...                      │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘

STATE 3: SUCCESS (Berhasil - 3 detik)
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│                    TECH CONFERENCE 2024                             │
│                                                                     │
│              🎉 SELAMAT DATANG! 🎉                                  │
│                                                                     │
│              ┌───────────────────────────────┐                      │
│              │      [AI FOTO]                │                      │
│              │      JOHN DOE                 │                      │
│              │      VIP - A001               │                      │
│              └───────────────────────────────┘                      │
│                                                                     │
│         ✓ Check-in Berhasil!                                        │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘

STATE 4: ALREADY CHECKED IN
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│                    TECH CONFERENCE 2024                             │
│                                                                     │
│              ⚠️ SUDAH CHECK-IN                                      │
│                                                                     │
│              ┌───────────────────────────────┐                      │
│              │      [AI FOTO]                │                      │
│              │      JOHN DOE                 │                      │
│              │      Checked in: 10:15:33     │                      │
│              └───────────────────────────────┘                      │
│                                                                     │
│         Sudah check-in sebelumnya                                   │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘

STATE 5: ERROR / INVALID QR
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│                    TECH CONFERENCE 2024                             │
│                                                                     │
│              ❌ QR CODE TIDAK VALID                                 │
│                                                                     │
│              ┌───────────────────────────────┐                      │
│              │                               │                      │
│              │      ❓                        │                      │
│              │                               │                      │
│              │   Peserta tidak ditemukan     │                      │
│              │                               │                      │
│              └───────────────────────────────┘                      │
│                                                                     │
│         Silakan hubungi panitia                                     │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 5. Data & Database Schema

### 📊 Schema Update for AI Photo

```sql
-- Tambahkan field untuk AI Photo
ALTER TABLE participants ADD COLUMN original_photo_url TEXT;
ALTER TABLE participants ADD COLUMN ai_photo_url TEXT;
ALTER TABLE participants ADD COLUMN bio TEXT;
ALTER TABLE participants ADD COLUMN ai_generated_at TIMESTAMPTZ;

-- Tambahkan field untuk display preference
ALTER TABLE participants ADD COLUMN photo_style TEXT DEFAULT 'professional';
ALTER TABLE participants ADD COLUMN display_preferences JSONB;
```

### 📋 Prisma Schema Addition

```prisma
model Participant {
  // ... existing fields
  
  // AI Photo Generation
  originalPhotoUrl String?    // Foto original upload
  aiPhotoUrl       String?    // Foto hasil AI
  bio              String?    // Bio untuk AI prompt
  aiGeneratedAt    DateTime?  // Waktu generate AI
  photoStyle       String     @default("professional") // Style preference
  
  // Display preferences
  displayPreferences Json?    // Custom display settings
}
```

---

## 6. Technical Implementation

### 🔧 Tech Stack untuk AI Photo

```
┌─────────────────────────────────────────────────────────────────┐
│                    IMPLEMENTATION STACK                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  FRONTEND:                                                       │
│  ├── Next.js 16 (App Router)                                    │
│  ├── React Dropzone (upload foto)                               │
│  ├── React Hook Form (form handling)                            │
│  └── QRCode.react (generate QR)                                 │
│                                                                  │
│  BACKEND:                                                        │
│  ├── Next.js API Routes                                         │
│  ├── z-ai-web-dev-sdk (AI Image Generation)                     │
│  ├── Prisma (database)                                          │
│  └── Socket.io (real-time display)                              │
│                                                                  │
│  STORAGE:                                                        │
│  ├── Local filesystem (development)                             │
│  ├── Cloud storage (production - optional)                      │
│  └── Database (metadata)                                        │
│                                                                  │
│  REAL-TIME:                                                      │
│  └── WebSocket (check-in display sync)                          │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 🔄 API Endpoints for AI Photo

```
/api
├── /participants
│   ├── POST   /register           # Register with photo
│   ├── POST   /upload-photo       # Upload original photo
│   ├── POST   /generate-ai-photo  # Trigger AI generation
│   └── GET    /:id/ticket         # Download ticket (QR + Photo)
│
├── /ai
│   └── POST   /generate-photo     # AI photo generation endpoint
│
└── /display
    ├── GET    /screen/:eventId    # Screen monitor data
    └── WS     /screen/:eventId    # WebSocket for real-time
```

---

## 7. Pertanyaan Diskusi

### ❓ Pertanyaan yang Perlu Dijawab

#### 1. **AI Photo Generation**
| # | Pertanyaan | Opsi |
|---|------------|------|
| 1.1 | AI foto wajib atau opsional? | Wajib / Opsional |
| 1.2 | Berapa lama waktu max generate? | 30 detik / 60 detik |
| 1.3 | Jika AI gagal, pakai foto original? | Ya / Tidak (error) |
| 1.4 | Style foto berbeda per tiket? | Ya / Tidak |

#### 2. **Bio/Prompt Input**
| # | Pertanyaan | Opsi |
|---|------------|------|
| 2.1 | Bio minimal berapa karakter? | 50 / 100 / Bebas |
| 2.2 | Bio wajib diisi? | Ya / Opsional |
| 2.3 | Gunakan template prompt? | Ya / Free text |

#### 3. **Display Screen**
| # | Pertanyaan | Opsi |
|---|------------|------|
| 3.1 | Durasi tampil foto setelah check-in? | 3 detik / 5 detik / 10 detik |
| 3.2 | Tampilkan foto original atau AI? | Original / AI / Keduanya |
| 3.3 | Ada sound effect saat check-in? | Ya / Tidak |
| 3.4 | Multiple screen support? | Ya / Single screen |

#### 4. **Download Ticket**
| # | Pertanyaan | Opsi |
|---|------------|------|
| 4.1 | Format download? | PDF / PNG / Keduanya |
| 4.2 | QR code terpisah atau digabung foto? | Gabung / Terpisah |
| 4.3 | Kirim ke email? | Ya / Tidak |

#### 5. **Data Privacy**
| # | Pertanyaan | Opsi |
|---|------------|------|
| 5.1 | Simpan foto original berapa lama? | 30 hari / 90 hari / Permanen |
| 5.2 | User bisa delete foto? | Ya / Tidak |
| 5.3 | Foto ditampilkan di public screen? | Ya dengan consent / Tidak |

---

## 8. Proposed Workflow Summary

### ✅ Recommended Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    RECOMMENDED WORKFLOW                                      │
└─────────────────────────────────────────────────────────────────────────────┘

STEP 1: PENDAFTARAN
┌─────────────────────────────────────────────────────────────────────────────┐
│  • Isi data diri (nama, email, telepon, tiket)                              │
│  • Isi bio (min 50 karakter) - OPSIONAL                                     │
│  • Upload foto - OPSIONAL                                                   │
│  • Submit                                                                   │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
STEP 2: AI GENERATION (BACKGROUND)
┌─────────────────────────────────────────────────────────────────────────────┐
│  • Jika bio diisi → Generate AI foto (background process)                   │
│  • Jika bio tidak diisi → Gunakan foto original / placeholder               │
│  • Generate QR Code                                                         │
│  • Kirim email dengan ticket                                                │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
STEP 3: TICKET DOWNLOAD
┌─────────────────────────────────────────────────────────────────────────────┐
│  • Download QR Code (PNG)                                                   │
│  • Download AI Photo (PNG)                                                  │
│  • Download Complete Ticket (PDF - QR + Photo + Info)                       │
│  • Email sent automatically                                                 │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
STEP 4: CHECK-IN
┌─────────────────────────────────────────────────────────────────────────────┐
│  • Scan QR Code                                                             │
│  • Display AI Photo di layar besar                                          │
│  • Show welcome message (3 detik)                                           │
│  • Return to idle state                                                     │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 📝 Silakan Jawab Pertanyaan Di Atas

Setelah Anda menjawab pertanyaan di Section 7, saya akan:

1. ✅ Finalize workflow
2. ✅ Update database schema
3. ✅ Implementasi registration form
4. ✅ Implementasi AI photo generation
5. ✅ Implementasi check-in display screen

---

*Document Version: 1.0*
*Ready for Discussion*
