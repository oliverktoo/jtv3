/**
 * API Validation Schemas using Zod
 * Comprehensive input validation for all fixture-related endpoints
 */

import { z } from 'zod';

// ============================================================================
// TOURNAMENT VALIDATION
// ============================================================================

export const createTournamentSchema = z.object({
  name: z.string().min(3, 'Tournament name must be at least 3 characters').max(100),
  sport_id: z.string().uuid('Invalid sport ID'),
  org_id: z.string().uuid('Invalid organization ID'),
  season: z.string().min(4, 'Season must be specified (e.g., 2025/26)'),
  tournament_model: z.enum([
    'ADMINISTRATIVE_WARD',
    'ADMINISTRATIVE_COUNTY',
    'LEAGUE',
    'OPEN_COUNTY',
    'OPEN_NATIONAL',
    'INDEPENDENT',
    'INVITATIONAL'
  ], { errorMap: () => ({ message: 'Invalid tournament model' }) }),
  start_date: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)),
  end_date: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)),
  county_id: z.string().uuid().optional().nullable(),
  sub_county_id: z.string().uuid().optional().nullable(),
  description: z.string().max(500).optional().nullable(),
}).refine(data => {
  // End date must be after start date
  const start = new Date(data.start_date);
  const end = new Date(data.end_date);
  return end >= start;
}, {
  message: 'End date must be after or equal to start date',
  path: ['end_date']
});

export const updateTournamentSchema = createTournamentSchema.partial();

// ============================================================================
// FIXTURE GENERATION VALIDATION
// ============================================================================

export const generateFixturesSchema = z.object({
  tournamentId: z.string().uuid('Invalid tournament ID'),
  teams: z.array(z.string().uuid()).min(2, 'At least 2 teams required').max(256, 'Maximum 256 teams allowed'),
  groupCount: z.number().int().min(1).max(32).optional(),
  teamsPerGroup: z.number().int().min(2).max(32).optional(),
  matchesPerDay: z.number().int().min(1).max(20).optional(),
  matchDuration: z.number().int().min(30).max(240).optional(), // minutes
  breakBetweenMatches: z.number().int().min(0).max(120).optional(), // minutes
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(), // HH:MM format
  venueIds: z.array(z.string().uuid()).optional(),
  format: z.enum(['SINGLE_ROUND_ROBIN', 'DOUBLE_ROUND_ROBIN', 'KNOCKOUT', 'GROUP_KNOCKOUT'], {
    errorMap: () => ({ message: 'Invalid format' })
  }),
  knockoutRounds: z.number().int().min(1).max(10).optional(),
}).refine(data => {
  // If groups specified, both must be provided
  if (data.groupCount || data.teamsPerGroup) {
    return data.groupCount && data.teamsPerGroup;
  }
  return true;
}, {
  message: 'Both groupCount and teamsPerGroup must be provided together',
  path: ['groupCount']
}).refine(data => {
  // Validate teams can be evenly divided into groups
  if (data.groupCount && data.teamsPerGroup) {
    const totalTeams = data.teams.length;
    const requiredTeams = data.groupCount * data.teamsPerGroup;
    return totalTeams === requiredTeams;
  }
  return true;
}, {
  message: 'Number of teams must match groupCount × teamsPerGroup',
  path: ['teams']
});

// ============================================================================
// MATCH UPDATE VALIDATION
// ============================================================================

export const updateMatchScoreSchema = z.object({
  home_score: z.number().int().min(0, 'Score cannot be negative').max(999),
  away_score: z.number().int().min(0, 'Score cannot be negative').max(999),
  status: z.enum(['SCHEDULED', 'LIVE', 'HALFTIME', 'COMPLETED', 'POSTPONED', 'CANCELLED'], {
    errorMap: () => ({ message: 'Invalid match status' })
  }).optional(),
  kickoff_time: z.string().datetime().optional(),
});

export const updateMatchSchema = z.object({
  home_team_id: z.string().uuid().optional(),
  away_team_id: z.string().uuid().optional(),
  venue_id: z.string().uuid().optional().nullable(),
  kickoff_time: z.string().datetime().optional(),
  status: z.enum(['SCHEDULED', 'LIVE', 'HALFTIME', 'COMPLETED', 'POSTPONED', 'CANCELLED']).optional(),
  home_score: z.number().int().min(0).max(999).optional().nullable(),
  away_score: z.number().int().min(0).max(999).optional().nullable(),
  round_id: z.string().uuid().optional(),
  match_number: z.number().int().min(1).optional(),
}).refine(data => {
  // Cannot have same team for home and away
  if (data.home_team_id && data.away_team_id) {
    return data.home_team_id !== data.away_team_id;
  }
  return true;
}, {
  message: 'Home and away teams must be different',
  path: ['away_team_id']
});

// ============================================================================
// MATCH EVENT VALIDATION
// ============================================================================

