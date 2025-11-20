// Quick test to get real IDs from database
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function getRealIds() {
  console.log('🔍 Getting real IDs from database...\n');

  try {
    // Get sports
    const { data: sports } = await supabase
      .from('sports')
      .select('id, name')
      .limit(3);

    console.log('🏃‍♂️ Available sports:');
    sports?.forEach(sport => console.log(`  ${sport.name}: ${sport.id}`));

    // Get counties
    const { data: counties } = await supabase
      .from('counties')
      .select('id, name')
      .limit(3);

    console.log('\n🏛️ Available counties:');
    counties?.forEach(county => console.log(`  ${county.name}: ${county.id}`));

  } catch (error) {
    console.error('❌ Error getting IDs:', error.message);
  }
}

getRealIds();