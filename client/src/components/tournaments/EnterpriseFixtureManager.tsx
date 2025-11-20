/**
 * Enterprise-Grade Tournament Fixture Manager
 * Professional fixture generation system using advanced algorithms
 * Based on systems used by SofaScore, Opta, and StatsBomb
 */

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Trophy,
  Settings,
  Play,
  Save,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  Zap,
  Globe
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Import our enterprise fixture system
import { Tournament, Team, Stadium, TimeSlot } from '@/lib/fixtures/TournamentEngine';
import { AdvancedFixtureGenerator, FixtureRound, GenerationOptions } from '@/lib/fixtures/AdvancedFixtureGenerator';
import { FixtureOptimizer, OptimizationResult, ScheduledFixture } from '@/lib/fixtures/FixtureOptimizer';
import { AdvancedStandingsEngine, TeamStanding } from '@/lib/fixtures/AdvancedStandingsEngine';

interface EnterpriseFixtureManagerProps {
  tournamentId: string;
}

interface GenerationConfig {
  type: 'round_robin' | 'knockout' | 'group_stage';
  legs: 1 | 2;
  randomizeHomeAway: boolean;
  balanceHomeAway: boolean;
  respectDerbies: boolean;
  applyConstraints: boolean;
  optimizeSchedule: boolean;
  startDate: Date;
  maxMatchesPerDay: number;
}

