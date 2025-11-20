// Test fixtures query issues  
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function testFixturesQueries() {
  console.log('Testing fixtures queries...')
  
  // Test 1: Check fixtures table structure
  console.log('\n1. Getting fixtures table schema...')
  const { data: fixtures, error: fixturesError } = await supabase
    .from('fixtures')
    .select('*')
    .limit(3)
  
  if (fixturesError) {
    console.error('Fixtures table error:', fixturesError)
  } else {
    console.log('Fixtures sample:', fixtures)
    if (fixtures.length > 0) {
      console.log('Fixture columns:', Object.keys(fixtures[0]))
    }
  }
  
  // Test 2: Try the failing query format
  console.log('\n2. Testing the failing query...')
  const { data: fixtureQuery, error: fixtureQueryError } = await supabase
    .from('fixtures')
    .select('tournament_id,home_team_id,away_team_id,venue_id,scheduled_date,round_number,match_status')
  
  if (fixtureQueryError) {
    console.error('Fixture query error:', fixtureQueryError)
  } else {
    console.log('Fixture query result count:', fixtureQuery?.length || 0)
  }
}

testFixturesQueries().catch(console.error)