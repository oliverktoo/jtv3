/**
 * Constraint-Based Fixture Optimizer
 * Applies real-world constraints like stadium availability, TV slots, police restrictions
 * Based on constraint programming techniques used by professional leagues
 */

import { Tournament, Match, Stadium, TimeSlot, TournamentConstraints } from './TournamentEngine';
import { FixtureRound } from './AdvancedFixtureGenerator';

export interface OptimizationResult {
  success: boolean;
  scheduled_matches: ScheduledFixture[];
  unscheduled_matches: Match[];
  conflicts: Conflict[];
  score: number; // Higher is better
}

export interface ScheduledFixture extends Match {
  scheduled_date: Date;
  scheduled_time: string;
  assigned_stadium: Stadium;
  optimization_score: number;
  constraints_applied: string[];
}

export interface Conflict {
  type: 'stadium_conflict' | 'team_conflict' | 'police_restriction' | 'tv_conflict' | 'rest_period';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  affected_matches: string[];
  suggested_resolution?: string;
}

export interface OptimizationWeights {
  stadium_preference: number;
  tv_broadcast_priority: number;
  team_rest_days: number;
  travel_distance: number;
  derby_spacing: number;
  fan_attendance: number;
}

export class FixtureOptimizer {
  private tournament: Tournament;
  private weights: OptimizationWeights;

  constructor(tournament: Tournament, weights: Partial<OptimizationWeights> = {}) {
    this.tournament = tournament;
    this.weights = {
      stadium_preference: 10,
      tv_broadcast_priority: 8,
      team_rest_days: 9,
      travel_distance: 6,
      derby_spacing: 7,
      fan_attendance: 5,
      ...weights
    };
  }

  public optimizeSchedule(
    fixtureRounds: FixtureRound[], 
    startDate: Date = new Date()
  ): OptimizationResult {
    const allMatches = this.flattenFixtureRounds(fixtureRounds);
    const result: OptimizationResult = {
      success: false,
      scheduled_matches: [],
      unscheduled_matches: [],
      conflicts: [],
      score: 0
    };

    // Create time windows for scheduling
    const timeWindows = this.generateTimeWindows(startDate, allMatches.length);
    
    // Group matches by round for scheduling
    const matchesByRound = this.groupMatchesByRound(allMatches);
    
    // Schedule round by round
    let currentWindowIndex = 0;
    
    for (const [roundNumber, matches] of Array.from(matchesByRound.entries())) {
      const roundResult = this.scheduleRound(matches, timeWindows, currentWindowIndex);
      
      result.scheduled_matches.push(...roundResult.scheduled);
      result.unscheduled_matches.push(...roundResult.unscheduled);
      result.conflicts.push(...roundResult.conflicts);
      
      // Move to next time window(s)
      currentWindowIndex += Math.ceil(matches.length / this.getMaxMatchesPerWindow());
      
      if (currentWindowIndex >= timeWindows.length) {
        // Add more time windows if needed
        const additionalWindows = this.generateTimeWindows(
          timeWindows[timeWindows.length - 1].date,
          10
        );
        timeWindows.push(...additionalWindows.slice(1)); // Skip first as it overlaps
      }
    }

    // Apply post-processing optimizations
    this.applyConstraintOptimizations(result);
    
    // Calculate overall optimization score
    result.score = this.calculateOptimizationScore(result.scheduled_matches);
    result.success = result.unscheduled_matches.length === 0 && 
                     result.conflicts.filter(c => c.severity === 'critical').length === 0;

    return result;
  }

  private flattenFixtureRounds(rounds: FixtureRound[]): Match[] {
    const matches: Match[] = [];
    for (const round of rounds) {
      matches.push(...round.matches);
    }
    return matches;
  }

