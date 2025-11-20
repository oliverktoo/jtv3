-- Migration: Add Manager-Led Registration Tables
-- Date: 2025-10-30
-- Description: Creates tables for team managers, team invitations, and manager-team relationships

-- Teams table (extends existing team functionality)
CREATE TABLE IF NOT EXISTS teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL,
  tournament_id UUID REFERENCES tournaments(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  manager_id UUID, -- References team_managers.id
  club_name VARCHAR(255),
  registration_status VARCHAR(50) DEFAULT 'DRAFT', -- DRAFT, ACTIVE, SUSPENDED, DISBANDED
  max_players INTEGER DEFAULT 22,
  contact_email VARCHAR(255),
  contact_phone VARCHAR(20),
  home_venue VARCHAR(255),
  founded_date DATE,
  description TEXT,
  logo_url VARCHAR(500),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT teams_org_id_fkey FOREIGN KEY (org_id) REFERENCES organizations(id) ON DELETE CASCADE,
  CONSTRAINT teams_name_org_unique UNIQUE (name, org_id)
);

-- Team Managers table
CREATE TABLE IF NOT EXISTS team_managers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL,
  user_id UUID, -- Optional link to system users
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone_number VARCHAR(20),
  id_number VARCHAR(50), -- National ID or passport
  certification_level VARCHAR(50), -- e.g., 'CAF_A', 'CAF_B', 'GRASSROOTS'
  certification_expiry DATE,
  license_number VARCHAR(50),
  emergency_contact_name VARCHAR(255),
  emergency_contact_phone VARCHAR(20),
  address TEXT,
  date_of_birth DATE,
  status VARCHAR(50) DEFAULT 'ACTIVE', -- ACTIVE, SUSPENDED, INACTIVE
  profile_image_url VARCHAR(500),
  bio TEXT,
  experience_years INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT team_managers_org_id_fkey FOREIGN KEY (org_id) REFERENCES organizations(id) ON DELETE CASCADE,
  CONSTRAINT team_managers_email_org_unique UNIQUE (email, org_id),
  CONSTRAINT team_managers_id_number_org_unique UNIQUE (id_number, org_id) WHERE id_number IS NOT NULL
);

-- Manager-Team Relationships (many-to-many)
CREATE TABLE IF NOT EXISTS manager_team_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  manager_id UUID NOT NULL REFERENCES team_managers(id) ON DELETE CASCADE,
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  role VARCHAR(50) DEFAULT 'HEAD_MANAGER', -- HEAD_MANAGER, ASSISTANT_MANAGER, TECHNICAL_DIRECTOR
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  assigned_by UUID, -- References user who made the assignment
  status VARCHAR(50) DEFAULT 'ACTIVE', -- ACTIVE, INACTIVE, TERMINATED
  start_date DATE DEFAULT CURRENT_DATE,
  end_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT manager_team_assignments_unique UNIQUE (manager_id, team_id, role)
);

-- Team Invitations table
CREATE TABLE IF NOT EXISTS team_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  manager_id UUID NOT NULL REFERENCES team_managers(id) ON DELETE CASCADE,
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  org_id UUID NOT NULL,
  tournament_id UUID REFERENCES tournaments(id) ON DELETE SET NULL,
  
  -- Player Information
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone_number VARCHAR(20),
  position VARCHAR(50), -- GOALKEEPER, DEFENDER, MIDFIELDER, FORWARD
  jersey_number INTEGER,
  
  -- Invitation Details
  invitation_code VARCHAR(32) UNIQUE NOT NULL, -- Unique code for registration link
  registration_link TEXT NOT NULL,
  custom_message TEXT,
  invited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '30 days'),
  
  -- Status Tracking
  status VARCHAR(50) DEFAULT 'PENDING', -- PENDING, STARTED, COMPLETED, EXPIRED, CANCELLED
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  cancelled_at TIMESTAMP WITH TIME ZONE,
  
  -- Communication Tracking
  reminders_sent INTEGER DEFAULT 0,
  last_reminder_at TIMESTAMP WITH TIME ZONE,
  email_opens INTEGER DEFAULT 0,
  link_clicks INTEGER DEFAULT 0,
  last_activity_at TIMESTAMP WITH TIME ZONE,
  
  -- Registration Result (when completed)
  player_registry_id UUID REFERENCES player_registry(id) ON DELETE SET NULL,
  registration_notes TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT team_invitations_org_id_fkey FOREIGN KEY (org_id) REFERENCES organizations(id) ON DELETE CASCADE,
  CONSTRAINT team_invitations_email_team_unique UNIQUE (email, team_id) WHERE team_id IS NOT NULL,
  CONSTRAINT team_invitations_jersey_team_unique UNIQUE (jersey_number, team_id) WHERE jersey_number IS NOT NULL AND team_id IS NOT NULL
);

