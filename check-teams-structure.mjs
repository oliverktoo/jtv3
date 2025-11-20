// Check actual teams table structure
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTeamsTableStructure() {
  console.log('📋 Checking Actual Teams Table Structure\n');

  try {
    // Get teams with all available fields
    const { data: teams, error } = await supabase
      .from('teams')
      .select('*')
      .limit(1);

    if (error) {
      console.log('❌ Error:', error.message);
      return;
    }

    if (teams && teams.length > 0) {
      console.log('✅ Teams table structure:');
      console.log('Available fields:', Object.keys(teams[0]));
      console.log('\nSample team data:');
      console.log(JSON.stringify(teams[0], null, 2));
    } else {
      console.log('⚠️ No teams found in database');
    }

  } catch (error) {
    console.error('❌ Failed:', error.message);
  }
}

checkTeamsTableStructure();