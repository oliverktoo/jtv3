-- Fix missing tournament_groups table and relationships
-- This addresses the schema cache errors in Supabase

-- 1. CREATE tournament_groups table
CREATE TABLE IF NOT EXISTS tournament_groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
    name VARCHAR(50) NOT NULL, -- 'Group A', 'Group B', etc.
    description TEXT,
    max_teams INTEGER DEFAULT 4,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(tournament_id, name)
);

-- 2. CREATE tournament_team_groups junction table (for many-to-many relationship)
CREATE TABLE IF NOT EXISTS tournament_team_groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
    group_id UUID NOT NULL REFERENCES tournament_groups(id) ON DELETE CASCADE,
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    position INTEGER, -- Position within the group
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(tournament_id, team_id), -- A team can only be in one group per tournament
    UNIQUE(group_id, team_id) -- A team can only be in a group once
);

-- 3. Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_tournament_groups_tournament_id ON tournament_groups(tournament_id);
CREATE INDEX IF NOT EXISTS idx_tournament_team_groups_tournament_id ON tournament_team_groups(tournament_id);
CREATE INDEX IF NOT EXISTS idx_tournament_team_groups_group_id ON tournament_team_groups(group_id);
CREATE INDEX IF NOT EXISTS idx_tournament_team_groups_team_id ON tournament_team_groups(team_id);

-- 4. Migrate existing group_id data from tournament_teams if it exists
-- Update tournament_teams to remove group_id (it will be handled by tournament_team_groups)
-- First, let's preserve any existing group data

-- Insert sample data for testing (only if no groups exist)
DO $$
DECLARE
    tournament_rec RECORD;
    group_a_id UUID;
    group_b_id UUID;
BEGIN
    -- Only insert sample data if no groups exist
    IF NOT EXISTS (SELECT 1 FROM tournament_groups LIMIT 1) THEN
        -- Get first tournament for testing
        SELECT id INTO tournament_rec FROM tournaments LIMIT 1;
        
        IF tournament_rec.id IS NOT NULL THEN
            -- Create sample groups
            INSERT INTO tournament_groups (tournament_id, name, description, max_teams)
            VALUES 
                (tournament_rec.id, 'Group A', 'Group A teams', 4),
                (tournament_rec.id, 'Group B', 'Group B teams', 4)
            RETURNING id INTO group_a_id;
            
            -- Get the group IDs
            SELECT id INTO group_a_id FROM tournament_groups WHERE tournament_id = tournament_rec.id AND name = 'Group A';
            SELECT id INTO group_b_id FROM tournament_groups WHERE tournament_id = tournament_rec.id AND name = 'Group B';
            
            RAISE NOTICE 'Created sample groups for tournament %', tournament_rec.id;
        END IF;
    END IF;
END $$;

-- 5. Fix relationship issues by ensuring foreign keys exist
-- Ensure matches table has proper tournament_id relationship
DO $$
BEGIN
    -- Check if tournament_id column exists in matches and has foreign key
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
        WHERE tc.table_name = 'matches' 
        AND tc.constraint_type = 'FOREIGN KEY'
        AND kcu.column_name = 'tournament_id'
    ) THEN
        -- Add foreign key if it doesn't exist
        ALTER TABLE matches 
        ADD CONSTRAINT fk_matches_tournament_id 
        FOREIGN KEY (tournament_id) REFERENCES tournaments(id) ON DELETE CASCADE;
        
        RAISE NOTICE 'Added missing foreign key: matches.tournament_id -> tournaments.id';
    END IF;
END $$;

-- 6. Create view for easy tournament groups with teams
CREATE OR REPLACE VIEW tournament_groups_with_teams AS
SELECT 
    tg.id as group_id,
    tg.tournament_id,
    tg.name as group_name,
    tg.description,
    tg.max_teams,
    ttg.team_id,
    t.name as team_name,
    t.code as team_code,
    ttg.position
FROM tournament_groups tg
LEFT JOIN tournament_team_groups ttg ON tg.id = ttg.group_id
LEFT JOIN teams t ON ttg.team_id = t.id
ORDER BY tg.tournament_id, tg.name, ttg.position;

-- 7. Ensure player_registry is available as 'players' alias (for the relationship error)
-- The error mentions "Could not find a relationship between 'tournament_players' and 'players'"
-- But we have 'player_registry', so let's check the tournament_players table structure

-- Update tournament_players to use correct foreign key column name
DO $$
BEGIN
    -- Check if tournament_players has upid (pointing to player_registry) 
    -- but the query expects player_id pointing to 'players'
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tournament_players' AND column_name = 'upid') 
    AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tournament_players' AND column_name = 'player_id') THEN
        
        -- Add player_id as alias/reference to upid for API compatibility
        ALTER TABLE tournament_players ADD COLUMN IF NOT EXISTS player_id UUID;
        
        -- Update existing records to copy upid to player_id
        UPDATE tournament_players SET player_id = upid WHERE player_id IS NULL;
        
        -- Add foreign key constraint
        ALTER TABLE tournament_players 
        ADD CONSTRAINT fk_tournament_players_player_id 
        FOREIGN KEY (player_id) REFERENCES player_registry(id) ON DELETE CASCADE;
        
        RAISE NOTICE 'Added player_id column to tournament_players for API compatibility';
    END IF;
END $$;

-- 8. Create a players view that aliases player_registry for API compatibility
CREATE OR REPLACE VIEW players AS
SELECT 
    id,
    first_name,
    last_name,
    date_of_birth,
    phone_number,
    email,
    gender,
    position_primary,
    position_secondary,
    nationality,
    county_of_birth,
    current_county,
    current_ward,
    jersey_number,
    photo_path,
    org_id,
    created_at,
    updated_at
FROM player_registry;

RAISE NOTICE 'Tournament groups schema fix completed successfully!';