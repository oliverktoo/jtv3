import { useMutation, useQuery } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import { queryClient } from "../lib/queryClient";
import { 
  TeamTournamentRegistration, 
  InsertTeamTournamentRegistration,
  Team,
  Tournament 
} from "../../../shared/schema";

// Get teams eligible for a tournament based on geographic region
export function useEligibleTeamsForTournament(tournamentId: string) {
  return useQuery({
    queryKey: ["eligible-teams", tournamentId],
    queryFn: async () => {
      if (!tournamentId) return [];
      
      // First get tournament details to understand eligibility criteria
      const { data: tournament, error: tournamentError } = await supabase
        .from('tournaments')
        .select(`
          id,
          name,
          tournament_model,
          participation_model,
          county_id,
          sub_county_id,
          ward_id,
          org_id
        `)
        .eq('id', tournamentId)
        .single();

      if (tournamentError) throw tournamentError;
      if (!tournament) return [];

      // Build eligibility query based on tournament geographic scope
      let teamsQuery = supabase
        .from('teams')
        .select(`
          id,
          name,
          club_name,
          contact_email,
          contact_phone,
          county_id,
          sub_county_id,
          ward_id,
          org_id,
          counties:county_id(name),
          sub_counties:sub_county_id(name),
          wards:ward_id(name)
        `)
        .not('ward_id', 'is', null); // Ward registration is mandatory

      // Determine the effective participation model
      // Handle fallback for tournaments without explicit participation_model
      let effectiveParticipationModel = tournament.participation_model;
      if (!effectiveParticipationModel) {
        // Fallback based on tournament_model for existing tournaments
        switch (tournament.tournament_model) {
          case "LEAGUE":
            effectiveParticipationModel = "ORGANIZATIONAL";
            break;
          case "ADMINISTRATIVE_WARD":
          case "ADMINISTRATIVE_SUB_COUNTY":
          case "ADMINISTRATIVE_COUNTY":
          case "ADMINISTRATIVE_NATIONAL":
            effectiveParticipationModel = "GEOGRAPHIC";
            break;
          case "INTER_COUNTY":
          case "INDEPENDENT":
            effectiveParticipationModel = "OPEN";
            break;
          default:
            effectiveParticipationModel = "ORGANIZATIONAL";
        }
      }

      // Filter based on tournament participation model
      if (effectiveParticipationModel === 'GEOGRAPHIC') {
        if (tournament.ward_id) {
          // Ward-level tournament - only teams from this ward
          teamsQuery = teamsQuery.eq('ward_id', tournament.ward_id);
        } else if (tournament.sub_county_id) {
          // Sub-county tournament - teams from this sub-county
          teamsQuery = teamsQuery.eq('sub_county_id', tournament.sub_county_id);
        } else if (tournament.county_id) {
          // County tournament - teams from this county
          teamsQuery = teamsQuery.eq('county_id', tournament.county_id);
        }
      } else if (effectiveParticipationModel === 'ORGANIZATIONAL') {
        // Organizational tournament - teams must be affiliated with org
        teamsQuery = teamsQuery.eq('org_id', tournament.org_id);
      }
      // For 'OPEN' tournaments (including INDEPENDENT), all teams with ward registration are eligible

      const { data: teams, error } = await teamsQuery;
      
      if (error) throw error;

      // Filter out teams already registered for this tournament
      const { data: registeredTeams } = await supabase
        .from('team_tournament_registrations')
        .select('team_id')
        .eq('tournament_id', tournamentId);

      const registeredTeamIds = new Set(
        registeredTeams?.map((reg: any) => reg.team_id) || []
      );

      return teams?.filter((team: any) => !registeredTeamIds.has(team.id)) || [];
    },
    enabled: !!tournamentId,
  });
}

