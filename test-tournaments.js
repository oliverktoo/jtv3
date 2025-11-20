// Simple test script to check if we have tournaments in the database
import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase configuration');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testTournaments() {
  try {
    console.log('Connecting to Supabase...');
    
    // Test organizations first
    console.log('Testing organizations...');
    const { data: orgs, error: orgError } = await supabase
      .from('organizations')
      .select('*')
      .limit(5);
    
    if (orgError) {
      console.error('Organization error:', orgError);
    } else {
      console.log('Organizations found:', orgs?.length || 0);
      if (orgs && orgs.length > 0) {
        console.log('First organization:', orgs[0]);
      }
    }

    // Test tournaments
    console.log('Testing tournaments...');
    const { data: tournaments, error: tournamentError } = await supabase
      .from('tournaments')
      .select('*')
      .limit(10);
    
    if (tournamentError) {
      console.error('Tournament error:', tournamentError);
    } else {
      console.log('Tournaments found:', tournaments?.length || 0);
      if (tournaments && tournaments.length > 0) {
        console.log('Tournaments:', tournaments);
      }
    }

    // Test with specific org filter if we have orgs
    if (orgs && orgs.length > 0) {
      const orgId = orgs[0].id;
      console.log(`Testing tournaments for org: ${orgId}`);
      
      const { data: orgTournaments, error: orgTournamentError } = await supabase
        .from('tournaments')
        .select('*')
        .eq('org_id', orgId);
      
      if (orgTournamentError) {
        console.error('Org tournament error:', orgTournamentError);
      } else {
        console.log('Org tournaments found:', orgTournaments?.length || 0);
        if (orgTournaments && orgTournaments.length > 0) {
          console.log('Org tournaments:', orgTournaments);
        }
      }
    }

  } catch (error) {
    console.error('Test error:', error);
  }
}

testTournaments();