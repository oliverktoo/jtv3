-- Advanced Tournament Fixture System - CORRECTED VERSION
-- Jamii Tourney v3 - Database Schema Extensions
-- Compatible with existing Jamii Tourney database structure

-- First, let's check if we need to add columns to existing tables
-- Add tournament_id to matches table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'matches' AND column_name = 'tournament_id'
    ) THEN
        ALTER TABLE matches ADD COLUMN tournament_id UUID REFERENCES tournaments(id);
        
        -- Update existing matches with tournament_id from rounds table
        UPDATE matches SET tournament_id = (
            SELECT r.tournament_id 
            FROM rounds r 
            WHERE r.id = matches.round_id
        ) WHERE round_id IS NOT NULL;
    END IF;
END $$;

-- Enhanced tournaments table with fixture configuration (modify existing)
DO $$
BEGIN
    -- Add config column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'tournaments' AND column_name = 'config'
    ) THEN
        ALTER TABLE tournaments ADD COLUMN config JSONB DEFAULT '{
            "legs": 2,
            "maxTeams": 16,
            "minTeams": 4,
            "stadiums": [],
            "timeSlots": [],
            "constraints": {
                "minimumRestDays": 3,
                "maximumMatchesPerDay": 4,
                "preferredKickoffTimes": ["15:00", "17:30"],
                "blackoutDates": [],
                "derbySpacing": 5
            },
            "pointsSystem": {
                "win": 3,
                "draw": 1,
                "loss": 0,
                "walkover": 3,
                "forfeit": 0
            },
            "tieBreakers": ["points", "goal_difference", "goals_for", "head_to_head_points"],
            "allowDraws": true,
            "extraTime": false,
            "penalties": false
        }'::jsonb;
    END IF;
    
    -- Add other missing columns
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'tournaments' AND column_name = 'start_date'
    ) THEN
        ALTER TABLE tournaments ADD COLUMN start_date TIMESTAMPTZ;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'tournaments' AND column_name = 'end_date'
    ) THEN
        ALTER TABLE tournaments ADD COLUMN end_date TIMESTAMPTZ;
    END IF;
END $$;

-- Tournament team registrations
CREATE TABLE IF NOT EXISTS tournament_teams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    group_id VARCHAR(10), -- For group stage tournaments (A, B, C, etc.)
    seed_rating INTEGER, -- For seeded tournaments
    registered_at TIMESTAMPTZ DEFAULT NOW(),
    status VARCHAR(20) DEFAULT 'registered' CHECK (status IN ('registered', 'confirmed', 'withdrawn')),
    UNIQUE(tournament_id, team_id)
);

-- Add missing columns to matches table to support advanced features
DO $$
BEGIN
    -- Add result column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'matches' AND column_name = 'result'
    ) THEN
        ALTER TABLE matches ADD COLUMN result VARCHAR(20) CHECK (result IN ('home_win', 'away_win', 'draw'));
    END IF;
    
    -- Add round_number column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'matches' AND column_name = 'round_number'
    ) THEN
        ALTER TABLE matches ADD COLUMN round_number INTEGER;
        
        -- Update round_number from rounds table
        UPDATE matches SET round_number = (
            SELECT r.round_number 
            FROM rounds r 
            WHERE r.id = matches.round_id
        ) WHERE round_id IS NOT NULL;
    END IF;
    
    -- Add scheduled_date column if it doesn't exist (map from kickoff)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'matches' AND column_name = 'scheduled_date'
    ) THEN
        ALTER TABLE matches ADD COLUMN scheduled_date TIMESTAMPTZ;
        
        -- Copy kickoff to scheduled_date
        UPDATE matches SET scheduled_date = kickoff WHERE kickoff IS NOT NULL;
    END IF;
    
    -- Add stadium_id column if it doesn't exist (map from venue)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'matches' AND column_name = 'stadium_id'
    ) THEN
        ALTER TABLE matches ADD COLUMN stadium_id UUID;
    END IF;
END $$;

