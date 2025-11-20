-- Add tournament_id to venues table to associate venues with specific tournaments
-- This allows tournament organizers to manage their own venue lists

ALTER TABLE venues 
ADD COLUMN tournament_id uuid REFERENCES tournaments(id) ON DELETE CASCADE;

-- Create index for efficient filtering
CREATE INDEX idx_venues_tournament_id ON venues(tournament_id);

-- Add comment
COMMENT ON COLUMN venues.tournament_id IS 'Optional tournament association. NULL means venue is global/shared.';

-- Update RLS policies to allow filtering by tournament
DROP POLICY IF EXISTS "Anyone can view venues" ON venues;
CREATE POLICY "Anyone can view venues"
ON venues
FOR SELECT
TO public
USING (true);

-- Note: Existing venues will have NULL tournament_id, making them global/shared venues