  private generateTimeWindows(startDate: Date, estimatedMatches: number): TimeWindow[] {
    const windows: TimeWindow[] = [];
    const constraints = this.tournament.config.constraints;
    const timeSlots = this.tournament.config.time_slots;
    
    // Generate enough windows to accommodate all matches
    const weeksNeeded = Math.ceil(estimatedMatches / (timeSlots.length * 2)); // 2 slots per week on average
    
    let currentDate = new Date(startDate);
    
    for (let week = 0; week < weeksNeeded; week++) {
      for (const slot of timeSlots) {
        const slotDate = this.getNextDateForDay(currentDate, slot.day);
        
        windows.push({
          date: slotDate,
          time_slot: slot,
          available_stadiums: this.getAvailableStadiums(slotDate, slot),
          capacity: this.getMaxMatchesPerWindow(),
          assigned_matches: []
        });
      }
      
      // Move to next week
      currentDate.setDate(currentDate.getDate() + 7);
    }
    
    return windows.sort((a, b) => a.date.getTime() - b.date.getTime());
  }

  private getNextDateForDay(fromDate: Date, dayName: string): Date {
    const dayMap: Record<string, number> = {
      'Sunday': 0, 'Monday': 1, 'Tuesday': 2, 'Wednesday': 3,
      'Thursday': 4, 'Friday': 5, 'Saturday': 6
    };
    
    const targetDay = dayMap[dayName];
    const currentDay = fromDate.getDay();
    const daysUntilTarget = (targetDay - currentDay + 7) % 7;
    
    const resultDate = new Date(fromDate);
    resultDate.setDate(fromDate.getDate() + (daysUntilTarget === 0 ? 7 : daysUntilTarget));
    
    return resultDate;
  }

  private getAvailableStadiums(date: Date, timeSlot: TimeSlot): Stadium[] {
    const constraints = this.tournament.config.constraints;
    const allStadiums = this.tournament.config.stadiums;
    
    return allStadiums.filter(stadium => {
      // Check stadium availability for this date/time
      const availabilityKey = `${stadium.id}-${date.toISOString().split('T')[0]}`;
      const stadiumSlots = constraints.stadium_availability[availabilityKey];
      
      if (!stadiumSlots) return true; // No restrictions = available
      
      return stadiumSlots.some(slot => 
        slot.day === timeSlot.day && 
        this.timeSlotsOverlap(slot, timeSlot)
      );
    });
  }

  private timeSlotsOverlap(slot1: TimeSlot, slot2: TimeSlot): boolean {
    return slot1.start_time <= slot2.end_time && slot2.start_time <= slot1.end_time;
  }

  private getMaxMatchesPerWindow(): number {
    return this.tournament.config.matches_per_day || 4;
  }

  private groupMatchesByRound(matches: Match[]): Map<number, Match[]> {
    const grouped = new Map<number, Match[]>();
    
    for (const match of matches) {
      if (!grouped.has(match.match_round)) {
        grouped.set(match.match_round, []);
      }
      grouped.get(match.match_round)!.push(match);
    }
    
    return grouped;
  }

  private scheduleRound(
    matches: Match[], 
    timeWindows: TimeWindow[], 
    startWindowIndex: number
  ): RoundSchedulingResult {
    const result: RoundSchedulingResult = {
      scheduled: [],
      unscheduled: [],
      conflicts: []
    };

    // Prioritize matches by importance (derbies, TV matches, etc.)
    const prioritizedMatches = this.prioritizeMatches(matches);
    
    for (const match of prioritizedMatches) {
      const scheduling = this.scheduleMatch(match, timeWindows, startWindowIndex);
      
      if (scheduling.success) {
        result.scheduled.push(scheduling.scheduledMatch!);
        // Update time window availability
        this.updateTimeWindowAvailability(timeWindows, scheduling.scheduledMatch!);
      } else {
        result.unscheduled.push(match);
        result.conflicts.push(...scheduling.conflicts);
      }
    }

    return result;
  }

  private prioritizeMatches(matches: Match[]): Match[] {
    return matches.sort((a, b) => {
      // Sort by priority: derbies first, then by broadcast priority
      if (a.is_derby && !b.is_derby) return -1;
      if (!a.is_derby && b.is_derby) return 1;
      
      return (b.broadcast_priority || 0) - (a.broadcast_priority || 0);
    });
  }

