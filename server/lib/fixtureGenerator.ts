import { addDays, setHours, setMinutes, format, getDay } from "date-fns";
import type { InsertMatch } from "../../shared/schema.js";

export interface Team {
  id: string;
  name: string;
}

export interface FixtureGeneratorOptions {
  teams: Team[];
  startDate: Date;
  kickoffTime?: string; // HH:mm format, default "13:00"
  weekendsOnly?: boolean; // default true
  homeAndAway?: boolean; // default true (double round robin)
  venue?: string;
}

export interface GeneratedFixture {
  round: number;
  leg: number;
  homeTeamId: string | null;
  awayTeamId: string | null;
  kickoff: Date;
  venue?: string;
}

/**
 * Generates fixtures for a round-robin tournament
 * Implements the "circle method" for fair scheduling
 * Supports weekend-only scheduling and home/away legs
 */
export function generateRoundRobinFixtures(
  options: FixtureGeneratorOptions
): GeneratedFixture[] {
  const {
    teams,
    startDate,
    kickoffTime = "13:00",
    weekendsOnly = true,
    homeAndAway = true,
    venue,
  } = options;

  const fixtures: GeneratedFixture[] = [];
  const teamCount = teams.length;

  // Handle odd number of teams - add a BYE
  const isOdd = teamCount % 2 !== 0;
  const participants = isOdd ? [...teams, { id: "BYE", name: "BYE" }] : [...teams];
  const n = participants.length;

  // Parse kickoff time
  const [hours, minutes] = kickoffTime.split(":").map(Number);

  // Calculate total rounds for one leg
  const roundsPerLeg = n - 1;
  const totalLegs = homeAndAway ? 2 : 1;
  const matchesPerRound = n / 2;

  let currentDate = new Date(startDate);

  // Generate fixtures for each leg
  for (let leg = 1; leg <= totalLegs; leg++) {
    // Generate rounds using circle method
    for (let round = 0; round < roundsPerLeg; round++) {
      const roundNumber = leg === 1 ? round + 1 : round + roundsPerLeg + 1;

      // Find next available match day (weekend if required)
      currentDate = getNextMatchDay(currentDate, weekendsOnly);

      // Generate matches for this round
      for (let match = 0; match < matchesPerRound; match++) {
        let home: number, away: number;

        if (match === 0) {
          // First match always includes team 0 (fixed position)
          home = 0;
          away = round === 0 ? n - 1 : n - round;
        } else {
          // Calculate positions using circle method
          home = (round + match) % (n - 1);
          away = (n - 1 - match + round) % (n - 1);

          // Adjust for fixed team 0
          if (home >= 0) home++;
          if (away >= 0) away++;
        }

        const homeTeam = participants[home];
        const awayTeam = participants[away];

        // Skip BYE matches
        if (homeTeam.id === "BYE" || awayTeam.id === "BYE") {
          continue;
        }

        // Reverse home/away for second leg
        const finalHome = leg === 2 ? awayTeam : homeTeam;
        const finalAway = leg === 2 ? homeTeam : awayTeam;

        // Set kickoff time
        const matchDate = new Date(currentDate);
        matchDate.setHours(hours, minutes, 0, 0);

        fixtures.push({
          round: roundNumber,
          leg,
          homeTeamId: finalHome.id,
          awayTeamId: finalAway.id,
          kickoff: matchDate,
          venue,
        });
      }

      // Move to next week for next round
      currentDate = addDays(currentDate, 7);
    }
  }

  return fixtures;
}

/**
 * Find next available match day
 * If weekendsOnly is true, returns next Saturday or Sunday
 * Otherwise returns the current date if valid, or next day
 */
function getNextMatchDay(date: Date, weekendsOnly: boolean): Date {
  if (!weekendsOnly) {
    return date;
  }

  const dayOfWeek = getDay(date); // 0 = Sunday, 6 = Saturday

  // If already on weekend, return as-is
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    return date;
  }

  // Calculate days until Saturday
  const daysUntilSaturday = (6 - dayOfWeek + 7) % 7 || 7;
  return addDays(date, daysUntilSaturday);
}

/**
 * Converts generated fixtures to database insert format
 */
export function fixturesToMatches(
  fixtures: GeneratedFixture[],
  roundIds: Map<number, string>
): Omit<InsertMatch, "createdAt" | "updatedAt">[] {
  return fixtures.map((fixture) => ({
    roundId: roundIds.get(fixture.round)!,
    homeTeamId: fixture.homeTeamId,
    awayTeamId: fixture.awayTeamId,
    kickoff: fixture.kickoff,
    venue: fixture.venue,
    status: "SCHEDULED" as const,
    homeScore: null,
    awayScore: null,
  }));
}

/**
 * Pretty print fixtures for debugging
 */
export function printFixtures(fixtures: GeneratedFixture[], teams: Team[]): void {
  const teamMap = new Map(teams.map((t) => [t.id, t.name]));

  fixtures.forEach((fixture) => {
    const home = teamMap.get(fixture.homeTeamId!) || "Unknown";
    const away = teamMap.get(fixture.awayTeamId!) || "Unknown";
    const date = format(fixture.kickoff, "EEE, MMM d, yyyy 'at' HH:mm");

    console.log(
      `Round ${fixture.round}, Leg ${fixture.leg}: ${home} vs ${away} - ${date}`
    );
  });
}
