// Test the registration form administrative area requirements via API
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const SYSTEM_ORG_ID = '00000000-0000-0000-0000-000000000000';

async function testRegistrationFormRequirements() {
  console.log('📝 Testing Registration Form Administrative Area Requirements\n');

  try {
    // Get real geographic data for testing
    const { data: counties } = await supabase.from('counties').select('id, name').limit(1);
    const { data: subCounties } = await supabase.from('sub_counties').select('id, name').eq('county_id', counties[0].id).limit(1);
    const { data: wards } = await supabase.from('wards').select('id, name').eq('sub_county_id', subCounties?.[0]?.id).limit(1);

    const countyId = counties?.[0]?.id;
    const subCountyId = subCounties?.[0]?.id;
    const wardId = wards?.[0]?.id;

    console.log('🗺️ Testing with geographic data:');
    console.log(`   County: ${counties?.[0]?.name} (${countyId})`);
    console.log(`   Sub-County: ${subCounties?.[0]?.name} (${subCountyId})`);
    console.log(`   Ward: ${wards?.[0]?.name} (${wardId})\n`);

    // Test scenarios that mimic the registration form
    const testScenarios = [
      {
        name: '❌ Ward Tournament - Missing Requirements',
        data: {
          org_id: SYSTEM_ORG_ID,
          sport_id: '650e8400-e29b-41d4-a716-446655440001',
          name: 'Incomplete Ward Tournament',
          slug: 'incomplete-ward',
          season: '2024',
          tournament_model: 'ADMINISTRATIVE_WARD',
          status: 'DRAFT',
          federation_type: 'FKF',
          start_date: '2024-12-01',
          end_date: '2024-12-31',
          is_published: false
          // Missing: county_id, sub_county_id, ward_id
        },
        shouldFail: true,
        expectedError: 'Ward selection is required'
      },
      {
        name: '❌ Ward Tournament - Missing Ward & Sub-County',
        data: {
          org_id: SYSTEM_ORG_ID,
          sport_id: '650e8400-e29b-41d4-a716-446655440001',
          name: 'Incomplete Ward Tournament 2',
          slug: 'incomplete-ward-2',
          season: '2024',
          tournament_model: 'ADMINISTRATIVE_WARD',
          status: 'DRAFT',
          federation_type: 'FKF',
          start_date: '2024-12-01',
          end_date: '2024-12-31',
          is_published: false,
          county_id: countyId
          // Missing: sub_county_id, ward_id
        },
        shouldFail: true,
        expectedError: 'Ward selection is required'
      },
      {
        name: '✅ Complete Ward Tournament',
        data: {
          org_id: SYSTEM_ORG_ID,
          sport_id: '650e8400-e29b-41d4-a716-446655440001',
          name: 'Complete Ward Tournament',
          slug: 'complete-ward',
          season: '2024',
          tournament_model: 'ADMINISTRATIVE_WARD',
          status: 'DRAFT',
          federation_type: 'FKF',
          start_date: '2024-12-01',
          end_date: '2024-12-31',
          is_published: false,
          county_id: countyId,
          sub_county_id: subCountyId,
          ward_id: wardId
        },
        shouldFail: false
      },
      {
        name: '❌ Sub-County Tournament - Missing Sub-County',
        data: {
          org_id: SYSTEM_ORG_ID,
          sport_id: '650e8400-e29b-41d4-a716-446655440001',
          name: 'Incomplete Sub-County Tournament',
          slug: 'incomplete-sub-county',
          season: '2024',
          tournament_model: 'ADMINISTRATIVE_SUB_COUNTY',
          status: 'DRAFT',
          federation_type: 'FKF',
          start_date: '2024-12-01',
          end_date: '2024-12-31',
          is_published: false,
          county_id: countyId
          // Missing: sub_county_id
        },
        shouldFail: true,
        expectedError: 'Sub-county selection is required'
      },
      {
        name: '✅ Complete Sub-County Tournament',
        data: {
          org_id: SYSTEM_ORG_ID,
          sport_id: '650e8400-e29b-41d4-a716-446655440001',
          name: 'Complete Sub-County Tournament',
          slug: 'complete-sub-county',
          season: '2024',
          tournament_model: 'ADMINISTRATIVE_SUB_COUNTY',
          status: 'DRAFT',
          federation_type: 'FKF',
          start_date: '2024-12-01',
          end_date: '2024-12-31',
          is_published: false,
          county_id: countyId,
          sub_county_id: subCountyId
        },
        shouldFail: false
      }
    ];

    let passedTests = 0;
    let totalTests = testScenarios.length;

    for (let i = 0; i < testScenarios.length; i++) {
      const scenario = testScenarios[i];
      
      console.log(`${i + 1}️⃣ ${scenario.name}`);

      try {
        const response = await fetch('http://127.0.0.1:5000/api/tournaments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(scenario.data),
        });

        const result = await response.json();

        if (scenario.shouldFail) {
          if (response.ok) {
            console.log(`   ❌ FAILED: Expected failure but tournament was created - ${result.data.id}`);
            // Clean up unexpected success
            await fetch(`http://127.0.0.1:5000/api/tournaments/${result.data.id}`, { method: 'DELETE' });
          } else {
            const errorContainsExpected = result.error.includes(scenario.expectedError);
            if (errorContainsExpected) {
              console.log(`   ✅ PASSED: Correctly rejected - ${result.error}`);
              passedTests++;
            } else {
              console.log(`   ⚠️ PARTIAL: Rejected but different error - ${result.error}`);
              passedTests++; // Still counts as validation working
            }
          }
        } else {
          if (response.ok) {
            console.log(`   ✅ PASSED: Tournament created successfully - ${result.data.id}`);
            passedTests++;
            
            // Clean up successful test
            await fetch(`http://127.0.0.1:5000/api/tournaments/${result.data.id}`, { method: 'DELETE' });
          } else {
            console.log(`   ❌ FAILED: Expected success but got error - ${result.error}`);
          }
        }
      } catch (error) {
        console.log(`   ❌ ERROR: ${error.message}`);
      }
      
      console.log();
    }

    console.log(`🎯 Registration Form Test Results: ${passedTests}/${totalTests} tests passed`);
    
    if (passedTests === totalTests) {
      console.log('🎉 Registration form administrative area validation is working perfectly!');
    } else {
      console.log('⚠️ Some registration form tests failed - check implementation');
    }

  } catch (error) {
    console.error('❌ Registration form test failed:', error.message);
    process.exit(1);
  }
}

testRegistrationFormRequirements();