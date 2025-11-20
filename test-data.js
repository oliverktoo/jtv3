import { supabase } from './client/lib/supabaseClient.ts';

async function testData() {
  try {
    console.log('Testing database connection...');
    
    // Check if organizations exist
    const { data: orgs, error: orgError } = await supabase
      .from('organizations')
      .select('*');
    
    if (orgError) {
      console.error('Error fetching organizations:', orgError);
      return;
    }
    
    console.log('Organizations found:', orgs?.length || 0);
    
    if (orgs && orgs.length > 0) {
      console.log('Sample organization:', orgs[0]);
      
      // Check tournaments for first org
      const { data: tournaments, error: tournamentError } = await supabase
        .from('tournaments')
        .select('*')
        .eq('org_id', orgs[0].id);
        
      if (tournamentError) {
        console.error('Error fetching tournaments:', tournamentError);
      } else {
        console.log('Tournaments found:', tournaments?.length || 0);
        if (tournaments && tournaments.length > 0) {
          console.log('Sample tournament:', tournaments[0]);
        }
      }
    } else {
      console.log('No organizations found. Creating test data...');
      
      // Create test organization
      const { data: newOrg, error: createOrgError } = await supabase
        .from('organizations')
        .insert({
          name: 'Test Sports Federation',
          slug: 'test-sports'
        })
        .select()
        .single();
        
      if (createOrgError) {
        console.error('Error creating organization:', createOrgError);
      } else {
        console.log('Created organization:', newOrg);
        
        // Create test sport
        const { data: sport, error: sportError } = await supabase
          .from('sports')
          .insert({
            name: 'Football',
            slug: 'football'
          })
          .select()
          .single();
          
        if (sportError) {
          console.log('Sport might already exist, trying to fetch...');
          const { data: existingSport } = await supabase
            .from('sports')
            .select('*')
            .eq('slug', 'football')
            .single();
          console.log('Existing sport:', existingSport);
        } else {
          console.log('Created sport:', sport);
        }
      }
    }
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testData();