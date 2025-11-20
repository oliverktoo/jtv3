import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://jmgxwmstrlzpjoyymkev.supabase.co';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpteHd3bXN0cmx6cGpveXlta2V2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY2MTI0NzksImV4cCI6MjA1MjE4ODQ3OX0.UBl5DZTFRpTGgwjlB0EQdJtHc4IMSe_C3Vsn7Kz3du0';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testTeamFiltering() {
  console.log('🧪 Testing team filtering functionality...\n');

  try {
    // 1. Test basic team query
    console.log('1️⃣ Testing basic teams query...');
    const { data: teams, error } = await supabase
      .from('teams')
      .select(`
        *,
        county:counties(name),
        sub_county:sub_counties(name),
        ward:wards(name),
        organization:organizations(name)
      `)
      .limit(5);

    if (error) {
      console.error('❌ Teams query error:', error);
      return;
    }

    console.log(`✅ Found ${teams.length} teams`);
    if (teams.length > 0) {
      console.log('Sample team structure:');
      console.log(JSON.stringify(teams[0], null, 2));
    }

    // 2. Test filtering by registration status
    console.log('\n2️⃣ Testing registration status filtering...');
    const { data: activeTeams } = await supabase
      .from('teams')
      .select('id, name, registration_status')
      .eq('registration_status', 'ACTIVE')
      .limit(3);

    console.log(`✅ Active teams: ${activeTeams?.length || 0}`);
    activeTeams?.forEach(team => {
      console.log(`  - ${team.name}: ${team.registration_status}`);
    });

    // 3. Test geographic filtering
    console.log('\n3️⃣ Testing geographic filtering...');
    const { data: countyTeams } = await supabase
      .from('teams')
      .select(`
        id, name, 
        county_id, sub_county_id, ward_id,
        county:counties(name)
      `)
      .not('county_id', 'is', null)
      .limit(3);

    console.log(`✅ Teams with county data: ${countyTeams?.length || 0}`);
    countyTeams?.forEach(team => {
      console.log(`  - ${team.name}: County ${team.county?.name} (ID: ${team.county_id})`);
    });

    // 4. Test combined filtering (active teams in specific county)
    console.log('\n4️⃣ Testing combined filtering...');
    if (countyTeams && countyTeams.length > 0) {
      const firstCountyId = countyTeams[0].county_id;
      const { data: filteredTeams } = await supabase
        .from('teams')
        .select(`
          id, name, registration_status,
          county:counties(name)
        `)
        .eq('registration_status', 'ACTIVE')
        .eq('county_id', firstCountyId)
        .limit(3);

      console.log(`✅ Active teams in county ${countyTeams[0].county?.name}: ${filteredTeams?.length || 0}`);
      filteredTeams?.forEach(team => {
        console.log(`  - ${team.name}: ${team.registration_status} in ${team.county?.name}`);
      });
    }

    // 5. Test organization filtering
    console.log('\n5️⃣ Testing organization filtering...');
    const { data: affiliatedTeams } = await supabase
      .from('teams')
      .select(`
        id, name, org_id,
        organization:organizations(name)
      `)
      .not('org_id', 'is', null)
      .limit(3);

    console.log(`✅ Affiliated teams: ${affiliatedTeams?.length || 0}`);
    affiliatedTeams?.forEach(team => {
      console.log(`  - ${team.name}: ${team.organization?.name || 'Unknown Org'}`);
    });

    const { data: independentTeams } = await supabase
      .from('teams')
      .select('id, name, org_id')
      .is('org_id', null)
      .limit(3);

    console.log(`✅ Independent teams: ${independentTeams?.length || 0}`);
    independentTeams?.forEach(team => {
      console.log(`  - ${team.name}: Independent`);
    });

    console.log('\n🎉 Team filtering tests completed successfully!');

  } catch (error) {
    console.error('❌ Test error:', error);
  }
}

testTeamFiltering();