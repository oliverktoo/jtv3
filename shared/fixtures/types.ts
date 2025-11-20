/**
 * Comprehensive Tournament Fixture System Types
 * Jamii Tourney v3 - Production-Ready Architecture
 */

// Core Tournament Types
export interface Tournament {
  id: string;
  name: string;
  type: TournamentType;
  status: TournamentStatus;
  config: TournamentConfig;
  orgId: string;
  createdAt: Date;
  updatedAt: Date;
}

export type TournamentType = 
  | 'round_robin' 
  | 'knockout' 
  | 'group_stage' 
  | 'league' 
  | 'cup'
  | 'hybrid';

export type TournamentStatus = 
  | 'draft' 
  | 'scheduled' 
  | 'active' 
  | 'paused' 
  | 'completed' 
  | 'cancelled';

export interface TournamentConfig {
  legs: number; // 1 = single, 2 = double round-robin
  maxTeams: number;
  minTeams: number;
  matchesPerRound?: number;
  stadiums: string[]; // Stadium IDs
  timeSlots: TimeSlot[];
  constraints: TournamentConstraints;
  pointsSystem: PointsSystem;
  tieBreakers: TieBreaker[];
  allowDraws: boolean;
  extraTime: boolean;
  penalties: boolean;
}

// Team Management
export interface TournamentTeam {
  id: string;
  teamId: string;
  tournamentId: string;
  groupId?: string; // For group stage tournaments
  seedRating?: number;
  registeredAt: Date;
  status: 'registered' | 'confirmed' | 'withdrawn';
}

// Fixture Generation
export interface FixtureRequest {
  tournamentId: string;
  teams: TournamentTeam[];
  startDate: Date;
  endDate?: Date;
  constraints?: FixtureConstraints;
  regenerate?: boolean; // Regenerate existing fixtures
}

export interface GeneratedFixture {
  matches: Match[];
  rounds: FixtureRound[];
  metadata: FixtureMetadata;
  warnings: string[];
  errors: string[];
}

export interface Match {
  id: string;
  tournamentId: string;
  roundNumber: number;
  homeTeamId: string;
  awayTeamId: string;
  scheduledDate: Date;
  stadiumId?: string;
  status: MatchStatus;
  homeScore?: number;
  awayScore?: number;
  extraTimeScore?: [number, number];
  penaltyScore?: [number, number];
  result?: MatchResult;
  events: MatchEvent[];
  officials?: MatchOfficials;
  constraints: MatchConstraints;
}

export type MatchStatus = 
  | 'scheduled' 
  | 'live' 
  | 'half_time' 
  | 'finished' 
  | 'postponed' 
  | 'cancelled' 
  | 'abandoned';

export type MatchResult = 'home_win' | 'away_win' | 'draw';

export interface FixtureRound {
  id: string;
  tournamentId: string;
  roundNumber: number;
  name: string; // "Round 1", "Quarterfinals", etc.
  startDate: Date;
  endDate: Date;
  matches: string[]; // Match IDs
  status: 'pending' | 'active' | 'completed';
}

// Constraints System
export interface TournamentConstraints {
  minimumRestDays: number; // Between matches for same team
  maximumMatchesPerDay: number;
  preferredKickoffTimes: string[]; // ["15:00", "17:30"]
  blackoutDates: Date[]; // No matches on these dates
  derbySpacing: number; // Minimum rounds between derby matches
  tvSlotPreferences: TVSlotPreference[];
  policeRestrictions: PoliceRestriction[];
  venueRestrictions: VenueRestriction[];
}

export interface FixtureConstraints extends TournamentConstraints {
  teamRequests: TeamRequest[];
  priorityMatches: PriorityMatch[];
  avoidClashes: AvoidClash[];
}

export interface TeamRequest {
  teamId: string;
  type: 'preferred_date' | 'avoid_date' | 'home_preference' | 'venue_request';
  dates?: Date[];
  priority: 'high' | 'medium' | 'low';
  reason: string;
}

export interface PriorityMatch {
  homeTeamId: string;
  awayTeamId: string;
  priority: 'derby' | 'title_decider' | 'relegation' | 'cup_final' | 'tv_featured';
  preferredDate?: Date;
  preferredSlot?: string;
  minimumNotice: number; // Days
}

// Venue Management
export interface Stadium {
  id: string;
  name: string;
  capacity: number;
  location: string;
  availableSlots: TimeSlot[];
  restrictions: string[];
  facilities: string[];
  isNeutralVenue: boolean;
}

