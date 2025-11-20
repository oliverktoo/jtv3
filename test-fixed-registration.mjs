// Test the fixed registration data structure
const { createClient } = await import('@supabase/supabase-js');

const supabaseUrl = 'https://siolrhalqvpzerthdluq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNpb2xyaGFscXZwemVydGhkbHVxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEwMDUzMTIsImV4cCI6MjA3NjU4MTMxMn0.e_a2rgODJk7m1Dvu0KZykECmZ0hbm9fy0FSjvx21lEo';

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('Testing fixed registration data structure...');

try {
  // Get real IDs for testing
  const { data: teams } = await supabase.from('teams').select('id').limit(1);
  const { data: tournaments } = await supabase.from('tournaments').select('id').limit(1);

  if (!teams?.length || !tournaments?.length) {
    console.log('⚠️  No test data available');
    process.exit(0);
  }

  // Use the same structure as our fixed code
  const testData = {
    team_id: teams[0].id,
    tournament_id: tournaments[0].id,
    representing_org_id: null, // This column should exist
    registration_status: 'DRAFT',
    squad_size: 22,
    jersey_colors: null,
    coach_name: null,
    captain_player_id: null,
    notes: null,
  };

  console.log('Testing registration with fixed data structure:', testData);

  const { data: result, error } = await supabase
    .from('team_tournament_registrations')
    .insert(testData)
    .select()
    .single();

  if (error) {
    console.error('❌ Still getting error:', error.message);
    console.error('Error details:', error);
  } else {
    console.log('✅ Registration successful!', result);
    
    // Clean up
    await supabase
      .from('team_tournament_registrations')
      .delete()
      .eq('id', result.id);
    console.log('🧹 Test record cleaned up');
  }

} catch (err) {
  console.error('💥 Unexpected error:', err);
}