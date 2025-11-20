// Test file for Jamii Fixtures system
import fetch from 'node-fetch';

const API_BASE = 'http://127.0.0.1:5000';

async function testJamiiFixtures() {
  console.log('🧪 Testing Jamii Fixtures System\n');
  
  try {
    // 1. Get teams data
    console.log('1. Fetching teams data...');
    const teamsResponse = await fetch(`${API_BASE}/api/teams/all`);
    const teamsResult = await teamsResponse.json();
    const teams = teamsResult.data || [];
    
    console.log(`   ✅ Found ${teams.length} teams`);
    teams.slice(0, 3).forEach(team => {
      console.log(`      - ${team.name} (${team.county || 'Unknown County'})`);
    });
    
    // 2. Get venues data
    console.log('\n2. Fetching venues data...');
    const venuesResponse = await fetch(`${API_BASE}/api/fixtures/venues`);
    const venuesResult = await venuesResponse.json();
    const venues = venuesResult.venues || [];
    
    console.log(`   ✅ Found ${venues.length} venues`);
    venues.forEach(venue => {
      console.log(`      - ${venue.name} in ${venue.county} (${venue.pitchCount} pitches)`);
    });
    
    // 3. Test fixture generation with realistic config
    console.log('\n3. Testing fixture generation...');
    
    // Use first 8 teams for a manageable test
    const testTeams = teams.slice(0, 8).map(team => ({
      id: team.id,
      name: team.name,
      county: team.county || 'Unknown',
      constituency: team.constituency || 'Unknown'
    }));
    
    const config = {
      format: 'group_knockout',
      venues: venues,
      timeSlots: [
        { id: '1', time: '09:00', label: '9:00 AM' },
        { id: '2', time: '11:30', label: '11:30 AM' },
        { id: '3', time: '14:00', label: '2:00 PM' }
      ],
      startDate: '2024-01-15',
      endDate: '2024-01-28',
      groupingStrategy: 'geographical',
      matchDuration: 80,
      bufferTime: 20,
      restPeriod: 4,
      groupCount: 2,
      teamsPerGroup: 4
    };
    
    const generateResponse = await fetch(`${API_BASE}/api/fixtures/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        teams: testTeams,
        config: config,
        tournamentId: 'test-tournament'
      })
    });
    
    const generateResult = await generateResponse.json();
    
    if (generateResult.success) {
      console.log(`   ✅ Generated ${generateResult.fixtures.length} fixtures`);
      console.log(`   ⚠️  Found ${generateResult.conflicts.length} conflicts`);
      console.log(`   🏆 Created ${generateResult.groups.length} groups`);
      
      // Show sample fixtures
      console.log('\n   Sample fixtures:');
      generateResult.fixtures.slice(0, 3).forEach((fixture, i) => {
        const kickoffTime = fixture.kickoff ? new Date(fixture.kickoff).toLocaleString() : 'TBD';
        const venue = fixture.venue ? fixture.venue.name : 'TBD';
        console.log(`      ${i+1}. ${fixture.homeTeam.name} vs ${fixture.awayTeam.name}`);
        console.log(`         📅 ${kickoffTime} 📍 ${venue}`);
      });
      
      // Show groups
      if (generateResult.groups.length > 0) {
        console.log('\n   Groups formed:');
        generateResult.groups.forEach(group => {
          console.log(`      ${group.name}: ${group.teams.map(t => t.name).join(', ')}`);
        });
      }
      
      // Show conflicts if any
      if (generateResult.conflicts.length > 0) {
        console.log('\n   ⚠️  Conflicts detected:');
        generateResult.conflicts.slice(0, 3).forEach(conflict => {
          console.log(`      - ${conflict.type}: ${conflict.message}`);
        });
      }
      
      // 4. Test fixture publication
      console.log('\n4. Testing fixture publication...');
      
      const publishResponse = await fetch(`${API_BASE}/api/fixtures/publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fixtures: generateResult.fixtures,
          config: config,
          channels: ['website', 'pdf', 'sms', 'teams']
        })
      });
      
      const publishResult = await publishResponse.json();
      
      if (publishResult.success) {
        console.log('   ✅ Publication successful');
        console.log(`      📱 SMS messages sent: ${publishResult.publicationResults.sms.messagesSent}`);
        console.log(`      👥 Teams notified: ${publishResult.publicationResults.teams.teamsNotified}`);
        console.log(`      📄 PDF available: ${publishResult.publicationResults.pdf.success ? 'Yes' : 'No'}`);
        console.log(`      🌐 Website updated: ${publishResult.publicationResults.website.success ? 'Yes' : 'No'}`);
      } else {
        console.log('   ❌ Publication failed:', publishResult.error);
      }
      
    } else {
      console.log('   ❌ Fixture generation failed:', generateResult.error);
    }
    
    console.log('\n🎉 Jamii Fixtures system test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testJamiiFixtures();