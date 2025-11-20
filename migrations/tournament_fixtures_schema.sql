-- Advanced Tournament Fixture System
-- Jamii Tourney v3 - Database Schema Extensions

-- Enhanced tournaments table with fixture configuration
CREATE TABLE IF NOT EXISTS tournaments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('round_robin', 'knockout', 'group_stage', 'league', 'cup', 'hybrid')),
    status VARCHAR(50) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'active', 'paused', 'completed', 'cancelled')),
    org_id UUID NOT NULL REFERENCES organizations(id),
    config JSONB NOT NULL DEFAULT '{
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
    }'::jsonb,
    start_date TIMESTAMPTZ,
    end_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id)
);

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

-- Enhanced matches table with comprehensive match data
CREATE TABLE IF NOT EXISTS matches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
    round_number INTEGER NOT NULL,
    home_team_id UUID NOT NULL REFERENCES teams(id),
    away_team_id UUID NOT NULL REFERENCES teams(id),
    scheduled_date TIMESTAMPTZ NOT NULL,
    kick_off_time TIME,
    stadium_id UUID REFERENCES stadiums(id),
    status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'live', 'half_time', 'finished', 'postponed', 'cancelled', 'abandoned')),
    
    -- Match scores
    home_score INTEGER DEFAULT 0,
    away_score INTEGER DEFAULT 0,
    extra_time_home INTEGER,
    extra_time_away INTEGER,
    penalties_home INTEGER,
    penalties_away INTEGER,
    
    -- Match result
    result VARCHAR(20) CHECK (result IN ('home_win', 'away_win', 'draw')),
    
    -- Match timing
    kick_off_actual TIMESTAMPTZ,
    half_time_start TIMESTAMPTZ,
    second_half_start TIMESTAMPTZ,
    full_time TIMESTAMPTZ,
    
    -- Officials
    referee_id UUID,
    assistant_referee_1_id UUID,
    assistant_referee_2_id UUID,
    fourth_official_id UUID,
    var_id UUID,
    
    -- Match constraints and metadata
    constraints JSONB DEFAULT '{
        "minimumNotice": 7,
        "requiredOfficials": 3,
        "securityLevel": "medium",
        "broadcastSlot": null,
        "expectedAttendance": null
    }'::jsonb,
    
    -- Weather and conditions
    weather_conditions TEXT,
    temperature DECIMAL(5,2),
    attendance INTEGER,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT unique_fixture UNIQUE (tournament_id, home_team_id, away_team_id, round_number),
    CONSTRAINT different_teams CHECK (home_team_id != away_team_id)
);

-- Fixture rounds for organizing matches
CREATE TABLE IF NOT EXISTS fixture_rounds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
    round_number INTEGER NOT NULL,
    name VARCHAR(100) NOT NULL, -- "Round 1", "Quarterfinals", etc.
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'completed')),
    matches_count INTEGER DEFAULT 0,
    completed_matches INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(tournament_id, round_number)
);

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
    created_by UUID REFERENCES users(id)
);

-- Stadiums/venues for matches
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

-- Materialized view for fast standings calculation
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
    WHERE m.status = 'finished'
    
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
    WHERE m.status = 'finished'
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
CREATE INDEX IF NOT EXISTS idx_matches_date ON matches(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_matches_status ON matches(status);
CREATE INDEX IF NOT EXISTS idx_match_events_match_id ON match_events(match_id);
CREATE INDEX IF NOT EXISTS idx_match_events_type ON match_events(type);
CREATE INDEX IF NOT EXISTS idx_fixture_rounds_tournament_id ON fixture_rounds(tournament_id);
CREATE INDEX IF NOT EXISTS idx_stadiums_location ON stadiums USING GIST(ST_MakePoint(longitude, latitude));

-- Triggers for automatic updates
CREATE OR REPLACE FUNCTION update_tournament_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_tournaments_updated_at
    BEFORE UPDATE ON tournaments
    FOR EACH ROW
    EXECUTE FUNCTION update_tournament_updated_at();

CREATE TRIGGER trigger_matches_updated_at
    BEFORE UPDATE ON matches
    FOR EACH ROW
    EXECUTE FUNCTION update_tournament_updated_at();

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

-- RLS (Row Level Security) policies
ALTER TABLE tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournament_teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE fixture_rounds ENABLE ROW LEVEL SECURITY;

-- Policies for tournaments (same organization access)
CREATE POLICY tournaments_org_policy ON tournaments
    FOR ALL
    USING (org_id = current_setting('app.current_org_id')::UUID);

-- Policies for matches (through tournament org)
CREATE POLICY matches_org_policy ON matches
    FOR ALL
    USING (
        tournament_id IN (
            SELECT id FROM tournaments 
            WHERE org_id = current_setting('app.current_org_id')::UUID
        )
    );

-- Similar policies for other tables...
CREATE POLICY tournament_teams_org_policy ON tournament_teams
    FOR ALL
    USING (
        tournament_id IN (
            SELECT id FROM tournaments 
            WHERE org_id = current_setting('app.current_org_id')::UUID
        )
    );

CREATE POLICY match_events_org_policy ON match_events
    FOR ALL
    USING (
        match_id IN (
            SELECT m.id FROM matches m
            JOIN tournaments t ON m.tournament_id = t.id
            WHERE t.org_id = current_setting('app.current_org_id')::UUID
        )
    );

CREATE POLICY fixture_rounds_org_policy ON fixture_rounds
    FOR ALL
    USING (
        tournament_id IN (
            SELECT id FROM tournaments 
            WHERE org_id = current_setting('app.current_org_id')::UUID
        )
    );