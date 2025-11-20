// Test frontend-style organization switching
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// System organization for independent tournaments
const SYSTEM_ORG_ID = '00000000-0000-0000-0000-000000000000';

async function testFrontendStyleSwitching() {
  console.log('🎯 Testing Frontend-Style Organization Switching\n');

  try {
    // Get the first tournament
    const { data: tournaments, error: fetchError } = await supabase
      .from('tournaments')
      .select('id, name, org_id, organizations(name)')
      .limit(1);
    
    if (fetchError) throw fetchError;
    
    if (!tournaments || tournaments.length === 0) {
      throw new Error('No tournaments found to test with');
    }
    
    const tournament = tournaments[0];
    console.log(`📋 Testing with: "${tournament.name}"`);
    console.log(`🏢 Current org: ${tournament.organizations?.name || 'Independent'} (${tournament.org_id})\n`);
    
    // Test switching TO "independent" (frontend sends "independent" but backend should convert to SYSTEM_ORG_ID)
    console.log('1️⃣ Testing frontend switch to "independent"...');
    const updateToIndependent = await fetch(`http://127.0.0.1:5000/api/tournaments/${tournament.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        org_id: SYSTEM_ORG_ID // Frontend now explicitly sends System org ID
      }),
    });
    
    if (!updateToIndependent.ok) {
      const error = await updateToIndependent.json();
      throw new Error(`Update failed: ${error.error}`);
    }
    
    const result1 = await updateToIndependent.json();
    console.log(`✅ Switched to: ${result1.data.organizations?.name || 'Independent'} (${result1.data.org_id})\n`);
    
    // Test switching TO a specific organization
    const { data: orgs } = await supabase
      .from('organizations')
      .select('id, name')
      .neq('id', SYSTEM_ORG_ID)
      .limit(1);
    
    if (orgs && orgs.length > 0) {
      const targetOrg = orgs[0];
      console.log(`2️⃣ Testing switch to "${targetOrg.name}"...`);
      
      const updateToOrg = await fetch(`http://127.0.0.1:5000/api/tournaments/${tournament.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          org_id: targetOrg.id
        }),
      });
      
      if (!updateToOrg.ok) {
        const error = await updateToOrg.json();
        throw new Error(`Update failed: ${error.error}`);
      }
      
      const result2 = await updateToOrg.json();
      console.log(`✅ Switched to: ${result2.data.organizations?.name} (${result2.data.org_id})\n`);
    }
    
    console.log('🎉 Frontend-style switching tests completed successfully!');
    
  } catch (error) {
    console.error('❌ Frontend-style switching test failed:', error.message);
    process.exit(1);
  }
}

testFrontendStyleSwitching();