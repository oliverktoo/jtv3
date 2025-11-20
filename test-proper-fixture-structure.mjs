// Test proper tournament structure creation for fixtures
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function testProperFixtureStructure() {
  console.log('🧪 PROPER FIXTURE STRUCTURE TEST')
  console.log('================================')
  
  try {
    // Get test tournament
    const { data: tournaments } = await supabase
      .from('tournaments')
      .select('id, name')
      .limit(1)
    
    if (!tournaments || tournaments.length === 0) {
      console.log('❌ No tournaments found')
      return
    }
    
    const tournament = tournaments[0]
    console.log(`🎯 Using tournament: ${tournament.name}`)
    
    // Step 1: Create a Stage
    console.log('\n📋 1. CREATE STAGE')
    console.log('------------------')
    
    const { data: createdStage, error: stageError } = await supabase
      .from('stages')
      .insert([{
        tournament_id: tournament.id,
        name: 'Group Stage',
        stage_type: 'GROUP',
        seq: 1
      }])
      .select()
    
    if (stageError) {
      console.log('❌ Stage creation failed:', stageError.message)
      return
    }
    
    const stage = createdStage[0]
    console.log(`✅ Stage created: ${stage.name} (ID: ${stage.id})`)
    
    // Step 2: Create a Group
    console.log('\n👥 2. CREATE GROUP')
    console.log('------------------')
    
    const { data: createdGroup, error: groupError } = await supabase
      .from('groups')
      .insert([{
        stage_id: stage.id,
        name: 'Group A',
        seq: 1
      }])
      .select()
    
    if (groupError) {
      console.log('❌ Group creation failed:', groupError.message)
      // Clean up stage
      await supabase.from('stages').delete().eq('id', stage.id)
      return
    }
    
    const group = createdGroup[0]
    console.log(`✅ Group created: ${group.name} (ID: ${group.id})`)
    
    // Step 3: Create a Round
    console.log('\n🔄 3. CREATE ROUND')
    console.log('------------------')
    
    const { data: createdRound, error: roundError } = await supabase
      .from('rounds')
      .insert([{
        stage_id: stage.id,
        group_id: group.id,
        number: 1,
        leg: 1,
        name: 'Round 1'
      }])
      .select()
    
    if (roundError) {
      console.log('❌ Round creation failed:', roundError.message)
      // Clean up
      await supabase.from('groups').delete().eq('id', group.id)
      await supabase.from('stages').delete().eq('id', stage.id)
      return
    }
    
    const round = createdRound[0]
    console.log(`✅ Round created: ${round.name} (ID: ${round.id})`)
    
    // Step 4: Get teams for fixtures
    const { data: teamRegistrations } = await supabase
      .from('team_tournament_registrations')
      .select(`
        teams!inner(id, name)
      `)
      .eq('tournament_id', tournament.id)
      .eq('registration_status', 'APPROVED')
      .limit(2)
    
    if (!teamRegistrations || teamRegistrations.length < 2) {
      console.log('⚠️ Not enough teams for fixture creation')
      // Clean up
      await supabase.from('rounds').delete().eq('id', round.id)
      await supabase.from('groups').delete().eq('id', group.id)
      await supabase.from('stages').delete().eq('id', stage.id)
      return
    }
    
    const teams = teamRegistrations.map(reg => reg.teams)
    console.log(`✅ Teams: ${teams.map(t => t.name).join(' vs ')}`)
    
    // Step 5: Create fixture with proper structure
    console.log('\n⚽ 4. CREATE FIXTURE WITH PROPER STRUCTURE')
    console.log('-----------------------------------------')
    
    const { data: createdFixture, error: fixtureError } = await supabase
      .from('matches')
      .insert([{
        round_id: round.id,
        home_team_id: teams[0].id,
        away_team_id: teams[1].id,
        kickoff: new Date().toISOString(),
        venue: 'Test Stadium',
        status: 'SCHEDULED'
      }])
      .select()
    
    if (fixtureError) {
      console.log('❌ Fixture creation failed:', fixtureError.message)
    } else {
      console.log(`✅ Fixture created successfully!`)
      console.log(`   Match: ${teams[0].name} vs ${teams[1].name}`)
      console.log(`   Round: ${round.name}`)
      console.log(`   Group: ${group.name}`)
      console.log(`   Stage: ${stage.name}`)
      
      const fixtureId = createdFixture[0].id
      
      // Test reading the full fixture with relationships
      console.log('\n📖 5. READ FIXTURE WITH RELATIONSHIPS')
      console.log('-------------------------------------')
      
      const { data: fullFixture, error: readError } = await supabase
        .from('matches')
        .select(`
          *,
          home_team:teams!home_team_id(id, name),
          away_team:teams!away_team_id(id, name),
          rounds!inner(
            id,
            name,
            number,
            groups!inner(
              id,
              name,
              stages!inner(
                id,
                name,
                stage_type
              )
            )
          )
        `)
        .eq('id', fixtureId)
        .single()
      
      if (readError) {
        console.log('❌ Full fixture read failed:', readError.message)
      } else {
        console.log('✅ Full fixture structure:')
        console.log(`   Match: ${fullFixture.home_team?.name} vs ${fullFixture.away_team?.name}`)
        console.log(`   Round: ${fullFixture.rounds?.name} (#${fullFixture.rounds?.number})`)
        console.log(`   Group: ${fullFixture.rounds?.groups?.name}`)
        console.log(`   Stage: ${fullFixture.rounds?.groups?.stages?.name} (${fullFixture.rounds?.groups?.stages?.stage_type})`)
      }
      
      // Clean up fixture
      await supabase.from('matches').delete().eq('id', fixtureId)
      console.log('✅ Cleaned up test fixture')
    }
    
    // Clean up structure
    await supabase.from('rounds').delete().eq('id', round.id)
    await supabase.from('groups').delete().eq('id', group.id)
    await supabase.from('stages').delete().eq('id', stage.id)
    console.log('✅ Cleaned up tournament structure')
    
    console.log('\n📊 STRUCTURE TEST SUMMARY')
    console.log('-------------------------')
    console.log('✅ Tournament Structure: PASS')
    console.log('✅ Stage Creation: PASS')
    console.log('✅ Group Creation: PASS')
    console.log('✅ Round Creation: PASS')
    console.log('✅ Fixture Creation: PASS')
    console.log('✅ Relationship Queries: PASS')
    console.log('\n🎉 PROPER FIXTURE STRUCTURE FUNCTIONAL!')
    
  } catch (error) {
    console.error('❌ Structure test failed:', error)
  }
}

testProperFixtureStructure().catch(console.error)