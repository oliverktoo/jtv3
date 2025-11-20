/**
 * Tournament Fixture System Integration
 * Jamii Tourney v3 - Main export file for the fixture system
 */

// Export all types
export * from './types';

// Export main classes
export { TournamentEngine } from './TournamentEngine';
export { AdvancedFixtureGenerator } from './FixtureGenerator';
export { AdvancedStandingsEngine } from './StandingsEngine';

// Import classes for utility function
import { TournamentEngine } from './TournamentEngine';
import { AdvancedFixtureGenerator } from './FixtureGenerator';
import { AdvancedStandingsEngine } from './StandingsEngine';

// Utility functions for quick setup
export function createTournamentSystem(supabaseClient: any) {
  return {
    tournamentEngine: new TournamentEngine(supabaseClient),
    fixtureGenerator: new AdvancedFixtureGenerator(supabaseClient),
    standingsEngine: new AdvancedStandingsEngine(supabaseClient)
  };
}