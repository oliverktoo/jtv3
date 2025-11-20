import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Users, 
  Plus, 
  Edit, 
  Trash2, 
  UserPlus, 
  UserMinus, 
  Shuffle, 
  Target
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useQueryClient } from '@tanstack/react-query';
import { useTeamRegistrations } from '@/hooks/useTeamRegistrations';
import { 
  useTournamentGroups, 
  useTournamentTeamGroups, 
  useCreateGroup, 
  useUpdateGroup, 
  useDeleteGroup, 
  useAssignTeamToGroup, 
  useRemoveTeamFromGroup, 
  useAutoAssignTeams 
} from '@/hooks/useGroups';

interface TeamGroupManagerProps {
  tournamentId: string;
}

interface Group {
  id: string;
  name: string;
  seq: number;
  stageId?: string;
  divisionId?: string;
  venue?: string;
  createdAt: string;
}

interface TeamGroup {
  id: string;
  teamId: string;
  groupId: string;
  team?: {
    id: string;
    name: string;
    club_name?: string;
    logo_url?: string;
  };
}

interface Team {
  id: string;
  name: string;
  club_name?: string;
  logo_url?: string;
}

export const TeamGroupManager: React.FC<TeamGroupManagerProps> = ({ tournamentId }) => {
  const [activeTab, setActiveTab] = useState('groups');
  const [isCreateGroupDialogOpen, setIsCreateGroupDialogOpen] = useState(false);
  const [isEditGroupDialogOpen, setIsEditGroupDialogOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupVenue, setNewGroupVenue] = useState('');
  const [editGroupName, setEditGroupName] = useState('');
  const [editGroupVenue, setEditGroupVenue] = useState('');
  const [autoAssignMode, setAutoAssignMode] = useState<'random' | 'balanced' | 'manual'>('manual');
  const [selectedTeams, setSelectedTeams] = useState<string[]>([]);
  const [venues, setVenues] = useState<any[]>([]);
  const [venuesLoading, setVenuesLoading] = useState(false);
  
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Get registered teams for this tournament
  const { data: registeredTeamsData = [] } = useTeamRegistrations(tournamentId);
  const registeredTeams = Array.isArray(registeredTeamsData) ? registeredTeamsData : [];

  // Get existing groups
  const { data: groups = [], isLoading: groupsLoading } = useTournamentGroups(tournamentId);
  
  // Debug: Log groups data whenever it changes
  React.useEffect(() => {
    console.log('🔍 TeamGroupManager - Groups data updated:', {
      count: groups.length,
      groups: groups,
      isLoading: groupsLoading
    });
  }, [groups, groupsLoading]);

  // Fetch venues
  React.useEffect(() => {
    const fetchVenues = async () => {
      setVenuesLoading(true);
      try {
        // Use relative URL to work with Netlify Functions
        const response = await fetch('/api/fixtures/venues');
        const data = await response.json();
        if (data.success && data.venues) {
          setVenues(data.venues);
        }
      } catch (error) {
        console.error('Failed to fetch venues:', error);
      } finally {
        setVenuesLoading(false);
      }
    };
    fetchVenues();
  }, []);


  // Get team-group assignments
  const { data: teamGroups = [], isLoading: teamGroupsLoading } = useTournamentTeamGroups(tournamentId);

  // Create group mutation
  const createGroupMutation = useCreateGroup(tournamentId);

  // Update group mutation
  const updateGroupMutation = useUpdateGroup();

  // Delete group mutation  
  const deleteGroupMutation = useDeleteGroup();

  // Assign team to group mutation
  const assignTeamMutation = useAssignTeamToGroup(tournamentId);

  // Remove team from group mutation
  const removeTeamMutation = useRemoveTeamFromGroup(tournamentId);

  // Auto-assign teams mutation
  const autoAssignMutation = useAutoAssignTeams(tournamentId);

  const handleCreateGroup = () => {
    if (!newGroupName.trim()) return;
    
    const seq = groups.length + 1;
    const groupData: any = {
      name: newGroupName.trim(),
      seq
    };
    
    if (newGroupVenue && newGroupVenue !== 'none') {
      groupData.venue = newGroupVenue;
    }
    
    createGroupMutation.mutate(groupData, {
      onSuccess: () => {
        setIsCreateGroupDialogOpen(false);
        setNewGroupName('');
        setNewGroupVenue('');
        toast({
          title: "Success",
          description: "Group created successfully",
        });
      },
      onError: (error: any) => {
        toast({
          title: "Error", 
          description: error.message || "Failed to create group",
          variant: "destructive",
        });
      }
    });
  };

  const handleEditGroup = (group: Group) => {
    setSelectedGroup(group);
    setEditGroupName(group.name);
    setEditGroupVenue(group.venue || 'none');
    setIsEditGroupDialogOpen(true);
  };

  const handleUpdateGroup = () => {
    if (!selectedGroup || !editGroupName.trim()) return;
    
    const updateData: any = {
      groupId: selectedGroup.id,
      name: editGroupName.trim(),
      tournamentId
    };
    
    if (editGroupVenue !== undefined) {
      updateData.venue = editGroupVenue === 'none' ? null : editGroupVenue;
    }
    
    updateGroupMutation.mutate(updateData, {
      onSuccess: () => {
        setIsEditGroupDialogOpen(false);
        setSelectedGroup(null);
        toast({
          title: "Success",
          description: "Group updated successfully",
        });
      },
      onError: (error: any) => {
        toast({
          title: "Error",
          description: error.message || "Failed to update group",
          variant: "destructive",
        });
      }
    });
  };

  const handleDeleteGroup = (groupId: string) => {
    if (window.confirm('Are you sure you want to delete this group? All team assignments will be removed.')) {
      deleteGroupMutation.mutate({
        groupId,
        tournamentId
      }, {
        onSuccess: () => {
          toast({
            title: "Success",
            description: "Group deleted successfully",
          });
        },
        onError: (error: any) => {
          toast({
            title: "Error",
            description: error.message || "Failed to delete group",
            variant: "destructive",
          });
        }
      });
    }
  };

  const handleAssignTeam = (teamId: string, groupId: string) => {
    // Check if team is already assigned to any group
    const existingAssignment = teamGroups.find(tg => tg.teamId === teamId);
    if (existingAssignment) {
      // Remove from current group first
      removeTeamMutation.mutate(existingAssignment.id);
    }
    
    assignTeamMutation.mutate({ teamId, groupId }, {
      onSuccess: () => {
        toast({
          title: "Success",
          description: "Team assigned to group successfully",
        });
      },
      onError: (error: any) => {
        toast({
          title: "Error",
          description: error.message || "Failed to assign team to group",
          variant: "destructive",
        });
      }
    });
  };

  const handleRemoveTeam = (teamGroupId: string) => {
    removeTeamMutation.mutate(teamGroupId, {
      onSuccess: () => {
        toast({
          title: "Success",
          description: "Team removed from group successfully",
        });
      },
      onError: (error: any) => {
        toast({
          title: "Error",
          description: error.message || "Failed to remove team from group",
          variant: "destructive",
        });
      }
    });
  };

  const handleAutoAssign = () => {
    if (autoAssignMode === 'manual') return;
    autoAssignMutation.mutate(autoAssignMode, {
      onSuccess: () => {
        toast({
          title: "Success",
          description: "Teams automatically assigned to groups",
        });
      },
      onError: (error: any) => {
        toast({
          title: "Error",
          description: error.message || "Failed to auto-assign teams",
          variant: "destructive",
        });
      }
    });
  };

  // Team selection functions
  const handleTeamSelect = (teamId: string, checked: boolean) => {
    if (checked) {
      setSelectedTeams(prev => [...prev, teamId]);
    } else {
      setSelectedTeams(prev => prev.filter(id => id !== teamId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allTeamIds = getUnassignedTeams().map(team => team.id);
      setSelectedTeams(allTeamIds);
    } else {
      setSelectedTeams([]);
    }
  };

  const handleBulkAssignToGroup = (groupId: string) => {
    selectedTeams.forEach(teamId => {
      handleAssignTeam(teamId, groupId);
    });
    setSelectedTeams([]); // Clear selection after assignment
  };

  // Get teams assigned to a specific group
  const getTeamsInGroup = (groupId: string) => {
    return teamGroups
      .filter(tg => tg.groupId === groupId)
      .map(tg => {
        const registration = registeredTeams.find(t => (t.team?.id || t.teams?.id) === tg.teamId);
        return registration?.team || registration?.teams;
      })
      .filter(Boolean)
      .sort((a, b) => (a?.name || '').localeCompare(b?.name || ''));
  };

  // Get unassigned teams
  const getUnassignedTeams = () => {
    const assignedTeamIds = teamGroups.map((tg: any) => tg.teamId);
    const unassignedTeams = registeredTeams
      .filter((rt: any) => {
        const teamId = rt.team?.id || rt.teams?.id;
        return !assignedTeamIds.includes(teamId || '');
      })
      .map((rt: any) => rt.team || rt.teams)
      .filter(Boolean)
      .sort((a: any, b: any) => (a?.name || '').localeCompare(b?.name || ''));
    
    return unassignedTeams;
  };



  const isLoading = groupsLoading || teamGroupsLoading;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Team Group Management</h3>
          <p className="text-sm text-muted-foreground">
            Organize teams into groups for tournament structure
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => setIsCreateGroupDialogOpen(true)}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Create Group
          </Button>

          {groups.length > 0 && (
            <Button
              variant="outline"
              onClick={handleAutoAssign}
              disabled={autoAssignMode === 'manual'}
              className="flex items-center gap-2"
            >
              <Shuffle className="w-4 h-4" />
              Auto Assign
            </Button>
          )}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="groups">Groups ({groups.length})</TabsTrigger>
          <TabsTrigger value="unassigned">Unassigned ({getUnassignedTeams().length})</TabsTrigger>
        </TabsList>

        <TabsContent value="groups" className="space-y-4">
          {isLoading ? (
            <div className="text-center py-8">
              <p>Loading groups...</p>
            </div>
          ) : groups.length === 0 ? (
            <div className="text-center py-12">
              <Users className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 text-sm font-semibold text-gray-900">No groups created</h3>
              <p className="mt-1 text-sm text-gray-500">Create your first group to organize teams.</p>
              <Button
                onClick={() => setIsCreateGroupDialogOpen(true)}
                className="mt-4"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Group
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {(() => {
                const sortedGroups = groups.sort((a, b) => {
                  // Sort by seq first, then by name
                  if (a.seq !== undefined && b.seq !== undefined) {
                    return a.seq - b.seq;
                  }
                  return (a.name || '').localeCompare(b.name || '');
                });
                return sortedGroups;
              })()
                .map((group) => (
                <Card key={group.id} className="relative">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">{group.name}</CardTitle>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditGroup(group)}
                        >
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteGroup(group.id)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                    <CardDescription>
                      {getTeamsInGroup(group.id).length} teams assigned
                      {group.venue && (
                        <span className="block text-xs mt-1">
                          🏟️ {group.venue}
                        </span>
                      )}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-32">
                      <div className="space-y-2">
                        {getTeamsInGroup(group.id).map((team) => (
                          <div
                            key={team.id}
                            className="flex items-center justify-between p-2 bg-muted rounded-md"
                          >
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-xs text-primary-foreground">
                                {team.name.charAt(0)}
                              </div>
                              <span className="text-sm font-medium">{team.name}</span>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                const teamGroup = teamGroups.find(tg => tg.teamId === team.id && tg.groupId === group.id);
                                if (teamGroup) handleRemoveTeam(teamGroup.id);
                              }}
                            >
                              <UserMinus className="w-3 h-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                    
                    {/* Quick assign dropdown */}
                    <Separator className="my-3" />
                    <Select onValueChange={(teamId) => handleAssignTeam(teamId, group.id)}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Assign team..." />
                      </SelectTrigger>
                      <SelectContent>
                        {getUnassignedTeams().map((team) => (
                          <SelectItem key={team.id} value={team.id}>
                            {team.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="unassigned" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h4 className="text-sm font-medium">Unassigned Teams</h4>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="select-all-teams"
                  checked={selectedTeams.length > 0 && selectedTeams.length === getUnassignedTeams().length}
                  onCheckedChange={handleSelectAll}
                />
                <Label htmlFor="select-all-teams" className="text-sm text-muted-foreground">
                  Select All ({selectedTeams.length} selected)
                </Label>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="auto-assign-mode" className="text-sm">Auto-assign:</Label>
              <Select value={autoAssignMode} onValueChange={(value: 'random' | 'balanced' | 'manual') => setAutoAssignMode(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="manual">Manual</SelectItem>
                  <SelectItem value="random">Random</SelectItem>
                  <SelectItem value="balanced">Balanced</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Bulk Assignment Controls */}
          {selectedTeams.length > 0 && (
            <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">
                  Assign {selectedTeams.length} selected team{selectedTeams.length > 1 ? 's' : ''} to:
                </span>
                <div className="flex items-center gap-2">
                  {groups.map(group => (
                    <Button
                      key={group.id}
                      variant="outline"
                      size="sm"
                      onClick={() => handleBulkAssignToGroup(group.id)}
                      className="text-xs"
                    >
                      {group.name}
                    </Button>
                  ))}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedTeams([])}
                    className="text-xs text-muted-foreground"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          )}

          <div className="grid gap-3 md:grid-cols-2">
            {getUnassignedTeams().map((team) => (
              <Card key={team.id} className={`p-3 ${selectedTeams.includes(team.id) ? 'ring-2 ring-primary bg-primary/5' : ''}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Checkbox
                      checked={selectedTeams.includes(team.id)}
                      onCheckedChange={(checked) => handleTeamSelect(team.id, !!checked)}
                    />
                    <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center text-sm font-medium">
                      {team.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{team.name}</p>
                      {team.club_name && (
                        <p className="text-xs text-muted-foreground">{team.club_name}</p>
                      )}
                    </div>
                  </div>
                  <Select onValueChange={(groupId) => handleAssignTeam(team.id, groupId)}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Assign..." />
                    </SelectTrigger>
                    <SelectContent>
                      {groups
                        .sort((a, b) => {
                          // Sort by seq first, then by name
                          if (a.seq !== undefined && b.seq !== undefined) {
                            return a.seq - b.seq;
                          }
                          return (a.name || '').localeCompare(b.name || '');
                        })
                        .map((group) => (
                          <SelectItem key={group.id} value={group.id}>
                            {group.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              </Card>
            ))}
          </div>

          {getUnassignedTeams().length === 0 && (
            <div className="text-center py-8">
              <Target className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 text-sm font-semibold text-gray-900">All teams assigned</h3>
              <p className="mt-1 text-sm text-gray-500">Every registered team has been assigned to a group.</p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Create Group Dialog */}
      <Dialog open={isCreateGroupDialogOpen} onOpenChange={setIsCreateGroupDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Group</DialogTitle>
            <DialogDescription>
              Add a new group to organize teams in your tournament.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="group-name">Group Name</Label>
              <Input
                id="group-name"
                placeholder="e.g., Group A, Pool 1, Division North"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreateGroup()}
              />
            </div>
            <div>
              <Label htmlFor="group-venue">Venue (Optional)</Label>
              <Select value={newGroupVenue} onValueChange={setNewGroupVenue}>
                <SelectTrigger id="group-venue">
                  <SelectValue placeholder="Select a venue..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No venue assigned</SelectItem>
                  {venuesLoading ? (
                    <SelectItem value="loading" disabled>Loading venues...</SelectItem>
                  ) : (
                    venues.map((venue) => (
                      <SelectItem key={venue.id} value={venue.name}>
                        {venue.name} - {venue.location}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateGroupDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreateGroup}
              disabled={!newGroupName.trim() || createGroupMutation.isPending}
            >
              {createGroupMutation.isPending ? 'Creating...' : 'Create Group'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Group Dialog */}
      <Dialog open={isEditGroupDialogOpen} onOpenChange={setIsEditGroupDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Group</DialogTitle>
            <DialogDescription>
              Update the group name and settings.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-group-name">Group Name</Label>
              <Input
                id="edit-group-name"
                placeholder="Group name"
                value={editGroupName}
                onChange={(e) => setEditGroupName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleUpdateGroup()}
              />
            </div>
            <div>
              <Label htmlFor="edit-group-venue">Venue (Optional)</Label>
              <Select value={editGroupVenue} onValueChange={setEditGroupVenue}>
                <SelectTrigger id="edit-group-venue">
                  <SelectValue placeholder="Select a venue..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No venue assigned</SelectItem>
                  {venuesLoading ? (
                    <SelectItem value="loading" disabled>Loading venues...</SelectItem>
                  ) : (
                    venues.map((venue) => (
                      <SelectItem key={venue.id} value={venue.name}>
                        {venue.name} - {venue.location}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditGroupDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleUpdateGroup}
              disabled={!editGroupName.trim() || updateGroupMutation.isPending}
            >
              {updateGroupMutation.isPending ? 'Updating...' : 'Update Group'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TeamGroupManager;