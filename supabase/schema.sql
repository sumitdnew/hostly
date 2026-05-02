-- ============================================================
-- Hostly — Supabase PostgreSQL Schema
-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor)
-- ============================================================

-- 1. Organizations (tenants)
CREATE TABLE IF NOT EXISTS organizations (
  id TEXT PRIMARY KEY DEFAULT 'org-' || substr(gen_random_uuid()::text, 1, 8),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Profiles (extends Supabase auth.users)
--    Every Supabase auth user gets a row here with org + role info
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  org_id TEXT NOT NULL REFERENCES organizations(id),
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'owner' CHECK (role IN ('owner', 'staff')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Properties
CREATE TABLE IF NOT EXISTS properties (
  id TEXT PRIMARY KEY DEFAULT 'prop-' || substr(gen_random_uuid()::text, 1, 8),
  org_id TEXT NOT NULL REFERENCES organizations(id),
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  image_url TEXT,
  bedrooms INTEGER NOT NULL DEFAULT 1,
  bathrooms INTEGER NOT NULL DEFAULT 1,
  max_guests INTEGER NOT NULL DEFAULT 2,
  wifi_password TEXT,
  check_in_instructions TEXT,
  house_rules TEXT,
  emergency_contact TEXT,
  status TEXT NOT NULL DEFAULT 'active'
);

-- 4. Bookings
CREATE TABLE IF NOT EXISTS bookings (
  id TEXT PRIMARY KEY DEFAULT 'bk-' || substr(gen_random_uuid()::text, 1, 8),
  org_id TEXT NOT NULL REFERENCES organizations(id),
  property_id TEXT NOT NULL REFERENCES properties(id),
  guest_name TEXT NOT NULL,
  guest_email TEXT,
  guest_phone TEXT,
  guest_id_number TEXT,
  check_in TEXT NOT NULL,
  check_out TEXT NOT NULL,
  number_of_guests INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'confirmed',
  notes TEXT,
  id_verified BOOLEAN NOT NULL DEFAULT FALSE
);

-- 5. Messages (guest chat)
CREATE TABLE IF NOT EXISTS messages (
  id TEXT PRIMARY KEY DEFAULT 'msg-' || substr(gen_random_uuid()::text, 1, 8),
  booking_id TEXT NOT NULL REFERENCES bookings(id),
  sender TEXT NOT NULL,
  content TEXT NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. Maintenance Requests
CREATE TABLE IF NOT EXISTS maintenance_requests (
  id TEXT PRIMARY KEY DEFAULT 'mnt-' || substr(gen_random_uuid()::text, 1, 8),
  org_id TEXT NOT NULL REFERENCES organizations(id),
  property_id TEXT NOT NULL REFERENCES properties(id),
  booking_id TEXT,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'medium',
  status TEXT NOT NULL DEFAULT 'open',
  assigned_to TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at TIMESTAMPTZ
);

-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_profiles_org ON profiles(org_id);
CREATE INDEX IF NOT EXISTS idx_properties_org ON properties(org_id);
CREATE INDEX IF NOT EXISTS idx_bookings_org ON bookings(org_id);
CREATE INDEX IF NOT EXISTS idx_bookings_property ON bookings(property_id);
CREATE INDEX IF NOT EXISTS idx_messages_booking ON messages(booking_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_org ON maintenance_requests(org_id);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_requests ENABLE ROW LEVEL SECURITY;

-- Helper: get the org_id for the current auth user
CREATE OR REPLACE FUNCTION auth_org_id()
RETURNS TEXT AS $$
  SELECT org_id FROM profiles WHERE id = auth.uid()
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Organizations: users can only see their own org
CREATE POLICY "org_select" ON organizations FOR SELECT
  USING (id = auth_org_id());
CREATE POLICY "org_insert" ON organizations FOR INSERT
  WITH CHECK (true); -- signup creates org before profile exists

-- Profiles: users can see teammates
CREATE POLICY "profiles_select" ON profiles FOR SELECT
  USING (org_id = auth_org_id());
CREATE POLICY "profiles_insert" ON profiles FOR INSERT
  WITH CHECK (true); -- needed during signup trigger
CREATE POLICY "profiles_update" ON profiles FOR UPDATE
  USING (id = auth.uid());

-- Properties: tenant-scoped
CREATE POLICY "properties_select" ON properties FOR SELECT
  USING (org_id = auth_org_id());
CREATE POLICY "properties_insert" ON properties FOR INSERT
  WITH CHECK (org_id = auth_org_id());
CREATE POLICY "properties_update" ON properties FOR UPDATE
  USING (org_id = auth_org_id());
CREATE POLICY "properties_delete" ON properties FOR DELETE
  USING (org_id = auth_org_id());

-- Bookings: tenant-scoped + public read for guest check-in
CREATE POLICY "bookings_select" ON bookings FOR SELECT
  USING (org_id = auth_org_id());
CREATE POLICY "bookings_select_public" ON bookings FOR SELECT
  USING (auth.uid() IS NULL); -- anon can read for check-in portal
CREATE POLICY "bookings_insert" ON bookings FOR INSERT
  WITH CHECK (org_id = auth_org_id());
CREATE POLICY "bookings_update" ON bookings FOR UPDATE
  USING (org_id = auth_org_id() OR auth.uid() IS NULL); -- anon can verify ID
CREATE POLICY "bookings_delete" ON bookings FOR DELETE
  USING (org_id = auth_org_id());

-- Messages: accessible via booking ownership
CREATE POLICY "messages_select" ON messages FOR SELECT
  USING (
    booking_id IN (SELECT id FROM bookings WHERE org_id = auth_org_id())
  );
CREATE POLICY "messages_insert" ON messages FOR INSERT
  WITH CHECK (
    booking_id IN (SELECT id FROM bookings WHERE org_id = auth_org_id())
  );

-- Maintenance: tenant-scoped
CREATE POLICY "maintenance_select" ON maintenance_requests FOR SELECT
  USING (org_id = auth_org_id());
CREATE POLICY "maintenance_insert" ON maintenance_requests FOR INSERT
  WITH CHECK (org_id = auth_org_id());
CREATE POLICY "maintenance_update" ON maintenance_requests FOR UPDATE
  USING (org_id = auth_org_id());

-- ============================================================
-- TRIGGER: Auto-create profile on signup
-- (Called by Supabase Auth after a user signs up)
-- ============================================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, org_id, email, name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'org_id', ''),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'owner')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if any, then create
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
