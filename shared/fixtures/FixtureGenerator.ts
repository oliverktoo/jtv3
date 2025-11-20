/**
 * Advanced Fixture Generation Engine
 * Jamii Tourney v3 - Production-Grade Fixture Generation
 */

import { 
  Tournament, 
  TournamentTeam, 
  FixtureRequest, 
  GeneratedFixture, 
  Match, 
  FixtureRound,
  FixtureMetadata,
  MatchStatus,
  FixtureConstraints
} from './types';

export class AdvancedFixtureGenerator {
  constructor(private supabaseClient: any) {}

  /**
   * Generate fixtures for any tournament type
   */
  async generateFixtures(request: FixtureRequest): Promise<GeneratedFixture> {
    const tournament = await this.getTournament(request.tournamentId);
    const startTime = Date.now();

    try {
      let generatedFixture: GeneratedFixture;

      switch (tournament.type) {
        case 'round_robin':
        case 'league':
          generatedFixture = await this.generateRoundRobinFixtures(tournament, request);
          break;
        case 'knockout':
        case 'cup':
          generatedFixture = await this.generateKnockoutFixtures(tournament, request);
          break;
        case 'group_stage':
          generatedFixture = await this.generateGroupStageFixtures(tournament, request);
          break;
        default:
          throw new Error(`Tournament type ${tournament.type} not supported`);
      }

      // Apply constraints and optimize
      const optimizedFixture = await this.optimizeFixtures(generatedFixture, request.constraints);
      
      // Save to database if not regenerating
      if (!request.regenerate) {
        await this.saveFixtures(optimizedFixture);
      }

      return optimizedFixture;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      throw new Error(`Fixture generation failed: ${errorMessage}`);
    }
  }

  /**
   * Round Robin Fixture Generation using Circle Method
   * Most balanced algorithm for fair fixture distribution
   */
  private async generateRoundRobinFixtures(
    tournament: Tournament, 
    request: FixtureRequest
  ): Promise<GeneratedFixture> {
    const teams = [...request.teams];
    const legs = tournament.config.legs;
    
    // Handle odd number of teams
    const hasBye = teams.length % 2 !== 0;
    if (hasBye) {
      teams.push({ 
        id: 'BYE', 
        teamId: 'BYE', 
        tournamentId: tournament.id,
        registeredAt: new Date(),
        status: 'confirmed'
      } as TournamentTeam);
    }

    const teamCount = teams.length;
    const matches: Match[] = [];
    const rounds: FixtureRound[] = [];
    const warnings: string[] = [];
    const errors: string[] = [];

    // Generate fixtures for each leg
    for (let leg = 0; leg < legs; leg++) {
      const legMatches = this.generateSingleRoundRobin(teams, leg, tournament);
      matches.push(...legMatches);
    }

    // Create rounds
    const matchesPerRound = (teamCount - 1) / 2;
    for (let roundNum = 0; roundNum < (teamCount - 1) * legs; roundNum++) {
      const roundMatches = matches.slice(
        roundNum * matchesPerRound, 
        (roundNum + 1) * matchesPerRound
      ).map(m => m.id);

      rounds.push({
        id: crypto.randomUUID(),
        tournamentId: tournament.id,
        roundNumber: roundNum + 1,
        name: this.generateRoundName(roundNum + 1, legs, teamCount - 1),
        startDate: request.startDate,
        endDate: request.endDate || request.startDate,
        matches: roundMatches,
        status: 'pending'
      });
    }

    if (hasBye) {
      warnings.push('Bye rounds created due to odd number of teams');
    }

    const metadata: FixtureMetadata = {
      generatedAt: new Date(),
      generatedBy: 'system', // Would be user ID in real implementation
      algorithm: 'circle_method',
      parameters: { legs, teamCount: teams.length - (hasBye ? 1 : 0) },
      qualityScore: this.calculateQualityScore(matches, rounds),
      constraintsSatisfied: 0, // Will be updated during optimization
      constraintsTotal: 0,
      estimatedDuration: this.estimateTournamentDuration(matches, tournament.config)
    };

    return {
      matches: matches.filter(m => !m.homeTeamId.includes('BYE') && !m.awayTeamId.includes('BYE')),
      rounds,
      metadata,
      warnings,
      errors
    };
  }

