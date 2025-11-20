
import { supabase } from './client/lib/supabaseClient.js';

async function checkSchema() {
  try {
    const { data, error } = await supabase.rpc('get_table_schema', { table_name: 'teams' });
    if (error) console.error('RPC Error:', error);
    else console.log('Schema:', data);
  } catch (err) {
    // Try direct query
    const { data, error } = await supabase
      .from('teams')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('Query Error:', error);
    } else {
      console.log('Sample team data keys:', data[0] ? Object.keys(data[0]) : 'No data');
    }
  }
}

checkSchema();

