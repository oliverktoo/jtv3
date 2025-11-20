-- Live Match Features Migration
-- Adds match_events and match_statistics tables for real-time match tracking
-- Date: 2025-11-20

-- Create match event type enum if it doesn't exist
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'match_event_type_enum') THEN
        CREATE TYPE match_event_type_enum AS ENUM (
            'GOAL',
            'YELLOW_CARD',
            'RED_CARD',
            'SUBSTITUTION',
            'PENALTY',
            'OWN_GOAL',
            'KICK_OFF',
            'HALF_TIME',
            'FULL_TIME',
            'EXTRA_TIME',
            'PENALTY_SHOOTOUT',
            'VAR_REVIEW',
            'INJURY'
        );
        RAISE NOTICE 'Created match_event_type_enum';
    END IF;
END $$;

-- Create match_events table
CREATE TABLE IF NOT EXISTS match_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
    event_type match_event_type_enum NOT NULL,
    minute INTEGER NOT NULL,
    added_time INTEGER DEFAULT 0,
    player_id UUID, -- Nullable for non-player events
    team_id UUID NOT NULL REFERENCES teams(id),
    description TEXT,
    metadata JSONB, -- Additional event data (assist, VAR result, etc.)
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID -- User who logged the event
);

-- Create indexes for match_events
CREATE INDEX IF NOT EXISTS idx_match_events_match_id ON match_events(match_id);
CREATE INDEX IF NOT EXISTS idx_match_events_type ON match_events(event_type);
CREATE INDEX IF NOT EXISTS idx_match_events_player_id ON match_events(player_id) WHERE player_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_match_events_team_id ON match_events(team_id);
CREATE INDEX IF NOT EXISTS idx_match_events_minute ON match_events(match_id, minute);

-- Create match_statistics table
CREATE TABLE IF NOT EXISTS match_statistics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    match_id UUID NOT NULL UNIQUE REFERENCES matches(id) ON DELETE CASCADE,
    
    -- Possession
    home_possession INTEGER DEFAULT 50 CHECK (home_possession >= 0 AND home_possession <= 100),
    away_possession INTEGER DEFAULT 50 CHECK (away_possession >= 0 AND away_possession <= 100),
    
    -- Shots
    home_shots INTEGER DEFAULT 0 CHECK (home_shots >= 0),
    away_shots INTEGER DEFAULT 0 CHECK (away_shots >= 0),
    home_shots_on_target INTEGER DEFAULT 0 CHECK (home_shots_on_target >= 0),
    away_shots_on_target INTEGER DEFAULT 0 CHECK (away_shots_on_target >= 0),
    
    -- Corners & Free kicks
    home_corners INTEGER DEFAULT 0 CHECK (home_corners >= 0),
    away_corners INTEGER DEFAULT 0 CHECK (away_corners >= 0),
    home_free_kicks INTEGER DEFAULT 0 CHECK (home_free_kicks >= 0),
    away_free_kicks INTEGER DEFAULT 0 CHECK (away_free_kicks >= 0),
    
    -- Fouls & Cards
    home_fouls INTEGER DEFAULT 0 CHECK (home_fouls >= 0),
    away_fouls INTEGER DEFAULT 0 CHECK (away_fouls >= 0),
    home_yellow_cards INTEGER DEFAULT 0 CHECK (home_yellow_cards >= 0),
    away_yellow_cards INTEGER DEFAULT 0 CHECK (away_yellow_cards >= 0),
    home_red_cards INTEGER DEFAULT 0 CHECK (home_red_cards >= 0),
    away_red_cards INTEGER DEFAULT 0 CHECK (away_red_cards >= 0),
    
    -- Offsides & Saves
    home_offsides INTEGER DEFAULT 0 CHECK (home_offsides >= 0),
    away_offsides INTEGER DEFAULT 0 CHECK (away_offsides >= 0),
    home_saves INTEGER DEFAULT 0 CHECK (home_saves >= 0),
    away_saves INTEGER DEFAULT 0 CHECK (away_saves >= 0),
    
    -- Additional data
    commentary TEXT, -- Live commentary text
    current_minute INTEGER DEFAULT 0 CHECK (current_minute >= 0),
    period TEXT DEFAULT 'FIRST_HALF', -- FIRST_HALF, HALF_TIME, SECOND_HALF, EXTRA_TIME, PENALTIES
    
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for match_statistics
CREATE INDEX IF NOT EXISTS idx_match_statistics_match_id ON match_statistics(match_id);

