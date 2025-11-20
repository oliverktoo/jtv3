import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
dotenv.config();

async function testTeamsData() {
  console.log('Testing teams data...');

  try {
    const supabase = createClient(
      process.env.VITE_SUPABASE_URL!,
      process.env.VITE_SUPABASE_ANON_KEY!
    );
    
    console.log('1. Checking tournaments...');
    const { data: tournaments, error: tournamentsError } = await supabase
      .from('tournaments')
      .select('*');
    
    if (tournamentsError) {
      console.log('❌ Tournaments error:', tournamentsError);
    } else {
      console.log('✅ Tournaments found:', tournaments?.length || 0);
      if (tournaments && tournaments.length > 0) {
        console.log('First tournament:', tournaments[0]);
      }
    }
    
    console.log('2. Checking teams...');
    const { data: teams, error: teamsError } = await supabase
      .from('teams')
      .select('*');
    
    if (teamsError) {
      console.log('❌ Teams error:', teamsError);
    } else {
      console.log('✅ Teams found:', teams?.length || 0);
      if (teams && teams.length > 0) {
        console.log('First team:', teams[0]);
      }
    }
    
    // If we have both tournaments and teams, check the relationship
    if (tournaments && tournaments.length > 0) {
      const tournamentId = tournaments[0].id;
      console.log(`3. Checking teams for tournament ${tournamentId}...`);
      
      const { data: tournamentTeams, error: tournamentTeamsError } = await supabase
        .from('teams')
        .select('*')
        .eq('tournament_id', tournamentId);
      
      if (tournamentTeamsError) {
        console.log('❌ Tournament teams error:', tournamentTeamsError);
      } else {
        console.log('✅ Teams for tournament:', tournamentTeams?.length || 0);
        if (tournamentTeams && tournamentTeams.length > 0) {
          console.log('Tournament teams:', tournamentTeams);
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

testTeamsData();