// Get teams registered for a tournament
export function useTournamentTeams(tournamentId: string) {
  return useQuery({
    queryKey: ["tournament-teams", tournamentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('team_tournament_registrations')
        .select(`
          id,
          registration_status,
          registration_date,
          squad_size,
          jersey_colors,
          coach_name,
          teams:team_id (
            id,
            name,
            club_name,
            contact_email,
            contact_phone,
            counties:county_id(name),
            sub_counties:sub_county_id(name),
            wards:ward_id(name)
          )
        `)
        .eq('tournament_id', tournamentId)
        .order('registration_date', { ascending: true });

      if (error) throw error;
      return data || [];
    },
    enabled: !!tournamentId,
  });
}

// Register team for tournament
export function useRegisterTeamForTournament() {
  return useMutation({
    mutationFn: async (data: InsertTeamTournamentRegistration) => {
      // Map to actual database columns (based on database inspection)
      const registrationData = {
        team_id: data.teamId,
        tournament_id: data.tournamentId,
        representing_org_id: data.representingOrgId || null,
        // Note: affiliation_id column doesn't exist in current DB schema - skipping
        registration_status: data.registrationStatus || 'DRAFT',
        squad_size: data.squadSize || 22,
        jersey_colors: data.jerseyColors || null,
        coach_name: data.coachName || null,
        captain_player_id: data.captainPlayerId || null,
        notes: data.notes || null,
      };

      const { data: registration, error } = await supabase
        .from('team_tournament_registrations')
        .insert(registrationData)
        .select()
        .single();

      if (error) throw error;
      return registration;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["tournament-teams", variables.tournamentId] });
      queryClient.invalidateQueries({ queryKey: ["eligible-teams", variables.tournamentId] });
    },
  });
}

// Remove team from tournament
export function useUnregisterTeamFromTournament() {
  return useMutation({
    mutationFn: async ({ registrationId, tournamentId }: { registrationId: string; tournamentId: string }) => {
      const { error } = await supabase
        .from('team_tournament_registrations')
        .delete()
        .eq('id', registrationId);

      if (error) throw error;
      return { success: true };
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["tournament-teams", variables.tournamentId] });
      queryClient.invalidateQueries({ queryKey: ["eligible-teams", variables.tournamentId] });
    },
  });
}

// Update team tournament registration
export function useUpdateTeamTournamentRegistration() {
  return useMutation({
    mutationFn: async ({ 
      registrationId, 
      data, 
      tournamentId 
    }: { 
      registrationId: string; 
      data: Partial<InsertTeamTournamentRegistration>;
      tournamentId: string;
    }) => {
      const updateData = {
        registration_status: data.registrationStatus,
        squad_size: data.squadSize,
        jersey_colors: data.jerseyColors,
        coach_name: data.coachName,
        captain_player_id: data.captainPlayerId,
        notes: data.notes,
        updated_at: new Date().toISOString(),
      };

      // Remove undefined values
      Object.keys(updateData).forEach(key => 
        updateData[key as keyof typeof updateData] === undefined && 
        delete updateData[key as keyof typeof updateData]
      );

      const { data: registration, error } = await supabase
        .from('team_tournament_registrations')
        .update(updateData)
        .eq('id', registrationId)
        .select()
        .single();

      if (error) throw error;
      return registration;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["tournament-teams", variables.tournamentId] });
    },
  });
}

// Get teams by geographic region for smart search
export function useTeamsByRegion(countyId?: string, subCountyId?: string, wardId?: string) {
  return useQuery({
    queryKey: ["teams-by-region", countyId, subCountyId, wardId],
    queryFn: async () => {
      let query = supabase
        .from('teams')
        .select(`
          id,
          name,
          club_name,
          contact_email,
          contact_phone,
          county_id,
          sub_county_id,
          ward_id,
          counties:county_id(name),
          sub_counties:sub_county_id(name),
          wards:ward_id(name)
        `)
        .not('ward_id', 'is', null); // Only teams with ward registration

      if (wardId) {
        query = query.eq('ward_id', wardId);
      } else if (subCountyId) {
        query = query.eq('sub_county_id', subCountyId);
      } else if (countyId) {
        query = query.eq('county_id', countyId);
      }

      const { data, error } = await query.order('name');
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!(countyId || subCountyId || wardId),
  });
}