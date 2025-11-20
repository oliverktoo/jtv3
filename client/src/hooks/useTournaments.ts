import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import { queryClient } from "@/lib/queryClient";
import type { Tournament, InsertTournament } from "@shared/schema";

// Extended tournament type with geographic names and organization info
export type TournamentWithLocation = Tournament & {
  organizationName?: string;
  countyName?: string;
  subCountyName?: string;
  wardName?: string;
};

export function useTournaments(orgId?: string) {
  return useQuery<TournamentWithLocation[]>({
    queryKey: ["tournaments", orgId || "all"],
    queryFn: async () => {
      // Fetch tournaments based on whether orgId is provided:
      // - If orgId provided: tournaments from that specific organization only
      // - If no orgId: ALL tournaments from all organizations (show everything)
      let query = supabase
        .from('tournaments')
        .select(`
          id,
          org_id,
          sport_id,
          name,
          slug,
          season,
          tournament_model,
          status,
          federation_type,
          start_date,
          end_date,
          county_id,
          sub_county_id,
          ward_id,
          custom_rules,
          league_structure,
          is_published,
          created_at,
          updated_at,
          counties(name),
          sub_counties!sub_county_id(name),
          wards!ward_id(name)
        `);
        
      // Apply filtering based on orgId parameter
      // NOTE: participation_model column doesn't exist yet in database
      if (orgId) {
        // Fetch tournaments for specific organization only
        query = query.eq('org_id', orgId);
      }
      // If no orgId provided, fetch ALL tournaments (no filtering applied)
      // This allows viewing all tournaments from all organizations
      
      const { data, error } = await query;
      
      if (error) {
        console.error("Tournaments Supabase error:", error);
        throw error;
      }
      
      return data.map((tournament: any) => ({
        id: tournament.id,
        orgId: tournament.org_id,
        sportId: tournament.sport_id,
        name: tournament.name,
        slug: tournament.slug,
        season: tournament.season,
        tournamentModel: tournament.tournament_model,
        participationModel: tournament.participation_model || 'OPEN', // Default to OPEN until column is added
        status: tournament.status,
        federationType: tournament.federation_type,
        startDate: tournament.start_date,
        endDate: tournament.end_date,
        countyId: tournament.county_id,
        subCountyId: tournament.sub_county_id,
        wardId: tournament.ward_id,
        customRules: tournament.custom_rules,
        leagueStructure: tournament.league_structure,
        isPublished: tournament.is_published,
        createdAt: new Date(tournament.created_at),
        updatedAt: new Date(tournament.updated_at || tournament.created_at),
        // Geographic names for display
        countyName: tournament.counties?.name,
        subCountyName: tournament.sub_counties?.name,
        wardName: tournament.wards?.name,
      }));
    },
    enabled: !!orgId,
  });
}

// Function to get ALL tournaments (similar to useAllTeams)
export function useAllTournaments() {
  return useQuery<TournamentWithLocation[]>({
    queryKey: ["tournaments", "global", "v2"],
    queryFn: async () => {
      // Fetch ALL tournaments from ALL organizations (including organization data)
      const { data, error } = await supabase
        .from('tournaments')
        .select(`
          id,
          org_id,
          sport_id,
          name,
          slug,
          season,
          tournament_model,
          status,
          federation_type,
          start_date,
          end_date,
          county_id,
          sub_county_id,
          ward_id,
          custom_rules,
          league_structure,
          is_published,
          created_at,
          updated_at,
          organizations(name),
          counties(name),
          sub_counties!sub_county_id(name),
          wards!ward_id(name)
        `);
      
      if (error) {
        console.error("All tournaments Supabase error:", error);
        throw error;
      }
      
      return (data || []).map((tournament: any) => ({
        id: tournament.id,
        orgId: tournament.org_id,
        sportId: tournament.sport_id,
        name: tournament.name,
        slug: tournament.slug,
        season: tournament.season,
        tournamentModel: tournament.tournament_model,
        participationModel: tournament.participation_model || 'OPEN', // Default to OPEN until column is added
        status: tournament.status,
        federationType: tournament.federation_type,
        startDate: tournament.start_date,
        endDate: tournament.end_date,
        countyId: tournament.county_id,
        subCountyId: tournament.sub_county_id,
        wardId: tournament.ward_id,
        customRules: tournament.custom_rules,
        leagueStructure: tournament.league_structure,
        isPublished: tournament.is_published,
        createdAt: new Date(tournament.created_at),
        updatedAt: new Date(tournament.updated_at || tournament.created_at),
        organizationName: tournament.org_id === '00000000-0000-0000-0000-000000000000' 
          ? null // System org tournaments show as independent
          : tournament.organizations?.name,
        countyName: tournament.counties?.name,
        subCountyName: tournament.sub_counties?.name,
        wardName: tournament.wards?.name,
      }));
    },
    enabled: true, // Always enabled, no orgId required
  });
}

