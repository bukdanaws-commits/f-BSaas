# 📋 PRD FINAL - SaaS Event Management System

## 🎯 OVERVIEW SISTEM

### Platform SaaS untuk Event Organizer dengan 3 Dashboard:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      SAAS EVENT MANAGEMENT SYSTEM                            │
│                   (Platform untuk banyak Event Organizer)                    │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                           3 DASHBOARD UTAMA                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐          │
│  │   SUPER ADMIN    │  │   DASHBOARD EO   │  │   DASHBOARD      │          │
│  │   (Pemilik SaaS) │  │   (Owner EO)     │  │   CREW/PANITIA   │          │
│  │                  │  │                  │  │                  │          │
│  │  - Kelola semua  │  │  - Setup Event   │  │  - Check-in      │          │
│  │    EO/Tenant     │  │  - Kelola Credit │  │  - Claim F&B     │          │
│  │  - Billing       │  │  - Lihat Report  │  │  - Scanner       │          │
│  │  - Analytics     │  │  - Kelola Crew   │  │                  │          │
│  │                  │  │                  │  │                  │          │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘          │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 1. 👥 USER ROLES & PERMISSIONS

### A. SUPER ADMIN (Pemilik Platform SaaS)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        SUPER ADMIN DASHBOARD                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  AKSES:                                                                      │
│  ├── Kelola semua EO/Tenant                                                 │
│  ├── Approve/Reject EO registration                                         │
│  ├── Billing & Payment management                                           │
│  ├── Platform analytics                                                     │
│  ├── Credit management (top-up manual)                                      │
│  ├── Support & Help desk                                                    │
│  └── System configuration                                                   │
│                                                                              │
│  TIDAK BISA:                                                                 │
│  └── Akses data event peserta (hanya overview)                             │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### B. EO OWNER (Pemilik Event Organizer)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        DASHBOARD EO (OWNER)                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  AKSES:                                                                      │
│  ├── Setup Event (Wizard 5 Segments)                                        │
│  ├── Kelola Credit (top-up via Midtrans)                                    │
│  ├── Kelola Crew/Panitia                                                    │
│  ├── Lihat Report & Analytics                                               │
│  ├── Kelola Participants                                                    │
│  └── Konfigurasi F&B, Booth, Menu                                           │
│                                                                              │
│  TIDAK BISA:                                                                 │
│  └── Akses data EO lain                                                     │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### C. CREW / PANITIA (Staff EO)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        DASHBOARD CREW/PANITIA                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  AKSES:                                                                      │
│  ├── Check-in Scanner (pilih desk)                                          │
│  ├── F&B Claim Scanner (pilih booth)                                        │
│  └── Lihat participant info saat scan                                       │
│                                                                              │
│  TIDAK BISA:                                                                 │
│  ├── Akses dashboard admin                                                  │
│  ├── Ubah setting event                                                     │
│  └── Kelola credit                                                          │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. 🔐 LOGIN FLOW (Google OAuth Only)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        LOGIN FLOW                                            │
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
┌─────────────────────┐
│ Check User di DB    │
└──────────┬──────────┘
           │
     ┌─────┴─────┐
     │           │
     ▼           ▼
┌──────────┐  ┌──────────────┐
│ USER BARU│  │ USER LAMA    │
└────┬─────┘  └──────┬───────┘
     │               │
     ▼               │
┌──────────────────┐ │
│ Buat Akun:       │ │
│ - User record    │ │
│ - Tenant (EO)    │ │
│ - Wallet 500 cr  │ │
│ - Bonus 50 cr    │ │
│ - Role: owner    │ │
└────────┬─────────┘ │
         │           │
         └─────┬─────┘
               │
               ▼
┌──────────────────────────────────────────────────────────────────┐
│                    CEK ROLE USER                                 │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  if (user.isSuperAdmin)  ───►  SUPER ADMIN DASHBOARD            │
│                                                                  │
│  if (user.role === 'owner')  ─►  EO DASHBOARD                   │
│                                                                  │
│  if (user.role === 'crew')  ───►  CREW DASHBOARD                │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

---

## 3. 💰 CREDIT SYSTEM

### A. Credit untuk apa?

| Aktivitas | Credit Cost |
|-----------|-------------|
| Create Event | 50 credits |
| Check-in peserta | 1 credit |
| F&B Claim | 1 credit |
| AI Photo Generation | 2 credits |

