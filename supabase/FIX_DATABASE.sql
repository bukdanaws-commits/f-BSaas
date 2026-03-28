-- =====================================
-- COMPLETE FIX FOR SUPABASE DATABASE
-- COPY PASTE AND RUN IN SUPABASE SQL EDITOR
-- =====================================

-- =====================================
-- STEP 1: GRANT SCHEMA PERMISSIONS
-- =====================================
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO anon;
GRANT ALL ON SCHEMA public TO authenticated;
GRANT ALL ON SCHEMA public TO service_role;

-- =====================================
-- STEP 2: DISABLE RLS ON ALL TABLES
-- =====================================
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
        EXECUTE 'ALTER TABLE IF EXISTS ' || quote_ident(r.tablename) || ' DISABLE ROW LEVEL SECURITY';
    END LOOP;
END $$;

-- =====================================
-- STEP 3: CREATE MISSING TABLES
-- =====================================

-- ticket_types table
CREATE TABLE IF NOT EXISTS ticket_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  price INTEGER DEFAULT 0,
  quota INTEGER DEFAULT 0,
  features JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- event_staff table
CREATE TABLE IF NOT EXISTS event_staff (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'crew',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(event_id, user_id)
);

-- scan_logs table
CREATE TABLE IF NOT EXISTS scan_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  participant_id UUID REFERENCES participants(id) ON DELETE SET NULL,
  type TEXT,
  result TEXT,
  device TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- display_queue table
CREATE TABLE IF NOT EXISTS display_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  participant_id UUID REFERENCES participants(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  photo_url TEXT,
  is_displayed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- pricing_packages table (Match Golang Model)
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
-- STEP 4: FIX credit_settings TABLE STRUCTURE
-- =====================================

-- Drop and recreate credit_settings with correct structure
DROP TABLE IF EXISTS credit_settings CASCADE;
CREATE TABLE credit_settings (
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
-- STEP 5: INSERT DEFAULT DATA
-- =====================================

-- Insert pricing packages
INSERT INTO pricing_packages (name, slug, credits_included, price, is_popular, features, sort_order) VALUES
('Basic', 'basic', 500, 0, FALSE, 
 '["500 credits gratis", "1 event aktif", "Support via email", "CSV import/export", "QR check-in"]'::jsonb, 1),
('Pro', 'pro', 1500, 150000, TRUE, 
 '["1500 credits", "500 bonus credits", "Unlimited events", "Priority support", "AI photo generation", "Real-time display"]'::jsonb, 2),
('Enterprise', 'enterprise', 5000, 500000, FALSE, 
 '["5000 credits", "2000 bonus credits", "Unlimited events", "24/7 support", "AI photo generation", "API access"]'::jsonb, 3)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  credits_included = EXCLUDED.credits_included,
  price = EXCLUDED.price,
  is_popular = EXCLUDED.is_popular,
  features = EXCLUDED.features,
  sort_order = EXCLUDED.sort_order;

-- Insert credit settings
INSERT INTO credit_settings (id, default_free_credits, default_bonus_credits, price_per_credit, min_credit_purchase, credit_per_checkin, credit_per_claim, credit_per_ai_photo) 
VALUES (gen_random_uuid(), 500, 50, 80, 100, 1, 1, 3);

-- =====================================
-- STEP 6: CREATE INDEXES
-- =====================================
CREATE INDEX IF NOT EXISTS idx_ticket_types_event ON ticket_types(event_id);
CREATE INDEX IF NOT EXISTS idx_event_staff_event ON event_staff(event_id);
CREATE INDEX IF NOT EXISTS idx_scan_logs_event ON scan_logs(event_id);
CREATE INDEX IF NOT EXISTS idx_display_queue_event ON display_queue(event_id);
CREATE INDEX IF NOT EXISTS idx_pricing_packages_slug ON pricing_packages(slug);

-- =====================================
-- STEP 7: GRANT ALL PERMISSIONS
-- =====================================
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;

-- =====================================
-- STEP 8: VERIFY RESULTS (FIXED)
-- =====================================

-- Show all tables (using correct column name: tablename not table_name)
SELECT tablename, rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- Show pricing packages
SELECT name, credits_included, price FROM pricing_packages;

-- Show credit settings
SELECT * FROM credit_settings;

-- =====================================
-- DONE! 
-- Expected output:
-- - All tables listed with rls_enabled = false
-- - 3 pricing packages shown
-- - Credit settings row shown
-- =====================================
