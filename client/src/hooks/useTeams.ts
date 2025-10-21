import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Team, InsertTeam } from "@shared/schema";

export function useTeams(tournamentId: string) {
  return useQuery<Team[]>({
    queryKey: ["/api/tournaments", tournamentId, "teams"],
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/tournaments/${tournamentId}/teams`);
      return response.json();
    },
    enabled: !!tournamentId,
  });
}

export function useCreateTeam(tournamentId: string) {
  return useMutation({
    mutationFn: (data: Omit<InsertTeam, "tournamentId">) =>
      apiRequest("POST", `/api/tournaments/${tournamentId}/teams`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tournaments", tournamentId, "teams"] });
    },
  });
}

export function useCreateTeamsBulk(tournamentId: string) {
  return useMutation({
    mutationFn: (teams: Omit<InsertTeam, "tournamentId">[]) =>
      apiRequest("POST", `/api/tournaments/${tournamentId}/teams/bulk`, { teams }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tournaments", tournamentId, "teams"] });
    },
  });
}

export function useUpdateTeam() {
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<InsertTeam> }) =>
      apiRequest("PATCH", `/api/teams/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tournaments"] });
    },
  });
}

export function useDeleteTeam(tournamentId: string) {
  return useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/teams/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tournaments", tournamentId, "teams"] });
    },
  });
}