### B. Credit Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        CREDIT SYSTEM FLOW                                    │
└─────────────────────────────────────────────────────────────────────────────┘

USER BARU DAFTAR:
┌──────────────────────────────────────────────────────────────────┐
│                                                                  │
│   💰 Balance: 500 credits (welcome bonus)                        │
│   🎁 Bonus: 50 credits (early adopter)                           │
│   ─────────────────────────────────                              │
│   TOTAL: 550 credits                                             │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘

TOP-UP CREDIT (via Midtrans):
┌──────────────────────────────────────────────────────────────────┐
│                                                                  │
│   Package        │ Credits │ Price        │ Bonus               │
│   ───────────────┼─────────┼──────────────┼─────────────────────│
│   Starter        │ 500     │ Rp 50.000    │ +50 bonus           │
│   Growth         │ 2.500   │ Rp 225.000   │ +250 bonus          │
│   Business       │ 5.000   │ Rp 400.000   │ +500 bonus          │
│   Enterprise     │ 25.000  │ Rp 1.750.000 │ +2.500 bonus        │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘

CREDIT USAGE:
┌──────────────────────────────────────────────────────────────────┐
│                                                                  │
│   1. Create Event (-50 credits)                                  │
│   2. Peserta check-in (-1 credit per peserta)                    │
│   3. Peserta claim F&B (-1 credit per claim)                     │
│   4. Generate AI photo (-2 credits per photo)                    │
│                                                                  │
│   ⚠️ Jika credit habis:                                          │
│   - Tidak bisa check-in baru                                     │
│   - Tidak bisa claim baru                                        │
│   - Perlu top-up dulu                                            │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

---

## 4. 📝 EVENT SETUP WIZARD (5 Segments)

### Flow Overview

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

---

### SEGMENT 1: EVENT INFO

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  SEGMENT 1: EVENT INFO                                                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │ EVENT BANNER                                                         │    │
│  │ ┌─────────────────────────────────────────────────────────────┐    │    │
│  │ │                                                              │    │    │
│  │ │           [DRAG & DROP BANNER IMAGE]                         │    │    │
│  │ │                                                              │    │    │
│  │ │        Recommended: 1920x600px (JPG, PNG)                    │    │    │
│  │ │        Max size: 5MB                                         │    │    │
│  │ │                                                              │    │    │
│  │ └─────────────────────────────────────────────────────────────┘    │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
│  Nama Event *          [________________________________________]            │
│                        Contoh: Tech Conference 2024                         │
│                                                                              │
│  Judul / Tagline       [________________________________________]            │
│                        Contoh: Innovate. Inspire. Impact.                   │
│                                                                              │
│  Deskripsi             ┌──────────────────────────────────────────────┐    │
│                        │                                              │    │
│                        │  Deskripsi lengkap event...                  │    │
│                        │                                              │    │
│                        └──────────────────────────────────────────────┘    │
│                                                                              │
│  Tanggal Mulai *       [📅 ____/____/____]  Jam: [__:__]                   │
│  Tanggal Selesai *     [📅 ____/____/____]  Jam: [__:__]                   │
│                                                                              │
│  Lokasi *              [________________________________________]            │
│                        Contoh: Jakarta Convention Center                    │
│                                                                              │
│  Kategori Event *      [▼ Pilih Kategori]                                  │
│                        - Conference                                         │
│                        - Seminar                                            │
│                        - Workshop                                           │
│                        - Festival                                           │
│                        - Gathering                                          │
│                        - Exhibition                                         │
│                                                                              │
│  Kapasitas Peserta *   [________] orang                                     │
│                                                                              │
│                                              [Selanjutnya: F&B Settings →]  │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

