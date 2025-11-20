-- Diagnostic: Check what exists and fix issues
-- Run this in Supabase SQL Editor

-- Step 1: Check if match_events table exists and its structure
SELECT 
    table_name,
    column_name,
    data_type
FROM information_schema.columns
WHERE table_name = 'match_events'
ORDER BY ordinal_position;

-- Step 2: If table exists but is wrong, drop it first
-- DROP TABLE IF EXISTS match_events CASCADE;
-- DROP TYPE IF EXISTS match_event_type_enum CASCADE;

-- Step 3: Then create fresh (uncomment the lines above if needed)
-- After dropping, run the APPLY_THIS_MIGRATION.sql file
