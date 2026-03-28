// =====================================
// MOCK DATA FOR DEVELOPMENT
// SaaS Event Management System
// =====================================

import { User, Tenant, Membership, CreditWallet, CreditTransaction, Event, EventStaff, TicketType, Participant, Checkin, Booth, MenuCategory, MenuItem, Claim, DisplayQueue, ScanLog } from '@/types/database'

// =====================================
// TIMESTAMP HELPERS
// =====================================
const now = new Date().toISOString()
const daysAgo = (days: number) => new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()
const hoursAgo = (hours: number) => new Date(Date.now() - hours * 60 * 60 * 1000).toISOString()
const daysFromNow = (days: number) => new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString()

// =====================================
// UUID HELPERS
// =====================================
const uuid = (prefix: string, num: number) => `${prefix}-${String(num).padStart(8, '0')}-${prefix}`

// =====================================
// USERS
// =====================================
export const mockUsers: User[] = [
  // Super Admin
  {
    id: uuid('user', 1),
    email: 'superadmin@eventify.id',
    name: 'Super Admin',
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=superadmin',
    google_id: 'google-superadmin-001',
    is_super_admin: true,
    created_at: daysAgo(365),
    updated_at: daysAgo(365)
  },
  // EO Owner 1
  {
    id: uuid('user', 2),
    email: 'owner@techconference.id',
    name: 'Budi Santoso',
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=budi',
    google_id: 'google-budi-001',
    is_super_admin: false,
    created_at: daysAgo(180),
    updated_at: daysAgo(180)
  },
  // EO Owner 2
  {
    id: uuid('user', 3),
    email: 'owner@musikfest.id',
    name: 'Siti Rahayu',
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=siti',
    google_id: 'google-siti-001',
    is_super_admin: false,
    created_at: daysAgo(120),
    updated_at: daysAgo(120)
  },
  // Crew/Panitia 1
  {
    id: uuid('user', 4),
    email: 'crew1@techconference.id',
    name: 'Ahmad Wijaya',
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ahmad',
    google_id: null,
    is_super_admin: false,
    created_at: daysAgo(30),
    updated_at: daysAgo(30)
  },
  // Crew/Panitia 2
  {
    id: uuid('user', 5),
    email: 'crew2@techconference.id',
    name: 'Dewi Lestari',
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=dewi',
    google_id: null,
    is_super_admin: false,
    created_at: daysAgo(15),
    updated_at: daysAgo(15)
  },
  // Crew/Panitia 3
  {
    id: uuid('user', 6),
    email: 'crew1@musikfest.id',
    name: 'Rizki Pratama',
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=rizki',
    google_id: null,
    is_super_admin: false,
    created_at: daysAgo(20),
    updated_at: daysAgo(20)
  }
]

// =====================================
// TENANTS (EO - Event Organizer)
// =====================================
export const mockTenants: Tenant[] = [
  {
    id: uuid('tenant', 1),
    name: 'Tech Conference Indonesia',
    slug: 'techconference',
    owner_id: uuid('user', 2),
    status: 'active',
    verified_at: daysAgo(175),
    phone: '+62 21 1234567',
    address: 'Jl. Sudirman No. 123, Jakarta',
    created_at: daysAgo(180),
    updated_at: daysAgo(30)
  },
  {
    id: uuid('tenant', 2),
    name: 'Musik Fest Productions',
    slug: 'musikfest',
    owner_id: uuid('user', 3),
    status: 'active',
    verified_at: daysAgo(115),
    phone: '+62 21 7654321',
    address: 'Jl. Gatot Subroto No. 456, Jakarta',
    created_at: daysAgo(120),
    updated_at: daysAgo(15)
  }
]

// =====================================
// MEMBERSHIPS
// =====================================
export const mockMemberships: Membership[] = [
  // Tech Conference Memberships
  {
    id: uuid('member', 1),
    user_id: uuid('user', 2),
    tenant_id: uuid('tenant', 1),
    role: 'owner',
    created_at: daysAgo(180)
  },
  {
    id: uuid('member', 2),
    user_id: uuid('user', 4),
    tenant_id: uuid('tenant', 1),
    role: 'crew',
    created_at: daysAgo(30)
  },
  {
    id: uuid('member', 3),
    user_id: uuid('user', 5),
    tenant_id: uuid('tenant', 1),
    role: 'admin',
    created_at: daysAgo(15)
  },
  // Musik Fest Memberships
  {
    id: uuid('member', 4),
    user_id: uuid('user', 3),
    tenant_id: uuid('tenant', 2),
    role: 'owner',
    created_at: daysAgo(120)
  },
  {
    id: uuid('member', 5),
    user_id: uuid('user', 6),
    tenant_id: uuid('tenant', 2),
    role: 'crew',
    created_at: daysAgo(20)
  }
]

