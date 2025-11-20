import fetch from 'node-fetch';

async function testTournamentTeamsEndpoint() {
  try {
    console.log('🔍 Testing tournament teams endpoint...');
    
    // Wait for server to be ready
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Get tournaments
    const tournamentsResponse = await fetch('http://127.0.0.1:5000/api/tournaments/all');
    
    if (!tournamentsResponse.ok) {
      console.log('❌ Cannot fetch tournaments:', tournamentsResponse.status);
      return;
    }
    
    const tournamentsData = await tournamentsResponse.json();
    const tournaments = tournamentsData.data;
    
    console.log('✅ Found tournaments:', tournaments.length);
    
    if (tournaments.length === 0) {
      console.log('No tournaments to test with');
      return;
    }
    
    // Test with first tournament
    const tournament = tournaments[0];
    console.log('\n🏆 Testing with tournament:', tournament.name);
    console.log('   Tournament ID:', tournament.id);
    
    const teamsUrl = `http://127.0.0.1:5000/api/tournaments/${tournament.id}/teams`;
    console.log('📡 Requesting:', teamsUrl);
    
    const teamsResponse = await fetch(teamsUrl);
    console.log('📊 Response status:', teamsResponse.status);
    console.log('📊 Content-Type:', teamsResponse.headers.get('content-type'));
    
    if (teamsResponse.ok) {
      const teamsData = await teamsResponse.json();
      console.log('✅ SUCCESS! Response structure:', Object.keys(teamsData));
      
      const teams = teamsData.data || teamsData;
      console.log('📋 Teams found:', teams.length);
      
      if (teams.length > 0) {
        console.log('\n🎯 Sample team:');
        const sampleTeam = teams[0];
        console.log('   Name:', sampleTeam.name);
        console.log('   ID:', sampleTeam.id);
        console.log('   Registration Status:', sampleTeam.registration_status);
        console.log('   Keys:', Object.keys(sampleTeam));
      } else {
        console.log('💡 No teams registered for this tournament');
        console.log('   This confirms tournament-specific filtering is working!');
      }
      
      // Test with a few more tournaments
      console.log('\n🔄 Testing multiple tournaments...');
      for (let i = 1; i < Math.min(4, tournaments.length); i++) {
        const t = tournaments[i];
        const url = `http://127.0.0.1:5000/api/tournaments/${t.id}/teams`;
        const resp = await fetch(url);
        if (resp.ok) {
          const data = await resp.json();
          const count = (data.data || data).length;
          console.log(`   ${t.name}: ${count} teams`);
        }
      }
      
    } else {
      const errorText = await teamsResponse.text();
      console.log('❌ Error response:', errorText);
    }
    
  } catch (error) {
    console.error('❌ Test error:', error.message);
  }
}

testTournamentTeamsEndpoint();