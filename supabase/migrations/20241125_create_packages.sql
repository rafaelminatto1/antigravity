-- Create packages table if it doesn't exist
CREATE TABLE IF NOT EXISTS packages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE, -- Changed from users to profiles
    total_sessions INT NOT NULL,
    used_sessions INT NOT NULL DEFAULT 0,
    total_value NUMERIC(10, 2) NOT NULL,
    payment_status TEXT DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE packages ENABLE ROW LEVEL SECURITY;

-- Create policy
DO $$ BEGIN
    CREATE POLICY "Users can view packages in their organization" ON packages
        FOR SELECT USING (org_id IN (SELECT org_id FROM profiles WHERE auth.uid() = profiles.id));
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
