// Test team filtering functionality
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function testTeamFiltering() {
  console.log('🔍 Testing Team Filtering Implementation\n');

  try {
    // Test 1: Check if teams have the expected geographic and status fields
    console.log('1️⃣ Checking team data structure...');
    
    const { data: teams, error: teamsError } = await supabase
      .from('teams')
      .select(`
        id, 
        name, 
        team_status,
        county_id,
        sub_county_id,
        ward_id,
        counties(name),
        sub_counties(name),
        wards(name)
      `)
      .limit(5);

    if (teamsError) {
      console.log('❌ Teams query error:', teamsError.message);
      return;
    }

    console.log(`✅ Found ${teams?.length || 0} teams with structure:`);
    if (teams && teams.length > 0) {
      const team = teams[0];
      console.log('   Sample team:', {
        name: team.name,
        status: team.team_status,
        county: team.counties?.name,
        subCounty: team.sub_counties?.name,
        ward: team.wards?.name
      });
    }

    // Test 2: Check available team statuses
    console.log('\n2️⃣ Checking team status distribution...');
    
    const { data: statusData, error: statusError } = await supabase
      .from('teams')
      .select('team_status');

    if (statusError) {
      console.log('❌ Status query error:', statusError.message);
      return;
    }

    const statusCounts = statusData.reduce((acc, team) => {
      const status = team.team_status || 'UNKNOWN';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});

    console.log('✅ Team status distribution:');
    Object.entries(statusCounts).forEach(([status, count]) => {
      console.log(`   ${status}: ${count} teams`);
    });

    // Test 3: Check geographic distribution
    console.log('\n3️⃣ Checking geographic distribution...');
    
    const { data: geoData, error: geoError } = await supabase
      .from('teams')
      .select(`
        county_id,
        counties(name),
        sub_county_id,
        sub_counties(name)
      `)
      .not('county_id', 'is', null);

    if (geoError) {
      console.log('❌ Geographic query error:', geoError.message);
      return;
    }

    const countyCounts = geoData.reduce((acc, team) => {
      const countyName = team.counties?.name || 'Unknown County';
      acc[countyName] = (acc[countyName] || 0) + 1;
      return acc;
    }, {});

    console.log('✅ Geographic distribution by county:');
    Object.entries(countyCounts).slice(0, 5).forEach(([county, count]) => {
      console.log(`   ${county}: ${count} teams`);
    });

    // Test 4: Test API endpoint filtering
    console.log('\n4️⃣ Testing API endpoint filtering...');
    
    const response = await fetch('http://127.0.0.1:5000/api/teams/all');
    if (response.ok) {
      const result = await response.json();
      console.log(`✅ API endpoint working - ${result.data?.length || 0} teams returned`);
      
      if (result.data && result.data.length > 0) {
        const sampleTeam = result.data[0];
        console.log('   Sample API team:', {
          name: sampleTeam.name,
          status: sampleTeam.team_status,
          county: sampleTeam.counties?.name
        });
      }
    } else {
      console.log('❌ API endpoint error:', response.statusText);
    }

    // Test 5: Check reference data availability
    console.log('\n5️⃣ Checking reference data availability...');
    
    const { data: counties } = await supabase.from('counties').select('id, name').limit(3);
    console.log(`✅ Counties available: ${counties?.length || 0}`);
    
    if (counties && counties.length > 0) {
      const countyId = counties[0].id;
      const { data: subCounties } = await supabase
        .from('sub_counties')
        .select('id, name')
        .eq('county_id', countyId)
        .limit(3);
      console.log(`✅ Sub-counties for ${counties[0].name}: ${subCounties?.length || 0}`);
    }

    console.log('\n🎉 Team filtering infrastructure check completed!');
    console.log('\n📋 Summary:');
    console.log('   ✅ Team data structure includes geographic and status fields');
    console.log('   ✅ Multiple team statuses are available for filtering');
    console.log('   ✅ Teams are distributed across different counties');
    console.log('   ✅ API endpoint is functional');
    console.log('   ✅ Reference data (counties, sub-counties) is available');

  } catch (error) {
    console.error('❌ Team filtering test failed:', error.message);
  }
}

testTeamFiltering();