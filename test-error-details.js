// Test with error handling
async function testWithError() {
  try {
    console.log('🔍 Testing with detailed error handling\n');
    
    const baseUrl = 'http://127.0.0.1:5000/api';
    
    // Get teams
    const response = await fetch(`${baseUrl}/teams`);
    const teams = await response.json();
    
    const independentTeam = teams.find(t => !t.org_id);
    
    if (independentTeam) {
      console.log(`Testing affiliation for team: ${independentTeam.name}`);
      
      const response1 = await fetch(`${baseUrl}/teams/${independentTeam.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ org_id: '550e8400-e29b-41d4-a716-446655440000' })
      });
      
      if (response1.ok) {
        const updated = await response1.json();
        console.log(`✅ Success: org_id = ${updated.org_id}`);
      } else {
        const errorText = await response1.text();
        console.log(`❌ Failed: ${response1.status}`);
        console.log(`Error details:`, errorText);
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testWithError();