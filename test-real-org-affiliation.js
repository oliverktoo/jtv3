// Test organization affiliation with real org IDs
async function testRealOrgAffiliation() {
  try {
    console.log('🏢 Testing Organization Affiliation with Real Org IDs\n');
    
    const baseUrl = 'http://127.0.0.1:5000/api';
    
    // Get available organizations
    const orgResponse = await fetch(`${baseUrl}/organizations`);
    const orgsData = await orgResponse.json();
    const orgs = orgsData.data || [];
    
    console.log(`Found ${orgs.length} organizations:`);
    orgs.forEach(org => {
      console.log(`  - ${org.name} (${org.id})`);
    });
    
    // Get teams
    const teamsResponse = await fetch(`${baseUrl}/teams`);
    const teams = await teamsResponse.json();
    
    const independentTeam = teams.find(t => !t.org_id);
    
    if (independentTeam && orgs.length > 0) {
      const testOrg = orgs[0]; // Use Jamii Sports Federation
      
      console.log(`\n1. Testing independent → affiliated`);
      console.log(`   Team: ${independentTeam.name}`);
      console.log(`   Organization: ${testOrg.name}`);
      
      const response1 = await fetch(`${baseUrl}/teams/${independentTeam.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ org_id: testOrg.id })
      });
      
      if (response1.ok) {
        const updated = await response1.json();
        console.log(`✅ Team is now affiliated to: ${testOrg.name}`);
        console.log(`   org_id: ${updated.org_id}`);
        
        // Test changing to a different organization
        if (orgs.length > 1) {
          const newOrg = orgs[1];
          console.log(`\n2. Testing organization switch`);
          console.log(`   From: ${testOrg.name}`);
          console.log(`   To: ${newOrg.name}`);
          
          const response2 = await fetch(`${baseUrl}/teams/${independentTeam.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ org_id: newOrg.id })
          });
          
          if (response2.ok) {
            const switched = await response2.json();
            console.log(`✅ Organization switched successfully`);
            console.log(`   New org_id: ${switched.org_id}`);
          }
        }
        
        // Revert back to independent
        console.log(`\n3. Testing affiliated → independent`);
        
        const response3 = await fetch(`${baseUrl}/teams/${independentTeam.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ org_id: null })
        });
        
        if (response3.ok) {
          const reverted = await response3.json();
          console.log(`✅ Team is now independent again`);
          console.log(`   org_id: ${reverted.org_id}`);
        }
        
      } else {
        const error = await response1.text();
        console.log(`❌ Failed to affiliate: ${response1.status}`);
        console.log(`Error:`, error);
      }
    }
    
    console.log('\n🎉 Organization affiliation testing completed!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testRealOrgAffiliation();