/**
 * Debug Auto-Increment with Detailed Logging
 */

const BASE_URL = 'http://localhost:5000';
const TOURNAMENT_ID = 'c9414a40-7cf7-492f-8536-0284eb243e4a';

console.log('🔍 Debugging Auto-Increment\n');

// Get matches
const matchesRes = await fetch(`${BASE_URL}/api/tournaments/${TOURNAMENT_ID}/matches`);
const matchesData = await matchesRes.json();
const matches = matchesData.data || matchesData;

// Use match 2 (index 2) to get fresh data
const match = matches[2] || matches[1] || matches[0];
console.log(`Match ID: ${match.id}`);
console.log(`Home Team: ${match.home_team_id}`);
console.log(`Away Team: ${match.away_team_id}\n`);

// Get initial stats
const initialRes = await fetch(`${BASE_URL}/api/matches/${match.id}/statistics`);
const initialData = await initialRes.json();
const initial = initialData.data || initialData;
console.log('Initial Stats:', {
  home_yellow: initial.home_yellow_cards,
  away_yellow: initial.away_yellow_cards,
  home_red: initial.home_red_cards,
  away_red: initial.away_red_cards
});

// Add yellow card for home team
console.log('\n➕ Adding YELLOW CARD for home team...');
const eventRes = await fetch(`${BASE_URL}/api/matches/${match.id}/events`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    event_type: 'YELLOW_CARD',
    minute: 55,
    team_id: match.home_team_id, // Explicitly home team
    description: 'Test yellow card'
  })
});

const eventResult = await eventRes.json();
console.log('Event Response:', eventResult);

// Wait a moment for async update
await new Promise(resolve => setTimeout(resolve, 500));

// Check updated stats
console.log('\n📊 Checking updated stats...');
const afterRes = await fetch(`${BASE_URL}/api/matches/${match.id}/statistics`);
const afterData = await afterRes.json();
const after = afterData.data || afterData;

console.log('After Stats:', {
  home_yellow: after.home_yellow_cards,
  away_yellow: after.away_yellow_cards,
  home_red: after.home_red_cards,
  away_red: after.away_red_cards
});

const incremented = (after.home_yellow_cards || 0) > (initial.home_yellow_cards || 0);
console.log(`\n${incremented ? '✅ SUCCESS' : '❌ FAILED'}: Home yellow cards ${initial.home_yellow_cards || 0} → ${after.home_yellow_cards || 0}`);

if (!incremented) {
  console.log('\n🐛 Troubleshooting:');
  console.log('1. Check server console for errors');
  console.log('2. Verify team_id matches home_team_id');
  console.log('3. Check if updateMatchStatisticsFromEvent was called');
  console.log('4. Verify database has match_statistics record');
}
