import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_ANON_KEY!
);

async function findWorkingColumns() {
  console.log("Finding which columns work in teams table...");

  try {
    // Get a tournament ID
    const { data: tournaments } = await supabase
      .from('tournaments')
      .select('id')
      .limit(1);

    if (!tournaments?.length) {
      console.log("No tournaments available");
      return;
    }

    const tournamentId = tournaments[0].id;

    // Try with minimal columns first
    const minimalTeam = {
      name: 'Minimal Test Team',
      tournament_id: tournamentId
    };

    console.log("Testing minimal team creation...");
    const { data: team1, error: error1 } = await supabase
      .from('teams')
      .insert(minimalTeam)
      .select()
      .single();

    if (error1) {
      console.error("Minimal team creation failed:", error1);
      return;
    }

    console.log("✅ Minimal team creation works!");
    console.log("Available columns:", Object.keys(team1));

    // Clean up
    await supabase.from('teams').delete().eq('id', team1.id);

    // Now test which additional columns work
    const columnsToTest = [
      'contact_email',
      'contact_phone', 
      'home_venue',
      'description',
      'org_id',
      'county_id',
      'manager_id',
      'registration_status',
      'max_players'
    ];

    console.log("\nTesting additional columns:");
    for (const column of columnsToTest) {
      const testTeam = {
        name: `Test ${column}`,
        tournament_id: tournamentId,
        [column]: column === 'max_players' ? 22 : `test_${column}`
      };

      const { data, error } = await supabase
        .from('teams')
        .insert(testTeam)
        .select()
        .single();

      if (error) {
        console.log(`❌ ${column}: ${error.message}`);
      } else {
        console.log(`✅ ${column}: works`);
        await supabase.from('teams').delete().eq('id', data.id);
      }
    }

  } catch (error) {
    console.error('Test failed:', error);
  }
}

findWorkingColumns()
  .then(() => {
    console.log('Column test completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Column test failed:', error);
    process.exit(1);
  });