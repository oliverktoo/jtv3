import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
dotenv.config();

async function testSupabase() {
  console.log('Environment variables:');
  console.log('VITE_SUPABASE_URL:', process.env.VITE_SUPABASE_URL ? 'SET' : 'NOT SET');
  console.log('VITE_SUPABASE_ANON_KEY:', process.env.VITE_SUPABASE_ANON_KEY ? 'SET' : 'NOT SET');

  try {
    console.log('Creating Supabase client...');
    const supabase = createClient(
      process.env.VITE_SUPABASE_URL!,
      process.env.VITE_SUPABASE_ANON_KEY!
    );
    
    console.log('✅ Supabase client created successfully');
    
    console.log('Testing Supabase connection...');
    // Try to query a simple table or just check if we can authenticate
    const { data, error } = await supabase.from('sports').select('*').limit(1);
    
    if (error) {
      console.log('❌ Supabase query error:', error);
    } else {
      console.log('✅ Supabase connection successful:', data);
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
    if (error instanceof Error) {
      console.error('Stack:', error.stack);
    }
  }
}

testSupabase();