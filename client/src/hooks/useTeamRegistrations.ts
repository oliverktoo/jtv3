import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import { apiRequest } from "@/lib/queryClient";
import type { 
  InsertTeamTournamentRegistration, 
  UpdateTeamTournamentRegistration,
  TeamTournamentRegistration 
} from "@shared/schema";

/**
 * Tournament Model Business Rules
 * 
 * LEAGUE: Only one league per organization
 * INTER_COUNTY: Only one inter-county tournament per organization  
 * ADMINISTRATIVE_*: Only one tournament per administrative level per organization
 * INDEPENDENT: No restrictions - can participate in multiple
 */
export const TOURNAMENT_BUSINESS_RULES = {
  LEAGUE: {
    allowMultiple: false,
    description: "A team can only participate in one league per organization"
  },
  INTER_COUNTY: {
    allowMultiple: false,
    description: "A team can only participate in one inter-county tournament per organization"
  },
  ADMINISTRATIVE_WARD: {
    allowMultiple: false,
    description: "A team can only participate in one ward tournament per organization"
  },
  ADMINISTRATIVE_SUB_COUNTY: {
    allowMultiple: false,
    description: "A team can only participate in one sub-county tournament per organization"
  },
  ADMINISTRATIVE_COUNTY: {
    allowMultiple: false,
    description: "A team can only participate in one county tournament per organization"
  },
  ADMINISTRATIVE_NATIONAL: {
    allowMultiple: false,
    description: "A team can only participate in one national tournament per organization"
  },
  INDEPENDENT: {
    allowMultiple: true,
    description: "Teams can participate in multiple independent tournaments"
  }
} as const;

/**
 * Check if a team can be registered for a specific tournament based on business rules
 */
export async function validateTeamRegistrationEligibility(
  teamId: string, 
  tournamentId: string, 
  orgId: string
): Promise<{ canRegister: boolean; reason?: string; conflictTournament?: any }> {
  try {
    // Get target tournament info
    const { data: targetTournament, error: tournamentError } = await supabase
      .from('tournaments')
      .select('id, name, tournament_model, org_id, status')
      .eq('id', tournamentId)
      .single();

    if (tournamentError || !targetTournament) {
      return { canRegister: false, reason: "Tournament not found" };
    }

    // Get existing active registrations for this team in the same organization
    const { data: existingRegistrations, error: checkError } = await supabase
      .from('team_tournament_registrations')
      .select(`
        id,
        tournament_id,
        registration_status,
        tournaments!inner (
          id,
          name,
          org_id,
          status,
          tournament_model
        )
      `)
      .eq('team_id', teamId)
      .eq('representing_org_id', orgId)
      .in('registration_status', ['DRAFT', 'SUBMITTED', 'APPROVED'])
      .neq('tournament_id', tournamentId);

    if (checkError) {
      console.error('Registration eligibility check failed:', checkError);
      return { canRegister: false, reason: "Failed to check existing registrations: " + checkError.message };
    }

    // Filter for active registrations only
    const activeRegistrations = existingRegistrations?.filter((reg: any) => 
      reg.tournaments?.status === 'ACTIVE' || reg.tournaments?.status === 'REGISTRATION'
    ) || [];

    if (activeRegistrations.length === 0) {
      return { canRegister: true };
    }

    const targetModel = targetTournament.tournament_model;
    const businessRule = TOURNAMENT_BUSINESS_RULES[targetModel as keyof typeof TOURNAMENT_BUSINESS_RULES];

    // If this tournament model allows multiple registrations, it's always allowed
    if (businessRule?.allowMultiple) {
      return { canRegister: true };
    }

    // Check for conflicts based on tournament model
    let conflictingRegistration = null;

    if (targetModel === 'LEAGUE') {
      conflictingRegistration = activeRegistrations.find((reg: any) => 
        reg.tournaments?.tournament_model === 'LEAGUE'
      );
    } else if (targetModel === 'INTER_COUNTY') {
      conflictingRegistration = activeRegistrations.find((reg: any) => 
        reg.tournaments?.tournament_model === 'INTER_COUNTY'
      );
    } else if (targetModel.startsWith('ADMINISTRATIVE_')) {
      conflictingRegistration = activeRegistrations.find((reg: any) => 
        reg.tournaments?.tournament_model === targetModel
      );
    }

    if (conflictingRegistration) {
      return {
        canRegister: false,
        reason: businessRule?.description || `Cannot register for multiple ${targetModel.toLowerCase()} tournaments`,
        conflictTournament: conflictingRegistration.tournaments
      };
    }

    return { canRegister: true };
  } catch (error) {
    console.error("Validation error:", error);
    return { canRegister: false, reason: "Validation failed" };
  }
}

