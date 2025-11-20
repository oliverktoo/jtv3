import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

console.log('🔧 Connecting to Supabase...');
const supabase = createClient(supabaseUrl, supabaseKey);

async function applyMigration() {
  try {
    console.log('📝 Applying migration: Add venue column to groups table...');
    
    // Add venue column to groups table
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE groups ADD COLUMN IF NOT EXISTS venue TEXT;'
    });

    if (error) {
      console.error('❌ Migration failed:', error);
      console.log('\n⚠️  Please run this SQL manually in Supabase SQL Editor:');
      console.log('\nALTER TABLE groups ADD COLUMN IF NOT EXISTS venue TEXT;');
      console.log("COMMENT ON COLUMN groups.venue IS 'Optional venue/location where group matches will be played';");
      process.exit(1);
    }

    console.log('✅ Migration applied successfully!');
    
    // Verify the column was added
    const { data: columns, error: verifyError } = await supabase
      .from('groups')
      .select('*')
      .limit(1);

    if (verifyError) {
      console.error('⚠️  Could not verify migration:', verifyError);
    } else {
      console.log('✅ Verified: venue column is now available in groups table');
    }

  } catch (err) {
    console.error('❌ Unexpected error:', err);
    console.log('\n⚠️  Please run this SQL manually in Supabase SQL Editor:');
    console.log('\nALTER TABLE groups ADD COLUMN IF NOT EXISTS venue TEXT;');
    console.log("COMMENT ON COLUMN groups.venue IS 'Optional venue/location where group matches will be played';");
  }
}

applyMigration();
