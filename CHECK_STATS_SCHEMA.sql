-- Check match_statistics table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'match_statistics'
ORDER BY ordinal_position;

-- Check if table exists and has data
SELECT COUNT(*) as total_stats FROM match_statistics;

-- Sample data
SELECT * FROM match_statistics LIMIT 1;
