import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

console.log('🔍 Checking table structures...\n');

const tables = ['tournaments', 'teams', 'counties'];

for (const table of tables) {
  try {
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .limit(1);
    
    if (error) {
      console.log(`❌ ${table} error: ${error.message}`);
    } else {
      console.log(`✅ ${table} table exists`);
      if (data && data.length > 0) {
        console.log(`📋 Columns: ${Object.keys(data[0]).join(', ')}`);
      } else {
        console.log('📋 Table is empty');
      }
    }
  } catch (error) {
    console.error(`Error with ${table}:`, error.message);
  }
  console.log('');
}