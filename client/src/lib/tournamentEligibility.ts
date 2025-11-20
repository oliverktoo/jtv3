/**
 * Tournament Team Eligibility Engine
 * Determines if teams can register for tournaments based on geographic constraints
 */

import { Tournament, Team } from "../../../shared/schema";

export interface EligibilityCheck {
  eligible: boolean;
  reason?: string;
  geographicMatch: boolean;
  organizationalMatch: boolean;
}

/**
 * Check if a team is eligible for a tournament based on participation model and geographic constraints
 */
export function checkTeamEligibility(
  team: Pick<Team, 'wardId' | 'subCountyId' | 'countyId' | 'orgId'>,
  tournament: Pick<Tournament, 'participationModel' | 'tournamentModel' | 'wardId' | 'subCountyId' | 'countyId' | 'orgId'>
): EligibilityCheck {
  
  // Ward registration is mandatory for all teams
  if (!team.wardId) {
    return {
      eligible: false,
      reason: "Team must have ward registration to participate in any tournament",
      geographicMatch: false,
      organizationalMatch: false,
    };
  }

  let geographicMatch = false;
  let organizationalMatch = false;

  // Check based on participation model
  switch (tournament.participationModel) {
    case "ORGANIZATIONAL":
      // Teams must be affiliated with the organizing organization
      organizationalMatch = team.orgId === tournament.orgId;
      geographicMatch = true; // Geographic constraints don't apply for organizational tournaments
      
      if (!organizationalMatch) {
        return {
          eligible: false,
          reason: "Team must be affiliated with the organizing organization",
          geographicMatch,
          organizationalMatch,
        };
      }
      break;

    case "GEOGRAPHIC":
      // Teams must be from the tournament's geographic region
      organizationalMatch = true; // Organizational constraints don't apply for geographic tournaments
      
      if (tournament.wardId) {
        // Ward-level tournament - teams must be from the specific ward
        geographicMatch = team.wardId === tournament.wardId;
        if (!geographicMatch) {
          return {
            eligible: false,
            reason: "Team must be from the tournament's ward",
            geographicMatch,
            organizationalMatch,
          };
        }
      } else if (tournament.subCountyId) {
        // Sub-county tournament - teams must be from the specific sub-county
        geographicMatch = team.subCountyId === tournament.subCountyId;
        if (!geographicMatch) {
          return {
            eligible: false,
            reason: "Team must be from the tournament's sub-county",
            geographicMatch,
            organizationalMatch,
          };
        }
      } else if (tournament.countyId) {
        // County tournament - teams must be from the specific county
        geographicMatch = team.countyId === tournament.countyId;
        if (!geographicMatch) {
          return {
            eligible: false,
            reason: "Team must be from the tournament's county",
            geographicMatch,
            organizationalMatch,
          };
        }
      } else {
        // National tournament - all teams with ward registration are eligible
        geographicMatch = true;
      }
      break;

    case "OPEN":
      // Open tournaments - any team with ward registration can participate
      geographicMatch = true;
      organizationalMatch = true;
      break;

    default:
      return {
        eligible: false,
        reason: "Unknown tournament participation model",
        geographicMatch: false,
        organizationalMatch: false,
      };
  }

  return {
    eligible: true,
    geographicMatch,
    organizationalMatch,
  };
}

/**
 * Get all eligible teams for a tournament with detailed eligibility information
 */
export function getEligibleTeamsWithDetails(
  teams: Team[],
  tournament: Tournament
): Array<Team & { eligibility: EligibilityCheck }> {
  return teams.map(team => ({
    ...team,
    eligibility: checkTeamEligibility(team, tournament),
  }));
}

/**
 * Filter teams to only return eligible ones
 */
export function filterEligibleTeams(teams: Team[], tournament: Tournament): Team[] {
  return getEligibleTeamsWithDetails(teams, tournament)
    .filter(team => team.eligibility.eligible)
    .map(team => {
      const { eligibility, ...teamData } = team;
      return teamData;
    });
}

/**
 * Get tournament eligibility summary
 */
export function getTournamentEligibilitySummary(tournament: Tournament): {
  description: string;
  requirements: string[];
  geographicScope: string;
} {
  const requirements = ["Teams must have ward registration"];
  let geographicScope = "Unknown";
  let description = "";

  switch (tournament.participationModel) {
    case "ORGANIZATIONAL":
      description = "Teams must be affiliated with the organizing organization";
      requirements.push("Team must be affiliated with organizing organization");
      geographicScope = "Organization members only";
      break;

    case "GEOGRAPHIC":
      if (tournament.wardId) {
        description = "Ward-level tournament for teams within the specific ward";
        requirements.push("Team must be registered in the tournament's ward");
        geographicScope = "Ward-level";
      } else if (tournament.subCountyId) {
        description = "Sub-county tournament for teams within the specific sub-county";
        requirements.push("Team must be registered in the tournament's sub-county");
        geographicScope = "Sub-county level";
      } else if (tournament.countyId) {
        description = "County tournament for teams within the specific county";
        requirements.push("Team must be registered in the tournament's county");
        geographicScope = "County-level";
      } else {
        description = "National tournament open to all teams with ward registration";
        geographicScope = "National";
      }
      break;

    case "OPEN":
      description = "Open tournament - any team with ward registration can participate";
      geographicScope = "Open to all";
      break;
  }

  return {
    description,
    requirements,
    geographicScope,
  };
}