import { supabase } from './client/lib/supabaseClient.ts';

console.log('Testing database tables...');

// Test if teams table exists
try {
  const { data: teams, error: teamsError } = await supabase
    .from('teams')
    .select('id, name, team_status')
    .limit(1);
    
  console.log('Teams table result:', { teams, error: teamsError });
} catch (err) {
  console.error('Teams table error:', err);
}

// Test if team_tournament_registrations table exists  
try {
  const { data: registrations, error: regError } = await supabase
    .from('team_tournament_registrations')
    .select('id')
    .limit(1);
    
  console.log('Team registrations table result:', { registrations, error: regError });
} catch (err) {
  console.error('Team registrations table error:', err);
}

// Check what tables are available
try {
  const { data: tables } = await supabase.rpc('get_tables');
  console.log('Available tables:', tables);
} catch (err) {
  console.log('Cannot check available tables:', err);
}