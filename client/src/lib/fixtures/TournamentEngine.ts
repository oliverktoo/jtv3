/**
 * Enterprise-Grade Tournament Architecture Foundation
 * Based on systems used by SofaScore, Opta, and StatsBomb
 */

export interface Team {
  id: string;
  name: string;
  short_code: string;
  logo_url?: string;
  stadium_id?: string;
  org_id?: string;
}

export interface Stadium {
  id: string;
  name: string;
  capacity: number;
  location: string;
  available_slots: TimeSlot[];
  restrictions: string[];
}

export interface TimeSlot {
  day: string; // Monday, Tuesday, etc.
  start_time: string; // HH:MM format
  end_time: string;
  priority: number; // 1-10, higher = more preferred
}

export interface TournamentConstraints {
  team_requests: Record<string, string[]>; // team_id -> preferred dates
  stadium_availability: Record<string, TimeSlot[]>;
  police_restrictions: Record<string, number>; // match_id -> minimum_gap_days
  tv_broadcast_slots: Record<string, TimeSlot>;
  minimum_rest_days: number;
  derby_spacing: number; // Rounds between derbies
  match_spacing: Record<string, number>; // team_id -> days between matches
}

export interface TournamentConfig {
  type: 'round_robin' | 'knockout' | 'group_stage' | 'league';
  legs: 1 | 2; // single or double round-robin
  matches_per_day?: number;
  stadiums: Stadium[];
  time_slots: TimeSlot[];
  constraints: TournamentConstraints;
  start_date: Date;
  end_date?: Date;
  points_system: {
    win: number;
    draw: number;
    loss: number;
  };
  sorting_rules: ('points' | 'goal_difference' | 'goals_for' | 'head_to_head' | 'alphabetical')[];
}

export interface Match {
  id: string;
  tournament_id: string;
  home_team_id: string;
  away_team_id: string;
  match_date: Date;
  match_round: number;
  leg?: number; // For double round-robin
  status: 'scheduled' | 'live' | 'finished' | 'postponed' | 'cancelled';
  home_score?: number;
  away_score?: number;
  stadium_id?: string;
  time_slot?: TimeSlot;
  broadcast_priority?: number;
  is_derby?: boolean;
}

export interface ScheduledMatch extends Match {
  date: Date;
  time: string;
  stadium: Stadium;
  constraints_applied: string[];
}

export class Tournament {
  public teams: Team[];
  public config: TournamentConfig;
  public matches: Match[] = [];
  public id: string;
  public name: string;

  constructor(
    id: string,
    name: string,
    teams: Team[], 
    config: Partial<TournamentConfig> = {}
  ) {
    this.id = id;
    this.name = name;
    this.teams = teams;
    this.config = {
      type: 'round_robin',
      legs: 2,
      matches_per_day: 4,
      stadiums: [],
      time_slots: this.getDefaultTimeSlots(),
      constraints: this.getDefaultConstraints(),
      start_date: new Date(),
      points_system: { win: 3, draw: 1, loss: 0 },
      sorting_rules: ['points', 'goal_difference', 'goals_for', 'head_to_head'],
      ...config
    };
  }

  private getDefaultTimeSlots(): TimeSlot[] {
    return [
      { day: 'Saturday', start_time: '15:00', end_time: '17:00', priority: 10 },
      { day: 'Saturday', start_time: '17:30', end_time: '19:30', priority: 9 },
      { day: 'Sunday', start_time: '15:00', end_time: '17:00', priority: 8 },
      { day: 'Sunday', start_time: '17:30', end_time: '19:30', priority: 7 },
      { day: 'Wednesday', start_time: '19:00', end_time: '21:00', priority: 6 },
      { day: 'Friday', start_time: '19:00', end_time: '21:00', priority: 5 }
    ];
  }

  private getDefaultConstraints(): TournamentConstraints {
    return {
      team_requests: {},
      stadium_availability: {},
      police_restrictions: {},
      tv_broadcast_slots: {},
      minimum_rest_days: 2,
      derby_spacing: 3,
      match_spacing: {}
    };
  }

  public addTeam(team: Team): void {
    if (!this.teams.find(t => t.id === team.id)) {
      this.teams.push(team);
    }
  }

  public removeTeam(teamId: string): void {
    this.teams = this.teams.filter(t => t.id !== teamId);
    // Clean up any existing matches involving this team
    this.matches = this.matches.filter(
      m => m.home_team_id !== teamId && m.away_team_id !== teamId
    );
  }

  public updateConfig(updates: Partial<TournamentConfig>): void {
    this.config = { ...this.config, ...updates };
  }

  public getTeamById(teamId: string): Team | undefined {
    return this.teams.find(t => t.id === teamId);
  }

  public getTotalRounds(): number {
    const teamCount = this.teams.length;
    if (teamCount < 2) return 0;
    
    // Round-robin: each team plays every other team
    const singleRoundRobinRounds = teamCount % 2 === 0 ? teamCount - 1 : teamCount;
    return singleRoundRobinRounds * this.config.legs;
  }

  public getTotalMatches(): number {
    const teamCount = this.teams.length;
    if (teamCount < 2) return 0;
    
    // n teams = n(n-1)/2 matches per leg
    const matchesPerLeg = (teamCount * (teamCount - 1)) / 2;
    return matchesPerLeg * this.config.legs;
  }

  public isValidForFixtureGeneration(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (this.teams.length < 2) {
      errors.push('At least 2 teams required for fixture generation');
    }

    if (!this.config.start_date) {
      errors.push('Tournament start date is required');
    }

    if (this.config.time_slots.length === 0) {
      errors.push('At least one time slot must be configured');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  public detectDerbies(): string[] {
    // Detect potential derby matches based on team organization or naming patterns
    const derbies: string[] = [];
    
    for (let i = 0; i < this.teams.length; i++) {
      for (let j = i + 1; j < this.teams.length; j++) {
        const team1 = this.teams[i];
        const team2 = this.teams[j];
        
        // Same organization = potential derby
        if (team1.org_id && team2.org_id && team1.org_id === team2.org_id) {
          derbies.push(`${team1.id}-${team2.id}`);
        }
        
        // Similar names = potential local derby
        const similarity = this.calculateNameSimilarity(team1.name, team2.name);
        if (similarity > 0.6) {
          derbies.push(`${team1.id}-${team2.id}`);
        }
      }
    }
    
    return derbies;
  }

  private calculateNameSimilarity(name1: string, name2: string): number {
    // Simple similarity check based on common words
    const words1 = name1.toLowerCase().split(' ');
    const words2 = name2.toLowerCase().split(' ');
    
    const commonWords = words1.filter(word => words2.includes(word));
    const totalWords = new Set([...words1, ...words2]).size;
    
    return commonWords.length / totalWords;
  }
}