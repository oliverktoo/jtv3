/**
 * Tournament Fixture API Routes
 * Jamii Tourney v3 - Comprehensive Tournament Management
 */

import { Router, Request, Response } from 'express';
import { supabase } from '../supabase-client';
import { 
  TournamentEngine, 
  AdvancedFixtureGenerator, 
  AdvancedStandingsEngine,
  Tournament,
  FixtureRequest,
  TournamentType,
  Match
} from '../../shared/fixtures';

const router = Router();

// Initialize engines
const tournamentEngine = new TournamentEngine(supabase);
const fixtureGenerator = new AdvancedFixtureGenerator(supabase);
const standingsEngine = new AdvancedStandingsEngine(supabase);

/**
 * Tournament Management Routes
 */

// Create new tournament
router.post('/tournaments', async (req: Request, res: Response) => {
  try {
    const { name, type, orgId, config } = req.body;
    const createdBy = (req as any).user?.id || 'system';

    const tournament = await tournamentEngine.createTournament({
      name,
      type,
      orgId,
      config,
      createdBy
    });

    res.status(201).json({
      success: true,
      data: tournament,
      message: 'Tournament created successfully'
    });
  } catch (error: any) {
    console.error('Error creating tournament:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to create tournament'
    });
  }
});

// Get tournament details
router.get('/tournaments/:tournamentId', async (req: Request, res: Response) => {
  try {
    const { tournamentId } = req.params;
    const result = await tournamentEngine.getTournamentWithTeams(tournamentId);

    res.json({
      success: true,
      data: result
    });
  } catch (error: any) {
    console.error('Error fetching tournament:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch tournament'
    });
  }
});

// Register teams for tournament
router.post('/tournaments/:tournamentId/teams', async (req: Request, res: Response) => {
  try {
    const { tournamentId } = req.params;
    const { teamIds, groupAssignments } = req.body;

    const registeredTeams = await tournamentEngine.registerTeams(
      tournamentId,
      teamIds,
      groupAssignments
    );

    res.status(201).json({
      success: true,
      data: registeredTeams,
      message: `${registeredTeams.length} teams registered successfully`
    });
  } catch (error: any) {
    console.error('Error registering teams:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to register teams'
    });
  }
});

// Update tournament status
router.patch('/tournaments/:tournamentId/status', async (req: Request, res: Response) => {
  try {
    const { tournamentId } = req.params;
    const { status } = req.body;

    const tournament = await tournamentEngine.updateTournamentStatus(tournamentId, status);

    res.json({
      success: true,
      data: tournament,
      message: `Tournament status updated to ${status}`
    });
  } catch (error: any) {
    console.error('Error updating tournament status:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to update tournament status'
    });
  }
});

// Validate tournament readiness
router.get('/tournaments/:tournamentId/validate', async (req: Request, res: Response) => {
  try {
    const { tournamentId } = req.params;
    const validation = await tournamentEngine.validateTournamentReadiness(tournamentId);

    res.json({
      success: true,
      data: validation
    });
  } catch (error: any) {
    console.error('Error validating tournament:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to validate tournament'
    });
  }
});

/**
 * Fixture Generation Routes
 */

// Generate fixtures
router.post('/tournaments/:tournamentId/fixtures/generate', async (req: Request, res: Response) => {
  try {
    const { tournamentId } = req.params;
    const { startDate, endDate, constraints, regenerate } = req.body;

    // Get tournament teams
    const { teams } = await tournamentEngine.getTournamentWithTeams(tournamentId);

    const fixtureRequest: FixtureRequest = {
      tournamentId,
      teams,
      startDate: new Date(startDate),
      endDate: endDate ? new Date(endDate) : undefined,
      constraints,
      regenerate: regenerate || false
    };

    const generatedFixture = await fixtureGenerator.generateFixtures(fixtureRequest);

    res.status(201).json({
      success: true,
      data: generatedFixture,
      message: 'Fixtures generated successfully'
    });
  } catch (error: any) {
    console.error('Error generating fixtures:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate fixtures'
    });
  }
});

// Get tournament fixtures
router.get('/tournaments/:tournamentId/fixtures', async (req: Request, res: Response) => {
  try {
    const { tournamentId } = req.params;
    const { round, teamId, dateFrom, dateTo } = req.query;

    let query = supabase
      .from('matches')
      .select(`
        *,
        home_team:teams!matches_home_team_id_fkey(id, name, short_code),
        away_team:teams!matches_away_team_id_fkey(id, name, short_code),
        stadium:stadiums(id, name, capacity)
      `)
      .eq('tournament_id', tournamentId)
      .order('scheduled_date', { ascending: true });

    if (round) query = query.eq('round_number', round);
    if (teamId) query = query.or(`home_team_id.eq.${teamId},away_team_id.eq.${teamId}`);
    if (dateFrom) query = query.gte('scheduled_date', dateFrom);
    if (dateTo) query = query.lte('scheduled_date', dateTo);

    const { data: matches, error } = await query;

    if (error) throw error;

    res.json({
      success: true,
      data: matches
    });
  } catch (error: any) {
    console.error('Error fetching fixtures:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch fixtures'
    });
  }
});

