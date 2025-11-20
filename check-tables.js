// Check what tables exist in the database
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://siolrhalqvpzerthdluq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNpb2xyaGFscXZwemVydGhkbHVxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEwMDUzMTIsImV4cCI6MjA3NjU4MTMxMn0.e_a2rgODJk7m1Dvu0KZykECmZ0hbm9fy0FSjvx21lEo';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTables() {
  console.log('Checking available tables...');
  
  // Try to list all tables in the public schema
  const { data, error } = await supabase
    .from('information_schema.tables')
    .select('table_name')
    .eq('table_schema', 'public');

  if (error) {
    console.error('Error fetching tables:', error);
    return;
  }

  console.log('Available tables:', data?.map(t => t.table_name) || []);
  
  // Try to get columns for player_registry if it exists
  const { data: columns, error: colError } = await supabase
    .from('information_schema.columns')
    .select('column_name, data_type')
    .eq('table_name', 'player_registry')
    .eq('table_schema', 'public');

  if (colError) {
    console.error('Error fetching columns:', colError);
  } else {
    console.log('player_registry columns:', columns);
  }
}

checkTables();