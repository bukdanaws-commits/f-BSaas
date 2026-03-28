# 🎯 WORKFLOW DISKUSI - Login, Dashboard & Setup Event

## 📋 Daftar Isi
1. [Overview Sistem](#1-overview-sistem)
2. [Login dengan Google ID](#2-login-dengan-google-id)
3. [Dashboard EO & Credit System](#3-dashboard-eo--credit-system)
4. [Setup Event - Multi Segment](#4-setup-event---multi-segment)
5. [F&B Claim Settings](#5-fb-claim-settings)
6. [Pertanyaan Diskusi](#6-pertanyaan-diskusi)

---

## 1. Overview Sistem

### 🔄 Complete User Journey

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        USER JOURNEY FLOW                                     │
└─────────────────────────────────────────────────────────────────────────────┘

┌──────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   LOGIN      │     │  DASHBOARD   │     │  SETUP       │     │  EVENT       │
│  Google ID   │ ──► │     EO       │ ──► │   EVENT      │ ──► │   LIVE       │
│              │     │  +500 Credit │     │  (Segments)  │     │              │
└──────────────┘     └──────────────┘     └──────────────┘     └──────────────┘
       │                    │                    │                    │
       ▼                    ▼                    ▼                    ▼
  - Google OAuth      - Overview           - Segment 1:          - Registration
  - Auto create       - Credit wallet        Event Info           - Check-in
    account           - Quick stats        - Segment 2:          - F&B Claims
  - Create tenant       - Menu access         F&B Settings        - Reports
                       - Create event       - Segment 3:
                                             Display Settings
```

---

## 2. Login dengan Google ID

### 🔐 Login Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        LOGIN PAGE                                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│                     ┌───────────────────────────────┐                       │
│                     │                               │                       │
│                     │         🎫                    │                       │
│                     │                               │                       │
│                     │    EVENT MANAGEMENT           │                       │
│                     │    SYSTEM                     │                       │
│                     │                               │                       │
│                     └───────────────────────────────┘                       │
│                                                                              │
│                                                                              │
│              ┌─────────────────────────────────────────┐                    │
│              │                                         │                    │
│              │    🔑 SIGN IN WITH GOOGLE               │                    │
│              │                                         │                    │
│              │    [   🔵 Sign in with Google   ]       │                    │
│              │                                         │                    │
│              └─────────────────────────────────────────┘                    │
│                                                                              │
│                                                                              │
│              By signing in, you agree to our Terms of Service               │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘

                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                        GOOGLE OAUTH POPUP                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│              Select your Google Account:                                     │
│                                                                              │
│              ┌─────────────────────────────────────────┐                    │
│              │  👤 John Doe                            │                    │
│              │  john.doe@gmail.com                     │                    │
│              └─────────────────────────────────────────┘                    │
│                                                                              │
│              ┌─────────────────────────────────────────┐                    │
│              │  👤 Jane Smith                          │                    │
│              │  jane.smith@company.com                 │                    │
│              └─────────────────────────────────────────┘                    │
│                                                                              │
│              [ Use another account ]                                         │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 📊 Login Process Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        LOGIN PROCESS                                         │
└─────────────────────────────────────────────────────────────────────────────┘

User Click "Sign in with Google"
            │
            ▼
┌───────────────────────┐
│ Google OAuth Flow     │
│ - Request permission  │
│ - Get user info       │
│   (email, name,       │
│    avatar)            │
└───────────┬───────────┘
            │
            ▼
┌───────────────────────┐
│ Check if user exists  │
│ in database           │
└───────────┬───────────┘
            │
       ┌────┴────┐
       │         │
       ▼         ▼
┌──────────┐  ┌──────────┐
│ NEW USER │  │ EXISTING │
│          │  │  USER    │
└────┬─────┘  └────┬─────┘
     │              │
     ▼              │
┌───────────────────┐│
│ Create User       ││
│ - id              ││
│ - email           ││
│ - name            ││
│ - avatar_url      ││
└───────┬───────────┘│
        │            │
        ▼            │
┌───────────────────┐│
│ Create Tenant     ││
│ - id              ││
│ - name (company)  ││
│ - owner_id        ││
│ - status: active  ││
└───────┬───────────┘│
        │            │
        ▼            │
┌───────────────────┐│
│ Create Wallet     ││
│ - tenant_id       ││
│ - balance: 500    ││  ← BONUS 500 CREDITS
│ - bonus: 50       ││  ← BONUS TAMBAHAN
└───────┬───────────┘│
        │            │
        ▼            │
┌───────────────────┐│
│ Create Membership ││
│ - user_id         ││
│ - tenant_id       ││
│ - role: owner     ││
└───────┬───────────┘│
        │            │
        └─────┬──────┘
              │
              ▼
┌───────────────────────┐
│ Redirect to Dashboard │
│ - Create Session      │
│ - Set JWT Token       │
└───────────────────────┘
```

### ❓ Pertanyaan Login

| # | Pertanyaan | Pilihan |
|---|------------|---------|
| 1 | User baru otomatis buat tenant? | ⬜ Ya  ⬜ Tidak (isi form dulu) |
| 2 | Nama tenant default? | ⬜ Nama user  ⬜ "My Company"  ⬜ Isi manual |
| 3 | Bonus credit untuk user baru? | ⬜ 500 credits  ⬜ 1000 credits  ⬜ Lainnya |
| 4 | Bonus tambahan? | ⬜ 50 bonus  ⬜ 100 bonus  ⬜ Tidak ada |
| 5 | User bisa punya banyak tenant? | ⬜ Ya  ⬜ Tidak (hanya 1) |

---

## 3. Dashboard EO & Credit System

### 📊 Dashboard Layout

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  🏠 DASHBOARD EO                                         👤 John Doe        │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐          │
│  │ 💰 CREDIT        │  │ 📅 EVENTS        │  │ 👥 PARTICIPANTS  │          │
│  │                  │  │                  │  │                  │          │
│  │    550           │  │      2           │  │     234          │          │
│  │  (500 + 50 bonus)│  │   Active         │  │   Total          │          │
│  │                  │  │                  │  │                  │          │
│  │  [+ Top Up]      │  │  [+ Create]      │  │                  │          │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘          │
│                                                                              │
│  ─────────────────────────────────────────────────────────────────────────  │
│                                                                              │
│  📋 MY EVENTS                                                                │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │ Event Name          │ Date       │ Status    │ Participants │ Action│    │
│  ├─────────────────────┼────────────┼───────────┼──────────────┼───────┤    │
│  │ Tech Conference     │ 2024-02-15 │ ✅ Active │    234/500   │ [⚙️]  │    │
│  │ Music Festival      │ 2024-02-20 │ ⏳ Draft  │    0/1000    │ [⚙️]  │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
│  [+ CREATE NEW EVENT]                                                        │
│                                                                              │
│  ─────────────────────────────────────────────────────────────────────────  │
│                                                                              │
│  📊 CREDIT USAGE                                                             │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │ Date       │ Type     │ Amount │ Description                         │    │
│  ├────────────┼──────────┼────────┼─────────────────────────────────────┤    │
│  │ 2024-02-01 │ Bonus    │ +500   │ Welcome bonus                       │    │
│  │ 2024-02-01 │ Bonus    │ +50    │ Early adopter bonus                 │    │
│  │ 2024-02-15 │ Usage    │ -100   │ Create event: Tech Conference       │    │
│  │ 2024-02-15 │ Usage    │ -5     │ 5 participants checked in           │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 💰 Credit System Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        CREDIT SYSTEM                                         │
└─────────────────────────────────────────────────────────────────────────────┘

CREDIT SOURCES:
┌───────────────────┐
│ 💰 Balance        │  ← Untuk check-in, claims
│    500 credits    │
└───────────────────┘
┌───────────────────┐
│ 🎁 Bonus Balance  │  ← Promo, referral
│    50 credits     │
└───────────────────┘

CREDIT USAGE:
┌───────────────────────────────────────────────────────────────┐
│ Activity                    │ Credit Cost                     │
├─────────────────────────────┼─────────────────────────────────┤
│ Create Event                │ -100 credits                    │
│ Participant Check-in        │ -1 credit per check-in          │
│ F&B Claim                   │ -1 credit per claim             │
│ Generate AI Photo           │ -2 credits per photo            │
└─────────────────────────────┴─────────────────────────────────┘

CREDIT PURCHASE PACKAGES:
┌───────────────────────────────────────────────────────────────┐
│ Package       │ Credits │ Price        │ Bonus               │
├───────────────┼─────────┼──────────────┼─────────────────────┤
│ Starter       │ 500     │ Rp 50.000    │ +50 bonus           │
│ Growth        │ 2.500   │ Rp 225.000   │ +250 bonus          │
│ Business      │ 5.000   │ Rp 400.000   │ +500 bonus          │
│ Enterprise    │ 25.000  │ Rp 1.750.000 │ +2.500 bonus        │
└───────────────┴─────────┴──────────────┴─────────────────────┘
```

### ❓ Pertanyaan Credit System

| # | Pertanyaan | Pilihan |
|---|------------|---------|
| 1 | Biaya create event? | ⬜ 100 credits  ⬜ 50 credits  ⬜ Gratis |
| 2 | Biaya per check-in? | ⬜ 1 credit  ⬜ 0.5 credit  ⬐ Gratis |
| 3 | Biaya per F&B claim? | ⬜ 1 credit  ⬜ Gratis |
| 4 | Biaya AI photo? | ⬜ 2 credits  ⬜ 5 credits  ⬐ Gratis |
| 5 | Credit bisa expire? | ⬜ Ya (1 tahun)  ⬐ Tidak |
| 6 | Bonus credit dipakai dulu? | ⬜ Ya  ⬐ Tidak (balance dulu) |

---

## 4. Setup Event - Multi Segment

### 🎯 Event Setup Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        CREATE NEW EVENT                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  Progress: ████████░░░░░░░░ 33%                                             │
│                                                                              │
│  ┌─────────┐   ┌─────────┐   ┌─────────┐   ┌─────────┐   ┌─────────┐       │
│  │   1     │   │   2     │   │   3     │   │   4     │   │   5     │       │
│  │ EVENT   │──▶│  F&B    │   │ DISPLAY │   │ FORM    │   │ REVIEW  │       │
│  │  INFO   │   │ SETTING │   │SETTING  │   │ CUSTOM  │   │ & SAVE  │       │
│  └─────────┘   └─────────┘   └─────────┘   └─────────┘   └─────────┘       │
│     Active        Pending       Pending       Pending       Pending         │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 📝 SEGMENT 1: Event Info

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  SEGMENT 1: EVENT INFO                                                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                                                                      │    │
│  │  EVENT BANNER                                                        │    │
│  │  ┌─────────────────────────────────────────────────────────────┐    │    │
│  │  │                                                              │    │    │
│  │  │           [DRAG & DROP BANNER IMAGE]                         │    │    │
│  │  │                                                              │    │    │
│  │  │                  atau                                        │    │    │
│  │  │                                                              │    │    │
│  │  │               [📁 PILIH FILE]                                │    │    │
│  │  │                                                              │    │    │
│  │  │        Recommended: 1920x600px (JPG, PNG)                    │    │    │
│  │  │                                                              │    │    │
│  │  └─────────────────────────────────────────────────────────────┘    │    │
│  │                                                                      │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
│  ─────────────────────────────────────────────────────────────────────────  │
│                                                                              │
│  Nama Event *           [________________________________]                  │
│                         Contoh: Tech Conference 2024                        │
│                                                                              │
│  Judul / Tagline *      [________________________________]                  │
│                         Contoh: Innovate. Inspire. Impact.                  │
│                                                                              │
│  Deskripsi *            ┌──────────────────────────────────────────────┐    │
│                         │                                              │    │
│                         │  Event tahunan untuk para profesional...     │    │
│                         │                                              │    │
│                         └──────────────────────────────────────────────┘    │
│                                                                              │
│  ─────────────────────────────────────────────────────────────────────────  │
│                                                                              │
│  Tanggal Mulai *        [📅 15 Februari 2024]  Jam: [08:00]                │
│                                                                              │
│  Tanggal Selesai *      [📅 15 Februari 2024]  Jam: [18:00]                │
│                                                                              │
│  Lokasi *               [________________________________]                  │
│                         Contoh: Jakarta Convention Center                   │
│                                                                              │
│  ─────────────────────────────────────────────────────────────────────────  │
│                                                                              │
│  Kategori Event *       [Conference ▼]                                      │
│                         ┌────────────────────────────────────────┐          │
│                         │ Conference                            │          │
│                         │ Seminar                               │          │
│                         │ Workshop                              │          │
│                         │ Festival                              │          │
│                         │ Exhibition                            │          │
│                         │ Gathering                             │          │
│                         └────────────────────────────────────────┘          │
│                                                                              │
│  Kapasitas Peserta *    [________] orang                                    │
│                                                                              │
│  ─────────────────────────────────────────────────────────────────────────  │
│                                                                              │
│  Tipe Tiket:                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │  ☑️ VIP           Harga: [Rp 500.000]    Kuota: [100]              │    │
│  │  ☑️ Regular       Harga: [Rp 250.000]    Kuota: [300]              │    │
│  │  ☐ Student       Harga: [Rp 100.000]    Kuota: [100]              │    │
│  │  ☐ Speaker       Harga: [Gratis]         Kuota: [20]               │    │
│  │                                                                      │    │
│  │  [+ Tambah Tipe Tiket]                                               │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
│                                              [Selanjutnya: F&B Settings →]  │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### ❓ Pertanyaan Segment 1

| # | Pertanyaan | Pilihan |
|---|------------|---------|
| 1 | Banner wajib? | ⬜ Ya  ⬐ Tidak (ada default) |
| 2 | Kategori event ada apa saja? | ⬐ Conference, Seminar, Workshop, Festival, Exhibition, Gathering, Lainnya |
| 3 | Maksimal kapasitas? | ⬜ 1000  ⬜ 5000  ⬐ Unlimited |
| 4 | Tipe tiket bisa custom? | ⬜ Ya (tambah sendiri)  ⬐ Tidak (fixed) |
| 5 | Harga tiket wajib isi? | ⬜ Ya  ⬐ Tidak (bisa gratis) |

---

## 5. F&B Claim Settings

### 🍔 SEGMENT 2: F&B Settings

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  SEGMENT 2: F&B CLAIM SETTINGS                                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  Progress: ████████████████░░ 50%                                           │
│                                                                              │
│  ┌─────────┐   ┌─────────┐   ┌─────────┐   ┌─────────┐   ┌─────────┐       │
│  │   1     │   │   2     │   │   3     │   │   4     │   │   5     │       │
│  │ EVENT   │   │  F&B    │──▶│ DISPLAY │   │ FORM    │   │ REVIEW  │       │
│  │  INFO   │   │ SETTING │   │SETTING  │   │ CUSTOM  │   │ & SAVE  │       │
│  └─────────┘   └─────────┘   └─────────┘   └─────────┘   └─────────┘       │
│     Done          Active        Pending       Pending       Pending         │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│  🍔 KLAIM MAKANAN                                                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  Aktifkan Klaim Makanan?  [✓] Ya                                             │
│                                                                              │
│  Jumlah Klaim Makanan per Peserta:                                          │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                                                                      │    │
│  │  Maksimal Klaim:  [4] jenis makanan                                 │    │
│  │                                                                      │    │
│  │  ☑️ Peserta hanya bisa klaim 1x per jenis makanan                   │    │
│  │  ☐ Peserta bisa klaim berapapun sampai quota habis                  │    │
│  │                                                                      │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
│  ─────────────────────────────────────────────────────────────────────────  │
│                                                                              │
│  📋 DAFTAR MENU MAKANAN:                                                     │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │ No │ Nama Menu        │ Kategori  │ Stok   │ Status    │ Action    │    │
│  ├────┼───────────────────┼───────────┼────────┼───────────┼───────────┤    │
│  │ 1  │ Nasi Goreng      │ Makanan   │ 500    │ ✅ Active │ [✏️] [🗑️]│    │
│  │ 2  │ Mie Goreng       │ Makanan   │ 500    │ ✅ Active │ [✏️] [🗑️]│    │
│  │ 3  │ Ayam Bakar       │ Makanan   │ 300    │ ✅ Active │ [✏️] [🗑️]│    │
│  │ 4  │ Sate Ayam        │ Makanan   │ 400    │ ✅ Active │ [✏️] [🗑️]│    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
│  [+ TAMBAH MAKANAN]                                                          │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│  🥤 KLAIM MINUMAN                                                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  Aktifkan Klaim Minuman? [✓] Ya                                              │
│                                                                              │
│  Jumlah Klaim Minuman per Peserta:                                          │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                                                                      │    │
│  │  Maksimal Klaim:  [2] jenis minuman                                 │    │
│  │                                                                      │    │
│  │  ☑️ Peserta hanya bisa klaim 1x per jenis minuman                   │    │
│  │  ☐ Peserta bisa klaim berapapun sampai quota habis                  │    │
│  │                                                                      │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
│  ─────────────────────────────────────────────────────────────────────────  │
│                                                                              │
│  📋 DAFTAR MENU MINUMAN:                                                     │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │ No │ Nama Menu        │ Kategori  │ Stok   │ Status    │ Action    │    │
│  ├────┼───────────────────┼───────────┼────────┼───────────┼───────────┤    │
│  │ 1  │ Air Mineral      │ Minuman   │ 1000   │ ✅ Active │ [✏️] [🗑️]│    │
│  │ 2  │ Es Teh Manis     │ Minuman   │ 500    │ ✅ Active │ [✏️] [🗑️]│    │
│  │ 3  │ Jus Jeruk        │ Minuman   │ 300    │ ✅ Active │ [✏️] [🗑️]│    │
│  │ 4  │ Kopi             │ Minuman   │ 200    │ ✅ Active │ [✏️] [🗑️]│    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
│  [+ TAMBAH MINUMAN]                                                          │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│  🏪 BOOTH SETTINGS                                                           │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  Aktifkan Multi Booth?  [✓] Ya                                               │
│                                                                              │
│  📋 DAFTAR BOOTH:                                                            │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │ No │ Nama Booth      │ Lokasi        │ Menu Tersedia    │ Action   │    │
│  ├────┼─────────────────┼───────────────┼──────────────────┼──────────┤    │
│  │ 1  │ Booth A         │ Main Hall     │ Semua Menu       │ [✏️][🗑️]│    │
│  │ 2  │ Booth B         │ Lobby         │ Minuman Only     │ [✏️][🗑️]│    │
│  │ 3  │ Booth C         │ Outdoor       │ Makanan Only     │ [✏️][🗑️]│    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
│  [+ TAMBAH BOOTH]                                                            │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘

                                    │
                                    ▼
                    [← Kembali]              [Selanjutnya: Display Settings →]
```

### 📊 F&B Summary Preview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  📊 F&B SUMMARY                                                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  Berdasarkan 500 peserta dengan setting di atas:                            │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                                                                      │    │
│  │  🍔 MAKANAN                                                          │    │
│  │  ├── Max klaim per peserta: 4 jenis                                 │    │
│  │  ├── Total menu tersedia: 4 jenis                                   │    │
│  │  └── Estimasi total klaim: 500 × 4 = 2000 klaim                     │    │
│  │                                                                      │    │
│  │  🥤 MINUMAN                                                          │    │
│  │  ├── Max klaim per peserta: 2 jenis                                 │    │
│  │  ├── Total menu tersedia: 4 jenis                                   │    │
│  │  └── Estimasi total klaim: 500 × 2 = 1000 klaim                     │    │
│  │                                                                      │    │
│  │  🏪 BOOTH                                                            │    │
│  │  └── Total booth: 3                                                 │    │
│  │                                                                      │    │
│  │  💰 ESTIMASI CREDIT YANG DIBUTUHKAN                                 │    │
│  │  └── Total: 3000 credits (check-in + claims)                        │    │
│  │                                                                      │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### ❓ Pertanyaan Segment 2

| # | Pertanyaan | Pilihan |
|---|------------|---------|
| 1 | Default max klaim makanan? | ⬐ 4 jenis |
| 2 | Default max klaim minuman? | ⬐ 2 jenis |
| 3 | Bisa klaim lebih dari 1x per jenis? | ⬐ Tidak  ⬐ Ya |
| 4 | Booth wajib diisi? | ⬐ Ya  ⬐ Tidak (ada default) |
| 5 | Menu bisa di-import dari Excel? | ⬐ Ya  ⬐ Tidak |
| 6 | Stok bisa di-update saat event? | ⬐ Ya  ⬐ Tidak |
| 7 | Ada alert jika stok hampir habis? | ⬐ Ya  ⬐ Tidak |

---

## 6. Pertanyaan Diskusi

### 🔥 PERTANYAAN UTAMA

#### A. Login & Registration

| # | Pertanyaan | Jawaban Anda |
|---|------------|--------------|
| A1 | Hanya Google login atau ada opsi lain (email/password)? | ⬐ Google Only  ⬐ Ada opsi lain |
| A2 | User baru otomatis dapat 500 credit + 50 bonus? | ⬐ Ya  ⬐ Tidak |
| A3 | Bisa daftar tanpa buat tenant dulu? | ⬐ Ya  ⬐ Tidak |
| A4 | Perlu verifikasi email setelah daftar? | ⬐ Ya  ⬐ Tidak |

#### B. Credit System

| # | Pertanyaan | Jawaban Anda |
|---|------------|--------------|
| B1 | Credit untuk apa saja? | ⬐ Check-in, F&B Claim, AI Photo |
| B2 | Biaya create event berapa? | ⬐ 100 credits |
| B3 | Biaya check-in berapa? | ⬐ 1 credit |
| B4 | Biaya F&B claim berapa? | ⬐ 1 credit  ⬐ Gratis |
| B5 | Payment gateway untuk top-up? | ⬐ Midtrans  ⬐ Xendit  ⬐ Manual |

#### C. Event Setup

| # | Pertanyaan | Jawaban Anda |
|---|------------|--------------|
| C1 | Ada berapa segment dalam setup event? | ⬐ 5 segment (Info, F&B, Display, Form, Review) |
| C2 | Bisa skip segment? | ⬐ Ya (opsional)  ⬐ Tidak (semua wajib) |
| C3 | Bisa edit setelah event aktif? | ⬐ Ya (terbatas)  ⬐ Tidak |
| C4 | Bisa duplicate event? | ⬐ Ya  ⬐ Tidak |

#### D. F&B System

| # | Pertanyaan | Jawaban Anda |
|---|------------|--------------|
| D1 | Default klaim makanan = 4, minuman = 2? | ⬐ Ya  ⬐ Ubah |
| D2 | Klaim per jenis atau per item? | ⬐ Per jenis (1x per menu) |
| D3 | Stok real-time update? | ⬐ Ya |
| D4 | Booth bisa punya menu berbeda? | ⬐ Ya |

#### E. Display Settings

| # | Pertanyaan | Jawaban Anda |
|---|------------|--------------|
| E1 | Ada segment Display Settings? | ⬐ Ya (segment 3) |
| E2 | Setting apa saja? | ⬐ Welcome message, durasi tampil, sound |

#### F. Form Custom

| # | Pertanyaan | Jawaban Anda |
|---|------------|--------------|
| F1 | Ada segment Form Custom? | ⬐ Ya (segment 4) |
| F2 | Field apa yang bisa ditambah? | ⬐ Text, Select, Checkbox, etc |

---

## 7. Summary Flow (Setelah Diskusi)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        FINAL WORKFLOW (Draft)                                │
└─────────────────────────────────────────────────────────────────────────────┘

1. LOGIN
   └── Google OAuth → Auto create user + tenant → Bonus 550 credits

2. DASHBOARD EO
   ├── Overview stats
   ├── Credit balance & usage
   ├── My events list
   └── Quick actions (create event, top up)

3. CREATE EVENT (5 Segments)
   │
   ├── Segment 1: EVENT INFO
   │   ├── Banner image
   │   ├── Nama event
   │   ├── Judul / Tagline
   │   ├── Deskripsi
   │   ├── Tanggal (mulai & selesai)
   │   ├── Lokasi
   │   ├── Kategori
   │   ├── Kapasitas
   │   └── Tipe tiket (VIP, Regular, etc)
   │
   ├── Segment 2: F&B SETTINGS
   │   ├── Makanan (max 4 klaim per peserta)
   │   │   └── Menu list + stock
   │   ├── Minuman (max 2 klaim per peserta)
   │   │   └── Menu list + stock
   │   └── Booth settings
   │
   ├── Segment 3: DISPLAY SETTINGS
   │   ├── Welcome message
   │   ├── Display duration (5 detik)
   │   ├── Sound effect (on/off)
   │   └── Display theme
   │
   ├── Segment 4: FORM CUSTOM
   │   └── Additional fields for registration
   │
   └── Segment 5: REVIEW & SAVE
       ├── Summary all settings
       ├── Credit calculation
       └── Create event

4. EVENT LIVE
   ├── Registration page (public)
   ├── Check-in screen (display)
   ├── Scanner app (mobile)
   ├── F&B booth app (mobile)
   └── Reports & analytics

```

---

## 📝 SILAKAN JAWAB PERTANYAAN DI ATAS

Format jawaban:
```
A1: Google Only
A2: Ya
A3: Tidak
A4: Tidak

B1: Check-in & AI Photo
B2: 100 credits
B3: 1 credit
B4: Gratis
B5: Midtrans

C1: 5 segment
C2: Ya, F&B & Display opsional
C3: Ya (terbatas)
C4: Ya

D1: Ya
D2: Per jenis (1x per menu)
D3: Ya
D4: Ya

E1: Ya
E2: Welcome message, durasi, sound

F1: Ya
F2: Text, Select, Checkbox, Radio, File Upload
```

Setelah jawab, saya akan finalize workflow dan mulai implementasi! 🚀
