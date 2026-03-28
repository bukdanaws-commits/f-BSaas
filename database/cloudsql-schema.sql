-- ===========================================
-- EVENTIFY Database Schema
-- For Cloud SQL PostgreSQL (GCP Native)
-- No Supabase-specific features
-- ===========================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- CORE TABLES
-- ==========================================

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    avatar_url TEXT,
    google_id VARCHAR(255) UNIQUE,
    is_super_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tenants table (Multi-tenant organizations)
CREATE TABLE IF NOT EXISTS tenants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50),
    address TEXT,
    logo_url TEXT,
    status VARCHAR(50) DEFAULT 'active',
    owner_id UUID REFERENCES users(id),
    package_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Memberships (User-Tenant relationship)
CREATE TABLE IF NOT EXISTS memberships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    role VARCHAR(50) DEFAULT 'crew',
    permissions TEXT[],
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, tenant_id)
);

-- ==========================================
-- BILLING & CREDITS
-- ==========================================

-- Pricing Packages
CREATE TABLE IF NOT EXISTS pricing_packages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    credits_included INTEGER DEFAULT 0,
    price DECIMAL(12,2) DEFAULT 0,
    price_per_participant DECIMAL(12,2) DEFAULT 0,
    features TEXT[],
    is_popular BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Credit Wallets
CREATE TABLE IF NOT EXISTS credit_wallets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    balance INTEGER DEFAULT 0,
    bonus_balance INTEGER DEFAULT 0,
    total_purchased INTEGER DEFAULT 0,
    total_used INTEGER DEFAULT 0,
    total_bonus_received INTEGER DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(tenant_id)
);

-- Credit Transactions
CREATE TABLE IF NOT EXISTS credit_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    amount INTEGER NOT NULL,
    reference_type VARCHAR(100),
    reference_id UUID,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Credit Settings (Platform-wide)
CREATE TABLE IF NOT EXISTS credit_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    default_free_credits INTEGER DEFAULT 100,
    default_bonus_credits INTEGER DEFAULT 50,
    credit_per_checkin INTEGER DEFAULT 1,
    credit_per_claim INTEGER DEFAULT 1,
    credit_per_ai_photo INTEGER DEFAULT 5,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default credit settings
INSERT INTO credit_settings (default_free_credits, default_bonus_credits, credit_per_checkin, credit_per_claim)
VALUES (100, 50, 1, 1)
ON CONFLICT DO NOTHING;

-- ==========================================
-- EVENTS
-- ==========================================

-- Events table
CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255),
    description TEXT,
    banner_url TEXT,
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    location VARCHAR(255),
    category VARCHAR(100),
    capacity INTEGER DEFAULT 0,
    welcome_message TEXT DEFAULT 'Welcome to our event!',
    display_duration INTEGER DEFAULT 5,
    enable_sound BOOLEAN DEFAULT TRUE,
    check_in_desks INTEGER DEFAULT 1,
    default_max_food_claims INTEGER DEFAULT 2,
    default_max_drink_claims INTEGER DEFAULT 2,
    storage_days INTEGER DEFAULT 30,
    status VARCHAR(50) DEFAULT 'draft',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ticket Types
CREATE TABLE IF NOT EXISTS ticket_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(12,2) DEFAULT 0,
    quota INTEGER DEFAULT 0,
    sold INTEGER DEFAULT 0,
    is_free BOOLEAN DEFAULT TRUE,
    features TEXT[],
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- PARTICIPANTS
-- ==========================================

-- Participants table
CREATE TABLE IF NOT EXISTS participants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    ticket_type_id UUID REFERENCES ticket_types(id),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    company VARCHAR(255),
    job_title VARCHAR(255),
    dietary_restrictions TEXT,
    qr_code VARCHAR(255) UNIQUE NOT NULL,
    qr_code_url TEXT,
    is_checked_in BOOLEAN DEFAULT FALSE,
    checked_in_at TIMESTAMP WITH TIME ZONE,
    checkin_count INTEGER DEFAULT 0,
    food_claims INTEGER DEFAULT 0,
    drink_claims INTEGER DEFAULT 0,
    max_food_claims INTEGER DEFAULT 2,
    max_drink_claims INTEGER DEFAULT 2,
    is_active BOOLEAN DEFAULT TRUE,
    is_blacklisted BOOLEAN DEFAULT FALSE,
    original_photo_url TEXT,
    ai_photo_url TEXT,
    ai_generation_status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- F&B MANAGEMENT
-- ==========================================

-- Booths
CREATE TABLE IF NOT EXISTS booths (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    booth_type VARCHAR(50) DEFAULT 'both',
    description TEXT,
    location VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Menu Items
CREATE TABLE IF NOT EXISTS menu_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    booth_id UUID REFERENCES booths(id),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    menu_type VARCHAR(50) DEFAULT 'food',
    price DECIMAL(12,2) DEFAULT 0,
    initial_stock INTEGER DEFAULT 0,
    claimed INTEGER DEFAULT 0,
    image_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Menu Categories
CREATE TABLE IF NOT EXISTS menu_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) DEFAULT 'food',
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- CHECK-IN & CLAIMS
-- ==========================================

