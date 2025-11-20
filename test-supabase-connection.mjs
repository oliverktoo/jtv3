// Test Supabase connection and basic functionality
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

console.log('🔧 Testing Jamii Tourney Supabase Connection');
console.log('📍 Supabase URL:', supabaseUrl);
console.log('🔑 Supabase Key (first 20 chars):', supabaseKey?.substring(0, 20) + '...');

const supabase = createClient(supabaseUrl, supabaseKey);

async function testSupabaseConnection() {
  try {
    console.log('\n🧪 Running Supabase Connection Tests...\n');

    // Test 1: Organizations
    console.log('1️⃣ Testing Organizations table...');
    const { data: orgs, error: orgsError } = await supabase
      .from('organizations')
      .select('id, name, slug')
      .limit(5);
    
    if (orgsError) throw orgsError;
    console.log(`   ✅ Found ${orgs?.length || 0} organizations`);
    if (orgs && orgs.length > 0) {
      console.log(`   📋 Sample: ${orgs[0].name} (${orgs[0].slug})`);
    }

    // Test 2: Sports
    console.log('\n2️⃣ Testing Sports table...');
    const { data: sports, error: sportsError } = await supabase
      .from('sports')
      .select('id, name, slug')
      .limit(5);
    
    if (sportsError) throw sportsError;
    console.log(`   ✅ Found ${sports?.length || 0} sports`);
    if (sports && sports.length > 0) {
      console.log(`   ⚽ Sample: ${sports[0].name} (${sports[0].slug})`);
    }

    // Test 3: Tournaments
    console.log('\n3️⃣ Testing Tournaments table...');
    const { data: tournaments, error: tournamentsError } = await supabase
      .from('tournaments')
      .select('id, name, tournament_model, status')
      .limit(5);
    
    if (tournamentsError) throw tournamentsError;
    console.log(`   ✅ Found ${tournaments?.length || 0} tournaments`);
    if (tournaments && tournaments.length > 0) {
      console.log(`   🏆 Sample: ${tournaments[0].name} (${tournaments[0].tournament_model})`);
    }

    // Test 4: Teams
    console.log('\n4️⃣ Testing Teams table...');
    const { data: teams, error: teamsError } = await supabase
      .from('teams')
      .select('id, name, code')
      .limit(5);
    
    if (teamsError) throw teamsError;
    console.log(`   ✅ Found ${teams?.length || 0} teams`);
    if (teams && teams.length > 0) {
      console.log(`   👥 Sample: ${teams[0].name} (${teams[0].code})`);
    }

    // Test 5: Counties (Geographic data)
    console.log('\n5️⃣ Testing Counties table...');
    const { data: counties, error: countiesError } = await supabase
      .from('counties')
      .select('id, name, code')
      .limit(3);
    
    if (countiesError) throw countiesError;
    console.log(`   ✅ Found ${counties?.length || 0} counties`);
    if (counties && counties.length > 0) {
      console.log(`   🗺️ Sample: ${counties[0].name} (${counties[0].code})`);
    }

    console.log('\n✅ All Supabase connection tests passed! 🎉');
    console.log('🚀 Your Jamii Tourney app is ready to use with Supabase!');
    
    return {
      success: true,
      stats: {
        organizations: orgs?.length || 0,
        sports: sports?.length || 0,
        tournaments: tournaments?.length || 0,
        teams: teams?.length || 0,
        counties: counties?.length || 0
      }
    };

  } catch (error) {
    console.error('\n❌ Supabase connection test failed:');
    console.error('   Error:', error.message);
    console.error('   Details:', error);
    
    console.log('\n🔧 Troubleshooting suggestions:');
    console.log('   1. Check your .env file has correct VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
    console.log('   2. Verify Supabase project is running');
    console.log('   3. Check if tables exist in Supabase dashboard');
    console.log('   4. Verify RLS policies allow anonymous access if needed');
    
    return { success: false, error: error.message };
  }
}

// Run the tests
testSupabaseConnection()
  .then(result => {
    if (result.success) {
      console.log('\n📊 Database Statistics:', result.stats);
    }
    process.exit(result.success ? 0 : 1);
  })
  .catch(error => {
    console.error('Unexpected error:', error);
    process.exit(1);
  });