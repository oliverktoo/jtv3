import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Checkbox } from "./ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "./ui/dialog";
import { 
  Users, 
  Search, 
  Filter, 
  MapPin, 
  CheckCircle2, 
  Plus, 
  Zap,
  AlertTriangle,
  Mail,
  Phone
} from "lucide-react";
import { useEligibleTeamsForTournament, useRegisterTeamForTournament } from "../hooks/useTournamentTeams";
import { useCounties } from "../hooks/useReferenceData";
import { toast } from "../hooks/use-toast";

interface BulkTeamRegistrationProps {
  tournamentId: string;
  tournamentName: string;
  onTeamsRegistered: () => void;
}

export function BulkTeamRegistration({ 
  tournamentId, 
  tournamentName, 
  onTeamsRegistered 
}: BulkTeamRegistrationProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCounty, setSelectedCounty] = useState<string>("");
  const [selectedTeams, setSelectedTeams] = useState<Set<string>>(new Set());
  const [registrationData, setRegistrationData] = useState({
    coachName: "",
    squadSize: 22,
    jerseyColors: "",
    notes: "",
  });
  const [isRegistering, setIsRegistering] = useState(false);

  const { data: counties = [] } = useCounties();
  const { data: eligibleTeams = [], isLoading } = useEligibleTeamsForTournament(tournamentId);
  const { mutate: registerTeam } = useRegisterTeamForTournament();

  // Filter teams based on search term and county
  const filteredTeams = eligibleTeams.filter((team: any) => {
    const matchesSearch = team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         team.club_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         "";
    
    const matchesCounty = !selectedCounty || team.county_id === selectedCounty;
    
    return matchesSearch && matchesCounty;
  });

  const handleToggleTeam = (teamId: string) => {
    const newSelected = new Set(selectedTeams);
    if (newSelected.has(teamId)) {
      newSelected.delete(teamId);
    } else {
      newSelected.add(teamId);
    }
    setSelectedTeams(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedTeams.size === filteredTeams.length) {
      setSelectedTeams(new Set());
    } else {
      setSelectedTeams(new Set(filteredTeams.map(team => team.id)));
    }
  };

  const handleBulkRegister = async () => {
    if (selectedTeams.size === 0) {
      toast({
        title: "No Teams Selected",
        description: "Please select at least one team to register.",
        variant: "destructive",
      });
      return;
    }

    setIsRegistering(true);
    const teamsArray = Array.from(selectedTeams);
    let successCount = 0;
    let errorCount = 0;
    const errors: string[] = [];

    // Register teams one by one
    for (const teamId of teamsArray) {
      const team = eligibleTeams.find(t => t.id === teamId);
      if (!team) continue;

      try {
        await new Promise((resolve, reject) => {
          registerTeam({
            teamId,
            tournamentId,
            representingOrgId: team.org_id,
            registrationStatus: "SUBMITTED",
            coachName: registrationData.coachName || undefined,
            squadSize: registrationData.squadSize || 22,
            jerseyColors: registrationData.jerseyColors || undefined,
            notes: registrationData.notes || undefined,
          }, {
            onSuccess: resolve,
            onError: (error: any) => {
              errors.push(`${team.name}: ${error.message || 'Unknown error'}`);
              reject(error);
            },
          });
        });
        successCount++;
      } catch (error) {
        errorCount++;
        console.error(`Failed to register team ${team.name}:`, error);
      }
    }

    setIsRegistering(false);

    // Show result
    if (successCount > 0) {
      toast({
        title: "Bulk Registration Complete!",
        description: `Successfully registered ${successCount} team${successCount > 1 ? 's' : ''} for ${tournamentName}${errorCount > 0 ? `. ${errorCount} failed.` : ''}`,
      });
    }

    if (errorCount > 0 && successCount === 0) {
      toast({
        title: "Bulk Registration Failed",
        description: `Failed to register all ${errorCount} selected teams. Check team eligibility and try again.`,
        variant: "destructive",
      });
    }

    // Reset and close
    setSelectedTeams(new Set());
    setIsOpen(false);
    onTeamsRegistered();
  };

  const getTeamStatusBadge = (team: any) => {
    if (!team.ward_id) {
      return <Badge variant="destructive">No Ward</Badge>;
    }
    return <Badge variant="secondary">Eligible</Badge>;
  };

  const selectedTeamsList = Array.from(selectedTeams).map(id => 
    eligibleTeams.find(team => team.id === id)
  ).filter(Boolean);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <Users className="h-4 w-4" />
          Bulk Register Teams
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-6xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Bulk Team Registration
            <Badge variant="outline">{tournamentName}</Badge>
          </DialogTitle>
          <DialogDescription>
            Select multiple teams to register for this tournament at once. 
            All teams will use the same registration details.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto min-h-0">
          <div className="grid grid-cols-3 gap-6">
            {/* Left Panel - Filters and Search */}
            <div className="space-y-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Filters</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Search */}
                  <div>
                    <Label htmlFor="search">Search Teams</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="search"
                        placeholder="Search teams..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  {/* County Filter */}
                  <div>
                    <Label htmlFor="county">Filter by County</Label>
                    <Select value={selectedCounty} onValueChange={setSelectedCounty}>
                      <SelectTrigger>
                        <SelectValue placeholder="All Counties" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All Counties</SelectItem>
                        {counties.map((county: any) => (
                          <SelectItem key={county.id} value={county.id}>
                            {county.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Selection Summary */}
                  <div className="pt-2 border-t">
                    <div className="flex items-center justify-between text-sm">
                      <span>Teams selected:</span>
                      <Badge>{selectedTeams.size}</Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm mt-1">
                      <span>Available:</span>
                      <Badge variant="outline">{filteredTeams.length}</Badge>
                    </div>
                  </div>

                  {/* Select All */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSelectAll}
                    className="w-full"
                    disabled={filteredTeams.length === 0}
                  >
                    {selectedTeams.size === filteredTeams.length ? 'Deselect All' : 'Select All'}
                  </Button>
                </CardContent>
              </Card>

              {/* Registration Details */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Registration Details</CardTitle>
                  <p className="text-xs text-muted-foreground">
                    Applied to all selected teams
                  </p>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <Label htmlFor="coachName">Coach Name</Label>
                    <Input
                      id="coachName"
                      placeholder="Head coach"
                      value={registrationData.coachName}
                      onChange={(e) => setRegistrationData(prev => ({ ...prev, coachName: e.target.value }))}
                    />
                  </div>

                  <div>
                    <Label htmlFor="squadSize">Squad Size</Label>
                    <Input
                      id="squadSize"
                      type="number"
                      min="11"
                      max="30"
                      value={registrationData.squadSize}
                      onChange={(e) => setRegistrationData(prev => ({ ...prev, squadSize: parseInt(e.target.value) || 22 }))}
                    />
                  </div>

                  <div>
                    <Label htmlFor="jerseyColors">Jersey Colors</Label>
                    <Input
                      id="jerseyColors"
                      placeholder="Home: Blue, Away: White"
                      value={registrationData.jerseyColors}
                      onChange={(e) => setRegistrationData(prev => ({ ...prev, jerseyColors: e.target.value }))}
                    />
                  </div>

                  <div>
                    <Label htmlFor="notes">Notes</Label>
                    <Input
                      id="notes"
                      placeholder="Special requirements"
                      value={registrationData.notes}
                      onChange={(e) => setRegistrationData(prev => ({ ...prev, notes: e.target.value }))}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Middle Panel - Available Teams */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">Available Teams</h3>
                <Badge variant="outline">{filteredTeams.length} teams</Badge>
              </div>
              
              <div className="space-y-2 border rounded-lg p-2">
                {isLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin h-6 w-6 border-b-2 border-primary mx-auto"></div>
                    <p className="text-sm text-muted-foreground mt-2">Loading teams...</p>
                  </div>
                ) : filteredTeams.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="h-8 w-8 mx-auto mb-2" />
                    <p className="text-sm">No eligible teams found</p>
                  </div>
                ) : (
                  filteredTeams.map((team: any) => (
                    <Card 
                      key={team.id}
                      className={`cursor-pointer transition-all p-3 ${
                        selectedTeams.has(team.id) 
                          ? 'border-primary bg-primary/5' 
                          : 'hover:border-primary/50'
                      }`}
                      onClick={() => handleToggleTeam(team.id)}
                    >
                      <div className="flex items-start gap-3">
                        <Checkbox
                          checked={selectedTeams.has(team.id)}
                          onChange={() => handleToggleTeam(team.id)}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium text-sm truncate">{team.name}</h4>
                            {getTeamStatusBadge(team)}
                          </div>
                          {team.club_name && (
                            <p className="text-xs text-muted-foreground">{team.club_name}</p>
                          )}
                          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                            <MapPin className="h-3 w-3" />
                            <span>{team.county_name || 'County not set'}</span>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </div>

            {/* Right Panel - Selected Teams */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">Selected Teams</h3>
                <Badge className="bg-primary">{selectedTeams.size} selected</Badge>
              </div>

              <div className="space-y-2 border rounded-lg p-2 bg-muted/30">
                {selectedTeamsList.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <CheckCircle2 className="h-8 w-8 mx-auto mb-2" />
                    <p className="text-sm">No teams selected</p>
                    <p className="text-xs">Select teams from the list</p>
                  </div>
                ) : (
                  selectedTeamsList.map((team: any) => (
                    <Card key={team.id} className="p-3 bg-white border-primary/20">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-sm">{team.name}</h4>
                          {team.club_name && (
                            <p className="text-xs text-muted-foreground">{team.club_name}</p>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleTeam(team.id)}
                          className="h-6 w-6 p-0"
                        >
                          ×
                        </Button>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="border-t pt-4 mt-4 flex-shrink-0">
          <div className="flex items-center justify-between w-full">
            <div className="text-sm text-muted-foreground">
              {selectedTeams.size > 0 && (
                <span>{selectedTeams.size} team{selectedTeams.size > 1 ? 's' : ''} will be registered</span>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setIsOpen(false)}
                disabled={isRegistering}
              >
                Cancel
              </Button>
              <Button
                onClick={handleBulkRegister}
                disabled={selectedTeams.size === 0 || isRegistering}
                className="flex items-center gap-2"
              >
                {isRegistering ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-b-2 border-white rounded-full"></div>
                    Registering {selectedTeams.size} teams...
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4" />
                    Register {selectedTeams.size} Team{selectedTeams.size > 1 ? 's' : ''}
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}