export const createMatchEventSchema = z.object({
  event_type: z.enum([
    'GOAL', 'YELLOW_CARD', 'RED_CARD', 'SUBSTITUTION', 'PENALTY',
    'OWN_GOAL', 'KICK_OFF', 'HALF_TIME', 'FULL_TIME', 'EXTRA_TIME',
    'PENALTY_SHOOTOUT', 'VAR_REVIEW', 'INJURY'
  ], { errorMap: () => ({ message: 'Invalid event type' }) }),
  minute: z.number().int().min(0, 'Minute cannot be negative').max(200, 'Invalid minute value'),
  team_id: z.string().uuid('Invalid team ID'),
  player_id: z.string().uuid('Invalid player ID').optional().nullable(),
  description: z.string().max(500).optional().nullable(),
  metadata: z.record(z.any()).optional().nullable(),
  added_time: z.number().int().min(0).max(20).optional(),
});

// ============================================================================
// MATCH STATISTICS VALIDATION
// ============================================================================

export const updateMatchStatisticsSchema = z.object({
  home_possession: z.number().int().min(0).max(100).optional(),
  away_possession: z.number().int().min(0).max(100).optional(),
  home_shots: z.number().int().min(0).max(999).optional(),
  away_shots: z.number().int().min(0).max(999).optional(),
  home_shots_on_target: z.number().int().min(0).max(999).optional(),
  away_shots_on_target: z.number().int().min(0).max(999).optional(),
  home_corners: z.number().int().min(0).max(999).optional(),
  away_corners: z.number().int().min(0).max(999).optional(),
  home_free_kicks: z.number().int().min(0).max(999).optional(),
  away_free_kicks: z.number().int().min(0).max(999).optional(),
  home_fouls: z.number().int().min(0).max(999).optional(),
  away_fouls: z.number().int().min(0).max(999).optional(),
  home_yellow_cards: z.number().int().min(0).max(99).optional(),
  away_yellow_cards: z.number().int().min(0).max(99).optional(),
  home_red_cards: z.number().int().min(0).max(11).optional(),
  away_red_cards: z.number().int().min(0).max(11).optional(),
  home_offsides: z.number().int().min(0).max(999).optional(),
  away_offsides: z.number().int().min(0).max(999).optional(),
  home_saves: z.number().int().min(0).max(999).optional(),
  away_saves: z.number().int().min(0).max(999).optional(),
  current_minute: z.number().int().min(0).max(200).optional(),
  period: z.string().max(50).optional(),
  commentary: z.string().max(10000).optional(),
}).refine(data => {
  // Possession must add up to 100 if both provided
  if (data.home_possession !== undefined && data.away_possession !== undefined) {
    return data.home_possession + data.away_possession === 100;
  }
  return true;
}, {
  message: 'Home and away possession must add up to 100%',
  path: ['away_possession']
}).refine(data => {
  // Shots on target cannot exceed total shots
  if (data.home_shots !== undefined && data.home_shots_on_target !== undefined) {
    return data.home_shots_on_target <= data.home_shots;
  }
  return true;
}, {
  message: 'Shots on target cannot exceed total shots',
  path: ['home_shots_on_target']
}).refine(data => {
  if (data.away_shots !== undefined && data.away_shots_on_target !== undefined) {
    return data.away_shots_on_target <= data.away_shots;
  }
  return true;
}, {
  message: 'Shots on target cannot exceed total shots',
  path: ['away_shots_on_target']
});

// ============================================================================
// TEAM VALIDATION
// ============================================================================

export const createTeamSchema = z.object({
  name: z.string().min(2, 'Team name must be at least 2 characters').max(100),
  org_id: z.string().uuid('Invalid organization ID').optional().nullable(),
  sport_id: z.string().uuid('Invalid sport ID'),
  home_county_id: z.string().uuid('Invalid county ID').optional().nullable(),
  home_ward_id: z.string().uuid('Invalid ward ID').optional().nullable(),
  logo_url: z.string().url('Invalid logo URL').optional().nullable(),
  colors: z.string().max(50).optional().nullable(),
  founded_year: z.number().int().min(1800).max(new Date().getFullYear()).optional().nullable(),
});

export const updateTeamSchema = createTeamSchema.partial();

// ============================================================================
// VENUE VALIDATION
// ============================================================================

export const createVenueSchema = z.object({
  name: z.string().min(2, 'Venue name must be at least 2 characters').max(100),
  location: z.string().min(2, 'Location must be specified').max(200),
  capacity: z.number().int().min(0, 'Capacity cannot be negative').max(1000000).optional().nullable(),
  surface_type: z.string().max(50).optional().nullable(),
  facilities: z.array(z.string()).optional().nullable(),
  county_id: z.string().uuid('Invalid county ID').optional().nullable(),
  ward_id: z.string().uuid('Invalid ward ID').optional().nullable(),
});

export const updateVenueSchema = createVenueSchema.partial();

// ============================================================================
// HELPER FUNCTION: Validate Request Body
// ============================================================================

export function validateRequest(schema, data) {
  const result = schema.safeParse(data);
  
  if (!result.success) {
    const errors = result.error.errors.map(err => ({
      field: err.path.join('.'),
      message: err.message
    }));
    
    return {
      valid: false,
      errors,
      data: null
    };
  }
  
  return {
    valid: true,
    errors: [],
    data: result.data
  };
}
