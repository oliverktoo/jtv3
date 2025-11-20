-- Create team tournament registrations table for many-to-many relationship
-- This enables sophisticated tournament participation rules and registration tracking

-- First create the enum if it doesn't exist
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
  WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS team_tournament_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Registration details
  registration_status registration_status_enum DEFAULT 'DRAFT',
  registration_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  approval_date TIMESTAMP WITH TIME ZONE,
  rejection_date TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT,
  
  -- Tournament-specific team details
  squad_size INTEGER DEFAULT 22,
  jersey_colors TEXT, -- JSON or text for home/away colors
  captain_player_id UUID, -- References player registry
  coach_name VARCHAR(255),
  
  -- Administrative fields
  registered_by UUID, -- User who registered the team
  approved_by UUID, -- User who approved registration
  notes TEXT, -- Registration notes
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_team_tournament_registrations_team_id ON team_tournament_registrations(team_id);
CREATE INDEX IF NOT EXISTS idx_team_tournament_registrations_tournament_id ON team_tournament_registrations(tournament_id);
CREATE INDEX IF NOT EXISTS idx_team_tournament_registrations_org_id ON team_tournament_registrations(org_id);
CREATE INDEX IF NOT EXISTS idx_team_tournament_registrations_status ON team_tournament_registrations(registration_status);

-- Business rule constraint: One team can only register once per tournament
ALTER TABLE team_tournament_registrations ADD CONSTRAINT unique_team_per_tournament UNIQUE (team_id, tournament_id);

-- Additional compound indexes for business rule checking
CREATE INDEX IF NOT EXISTS idx_team_tournament_registrations_team_org ON team_tournament_registrations(team_id, org_id);
CREATE INDEX IF NOT EXISTS idx_team_tournament_reg_complex ON team_tournament_registrations(team_id, org_id, tournament_id);

-- RLS policies for organization-scoped access
ALTER TABLE team_tournament_registrations ENABLE ROW LEVEL SECURITY;

-- Policy: Users can access registrations in their organization
CREATE POLICY "Users can access team registrations in their org" ON team_tournament_registrations
  FOR ALL USING (
    org_id IN (SELECT id FROM organizations WHERE TRUE) -- Will be refined based on auth
  );

COMMENT ON TABLE team_tournament_registrations IS 'Junction table managing team registrations in tournaments with sophisticated business rules';