// =====================================
// CREDIT WALLETS
// =====================================
export const mockCreditWallets: CreditWallet[] = [
  {
    id: uuid('wallet', 1),
    tenant_id: uuid('tenant', 1),
    balance: 450,
    bonus_balance: 50,
    updated_at: now
  },
  {
    id: uuid('wallet', 2),
    tenant_id: uuid('tenant', 2),
    balance: 1200,
    bonus_balance: 150,
    updated_at: now
  }
]

// =====================================
// CREDIT TRANSACTIONS
// =====================================
export const mockCreditTransactions: CreditTransaction[] = [
  // Tech Conference Transactions
  {
    id: uuid('txn', 1),
    tenant_id: uuid('tenant', 1),
    type: 'bonus',
    amount: 50,
    reference_type: 'welcome_bonus',
    reference_id: null,
    description: 'Welcome bonus for new tenant',
    created_at: daysAgo(180)
  },
  {
    id: uuid('txn', 2),
    tenant_id: uuid('tenant', 1),
    type: 'purchase',
    amount: 500,
    reference_type: 'midtrans',
    reference_id: 'midtrans-order-001',
    description: 'Credit purchase - Starter Package',
    created_at: daysAgo(175)
  },
  {
    id: uuid('txn', 3),
    tenant_id: uuid('tenant', 1),
    type: 'usage',
    amount: -50,
    reference_type: 'event',
    reference_id: uuid('event', 1),
    description: 'Event creation: Tech Summit 2024',
    created_at: daysAgo(60)
  },
  {
    id: uuid('txn', 4),
    tenant_id: uuid('tenant', 1),
    type: 'usage',
    amount: -150,
    reference_type: 'checkin',
    reference_id: null,
    description: '150 check-ins',
    created_at: daysAgo(2)
  },
  // Musik Fest Transactions
  {
    id: uuid('txn', 5),
    tenant_id: uuid('tenant', 2),
    type: 'bonus',
    amount: 50,
    reference_type: 'welcome_bonus',
    reference_id: null,
    description: 'Welcome bonus for new tenant',
    created_at: daysAgo(120)
  },
  {
    id: uuid('txn', 6),
    tenant_id: uuid('tenant', 2),
    type: 'purchase',
    amount: 2500,
    reference_type: 'midtrans',
    reference_id: 'midtrans-order-002',
    description: 'Credit purchase - Growth Package',
    created_at: daysAgo(115)
  },
  {
    id: uuid('txn', 7),
    tenant_id: uuid('tenant', 2),
    type: 'bonus',
    amount: 250,
    reference_type: 'package_bonus',
    reference_id: 'midtrans-order-002',
    description: 'Growth Package bonus',
    created_at: daysAgo(115)
  }
]

