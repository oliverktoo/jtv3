import React, { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Card, CardContent } from "./ui/card";
import { 
  Plus, 
  Search, 
  MapPin, 
  Users, 
  CheckCircle2, 
  AlertCircle,
  Trophy,
  Zap
} from "lucide-react";
import { useEligibleTeamsForTournament, useRegisterTeamForTournament } from "../hooks/useTournamentTeams";
import { toast } from "../hooks/use-toast";

interface QuickTeamAdditionProps {
  tournamentId: string;
  tournamentName: string;
  onTeamAdded?: () => void;
  trigger?: React.ReactNode;
  disabled?: boolean;
}

export function QuickTeamAddition({ 
  tournamentId, 
  tournamentName, 
  onTeamAdded, 
  trigger,
  disabled = false
}: QuickTeamAdditionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTeams, setSelectedTeams] = useState<Set<string>>(new Set());

  const { data: eligibleTeams = [], isLoading } = useEligibleTeamsForTournament(tournamentId);
  const { mutate: registerTeam, isPending: isRegistering } = useRegisterTeamForTournament();

  // Filter teams based on search term
  const filteredTeams = eligibleTeams.filter((team: any) =>
    team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    team.club_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    team.county_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ""
  );

  const handleToggleTeam = (teamId: string) => {
    const newSelected = new Set(selectedTeams);
    if (newSelected.has(teamId)) {
      newSelected.delete(teamId);
    } else {
      newSelected.add(teamId);
    }
    setSelectedTeams(newSelected);
  };

  const handleRegisterSelectedTeams = async () => {
    if (selectedTeams.size === 0) {
      toast({
        title: "No Teams Selected",
        description: "Please select at least one team to register.",
        variant: "destructive",
      });
      return;
    }

    const teamsArray = Array.from(selectedTeams);
    let successCount = 0;
    let errorCount = 0;

    // Register teams one by one
    for (const teamId of teamsArray) {
      try {
        await new Promise((resolve, reject) => {
          registerTeam({
            teamId,
            tournamentId,
            representingOrgId: eligibleTeams.find(t => t.id === teamId)?.org_id,
            registrationStatus: "SUBMITTED",
            squadSize: 22,
          }, {
            onSuccess: resolve,
            onError: reject,
          });
        });
        successCount++;
      } catch (error) {
        errorCount++;
        console.error(`Failed to register team ${teamId}:`, error);
      }
    }

    // Show result toast
    if (successCount > 0) {
      toast({
        title: "Teams Registered!",
        description: `Successfully registered ${successCount} team${successCount > 1 ? 's' : ''} for ${tournamentName}${errorCount > 0 ? `. ${errorCount} failed.` : ''}`,
      });
    }

    if (errorCount > 0 && successCount === 0) {
      toast({
        title: "Registration Failed",
        description: `Failed to register ${errorCount} team${errorCount > 1 ? 's' : ''}. Please try again.`,
        variant: "destructive",
      });
    }

    // Reset state and close
    setSelectedTeams(new Set());
    setIsOpen(false);
    onTeamAdded?.();
  };

  const defaultTrigger = (
    <Button
      variant="outline"
      size="sm"
      className="flex items-center gap-2"
      disabled={disabled}
    >
      <Zap className="h-4 w-4" />
      Quick Add Teams
    </Button>
  );

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        {trigger || defaultTrigger}
      </SheetTrigger>
      <SheetContent className="w-[600px] sm:max-w-[600px]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            Quick Team Addition
          </SheetTitle>
          <SheetDescription>
            Quickly add eligible teams to <strong>{tournamentName}</strong>. 
            Select multiple teams and register them all at once.
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-4 mt-6">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search teams by name, club, or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Selection Summary */}
          {selectedTeams.size > 0 && (
            <div className="flex items-center justify-between p-3 bg-primary/10 rounded-lg border border-primary/20">
              <div className="flex items-center gap-2 text-sm font-medium">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                {selectedTeams.size} team{selectedTeams.size > 1 ? 's' : ''} selected
              </div>
              <Button
                onClick={handleRegisterSelectedTeams}
                disabled={isRegistering}
                size="sm"
                className="flex items-center gap-2"
              >
                {isRegistering ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-b-2 border-white rounded-full"></div>
                    Registering...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4" />
                    Register Teams
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Teams List */}
          <div className="max-h-96 overflow-y-auto space-y-2">
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="text-muted-foreground mt-2">Loading eligible teams...</p>
              </div>
            ) : filteredTeams.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed rounded-lg">
                <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No Eligible Teams</h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm ? 
                    'No teams match your search criteria.' :
                    'There are no teams available for quick registration.'
                  }
                </p>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>• Teams must have ward registration</p>
                  <p>• Teams must meet tournament geographic requirements</p>
                  <p>• Teams cannot already be registered</p>
                </div>
              </div>
            ) : (
              filteredTeams.map((team: any) => (
                <Card 
                  key={team.id} 
                  className={`cursor-pointer transition-all border-l-4 ${
                    selectedTeams.has(team.id) 
                      ? 'border-l-primary bg-primary/5 shadow-md' 
                      : 'border-l-gray-200 hover:border-l-primary/50 hover:shadow-sm'
                  }`}
                  onClick={() => handleToggleTeam(team.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            selectedTeams.has(team.id)
                              ? 'border-primary bg-primary'
                              : 'border-gray-300'
                          }`}>
                            {selectedTeams.has(team.id) && (
                              <CheckCircle2 className="h-3 w-3 text-white" />
                            )}
                          </div>
                          <h3 className="font-semibold truncate">{team.name}</h3>
                          {team.club_name && (
                            <Badge variant="outline" className="text-xs">
                              {team.club_name}
                            </Badge>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            <span className="truncate">
                              {team.county_name || team.sub_county_name || team.ward_name || 'Location not set'}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            <span>Max: {team.max_players || 22}</span>
                          </div>
                        </div>

                        {team.contact_email && (
                          <div className="text-xs text-muted-foreground mt-1 truncate">
                            📧 {team.contact_email}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Footer Actions */}
          <div className="flex justify-between items-center pt-4 border-t">
            <div className="text-sm text-muted-foreground">
              {filteredTeams.length} eligible team{filteredTeams.length !== 1 ? 's' : ''} available
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
                onClick={() => setSelectedTeams(new Set(filteredTeams.map(t => t.id)))}
                variant="secondary"
                size="sm"
                disabled={filteredTeams.length === 0 || isRegistering}
              >
                Select All
              </Button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}