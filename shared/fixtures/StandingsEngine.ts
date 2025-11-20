/**
 * Advanced Standings Engine
 * Jamii Tourney v3 - Real-time Standings with Complex Tie-Breakers
 */

import { 
  Tournament, 
  Match, 
  StandingsEntry, 
  TieBreaker, 
  PointsSystem,
  TeamRecord,
  MatchResult,
  StandingsResponse
} from './types';

export class AdvancedStandingsEngine {
  constructor(private supabaseClient: any) {}

  /**
   * Calculate comprehensive standings with all tie-breakers
   */
  async calculateStandings(tournamentId: string, asOfDate?: Date): Promise<StandingsResponse> {
    try {
      const tournament = await this.getTournament(tournamentId);
      const matches = await this.getTournamentMatches(tournamentId, asOfDate);
      
      // Get completed matches only
      const completedMatches = matches.filter(m => m.status === 'finished');
      
      if (completedMatches.length === 0) {
        return this.createEmptyStandingsResponse(tournamentId);
      }

      // Calculate basic stats for each team
      const teamStats = await this.calculateTeamStats(completedMatches, tournament.config.pointsSystem);
      
      // Apply tie-breaking rules
      const sortedStandings = this.applySortingRules(teamStats, tournament.config.tieBreakers, completedMatches);
      
      // Add positional data
      const standings = this.assignPositions(sortedStandings);
      
      return {
        success: true,
        standings,
        lastUpdated: new Date(),
        nextMatches: await this.getNextMatches(tournamentId, 5),
        completedMatches: completedMatches.length,
        totalMatches: matches.length
      };

    } catch (error) {
      console.error('Error calculating standings:', error);
      return {
        success: false,
        standings: [],
        lastUpdated: new Date(),
        nextMatches: [],
        completedMatches: 0,
        totalMatches: 0
      };
    }
  }

  /**
   * Calculate basic team statistics
   */
  private async calculateTeamStats(
    matches: Match[], 
    pointsSystem: PointsSystem
  ): Promise<Record<string, StandingsEntry>> {
    const teamStats: Record<string, StandingsEntry> = {};

    // Initialize stats for all teams
    const allTeams = new Set<string>();
    matches.forEach(match => {
      allTeams.add(match.homeTeamId);
      allTeams.add(match.awayTeamId);
    });

    allTeams.forEach(teamId => {
      teamStats[teamId] = this.initializeTeamStats(teamId);
    });

    // Process each match
    for (const match of matches) {
      this.updateTeamStats(teamStats, match, pointsSystem);
    }

    return teamStats;
  }

  /**
   * Initialize empty team statistics
   */
  private initializeTeamStats(teamId: string): StandingsEntry {
    return {
      position: 0,
      teamId,
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      goalDifference: 0,
      points: 0,
      form: [],
      homeRecord: { played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0 },
      awayRecord: { played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0 },
      lastUpdated: new Date()
    };
  }

  /**
   * Update team statistics with match result
   */
  private updateTeamStats(
    teamStats: Record<string, StandingsEntry>, 
    match: Match, 
    pointsSystem: PointsSystem
  ): void {
    const homeTeam = teamStats[match.homeTeamId];
    const awayTeam = teamStats[match.awayTeamId];
    
    const homeScore = match.homeScore || 0;
    const awayScore = match.awayScore || 0;
    
    // Determine result
    let result: MatchResult;
    if (homeScore > awayScore) {
      result = 'home_win';
    } else if (awayScore > homeScore) {
      result = 'away_win';
    } else {
      result = 'draw';
    }

    // Update home team stats
    homeTeam.played++;
    homeTeam.goalsFor += homeScore;
    homeTeam.goalsAgainst += awayScore;
    homeTeam.goalDifference = homeTeam.goalsFor - homeTeam.goalsAgainst;
    
    // Update home record
    homeTeam.homeRecord.played++;
    homeTeam.homeRecord.goalsFor += homeScore;
    homeTeam.homeRecord.goalsAgainst += awayScore;

    // Update away team stats
    awayTeam.played++;
    awayTeam.goalsFor += awayScore;
    awayTeam.goalsAgainst += homeScore;
    awayTeam.goalDifference = awayTeam.goalsFor - awayTeam.goalsAgainst;
    
    // Update away record
    awayTeam.awayRecord.played++;
    awayTeam.awayRecord.goalsFor += awayScore;
    awayTeam.awayRecord.goalsAgainst += homeScore;

    // Apply points and results
    switch (result) {
      case 'home_win':
        homeTeam.won++;
        homeTeam.points += pointsSystem.win;
        homeTeam.homeRecord.won++;
        
        awayTeam.lost++;
        awayTeam.points += pointsSystem.loss;
        awayTeam.awayRecord.lost++;
        break;
        
      case 'away_win':
        awayTeam.won++;
        awayTeam.points += pointsSystem.win;
        awayTeam.awayRecord.won++;
        
        homeTeam.lost++;
        homeTeam.points += pointsSystem.loss;
        homeTeam.homeRecord.lost++;
        break;
        
      case 'draw':
        homeTeam.drawn++;
        homeTeam.points += pointsSystem.draw;
        homeTeam.homeRecord.drawn++;
        
        awayTeam.drawn++;
        awayTeam.points += pointsSystem.draw;
        awayTeam.awayRecord.drawn++;
        break;
    }

    // Update form (last 5 results)
    this.updateForm(homeTeam, result === 'home_win' ? 'home_win' : result === 'draw' ? 'draw' : 'away_win');
    this.updateForm(awayTeam, result === 'away_win' ? 'away_win' : result === 'draw' ? 'draw' : 'home_win');
  }

