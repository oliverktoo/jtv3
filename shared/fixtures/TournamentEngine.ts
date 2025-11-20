/**
 * Tournament Management Engine
 * Jamii Tourney v3 - Core Tournament Operations
 */

import { 
  Tournament, 
  TournamentTeam, 
  TournamentConfig, 
  TournamentType,
  TournamentStatus 
} from './types';

export class TournamentEngine {
  constructor(private supabaseClient: any) {}

  /**
   * Create a new tournament with configuration
   */
  async createTournament(params: {
    name: string;
    type: TournamentType;
    orgId: string;
    config: Partial<TournamentConfig>;
    createdBy: string;
  }): Promise<Tournament> {
    const defaultConfig: TournamentConfig = {
      legs: 2,
      maxTeams: 16,
      minTeams: 4,
      stadiums: [],
      timeSlots: this.getDefaultTimeSlots(),
      constraints: this.getDefaultConstraints(),
      pointsSystem: { win: 3, draw: 1, loss: 0, walkover: 3, forfeit: 0 },
      tieBreakers: ['points', 'goal_difference', 'goals_for', 'head_to_head_points'],
      allowDraws: true,
      extraTime: false,
      penalties: false
    };

    const tournament: Tournament = {
      id: crypto.randomUUID(),
      name: params.name,
      type: params.type,
      status: 'draft',
      config: { ...defaultConfig, ...params.config },
      orgId: params.orgId,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Save to database
    const { data, error } = await this.supabaseClient
      .from('tournaments')
      .insert([tournament])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Register teams for tournament
   */
  async registerTeams(
    tournamentId: string, 
    teamIds: string[], 
    groupAssignments?: Record<string, string>
  ): Promise<TournamentTeam[]> {
    const tournament = await this.getTournament(tournamentId);
    
    if (teamIds.length > tournament.config.maxTeams) {
      throw new Error(`Maximum ${tournament.config.maxTeams} teams allowed`);
    }

    const tournamentTeams: TournamentTeam[] = teamIds.map(teamId => ({
      id: crypto.randomUUID(),
      teamId,
      tournamentId,
      groupId: groupAssignments?.[teamId],
      registeredAt: new Date(),
      status: 'registered'
    }));

    const { data, error } = await this.supabaseClient
      .from('tournament_teams')
      .insert(tournamentTeams)
      .select();

    if (error) throw error;
    return data;
  }

  /**
   * Get tournament with teams
   */
  async getTournamentWithTeams(tournamentId: string): Promise<{
    tournament: Tournament;
    teams: TournamentTeam[];
  }> {
    const [tournament, teams] = await Promise.all([
      this.getTournament(tournamentId),
      this.getTournamentTeams(tournamentId)
    ]);

    return { tournament, teams };
  }

  /**
   * Update tournament status
   */
  async updateTournamentStatus(
    tournamentId: string, 
    status: TournamentStatus
  ): Promise<Tournament> {
    const { data, error } = await this.supabaseClient
      .from('tournaments')
      .update({ status, updatedAt: new Date() })
      .eq('id', tournamentId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Validate tournament readiness for fixture generation
   */
  async validateTournamentReadiness(tournamentId: string): Promise<{
    isReady: boolean;
    issues: string[];
    warnings: string[];
  }> {
    const { tournament, teams } = await this.getTournamentWithTeams(tournamentId);
    const issues: string[] = [];
    const warnings: string[] = [];

    // Check minimum teams
    if (teams.length < tournament.config.minTeams) {
      issues.push(`Minimum ${tournament.config.minTeams} teams required, only ${teams.length} registered`);
    }

    // Check maximum teams
    if (teams.length > tournament.config.maxTeams) {
      issues.push(`Maximum ${tournament.config.maxTeams} teams allowed, ${teams.length} registered`);
    }

    // Check odd number of teams for round-robin
    if (tournament.type === 'round_robin' && teams.length % 2 !== 0) {
      warnings.push('Odd number of teams will result in bye rounds');
    }

    // Check stadium availability
    if (tournament.config.stadiums.length === 0) {
      warnings.push('No stadiums configured - matches will need manual venue assignment');
    }

    // Check time slots
    if (tournament.config.timeSlots.length === 0) {
      issues.push('No time slots configured for matches');
    }

    // Validate team confirmations
    const unconfirmedTeams = teams.filter(t => t.status !== 'confirmed');
    if (unconfirmedTeams.length > 0) {
      warnings.push(`${unconfirmedTeams.length} teams not yet confirmed`);
    }

    return {
      isReady: issues.length === 0,
      issues,
      warnings
    };
  }

  /**
   * Get tournament statistics
   */
  async getTournamentStats(tournamentId: string): Promise<{
    totalTeams: number;
    totalMatches: number;
    completedMatches: number;
    matchesInProgress: number;
    averageGoalsPerMatch: number;
    topScorer?: { teamId: string; goals: number };
    formGuide: any[];
  }> {
    // Implementation would aggregate match data
    // This is a placeholder showing the structure
    return {
      totalTeams: 0,
      totalMatches: 0,
      completedMatches: 0,
      matchesInProgress: 0,
      averageGoalsPerMatch: 0,
      formGuide: []
    };
  }

  private async getTournament(tournamentId: string): Promise<Tournament> {
    const { data, error } = await this.supabaseClient
      .from('tournaments')
      .select('*')
      .eq('id', tournamentId)
      .single();

    if (error) throw error;
    return data;
  }

  private async getTournamentTeams(tournamentId: string): Promise<TournamentTeam[]> {
    const { data, error } = await this.supabaseClient
      .from('tournament_teams')
      .select('*')
      .eq('tournamentId', tournamentId);

    if (error) throw error;
    return data || [];
  }

  private getDefaultTimeSlots() {
    return [
      {
        id: 'slot-1',
        startTime: '15:00',
        endTime: '17:00',
        dayOfWeek: [0, 6], // Weekends
        isPreferred: true,
        tvSlot: false
      },
      {
        id: 'slot-2',
        startTime: '17:30',
        endTime: '19:30',
        dayOfWeek: [0, 6], // Weekends
        isPreferred: true,
        tvSlot: true
      },
      {
        id: 'slot-3',
        startTime: '19:00',
        endTime: '21:00',
        dayOfWeek: [1, 2, 3, 4, 5], // Weekdays
        isPreferred: false,
        tvSlot: true
      }
    ];
  }

  private getDefaultConstraints() {
    return {
      minimumRestDays: 3,
      maximumMatchesPerDay: 4,
      preferredKickoffTimes: ['15:00', '17:30'],
      blackoutDates: [],
      derbySpacing: 5,
      tvSlotPreferences: [],
      policeRestrictions: [],
      venueRestrictions: []
    };
  }
}