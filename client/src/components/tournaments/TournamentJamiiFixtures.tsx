import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { Calendar, MapPin, Users, Play, CheckCircle, Trophy, Clock } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { toast } from '../../hooks/use-toast';

interface TournamentJamiiFixturesProps {
  tournamentId: string;
  tournamentName: string;
  onFixturesGenerated?: (fixtures: any[]) => void;
}

interface SimpleFixture {
  id: string;
  homeTeam: any;
  awayTeam: any;
  venue: string;
  kickoff: Date;
  round: number;
}

export default function TournamentJamiiFixtures({ 
  tournamentId, 
  tournamentName,
  onFixturesGenerated 
}: TournamentJamiiFixturesProps) {
  const [fixtureFormat, setFixtureFormat] = useState('round_robin');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [timeSlot, setTimeSlot] = useState('15:00');
  const [venue, setVenue] = useState('Main Stadium');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedFixtures, setGeneratedFixtures] = useState<SimpleFixture[]>([]);

  const queryClient = useQueryClient();

  // Fetch teams for this tournament
  const { data: teams = [], isLoading: teamsLoading } = useQuery({
    queryKey: ['tournament-teams', tournamentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('team_tournament_registrations')
        .select(`
          teams (
            id,
            name,
            club_name
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
          name: team.name || team.club_name || 'Unknown Team'
        }));
    }
  });

  // Simple round-robin fixture generation
  const generateRoundRobinFixtures = (teamList: any[]) => {
    const fixtures: SimpleFixture[] = [];
    const numTeams = teamList.length;
    
    if (numTeams < 2) return fixtures;

    let fixtureId = 1;
    let currentDate = new Date(startDate);
    
    // Round-robin: each team plays every other team once
    for (let i = 0; i < numTeams; i++) {
      for (let j = i + 1; j < numTeams; j++) {
        fixtures.push({
          id: `fixture-${fixtureId++}`,
          homeTeam: teamList[i],
          awayTeam: teamList[j],
          venue: venue,
          kickoff: new Date(`${currentDate.toISOString().split('T')[0]}T${timeSlot}:00`),
          round: Math.ceil(fixtureId / Math.floor(numTeams / 2))
        });
        
        // Move to next day after every 2 matches
        if (fixtureId % 2 === 0) {
          currentDate.setDate(currentDate.getDate() + 7); // Weekly matches
        }
      }
    }
    
    return fixtures;
  };

  // Generate fixtures
  const handleGenerateFixtures = async () => {
    if (teams.length < 2) {
      toast({
        title: 'Not enough teams',
        description: 'At least 2 teams are required to generate fixtures.',
        variant: 'destructive'
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      let fixtures: SimpleFixture[] = [];
      
      if (fixtureFormat === 'round_robin') {
        fixtures = generateRoundRobinFixtures(teams);
      }
      
      setGeneratedFixtures(fixtures);
      
      toast({
        title: 'Fixtures Generated!',
        description: `Successfully generated ${fixtures.length} fixtures for ${teams.length} teams.`
      });
      
      onFixturesGenerated?.(fixtures);
      
    } catch (error: any) {
      console.error('Error generating fixtures:', error);
      toast({
        title: 'Generation Failed',
        description: error.message || 'Failed to generate fixtures',
        variant: 'destructive'
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Save fixtures to database
  const saveFixturesMutation = useMutation({
    mutationFn: async (fixtures: SimpleFixture[]) => {
      // Save all fixtures to the database
      const matchesData = fixtures.map(fixture => ({
        id: fixture.id,
        tournament_id: tournamentId,
        home_team_id: fixture.homeTeam.id,
        away_team_id: fixture.awayTeam.id,
        kickoff: fixture.kickoff.toISOString(),
        venue: fixture.venue,
        status: 'SCHEDULED',
        round_id: null, // Can be set later if rounds are needed
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }));

      const { data, error } = await supabase
        .from('matches')
        .insert(matchesData);

      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tournament-matches', tournamentId] });
      toast({
        title: 'Fixtures Saved!',
        description: 'All fixtures have been saved to the tournament schedule.'
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Save Failed',
        description: error.message || 'Failed to save fixtures',
        variant: 'destructive'
      });
    }
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5" />
            Simple Fixture Generator - {tournamentName}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Tournament Info */}
          <Alert>
            <Users className="w-4 h-4" />
            <AlertDescription>
              {teamsLoading ? 'Loading teams...' : `${teams.length} teams registered for this tournament`}
            </AlertDescription>
          </Alert>

          {/* Configuration */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="format">Tournament Format</Label>
              <Select value={fixtureFormat} onValueChange={setFixtureFormat}>
                <SelectTrigger>
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="round_robin">Round Robin (League)</SelectItem>
                  <SelectItem value="knockout" disabled>Knockout (Coming Soon)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="timeSlot">Default Time</Label>
              <Select value={timeSlot} onValueChange={setTimeSlot}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="09:00">9:00 AM</SelectItem>
                  <SelectItem value="11:00">11:00 AM</SelectItem>
                  <SelectItem value="13:00">1:00 PM</SelectItem>
                  <SelectItem value="15:00">3:00 PM</SelectItem>
                  <SelectItem value="17:00">5:00 PM</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="venue">Default Venue</Label>
              <Select value={venue} onValueChange={setVenue}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Main Stadium">Main Stadium</SelectItem>
                  <SelectItem value="Training Ground A">Training Ground A</SelectItem>
                  <SelectItem value="Community Field">Community Field</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Generate Button */}
          <Button 
            onClick={handleGenerateFixtures} 
            disabled={isGenerating || teams.length < 2}
            className="w-full"
          >
            {isGenerating ? (
              <>
                <Clock className="w-4 h-4 mr-2 animate-spin" />
                Generating Fixtures...
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Generate Fixtures
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Generated Fixtures Display */}
      {generatedFixtures.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Generated Fixtures ({generatedFixtures.length})</span>
              <Button 
                onClick={() => saveFixturesMutation.mutate(generatedFixtures)}
                disabled={saveFixturesMutation.isPending}
                variant="outline"
              >
                {saveFixturesMutation.isPending ? 'Saving...' : 'Save to Tournament'}
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {generatedFixtures.map((fixture, index) => (
                <div key={fixture.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-4">
                    <Badge variant="outline">#{index + 1}</Badge>
                    <span className="font-medium">{fixture.homeTeam.name}</span>
                    <span className="text-gray-500">vs</span>
                    <span className="font-medium">{fixture.awayTeam.name}</span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {fixture.kickoff.toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {fixture.kickoff.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {fixture.venue}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Teams List */}
      {teams.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Registered Teams</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {teams.map((team) => (
                <Badge key={team.id} variant="secondary" className="justify-start p-2">
                  <Users className="w-3 h-3 mr-1" />
                  {team.name}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}