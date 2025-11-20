-- Add preferred_venues array to tournaments table
-- This allows tournament organizers to select which venues are available for their tournament

ALTER TABLE tournaments 
ADD COLUMN preferred_venues uuid[] DEFAULT '{}';

-- Add comment
COMMENT ON COLUMN tournaments.preferred_venues IS 'Array of venue IDs that are available for this tournament. Empty array means all venues are available.';

-- Create index for efficient queries
CREATE INDEX idx_tournaments_preferred_venues ON tournaments USING GIN(preferred_venues);
