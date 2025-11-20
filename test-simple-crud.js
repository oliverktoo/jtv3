// Simple team CRUD test
const baseUrl = 'http://127.0.0.1:5000/api';

async function simpleTest() {
  try {
    console.log('🧪 Simple Team CRUD Test\n');
    
    // 1. Get teams
    console.log('1. Getting teams...');
    const response = await fetch(`${baseUrl}/teams`);
    const teams = await response.json();
    console.log(`✅ Found ${teams.length} teams`);
    
    if (teams.length === 0) return;
    
    const sampleTeam = teams[0];
    console.log(`Using team: ${sampleTeam.name} (${sampleTeam.id})`);
    
    // 2. Update team status
    console.log('\n2. Updating team status...');
    const newStatus = sampleTeam.registration_status === 'ACTIVE' ? 'PENDING' : 'ACTIVE';
    
    const updateResponse = await fetch(`${baseUrl}/teams/${sampleTeam.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ registration_status: newStatus })
    });
    
    if (!updateResponse.ok) {
      console.log(`❌ Update failed: ${updateResponse.status}`);
      return;
    }
    
    const updatedTeam = await updateResponse.json();
    console.log(`✅ Status updated from ${sampleTeam.registration_status} to ${updatedTeam.registration_status}`);
    
    // 3. Create new team
    console.log('\n3. Creating new team...');
    const newTeam = {
      name: `Test Team ${Date.now()}`,
      registration_status: 'PENDING',
      org_id: null,
      county_id: sampleTeam.county_id,
      sub_county_id: sampleTeam.sub_county_id,
      ward_id: sampleTeam.ward_id
    };
    
    const createResponse = await fetch(`${baseUrl}/teams`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newTeam)
    });
    
    if (!createResponse.ok) {
      console.log(`❌ Create failed: ${createResponse.status}`);
      return;
    }
    
    const createdTeam = await createResponse.json();
    console.log(`✅ Created team: ${createdTeam.name} (${createdTeam.id})`);
    
    // 4. Delete new team
    console.log('\n4. Deleting test team...');
    const deleteResponse = await fetch(`${baseUrl}/teams/${createdTeam.id}`, {
      method: 'DELETE'
    });
    
    if (!deleteResponse.ok) {
      console.log(`❌ Delete failed: ${deleteResponse.status}`);
      return;
    }
    
    console.log(`✅ Test team deleted successfully`);
    console.log('\n🎉 All CRUD operations working!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

simpleTest();