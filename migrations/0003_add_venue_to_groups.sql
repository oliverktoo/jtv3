-- Migration: Add venue column to groups table
-- This allows groups to be associated with specific venues

-- Add venue column to groups table
ALTER TABLE groups ADD COLUMN IF NOT EXISTS venue TEXT;

-- Add comment to document the column
COMMENT ON COLUMN groups.venue IS 'Optional venue/location where group matches will be played';
