-- =====================================
-- SAAS EVENT MANAGEMENT SYSTEM
-- SQL SCHEMA FOR SUPABASE
-- =====================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================
-- USERS TABLE
-- =====================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  avatar_url TEXT,
  google_id TEXT UNIQUE,
  is_super_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================
-- TENANTS (EO - Event Organizer)
-- =====================================
CREATE TABLE IF NOT EXISTS tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE,
  owner_id UUID REFERENCES users(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'pending', -- pending, active, suspended
  verified_at TIMESTAMPTZ,
  phone TEXT,
  address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================
-- MEMBERSHIPS (User-Tenant Relationship)
-- =====================================
CREATE TABLE IF NOT EXISTS memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'crew', -- owner, admin, crew
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, tenant_id)
);

-- =====================================
-- CREDIT SYSTEM
-- =====================================
CREATE TABLE IF NOT EXISTS credit_wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID UNIQUE REFERENCES tenants(id) ON DELETE CASCADE,
  balance INTEGER DEFAULT 0,
  bonus_balance INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS credit_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- purchase, usage, bonus, refund
  amount INTEGER NOT NULL,
  reference_type TEXT,
  reference_id UUID,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================
-- EVENTS
-- =====================================
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  title TEXT,
  description TEXT,
  banner_url TEXT,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  location TEXT,
  category TEXT,
  capacity INTEGER DEFAULT 0,

  -- Display Settings
  welcome_message TEXT DEFAULT 'Selamat Datang!',
  display_duration INTEGER DEFAULT 5,
  enable_sound BOOLEAN DEFAULT FALSE,
  check_in_desks INTEGER DEFAULT 4,

  -- F&B Default Settings
  default_max_food_claims INTEGER DEFAULT 4,
  default_max_drink_claims INTEGER DEFAULT 2,

  -- Storage
  storage_days INTEGER DEFAULT 15,

  -- Status
  status TEXT DEFAULT 'draft', -- draft, active, completed

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================
-- EVENT STAFF
-- =====================================
CREATE TABLE IF NOT EXISTS event_staff (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'crew', -- admin, crew
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(event_id, user_id)
);

-- =====================================
-- TICKET TYPES
-- =====================================
CREATE TABLE IF NOT EXISTS ticket_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  name TEXT NOT NULL, -- VIP, Regular, Student
  price INTEGER DEFAULT 0, -- 0 = gratis
  quota INTEGER DEFAULT 0,
  features JSONB
);

-- =====================================
-- PARTICIPANTS
-- =====================================
CREATE TABLE IF NOT EXISTS participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,

  -- Personal Info
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,

  -- Ticket
  ticket_type_id UUID REFERENCES ticket_types(id) ON DELETE SET NULL,

  -- QR Code
  qr_code TEXT UNIQUE NOT NULL,

  -- Photo & AI
  original_photo_url TEXT,
  ai_photo_url TEXT,
  bio TEXT,
  ai_generation_status TEXT DEFAULT 'pending', -- pending, processing, success, failed
  ai_generated_at TIMESTAMPTZ,

  -- Check-in
  is_checked_in BOOLEAN DEFAULT FALSE,
  checked_in_at TIMESTAMPTZ,
  checkin_count INTEGER DEFAULT 0,

  -- F&B Claims (per participant)
  food_claims INTEGER DEFAULT 0,
  drink_claims INTEGER DEFAULT 0,
  max_food_claims INTEGER DEFAULT 4,
  max_drink_claims INTEGER DEFAULT 2,

  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  is_blacklisted BOOLEAN DEFAULT FALSE,

  -- Metadata
  meta JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,

  UNIQUE(event_id, email)
);

-- =====================================
-- CHECKINS
-- =====================================
CREATE TABLE IF NOT EXISTS checkins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  participant_id UUID UNIQUE REFERENCES participants(id) ON DELETE CASCADE,
  operator_id UUID REFERENCES users(id) ON DELETE SET NULL,
  desk_number INTEGER DEFAULT 1,
  checked_in_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================
-- F&B - BOOTH
-- =====================================
CREATE TABLE IF NOT EXISTS booths (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL, -- food, drink, both
  is_active BOOLEAN DEFAULT TRUE
);

-- =====================================
-- F&B - MENU
-- =====================================
CREATE TABLE IF NOT EXISTS menu_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL -- food, drink
);

CREATE TABLE IF NOT EXISTS menu_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  category_id UUID REFERENCES menu_categories(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  stock INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE
);

-- =====================================
-- F&B - CLAIMS
-- =====================================
CREATE TABLE IF NOT EXISTS claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  participant_id UUID REFERENCES participants(id) ON DELETE CASCADE,
  menu_item_id UUID REFERENCES menu_items(id) ON DELETE CASCADE,
  booth_id UUID REFERENCES booths(id) ON DELETE SET NULL,
  claimed_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================