// =====================================
// EVENTS
// =====================================
export const mockEvents: Event[] = [
  // Active Event - Tech Summit
  {
    id: uuid('event', 1),
    tenant_id: uuid('tenant', 1),
    name: 'Tech Summit Indonesia 2024',
    title: 'Innovate. Transform. Lead.',
    description: 'Indonesia\'s largest technology conference featuring world-class speakers, workshops, and networking opportunities.',
    banner_url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200',
    start_date: daysFromNow(7),
    end_date: daysFromNow(9),
    location: 'Jakarta Convention Center',
    category: 'Technology',
    capacity: 5000,
    welcome_message: 'Selamat Datang di Tech Summit 2024!',
    display_duration: 5,
    enable_sound: true,
    check_in_desks: 4,
    default_max_food_claims: 4,
    default_max_drink_claims: 2,
    storage_days: 15,
    status: 'active',
    created_at: daysAgo(60),
    updated_at: daysAgo(5)
  },
  // Draft Event - Tech Conference
  {
    id: uuid('event', 2),
    tenant_id: uuid('tenant', 1),
    name: 'Developer Day Jakarta',
    title: 'Code. Build. Deploy.',
    description: 'A full-day workshop for developers of all levels.',
    banner_url: null,
    start_date: daysFromNow(30),
    end_date: daysFromNow(30),
    location: 'GO-JEK HQ, Jakarta',
    category: 'Technology',
    capacity: 500,
    welcome_message: 'Selamat Datang!',
    display_duration: 5,
    enable_sound: false,
    check_in_desks: 2,
    default_max_food_claims: 2,
    default_max_drink_claims: 1,
    storage_days: 15,
    status: 'draft',
    created_at: daysAgo(10),
    updated_at: daysAgo(10)
  },
  // Completed Event
  {
    id: uuid('event', 3),
    tenant_id: uuid('tenant', 1),
    name: 'Startup Weekend Bandung',
    title: 'From Idea to Launch in 54 Hours',
    description: 'Weekend-long event where aspiring entrepreneurs pitch ideas, form teams, and launch startups.',
    banner_url: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=1200',
    start_date: daysAgo(90),
    end_date: daysAgo(88),
    location: 'Bandung Digital Valley',
    category: 'Business',
    capacity: 200,
    welcome_message: 'Selamat Datang di Startup Weekend!',
    display_duration: 5,
    enable_sound: true,
    check_in_desks: 2,
    default_max_food_claims: 3,
    default_max_drink_claims: 2,
    storage_days: 15,
    status: 'completed',
    created_at: daysAgo(120),
    updated_at: daysAgo(88)
  },
  // Active Event - Musik Fest
  {
    id: uuid('event', 4),
    tenant_id: uuid('tenant', 2),
    name: 'Summer Music Festival 2024',
    title: 'Feel the Beat, Live the Rhythm',
    description: 'Three days of non-stop music featuring local and international artists.',
    banner_url: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=1200',
    start_date: daysFromNow(14),
    end_date: daysFromNow(16),
    location: 'Ancol Beach City, Jakarta',
    category: 'Music',
    capacity: 10000,
    welcome_message: 'Welcome to Summer Music Festival!',
    display_duration: 5,
    enable_sound: true,
    check_in_desks: 6,
    default_max_food_claims: 4,
    default_max_drink_claims: 3,
    storage_days: 15,
    status: 'active',
    created_at: daysAgo(90),
    updated_at: daysAgo(7)
  },
  // Draft Event - Musik Fest
  {
    id: uuid('event', 5),
    tenant_id: uuid('tenant', 2),
    name: 'Jazz Night',
    title: 'An Evening of Smooth Jazz',
    description: 'Intimate jazz performances in a cozy setting.',
    banner_url: null,
    start_date: daysFromNow(45),
    end_date: daysFromNow(45),
    location: 'JW Marriott Hotel, Jakarta',
    category: 'Music',
    capacity: 300,
    welcome_message: 'Selamat Menikmati Jazz Night!',
    display_duration: 5,
    enable_sound: false,
    check_in_desks: 2,
    default_max_food_claims: 2,
    default_max_drink_claims: 2,
    storage_days: 15,
    status: 'draft',
    created_at: daysAgo(5),
    updated_at: daysAgo(5)
  }
]

// =====================================
// EVENT STAFF
// =====================================
export const mockEventStaff: EventStaff[] = [
  {
    id: uuid('staff', 1),
    event_id: uuid('event', 1),
    user_id: uuid('user', 4),
    role: 'crew',
    created_at: daysAgo(30)
  },
  {
    id: uuid('staff', 2),
    event_id: uuid('event', 1),
    user_id: uuid('user', 5),
    role: 'admin',
    created_at: daysAgo(15)
  },
  {
    id: uuid('staff', 3),
    event_id: uuid('event', 4),
    user_id: uuid('user', 6),
    role: 'crew',
    created_at: daysAgo(20)
  }
]