-- Email Delivery Log (for tracking email sends)
CREATE TABLE IF NOT EXISTS invitation_email_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invitation_id UUID NOT NULL REFERENCES team_invitations(id) ON DELETE CASCADE,
  email_type VARCHAR(50) NOT NULL, -- INITIAL_INVITE, REMINDER, COMPLETION_NOTICE
  recipient_email VARCHAR(255) NOT NULL,
  subject VARCHAR(500),
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  delivery_status VARCHAR(50) DEFAULT 'SENT', -- SENT, DELIVERED, BOUNCED, FAILED
  delivery_message TEXT,
  opened_at TIMESTAMP WITH TIME ZONE,
  clicked_at TIMESTAMP WITH TIME ZONE,
  provider VARCHAR(50), -- SUPABASE, SENDGRID, etc.
  provider_message_id VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Manager Permissions (for granular access control)
CREATE TABLE IF NOT EXISTS manager_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  manager_id UUID NOT NULL REFERENCES team_managers(id) ON DELETE CASCADE,
  permission VARCHAR(100) NOT NULL, -- e.g., 'INVITE_PLAYERS', 'MANAGE_ROSTER', 'VIEW_ANALYTICS'
  granted_by UUID, -- References user who granted permission
  granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT manager_permissions_unique UNIQUE (manager_id, permission)
);

