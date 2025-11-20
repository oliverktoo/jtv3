import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { TournamentPlayer, InsertTournamentPlayer } from "@shared/schema";

export function useTournamentPlayers(tournamentId: string) {
  return useQuery<TournamentPlayer[]>({
    queryKey: ["tournamentPlayers", tournamentId],
    queryFn: async () => {
      try {
        // Try backend API first
        const data = await apiRequest('GET', `/api/tournaments/${tournamentId}/players`);
        return data as TournamentPlayer[];
      } catch (error) {
        console.warn("Tournament players API error, falling back to Supabase:", error);
        
        // Fallback to direct Supabase query
        const { supabase } = await import("@/lib/supabase");
        const { data: supabaseData, error: supabaseError } = await supabase
          .from('tournament_players')
          .select(`
            *,
            player:players(*),
            team:teams(*)
          `)
          .eq('tournament_id', tournamentId);
        
        if (supabaseError) {
          console.error("Supabase tournament players error:", supabaseError);
          return []; // Return empty array instead of throwing
        }
        
        return supabaseData || [];
      }
    },
    enabled: !!tournamentId,
  });
}

export function useCreateTournamentPlayer(tournamentId: string) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: InsertTournamentPlayer) => {
      try {
        const tournamentPlayer = await apiRequest('POST', `/api/tournaments/${tournamentId}/players`, data);
        return tournamentPlayer;
      } catch (error) {
        console.error("Create tournament player API error:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tournamentPlayers", tournamentId] });
    },
  });
}

export function useUpdateTournamentPlayer() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<InsertTournamentPlayer> }) => {
      try {
        const tournamentPlayer = await apiRequest('PATCH', `/api/tournament-players/${id}`, data);
        return tournamentPlayer;
      } catch (error) {
        console.error("Update tournament player API error:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tournamentPlayers"] });
    },
  });
}

// Note: The following functions would require additional API endpoints
// Temporarily returning empty implementations to prevent errors

export function useTeamRoster(teamId: string) {
  return useQuery<any[]>({
    queryKey: ["teamRoster", teamId],
    queryFn: async () => {
      console.warn("Team roster API endpoint not implemented yet");
      return [];
    },
    enabled: false, // Disabled until API endpoint is created
  });
}

export function useTournamentRoster(tournamentId: string) {
  return useQuery<any[]>({
    queryKey: ["tournamentRoster", tournamentId],
    queryFn: async () => {
      console.warn("Tournament roster API endpoint not implemented yet"); 
      return [];
    },
    enabled: false, // Disabled until API endpoint is created
  });
}

export function useCreateRosterMember(teamId: string) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: { tpid: string }) => {
      console.warn("Create roster member API endpoint not implemented yet");
      return {};
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teamRoster", teamId] });
      queryClient.invalidateQueries({ queryKey: ["tournamentRoster"] });
    },
  });
}

export function useUpdateRosterMember() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: { leftAt?: Date } }) => {
      console.warn("Update roster member API endpoint not implemented yet");
      return {};
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teamRoster"] });
      queryClient.invalidateQueries({ queryKey: ["tournamentRoster"] });
    },
  });
}
