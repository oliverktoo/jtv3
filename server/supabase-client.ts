import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://siolrhalqvpzerthdluq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNpb2xyaGFscXZwemVydGhkbHVxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEwMDUzMTIsImV4cCI6MjA3NjU4MTMxMn0.e_a2rgODJk7m1Dvu0KZykECmZ0hbm9fy0FSjvx21lEo';

export const supabase = createClient(supabaseUrl, supabaseKey);

// Test function
async function testSupabase() {
  try {
    console.log("Testing Supabase client...");
    
    // Test organizations
    const { data: orgs, error: orgsError } = await supabase
      .from('organizations')
      .select('*')
      .limit(5);
    
    if (orgsError) throw orgsError;
    
    console.log("✅ Supabase client working!");
    console.log("Organizations:", orgs);
    
    // Test sports
    const { data: sports, error: sportsError } = await supabase
      .from('sports')
      .select('*')
      .limit(5);
    
    if (sportsError) {
      console.log("Sports table might not exist yet:", sportsError.message);
    } else {
      console.log("Sports:", sports);
    }
    
    return true;
  } catch (error) {
    console.error("Supabase test failed:", error);
    return false;
  }
}

// Run test if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testSupabase().then(success => {
    process.exit(success ? 0 : 1);
  });
}