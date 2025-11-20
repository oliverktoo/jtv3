-- Migration: Tournament Organization Architecture Refactor
-- Purpose: Allow cross-organizational tournament participation while maintaining league integrity
-- Date: 2025-10-31

-- Step 1: Add participation model to tournaments
ALTER TABLE tournaments ADD COLUMN participation_model VARCHAR(50) DEFAULT 'ORGANIZATIONAL';

-- Step 2: Make team organization optional (allow independent teams)
ALTER TABLE teams ALTER COLUMN org_id DROP NOT NULL;

-- Step 3: Add indexes for new query patterns
CREATE INDEX idx_tournaments_participation_model ON tournaments(participation_model);
CREATE INDEX idx_teams_geographic_eligibility ON teams(county_id, sub_county_id, ward_id) WHERE org_id IS NULL;

-- Step 4: Update existing tournaments based on their model type
UPDATE tournaments 
SET participation_model = CASE 
  WHEN tournament_model = 'LEAGUE' THEN 'ORGANIZATIONAL'
  WHEN tournament_model IN ('ADMINISTRATIVE_WARD', 'ADMINISTRATIVE_SUB_COUNTY', 'ADMINISTRATIVE_COUNTY', 'ADMINISTRATIVE_NATIONAL') THEN 'GEOGRAPHIC'  
  WHEN tournament_model IN ('INTER_COUNTY', 'INDEPENDENT') THEN 'OPEN'
  ELSE 'ORGANIZATIONAL'
END;

-- Step 5: Add comments for clarity
COMMENT ON COLUMN tournaments.participation_model IS 'ORGANIZATIONAL: teams must be from organizing org (leagues), GEOGRAPHIC: geographic eligibility (admin tournaments), OPEN: any team can participate (independent tournaments)';
COMMENT ON COLUMN teams.org_id IS 'Organization membership - required for league participation, optional for geographic/open tournaments';

-- Step 6: Create view for backward compatibility
CREATE VIEW team_registrations_with_eligibility AS
SELECT 
  ttr.*,
  t.name as team_name,
  t.org_id as team_org_id,
  tour.name as tournament_name,
  tour.participation_model,
  tour.tournament_model,
  -- Eligibility indicators
  CASE 
    WHEN tour.participation_model = 'ORGANIZATIONAL' AND t.org_id = tour.org_id THEN true
    WHEN tour.participation_model = 'GEOGRAPHIC' AND (
      (tour.county_id IS NULL OR t.county_id = tour.county_id) AND
      (tour.sub_county_id IS NULL OR t.sub_county_id = tour.sub_county_id) AND  
      (tour.ward_id IS NULL OR t.ward_id = tour.ward_id)
    ) THEN true
    WHEN tour.participation_model = 'OPEN' THEN true
    ELSE false
  END as is_eligible
FROM team_tournament_registrations ttr
JOIN teams t ON t.id = ttr.team_id  
JOIN tournaments tour ON tour.id = ttr.tournament_id;