### SEGMENT 2: F&B SETTINGS

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  SEGMENT 2: F&B CLAIM SETTINGS                                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  Aktifkan Klaim Makanan?  [✓] Ya                                             │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │ 🍔 MAKANAN CONFIGURATION                                             │    │
│  ├─────────────────────────────────────────────────────────────────────┤    │
│  │                                                                      │    │
│  │  Max Klaim Makanan per Peserta:  [4] jenis                          │    │
│  │                                                                      │    │
│  │  ☑️ Peserta hanya bisa klaim 1x per jenis makanan                   │    │
│  │  ☐ Peserta bisa klaim berapapun sampai quota habis                  │    │
│  │                                                                      │    │
│  │  ─────────────────────────────────────────────────────────────────  │    │
│  │                                                                      │    │
│  │  DAFTAR MENU MAKANAN:                                                │    │
│  │  ┌─────────────────────────────────────────────────────────────┐   │    │
│  │  │ No │ Nama Menu      │ Stok   │ Status    │ Action          │   │    │
│  │  ├────┼────────────────┼────────┼───────────┼─────────────────┤   │    │
│  │  │ 1  │ Nasi Goreng    │ 500    │ ✅ Active │ [✏️] [🗑️]      │   │    │
│  │  │ 2  │ Mie Goreng     │ 500    │ ✅ Active │ [✏️] [🗑️]      │   │    │
│  │  │ 3  │ Ayam Bakar     │ 300    │ ✅ Active │ [✏️] [🗑️]      │   │    │
│  │  │ 4  │ Sate Ayam      │ 400    │ ✅ Active │ [✏️] [🗑️]      │   │    │
│  │  └─────────────────────────────────────────────────────────────┘   │    │
│  │                                                                      │    │
│  │  [+ TAMBAH MAKANAN]                                                  │    │
│  │                                                                      │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
│  Aktifkan Klaim Minuman? [✓] Ya                                              │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │ 🥤 MINUMAN CONFIGURATION                                             │    │
│  ├─────────────────────────────────────────────────────────────────────┤    │
│  │                                                                      │    │
│  │  Max Klaim Minuman per Peserta:  [2] jenis                          │    │
│  │                                                                      │    │
│  │  ☑️ Peserta hanya bisa klaim 1x per jenis minuman                   │    │
│  │  ☐ Peserta bisa klaim berapapun sampai quota habis                  │    │
│  │                                                                      │    │
│  │  ─────────────────────────────────────────────────────────────────  │    │
│  │                                                                      │    │
│  │  DAFTAR MENU MINUMAN:                                                │    │
│  │  ┌─────────────────────────────────────────────────────────────┐   │    │
│  │  │ No │ Nama Menu      │ Stok   │ Status    │ Action          │   │    │
│  │  ├────┼────────────────┼────────┼───────────┼─────────────────┤   │    │
│  │  │ 1  │ Air Mineral    │ 1000   │ ✅ Active │ [✏️] [🗑️]      │   │    │
│  │  │ 2  │ Es Teh Manis   │ 500    │ ✅ Active │ [✏️] [🗑️]      │   │    │
│  │  └─────────────────────────────────────────────────────────────┘   │    │
│  │                                                                      │    │
│  │  [+ TAMBAH MINUMAN]                                                  │    │
│  │                                                                      │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
│  Aktifkan Multi Booth?  [✓] Ya                                               │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │ 🏪 BOOTH CONFIGURATION                                               │    │
│  ├─────────────────────────────────────────────────────────────────────┤    │
│  │                                                                      │    │
│  │  ┌─────────────────────────────────────────────────────────────┐   │    │
│  │  │ No │ Nama Booth   │ Tipe        │ Menu           │ Action   │   │    │
│  │  ├────┼──────────────┼─────────────┼────────────────┼──────────┤   │    │
│  │  │ 1  │ Booth A      │ Makanan     │ Semua Makanan  │ [✏️][🗑️]│   │    │
│  │  │ 2  │ Booth B      │ Minuman     │ Semua Minuman  │ [✏️][🗑️]│   │    │
│  │  │ 3  │ Booth C      │ Keduanya    │ Semua Menu     │ [✏️][🗑️]│   │    │
│  │  └─────────────────────────────────────────────────────────────┘   │    │
│  │                                                                      │    │
│  │  [+ TAMBAH BOOTH]                                                    │    │
│  │                                                                      │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
│                    [← Kembali]              [Selanjutnya: Ticket Types →]   │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

