// Quick test to create sample fixtures for JAMBO CUP tournament
import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5000';
const TOURNAMENT_ID = 'ecefb89b-e864-46ee-86cb-bc4cc34c0a36'; // JAMBO CUP
const ORG_ID = '550e8400-e29b-41d4-a716-446655440001'; // Jamii Sports Federation

async function createTestData() {
  try {
    console.log('Creating test teams for JAMBO CUP...');
    
    // Create teams
    const teamA = await fetch(`${BASE_URL}/api/teams`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test Team Alpha',
        org_id: ORG_ID,
        tournament_id: TOURNAMENT_ID
      })
    });
    
    const teamB = await fetch(`${BASE_URL}/api/teams`, {
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test Team Beta',
        org_id: ORG_ID,
        tournament_id: TOURNAMENT_ID
      })
    });
    
    const teamAData = await teamA.json();
    const teamBData = await teamB.json();
    
    console.log('Teams created:', { teamA: teamAData, teamB: teamBData });
    
    if (teamAData.data && teamBData.data) {
      // Create a test match
      const match = await fetch(`${BASE_URL}/api/tournaments/${TOURNAMENT_ID}/matches`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          homeTeamId: teamAData.data.id,
          awayTeamId: teamBData.data.id,
          kickoff: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
          venue: 'Test Stadium',
          status: 'SCHEDULED'
        })
      });
      
      const matchData = await match.json();
      console.log('Test match created:', matchData);
    }
    
  } catch (error) {
    console.error('Error creating test data:', error);
  }
}

createTestData();