export interface TimeSlot {
  id: string;
  startTime: string; // "15:00"
  endTime: string; // "17:00"
  dayOfWeek?: number[]; // [0,6] = Sunday to Saturday
  isPreferred: boolean;
  tvSlot: boolean;
  capacity?: number; // For TV slots
}

// Constraints Details
export interface TVSlotPreference {
  slot: TimeSlot;
  requiredMatches: number; // Matches needed for this slot
  teamPreferences: string[]; // Team IDs that work well for TV
}

export interface PoliceRestriction {
  type: 'high_risk_derby' | 'crowd_control' | 'traffic_management';
  affectedTeams: string[];
  minimumSpacing: number; // Days between matches
  requiredNotice: number; // Days advance notice
}

export interface VenueRestriction {
  stadiumId: string;
  type: 'maintenance' | 'booking_conflict' | 'weather_dependent';
  blockedDates: Date[];
  capacity?: number; // Reduced capacity
}

export interface AvoidClash {
  type: 'local_event' | 'other_sport' | 'public_holiday';
  date: Date;
  affectedStadiums?: string[];
  severity: 'absolute' | 'preferred';
}

// Points and Standings
export interface PointsSystem {
  win: number; // Usually 3
  draw: number; // Usually 1
  loss: number; // Usually 0
  walkover: number; // Usually 3 for opponent
  forfeit: number; // Usually 0 for team, 3 for opponent
}

export type TieBreaker = 
  | 'points'
  | 'goal_difference' 
  | 'goals_for' 
  | 'goals_against'
  | 'head_to_head_points'
  | 'head_to_head_goal_difference'
  | 'head_to_head_goals_for'
  | 'away_goals'
  | 'disciplinary_points'
  | 'drawing_lots';

export interface StandingsEntry {
  position: number;
  teamId: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  form: MatchResult[]; // Last 5 results
  homeRecord: TeamRecord;
  awayRecord: TeamRecord;
  lastUpdated: Date;
}

export interface TeamRecord {
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
}

// Match Events
export interface MatchEvent {
  id: string;
  matchId: string;
  type: MatchEventType;
  minute: number;
  playerId?: string;
  teamId: string;
  description: string;
  timestamp: Date;
}

export type MatchEventType = 
  | 'goal' 
  | 'yellow_card' 
  | 'red_card' 
  | 'substitution' 
  | 'penalty' 
  | 'own_goal'
  | 'kick_off'
  | 'half_time'
  | 'full_time'
  | 'extra_time'
  | 'penalty_shootout';

export interface MatchOfficials {
  referee: string; // Official ID
  assistantReferees: string[];
  fourthOfficial?: string;
  var?: string; // Video Assistant Referee
}

export interface MatchConstraints {
  minimumNotice: number; // Days
  requiredOfficials: number;
  broadcastSlot?: string;
  securityLevel: 'low' | 'medium' | 'high';
  expectedAttendance?: number;
}

// Fixture Generation Metadata
export interface FixtureMetadata {
  generatedAt: Date;
  generatedBy: string; // User ID
  algorithm: 'circle_method' | 'berger_table' | 'custom';
  parameters: Record<string, any>;
  qualityScore: number; // 0-100 rating of fixture quality
  constraintsSatisfied: number;
  constraintsTotal: number;
  estimatedDuration: number; // Tournament duration in days
}

// Real-time Updates
export interface LiveUpdate {
  type: LiveUpdateType;
  tournamentId: string;
  matchId?: string;
  data: any;
  timestamp: Date;
}

export type LiveUpdateType = 
  | 'match_started'
  | 'goal_scored'
  | 'match_finished'
  | 'standings_updated'
  | 'fixture_changed'
  | 'tournament_status_changed';

// API Responses
export interface FixtureGenerationResponse {
  success: boolean;
  fixture?: GeneratedFixture;
  errors: string[];
  warnings: string[];
  alternatives?: GeneratedFixture[]; // Alternative fixture options
}

export interface StandingsResponse {
  success: boolean;
  standings: StandingsEntry[];
  lastUpdated: Date;
  nextMatches: Match[];
  completedMatches: number;
  totalMatches: number;
}

// Search and Filtering
export interface FixtureFilter {
  tournamentId?: string;
  teamId?: string;
  dateFrom?: Date;
  dateTo?: Date;
  status?: MatchStatus[];
  round?: number[];
  stadium?: string[];
}

export interface StandingsFilter {
  tournamentId: string;
  asOfDate?: Date; // Historical standings
  homeOnly?: boolean;
  awayOnly?: boolean;
  lastNMatches?: number;
}