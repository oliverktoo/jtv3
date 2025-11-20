// Comprehensive test for team filtering functionality
async function testTeamFilteringComplete() {
  console.log('🧪 Comprehensive Team Filtering Test\n');

  try {
    // Test the teams API endpoint
    console.log('1️⃣ Testing Teams API...');
    const response = await fetch('http://127.0.0.1:5000/api/teams/all');
    const result = await response.json();
    
    const teams = result.data || [];
    console.log(`✅ Found ${teams.length} total teams`);

    if (teams.length === 0) {
      console.log('⚠️ No teams found - skipping filter tests');
      return;
    }

    // Analyze team data structure
    console.log('\n2️⃣ Analyzing Team Data Structure...');
    const sampleTeam = teams[0];
    
    const statusFields = {
      registration_status: sampleTeam.registration_status,
      teamStatus: sampleTeam.teamStatus,
      team_status: sampleTeam.team_status
    };
    
    const geoFields = {
      county_id: sampleTeam.county_id,
      sub_county_id: sampleTeam.sub_county_id,
      ward_id: sampleTeam.ward_id
    };
    
    const orgField = {
      org_id: sampleTeam.org_id
    };
    
    console.log('Status fields:', statusFields);
    console.log('Geographic fields:', geoFields);
    console.log('Organization field:', orgField);

    // Test filtering logic
    console.log('\n3️⃣ Testing Filter Logic...');
    
    // Status filtering
    const statusCounts = {
      ACTIVE: teams.filter(t => (t.registration_status || t.teamStatus || t.team_status) === 'ACTIVE').length,
      PENDING: teams.filter(t => (t.registration_status || t.teamStatus || t.team_status) === 'PENDING').length,
      DORMANT: teams.filter(t => (t.registration_status || t.teamStatus || t.team_status) === 'DORMANT').length,
      SUSPENDED: teams.filter(t => (t.registration_status || t.teamStatus || t.team_status) === 'SUSPENDED').length,
      DISBANDED: teams.filter(t => (t.registration_status || t.teamStatus || t.team_status) === 'DISBANDED').length
    };
    
    console.log('📊 Status Distribution:');
    Object.entries(statusCounts).forEach(([status, count]) => {
      console.log(`  ${status}: ${count} teams`);
    });

    // Organization filtering
    const orgCounts = {
      affiliated: teams.filter(t => t.org_id).length,
      independent: teams.filter(t => !t.org_id).length
    };
    
    console.log('\n🏢 Organization Distribution:');
    console.log(`  Affiliated: ${orgCounts.affiliated} teams`);
    console.log(`  Independent: ${orgCounts.independent} teams`);

    // Geographic filtering
    const geoCounts = {
      withCounty: teams.filter(t => t.county_id).length,
      withSubCounty: teams.filter(t => t.sub_county_id).length,
      withWard: teams.filter(t => t.ward_id).length
    };
    
    console.log('\n🗺️ Geographic Distribution:');
    console.log(`  Teams with County: ${geoCounts.withCounty}`);
    console.log(`  Teams with Sub-County: ${geoCounts.withSubCounty}`);
    console.log(`  Teams with Ward: ${geoCounts.withWard}`);

    // Test combined filtering
    console.log('\n4️⃣ Testing Combined Filters...');
    
    // Active independent teams
    const activeIndependent = teams.filter(t => 
      (t.registration_status || t.teamStatus || t.team_status) === 'ACTIVE' && 
      !t.org_id
    );
    console.log(`Active Independent Teams: ${activeIndependent.length}`);
    
    // Teams with complete geographic data
    const completeGeoTeams = teams.filter(t => 
      t.county_id && t.sub_county_id && t.ward_id
    );
    console.log(`Teams with Complete Geographic Data: ${completeGeoTeams.length}`);

    console.log('\n5️⃣ Testing Geographic Hierarchy...');
    
    // Get unique counties
    const counties = [...new Set(teams.filter(t => t.county_id).map(t => t.county_id))];
    console.log(`Unique Counties: ${counties.length}`);
    
    if (counties.length > 0) {
      const firstCountyId = counties[0];
      const teamsInCounty = teams.filter(t => t.county_id === firstCountyId);
      console.log(`Teams in first county (${firstCountyId}): ${teamsInCounty.length}`);
      
      // Get sub-counties for this county
      const subCountiesInCounty = [...new Set(teamsInCounty.map(t => t.sub_county_id).filter(Boolean))];
      console.log(`Sub-counties in this county: ${subCountiesInCounty.length}`);
      
      if (subCountiesInCounty.length > 0) {
        const firstSubCountyId = subCountiesInCounty[0];
        const teamsInSubCounty = teams.filter(t => 
          t.county_id === firstCountyId && 
          t.sub_county_id === firstSubCountyId
        );
        console.log(`Teams in first sub-county: ${teamsInSubCounty.length}`);
      }
    }

    console.log('\n🎉 Comprehensive team filtering test completed successfully!');
    
  } catch (error) {
    console.error('❌ Test Error:', error);
  }
}

testTeamFilteringComplete();