### SEGMENT 3: TICKET TYPES

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  SEGMENT 3: TICKET TYPES                                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │ 🎫 KONFIGURASI TIKET                                                 │    │
│  ├─────────────────────────────────────────────────────────────────────┤    │
│  │                                                                      │    │
│  │  ┌─────────────────────────────────────────────────────────────┐   │    │
│  │  │ ☑️ VIP                                                       │   │    │
│  │  │ Harga: [Rp 500.000]    Kuota: [100] orang                   │   │    │
│  │  │ F&B Claim: Makanan [4] │ Minuman [2]                         │   │    │
│  │  │ ☑️ Prioritas check-in   ☑️ Reserved seating                  │   │    │
│  │  └─────────────────────────────────────────────────────────────┘   │    │
│  │                                                                      │    │
│  │  ┌─────────────────────────────────────────────────────────────┐   │    │
│  │  │ ☑️ Regular                                                   │   │    │
│  │  │ Harga: [Rp 250.000]    Kuota: [300] orang                   │   │    │
│  │  │ F&B Claim: Makanan [3] │ Minuman [1]                         │   │    │
│  │  │ ☐ Prioritas check-in   ☐ Reserved seating                    │   │    │
│  │  └─────────────────────────────────────────────────────────────┘   │    │
│  │                                                                      │    │
│  │  ┌─────────────────────────────────────────────────────────────┐   │    │
│  │  │ ☐ Student                                                    │   │    │
│  │  │ Harga: [Rp 100.000]    Kuota: [100] orang                   │   │    │
│  │  │ F&B Claim: Makanan [2] │ Minuman [1]                         │   │    │
│  │  │ ☐ Prioritas check-in   ☐ Reserved seating                    │   │    │
│  │  └─────────────────────────────────────────────────────────────┘   │    │
│  │                                                                      │    │
│  │  [+ TAMBAH TIPE TIKET]                                               │    │
│  │                                                                      │    │
│  │  ─────────────────────────────────────────────────────────────────  │    │
│  │                                                                      │    │
│  │  💡 Catatan: F&B Claim bisa berbeda per tipe tiket                  │    │
│  │                                                                      │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
│                    [← Kembali]              [Selanjutnya: Display Settings →]│
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

### SEGMENT 4: DISPLAY SETTINGS

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  SEGMENT 4: DISPLAY SETTINGS                                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │ 🖥️ CHECK-IN DISPLAY MONITOR                                          │    │
│  ├─────────────────────────────────────────────────────────────────────┤    │
│  │                                                                      │    │
│  │  Welcome Message:                                                    │    │
│  │  [________________________________________]                          │    │
│  │  Default: "Selamat Datang!"                                          │    │
│  │                                                                      │    │
│  │  Durasi Tampil (detik): [5]                                          │    │
│  │                                                                      │    │
│  │  Foto yang ditampilkan:                                              │    │
│  │  ⦿ AI Generated (jika ada)                                          │    │
│  │  ○ Foto Original                                                    │    │
│  │  ○ Selalu AI                                                        │    │
│  │                                                                      │    │
│  │  Sound Effect:                                                       │    │
│  │  ○ Ya (ding!)                                                       │    │
│  │  ⦿ Tidak                                                            │    │
│  │                                                                      │    │
│  │  ─────────────────────────────────────────────────────────────────  │    │
│  │                                                                      │    │
│  │  Jumlah Check-in Desk: [4]                                           │    │
│  │                                                                      │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
│                    [← Kembali]              [Selanjutnya: Review & Save →]  │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

