/**
 * Advanced Standings Engine
 * Implements professional-grade standings calculation with complex tie-breakers
 * Based on algorithms used by FIFA, UEFA, and major football leagues
 */

import { Tournament, Match, Team, TournamentConfig } from './TournamentEngine';

export interface TeamStanding {
  team_id: string;
  team_name: string;
  position: number;
  matches_played: number;
  wins: number;
  draws: number;
  losses: number;
  goals_for: number;
  goals_against: number;
  goal_difference: number;
  points: number;
  form: string; // Last 5 matches: WWDLL
  head_to_head_record?: HeadToHeadRecord;
  recent_matches?: RecentMatch[];
}

export interface HeadToHeadRecord {
  opponent_id: string;
  matches_played: number;
  wins: number;
  draws: number;
  losses: number;
  goals_for: number;
  goals_against: number;
  goal_difference: number;
  points: number;
}

export interface RecentMatch {
  match_id: string;
  opponent_id: string;
  opponent_name: string;
  home_away: 'home' | 'away';
  result: 'W' | 'D' | 'L';
  score: string;
  date: Date;
}

export interface StandingsCalculationOptions {
  use_head_to_head: boolean;
  use_away_goals_rule: boolean;
  use_disciplinary_points: boolean;
  custom_tie_breakers: string[];
  include_form: boolean;
  include_recent_matches: boolean;
  max_recent_matches: number;
}

export interface TieBreakingResult {
  tied_teams: string[];
  resolved_order: string[];
  tie_breaker_used: string;
  head_to_head_table?: TeamStanding[];
}

export class AdvancedStandingsEngine {
  private tournament: Tournament;
  private options: StandingsCalculationOptions;

  constructor(tournament: Tournament, options: Partial<StandingsCalculationOptions> = {}) {
    this.tournament = tournament;
    this.options = {
      use_head_to_head: true,
      use_away_goals_rule: false,
      use_disciplinary_points: false,
      custom_tie_breakers: [],
      include_form: true,
      include_recent_matches: true,
      max_recent_matches: 5,
      ...options
    };
  }

  public calculateStandings(matches: Match[]): TeamStanding[] {
    // Initialize team statistics
    const teamStats = this.initializeTeamStats();
    
    // Process all completed matches
    const completedMatches = matches.filter(m => m.status === 'finished');
    this.processMatches(teamStats, completedMatches);
    
    // Convert to standings array
    let standings = this.convertToStandingsArray(teamStats);
    
    // Apply sorting rules with tie-breaking
    standings = this.applySortingRules(standings, completedMatches);
    
    // Add form and recent matches if requested
    if (this.options.include_form || this.options.include_recent_matches) {
      standings = this.enrichStandingsWithForm(standings, completedMatches);
    }
    
    // Set final positions
    standings.forEach((standing, index) => {
      standing.position = index + 1;
    });
    
    return standings;
  }

  private initializeTeamStats(): Map<string, TeamStanding> {
    const stats = new Map<string, TeamStanding>();
    
    for (const team of this.tournament.teams) {
      stats.set(team.id, {
        team_id: team.id,
        team_name: team.name,
        position: 0,
        matches_played: 0,
        wins: 0,
        draws: 0,
        losses: 0,
        goals_for: 0,
        goals_against: 0,
        goal_difference: 0,
        points: 0,
        form: '',
        recent_matches: []
      });
    }
    
    return stats;
  }

  private processMatches(teamStats: Map<string, TeamStanding>, matches: Match[]): void {
    const pointsSystem = this.tournament.config.points_system;
    
    for (const match of matches) {
      if (!match.home_score !== undefined || match.away_score === undefined) continue;
      
      const homeStats = teamStats.get(match.home_team_id);
      const awayStats = teamStats.get(match.away_team_id);
      
      if (!homeStats || !awayStats) continue;
      
      // Update match counts
      homeStats.matches_played++;
      awayStats.matches_played++;
      
      // Update goals
      homeStats.goals_for += match.home_score!;
      homeStats.goals_against += match.away_score!;
      awayStats.goals_for += match.away_score!;
      awayStats.goals_against += match.home_score!;
      
      // Update goal difference
      homeStats.goal_difference = homeStats.goals_for - homeStats.goals_against;
      awayStats.goal_difference = awayStats.goals_for - awayStats.goals_against;
      
      // Determine result and update points/records
      if (match.home_score! > match.away_score!) {
        // Home win
        homeStats.wins++;
        homeStats.points += pointsSystem.win;
        awayStats.losses++;
        awayStats.points += pointsSystem.loss;
      } else if (match.home_score! < match.away_score!) {
        // Away win
        awayStats.wins++;
        awayStats.points += pointsSystem.win;
        homeStats.losses++;
        homeStats.points += pointsSystem.loss;
      } else {
        // Draw
        homeStats.draws++;
        homeStats.points += pointsSystem.draw;
        awayStats.draws++;
        awayStats.points += pointsSystem.draw;
      }
    }
  }

  private convertToStandingsArray(teamStats: Map<string, TeamStanding>): TeamStanding[] {
    return Array.from(teamStats.values());
  }

