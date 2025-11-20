// Check available organizations
async function checkOrganizations() {
  try {
    console.log('🏢 Checking available organizations\n');
    
    const baseUrl = 'http://127.0.0.1:5000/api';
    
    // Try to get organizations through platform stats first
    const statsResponse = await fetch(`${baseUrl}/platform/stats`);
    const stats = await statsResponse.json();
    console.log('Platform stats:', stats);
    
    // Check if there's an organizations endpoint
    const orgResponse = await fetch(`${baseUrl}/organizations`);
    if (orgResponse.ok) {
      const orgs = await orgResponse.json();
      console.log('Organizations found:', orgs);
    } else {
      console.log('No organizations endpoint available');
      
      // Check what teams are currently affiliated
      const teamsResponse = await fetch(`${baseUrl}/teams`);
      const teams = await teamsResponse.json();
      
      const affiliatedTeams = teams.filter(t => t.org_id);
      console.log(`${affiliatedTeams.length} affiliated teams found:`);
      
      const orgIds = [...new Set(affiliatedTeams.map(t => t.org_id))];
      console.log('Organization IDs in use:', orgIds);
      
      if (orgIds.length > 0) {
        console.log(`\nTesting with existing org ID: ${orgIds[0]}`);
        
        const independentTeam = teams.find(t => !t.org_id);
        
        if (independentTeam) {
          const response = await fetch(`${baseUrl}/teams/${independentTeam.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ org_id: orgIds[0] })
          });
          
          if (response.ok) {
            const updated = await response.json();
            console.log(`✅ Successfully affiliated team to existing org: ${updated.org_id}`);
            
            // Revert back
            await fetch(`${baseUrl}/teams/${independentTeam.id}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ org_id: null })
            });
            console.log(`✅ Reverted back to independent`);
            
          } else {
            const error = await response.text();
            console.log(`❌ Still failed:`, error);
          }
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkOrganizations();