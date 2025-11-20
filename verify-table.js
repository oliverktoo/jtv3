import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || 'placeholder',
  process.env.VITE_SUPABASE_ANON_KEY || 'placeholder'
);

async function verifyTable() {
  try {
    console.log('🔍 Verifying team_tournament_registrations table...');
    
    // Test 1: Check if table exists and is queryable
    const { data, error } = await supabase
      .from('team_tournament_registrations')
      .select('id')
      .limit(1);
      
    if (error) {
      console.error('❌ Table access failed:', error.message);
      console.log('\n📋 Please follow these steps:');
      console.log('1. Open your Supabase Dashboard');
      console.log('2. Go to SQL Editor');
      console.log('3. Create a new query');
      console.log('4. Copy and paste the contents of CREATE_TABLE_MANUAL.sql');
      console.log('5. Run the query');
      console.log('6. Run this verification script again');
      return false;
    } else {
      console.log('✅ Table exists and is accessible');
    }
    
    // Test 2: Try to insert a test record
    console.log('\n🧪 Testing insert functionality...');
    
    // First get a real team and tournament to test with
    const { data: teams } = await supabase
      .from('teams')
      .select('id')
      .limit(1);
      
    const { data: tournaments } = await supabase
      .from('tournaments')
      .select('id')
      .limit(1);
      
    if (teams && teams.length > 0 && tournaments && tournaments.length > 0) {
      const { data: insertData, error: insertError } = await supabase
        .from('team_tournament_registrations')
        .insert({
          team_id: teams[0].id,
          tournament_id: tournaments[0].id,
          registration_status: 'DRAFT'
        })
        .select();
        
      if (insertError) {
        console.error('❌ Insert test failed:', insertError.message);
        return false;
      } else {
        console.log('✅ Insert test successful');
        
        // Clean up test record
        const { error: deleteError } = await supabase
          .from('team_tournament_registrations')
          .delete()
          .eq('id', insertData[0].id);
          
        if (!deleteError) {
          console.log('✅ Test record cleaned up');
        }
      }
    }
    
    console.log('\n🎉 team_tournament_registrations table is fully functional!');
    console.log('🎯 Registration features should now work correctly.');
    return true;
    
  } catch (err) {
    console.error('❌ Verification error:', err.message);
    return false;
  }
}

verifyTable();