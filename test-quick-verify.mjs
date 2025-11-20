/**
 * Quick test to verify match_events table exists and works
 * Run AFTER applying APPLY_THIS_MIGRATION.sql
 */

const BASE_URL = 'http://localhost:5000';

console.log('🔍 Testing match_events table...\n');

async function testMatchEventsTable() {
  try {
    // Test 1: Try to get a match
    console.log('1️⃣  Getting test match...');
    const matchResponse = await fetch(`${BASE_URL}/api/matches?limit=1`);
    const matchResult = await matchResponse.json();
    
    if (!matchResult.success || !matchResult.data || matchResult.data.length === 0) {
      console.log('❌ No matches found - create a tournament with matches first');
      process.exit(1);
    }
    
    const testMatchId = matchResult.data[0].id;
    console.log(`✅ Using match: ${testMatchId}\n`);
    
    // Test 2: Try to add an event
    console.log('2️⃣  Testing POST /api/matches/:id/events...');
    const eventResponse = await fetch(`${BASE_URL}/api/matches/${testMatchId}/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event_type: 'GOAL',
        minute: 10,
        team_id: matchResult.data[0].home_team_id,
        description: 'Test goal event'
      })
    });
    
    const eventResult = await eventResponse.json();
    
    if (!eventResult.success) {
      console.log('❌ Failed to create event:', eventResult.error);
      console.log('\n⚠️  If error is "column event_type does not exist":');
      console.log('   → You need to apply the migration in Supabase SQL Editor');
      console.log('   → Open: APPLY_THIS_MIGRATION.sql');
      console.log('   → Copy all contents');
      console.log('   → Paste in Supabase Dashboard → SQL Editor → Run\n');
      process.exit(1);
    }
    
    console.log('✅ Event created successfully!');
    console.log(`   Event ID: ${eventResult.data.id}`);
    console.log(`   Type: ${eventResult.data.event_type}`);
    console.log(`   Minute: ${eventResult.data.minute}'\n`);
    
    // Test 3: Try to get events
    console.log('3️⃣  Testing GET /api/matches/:id/events...');
    const getEventsResponse = await fetch(`${BASE_URL}/api/matches/${testMatchId}/events`);
    const getEventsResult = await getEventsResponse.json();
    
    if (!getEventsResult.success) {
      console.log('❌ Failed to get events:', getEventsResult.error);
      process.exit(1);
    }
    
    console.log(`✅ Retrieved ${getEventsResult.data.length} events\n`);
    
    // Test 4: Try statistics
    console.log('4️⃣  Testing GET /api/matches/:id/statistics...');
    const statsResponse = await fetch(`${BASE_URL}/api/matches/${testMatchId}/statistics`);
    const statsResult = await statsResponse.json();
    
    if (!statsResult.success) {
      console.log('❌ Failed to get statistics:', statsResult.error);
      process.exit(1);
    }
    
    console.log('✅ Statistics retrieved successfully!\n');
    
    // Success!
    console.log('🎉 ALL TESTS PASSED! 🎉\n');
    console.log('✅ match_events table is working');
    console.log('✅ match_statistics table is working');
    console.log('✅ All APIs are functional\n');
    console.log('📌 Next: Run comprehensive tests with:');
    console.log('   node test-live-match-features.mjs\n');
    
  } catch (error) {
    console.log('❌ Test failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('   1. Is the server running? (npm run dev:server:working)');
    console.log('   2. Did you apply the migration in Supabase SQL Editor?');
    console.log('   3. Check server logs for errors\n');
    process.exit(1);
  }
}

testMatchEventsTable();