export function useTournament(id: string) {
  return useQuery<Tournament>({
    queryKey: ["tournament", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tournaments')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        console.error("Tournament Supabase error:", error);
        throw error;
      }
      
      return {
        id: data.id,
        orgId: data.org_id,
        sportId: data.sport_id,
        name: data.name,
        slug: data.slug,
        season: data.season,
        tournamentModel: data.tournament_model,
        participationModel: data.participation_model,
        status: data.status,
        federationType: data.federation_type,
        startDate: data.start_date,
        endDate: data.end_date,
        countyId: data.county_id,
        subCountyId: data.sub_county_id,
        wardId: data.ward_id,
        customRules: data.custom_rules,
        leagueStructure: data.league_structure,
        isPublished: data.is_published,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at || data.created_at),
      };
    },
    enabled: !!id,
  });
}

export function useCreateTournament() {
  return useMutation({
    mutationFn: async (data: InsertTournament) => {
      // System organization ID for truly independent tournaments (allows many-to-many participation)
      const SYSTEM_ORG_ID = '00000000-0000-0000-0000-000000000000';
      
      // Convert camelCase to snake_case for backend API
      const dbData = {
        org_id: data.orgId || SYSTEM_ORG_ID, // Use System org for independent tournaments to enable many-to-many participation
        sport_id: data.sportId,
        name: data.name,
        slug: data.slug,
        season: data.season,
        tournament_model: data.tournamentModel,
        // Note: participation_model column doesn't exist in current DB schema
        status: data.status,
        federation_type: data.federationType,
        start_date: data.startDate,
        end_date: data.endDate,
        county_id: data.countyId,
        sub_county_id: data.subCountyId,
        ward_id: data.wardId,
        custom_rules: data.customRules,
        league_structure: data.leagueStructure,
        is_published: data.isPublished,
      };
      
      console.log('🆕 Creating tournament via Supabase:', dbData);
      
      // Use direct Supabase call instead of backend API
      const { data: createdTournament, error } = await supabase
        .from('tournaments')
        .insert(dbData)
        .select('*')
        .single();
      
      if (error) {
        console.error('❌ Tournament creation error:', error);
        throw new Error(error.message || 'Failed to create tournament');
      }
      
      console.log('✅ Tournament created via Supabase:', createdTournament);
      return createdTournament;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["tournaments", variables.orgId] });
      queryClient.invalidateQueries({ queryKey: ["tournaments", "global", "v2"] });
    },
  });
}

export function useUpdateTournament() {
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<InsertTournament> }) => {
      // System organization ID for truly independent tournaments
      const SYSTEM_ORG_ID = '00000000-0000-0000-0000-000000000000';
      
      // Convert camelCase to snake_case for backend API
      const dbData: any = {};
      if (data.orgId !== undefined) {
        // Use System org for independent tournaments, or provided orgId for organizational ones
        dbData.org_id = data.orgId || SYSTEM_ORG_ID;
      }
      if (data.sportId !== undefined) dbData.sport_id = data.sportId;
      if (data.name !== undefined) dbData.name = data.name;
      if (data.slug !== undefined) dbData.slug = data.slug;
      if (data.season !== undefined) dbData.season = data.season;
      if (data.tournamentModel !== undefined) dbData.tournament_model = data.tournamentModel;
      if (data.status !== undefined) dbData.status = data.status;
      if (data.federationType !== undefined) dbData.federation_type = data.federationType;
      if (data.startDate !== undefined) dbData.start_date = data.startDate;
      if (data.endDate !== undefined) dbData.end_date = data.endDate;
      if (data.countyId !== undefined) dbData.county_id = data.countyId;
      if (data.subCountyId !== undefined) dbData.sub_county_id = data.subCountyId;
      if (data.wardId !== undefined) dbData.ward_id = data.wardId;
      if (data.customRules !== undefined) dbData.custom_rules = data.customRules;
      if (data.leagueStructure !== undefined) dbData.league_structure = data.leagueStructure;
      if (data.isPublished !== undefined) dbData.is_published = data.isPublished;
      
      console.log('🔄 Updating tournament via Supabase:', { id, data: dbData });
      
      // Use direct Supabase call instead of backend API
      const { data: updatedTournament, error } = await supabase
        .from('tournaments')
        .update(dbData)
        .eq('id', id)
        .select('*')
        .single();
      
      if (error) {
        console.error('❌ Tournament update error:', error);
        throw new Error(error.message || 'Failed to update tournament');
      }
      
      console.log('✅ Tournament updated via Supabase:', updatedTournament);
      return updatedTournament;
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["tournament", data.id] });
      queryClient.invalidateQueries({ queryKey: ["tournaments", data.org_id] });
      queryClient.invalidateQueries({ queryKey: ["tournaments", "global", "v2"] });
    },
  });
}

export function useDeleteTournament() {
  return useMutation({
    mutationFn: async ({ id }: { id: string }) => {
      console.log('🗑️ Deleting tournament via Supabase:', id);
      
      // Use direct Supabase call - cascade deletes should be handled by DB constraints
      const { error } = await supabase
        .from('tournaments')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error('❌ Tournament delete error:', error);
        throw new Error(error.message || 'Failed to delete tournament');
      }
      
      console.log('✅ Tournament deleted via Supabase:', id);
      return { id };
    },
    onSuccess: () => {
      // Invalidate all tournament queries since we can view tournaments from all organizations
      queryClient.invalidateQueries({ queryKey: ["tournaments"] });
    },
  });
}
