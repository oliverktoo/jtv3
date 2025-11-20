import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('🔍 FINDING TOURNAMENTS WITH ACTUAL MATCHES\n');

try {
  // Find which tournaments actually have matches
  const { data: matchesWithTournaments, error } = await supabase
    .from('matches')
    .select(`
      id,
      kickoff,
      rounds!inner(
        id,
        number,
        stages!inner(
          id,
          name,
          tournament_id,
          tournaments!inner(
            id,
            name,
            status
          )
        )
      )
    `)
    .limit(10);

  if (error) throw error;

  if (matchesWithTournaments?.length > 0) {
    console.log(`✅ Found ${matchesWithTournaments.length} matches with tournament info:`);
    
    const tournamentMatches = {};
    matchesWithTournaments.forEach(match => {
      const tournament = match.rounds.stages.tournaments;
      if (!tournamentMatches[tournament.id]) {
        tournamentMatches[tournament.id] = {
          id: tournament.id,
          name: tournament.name,
          status: tournament.status,
          matches: []
        };
      }
      tournamentMatches[tournament.id].matches.push({
        id: match.id.substring(0, 8) + '...',
        kickoff: match.kickoff
      });
    });
    
    console.log('\n📊 TOURNAMENTS WITH MATCHES:');
    Object.values(tournamentMatches).forEach(tournament => {
      console.log(`🏆 ${tournament.name} (${tournament.status})`);
      console.log(`   ID: ${tournament.id}`);
      console.log(`   Matches: ${tournament.matches.length}`);
      console.log('   Sample:', tournament.matches.slice(0, 2));
      console.log('');
    });
  } else {
    console.log('❌ No matches found with tournament relationships');
  }

} catch (error) {
  console.error('❌ Error:', error);
}