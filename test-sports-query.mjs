// Test sports query issues
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://siolrhalqvpzerthdluq.supabase.co'
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNpb2xyaGFscXZwemVydGhkbHVxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzA2Mzk3ODksImV4cCI6MjA0NjIxNTc4OX0.mu6KC7N_ae8J1E_IMul2iMMPbeXRKvugJqT7I_TnKGg'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testSportsQueries() {
  console.log('Testing sports queries...')
  
  // Test 1: Check sports table structure
  console.log('\n1. Getting sports table schema...')
  const { data: sports, error: sportsError } = await supabase
    .from('sports')
    .select('*')
    .limit(5)
  
  if (sportsError) {
    console.error('Sports table error:', sportsError)
  } else {
    console.log('Sports sample:', sports)
  }
  
  // Test 2: Try the failing query format (without code column)
  console.log('\n2. Testing the failing query format...')
  const sportId = '650e8400-e29b-41d4-a716-446655440001'
  const { data: sportQuery, error: sportQueryError } = await supabase
    .from('sports')
    .select('id,name')
    .in('id', [sportId])
  
  if (sportQueryError) {
    console.error('Sport query error:', sportQueryError)
  } else {
    console.log('Sport query result:', sportQuery)
  }
  
  // Test 3: Check if that sport ID exists
  console.log('\n3. Checking if sport ID exists...')
  const { data: allSports, error: allSportsError } = await supabase
    .from('sports')
    .select('id,name')
  
  if (allSportsError) {
    console.error('All sports error:', allSportsError)
  } else {
    console.log('Available sports:', allSports)
    const exists = allSports.find(s => s.id === sportId)
    console.log(`Sport ID ${sportId} exists:`, !!exists)
  }
}

testSportsQueries().catch(console.error)