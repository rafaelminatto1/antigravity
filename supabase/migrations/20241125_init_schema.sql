-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create organizations table
CREATE TABLE IF NOT EXISTS organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    cnpj TEXT UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create user_role enum
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('admin', 'physiotherapist', 'receptionist', 'patient');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create users table (extending auth.users)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    org_id UUID REFERENCES organizations(id) ON DELETE CASCADE, -- Made nullable for initial setup if needed, but ideally should be NOT NULL
    full_name TEXT NOT NULL,
    role user_role NOT NULL DEFAULT 'patient',
    avatar_url TEXT,
    phone TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create patients table
CREATE TABLE IF NOT EXISTS patients (
    id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    cpf TEXT,
    birth_date DATE,
    address TEXT,
    emergency_contact TEXT,
    occupation TEXT,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create appointment_status enum
DO $$ BEGIN
    CREATE TYPE appointment_status AS ENUM ('scheduled', 'confirmed', 'completed', 'canceled', 'no_show');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create appointments table
CREATE TABLE IF NOT EXISTS appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    physiotherapist_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    status appointment_status NOT NULL DEFAULT 'scheduled',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
    -- UNIQUE(physiotherapist_id, start_time) -- Commented out to allow overlapping if needed, or handle in app logic
);

-- Create sessions table
CREATE TABLE IF NOT EXISTS sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    appointment_id UUID UNIQUE REFERENCES appointments(id) ON DELETE SET NULL, -- Can be null if session created without appointment?
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    physiotherapist_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_date DATE NOT NULL,
    subjective TEXT,
    objective TEXT,
    assessment TEXT,
    plan JSONB,
    pain_level_before INT,
    pain_level_after INT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create body_pain_maps table
CREATE TABLE IF NOT EXISTS body_pain_maps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    points JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create packages table
CREATE TABLE IF NOT EXISTS packages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    total_sessions INT NOT NULL,
    used_sessions INT NOT NULL DEFAULT 0,
    total_value NUMERIC(10, 2) NOT NULL,
    payment_status TEXT DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE body_pain_maps ENABLE ROW LEVEL SECURITY;
ALTER TABLE packages ENABLE ROW LEVEL SECURITY;

-- Create policies (Simplified for now - authenticated users can access their org's data)
-- Note: In a real production scenario, you'd want stricter policies based on roles.

-- Organizations: Users can view their own organization
CREATE POLICY "Users can view their own organization" ON organizations
    FOR SELECT USING (id IN (SELECT org_id FROM users WHERE auth.uid() = users.id));

-- Users: Users can view members of their organization
CREATE POLICY "Users can view members of their organization" ON users
    FOR SELECT USING (org_id IN (SELECT org_id FROM users WHERE auth.uid() = users.id));

-- Patients: Users can view patients in their organization
CREATE POLICY "Users can view patients in their organization" ON patients
    FOR SELECT USING (org_id IN (SELECT org_id FROM users WHERE auth.uid() = users.id));

-- Appointments: Users can view/create/update appointments in their organization
CREATE POLICY "Users can view appointments in their organization" ON appointments
    FOR SELECT USING (org_id IN (SELECT org_id FROM users WHERE auth.uid() = users.id));

CREATE POLICY "Users can insert appointments in their organization" ON appointments
    FOR INSERT WITH CHECK (org_id IN (SELECT org_id FROM users WHERE auth.uid() = users.id));

CREATE POLICY "Users can update appointments in their organization" ON appointments
    FOR UPDATE USING (org_id IN (SELECT org_id FROM users WHERE auth.uid() = users.id));

-- Sessions: Users can view/create/update sessions in their organization
CREATE POLICY "Users can view sessions in their organization" ON sessions
    FOR SELECT USING (org_id IN (SELECT org_id FROM users WHERE auth.uid() = users.id));

CREATE POLICY "Users can insert sessions in their organization" ON sessions
    FOR INSERT WITH CHECK (org_id IN (SELECT org_id FROM users WHERE auth.uid() = users.id));

CREATE POLICY "Users can update sessions in their organization" ON sessions
    FOR UPDATE USING (org_id IN (SELECT org_id FROM users WHERE auth.uid() = users.id));

-- Body Pain Maps
CREATE POLICY "Users can view pain maps in their organization" ON body_pain_maps
    FOR SELECT USING (org_id IN (SELECT org_id FROM users WHERE auth.uid() = users.id));

CREATE POLICY "Users can insert pain maps in their organization" ON body_pain_maps
    FOR INSERT WITH CHECK (org_id IN (SELECT org_id FROM users WHERE auth.uid() = users.id));

-- Packages
CREATE POLICY "Users can view packages in their organization" ON packages
    FOR SELECT USING (org_id IN (SELECT org_id FROM users WHERE auth.uid() = users.id));

-- Function to handle new user signup (automatically create user record)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, full_name, role, org_id)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', 'admin', null); -- Org ID needs to be handled
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user
-- DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
-- CREATE TRIGGER on_auth_user_created
--   AFTER INSERT ON auth.users
--   FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
