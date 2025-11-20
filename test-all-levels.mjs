// Comprehensive test for all administrative tournament levels
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const SYSTEM_ORG_ID = '00000000-0000-0000-0000-000000000000';

async function testAllTournamentLevels() {
  console.log('🏆 Comprehensive Tournament Administrative Level Testing\n');

  try {
    // Get real data
    const { data: counties } = await supabase.from('counties').select('id, name').limit(1);
    const { data: subCounties } = await supabase.from('sub_counties').select('id, name').eq('county_id', counties[0].id).limit(1);
    const { data: wards } = await supabase.from('wards').select('id, name').eq('sub_county_id', subCounties?.[0]?.id).limit(1);

    const countyId = counties?.[0]?.id;
    const subCountyId = subCounties?.[0]?.id;
    const wardId = wards?.[0]?.id;

    console.log('📍 Test Data:');
    console.log(`  County: ${counties?.[0]?.name} (${countyId})`);
    console.log(`  Sub-County: ${subCounties?.[0]?.name} (${subCountyId})`);
    console.log(`  Ward: ${wards?.[0]?.name} (${wardId})\n`);

    const tests = [
      {
        name: '🏛️ ADMINISTRATIVE_NATIONAL',
        model: 'ADMINISTRATIVE_NATIONAL',
        requiredFields: {},
        shouldSucceed: true,
        description: 'National tournaments don\'t require specific areas'
      },
      {
        name: '🏙️ ADMINISTRATIVE_COUNTY',
        model: 'ADMINISTRATIVE_COUNTY',
        requiredFields: { county_id: countyId },
        shouldSucceed: true,
        description: 'County tournaments require county'
      },
      {
        name: '🏘️ ADMINISTRATIVE_SUB_COUNTY',
        model: 'ADMINISTRATIVE_SUB_COUNTY',
        requiredFields: { county_id: countyId, sub_county_id: subCountyId },
        shouldSucceed: true,
        description: 'Sub-county tournaments require county and sub-county'
      },
      {
        name: '🏠 ADMINISTRATIVE_WARD',
        model: 'ADMINISTRATIVE_WARD',
        requiredFields: { county_id: countyId, sub_county_id: subCountyId, ward_id: wardId },
        shouldSucceed: wardId ? true : false,
        description: 'Ward tournaments require county, sub-county, and ward'
      },
      {
        name: '🔗 INTER_COUNTY',
        model: 'INTER_COUNTY',
        requiredFields: { county_id: countyId },
        shouldSucceed: true,
        description: 'Inter-county tournaments require at least one county'
      },
      {
        name: '🆓 INDEPENDENT',
        model: 'INDEPENDENT',
        requiredFields: {},
        shouldSucceed: true,
        description: 'Independent tournaments don\'t require areas'
      }
    ];

    let passedTests = 0;
    let totalTests = tests.length;

    for (let i = 0; i < tests.length; i++) {
      const test = tests[i];
      
      if (!test.shouldSucceed && test.model === 'ADMINISTRATIVE_WARD' && !wardId) {
        console.log(`⚠️ SKIPPED: ${test.name} - No ward data available`);
        totalTests--;
        continue;
      }

      console.log(`${i + 1}️⃣ Testing ${test.name}...`);
      console.log(`   ${test.description}`);

      const tournamentData = {
        org_id: SYSTEM_ORG_ID,
        sport_id: '650e8400-e29b-41d4-a716-446655440001',
        name: `Test ${test.model} Tournament`,
        slug: `test-${test.model.toLowerCase()}`,
        season: '2024',
        tournament_model: test.model,
        status: 'DRAFT',
        federation_type: 'FKF',
        start_date: '2024-12-01',
        end_date: '2024-12-31',
        is_published: false,
        ...test.requiredFields
      };

      try {
        const response = await fetch('http://127.0.0.1:5000/api/tournaments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(tournamentData),
        });

        const result = await response.json();

        if (response.ok) {
          console.log(`   ✅ SUCCESS: Tournament created - ${result.data.id}`);
          passedTests++;
          
          // Clean up
          await fetch(`http://127.0.0.1:5000/api/tournaments/${result.data.id}`, {
            method: 'DELETE'
          });
        } else {
          if (test.shouldSucceed) {
            console.log(`   ❌ FAILED: Expected success but got error - ${result.error}`);
          } else {
            console.log(`   ✅ SUCCESS: Correctly rejected - ${result.error}`);
            passedTests++;
          }
        }
      } catch (error) {
        console.log(`   ❌ ERROR: ${error.message}`);
      }

      console.log();
    }

    console.log(`🎯 Test Results: ${passedTests}/${totalTests} tests passed`);
    
    if (passedTests === totalTests) {
      console.log('🎉 All administrative area requirements working correctly!');
    } else {
      console.log('⚠️ Some tests failed - check implementation');
    }

  } catch (error) {
    console.error('❌ Comprehensive test failed:', error.message);
    process.exit(1);
  }
}

// Wait for server then test
setTimeout(testAllTournamentLevels, 2000);