import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

console.log('📊 QUICK DATABASE CHECK\n');

async function quickCheck() {
  try {
    // Organizations
    const { data: orgs, error: orgsError } = await supabase
      .from('organizations')
      .select('*');
    
    if (orgsError) throw orgsError;
    
    console.log('ORGANIZATIONS:', orgs?.length || 0);
    orgs?.forEach(org => {
      console.log(`  • ${org.name} (ID: ${org.id})`);
    });
    
    // Tournaments
    const { data: tournaments, error: tournsError } = await supabase
      .from('tournaments')
      .select('*');
    
    if (tournsError) throw tournsError;
    
    console.log('\nTOURNAMENTS:', tournaments?.length || 0);
    tournaments?.forEach(t => {
      console.log(`  • ${t.name} (Org: ${t.org_id})`);
    });
    
    // Teams
    const { data: teams, error: teamsError } = await supabase
      .from('teams')
      .select('*');
    
    if (teamsError) throw teamsError;
    
    console.log('\nTEAMS:', teams?.length || 0);
    teams?.forEach(team => {
      console.log(`  • ${team.name} (Org: ${team.org_id || 'Independent'})`);
    });
    
    // Player Registry
    const { data: players, error: playersError } = await supabase
      .from('player_registry')
      .select('*');
    
    if (playersError) throw playersError;
    
    console.log('\nPLAYERS:', players?.length || 0);
    
    // Stats by org
    console.log('\n=== STATS BY ORGANIZATION ===');
    
    const defaultOrgId = '550e8400-e29b-41d4-a716-446655440001';
    
    const [orgTeamsResult, orgTournamentsResult, orgPlayersResult] = await Promise.all([
      supabase.from('teams').select('*', { count: 'exact', head: true }).eq('org_id', defaultOrgId),
      supabase.from('tournaments').select('*', { count: 'exact', head: true }).eq('org_id', defaultOrgId),
      supabase.from('player_registry').select('*', { count: 'exact', head: true }).eq('org_id', defaultOrgId)
    ]);
    
    console.log(`Default Org (${defaultOrgId}):`);
    console.log(`  Teams: ${orgTeamsResult.count || 0}`);
    console.log(`  Tournaments: ${orgTournamentsResult.count || 0}`);
    console.log(`  Players: ${orgPlayersResult.count || 0}`);
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

quickCheck();