  private applySortingRules(standings: TeamStanding[], matches: Match[]): TeamStanding[] {
    const sortingRules = this.tournament.config.sorting_rules;
    
    // Primary sort by basic criteria
    standings.sort((a, b) => {
      // Points (descending)
      if (a.points !== b.points) return b.points - a.points;
      
      // Goal difference (descending)
      if (a.goal_difference !== b.goal_difference) return b.goal_difference - a.goal_difference;
      
      // Goals for (descending)
      if (a.goals_for !== b.goals_for) return b.goals_for - a.goals_for;
      
      // If still tied, apply head-to-head
      return 0; // Will be resolved by tie-breaking
    });
    
    // Apply head-to-head tie-breaking for teams with same points, GD, and GF
    return this.resolveAllTies(standings, matches);
  }

  private resolveAllTies(standings: TeamStanding[], matches: Match[]): TeamStanding[] {
    const result: TeamStanding[] = [];
    let i = 0;
    
    while (i < standings.length) {
      // Find group of teams with same points, goal difference, and goals for
      const currentTeam = standings[i];
      const tiedTeams: TeamStanding[] = [currentTeam];
      let j = i + 1;
      
      while (j < standings.length && 
             standings[j].points === currentTeam.points &&
             standings[j].goal_difference === currentTeam.goal_difference &&
             standings[j].goals_for === currentTeam.goals_for) {
        tiedTeams.push(standings[j]);
        j++;
      }
      
      if (tiedTeams.length > 1) {
        // Resolve tie using head-to-head
        const resolvedGroup = this.resolveTieWithHeadToHead(tiedTeams, matches);
        result.push(...resolvedGroup);
      } else {
        result.push(currentTeam);
      }
      
      i = j;
    }
    
    return result;
  }

  private resolveTieWithHeadToHead(tiedTeams: TeamStanding[], matches: Match[]): TeamStanding[] {
    if (!this.options.use_head_to_head || tiedTeams.length < 2) {
      return tiedTeams;
    }
    
    // Extract head-to-head matches between tied teams
    const teamIds = new Set(tiedTeams.map(t => t.team_id));
    const headToHeadMatches = matches.filter(match => 
      teamIds.has(match.home_team_id) && 
      teamIds.has(match.away_team_id) &&
      match.status === 'finished'
    );
    
    if (headToHeadMatches.length === 0) {
      // No head-to-head matches, use alphabetical order
      return tiedTeams.sort((a, b) => a.team_name.localeCompare(b.team_name));
    }
    
    // Create mini-league standings for tied teams
    const headToHeadStats = this.calculateHeadToHeadStandings(tiedTeams, headToHeadMatches);
    
    // Sort by head-to-head criteria
    headToHeadStats.sort((a, b) => {
      // Head-to-head points
      if (a.points !== b.points) return b.points - a.points;
      
      // Head-to-head goal difference
      if (a.goal_difference !== b.goal_difference) return b.goal_difference - a.goal_difference;
      
      // Head-to-head goals for
      if (a.goals_for !== b.goals_for) return b.goals_for - a.goals_for;
      
      // If still tied, use overall goal difference
      const teamA = tiedTeams.find(t => t.team_id === a.team_id)!;
      const teamB = tiedTeams.find(t => t.team_id === b.team_id)!;
      
      if (teamA.goal_difference !== teamB.goal_difference) {
        return teamB.goal_difference - teamA.goal_difference;
      }
      
      // Finally, alphabetical order
      return teamA.team_name.localeCompare(teamB.team_name);
    });
    
    // Return teams in resolved order
    return headToHeadStats.map(h2h => 
      tiedTeams.find(team => team.team_id === h2h.team_id)!
    );
  }

  private calculateHeadToHeadStandings(teams: TeamStanding[], matches: Match[]): TeamStanding[] {
    const h2hStats = teams.map(team => ({
      ...team,
      matches_played: 0,
      wins: 0,
      draws: 0,
      losses: 0,
      goals_for: 0,
      goals_against: 0,
      goal_difference: 0,
      points: 0
    }));
    
    const pointsSystem = this.tournament.config.points_system;
    
    // Process head-to-head matches
    for (const match of matches) {
      if (match.home_score === undefined || match.away_score === undefined) continue;
      
      const homeStats = h2hStats.find(s => s.team_id === match.home_team_id);
      const awayStats = h2hStats.find(s => s.team_id === match.away_team_id);
      
      if (!homeStats || !awayStats) continue;
      
      // Update statistics (similar to processMatches but for subset)
      homeStats.matches_played++;
      awayStats.matches_played++;
      
      homeStats.goals_for += match.home_score;
      homeStats.goals_against += match.away_score;
      awayStats.goals_for += match.away_score;
      awayStats.goals_against += match.home_score;
      
      homeStats.goal_difference = homeStats.goals_for - homeStats.goals_against;
      awayStats.goal_difference = awayStats.goals_for - awayStats.goals_against;
      
      if (match.home_score > match.away_score) {
        homeStats.wins++;
        homeStats.points += pointsSystem.win;
        awayStats.losses++;
        awayStats.points += pointsSystem.loss;
      } else if (match.home_score < match.away_score) {
        awayStats.wins++;
        awayStats.points += pointsSystem.win;
        homeStats.losses++;
        homeStats.points += pointsSystem.loss;
      } else {
        homeStats.draws++;
        homeStats.points += pointsSystem.draw;
        awayStats.draws++;
        awayStats.points += pointsSystem.draw;
      }
    }
    
    return h2hStats;
  }