-- Add constraint to ensure possession adds up to 100
ALTER TABLE match_statistics ADD CONSTRAINT check_possession_total 
    CHECK (home_possession + away_possession = 100);

-- Add constraint to ensure shots on target <= total shots
ALTER TABLE match_statistics ADD CONSTRAINT check_home_shots_valid
    CHECK (home_shots_on_target <= home_shots);
    
ALTER TABLE match_statistics ADD CONSTRAINT check_away_shots_valid
    CHECK (away_shots_on_target <= away_shots);

-- Create function to update match_statistics updated_at timestamp
CREATE OR REPLACE FUNCTION update_match_statistics_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for match_statistics
DROP TRIGGER IF EXISTS trigger_update_match_statistics_timestamp ON match_statistics;
CREATE TRIGGER trigger_update_match_statistics_timestamp
    BEFORE UPDATE ON match_statistics
    FOR EACH ROW
    EXECUTE FUNCTION update_match_statistics_timestamp();

-- Create view for match events with team and player names (if players table exists)
CREATE OR REPLACE VIEW match_events_detailed AS
SELECT 
    me.id,
    me.match_id,
    me.event_type,
    me.minute,
    me.added_time,
    me.description,
    me.metadata,
    me.created_at,
    t.name as team_name,
    t.id as team_id
FROM match_events me
JOIN teams t ON me.team_id = t.id
ORDER BY me.match_id, me.minute, me.created_at;

-- Create view for live match dashboard (combines match, events, and statistics)
CREATE OR REPLACE VIEW live_match_dashboard AS
SELECT 
    m.id as match_id,
    m.kickoff,
    m.venue,
    m.status,
    m.home_score,
    m.away_score,
    ht.name as home_team_name,
    ht.id as home_team_id,
    at.name as away_team_name,
    at.id as away_team_id,
    ms.home_possession,
    ms.away_possession,
    ms.home_shots,
    ms.away_shots,
    ms.home_shots_on_target,
    ms.away_shots_on_target,
    ms.home_corners,
    ms.away_corners,
    ms.home_fouls,
    ms.away_fouls,
    ms.home_yellow_cards,
    ms.away_yellow_cards,
    ms.home_red_cards,
    ms.away_red_cards,
    ms.current_minute,
    ms.period,
    ms.commentary,
    (
        SELECT COUNT(*)
        FROM match_events
        WHERE match_id = m.id
    ) as total_events,
    (
        SELECT COUNT(*)
        FROM match_events
        WHERE match_id = m.id AND event_type = 'GOAL'
    ) as total_goals
FROM matches m
LEFT JOIN teams ht ON m.home_team_id = ht.id
LEFT JOIN teams at ON m.away_team_id = at.id
LEFT JOIN match_statistics ms ON m.id = ms.match_id
WHERE m.status IN ('LIVE', 'SCHEDULED');

-- Grant permissions
GRANT SELECT ON match_events TO PUBLIC;
GRANT SELECT ON match_statistics TO PUBLIC;
GRANT SELECT ON match_events_detailed TO PUBLIC;
GRANT SELECT ON live_match_dashboard TO PUBLIC;

-- Add comments for documentation
COMMENT ON TABLE match_events IS 'Stores all match events (goals, cards, substitutions) in chronological order';
COMMENT ON TABLE match_statistics IS 'Stores live match statistics (possession, shots, fouls, etc.) updated in real-time';
COMMENT ON VIEW match_events_detailed IS 'Match events with team names joined for easy querying';
COMMENT ON VIEW live_match_dashboard IS 'Complete live match view combining matches, events, and statistics';

-- Success message
DO $$ BEGIN
    RAISE NOTICE '✅ Live match features migration completed successfully!';
    RAISE NOTICE '   - match_events table created';
    RAISE NOTICE '   - match_statistics table created';
    RAISE NOTICE '   - Indexes created for performance';
    RAISE NOTICE '   - Constraints added for data integrity';
    RAISE NOTICE '   - Views created for dashboard queries';
END $$;
