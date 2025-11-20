// Test script to verify RLS fix
// Run this after applying the SQL commands
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

console.log('🔍 TESTING RLS FIX...');

async function testRLSFix() {
  // Test 1: Count all tournaments
  console.log('\n1️⃣ COUNTING ALL TOURNAMENTS:');
  const { data: allTournaments, error: countError } = await supabase
    .from('tournaments')
    .select('id');

  if (countError) {
    console.log('❌ Error:', countError.message);
  } else {
    console.log(`✅ Total tournaments accessible: ${allTournaments.length}`);
    console.log(allTournaments.length === 25 ? '🎉 SUCCESS! All 25 tournaments visible!' : '⚠️ Still missing some tournaments');
  }

  // Test 2: Check System organization tournaments
  console.log('\n2️⃣ CHECKING SYSTEM ORGANIZATION TOURNAMENTS:');
  const { data: systemTournaments, error: systemError } = await supabase
    .from('tournaments')
    .select('id, name, status')
    .eq('org_id', '00000000-0000-0000-0000-000000000000');

  if (systemError) {
    console.log('❌ Error:', systemError.message);
  } else {
    console.log(`✅ System tournaments accessible: ${systemTournaments.length}`);
    if (systemTournaments.length > 0) {
      console.log('📋 System tournaments:');
      systemTournaments.forEach(t => {
        console.log(`   - ${t.name} (${t.status})`);
      });
    }
  }

  // Test 3: Check specific missing tournaments
  console.log('\n3️⃣ CHECKING SPECIFIC TOURNAMENTS:');
  const missingTournaments = ['BOBO TOURNAMENT', 'NENYO', 'KASOZI TOURNAMENT', 'MBOKA CUP'];
  
  for (const tournamentName of missingTournaments) {
    const { data: tournament, error: tournamentError } = await supabase
      .from('tournaments')
      .select('id, name, org_id, status')
      .eq('name', tournamentName)
      .single();

    if (tournamentError) {
      console.log(`❌ ${tournamentName}: ${tournamentError.message}`);
    } else {
      console.log(`✅ ${tournamentName}: Found (${tournament.status})`);
    }
  }

  // Test 4: Group by organization
  console.log('\n4️⃣ TOURNAMENTS BY ORGANIZATION:');
  const { data: byOrg, error: orgError } = await supabase
    .from('tournaments')
    .select('org_id, organizations(name)');

  if (orgError) {
    console.log('❌ Error:', orgError.message);
  } else {
    const orgGroups = {};
    byOrg.forEach(t => {
      const orgId = t.org_id;
      const orgName = t.organizations?.name || 'System (Independent)';
      if (!orgGroups[orgId]) orgGroups[orgId] = { name: orgName, count: 0 };
      orgGroups[orgId].count++;
    });

    Object.entries(orgGroups).forEach(([orgId, info]) => {
      const isSystem = orgId === '00000000-0000-0000-0000-000000000000';
      console.log(`   ${isSystem ? '🔥' : '🏢'} ${info.name}: ${info.count} tournaments`);
    });
  }

  console.log('\n🎯 TEST COMPLETE!');
}

testRLSFix().catch(console.error);