-- Match events for detailed match tracking
CREATE TABLE IF NOT EXISTS match_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
    type VARCHAR(30) NOT NULL CHECK (type IN ('goal', 'yellow_card', 'red_card', 'substitution', 'penalty', 'own_goal', 'kick_off', 'half_time', 'full_time', 'extra_time', 'penalty_shootout')),
    minute INTEGER NOT NULL,
    added_time INTEGER DEFAULT 0,
    player_id UUID, -- Can be null for non-player events
    team_id UUID NOT NULL REFERENCES teams(id),
    description TEXT,
    metadata JSONB, -- Additional event-specific data
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID -- REFERENCES users(id) - removed constraint as users table may not exist
);

-- Stadiums/venues for matches (if not exists)
CREATE TABLE IF NOT EXISTS stadiums (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    capacity INTEGER NOT NULL DEFAULT 0,
    location TEXT,
    address TEXT,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    facilities JSONB DEFAULT '[]'::jsonb, -- ["floodlights", "parking", "accessibility"]
    availability JSONB DEFAULT '{
        "timeSlots": [],
        "blackoutDates": [],
        "restrictions": []
    }'::jsonb,
    is_neutral_venue BOOLEAN DEFAULT false,
    home_team_id UUID REFERENCES teams(id), -- Primary home team
    surface_type VARCHAR(20) DEFAULT 'grass' CHECK (surface_type IN ('grass', 'artificial', 'hybrid')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Officials/referees
CREATE TABLE IF NOT EXISTS officials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('referee', 'assistant_referee', 'fourth_official', 'var')),
    level VARCHAR(20) DEFAULT 'local' CHECK (level IN ('local', 'regional', 'national', 'international')),
    qualifications JSONB DEFAULT '[]'::jsonb,
    availability JSONB DEFAULT '{
        "dates": [],
        "preferences": {},
        "restrictions": []
    }'::jsonb,
    contact_info JSONB,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Function to calculate match result based on scores
CREATE OR REPLACE FUNCTION update_match_result()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.home_score IS NOT NULL AND NEW.away_score IS NOT NULL THEN
        IF NEW.home_score > NEW.away_score THEN
            NEW.result = 'home_win';
        ELSIF NEW.away_score > NEW.home_score THEN
            NEW.result = 'away_win';
        ELSE
            NEW.result = 'draw';
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically set match result when scores are updated
DROP TRIGGER IF EXISTS trigger_update_match_result ON matches;
CREATE TRIGGER trigger_update_match_result
    BEFORE INSERT OR UPDATE ON matches
    FOR EACH ROW
    EXECUTE FUNCTION update_match_result();

-- Drop existing materialized view if it exists
DROP MATERIALIZED VIEW IF EXISTS current_standings;

