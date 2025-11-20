import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_ANON_KEY!
);

async function addMissingTeamsColumns() {
  console.log("Adding missing columns to teams table...");

  try {
    // Note: We can't run DDL commands through Supabase client SDK
    // We need to run these SQL commands in Supabase SQL Editor
    const sqlCommands = `
-- Add missing columns to teams table
ALTER TABLE teams ADD COLUMN IF NOT EXISTS contact_email VARCHAR(255);
ALTER TABLE teams ADD COLUMN IF NOT EXISTS contact_phone VARCHAR(20);
ALTER TABLE teams ADD COLUMN IF NOT EXISTS home_venue VARCHAR(255);
ALTER TABLE teams ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE teams ADD COLUMN IF NOT EXISTS manager_id UUID;
ALTER TABLE teams ADD COLUMN IF NOT EXISTS registration_status VARCHAR(20) DEFAULT 'ACTIVE';
ALTER TABLE teams ADD COLUMN IF NOT EXISTS max_players INTEGER DEFAULT 22;
ALTER TABLE teams ADD COLUMN IF NOT EXISTS club_name VARCHAR(255);
ALTER TABLE teams ADD COLUMN IF NOT EXISTS founded_date DATE;
ALTER TABLE teams ADD COLUMN IF NOT EXISTS logo_url VARCHAR(500);

-- Make tournament_id optional for global teams
ALTER TABLE teams ALTER COLUMN tournament_id DROP NOT NULL;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_teams_registration_status ON teams(registration_status);
CREATE INDEX IF NOT EXISTS idx_teams_manager_id ON teams(manager_id);

-- Verify the changes
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'teams' 
ORDER BY column_name;
`;

    console.log("📋 SQL Commands to run in Supabase SQL Editor:");
    console.log("=" .repeat(60));
    console.log(sqlCommands);
    console.log("=" .repeat(60));
    console.log("\n🔧 Instructions:");
    console.log("1. Open your Supabase Dashboard");
    console.log("2. Go to SQL Editor");
    console.log("3. Create a new query");
    console.log("4. Copy and paste the SQL above");
    console.log("5. Click 'Run' to execute");
    console.log("\n⚠️  Note: The Supabase client SDK cannot run DDL commands,");
    console.log("   so you must run this SQL manually in the Supabase dashboard.");

    // Let's also try a simple test to confirm current structure
    console.log("\n🔍 Current teams table structure:");
    const { data, error } = await supabase
      .from('teams')
      .select('*')
      .limit(0);

    if (error) {
      console.error("Error checking table structure:", error);
    } else {
      console.log("✅ Connection to teams table successful");
    }

  } catch (error) {
    console.error('Failed to prepare column additions:', error);
    throw error;
  }
}

addMissingTeamsColumns()
  .then(() => {
    console.log('\n✅ Column addition preparation completed');
    console.log('Please run the SQL commands above in Supabase SQL Editor');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Column addition preparation failed:', error);
    process.exit(1);
  });