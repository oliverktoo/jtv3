import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { TournamentPlayer, InsertTournamentPlayer } from "@shared/schema";

export function useTournamentPlayers(tournamentId: string) {
  return useQuery<TournamentPlayer[]>({
    queryKey: ["/api/tournaments", tournamentId, "players"],
    enabled: !!tournamentId,
  });
}

export function useCreateTournamentPlayer(tournamentId: string) {
  return useMutation({
    mutationFn: (data: InsertTournamentPlayer) =>
      apiRequest("POST", `/api/tournaments/${tournamentId}/players`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tournaments", tournamentId, "players"] });
    },
  });
}

export function useUpdateTournamentPlayer() {
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<InsertTournamentPlayer> }) =>
      apiRequest("PATCH", `/api/tournament-players/${id}`, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/tournaments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/tournament-players", variables.id] });
    },
  });
}

export function useTeamRoster(teamId: string) {
  return useQuery<any[]>({
    queryKey: ["/api/teams", teamId, "roster"],
    enabled: !!teamId,
  });
}

export function useTournamentRoster(tournamentId: string) {
  return useQuery<any[]>({
    queryKey: ["/api/tournaments", tournamentId, "roster"],
    enabled: !!tournamentId,
  });
}

export function useCreateRosterMember(teamId: string) {
  return useMutation({
    mutationFn: (data: { tpid: string }) =>
      apiRequest("POST", `/api/teams/${teamId}/roster`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/teams", teamId, "roster"] });
      queryClient.invalidateQueries({ queryKey: ["/api/tournaments"] });
    },
  });
}

export function useUpdateRosterMember() {
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { leftAt?: Date } }) =>
      apiRequest("PATCH", `/api/roster-members/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/teams"] });
      queryClient.invalidateQueries({ queryKey: ["/api/tournaments"] });
    },
  });
}