// Get team registrations for a specific tournament
export function useTeamRegistrations(tournamentId: string) {
  return useQuery({
    queryKey: ["team-registrations", tournamentId],
    queryFn: async () => {
      if (!tournamentId) {
        return [];
      }
      
      try {
        const response = await apiRequest('GET', `/api/tournaments/${tournamentId}/team-registrations`);
        // Handle API response structure - extract data property if it exists
        const data = response?.data || response;
        return Array.isArray(data) ? data : [];
      } catch (error) {
        console.error("Get team registrations API error:", error);
        // Fallback to Supabase if API fails
        try {
          const { data: fallbackData, error: supabaseError } = await supabase
            .from('team_tournament_registrations')
            .select(`
              *,
              teams:team_id (
                id,
                name,
                club_name,
                contact_email,
                contact_phone,
                home_venue,
                logo_url,
                organizations:org_id (
                  id,
                  name
                )
              ),
              tournaments:tournament_id (
                id,
                name,
                season,
                status
              )
            `)
            .eq('tournament_id', tournamentId)
            .order('registration_date', { ascending: false });

          if (supabaseError) {
            console.error("Fallback Supabase error:", supabaseError);
            return [];
          }
          return Array.isArray(fallbackData) ? fallbackData : [];
        } catch (fallbackError) {
          console.error("Both API and Supabase failed:", fallbackError);
          return [];
        }
      }
    },
    enabled: !!tournamentId,
  });
}

// Get all registrations for a specific team
export function useTeamTournamentHistory(teamId: string) {
  return useQuery({
    queryKey: ["team-tournament-history", teamId],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('team_tournament_registrations')
          .select(`
            *,
            tournaments:tournament_id (
              id,
              name,
              season,
              status,
              start_date,
              end_date,
              organizations:org_id (
                id,
                name
              )
            )
          `)
          .eq('team_id', teamId)
          .order('registration_date', { ascending: false });

        if (error) {
          // If table doesn't exist, return empty array instead of throwing
          if (
            error.code === 'PGRST116' || 
            error.code === '42P01' ||
            error.message?.includes('404') || 
            error.message?.includes('does not exist') ||
            error.message?.includes('relation') ||
            error.details?.includes('does not exist')
          ) {
            console.warn("Team tournament registrations table doesn't exist yet, returning empty array");
            return [];
          }
          console.error("Get team tournament history Supabase error:", error);
          throw error;
        }

        return data || [];
      } catch (error: any) {
        // Handle network errors, 404s, or other issues - return empty array instead of failing
        console.warn("Failed to fetch team tournament history (table may not exist), returning empty array:", error);
        return [];
      }
    },
    enabled: !!teamId,
  });
}

// Get registrations by organization (with business rule checking)
export function useOrgTeamRegistrations(orgId: string) {
  return useQuery({
    queryKey: ["org-team-registrations", orgId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('team_tournament_registrations')
        .select(`
          *,
          teams:team_id (
            id,
            name,
            club_name,
            organizations:org_id (
              id,
              name
            )
          ),
          tournaments:tournament_id (
            id,
            name,
            season,
            status,
            organizations:org_id (
              id,
              name
            )
          )
        `)
        .eq('representing_org_id', orgId)
        .order('registration_date', { ascending: false });

      if (error) {
        console.error("Get org team registrations Supabase error:", error);
        throw error;
      }

      return data || [];
    },
    enabled: !!orgId,
  });
}

