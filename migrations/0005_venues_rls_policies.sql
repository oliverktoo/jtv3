-- Enable Row Level Security on venues table
ALTER TABLE venues ENABLE ROW LEVEL SECURITY;

-- Policy: Allow everyone to read venues
CREATE POLICY "Anyone can view venues"
ON venues
FOR SELECT
TO public
USING (true);

-- Policy: Allow authenticated users to insert venues
CREATE POLICY "Authenticated users can create venues"
ON venues
FOR INSERT
TO public
WITH CHECK (true);

-- Policy: Allow authenticated users to update venues
CREATE POLICY "Authenticated users can update venues"
ON venues
FOR UPDATE
TO public
USING (true)
WITH CHECK (true);

-- Policy: Allow authenticated users to delete venues
CREATE POLICY "Authenticated users can delete venues"
ON venues
FOR DELETE
TO public
USING (true);

-- Add comment documenting the RLS policies
COMMENT ON TABLE venues IS 'Venues table with RLS policies:
- SELECT: Public read access
- INSERT/UPDATE/DELETE: Public access (authenticated via Supabase anon key)';