// =====================================
// TICKET TYPES
// =====================================
export const mockTicketTypes: TicketType[] = [
  // Tech Summit Ticket Types
  {
    id: uuid('ticket', 1),
    event_id: uuid('event', 1),
    name: 'VIP',
    price: 1500000,
    quota: 500,
    features: {
      priority_checkin: true,
      vip_lounge: true,
      lunch_included: true,
      workshop_access: true,
      goodie_bag: true
    }
  },
  {
    id: uuid('ticket', 2),
    event_id: uuid('event', 1),
    name: 'Regular',
    price: 500000,
    quota: 3000,
    features: {
      priority_checkin: false,
      vip_lounge: false,
      lunch_included: false,
      workshop_access: true,
      goodie_bag: false
    }
  },
  {
    id: uuid('ticket', 3),
    event_id: uuid('event', 1),
    name: 'Student',
    price: 250000,
    quota: 1500,
    features: {
      priority_checkin: false,
      vip_lounge: false,
      lunch_included: false,
      workshop_access: true,
      goodie_bag: false
    }
  },
  // Developer Day Ticket Types
  {
    id: uuid('ticket', 4),
    event_id: uuid('event', 2),
    name: 'Early Bird',
    price: 150000,
    quota: 200,
    features: {
      workshop_access: true,
      lunch_included: true
    }
  },
  {
    id: uuid('ticket', 5),
    event_id: uuid('event', 2),
    name: 'Regular',
    price: 200000,
    quota: 300,
    features: {
      workshop_access: true,
      lunch_included: true
    }
  },
  // Summer Music Festival Ticket Types
  {
    id: uuid('ticket', 6),
    event_id: uuid('event', 4),
    name: '3-Day Pass',
    price: 750000,
    quota: 5000,
    features: {
      all_stages: true,
      free_drink_voucher: 3
    }
  },
  {
    id: uuid('ticket', 7),
    event_id: uuid('event', 4),
    name: 'VIP Pass',
    price: 2500000,
    quota: 500,
    features: {
      all_stages: true,
      vip_area: true,
      meet_and_greet: true,
      free_food: true,
      free_drinks: true
    }
  },
  {
    id: uuid('ticket', 8),
    event_id: uuid('event', 4),
    name: 'Single Day',
    price: 350000,
    quota: 4500,
    features: {
      all_stages: true
    }
  }
]