// Register team for tournament
export function useRegisterTeamForTournament() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: InsertTeamTournamentRegistration) => {
      // First check for duplicate registration (same team + same tournament)
      if (data.teamId && data.tournamentId) {
        const { data: existingRegistration, error: duplicateError } = await supabase
          .from('team_tournament_registrations')
          .select('id')
          .eq('team_id', data.teamId)
          .eq('tournament_id', data.tournamentId)
          .limit(1);

        if (duplicateError) {
          console.error("Error checking duplicate registration:", duplicateError);
          throw new Error("Failed to validate registration: " + duplicateError.message);
        }

        if (existingRegistration && existingRegistration.length > 0) {
          throw new Error("This team is already registered for this tournament.");
        }
      }

      // Use the centralized validation logic for business rules
      if (data.teamId && data.representingOrgId && data.tournamentId) {
        const validation = await validateTeamRegistrationEligibility(
          data.teamId, 
          data.tournamentId, 
          data.representingOrgId
        );

        if (!validation.canRegister) {
          let errorMessage = validation.reason || "Registration not allowed";
          
          if (validation.conflictTournament) {
            errorMessage += ` (Conflicts with "${validation.conflictTournament.name}")`;
          }
          
          throw new Error(errorMessage);
        }
      }

      // Proceed with registration
      const registrationData = {
        team_id: data.teamId,
        tournament_id: data.tournamentId,
        representing_org_id: data.representingOrgId,
        registration_status: data.registrationStatus || 'DRAFT',
        squad_size: data.squadSize || 22,
        jersey_colors: data.jerseyColors || null,
        captain_player_id: data.captainPlayerId || null,
        coach_name: data.coachName || null,
        registered_by: data.registeredBy || null,
        notes: data.notes || null,
      };

      const { data: registration, error } = await supabase
        .from('team_tournament_registrations')
        .insert(registrationData)
        .select(`
          *,
          teams:team_id (
            id,
            name,
            club_name
          ),
          tournaments:tournament_id (
            id,
            name,
            season
          )
        `)
        .single();

      if (error) {
        console.error("Register team for tournament Supabase error:", error);
        throw error;
      }

      return registration;
    },
    onSuccess: (data) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ["team-registrations"] });
      queryClient.invalidateQueries({ queryKey: ["team-tournament-history"] });
      queryClient.invalidateQueries({ queryKey: ["org-team-registrations"] });
      queryClient.invalidateQueries({ queryKey: ["teams"] });
    },
  });
}

// Update team registration status
export function useUpdateTeamRegistration() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateTeamTournamentRegistration }) => {
      const updateData: any = {
        ...data,
        updated_at: new Date().toISOString(),
      };

      // Add approval/rejection timestamps based on status
      if (data.registrationStatus === 'APPROVED') {
        updateData.approval_date = new Date().toISOString();
        updateData.rejection_date = null;
        updateData.rejection_reason = null;
      } else if (data.registrationStatus === 'REJECTED') {
        updateData.rejection_date = new Date().toISOString();
        updateData.approval_date = null;
      }

      const { data: registration, error } = await supabase
        .from('team_tournament_registrations')
        .update(updateData)
        .eq('id', id)
        .select(`
          *,
          teams:team_id (
            id,
            name,
            club_name
          ),
          tournaments:tournament_id (
            id,
            name,
            season
          )
        `)
        .single();

      if (error) {
        console.error("Update team registration Supabase error:", error);
        throw error;
      }

      return registration;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team-registrations"] });
      queryClient.invalidateQueries({ queryKey: ["team-tournament-history"] });
      queryClient.invalidateQueries({ queryKey: ["org-team-registrations"] });
    },
  });
}

// Withdraw team from tournament
export function useWithdrawTeamFromTournament() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (registrationId: string) => {
      const { error } = await supabase
        .from('team_tournament_registrations')
        .delete()
        .eq('id', registrationId);

      if (error) {
        console.error("Withdraw team from tournament Supabase error:", error);
        throw error;
      }

      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team-registrations"] });
      queryClient.invalidateQueries({ queryKey: ["team-tournament-history"] });
      queryClient.invalidateQueries({ queryKey: ["org-team-registrations"] });
      queryClient.invalidateQueries({ queryKey: ["teams"] });
    },
  });
}

