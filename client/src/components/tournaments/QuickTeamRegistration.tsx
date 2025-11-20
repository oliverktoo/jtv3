import React, { useState } from 'react';
import { Plus, Zap, Users, Search, X } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useToast } from '@/hooks/use-toast';
import { useAvailableTeamsForTournament, useRegisterTeamForTournament } from '@/hooks/useTeamRegistrations';

interface QuickTeamRegistrationProps {
  tournamentId: string;
  orgId: string;
  onTeamRegistered?: (teamId: string) => void;
  className?: string;
}

export const QuickTeamRegistration: React.FC<QuickTeamRegistrationProps> = ({
  tournamentId,
  orgId,
  onTeamRegistered,
  className = ""
}) => {
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  
  const { toast } = useToast();
  const { data: availableTeams = [], isLoading } = useAvailableTeamsForTournament(tournamentId, orgId);
  const registerTeam = useRegisterTeamForTournament();

  const handleQuickRegister = async (teamId: string, teamName: string) => {
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

      toast({
        title: "Team registered!",
        description: `${teamName} has been registered for the tournament`,
      });

      onTeamRegistered?.(teamId);
      setOpen(false);
      setSearchValue("");
    } catch (error: any) {
      toast({
        title: "Registration failed",
        description: error.message || "Failed to register team",
        variant: "destructive"
      });
    }
  };

  if (availableTeams.length === 0) {
    return (
      <Card className={`border-dashed bg-muted/30 ${className}`}>
        <CardContent className="flex items-center justify-center py-6">
          <div className="text-center">
            <Users className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">No teams available for registration</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`border-dashed bg-gradient-to-r from-primary/5 to-blue-500/5 hover:shadow-md transition-shadow ${className}`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Zap className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">Quick Register</span>
            <Badge variant="secondary" className="text-xs">
              {availableTeams.length} available
            </Badge>
          </div>
        </div>
        
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button 
              variant="outline" 
              className="w-full justify-start text-left font-normal"
              disabled={isLoading}
            >
              <Search className="w-4 h-4 mr-2 text-muted-foreground" />
              {isLoading ? "Loading teams..." : "Search and register team..."}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0" align="start">
            <Command>
              <div className="flex items-center border-b px-3">
                <CommandInput 
                  placeholder="Search teams..." 
                  value={searchValue}
                  onValueChange={setSearchValue}
                  className="flex-1"
                />
                {searchValue && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSearchValue("")}
                    className="h-8 w-8 p-0 shrink-0"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                )}
              </div>
              <CommandList>
                <CommandEmpty>No teams found.</CommandEmpty>
                <CommandGroup heading="Available Teams">
                  {availableTeams.map((team: any) => (
                    <CommandItem
                      key={team.id}
                      onSelect={() => handleQuickRegister(team.id, team.name)}
                      className="cursor-pointer"
                    >
                      <div className="flex items-center space-x-3 flex-1">
                        <Avatar className="w-6 h-6">
                          <AvatarImage src={team.logo_url} />
                          <AvatarFallback className="text-xs bg-primary/10">
                            {team.name.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{team.name}</p>
                          {team.club_name && (
                            <p className="text-xs text-muted-foreground truncate">
                              {team.club_name}
                            </p>
                          )}
                        </div>
                        <Plus className="w-4 h-4 text-muted-foreground" />
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        <p className="text-xs text-muted-foreground mt-2">
          Click to instantly register a team with default settings
        </p>
      </CardContent>
    </Card>
  );
};

export default QuickTeamRegistration;