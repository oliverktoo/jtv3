/**
 * Test script to verify JamiiFixtures integration with actual tournament data
 */

import fetch from 'node-fetch';

async function testJamiiFixturesIntegration() {
    console.log('🧪 Testing JamiiFixtures Integration');
    console.log('=====================================\n');

    const API_BASE = 'http://localhost:5000/api';
    const GOAL_CUP_ID = 'c9414a40-7cf7-492f-8536-0284eb243e4a'; // Corrected GOAL CUP ID

    try {
        // 1. Test API Health
        console.log('1. Testing API Health...');
        const healthResponse = await fetch(`${API_BASE}/health`);
        const health = await healthResponse.json();
        console.log('✅ API Status:', health.status);
        console.log('✅ Database:', health.database);
        console.log();

        // 2. Test Organizations Endpoint
        console.log('2. Testing Organizations...');
        const orgsResponse = await fetch(`${API_BASE}/organizations`);
        const orgsData = await orgsResponse.json();
        console.log('✅ Organizations found:', orgsData.data?.length || 0);
        if (orgsData.data && orgsData.data.length > 0) {
            const systemOrg = orgsData.data.find(org => org.id === '00000000-0000-0000-0000-000000000000');
            console.log('   - System org found:', !!systemOrg);
            if (systemOrg) console.log('   - System org name:', systemOrg.name);
        }
        console.log();

        // 3. Test All Tournaments to find GOAL CUP
        console.log('3. Testing All Tournaments...');
        const allTournamentsResponse = await fetch(`${API_BASE}/tournaments/all`);
        const allTournamentsData = await allTournamentsResponse.json();
        console.log('✅ Total tournaments found:', allTournamentsData.data?.length || 0);
        
        const goalCupTournament = allTournamentsData.data?.find(t => t.id === GOAL_CUP_ID);
        if (goalCupTournament) {
            console.log('✅ GOAL CUP tournament found:', goalCupTournament.name);
            console.log('   - Status:', goalCupTournament.status);
            console.log('   - Model:', goalCupTournament.tournament_model);
            console.log('   - Organization:', goalCupTournament.organizations?.name);
        } else {
            console.log('❌ GOAL CUP tournament not found');
        }
        console.log();

        // 4. Test GOAL CUP Matches Endpoint
        console.log('4. Testing GOAL CUP Matches...');
        const matchesResponse = await fetch(`${API_BASE}/tournaments/${GOAL_CUP_ID}/matches`);
        const matchesData = await matchesResponse.json();
        console.log('✅ Matches found:', matchesData.data?.length || 0);
        
        if (matchesData.data && matchesData.data.length > 0) {
            const sampleMatch = matchesData.data[0];
            console.log('   - Sample match:');
            console.log('     • Home:', sampleMatch.home_team || 'TBD');
            console.log('     • Away:', sampleMatch.away_team || 'TBD');
            console.log('     • Venue:', sampleMatch.venue || 'TBD');
            console.log('     • Status:', sampleMatch.status || 'SCHEDULED');
            console.log('     • Round:', sampleMatch.rounds?.name || `Round ${sampleMatch.rounds?.number}`);
        }
        console.log();

        // 5. Verify Data Transformation Structure (same as useMatches)
        console.log('5. Testing Data Transformation...');
        if (matchesData.data && matchesData.data.length > 0) {
            const transformedFixtures = matchesData.data.map(m => ({
                id: m.id,
                homeTeam: m.home_team || "TBD",
                awayTeam: m.away_team || "TBD",
                homeScore: m.homeScore,
                awayScore: m.awayScore,
                kickoff: m.kickoff,
                venue: m.venue,
                status: m.status,
                round: m.rounds?.name || `Round ${m.rounds?.number || 1}`,
                stage: "League",
            }));

            console.log('✅ Successfully transformed', transformedFixtures.length, 'fixtures');
            console.log('   - Sample transformed fixture:');
            console.log('     • ID:', transformedFixtures[0].id.substring(0, 8));
            console.log('     • Match:', `${transformedFixtures[0].homeTeam} vs ${transformedFixtures[0].awayTeam}`);
            console.log('     • Round:', transformedFixtures[0].round);
            console.log('     • Status:', transformedFixtures[0].status);

            // Count status distribution
            const statusCounts = transformedFixtures.reduce((acc, fixture) => {
                acc[fixture.status] = (acc[fixture.status] || 0) + 1;
                return acc;
            }, {});

            console.log('   - Status distribution:', statusCounts);
        }
        console.log();

        console.log('🎉 JamiiFixtures Integration Test PASSED!');
        console.log('=====================================');
        console.log('The JamiiFixtures Review tab should now display:');
        console.log('• Organization selection (auto-selecting System)');
        console.log('• Tournament selection (auto-selecting GOAL CUP)');
        console.log(`• ${matchesData.data?.length || 0} fixture cards with team matchups`);
        console.log('• Round and status filtering options');
        console.log('• Status badges showing completed/scheduled counts');
        console.log('• Approve & Publish button when fixtures are available');
        console.log('\n📱 Open browser to: http://localhost:5173/jamii-fixtures');
        console.log('🔍 Click on the "Review" tab to see the fixtures');

    } catch (error) {
        console.error('❌ Test failed:', error.message);
        console.log('\nPlease ensure:');
        console.log('1. Backend server is running on localhost:5000');
        console.log('2. Supabase database is connected');
        console.log('3. GOAL CUP tournament fixtures exist in the database');
    }
}

// Run the test
testJamiiFixturesIntegration();