-- Create the registration_status_enum if it doesn't exist
DO $$ BEGIN
    CREATE TYPE registration_status_enum AS ENUM ('DRAFT', 'SUBMITTED', 'IN_REVIEW', 'APPROVED', 'REJECTED', 'SUSPENDED', 'INCOMPLETE');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create team_tournament_registrations table
CREATE TABLE IF NOT EXISTS team_tournament_registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
    
    -- Organization team is representing (optional for independent teams in open tournaments)
    representing_org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    
    -- Team affiliation used for this registration (links to team_affiliations)
    affiliation_id UUID REFERENCES team_affiliations(id) ON DELETE SET NULL,
    
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
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- BUSINESS RULE CONSTRAINTS
    -- 1. Unique constraint: One team can only register once per tournament
    UNIQUE(team_id, tournament_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_team_tournament_registrations_team_id ON team_tournament_registrations(team_id);
CREATE INDEX IF NOT EXISTS idx_team_tournament_registrations_tournament_id ON team_tournament_registrations(tournament_id);
CREATE INDEX IF NOT EXISTS idx_team_tournament_registrations_representing_org ON team_tournament_registrations(representing_org_id);
CREATE INDEX IF NOT EXISTS idx_team_tournament_registrations_affiliation ON team_tournament_registrations(affiliation_id);
CREATE INDEX IF NOT EXISTS idx_team_tournament_registrations_status ON team_tournament_registrations(registration_status);
CREATE INDEX IF NOT EXISTS idx_team_tournament_reg_team_representing_org ON team_tournament_registrations(team_id, representing_org_id);