import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import { queryClient } from "@/lib/queryClient";

export interface Round {
  id: string;
  stageId?: string;
  groupId?: string;
  number: number;
  leg: number;
  name?: string;
  createdAt: Date;
}

// Get all rounds for a stage
export function useRounds(stageId?: string, groupId?: string) {
  return useQuery<Round[]>({
    queryKey: ["rounds", stageId, groupId],
    queryFn: async () => {
      let query = supabase
        .from('rounds')
        .select('*');
      
      if (stageId) {
        query = query.eq('stage_id', stageId);
      }
      
      if (groupId) {
        query = query.eq('group_id', groupId);
      }
      
      const { data, error } = await query.order('number', { ascending: true });
      
      if (error) {
        console.error("Rounds Supabase error:", error);
        throw error;
      }
      
      return (data || []).map(round => ({
        ...round,
        createdAt: new Date(round.created_at),
        stageId: round.stage_id,
        groupId: round.group_id
      }));
    },
    enabled: !!(stageId || groupId),
  });
}

// Create a new round
export function useCreateRound() {
  return useMutation({
    mutationFn: async (data: {
      stageId?: string;
      groupId?: string;
      number: number;
      leg?: number;
      name?: string;
    }) => {
      const { data: round, error } = await supabase
        .from('rounds')
        .insert({
          stage_id: data.stageId || null,
          group_id: data.groupId || null,
          number: data.number,
          leg: data.leg || 1,
          name: data.name
        })
        .select()
        .single();
      
      if (error) {
        console.error("Create round Supabase error:", error);
        throw error;
      }
      
      return round;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["rounds", data.stage_id, data.group_id] });
      queryClient.invalidateQueries({ queryKey: ["matches"] });
    },
  });
}

// Update round
export function useUpdateRound() {
  return useMutation({
    mutationFn: async ({ 
      id, 
      data 
    }: { 
      id: string; 
      data: Partial<{ number: number; leg: number; name: string }> 
    }) => {
      const { data: round, error } = await supabase
        .from('rounds')
        .update(data)
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        console.error("Update round Supabase error:", error);
        throw error;
      }
      
      return round;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["rounds", data.stage_id, data.group_id] });
    },
  });
}

// Delete round
export function useDeleteRound() {
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('rounds')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error("Delete round Supabase error:", error);
        throw error;
      }
      
      return { id };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rounds"] });
      queryClient.invalidateQueries({ queryKey: ["matches"] });
    },
  });
}