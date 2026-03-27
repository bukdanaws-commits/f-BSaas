-- =====================================
-- FIX: DISABLE RLS + ADD MISSING TABLES
-- Run this in Supabase SQL Editor
-- =====================================

-- =====================================
-- 1. DISABLE RLS ON ALL TABLES
-- (Required for Golang backend connection)
-- =====================================

ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE tenants DISABLE ROW LEVEL SECURITY;
ALTER TABLE memberships DISABLE ROW LEVEL SECURITY;
ALTER TABLE events DISABLE ROW LEVEL SECURITY;
ALTER TABLE participants DISABLE ROW LEVEL SECURITY;
ALTER TABLE checkins DISABLE ROW LEVEL SECURITY;
ALTER TABLE claims DISABLE ROW LEVEL SECURITY;
ALTER TABLE credit_wallets DISABLE ROW LEVEL SECURITY;
ALTER TABLE credit_transactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE scan_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE display_queue DISABLE ROW LEVEL SECURITY;
ALTER TABLE booths DISABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE menu_categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_types DISABLE ROW LEVEL SECURITY;
ALTER TABLE event_staff DISABLE ROW LEVEL SECURITY;

-- =====================================
-- 2. PRICING PACKAGES TABLE
-- =====================================

CREATE TABLE IF NOT EXISTS pricing_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  credits INTEGER NOT NULL,
  price INTEGER NOT NULL, -- in IDR
  bonus_credits INTEGER DEFAULT 0,
  is_popular BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  features JSONB,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER trg_pricing_packages_updated
BEFORE UPDATE ON pricing_packages
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- =====================================
-- 3. CREDIT SETTINGS TABLE
-- =====================================

CREATE TABLE IF NOT EXISTS credit_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key TEXT UNIQUE NOT NULL,
  value INTEGER NOT NULL,
  description TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER trg_credit_settings_updated
BEFORE UPDATE ON credit_settings
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- =====================================
-- 4. INSERT DEFAULT PRICING PACKAGES
-- =====================================

INSERT INTO pricing_packages (name, slug, description, credits, price, bonus_credits, is_popular, features, sort_order) VALUES
('Basic', 'basic', 'Untuk event kecil dengan kebutuhan dasar', 500, 0, 0, FALSE, 
 '["500 credits gratis", "1 event aktif", "Support via email", "CSV import/export", "QR check-in dasar"]'::jsonb, 1),
 
('Pro', 'pro', 'Untuk event menengah dengan fitur lengkap', 1500, 150000, 500, TRUE, 
 '["1500 credits", "500 bonus credits", "Unlimited events", "Priority support", "AI photo generation", "Real-time display", "Custom branding"]'::jsonb, 2),
 
('Enterprise', 'enterprise', 'Untuk event besar dengan kebutuhan khusus', 5000, 500000, 2000, FALSE, 
 '["5000 credits", "2000 bonus credits", "Unlimited events", "24/7 dedicated support", "AI photo generation", "Real-time display", "Custom branding", "API access", "Custom integrations", "On-site support"]'::jsonb, 3)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  credits = EXCLUDED.credits,
  price = EXCLUDED.price,
  bonus_credits = EXCLUDED.bonus_credits,
  is_popular = EXCLUDED.is_popular,
  features = EXCLUDED.features,
  sort_order = EXCLUDED.sort_order;

-- =====================================
-- 5. INSERT DEFAULT CREDIT SETTINGS
-- =====================================

INSERT INTO credit_settings (setting_key, value, description) VALUES
('checkin_cost', 1, 'Biaya kredit per check-in'),
('claim_cost', 1, 'Biaya kredit per klaim F&B'),
('ai_photo_cost', 3, 'Biaya kredit per generate AI photo'),
('new_user_bonus', 500, 'Bonus credits untuk user baru'),
('storage_days', 15, 'Durasi penyimpanan data (hari)'),
('max_food_claims_default', 4, 'Default maksimal klaim makanan'),
('max_drink_claims_default', 2, 'Default maksimal klaim minuman')
ON CONFLICT (setting_key) DO UPDATE SET
  value = EXCLUDED.value,
  description = EXCLUDED.description;

-- =====================================
-- 6. CREATE INDEXES FOR NEW TABLES
-- =====================================

CREATE INDEX IF NOT EXISTS idx_pricing_packages_slug ON pricing_packages(slug);
CREATE INDEX IF NOT EXISTS idx_pricing_packages_active ON pricing_packages(is_active) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_credit_settings_key ON credit_settings(setting_key);

-- =====================================
-- 7. GRANT PERMISSIONS
-- =====================================

-- Grant all permissions to postgres user (service role)
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres;

-- Grant permissions to anon role (if needed for frontend)
GRANT SELECT ON pricing_packages TO anon;
GRANT SELECT ON credit_settings TO anon;

-- =====================================
-- DONE! 
-- After running this SQL:
-- 1. Golang backend should be able to connect
-- 2. Pricing packages available at /api/pricing/packages
-- 3. Credit settings configurable by super admin
-- =====================================
