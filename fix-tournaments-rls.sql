-- ========================================
-- FIX TOURNAMENTS RLS POLICY
-- Run these commands in Supabase SQL Editor
-- ========================================

-- 1. CHECK CURRENT RLS POLICIES
-- This shows all policies on the tournaments table
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'tournaments';

-- 2. VIEW TABLE STRUCTURE AND RLS STATUS
\d+ tournaments

-- 3. CHECK IF RLS IS ENABLED
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'tournaments';

-- 4. DROP EXISTING RESTRICTIVE POLICIES (if any)
-- Replace with actual policy names from step 1
DROP POLICY IF EXISTS "tournaments_select_policy" ON tournaments;
DROP POLICY IF EXISTS "tournaments_org_policy" ON tournaments;
DROP POLICY IF EXISTS "tournaments_access_policy" ON tournaments;

-- 5. CREATE NEW INCLUSIVE POLICY
-- This policy allows access to:
-- - Tournaments from user's organization
-- - Independent tournaments (System org: 00000000-0000-0000-0000-000000000000)
-- - All tournaments for super admins
CREATE POLICY "tournaments_inclusive_access" ON tournaments
  FOR SELECT
  USING (
    -- Allow access to tournaments from user's organization
    org_id = (auth.jwt() ->> 'org_id')::uuid
    OR
    -- Allow access to independent tournaments (System org)
    org_id = '00000000-0000-0000-0000-000000000000'::uuid
    OR
    -- Allow super admins to see all tournaments
    (auth.jwt() ->> 'role') = 'SUPER_ADMIN'
  );

-- 6. ENSURE RLS IS ENABLED
ALTER TABLE tournaments ENABLE ROW LEVEL SECURITY;

-- ========================================
-- ALTERNATIVE: TEMPORARY FIX FOR TESTING
-- ========================================

-- OPTION A: Temporarily disable RLS (shows all tournaments)
-- USE THIS FOR IMMEDIATE TESTING
-- ALTER TABLE tournaments DISABLE ROW LEVEL SECURITY;

-- OPTION B: Create a very permissive policy (allows all access)
-- CREATE POLICY "tournaments_allow_all" ON tournaments
--   FOR ALL
--   USING (true);

-- ========================================
-- VERIFICATION QUERIES
-- ========================================

-- After applying the fix, run these to verify:

-- Check policy was created
SELECT policyname, cmd, qual 
FROM pg_policies 
WHERE tablename = 'tournaments';

-- Test query (should return all 25 tournaments)
SELECT COUNT(*) as total_tournaments FROM tournaments;

-- Test by organization
SELECT 
  org_id,
  COUNT(*) as tournament_count
FROM tournaments 
GROUP BY org_id 
ORDER BY tournament_count DESC;

-- Test specific tournaments that were missing
SELECT id, name, org_id, status 
FROM tournaments 
WHERE name IN ('BOBO TOURNAMENT', 'NENYO', 'KASOZI TOURNAMENT', 'MBOKA CUP');