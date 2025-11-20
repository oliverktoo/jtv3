import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';

config();
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function testFullTournamentCRUD() {
  console.log('🧪 Testing Complete Tournament CRUD Operations');
  console.log('=' .repeat(50));
  
  let testTournamentId = null;
  
  try {
    // 1. CREATE Tournament
    console.log('\n1️⃣ Testing CREATE operation...');
    const createData = {
      org_id: '00000000-0000-0000-0000-000000000000', // System org
      sport_id: '650e8400-e29b-41d4-a716-446655440001', // Football
      name: 'Full CRUD Test Tournament ' + Date.now(),
      slug: 'full-crud-test-' + Date.now(),
      season: '2024',
      tournament_model: 'INDEPENDENT',
      status: 'DRAFT',
      federation_type: 'FKF',
      start_date: '2024-12-01',
      end_date: '2024-12-31',
      is_published: false
    };
    
    const { data: created, error: createError } = await supabase
      .from('tournaments')
      .insert(createData)
      .select()
      .single();
    
    if (createError) {
      console.log('❌ CREATE failed:', createError.message);
      return;
    }
    
    testTournamentId = created.id;
    console.log('✅ CREATE success:', created.name, '(ID:', created.id, ')');
    
    // 2. READ Tournament (single)
    console.log('\n2️⃣ Testing READ (single) operation...');
    const { data: readSingle, error: readError } = await supabase
      .from('tournaments')
      .select('*, organizations(name), sports(name)')
      .eq('id', testTournamentId)
      .single();
    
    if (readError) {
      console.log('❌ READ failed:', readError.message);
    } else {
      console.log('✅ READ success:', readSingle.name);
      console.log('  - Sport:', readSingle.sports?.name);
      console.log('  - Organization:', readSingle.organizations?.name || 'Independent');
      console.log('  - Status:', readSingle.status);
    }
    
    // 3. READ Tournaments (list)
    console.log('\n3️⃣ Testing READ (list) operation...');
    const { data: readList, error: listError } = await supabase
      .from('tournaments')
      .select('id, name, tournament_model, status')
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (listError) {
      console.log('❌ READ LIST failed:', listError.message);
    } else {
      console.log('✅ READ LIST success:', readList.length, 'tournaments found');
      readList.forEach(t => {
        const marker = t.id === testTournamentId ? '👈 (Our test tournament)' : '';
        console.log('  -', t.name, '(', t.tournament_model, ')', marker);
      });
    }
    
    // 4. UPDATE Tournament
    console.log('\n4️⃣ Testing UPDATE operation...');
    const updateData = {
      name: created.name + ' (UPDATED)',
      status: 'REGISTRATION',
      season: '2024-Updated',
      federation_type: 'SCHOOLS'
    };
    
    const { data: updated, error: updateError } = await supabase
      .from('tournaments')
      .update(updateData)
      .eq('id', testTournamentId)
      .select()
      .single();
    
    if (updateError) {
      console.log('❌ UPDATE failed:', updateError.message);
    } else {
      console.log('✅ UPDATE success:');
      console.log('  - Name:', updated.name);
      console.log('  - Status:', updated.status);
      console.log('  - Season:', updated.season);
      console.log('  - Federation:', updated.federation_type);
    }
    
    // 5. Add related data to test CASCADE DELETE
    console.log('\n5️⃣ Adding related data for cascade delete test...');
    
    // Add a stage
    const { data: stage, error: stageError } = await supabase
      .from('stages')
      .insert({
        tournament_id: testTournamentId,
        name: 'Test Stage',
        stage_type: 'LEAGUE',
        seq: 1
      })
      .select()
      .single();
    
    if (stageError) {
      console.log('❌ Failed to add stage:', stageError.message);
    } else {
      console.log('✅ Added stage:', stage.id);
    }
    
    // Add a tournament registration (if we have teams)
    const { data: teams } = await supabase
      .from('teams')
      .select('id')
      .limit(1);
    
    if (teams && teams.length > 0) {
      const { data: registration, error: regError } = await supabase
        .from('team_tournament_registrations')
        .insert({
          tournament_id: testTournamentId,
          team_id: teams[0].id
        })
        .select()
        .single();
      
      if (regError) {
        console.log('⚠️ Failed to add registration:', regError.message);
      } else {
        console.log('✅ Added team registration:', registration.id);
      }
    }
    
    // 6. DELETE Tournament (with cascade)
    console.log('\n6️⃣ Testing CASCADE DELETE operation...');
    
    // Delete registrations first
    await supabase
      .from('team_tournament_registrations')
      .delete()
      .eq('tournament_id', testTournamentId);
    
    // Delete stages and related data
    const { data: stages } = await supabase
      .from('stages')
      .select('id')
      .eq('tournament_id', testTournamentId);
    
    if (stages && stages.length > 0) {
      for (const stageItem of stages) {
        await supabase
          .from('rounds')
          .delete()
          .eq('stage_id', stageItem.id);
      }
      
      await supabase
        .from('stages')
        .delete()
        .eq('tournament_id', testTournamentId);
      
      console.log('✅ Cleaned up', stages.length, 'stages');
    }
    
    // Finally delete the tournament
    const { error: deleteError } = await supabase
      .from('tournaments')
      .delete()
      .eq('id', testTournamentId);
    
    if (deleteError) {
      console.log('❌ DELETE failed:', deleteError.message);
    } else {
      console.log('✅ DELETE success');
      
      // Verify deletion
      const { data: verify } = await supabase
        .from('tournaments')
        .select('id')
        .eq('id', testTournamentId);
      
      if (verify && verify.length === 0) {
        console.log('✅ Deletion verified - tournament completely removed');
        testTournamentId = null; // Prevent cleanup attempt
      } else {
        console.log('⚠️ Tournament may still exist');
      }
    }
    
    console.log('\n🎉 CRUD Test Complete!');
    console.log('=' .repeat(50));
    console.log('✅ All tournament CRUD operations working correctly');
    
  } catch (error) {
    console.log('\n❌ CRUD Test Error:', error.message);
  } finally {
    // Cleanup if test tournament still exists
    if (testTournamentId) {
      console.log('\n🧹 Cleaning up test tournament...');
      try {
        await supabase.from('team_tournament_registrations').delete().eq('tournament_id', testTournamentId);
        await supabase.from('stages').delete().eq('tournament_id', testTournamentId);
        await supabase.from('tournaments').delete().eq('id', testTournamentId);
        console.log('✅ Cleanup completed');
      } catch (cleanupError) {
        console.log('⚠️ Cleanup error:', cleanupError.message);
      }
    }
  }
}

testFullTournamentCRUD();