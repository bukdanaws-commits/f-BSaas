-- =====================================
-- COMPLETE FIX FOR SUPABASE DATABASE
-- Run this in Supabase SQL Editor
-- =====================================

-- =====================================
-- 1. CHECK AND DISABLE RLS ON ALL TABLES
-- =====================================

-- Disable RLS on all existing tables
ALTER TABLE IF EXISTS users DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS tenants DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS memberships DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS events DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS participants DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS checkins DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS claims DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS credit_wallets DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS credit_transactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS scan_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS display_queue DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS booths DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS menu_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS menu_categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS ticket_types DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS event_staff DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS pricing_packages DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS credit_settings DISABLE ROW LEVEL SECURITY;

-- =====================================
-- 2. CREATE PRICING PACKAGES TABLE (Match Golang Model)
-- =====================================

CREATE TABLE IF NOT EXISTS pricing_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  credits_included INTEGER NOT NULL,
  price INTEGER NOT NULL DEFAULT 0,
  price_per_participant INTEGER DEFAULT 0,
  features JSONB DEFAULT '{}',
  is_popular BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================
-- 3. CREATE CREDIT SETTINGS TABLE (Match Golang Model)
-- =====================================

CREATE TABLE IF NOT EXISTS credit_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  default_free_credits INTEGER DEFAULT 500,
  default_bonus_credits INTEGER DEFAULT 50,
  price_per_credit INTEGER DEFAULT 80,
  min_credit_purchase INTEGER DEFAULT 100,
  credit_per_checkin INTEGER DEFAULT 1,
  credit_per_claim INTEGER DEFAULT 1,
  credit_per_ai_photo INTEGER DEFAULT 3,
  updated_by UUID,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================
-- 4. INSERT DEFAULT PRICING PACKAGES
-- =====================================

INSERT INTO pricing_packages (name, slug, credits_included, price, price_per_participant, is_popular, features, sort_order) VALUES
('Basic', 'basic', 500, 0, 0, FALSE, 
 '["500 credits gratis", "1 event aktif", "Support via email", "CSV import/export", "QR check-in dasar"]'::jsonb, 1),
('Pro', 'pro', 1500, 150000, 0, TRUE, 
 '["1500 credits", "500 bonus credits", "Unlimited events", "Priority support", "AI photo generation", "Real-time display", "Custom branding"]'::jsonb, 2),
('Enterprise', 'enterprise', 5000, 500000, 0, FALSE, 
 '["5000 credits", "2000 bonus credits", "Unlimited events", "24/7 dedicated support", "AI photo generation", "Real-time display", "Custom branding", "API access", "Custom integrations"]'::jsonb, 3)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  credits_included = EXCLUDED.credits_included,
  price = EXCLUDED.price,
  is_popular = EXCLUDED.is_popular,
  features = EXCLUDED.features,
  sort_order = EXCLUDED.sort_order;

-- =====================================
-- 5. INSERT DEFAULT CREDIT SETTINGS
-- =====================================

INSERT INTO credit_settings (id, default_free_credits, default_bonus_credits, price_per_credit, min_credit_purchase, credit_per_checkin, credit_per_claim, credit_per_ai_photo) 
VALUES (gen_random_uuid(), 500, 50, 80, 100, 1, 1, 3)
ON CONFLICT DO NOTHING;

-- =====================================
-- 6. CREATE INDEXES FOR NEW TABLES
-- =====================================

CREATE INDEX IF NOT EXISTS idx_pricing_packages_slug ON pricing_packages(slug);
CREATE INDEX IF NOT EXISTS idx_pricing_packages_active ON pricing_packages(is_active) WHERE is_active = TRUE;

-- =====================================
-- 7. CREATE TRIGGERS FOR UPDATED_AT
-- =====================================

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_pricing_packages_updated ON pricing_packages;
CREATE TRIGGER trg_pricing_packages_updated
BEFORE UPDATE ON pricing_packages
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_credit_settings_updated ON credit_settings;
CREATE TRIGGER trg_credit_settings_updated
BEFORE UPDATE ON credit_settings
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- =====================================
-- 8. GRANT PERMISSIONS
-- =====================================

GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO postgres;

-- =====================================
-- 9. VERIFY - CHECK TABLES EXIST
-- =====================================

SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- =====================================
-- DONE!
-- After running this SQL:
-- 1. RLS disabled on all tables
-- 2. pricing_packages table created with default data
-- 3. credit_settings table created with default values
-- 4. Golang backend should be able to connect
-- =====================================
