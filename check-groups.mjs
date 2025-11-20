import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://siolrhalqvpzerthdluq.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNpb2xyaGFscXZwemVydGhkbHVxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEwMDUzMTIsImV4cCI6MjA3NjU4MTMxMn0.e_a2rgODJk7m1Dvu0KZykECmZ0hbm9fy0FSjvx21lEo';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkGroups() {
  console.log('\n🔍 Checking all tournaments with stages and groups...\n');
  
  // Get all tournaments
  const { data: tournaments, error: tournamentsError } = await supabase
    .from('tournaments')
    .select('id, name')
    .limit(10);
  
  if (tournamentsError) {
    console.error('❌ Error fetching tournaments:', tournamentsError);
    return;
  }
  
  console.log(`Found ${tournaments.length} tournaments\n`);
  
  for (const tournament of tournaments) {
    console.log(`\n📋 Tournament: ${tournament.name} (${tournament.id})`);
    
    // Get stages for this tournament
    const { data: stages, error: stagesError } = await supabase
      .from('stages')
      .select('id, name, stage_type, seq')
      .eq('tournament_id', tournament.id);
    
    if (stagesError) {
      console.error('  ❌ Error fetching stages:', stagesError);
      continue;
    }
    
    if (!stages || stages.length === 0) {
      console.log('  ℹ️  No stages found');
      continue;
    }
    
    console.log(`  ✅ Found ${stages.length} stage(s):`);
    
    for (const stage of stages) {
      console.log(`    - Stage: ${stage.name} (${stage.id})`);
      
      // Get groups for this stage
      const { data: groups, error: groupsError } = await supabase
        .from('groups')
        .select('id, name, seq')
        .eq('stage_id', stage.id);
      
      if (groupsError) {
        console.error('      ❌ Error fetching groups:', groupsError);
        continue;
      }
      
      if (!groups || groups.length === 0) {
        console.log('      ℹ️  No groups found');
        continue;
      }
      
      console.log(`      ✅ Found ${groups.length} group(s):`);
      for (const group of groups) {
        // Get team count for this group
        const { data: teamGroups, error: teamGroupsError } = await supabase
          .from('team_groups')
          .select('id')
          .eq('group_id', group.id);
        
        const teamCount = teamGroups ? teamGroups.length : 0;
        console.log(`        - ${group.name} (${group.id}) - ${teamCount} teams`);
      }
    }
  }
}

checkGroups().then(() => {
  console.log('\n✅ Check complete\n');
  process.exit(0);
}).catch((error) => {
  console.error('\n❌ Error:', error);
  process.exit(1);
});
