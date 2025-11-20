// Quick test to verify frontend is calling the right API endpoint
console.log('🧪 Testing Frontend API Call');

// Simulate the API call the frontend should make
const apiRequest = async (method, url) => {
  const backendUrl = `http://localhost:5000${url}`;
  const res = await fetch(backendUrl, {
    method,
    headers: {},
    credentials: "include",
  });
  return await res.json();
};

// Test with GOAL CUP tournament (the one with fixtures)
const goalCupId = 'c9414a40-7cf7-492f-8536-0284eb243e4a';

try {
  console.log('📞 Calling API endpoint...');
  const result = await apiRequest('GET', `/api/tournaments/${goalCupId}/matches`);
  
  console.log('✅ API Response received:');
  console.log('- Success:', result.success);
  console.log('- Matches count:', result.data?.length || 0);
  
  if (result.data && result.data.length > 0) {
    console.log('📋 Sample matches:');
    result.data.slice(0, 3).forEach((match, index) => {
      console.log(`  ${index + 1}. ${match.home_team?.name} vs ${match.away_team?.name}`);
      console.log(`     Time: ${match.kickoff}, Venue: ${match.venue}`);
    });
  }
} catch (error) {
  console.error('❌ API Error:', error);
}