  private enrichStandingsWithForm(standings: TeamStanding[], matches: Match[]): TeamStanding[] {
    if (!this.options.include_form && !this.options.include_recent_matches) {
      return standings;
    }
    
    for (const standing of standings) {
      const teamMatches = this.getTeamMatches(standing.team_id, matches)
        .sort((a, b) => (a.match_date?.getTime() || 0) - (b.match_date?.getTime() || 0));
      
      if (this.options.include_form) {
        standing.form = this.calculateForm(standing.team_id, teamMatches);
      }
      
      if (this.options.include_recent_matches) {
        standing.recent_matches = this.getRecentMatches(
          standing.team_id, 
          teamMatches, 
          this.options.max_recent_matches
        );
      }
    }
    
    return standings;
  }

  private getTeamMatches(teamId: string, matches: Match[]): Match[] {
    return matches.filter(match => 
      (match.home_team_id === teamId || match.away_team_id === teamId) &&
      match.status === 'finished'
    );
  }

  private calculateForm(teamId: string, matches: Match[]): string {
    const recentMatches = matches.slice(-5); // Last 5 matches
    let form = '';
    
    for (const match of recentMatches) {
      if (match.home_score === undefined || match.away_score === undefined) continue;
      
      const isHome = match.home_team_id === teamId;
      const teamScore = isHome ? match.home_score : match.away_score;
      const opponentScore = isHome ? match.away_score : match.home_score;
      
      if (teamScore > opponentScore) {
        form += 'W';
      } else if (teamScore < opponentScore) {
        form += 'L';
      } else {
        form += 'D';
      }
    }
    
    return form;
  }

  private getRecentMatches(teamId: string, matches: Match[], maxMatches: number): RecentMatch[] {
    const recentMatches = matches.slice(-maxMatches);
    const result: RecentMatch[] = [];
    
    for (const match of recentMatches) {
      if (match.home_score === undefined || match.away_score === undefined) continue;
      
      const isHome = match.home_team_id === teamId;
      const opponentId = isHome ? match.away_team_id : match.home_team_id;
      const opponent = this.tournament.getTeamById(opponentId);
      
      if (!opponent) continue;
      
      const teamScore = isHome ? match.home_score : match.away_score;
      const opponentScore = isHome ? match.away_score : match.home_score;
      
      let result_char: 'W' | 'D' | 'L';
      if (teamScore > opponentScore) {
        result_char = 'W';
      } else if (teamScore < opponentScore) {
        result_char = 'L';
      } else {
        result_char = 'D';
      }
      
      result.push({
        match_id: match.id,
        opponent_id: opponentId,
        opponent_name: opponent.name,
        home_away: isHome ? 'home' : 'away',
        result: result_char,
        score: `${teamScore}-${opponentScore}`,
        date: match.match_date || new Date()
      });
    }
    
    return result.reverse(); // Most recent first
  }

  public calculateLiveStanding(
    currentStandings: TeamStanding[], 
    liveMatch: Match
  ): TeamStanding[] {
    if (liveMatch.status !== 'live' || 
        liveMatch.home_score === undefined || 
        liveMatch.away_score === undefined) {
      return currentStandings;
    }
    
    // Create copy of standings for live update
    const liveStandings = currentStandings.map(standing => ({ ...standing }));
    
    const homeTeam = liveStandings.find(s => s.team_id === liveMatch.home_team_id);
    const awayTeam = liveStandings.find(s => s.team_id === liveMatch.away_team_id);
    
    if (!homeTeam || !awayTeam) return liveStandings;
    
    // Simulate match completion with current score
    const pointsSystem = this.tournament.config.points_system;
    
    if (liveMatch.home_score > liveMatch.away_score) {
      homeTeam.points += pointsSystem.win - pointsSystem.loss; // Temporary adjustment
      awayTeam.points += pointsSystem.loss - pointsSystem.win;
    } else if (liveMatch.home_score < liveMatch.away_score) {
      awayTeam.points += pointsSystem.win - pointsSystem.loss;
      homeTeam.points += pointsSystem.loss - pointsSystem.win;
    } else {
      homeTeam.points += pointsSystem.draw - pointsSystem.loss;
      awayTeam.points += pointsSystem.draw - pointsSystem.loss;
    }
    
    // Re-sort standings
    return this.applySortingRules(liveStandings, []);
  }

  public getStandingsMetadata() {
    return {
      tournament_id: this.tournament.id,
      tournament_name: this.tournament.name,
      total_teams: this.tournament.teams.length,
      sorting_rules: this.tournament.config.sorting_rules,
      points_system: this.tournament.config.points_system,
      uses_head_to_head: this.options.use_head_to_head,
      calculation_date: new Date()
    };
  }
}