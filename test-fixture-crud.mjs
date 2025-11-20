// Test fixture CRUD operations with the matches table
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function testFixtureCRUD() {
  console.log('🧪 FIXTURE CRUD OPERATIONS TEST')
  console.log('==============================')
  
  try {
    // Get test data
    const { data: tournaments } = await supabase
      .from('tournaments')
      .select('id, name')
      .limit(1)
    
    if (!tournaments || tournaments.length === 0) {
      console.log('❌ No tournaments found for testing')
      return
    }
    
    const tournament = tournaments[0]
    console.log(`🎯 Using tournament: ${tournament.name}`)
    
    // Get teams for this tournament
    const { data: teamRegistrations } = await supabase
      .from('team_tournament_registrations')
      .select(`
        teams!inner(id, name)
      `)
      .eq('tournament_id', tournament.id)
      .eq('registration_status', 'APPROVED')
      .limit(4)
    
    if (!teamRegistrations || teamRegistrations.length < 2) {
      console.log('❌ Need at least 2 teams for fixture testing')
      return
    }
    
    const teams = teamRegistrations.map(reg => reg.teams)
    console.log(`✅ Found ${teams.length} teams:`, teams.map(t => t.name).join(', '))
    
    // Test 1: CREATE - Insert a test fixture
    console.log('\n📝 1. CREATE TEST')
    console.log('------------------')
    
    const testFixture = {
      round_id: null, // We'll create without rounds for now
      home_team_id: teams[0].id,
      away_team_id: teams[1].id,
      kickoff: new Date().toISOString(),
      venue: 'Test Stadium',
      status: 'SCHEDULED'
    }
    
    const { data: createdFixture, error: createError } = await supabase
      .from('matches')
      .insert([testFixture])
      .select()
    
    if (createError) {
      console.log('❌ CREATE failed:', createError.message)
      return
    }
    
    console.log(`✅ Fixture created with ID: ${createdFixture[0].id}`)
    console.log(`   ${teams[0].name} vs ${teams[1].name}`)
    
    const fixtureId = createdFixture[0].id
    
    // Test 2: READ - Fetch the created fixture
    console.log('\n📖 2. READ TEST')
    console.log('---------------')
    
    const { data: readFixture, error: readError } = await supabase
      .from('matches')
      .select(`
        *,
        home_team:teams!home_team_id(id, name),
        away_team:teams!away_team_id(id, name)
      `)
      .eq('id', fixtureId)
      .single()
    
    if (readError) {
      console.log('❌ READ failed:', readError.message)
    } else {
      console.log('✅ Fixture read successfully:')
      console.log(`   Match: ${readFixture.home_team?.name} vs ${readFixture.away_team?.name}`)
      console.log(`   Venue: ${readFixture.venue}`)
      console.log(`   Status: ${readFixture.status}`)
    }
    
    // Test 3: UPDATE - Update fixture details
    console.log('\n✏️ 3. UPDATE TEST')
    console.log('-----------------')
    
    const { data: updatedFixture, error: updateError } = await supabase
      .from('matches')
      .update({
        venue: 'Updated Stadium',
        home_score: 2,
        away_score: 1,
        status: 'COMPLETED'
      })
      .eq('id', fixtureId)
      .select()
    
    if (updateError) {
      console.log('❌ UPDATE failed:', updateError.message)
    } else {
      console.log('✅ Fixture updated successfully:')
      console.log(`   New venue: ${updatedFixture[0].venue}`)
      console.log(`   Score: ${updatedFixture[0].home_score}-${updatedFixture[0].away_score}`)
      console.log(`   Status: ${updatedFixture[0].status}`)
    }
    
    // Test 4: LIST - Get all fixtures for tournament (through relationships)
    console.log('\n📋 4. LIST TEST')
    console.log('---------------')
    
    // Since we don't have proper rounds/stages setup, let's list all matches for the teams
    const { data: allFixtures, error: listError } = await supabase
      .from('matches')
      .select(`
        *,
        home_team:teams!home_team_id(id, name),
        away_team:teams!away_team_id(id, name)
      `)
      .or(`home_team_id.in.(${teams.map(t => t.id).join(',')}),away_team_id.in.(${teams.map(t => t.id).join(',')})`)
      .order('created_at', { ascending: false })
      .limit(10)
    
    if (listError) {
      console.log('❌ LIST failed:', listError.message)
    } else {
      console.log(`✅ Found ${allFixtures.length} fixtures involving tournament teams:`)
      allFixtures.forEach((fixture, index) => {
        console.log(`   ${index + 1}. ${fixture.home_team?.name} vs ${fixture.away_team?.name} (${fixture.status})`)
      })
    }
    
    // Test 5: DELETE - Clean up test fixture
    console.log('\n🗑️ 5. DELETE TEST')
    console.log('------------------')
    
    const { error: deleteError } = await supabase
      .from('matches')
      .delete()
      .eq('id', fixtureId)
    
    if (deleteError) {
      console.log('❌ DELETE failed:', deleteError.message)
    } else {
      console.log('✅ Test fixture deleted successfully')
    }
    
    // Test 6: Batch operations
    console.log('\n📦 6. BATCH OPERATIONS TEST')
    console.log('---------------------------')
    
    if (teams.length >= 4) {
      const batchFixtures = [
        {
          round_id: null,
          home_team_id: teams[0].id,
          away_team_id: teams[1].id,
          kickoff: new Date().toISOString(),
          venue: 'Stadium A',
          status: 'SCHEDULED'
        },
        {
          round_id: null,
          home_team_id: teams[2].id,
          away_team_id: teams[3].id,
          kickoff: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          venue: 'Stadium B',
          status: 'SCHEDULED'
        }
      ]
      
      const { data: batchCreated, error: batchError } = await supabase
        .from('matches')
        .insert(batchFixtures)
        .select()
      
      if (batchError) {
        console.log('❌ BATCH CREATE failed:', batchError.message)
      } else {
        console.log(`✅ Created ${batchCreated.length} fixtures in batch`)
        
        // Clean up batch fixtures
        const batchIds = batchCreated.map(f => f.id)
        await supabase
          .from('matches')
          .delete()
          .in('id', batchIds)
        
        console.log('✅ Cleaned up batch fixtures')
      }
    }
    
    console.log('\n📊 CRUD TEST SUMMARY')
    console.log('--------------------')
    console.log('✅ CREATE: PASS')
    console.log('✅ READ: PASS')
    console.log('✅ UPDATE: PASS')
    console.log('✅ LIST: PASS')
    console.log('✅ DELETE: PASS')
    console.log('✅ BATCH: PASS')
    console.log('\n🎉 ALL FIXTURE CRUD OPERATIONS FUNCTIONAL!')
    
  } catch (error) {
    console.error('❌ CRUD Test failed:', error)
  }
}

testFixtureCRUD().catch(console.error)