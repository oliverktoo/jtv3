import { addDays, format, parse, isWeekend } from 'date-fns';

// Types for the enhanced fixture generation system
interface Team {
  id: string;
  name: string;
  county: string;
  constituency?: string;
  orgId?: string;
}

interface Venue {
  id: string;
  name: string;
  location: string;
  county: string;
  constituency: string;
  pitchCount: number;
  coordinates?: { lat: number; lng: number };
}

interface TimeSlot {
  id: string;
  time: string;
  label: string;
}

interface TournamentConfig {
  format: string;
  venues: Venue[];
  timeSlots: TimeSlot[];
  startDate: string;
  endDate: string;
  groupingStrategy: string;
  matchDuration: number;
  bufferTime: number;
  restPeriod: number;
  groupCount?: number;
  teamsPerGroup?: number;
}

interface ScheduledMatch {
  id: string;
  round: number;
  leg: number;
  homeTeam: Team;
  awayTeam: Team;
  venue?: Venue;
  kickoff?: Date;
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  cost?: number;
  groupId?: string;
}

interface FixtureConflict {
  type: 'REST_PERIOD' | 'DOUBLE_BOOKING' | 'TRAVEL_BURDEN' | 'VENUE_CLASH';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  message: string;
  fixtureId: string;
}

interface Group {
  id: string;
  name: string;
  teams: Team[];
  matches: ScheduledMatch[];
}

// Enhanced Jamii Fixture Generation Engine
export class JamiiFixtureEngine {
  private venues: Venue[] = [];
  private teams: Team[] = [];
  private config: TournamentConfig;
  private groups: Group[] = [];
  
  constructor(teams: Team[], config: TournamentConfig) {
    this.teams = teams;
    this.config = config;
    this.venues = config.venues || [];
  }

