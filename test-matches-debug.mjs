import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('🔍 DEBUGGING MATCHES AND TOURNAMENT RELATIONSHIPS\n');

try {
  // 1. Check total matches
  console.log('1️⃣ Total matches in database...');
  const { data: allMatches, error: matchesError } = await supabase
    .from('matches')
    .select('id, round_id, home_team_id, away_team_id, kickoff');
  
  if (matchesError) throw matchesError;
  console.log(`   ✅ Found ${allMatches?.length || 0} matches total\n`);
  
  if (allMatches?.length > 0) {
    console.log('   📋 Sample matches:', allMatches.slice(0, 3).map(m => ({
      id: m.id.substring(0, 8) + '...',
      round_id: m.round_id?.substring(0, 8) + '...',
      kickoff: m.kickoff
    })));
  }

  // 2. Check rounds
  console.log('\n2️⃣ Total rounds in database...');
  const { data: allRounds, error: roundsError } = await supabase
    .from('rounds')
    .select('id, stage_id, group_id, number');
  
  if (roundsError) throw roundsError;
  console.log(`   ✅ Found ${allRounds?.length || 0} rounds total\n`);
  
  if (allRounds?.length > 0) {
    console.log('   📋 Sample rounds:', allRounds.slice(0, 3).map(r => ({
      id: r.id.substring(0, 8) + '...',
      stage_id: r.stage_id?.substring(0, 8) + '...',
      number: r.number
    })));
  }

  // 3. Check stages
  console.log('\n3️⃣ Total stages in database...');
  const { data: allStages, error: stagesError } = await supabase
    .from('stages')
    .select('id, tournament_id, name');
  
  if (stagesError) throw stagesError;
  console.log(`   ✅ Found ${allStages?.length || 0} stages total\n`);
  
  if (allStages?.length > 0) {
    console.log('   📋 Sample stages:', allStages.slice(0, 3).map(s => ({
      id: s.id.substring(0, 8) + '...',
      tournament_id: s.tournament_id.substring(0, 8) + '...',
      name: s.name
    })));
  }

  // 4. Check specific tournament
  const targetTournamentId = '5f871d57-9158-4947-8ebc-dbcaa417ec04';
  console.log(`\n4️⃣ Checking stages for COMPUTER CUP (${targetTournamentId.substring(0, 8)}...)...`);
  
  const { data: tournamentStages, error: tournamentStagesError } = await supabase
    .from('stages')
    .select('id, name, tournament_id')
    .eq('tournament_id', targetTournamentId);
    
  if (tournamentStagesError) throw tournamentStagesError;
  console.log(`   ✅ Found ${tournamentStages?.length || 0} stages for COMPUTER CUP\n`);
  
  if (tournamentStages?.length > 0) {
    console.log('   📋 Tournament stages:', tournamentStages.map(s => ({
      id: s.id.substring(0, 8) + '...',
      name: s.name
    })));
    
    // 5. Check rounds for these stages
    const stageIds = tournamentStages.map(s => s.id);
    console.log(`\n5️⃣ Checking rounds for tournament stages...`);
    
    const { data: stageRounds, error: stageRoundsError } = await supabase
      .from('rounds')
      .select('id, stage_id, number, name')
      .in('stage_id', stageIds);
      
    if (stageRoundsError) throw stageRoundsError;
    console.log(`   ✅ Found ${stageRounds?.length || 0} rounds for tournament stages\n`);
    
    if (stageRounds?.length > 0) {
      // 6. Check matches for these rounds
      const roundIds = stageRounds.map(r => r.id);
      console.log(`6️⃣ Checking matches for tournament rounds...`);
      
      const { data: tournamentMatches, error: tournamentMatchesError } = await supabase
        .from('matches')
        .select('id, round_id, home_team_id, away_team_id, kickoff')
        .in('round_id', roundIds);
        
      if (tournamentMatchesError) throw tournamentMatchesError;
      console.log(`   ✅ Found ${tournamentMatches?.length || 0} matches for COMPUTER CUP\n`);
      
      if (tournamentMatches?.length > 0) {
        console.log('   🎯 SUCCESS! Matches exist for this tournament:');
        console.log(tournamentMatches.map(m => ({
          id: m.id.substring(0, 8) + '...',
          kickoff: m.kickoff,
          teams: `${m.home_team_id?.substring(0, 8)}... vs ${m.away_team_id?.substring(0, 8)}...`
        })));
      } else {
        console.log('   ❌ No matches found for this tournament');
      }
    } else {
      console.log('   ❌ No rounds found for tournament stages');
    }
  } else {
    console.log('   ❌ No stages found for COMPUTER CUP tournament');
  }

} catch (error) {
  console.error('❌ Database query error:', error);
  process.exit(1);
}

console.log('\n🏁 Debug complete!');