-- Check-in Records
CREATE TABLE IF NOT EXISTS checkin_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    participant_id UUID REFERENCES participants(id) ON DELETE CASCADE,
    operator_id UUID REFERENCES users(id),
    desk_number INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Claim Records
CREATE TABLE IF NOT EXISTS claim_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    participant_id UUID REFERENCES participants(id) ON DELETE CASCADE,
    menu_item_id UUID REFERENCES menu_items(id),
    claim_type VARCHAR(50) NOT NULL,
    operator_id UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- DISPLAY & QUEUE
-- ==========================================

-- Display Queue
CREATE TABLE IF NOT EXISTS display_queue (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    participant_id UUID REFERENCES participants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    photo_url TEXT,
    message TEXT,
    is_displayed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- STAFF MANAGEMENT
-- ==========================================

-- Event Staff (Crew assignments to events)
CREATE TABLE IF NOT EXISTS event_staff (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(50) DEFAULT 'crew',
    assigned_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(event_id, user_id)
);

-- Stock Logs
CREATE TABLE IF NOT EXISTS stock_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    menu_item_id UUID REFERENCES menu_items(id),
    action VARCHAR(50) NOT NULL,
    quantity INTEGER NOT NULL,
    previous_stock INTEGER,
    new_stock INTEGER,
    operator_id UUID REFERENCES users(id),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- SCAN LOGS
-- ==========================================

-- Scan Logs (All QR scans for analytics)
CREATE TABLE IF NOT EXISTS scan_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    qr_code VARCHAR(255) NOT NULL,
    scan_type VARCHAR(50) NOT NULL,
    success BOOLEAN DEFAULT TRUE,
    message TEXT,
    operator_id UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- INDEXES FOR PERFORMANCE
-- ==========================================

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id);
CREATE INDEX IF NOT EXISTS idx_tenants_slug ON tenants(slug);
CREATE INDEX IF NOT EXISTS idx_tenants_owner_id ON tenants(owner_id);
CREATE INDEX IF NOT EXISTS idx_memberships_user_id ON memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_memberships_tenant_id ON memberships(tenant_id);
CREATE INDEX IF NOT EXISTS idx_events_tenant_id ON events(tenant_id);
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);
CREATE INDEX IF NOT EXISTS idx_participants_event_id ON participants(event_id);
CREATE INDEX IF NOT EXISTS idx_participants_qr_code ON participants(qr_code);
CREATE INDEX IF NOT EXISTS idx_participants_email ON participants(email);
CREATE INDEX IF NOT EXISTS idx_checkin_records_event_id ON checkin_records(event_id);
CREATE INDEX IF NOT EXISTS idx_checkin_records_participant_id ON checkin_records(participant_id);
CREATE INDEX IF NOT EXISTS idx_claim_records_event_id ON claim_records(event_id);
CREATE INDEX IF NOT EXISTS idx_display_queue_event_id ON display_queue(event_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_event_id ON menu_items(event_id);
CREATE INDEX IF NOT EXISTS idx_booths_event_id ON booths(event_id);

-- ==========================================
-- SEED DATA
-- ==========================================

-- Insert pricing packages
INSERT INTO pricing_packages (name, slug, credits_included, price, features, is_popular, is_active, sort_order) VALUES
('Basic', 'basic', 100, 0, ARRAY['100 Free Credits','1 Event','Basic Support'], FALSE, TRUE, 1),
('Starter', 'starter', 500, 99000, ARRAY['500 Credits','5 Events','Email Support'], FALSE, TRUE, 2),
('Professional', 'professional', 2000, 349000, ARRAY['2000 Credits','Unlimited Events','Priority Support','Custom Branding'], TRUE, TRUE, 3),
('Enterprise', 'enterprise', 5000, 799000, ARRAY['5000 Credits','Unlimited Events','24/7 Support','Custom Branding','API Access','Dedicated Manager'], FALSE, TRUE, 4)
ON CONFLICT (slug) DO NOTHING;

-- ==========================================
-- UPDATE TRIGGER
-- ==========================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to tables
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
DROP TRIGGER IF EXISTS update_tenants_updated_at ON tenants;
CREATE TRIGGER update_tenants_updated_at BEFORE UPDATE ON tenants FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
DROP TRIGGER IF EXISTS update_events_updated_at ON events;
CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
DROP TRIGGER IF EXISTS update_participants_updated_at ON participants;
CREATE TRIGGER update_participants_updated_at BEFORE UPDATE ON participants FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
DROP TRIGGER IF EXISTS update_booths_updated_at ON booths;
CREATE TRIGGER update_booths_updated_at BEFORE UPDATE ON booths FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
DROP TRIGGER IF EXISTS update_menu_items_updated_at ON menu_items;
CREATE TRIGGER update_menu_items_updated_at BEFORE UPDATE ON menu_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
