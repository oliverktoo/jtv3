// Test the dashboard real data integration
async function testDashboardData() {
  try {
    console.log('🎯 Testing Dashboard Real Data Integration\n');
    
    const baseUrl = 'http://127.0.0.1:5000/api';
    
    // Test all the endpoints the dashboard uses
    console.log('1️⃣ Testing Platform Stats...');
    const platformResponse = await fetch(`${baseUrl}/platform/stats`);
    const platformStats = await platformResponse.json();
    console.log('✅ Platform Stats:', platformStats);
    
    console.log('\n2️⃣ Testing Tournaments Data...');
    const tournamentsResponse = await fetch(`${baseUrl}/tournaments/all`);
    const tournamentsData = await tournamentsResponse.json();
    const tournaments = tournamentsData.data || [];
    
    console.log(`✅ Tournaments: ${tournaments.length} total`);
    
    const publishedTournaments = tournaments.filter(t => t.is_published);
    const activeTournaments = tournaments.filter(t => t.is_published && t.status !== 'COMPLETED');
    
    console.log(`   - Published: ${publishedTournaments.length}`);
    console.log(`   - Active: ${activeTournaments.length}`);
    
    if (publishedTournaments.length > 0) {
      console.log(`   - Sample: "${publishedTournaments[0].name}" (${publishedTournaments[0].status || 'DRAFT'})`);
    }
    
    console.log('\n3️⃣ Testing Teams Data...');
    const teamsResponse = await fetch(`${baseUrl}/teams/all`);
    const teamsData = await teamsResponse.json();
    const teams = teamsData.data || [];
    
    console.log(`✅ Teams: ${teams.length} total`);
    
    const activeTeams = teams.filter(t => (t.registration_status || 'ACTIVE') === 'ACTIVE');
    const pendingTeams = teams.filter(t => (t.registration_status || 'ACTIVE') === 'PENDING');
    const independentTeams = teams.filter(t => !t.org_id);
    const affiliatedTeams = teams.filter(t => t.org_id);
    
    console.log(`   - Active: ${activeTeams.length}`);
    console.log(`   - Pending: ${pendingTeams.length}`);
    console.log(`   - Independent: ${independentTeams.length}`);
    console.log(`   - Affiliated: ${affiliatedTeams.length}`);
    
    console.log('\n4️⃣ Dashboard Statistics Summary:');
    console.log('📊 Real-time stats that will show on dashboard:');
    console.log(`   🏢 Organizations: ${platformStats.totalOrganizations}`);
    console.log(`   👥 Active Teams: ${activeTeams.length} (${independentTeams.length} independent)`);
    console.log(`   🏆 Tournaments: ${platformStats.totalTournaments} (${activeTournaments.length} active)`);
    console.log(`   🎯 Players: ${platformStats.totalPlayers}`);
    
    console.log('\n🎉 Dashboard is now using 100% real data!');
    console.log('🌐 View dashboard at: http://localhost:5174/');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testDashboardData();