// =====================================
// PARTICIPANTS
// =====================================
export const mockParticipants: Participant[] = [
  // Tech Summit Participants (Event 1)
  {
    id: uuid('participant', 1),
    tenant_id: uuid('tenant', 1),
    event_id: uuid('event', 1),
    name: 'Rina Kusuma',
    email: 'rina.kusuma@email.com',
    phone: '+62 812 1234 5678',
    ticket_type_id: uuid('ticket', 1),
    qr_code: 'TS2024-VIP-0001',
    original_photo_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=rina',
    ai_photo_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=rina-ai',
    bio: 'Tech enthusiast and startup founder passionate about AI and machine learning.',
    ai_generation_status: 'success',
    ai_generated_at: daysAgo(5),
    is_checked_in: false,
    checked_in_at: null,
    checkin_count: 0,
    food_claims: 0,
    drink_claims: 0,
    max_food_claims: 4,
    max_drink_claims: 2,
    is_active: true,
    is_blacklisted: false,
    meta: { company: 'TechStartup ID', position: 'CEO' },
    created_at: daysAgo(30),
    updated_at: daysAgo(5),
    expires_at: daysFromNow(24)
  },
  {
    id: uuid('participant', 2),
    tenant_id: uuid('tenant', 1),
    event_id: uuid('event', 1),
    name: 'Andi Prasetyo',
    email: 'andi.prasetyo@email.com',
    phone: '+62 813 2345 6789',
    ticket_type_id: uuid('ticket', 2),
    qr_code: 'TS2024-REG-0001',
    original_photo_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=andi',
    ai_photo_url: null,
    bio: 'Software developer with 5 years of experience in web development.',
    ai_generation_status: 'pending',
    ai_generated_at: null,
    is_checked_in: true,
    checked_in_at: hoursAgo(2),
    checkin_count: 1,
    food_claims: 1,
    drink_claims: 1,
    max_food_claims: 4,
    max_drink_claims: 2,
    is_active: true,
    is_blacklisted: false,
    meta: { company: 'Gojek', position: 'Senior Developer' },
    created_at: daysAgo(25),
    updated_at: hoursAgo(2),
    expires_at: daysFromNow(24)
  },
  {
    id: uuid('participant', 3),
    tenant_id: uuid('tenant', 1),
    event_id: uuid('event', 1),
    name: 'Maya Dewi',
    email: 'maya.dewi@email.com',
    phone: '+62 814 3456 7890',
    ticket_type_id: uuid('ticket', 3),
    qr_code: 'TS2024-STU-0001',
    original_photo_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=maya',
    ai_photo_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=maya-ai',
    bio: 'Computer science student at University of Indonesia, interested in data science.',
    ai_generation_status: 'success',
    ai_generated_at: daysAgo(3),
    is_checked_in: true,
    checked_in_at: hoursAgo(3),
    checkin_count: 1,
    food_claims: 2,
    drink_claims: 1,
    max_food_claims: 4,
    max_drink_claims: 2,
    is_active: true,
    is_blacklisted: false,
    meta: { university: 'Universitas Indonesia', major: 'Computer Science' },
    created_at: daysAgo(20),
    updated_at: hoursAgo(3),
    expires_at: daysFromNow(24)
  },
  {
    id: uuid('participant', 4),
    tenant_id: uuid('tenant', 1),
    event_id: uuid('event', 1),
    name: 'Benny Hartono',
    email: 'benny.hartono@email.com',
    phone: '+62 815 4567 8901',
    ticket_type_id: uuid('ticket', 1),
    qr_code: 'TS2024-VIP-0002',
    original_photo_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=benny',
    ai_photo_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=benny-ai',
    bio: 'CTO at a fintech startup, passionate about blockchain technology.',
    ai_generation_status: 'success',
    ai_generated_at: daysAgo(4),
    is_checked_in: false,
    checked_in_at: null,
    checkin_count: 0,
    food_claims: 0,
    drink_claims: 0,
    max_food_claims: 4,
    max_drink_claims: 2,
    is_active: true,
    is_blacklisted: false,
    meta: { company: 'FinTech ID', position: 'CTO' },
    created_at: daysAgo(15),
    updated_at: daysAgo(4),
    expires_at: daysFromNow(24)
  },
  {
    id: uuid('participant', 5),
    tenant_id: uuid('tenant', 1),
    event_id: uuid('event', 1),
    name: 'Citra Lestari',
    email: 'citra.lestari@email.com',
    phone: '+62 816 5678 9012',
    ticket_type_id: uuid('ticket', 2),
    qr_code: 'TS2024-REG-0002',
    original_photo_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=citra',
    ai_photo_url: null,
    bio: 'Product manager at a leading e-commerce company.',
    ai_generation_status: 'failed',
    ai_generated_at: null,
    is_checked_in: true,
    checked_in_at: hoursAgo(1),
    checkin_count: 1,
    food_claims: 0,
    drink_claims: 2,
    max_food_claims: 4,
    max_drink_claims: 2,
    is_active: true,
    is_blacklisted: false,
    meta: { company: 'Tokopedia', position: 'Product Manager' },
    created_at: daysAgo(10),
    updated_at: hoursAgo(1),
    expires_at: daysFromNow(24)
  },
  // Summer Music Festival Participants (Event 4)
  {
    id: uuid('participant', 6),
    tenant_id: uuid('tenant', 2),
    event_id: uuid('event', 4),
    name: 'Dimas Pratama',
    email: 'dimas.pratama@email.com',
    phone: '+62 817 6789 0123',
    ticket_type_id: uuid('ticket', 7),
    qr_code: 'SMF2024-VIP-0001',
    original_photo_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=dimas',
    ai_photo_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=dimas-ai',
    bio: 'Music producer and DJ, loves discovering new artists.',
    ai_generation_status: 'success',
    ai_generated_at: daysAgo(10),
    is_checked_in: false,
    checked_in_at: null,
    checkin_count: 0,
    food_claims: 0,
    drink_claims: 0,
    max_food_claims: 4,
    max_drink_claims: 3,
    is_active: true,
    is_blacklisted: false,
    meta: { profession: 'Music Producer' },
    created_at: daysAgo(45),
    updated_at: daysAgo(10),
    expires_at: daysFromNow(31)
  },
  {
    id: uuid('participant', 7),
    tenant_id: uuid('tenant', 2),
    event_id: uuid('event', 4),
    name: 'Fanny Wijaya',
    email: 'fanny.wijaya@email.com',
    phone: '+62 818 7890 1234',
    ticket_type_id: uuid('ticket', 6),
    qr_code: 'SMF2024-3DAY-0001',
    original_photo_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=fanny',
    ai_photo_url: null,
    bio: 'Music lover and festival goer!',
    ai_generation_status: 'pending',
    ai_generated_at: null,
    is_checked_in: false,
    checked_in_at: null,
    checkin_count: 0,
    food_claims: 0,
    drink_claims: 0,
    max_food_claims: 4,
    max_drink_claims: 3,
    is_active: true,
    is_blacklisted: false,
    meta: null,
    created_at: daysAgo(30),
    updated_at: daysAgo(30),
    expires_at: daysFromNow(31)
  }
]

