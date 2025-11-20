// Test administrative area requirements for tournaments
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// System organization for independent tournaments
const SYSTEM_ORG_ID = '00000000-0000-0000-0000-000000000000';

async function testAdministrativeAreaRequirements() {
  console.log('🏛️ Testing Administrative Area Requirements for Tournaments\n');

  try {
    // Test data
    const baseTournament = {
      org_id: SYSTEM_ORG_ID,
      sport_id: '650e8400-e29b-41d4-a716-446655440001', // Real Football ID
      name: 'Admin Area Test Tournament',
      slug: 'admin-area-test',
      season: '2024',
      status: 'DRAFT', // Use correct enum value
      federation_type: 'FKF',
      start_date: '2024-12-01',
      end_date: '2024-12-31',
      is_published: false
    };

    console.log('1️⃣ Testing ADMINISTRATIVE_WARD tournament without areas (should fail)...');
    try {
      const wardTournamentIncomplete = {
        ...baseTournament,
        tournament_model: 'ADMINISTRATIVE_WARD',
        name: 'Incomplete Ward Tournament'
      };
      
      const response1 = await fetch('http://127.0.0.1:5000/api/tournaments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(wardTournamentIncomplete),
      });
      
      const result1 = await response1.json();
      
      if (response1.ok) {
        console.log('❌ FAILED: Ward tournament was created without required areas');
      } else {
        console.log('✅ PASSED: Ward tournament correctly rejected -', result1.error);
      }
    } catch (error) {
      console.log('❌ ERROR in ward test:', error.message);
    }

    console.log('\n2️⃣ Testing ADMINISTRATIVE_COUNTY tournament without county (should fail)...');
    try {
      const countyTournamentIncomplete = {
        ...baseTournament,
        tournament_model: 'ADMINISTRATIVE_COUNTY',
        name: 'Incomplete County Tournament'
      };
      
      const response2 = await fetch('http://127.0.0.1:5000/api/tournaments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(countyTournamentIncomplete),
      });
      
      const result2 = await response2.json();
      
      if (response2.ok) {
        console.log('❌ FAILED: County tournament was created without required county');
      } else {
        console.log('✅ PASSED: County tournament correctly rejected -', result2.error);
      }
    } catch (error) {
      console.log('❌ ERROR in county test:', error.message);
    }

    console.log('\n3️⃣ Testing INDEPENDENT tournament (should succeed without areas)...');
    try {
      const independentTournament = {
        ...baseTournament,
        tournament_model: 'INDEPENDENT',
        name: 'Independent Tournament'
      };
      
      const response3 = await fetch('http://127.0.0.1:5000/api/tournaments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(independentTournament),
      });
      
      const result3 = await response3.json();
      
      if (response3.ok) {
        console.log('✅ PASSED: Independent tournament created without areas -', result3.data.id);
        
        // Clean up - delete the test tournament
        await fetch(`http://127.0.0.1:5000/api/tournaments/${result3.data.id}`, {
          method: 'DELETE'
        });
        console.log('🧹 Cleaned up test tournament');
      } else {
        console.log('❌ FAILED: Independent tournament was rejected -', result3.error);
      }
    } catch (error) {
      console.log('❌ ERROR in independent test:', error.message);
    }

    console.log('\n4️⃣ Testing ADMINISTRATIVE_COUNTY with county (should succeed)...');
    try {
      // Get a real county ID
      const { data: counties } = await supabase
        .from('counties')
        .select('id, name')
        .limit(1);

      if (counties && counties.length > 0) {
        const county = counties[0];
        
        const countyTournamentComplete = {
          ...baseTournament,
          tournament_model: 'ADMINISTRATIVE_COUNTY',
          name: 'Complete County Tournament',
          county_id: county.id
        };
        
        const response4 = await fetch('http://127.0.0.1:5000/api/tournaments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(countyTournamentComplete),
        });
        
        const result4 = await response4.json();
        
        if (response4.ok) {
          console.log(`✅ PASSED: County tournament created with ${county.name} county -`, result4.data.id);
          
          // Clean up - delete the test tournament
          await fetch(`http://127.0.0.1:5000/api/tournaments/${result4.data.id}`, {
            method: 'DELETE'
          });
          console.log('🧹 Cleaned up test tournament');
        } else {
          console.log('❌ FAILED: County tournament with county was rejected -', result4.error);
        }
      } else {
        console.log('⚠️ SKIPPED: No counties found in database to test with');
      }
    } catch (error) {
      console.log('❌ ERROR in complete county test:', error.message);
    }

    console.log('\n🎉 Administrative area validation tests completed!');
    
  } catch (error) {
    console.error('❌ Administrative area test failed:', error.message);
    process.exit(1);
  }
}

// Wait for server to start then test
setTimeout(testAdministrativeAreaRequirements, 3000);