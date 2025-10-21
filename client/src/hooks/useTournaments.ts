import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Tournament, InsertTournament } from "@shared/schema";

export function useTournaments(orgId: string) {
  return useQuery<Tournament[]>({
    queryKey: ["/api/tournaments", orgId],
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/tournaments?orgId=${orgId}`);
      return response.json();
    },
    enabled: !!orgId,
  });
}

export function useTournament(id: string) {
  return useQuery<Tournament>({
    queryKey: ["/api/tournaments", id],
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/tournaments/${id}`);
      return response.json();
    },
    enabled: !!id,
  });
}

export function useCreateTournament() {
  return useMutation({
    mutationFn: (data: InsertTournament) =>
      apiRequest("POST", "/api/tournaments", data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/tournaments", variables.orgId] });
    },
  });
}

export function useUpdateTournament() {
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<InsertTournament> }) =>
      apiRequest("PATCH", `/api/tournaments/${id}`, data),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/tournaments", data.id] });
      queryClient.invalidateQueries({ queryKey: ["/api/tournaments", data.orgId] });
    },
  });
}

export function useDeleteTournament() {
  return useMutation({
    mutationFn: ({ id, orgId }: { id: string; orgId: string }) => 
      apiRequest("DELETE", `/api/tournaments/${id}`),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/tournaments", variables.orgId] });
    },
  });
}
