import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

try {
  console.log('🔍 Investigating team registrations...');
  
  // Get all registrations with details
  const { data: registrations, error } = await supabase
    .from('team_tournament_registrations')
    .select(`
      *,
      tournaments(id, name),
      teams(id, name)
    `);
  
  if (error) {
    console.log('❌ Error:', error.message);
    process.exit(1);
  }
  
  console.log('📊 Total registrations found:', registrations.length);
  console.log('');
  
  if (registrations.length === 0) {
    console.log('❌ No team registrations found in database!');
    console.log('   This explains why Jamii Fixtures shows no teams.');
    process.exit(0);
  }
  
  // Group by tournament
  const byTournament = {};
  registrations.forEach(reg => {
    const tournamentName = reg.tournaments?.name || 'Unknown Tournament';
    const tournamentId = reg.tournament_id;
    const key = `${tournamentName} (${tournamentId.substring(0, 8)}...)`;
    
    if (!byTournament[key]) {
      byTournament[key] = [];
    }
    
    byTournament[key].push({
      teamName: reg.teams?.name || 'Unknown Team',
      status: reg.registration_status,
      teamId: reg.team_id,
      tournamentId: reg.tournament_id
    });
  });
  
  // Show results
  console.log('📋 Registrations by tournament:');
  Object.entries(byTournament).forEach(([tournament, teams]) => {
    console.log(`\n🏆 ${tournament}:`);
    teams.forEach(team => {
      console.log(`   - ${team.teamName} (Status: ${team.status})`);
    });
  });
  
  // Check what statuses exist
  const statuses = [...new Set(registrations.map(r => r.registration_status))];
  console.log('\n🏷️  All registration statuses in database:', statuses);
  
  // Check if our API is filtering correctly
  console.log('\n🔍 Testing API filtering...');
  const approvedCount = registrations.filter(r => r.registration_status === 'APPROVED').length;
  console.log(`   - APPROVED registrations: ${approvedCount}`);
  
  if (approvedCount === 0) {
    console.log('\n❌ PROBLEM FOUND: No APPROVED registrations!');
    console.log('   The API filters for APPROVED status, but all registrations have different status.');
    console.log('   Available statuses:', statuses);
  }
  
} catch (error) {
  console.log('Error:', error.message);
}