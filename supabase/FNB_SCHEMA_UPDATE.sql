-- ========================================
-- F&B SCHEMA UPDATE - EVENTIFY (Safe Version)
-- Run this to add F&B related tables and columns
-- ========================================

-- ========================================
-- 1. UPDATE events TABLE - Add F&B columns
-- ========================================
ALTER TABLE events ADD COLUMN IF NOT EXISTS enable_food BOOLEAN DEFAULT true;
ALTER TABLE events ADD COLUMN IF NOT EXISTS enable_drink BOOLEAN DEFAULT true;
ALTER TABLE events ADD COLUMN IF NOT EXISTS multi_booth_mode BOOLEAN DEFAULT true;

-- ========================================
-- 2. BOOTHS TABLE - Add missing columns
-- ========================================
-- Check what columns exist and add missing ones
DO $$
BEGIN
  -- Add description column if not exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'booths' AND column_name = 'description') THEN
    ALTER TABLE booths ADD COLUMN description TEXT;
  END IF;
  
  -- Add updated_at column if not exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'booths' AND column_name = 'updated_at') THEN
    ALTER TABLE booths ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
  END IF;
  
  -- Rename 'type' to 'booth_type' if 'type' exists and 'booth_type' doesn't
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'booths' AND column_name = 'type') 
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'booths' AND column_name = 'booth_type') THEN
    ALTER TABLE booths RENAME COLUMN type TO booth_type;
  END IF;
  
  -- Add booth_type column if not exists (after rename attempt)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'booths' AND column_name = 'booth_type') THEN
    ALTER TABLE booths ADD COLUMN booth_type VARCHAR(50) DEFAULT 'food';
  END IF;
END $$;

-- ========================================
-- 3. MENU CATEGORIES TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS menu_categories (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id    UUID REFERENCES events(id) ON DELETE CASCADE,
  name        VARCHAR(255) NOT NULL,
  category_type VARCHAR(50) NOT NULL,
  sort_order  INTEGER DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================
-- 4. MENU ITEMS TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS menu_items (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id      UUID REFERENCES events(id) ON DELETE CASCADE,
  category_id   UUID REFERENCES menu_categories(id) ON DELETE SET NULL,
  booth_id      UUID REFERENCES booths(id) ON DELETE SET NULL,
  name          VARCHAR(255) NOT NULL,
  description   TEXT,
  menu_type     VARCHAR(50) NOT NULL DEFAULT 'food',
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

-- Add missing columns to menu_items if table already exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'menu_items' AND column_name = 'booth_id') THEN
    ALTER TABLE menu_items ADD COLUMN booth_id UUID REFERENCES booths(id) ON DELETE SET NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'menu_items' AND column_name = 'initial_stock') THEN
    ALTER TABLE menu_items ADD COLUMN initial_stock INTEGER DEFAULT 0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'menu_items' AND column_name = 'claimed') THEN
    ALTER TABLE menu_items ADD COLUMN claimed INTEGER DEFAULT 0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'menu_items' AND column_name = 'price') THEN
    ALTER TABLE menu_items ADD COLUMN price INTEGER DEFAULT 0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'menu_items' AND column_name = 'image_url') THEN
    ALTER TABLE menu_items ADD COLUMN image_url TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'menu_items' AND column_name = 'sort_order') THEN
    ALTER TABLE menu_items ADD COLUMN sort_order INTEGER DEFAULT 0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'menu_items' AND column_name = 'updated_at') THEN
    ALTER TABLE menu_items ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
  END IF;
  -- Rename 'type' to 'menu_type' if exists
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'menu_items' AND column_name = 'type')
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'menu_items' AND column_name = 'menu_type') THEN
    ALTER TABLE menu_items RENAME COLUMN type TO menu_type;
  END IF;
END $$;

-- ========================================
-- 5. STOCK LOGS TABLE (NEW)
-- ========================================
CREATE TABLE IF NOT EXISTS stock_logs (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id      UUID REFERENCES tenants(id),
  event_id       UUID REFERENCES events(id) ON DELETE CASCADE,
  menu_item_id   UUID REFERENCES menu_items(id) ON DELETE CASCADE,
  booth_id       UUID REFERENCES booths(id) ON DELETE SET NULL,
  change_type    VARCHAR(50) NOT NULL,
  quantity       INTEGER NOT NULL,
  previous_stock INTEGER NOT NULL,
  new_stock      INTEGER NOT NULL,
  operator_id    UUID REFERENCES users(id),
  operator_name  VARCHAR(255),
  reference_type VARCHAR(100),
  reference_id   UUID,
  notes          TEXT,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================
-- 6. CLAIMS TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS claims (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id       UUID REFERENCES events(id) ON DELETE CASCADE,
  participant_id UUID REFERENCES participants(id) ON DELETE CASCADE,
  menu_item_id   UUID REFERENCES menu_items(id) ON DELETE CASCADE,
  booth_id       UUID REFERENCES booths(id) ON DELETE SET NULL,
  operator_id    UUID REFERENCES users(id),
  claimed_at     TIMESTAMPTZ DEFAULT NOW(),
  notes          TEXT
);

-- Add notes column if not exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'claims' AND column_name = 'notes') THEN
    ALTER TABLE claims ADD COLUMN notes TEXT;
  END IF;
END $$;

-- ========================================
-- 7. INDEXES for Performance
-- ========================================
CREATE INDEX IF NOT EXISTS idx_booths_event ON booths(event_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_event ON menu_items(event_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_type ON menu_items(menu_type);
CREATE INDEX IF NOT EXISTS idx_menu_items_booth ON menu_items(booth_id);
CREATE INDEX IF NOT EXISTS idx_stock_logs_event ON stock_logs(event_id);
CREATE INDEX IF NOT EXISTS idx_stock_logs_menu_item ON stock_logs(menu_item_id);
CREATE INDEX IF NOT EXISTS idx_stock_logs_created ON stock_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_claims_event ON claims(event_id);
CREATE INDEX IF NOT EXISTS idx_claims_participant ON claims(participant_id);
CREATE INDEX IF NOT EXISTS idx_claims_menu_item ON claims(menu_item_id);
CREATE INDEX IF NOT EXISTS idx_claims_booth ON claims(booth_id);

-- ========================================
-- 8. DISABLE RLS
-- ========================================
ALTER TABLE booths DISABLE ROW LEVEL SECURITY;
ALTER TABLE menu_categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE stock_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE claims DISABLE ROW LEVEL SECURITY;

-- ========================================
-- DONE!
-- ========================================
SELECT 'F&B Schema Update Complete!' as status;