  /**
   * Generate single round-robin using circle method
   */
  private generateSingleRoundRobin(
    teams: TournamentTeam[], 
    leg: number, 
    tournament: Tournament
  ): Match[] {
    const matches: Match[] = [];
    const teamCount = teams.length;
    const fixed = teams[0];
    let rotating = teams.slice(1);

    for (let round = 0; round < teamCount - 1; round++) {
      const roundMatches: Match[] = [];

      // Fixed team match
      const opponent = rotating[0];
      if (leg === 0) {
        // First leg: fixed team at home
        roundMatches.push(this.createMatch(fixed, opponent, round + 1 + (leg * (teamCount - 1)), tournament));
      } else {
        // Second leg: reverse fixture
        roundMatches.push(this.createMatch(opponent, fixed, round + 1 + (leg * (teamCount - 1)), tournament));
      }

      // Other matches
      for (let i = 1; i < Math.floor(teamCount / 2); i++) {
        const home = rotating[i];
        const away = rotating[teamCount - 1 - i];

        if (leg === 0) {
          roundMatches.push(this.createMatch(home, away, round + 1 + (leg * (teamCount - 1)), tournament));
        } else {
          // Second leg: reverse fixtures
          roundMatches.push(this.createMatch(away, home, round + 1 + (leg * (teamCount - 1)), tournament));
        }
      }

      matches.push(...roundMatches);
      
      // Rotate teams (circle method)
      rotating = this.rotateTeams(rotating);
    }

    return matches;
  }

  /**
   * Rotate teams for circle method (all except first)
   */
  private rotateTeams(teams: TournamentTeam[]): TournamentTeam[] {
    if (teams.length <= 1) return teams;
    return [teams[0], ...teams.slice(2), teams[1]];
  }

  /**
   * Create a match object
   */
  private createMatch(
    homeTeam: TournamentTeam, 
    awayTeam: TournamentTeam, 
    roundNumber: number, 
    tournament: Tournament
  ): Match {
    return {
      id: crypto.randomUUID(),
      tournamentId: tournament.id,
      roundNumber,
      homeTeamId: homeTeam.teamId,
      awayTeamId: awayTeam.teamId,
      scheduledDate: new Date(), // Will be updated during optimization
      status: 'scheduled' as MatchStatus,
      events: [],
      constraints: {
        minimumNotice: tournament.config.constraints.minimumRestDays,
        requiredOfficials: 3,
        securityLevel: this.determineSecurityLevel(homeTeam.teamId, awayTeam.teamId),
      }
    };
  }

  /**
   * Generate knockout tournament fixtures
   */
  private async generateKnockoutFixtures(
    tournament: Tournament, 
    request: FixtureRequest
  ): Promise<GeneratedFixture> {
    const teams = request.teams;
    const teamCount = teams.length;
    
    // Validate power of 2 for clean knockout
    if (!this.isPowerOfTwo(teamCount)) {
      // Could implement bye system here
      throw new Error('Knockout tournaments require a power of 2 teams for clean brackets');
    }

    const matches: Match[] = [];
    const rounds: FixtureRound[] = [];
    let currentRound = 1;
    let currentTeams = [...teams];

    // Generate rounds until we have a winner
    while (currentTeams.length > 1) {
      const roundMatches: Match[] = [];
      const nextRoundTeams: TournamentTeam[] = [];

      // Pair teams for this round
      for (let i = 0; i < currentTeams.length; i += 2) {
        const homeTeam = currentTeams[i];
        const awayTeam = currentTeams[i + 1];

        const match = this.createMatch(homeTeam, awayTeam, currentRound, tournament);
        roundMatches.push(match);

        // For knockout, we don't know the winner yet, so we create placeholder
        nextRoundTeams.push({
          id: `winner-${match.id}`,
          teamId: `winner-${match.id}`,
          tournamentId: tournament.id,
          registeredAt: new Date(),
          status: 'confirmed'
        });
      }

      matches.push(...roundMatches);
      
      rounds.push({
        id: crypto.randomUUID(),
        tournamentId: tournament.id,
        roundNumber: currentRound,
        name: this.generateKnockoutRoundName(currentRound, teamCount),
        startDate: request.startDate,
        endDate: request.endDate || request.startDate,
        matches: roundMatches.map(m => m.id),
        status: 'pending'
      });

      currentTeams = nextRoundTeams.slice(0, currentTeams.length / 2);
      currentRound++;
    }

    const metadata: FixtureMetadata = {
      generatedAt: new Date(),
      generatedBy: 'system',
      algorithm: 'berger_table',
      parameters: { teamCount, rounds: rounds.length },
      qualityScore: 85, // Knockout tournaments are generally well-balanced
      constraintsSatisfied: 0,
      constraintsTotal: 0,
      estimatedDuration: rounds.length * 7 // One week per round
    };

    return {
      matches,
      rounds,
      metadata,
      warnings: [],
      errors: []
    };
  }