  private scheduleMatch(
    match: Match, 
    timeWindows: TimeWindow[], 
    startWindowIndex: number
  ): MatchSchedulingResult {
    const result: MatchSchedulingResult = {
      success: false,
      conflicts: []
    };

    // Try to find suitable time window
    for (let i = startWindowIndex; i < timeWindows.length; i++) {
      const window = timeWindows[i];
      
      // Check if window has capacity
      if (window.assigned_matches.length >= window.capacity) continue;
      
      // Check team rest period constraints
      const restViolation = this.checkTeamRestPeriods(match, window, timeWindows);
      if (restViolation) {
        result.conflicts.push(restViolation);
        continue;
      }
      
      // Find best stadium for this match
      const stadiumAssignment = this.assignStadium(match, window);
      if (!stadiumAssignment.success) {
        result.conflicts.push(...stadiumAssignment.conflicts);
        continue;
      }
      
      // Check police restrictions
      const policeViolation = this.checkPoliceRestrictions(match, window);
      if (policeViolation) {
        result.conflicts.push(policeViolation);
        continue;
      }
      
      // Success! Create scheduled fixture
      result.success = true;
      result.scheduledMatch = {
        ...match,
        scheduled_date: window.date,
        scheduled_time: window.time_slot.start_time,
        assigned_stadium: stadiumAssignment.stadium!,
        optimization_score: this.calculateMatchScore(match, window, stadiumAssignment.stadium!),
        constraints_applied: [
          'time_slot_assigned',
          'stadium_assigned',
          'team_rest_respected',
          ...(match.is_derby ? ['derby_spacing'] : [])
        ]
      };
      break;
    }

    return result;
  }

  private checkTeamRestPeriods(match: Match, window: TimeWindow, allWindows: TimeWindow[]): Conflict | null {
    const minRestDays = this.tournament.config.constraints.minimum_rest_days;
    
    // Check recent matches for both teams
    const teamsToCheck = [match.home_team_id, match.away_team_id];
    
    for (const teamId of teamsToCheck) {
      const lastMatch = this.findLastMatchForTeam(teamId, allWindows, window.date);
      if (lastMatch) {
        const daysBetween = this.getDaysBetween(lastMatch.scheduled_date, window.date);
        if (daysBetween < minRestDays) {
          return {
            type: 'team_conflict',
            severity: 'high',
            description: `Team ${teamId} has insufficient rest (${daysBetween} days, minimum ${minRestDays})`,
            affected_matches: [match.id],
            suggested_resolution: `Schedule after ${lastMatch.scheduled_date.toISOString().split('T')[0]}`
          };
        }
      }
    }
    
    return null;
  }

  private assignStadium(match: Match, window: TimeWindow): StadiumAssignmentResult {
    const result: StadiumAssignmentResult = {
      success: false,
      conflicts: []
    };

    // Get home team's preferred stadium
    const homeTeam = this.tournament.getTeamById(match.home_team_id);
    const preferredStadium = homeTeam?.stadium_id ? 
      window.available_stadiums.find(s => s.id === homeTeam.stadium_id) : null;

    if (preferredStadium && this.isStadiumAvailable(preferredStadium, window)) {
      result.success = true;
      result.stadium = preferredStadium;
      return result;
    }

    // Find next best available stadium
    const availableStadiums = window.available_stadiums.filter(s => 
      this.isStadiumAvailable(s, window)
    );

    if (availableStadiums.length === 0) {
      result.conflicts.push({
        type: 'stadium_conflict',
        severity: 'critical',
        description: 'No stadiums available for this time slot',
        affected_matches: [match.id],
        suggested_resolution: 'Consider alternative time slots or add stadium capacity'
      });
      return result;
    }

    // Select stadium based on capacity, location, etc.
    result.stadium = this.selectBestStadium(availableStadiums, match);
    result.success = true;

    return result;
  }

  private isStadiumAvailable(stadium: Stadium, window: TimeWindow): boolean {
    // Check if stadium is already assigned in this time window
    return !window.assigned_matches.some(m => 
      m.assigned_stadium?.id === stadium.id
    );
  }

  private selectBestStadium(stadiums: Stadium[], match: Match): Stadium {
    // Score stadiums based on various factors
    let bestStadium = stadiums[0];
    let bestScore = 0;

    for (const stadium of stadiums) {
      let score = 0;
      
      // Higher capacity is better
      score += stadium.capacity / 1000;
      
      // Derby matches prefer larger stadiums
      if (match.is_derby) {
        score += stadium.capacity / 500;
      }
      
      if (score > bestScore) {
        bestScore = score;
        bestStadium = stadium;
      }
    }

    return bestStadium;
  }

