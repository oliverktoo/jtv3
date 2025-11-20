-- Quick Migration: Add match_events table to existing schema
-- Run this in Supabase SQL Editor

-- Step 1: Create enum for match event types
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
    END IF;
END $$;

-- Step 2: Create match_events table (use snake_case for column names)
CREATE TABLE IF NOT EXISTS match_events (
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

-- Step 3: Create match_statistics table
CREATE TABLE IF NOT EXISTS match_statistics (
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

-- Step 4: Create indexes
CREATE INDEX IF NOT EXISTS idx_match_events_match_id ON match_events(match_id);
CREATE INDEX IF NOT EXISTS idx_match_events_type ON match_events(event_type);
CREATE INDEX IF NOT EXISTS idx_match_events_player_id ON match_events(player_id) WHERE player_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_match_statistics_match_id ON match_statistics(match_id);

-- Success!
SELECT 'Migration completed successfully!' as status;
