// Test team CRUD operations
async function testTeamCRUD() {
  console.log('🧪 Testing Team CRUD Operations\n');

  const baseUrl = 'http://127.0.0.1:5000/api';
  
  try {
    // 1. Test READ - Get existing teams
    console.log('1️⃣ Testing READ operations...');
    
    const teamsResponse = await fetch(`${baseUrl}/teams`);
    if (!teamsResponse.ok) throw new Error(`Teams GET failed: ${teamsResponse.status}`);
    
    const teams = await teamsResponse.json();
    console.log(`✅ GET /api/teams: Found ${teams.length} teams`);
    
    if (teams.length === 0) {
      console.log('⚠️ No teams found - will test creation only');
      return;
    }
    
    const sampleTeam = teams[0];
    console.log(`📋 Sample team: ${sampleTeam.name} (${sampleTeam.id})`);
    console.log(`   Status: ${sampleTeam.registration_status || sampleTeam.teamStatus || sampleTeam.team_status}`);
    console.log(`   Organization: ${sampleTeam.org_id ? 'Affiliated' : 'Independent'}`);

    // 2. Test UPDATE - Change team status
    console.log('\n2️⃣ Testing UPDATE operations...');
    
    const updateData = {
      registration_status: sampleTeam.registration_status === 'ACTIVE' ? 'PENDING' : 'ACTIVE'
    };
    
    console.log(`Attempting to update team status from ${sampleTeam.registration_status} to ${updateData.registration_status}...`);
    
    const updateResponse = await fetch(`${baseUrl}/teams/${sampleTeam.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData)
    });
    
    if (!updateResponse.ok) {
      const error = await updateResponse.text();
      console.log(`❌ PATCH /api/teams/${sampleTeam.id} failed:`, updateResponse.status, error);
    } else {
      const updatedTeam = await updateResponse.json();
      console.log(`✅ PATCH /api/teams/${sampleTeam.id}: Status updated to ${updatedTeam.registration_status || updatedTeam.teamStatus}`);
    }

    // 3. Test organization affiliation change
    console.log('\n3️⃣ Testing organization affiliation change...');
    
    const orgChangeData = {
      org_id: sampleTeam.org_id ? null : '550e8400-e29b-41d4-a716-446655440000' // Toggle between independent and affiliated
    };
    
    console.log(`Attempting to ${sampleTeam.org_id ? 'remove' : 'add'} organization affiliation...`);
    
    const orgUpdateResponse = await fetch(`${baseUrl}/teams/${sampleTeam.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orgChangeData)
    });
    
    if (!orgUpdateResponse.ok) {
      const error = await orgUpdateResponse.text();
      console.log(`❌ Organization update failed:`, orgUpdateResponse.status, error);
    } else {
      const updatedTeam = await orgUpdateResponse.json();
      console.log(`✅ Organization affiliation updated: ${updatedTeam.org_id ? 'Affiliated' : 'Independent'}`);
    }

    // 4. Test CREATE (if we have organizations to test with)
    console.log('\n4️⃣ Testing CREATE operations...');
    
    const newTeam = {
      name: `Test Team ${Date.now()}`,
      description: 'Test team for CRUD operations',
      registration_status: 'PENDING',
      org_id: null, // Create as independent
      county_id: sampleTeam.county_id,
      sub_county_id: sampleTeam.sub_county_id,
      ward_id: sampleTeam.ward_id
    };
    
    // Test creating independent team (no orgId in URL)
    console.log(`Creating independent team: ${newTeam.name}...`);
    
    const createResponse = await fetch(`${baseUrl}/teams`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newTeam)
    });
    
    if (!createResponse.ok) {
      const error = await createResponse.text();
      console.log(`❌ POST /api/teams failed:`, createResponse.status, error);
    } else {
      const createdTeam = await createResponse.json();
      console.log(`✅ Created team: ${createdTeam.name} (${createdTeam.id})`);
      
      // 5. Test DELETE
      console.log('\n5️⃣ Testing DELETE operations...');
      
      const deleteResponse = await fetch(`${baseUrl}/teams/${createdTeam.id}`, {
        method: 'DELETE'
      });
      
      if (!deleteResponse.ok) {
        const error = await deleteResponse.text();
        console.log(`❌ DELETE failed:`, deleteResponse.status, error);
      } else {
        console.log(`✅ Team deleted successfully`);
      }
    }

    console.log('\n🎉 Team CRUD testing completed!');
    
  } catch (error) {
    console.error('❌ CRUD Test Error:', error);
  }
}

testTeamCRUD();