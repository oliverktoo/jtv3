-- Enterprise-Grade Database Schema Optimization
-- Designed for high-performance fixture generation and real-time standings
-- Based on systems used by professional football platforms

-- Optimize existing matches table with proper constraints and indexes
ALTER TABLE matches 
ADD CONSTRAINT unique_fixture UNIQUE (tournament_id, home_team_id, away_team_id, leg),
ADD CONSTRAINT check_different_teams CHECK (home_team_id != away_team_id),
ADD CONSTRAINT check_valid_scores CHECK (
  (status = 'finished' AND home_score IS NOT NULL AND away_score IS NOT NULL) OR
  (status != 'finished' AND (home_score IS NULL OR away_score IS NULL))
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_matches_tournament_status ON matches(tournament_id, status);
CREATE INDEX IF NOT EXISTS idx_matches_date ON matches(match_date);
CREATE INDEX IF NOT EXISTS idx_matches_round ON matches(tournament_id, match_round);
CREATE INDEX IF NOT EXISTS idx_matches_teams ON matches(home_team_id, away_team_id);

-- Add fixture generation metadata table
CREATE TABLE IF NOT EXISTS fixture_generations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id UUID REFERENCES tournaments(id) ON DELETE CASCADE,
  generation_method VARCHAR(50) NOT NULL, -- 'round_robin', 'knockout', etc.
  config JSONB NOT NULL, -- Generation parameters and constraints
  total_rounds INTEGER,
  total_matches INTEGER,
  derby_matches INTEGER,
  optimization_score NUMERIC(10,2),
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  generated_by UUID, -- User who generated fixtures
  status VARCHAR(20) DEFAULT 'draft', -- 'draft', 'published', 'cancelled'
  validation_results JSONB, -- Validation errors and warnings
  CONSTRAINT check_positive_counts CHECK (
    total_rounds >= 0 AND total_matches >= 0 AND derby_matches >= 0
  )
);

CREATE INDEX idx_fixture_generations_tournament ON fixture_generations(tournament_id);
CREATE INDEX idx_fixture_generations_status ON fixture_generations(status);

