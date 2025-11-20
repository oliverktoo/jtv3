// Test script to check organizations
import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function testOrganizations() {
  try {
    console.log('Testing all organizations...');
    const { data: orgs, error: orgError } = await supabase
      .from('organizations')
      .select('*');
    
    if (orgError) {
      console.error('Organization error:', orgError);
    } else {
      console.log('All organizations:');
      orgs.forEach((org, index) => {
        console.log(`${index + 1}. ${org.name} (ID: ${org.id})`);
      });
      
      // Check tournaments per organization
      for (const org of orgs) {
        const { data: tournaments, error: tournamentError } = await supabase
          .from('tournaments')
          .select('name, status')
          .eq('org_id', org.id);
        
        if (tournamentError) {
          console.error(`Error for org ${org.name}:`, tournamentError);
        } else {
          console.log(`\n${org.name} has ${tournaments.length} tournaments:`);
          tournaments.forEach(t => console.log(`  - ${t.name} (${t.status})`));
        }
      }
    }
  } catch (error) {
    console.error('Test error:', error);
  }
}

testOrganizations();