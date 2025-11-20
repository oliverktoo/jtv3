// Test the fixed team registrations query
const { createClient } = await import('@supabase/supabase-js');

const supabaseUrl = 'https://siolrhalqvpzerthdluq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNpb2xyaGFscXZwemVydGhkbHVxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEwMDUzMTIsImV4cCI6MjA3NjU4MTMxMn0.e_a2rgODJk7m1Dvu0KZykECmZ0hbm9fy0FSjvx21lEo';

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('Testing fixed team registrations query...');

try {
  // Get a tournament ID for testing
  const { data: tournaments } = await supabase
    .from('tournaments')
    .select('id, name')
    .limit(1);

  if (!tournaments?.length) {
    console.log('No tournaments found for testing');
    process.exit(0);
  }

  const tournamentId = tournaments[0].id;
  console.log(`Testing with tournament: ${tournaments[0].name} (${tournamentId})`);

  // Test the fixed query
  const { data, error } = await supabase
    .from('team_tournament_registrations')
    .select(`
      *,
      teams!inner (
        id,
        name,
        club_name,
        contact_email,
        contact_phone,
        county_id,
        sub_county_id,
        ward_id,
        org_id
      ),
      tournaments!inner (
        id,
        name,
        sport_id
      )
    `)
    .eq('tournament_id', tournamentId)
    .limit(5);

  if (error) {
    console.error('❌ Query failed:', error.message);
    console.error('Error details:', error);
  } else {
    console.log('✅ Query successful!');
    console.log(`Found ${data.length} registrations`);
    if (data.length > 0) {
      console.log('Sample registration:', {
        id: data[0].id,
        team_name: data[0].teams?.name,
        tournament_name: data[0].tournaments?.name,
        status: data[0].registration_status
      });
    }
  }

} catch (err) {
  console.error('💥 Unexpected error:', err);
}