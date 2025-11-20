-- CLEAN MIGRATION: Drop existing and recreate fresh
-- Run this in Supabase SQL Editor if APPLY_THIS_MIGRATION.sql failed

-- Step 1: Drop existing tables (safe - only affects match_events and match_statistics)
DROP TABLE IF EXISTS match_events CASCADE;
DROP TABLE IF EXISTS match_statistics CASCADE;
DROP TYPE IF EXISTS match_event_type_enum CASCADE;

-- Step 2: Create enum for match event types
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

-- Step 3: Create match_events table with correct column names
CREATE TABLE match_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
    event_type match_event_type_enum NOT NULL,
    minute INTEGER NOT NULL,
    added_time INTEGER DEFAULT 0,
    player_id UUID,
    team_id UUID NOT NULL REFERENCES teams(id),
    description TEXT,
    metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID
);

-- Step 4: Create match_statistics table
CREATE TABLE match_statistics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    match_id UUID NOT NULL UNIQUE REFERENCES matches(id) ON DELETE CASCADE,
    home_possession INTEGER DEFAULT 50,
    away_possession INTEGER DEFAULT 50,
    home_shots INTEGER DEFAULT 0,
    away_shots INTEGER DEFAULT 0,
    home_shots_on_target INTEGER DEFAULT 0,
    away_shots_on_target INTEGER DEFAULT 0,
    home_corners INTEGER DEFAULT 0,
    away_corners INTEGER DEFAULT 0,
    home_free_kicks INTEGER DEFAULT 0,
    away_free_kicks INTEGER DEFAULT 0,
    home_fouls INTEGER DEFAULT 0,
    away_fouls INTEGER DEFAULT 0,
    home_yellow_cards INTEGER DEFAULT 0,
    away_yellow_cards INTEGER DEFAULT 0,
    home_red_cards INTEGER DEFAULT 0,
    away_red_cards INTEGER DEFAULT 0,
    home_offsides INTEGER DEFAULT 0,
    away_offsides INTEGER DEFAULT 0,
    home_saves INTEGER DEFAULT 0,
    away_saves INTEGER DEFAULT 0,
    commentary TEXT,
    current_minute INTEGER DEFAULT 0,
    period TEXT DEFAULT 'FIRST_HALF',
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Step 5: Create indexes
CREATE INDEX idx_match_events_match_id ON match_events(match_id);
CREATE INDEX idx_match_events_type ON match_events(event_type);
CREATE INDEX idx_match_events_player_id ON match_events(player_id) WHERE player_id IS NOT NULL;
CREATE INDEX idx_match_statistics_match_id ON match_statistics(match_id);

-- Step 6: Verify the table structure
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'match_events'
ORDER BY ordinal_position;

-- Success!
SELECT 'Clean migration completed! Tables recreated with correct structure.' as status;
