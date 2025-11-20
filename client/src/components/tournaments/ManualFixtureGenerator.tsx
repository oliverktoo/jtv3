import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Plus, 
  Edit, 
  Trash2, 
  Users, 
  Zap,
  Target,
  Save,
  Copy,
  Download,
  Filter
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { useAuth } from '@/hooks/useAuth';
import { useTeamRegistrations } from '@/hooks/useTeamRegistrations';
import { format, addDays, setHours, setMinutes } from 'date-fns';

interface ManualFixtureGeneratorProps {
  tournamentId: string;
}

interface Team {
  id: string;
  name: string;
  club_name?: string;
  logo_url?: string;
}

interface Fixture {
  id?: string;
  homeTeamId: string;
  awayTeamId: string;
  kickoff: Date;
  venue: string;
  round?: number;
  leg?: number;
  notes?: string;
}

interface Round {
  id: string;
  number: number;
  name: string;
  leg: number;
}

const DEFAULT_VENUES = [
  'Main Stadium',
  'Training Ground A', 
  'Training Ground B',
  'Community Field',
  'Sports Complex 1',
  'Sports Complex 2'
];

const DEFAULT_TIME_SLOTS = [
  '09:00', '10:30', '12:00', '13:30', '15:00', '16:30', '18:00', '19:30'
];