### SEGMENT 5: REVIEW & SAVE

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  SEGMENT 5: REVIEW & SAVE                                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │ 📋 EVENT SUMMARY                                                     │    │
│  ├─────────────────────────────────────────────────────────────────────┤    │
│  │                                                                      │    │
│  │  EVENT INFO:                                                         │    │
│  │  ├── Nama: Tech Conference 2024                                      │    │
│  │  ├── Tanggal: 15 Februari 2024                                       │    │
│  │  ├── Lokasi: Jakarta Convention Center                               │    │
│  │  └── Kapasitas: 500 peserta                                          │    │
│  │                                                                      │    │
│  │  F&B:                                                                │    │
│  │  ├── Makanan: 4 jenis per peserta                                    │    │
│  │  ├── Minuman: 2 jenis per peserta                                    │    │
│  │  └── Booth: 3 booth                                                  │    │
│  │                                                                      │    │
│  │  TICKET TYPES:                                                       │    │
│  │  ├── VIP: 100 tiket @ Rp 500.000                                     │    │
│  │  ├── Regular: 300 tiket @ Rp 250.000                                 │    │
│  │  └── Student: 100 tiket @ Rp 100.000                                 │    │
│  │                                                                      │    │
│  │  DISPLAY:                                                            │    │
│  │  ├── Welcome: "Selamat Datang!"                                      │    │
│  │  ├── Durasi: 5 detik                                                 │    │
│  │  └── Check-in Desks: 4                                               │    │
│  │                                                                      │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │ 💰 CREDIT ESTIMATION                                                 │    │
│  ├─────────────────────────────────────────────────────────────────────┤    │
│  │                                                                      │    │
│  │  Create Event: -50 credits                                           │    │
│  │  Max Check-ins (500): -500 credits                                   │    │
│  │  Max F&B Claims (3000): -3000 credits                                │    │
│  │  ────────────────────────────────                                    │    │
│  │  TOTAL ESTIMASI: 3550 credits                                        │    │
│  │                                                                      │    │
│  │  Your Balance: 550 credits                                           │    │
│  │  ⚠️ Kredit tidak cukup! Perlu top-up minimal 3000 credits           │    │
│  │                                                                      │    │
│  │  [Top Up Sekarang]                                                   │    │
│  │                                                                      │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
│                    [← Kembali]              [💾 SAVE EVENT]                  │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 5. 🗄️ ERD FINAL (Entity Relationship Diagram)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        DATABASE SCHEMA                                       │
└─────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────┐
│       User           │
├──────────────────────┤
│ id                   │
│ email                │
│ name                 │
│ avatarUrl            │
│ googleId             │
│ isSuperAdmin         │  ← Pemilik platform SaaS
│ createdAt            │
└──────────┬───────────┘
           │
           │ 1:N (sebagai owner)
           ▼
┌──────────────────────┐       ┌──────────────────────┐
│       Tenant         │       │     Membership       │
│       (EO)           │       ├──────────────────────┤
├──────────────────────┤       │ id                   │
│ id                   │◄──────│ userId               │
│ name                 │       │ tenantId             │
│ slug                 │       │ role (owner/admin/   │
│ ownerId              │       │      crew)           │
│ status               │       │ createdAt            │
│ verifiedAt           │       └──────────────────────┘
│ phone                │
│ address              │       ┌──────────────────────┐
│ createdAt            │       │   CreditWallet       │
└──────────┬───────────┤       ├──────────────────────┤
           │           │       │ id                   │
           │           │       │ tenantId             │
           │           │       │ balance              │
           │           │       │ bonusBalance         │
           │           │       │ updatedAt            │
           │           │       └──────────────────────┘
           │           │
           │           │       ┌──────────────────────┐
           │           │       │ CreditTransaction    │
           │           │       ├──────────────────────┤
           │           │       │ id                   │
           │           │       │ tenantId             │
           │           │       │ type (purchase/usage/│
           │           │       │      bonus/refund)   │
           │           │       │ amount               │
           │           │       │ description          │
           │           │       │ createdAt            │
           │           │       └──────────────────────┘
           │           │
           ▼           │
┌──────────────────────┐│
│       Event          ││
├──────────────────────┤│
│ id                   ││
│ tenantId             │┘
│ name                 │
│ title                │
│ description          │
│ bannerUrl            │
│ startDate            │
│ endDate              │
│ location             │
│ category             │
│ capacity             │
│ welcomeMessage       │
│ displayDuration      │
│ enableSound          │
│ checkInDesks         │
│ storageDays          │
│ status               │
│ createdAt            │
└──────────┬───────────┘
           │
     ┌─────┴─────┬──────────────┬──────────────┐
     │           │              │              │
     ▼           ▼              ▼              ▼
┌─────────┐ ┌─────────┐  ┌───────────┐  ┌────────────┐
│TicketType│ │Booth   │  │MenuCategory│  │Participant │
├─────────┤ ├─────────┤  ├───────────┤  ├────────────┤
│id       │ │id       │  │id         │  │id          │
│eventId  │ │eventId  │  │eventId    │  │eventId     │
│name     │ │name     │  │name       │  │tenantId    │
│price    │ │type     │  │type       │  │name        │
│quota    │ │isActive │  │           │  │email       │
│maxFood  │ └────┬────┘  └─────┬─────┘  │phone       │
│maxDrink │      │             │        │qrCode      │
│features │      │             │        │ticketType  │
└─────────┘      │             │        │isCheckedIn │
                 │             │        │photoUrl    │
                 │             │        │aiPhotoUrl  │
                 │             │        │bio         │
                 │             │        └──────┬─────┘
                 │             │               │
                 │             ▼               │
                 │       ┌───────────┐         │
                 │       │ MenuItem  │         │
                 │       ├───────────┤         │
                 │       │id         │         │
                 │       │categoryId │         │
                 │       │name       │         │
                 │       │stock      │         │
                 │       └─────┬─────┘         │
                 │             │               │
                 └──────┬──────┘               │
                        │                      │
                        ▼                      │
                 ┌───────────┐                 │
                 │   Claim   │                 │
                 ├───────────┤                 │
                 │id         │                 │
                 │eventId    │                 │
                 │participantId◄───────────────┘
                 │menuItemId │
                 │boothId    │
                 │claimedAt  │
                 └───────────┘

