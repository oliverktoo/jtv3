// Enhanced team hooks supporting new participation models
// Provides backward compatibility while adding cross-organizational tournament support

import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import { queryClient } from "../lib/queryClient";

/**
 * Get all teams eligible for a tournament based on its participation model
 */
export function useEligibleTeamsForTournament(tournamentId: string) {
  return useQuery({
    queryKey: ["eligible-teams-for-tournament", tournamentId],
    queryFn: async () => {
      if (!tournamentId) return [];

      // First get the tournament to understand its participation model
      const { data: tournament, error: tournamentError } = await supabase
        .from('tournaments')
        .select('id, participation_model, org_id, county_id, sub_county_id, ward_id, tournament_model')
        .eq('id', tournamentId)
        .single();

      if (tournamentError) {
        console.error("Get tournament error:", tournamentError);
        throw tournamentError;
      }

      if (!tournament) {
        throw new Error('Tournament not found');
      }

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

      // Build query based on effective participation model
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

      switch (effectiveParticipationModel) {
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

        case 'OPEN':
          // All teams are eligible - no additional filtering
          break;

        default:
          // Default to organizational model for backward compatibility
          query = query.eq('org_id', tournament.org_id);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Get eligible teams error:", error);
        throw error;
      }

      return data || [];
    },
    enabled: !!tournamentId,
  });
}

/**
 * Get teams already registered for a tournament (maintains existing functionality)
 */
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
            season,
            participation_model,
            tournament_model
          )
        `)
        .eq('tournament_id', tournamentId)
        .order('registration_date', { ascending: false });

      if (error) {
        console.error("Get teams for tournament error:", error);
        throw error;
      }

      return data || [];
    },
    enabled: !!tournamentId,
  });
}

/**
 * Enhanced team registration that validates eligibility based on participation model
 */
export function useRegisterTeamForTournament() {
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
      console.log('Registering team for tournament:', { teamId, tournamentId, orgId });

      // Get tournament and team data to validate eligibility
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
        throw new Error(`Tournament not found: ${tournamentResponse.error.message}`);
      }

      if (teamResponse.error) {
        throw new Error(`Team not found: ${teamResponse.error.message}`);
      }

      const tournament = tournamentResponse.data;
      const team = teamResponse.data;

      // Validate eligibility based on participation model
      const eligibilityCheck = validateTeamEligibility(team, tournament);
      if (!eligibilityCheck.isEligible) {
        throw new Error(eligibilityCheck.reason || 'Team is not eligible for this tournament');
      }

      // Create the registration
      const registrationPayload = {
        team_id: teamId,
        tournament_id: tournamentId,
        org_id: team.org_id || orgId, // Use team's org or provided org
        registration_status: 'SUBMITTED',
        squad_size: registrationData?.squadSize || 22,
        coach_name: registrationData?.coachName || '',
        jersey_colors: registrationData?.jerseyColors || '',
        notes: registrationData?.notes || '',
        ...registrationData
      };

      const { data, error } = await supabase
        .from('team_tournament_registrations')
        .insert(registrationPayload)
        .select()
        .single();

      if (error) {
        console.error("Registration error:", error);
        throw error;
      }

      return data;
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
 * Client-side eligibility validation
 */
function validateTeamEligibility(team: any, tournament: any): { isEligible: boolean; reason?: string } {
  switch (tournament.participation_model) {
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

/**
 * Hook to get participation model options for tournament creation
 */
export function useParticipationModelOptions() {
  return [
    {
      value: 'ORGANIZATIONAL',
      label: 'Organizational',
      description: 'Only teams from your organization can participate (typical for leagues)'
    },
    {
      value: 'GEOGRAPHIC', 
      label: 'Geographic',
      description: 'Teams from specific geographic areas can participate (county, sub-county, ward)'
    },
    {
      value: 'OPEN',
      label: 'Open',
      description: 'Any team can participate regardless of organization or location'
    }
  ];
}

/**
 * Helper to get recommended participation model based on tournament type
 */
export function getRecommendedParticipationModel(tournamentModel: string): string {
  switch (tournamentModel) {
    case 'LEAGUE':
      return 'ORGANIZATIONAL';
    case 'ADMINISTRATIVE_WARD':
    case 'ADMINISTRATIVE_SUB_COUNTY':
    case 'ADMINISTRATIVE_COUNTY':
    case 'ADMINISTRATIVE_NATIONAL':
      return 'GEOGRAPHIC';
    case 'INTER_COUNTY':
    case 'INDEPENDENT':
      return 'OPEN';
    default:
      return 'ORGANIZATIONAL';
  }
}