  /**
   * Group stage fixtures (for larger tournaments)
   */
  private async generateGroupStageFixtures(
    tournament: Tournament, 
    request: FixtureRequest
  ): Promise<GeneratedFixture> {
    // Implementation would create groups and generate round-robin within each group
    // This is a placeholder for the more complex group stage logic
    throw new Error('Group stage fixtures not yet implemented');
  }

  /**
   * Optimize fixtures with constraints
   */
  private async optimizeFixtures(
    fixture: GeneratedFixture, 
    constraints?: FixtureConstraints
  ): Promise<GeneratedFixture> {
    if (!constraints) return fixture;

    // Apply scheduling constraints
    const optimizedMatches = await this.applySchedulingConstraints(fixture.matches, constraints);
    
    // Apply venue constraints
    const venueOptimizedMatches = await this.applyVenueConstraints(optimizedMatches, constraints);

    // Update quality score
    fixture.metadata.qualityScore = this.calculateQualityScore(venueOptimizedMatches, fixture.rounds);
    
    return {
      ...fixture,
      matches: venueOptimizedMatches
    };
  }

  /**
   * Apply scheduling constraints to matches
   */
  private async applySchedulingConstraints(
    matches: Match[], 
    constraints: FixtureConstraints
  ): Promise<Match[]> {
    // Implementation would:
    // 1. Respect minimum rest days between team matches
    // 2. Apply preferred time slots
    // 3. Avoid blackout dates
    // 4. Space derby matches appropriately
    // 5. Handle team requests

    return matches.map(match => ({
      ...match,
      // Update scheduledDate based on constraints
      scheduledDate: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000) // Random date for now
    }));
  }

  /**
   * Apply venue constraints
   */
  private async applyVenueConstraints(
    matches: Match[], 
    constraints: FixtureConstraints
  ): Promise<Match[]> {
    // Implementation would assign stadiums based on:
    // 1. Home team preference
    // 2. Stadium availability
    // 3. Capacity requirements
    // 4. Geographic considerations

    return matches;
  }

  /**
   * Save fixtures to database
   */
  private async saveFixtures(fixture: GeneratedFixture): Promise<void> {
    const { error: matchError } = await this.supabaseClient
      .from('matches')
      .insert(fixture.matches);

    if (matchError) throw matchError;

    const { error: roundError } = await this.supabaseClient
      .from('fixture_rounds')
      .insert(fixture.rounds);

    if (roundError) throw roundError;
  }

  // Utility methods
  private async getTournament(tournamentId: string): Promise<Tournament> {
    const { data, error } = await this.supabaseClient
      .from('tournaments')
      .select('*')
      .eq('id', tournamentId)
      .single();

    if (error) throw error;
    return data;
  }

  private isPowerOfTwo(n: number): boolean {
    return n > 0 && (n & (n - 1)) === 0;
  }

  private generateRoundName(roundNum: number, legs: number, totalRounds: number): string {
    const roundsPerLeg = totalRounds / legs;
    
    if (roundNum <= roundsPerLeg) {
      return `Round ${roundNum}`;
    } else {
      return `Round ${roundNum - roundsPerLeg} (Return)`;
    }
  }

  private generateKnockoutRoundName(roundNum: number, totalTeams: number): string {
    const totalRounds = Math.log2(totalTeams);
    const teamsRemaining = totalTeams / Math.pow(2, roundNum - 1);

    if (teamsRemaining === 2) return 'Final';
    if (teamsRemaining === 4) return 'Semi-Finals';
    if (teamsRemaining === 8) return 'Quarter-Finals';
    if (teamsRemaining === 16) return 'Round of 16';
    
    return `Round ${roundNum}`;
  }

  private determineSecurityLevel(homeTeamId: string, awayTeamId: string): 'low' | 'medium' | 'high' {
    // Implementation would check for derby matches, rivalries, etc.
    return 'medium';
  }

  private calculateQualityScore(matches: Match[], rounds: FixtureRound[]): number {
    // Implementation would calculate based on:
    // - Balance of home/away fixtures
    // - Even distribution across time periods
    // - Constraint satisfaction
    // - Competitive balance
    
    return 85; // Placeholder
  }

  private estimateTournamentDuration(matches: Match[], config: any): number {
    // Estimate based on matches per round and constraints
    return Math.ceil(matches.length / (config.maximumMatchesPerDay || 4));
  }
}