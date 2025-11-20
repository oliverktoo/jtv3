// Test teams API endpoint directly
async function testTeamsAPI() {
  console.log('🧪 Testing Teams API endpoint...\n');

  try {
    console.log('📡 Fetching teams from API...');
    const response = await fetch('http://127.0.0.1:5000/api/teams/all');
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    
    console.log(`✅ API Response Status: ${response.status}`);
    console.log(`📊 Teams Count: ${result.data?.length || 0}`);
    
    if (result.data && result.data.length > 0) {
      console.log('\n📋 Sample Team Data:');
      const sampleTeam = result.data[0];
      console.log(JSON.stringify(sampleTeam, null, 2));
      
      console.log('\n🔍 Field Analysis:');
      console.log(`- registration_status: ${sampleTeam.registration_status || 'Not found'}`);
      console.log(`- teamStatus: ${sampleTeam.teamStatus || 'Not found'}`);
      console.log(`- team_status: ${sampleTeam.team_status || 'Not found'}`);
      console.log(`- county_id: ${sampleTeam.county_id || 'Not found'}`);
      console.log(`- sub_county_id: ${sampleTeam.sub_county_id || 'Not found'}`);
      console.log(`- ward_id: ${sampleTeam.ward_id || 'Not found'}`);
      console.log(`- org_id: ${sampleTeam.org_id || 'Not found'}`);
      
      // Test filtering logic
      console.log('\n🧪 Filter Logic Test:');
      const testTeam = sampleTeam;
      const teamStatus = testTeam.registration_status || testTeam.teamStatus || testTeam.team_status || 'ACTIVE';
      console.log(`Final teamStatus: ${teamStatus}`);
      
      const isActive = teamStatus === 'ACTIVE';
      const isIndependent = !testTeam.org_id;
      console.log(`- Is Active: ${isActive}`);
      console.log(`- Is Independent: ${isIndependent}`);
    }
    
    console.log('\n🎉 Teams API test completed!');
    
  } catch (error) {
    console.error('❌ API Test Error:', error);
  }
}

testTeamsAPI();