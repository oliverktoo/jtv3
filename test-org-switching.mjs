// Test tournament organization switching
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// System organization for independent tournaments
const SYSTEM_ORG_ID = '00000000-0000-0000-0000-000000000000';

async function testOrganizationSwitching() {
  console.log('🔄 Testing Tournament Organization Switching\n');

  try {
    // First get an existing tournament
    const { data: tournaments, error: fetchError } = await supabase
      .from('tournaments')
      .select('id, name, org_id, organizations(name)')
      .limit(1);
    
    if (fetchError) throw fetchError;
    
    if (!tournaments || tournaments.length === 0) {
      console.log('❌ No tournaments found. Creating one first...');
      
      // Create a test tournament
      const newTournament = {
        org_id: SYSTEM_ORG_ID, // Start as independent
        sport_id: 'e3e3e3e3-e3e3-e3e3-e3e3-e3e3e3e3e3e3', // Football
        name: 'Org Switch Test Tournament',
        slug: 'org-switch-test',
        season: '2024',
        tournament_model: 'LEAGUE',
        status: 'PLANNING',
        federation_type: 'ADMINISTRATIVE_COUNTY',
        start_date: '2024-12-01',
        end_date: '2024-12-31',
        is_published: false
      };
      
      const createResponse = await fetch('http://127.0.0.1:5000/api/tournaments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTournament),
      });
      
      if (!createResponse.ok) {
        const error = await createResponse.json();
        throw new Error(`Create failed: ${error.error}`);
      }
      
      const createResult = await createResponse.json();
      tournaments.push(createResult.data);
      console.log('✅ Created test tournament:', createResult.data.name);
    }
    
    const tournament = tournaments[0];
    console.log(`📋 Testing with tournament: "${tournament.name}"`);
    console.log(`🏢 Current org: ${tournament.organizations?.name || 'Independent'} (${tournament.org_id})\n`);
    
    // Test 1: Switch to Independent (System org)
    console.log('1️⃣ Testing switch to Independent...');
    const updateToIndependent = await fetch(`http://127.0.0.1:5000/api/tournaments/${tournament.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        org_id: SYSTEM_ORG_ID
      }),
    });
    
    if (!updateToIndependent.ok) {
      const error = await updateToIndependent.json();
      throw new Error(`Update to independent failed: ${error.error}`);
    }
    
    const independentResult = await updateToIndependent.json();
    console.log(`✅ Switched to independent: ${independentResult.data.organizations?.name || 'Independent'} (${independentResult.data.org_id})\n`);
    
    // Test 2: Switch to specific organization
    console.log('2️⃣ Testing switch to specific organization...');
    
    // Get a different organization
    const { data: orgs, error: orgError } = await supabase
      .from('organizations')
      .select('id, name')
      .neq('id', SYSTEM_ORG_ID)
      .limit(1);
    
    if (orgError) throw orgError;
    
    if (orgs && orgs.length > 0) {
      const targetOrg = orgs[0];
      
      const updateToOrg = await fetch(`http://127.0.0.1:5000/api/tournaments/${tournament.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          org_id: targetOrg.id
        }),
      });
      
      if (!updateToOrg.ok) {
        const error = await updateToOrg.json();
        throw new Error(`Update to organization failed: ${error.error}`);
      }
      
      const orgResult = await updateToOrg.json();
      console.log(`✅ Switched to organization: ${orgResult.data.organizations?.name} (${orgResult.data.org_id})\n`);
      
      // Test 3: Switch back to Independent
      console.log('3️⃣ Testing switch back to Independent...');
      const updateBackToIndependent = await fetch(`http://127.0.0.1:5000/api/tournaments/${tournament.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          org_id: SYSTEM_ORG_ID
        }),
      });
      
      if (!updateBackToIndependent.ok) {
        const error = await updateBackToIndependent.json();
        throw new Error(`Update back to independent failed: ${error.error}`);
      }
      
      const finalResult = await updateBackToIndependent.json();
      console.log(`✅ Switched back to independent: ${finalResult.data.organizations?.name || 'Independent'} (${finalResult.data.org_id})\n`);
    } else {
      console.log('⚠️ No organizations found to test switching to');
    }
    
    console.log('🎉 All organization switching tests passed!');
    
  } catch (error) {
    console.error('❌ Organization switching test failed:', error.message);
    process.exit(1);
  }
}

testOrganizationSwitching();