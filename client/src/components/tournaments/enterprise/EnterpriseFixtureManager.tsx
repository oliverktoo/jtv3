import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Trophy, Settings, Play, BarChart3, Download, Send, AlertCircle, Edit2, Trash2, Plus, AlertTriangle, Filter } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { useTournamentGroups, useTournamentTeamGroups } from '@/hooks/useGroups';
import { useMatches, useStandings } from '@/hooks/useMatches';
import { MatchScoreEditor } from './MatchScoreEditor';
import StandingsTable from '@/components/StandingsTable';
import FixtureCard from '@/components/FixtureCard';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

interface EnterpriseFixtureManagerProps {
  tournamentId: string;
  tournamentName: string;
  onFixturesGenerated?: (fixtures: any[]) => void;
}

/**
 * Enterprise-Grade Fixture Management System
 * 
 * Professional tournament fixture generation using algorithms from:
 * - FIFA/UEFA standard round-robin (Circle Method)
 * - SofaScore/ESPN optimization techniques  
 * - Real-time standings with head-to-head resolution
 * - Constraint-based venue and time scheduling
 * - Live WebSocket updates for match events
 */
export default function EnterpriseFixtureManager({ 
  tournamentId, 
  tournamentName, 
  onFixturesGenerated 
}: EnterpriseFixtureManagerProps) {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [fixtures, setFixtures] = useState<any[]>([]);
  const [editingFixture, setEditingFixture] = useState<any | null>(null);
  const [selectedVenueId, setSelectedVenueId] = useState<string>('');
  const [groups, setGroups] = useState<any[]>([]);
  const [conflicts, setConflicts] = useState<any[]>([]);
  const [useExistingGroups, setUseExistingGroups] = useState(false);
  
  // Filtering state for fixtures display
  const [roundFilter, setRoundFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  
  // Use the working useMatches hook to fetch tournament fixtures
  const { data: matchesData = [], isLoading: isMatchesLoading } = useMatches(tournamentId);
  
  // Fetch standings from backend API (same as TournamentSuperHub)
  const { data: standingsData = [] } = useStandings(tournamentId);
  
  // CRUD dialogs state
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteAllDialogOpen, setDeleteAllDialogOpen] = useState(false);
  const [selectedFixture, setSelectedFixture] = useState<any | null>(null);
  
  // Create fixture form state
  const [newFixture, setNewFixture] = useState({
    roundId: '',
    homeTeamId: '',
    awayTeamId: '',
    kickoff: '',
    venue: '',
    status: 'SCHEDULED'
  });
  
  // Configuration state
  const [config, setConfig] = useState({
    format: 'group_knockout',
    groupCount: 2,
    teamsPerGroup: 4,
    startDate: new Date().toISOString().split('T')[0],
    legs: 2,
    timeSlots: [
      { time: '10:00', label: 'Morning Slot' },
      { time: '14:00', label: 'Afternoon Slot' },
      { time: '16:00', label: 'Evening Slot' }
    ],
    venues: [],
    useExistingGroups: false
  });

  const [systemStatus, setSystemStatus] = useState({
    algorithm: 'Circle Method (FIFA/UEFA Standard)',
    optimization: 'Real-time Constraint Solving',
    liveUpdates: 'WebSocket Broadcasting',
    standingsEngine: 'Head-to-Head Resolution'
  });

  // Fetch venues for this tournament
  const { data: venuesData, isLoading: venuesLoading } = useQuery({
    queryKey: ['fixtures-venues', tournamentId],
    queryFn: async () => {
      const res = await fetch(`/api/fixtures/venues?tournamentId=${tournamentId}`);
      if (!res.ok) throw new Error('Failed to fetch venues');
      return res.json();
    },
    enabled: !!tournamentId
  });

  // Fetch tournament teams
  const { data: teamsData, isLoading: teamsLoading } = useQuery({
    queryKey: ['tournament-teams', tournamentId],
    queryFn: async () => {
      const res = await fetch(`/api/tournaments/${tournamentId}/teams`);
      if (!res.ok) throw new Error('Failed to fetch teams');
      const data = await res.json();
      return data;
    },
    enabled: !!tournamentId
  });

  // Fetch existing groups using shared hook
  const { data: existingGroupsData = [], isLoading: groupsLoading } = useTournamentGroups(tournamentId);

  // Fetch team assignments to groups using shared hook  
  const { data: teamGroupsData = [] } = useTournamentTeamGroups(tournamentId);
  
  // Fetch tournament rounds for fixture creation
  const { data: roundsData } = useQuery({
    queryKey: ['tournament-rounds', tournamentId],
    queryFn: async () => {
      const res = await fetch(`/api/tournaments/${tournamentId}/rounds`);
      if (!res.ok) throw new Error('Failed to fetch rounds');
      return res.json();
    },
    enabled: !!tournamentId
  });

  // Fetch existing fixtures
  const { data: existingFixtures, refetch: refetchFixtures } = useQuery({
    queryKey: ['tournament-fixtures', tournamentId],
    queryFn: async () => {
      const res = await fetch(`/api/tournaments/${tournamentId}/matches`);
      if (!res.ok) throw new Error('Failed to fetch fixtures');
      const data = await res.json();
      return data.data || [];
    },
    enabled: !!tournamentId
  });
  
  // Load persisted fixtures on mount
  React.useEffect(() => {
    if (existingFixtures && existingFixtures.length > 0) {
      // Normalize database fixtures to match expected format
      const normalizedFixtures = existingFixtures.map((fixture: any) => ({
        ...fixture,
        // Map snake_case to camelCase for compatibility
        homeTeam: fixture.home_team || { id: fixture.home_team_id, name: fixture.home_team?.name || 'Unknown' },
        awayTeam: fixture.away_team || { id: fixture.away_team_id, name: fixture.away_team?.name || 'Unknown' },
        homeTeamId: fixture.home_team_id,
        awayTeamId: fixture.away_team_id,
        homeTeamName: fixture.home_team?.name || 'Unknown',  // For MatchScoreEditor
        awayTeamName: fixture.away_team?.name || 'Unknown',  // For MatchScoreEditor
        homeScore: fixture.home_score,
        awayScore: fixture.away_score,
        status: fixture.status || 'SCHEDULED',
        venue: fixture.venue || '',
        kickoff: fixture.kickoff,
        // Extract round number from round object
        round: fixture.rounds?.number || fixture.round?.number || 1,
        groupId: fixture.rounds?.group_id || fixture.round?.group_id,
        groupName: fixture.rounds?.groups?.name || fixture.round?.group?.name
      }));
      
      setFixtures(normalizedFixtures);
    }
  }, [existingFixtures]);

  // Generate fixtures mutation
  const generateMutation = useMutation({
    mutationFn: async (params: any) => {
      const res = await fetch('/api/fixtures/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params)
      });
      if (!res.ok) throw new Error('Failed to generate fixtures');
      return res.json();
    },
    onSuccess: (data) => {
      // Use persisted fixtures if available, otherwise use generated ones
      const fixturesData = data.persisted && data.fixtures ? data.fixtures : data.fixtures || [];
      setFixtures(fixturesData);
      setGroups(data.groups || []);
      setConflicts(data.conflicts || []);
      
      toast({
        title: "✅ Fixtures Generated!",
        description: `Successfully generated ${fixturesData.length} fixtures using ${data.algorithm}${data.persisted ? ' and saved to database' : ''}`,
      });
      onFixturesGenerated?.(fixturesData);
      
      // Refetch to get the latest data from database
      if (data.persisted) {
        refetchFixtures();
      }
    },
    onError: (error: any) => {
      toast({
        title: "❌ Generation Failed",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Publish fixtures mutation
  const publishMutation = useMutation({
    mutationFn: async (params: any) => {
      const res = await fetch('/api/fixtures/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params)
      });
      if (!res.ok) throw new Error('Failed to publish fixtures');
      return res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "📢 Fixtures Published!",
        description: `Published to ${Object.keys(data.publicationResults || {}).length} channels`,
      });
    }
  });

  // Create fixture mutation
  const createFixtureMutation = useMutation({
    mutationFn: async (fixtureData: any) => {
      const res = await fetch('/api/fixtures', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fixtureData)
      });
      if (!res.ok) throw new Error('Failed to create fixture');
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "✅ Fixture Created",
        description: "New fixture has been created successfully",
      });
      refetchFixtures();
      setCreateDialogOpen(false);
      setNewFixture({
        roundId: '',
        homeTeamId: '',
        awayTeamId: '',
        kickoff: '',
        venue: '',
        status: 'SCHEDULED'
      });
    },
    onError: (error: any) => {
      toast({
        title: "❌ Failed to Create",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Update fixture mutation
  const updateFixtureMutation = useMutation({
    mutationFn: async ({ fixtureId, data }: { fixtureId: string; data: any }) => {
      const res = await fetch(`/api/fixtures/${fixtureId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error('Failed to update fixture');
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "✅ Fixture Updated",
        description: "Fixture has been updated successfully",
      });
      refetchFixtures();
      queryClient.invalidateQueries({ queryKey: ['matches', tournamentId] });
      queryClient.invalidateQueries({ queryKey: ['standings', tournamentId] });
      setEditDialogOpen(false);
      setSelectedFixture(null);
    },
    onError: (error: any) => {
      toast({
        title: "❌ Failed to Update",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Delete fixture mutation
  const deleteFixtureMutation = useMutation({
    mutationFn: async (fixtureId: string) => {
      const res = await fetch(`/api/fixtures/${fixtureId}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error('Failed to delete fixture');
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "✅ Fixture Deleted",
        description: "Fixture has been deleted successfully",
      });
      refetchFixtures();
      setDeleteDialogOpen(false);
      setSelectedFixture(null);
    },
    onError: (error: any) => {
      toast({
        title: "❌ Failed to Delete",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Delete all fixtures mutation
  const deleteAllFixturesMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/tournaments/${tournamentId}/matches`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error('Failed to delete all fixtures');
      return res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "✅ All Fixtures Deleted",
        description: `Successfully deleted ${data.deletedCount} fixtures`,
      });
      refetchFixtures();
      setFixtures([]);
      setDeleteAllDialogOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "❌ Failed to Delete All",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const handleGenerateFixtures = async () => {
    const teams = teamsData?.data || teamsData?.teams || [];
    
    if (teams.length < 2) {
      toast({
        title: "❌ Insufficient Teams",
        description: "At least 2 teams are required to generate fixtures",
        variant: "destructive"
      });
      return;
    }

    // Check if using existing groups
    let groupsToUse = null;
    if (useExistingGroups && existingGroupsData?.length > 0) {
      // Build groups from existing data (hooks return arrays directly now)
      const tournamentGroups = existingGroupsData;
      const teamAssignments = teamGroupsData || [];
      
      groupsToUse = tournamentGroups.map((group: any) => {
        const groupTeams = teamAssignments
          .filter((tg: any) => tg.groupId === group.id)
          .map((tg: any) => {
            const team = teams.find((t: any) => t.id === tg.teamId);
            return team;
          })
          .filter(Boolean);
        
        return {
          id: group.id,
          name: group.name,
          teams: groupTeams
        };
      });

      if (groupsToUse.some((g: any) => g.teams.length < 2)) {
        toast({
          title: "❌ Invalid Groups",
          description: "All groups must have at least 2 teams",
          variant: "destructive"
        });
        return;
      }
    }

    setIsGenerating(true);
    try {
      await generateMutation.mutateAsync({
        teams: teams,
        config: {
          ...config,
          venues: venuesData?.venues || [],
          useExistingGroups,
          existingGroups: groupsToUse
        },
        tournamentId
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePublishFixtures = () => {
    publishMutation.mutate({
      fixtures,
      config,
      channels: ['website', 'pdf', 'sms', 'teams']
    });
  };

  const handleUpdateFixtureVenue = () => {
    if (!editingFixture) return;
    
    // Handle "none" value or find the selected venue
    const selectedVenue = selectedVenueId === 'none' 
      ? null 
      : venuesData?.venues?.find((v: any) => v.id === selectedVenueId);
    
    // Update the fixture in state
    setFixtures(prev => prev.map(f => 
      f.id === editingFixture.id 
        ? { ...f, venue: selectedVenue }
        : f
    ));
    
    // Close dialog
    setEditingFixture(null);
    setSelectedVenueId('');
    
    toast({
      title: "Success",
      description: selectedVenue ? "Match venue updated successfully" : "Venue removed from match",
    });
  };

  const handleDownloadPDF = () => {
    window.open('/api/fixtures/download/pdf', '_blank');
    toast({
      title: "📄 Downloading PDF",
      description: "Your fixtures PDF will download shortly",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Trophy className="h-6 w-6 text-yellow-600" />
            Enterprise Fixture Manager
          </h2>
          <p className="text-muted-foreground">
            Professional tournament management with FIFA/UEFA algorithms
          </p>
        </div>
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
          Enterprise Grade
        </Badge>
      </div>

      {/* System Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            System Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 border rounded-lg">
              <div className="text-sm font-medium text-muted-foreground">Algorithm</div>
              <div className="text-sm font-semibold">{systemStatus.algorithm}</div>
            </div>
            <div className="text-center p-3 border rounded-lg">
              <div className="text-sm font-medium text-muted-foreground">Optimization</div>
              <div className="text-sm font-semibold">{systemStatus.optimization}</div>
            </div>
            <div className="text-center p-3 border rounded-lg">
              <div className="text-sm font-medium text-muted-foreground">Live Updates</div>
              <div className="text-sm font-semibold">{systemStatus.liveUpdates}</div>
            </div>
            <div className="text-center p-3 border rounded-lg">
              <div className="text-sm font-medium text-muted-foreground">Standings</div>
              <div className="text-sm font-semibold">{systemStatus.standingsEngine}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Interface */}
      <Tabs defaultValue="generation" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="generation">Generation</TabsTrigger>
          <TabsTrigger value="standings">Standings & Scores</TabsTrigger>
          <TabsTrigger value="optimization">Optimization</TabsTrigger>
          <TabsTrigger value="fixtures">Fixtures</TabsTrigger>
          <TabsTrigger value="live">Live Updates</TabsTrigger>
        </TabsList>

        <TabsContent value="generation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Professional Fixture Generation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-blue-900 mb-2">Circle Method Algorithm</h4>
                <p className="text-sm text-blue-700">
                  Using FIFA/UEFA standard Circle Method for optimal round-robin fixture generation.
                  This algorithm ensures perfect home/away balance and minimizes travel distances.
                </p>
              </div>
              
              {/* Configuration Form */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="format">Tournament Format</Label>
                  <Select value={config.format} onValueChange={(value) => setConfig({...config, format: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="group_knockout">Group + Knockout</SelectItem>
                      <SelectItem value="round_robin">Round Robin</SelectItem>
                      <SelectItem value="knockout">Knockout Only</SelectItem>
                      <SelectItem value="league">League System</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={config.startDate}
                    onChange={(e) => setConfig({...config, startDate: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="legs">Round Robin Format</Label>
                  <Select 
                    value={config.legs.toString()} 
                    onValueChange={(value) => setConfig({...config, legs: parseInt(value)})}
                  >
                    <SelectTrigger id="legs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Single Leg (Each team plays once)</SelectItem>
                      <SelectItem value="2">Double Leg (Home & Away)</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    {config.legs === 1 ? 'Each team plays every other team once' : 'Each team plays every other team twice (home and away)'}
                  </p>
                </div>
              </div>

              {/* Group Configuration */}
              {config.format === 'group_knockout' && (
                <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
                  <h4 className="font-semibold">Group Configuration</h4>
                  
                  {/* Debug info - Remove this after testing */}
                  <div className="text-xs p-2 bg-white border rounded font-mono">
                    Debug: Groups={existingGroupsData?.length || 0} | Loading={groupsLoading ? 'Yes' : 'No'} | IsArray={Array.isArray(existingGroupsData) ? 'Yes' : 'No'}
                  </div>
                  
                  {/* Option to use existing groups */}
                  {groupsLoading ? (
                    <div className="p-3 bg-gray-100 border rounded-lg text-sm text-muted-foreground">
                      Loading groups...
                    </div>
                  ) : (Array.isArray(existingGroupsData) && existingGroupsData.length > 0) ? (
                    <div className="flex items-start space-x-3 p-4 bg-blue-50 border-2 border-blue-300 rounded-lg">
                      <input
                        type="checkbox"
                        id="useExistingGroups"
                        checked={useExistingGroups}
                        onChange={(e) => {
                          setUseExistingGroups(e.target.checked);
                          setConfig({...config, useExistingGroups: e.target.checked});
                        }}
                        className="mt-1 h-5 w-5 rounded border-gray-400 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                      <div className="flex-1">
                        <Label htmlFor="useExistingGroups" className="cursor-pointer font-semibold text-blue-900">
                          ✅ Use Existing Tournament Groups
                        </Label>
                        <div className="text-sm text-blue-700 mt-1">
                          {existingGroupsData.length} groups found in tournament structure
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm">
                      <div className="font-medium text-yellow-900">No existing groups found</div>
                      <div className="text-yellow-700">
                        Create groups in the <strong>Groups</strong> tab first, or use auto-generation below.
                      </div>
                    </div>
                  )}

                  {useExistingGroups ? (
                    <div className="space-y-2">
                      <div className="text-sm text-muted-foreground">
                        Using pre-configured groups from the tournament structure:
                      </div>
                      <div className="space-y-2">
                        {existingGroupsData?.map((group: any) => {
                          const groupTeams = teamGroupsData?.filter(
                            (tg: any) => tg.groupId === group.id
                          ) || [];
                          return (
                            <div key={group.id} className="p-3 border rounded bg-white">
                              <div className="font-medium">{group.name}</div>
                              <div className="text-sm text-muted-foreground">
                                {groupTeams.length} teams assigned
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="groupCount">Number of Groups</Label>
                        <Input
                          id="groupCount"
                          type="number"
                          min="2"
                          max="8"
                          value={config.groupCount}
                          onChange={(e) => setConfig({...config, groupCount: parseInt(e.target.value)})}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="teamsPerGroup">Teams per Group</Label>
                        <Input
                          id="teamsPerGroup"
                          type="number"
                          min="3"
                          max="6"
                          value={config.teamsPerGroup}
                          onChange={(e) => setConfig({...config, teamsPerGroup: parseInt(e.target.value)})}
                        />
                      </div>
                    </div>
                  )}
                  
                  {/* Progression Rules */}
                  <div className="mt-4 p-4 border rounded-lg bg-white">
                    <h5 className="font-semibold mb-3">Progression Rules</h5>
                    <p className="text-sm text-muted-foreground mb-3">
                      Define how many teams advance from each group
                    </p>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="qualifiedCount">Teams Qualifying Directly</Label>
                        <Input
                          id="qualifiedCount"
                          type="number"
                          min="0"
                          max="4"
                          defaultValue="2"
                          placeholder="e.g., 2"
                        />
                        <p className="text-xs text-muted-foreground">
                          Top teams that advance automatically
                        </p>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="playoffCount">Teams to Playoffs</Label>
                        <Input
                          id="playoffCount"
                          type="number"
                          min="0"
                          max="4"
                          defaultValue="0"
                          placeholder="e.g., 1"
                        />
                        <p className="text-xs text-muted-foreground">
                          Teams advancing to playoff round
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <span className="font-medium">Tournament</span>
                  <span className="text-muted-foreground">{tournamentName}</span>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <span className="font-medium">Available Teams</span>
                  {teamsLoading ? (
                    <Badge variant="outline">
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-gray-600 mr-2"></div>
                      Loading...
                    </Badge>
                  ) : (
                    <Badge variant="secondary">
                      {(teamsData?.data?.length || teamsData?.teams?.length || teamsData?.count || 0)} teams
                    </Badge>
                  )}
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <span className="font-medium">Venues Available</span>
                  <Badge variant="secondary">{venuesData?.venues?.length || 0} venues</Badge>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <span className="font-medium">Algorithm</span>
                  <Badge variant="secondary">Circle Method (Round-Robin)</Badge>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <span className="font-medium">Optimization</span>
                  <Badge variant="secondary">Venue + Time + Geography</Badge>
                </div>
              </div>

              {conflicts.length > 0 && (
                <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-orange-900 mb-1">
                        {conflicts.length} Scheduling Conflicts Detected
                      </h4>
                      {conflicts.map((conflict, idx) => (
                        <p key={idx} className="text-sm text-orange-700">
                          • {conflict.message} ({conflict.severity})
                        </p>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <Button 
                onClick={handleGenerateFixtures}
                disabled={isGenerating || venuesLoading || (!teamsData?.data && !teamsData?.teams)}
                className="w-full"
                size="lg"
              >
                {isGenerating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Generating Professional Fixtures...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Generate Jamii Fixtures
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="standings" className="space-y-4">
          {/* Tournament Standings - Backend calculated */}
          {standingsData.length > 0 ? (
            <div className="space-y-6 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold">Tournament Standings</h2>
                  <p className="text-muted-foreground text-sm">Live standings calculated from match results</p>
                </div>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </div>
              
              {/* Group standings by group name */}
              {Array.from(new Set(standingsData.map((s: any) => s.groupName))).sort().map((groupName) => {
                const groupStandings = standingsData.filter((s: any) => s.groupName === groupName);
                return (
                  <div key={groupName}>
                    <h3 className="text-lg font-semibold mb-3">{groupName}</h3>
                    <StandingsTable standings={groupStandings} showForm={true} />
                  </div>
                );
              })}
            </div>
          ) : (
            <Card className="mb-6">
              <CardContent className="py-12">
                <div className="text-center text-muted-foreground">
                  <BarChart3 className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <h3 className="mt-2 text-sm font-semibold">No standings available</h3>
                  <p className="text-sm mt-1">Standings will appear once matches are played and results recorded.</p>
                  <p className="text-sm text-blue-600 mt-2">Update match scores below to generate standings</p>
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Match Score Editor - Results section below standings */}
          <MatchScoreEditor 
            matches={fixtures}
            tournamentId={tournamentId}
            onScoreUpdate={(matchId, homeScore, awayScore) => {
              // Update local fixtures state
              setFixtures(prev => prev.map(f => 
                f.id === matchId ? {...f, homeScore, awayScore, status: 'completed'} : f
              ));
            }}
          />
        </TabsContent>

        <TabsContent value="optimization" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Constraint Optimization</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">Venue Optimization</h4>
                    <p className="text-sm text-muted-foreground">
                      Intelligent stadium assignment based on capacity, location, and availability.
                    </p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">Time Slot Management</h4>
                    <p className="text-sm text-muted-foreground">
                      Automatic scheduling considering TV windows and fan attendance patterns.
                    </p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">Travel Optimization</h4>
                    <p className="text-sm text-muted-foreground">
                      Minimizes travel burden while maintaining competitive balance.
                    </p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">Derby Detection</h4>
                    <p className="text-sm text-muted-foreground">
                      Automatically identifies and prioritizes local rivalry matches.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fixtures" className="space-y-4">
          <FixturesDisplay 
            tournamentId={tournamentId}
            tournamentName={tournamentName}
            matchesData={matchesData}
            isMatchesLoading={isMatchesLoading}
            setCreateDialogOpen={setCreateDialogOpen}
            setDeleteAllDialogOpen={setDeleteAllDialogOpen}
            setSelectedFixture={setSelectedFixture}
            setEditDialogOpen={setEditDialogOpen}
            setDeleteDialogOpen={setDeleteDialogOpen}
          />
        </TabsContent>

        <TabsContent value="live" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Real-Time Updates</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <h4 className="font-semibold text-green-900 mb-2">WebSocket Broadcasting</h4>
                  <p className="text-sm text-green-700">
                    Live match updates, standings changes, and fixture notifications are broadcast 
                    in real-time to all connected clients.
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">Real-time</div>
                    <div className="text-sm text-muted-foreground">Match Updates</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-green-600">Live</div>
                    <div className="text-sm text-muted-foreground">Standings</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">Instant</div>
                    <div className="text-sm text-muted-foreground">Notifications</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Venue Edit Dialog */}
      <Dialog open={!!editingFixture} onOpenChange={() => {
        setEditingFixture(null);
        setSelectedVenueId('');
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Venue to Match</DialogTitle>
            <DialogDescription>
              {editingFixture && (
                <span className="font-medium">
                  {editingFixture.homeTeam.name} vs {editingFixture.awayTeam.name}
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label>Select Venue</Label>
              <Select value={selectedVenueId} onValueChange={setSelectedVenueId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a venue..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No venue assigned</SelectItem>
                  {venuesData?.venues?.map((venue: any) => (
                    <SelectItem key={venue.id} value={venue.id}>
                      {venue.name} - {venue.location}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingFixture(null)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateFixtureVenue}>
              Save Venue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Fixture Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Fixture</DialogTitle>
            <DialogDescription>Add a new match to the tournament</DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Round *</Label>
              <Select value={newFixture.roundId} onValueChange={(val) => setNewFixture({...newFixture, roundId: val})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select round..." />
                </SelectTrigger>
                <SelectContent>
                  {roundsData?.data?.map((round: any) => (
                    <SelectItem key={round.id} value={round.id}>
                      {round.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={newFixture.status} onValueChange={(val) => setNewFixture({...newFixture, status: val})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SCHEDULED">Scheduled</SelectItem>
                  <SelectItem value="LIVE">Live</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                  <SelectItem value="POSTPONED">Postponed</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Home Team *</Label>
              <Select value={newFixture.homeTeamId} onValueChange={(val) => setNewFixture({...newFixture, homeTeamId: val})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select home team..." />
                </SelectTrigger>
                <SelectContent>
                  {(teamsData?.data || teamsData?.teams || []).map((team: any) => (
                    <SelectItem key={team.id} value={team.id}>
                      {team.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Away Team *</Label>
              <Select value={newFixture.awayTeamId} onValueChange={(val) => setNewFixture({...newFixture, awayTeamId: val})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select away team..." />
                </SelectTrigger>
                <SelectContent>
                  {(teamsData?.data || teamsData?.teams || []).map((team: any) => (
                    <SelectItem key={team.id} value={team.id}>
                      {team.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 col-span-2">
              <Label>Kick-off Date & Time *</Label>
              <Input 
                type="datetime-local" 
                value={newFixture.kickoff}
                onChange={(e) => setNewFixture({...newFixture, kickoff: e.target.value})}
              />
            </div>

            <div className="space-y-2 col-span-2">
              <Label>Venue (Optional)</Label>
              <Input 
                placeholder="e.g., Stadium Name"
                value={newFixture.venue}
                onChange={(e) => setNewFixture({...newFixture, venue: e.target.value})}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={() => createFixtureMutation.mutate(newFixture)}
              disabled={!newFixture.roundId || !newFixture.homeTeamId || !newFixture.awayTeamId || !newFixture.kickoff}
            >
              Create Fixture
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Fixture Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Fixture</DialogTitle>
            <DialogDescription>Update match details</DialogDescription>
          </DialogHeader>
          
          {selectedFixture && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Home Team</Label>
                <Select 
                  value={selectedFixture.homeTeamId || selectedFixture.home_team_id}
                  onValueChange={(val) => setSelectedFixture({...selectedFixture, homeTeamId: val, home_team_id: val})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(teamsData?.data || teamsData?.teams || []).map((team: any) => (
                      <SelectItem key={team.id} value={team.id}>
                        {team.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Away Team</Label>
                <Select 
                  value={selectedFixture.awayTeamId || selectedFixture.away_team_id}
                  onValueChange={(val) => setSelectedFixture({...selectedFixture, awayTeamId: val, away_team_id: val})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(teamsData?.data || teamsData?.teams || []).map((team: any) => (
                      <SelectItem key={team.id} value={team.id}>
                        {team.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 col-span-2">
                <Label>Kick-off Date & Time</Label>
                <Input 
                  type="datetime-local" 
                  value={selectedFixture.kickoff && selectedFixture.kickoff !== 'Invalid Date' 
                    ? new Date(selectedFixture.kickoff).toISOString().slice(0, 16) 
                    : ''
                  }
                  onChange={(e) => setSelectedFixture({...selectedFixture, kickoff: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <Label>Home Score</Label>
                <Input 
                  type="number" 
                  min="0"
                  value={selectedFixture.homeScore ?? selectedFixture.home_score ?? ''}
                  onChange={(e) => setSelectedFixture({...selectedFixture, homeScore: parseInt(e.target.value) || null})}
                />
              </div>

              <div className="space-y-2">
                <Label>Away Score</Label>
                <Input 
                  type="number" 
                  min="0"
                  value={selectedFixture.awayScore ?? selectedFixture.away_score ?? ''}
                  onChange={(e) => setSelectedFixture({...selectedFixture, awayScore: parseInt(e.target.value) || null})}
                />
              </div>

              <div className="space-y-2">
                <Label>Status</Label>
                <Select 
                  value={selectedFixture.status}
                  onValueChange={(val) => setSelectedFixture({...selectedFixture, status: val})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SCHEDULED">Scheduled</SelectItem>
                    <SelectItem value="LIVE">Live</SelectItem>
                    <SelectItem value="COMPLETED">Completed</SelectItem>
                    <SelectItem value="POSTPONED">Postponed</SelectItem>
                    <SelectItem value="CANCELLED">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Venue</Label>
                <Select
                  value={selectedFixture.venue || ''}
                  onValueChange={(val) => setSelectedFixture({...selectedFixture, venue: val})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select venue" />
                  </SelectTrigger>
                  <SelectContent>
                    {venuesData?.venues?.map((venue: any) => (
                      <SelectItem key={venue.id} value={venue.name}>
                        {venue.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={() => {
                if (!selectedFixture?.id) {
                  toast({
                    title: "❌ Error",
                    description: "Fixture ID is missing",
                    variant: "destructive"
                  });
                  return;
                }
                updateFixtureMutation.mutate({
                  fixtureId: selectedFixture.id,
                  data: {
                    homeTeamId: selectedFixture.homeTeamId || selectedFixture.home_team_id,
                    awayTeamId: selectedFixture.awayTeamId || selectedFixture.away_team_id,
                    kickoff: selectedFixture.kickoff,
                    homeScore: selectedFixture.homeScore,
                    awayScore: selectedFixture.awayScore,
                    status: selectedFixture.status,
                    venue: selectedFixture.venue
                  }
                });
              }}
            >
              Update Fixture
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Fixture Alert Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Fixture?</AlertDialogTitle>
            <AlertDialogDescription>
              {selectedFixture && (
                <>
                  Are you sure you want to delete this fixture?
                  <div className="mt-2 p-2 bg-gray-50 rounded border">
                    <strong>{selectedFixture.homeTeam?.name || selectedFixture.home_team?.name}</strong> vs{' '}
                    <strong>{selectedFixture.awayTeam?.name || selectedFixture.away_team?.name}</strong>
                  </div>
                  This action cannot be undone.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={() => {
                if (!selectedFixture?.id) {
                  toast({
                    title: "❌ Error",
                    description: "Fixture ID is missing",
                    variant: "destructive"
                  });
                  return;
                }
                deleteFixtureMutation.mutate(selectedFixture.id);
              }}
            >
              Delete Fixture
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete All Fixtures Alert Dialog */}
      <AlertDialog open={deleteAllDialogOpen} onOpenChange={setDeleteAllDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              Delete ALL Fixtures?
            </AlertDialogTitle>
            <AlertDialogDescription>
              <div className="space-y-2">
                <p>This will permanently delete <strong>all {fixtures.length} fixtures</strong> for this tournament.</p>
                <div className="p-3 bg-red-50 border border-red-200 rounded">
                  <p className="text-red-800 font-medium">⚠️ Warning: This action cannot be undone!</p>
                  <p className="text-red-700 text-sm mt-1">All match data, scores, and schedules will be permanently removed.</p>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={() => deleteAllFixturesMutation.mutate()}
            >
              Delete All {fixtures.length} Fixtures
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// FixturesDisplay Component - Shows actual tournament fixtures using FixtureCard
function FixturesDisplay({
  tournamentId,
  tournamentName,
  matchesData,
  isMatchesLoading,
  setCreateDialogOpen,
  setDeleteAllDialogOpen,
  setSelectedFixture,
  setEditDialogOpen,
  setDeleteDialogOpen
}: {
  tournamentId: string;
  tournamentName: string;
  matchesData: any[];
  isMatchesLoading: boolean;
  setCreateDialogOpen: (open: boolean) => void;
  setDeleteAllDialogOpen: (open: boolean) => void;
  setSelectedFixture: (fixture: any) => void;
  setEditDialogOpen: (open: boolean) => void;
  setDeleteDialogOpen: (open: boolean) => void;
}) {
  const [roundFilter, setRoundFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Transform matches data for FixtureCard (same as main Fixtures page)
  // Filter out invalid entries first
  const fixtures = matchesData
    .filter((m: any) => m && m.match && m.match.id)
    .map((m: any) => ({
      id: m.match.id,
      homeTeam: m.homeTeam?.name || "TBD",
      awayTeam: m.awayTeam?.name || "TBD",
      homeScore: m.match.homeScore,
      awayScore: m.match.awayScore,
      kickoff: m.match.kickoff,
      venue: m.match.venue,
      status: m.match.status,
      round: m.round?.name || `Round ${m.round?.number || 1}`,
      stage: "League",
    }));

  const filteredFixtures = fixtures.filter((fixture: any) => {
    const matchesRound = roundFilter === "all" || fixture.round === roundFilter;
    const matchesStatus = statusFilter === "all" || fixture.status === statusFilter;
    return matchesRound && matchesStatus;
  });

  const rounds = Array.from(new Set(fixtures.map((f: any) => f.round)));

  if (isMatchesLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading tournament fixtures...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            {tournamentName} - Tournament Fixtures
          </CardTitle>
          <div className="flex gap-2">
            {/* CRUD Action Buttons */}
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setCreateDialogOpen(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Fixture
            </Button>
            {filteredFixtures.length > 0 && (
              <>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setDeleteAllDialogOpen(true)}
                  className="text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete All
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export PDF
                </Button>
                <Button size="sm">
                  <Send className="h-4 w-4 mr-2" />
                  Publish
                </Button>
              </>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Filters */}
        <div className="flex gap-4 items-center flex-wrap">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={roundFilter} onValueChange={setRoundFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by round" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Rounds</SelectItem>
                {rounds.map((round) => (
                  <SelectItem key={round} value={round}>
                    {round}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="SCHEDULED">Scheduled</SelectItem>
              <SelectItem value="LIVE">Live</SelectItem>
              <SelectItem value="COMPLETED">Completed</SelectItem>
              <SelectItem value="POSTPONED">Postponed</SelectItem>
              <SelectItem value="CANCELLED">Cancelled</SelectItem>
            </SelectContent>
          </Select>

          {/* Status Badges */}
          <div className="flex gap-2 ml-auto">
            <Badge variant="outline" className="bg-chart-2/10 text-chart-2 border-chart-2/20">
              {fixtures.filter((f: any) => f.status === "COMPLETED").length} Completed
            </Badge>
            <Badge variant="outline" className="bg-muted text-muted-foreground">
              {fixtures.filter((f: any) => f.status === "SCHEDULED").length} Scheduled
            </Badge>
            <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">
              {fixtures.length} Total Fixtures
            </Badge>
          </div>
        </div>

        {/* Fixtures Display */}
        {filteredFixtures.length === 0 && fixtures.length > 0 && (
          <div className="text-center py-12 border-2 border-dashed rounded-lg">
            <p className="text-muted-foreground mb-4">No fixtures match the selected filters</p>
            <Button variant="outline" onClick={() => {setRoundFilter("all"); setStatusFilter("all")}}>
              Clear Filters
            </Button>
          </div>
        )}

        {fixtures.length === 0 && (
          <div className="text-center py-12 border-2 border-dashed rounded-lg">
            <Calendar className="h-16 w-16 mx-auto mb-4 opacity-50 text-muted-foreground" />
            <p className="text-lg font-medium text-muted-foreground">No fixtures found</p>
            <p className="text-sm text-muted-foreground mt-2">
              Generate fixtures using the Generation tab or check if this tournament has any matches
            </p>
          </div>
        )}

        <div className="space-y-4">
          {filteredFixtures.map((fixture: any) => {
            const matchData = matchesData.find((m: any) => m.match.id === fixture.id);
            return (
              <div key={fixture.id} className="relative group">
                <FixtureCard
                  {...fixture}
                  onClick={() => {
                    // Fixture clicked
                  }}
                />
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 bg-background/80 backdrop-blur-sm rounded-md p-1">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 px-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedFixture(fixture);
                      setEditDialogOpen(true);
                    }}
                  >
                    <Edit2 className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-destructive hover:bg-destructive/10 h-8 px-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedFixture(fixture);
                      setDeleteDialogOpen(true);
                    }}
                  >
                    <Trash2 className="h-3 w-3 mr-1" />
                    Delete
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        {filteredFixtures.length > 0 && (
          <div className="text-center pt-4 border-t">
            <p className="text-sm text-muted-foreground">
              Showing {filteredFixtures.length} of {fixtures.length} fixtures for {tournamentName}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}