# 🎫 F&B Event Management System - Rancangan Sistem

## 📋 Daftar Isi
1. [Gambaran Umum Sistem](#1-gambaran-umum-sistem)
2. [Arsitektur Sistem](#2-arsitektur-sistem)
3. [Database Schema](#3-database-schema)
4. [Role & Permission](#4-role--permission)
5. [Modul & Fitur](#5-modul--fitur)
6. [Dashboard Design](#6-dashboard-design)
7. [API Endpoints](#7-api-endpoints)
8. [Real-time Features](#8-real-time-features)

---

## 1. Gambaran Umum Sistem

### 🎯 Tujuan Sistem
Sistem manajemen event terintegrasi untuk Event Organizer (EO) dengan fitur:
- **Check-in QR Code** - Cepat & anti double scan
- **Credit System** - Pembayaran per check-in
- **F&B Management** - Tracking stok & klaim makanan
- **Multi-tenant** - Isolasi data per EO
- **Real-time Dashboard** - Monitoring live event

### 👥 Target Pengguna
| Role | Deskripsi |
|------|-----------|
| **Super Admin** | Admin platform, kelola semua EO |
| **Owner EO** | Pemilik EO, akses penuh tenant |
| **Admin Event** | Kelola event & peserta |
| **Crew Check-in** | Scan QR check-in |
| **Crew Booth** | Klaim F&B di booth |

---

## 2. Arsitektur Sistem

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND (Next.js 16)                    │
├─────────────┬─────────────┬─────────────┬─────────────────────────┤
│   Admin EO  │  Crew App   │  Scanner    │   Public Registration   │
│   Dashboard │   Mobile    │   QR App    │        Page             │
└──────┬──────┴──────┬──────┴──────┬──────┴───────────┬─────────────┘
       │             │             │                  │
       ▼             ▼             ▼                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                        API GATEWAY                               │
│                    (Next.js API Routes)                          │
└───────────────────────────┬─────────────────────────────────────┘
                            │
       ┌────────────────────┼────────────────────┐
       ▼                    ▼                    ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────────┐
│  REST API   │    │  WebSocket  │    │   Auth API      │
│  Endpoints  │    │   Server    │    │  (NextAuth)     │
└──────┬──────┘    └──────┬──────┘    └────────┬────────┘
       │                  │                    │
       ▼                  ▼                    ▼
┌─────────────────────────────────────────────────────────────────┐
│                     DATABASE (SQLite/Prisma)                     │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐   │
│  │ Users   │ │ Tenants │ │ Events  │ │Partici- │ │ Claims  │   │
│  │         │ │         │ │         │ │pants   │ │         │   │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘ └─────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3. Database Schema

### 📊 Entity Relationship Diagram

```
┌──────────────┐       ┌──────────────┐       ┌──────────────┐
│    users     │       │   tenants    │       │  memberships │
├──────────────┤       ├──────────────┤       ├──────────────┤
│ id (PK)      │◄──┐   │ id (PK)      │◄──┐   │ id (PK)      │
│ email        │   │   │ name         │   │   │ user_id (FK) │──►
│ name         │   │   │ slug         │   │   │ tenant_id(FK)│──►
│ avatar_url   │   │   │ owner_id(FK) │──►│   │ role         │
│ created_at   │   │   │ status       │   │   │ created_at   │
└──────────────┘   │   │ phone        │   │   └──────────────┘
                   │   │ address      │   │
                   │   │ verified_at  │   │   ┌──────────────┐
                   │   └──────────────┘   │   │credit_wallets│
                   │                      │   ├──────────────┤
                   │                      │   │ id (PK)      │
                   │                      │   │ tenant_id(FK)│──►
                   │                      │   │ balance      │
                   │                      │   │ bonus_balance│
                   │                      │   └──────────────┘
                   │                      │
                   │   ┌──────────────┐   │   ┌──────────────┐
                   │   │   events     │   │   │credit_trans- │
                   │   ├──────────────┤   │   │   actions    │
                   │   │ id (PK)      │   │   ├──────────────┤
                   │   │ tenant_id(FK)│──►│   │ id (PK)      │
                   │   │ name         │   │   │ tenant_id(FK)│
                   │   │ description  │   │   │ type         │
                   │   │ start_date   │   │   │ amount       │
                   │   │ end_date     │   │   │ reference_id │
                   │   │ location     │   │   └──────────────┘
                   │   └──────────────┘   │
                   │          │           │
                   │          ▼           │
                   │   ┌──────────────┐   │   ┌──────────────┐
                   │   │ participants │   │   │   booths     │
                   │   ├──────────────┤   │   ├──────────────┤
                   │   │ id (PK)      │   │   │ id (PK)      │
                   │   │ tenant_id(FK)│──►│   │ event_id(FK) │──►
                   │   │ event_id(FK) │──►│   │ name         │
                   │   │ name         │   │   │ booth_number │
                   │   │ email        │   │   └──────────────┘
                   │   │ phone        │   │
                   │   │ qr_code      │   │   ┌──────────────┐
                   │   │ is_checked_in│   │   │menu_categories│
                   │   │ checkin_count│   │   ├──────────────┤
                   │   │ ticket_type  │   │   │ id (PK)      │
                   │   │ ticket_price │   │   │ event_id(FK) │
                   │   └──────────────┘   │   │ name         │
                   │          │           │   └──────────────┘
                   │          │           │          │
                   │          ▼           │          ▼
                   │   ┌──────────────┐   │   ┌──────────────┐
                   │   │  checkins    │   │   │ menu_items   │
                   │   ├──────────────┤   │   ├──────────────┤
                   │   │ id (PK)      │   │   │ id (PK)      │
                   │   │ event_id(FK) │──►│   │ event_id(FK) │
                   │   │participant_id│   │   │ category_id  │
                   │   │ operator_id  │──►│   │ name         │
                   │   │checked_in_at │   │   │ stock        │
                   │   └──────────────┘   │   └──────────────┘
                   │                      │          │
                   │                      │          ▼
                   │                      │   ┌──────────────┐
                   │                      │   │   claims     │
                   │                      │   ├──────────────┤
                   │                      │   │ id (PK)      │
                   │                      │   │ event_id(FK) │
                   │                      │   │participant_id│
                   │                      │   │ menu_item_id │
                   │                      │   │ booth_id     │
                   │                      │   │ claimed_at   │
                   │                      │   └──────────────┘
                   │                      │
                   │   ┌──────────────┐   │
                   │   │ event_staff  │   │
                   │   ├──────────────┤   │
                   │   │ id (PK)      │   │
                   │   │ event_id(FK) │──►│
                   │   │ user_id (FK) │──►│
                   │   │ role         │   │
                   │   └──────────────┘   │
                   │                      │
                   │   ┌──────────────┐   │
                   │   │  scan_logs   │   │
                   │   ├──────────────┤   │
                   │   │ id (PK)      │   │
                   │   │ tenant_id(FK)│──►│
                   │   │ event_id(FK) │   │
                   │   │participant_id│   │
                   │   │ scan_type    │   │
                   │   │ result       │   │
                   │   │ device       │   │
                   │   │ created_at   │   │
                   │   └──────────────┘   │
                   └──────────────────────┘
```

### 📋 Detail Tabel

#### **users** - Pengguna sistem
| Field | Type | Description |
|-------|------|-------------|
| id | String (cuid) | Primary key |
| email | String | Email unik untuk login |
| name | String? | Nama lengkap |
| avatar_url | String? | URL foto profil |
| created_at | DateTime | Tanggal pembuatan |

#### **tenants** - EO/Tenant
| Field | Type | Description |
|-------|------|-------------|
| id | String (cuid) | Primary key |
| name | String | Nama EO |
| slug | String? | URL-friendly identifier |
| owner_id | String? | FK ke users |
| status | String | pending/active/suspended |
| verified_at | DateTime? | Tanggal verifikasi |
| phone | String? | Nomor telepon |
| address | String? | Alamat |

#### **memberships** - Keanggotaan user di tenant
| Field | Type | Description |
|-------|------|-------------|
| id | String (cuid) | Primary key |
| user_id | String | FK ke users |
| tenant_id | String | FK ke tenants |
| role | String | owner/admin/crew |

#### **credit_wallets** - Dompet credit EO
| Field | Type | Description |
|-------|------|-------------|
| id | String (cuid) | Primary key |
| tenant_id | String | FK ke tenants (unique) |
| balance | Int | Saldo credit |
| bonus_balance | Int | Saldo bonus |

#### **credit_transactions** - Riwayat transaksi credit
| Field | Type | Description |
|-------|------|-------------|
| id | String (cuid) | Primary key |
| tenant_id | String | FK ke tenants |
| type | String | purchase/usage/bonus/refund |
| amount | Int | Jumlah (negatif untuk usage) |
| reference_type | String? | Tipe referensi |
| reference_id | String? | ID referensi |
| description | String? | Keterangan |

#### **events** - Event
| Field | Type | Description |
|-------|------|-------------|
| id | String (cuid) | Primary key |
| tenant_id | String | FK ke tenants |
| name | String | Nama event |
| description | String? | Deskripsi |
| start_date | DateTime? | Tanggal mulai |
| end_date | DateTime? | Tanggal selesai |
| location | String? | Lokasi |

#### **participants** - Peserta event
| Field | Type | Description |
|-------|------|-------------|
| id | String (cuid) | Primary key |
| tenant_id | String | FK ke tenants |
| event_id | String | FK ke events |
| name | String | Nama peserta |
| email | String? | Email |
| phone | String? | Nomor telepon |
| qr_code | String | QR code unik |
| qr_hash | String? | Hash untuk validasi |
| is_checked_in | Boolean | Status check-in |
| checked_in_at | DateTime? | Waktu check-in |
| checkin_count | Int | Jumlah check-in |
| ticket_type | String? | Tipe tiket |
| ticket_price | Int | Harga tiket |
| is_active | Boolean | Status aktif |
| is_blacklisted | Boolean | Status blacklist |
| meta | Json? | Data tambahan |

#### **checkins** - Log check-in
| Field | Type | Description |
|-------|------|-------------|
| id | String (cuid) | Primary key |
| event_id | String | FK ke events |
| participant_id | String | FK ke participants (unique) |
| operator_id | String? | FK ke users |
| checked_in_at | DateTime | Waktu check-in |

#### **booths** - Booth/Stand F&B
| Field | Type | Description |
|-------|------|-------------|
| id | String (cuid) | Primary key |
| event_id | String | FK ke events |
| name | String | Nama booth |
| booth_number | Int? | Nomor booth |

#### **menu_categories** - Kategori menu F&B
| Field | Type | Description |
|-------|------|-------------|
| id | String (cuid) | Primary key |
| event_id | String | FK ke events |
| name | String | Nama kategori |

#### **menu_items** - Item menu F&B
| Field | Type | Description |
|-------|------|-------------|
| id | String (cuid) | Primary key |
| event_id | String | FK ke events |
| category_id | String? | FK ke menu_categories |
| name | String | Nama item |
| stock | Int | Jumlah stok |

#### **claims** - Klaim F&B
| Field | Type | Description |
|-------|------|-------------|
| id | String (cuid) | Primary key |
| event_id | String | FK ke events |
| participant_id | String | FK ke participants |
| menu_item_id | String | FK ke menu_items |
| booth_id | String? | FK ke booths |
| claimed_at | DateTime | Waktu klaim |

#### **scan_logs** - Log semua scan
| Field | Type | Description |
|-------|------|-------------|
| id | String (cuid) | Primary key |
| tenant_id | String | FK ke tenants |
| event_id | String? | FK ke events |
| participant_id | String? | FK ke participants |
| scan_type | String? | checkin/claim |
| result | String? | success/failed/duplicate |
| device | String? | Info device |
| created_at | DateTime | Waktu scan |

---

## 4. Role & Permission

### 🛡️ Matrix Permission

| Feature | Super Admin | Owner EO | Admin Event | Crew Check-in | Crew Booth |
|---------|-------------|----------|-------------|---------------|------------|
| **Tenant Management** |
| Create Tenant | ✅ | ❌ | ❌ | ❌ | ❌ |
| Edit Tenant | ✅ | ✅ | ❌ | ❌ | ❌ |
| Delete Tenant | ✅ | ❌ | ❌ | ❌ | ❌ |
| View All Tenants | ✅ | ❌ | ❌ | ❌ | ❌ |
| **User Management** |
| Invite User | ✅ | ✅ | ✅ | ❌ | ❌ |
| Remove User | ✅ | ✅ | ❌ | ❌ | ❌ |
| Change Role | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Event Management** |
| Create Event | ✅ | ✅ | ✅ | ❌ | ❌ |
| Edit Event | ✅ | ✅ | ✅ | ❌ | ❌ |
| Delete Event | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Participant Management** |
| Add Participant | ✅ | ✅ | ✅ | ❌ | ❌ |
| Import Participants | ✅ | ✅ | ✅ | ❌ | ❌ |
| Edit Participant | ✅ | ✅ | ✅ | ❌ | ❌ |
| Blacklist Participant | ✅ | ✅ | ✅ | ❌ | ❌ |
| **Check-in** |
| Scan Check-in | ✅ | ✅ | ✅ | ✅ | ❌ |
| View Check-in Stats | ✅ | ✅ | ✅ | ✅ | ❌ |
| **F&B Management** |
| Create Menu | ✅ | ✅ | ✅ | ❌ | ❌ |
| Edit Stock | ✅ | ✅ | ✅ | ❌ | ✅ |
| Claim F&B | ✅ | ✅ | ✅ | ❌ | ✅ |
| **Credit System** |
| View Balance | ✅ | ✅ | ❌ | ❌ | ❌ |
| Purchase Credit | ✅ | ✅ | ❌ | ❌ | ❌ |
| View Transactions | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Reports** |
| View Dashboard | ✅ | ✅ | ✅ | ✅ | ✅ |
| Export Report | ✅ | ✅ | ✅ | ❌ | ❌ |

---

## 5. Modul & Fitur

### 📱 Modul Aplikasi

#### **A. Admin EO Dashboard** (Web)
```
┌─────────────────────────────────────────────────────────────────┐
│  🏠 DASHBOARD UTAMA                                              │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────┐  │
│  │ 📊 Total Events  │  │ 👥 Participants  │  │ 💰 Credits   │  │
│  │      12          │  │      1,234       │  │    5,000     │  │
│  └──────────────────┘  └──────────────────┘  └──────────────┘  │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ 📈 REAL-TIME EVENT METRICS                                   ││
│  │  ┌─────────────────────────────────────────────────────────┐││
│  │  │  Check-in Chart (per menit)                              │││
│  │  │  ▁▂▃▅▇█▇▅▃▂▁                                           │││
│  │  └─────────────────────────────────────────────────────────┘││
│  │                                                              ││
│  │  Active Events: 3   |   Check-ins Today: 456   |   Alerts: 2││
│  └─────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  📅 EVENT MANAGEMENT                                             │
├─────────────────────────────────────────────────────────────────┤
│  [+ Create Event]                                                │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ Event Name          │ Date       │ Status    │ Participants ││
│  ├─────────────────────┼────────────┼───────────┼──────────────┤│
│  │ Tech Conference     │ 2024-02-15 │ Active    │ 350          ││
│  │ Music Festival      │ 2024-02-20 │ Upcoming  │ 500          ││
│  │ Food Fair           │ 2024-02-25 │ Draft     │ 0            ││
│  └─────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  👥 PARTICIPANT MANAGEMENT                                       │
├─────────────────────────────────────────────────────────────────┤
│  [+ Add Participant] [📥 Import CSV] [📤 Export]                │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ 🔍 Search: ________________  Event: [All ▼]  Status: [All▼] ││
│  ├─────────────────────────────────────────────────────────────┤│
│  │ Name       │ Email           │ Event    │ Status    │ Action││
│  ├────────────┼─────────────────┼──────────┼───────────┼───────┤│
│  │ John Doe   │ john@email.com  │ Tech Conf│ Checked In│ [👁]  ││
│  │ Jane Smith │ jane@email.com  │ Tech Conf│ Pending   │ [✏️]  ││
│  └─────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
```

#### **B. Event Live Dashboard** (Real-time)
```
┌─────────────────────────────────────────────────────────────────┐
│  🔴 LIVE: Tech Conference 2024                                   │
├─────────────────────────────────────────────────────────────────┤
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                    ARRIVAL MONITOR                         │  │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────────────┐   │  │
│  │  │ Total      │  │ Last 5min  │  │ Avg/min            │   │  │
│  │  │   234      │  │    12      │  │    3.5             │   │  │
│  │  │ checked in │  │ arrivals   │  │ arrival rate       │   │  │
│  │  └────────────┘  └────────────┘  └────────────────────┘   │  │
│  │                                                            │  │
│  │  Status: 🟢 NORMAL  |  Capacity: 78%                       │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │               ARRIVAL CHART (Last 1 Hour)                  │  │
│  │    ▁▂▃▅▇█▇▅▃▂▁                                           │  │
│  │   10:00  10:10  10:20  10:30  10:40  10:50  11:00        │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  🍔 F&B MONITOR                                                  │
├─────────────────────────────────────────────────────────────────┤
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐     │
│  │ 🍕 Pizza       │  │ 🍔 Burger      │  │ 🥤 Drinks      │     │
│  │ Stock: 100     │  │ Stock: 150     │  │ Stock: 200     │     │
│  │ Used: 67       │  │ Used: 45       │  │ Used: 89       │     │
│  │ ████████░░ 33% │  │ ██████████ 70% │  │ ███████░░ 55%  │     │
│  │ ⚠️ 15 min left │  │ ✅ OK          │  │ ✅ OK          │     │
│  └────────────────┘  └────────────────┘  └────────────────┘     │
│                                                                  │
│  Rate: 2.3 items/min  |  Peak: 5 items/min (10:30)              │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  🚨 ALERTS                                                       │
├─────────────────────────────────────────────────────────────────┤
│  ┌───────────────────────────────────────────────────────────┐  │
│  │ 🔴 SPIKE: Check-in spike detected! 15 check-ins/min      │  │
│  │    (avg: 3.5/min)                          [Dismiss]      │  │
│  ├───────────────────────────────────────────────────────────┤  │
│  │ 🟡 LOW_STOCK: Pizza almost out! 15 minutes remaining     │  │
│  │    Remaining: 33 items                    [Dismiss]      │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

#### **C. Scanner App** (Mobile)
```
┌─────────────────────────────┐
│  📷 QR SCANNER               │
├─────────────────────────────┤
│                             │
│   ┌───────────────────┐     │
│   │                   │     │
│   │   [Camera View]   │     │
│   │                   │     │
│   │   Align QR Code   │     │
│   │   in frame        │     │
│   │                   │     │
│   └───────────────────┘     │
│                             │
│   Event: Tech Conference    │
│   Type: Check-in            │
│                             │
│   [Manual Input]            │
│                             │
└─────────────────────────────┘

┌─────────────────────────────┐
│  ✅ CHECK-IN SUCCESS         │
├─────────────────────────────┤
│                             │
│        ┌─────────┐          │
│        │    ✅   │          │
│        └─────────┘          │
│                             │
│   John Doe                  │
│   john@email.com            │
│                             │
│   Ticket: VIP               │
│   Time: 10:35:22            │
│                             │
│   [Scan Next]               │
│                             │
└─────────────────────────────┘

┌─────────────────────────────┐
│  ⚠️ ALREADY CHECKED IN      │
├─────────────────────────────┤
│                             │
│        ┌─────────┐          │
│        │    ⚠️   │          │
│        └─────────┘          │
│                             │
│   John Doe                  │
│   Already checked in at     │
│   10:15:33                  │
│                             │
│   [Override] [Scan Next]    │
│                             │
└─────────────────────────────┘
```

#### **D. Booth F&B App** (Mobile)
```
┌─────────────────────────────┐
│  🍔 BOOTH #1 - F&B CLAIM     │
├─────────────────────────────┤
│                             │
│   Event: Tech Conference    │
│   Booth: Main F&B           │
│                             │
│   ┌───────────────────┐     │
│   │                   │     │
│   │   [Camera View]   │     │
│   │                   │     │
│   └───────────────────┘     │
│                             │
├─────────────────────────────┤
│  SELECT ITEM TO CLAIM:      │
│                             │
│  [🍕 Pizza] [🍔 Burger]     │
│  [🥤 Drink] [🍰 Cake]       │
│                             │
└─────────────────────────────┘

┌─────────────────────────────┐
│  ✅ CLAIM SUCCESS            │
├─────────────────────────────┤
│                             │
│   John Doe claimed:         │
│   🍕 Pizza Slice            │
│                             │
│   Participant entitlement:  │
│   ✅ Food: Claimed          │
│   ⬜ Drink: Not claimed     │
│                             │
│   Remaining Stock: 32       │
│                             │
│   [Scan Next]               │
│                             │
└─────────────────────────────┘
```

#### **E. Credit System**
```
┌─────────────────────────────────────────────────────────────────┐
│  💰 CREDIT WALLET                                               │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                    BALANCE                               │    │
│  │                       5,000                              │    │
│  │                     Credits                              │    │
│  │                                                          │    │
│  │  + Bonus Balance: 500                                    │    │
│  │  Total Available: 5,500                                  │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
│  [💳 Purchase Credits]                                           │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ PRICING PACKAGES                                         │    │
│  │                                                          │    │
│  │  ┌─────────┐  ┌─────────┐  ┌─────────┐                  │    │
│  │  │ Starter │  │ Growth  │  │ Enterprise│                  │    │
│  │  │ 1,000   │  │ 5,000   │  │ 25,000   │                  │    │
│  │  │ $10     │  │ $45     │  │ $200     │                  │    │
│  │  │[Buy]    │  │[Buy]    │  │[Buy]     │                  │    │
│  │  └─────────┘  └─────────┘  └─────────┘                  │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  📜 TRANSACTION HISTORY                                         │
├─────────────────────────────────────────────────────────────────┤
│  Date       │ Type     │ Amount │ Description                  │
│  ──────────┼──────────┼────────┼─────────────────────────────  │
│  2024-02-15 │ Purchase │ +5000  │ Purchased Growth Package     │
│  2024-02-15 │ Bonus    │ +500   │ Welcome bonus                │
│  2024-02-15 │ Usage    │ -1     │ Check-in: Tech Conference    │
│  2024-02-15 │ Usage    │ -1     │ Check-in: Tech Conference    │
│  2024-02-15 │ Usage    │ -1     │ Check-in: Tech Conference    │
└─────────────────────────────────────────────────────────────────┘
```

---

## 6. Dashboard Design

### 🎨 Layout Structure

```
┌─────────────────────────────────────────────────────────────────┐
│  HEADER                                                          │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ 🏠 Logo    │ [Dashboard] [Events] [Participants] [F&B]   │   │
│  │            │                                [👤 Profile] │   │
│  └──────────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────────┤
│  │                                                              │
│  │                     MAIN CONTENT                             │
│  │                                                              │
│  │  (Dynamic based on selected menu)                            │
│  │                                                              │
│  │                                                              │
│  │                                                              │
│  │                                                              │
│  │                                                              │
│  │                                                              │
│  │                                                              │
│  │                                                              │
├─────────────────────────────────────────────────────────────────┤
│  FOOTER                                                          │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ © 2024 Event Management System                             │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### 📱 Responsive Breakpoints

| Breakpoint | Width | Layout |
|------------|-------|--------|
| Mobile | < 640px | Single column, hamburger menu |
| Tablet | 640px - 1024px | Sidebar collapsible |
| Desktop | > 1024px | Full sidebar visible |

---

## 7. API Endpoints

### 🔌 REST API Structure

```
/api
├── /auth
│   ├── POST   /login              # Login user
│   ├── POST   /logout             # Logout user
│   ├── GET    /session            # Get current session
│   └── POST   /register           # Register new user
│
├── /tenants
│   ├── GET    /                   # List tenants (super admin)
│   ├── POST   /                   # Create tenant
│   ├── GET    /:id                # Get tenant detail
│   ├── PUT    /:id                # Update tenant
│   ├── DELETE /:id                # Delete tenant
│   └── GET    /:id/members        # Get tenant members
│
├── /events
│   ├── GET    /                   # List events
│   ├── POST   /                   # Create event
│   ├── GET    /:id                # Get event detail
│   ├── PUT    /:id                # Update event
│   ├── DELETE /:id                # Delete event
│   ├── GET    /:id/stats          # Get event statistics
│   ├── GET    /:id/metrics        # Get real-time metrics
│   └── GET    /:id/alerts         # Get event alerts
│
├── /participants
│   ├── GET    /                   # List participants
│   ├── POST   /                   # Create participant
│   ├── POST   /import             # Import from CSV
│   ├── GET    /:id                # Get participant detail
│   ├── PUT    /:id                # Update participant
│   ├── DELETE /:id                # Delete participant
│   ├── GET    /qr/:code           # Get by QR code
│   └── GET    /export             # Export participants
│
├── /checkins
│   ├── POST   /                   # Create check-in (scan)
│   ├── GET    /                   # List check-ins
│   ├── GET    /stats              # Check-in statistics
│   ├── GET    /timeseries         # Arrival time series
│   └── POST   /sync               # Offline sync
│
├── /fnb
│   ├── /booths
│   │   ├── GET    /               # List booths
│   │   ├── POST   /               # Create booth
│   │   ├── PUT    /:id            # Update booth
│   │   └── DELETE /:id            # Delete booth
│   │
│   ├── /menu-categories
│   │   ├── GET    /               # List categories
│   │   ├── POST   /               # Create category
│   │   └── DELETE /:id            # Delete category
│   │
│   ├── /menu-items
│   │   ├── GET    /               # List menu items
│   │   ├── POST   /               # Create menu item
│   │   ├── PUT    /:id            # Update menu item
│   │   └── DELETE /:id            # Delete menu item
│   │
│   ├── /claims
│   │   ├── POST   /               # Create claim (scan)
│   │   ├── GET    /               # List claims
│   │   └── GET    /metrics        # F&B metrics
│   │
│   └── GET    /critical           # Get critical items
│
├── /credits
│   ├── GET    /wallet             # Get wallet balance
│   ├── GET    /transactions       # List transactions
│   ├── POST   /purchase           # Purchase credits
│   └── POST   /use                # Use credits
│
├── /users
│   ├── GET    /                   # List users
│   ├── GET    /:id                # Get user detail
│   ├── PUT    /:id                # Update user
│   └── DELETE /:id                # Delete user
│
├── /scan-logs
│   ├── GET    /                   # List scan logs
│   └── GET    /export             # Export logs
│
└── /dashboard
    ├── GET    /summary            # Dashboard summary
    ├── GET    /realtime           # Real-time data
    └── GET    /reports            # Generate reports
```

---

## 8. Real-time Features

### 🔄 WebSocket Events

```javascript
// Connection
ws://localhost:3003/?XTransformPort=3003

// Events
{
  // Check-in Event
  "event": "checkin",
  "data": {
    "eventId": "evt_123",
    "participantId": "prt_456",
    "participantName": "John Doe",
    "checkedInAt": "2024-02-15T10:35:22Z"
  }
}

{
  // Claim Event
  "event": "claim",
  "data": {
    "eventId": "evt_123",
    "menuItemId": "menu_789",
    "menuItemName": "Pizza",
    "remaining": 32
  }
}

{
  // Alert Event
  "event": "alert",
  "data": {
    "eventId": "evt_123",
    "type": "SPIKE",
    "message": "Check-in spike detected!"
  }
}

{
  // Metrics Update
  "event": "metrics",
  "data": {
    "eventId": "evt_123",
    "totalCheckins": 234,
    "checkinsLast5min": 12,
    "avgPerMinute": 3.5
  }
}
```

### 📡 Real-time Subscriptions

| Channel | Description | Events |
|---------|-------------|--------|
| `event:{id}` | Event specific updates | checkin, claim, metrics |
| `alerts:{id}` | Alert notifications | alert |
| `dashboard:{tenant}` | Tenant dashboard | summary, metrics |

---

## 9. Security Considerations

### 🔐 Authentication & Authorization
- **Session-based auth** dengan NextAuth.js
- **JWT tokens** untuk API access
- **Role-based access control** (RBAC)
- **Tenant isolation** untuk multi-tenancy

### 🛡️ Data Security
- **QR Code hashing** untuk validasi
- **Rate limiting** pada scan endpoints
- **Input validation** dengan Zod
- **SQL injection prevention** dengan Prisma

### 📱 Mobile Security
- **Offline capability** dengan local storage
- **Sync mechanism** untuk data consistency
- **Device registration** untuk tracking

---

## 10. Performance Optimization

### ⚡ Database
- **Indexing** pada kolom frequently queried
- **Connection pooling** untuk concurrent connections
- **Query optimization** dengan Prisma

### 🚀 Frontend
- **Server-side rendering** untuk SEO
- **Client-side caching** dengan React Query
- **Lazy loading** untuk components
- **Image optimization** dengan Next.js Image

### 📊 Real-time
- **WebSocket connection pooling**
- **Event batching** untuk mengurangi traffic
- **Heartbeat** untuk connection monitoring

---

## Implementation Priority

### Phase 1 (Core) ✅
1. Database Schema (Prisma)
2. Authentication (NextAuth)
3. Tenant Management
4. Event Management
5. Participant Management
6. Check-in System

### Phase 2 (F&B) 🔄
1. Booth Management
2. Menu Categories & Items
3. Claim System
4. Stock Tracking

### Phase 3 (Analytics) 📊
1. Real-time Dashboard
2. Charts & Metrics
3. Alerts System
4. Reports

### Phase 4 (Enhancement) 🚀
1. Credit System
2. Offline Mode
3. Mobile Apps
4. Notifications

---

*Document Version: 1.0*
*Last Updated: 2024*