┌───────────────────┐
│     Checkin       │
├───────────────────┤
│ id                │
│ eventId           │
│ participantId     │
│ deskNumber        │
│ operatorId        │
│ checkedInAt       │
└───────────────────┘

┌───────────────────┐       ┌───────────────────┐
│    DisplayQueue   │       │     ScanLog       │
├───────────────────┤       ├───────────────────┤
│ id                │       │ id                │
│ eventId           │       │ tenantId          │
│ participantId     │       │ eventId           │
│ name              │       │ participantId     │
│ photoUrl          │       │ type              │
│ isDisplayed       │       │ result            │
│ createdAt         │       │ device            │
└───────────────────┘       │ createdAt         │
                            └───────────────────┘
```

---

## 6. 📊 3 DASHBOARD DETAIL

### A. SUPER ADMIN DASHBOARD

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  🏢 SUPER ADMIN DASHBOARD - Pemilik Platform SaaS                           │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │ Total EO     │  │ Active EO    │  │ Revenue      │  │ Pending      │    │
│  │    45        │  │    38        │  │ Rp 125jt     │  │    7         │    │
│  │ registered   │  │ this month   │  │ this month   │  │ approval     │    │
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘    │
│                                                                              │
│  ─────────────────────────────────────────────────────────────────────────  │
│                                                                              │
│  📋 EO / TENANT LIST                                                         │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │ EO Name          │ Status   │ Events │ Credits │ Revenue │ Action │    │
│  ├──────────────────┼──────────┼────────┼─────────┼─────────┼────────┤    │
│  │ PT Event Pro     │ Active   │ 12     │ 5,500   │ Rp 2jt  │ [👁]   │    │
│  │ Music Fest ID    │ Active   │ 5      │ 2,300   │ Rp 1jt  │ [👁]   │    │
│  │ Tech Conf        │ Pending  │ 0      │ 550     │ -       │ [✓][✗]│    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
│  ─────────────────────────────────────────────────────────────────────────  │
│                                                                              │
│  💳 BILLING & PAYMENTS                                                       │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │ Date       │ EO Name      │ Type     │ Amount   │ Status    │ ...  │    │
│  ├────────────┼──────────────┼──────────┼──────────┼───────────┼──────┤    │
│  │ 2024-02-15 │ PT Event Pro │ Top-up   │ Rp 500k  │ Paid      │ [👁] │    │
│  │ 2024-02-14 │ Music Fest   │ Top-up   │ Rp 250k  │ Paid      │ [👁] │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### B. EO OWNER DASHBOARD

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  🎪 DASHBOARD EO - Event Organizer Owner                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │ 💰 Credits   │  │ 📅 Events    │  │ 👥 Total     │  │ ✅ Check-ins │    │
│  │    550       │  │     2        │  │   1,234      │  │    567       │    │
│  │ (500+50 bonus)│ │   Active     │  │ Participants │  │   Today      │    │
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘    │
│                                                                              │
│  ─────────────────────────────────────────────────────────────────────────  │
│                                                                              │
│  📋 MY EVENTS                                                                │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │ Event Name       │ Date       │ Status │ Participants │ Action     │    │
│  ├──────────────────┼────────────┼────────┼──────────────┼────────────┤    │
│  │ Tech Conference  │ 2024-02-15 │ Active │ 234/500      │ [⚙️][📊][👁]│    │
│  │ Music Festival   │ 2024-02-20 │ Draft  │ 0/1000       │ [⚙️][🗑️]  │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
│  [+ CREATE NEW EVENT]                                                        │
│                                                                              │
│  ─────────────────────────────────────────────────────────────────────────  │
│                                                                              │
│  👥 MY CREW / PANITIA                                                        │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │ Name         │ Email           │ Role    │ Assigned To │ Action    │    │
│  ├──────────────┼─────────────────┼─────────┼─────────────┼───────────┤    │
│  │ John Doe     │ john@mail.com   │ Admin   │ All Events  │ [✏️][🗑️] │    │
│  │ Jane Smith   │ jane@mail.com   │ Crew    │ Tech Conf   │ [✏️][🗑️] │    │
│  │ Bob Wilson   │ bob@mail.com    │ Crew    │ Tech Conf   │ [✏️][🗑️] │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
│  [+ INVITE CREW]                                                             │
│                                                                              │
│  ─────────────────────────────────────────────────────────────────────────  │
│                                                                              │
│  💳 CREDIT & BILLING                                                         │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │ Balance: 550 credits (500 + 50 bonus)                               │    │
│  │                                                                      │    │
│  │ Top-up Packages:                                                     │    │
│  │ ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐        │    │
│  │ │ Starter    │ │ Growth     │ │ Business   │ │ Enterprise │        │    │
│  │ │ 500 cr     │ │ 2.500 cr   │ │ 5.000 cr   │ │ 25.000 cr  │        │    │
│  │ │ Rp 50k     │ │ Rp 225k    │ │ Rp 400k    │ │ Rp 1.75jt  │        │    │
│  │ │ [Buy]      │ │ [Buy]      │ │ [Buy]      │ │ [Buy]      │        │    │
│  │ └────────────┘ └────────────┘ └────────────┘ └────────────┘        │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### C. CREW / PANITIA DASHBOARD

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  👷 DASHBOARD CREW / PANITIA                                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  Event: Tech Conference 2024                                                │
│  Role: Check-in Staff                                                       │
│                                                                              │
│  ┌────────────────────────────┐  ┌────────────────────────────┐            │
│  │                            │  │                            │            │
│  │      🎫 CHECK-IN           │  │      🍔 F&B CLAIM          │            │
│  │      SCANNER               │  │      SCANNER               │            │
│  │                            │  │                            │            │
│  │   [📷 OPEN SCANNER]        │  │   [📷 OPEN SCANNER]        │            │
│  │                            │  │                            │            │
│  │   Scan QR Code peserta     │  │   Scan QR Code untuk       │            │
│  │   untuk check-in           │  │   klaim makanan/minuman    │            │
│  │                            │  │                            │            │
│  └────────────────────────────┘  └────────────────────────────┘            │
│                                                                              │
│  ─────────────────────────────────────────────────────────────────────────  │
│                                                                              │
│  📊 TODAY'S STATS                                                            │
│                                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                       │
│  │ Check-ins    │  │ F&B Claims   │  │ Remaining    │                       │
│  │    127       │  │     89       │  │    107       │                       │
│  │ today        │  │ today        │  │ participants │                       │
│  └──────────────┘  └──────────────┘  └──────────────┘                       │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 7. ❓ PERTANYAAN TAMBAHAN

Sebelum saya finalisasi PRD, ada beberapa pertanyaan:

| # | Pertanyaan | Jawaban |
|---|------------|---------|
| 1 | Super Admin itu manual di-set di database atau ada UI khusus? | ⬐ Manual  ⬐ Ada UI |
| 2 | EO Owner bisa invite crew via email? | ⬜ Ya  ⬐ Tidak |
| 3 | Crew bisa di-assign ke event tertentu saja? | ⬜ Ya  ⬐ Tidak (semua event) |
| 4 | F&B limits per tipe tiket atau per participant? | ⬐ Per tipe tiket  ⬐ Per participant |
| 5 | Harga tiket wajib diisi atau bisa gratis? | ⬜ Wajib  ⬐ Bisa gratis |

---

## 8. ✅ KONFIRMASI

Apakah PRD ini sudah sesuai dengan yang Anda inginkan?

- [ ] Login Google OAuth Only
- [ ] User baru dapat 500 credit + 50 bonus
- [ ] 3 Dashboard: Super Admin, EO Owner, Crew
- [ ] Event Setup 5 Segments
- [ ] F&B Configurable per event/ticket
- [ ] Credit System dengan Midtrans
- [ ] Multi-tenant (banyak EO)

**Jika sudah sesuai, saya akan mulai implementasi!** 🚀
