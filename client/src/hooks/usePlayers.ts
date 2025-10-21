import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { PlayerRegistry, InsertPlayerRegistry, PlayerDocument, InsertPlayerDocument } from "@shared/schema";

// Player Registry Hooks
export function usePlayers(orgId: string) {
  return useQuery<PlayerRegistry[]>({
    queryKey: ["/api/players", orgId],
    queryFn: () => `/api/players?orgId=${orgId}`,
    enabled: !!orgId,
  });
}

export function useSearchPlayers(orgId: string, query: string) {
  return useQuery<PlayerRegistry[]>({
    queryKey: ["/api/players/search", orgId, query],
    queryFn: () => `/api/players/search?orgId=${orgId}&q=${query}`,
    enabled: !!orgId && !!query && query.length > 0,
  });
}

export function usePlayerById(id: string) {
  return useQuery<PlayerRegistry>({
    queryKey: ["/api/players", id],
    queryFn: () => `/api/players/${id}`,
    enabled: !!id,
  });
}

export function useCreatePlayer(orgId: string) {
  return useMutation({
    mutationFn: (data: InsertPlayerRegistry) =>
      apiRequest("POST", "/api/players", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/players", orgId] });
    },
  });
}

export function useUpdatePlayer(orgId: string) {
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<InsertPlayerRegistry> }) =>
      apiRequest("PATCH", `/api/players/${id}`, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/players", orgId] });
      queryClient.invalidateQueries({ queryKey: ["/api/players", variables.id] });
    },
  });
}

// Player Documents Hooks
export function usePlayerDocuments(upid: string) {
  return useQuery<PlayerDocument[]>({
    queryKey: ["/api/players", upid, "documents"],
    queryFn: () => `/api/players/${upid}/documents`,
    enabled: !!upid,
  });
}

export function useCreatePlayerDocument(upid: string) {
  return useMutation({
    mutationFn: (data: Omit<InsertPlayerDocument, "upid">) =>
      apiRequest("POST", `/api/players/${upid}/documents`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/players", upid, "documents"] });
    },
  });
}

export function useUpdatePlayerDocument(upid: string) {
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<InsertPlayerDocument> }) =>
      apiRequest("PATCH", `/api/player-documents/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/players", upid, "documents"] });
    },
  });
}

export function useDeletePlayerDocument(upid: string) {
  return useMutation({
    mutationFn: (id: string) =>
      apiRequest("DELETE", `/api/player-documents/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/players", upid, "documents"] });
    },
  });
}

// Helper function to hash identity keys on the client side
export function hashIdentityKey(orgId: string, docType: string, docNumber: string): string {
  // In production, this should match the server-side hashing
  // For now, we'll create a simple concatenation that the server will hash
  return `${orgId}:${docType}:${docNumber}`;
}
