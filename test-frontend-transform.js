// Test frontend data transformation
import fetch from 'node-fetch';

async function testFrontendDataFlow() {
  try {
    console.log('🧪 Testing Frontend Data Transformation');
    
    // Simulate the API call
    const response = await fetch('http://localhost:5000/api/tournaments/c9414a40-7cf7-492f-8536-0284eb243e4a/matches');
    const result = await response.json();
    
    console.log('📡 API Response:');
    console.log('- Success:', result.success);
    console.log('- Matches count:', result.data?.length || 0);
    
    if (result.data && result.data.length > 0) {
      const matches = result.data;
      
      // Transform like the frontend does
      const transformed = matches.map(match => ({
        match: {
          id: match.id,
          homeScore: match.home_score,
          awayScore: match.away_score,
          kickoff: match.kickoff,
          venue: match.venue,
          status: match.status,
          roundId: match.round_id
        },
        homeTeam: {
          id: match.home_team?.id,
          name: match.home_team?.name
        },
        awayTeam: {
          id: match.away_team?.id,
          name: match.away_team?.name
        },
        round: {
          id: match.rounds?.id,
          name: match.rounds?.name,
          number: match.rounds?.number
        }
      }));
      
      console.log('🔄 Transformed data sample:');
      console.log(JSON.stringify(transformed[0], null, 2));
      
      // Transform to fixture format like the frontend does
      const fixtures = transformed.map((m) => ({
        id: m.match.id,
        homeTeam: m.homeTeam?.name || "TBD",
        awayTeam: m.awayTeam?.name || "TBD",
        homeScore: m.match.homeScore,
        awayScore: m.match.awayScore,
        kickoff: m.match.kickoff,
        venue: m.match.venue,
        status: m.match.status,
        round: m.round?.name || `Round ${m.round?.number || 1}`,
        stage: "League",
      }));
      
      console.log('🎯 Final fixtures for UI:');
      console.log('- Count:', fixtures.length);
      console.log('- Sample:', {
        homeTeam: fixtures[0].homeTeam,
        awayTeam: fixtures[0].awayTeam,
        kickoff: fixtures[0].kickoff,
        venue: fixtures[0].venue,
        round: fixtures[0].round
      });
      
      if (fixtures.length > 0) {
        console.log('✅ SUCCESS: Fixtures should display in UI!');
      }
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testFrontendDataFlow();