export const ManualFixtureGenerator: React.FC<ManualFixtureGeneratorProps> = ({ tournamentId }) => {
  const [activeTab, setActiveTab] = useState('create');
  const [isCreateFixtureDialogOpen, setIsCreateFixtureDialogOpen] = useState(false);
  const [isEditFixtureDialogOpen, setIsEditFixtureDialogOpen] = useState(false);
  const [selectedFixture, setSelectedFixture] = useState<Fixture | null>(null);
  
  // Form state for creating fixtures
  const [homeTeamId, setHomeTeamId] = useState('');
  const [awayTeamId, setAwayTeamId] = useState('');
  const [fixtureDate, setFixtureDate] = useState<Date | null>(addDays(new Date(), 7));
  const [fixtureTime, setFixtureTime] = useState('15:00');
  const [venue, setVenue] = useState('Main Stadium');
  const [customVenue, setCustomVenue] = useState('');
  const [round, setRound] = useState(1);
  const [leg, setLeg] = useState(1);
  const [notes, setNotes] = useState('');
  
  // Bulk creation state
  const [bulkMode, setBulkMode] = useState(false);
  const [bulkFixtures, setBulkFixtures] = useState<Fixture[]>([]);
  const [selectedTeams, setSelectedTeams] = useState<string[]>([]);
  
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Get registered teams
  const { data: registeredTeams = [] } = useTeamRegistrations(tournamentId);
  const teams = registeredTeams.map(rt => rt.team).filter(Boolean) as Team[];

  // Get existing fixtures
  const { data: existingFixtures = [], isLoading: fixturesLoading } = useQuery({
    queryKey: ['tournament-fixtures', tournamentId],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/tournaments/${tournamentId}/matches`);
      return response.data || [];
    }
  });

  // Get rounds
  const { data: rounds = [], isLoading: roundsLoading } = useQuery({
    queryKey: ['tournament-rounds', tournamentId],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/tournaments/${tournamentId}/rounds`);
      return response.data || [];
    }
  });

  // Create fixture mutation
  const createFixtureMutation = useMutation({
    mutationFn: async (fixtureData: Omit<Fixture, 'id'>) => {
      const response = await apiRequest('POST', `/api/tournaments/${tournamentId}/matches`, {
        home_team_id: fixtureData.homeTeamId,
        away_team_id: fixtureData.awayTeamId,
        kickoff: fixtureData.kickoff.toISOString(),
        venue: fixtureData.venue,
        round: fixtureData.round || 1,
        leg: fixtureData.leg || 1,
        notes: fixtureData.notes
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tournament-fixtures', tournamentId] });
      resetForm();
      setIsCreateFixtureDialogOpen(false);
      toast({
        title: "Success",
        description: "Fixture created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create fixture",
        variant: "destructive",
      });
    }
  });

  // Bulk create fixtures mutation
  const bulkCreateFixturesMutation = useMutation({
    mutationFn: async (fixtures: Omit<Fixture, 'id'>[]) => {
      const response = await apiRequest('POST', `/api/tournaments/${tournamentId}/matches/bulk`, {
        fixtures: fixtures.map(f => ({
          home_team_id: f.homeTeamId,
          away_team_id: f.awayTeamId,
          kickoff: f.kickoff.toISOString(),
          venue: f.venue,
          round: f.round || 1,
          leg: f.leg || 1,
          notes: f.notes
        }))
      });
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['tournament-fixtures', tournamentId] });
      setBulkFixtures([]);
      setSelectedTeams([]);
      toast({
        title: "Success",
        description: `${data.length} fixtures created successfully`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create fixtures",
        variant: "destructive",
      });
    }
  });

  // Update fixture mutation
  const updateFixtureMutation = useMutation({
    mutationFn: async (data: { fixtureId: string; updates: Partial<Fixture> }) => {
      const response = await apiRequest('PUT', `/api/matches/${data.fixtureId}`, {
        home_team_id: data.updates.homeTeamId,
        away_team_id: data.updates.awayTeamId,
        kickoff: data.updates.kickoff?.toISOString(),
        venue: data.updates.venue,
        notes: data.updates.notes
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tournament-fixtures', tournamentId] });
      setIsEditFixtureDialogOpen(false);
      setSelectedFixture(null);
      toast({
        title: "Success",
        description: "Fixture updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update fixture",
        variant: "destructive",
      });
    }
  });

  // Delete fixture mutation
  const deleteFixtureMutation = useMutation({
    mutationFn: async (fixtureId: string) => {
      await apiRequest('DELETE', `/api/matches/${fixtureId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tournament-fixtures', tournamentId] });
      toast({
        title: "Success",
        description: "Fixture deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete fixture",
        variant: "destructive",
      });
    }
  });

  const resetForm = () => {
    setHomeTeamId('');
    setAwayTeamId('');
    setFixtureDate(addDays(new Date(), 7));
    setFixtureTime('15:00');
    setVenue('Main Stadium');
    setCustomVenue('');
    setRound(1);
    setLeg(1);
    setNotes('');
  };

  const createKickoffDateTime = (date: Date, time: string) => {
    const [hours, minutes] = time.split(':').map(Number);
    return setMinutes(setHours(date, hours), minutes);
  };

  const handleCreateFixture = () => {
    if (!homeTeamId || !awayTeamId) {
      toast({
        title: "Error",
        description: "Please select both home and away teams",
        variant: "destructive",
      });
      return;
    }

    if (homeTeamId === awayTeamId) {
      toast({
        title: "Error",
        description: "Home and away teams cannot be the same",
        variant: "destructive",
      });
      return;
    }

    const kickoffDateTime = createKickoffDateTime(fixtureDate, fixtureTime);
    const finalVenue = customVenue.trim() || venue;

    createFixtureMutation.mutate({
      homeTeamId,
      awayTeamId,
      kickoff: kickoffDateTime,
      venue: finalVenue,
      round,
      leg,
      notes
    });
  };

  const handleEditFixture = (fixture: any) => {
    setSelectedFixture(fixture);
    setHomeTeamId(fixture.homeTeamId || '');
    setAwayTeamId(fixture.awayTeamId || '');
    
    if (fixture.kickoff) {
      const kickoffDate = new Date(fixture.kickoff);
      setFixtureDate(kickoffDate);
      setFixtureTime(format(kickoffDate, 'HH:mm'));
    }
    
    setVenue(fixture.venue || 'Main Stadium');
    setNotes(fixture.notes || '');
    setIsEditFixtureDialogOpen(true);
  };

  const handleUpdateFixture = () => {
    if (!selectedFixture) return;

    const kickoffDateTime = createKickoffDateTime(fixtureDate, fixtureTime);
    const finalVenue = customVenue.trim() || venue;

    updateFixtureMutation.mutate({
      fixtureId: selectedFixture.id!,
      updates: {
        homeTeamId,
        awayTeamId,
        kickoff: kickoffDateTime,
        venue: finalVenue,
        notes
      }
    });
  };

  const handleDeleteFixture = (fixtureId: string) => {
    if (window.confirm('Are you sure you want to delete this fixture?')) {
      deleteFixtureMutation.mutate(fixtureId);
    }
  };

  // Generate round-robin fixtures for selected teams
  const generateRoundRobinFixtures = () => {
    if (selectedTeams.length < 2) {
      toast({
        title: "Error",
        description: "Please select at least 2 teams",
        variant: "destructive",
      });
      return;
    }

    const fixtures: Fixture[] = [];
    let currentDate = fixtureDate;
    let fixtureCount = 0;

    // Generate all possible combinations
    for (let i = 0; i < selectedTeams.length; i++) {
      for (let j = i + 1; j < selectedTeams.length; j++) {
        const homeTeamId = selectedTeams[i];
        const awayTeamId = selectedTeams[j];
        
        // Assign venue cyclically
        const venueIndex = fixtureCount % DEFAULT_VENUES.length;
        const fixtureVenue = DEFAULT_VENUES[venueIndex];
        
        // Assign time slot cyclically
        const timeIndex = fixtureCount % DEFAULT_TIME_SLOTS.length;
        const fixtureTimeSlot = DEFAULT_TIME_SLOTS[timeIndex];
        
        // If we've used all time slots for the day, move to next day
        if (fixtureCount > 0 && fixtureCount % DEFAULT_TIME_SLOTS.length === 0) {
          currentDate = addDays(currentDate, 1);
        }

        const kickoff = createKickoffDateTime(currentDate, fixtureTimeSlot);

        fixtures.push({
          homeTeamId,
          awayTeamId,
          kickoff,
          venue: fixtureVenue,
          round,
          leg,
          notes: `Round Robin - Auto Generated`
        });

        fixtureCount++;
      }
    }

    setBulkFixtures(fixtures);
    toast({
      title: "Success",
      description: `Generated ${fixtures.length} round-robin fixtures`,
    });
  };

  const handleBulkCreate = () => {
    if (bulkFixtures.length === 0) return;
    bulkCreateFixturesMutation.mutate(bulkFixtures);
  };

  const getTeamName = (teamId: string) => {
    const team = teams.find(t => t.id === teamId);
    return team?.name || 'Unknown Team';
  };

  const isLoading = fixturesLoading || roundsLoading;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Manual Fixture Generator</h3>
          <p className="text-sm text-muted-foreground">
            Create individual fixtures or generate bulk fixtures between teams
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => setIsCreateFixtureDialogOpen(true)}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Create Fixture
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="create">Single Fixture</TabsTrigger>
          <TabsTrigger value="bulk">Bulk Generator</TabsTrigger>
          <TabsTrigger value="manage">Manage Fixtures</TabsTrigger>
        </TabsList>

        <TabsContent value="create" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Quick Fixture Creator</CardTitle>
              <CardDescription>Create a single fixture between two teams</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Home Team</Label>
                  <Select value={homeTeamId} onValueChange={setHomeTeamId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select home team" />
                    </SelectTrigger>
                    <SelectContent>
                      {teams.map((team) => (
                        <SelectItem key={team.id} value={team.id}>
                          {team.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Away Team</Label>
                  <Select value={awayTeamId} onValueChange={setAwayTeamId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select away team" />
                    </SelectTrigger>
                    <SelectContent>
                      {teams.map((team) => (
                        <SelectItem key={team.id} value={team.id} disabled={team.id === homeTeamId}>
                          {team.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Date</Label>
                  <Input 
                    type="date"
                    value={fixtureDate ? fixtureDate.toISOString().split('T')[0] : ''}
                    onChange={(e) => setFixtureDate(e.target.value ? new Date(e.target.value) : null)}
                  />
                </div>
                <div>
                  <Label>Time</Label>
                  <Select value={fixtureTime} onValueChange={setFixtureTime}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DEFAULT_TIME_SLOTS.map((time) => (
                        <SelectItem key={time} value={time}>
                          {time}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Venue</Label>
                <div className="flex gap-2">
                  <Select value={venue} onValueChange={setVenue}>
                    <SelectTrigger className="flex-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DEFAULT_VENUES.map((v) => (
                        <SelectItem key={v} value={v}>
                          {v}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    placeholder="Or enter custom venue"
                    value={customVenue}
                    onChange={(e) => setCustomVenue(e.target.value)}
                    className="flex-1"
                  />
                </div>
              </div>

              <div>
                <Label>Notes (Optional)</Label>
                <Input
                  placeholder="Additional match notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              <Button
                onClick={handleCreateFixture}
                disabled={!homeTeamId || !awayTeamId || createFixtureMutation.isPending}
                className="w-full"
              >
                {createFixtureMutation.isPending ? 'Creating...' : 'Create Fixture'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bulk" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Bulk Fixture Generator</CardTitle>
              <CardDescription>Generate multiple fixtures at once using templates</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Select Teams</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                  {teams.map((team) => (
                    <div key={team.id} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`team-${team.id}`}
                        checked={selectedTeams.includes(team.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedTeams([...selectedTeams, team.id]);
                          } else {
                            setSelectedTeams(selectedTeams.filter(id => id !== team.id));
                          }
                        }}
                      />
                      <Label htmlFor={`team-${team.id}`} className="text-sm">
                        {team.name}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Start Date</Label>
                  <Input 
                    type="date"
                    value={fixtureDate ? fixtureDate.toISOString().split('T')[0] : ''}
                    onChange={(e) => setFixtureDate(e.target.value ? new Date(e.target.value) : null)}
                  />
                </div>
                <div>
                  <Label>Round</Label>
                  <Input
                    type="number"
                    min="1"
                    value={round}
                    onChange={(e) => setRound(parseInt(e.target.value) || 1)}
                  />
                </div>
                <div>
                  <Label>Leg</Label>
                  <Input
                    type="number"
                    min="1"
                    value={leg}
                    onChange={(e) => setLeg(parseInt(e.target.value) || 1)}
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={generateRoundRobinFixtures}
                  disabled={selectedTeams.length < 2}
                  className="flex items-center gap-2"
                >
                  <Zap className="w-4 h-4" />
                  Generate Round Robin
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedTeams([]);
                    setBulkFixtures([]);
                  }}
                >
                  Clear All
                </Button>
              </div>

              {bulkFixtures.length > 0 && (
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-medium">Generated Fixtures ({bulkFixtures.length})</h4>
                    <Button
                      onClick={handleBulkCreate}
                      disabled={bulkCreateFixturesMutation.isPending}
                      className="flex items-center gap-2"
                    >
                      <Save className="w-4 h-4" />
                      {bulkCreateFixturesMutation.isPending ? 'Creating...' : 'Create All Fixtures'}
                    </Button>
                  </div>
                  <ScrollArea className="h-64 border rounded-md p-3">
                    <div className="space-y-2">
                      {bulkFixtures.map((fixture, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4" />
                            <span className="text-sm">
                              {getTeamName(fixture.homeTeamId)} vs {getTeamName(fixture.awayTeamId)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Calendar className="w-3 h-3" />
                            {format(fixture.kickoff, 'MMM dd, HH:mm')}
                            <MapPin className="w-3 h-3" />
                            {fixture.venue}
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="manage" className="space-y-4">
          {isLoading ? (
            <div className="text-center py-8">
              <p>Loading fixtures...</p>
            </div>
          ) : existingFixtures.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 text-sm font-semibold text-gray-900">No fixtures found</h3>
              <p className="mt-1 text-sm text-gray-500">Create your first fixture to get started.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {existingFixtures.map((fixture: any) => (
                <Card key={fixture.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        <span className="font-medium">
                          {getTeamName(fixture.homeTeamId)} vs {getTeamName(fixture.awayTeamId)}
                        </span>
                      </div>
                      <Badge variant="outline">{fixture.status || 'SCHEDULED'}</Badge>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="w-3 h-3" />
                        {fixture.kickoff && format(new Date(fixture.kickoff), 'MMM dd, HH:mm')}
                        <MapPin className="w-3 h-3" />
                        {fixture.venue}
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditFixture(fixture)}
                        >
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteFixture(fixture.id)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                  {fixture.notes && (
                    <p className="text-xs text-muted-foreground mt-2">{fixture.notes}</p>
                  )}
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Create Fixture Dialog */}
      <Dialog open={isCreateFixtureDialogOpen} onOpenChange={setIsCreateFixtureDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Fixture</DialogTitle>
            <DialogDescription>
              Create a match between two teams.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Home Team</Label>
                <Select value={homeTeamId} onValueChange={setHomeTeamId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Home team" />
                  </SelectTrigger>
                  <SelectContent>
                    {teams.map((team) => (
                      <SelectItem key={team.id} value={team.id}>
                        {team.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Away Team</Label>
                <Select value={awayTeamId} onValueChange={setAwayTeamId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Away team" />
                  </SelectTrigger>
                  <SelectContent>
                    {teams.map((team) => (
                      <SelectItem key={team.id} value={team.id} disabled={team.id === homeTeamId}>
                        {team.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Date</Label>
                <Input 
                  type="date" value={fixtureDate ? fixtureDate.toISOString().split('T')[0] : ''} 
                  onChange={(e) => setFixtureDate(e.target.value ? new Date(e.target.value) : null)}
                />
              </div>
              <div>
                <Label>Time</Label>
                <Select value={fixtureTime} onValueChange={setFixtureTime}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DEFAULT_TIME_SLOTS.map((time) => (
                      <SelectItem key={time} value={time}>
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Venue</Label>
              <Select value={venue} onValueChange={setVenue}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DEFAULT_VENUES.map((v) => (
                    <SelectItem key={v} value={v}>
                      {v}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateFixtureDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreateFixture}
              disabled={!homeTeamId || !awayTeamId || createFixtureMutation.isPending}
            >
              {createFixtureMutation.isPending ? 'Creating...' : 'Create Fixture'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Fixture Dialog */}
      <Dialog open={isEditFixtureDialogOpen} onOpenChange={setIsEditFixtureDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Fixture</DialogTitle>
            <DialogDescription>
              Update fixture details.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Home Team</Label>
                <Select value={homeTeamId} onValueChange={setHomeTeamId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Home team" />
                  </SelectTrigger>
                  <SelectContent>
                    {teams.map((team) => (
                      <SelectItem key={team.id} value={team.id}>
                        {team.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Away Team</Label>
                <Select value={awayTeamId} onValueChange={setAwayTeamId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Away team" />
                  </SelectTrigger>
                  <SelectContent>
                    {teams.map((team) => (
                      <SelectItem key={team.id} value={team.id} disabled={team.id === homeTeamId}>
                        {team.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Date</Label>
                <Input 
                  type="date" value={fixtureDate ? fixtureDate.toISOString().split('T')[0] : ''} 
                  onChange={(e) => setFixtureDate(e.target.value ? new Date(e.target.value) : null)}
                />
              </div>
              <div>
                <Label>Time</Label>
                <Select value={fixtureTime} onValueChange={setFixtureTime}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DEFAULT_TIME_SLOTS.map((time) => (
                      <SelectItem key={time} value={time}>
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Venue</Label>
              <Select value={venue} onValueChange={setVenue}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DEFAULT_VENUES.map((v) => (
                    <SelectItem key={v} value={v}>
                      {v}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Notes</Label>
              <Input
                placeholder="Match notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditFixtureDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleUpdateFixture}
              disabled={updateFixtureMutation.isPending}
            >
              {updateFixtureMutation.isPending ? 'Updating...' : 'Update Fixture'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ManualFixtureGenerator;