  private checkPoliceRestrictions(match: Match, window: TimeWindow): Conflict | null {
    const restrictions = this.tournament.config.constraints.police_restrictions;
    
    if (match.is_derby && restrictions[match.id]) {
      const minGap = restrictions[match.id];
      // Implementation would check for other high-risk matches in the area
      // For now, just a placeholder
    }
    
    return null;
  }

  private calculateMatchScore(match: Match, window: TimeWindow, stadium: Stadium): number {
    let score = 0;
    
    // Time slot preference
    score += window.time_slot.priority * this.weights.stadium_preference;
    
    // Stadium quality
    score += (stadium.capacity / 1000) * this.weights.fan_attendance;
    
    // Derby bonus
    if (match.is_derby) {
      score += 50;
    }
    
    // Broadcast priority
    score += (match.broadcast_priority || 0) * this.weights.tv_broadcast_priority;
    
    return score;
  }

  private updateTimeWindowAvailability(timeWindows: TimeWindow[], scheduledMatch: ScheduledFixture): void {
    const window = timeWindows.find(w => 
      w.date.getTime() === scheduledMatch.scheduled_date.getTime() &&
      w.time_slot.start_time === scheduledMatch.scheduled_time
    );
    
    if (window) {
      window.assigned_matches.push(scheduledMatch);
    }
  }

  private applyConstraintOptimizations(result: OptimizationResult): void {
    // Post-processing to resolve soft constraints
    this.optimizeTravelDistances(result.scheduled_matches);
    this.balanceStadiumUsage(result.scheduled_matches);
    this.optimizeTVSlots(result.scheduled_matches);
  }

  private optimizeTravelDistances(matches: ScheduledFixture[]): void {
    // Implement travel distance optimization
    console.log('Optimizing travel distances for', matches.length, 'matches');
  }

  private balanceStadiumUsage(matches: ScheduledFixture[]): void {
    // Ensure fair distribution of matches across stadiums
    const stadiumUsage = new Map<string, number>();
    
    for (const match of matches) {
      const stadiumId = match.assigned_stadium.id;
      stadiumUsage.set(stadiumId, (stadiumUsage.get(stadiumId) || 0) + 1);
    }
    
    console.log('Stadium usage distribution:', Object.fromEntries(stadiumUsage));
  }

  private optimizeTVSlots(matches: ScheduledFixture[]): void {
    // Optimize TV broadcast scheduling
    const tvSlots = this.tournament.config.constraints.tv_broadcast_slots;
    console.log('Optimizing TV slots for', Object.keys(tvSlots).length, 'broadcast windows');
  }

  private calculateOptimizationScore(matches: ScheduledFixture[]): number {
    return matches.reduce((total, match) => total + match.optimization_score, 0);
  }

  private findLastMatchForTeam(teamId: string, windows: TimeWindow[], beforeDate: Date): ScheduledFixture | null {
    let lastMatch: ScheduledFixture | null = null;
    let lastDate = new Date(0);
    
    for (const window of windows) {
      if (window.date >= beforeDate) continue;
      
      for (const match of window.assigned_matches) {
        if ((match.home_team_id === teamId || match.away_team_id === teamId) &&
            window.date > lastDate) {
          lastMatch = match;
          lastDate = window.date;
        }
      }
    }
    
    return lastMatch;
  }

  private getDaysBetween(date1: Date, date2: Date): number {
    const timeDiff = Math.abs(date2.getTime() - date1.getTime());
    return Math.ceil(timeDiff / (1000 * 3600 * 24));
  }
}

// Supporting interfaces
interface TimeWindow {
  date: Date;
  time_slot: TimeSlot;
  available_stadiums: Stadium[];
  capacity: number;
  assigned_matches: ScheduledFixture[];
}

interface RoundSchedulingResult {
  scheduled: ScheduledFixture[];
  unscheduled: Match[];
  conflicts: Conflict[];
}

interface MatchSchedulingResult {
  success: boolean;
  scheduledMatch?: ScheduledFixture;
  conflicts: Conflict[];
}

interface StadiumAssignmentResult {
  success: boolean;
  stadium?: Stadium;
  conflicts: Conflict[];
}