// =====================================
// CHECKINS
// =====================================
export const mockCheckins: Checkin[] = [
  {
    id: uuid('checkin', 1),
    event_id: uuid('event', 1),
    participant_id: uuid('participant', 2),
    operator_id: uuid('user', 4),
    desk_number: 1,
    checked_in_at: hoursAgo(2)
  },
  {
    id: uuid('checkin', 2),
    event_id: uuid('event', 1),
    participant_id: uuid('participant', 3),
    operator_id: uuid('user', 5),
    desk_number: 2,
    checked_in_at: hoursAgo(3)
  },
  {
    id: uuid('checkin', 3),
    event_id: uuid('event', 1),
    participant_id: uuid('participant', 5),
    operator_id: uuid('user', 4),
    desk_number: 1,
    checked_in_at: hoursAgo(1)
  }
]

// =====================================
// BOOTHS
// =====================================
export const mockBooths: Booth[] = [
  // Tech Summit Booths
  {
    id: uuid('booth', 1),
    event_id: uuid('event', 1),
    name: 'Main F&B Booth',
    type: 'both',
    is_active: true
  },
  {
    id: uuid('booth', 2),
    event_id: uuid('event', 1),
    name: 'VIP Lounge F&B',
    type: 'both',
    is_active: true
  },
  {
    id: uuid('booth', 3),
    event_id: uuid('event', 1),
    name: 'Snack Corner',
    type: 'food',
    is_active: true
  },
  {
    id: uuid('booth', 4),
    event_id: uuid('event', 1),
    name: 'Beverage Station',
    type: 'drink',
    is_active: true
  },
  // Summer Music Festival Booths
  {
    id: uuid('booth', 5),
    event_id: uuid('event', 4),
    name: 'Main Food Court',
    type: 'food',
    is_active: true
  },
  {
    id: uuid('booth', 6),
    event_id: uuid('event', 4),
    name: 'Drink Stations',
    type: 'drink',
    is_active: true
  },
  {
    id: uuid('booth', 7),
    event_id: uuid('event', 4),
    name: 'VIP Area F&B',
    type: 'both',
    is_active: true
  }
]

// =====================================
// MENU CATEGORIES
// =====================================
export const mockMenuCategories: MenuCategory[] = [
  // Tech Summit Categories
  {
    id: uuid('cat', 1),
    event_id: uuid('event', 1),
    name: 'Main Course',
    type: 'food'
  },
  {
    id: uuid('cat', 2),
    event_id: uuid('event', 1),
    name: 'Snacks',
    type: 'food'
  },
  {
    id: uuid('cat', 3),
    event_id: uuid('event', 1),
    name: 'Beverages',
    type: 'drink'
  },
  {
    id: uuid('cat', 4),
    event_id: uuid('event', 1),
    name: 'Coffee & Tea',
    type: 'drink'
  },
  // Summer Music Festival Categories
  {
    id: uuid('cat', 5),
    event_id: uuid('event', 4),
    name: 'Festival Food',
    type: 'food'
  },
  {
    id: uuid('cat', 6),
    event_id: uuid('event', 4),
    name: 'Drinks',
    type: 'drink'
  }
]

