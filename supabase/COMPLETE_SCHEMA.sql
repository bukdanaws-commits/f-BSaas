-- ========================================
-- EVENTIFY - COMPLETE DATABASE SCHEMA
-- From Scratch - All Tables
-- ========================================
-- Run this in Supabase SQL Editor
-- ========================================

-- ========================================
-- STEP 1: DISABLE RLS GLOBALLY
-- ========================================
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- ========================================
-- STEP 2: CORE TABLES
-- ========================================

-- USERS TABLE
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

-- TENANTS TABLE (EO Organization)
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

-- MEMBERSHIPS TABLE (User-Tenant Relationship)
CREATE TABLE memberships (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id   UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
  role      VARCHAR(50) DEFAULT 'crew', -- owner, admin, crew
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, tenant_id)
);

-- ========================================
-- STEP 3: CREDIT SYSTEM
-- ========================================

-- CREDIT WALLETS TABLE
CREATE TABLE credit_wallets (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     UUID REFERENCES tenants(id) UNIQUE NOT NULL,
  balance       INTEGER DEFAULT 0,
  bonus_balance INTEGER DEFAULT 0,
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- CREDIT TRANSACTIONS TABLE
CREATE TABLE credit_transactions (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id      UUID REFERENCES tenants(id) NOT NULL,
  type           VARCHAR(50) NOT NULL, -- purchase, usage, bonus, refund
  amount         INTEGER NOT NULL,
  reference_type VARCHAR(100),
  reference_id   UUID,
  description    TEXT,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

-- PRICING PACKAGES TABLE
CREATE TABLE pricing_packages (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name                  VARCHAR(255) NOT NULL,
  slug                  VARCHAR(255) UNIQUE NOT NULL,
  credits_included      INTEGER NOT NULL,
  price                 INTEGER NOT NULL DEFAULT 0,
  bonus_credits         INTEGER DEFAULT 0,
  features              JSONB DEFAULT '{}',
  is_popular            BOOLEAN DEFAULT FALSE,
  is_active             BOOLEAN DEFAULT TRUE,
  sort_order            INTEGER DEFAULT 0,
  created_at            TIMESTAMPTZ DEFAULT NOW(),
  updated_at            TIMESTAMPTZ DEFAULT NOW()
);

-- CREDIT SETTINGS TABLE
CREATE TABLE credit_settings (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  default_free_credits    INTEGER DEFAULT 500,
  default_bonus_credits   INTEGER DEFAULT 50,
  price_per_credit        INTEGER DEFAULT 80,
  min_credit_purchase     INTEGER DEFAULT 100,
  credit_per_checkin      INTEGER DEFAULT 1,
  credit_per_claim        INTEGER DEFAULT 1,
  credit_per_ai_photo     INTEGER DEFAULT 3,
  updated_by              UUID,
  updated_at              TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================
-- STEP 4: EVENTS SYSTEM
-- ========================================

-- EVENTS TABLE
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
  
  -- F&B Settings
  enable_food             BOOLEAN DEFAULT true,
  enable_drink            BOOLEAN DEFAULT true,
  multi_booth_mode        BOOLEAN DEFAULT true,
  default_max_food_claims  INTEGER DEFAULT 4,
  default_max_drink_claims INTEGER DEFAULT 2,
  
  -- Storage
  storage_days            INTEGER DEFAULT 15,
  status                  VARCHAR(50) DEFAULT 'draft', -- draft, active, completed
  
  created_at              TIMESTAMPTZ DEFAULT NOW(),
  updated_at              TIMESTAMPTZ DEFAULT NOW()
);

-- EVENT STAFF TABLE
CREATE TABLE event_staff (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id  UUID REFERENCES events(id) ON DELETE CASCADE,
  user_id   UUID REFERENCES users(id) ON DELETE CASCADE,
  role      VARCHAR(50) DEFAULT 'crew',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(event_id, user_id)
);

-- TICKET TYPES TABLE
CREATE TABLE ticket_types (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id  UUID REFERENCES events(id) ON DELETE CASCADE,
  name      VARCHAR(100) NOT NULL,
  price     INTEGER DEFAULT 0,
  quota     INTEGER DEFAULT 0,
  features  JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================
-- STEP 5: PARTICIPANTS SYSTEM
-- ========================================

-- PARTICIPANTS TABLE
CREATE TABLE participants (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     UUID REFERENCES tenants(id) NOT NULL,
  event_id      UUID REFERENCES events(id) NOT NULL,
  
  -- Personal Info
  name          VARCHAR(255) NOT NULL,
  email         VARCHAR(255) NOT NULL,
  phone         VARCHAR(50),
  company       VARCHAR(255),
  job_title     VARCHAR(255),
  dietary_restrictions TEXT,
  
  -- Ticket
  ticket_type_id UUID REFERENCES ticket_types(id),
  
  -- QR Code
  qr_code       VARCHAR(50) UNIQUE NOT NULL,
  
  -- Photo & AI
  original_photo_url TEXT,
  ai_photo_url       TEXT,
  bio               TEXT,
  
  -- Check-in
  is_checked_in  BOOLEAN DEFAULT false,
  checked_in_at  TIMESTAMPTZ,
  checkin_count  INTEGER DEFAULT 0,
  
  -- F&B Claims
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

-- ========================================
-- STEP 6: CHECK-IN SYSTEM
-- ========================================

-- CHECKINS TABLE
CREATE TABLE checkins (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id      UUID REFERENCES events(id) NOT NULL,
  participant_id UUID REFERENCES participants(id) UNIQUE NOT NULL,
  operator_id   UUID REFERENCES users(id),
  desk_number   INTEGER DEFAULT 1,
  checked_in_at TIMESTAMPTZ DEFAULT NOW()
);

-- DISPLAY QUEUE TABLE
CREATE TABLE display_queue (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id      UUID REFERENCES events(id) NOT NULL,
  participant_id UUID REFERENCES participants(id),
  name          VARCHAR(255) NOT NULL,
  photo_url     TEXT,
  is_displayed  BOOLEAN DEFAULT false,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- SCAN LOGS TABLE
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

-- ========================================
-- STEP 7: F&B SYSTEM
-- ========================================

-- BOOTHS TABLE
CREATE TABLE booths (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id    UUID REFERENCES events(id) ON DELETE CASCADE NOT NULL,
  name        VARCHAR(255) NOT NULL,
  booth_type  VARCHAR(50) DEFAULT 'food', -- food, drink, both
  description TEXT,
  is_active   BOOLEAN DEFAULT true,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- MENU ITEMS TABLE
CREATE TABLE menu_items (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id      UUID REFERENCES events(id) ON DELETE CASCADE NOT NULL,
  booth_id      UUID REFERENCES booths(id) ON DELETE SET NULL,
  name          VARCHAR(255) NOT NULL,
  description   TEXT,
  menu_type     VARCHAR(50) NOT NULL DEFAULT 'food', -- food, drink
  stock         INTEGER DEFAULT 0,
  initial_stock INTEGER DEFAULT 0,
  claimed       INTEGER DEFAULT 0,
  price         INTEGER DEFAULT 0,
  image_url     TEXT,
  is_active     BOOLEAN DEFAULT true,
  sort_order    INTEGER DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- STOCK LOGS TABLE (Audit Trail)
CREATE TABLE stock_logs (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id      UUID REFERENCES tenants(id),
  event_id       UUID REFERENCES events(id) ON DELETE CASCADE,
  menu_item_id   UUID REFERENCES menu_items(id) ON DELETE CASCADE,
  booth_id       UUID REFERENCES booths(id) ON DELETE SET NULL,
  change_type    VARCHAR(50) NOT NULL, -- add, reduce, claim, adjustment, reset
  quantity       INTEGER NOT NULL,
  previous_stock INTEGER NOT NULL,
  new_stock      INTEGER NOT NULL,
  operator_id    UUID REFERENCES users(id),
  operator_name  VARCHAR(255),
  notes          TEXT,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

-- CLAIMS TABLE
CREATE TABLE claims (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id       UUID REFERENCES events(id) ON DELETE CASCADE NOT NULL,
  participant_id UUID REFERENCES participants(id) ON DELETE CASCADE NOT NULL,
  menu_item_id   UUID REFERENCES menu_items(id) ON DELETE CASCADE NOT NULL,
  booth_id       UUID REFERENCES booths(id) ON DELETE SET NULL,
  operator_id    UUID REFERENCES users(id),
  claimed_at     TIMESTAMPTZ DEFAULT NOW(),
  notes          TEXT
);

-- ========================================
-- STEP 8: INDEXES FOR PERFORMANCE
-- ========================================

-- Users
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_google_id ON users(google_id);

-- Tenants
CREATE INDEX idx_tenants_owner ON tenants(owner_id);
CREATE INDEX idx_tenants_status ON tenants(status);

-- Memberships
CREATE INDEX idx_memberships_user ON memberships(user_id);
CREATE INDEX idx_memberships_tenant ON memberships(tenant_id);

-- Credit
CREATE INDEX idx_credit_wallets_tenant ON credit_wallets(tenant_id);
CREATE INDEX idx_credit_trans_tenant ON credit_transactions(tenant_id);
CREATE INDEX idx_credit_trans_type ON credit_transactions(type);

-- Events
CREATE INDEX idx_events_tenant ON events(tenant_id);
CREATE INDEX idx_events_status ON events(status);

-- Event Staff
CREATE INDEX idx_event_staff_event ON event_staff(event_id);
CREATE INDEX idx_event_staff_user ON event_staff(user_id);

-- Ticket Types
CREATE INDEX idx_ticket_types_event ON ticket_types(event_id);

-- Participants
CREATE INDEX idx_participants_event ON participants(event_id);
CREATE INDEX idx_participants_tenant ON participants(tenant_id);
CREATE INDEX idx_participants_qr ON participants(qr_code);
CREATE INDEX idx_participants_email ON participants(email);
CREATE INDEX idx_participants_checked_in ON participants(is_checked_in);

-- Checkins
CREATE INDEX idx_checkins_event ON checkins(event_id);
CREATE INDEX idx_checkins_participant ON checkins(participant_id);
CREATE INDEX idx_checkins_operator ON checkins(operator_id);

-- Display Queue
CREATE INDEX idx_display_queue_event ON display_queue(event_id);
CREATE INDEX idx_display_queue_displayed ON display_queue(is_displayed);

-- Scan Logs
CREATE INDEX idx_scan_logs_event ON scan_logs(event_id);
CREATE INDEX idx_scan_logs_tenant ON scan_logs(tenant_id);

-- F&B
CREATE INDEX idx_booths_event ON booths(event_id);
CREATE INDEX idx_menu_items_event ON menu_items(event_id);
CREATE INDEX idx_menu_items_type ON menu_items(menu_type);
CREATE INDEX idx_menu_items_booth ON menu_items(booth_id);
CREATE INDEX idx_stock_logs_event ON stock_logs(event_id);
CREATE INDEX idx_stock_logs_menu_item ON stock_logs(menu_item_id);
CREATE INDEX idx_stock_logs_created ON stock_logs(created_at);
CREATE INDEX idx_claims_event ON claims(event_id);
CREATE INDEX idx_claims_participant ON claims(participant_id);
CREATE INDEX idx_claims_menu_item ON claims(menu_item_id);
CREATE INDEX idx_claims_booth ON claims(booth_id);

-- ========================================
-- STEP 9: DISABLE ROW LEVEL SECURITY
-- ========================================
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE tenants DISABLE ROW LEVEL SECURITY;
ALTER TABLE memberships DISABLE ROW LEVEL SECURITY;
ALTER TABLE credit_wallets DISABLE ROW LEVEL SECURITY;
ALTER TABLE credit_transactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE pricing_packages DISABLE ROW LEVEL SECURITY;
ALTER TABLE credit_settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE events DISABLE ROW LEVEL SECURITY;
ALTER TABLE event_staff DISABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_types DISABLE ROW LEVEL SECURITY;
ALTER TABLE participants DISABLE ROW LEVEL SECURITY;
ALTER TABLE checkins DISABLE ROW LEVEL SECURITY;
ALTER TABLE display_queue DISABLE ROW LEVEL SECURITY;
ALTER TABLE scan_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE booths DISABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE stock_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE claims DISABLE ROW LEVEL SECURITY;

-- ========================================
-- STEP 10: GRANT PERMISSIONS
-- ========================================
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;

-- ========================================
-- STEP 11: INSERT DEFAULT DATA
-- ========================================

-- Insert Pricing Packages
INSERT INTO pricing_packages (name, slug, credits_included, price, bonus_credits, is_popular, features, sort_order) VALUES
('Starter', 'starter', 500, 0, 50, FALSE, 
 '["500 credits gratis", "1 event aktif", "Support via email", "CSV import/export", "QR check-in"]'::jsonb, 1),
('Growth', 'growth', 1500, 150000, 250, FALSE, 
 '["1500 credits", "250 bonus credits", "Unlimited events", "Priority support", "AI photo generation", "Real-time display"]'::jsonb, 2),
('Business', 'business', 5000, 400000, 500, TRUE, 
 '["5000 credits", "500 bonus credits", "Unlimited events", "24/7 support", "AI photo generation", "API access", "Custom branding"]'::jsonb, 3),
('Enterprise', 'enterprise', 25000, 1750000, 2500, FALSE, 
 '["25000 credits", "2500 bonus credits", "Unlimited events", "Dedicated support", "All features", "Custom integration"]'::jsonb, 4);

-- Insert Credit Settings
INSERT INTO credit_settings (default_free_credits, default_bonus_credits, price_per_credit, min_credit_purchase, credit_per_checkin, credit_per_claim, credit_per_ai_photo) 
VALUES (500, 50, 80, 100, 1, 1, 3);

-- ========================================
-- STEP 12: VERIFY TABLES
-- ========================================
SELECT 
  tablename as table_name,
  CASE WHEN rowsecurity THEN 'ENABLED' ELSE 'DISABLED' END as rls_status
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- ========================================
-- DONE! 
-- Total Tables: 18
-- ========================================
