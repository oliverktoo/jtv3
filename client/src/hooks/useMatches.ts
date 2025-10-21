import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Match } from "@shared/schema";

export function useMatches(tournamentId: string) {
  return useQuery<any[]>({
    queryKey: ["/api/tournaments", tournamentId, "matches"],
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/tournaments/${tournamentId}/matches`);
      return response.json();
    },
    enabled: !!tournamentId,
  });
}

export function useStandings(tournamentId: string) {
  return useQuery<any[]>({
    queryKey: ["/api/tournaments", tournamentId, "standings"],
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/tournaments/${tournamentId}/standings`);
      return response.json();
    },
    enabled: !!tournamentId,
  });
}

export function useGenerateFixtures(tournamentId: string) {
  return useMutation({
    mutationFn: (data: {
      startDate: string;
      kickoffTime?: string;
      weekendsOnly?: boolean;
      homeAndAway?: boolean;
      venue?: string;
    }) => apiRequest("POST", `/api/tournaments/${tournamentId}/generate-fixtures`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tournaments", tournamentId, "matches"] });
    },
  });
}

export function useUpdateMatch(tournamentId: string) {
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Match> }) =>
      apiRequest("PATCH", `/api/matches/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tournaments", tournamentId, "matches"] });
      queryClient.invalidateQueries({ queryKey: ["/api/tournaments", tournamentId, "standings"] });
    },
  });
}
