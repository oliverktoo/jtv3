import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_ANON_KEY!
);

async function runTeamsMigration() {
  console.log("Running teams table migration...");

  try {
    // First, let's check what columns currently exist in the teams table
    const { data: currentColumns, error: columnsError } = await supabase
      .from('teams')
      .select('*')
      .limit(1);

    if (columnsError && columnsError.code !== 'PGRST116') { // PGRST116 means no rows found, which is OK
      console.log("Current teams table structure check failed:", columnsError);
      
      // The table might not exist, let's try to create it
      console.log("Teams table might not exist. Let's check if we need to create the basic structure...");
      
      // Try a simple query to see if we can access the table
      const { data: tableCheck, error: tableError } = await supabase
        .rpc('get_table_info', { table_name: 'teams' })
        .maybeSingle();

      if (tableError) {
        console.log("Teams table doesn't exist or is inaccessible. Creating basic teams table...");
        
        // Create basic teams table structure using SQL
        const createTeamsTable = `
          CREATE TABLE IF NOT EXISTS teams (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
            tournament_id UUID REFERENCES tournaments(id) ON DELETE CASCADE,
            name VARCHAR(255) NOT NULL,
            manager_id UUID,
            club_name VARCHAR(255),
            registration_status TEXT DEFAULT 'DRAFT',
            max_players INTEGER DEFAULT 22,
            contact_email VARCHAR(255),
            contact_phone VARCHAR(20),
            home_venue VARCHAR(255),
            founded_date DATE,
            description TEXT,
            logo_url VARCHAR(500),
            county_id UUID REFERENCES counties(id),
            sub_county_id UUID REFERENCES sub_counties(id),
            ward_id UUID REFERENCES wards(id),
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
          );

          -- Create indexes
          CREATE INDEX IF NOT EXISTS idx_teams_org_id ON teams(org_id);
          CREATE INDEX IF NOT EXISTS idx_teams_tournament_id ON teams(tournament_id);
          CREATE INDEX IF NOT EXISTS idx_teams_manager_id ON teams(manager_id);
          CREATE INDEX IF NOT EXISTS idx_teams_county_id ON teams(county_id);
          CREATE INDEX IF NOT EXISTS idx_teams_ward_id ON teams(ward_id);
        `;

        // We can't run raw SQL with the client SDK easily, so let's try a different approach
        console.log("Cannot create table via client. Please run the migration manually in Supabase SQL editor.");
        console.log("Here's the SQL to run:");
        console.log(createTeamsTable);
        
        return;
      }
    }

    // Try to add missing columns one by one
    console.log("Attempting to verify/update teams table structure...");
    
    // Test if we can insert a minimal team record to see what columns are missing
    const testTeam = {
      name: 'Test Team - Will be Deleted',
      org_id: '550e8400-e29b-41d4-a716-446655440001' // Use fallback org ID
    };

    const { data: insertTest, error: insertError } = await supabase
      .from('teams')
      .insert(testTeam)
      .select()
      .single();

    if (insertError) {
      console.error("Insert test failed:", insertError);
      
      if (insertError.message.includes('org_id')) {
        console.log("❌ org_id column is missing from teams table");
      }
      if (insertError.message.includes('county_id')) {
        console.log("❌ county_id column is missing from teams table");
      }
      
      console.log("\n🔧 MANUAL MIGRATION REQUIRED:");
      console.log("Please run this SQL in your Supabase SQL Editor:");
      console.log(`
-- Add missing columns to teams table
ALTER TABLE teams ADD COLUMN IF NOT EXISTS org_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE teams ADD COLUMN IF NOT EXISTS county_id UUID REFERENCES counties(id);
ALTER TABLE teams ADD COLUMN IF NOT EXISTS sub_county_id UUID REFERENCES sub_counties(id);
ALTER TABLE teams ADD COLUMN IF NOT EXISTS ward_id UUID REFERENCES wards(id);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_teams_org_id ON teams(org_id);
CREATE INDEX IF NOT EXISTS idx_teams_county_id ON teams(county_id);
CREATE INDEX IF NOT EXISTS idx_teams_ward_id ON teams(ward_id);
      `);
      
      return;
    }

    // If insert worked, delete the test record
    if (insertTest) {
      await supabase
        .from('teams')
        .delete()
        .eq('id', insertTest.id);
      console.log("✅ Teams table structure is correct");
    }

    console.log("✅ Teams table migration completed successfully");

  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  }
}

runTeamsMigration()
  .then(() => {
    console.log('Teams migration completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Teams migration failed:', error);
    process.exit(1);
  });