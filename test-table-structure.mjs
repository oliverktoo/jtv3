// Test to verify team_tournament_registrations table structure
const { createClient } = await import('@supabase/supabase-js');

const supabaseUrl = 'https://siolrhalqvpzerthdluq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNpb2xyaGFscXZwemVydGhkbHVxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEwMDUzMTIsImV4cCI6MjA3NjU4MTMxMn0.e_a2rgODJk7m1Dvu0KZykECmZ0hbm9fy0FSjvx21lEo';

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('Testing team_tournament_registrations table...');

try {
  // Test 1: Check if table exists by trying to select from it
  console.log('1. Checking if table exists...');
  const { data: existingData, error: selectError } = await supabase
    .from('team_tournament_registrations')
    .select('*')
    .limit(1);

  if (selectError) {
    console.error('❌ Table access error:', selectError.message);
    console.error('Error details:', selectError);
    process.exit(1);
  }

  console.log('✅ Table exists and is accessible');
  if (existingData && existingData.length > 0) {
    console.log('Sample record columns:', Object.keys(existingData[0]));
  } else {
    console.log('Table is empty, but accessible');
  }

  // Test 2: Try inserting minimal data to see what columns are actually expected
  console.log('\n2. Testing minimal insert...');
  
  // Get a real team and tournament ID from the database first
  const { data: teams, error: teamsError } = await supabase
    .from('teams')
    .select('id')
    .limit(1);
  
  const { data: tournaments, error: tournamentsError } = await supabase
    .from('tournaments')
    .select('id')
    .limit(1);

  if (teamsError || tournamentsError || !teams?.length || !tournaments?.length) {
    console.log('⚠️  No teams or tournaments found for testing');
    process.exit(0);
  }

  const testData = {
    team_id: teams[0].id,
    tournament_id: tournaments[0].id,
    affiliation_id: null,
    registration_status: 'DRAFT'
  };

  console.log('Attempting insert with:', testData);

  const { data: insertResult, error: insertError } = await supabase
    .from('team_tournament_registrations')
    .insert(testData)
    .select()
    .single();

  if (insertError) {
    console.error('❌ Insert error:', insertError.message);
    console.error('Error code:', insertError.code);
    console.error('Error details:', insertError.details);
    console.error('Error hint:', insertError.hint);
  } else {
    console.log('✅ Insert successful:', insertResult);
    
    // Clean up
    await supabase
      .from('team_tournament_registrations')
      .delete()
      .eq('id', insertResult.id);
    console.log('🧹 Test record cleaned up');
  }

} catch (err) {
  console.error('💥 Unexpected error:', err.message);
  console.error(err);
}