-- Materialized view for ultra-fast standings queries
-- Refreshed after each match update for real-time performance
CREATE MATERIALIZED VIEW current_standings AS
WITH match_results AS (
  SELECT 
    m.tournament_id,
    m.home_team_id,
    m.away_team_id,
    m.home_score,
    m.away_score,
    m.match_date,
    CASE 
      WHEN m.home_score > m.away_score THEN 'home_win'
      WHEN m.home_score < m.away_score THEN 'away_win'
      ELSE 'draw'
    END as result
  FROM matches m
  WHERE m.status = 'finished'
    AND m.home_score IS NOT NULL 
    AND m.away_score IS NOT NULL
),
team_stats AS (
  -- Home team statistics
  SELECT 
    mr.tournament_id,
    mr.home_team_id as team_id,
    COUNT(*) as matches_played,
    SUM(CASE WHEN mr.result = 'home_win' THEN 1 ELSE 0 END) as wins,
    SUM(CASE WHEN mr.result = 'draw' THEN 1 ELSE 0 END) as draws,
    SUM(CASE WHEN mr.result = 'away_win' THEN 1 ELSE 0 END) as losses,
    SUM(mr.home_score) as goals_for,
    SUM(mr.away_score) as goals_against,
    SUM(mr.home_score) - SUM(mr.away_score) as goal_difference,
    SUM(
      CASE 
        WHEN mr.result = 'home_win' THEN 3
        WHEN mr.result = 'draw' THEN 1
        ELSE 0
      END
    ) as points
  FROM match_results mr
  GROUP BY mr.tournament_id, mr.home_team_id
  
  UNION ALL
  
  -- Away team statistics
  SELECT 
    mr.tournament_id,
    mr.away_team_id as team_id,
    COUNT(*) as matches_played,
    SUM(CASE WHEN mr.result = 'away_win' THEN 1 ELSE 0 END) as wins,
    SUM(CASE WHEN mr.result = 'draw' THEN 1 ELSE 0 END) as draws,
    SUM(CASE WHEN mr.result = 'home_win' THEN 1 ELSE 0 END) as losses,
    SUM(mr.away_score) as goals_for,
    SUM(mr.home_score) as goals_against,
    SUM(mr.away_score) - SUM(mr.home_score) as goal_difference,
    SUM(
      CASE 
        WHEN mr.result = 'away_win' THEN 3
        WHEN mr.result = 'draw' THEN 1
        ELSE 0
      END
    ) as points
  FROM match_results mr
  GROUP BY mr.tournament_id, mr.away_team_id
),
aggregated_stats AS (
  SELECT 
    ts.tournament_id,
    ts.team_id,
    SUM(ts.matches_played) as matches_played,
    SUM(ts.wins) as wins,
    SUM(ts.draws) as draws,
    SUM(ts.losses) as losses,
    SUM(ts.goals_for) as goals_for,
    SUM(ts.goals_against) as goals_against,
    SUM(ts.goal_difference) as goal_difference,
    SUM(ts.points) as points
  FROM team_stats ts
  GROUP BY ts.tournament_id, ts.team_id
),
form_calculation AS (
  SELECT DISTINCT
    mr.tournament_id,
    mr.home_team_id as team_id,
    STRING_AGG(
      CASE 
        WHEN mr.result = 'home_win' THEN 'W'
        WHEN mr.result = 'away_win' THEN 'L'
        ELSE 'D'
      END, 
      '' ORDER BY mr.match_date DESC
    ) FILTER (WHERE mr.match_date >= NOW() - INTERVAL '5 matches') as home_form
  FROM match_results mr
  GROUP BY mr.tournament_id, mr.home_team_id
  
  UNION ALL
  
  SELECT DISTINCT
    mr.tournament_id,
    mr.away_team_id as team_id,
    STRING_AGG(
      CASE 
        WHEN mr.result = 'away_win' THEN 'W'
        WHEN mr.result = 'home_win' THEN 'L'
        ELSE 'D'
      END, 
      '' ORDER BY mr.match_date DESC
    ) FILTER (WHERE mr.match_date >= NOW() - INTERVAL '5 matches') as away_form
  FROM match_results mr
  GROUP BY mr.tournament_id, mr.away_team_id
),
standings_with_position AS (
  SELECT 
    ags.tournament_id,
    ags.team_id,
    t.name as team_name,
    t.short_code,
    t.logo_url,
    ags.matches_played,
    ags.wins,
    ags.draws,
    ags.losses,
    ags.goals_for,
    ags.goals_against,
    ags.goal_difference,
    ags.points,
    COALESCE(fc.home_form, '') || COALESCE(fc2.away_form, '') as form,
    ROW_NUMBER() OVER (
      PARTITION BY ags.tournament_id 
      ORDER BY 
        ags.points DESC,
        ags.goal_difference DESC,
        ags.goals_for DESC,
        t.name ASC
    ) as position,
    NOW() as last_updated
  FROM aggregated_stats ags
  JOIN teams t ON t.id = ags.team_id
  LEFT JOIN form_calculation fc ON fc.tournament_id = ags.tournament_id AND fc.team_id = ags.team_id
  LEFT JOIN form_calculation fc2 ON fc2.tournament_id = ags.tournament_id AND fc2.team_id = ags.team_id
)
SELECT * FROM standings_with_position;

-- Create indexes on materialized view for lightning-fast queries
CREATE UNIQUE INDEX idx_standings_tournament_team ON current_standings(tournament_id, team_id);
CREATE INDEX idx_standings_position ON current_standings(tournament_id, position);
CREATE INDEX idx_standings_points ON current_standings(tournament_id, points DESC);

