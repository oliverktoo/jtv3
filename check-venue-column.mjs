import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

console.log('🔧 Connecting to Supabase...');
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkVenueColumn() {
  try {
    console.log('📝 Checking if venue column exists in groups table...\n');
    
    // Try to select venue column
    const { data, error } = await supabase
      .from('groups')
      .select('id, name, venue')
      .limit(1);

    if (error) {
      if (error.message.includes('column') && error.message.includes('does not exist')) {
        console.log('❌ VENUE COLUMN DOES NOT EXIST');
        console.log('\n📋 Please run this SQL in Supabase SQL Editor:');
        console.log('   Dashboard → SQL Editor → New Query\n');
        console.log('   ALTER TABLE groups ADD COLUMN IF NOT EXISTS venue TEXT;');
        console.log("   COMMENT ON COLUMN groups.venue IS 'Optional venue/location where group matches will be played';\n");
      } else {
        console.error('❌ Error checking column:', error);
      }
      process.exit(1);
    }

    console.log('✅ VENUE COLUMN EXISTS!');
    console.log('✅ Migration has been applied successfully\n');
    
    if (data && data.length > 0) {
      console.log('Sample group:', data[0]);
    }

  } catch (err) {
    console.error('❌ Unexpected error:', err.message);
  }
}

checkVenueColumn();
