import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import { queryClient } from "@/lib/queryClient";
import type { PlayerRegistry, InsertPlayerRegistry, PlayerDocument, InsertPlayerDocument } from "@shared/schema";

// Player Registry Hooks
export function usePlayers(orgId: string) {
  return useQuery<PlayerRegistry[]>({
    queryKey: ["players", orgId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('player_registry')
        .select('*')
        .eq('org_id', orgId);
      
      if (error) {
        console.error("Players Supabase error:", error);
        throw error;
      }
      
      return data.map(player => ({
        ...player,
        createdAt: new Date(player.created_at),
        updatedAt: new Date(player.updated_at || player.created_at)
      }));
    },
    enabled: !!orgId,
  });
}

export function useSearchPlayers(orgId: string, query: string) {
  return useQuery<PlayerRegistry[]>({
    queryKey: ["players", "search", orgId, query],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('player_registry')
        .select('*')
        .eq('org_id', orgId)
        .or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%,email.ilike.%${query}%`);
      
      if (error) {
        console.error("Search players Supabase error:", error);
        throw error;
      }
      
      return data.map(player => ({
        ...player,
        createdAt: new Date(player.created_at),
        updatedAt: new Date(player.updated_at || player.created_at)
      }));
    },
    enabled: !!orgId && !!query && query.length > 0,
  });
}

export function usePlayerById(id: string) {
  return useQuery<PlayerRegistry>({
    queryKey: ["player", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('player_registry')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        console.error("Player by ID Supabase error:", error);
        throw error;
      }
      
      return {
        ...data,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at || data.created_at)
      };
    },
    enabled: !!id,
  });
}

export function useCreatePlayer(orgId: string) {
  return useMutation({
    mutationFn: async (data: InsertPlayerRegistry) => {
      const { data: player, error } = await supabase
        .from('player_registry')
        .insert({ ...data, org_id: orgId })
        .select()
        .single();
      
      if (error) {
        console.error("Create player Supabase error:", error);
        throw error;
      }
      
      return player;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["players", orgId] });
    },
  });
}

export function useUpdatePlayer(orgId: string) {
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<InsertPlayerRegistry> }) => {
      const { data: player, error } = await supabase
        .from('player_registry')
        .update(data)
        .eq('id', id)
        .eq('org_id', orgId)
        .select()
        .single();
      
      if (error) {
        console.error("Update player Supabase error:", error);
        throw error;
      }
      
      return player;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["players", orgId] });
      queryClient.invalidateQueries({ queryKey: ["player", variables.id] });
    },
  });
}

export function useDeletePlayer(orgId: string) {
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('player_registry')
        .delete()
        .eq('id', id)
        .eq('org_id', orgId);
      
      if (error) {
        console.error("Delete player Supabase error:", error);
        throw error;
      }
      
      return { id };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["players", orgId] });
    },
  });
}

// Player Documents Hooks
export function usePlayerDocuments(upid: string) {
  return useQuery<PlayerDocument[]>({
    queryKey: ["playerDocuments", upid],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('player_documents')
        .select('*')
        .eq('upid', upid);
      
      if (error) {
        console.error("Player documents Supabase error:", error);
        throw error;
      }
      
      return data.map(doc => ({
        ...doc,
        createdAt: new Date(doc.created_at),
        updatedAt: new Date(doc.updated_at || doc.created_at)
      }));
    },
    enabled: !!upid,
  });
}

export function useCreatePlayerDocument(upid: string) {
  return useMutation({
    mutationFn: async (data: Omit<InsertPlayerDocument, "upid">) => {
      const { data: document, error } = await supabase
        .from('player_documents')
        .insert({ ...data, upid })
        .select()
        .single();
      
      if (error) {
        console.error("Create player document Supabase error:", error);
        throw error;
      }
      
      return document;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["playerDocuments", upid] });
    },
  });
}

export function useUpdatePlayerDocument(upid: string) {
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<InsertPlayerDocument> }) => {
      const { data: document, error } = await supabase
        .from('player_documents')
        .update(data)
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        console.error("Update player document Supabase error:", error);
        throw error;
      }
      
      return document;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["playerDocuments", upid] });
    },
  });
}

export function useDeletePlayerDocument(upid: string) {
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('player_documents')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error("Delete player document Supabase error:", error);
        throw error;
      }
      
      return { id };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["playerDocuments", upid] });
    },
  });
}