// =====================================
// MENU ITEMS
// =====================================
export const mockMenuItems: MenuItem[] = [
  // Tech Summit Menu Items
  {
    id: uuid('menu', 1),
    event_id: uuid('event', 1),
    category_id: uuid('cat', 1),
    name: 'Nasi Goreng Special',
    stock: 200,
    is_active: true
  },
  {
    id: uuid('menu', 2),
    event_id: uuid('event', 1),
    category_id: uuid('cat', 1),
    name: 'Mie Ayam Bakso',
    stock: 150,
    is_active: true
  },
  {
    id: uuid('menu', 3),
    event_id: uuid('event', 1),
    category_id: uuid('cat', 1),
    name: 'Ayam Bakar',
    stock: 180,
    is_active: true
  },
  {
    id: uuid('menu', 4),
    event_id: uuid('event', 1),
    category_id: uuid('cat', 1),
    name: 'Sate Ayam',
    stock: 250,
    is_active: true
  },
  {
    id: uuid('menu', 5),
    event_id: uuid('event', 1),
    category_id: uuid('cat', 2),
    name: 'Pisang Goreng',
    stock: 300,
    is_active: true
  },
  {
    id: uuid('menu', 6),
    event_id: uuid('event', 1),
    category_id: uuid('cat', 2),
    name: 'Kentang Goreng',
    stock: 280,
    is_active: true
  },
  {
    id: uuid('menu', 7),
    event_id: uuid('event', 1),
    category_id: uuid('cat', 3),
    name: 'Mineral Water',
    stock: 500,
    is_active: true
  },
  {
    id: uuid('menu', 8),
    event_id: uuid('event', 1),
    category_id: uuid('cat', 3),
    name: 'Orange Juice',
    stock: 200,
    is_active: true
  },
  {
    id: uuid('menu', 9),
    event_id: uuid('event', 1),
    category_id: uuid('cat', 4),
    name: 'Kopi Susu',
    stock: 150,
    is_active: true
  },
  {
    id: uuid('menu', 10),
    event_id: uuid('event', 1),
    category_id: uuid('cat', 4),
    name: 'Teh Manis',
    stock: 200,
    is_active: true
  },
  // Summer Music Festival Menu Items
  {
    id: uuid('menu', 11),
    event_id: uuid('event', 4),
    category_id: uuid('cat', 5),
    name: 'Burger',
    stock: 500,
    is_active: true
  },
  {
    id: uuid('menu', 12),
    event_id: uuid('event', 4),
    category_id: uuid('cat', 5),
    name: 'Hot Dog',
    stock: 500,
    is_active: true
  },
  {
    id: uuid('menu', 13),
    event_id: uuid('event', 4),
    category_id: uuid('cat', 5),
    name: 'Pizza Slice',
    stock: 800,
    is_active: true
  },
  {
    id: uuid('menu', 14),
    event_id: uuid('event', 4),
    category_id: uuid('cat', 5),
    name: 'French Fries',
    stock: 600,
    is_active: true
  },
  {
    id: uuid('menu', 15),
    event_id: uuid('event', 4),
    category_id: uuid('cat', 6),
    name: 'Cola',
    stock: 1000,
    is_active: true
  },
  {
    id: uuid('menu', 16),
    event_id: uuid('event', 4),
    category_id: uuid('cat', 6),
    name: 'Beer',
    stock: 500,
    is_active: true
  },
  {
    id: uuid('menu', 17),
    event_id: uuid('event', 4),
    category_id: uuid('cat', 6),
    name: 'Mineral Water',
    stock: 1500,
    is_active: true
  }
]