  /**
   * Update team form (last 5 results)
   */
  private updateForm(team: StandingsEntry, result: MatchResult): void {
    team.form.unshift(result);
    if (team.form.length > 5) {
      team.form = team.form.slice(0, 5);
    }
  }

  /**
   * Apply complex sorting rules including head-to-head
   */
  private applySortingRules(
    teamStats: Record<string, StandingsEntry>, 
    tieBreakers: TieBreaker[],
    matches: Match[]
  ): StandingsEntry[] {
    const teams = Object.values(teamStats);
    
    // Primary sort by configured tie-breakers
    teams.sort((a, b) => {
      for (const tieBreaker of tieBreakers) {
        const comparison = this.compareByCriteria(a, b, tieBreaker, matches);
        if (comparison !== 0) return comparison;
      }
      return 0; // Equal teams
    });

    // Apply head-to-head resolution for tied teams
    return this.resolveComplexTies(teams, matches);
  }

  /**
   * Compare two teams by specific criteria
   */
  private compareByCriteria(
    teamA: StandingsEntry, 
    teamB: StandingsEntry, 
    criteria: TieBreaker,
    matches: Match[]
  ): number {
    switch (criteria) {
      case 'points':
        return teamB.points - teamA.points;
        
      case 'goal_difference':
        return teamB.goalDifference - teamA.goalDifference;
        
      case 'goals_for':
        return teamB.goalsFor - teamA.goalsFor;
        
      case 'goals_against':
        return teamA.goalsAgainst - teamB.goalsAgainst;
        
      case 'head_to_head_points':
        return this.calculateHeadToHeadPoints(teamA.teamId, teamB.teamId, matches) -
               this.calculateHeadToHeadPoints(teamB.teamId, teamA.teamId, matches);
               
      case 'head_to_head_goal_difference':
        return this.calculateHeadToHeadGD(teamB.teamId, teamA.teamId, matches) -
               this.calculateHeadToHeadGD(teamA.teamId, teamB.teamId, matches);
               
      case 'away_goals':
        return teamB.awayRecord.goalsFor - teamA.awayRecord.goalsFor;
        
      default:
        return 0;
    }
  }

  /**
   * Calculate head-to-head points between two teams
   */
  private calculateHeadToHeadPoints(teamA: string, teamB: string, matches: Match[]): number {
    const h2hMatches = matches.filter(m => 
      (m.homeTeamId === teamA && m.awayTeamId === teamB) ||
      (m.homeTeamId === teamB && m.awayTeamId === teamA)
    );

    let points = 0;
    for (const match of h2hMatches) {
      const homeScore = match.homeScore || 0;
      const awayScore = match.awayScore || 0;
      
      if (match.homeTeamId === teamA) {
        if (homeScore > awayScore) points += 3;
        else if (homeScore === awayScore) points += 1;
      } else {
        if (awayScore > homeScore) points += 3;
        else if (homeScore === awayScore) points += 1;
      }
    }
    
    return points;
  }

