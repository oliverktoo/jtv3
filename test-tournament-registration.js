// Test tournament registration to identify column error
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'your-project-url';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testTournamentRegistration() {
  console.log('Testing tournament registration...');
  
  try {
    // Check if the table exists and get its structure
    const { data: tableStructure, error: structureError } = await supabase
      .from('team_tournament_registrations')
      .select('*')
      .limit(1);
    
    if (structureError) {
      console.error('Error accessing table:', structureError);
      return;
    }
    
    console.log('Table accessible, sample keys:', Object.keys(tableStructure[0] || {}));
    
    // Try a simple insert to see the exact error
    const testRegistration = {
      team_id: '123e4567-e89b-12d3-a456-426614174000', // dummy UUID
      tournament_id: '123e4567-e89b-12d3-a456-426614174001', // dummy UUID
      representing_org_id: null,
      affiliation_id: null, // This is the column mentioned in error
      registration_status: 'DRAFT',
      squad_size: 22,
      jersey_colors: null,
      coach_name: null,
      captain_player_id: null,
      notes: null,
    };
    
    console.log('Attempting test insert with data:', testRegistration);
    
    const { data, error } = await supabase
      .from('team_tournament_registrations')
      .insert(testRegistration)
      .select()
      .single();
    
    if (error) {
      console.error('Insert error:', error.message);
      console.error('Error details:', error);
    } else {
      console.log('Insert successful:', data);
      
      // Clean up the test record
      await supabase
        .from('team_tournament_registrations')
        .delete()
        .eq('id', data.id);
      console.log('Test record cleaned up');
    }
    
  } catch (err) {
    console.error('Connection error:', err.message);
  }
}

testTournamentRegistration();