// Get fixture rounds
router.get('/tournaments/:tournamentId/rounds', async (req: Request, res: Response) => {
  try {
    const { tournamentId } = req.params;

    const { data: rounds, error } = await supabase
      .from('fixture_rounds')
      .select('*')
      .eq('tournament_id', tournamentId)
      .order('round_number', { ascending: true });

    if (error) throw error;

    res.json({
      success: true,
      data: rounds
    });
  } catch (error: any) {
    console.error('Error fetching rounds:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch rounds'
    });
  }
});

/**
 * Match Management Routes
 */

// Update match result
router.patch('/matches/:matchId/result', async (req: Request, res: Response) => {
  try {
    const { matchId } = req.params;
    const { homeScore, awayScore, status, events } = req.body;

    // Determine result
    let result = null;
    if (homeScore !== undefined && awayScore !== undefined) {
      if (homeScore > awayScore) result = 'home_win';
      else if (awayScore > homeScore) result = 'away_win';
      else result = 'draw';
    }

    const { data: match, error } = await supabase
      .from('matches')
      .update({
        home_score: homeScore,
        away_score: awayScore,
        result,
        status: status || 'finished',
        updated_at: new Date()
      })
      .eq('id', matchId)
      .select()
      .single();

    if (error) throw error;

    // Add match events if provided
    if (events && events.length > 0) {
      const matchEvents = events.map((event: any) => ({
        ...event,
        match_id: matchId,
        id: crypto.randomUUID()
      }));

      await supabase.from('match_events').insert(matchEvents);
    }

    // Update standings
    const standings = await standingsEngine.updateStandingsLive(matchId);

    res.json({
      success: true,
      data: {
        match,
        standings: standings.standings
      },
      message: 'Match result updated successfully'
    });
  } catch (error: any) {
    console.error('Error updating match result:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to update match result'
    });
  }
});

// Get match details
router.get('/matches/:matchId', async (req: Request, res: Response) => {
  try {
    const { matchId } = req.params;

    const { data: match, error } = await supabase
      .from('matches')
      .select(`
        *,
        home_team:teams!matches_home_team_id_fkey(id, name, short_code, logo_url),
        away_team:teams!matches_away_team_id_fkey(id, name, short_code, logo_url),
        stadium:stadiums(id, name, capacity, location),
        tournament:tournaments(id, name, type),
        events:match_events(*)
      `)
      .eq('id', matchId)
      .single();

    if (error) throw error;

    res.json({
      success: true,
      data: match
    });
  } catch (error: any) {
    console.error('Error fetching match:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch match'
    });
  }
});

/**
 * Standings Routes
 */

// Get tournament standings
router.get('/tournaments/:tournamentId/standings', async (req: Request, res: Response) => {
  try {
    const { tournamentId } = req.params;
    const { asOfDate, homeOnly, awayOnly } = req.query;

    const standings = await standingsEngine.calculateStandings(
      tournamentId,
      asOfDate ? new Date(asOfDate as string) : undefined
    );

    res.json(standings);
  } catch (error: any) {
    console.error('Error calculating standings:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to calculate standings'
    });
  }
});

// Get live standings (cached)
router.get('/tournaments/:tournamentId/standings/live', async (req: Request, res: Response) => {
  try {
    const { tournamentId } = req.params;

    // Get from materialized view for fast response
    const { data: standings, error } = await supabase
      .from('current_standings')
      .select(`
        *,
        team:teams!current_standings_team_id_fkey(id, name, short_code, logo_url)
      `)
      .eq('tournament_id', tournamentId)
      .order('position', { ascending: true });

    if (error) throw error;

    res.json({
      success: true,
      standings,
      lastUpdated: new Date(),
      cached: true
    });
  } catch (error: any) {
    console.error('Error fetching live standings:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch live standings'
    });
  }
});

/**
 * Statistics Routes
 */

// Get tournament statistics
router.get('/tournaments/:tournamentId/stats', async (req: Request, res: Response) => {
  try {
    const { tournamentId } = req.params;
    const stats = await tournamentEngine.getTournamentStats(tournamentId);

    res.json({
      success: true,
      data: stats
    });
  } catch (error: any) {
    console.error('Error fetching tournament stats:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch tournament stats'
    });
  }
});

/**
 * Real-time Updates
 */

// Refresh standings cache
router.post('/tournaments/:tournamentId/standings/refresh', async (req: Request, res: Response) => {
  try {
    const { tournamentId } = req.params;

    // Refresh materialized view
    await supabase.rpc('refresh_standings', { tournament_id_param: tournamentId });

    res.json({
      success: true,
      message: 'Standings cache refreshed'
    });
  } catch (error: any) {
    console.error('Error refreshing standings:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to refresh standings'
    });
  }
});

export default router;