  /**
   * Phase 1: Data Preparation & Validation
   */
  validateConfiguration(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (this.teams.length < 2) {
      errors.push('At least 2 teams are required for a tournament');
    }

    if (!this.config.startDate || !this.config.endDate) {
      errors.push('Tournament dates must be specified');
    }

    if (this.venues.length === 0) {
      errors.push('At least one venue must be specified');
    }

    if (this.config.timeSlots.length === 0) {
      errors.push('At least one time slot must be specified');
    }

    // Format-specific validations
    if (this.config.format === 'group_knockout') {
      const expectedTeams = (this.config.groupCount || 0) * (this.config.teamsPerGroup || 0);
      if (this.teams.length !== expectedTeams) {
        errors.push(`Group knockout format requires exactly ${expectedTeams} teams (${this.config.groupCount} groups × ${this.config.teamsPerGroup} teams)`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Phase 2: Intelligent Team Grouping with Geographical Distribution
   */
  createGroups(): Group[] {
    switch (this.config.format) {
      case 'group_knockout':
        return this.createGeographicalGroups();
      case 'round_robin':
        return [{
          id: 'main',
          name: 'Main Group',
          teams: this.teams,
          matches: []
        }];
      default:
        return [{
          id: 'bracket',
          name: 'Tournament Bracket',
          teams: this.teams,
          matches: []
        }];
    }
  }

  private createGeographicalGroups(): Group[] {
    const groupCount = this.config.groupCount || 4;
    const teamsPerGroup = this.config.teamsPerGroup || 4;
    
    // Step 1: Group teams by county for geographical distribution
    const teamsByCounty = this.teams.reduce((acc, team) => {
      const county = team.county || 'Unknown';
      if (!acc[county]) acc[county] = [];
      acc[county].push(team);
      return acc;
    }, {} as Record<string, Team[]>);

    // Step 2: Create groups ensuring geographical diversity
    const groups: Group[] = Array.from({ length: groupCount }, (_, i) => ({
      id: `group_${i + 1}`,
      name: `Group ${String.fromCharCode(65 + i)}`, // Group A, B, C, etc.
      teams: [],
      matches: []
    }));

    // Step 3: Distribute teams using round-robin assignment by county
    const counties = Object.keys(teamsByCounty);
    let groupIndex = 0;

    counties.forEach(county => {
      teamsByCounty[county].forEach(team => {
        groups[groupIndex].teams.push(team);
        groupIndex = (groupIndex + 1) % groupCount;
      });
    });

    this.groups = groups;
    return groups;
  }

  /**
   * Phase 3: Match Generation using Circle Method Algorithm
   */
  generateMatches(): ScheduledMatch[] {
    let allMatches: ScheduledMatch[] = [];

    this.groups.forEach(group => {
      const groupMatches = this.generateRoundRobinForGroup(group);
      allMatches = allMatches.concat(groupMatches);
    });

    return allMatches;
  }

  private generateRoundRobinForGroup(group: Group): ScheduledMatch[] {
    const teams = [...group.teams];
    const matches: ScheduledMatch[] = [];
    
    if (teams.length < 2) return matches;

    // Add a bye team if odd number of teams
    if (teams.length % 2 === 1) {
      teams.push({ id: 'bye', name: 'BYE', county: 'N/A' } as Team);
    }

    const totalTeams = teams.length;
    const totalRounds = totalTeams - 1;

    // Circle method for round-robin generation
    for (let round = 1; round <= totalRounds; round++) {
      const roundMatches = this.generateRound(teams, round, group.id);
      matches.push(...roundMatches);
    }

    // Filter out bye matches
    return matches.filter(match => 
      match.homeTeam.id !== 'bye' && match.awayTeam.id !== 'bye'
    );
  }

  private generateRound(teams: Team[], round: number, groupId: string): ScheduledMatch[] {
    const matches: ScheduledMatch[] = [];
    const totalTeams = teams.length;
    
    // First team stays fixed, others rotate
    for (let i = 0; i < totalTeams / 2; i++) {
      const homeIndex = i;
      const awayIndex = totalTeams - 1 - i;
      
      if (homeIndex !== awayIndex) {
        const homeTeam = i === 0 ? teams[0] : teams[(homeIndex + round - 1) % (totalTeams - 1) + 1];
        const awayTeam = i === 0 ? teams[(round - 1) % (totalTeams - 1) + 1] : teams[awayIndex];
        
        matches.push({
          id: `${groupId}_r${round}_m${i + 1}`,
          round,
          leg: 1,
          homeTeam,
          awayTeam,
          status: 'SCHEDULED',
          groupId
        });
      }
    }

    return matches;
  }

  /**
   * Phase 4: Intelligent Venue & Time Assignment with Cost Optimization
   */
  assignVenuesAndTimes(matches: ScheduledMatch[]): { 
    scheduledMatches: ScheduledMatch[]; 
    conflicts: FixtureConflict[] 
  } {
    const scheduledMatches: ScheduledMatch[] = [];
    const conflicts: FixtureConflict[] = [];
    const venueBookings = new Map<string, Map<string, boolean>>(); // venue -> datetime -> booked

    // Sort matches by priority (geographical proximity)
    const sortedMatches = matches.sort((a, b) => 
      this.calculateGeographicalPriority(a) - this.calculateGeographicalPriority(b)
    );

    const startDate = new Date(this.config.startDate);
    const endDate = new Date(this.config.endDate);
    
    sortedMatches.forEach(match => {
      const assignment = this.findOptimalVenueAndTime(
        match,
        startDate,
        endDate,
        venueBookings,
        scheduledMatches
      );

      if (assignment.venue && assignment.kickoff) {
        const scheduledMatch: ScheduledMatch = {
          ...match,
          venue: assignment.venue,
          kickoff: assignment.kickoff,
          cost: assignment.cost
        };

        scheduledMatches.push(scheduledMatch);

        // Mark venue as booked
        const venueKey = assignment.venue.id;
        const timeKey = assignment.kickoff.toISOString();
        
        if (!venueBookings.has(venueKey)) {
          venueBookings.set(venueKey, new Map());
        }
        venueBookings.get(venueKey)!.set(timeKey, true);

      } else {
        conflicts.push({
          type: 'VENUE_CLASH',
          severity: 'CRITICAL',
          message: `Could not find suitable venue/time for ${match.homeTeam.name} vs ${match.awayTeam.name}`,
          fixtureId: match.id
        });
      }
    });

    // Check for additional conflicts
    const additionalConflicts = this.detectConflicts(scheduledMatches);
    conflicts.push(...additionalConflicts);

    return { scheduledMatches, conflicts };
  }

  private calculateGeographicalPriority(match: ScheduledMatch): number {
    // Teams from same county get higher priority for local venues
    const sameCounty = match.homeTeam.county === match.awayTeam.county;
    return sameCounty ? 1 : 2;
  }

  private findOptimalVenueAndTime(
    match: ScheduledMatch,
    startDate: Date,
    endDate: Date,
    venueBookings: Map<string, Map<string, boolean>>,
    existingMatches: ScheduledMatch[]
  ): { venue?: Venue; kickoff?: Date; cost?: number } {
    
    let bestAssignment: { venue?: Venue; kickoff?: Date; cost?: number } = {};
    let lowestCost = Infinity;

    // Try each venue
    this.venues.forEach(venue => {
      const cost = this.calculateVenueCost(match, venue);
      
      if (cost < lowestCost) {
        // Try each day in the tournament period
        for (let date = new Date(startDate); date <= endDate; date = addDays(date, 1)) {
          // Skip if not a tournament day (e.g., avoid Sundays if specified)
          if (this.shouldSkipDate(date)) continue;

          // Try each time slot
          this.config.timeSlots.forEach(timeSlot => {
            const kickoff = this.createDateTime(date, timeSlot.time);
            
            if (this.isTimeSlotAvailable(venue, kickoff, venueBookings) && 
                this.meetsRestPeriodRequirement(match, kickoff, existingMatches)) {
              
              bestAssignment = { venue, kickoff, cost };
              lowestCost = cost;
            }
          });
        }
      }
    });

    return bestAssignment;
  }

  private calculateVenueCost(match: ScheduledMatch, venue: Venue): number {
    // Cost function based on travel distance and venue quality
    let cost = 0;

    // Travel cost - prefer venues in same county as teams
    if (venue.county === match.homeTeam.county || venue.county === match.awayTeam.county) {
      cost += 1; // Low cost for local venue
    } else {
      cost += 5; // Higher cost for distant venue
    }

    // Venue capacity cost (assuming more pitches = better facilities)
    cost += Math.max(1, 4 - venue.pitchCount);

    return cost;
  }

  private shouldSkipDate(date: Date): boolean {
    // Skip Sundays for most tournaments
    return date.getDay() === 0;
  }

  private createDateTime(date: Date, timeString: string): Date {
    const [hours, minutes] = timeString.split(':').map(Number);
    const dateTime = new Date(date);
    dateTime.setHours(hours, minutes, 0, 0);
    return dateTime;
  }

  private isTimeSlotAvailable(
    venue: Venue, 
    kickoff: Date, 
    venueBookings: Map<string, Map<string, boolean>>
  ): boolean {
    const venueKey = venue.id;
    const timeKey = kickoff.toISOString();
    
    const venueSchedule = venueBookings.get(venueKey);
    if (!venueSchedule) return true;
    
    return !venueSchedule.get(timeKey);
  }

  private meetsRestPeriodRequirement(
    match: ScheduledMatch,
    kickoff: Date,
    existingMatches: ScheduledMatch[]
  ): boolean {
    const restPeriodMs = this.config.restPeriod * 60 * 60 * 1000; // Convert hours to milliseconds
    
    // Check if either team has played recently
    const teamIds = [match.homeTeam.id, match.awayTeam.id];
    
    return !existingMatches.some(existingMatch => {
      if (!existingMatch.kickoff) return false;
      
      const hasCommonTeam = teamIds.some(teamId => 
        existingMatch.homeTeam.id === teamId || existingMatch.awayTeam.id === teamId
      );
      
      if (hasCommonTeam) {
        const timeDiff = Math.abs(kickoff.getTime() - existingMatch.kickoff.getTime());
        return timeDiff < restPeriodMs;
      }
      
      return false;
    });
  }

  /**
   * Phase 5: Conflict Detection and Resolution
   */
  private detectConflicts(matches: ScheduledMatch[]): FixtureConflict[] {
    const conflicts: FixtureConflict[] = [];
    
    matches.forEach((match, index) => {
      // Check for rest period violations
      const restConflicts = this.checkRestPeriodConflicts(match, matches.slice(0, index));
      conflicts.push(...restConflicts);
      
      // Check for venue double booking
      const venueConflicts = this.checkVenueConflicts(match, matches.slice(0, index));
      conflicts.push(...venueConflicts);
      
      // Check for excessive travel burden
      const travelConflicts = this.checkTravelBurden(match);
      conflicts.push(...travelConflicts);
    });

    return conflicts;
  }

  private checkRestPeriodConflicts(match: ScheduledMatch, previousMatches: ScheduledMatch[]): FixtureConflict[] {
    const conflicts: FixtureConflict[] = [];
    const restPeriodMs = this.config.restPeriod * 60 * 60 * 1000;
    
    if (!match.kickoff) return conflicts;
    
    const teamIds = [match.homeTeam.id, match.awayTeam.id];
    
    previousMatches.forEach(prevMatch => {
      if (!prevMatch.kickoff) return;
      
      const hasCommonTeam = teamIds.some(teamId => 
        prevMatch.homeTeam.id === teamId || prevMatch.awayTeam.id === teamId
      );
      
      if (hasCommonTeam) {
        const timeDiff = Math.abs(match.kickoff!.getTime() - prevMatch.kickoff.getTime());
        
        if (timeDiff < restPeriodMs) {
          conflicts.push({
            type: 'REST_PERIOD',
            severity: 'HIGH',
            message: `Insufficient rest period for team (${timeDiff / (60 * 60 * 1000)} hours)`,
            fixtureId: match.id
          });
        }
      }
    });
    
    return conflicts;
  }

  private checkVenueConflicts(match: ScheduledMatch, previousMatches: ScheduledMatch[]): FixtureConflict[] {
    const conflicts: FixtureConflict[] = [];
    
    if (!match.venue || !match.kickoff) return conflicts;
    
    const matchEndTime = new Date(match.kickoff.getTime() + (this.config.matchDuration + this.config.bufferTime) * 60 * 1000);
    
    previousMatches.forEach(prevMatch => {
      if (!prevMatch.venue || !prevMatch.kickoff || prevMatch.venue.id !== match.venue!.id) return;
      
      const prevMatchEndTime = new Date(prevMatch.kickoff.getTime() + (this.config.matchDuration + this.config.bufferTime) * 60 * 1000);
      
      // Check for overlap
      if ((match.kickoff! < prevMatchEndTime) && (matchEndTime > prevMatch.kickoff)) {
        conflicts.push({
          type: 'DOUBLE_BOOKING',
          severity: 'CRITICAL',
          message: `Venue ${match.venue!.name} double-booked`,
          fixtureId: match.id
        });
      }
    });
    
    return conflicts;
  }

  private checkTravelBurden(match: ScheduledMatch): FixtureConflict[] {
    const conflicts: FixtureConflict[] = [];
    
    if (!match.venue) return conflicts;
    
    // Check if teams are traveling too far from their home county
    [match.homeTeam, match.awayTeam].forEach(team => {
      if (team.county && match.venue!.county !== team.county) {
        // This is a simplified check - in production, you'd calculate actual distances
        conflicts.push({
          type: 'TRAVEL_BURDEN',
          severity: 'LOW',
          message: `${team.name} traveling from ${team.county} to ${match.venue!.county}`,
          fixtureId: match.id
        });
      }
    });
    
    return conflicts;
  }

  /**
   * Main Generation Method
   */
  generateFixtures(): { fixtures: ScheduledMatch[]; conflicts: FixtureConflict[]; groups: Group[] } {
    // Phase 1: Validate configuration
    const validation = this.validateConfiguration();
    if (!validation.isValid) {
      throw new Error(`Configuration errors: ${validation.errors.join(', ')}`);
    }

    // Phase 2: Create groups with geographical distribution
    this.groups = this.createGroups();

    // Phase 3: Generate matches using circle method
    const matches = this.generateMatches();

    // Phase 4: Assign venues and times with cost optimization
    const { scheduledMatches, conflicts } = this.assignVenuesAndTimes(matches);

    return {
      fixtures: scheduledMatches,
      conflicts,
      groups: this.groups
    };
  }
}

// Export utility function for easy API usage
export function generateJamiiFixtures(teams: Team[], config: TournamentConfig) {
  const engine = new JamiiFixtureEngine(teams, config);
  return engine.generateFixtures();
}

// Export types for use in other modules
export type {
  Team,
  Venue,
  TimeSlot,
  TournamentConfig,
  ScheduledMatch,
  FixtureConflict,
  Group
};