-- DISPLAY QUEUE
-- =====================================
CREATE TABLE IF NOT EXISTS display_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  participant_id UUID REFERENCES participants(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  photo_url TEXT,
  is_displayed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================
-- SCAN LOGS
-- =====================================
CREATE TABLE IF NOT EXISTS scan_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  participant_id UUID REFERENCES participants(id) ON DELETE SET NULL,
  type TEXT, -- checkin, claim
  result TEXT, -- success, failed, duplicate
  device TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================
-- INDEXES
-- =====================================

-- Users
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id);

-- Tenants
CREATE INDEX IF NOT EXISTS idx_tenants_owner ON tenants(owner_id);
CREATE INDEX IF NOT EXISTS idx_tenants_slug ON tenants(slug);

-- Events
CREATE INDEX IF NOT EXISTS idx_events_tenant ON events(tenant_id);
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);

-- Participants
CREATE UNIQUE INDEX IF NOT EXISTS idx_participants_qr ON participants(qr_code);
CREATE INDEX IF NOT EXISTS idx_participants_event ON participants(event_id);
CREATE INDEX IF NOT EXISTS idx_participants_checkin ON participants(event_id, is_checked_in);
CREATE INDEX IF NOT EXISTS idx_participants_email ON participants(email);

-- Checkins
CREATE UNIQUE INDEX IF NOT EXISTS idx_checkins_unique ON checkins(participant_id);
CREATE INDEX IF NOT EXISTS idx_checkins_event ON checkins(event_id);
CREATE INDEX IF NOT EXISTS idx_checkins_time ON checkins(checked_in_at DESC);

-- Claims
CREATE INDEX IF NOT EXISTS idx_claims_event ON claims(event_id);
CREATE INDEX IF NOT EXISTS idx_claims_participant ON claims(participant_id);
CREATE INDEX IF NOT EXISTS idx_claims_time ON claims(claimed_at DESC);

-- Display Queue
CREATE INDEX IF NOT EXISTS idx_display_event ON display_queue(event_id);
CREATE INDEX IF NOT EXISTS idx_display_pending ON display_queue(event_id, is_displayed) WHERE is_displayed = FALSE;

-- Scan Logs
CREATE INDEX IF NOT EXISTS idx_scan_logs_event ON scan_logs(event_id);
CREATE INDEX IF NOT EXISTS idx_scan_logs_time ON scan_logs(created_at DESC);

-- Credit
CREATE UNIQUE INDEX IF NOT EXISTS idx_wallet_tenant ON credit_wallets(tenant_id);
CREATE INDEX IF NOT EXISTS idx_transactions_tenant ON credit_transactions(tenant_id);

-- =====================================
-- TRIGGERS FOR UPDATED_AT
-- =====================================

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated
BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_tenants_updated
BEFORE UPDATE ON tenants
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_events_updated
BEFORE UPDATE ON events
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_participants_updated
BEFORE UPDATE ON participants
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_wallets_updated
BEFORE UPDATE ON credit_wallets
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- =====================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE scan_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE display_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE booths ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_staff ENABLE ROW LEVEL SECURITY;

-- =====================================
-- VIEWS FOR ANALYTICS
-- =====================================

-- Event Statistics View
CREATE OR REPLACE VIEW v_event_stats AS
SELECT
  e.id as event_id,
  e.name as event_name,
  e.tenant_id,
  COUNT(DISTINCT p.id) as total_participants,
  COUNT(DISTINCT CASE WHEN p.is_checked_in THEN p.id END) as checked_in,
  COUNT(DISTINCT c.id) as total_claims,
  COUNT(DISTINCT CASE WHEN c.claimed_at >= NOW() - INTERVAL '1 hour' THEN c.id END) as claims_last_hour
FROM events e
LEFT JOIN participants p ON p.event_id = e.id
LEFT JOIN claims c ON c.event_id = e.id
GROUP BY e.id, e.name, e.tenant_id;

-- Credit Summary View
CREATE OR REPLACE VIEW v_credit_summary AS
SELECT
  t.id as tenant_id,
  t.name as tenant_name,
  COALESCE(w.balance, 0) as balance,
  COALESCE(w.bonus_balance, 0) as bonus_balance,
  COALESCE(w.balance, 0) + COALESCE(w.bonus_balance, 0) as total_credits,
  COUNT(e.id) as total_events
FROM tenants t
LEFT JOIN credit_wallets w ON w.tenant_id = t.id
LEFT JOIN events e ON e.tenant_id = t.id
GROUP BY t.id, t.name, w.balance, w.bonus_balance;
