// Test script to verify player cards data integration
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

console.log('🎫 Testing Player Cards Data Integration');
console.log('=' .repeat(50));

try {
  // Fetch real players from database
  const { data: players, error } = await supabase
    .from('player_registry')
    .select('*')
    .limit(5);
  
  if (error) throw error;

  console.log(`✅ Found ${players.length} real players in database`);
  
  // Transform to card format (similar to what the component does)
  const playerCards = players.map((player, index) => {
    const upid = `UP${String(index + 1).padStart(6, '0')}`;
    const cardData = {
      upid: upid,
      playerName: `${player.first_name} ${player.last_name}`,
      nationality: player.nationality || 'Kenyan',
      registrationStatus: 'APPROVED', // Marked for card generation
      orgId: player.org_id,
      dob: player.dob,
      sex: player.sex,
      createdAt: player.created_at
    };
    
    console.log(`📋 Player ${index + 1}: ${cardData.playerName} (${upid})`);
    console.log(`   Status: ${cardData.registrationStatus} | DOB: ${cardData.dob} | Sex: ${cardData.sex}`);
    
    return cardData;
  });

  console.log('\n🎯 Card Generation Summary:');
  console.log(`   Total players available for cards: ${playerCards.length}`);
  console.log(`   All marked as APPROVED for demonstration`);
  console.log(`   Generated UPIDs: ${playerCards.map(p => p.upid).join(', ')}`);
  
  // Test API endpoint
  console.log('\n🔌 Testing API endpoint...');
  const response = await fetch('http://127.0.0.1:5000/api/players/all');
  const apiData = await response.json();
  
  if (apiData.success && apiData.data) {
    console.log(`✅ API endpoint working: ${apiData.data.length} players returned`);
    console.log(`   Sample API player: ${apiData.data[0]?.first_name || 'N/A'} ${apiData.data[0]?.last_name || 'N/A'}`);
  } else {
    console.log('❌ API endpoint not working properly');
  }

} catch (error) {
  console.error('❌ Error:', error.message);
}