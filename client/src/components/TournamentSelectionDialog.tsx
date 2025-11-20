import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { ScrollArea } from "./ui/scroll-area";
import { 
  MapPin, 
  Users, 
  Calendar, 
  Trophy, 
  Search, 
  Filter,
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus,
  ArrowRight
} from "lucide-react";
import { useTournaments, useAllTournaments } from "../hooks/useTournaments";
import { useRegisterTeamForTournament } from "../hooks/useTournamentTeams";
import { toast } from "../hooks/use-toast";

interface TournamentSelectionDialogProps {
  team: any;
  isOpen: boolean;
  onClose: () => void;
  onTeamRegistered: () => void;
}

export function TournamentSelectionDialog({ 
  team, 
  isOpen, 
  onClose, 
  onTeamRegistered 
}: TournamentSelectionDialogProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedTournament, setSelectedTournament] = useState<any>(null);
  const [registrationData, setRegistrationData] = useState({
    coachName: "",
    squadSize: 22,
    jerseyColors: "",
    notes: "",
  });
  const [step, setStep] = useState<'select' | 'register'>('select');

  // For independent teams (no org_id), get all tournaments; for affiliated teams, get org-specific tournaments
  const isIndependentTeam = !team?.org_id;
  const { data: orgTournaments = [], isLoading: orgLoading } = useTournaments(team?.org_id || "", { enabled: !isIndependentTeam });
  const { data: allTournaments = [], isLoading: allLoading } = useAllTournaments({ enabled: isIndependentTeam });
  
  // Use appropriate tournament list based on team type
  const tournaments = isIndependentTeam ? allTournaments : orgTournaments;
  const isLoading = isIndependentTeam ? allLoading : orgLoading;
  const { mutate: registerTeam, isPending: isRegistering } = useRegisterTeamForTournament();

  // Basic eligibility check
  function checkTournamentEligibility(tournament: any, team: any): boolean {
    if (!team?.ward_id) return false; // Ward registration is mandatory
    
    // Geographic tournaments
    if (tournament.participation_model === 'GEOGRAPHIC') {
      if (tournament.ward_id) {
        return team.ward_id === tournament.ward_id;
      } else if (tournament.sub_county_id) {
        return team.sub_county_id === tournament.sub_county_id;
      } else if (tournament.county_id) {
        return team.county_id === tournament.county_id;
      }
    }
    
    // Organizational tournaments - only for teams in that specific organization
    if (tournament.participation_model === 'ORGANIZATIONAL') {
      return team.org_id && team.org_id === tournament.org_id;
    }
    
    // Open tournaments - all teams with ward registration are eligible (including independent teams)
    // Geographic tournaments - already handled above
    return true;
  }

  // Filter tournaments based on search and status
  const filteredTournaments = Array.isArray(tournaments) ? tournaments.filter((tournament: any) => {
    const matchesSearch = tournament.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tournament.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         "";
    
    const matchesStatus = statusFilter === "all" || 
                         tournament.status?.toLowerCase() === statusFilter;
    
    // Check if team is eligible (basic geographic check)
    const isEligible = checkTournamentEligibility(tournament, team);
    
    return matchesSearch && matchesStatus && isEligible;
  }) : [];

  const handleSelectTournament = (tournament: any) => {
    setSelectedTournament(tournament);
    setStep('register');
  };

  const handleBackToSelection = () => {
    setStep('select');
    setSelectedTournament(null);
  };

  const handleRegisterTeam = () => {
    if (!selectedTournament || !team) return;

    registerTeam({
      teamId: team.id,
      tournamentId: selectedTournament.id,
      representingOrgId: team.org_id,
      affiliationId: null, // No specific affiliation for basic registration
      registrationStatus: "SUBMITTED",
      coachName: registrationData.coachName || undefined,
      squadSize: registrationData.squadSize || 22,
      jerseyColors: registrationData.jerseyColors || undefined,
      notes: registrationData.notes || undefined,
    }, {
      onSuccess: () => {
        toast({
          title: "Team Registered Successfully!",
          description: `${team.name} has been registered for ${selectedTournament.name}`,
        });
        onClose();
        onTeamRegistered();
        // Reset state
        setStep('select');
        setSelectedTournament(null);
        setRegistrationData({
          coachName: "",
          squadSize: 22,
          jerseyColors: "",
          notes: "",
        });
      },
      onError: (error: any) => {
        toast({
          title: "Registration Failed",
          description: error.message || "Failed to register team",
          variant: "destructive",
        });
      },
    });
  };

  const getTournamentStatusBadge = (tournament: any) => {
    const status = tournament.status?.toLowerCase() || 'draft';
    const statusColors = {
      draft: "bg-gray-100 text-gray-800",
      active: "bg-green-100 text-green-800",
      completed: "bg-blue-100 text-blue-800",
      cancelled: "bg-red-100 text-red-800",
    };

    return (
      <Badge className={statusColors[status as keyof typeof statusColors] || statusColors.draft}>
        {tournament.status || 'Draft'}
      </Badge>
    );
  };

  const getParticipationModelBadge = (tournament: any) => {
    const model = tournament.participation_model?.toLowerCase() || 'open';
    const modelColors = {
      geographic: "bg-blue-100 text-blue-800",
      organizational: "bg-purple-100 text-purple-800",
      open: "bg-green-100 text-green-800",
    };

    const modelLabels = {
      geographic: "Geographic",
      organizational: "Organizational",
      open: "Open Registration",
    };

    return (
      <Badge className={modelColors[model as keyof typeof modelColors] || modelColors.open}>
        {modelLabels[model as keyof typeof modelLabels] || 'Open'}
      </Badge>
    );
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[95vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-amber-600" />
            {step === 'select' ? 'Select Tournament' : 'Register Team'}
            {team && (
              <Badge variant="outline" className="ml-auto">
                {team.name}
              </Badge>
            )}
          </DialogTitle>
          <DialogDescription>
            {step === 'select' ? (
              <>Choose a tournament to register <strong>{team?.name}</strong> for. Only eligible tournaments are shown.</>
            ) : (
              <>Complete registration details for <strong>{team?.name}</strong> in <strong>{selectedTournament?.name}</strong></>
            )}
          </DialogDescription>
        </DialogHeader>

        {step === 'select' ? (
          <div className="flex-1 space-y-4">
            {/* Search and Filter Controls */}
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search tournaments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Tournament List */}
            <ScrollArea className="flex-1 max-h-[55vh] sm:max-h-[60vh] lg:max-h-[65vh] overflow-y-auto">
              <div className="space-y-3 pr-6 pb-6">
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <p className="text-muted-foreground mt-2">Loading tournaments...</p>
                </div>
              ) : filteredTournaments.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed rounded-lg">
                  <Trophy className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Eligible Tournaments</h3>
                  <p className="text-muted-foreground mb-4">
                    There are no tournaments available that this team is eligible for.
                  </p>
                  {!team?.ward_id && (
                    <p className="text-sm text-red-600">
                      <AlertCircle className="inline h-4 w-4 mr-1" />
                      Team must have ward registration to participate in tournaments.
                    </p>
                  )}
                </div>
              ) : (
                filteredTournaments.map((tournament: any) => (
                  <Card key={tournament.id} className="cursor-pointer hover:shadow-md transition-shadow border-l-4 border-l-primary/20 hover:border-l-primary">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-lg truncate">{tournament.name}</h3>
                            {getTournamentStatusBadge(tournament)}
                            {getParticipationModelBadge(tournament)}
                          </div>
                          
                          {tournament.description && (
                            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                              {tournament.description}
                            </p>
                          )}
                          
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Calendar className="h-4 w-4" />
                              <span>
                                {tournament.start_date ? 
                                  new Date(tournament.start_date).toLocaleDateString() : 
                                  'Date TBD'
                                }
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Users className="h-4 w-4" />
                              <span>{tournament.max_teams || 'Unlimited'} teams max</span>
                            </div>
                            {tournament.county_name && (
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <MapPin className="h-4 w-4" />
                                <span>{tournament.county_name}</span>
                              </div>
                            )}
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Clock className="h-4 w-4" />
                              <span>Model: {tournament.tournament_model || 'Standard'}</span>
                            </div>
                          </div>
                        </div>
                        
                        <Button
                          onClick={() => handleSelectTournament(tournament)}
                          className="ml-4 flex-shrink-0"
                          size="sm"
                        >
                          Select
                          <ArrowRight className="h-4 w-4 ml-1" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
              </div>
            </ScrollArea>
          </div>
        ) : (
          /* Registration Step */
          <div className="flex-1 space-y-6">
            {/* Tournament Summary */}
            <Card className="border-l-4 border-l-primary">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Tournament Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium">{selectedTournament?.name}</span>
                  {getTournamentStatusBadge(selectedTournament)}
                </div>
                <div className="text-sm text-muted-foreground">
                  {selectedTournament?.description}
                </div>
                <div className="flex gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {selectedTournament?.start_date ? 
                      new Date(selectedTournament.start_date).toLocaleDateString() : 
                      'Date TBD'
                    }
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    {selectedTournament?.max_teams || 'Unlimited'} teams
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Registration Form */}
            <ScrollArea className="flex-1 max-h-[45vh] sm:max-h-[50vh] lg:max-h-[55vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4 pr-6 pb-6">
              <div className="space-y-2">
                <Label htmlFor="coachName">Coach Name</Label>
                <Input
                  id="coachName"
                  placeholder="Head coach name"
                  value={registrationData.coachName}
                  onChange={(e) => setRegistrationData(prev => ({ ...prev, coachName: e.target.value }))}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="squadSize">Squad Size</Label>
                <Input
                  id="squadSize"
                  type="number"
                  min="11"
                  max="30"
                  placeholder="22"
                  value={registrationData.squadSize}
                  onChange={(e) => setRegistrationData(prev => ({ ...prev, squadSize: parseInt(e.target.value) || 22 }))}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="jerseyColors">Jersey Colors</Label>
                <Input
                  id="jerseyColors"
                  placeholder="Home: Blue, Away: White"
                  value={registrationData.jerseyColors}
                  onChange={(e) => setRegistrationData(prev => ({ ...prev, jerseyColors: e.target.value }))}
                />
              </div>
              
              <div className="space-y-2 col-span-1">
                <Label htmlFor="notes">Additional Notes</Label>
                <Input
                  id="notes"
                  placeholder="Special requirements or notes"
                  value={registrationData.notes}
                  onChange={(e) => setRegistrationData(prev => ({ ...prev, notes: e.target.value }))}
                />
              </div>
              </div>
            </ScrollArea>

            {/* Action Buttons */}
            <div className="flex justify-between pt-4 border-t">
              <Button 
                variant="outline" 
                onClick={handleBackToSelection}
                disabled={isRegistering}
              >
                Back to Tournaments
              </Button>
              
              <Button 
                onClick={handleRegisterTeam}
                disabled={isRegistering}
                className="flex items-center gap-2"
              >
                {isRegistering ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-b-2 border-white rounded-full"></div>
                    Registering...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    Register Team
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}