export default function EnterpriseFixtureManager({ tournamentId }: EnterpriseFixtureManagerProps) {
  const [activeTab, setActiveTab] = useState('configuration');
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [generationConfig, setGenerationConfig] = useState<GenerationConfig>({
    type: 'round_robin',
    legs: 2,
    randomizeHomeAway: false,
    balanceHomeAway: true,
    respectDerbies: true,
    applyConstraints: true,
    optimizeSchedule: true,
    startDate: new Date(),
    maxMatchesPerDay: 4
  });
  
  const [fixtureRounds, setFixtureRounds] = useState<FixtureRound[]>([]);
  const [optimizationResult, setOptimizationResult] = useState<OptimizationResult | null>(null);
  const [validationResults, setValidationResults] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);

  const queryClient = useQueryClient();

  // Fetch tournament data and registered teams
  const { data: tournamentData, isLoading: tournamentLoading } = useQuery({
    queryKey: ['tournament-detail', tournamentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tournaments')
        .select(`
          *,
          organizations(name)
        `)
        .eq('id', tournamentId)
        .single();
      
      if (error) throw new Error(error.message);
      return data;
    }
  });

  const { data: registeredTeams = [], isLoading: teamsLoading } = useQuery({
    queryKey: ['tournament-teams', tournamentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('team_tournament_registrations')
        .select(`
          teams (
            id,
            name,
            club_name,
            org_id
          )
        `)
        .eq('tournament_id', tournamentId)
        .eq('registration_status', 'APPROVED');
      
      if (error) throw new Error(error.message);
      
      return (data || [])
        .map((reg: any) => reg.teams)
        .filter((team: any) => team && typeof team === 'object' && !Array.isArray(team))
        .map((team: any) => ({
          id: team.id,
          name: team.name || team.club_name || 'Unknown Team',
          short_code: team.name?.substring(0, 3).toUpperCase() || 'UNK',
          org_id: team.org_id
        }));
    }
  });

  const { data: existingMatches = [] } = useQuery({
    queryKey: ['tournament-matches', tournamentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('matches')
        .select('*')
        .eq('tournament_id', tournamentId);
      
      if (error) throw new Error(error.message);
      return data || [];
    }
  });

  // Initialize tournament engine
  useEffect(() => {
    if (tournamentData && registeredTeams.length > 0) {
      const teams: Team[] = registeredTeams.map(team => ({
        id: team.id,
        name: team.name,
        short_code: team.short_code || team.name.substring(0, 3).toUpperCase(),
        org_id: team.org_id
      }));

      const tournamentEngine = new Tournament(
        tournamentId,
        tournamentData.name,
        teams,
        {
          type: generationConfig.type,
          legs: generationConfig.legs,
          matches_per_day: generationConfig.maxMatchesPerDay,
          start_date: generationConfig.startDate,
          stadiums: getDefaultStadiums(),
          time_slots: getDefaultTimeSlots(),
          constraints: getDefaultConstraints()
        }
      );

      setTournament(tournamentEngine);
    }
  }, [tournamentData, registeredTeams, generationConfig, tournamentId]);

  const generateFixtures = async () => {
    if (!tournament) return;

    setIsGenerating(true);
    try {
      const generator = new AdvancedFixtureGenerator(tournament);
      
      const options: Partial<GenerationOptions> = {
        randomize_home_away: generationConfig.randomizeHomeAway,
        balance_home_away: generationConfig.balanceHomeAway,
        respect_derbies: generationConfig.respectDerbies,
        apply_constraints: generationConfig.applyConstraints,
        preview_mode: true
      };

      const rounds = generator.generateRoundRobin(options);
      setFixtureRounds(rounds);

      // Validate fixtures
      const validation = generator.validateFixtures();
      setValidationResults(validation);

      // Move to generation results tab
      setActiveTab('generation');

    } catch (error) {
      console.error('Fixture generation failed:', error);
      alert('Fixture generation failed: ' + (error as Error).message);
    } finally {
      setIsGenerating(false);
    }
  };

  const optimizeSchedule = async () => {
    if (!tournament || fixtureRounds.length === 0) return;

    setIsOptimizing(true);
    try {
      const optimizer = new FixtureOptimizer(tournament);
      const result = await optimizer.optimizeSchedule(fixtureRounds, generationConfig.startDate);
      
      setOptimizationResult(result);
      setActiveTab('optimization');

    } catch (error) {
      console.error('Schedule optimization failed:', error);
      alert('Schedule optimization failed: ' + (error as Error).message);
    } finally {
      setIsOptimizing(false);
    }
  };

  const saveFixtures = useMutation({
    mutationFn: async () => {
      if (!optimizationResult) throw new Error('No optimized fixtures to save');

      const matchesToSave = optimizationResult.scheduled_matches.map((fixture: ScheduledFixture) => ({
        id: fixture.id,
        tournament_id: tournamentId,
        home_team_id: fixture.home_team_id,
        away_team_id: fixture.away_team_id,
        match_date: fixture.scheduled_date.toISOString(),
        match_round: fixture.match_round,
        leg: fixture.leg,
        status: 'scheduled',
        stadium_id: fixture.assigned_stadium?.id,
        broadcast_priority: fixture.broadcast_priority
      }));

      const { error } = await supabase
        .from('matches')
        .upsert(matchesToSave);

      if (error) throw error;

      // Save generation metadata
      const { error: genError } = await supabase
        .from('fixture_generations')
        .insert({
          tournament_id: tournamentId,
          generation_method: generationConfig.type,
          config: generationConfig,
          total_rounds: fixtureRounds.length,
          total_matches: optimizationResult.scheduled_matches.length,
          derby_matches: optimizationResult.scheduled_matches.filter(m => m.is_derby).length,
          optimization_score: optimizationResult.score,
          status: 'published',
          validation_results: validationResults
        });

      if (genError) throw genError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tournament-matches', tournamentId] });
      setActiveTab('published');
      alert('Fixtures saved successfully!');
    },
    onError: (error: Error) => {
      alert('Failed to save fixtures: ' + error.message);
    }
  });

  if (tournamentLoading || teamsLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-2">
            <RefreshCw className="h-4 w-4 animate-spin" />
            <span>Loading tournament data...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (registeredTeams.length < 2) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            <span>Insufficient Teams</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            At least 2 teams are required for fixture generation. 
            Currently registered: {registeredTeams.length} teams.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Zap className="h-6 w-6 text-blue-500" />
            <span>Enterprise Fixture Manager</span>
            <Badge variant="secondary">Professional Grade</Badge>
          </CardTitle>
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <span className="flex items-center space-x-1">
              <Trophy className="h-4 w-4" />
              <span>{tournamentData?.name}</span>
            </span>
            <span className="flex items-center space-x-1">
              <Calendar className="h-4 w-4" />
              <span>{registeredTeams.length} Teams</span>
            </span>
            <span className="flex items-center space-x-1">
              <Globe className="h-4 w-4" />
              <span>{existingMatches.length} Existing Matches</span>
            </span>
          </div>
        </CardHeader>
      </Card>

      {/* Main Interface */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="configuration">
            <Settings className="h-4 w-4 mr-2" />
            Configuration
          </TabsTrigger>
          <TabsTrigger value="generation">
            <Play className="h-4 w-4 mr-2" />
            Generation
          </TabsTrigger>
          <TabsTrigger value="optimization">
            <BarChart3 className="h-4 w-4 mr-2" />
            Optimization
          </TabsTrigger>
          <TabsTrigger value="preview">
            <Calendar className="h-4 w-4 mr-2" />
            Preview
          </TabsTrigger>
          <TabsTrigger value="published">
            <CheckCircle className="h-4 w-4 mr-2" />
            Published
          </TabsTrigger>
        </TabsList>

        {/* Configuration Tab */}
        <TabsContent value="configuration">
          <Card>
            <CardHeader>
              <CardTitle>Generation Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Tournament Type</label>
                    <Select 
                      value={generationConfig.type} 
                      onValueChange={(value: any) => setGenerationConfig(prev => ({ ...prev, type: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="round_robin">Round Robin</SelectItem>
                        <SelectItem value="knockout">Knockout</SelectItem>
                        <SelectItem value="group_stage">Group Stage</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Number of Legs</label>
                    <Select 
                      value={generationConfig.legs.toString()} 
                      onValueChange={(value) => setGenerationConfig(prev => ({ ...prev, legs: parseInt(value) as 1 | 2 }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Single Round-Robin</SelectItem>
                        <SelectItem value="2">Double Round-Robin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="respectDerbies"
                      checked={generationConfig.respectDerbies}
                      onChange={(e) => setGenerationConfig(prev => ({ ...prev, respectDerbies: e.target.checked }))}
                    />
                    <label htmlFor="respectDerbies" className="text-sm font-medium">Respect Derby Spacing</label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="balanceHomeAway"
                      checked={generationConfig.balanceHomeAway}
                      onChange={(e) => setGenerationConfig(prev => ({ ...prev, balanceHomeAway: e.target.checked }))}
                    />
                    <label htmlFor="balanceHomeAway" className="text-sm font-medium">Balance Home/Away</label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="optimizeSchedule"
                      checked={generationConfig.optimizeSchedule}
                      onChange={(e) => setGenerationConfig(prev => ({ ...prev, optimizeSchedule: e.target.checked }))}
                    />
                    <label htmlFor="optimizeSchedule" className="text-sm font-medium">Optimize Schedule</label>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="flex justify-center">
                <Button 
                  onClick={generateFixtures} 
                  disabled={isGenerating || !tournament}
                  size="lg"
                  className="px-8"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Generating Fixtures...
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-2" />
                      Generate Professional Fixtures
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Generation Results Tab */}
        <TabsContent value="generation">
          <div className="space-y-6">
            {validationResults && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    {validationResults.valid ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <AlertTriangle className="h-5 w-5 text-red-500" />
                    )}
                    <span>Validation Results</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {validationResults.errors?.length > 0 && (
                    <Alert className="mb-4">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        <strong>Errors:</strong>
                        <ul className="mt-2 space-y-1">
                          {validationResults.errors.map((error: string, index: number) => (
                            <li key={index} className="text-sm">• {error}</li>
                          ))}
                        </ul>
                      </AlertDescription>
                    </Alert>
                  )}

                  {validationResults.warnings?.length > 0 && (
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        <strong>Warnings:</strong>
                        <ul className="mt-2 space-y-1">
                          {validationResults.warnings.map((warning: string, index: number) => (
                            <li key={index} className="text-sm">• {warning}</li>
                          ))}
                        </ul>
                      </AlertDescription>
                    </Alert>
                  )}

                  {validationResults.valid && (
                    <div className="flex justify-center mt-6">
                      <Button 
                        onClick={optimizeSchedule}
                        disabled={isOptimizing}
                        size="lg"
                      >
                        {isOptimizing ? (
                          <>
                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                            Optimizing Schedule...
                          </>
                        ) : (
                          <>
                            <BarChart3 className="h-4 w-4 mr-2" />
                            Optimize Schedule
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {fixtureRounds.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Generated Fixture Rounds</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{fixtureRounds.length}</div>
                      <div className="text-sm text-gray-600">Total Rounds</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {fixtureRounds.reduce((sum, round) => sum + round.matches.length, 0)}
                      </div>
                      <div className="text-sm text-gray-600">Total Matches</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {fixtureRounds.reduce((sum, round) => 
                          sum + round.matches.filter(m => m.is_derby).length, 0
                        )}
                      </div>
                      <div className="text-sm text-gray-600">Derby Matches</div>
                    </div>
                  </div>

                  <div className="max-h-96 overflow-y-auto">
                    {fixtureRounds.map((round) => (
                      <div key={round.round_number} className="mb-4 p-4 border rounded-lg">
                        <h4 className="font-semibold mb-2">
                          Round {round.round_number} {round.leg > 1 && `(Leg ${round.leg})`}
                        </h4>
                        <div className="space-y-2">
                          {round.matches.map((match) => (
                            <div key={match.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                              <div className="flex items-center space-x-2">
                                <span className="font-medium">
                                  {registeredTeams.find(t => t.id === match.home_team_id)?.name || 'Unknown'}
                                </span>
                                <span className="text-gray-400">vs</span>
                                <span className="font-medium">
                                  {registeredTeams.find(t => t.id === match.away_team_id)?.name || 'Unknown'}
                                </span>
                                {match.is_derby && (
                                  <Badge variant="destructive" className="text-xs">DERBY</Badge>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Optimization Results Tab */}
        <TabsContent value="optimization">
          {optimizationResult && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    {optimizationResult.success ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <AlertTriangle className="h-5 w-5 text-amber-500" />
                    )}
                    <span>Schedule Optimization Results</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-4 gap-4 mb-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{optimizationResult.scheduled_matches.length}</div>
                      <div className="text-sm text-gray-600">Scheduled</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-600">{optimizationResult.unscheduled_matches.length}</div>
                      <div className="text-sm text-gray-600">Unscheduled</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-amber-600">{optimizationResult.conflicts.length}</div>
                      <div className="text-sm text-gray-600">Conflicts</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{Math.round(optimizationResult.score)}</div>
                      <div className="text-sm text-gray-600">Score</div>
                    </div>
                  </div>

                  {optimizationResult.success && (
                    <div className="flex justify-center">
                      <Button 
                        onClick={() => saveFixtures.mutate()}
                        disabled={saveFixtures.isPending}
                        size="lg"
                        className="px-8"
                      >
                        <Save className="h-4 w-4 mr-2" />
                        Publish Fixtures
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        {/* Preview Tab */}
        <TabsContent value="preview">
          <Card>
            <CardHeader>
              <CardTitle>Fixture Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Complete fixture schedule with dates, times, and venues will be displayed here.</p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Published Tab */}
        <TabsContent value="published">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span>Fixtures Published Successfully!</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Tournament fixtures have been generated and published using enterprise-grade algorithms.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Helper functions for default configurations
function getDefaultStadiums(): Stadium[] {
  return [
    {
      id: 'stadium-1',
      name: 'Main Stadium',
      capacity: 10000,
      location: 'Central',
      available_slots: [],
      restrictions: []
    }
  ];
}

function getDefaultTimeSlots(): TimeSlot[] {
  return [
    { day: 'Saturday', start_time: '15:00', end_time: '17:00', priority: 10 },
    { day: 'Saturday', start_time: '17:30', end_time: '19:30', priority: 9 },
    { day: 'Sunday', start_time: '15:00', end_time: '17:00', priority: 8 },
    { day: 'Sunday', start_time: '17:30', end_time: '19:30', priority: 7 }
  ];
}

function getDefaultConstraints() {
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