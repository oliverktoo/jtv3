import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_ANON_KEY!
);

async function checkTableStructure() {
  console.log("Checking current table structures...");

  try {
    // Check if organizations exist first
    const { data: orgs, error: orgsError } = await supabase
      .from('organizations')
      .select('id, name')
      .limit(1);

    if (orgsError) {
      console.log("Organizations table error:", orgsError);
    } else {
      console.log("✅ Organizations table exists:", orgs?.length || 0, "records");
    }

    // Check if counties exist
    const { data: counties, error: countiesError } = await supabase
      .from('counties')
      .select('id, name')
      .limit(1);

    if (countiesError) {
      console.log("Counties table error:", countiesError);
    } else {
      console.log("✅ Counties table exists:", counties?.length || 0, "records");
    }

    // Check tournaments table
    const { data: tournaments, error: tournamentsError } = await supabase
      .from('tournaments')
      .select('id, name')
      .limit(1);

    if (tournamentsError) {
      console.log("Tournaments table error:", tournamentsError);
    } else {
      console.log("✅ Tournaments table exists:", tournaments?.length || 0, "records");
    }

    // Check teams table by trying to select with no columns first
    console.log("\nChecking teams table structure...");
    
    const { data: teams, error: teamsError } = await supabase
      .from('teams')
      .select('*')
      .limit(1);

    if (teamsError) {
      console.log("❌ Teams table error:", teamsError);
    } else {
      console.log("✅ Teams table exists");
      if (teams && teams.length > 0) {
        console.log("Current teams table columns:", Object.keys(teams[0]));
      } else {
        console.log("Teams table exists but is empty");
        
        // Try to get table schema info
        console.log("\nAttempting to check table schema...");
        
        // Let's try inserting with just basic fields to see what works
        const basicTeam = {
          name: 'Test Team Structure Check'
        };

        const { data: insertTest, error: insertError } = await supabase
          .from('teams')
          .insert(basicTeam)
          .select()
          .single();

        if (insertError) {
          console.log("Basic insert error:", insertError);
        } else {
          console.log("✅ Basic team insert works, columns available:", Object.keys(insertTest));
          
          // Clean up test record
          await supabase
            .from('teams')
            .delete()
            .eq('id', insertTest.id);
        }
      }
    }

  } catch (error) {
    console.error('Structure check failed:', error);
  }
}

checkTableStructure()
  .then(() => {
    console.log('Structure check completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Structure check failed:', error);
    process.exit(1);
  });