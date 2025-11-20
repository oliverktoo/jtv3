import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { Stage, InsertStage } from "@shared/schema";

// Get all stages for a tournament
export function useStages(tournamentId: string) {
  return useQuery<Stage[]>({
    queryKey: ["stages", tournamentId],
    queryFn: async () => {
      if (!tournamentId) return [];
      try {
        const response = await apiRequest('GET', `/api/tournaments/${tournamentId}/stages`);
        return response?.data || [];
      } catch (error) {
        console.error("Stages API error:", error);
        return [];
      }
    },
    enabled: !!tournamentId,
  });
}

// Get single stage by ID
export function useStage(stageId: string) {
  return useQuery<Stage>({
    queryKey: ["stage", stageId],
    queryFn: async () => {
      if (!stageId) return null;
      try {
        const response = await apiRequest('GET', `/api/stages/${stageId}`);
        return response?.data || null;
      } catch (error) {
        console.error("Stage API error:", error);
        return null;
      }
    },
    enabled: !!stageId,
  });
}

// Create a new stage
export function useCreateStage() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: {
      tournamentId: string;
      name: string;
      stageType: "LEAGUE" | "GROUP" | "KNOCKOUT";
      seq?: number;
    }) => {
      const response = await apiRequest('POST', `/api/tournaments/${data.tournamentId}/stages`, {
        name: data.name,
        stageType: data.stageType,
        seq: data.seq
      });
      return response?.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["stages", variables.tournamentId] });
      queryClient.invalidateQueries({ queryKey: ["tournaments"] });
    },
  });
}

// Update stage
export function useUpdateStage() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      id, 
      tournamentId,
      data 
    }: { 
      id: string;
      tournamentId: string;
      data: Partial<{ name: string; stageType: string; seq: number }> 
    }) => {
      const response = await apiRequest('PUT', `/api/stages/${id}`, data);
      return response?.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["stage", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["stages", variables.tournamentId] });
    },
  });
}

// Delete stage
export function useDeleteStage() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      id, 
      tournamentId 
    }: { 
      id: string;
      tournamentId: string;
    }) => {
      await apiRequest('DELETE', `/api/stages/${id}`);
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["stages", variables.tournamentId] });
    },
  });
}