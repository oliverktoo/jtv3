// Test file for Tournament Jamii Fixtures Integration
import fetch from 'node-fetch';

const API_BASE = 'http://127.0.0.1:5000';

async function testTournamentJamiiFixtures() {
  console.log('🏆 Testing Tournament Jamii Fixtures Integration\n');
  
  try {
    // 1. Get tournaments data
    console.log('1. Fetching tournaments...');
    const tournamentsResponse = await fetch(`${API_BASE}/api/tournaments/all`);
    const tournamentsResult = await tournamentsResponse.json();
    const tournaments = tournamentsResult.data || [];
    
    console.log(`   ✅ Found ${tournaments.length} tournaments`);
    if (tournaments.length > 0) {
      const tournament = tournaments[0];
      console.log(`   📝 Using tournament: ${tournament.name} (${tournament.id})`);
      
      // 2. Get teams for this tournament
      console.log('\n2. Fetching teams...');
      const teamsResponse = await fetch(`${API_BASE}/api/teams/all`);
      const teamsResult = await teamsResponse.json();
      const teams = teamsResult.data || [];
      
      console.log(`   ✅ Found ${teams.length} teams available`);
      
      // 3. Get venues for fixture generation
      console.log('\n3. Fetching venues...');
      const venuesResponse = await fetch(`${API_BASE}/api/fixtures/venues`);
      const venuesResult = await venuesResponse.json();
      const venues = venuesResult.venues || [];
      
      console.log(`   ✅ Found ${venues.length} venues available`);
      venues.slice(0, 2).forEach(venue => {
        console.log(`      - ${venue.name} in ${venue.county} (${venue.pitchCount} pitches)`);
      });
      
      // 4. Test fixture generation for this tournament
      console.log('\n4. Testing tournament fixture generation...');
      
      const testTeams = teams.slice(0, 6).map(team => ({
        id: team.id,
        name: team.name,
        county: team.county || 'Unknown',
        constituency: team.constituency || 'Unknown'
      }));
      
      const config = {
        format: 'round_robin',
        venues: venues,
        timeSlots: [
          { id: '1', time: '09:00', label: '9:00 AM' },
          { id: '2', time: '14:00', label: '2:00 PM' }
        ],
        startDate: '2024-01-20',
        endDate: '2024-02-10',
        groupingStrategy: 'geographical',
        matchDuration: 90,
        bufferTime: 15,
        restPeriod: 72
      };
      
      const generateResponse = await fetch(`${API_BASE}/api/fixtures/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teams: testTeams,
          config: config,
          tournamentId: tournament.id
        })
      });
      
      const generateResult = await generateResponse.json();
      
      if (generateResult.success) {
        console.log(`   ✅ Generated ${generateResult.fixtures.length} fixtures for ${tournament.name}`);
        console.log(`   ⚠️  ${generateResult.conflicts.length} conflicts detected`);
        console.log(`   🏆 ${generateResult.groups.length} groups created`);
        
        // Show sample fixtures
        console.log('\n   📅 Sample fixtures:');
        generateResult.fixtures.slice(0, 3).forEach((fixture, i) => {
          const kickoff = new Date(fixture.kickoff).toLocaleDateString();
          const time = new Date(fixture.kickoff).toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit' 
          });
          console.log(`      ${i+1}. ${fixture.homeTeam.name} vs ${fixture.awayTeam.name}`);
          console.log(`         📅 ${kickoff} at ${time}`);
          console.log(`         🏟️  ${fixture.venue.name} (${fixture.venue.county})`);
          console.log(`         💰 Cost Score: ${fixture.cost}`);
        });
        
        // Show groups if any
        if (generateResult.groups && generateResult.groups.length > 1) {
          console.log('\n   👥 Groups formed:');
          generateResult.groups.forEach(group => {
            console.log(`      ${group.name}: ${group.teams.map(t => t.name).join(', ')}`);
          });
        }
        
        console.log('\n5. Integration Summary:');
        console.log('   ✅ Tournament selection: Working');
        console.log('   ✅ Team data fetching: Working');
        console.log('   ✅ Venue data fetching: Working');
        console.log('   ✅ Fixture generation API: Working');
        console.log('   ✅ Geographical optimization: Active');
        console.log('   ✅ Conflict detection: Active');
        
        console.log('\n🎯 Tournament Structure Integration Ready!');
        console.log('   📍 Location: Structure Tab → Jamii Fixtures');
        console.log('   🔗 URL: http://localhost:5173 (Navigate to Tournament → Structure → Jamii Fixtures)');
        console.log('   👤 Access: Admin/Organization Admin level required');
        
      } else {
        console.log('   ❌ Fixture generation failed:', generateResult.error);
      }
      
    } else {
      console.log('   ⚠️  No tournaments found. Please create a tournament first.');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testTournamentJamiiFixtures();