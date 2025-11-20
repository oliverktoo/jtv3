/**
 * Check available data in database
 */

const BASE_URL = 'http://localhost:5000';

console.log('🔍 Checking available data...\n');

// Check tournaments
console.log('1️⃣ Checking tournaments...');
const tournamentsRes = await fetch(`${BASE_URL}/api/tournaments/all`);
const tournamentsData = await tournamentsRes.json();
console.log('Response structure:', JSON.stringify(tournamentsData, null, 2).substring(0, 500));

const tournaments = tournamentsData.data || tournamentsData;
console.log(`Found ${Array.isArray(tournaments) ? tournaments.length : 0} tournaments\n`);

if (Array.isArray(tournaments) && tournaments.length > 0) {
  const tournament = tournaments[0];
  console.log('First tournament:', {
    id: tournament.id,
    name: tournament.name,
    model: tournament.model
  });
  
  // Try to get matches
  console.log('\n2️⃣ Checking matches for tournament...');
  const matchesRes = await fetch(`${BASE_URL}/api/tournaments/${tournament.id}/matches`);
  const matchesData = await matchesRes.json();
  console.log('Matches response:', JSON.stringify(matchesData, null, 2).substring(0, 500));
  
  const matches = matchesData.data || matchesData;
  console.log(`\nFound ${Array.isArray(matches) ? matches.length : 0} matches`);
  
  if (Array.isArray(matches) && matches.length > 0) {
    console.log('\n✅ Have tournament and matches - ready to test!');
    console.log('First match:', {
      id: matches[0].id,
      home_team_id: matches[0].home_team_id,
      away_team_id: matches[0].away_team_id,
      status: matches[0].status
    });
  } else {
    console.log('\n⚠️  No matches found. Need to create fixtures first.');
    console.log('Run: node test-enterprise-fixtures.mjs');
  }
} else {
  console.log('\n⚠️  No tournaments found.');
  console.log('Response was:', tournamentsData);
}
