-- MANUAL SQL SCRIPT TO CREATE TEAM_TOURNAMENT_REGISTRATIONS TABLE
-- Copy and paste this into Supabase Dashboard > SQL Editor > New Query

-- Step 1: Create the registration_status_enum (if it doesn't exist)
DO $$ BEGIN
    CREATE TYPE registration_status_enum AS ENUM (
        'DRAFT', 
        'SUBMITTED', 
        'IN_REVIEW', 
        'APPROVED', 
        'REJECTED', 
        'SUSPENDED', 
        'INCOMPLETE'
    );
EXCEPTION
    WHEN duplicate_object THEN 
        RAISE NOTICE 'registration_status_enum already exists, skipping...';
END $$;

-- Step 2: Create the team_tournament_registrations table
CREATE TABLE IF NOT EXISTS team_tournament_registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Foreign keys
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
    representing_org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    
    -- Registration details
    registration_status registration_status_enum DEFAULT 'DRAFT',
    registration_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    approval_date TIMESTAMP WITH TIME ZONE,
    rejection_date TIMESTAMP WITH TIME ZONE,
    rejection_reason TEXT,
    
    -- Tournament-specific team details
    squad_size INTEGER DEFAULT 22,
    jersey_colors TEXT,
    captain_player_id UUID,
    coach_name VARCHAR(255),
    
    -- Administrative fields
    registered_by UUID,
    approved_by UUID,
    notes TEXT,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    UNIQUE(team_id, tournament_id)
);

-- Step 3: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_team_tournament_registrations_team_id 
    ON team_tournament_registrations(team_id);

CREATE INDEX IF NOT EXISTS idx_team_tournament_registrations_tournament_id 
    ON team_tournament_registrations(tournament_id);

CREATE INDEX IF NOT EXISTS idx_team_tournament_registrations_representing_org 
    ON team_tournament_registrations(representing_org_id);

CREATE INDEX IF NOT EXISTS idx_team_tournament_registrations_status 
    ON team_tournament_registrations(registration_status);

-- Step 4: Add RLS (Row Level Security) policy
ALTER TABLE team_tournament_registrations ENABLE ROW LEVEL SECURITY;

-- Basic RLS policy - adjust as needed for your security requirements
CREATE POLICY "Allow all operations for now" ON team_tournament_registrations
    FOR ALL USING (true);

-- Step 5: Grant permissions (if needed)
-- GRANT ALL ON team_tournament_registrations TO authenticated;
-- GRANT ALL ON team_tournament_registrations TO anon;

-- Verification query - run this to confirm the table was created
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'team_tournament_registrations' 
ORDER BY ordinal_position;