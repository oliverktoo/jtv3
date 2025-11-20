-- Disable Row Level Security for public access to tournaments and related tables
-- Since authentication has been removed from the application, we need to allow public access

-- Disable RLS on tournaments table to allow public viewing
ALTER TABLE tournaments DISABLE ROW LEVEL SECURITY;

-- Drop existing RLS policies on tournaments (if any)
DROP POLICY IF EXISTS "tournaments_org_isolation" ON tournaments;
DROP POLICY IF EXISTS "tournaments_select_policy" ON tournaments;
DROP POLICY IF EXISTS "tournaments_insert_policy" ON tournaments;
DROP POLICY IF EXISTS "tournaments_update_policy" ON tournaments;
DROP POLICY IF EXISTS "tournaments_delete_policy" ON tournaments;

-- Disable RLS on organizations table to allow public viewing  
ALTER TABLE organizations DISABLE ROW LEVEL SECURITY;

-- Drop existing RLS policies on organizations (if any)
DROP POLICY IF EXISTS "organizations_select_policy" ON organizations;
DROP POLICY IF EXISTS "organizations_insert_policy" ON organizations;
DROP POLICY IF EXISTS "organizations_update_policy" ON organizations;
DROP POLICY IF EXISTS "organizations_delete_policy" ON organizations;

-- Disable RLS on sports table to allow public viewing
ALTER TABLE sports DISABLE ROW LEVEL SECURITY;

-- Drop existing RLS policies on sports (if any) 
DROP POLICY IF EXISTS "sports_select_policy" ON sports;
DROP POLICY IF EXISTS "sports_insert_policy" ON sports;
DROP POLICY IF EXISTS "sports_update_policy" ON sports;
DROP POLICY IF EXISTS "sports_delete_policy" ON sports;

-- Disable RLS on geographic tables to allow public viewing
ALTER TABLE counties DISABLE ROW LEVEL SECURITY;
ALTER TABLE sub_counties DISABLE ROW LEVEL SECURITY;
ALTER TABLE wards DISABLE ROW LEVEL SECURITY;

-- Drop existing RLS policies on geographic tables (if any)
DROP POLICY IF EXISTS "counties_select_policy" ON counties;
DROP POLICY IF EXISTS "sub_counties_select_policy" ON sub_counties;
DROP POLICY IF EXISTS "wards_select_policy" ON wards;

-- Note: Keep RLS enabled on sensitive tables like:
-- - player_registry (contains personal information)
-- - team_managers (contains personal information)
-- - user_organization_roles (access control)
-- 
-- But allow public access to:
-- - tournaments (public tournament information)
-- - organizations (public organization information)
-- - teams (public team information) 
-- - sports (reference data)
-- - geographic data (reference data)

-- Allow public access to teams table for tournament display
ALTER TABLE teams DISABLE ROW LEVEL SECURITY;

-- Drop existing RLS policies on teams (if any)
DROP POLICY IF EXISTS "teams_org_isolation" ON teams;
DROP POLICY IF EXISTS "teams_select_policy" ON teams;
DROP POLICY IF EXISTS "teams_insert_policy" ON teams;
DROP POLICY IF EXISTS "teams_update_policy" ON teams;
DROP POLICY IF EXISTS "teams_delete_policy" ON teams;

-- Allow public access to matches for tournament fixtures and results
ALTER TABLE matches DISABLE ROW LEVEL SECURITY;

-- Drop existing RLS policies on matches (if any)
DROP POLICY IF EXISTS "matches_select_policy" ON matches;
DROP POLICY IF EXISTS "matches_insert_policy" ON matches;
DROP POLICY IF EXISTS "matches_update_policy" ON matches;
DROP POLICY IF EXISTS "matches_delete_policy" ON matches;

-- Allow public access to stages and rounds for tournament structure
ALTER TABLE stages DISABLE ROW LEVEL SECURITY;
ALTER TABLE rounds DISABLE ROW LEVEL SECURITY;

-- Drop existing RLS policies on stages and rounds (if any)
DROP POLICY IF EXISTS "stages_select_policy" ON stages;
DROP POLICY IF EXISTS "rounds_select_policy" ON rounds;

-- Add comment for future reference
COMMENT ON TABLE tournaments IS 'RLS disabled for public access - authentication removed from application';
COMMENT ON TABLE organizations IS 'RLS disabled for public access - authentication removed from application';
COMMENT ON TABLE teams IS 'RLS disabled for public access - authentication removed from application';
COMMENT ON TABLE sports IS 'RLS disabled for public access - reference data';
COMMENT ON TABLE counties IS 'RLS disabled for public access - reference data';
COMMENT ON TABLE sub_counties IS 'RLS disabled for public access - reference data';
COMMENT ON TABLE wards IS 'RLS disabled for public access - reference data';