-- Materialized view for fast standings calculation - CORRECTED VERSION
CREATE MATERIALIZED VIEW current_standings AS
WITH match_results AS (
    SELECT 
        m.tournament_id,
        m.home_team_id as team_id,
        1 as played,
        CASE 
            WHEN m.result = 'home_win' THEN 1 
            ELSE 0 
        END as won,
        CASE 
            WHEN m.result = 'draw' THEN 1 
            ELSE 0 
        END as drawn,
        CASE 
            WHEN m.result = 'away_win' THEN 1 
            ELSE 0 
        END as lost,
        COALESCE(m.home_score, 0) as goals_for,
        COALESCE(m.away_score, 0) as goals_against,
        CASE 
            WHEN m.result = 'home_win' THEN 3
            WHEN m.result = 'draw' THEN 1
            ELSE 0
        END as points,
        -- Home record
        1 as home_played,
        CASE WHEN m.result = 'home_win' THEN 1 ELSE 0 END as home_won,
        CASE WHEN m.result = 'draw' THEN 1 ELSE 0 END as home_drawn,
        CASE WHEN m.result = 'away_win' THEN 1 ELSE 0 END as home_lost,
        COALESCE(m.home_score, 0) as home_goals_for,
        COALESCE(m.away_score, 0) as home_goals_against,
        -- Away record
        0 as away_played,
        0 as away_won,
        0 as away_drawn,
        0 as away_lost,
        0 as away_goals_for,
        0 as away_goals_against
    FROM matches m
    WHERE m.status = 'finished' AND m.tournament_id IS NOT NULL
    
    UNION ALL
    
    SELECT 
        m.tournament_id,
        m.away_team_id as team_id,
        1 as played,
        CASE 
            WHEN m.result = 'away_win' THEN 1 
            ELSE 0 
        END as won,
        CASE 
            WHEN m.result = 'draw' THEN 1 
            ELSE 0 
        END as drawn,
        CASE 
            WHEN m.result = 'home_win' THEN 1 
            ELSE 0 
        END as lost,
        COALESCE(m.away_score, 0) as goals_for,
        COALESCE(m.home_score, 0) as goals_against,
        CASE 
            WHEN m.result = 'away_win' THEN 3
            WHEN m.result = 'draw' THEN 1
            ELSE 0
        END as points,
        -- Home record
        0 as home_played,
        0 as home_won,
        0 as home_drawn,
        0 as home_lost,
        0 as home_goals_for,
        0 as home_goals_against,
        -- Away record
        1 as away_played,
        CASE WHEN m.result = 'away_win' THEN 1 ELSE 0 END as away_won,
        CASE WHEN m.result = 'draw' THEN 1 ELSE 0 END as away_drawn,
        CASE WHEN m.result = 'home_win' THEN 1 ELSE 0 END as away_lost,
        COALESCE(m.away_score, 0) as away_goals_for,
        COALESCE(m.home_score, 0) as away_goals_against
    FROM matches m
    WHERE m.status = 'finished' AND m.tournament_id IS NOT NULL
),
aggregated_stats AS (
    SELECT 
        tournament_id,
        team_id,
        SUM(played) as played,
        SUM(won) as won,
        SUM(drawn) as drawn,
        SUM(lost) as lost,
        SUM(goals_for) as goals_for,
        SUM(goals_against) as goals_against,
        SUM(goals_for) - SUM(goals_against) as goal_difference,
        SUM(points) as points,
        -- Home record
        SUM(home_played) as home_played,
        SUM(home_won) as home_won,
        SUM(home_drawn) as home_drawn,
        SUM(home_lost) as home_lost,
        SUM(home_goals_for) as home_goals_for,
        SUM(home_goals_against) as home_goals_against,
        -- Away record
        SUM(away_played) as away_played,
        SUM(away_won) as away_won,
        SUM(away_drawn) as away_drawn,
        SUM(away_lost) as away_lost,
        SUM(away_goals_for) as away_goals_for,
        SUM(away_goals_against) as away_goals_against
    FROM match_results
    GROUP BY tournament_id, team_id
)
SELECT 
    ROW_NUMBER() OVER (
        PARTITION BY tournament_id 
        ORDER BY points DESC, goal_difference DESC, goals_for DESC
    ) as position,
    tournament_id,
    team_id,
    played,
    won,
    drawn,
    lost,
    goals_for,
    goals_against,
    goal_difference,
    points,
    home_played,
    home_won,
    home_drawn,
    home_lost,
    home_goals_for,
    home_goals_against,
    away_played,
    away_won,
    away_drawn,
    away_lost,
    away_goals_for,
    away_goals_against,
    NOW() as last_updated
FROM aggregated_stats;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_tournaments_org_id ON tournaments(org_id);
CREATE INDEX IF NOT EXISTS idx_tournaments_status ON tournaments(status);
CREATE INDEX IF NOT EXISTS idx_tournament_teams_tournament_id ON tournament_teams(tournament_id);
CREATE INDEX IF NOT EXISTS idx_tournament_teams_team_id ON tournament_teams(team_id);
CREATE INDEX IF NOT EXISTS idx_matches_tournament_id ON matches(tournament_id);
CREATE INDEX IF NOT EXISTS idx_matches_teams ON matches(home_team_id, away_team_id);
CREATE INDEX IF NOT EXISTS idx_matches_scheduled_date ON matches(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_matches_status ON matches(status);
CREATE INDEX IF NOT EXISTS idx_matches_result ON matches(result);
CREATE INDEX IF NOT EXISTS idx_match_events_match_id ON match_events(match_id);
CREATE INDEX IF NOT EXISTS idx_match_events_type ON match_events(type);

-- Triggers for automatic updates
CREATE OR REPLACE FUNCTION update_tournament_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Only create triggers if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.triggers 
        WHERE trigger_name = 'trigger_tournaments_updated_at'
    ) THEN
        CREATE TRIGGER trigger_tournaments_updated_at
            BEFORE UPDATE ON tournaments
            FOR EACH ROW
            EXECUTE FUNCTION update_tournament_updated_at();
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.triggers 
        WHERE trigger_name = 'trigger_matches_updated_at'
    ) THEN
        CREATE TRIGGER trigger_matches_updated_at
            BEFORE UPDATE ON matches
            FOR EACH ROW
            EXECUTE FUNCTION update_tournament_updated_at();
    END IF;