// =====================================
// CLAIMS
// =====================================
export const mockClaims: Claim[] = [
  {
    id: uuid('claim', 1),
    event_id: uuid('event', 1),
    participant_id: uuid('participant', 2),
    menu_item_id: uuid('menu', 1),
    booth_id: uuid('booth', 1),
    claimed_at: hoursAgo(1)
  },
  {
    id: uuid('claim', 2),
    event_id: uuid('event', 1),
    participant_id: uuid('participant', 2),
    menu_item_id: uuid('menu', 7),
    booth_id: uuid('booth', 4),
    claimed_at: hoursAgo(1)
  },
  {
    id: uuid('claim', 3),
    event_id: uuid('event', 1),
    participant_id: uuid('participant', 3),
    menu_item_id: uuid('menu', 3),
    booth_id: uuid('booth', 1),
    claimed_at: hoursAgo(2)
  },
  {
    id: uuid('claim', 4),
    event_id: uuid('event', 1),
    participant_id: uuid('participant', 3),
    menu_item_id: uuid('menu', 5),
    booth_id: uuid('booth', 3),
    claimed_at: hoursAgo(2)
  },
  {
    id: uuid('claim', 5),
    event_id: uuid('event', 1),
    participant_id: uuid('participant', 3),
    menu_item_id: uuid('menu', 8),
    booth_id: uuid('booth', 4),
    claimed_at: hoursAgo(1)
  },
  {
    id: uuid('claim', 6),
    event_id: uuid('event', 1),
    participant_id: uuid('participant', 5),
    menu_item_id: uuid('menu', 9),
    booth_id: uuid('booth', 4),
    claimed_at: hoursAgo(1)
  },
  {
    id: uuid('claim', 7),
    event_id: uuid('event', 1),
    participant_id: uuid('participant', 5),
    menu_item_id: uuid('menu', 10),
    booth_id: uuid('booth', 4),
    claimed_at: hoursAgo(1)
  }
]

// =====================================
// DISPLAY QUEUE
// =====================================
export const mockDisplayQueue: DisplayQueue[] = [
  {
    id: uuid('display', 1),
    event_id: uuid('event', 1),
    participant_id: uuid('participant', 2),
    name: 'Andi Prasetyo',
    photo_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=andi',
    is_displayed: true,
    created_at: hoursAgo(2)
  },
  {
    id: uuid('display', 2),
    event_id: uuid('event', 1),
    participant_id: uuid('participant', 3),
    name: 'Maya Dewi',
    photo_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=maya-ai',
    is_displayed: true,
    created_at: hoursAgo(3)
  },
  {
    id: uuid('display', 3),
    event_id: uuid('event', 1),
    participant_id: uuid('participant', 5),
    name: 'Citra Lestari',
    photo_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=citra',
    is_displayed: false,
    created_at: hoursAgo(1)
  }
]

// =====================================
// SCAN LOGS
// =====================================
export const mockScanLogs: ScanLog[] = [
  {
    id: uuid('scan', 1),
    tenant_id: uuid('tenant', 1),
    event_id: uuid('event', 1),
    participant_id: uuid('participant', 2),
    type: 'checkin',
    result: 'success',
    device: 'Desk-1-iPad',
    created_at: hoursAgo(2)
  },
  {
    id: uuid('scan', 2),
    tenant_id: uuid('tenant', 1),
    event_id: uuid('event', 1),
    participant_id: uuid('participant', 3),
    type: 'checkin',
    result: 'success',
    device: 'Desk-2-iPad',
    created_at: hoursAgo(3)
  },
  {
    id: uuid('scan', 3),
    tenant_id: uuid('tenant', 1),
    event_id: uuid('event', 1),
    participant_id: uuid('participant', 2),
    type: 'claim',
    result: 'success',
    device: 'FNB-Booth-1',
    created_at: hoursAgo(1)
  },
  {
    id: uuid('scan', 4),
    tenant_id: uuid('tenant', 1),
    event_id: uuid('event', 1),
    participant_id: uuid('participant', 5),
    type: 'checkin',
    result: 'success',
    device: 'Desk-1-iPad',
    created_at: hoursAgo(1)
  },
  {
    id: uuid('scan', 5),
    tenant_id: uuid('tenant', 1),
    event_id: uuid('event', 1),
    participant_id: uuid('participant', 2),
    type: 'claim',
    result: 'duplicate',
    device: 'FNB-Booth-1',
    created_at: hoursAgo(0.5)
  }
]

// =====================================
// AGGREGATED MOCK DATA
// =====================================
export const mockData = {
  users: mockUsers,
  tenants: mockTenants,
  memberships: mockMemberships,
  creditWallets: mockCreditWallets,
  creditTransactions: mockCreditTransactions,
  events: mockEvents,
  eventStaff: mockEventStaff,
  ticketTypes: mockTicketTypes,
  participants: mockParticipants,
  checkins: mockCheckins,
  booths: mockBooths,
  menuCategories: mockMenuCategories,
  menuItems: mockMenuItems,
  claims: mockClaims,
  displayQueue: mockDisplayQueue,
  scanLogs: mockScanLogs
}

export default mockData
