// Enhanced Eligibility Engine for Tournament Participation Models
// Supports organizational, geographic, and open tournament participation

import { db } from './db';
import { teams, tournaments, counties, subCounties, wards } from '../shared/schema';
import { eq, and, or, isNull } from 'drizzle-orm';

export interface EligibilityResult {
  isEligible: boolean;
  reason?: string;
  restrictions?: string[];
}

/**
 * Check if a team is eligible to register for a tournament based on participation model
 */
export async function checkTeamTournamentEligibility(
  teamId: string, 
  tournamentId: string
): Promise<EligibilityResult> {
  
  // Get team and tournament data
  const [team] = await db
    .select()
    .from(teams)
    .where(eq(teams.id, teamId));

  const [tournament] = await db
    .select()
    .from(tournaments)
    .where(eq(tournaments.id, tournamentId));

  if (!team) {
    return { isEligible: false, reason: 'Team not found' };
  }

  if (!tournament) {
    return { isEligible: false, reason: 'Tournament not found' };
  }

  // Check eligibility based on participation model
  switch (tournament.participationModel) {
    case 'ORGANIZATIONAL':
      return checkOrganizationalEligibility(team, tournament);
      
    case 'GEOGRAPHIC':
      return checkGeographicEligibility(team, tournament);
      
    case 'OPEN':
      return checkOpenEligibility(team, tournament);
      
    default:
      return { isEligible: false, reason: 'Invalid participation model' };
  }
}

/**
 * ORGANIZATIONAL: Teams must be from the organizing organization (leagues)
 */
function checkOrganizationalEligibility(team: any, tournament: any): EligibilityResult {
  // Team must belong to an organization
  if (!team.orgId) {
    return { 
      isEligible: false, 
      reason: 'Team must belong to an organization for league participation',
      restrictions: ['ORGANIZATION_REQUIRED']
    };
  }

  // Team organization must match tournament organization
  if (team.orgId !== tournament.orgId) {
    return { 
      isEligible: false, 
      reason: 'Team must belong to the organizing organization',
      restrictions: ['WRONG_ORGANIZATION']
    };
  }

  return { isEligible: true };
}

/**
 * GEOGRAPHIC: Teams based on geographic eligibility (administrative tournaments)
 */
function checkGeographicEligibility(team: any, tournament: any): EligibilityResult {
  const restrictions: string[] = [];

  // Check county eligibility
  if (tournament.countyId && team.countyId !== tournament.countyId) {
    restrictions.push('WRONG_COUNTY');
  }

  // Check sub-county eligibility  
  if (tournament.subCountyId && team.subCountyId !== tournament.subCountyId) {
    restrictions.push('WRONG_SUB_COUNTY');
  }

  // Check ward eligibility
  if (tournament.wardId && team.wardId !== tournament.wardId) {
    restrictions.push('WRONG_WARD');
  }

  if (restrictions.length > 0) {
    return {
      isEligible: false,
      reason: 'Team does not meet geographic eligibility requirements',
      restrictions
    };
  }

  return { isEligible: true };
}

/**
 * OPEN: Any team can participate (independent tournaments)
 */
function checkOpenEligibility(team: any, tournament: any): EligibilityResult {
  // No restrictions - all teams can participate
  return { isEligible: true };
}

/**
 * Get all eligible teams for a tournament based on its participation model
 */
export async function getEligibleTeamsForTournament(tournamentId: string) {
  const [tournament] = await db
    .select()
    .from(tournaments)
    .where(eq(tournaments.id, tournamentId));

  if (!tournament) {
    throw new Error('Tournament not found');
  }

  switch (tournament.participationModel) {
    case 'ORGANIZATIONAL':
      // Only teams from the organizing organization
      return await db
        .select()
        .from(teams)
        .where(eq(teams.orgId, tournament.orgId));

    case 'GEOGRAPHIC':
      // Teams that match geographic criteria
      const conditions = [];
      
      if (tournament.countyId) {
        conditions.push(eq(teams.countyId, tournament.countyId));
      }
      
      if (tournament.subCountyId) {
        conditions.push(eq(teams.subCountyId, tournament.subCountyId));
      }
      
      if (tournament.wardId) {
        conditions.push(eq(teams.wardId, tournament.wardId));
      }

      if (conditions.length > 0) {
        return await db
          .select()
          .from(teams)
          .where(and(...conditions));
      } else {
        // No geographic restrictions set - return all teams
        return await db.select().from(teams);
      }

    case 'OPEN':
      // All teams are eligible
      return await db.select().from(teams);

    default:
      throw new Error('Invalid participation model');
  }
}

/**
 * Validate tournament participation model based on tournament type
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

/**
 * Migration helper: Update existing tournaments with appropriate participation models
 */
export async function migrateParticipationModels() {
  const tournamentUpdates = [
    // League tournaments should be organizational
    {
      tournamentModel: 'LEAGUE',
      participationModel: 'ORGANIZATIONAL'
    },
    // Geographic tournaments should allow geographic eligibility
    {
      tournamentModel: ['ADMINISTRATIVE_WARD', 'ADMINISTRATIVE_SUB_COUNTY', 'ADMINISTRATIVE_COUNTY', 'ADMINISTRATIVE_NATIONAL'],
      participationModel: 'GEOGRAPHIC'
    },
    // Open tournaments should allow any team
    {
      tournamentModel: ['INTER_COUNTY', 'INDEPENDENT'],
      participationModel: 'OPEN'
    }
  ];

  for (const update of tournamentUpdates) {
    const models = Array.isArray(update.tournamentModel) ? update.tournamentModel : [update.tournamentModel];
    
    for (const model of models) {
      await db
        .update(tournaments)
        .set({ participationModel: update.participationModel as any })
        .where(eq(tournaments.tournamentModel, model as any));
    }
  }
  
  console.log('Tournament participation models migrated successfully');
}