// Get available teams for tournament registration (all teams are global and available)
export function useAvailableTeamsForTournament(tournamentId: string, orgId: string) {
  return useQuery({
    queryKey: ["available-teams", tournamentId], // Remove orgId from key since teams are global
    queryFn: async () => {
      // Query ALL active teams globally - they can register for any tournament
      const { data: allTeams, error: teamsError } = await supabase
        .from('teams')
        .select(`
          id,
          name,
          club_name,
          home_venue,
          contact_email,
          contact_phone,
          registration_status,
          logo_url,
          county_id,
          sub_county_id,
          ward_id,
          created_at
        `)
        .eq('registration_status', 'ACTIVE');

      if (teamsError) {
        console.error("Get teams from teams table error:", teamsError);
        console.error("Error details:", { 
          message: teamsError.message, 
          details: teamsError.details, 
          hint: teamsError.hint,
          code: teamsError.code 
        });
        
        // Try an even simpler query to test table existence
        console.log("Attempting simplified teams table query...");
        const { data: simpleTeams, error: simpleError } = await supabase
          .from('teams')
          .select('id, name')
          .limit(10); // Get more teams since they're global
          
        if (simpleError) {
          console.error("Even simple teams query failed:", simpleError);
          // Return mock global teams if database is completely inaccessible
          console.warn("Using fallback mock global teams data");
          return [
            {
              id: "global-team-1",
              name: "Gor Mahia FC",
              club_name: "Gor Mahia Football Club",
              contact_email: "info@gormahia.com",
              contact_phone: "+254700111111",
              home_venue: "Nyayo Stadium",
              eligibilityReason: "Global team available for any tournament"
            },
            {
              id: "global-team-2", 
              name: "AFC Leopards",
              club_name: "AFC Leopards Sports Club",
              contact_email: "info@afcleopards.com",
              contact_phone: "+254700222222", 
              home_venue: "Nyayo Stadium",
              eligibilityReason: "Global team available for any tournament"
            },
            {
              id: "global-team-3",
              name: "Tusker FC", 
              club_name: "Tusker Football Club",
              contact_email: "info@tuskerfc.com",
              contact_phone: "+254700333333",
              home_venue: "Ruaraka Sports Club",
              eligibilityReason: "Global team available for any tournament"
            }
          ];
        } else {
          console.log("Simple teams query succeeded, using global teams results.");
          return simpleTeams.map(team => ({
            ...team,
            club_name: team.name,
            contact_email: "contact@team.com",
            contact_phone: "+254700000000",
            home_venue: "TBD",
            eligibilityReason: "Global team available for any tournament"
          }));
        }
      }

      if (!allTeams || allTeams.length === 0) {
        console.log("No active teams found in the system");
        return [];
      }

      // Transform the team data to match expected format
      const availableTeams = allTeams.map(team => ({
        ...team,
        // Map from actual database field names (snake_case) to expected format
        club_name: team.club_name || team.name,
        contact_email: team.contact_email || "contact@team.com",
        contact_phone: team.contact_phone || "+254700000000", 
        home_venue: team.home_venue || "TBD",
        logo_url: team.logo_url || null,
        county_id: team.county_id || null,
        sub_county_id: team.sub_county_id || null,
        ward_id: team.ward_id || null,
        team_status: team.registration_status, // Map registration_status to team_status
        eligibilityReason: "Global team available for tournament registration"
      }));

      console.log(`Found ${availableTeams.length} global teams available for tournament registration`);
      return availableTeams;
    },
    enabled: !!(tournamentId && orgId),
  });
}

/**
 * Get detailed eligibility information for a team in a specific tournament
 */
export function useTeamTournamentEligibility(teamId: string, tournamentId: string, orgId: string) {
  return useQuery({
    queryKey: ["team-tournament-eligibility", teamId, tournamentId, orgId],
    queryFn: async () => {
      if (!teamId || !tournamentId || !orgId) {
        return { canRegister: false, reason: "Missing required parameters" };
      }
      
      return await validateTeamRegistrationEligibility(teamId, tournamentId, orgId);
    },
    enabled: !!(teamId && tournamentId && orgId),
  });
}