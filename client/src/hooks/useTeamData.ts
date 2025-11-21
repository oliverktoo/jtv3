import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export function useTeamRegistrations(teamId: string) {
  return useQuery({
    queryKey: ['team-registrations', teamId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('team_tournament_registrations')
        .select(`
          *,
          tournaments (
            id,
            name,
            status,
            start_date,
            end_date
          )
        `)
        .eq('team_id', teamId);
      
      if (error) throw new Error(error.message);
      return data || [];
    },
    enabled: !!teamId,
  });
}

export function useTeamPlayers(teamId: string) {
  return useQuery({
    queryKey: ['team-players', teamId],
    queryFn: async () => {
      // Get players through tournament registrations
      const { data: teamRegistrations, error: regError } = await supabase
        .from('team_tournament_registrations')
        .select('tournament_id')
        .eq('team_id', teamId);
      
      if (regError) throw new Error(regError.message);
      if (!teamRegistrations || teamRegistrations.length === 0) return [];

      const tournamentIds = teamRegistrations.map(reg => reg.tournament_id);
      
      const { data, error } = await supabase
        .from('tournament_players')
        .select(`
          *,
          player_registry (
            id,
            first_name,
            middle_name,
            last_name,
            email
          )
        `)
        .in('tournament_id', tournamentIds);
      
      if (error) throw new Error(error.message);
      return data || [];
    },
    enabled: !!teamId,
  });
}