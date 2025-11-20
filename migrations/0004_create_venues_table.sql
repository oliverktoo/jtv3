-- Create venues table in Supabase
CREATE TABLE IF NOT EXISTS venues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  location TEXT,
  county_id UUID REFERENCES counties(id),
  sub_county_id UUID REFERENCES sub_counties(id),
  ward_id UUID REFERENCES wards(id),
  pitch_count INTEGER DEFAULT 1,
  facilities JSONB DEFAULT '[]'::jsonb,
  coordinates JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_venues_county ON venues(county_id);
CREATE INDEX IF NOT EXISTS idx_venues_sub_county ON venues(sub_county_id);
CREATE INDEX IF NOT EXISTS idx_venues_ward ON venues(ward_id);

-- Add RLS policies
ALTER TABLE venues ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Venues are viewable by everyone"
  ON venues FOR SELECT
  USING (true);

CREATE POLICY "Venues are insertable by authenticated users"
  ON venues FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Venues are updatable by authenticated users"
  ON venues FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "Venues are deletable by authenticated users"
  ON venues FOR DELETE
  USING (auth.role() = 'authenticated');

COMMENT ON TABLE venues IS 'Physical venues/stadiums where matches are played';
