import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://siolrhalqvpzerthdluq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNpb2xyaGFscXZwemVydGhkbHVxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEwMDUzMTIsImV4cCI6MjA3NjU4MTMxMn0.e_a2rgODJk7m1Dvu0KZykECmZ0hbm9fy0FSjvx21lEo';

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('🔍 Testing Supabase connection...');

try {
  // Test teams query with proper relationships
  const { data, error } = await supabase
    .from('teams')
    .select(`
      *,
      organizations:org_id (
        id,
        name
      )
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.log('❌ Supabase Error:', error.message);
  } else {
    console.log('✅ Supabase Connected Successfully!');
    console.log('📊 Found', data.length, 'teams');
    if (data.length > 0) {
      console.log('📝 Teams by registration status:');
      const statusCounts = {};
      data.forEach(team => {
        const status = team.registration_status || 'NULL';
        statusCounts[status] = (statusCounts[status] || 0) + 1;
      });
      
      Object.entries(statusCounts).forEach(([status, count]) => {
        console.log(`   ${status}: ${count} teams`);
      });
      
      console.log('\n📝 Sample team (first one):');
      const team = data[0];
      console.log(`   Name: ${team.name}`);
      console.log(`   Status: ${team.registration_status}`);
      console.log(`   Org ID: ${team.org_id}`);
      console.log(`   County: ${team.counties?.name || 'Not set'}`);
    } else {
      console.log('ℹ️  No teams found in database');
    }
  }
} catch (err) {
  console.log('❌ Connection failed:', err.message);
}