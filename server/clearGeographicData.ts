import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_ANON_KEY!
);

async function clearGeographicData() {
  console.log("Clearing existing geographic data...");

  try {
    // Delete in reverse order due to foreign key constraints
    console.log("Deleting wards...");
    const { error: wardsError } = await supabase
      .from('wards')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all
    
    if (wardsError && wardsError.code !== 'PGRST116') { // Ignore "no rows found" error
      console.error('Wards deletion error:', wardsError);
      throw wardsError;
    }

    console.log("Deleting sub-counties...");
    const { error: subCountiesError } = await supabase
      .from('sub_counties')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all
    
    if (subCountiesError && subCountiesError.code !== 'PGRST116') {
      console.error('Sub-counties deletion error:', subCountiesError);
      throw subCountiesError;
    }

    console.log("Deleting counties...");
    const { error: countiesError } = await supabase
      .from('counties')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all
    
    if (countiesError && countiesError.code !== 'PGRST116') {
      console.error('Counties deletion error:', countiesError);
      throw countiesError;
    }

    console.log("✅ Geographic data cleared successfully");

  } catch (error) {
    console.error('Failed to clear geographic data:', error);
    throw error;
  }
}

clearGeographicData()
  .then(() => {
    console.log('Clearing completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Clearing failed:', error);
    process.exit(1);
  });