-- Stadium management table for constraint optimization
CREATE TABLE IF NOT EXISTS stadiums (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  capacity INTEGER NOT NULL CHECK (capacity > 0),
  location VARCHAR(255),
  coordinates POINT, -- For distance calculations
  org_id UUID REFERENCES organizations(id),
  available_days TEXT[] DEFAULT ARRAY['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
  preferred_time_slots JSONB DEFAULT '[]'::jsonb,
  restrictions TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_stadiums_org ON stadiums(org_id);
CREATE INDEX idx_stadiums_capacity ON stadiums(capacity);

-- Stadium availability table for scheduling constraints
CREATE TABLE IF NOT EXISTS stadium_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stadium_id UUID REFERENCES stadiums(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  available BOOLEAN DEFAULT true,
  booking_type VARCHAR(50), -- 'match', 'maintenance', 'event', etc.
  booking_reference UUID, -- Reference to match or event
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT check_valid_time_range CHECK (start_time < end_time)
);

CREATE INDEX idx_stadium_availability_date ON stadium_availability(stadium_id, date);
CREATE INDEX idx_stadium_availability_booking ON stadium_availability(booking_reference);

-- Match officials table for complete fixture management
CREATE TABLE IF NOT EXISTS match_officials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
  official_type VARCHAR(50) NOT NULL, -- 'referee', 'assistant_1', 'assistant_2', 'fourth_official'
  official_name VARCHAR(255) NOT NULL,
  official_license VARCHAR(100),
  contact_info JSONB,
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  assigned_by UUID -- User who made the assignment
);

CREATE INDEX idx_match_officials_match ON match_officials(match_id);
CREATE INDEX idx_match_officials_type ON match_officials(official_type);

-- Function to refresh standings materialized view
CREATE OR REPLACE FUNCTION refresh_tournament_standings(tournament_uuid UUID)
RETURNS void AS $$
BEGIN
  -- Refresh the materialized view for better performance
  REFRESH MATERIALIZED VIEW CONCURRENTLY current_standings;
  
  -- Log the refresh for monitoring
  INSERT INTO system_logs (log_type, message, metadata, created_at)
  VALUES (
    'standings_refresh', 
    'Tournament standings refreshed',
    jsonb_build_object('tournament_id', tournament_uuid, 'refreshed_at', NOW()),
    NOW()
  );
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-refresh standings when matches are updated
CREATE OR REPLACE FUNCTION trigger_standings_refresh()
RETURNS trigger AS $$
BEGIN
  -- Only refresh if match is finished and has scores
  IF (NEW.status = 'finished' AND NEW.home_score IS NOT NULL AND NEW.away_score IS NOT NULL) OR
     (OLD.status = 'finished' AND (OLD.home_score IS NOT NULL OR OLD.away_score IS NOT NULL)) THEN
    
    -- Refresh standings asynchronously to avoid blocking
    PERFORM pg_notify('standings_refresh', NEW.tournament_id::text);
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic standings refresh
DROP TRIGGER IF EXISTS matches_standings_refresh ON matches;
CREATE TRIGGER matches_standings_refresh
  AFTER INSERT OR UPDATE OR DELETE ON matches
  FOR EACH ROW
  EXECUTE FUNCTION trigger_standings_refresh();

-- Performance monitoring view
CREATE OR REPLACE VIEW fixture_performance_metrics AS
SELECT 
  t.id as tournament_id,
  t.name as tournament_name,
  COUNT(m.id) as total_matches,
  COUNT(m.id) FILTER (WHERE m.status = 'finished') as completed_matches,
  COUNT(m.id) FILTER (WHERE m.status = 'scheduled') as scheduled_matches,
  COUNT(m.id) FILTER (WHERE m.status = 'live') as live_matches,
  AVG(
    CASE 
      WHEN m.status = 'finished' AND m.home_score IS NOT NULL AND m.away_score IS NOT NULL
      THEN m.home_score + m.away_score 
    END
  ) as avg_goals_per_match,
  MAX(m.match_date) as last_match_date,
  MIN(m.match_date) FILTER (WHERE m.status = 'scheduled') as next_match_date,
  fg.optimization_score as generation_score,
  fg.generated_at as fixtures_generated_at
FROM tournaments t
LEFT JOIN matches m ON m.tournament_id = t.id
LEFT JOIN fixture_generations fg ON fg.tournament_id = t.id AND fg.status = 'published'
GROUP BY t.id, t.name, fg.optimization_score, fg.generated_at;

-- Grant appropriate permissions
GRANT SELECT ON current_standings TO public;
GRANT SELECT ON fixture_performance_metrics TO public;
GRANT SELECT, INSERT, UPDATE ON fixture_generations TO authenticated;
GRANT SELECT, INSERT, UPDATE ON stadium_availability TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON match_officials TO authenticated;