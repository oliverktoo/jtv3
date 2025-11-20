import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

console.log('🔍 COMPREHENSIVE DATABASE AUDIT\n');
console.log('='.repeat(50));

async function auditDatabase() {
  try {
    // 1. Organizations
    console.log('\n📋 ORGANIZATIONS:');
    const { data: orgs, error: orgsError } = await supabase
      .from('organizations')
      .select('*');
    
    if (orgsError) throw orgsError;
    
    console.log(`   Count: ${orgs?.length || 0}`);
    orgs?.forEach(org => {
      console.log(`   • ${org.name} (ID: ${org.id}, Slug: ${org.slug})`);
    });
    
    // 2. Sports
    console.log('\n⚽ SPORTS:');
    const { data: sports, error: sportsError } = await supabase
      .from('sports')
      .select('*');
    
    if (sportsError) throw sportsError;
    
    console.log(`   Count: ${sports?.length || 0}`);
    sports?.forEach(sport => {
      console.log(`   • ${sport.name} (ID: ${sport.id}, Slug: ${sport.slug})`);
    });
    
    // 3. Tournaments with org details
    console.log('\n🏆 TOURNAMENTS:');
    const { data: tournaments, error: tournsError } = await supabase
      .from('tournaments')
      .select('*, organizations(name), sports(name)');
    
    if (tournsError) throw tournsError;
    
    console.log(`   Count: ${tournaments?.length || 0}`);
    tournaments?.forEach(t => {
      console.log(`   • ${t.name}`);
      console.log(`     - Org: ${t.organizations?.name || 'None'} (ID: ${t.org_id})`);
      console.log(`     - Sport: ${t.sports?.name || 'None'} (ID: ${t.sport_id})`);
      console.log(`     - Model: ${t.tournament_model}`);
      console.log(`     - Status: ${t.status}`);
      console.log('');
    });
    
    // 4. Teams with org details
    console.log('\n👥 TEAMS:');
    const { data: teams, error: teamsError } = await supabase
      .from('teams')
      .select(\`
        *,
        organizations (name)
      \`);
    
    if (teamsError) throw teamsError;
    
    console.log(`   Count: ${teams?.length || 0}`);
    teams?.forEach(team => {
      console.log(`   • ${team.name} (Code: ${team.code})`);
      console.log(`     - Org: ${team.organizations?.name || 'Independent'} (ID: ${team.org_id || 'none'})`);
      console.log(`     - Tournament: ${team.tournament_id || 'none'}`);
      console.log('');
    });
    
    // 5. Player Registry
    console.log('\n🏃 PLAYER REGISTRY:');
    const { data: players, error: playersError } = await supabase
      .from('player_registry')
      .select(\`
        *,
        organizations (name)
      \`);
    
    if (playersError) throw playersError;
    
    console.log(`   Count: ${players?.length || 0}`);
    if (players && players.length > 0) {
      players.slice(0, 3).forEach(player => {
        console.log(`   • ${player.first_name} ${player.last_name}`);
        console.log(`     - Org: ${player.organizations?.name || 'None'} (ID: ${player.org_id})`);
        console.log(`     - Registration: ${player.registration_status}`);
        console.log('');
      });
      if (players.length > 3) {
        console.log(`   ... and ${players.length - 3} more players`);
      }
    }
    
    // 6. Counties (Geographic data)
    console.log('\n🗺️ GEOGRAPHIC DATA:');
    const { data: counties, error: countiesError } = await supabase
      .from('counties')
      .select('*');
    
    if (countiesError) throw countiesError;
    
    console.log(`   Counties: ${counties?.length || 0}`);
    counties?.slice(0, 5).forEach(county => {
      console.log(`   • ${county.name} (${county.code})`);
    });
    
    // Summary stats by organization
    console.log('\n📊 STATISTICS BY ORGANIZATION:');
    console.log('='.repeat(50));
    
    for (const org of orgs || []) {
      console.log(`\n🏢 ${org.name} (${org.id}):`);
      
      // Count tournaments
      const { count: tournamentCount } = await supabase
        .from('tournaments')
        .select('*', { count: 'exact', head: true })
        .eq('org_id', org.id);
      
      // Count teams
      const { count: teamCount } = await supabase
        .from('teams')
        .select('*', { count: 'exact', head: true })
        .eq('org_id', org.id);
      
      // Count players
      const { count: playerCount } = await supabase
        .from('player_registry')
        .select('*', { count: 'exact', head: true })
        .eq('org_id', org.id);
      
      console.log(`   🏆 Tournaments: ${tournamentCount || 0}`);
      console.log(`   👥 Teams: ${teamCount || 0}`);
      console.log(`   🏃 Players: ${playerCount || 0}`);
    }
    
    console.log('\n' + '='.repeat(50));
    console.log('✅ DATABASE AUDIT COMPLETE');
    
  } catch (error) {
    console.error('❌ Audit failed:', error);
  }
}

auditDatabase();