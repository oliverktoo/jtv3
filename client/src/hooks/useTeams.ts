import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import { queryClient } from "../lib/queryClient";
import type { Team, InsertTeam } from "../../../shared/schema";

// Get all teams for an organization (independent of tournaments)
export function useTeams(orgId: string) {
  return useQuery({
    queryKey: ["teams", orgId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('teams')
        .select(`
          *,
          organizations:org_id (
            id,
            name
          )
        `)
        .eq('org_id', orgId)
        .order('name');

      if (error) {
        console.error("Get teams Supabase error:", error);
        throw error;
      }

      return data || [];
    },
    enabled: !!orgId,
  });
}

// Get teams registered for a specific tournament
export function useTeamsForTournament(tournamentId: string) {
  return useQuery({
    queryKey: ["teams-for-tournament", tournamentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('team_tournament_registrations')
        .select(`
          *,
          teams:team_id (
            *,
            organizations:org_id (
              id,
              name
            )
          ),
          tournaments:tournament_id (
            id,
            name,
            season
          )
        `)
        .eq('tournament_id', tournamentId)
        .order('registration_date', { ascending: false });

      if (error) {
        console.error("Get teams for tournament Supabase error:", error);
        throw error;
      }

      return data || [];
    },
    enabled: !!tournamentId,
  });
}

export function useAllTeamsByOrg(orgId?: string) {
  return useQuery<Team[]>({
    queryKey: ["teams", "org", orgId],
    queryFn: async () => {
      if (!orgId) return [];
      
      const { data, error } = await supabase
        .from('teams')
        .select('*, organizations(*), tournaments(*)')
        .eq('org_id', orgId);

      if (error) {
        console.error("Teams by org query error:", error);
        throw error;
      }

      return data || [];
    },
    enabled: !!orgId,
  });
}