END $$;

-- Function to refresh standings materialized view
CREATE OR REPLACE FUNCTION refresh_standings(tournament_id_param UUID DEFAULT NULL)
RETURNS VOID AS $$
BEGIN
    IF tournament_id_param IS NULL THEN
        REFRESH MATERIALIZED VIEW current_standings;
    ELSE
        -- For specific tournament, we'd need a more targeted approach
        REFRESH MATERIALIZED VIEW current_standings;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Enable RLS if not already enabled
DO $$
BEGIN
    -- Check if RLS is already enabled before enabling
    IF NOT EXISTS (
        SELECT 1 FROM pg_class c 
        WHERE c.relname = 'tournaments' AND c.relrowsecurity = true
    ) THEN
        ALTER TABLE tournaments ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_class c 
        WHERE c.relname = 'tournament_teams' AND c.relrowsecurity = true
    ) THEN
        ALTER TABLE tournament_teams ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_class c 
        WHERE c.relname = 'matches' AND c.relrowsecurity = true
    ) THEN
        ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_class c 
        WHERE c.relname = 'match_events' AND c.relrowsecurity = true
    ) THEN
        ALTER TABLE match_events ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

-- Drop existing policies if they exist and recreate them
DROP POLICY IF EXISTS tournaments_org_policy ON tournaments;
DROP POLICY IF EXISTS matches_org_policy ON matches;
DROP POLICY IF EXISTS tournament_teams_org_policy ON tournament_teams;
DROP POLICY IF EXISTS match_events_org_policy ON match_events;

-- Policies for tournaments (same organization access)
CREATE POLICY tournaments_org_policy ON tournaments
    FOR ALL
    USING (
        org_id = COALESCE(
            current_setting('app.current_org_id', true)::UUID,
            '550e8400-e29b-41d4-a716-446655440001'::UUID
        )
    );

-- Policies for matches (through tournament org)
CREATE POLICY matches_org_policy ON matches
    FOR ALL
    USING (
        tournament_id IN (
            SELECT id FROM tournaments 
            WHERE org_id = COALESCE(
                current_setting('app.current_org_id', true)::UUID,
                '550e8400-e29b-41d4-a716-446655440001'::UUID
            )
        ) OR tournament_id IS NULL  -- Allow existing matches without tournament_id
    );

-- Similar policies for other tables...
CREATE POLICY tournament_teams_org_policy ON tournament_teams
    FOR ALL
    USING (
        tournament_id IN (
            SELECT id FROM tournaments 
            WHERE org_id = COALESCE(
                current_setting('app.current_org_id', true)::UUID,
                '550e8400-e29b-41d4-a716-446655440001'::UUID
            )
        )
    );

CREATE POLICY match_events_org_policy ON match_events
    FOR ALL
    USING (
        match_id IN (
            SELECT m.id FROM matches m
            LEFT JOIN tournaments t ON m.tournament_id = t.id
            WHERE t.org_id = COALESCE(
                current_setting('app.current_org_id', true)::UUID,
                '550e8400-e29b-41d4-a716-446655440001'::UUID
            ) OR m.tournament_id IS NULL  -- Allow existing matches without tournament_id
        )
    );

-- Final verification
SELECT 'Tournament fixture system schema applied successfully!' as status;