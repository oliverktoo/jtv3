import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_ANON_KEY!
);

async function createTestTeam() {
  console.log("Testing team creation with current schema...");

  try {
    // Get an existing tournament to link to
    const { data: tournaments, error: tourError } = await supabase
      .from('tournaments')
      .select('id, name')
      .limit(1);

    if (tourError || !tournaments?.length) {
      console.log("No tournaments available for testing");
      return;
    }

    const tournamentId = tournaments[0].id;
    console.log("Using tournament:", tournaments[0].name);

    // Try creating a team with current schema
    const testTeam = {
      name: 'Test Team - Current Schema',
      tournament_id: tournamentId,
      description: 'Test team created with existing schema'
    };

    const { data: team, error: teamError } = await supabase
      .from('teams')
      .insert(testTeam)
      .select()
      .single();

    if (teamError) {
      console.error("Team creation failed:", teamError);
    } else {
      console.log("✅ Team created successfully with current schema!");
      console.log("Team ID:", team.id);
      console.log("Available columns:", Object.keys(team));

      // Clean up
      await supabase
        .from('teams')
        .delete()
        .eq('id', team.id);
      
      console.log("Test team cleaned up");
    }

  } catch (error) {
    console.error('Test failed:', error);
  }
}

createTestTeam()
  .then(() => {
    console.log('Test completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Test failed:', error);
    process.exit(1);
  });