// Hook to get all teams across all organizations (for global team management)
// Now uses Supabase directly to fetch all real teams
export function useAllTeams() {
  return useQuery<Team[]>({
    queryKey: ["teams", "global"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('teams')
        .select(`
          *,
          organizations:org_id (
            id,
            name
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error("All teams Supabase error:", error);
        throw error;
      }

      return data || [];
    },
    enabled: true,
  });
}

// Create team (independent entity) - then register for tournament separately if needed
export function useCreateTeam(orgId?: string) {
  return useMutation({
    mutationFn: async (data: InsertTeam) => {
      const teamData = {
        name: data.name,
        org_id: data.orgId,
        // Basic team information
        club_name: data.clubName || null,
        founded_date: data.foundedDate || null,
        logo_url: data.logoUrl || null,
        // Contact information
        contact_email: data.contactEmail || null,
        contact_phone: data.contactPhone || null,
        home_venue: data.homeVenue || null,
        description: data.description || null,
        // Team status (independent of tournaments)
        team_status: data.teamStatus || 'ACTIVE',
        max_players: data.maxPlayers || 22,
        // Geographic fields
        county_id: data.countyId || null,
        sub_county_id: data.subCountyId || null,
        ward_id: data.wardId || null,
      };

      const { data: team, error } = await supabase
        .from('teams')
        .insert(teamData)
        .select()
        .single();

      if (error) {
        console.error("Create team Supabase error:", error);
        throw error;
      }

      return team;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teams"] });
      if (orgId) {
        queryClient.invalidateQueries({ queryKey: ["teams", orgId] });
      }
    },
  });
}

export function useCreateTeamsBulk(tournamentId: string) {
  return useMutation({
    mutationFn: async (teams: any[]) => { // Use any[] since we're passing snake_case database format
      console.log("Creating teams in bulk, input data:", teams);
      console.log("Sample team data:", JSON.stringify(teams[0], null, 2));
      
      // Step 1: Create teams in the teams table (without tournament_id)
      const { data: createdTeams, error: teamsError } = await supabase
        .from('teams')
        .insert(teams)
        .select();
      
      if (teamsError) {
        console.error("Create teams bulk Supabase error:", teamsError);
        console.error("Error details:", JSON.stringify(teamsError, null, 2));
        console.error("Teams data that failed:", JSON.stringify(teams, null, 2));
        throw teamsError;
      }

      console.log("Created teams:", createdTeams);

      // Step 2: Register all created teams for the tournament
      if (createdTeams && createdTeams.length > 0) {
        const tournamentRegistrations = createdTeams.map(team => ({
          team_id: team.id, // Use snake_case for database columns
          tournament_id: tournamentId,
          org_id: team.org_id, // Database returns snake_case
          registration_status: 'SUBMITTED' as const,
          squad_size: team.max_players || 22,
          coach_name: team.description || '', // Use description which might contain coach info
        }));

        console.log("Creating tournament registrations:", tournamentRegistrations);

        const { data: registrations, error: registrationError } = await supabase
          .from('team_tournament_registrations')
          .insert(tournamentRegistrations)
          .select();

        if (registrationError) {
          console.error("Create tournament registrations error:", registrationError);
          // Don't throw here as teams were already created successfully
          // Just log the error
        }

        console.log("Created tournament registrations:", registrations);
      }
      
      return createdTeams;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teams"] });
      queryClient.invalidateQueries({ queryKey: ["teams", tournamentId] });
      queryClient.invalidateQueries({ queryKey: ["teams-for-tournament", tournamentId] }); // Add this key
      queryClient.invalidateQueries({ queryKey: ["teamRegistrations", tournamentId] });
    },
  });
}

export function useUpdateTeam() {
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<InsertTeam> }) => {
      const { data: team, error } = await supabase
        .from('teams')
        .update(data)
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        console.error("Update team Supabase error:", error);
        throw error;
      }
      
      return team;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teams"] });
    },
  });
}

// Global team creation (independent of tournaments)
export function useCreateGlobalTeam() {
  return useMutation({
    mutationFn: async (data: Omit<InsertTeam, "tournamentId"> & { orgId?: string }) => {
      const teamData = {
        name: data.name,
        org_id: data.orgId || null,
        // Basic team information using existing database fields
        club_name: data.clubName || null,
        founded_date: data.foundedDate || null,
        logo_url: data.logoUrl || null,
        // Contact information using existing contact_email/contact_phone fields
        contact_email: data.primaryContactEmail || data.contactEmail || null,
        contact_phone: data.primaryContactPhone || data.contactPhone || null,
        home_venue: data.homeVenue || null,
        description: data.description || null,
        // Team configuration
        max_players: data.maxPlayers || 22,
        manager_id: data.managerId || null,
        registration_status: 'PENDING',
        // Geographic fields
        county_id: data.countyId || null,
        sub_county_id: data.subCountyId || null,
        ward_id: data.wardId || null,
        // tournament_id is null for global teams
        tournament_id: null,
      };

      const { data: team, error } = await supabase
        .from('teams')
        .insert(teamData)
        .select()
        .single();

      if (error) {
        console.error("Create global team Supabase error:", error);
        throw error;
      }

      return team;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teams"] });
    },
  });
}

export function useDeleteTeam(orgId?: string) {
  return useMutation({
    mutationFn: async (id: string) => {
      // First, delete all tournament registrations for this team
      const { error: registrationError } = await supabase
        .from('team_tournament_registrations')
        .delete()
        .eq('team_id', id);
      
      if (registrationError) {
        console.error("Delete team registrations Supabase error:", registrationError);
        throw registrationError;
      }

      // Second, update matches to set team references to null instead of deleting them
      const { error: homeMatchError } = await supabase
        .from('matches')
        .update({ home_team_id: null })
        .eq('home_team_id', id);
      
      if (homeMatchError) {
        console.error("Update home team matches Supabase error:", homeMatchError);
        throw homeMatchError;
      }

      const { error: awayMatchError } = await supabase
        .from('matches')
        .update({ away_team_id: null })
        .eq('away_team_id', id);
      
      if (awayMatchError) {
        console.error("Update away team matches Supabase error:", awayMatchError);
        throw awayMatchError;
      }

      // Finally, delete the team
      const { error } = await supabase
        .from('teams')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error("Delete team Supabase error:", error);
        throw error;
      }
      
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teams"] });
      if (orgId) {
        queryClient.invalidateQueries({ queryKey: ["teams", orgId] });
      }
      queryClient.invalidateQueries({ queryKey: ["team-registrations"] });
      queryClient.invalidateQueries({ queryKey: ["teams-for-tournament"] });
    },
  });
}

// ENHANCED FUNCTIONS FOR TOURNAMENT PARTICIPATION MODELS
// These functions provide enhanced functionality while maintaining backward compatibility

/**
 * Get all teams eligible for a tournament based on its participation model
 * Falls back to organizational scoping if participation_model column doesn't exist
 */
export function useEligibleTeamsForTournament(tournamentId: string) {
  return useQuery({
    queryKey: ["eligible-teams-for-tournament", tournamentId],
    queryFn: async () => {
      if (!tournamentId) return [];

      try {
        // First get the tournament to understand its participation model
        const { data: tournament, error: tournamentError } = await supabase
          .from('tournaments')
          .select('id, participation_model, org_id, county_id, sub_county_id, ward_id, tournament_model')
          .eq('id', tournamentId)
          .single();

        if (tournamentError) {
          console.error("Get tournament error:", tournamentError);
          // If participation_model column doesn't exist, fall back to organizational model
          if (tournamentError.code === 'PGRST116' || tournamentError.message?.includes('participation_model')) {
            console.log('Participation model column not found, falling back to organizational scoping');
            return await getTeamsForOrganizationalTournament(tournamentId);
          }
          throw tournamentError;
        }

        if (!tournament) {
          throw new Error('Tournament not found');
        }

        // Check if tournament uses System org (independent tournament with many-to-many participation)
        const SYSTEM_ORG_ID = '00000000-0000-0000-0000-000000000000';
        const isIndependentTournament = tournament.org_id === SYSTEM_ORG_ID;
        
        // If no participation_model (backward compatibility), use org_id to determine model
        const participationModel = isIndependentTournament 
          ? 'OPEN' 
          : (tournament.participation_model || 'ORGANIZATIONAL');

        // Build query based on participation model
        let query = supabase
          .from('teams')
          .select(`
            *,
            organizations:org_id (
              id,
              name
            )
          `)
          .order('name');

        switch (participationModel) {
          case 'OPEN':
            // Independent tournament - all teams can participate (many-to-many)
            // No additional filtering needed
            break;
          case 'ORGANIZATIONAL':
            // Only teams from the organizing organization
            query = query.eq('org_id', tournament.org_id);
            break;

          case 'GEOGRAPHIC':
            // Teams that match geographic criteria
            if (tournament.county_id) {
              query = query.eq('county_id', tournament.county_id);
            }
            if (tournament.sub_county_id) {
              query = query.eq('sub_county_id', tournament.sub_county_id);
            }
            if (tournament.ward_id) {
              query = query.eq('ward_id', tournament.ward_id);
            }
            break;

          default:
            // Default to organizational model for unknown participation models
            query = query.eq('org_id', tournament.org_id);
        }

        const { data, error } = await query;

        if (error) {
          console.error("Get eligible teams error:", error);
          throw error;
        }

        return data || [];

      } catch (error) {
        console.error('Error fetching eligible teams, falling back to organizational model:', error);
        // Fallback to organizational scoping
        return await getTeamsForOrganizationalTournament(tournamentId);
      }
    },
    enabled: !!tournamentId,
  });
}

/**
 * Fallback function for organizational tournament team fetching
 */
async function getTeamsForOrganizationalTournament(tournamentId: string) {
  // Get tournament organization first
  const { data: tournament, error: tournamentError } = await supabase
    .from('tournaments')
    .select('org_id')
    .eq('id', tournamentId)
    .single();

  if (tournamentError || !tournament) {
    throw new Error('Tournament not found');
  }

  // Get teams from that organization
  const { data, error } = await supabase
    .from('teams')
    .select(`
      *,
      organizations:org_id (
        id,
        name
      )
    `)
    .eq('org_id', tournament.org_id)
    .order('name');

  if (error) {
    throw error;
  }

  return data || [];
}

/**
 * Enhanced team registration that validates eligibility based on participation model
 * Falls back to simple registration if enhanced features aren't available
 */
export function useRegisterTeamForTournamentEnhanced() {
  return useMutation({
    mutationFn: async ({ 
      teamId, 
      tournamentId, 
      orgId,
      registrationData 
    }: {
      teamId: string;
      tournamentId: string;
      orgId?: string;
      registrationData?: any;
    }) => {
      console.log('Enhanced team registration:', { teamId, tournamentId, orgId });

      try {
        // Try to get enhanced tournament and team data for validation
        const [tournamentResponse, teamResponse] = await Promise.all([
          supabase
            .from('tournaments')
            .select('id, participation_model, org_id, county_id, sub_county_id, ward_id')
            .eq('id', tournamentId)
            .single(),
          supabase
            .from('teams')
            .select('id, org_id, county_id, sub_county_id, ward_id')
            .eq('id', teamId)
            .single()
        ]);

        if (tournamentResponse.error) {
          console.log('Tournament query failed, falling back to simple registration');
          return await performSimpleRegistration(teamId, tournamentId, orgId, registrationData);
        }

        if (teamResponse.error) {
          throw new Error(`Team not found: ${teamResponse.error.message}`);
        }

        const tournament = tournamentResponse.data;
        const team = teamResponse.data;

        // Validate eligibility based on participation model (if available)
        if (tournament.participation_model) {
          const eligibilityCheck = validateTeamEligibility(team, tournament);
          if (!eligibilityCheck.isEligible) {
            throw new Error(eligibilityCheck.reason || 'Team is not eligible for this tournament');
          }
        }

        // Create the registration with enhanced data
        return await performEnhancedRegistration(team, tournament, registrationData);

      } catch (error) {
        console.error('Enhanced registration failed, falling back to simple registration:', error);
        return await performSimpleRegistration(teamId, tournamentId, orgId, registrationData);
      }
    },
    onSuccess: (_, variables) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ["teams-for-tournament", variables.tournamentId] });
      queryClient.invalidateQueries({ queryKey: ["eligible-teams-for-tournament", variables.tournamentId] });
      queryClient.invalidateQueries({ queryKey: ["teamRegistrations", variables.tournamentId] });
    },
  });
}

/**
 * Enhanced registration with full validation
 */
async function performEnhancedRegistration(team: any, tournament: any, registrationData?: any) {
  const registrationPayload = {
    team_id: team.id,
    tournament_id: tournament.id,
    org_id: team.org_id,
    registration_status: 'SUBMITTED',
    squad_size: registrationData?.squadSize || 22,
    coach_name: registrationData?.coachName || '',
    jersey_colors: registrationData?.jerseyColors || '',
    notes: registrationData?.notes || `Enhanced registration for ${tournament.participation_model || 'ORGANIZATIONAL'} tournament`,
    ...registrationData
  };

  const { data, error } = await supabase
    .from('team_tournament_registrations')
    .insert(registrationPayload)
    .select()
    .single();

  if (error) {
    console.error("Enhanced registration error:", error);
    throw error;
  }

  return data;
}

/**
 * Simple registration fallback
 */
async function performSimpleRegistration(teamId: string, tournamentId: string, orgId?: string, registrationData?: any) {
  // Get team data for orgId if not provided
  let teamOrgId = orgId;
  if (!teamOrgId) {
    const { data: team } = await supabase
      .from('teams')
      .select('org_id')
      .eq('id', teamId)
      .single();
    teamOrgId = team?.org_id;
  }

  const registrationPayload = {
    team_id: teamId,
    tournament_id: tournamentId,
    org_id: teamOrgId,
    registration_status: 'SUBMITTED',
    squad_size: registrationData?.squadSize || 22,
    coach_name: registrationData?.coachName || '',
    jersey_colors: registrationData?.jerseyColors || '',
    notes: registrationData?.notes || 'Simple registration (fallback)',
    ...registrationData
  };

  const { data, error } = await supabase
    .from('team_tournament_registrations')
    .insert(registrationPayload)
    .select()
    .single();

  if (error) {
    console.error("Simple registration error:", error);
    throw error;
  }

  return data;
}

/**
 * Client-side eligibility validation
 */
function validateTeamEligibility(team: any, tournament: any): { isEligible: boolean; reason?: string } {
  const SYSTEM_ORG_ID = '00000000-0000-0000-0000-000000000000';
  const isIndependentTournament = tournament.org_id === SYSTEM_ORG_ID;
  
  // Independent tournaments (System org) allow any team (many-to-many participation)
  if (isIndependentTournament) {
    return { isEligible: true };
  }
  
  const participationModel = tournament.participation_model || 'ORGANIZATIONAL';
  
  switch (participationModel) {
    case 'ORGANIZATIONAL':
      if (!team.org_id) {
        return { isEligible: false, reason: 'Team must belong to an organization for this tournament' };
      }
      if (team.org_id !== tournament.org_id) {
        return { isEligible: false, reason: 'Team must belong to the organizing organization' };
      }
      return { isEligible: true };

    case 'GEOGRAPHIC':
      if (tournament.county_id && team.county_id !== tournament.county_id) {
        return { isEligible: false, reason: 'Team is not in the correct county for this tournament' };
      }
      if (tournament.sub_county_id && team.sub_county_id !== tournament.sub_county_id) {
        return { isEligible: false, reason: 'Team is not in the correct sub-county for this tournament' };
      }
      if (tournament.ward_id && team.ward_id !== tournament.ward_id) {
        return { isEligible: false, reason: 'Team is not in the correct ward for this tournament' };
      }
      return { isEligible: true };

    case 'OPEN':
      return { isEligible: true };

    default:
      // Default to organizational model
      return team.org_id === tournament.org_id 
        ? { isEligible: true }
        : { isEligible: false, reason: 'Team organization does not match tournament organization' };
  }
}
