import React, { useState, useMemo, useCallback } from 'react';
import { 
  Search, 
  Users, 
  MapPin, 
  Trophy, 
  CheckCircle2, 
  Plus,
  Filter,
  Star,
  Calendar,
  Clock,
  AlertCircle,
  ChevronRight,
  X,
  RotateCcw
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useAvailableTeamsForTournament, useRegisterTeamForTournament } from '@/hooks/useTeamRegistrations';
import { useCounties, useSubCounties, useWards } from '@/hooks/useReferenceData';

interface SeamlessTeamSelectorProps {
  tournamentId: string;
  orgId: string;
  onTeamRegistered?: (teamId: string) => void;
  mode?: 'single' | 'bulk';
  trigger?: React.ReactNode;
}

interface TeamCard {
  id: string;
  name: string;
  club_name?: string;
  county_id?: string;
  sub_county_id?: string;
  ward_id?: string;
  logo_url?: string;
  players_count?: number;
  recent_matches?: number;
  win_rate?: number;
  formation?: string;
  coach_name?: string;
  established_year?: number;
  eligibility_status?: 'eligible' | 'ineligible' | 'pending';
  eligibility_reason?: string;
}

export const SeamlessTeamSelector: React.FC<SeamlessTeamSelectorProps> = ({
  tournamentId,
  orgId,
  onTeamRegistered,
  mode = 'single',
  trigger
}) => {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCounty, setSelectedCounty] = useState<string>('all');
  const [selectedSubCounty, setSelectedSubCounty] = useState<string>('all');
  const [selectedWard, setSelectedWard] = useState<string>('all');
  const [selectedTeams, setSelectedTeams] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState('browse');
  const [sortBy, setSortBy] = useState('name');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  const { toast } = useToast();
  const { data: availableTeams = [], isLoading } = useAvailableTeamsForTournament(tournamentId, orgId);
  const { data: counties = [] } = useCounties();
  const { data: subCounties = [] } = useSubCounties(selectedCounty === 'all' ? '' : selectedCounty);
  const { data: wards = [] } = useWards(selectedSubCounty === 'all' ? '' : selectedSubCounty);
  const registerTeam = useRegisterTeamForTournament();

  // Clear functions
  const clearSearch = useCallback(() => {
    setSearchTerm('');
  }, []);

  const clearAllFilters = useCallback(() => {
    setSearchTerm('');
    setSelectedCounty('all');
    setSelectedSubCounty('all');
    setSelectedWard('all');
    setSortBy('name');
  }, []);

  const hasActiveFilters = searchTerm || selectedCounty !== 'all' || selectedSubCounty !== 'all' || selectedWard !== 'all';

  // Enhanced team data with mock additional properties for demo
  const enhancedTeams: TeamCard[] = useMemo(() => {
    return availableTeams.map((team: any) => ({
      ...team,
      players_count: Math.floor(Math.random() * 15) + 16, // 16-30 players
      recent_matches: Math.floor(Math.random() * 10),
      win_rate: Math.floor(Math.random() * 80) + 20, // 20-100%
      formation: ['4-4-2', '4-3-3', '3-5-2', '4-2-3-1'][Math.floor(Math.random() * 4)],
      established_year: 2000 + Math.floor(Math.random() * 24),
      eligibility_status: 'eligible' as const,
    }));
  }, [availableTeams]);

  // Advanced filtering
  const filteredTeams = useMemo(() => {
    let filtered = enhancedTeams;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(team => 
        team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        team.club_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        team.coach_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Geographic filters
    if (selectedCounty && selectedCounty !== 'all') {
      filtered = filtered.filter(team => team.county_id === selectedCounty);
    }
    if (selectedSubCounty && selectedSubCounty !== 'all') {
      filtered = filtered.filter(team => team.sub_county_id === selectedSubCounty);
    }
    if (selectedWard && selectedWard !== 'all') {
      filtered = filtered.filter(team => team.ward_id === selectedWard);
    }

    // Sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'players':
          return (b.players_count || 0) - (a.players_count || 0);
        case 'winRate':
          return (b.win_rate || 0) - (a.win_rate || 0);
        case 'established':
          return (b.established_year || 0) - (a.established_year || 0);
        default:
          return a.name.localeCompare(b.name);
      }
    });

    return filtered;
  }, [enhancedTeams, searchTerm, selectedCounty, selectedSubCounty, selectedWard, sortBy]);

  const handleTeamToggle = useCallback((teamId: string) => {
    const newSelected = new Set(selectedTeams);
    if (newSelected.has(teamId)) {
      newSelected.delete(teamId);
    } else {
      if (mode === 'single') {
        newSelected.clear();
      }
      newSelected.add(teamId);
    }
    setSelectedTeams(newSelected);
  }, [selectedTeams, mode]);

  const handleRegister = async () => {
    if (selectedTeams.size === 0) {
      toast({
        title: "No teams selected",
        description: "Please select at least one team to register",
        variant: "destructive"
      });
      return;
    }

    try {
      const teamsArray = Array.from(selectedTeams);
      const successfulRegistrations: string[] = [];
      const failedRegistrations: {teamId: string, error: string}[] = [];
      
      for (const teamId of teamsArray) {
        try {
          await registerTeam.mutateAsync({
            teamId,
            tournamentId,
            representingOrgId: orgId,
            registrationStatus: 'SUBMITTED',
            squadSize: 22,
            jerseyColors: null,
            coachName: null,
            notes: null,
          });
          
          successfulRegistrations.push(teamId);
          onTeamRegistered?.(teamId);
        } catch (teamError: any) {
          const errorMessage = teamError.message || "Unknown error";
          failedRegistrations.push({ teamId, error: errorMessage });
        }
      }

      // Show appropriate success/error messages
      if (successfulRegistrations.length > 0) {
        toast({
          title: "Success!",
          description: `${successfulRegistrations.length} team${successfulRegistrations.length > 1 ? 's' : ''} registered successfully`,
        });
      }

      if (failedRegistrations.length > 0) {
        const duplicateErrors = failedRegistrations.filter(f => 
          f.error.includes("already registered") || f.error.includes("duplicate key")
        );
        
        if (duplicateErrors.length > 0) {
          toast({
            title: "Some teams already registered",
            description: `${duplicateErrors.length} team${duplicateErrors.length > 1 ? 's were' : ' was'} already registered for this tournament`,
            variant: "destructive"
          });
        }

        const otherErrors = failedRegistrations.filter(f => 
          !f.error.includes("already registered") && !f.error.includes("duplicate key")
        );
        
        if (otherErrors.length > 0) {
          toast({
            title: "Registration errors",
            description: `${otherErrors.length} team${otherErrors.length > 1 ? 's' : ''} failed to register: ${otherErrors[0].error}`,
            variant: "destructive"
          });
        }
      }

      setOpen(false);
      setSelectedTeams(new Set());
    } catch (error: any) {
      console.error("Team registration error:", error);
      toast({
        title: "Registration failed",
        description: error.message || "Failed to register teams",
        variant: "destructive"
      });
    }
  };

  const TeamCard: React.FC<{ team: TeamCard; isSelected: boolean; onToggle: () => void }> = ({
    team,
    isSelected,
    onToggle
  }) => (
    <Card 
      className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
        isSelected ? 'ring-2 ring-primary shadow-lg' : ''
      } ${viewMode === 'list' ? 'flex-row' : ''}`}
      onClick={onToggle}
    >
      <div className={`${viewMode === 'list' ? 'flex items-center space-x-4 p-4' : 'p-0'}`}>
        <div className={viewMode === 'list' ? 'flex-shrink-0' : 'p-4 pb-2'}>
          <div className="flex items-center space-x-3">
            <Checkbox
              checked={isSelected}
              onChange={() => {}}
              className="pointer-events-none"
            />
            <Avatar className="w-10 h-10">
              <AvatarImage src={team.logo_url} />
              <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                {team.name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
        
        <div className={`flex-1 ${viewMode === 'grid' ? 'p-4 pt-0' : ''}`}>
          <div className="flex items-start justify-between mb-2">
            <div>
              <h3 className="font-semibold text-sm">{team.name}</h3>
              {team.club_name && (
                <p className="text-xs text-muted-foreground">{team.club_name}</p>
              )}
            </div>
            {team.eligibility_status === 'eligible' && (
              <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
            )}
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center space-x-1">
              <Users className="w-3 h-3 text-muted-foreground" />
              <span>{team.players_count} players</span>
            </div>
            <div className="flex items-center space-x-1">
              <Trophy className="w-3 h-3 text-muted-foreground" />
              <span>{team.win_rate}% win rate</span>
            </div>
            {team.coach_name && (
              <div className="col-span-2 flex items-center space-x-1">
                <Star className="w-3 h-3 text-muted-foreground" />
                <span>Coach: {team.coach_name}</span>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between mt-2">
            <Badge variant="outline" className="text-xs">
              {team.formation}
            </Badge>
            <span className="text-xs text-muted-foreground">
              Est. {team.established_year}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );

  const DefaultTrigger = (
    <Button>
      <Plus className="w-4 h-4 mr-2" />
      {mode === 'bulk' ? 'Register Teams' : 'Register Team'}
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || DefaultTrigger}
      </DialogTrigger>
      <DialogContent className="max-w-6xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>
            {mode === 'bulk' ? 'Register Multiple Teams' : 'Register Team'}
          </DialogTitle>
          <DialogDescription>
            Select {mode === 'bulk' ? 'teams' : 'a team'} to register for this tournament
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
          <TabsList className="grid w-full grid-cols-3 flex-shrink-0">
            <TabsTrigger value="browse">Browse Teams</TabsTrigger>
            <TabsTrigger value="search">Advanced Search</TabsTrigger>
            <TabsTrigger value="selected">Selected ({selectedTeams.size})</TabsTrigger>
          </TabsList>

          <TabsContent value="browse" className="flex-1 flex flex-col space-y-4 overflow-y-auto min-h-0">
            {/* Quick Search and Filters */}
            <div className="flex flex-col space-y-3">
              <div className="flex items-center space-x-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search teams, clubs, or coaches..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-10"
                  />
                  {searchTerm && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearSearch}
                      className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-muted"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  )}
                </div>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name">Name</SelectItem>
                    <SelectItem value="players">Players Count</SelectItem>
                    <SelectItem value="winRate">Win Rate</SelectItem>
                    <SelectItem value="established">Established</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                >
                  {viewMode === 'grid' ? 'List' : 'Grid'}
                </Button>
                {hasActiveFilters && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearAllFilters}
                    className="flex items-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" />
                    Clear Filters
                  </Button>
                )}
              </div>

              {/* Quick Stats */}
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>{filteredTeams.length} teams available</span>
                <span>{selectedTeams.size} selected</span>
              </div>
            </div>

            {/* Teams Grid/List */}
            <div className="flex-1 overflow-y-auto min-h-0">
              {isLoading ? (
                <div className="text-center py-8">
                  <Clock className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                  <p>Loading available teams...</p>
                </div>
              ) : filteredTeams.length === 0 ? (
                <div className="text-center py-8">
                  <AlertCircle className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                  <p>No teams found matching your criteria</p>
                </div>
              ) : (
                <div className={`${
                  viewMode === 'grid' 
                    ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' 
                    : 'space-y-2'
                }`}>
                  {filteredTeams.map((team) => (
                    <TeamCard
                      key={team.id}
                      team={team}
                      isSelected={selectedTeams.has(team.id)}
                      onToggle={() => handleTeamToggle(team.id)}
                    />
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="search" className="flex-1 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium">County</label>
                <Select value={selectedCounty} onValueChange={setSelectedCounty}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select county" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Counties</SelectItem>
                    {counties.map((county: any) => (
                      <SelectItem key={county.id} value={county.id}>
                        {county.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium">Sub County</label>
                <Select value={selectedSubCounty} onValueChange={setSelectedSubCounty}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select sub county" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sub Counties</SelectItem>
                    {subCounties
                      .filter((sc: any) => !selectedCounty || selectedCounty === "all" || sc.county_id === selectedCounty)
                      .map((subCounty: any) => (
                        <SelectItem key={subCounty.id} value={subCounty.id}>
                          {subCounty.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium">Ward</label>
                <Select value={selectedWard} onValueChange={setSelectedWard}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select ward" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Wards</SelectItem>
                    {wards
                      .filter((w: any) => !selectedSubCounty || selectedSubCounty === "all" || w.sub_county_id === selectedSubCounty)
                      .map((ward: any) => (
                        <SelectItem key={ward.id} value={ward.id}>
                          {ward.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="text-center">
              <Button onClick={() => setActiveTab('browse')}>
                View Filtered Results ({filteredTeams.length} teams)
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="selected" className="flex-1 flex flex-col overflow-y-auto min-h-0">
            {selectedTeams.size === 0 ? (
              <div className="text-center py-8">
                <Users className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                <p>No teams selected yet</p>
                <Button 
                  variant="outline" 
                  onClick={() => setActiveTab('browse')}
                  className="mt-2"
                >
                  Browse Teams
                </Button>
              </div>
            ) : (
              <div className="flex-1 flex flex-col space-y-4">
                <div className="text-sm text-muted-foreground">
                  {selectedTeams.size} team{selectedTeams.size > 1 ? 's' : ''} selected for registration
                </div>
                <div className="flex-1 overflow-y-auto min-h-0 space-y-2">
                  {Array.from(selectedTeams).map(teamId => {
                    const team = enhancedTeams.find(t => t.id === teamId);
                    if (!team) return null;
                    
                    return (
                      <Card key={teamId} className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <Avatar className="w-8 h-8">
                              <AvatarImage src={team.logo_url} />
                              <AvatarFallback className="text-xs">
                                {team.name.substring(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-sm">{team.name}</p>
                              {team.club_name && (
                                <p className="text-xs text-muted-foreground">{team.club_name}</p>
                              )}
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleTeamToggle(teamId)}
                          >
                            Remove
                          </Button>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>

        <DialogFooter className="flex items-center justify-between flex-shrink-0 mt-4 border-t pt-4">
          <div className="text-sm text-muted-foreground">
            {selectedTeams.size} of {filteredTeams.length} teams selected
          </div>
          <div className="space-x-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleRegister}
              disabled={selectedTeams.size === 0 || registerTeam.isPending}
            >
              {registerTeam.isPending ? 'Registering...' : `Register ${selectedTeams.size} Team${selectedTeams.size > 1 ? 's' : ''}`}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SeamlessTeamSelector;