import React, { useState, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { 
  Search, 
  ChevronDown, 
  Check, 
  Users, 
  Building2,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { cn } from "@/lib/utils";
import { useTeamsSearch, type TeamSearchResult } from "@/hooks/useTeamsSearch";

export interface TeamDropdownProps {
  value?: string;
  onValueChange: (teamId: string) => void;
  placeholder?: string;
  orgId?: string;
  disabled?: boolean;
  error?: string;
  className?: string;
}

export function TeamSearchDropdown({
  value,
  onValueChange,
  placeholder = "Select a team...",
  orgId,
  disabled = false,
  error,
  className
}: TeamDropdownProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch teams with search
  const { 
    data: teamsResponse, 
    isLoading, 
    error: fetchError 
  } = useTeamsSearch(searchQuery, orgId, true);

  const teams = teamsResponse?.data || [];

  // Find selected team
  const selectedTeam = useMemo(() => {
    return teams.find(team => team.id === value);
  }, [teams, value]);

  const handleSelect = (teamId: string) => {
    onValueChange(teamId);
    setOpen(false);
    setSearchQuery(''); // Clear search after selection
  };

  // Format team display name
  const formatTeamName = (team: TeamSearchResult) => {
    const parts = [];
    
    if (team.name) parts.push(team.name);
    if (team.club_name && team.club_name !== team.name) parts.push(`(${team.club_name})`);
    
    return parts.join(' ') || 'Unnamed Team';
  };

  // Get team affiliation info
  const getTeamAffiliation = (team: TeamSearchResult) => {
    if (team.organizations?.name) {
      return team.organizations.name;
    }
    if (team.org_id) {
      return 'Organization Team';
    }
    return 'Independent Team';
  };

  return (
    <div className={cn("space-y-2", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            disabled={disabled}
            className={cn(
              "w-full justify-between h-auto min-h-[2.5rem] px-3 py-2",
              error && "border-red-500 focus-visible:ring-red-500",
              !value && "text-muted-foreground"
            )}
          >
            <div className="flex items-center gap-2 flex-1 text-left">
              <Users className="h-4 w-4 flex-shrink-0" />
              {selectedTeam ? (
                <div className="flex flex-col gap-0.5 min-w-0">
                  <span className="font-medium truncate">
                    {formatTeamName(selectedTeam)}
                  </span>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Building2 className="h-3 w-3" />
                    {getTeamAffiliation(selectedTeam)}
                  </span>
                </div>
              ) : (
                <span>{placeholder}</span>
              )}
            </div>
            <ChevronDown className="h-4 w-4 opacity-50 flex-shrink-0" />
          </Button>
        </PopoverTrigger>
        
        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <div className="flex items-center border-b px-3">
              <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
              <CommandInput
                placeholder="Search teams..."
                value={searchQuery}
                onValueChange={setSearchQuery}
                className="flex-1"
              />
            </div>
            
            <CommandList>
              {/* Loading State */}
              {isLoading && (
                <div className="flex items-center justify-center py-6 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Searching teams...
                </div>
              )}
              
              {/* Error State */}
              {fetchError && (
                <div className="flex items-center justify-center py-6 text-sm text-red-600">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  Failed to load teams
                </div>
              )}
              
              {/* Empty State */}
              {!isLoading && !fetchError && teams.length === 0 && (
                <CommandEmpty>
                  {searchQuery ? (
                    <div className="py-6 text-center text-sm">
                      <Users className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      No teams found matching "{searchQuery}"
                    </div>
                  ) : (
                    <div className="py-6 text-center text-sm">
                      <Users className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      No teams available
                    </div>
                  )}
                </CommandEmpty>
              )}
              
              {/* Teams List */}
              {!isLoading && teams.length > 0 && (
                <CommandGroup>
                  {teams.map((team) => (
                    <CommandItem
                      key={team.id}
                      value={team.id}
                      onSelect={() => handleSelect(team.id)}
                      className="flex items-center gap-2 py-2"
                    >
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        {/* Team Avatar/Logo */}
                        <div className="flex-shrink-0">
                          {team.logo_url ? (
                            <img
                              src={team.logo_url}
                              alt={`${team.name} logo`}
                              className="h-8 w-8 rounded object-cover"
                              onError={(e) => {
                                // Fallback to icon if image fails
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          ) : (
                            <div className="h-8 w-8 rounded bg-muted flex items-center justify-center">
                              <Users className="h-4 w-4 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                        
                        {/* Team Info */}
                        <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                          <span className="font-medium truncate">
                            {formatTeamName(team)}
                          </span>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Building2 className="h-3 w-3" />
                            {getTeamAffiliation(team)}
                          </span>
                        </div>
                        
                        {/* Selection Indicator */}
                        <Check
                          className={cn(
                            "h-4 w-4 flex-shrink-0",
                            value === team.id ? "opacity-100" : "opacity-0"
                          )}
                        />
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      
      {/* Error Message */}
      {error && (
        <p className="text-sm text-red-600 flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          {error}
        </p>
      )}
    </div>
  );
}