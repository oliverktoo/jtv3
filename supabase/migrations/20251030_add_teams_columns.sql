-- Add missing columns to teams table for geographic and organizational references
-- This migration ensures the teams table has all required columns

-- First, check if columns exist and add them if missing
DO $$ 
BEGIN
    -- Add org_id column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'teams' AND column_name = 'org_id') THEN
        ALTER TABLE teams ADD COLUMN org_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
        CREATE INDEX IF NOT EXISTS idx_teams_org_id ON teams(org_id);
    END IF;

    -- Add geographic columns if they don't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'teams' AND column_name = 'county_id') THEN
        ALTER TABLE teams ADD COLUMN county_id UUID REFERENCES counties(id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'teams' AND column_name = 'sub_county_id') THEN
        ALTER TABLE teams ADD COLUMN sub_county_id UUID REFERENCES sub_counties(id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'teams' AND column_name = 'ward_id') THEN
        ALTER TABLE teams ADD COLUMN ward_id UUID REFERENCES wards(id);
    END IF;

    -- Add indexes for geographic columns
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE tablename = 'teams' AND indexname = 'idx_teams_county_id') THEN
        CREATE INDEX idx_teams_county_id ON teams(county_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE tablename = 'teams' AND indexname = 'idx_teams_ward_id') THEN
        CREATE INDEX idx_teams_ward_id ON teams(ward_id);
    END IF;

    RAISE NOTICE 'Teams table migration completed successfully';
END $$;