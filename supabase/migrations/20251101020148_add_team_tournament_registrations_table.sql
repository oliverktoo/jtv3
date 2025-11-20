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
  registration_status TEXT DEFAULT 'DRAFT' CHECK (registration_status IN (
    'DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED', 'WITHDRAWN', 'SUSPENDED', 'CONFIRMED', 'CANCELLED'
  )),
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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_team_tournament_registrations_team_id ON team_tournament_registrations(team_id);
CREATE INDEX IF NOT EXISTS idx_team_tournament_registrations_tournament_id ON team_tournament_registrations(tournament_id);
CREATE INDEX IF NOT EXISTS idx_team_tournament_registrations_representing_org ON team_tournament_registrations(representing_org_id);
CREATE INDEX IF NOT EXISTS idx_team_tournament_registrations_affiliation ON team_tournament_registrations(affiliation_id);
CREATE INDEX IF NOT EXISTS idx_team_tournament_registrations_status ON team_tournament_registrations(registration_status);

-- Compound indexes for business rule checking
CREATE INDEX IF NOT EXISTS idx_team_tournament_reg_team_representing_org ON team_tournament_registrations(team_id, representing_org_id);

-- Business rule constraint: One team can only register once per tournament
CREATE UNIQUE INDEX IF NOT EXISTS unique_team_per_tournament ON team_tournament_registrations(team_id, tournament_id);

-- Enable Row Level Security (RLS)
ALTER TABLE team_tournament_registrations ENABLE ROW LEVEL SECURITY;

-- RLS Policies (replace with appropriate policies based on your auth setup)
-- For now, allowing all operations for authenticated users
CREATE POLICY "Allow all operations for authenticated users" ON team_tournament_registrations
  FOR ALL USING (true);

-- Update trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_team_tournament_registrations_updated_at 
  BEFORE UPDATE ON team_tournament_registrations 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
