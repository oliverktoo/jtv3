// Check what player tables exist and their schema
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://siolrhalqvpzerthdluq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNpb2xyaGFscXZwemVydGhkbHVxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEwMDUzMTIsImV4cCI6MjA3NjU4MTMxMn0.e_a2rgODJk7m1Dvu0KZykECmZ0hbm9fy0FSjvx21lEo';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkPlayerTables() {
  console.log('Checking player tables...');
  
  // Try different possible table names
  const possibleTables = [
    'player_registry',
    'players', 
    'player_registrations',
    'users'
  ];
  
  for (const tableName of possibleTables) {
    console.log(`\nTrying table: ${tableName}`);
    
    try {
      const { data, error, count } = await supabase
        .from(tableName)
        .select('*', { count: 'exact', head: true });

      if (error) {
        console.log(`  ❌ Error: ${error.message}`);
      } else {
        console.log(`  ✅ Table exists with ${count || 0} records`);
        
        // Try to get one record to see the schema
        const { data: sampleData, error: sampleError } = await supabase
          .from(tableName)
          .select('*')
          .limit(1);
          
        if (!sampleError && sampleData && sampleData.length > 0) {
          console.log('  Sample record columns:', Object.keys(sampleData[0]));
        }
      }
    } catch (err) {
      console.log(`  ❌ Exception: ${err.message}`);
    }
  }
}

checkPlayerTables();