// Test organization affiliation changes
async function testOrgAffiliation() {
  try {
    console.log('🏢 Testing Organization Affiliation Changes\n');
    
    const baseUrl = 'http://127.0.0.1:5000/api';
    
    // Get teams
    const response = await fetch(`${baseUrl}/teams`);
    const teams = await response.json();
    
    console.log(`Found ${teams.length} teams`);
    
    // Find an independent team and an affiliated team
    const independentTeam = teams.find(t => !t.org_id);
    const affiliatedTeam = teams.find(t => t.org_id);
    
    console.log(`Independent teams: ${teams.filter(t => !t.org_id).length}`);
    console.log(`Affiliated teams: ${teams.filter(t => t.org_id).length}`);
    
    if (independentTeam) {
      console.log(`\n1. Testing independent → affiliated for team: ${independentTeam.name}`);
      
      // Make team affiliated (use a test org ID)
      const response1 = await fetch(`${baseUrl}/teams/${independentTeam.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ org_id: '550e8400-e29b-41d4-a716-446655440000' })
      });
      
      if (response1.ok) {
        const updated = await response1.json();
        console.log(`✅ Team is now affiliated: org_id = ${updated.org_id}`);
        
        // Revert back to independent
        const response2 = await fetch(`${baseUrl}/teams/${independentTeam.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ org_id: null })
        });
        
        if (response2.ok) {
          console.log(`✅ Reverted back to independent`);
        }
      } else {
        console.log(`❌ Failed to affiliate: ${response1.status}`);
      }
    }
    
    if (affiliatedTeam) {
      console.log(`\n2. Testing affiliated → independent for team: ${affiliatedTeam.name}`);
      
      const originalOrgId = affiliatedTeam.org_id;
      
      // Make team independent
      const response1 = await fetch(`${baseUrl}/teams/${affiliatedTeam.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ org_id: null })
      });
      
      if (response1.ok) {
        const updated = await response1.json();
        console.log(`✅ Team is now independent: org_id = ${updated.org_id}`);
        
        // Revert back to affiliated
        const response2 = await fetch(`${baseUrl}/teams/${affiliatedTeam.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ org_id: originalOrgId })
        });
        
        if (response2.ok) {
          console.log(`✅ Reverted back to affiliated`);
        }
      } else {
        console.log(`❌ Failed to make independent: ${response1.status}`);
      }
    }
    
    console.log('\n🎉 Organization affiliation changes working!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testOrgAffiliation();