  /**
   * Calculate head-to-head goal difference
   */
  private calculateHeadToHeadGD(teamA: string, teamB: string, matches: Match[]): number {
    const h2hMatches = matches.filter(m => 
      (m.homeTeamId === teamA && m.awayTeamId === teamB) ||
      (m.homeTeamId === teamB && m.awayTeamId === teamA)
    );

    let goalsFor = 0;
    let goalsAgainst = 0;
    
    for (const match of h2hMatches) {
      const homeScore = match.homeScore || 0;
      const awayScore = match.awayScore || 0;
      
      if (match.homeTeamId === teamA) {
        goalsFor += homeScore;
        goalsAgainst += awayScore;
      } else {
        goalsFor += awayScore;
        goalsAgainst += homeScore;
      }
    }
    
    return goalsFor - goalsAgainst;
  }

  /**
   * Resolve complex ties with mini-leagues
   */
  private resolveComplexTies(teams: StandingsEntry[], matches: Match[]): StandingsEntry[] {
    const resolvedTeams: StandingsEntry[] = [];
    let i = 0;

    while (i < teams.length) {
      const currentTeam = teams[i];
      const tiedTeams = [currentTeam];
      let j = i + 1;

      // Find all teams tied on points and goal difference
      while (j < teams.length && 
             teams[j].points === currentTeam.points &&
             teams[j].goalDifference === currentTeam.goalDifference) {
        tiedTeams.push(teams[j]);
        j++;
      }

      if (tiedTeams.length > 1) {
        // Resolve tie with head-to-head mini-league
        const resolvedGroup = this.createMiniLeague(tiedTeams, matches);
        resolvedTeams.push(...resolvedGroup);
      } else {
        resolvedTeams.push(currentTeam);
      }

      i = j;
    }

    return resolvedTeams;
  }

  /**
   * Create mini-league for tied teams
   */
  private createMiniLeague(tiedTeams: StandingsEntry[], allMatches: Match[]): StandingsEntry[] {
    const teamIds = tiedTeams.map(t => t.teamId);
    
    // Get matches between tied teams only
    const miniLeagueMatches = allMatches.filter(m => 
      teamIds.includes(m.homeTeamId) && teamIds.includes(m.awayTeamId)
    );

    // Recalculate stats for mini-league
    const miniStats: Record<string, StandingsEntry> = {};
    tiedTeams.forEach(team => {
      miniStats[team.teamId] = this.initializeTeamStats(team.teamId);
    });

    // Process mini-league matches
    miniLeagueMatches.forEach(match => {
      this.updateTeamStats(miniStats, match, { win: 3, draw: 1, loss: 0, walkover: 3, forfeit: 0 });
    });

    // Sort by mini-league results
    const miniLeagueTeams = Object.values(miniStats);
    miniLeagueTeams.sort((a, b) => {
      // Points first
      if (b.points !== a.points) return b.points - a.points;
      // Goal difference second
      if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
      // Goals for third
      return b.goalsFor - a.goalsFor;
    });

    return miniLeagueTeams;
  }

  /**
   * Assign final positions
   */
  private assignPositions(standings: StandingsEntry[]): StandingsEntry[] {
    return standings.map((team, index) => ({
      ...team,
      position: index + 1
    }));
  }

  /**
   * Live standings update for a single match
   */
  async updateStandingsLive(matchId: string): Promise<StandingsResponse> {
    const match = await this.getMatch(matchId);
    return this.calculateStandings(match.tournamentId);
  }

  // Database helper methods
  private async getTournament(tournamentId: string): Promise<Tournament> {
    const { data, error } = await this.supabaseClient
      .from('tournaments')
      .select('*')
      .eq('id', tournamentId)
      .single();

    if (error) throw error;
    return data;
  }

  private async getTournamentMatches(tournamentId: string, asOfDate?: Date): Promise<Match[]> {
    let query = this.supabaseClient
      .from('matches')
      .select('*')
      .eq('tournamentId', tournamentId);

    if (asOfDate) {
      query = query.lte('scheduledDate', asOfDate.toISOString());
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  private async getMatch(matchId: string): Promise<Match> {
    const { data, error } = await this.supabaseClient
      .from('matches')
      .select('*')
      .eq('id', matchId)
      .single();

    if (error) throw error;
    return data;
  }

  private async getNextMatches(tournamentId: string, limit: number): Promise<Match[]> {
    const { data, error } = await this.supabaseClient
      .from('matches')
      .select('*')
      .eq('tournamentId', tournamentId)
      .eq('status', 'scheduled')
      .order('scheduledDate', { ascending: true })
      .limit(limit);

    if (error) throw error;
    return data || [];
  }

  private createEmptyStandingsResponse(tournamentId: string): StandingsResponse {
    return {
      success: true,
      standings: [],
      lastUpdated: new Date(),
      nextMatches: [],
      completedMatches: 0,
      totalMatches: 0
    };
  }
}