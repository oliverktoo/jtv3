import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://siolrhalqvpzerthdluq.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNpb2xyaGFscXZwemVydGhkbHVxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEwMDUzMTIsImV4cCI6MjA3NjU4MTMxMn0.e_a2rgODJk7m1Dvu0KZykECmZ0hbm9fy0FSjvx21lEo';

const supabase = createClient(supabaseUrl, supabaseKey);

async function applyRLSPolicies() {
  try {
    console.log('📋 Reading RLS policies migration file...');
    const sql = readFileSync('./migrations/0005_venues_rls_policies.sql', 'utf8');
    
    console.log('🔧 Applying RLS policies to venues table...');
    console.log('SQL:', sql);
    
    // Note: Supabase client doesn't support raw SQL execution with anon key
    // You need to run this in Supabase SQL Editor or use service role key
    console.log('\n⚠️  IMPORTANT: This script needs to be run with service role key or in Supabase SQL Editor');
    console.log('📝 Copy the SQL from migrations/0005_venues_rls_policies.sql');
    console.log('🌐 Go to: https://supabase.com/dashboard/project/siolrhalqvpzerthdluq/sql');
    console.log('📋 Paste and execute the SQL');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

applyRLSPolicies();