-- Invitation Templates (for customizable email templates)
CREATE TABLE IF NOT EXISTS invitation_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL,
  manager_id UUID REFERENCES team_managers(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  template_type VARCHAR(50) NOT NULL, -- INITIAL_INVITE, REMINDER, FOLLOW_UP
  subject_template TEXT NOT NULL,
  body_template TEXT NOT NULL,
  is_default BOOLEAN DEFAULT FALSE,
  variables JSONB, -- Available template variables
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT invitation_templates_org_id_fkey FOREIGN KEY (org_id) REFERENCES organizations(id) ON DELETE CASCADE,
  CONSTRAINT invitation_templates_name_org_unique UNIQUE (name, org_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_teams_org_id ON teams(org_id);
CREATE INDEX IF NOT EXISTS idx_teams_tournament_id ON teams(tournament_id);
CREATE INDEX IF NOT EXISTS idx_teams_manager_id ON teams(manager_id);

CREATE INDEX IF NOT EXISTS idx_team_managers_org_id ON team_managers(org_id);
CREATE INDEX IF NOT EXISTS idx_team_managers_email ON team_managers(email);
CREATE INDEX IF NOT EXISTS idx_team_managers_status ON team_managers(status);

CREATE INDEX IF NOT EXISTS idx_manager_team_assignments_manager_id ON manager_team_assignments(manager_id);
CREATE INDEX IF NOT EXISTS idx_manager_team_assignments_team_id ON manager_team_assignments(team_id);

CREATE INDEX IF NOT EXISTS idx_team_invitations_manager_id ON team_invitations(manager_id);
CREATE INDEX IF NOT EXISTS idx_team_invitations_team_id ON team_invitations(team_id);
CREATE INDEX IF NOT EXISTS idx_team_invitations_org_id ON team_invitations(org_id);
CREATE INDEX IF NOT EXISTS idx_team_invitations_status ON team_invitations(status);
CREATE INDEX IF NOT EXISTS idx_team_invitations_email ON team_invitations(email);
CREATE INDEX IF NOT EXISTS idx_team_invitations_invitation_code ON team_invitations(invitation_code);
CREATE INDEX IF NOT EXISTS idx_team_invitations_expires_at ON team_invitations(expires_at);

CREATE INDEX IF NOT EXISTS idx_invitation_email_log_invitation_id ON invitation_email_log(invitation_id);
CREATE INDEX IF NOT EXISTS idx_invitation_email_log_sent_at ON invitation_email_log(sent_at);
CREATE INDEX IF NOT EXISTS idx_invitation_email_log_delivery_status ON invitation_email_log(delivery_status);

-- Row Level Security (RLS) Policies
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_managers ENABLE ROW LEVEL SECURITY;
ALTER TABLE manager_team_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE invitation_email_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE manager_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE invitation_templates ENABLE ROW LEVEL SECURITY;

-- RLS Policies (organization-scoped)
CREATE POLICY "teams_org_isolation" ON teams FOR ALL USING (org_id::text = current_setting('app.current_org_id', true));
CREATE POLICY "team_managers_org_isolation" ON team_managers FOR ALL USING (org_id::text = current_setting('app.current_org_id', true));
CREATE POLICY "team_invitations_org_isolation" ON team_invitations FOR ALL USING (org_id::text = current_setting('app.current_org_id', true));
CREATE POLICY "invitation_templates_org_isolation" ON invitation_templates FOR ALL USING (org_id::text = current_setting('app.current_org_id', true));

-- Manager-scoped policies for assignments, invitations, and logs
CREATE POLICY "manager_team_assignments_access" ON manager_team_assignments FOR ALL USING (
  manager_id IN (SELECT id FROM team_managers WHERE org_id::text = current_setting('app.current_org_id', true))
);

CREATE POLICY "invitation_email_log_access" ON invitation_email_log FOR ALL USING (
  invitation_id IN (SELECT id FROM team_invitations WHERE org_id::text = current_setting('app.current_org_id', true))
);

CREATE POLICY "manager_permissions_access" ON manager_permissions FOR ALL USING (
  manager_id IN (SELECT id FROM team_managers WHERE org_id::text = current_setting('app.current_org_id', true))
);

-- Functions for invitation management
CREATE OR REPLACE FUNCTION generate_invitation_code()
RETURNS TEXT AS $$
BEGIN
  RETURN encode(gen_random_bytes(16), 'hex');
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION generate_registration_link(invitation_code TEXT, org_id UUID)
RETURNS TEXT AS $$
BEGIN
  -- In production, this would use the actual domain
  RETURN 'https://jamiitourney.com/register/' || invitation_code || '?org=' || org_id;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply update triggers
CREATE TRIGGER update_teams_updated_at BEFORE UPDATE ON teams FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_team_managers_updated_at BEFORE UPDATE ON team_managers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_manager_team_assignments_updated_at BEFORE UPDATE ON manager_team_assignments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_team_invitations_updated_at BEFORE UPDATE ON team_invitations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_invitation_templates_updated_at BEFORE UPDATE ON invitation_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Auto-generate invitation codes and links
CREATE OR REPLACE FUNCTION auto_generate_invitation_details()
RETURNS TRIGGER AS $$
BEGIN
  -- Generate invitation code if not provided
  IF NEW.invitation_code IS NULL OR NEW.invitation_code = '' THEN
    NEW.invitation_code = generate_invitation_code();
  END IF;
  
  -- Generate registration link
  NEW.registration_link = generate_registration_link(NEW.invitation_code, NEW.org_id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER auto_generate_invitation_details_trigger 
  BEFORE INSERT ON team_invitations 
  FOR EACH ROW 
  EXECUTE FUNCTION auto_generate_invitation_details();

-- Auto-expire invitations
CREATE OR REPLACE FUNCTION update_expired_invitations()
RETURNS void AS $$
BEGIN
  UPDATE team_invitations 
  SET status = 'EXPIRED'
  WHERE status = 'PENDING' 
    AND expires_at < NOW()
    AND expires_at IS NOT NULL;
END;
$$ LANGUAGE plpgsql;

-- Comments for documentation
COMMENT ON TABLE teams IS 'Team entities with manager assignments and registration status';
COMMENT ON TABLE team_managers IS 'Team managers who can invite players and manage rosters';
COMMENT ON TABLE manager_team_assignments IS 'Many-to-many relationship between managers and teams';
COMMENT ON TABLE team_invitations IS 'Player invitations sent by team managers with tracking';
COMMENT ON TABLE invitation_email_log IS 'Email delivery tracking for invitation communications';
COMMENT ON TABLE manager_permissions IS 'Granular permissions for team manager capabilities';
COMMENT ON TABLE invitation_templates IS 'Customizable email templates for invitations';