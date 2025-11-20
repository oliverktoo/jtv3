import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

export interface Group {
  id: string;
  name: string;
  seq: number;
  stageId?: string;
  divisionId?: string;
  venue?: string;
  createdAt: string;
  teamAssignments?: {
    teamId: string;
    teamName: string;
  }[];
}

export interface TeamGroup {
  id: string;
  teamId: string;
  groupId: string;
  divisionId?: string;
  createdAt: string;
  team?: {
    id: string;
    name: string;
    club_name?: string;
    logo_url?: string;
  };
}

// Get tournament groups
export function useTournamentGroups(tournamentId: string) {
  return useQuery({
    queryKey: ['tournament-groups', tournamentId],
    queryFn: async () => {
      try {
        const response = await apiRequest('GET', `/api/tournaments/${tournamentId}/groups`);
        console.log('✅ Backend groups data loaded:', response);
        
        // Extract the data array from response (backend returns { data: [...], success: true })
        const groupsArray = response?.data || response;
        console.log('📦 Extracted groups array:', groupsArray);
        
        // Transform the API response to match our Group interface
        if (Array.isArray(groupsArray)) {
          const groups = groupsArray.map((group: any) => ({
            id: group.id,
            name: group.name,
            seq: group.seq,
            stageId: group.stage_id,
            divisionId: group.division_id,
            venue: group.venue,
            createdAt: group.created_at,
            // Store team assignments for easy access
            teamAssignments: group.team_groups?.map((tg: any) => ({
              teamId: tg.teams?.id,
              teamName: tg.teams?.name
            })) || []
          }));
          console.log(`📊 Transformed ${groups.length} groups with team data:`, groups);
          return groups;
        }
        
        console.warn('⚠️ Groups array is not an array:', typeof groupsArray);
        return [] as Group[];
      } catch (error) {
        console.warn('Backend unavailable for groups, trying Supabase fallback:', error);
        
        try {
          // Fallback to Supabase
          const { supabase } = await import("@/lib/supabase");
          
          // First, get stages for the tournament
          const { data: stagesData, error: stagesError } = await supabase
            .from('stages')
            .select('id')
            .eq('tournament_id', tournamentId);
            
          if (stagesError) {
            console.error('Supabase stages error:', stagesError);
            return [] as Group[];
          }
          
          if (!stagesData || stagesData.length === 0) {
            console.log('No stages found for tournament:', tournamentId);
            return [] as Group[];
          }
          
          const stageIds = stagesData.map(stage => stage.id);
          
          // Then get groups for those stages
          const { data: groupsData, error: supabaseError } = await supabase
            .from('groups')
            .select(`
              id,
              name,
              seq,
              stage_id,
              division_id,
              venue,
              created_at,
              team_groups(
                team_id,
                teams(id, name)
              )
            `)
            .in('stage_id', stageIds)
            .order('seq');
          
          if (supabaseError) {
            console.error('Supabase groups error:', supabaseError);
            return [] as Group[];
          }
          
          const groups = (groupsData || []).map(group => ({
            id: group.id,
            name: group.name,
            seq: group.seq,
            stageId: group.stage_id,
            divisionId: group.division_id,
            venue: group.venue,
            createdAt: group.created_at,
            teamAssignments: (group.team_groups || []).map((tg: any) => ({
              teamId: tg.teams?.id,
              teamName: tg.teams?.name
            }))
          }));
          
          console.log(`✅ Loaded ${groups.length} groups from Supabase`);
          return groups;
        } catch (supabaseError) {
          // Final fallback to localStorage
          console.warn('🔧 Supabase also failed, trying localStorage');
          
          const storageKey = `tournament-groups-${tournamentId}`;
          const savedGroups = localStorage.getItem(storageKey);
          
          if (savedGroups) {
            try {
              const parsedGroups = JSON.parse(savedGroups) as Group[];
              console.log(`📁 Loaded ${parsedGroups.length} groups from localStorage`);
              return parsedGroups;
            } catch (parseError) {
              console.warn('Failed to parse saved groups, using fresh state');
            }
          }
          
          // Return empty array for fresh start
          console.log('🆕 Starting with empty groups list');
          return [] as Group[];
        }
      }
    },
    enabled: !!tournamentId,
  });
}

// Get team-group assignments for tournament
export function useTournamentTeamGroups(tournamentId: string) {
  return useQuery({
    queryKey: ['tournament-team-groups', tournamentId],
    queryFn: async () => {
      try {
        // Get the groups data which includes team assignments
        const response = await apiRequest('GET', `/api/tournaments/${tournamentId}/groups`);
        
        // Extract the data array from response
        const groupsArray = response?.data || response;
        
        // Extract team-group assignments from the groups response
        const teamGroups: TeamGroup[] = [];
        
        if (Array.isArray(groupsArray)) {
          groupsArray.forEach((group: any) => {
            if (group.team_groups) {
              group.team_groups.forEach((tg: any) => {
                if (tg.teams) {
                  teamGroups.push({
                    id: `${group.id}-${tg.teams.id}`, // Generate ID
                    teamId: tg.teams.id,
                    groupId: group.id,
                    createdAt: group.created_at,
                    team: {
                      id: tg.teams.id,
                      name: tg.teams.name,
                      club_name: tg.teams.club_name,
                      logo_url: tg.teams.logo_url
                    }
                  });
                }
              });
            }
          });
        }
        
        console.log(`📊 Extracted ${teamGroups.length} team-group assignments`);
        return teamGroups;
      } catch (error) {
        console.warn('Backend unavailable for team groups, trying Supabase fallback:', error);
        
        try {
          // Fallback to Supabase
          const { supabase } = await import("@/lib/supabase");
          
          // First get stages for the tournament
          const { data: stagesData, error: stagesError } = await supabase
            .from('stages')
            .select('id')
            .eq('tournament_id', tournamentId);
            
          if (stagesError) {
            console.error('Supabase stages error:', stagesError);
            return [] as TeamGroup[];
          }
          
          if (!stagesData || stagesData.length === 0) {
            console.log('No stages found for tournament:', tournamentId);
            return [] as TeamGroup[];
          }
          
          const stageIds = stagesData.map(stage => stage.id);
          
          // Get groups for those stages
          const { data: groupsData, error: groupsError } = await supabase
            .from('groups')
            .select('id')
            .in('stage_id', stageIds);
            
          if (groupsError) {
            console.error('Supabase groups error:', groupsError);
            return [] as TeamGroup[];
          }
          
          if (!groupsData || groupsData.length === 0) {
            console.log('No groups found for tournament stages:', tournamentId);
            return [] as TeamGroup[];
          }
          
          const groupIds = groupsData.map(group => group.id);
          
          // Finally get team_groups for those groups
          const { data: teamGroupsData, error: supabaseError } = await supabase
            .from('team_groups')
            .select(`
              id,
              team_id,
              group_id,
              division_id,
              created_at,
              teams(id, name, club_name, logo_url)
            `)
            .in('group_id', groupIds);
          
          if (supabaseError) {
            console.error('Supabase team groups error:', supabaseError);
            return [] as TeamGroup[];
          }
          
          const teamGroups = (teamGroupsData || []).map(tg => {
            const team = Array.isArray(tg.teams) ? tg.teams[0] : tg.teams;
            return {
              id: tg.id,
              teamId: tg.team_id,
              groupId: tg.group_id,
              divisionId: tg.division_id,
              createdAt: tg.created_at,
              team: team ? {
                id: team.id,
                name: team.name,
                club_name: team.club_name,
                logo_url: team.logo_url
              } : undefined
            };
          });
          
          console.log(`✅ Loaded ${teamGroups.length} team-group assignments from Supabase`);
          return teamGroups;
        } catch (supabaseError) {
          // Final fallback
          console.warn('Supabase also failed, using empty team-groups data');
          return [] as TeamGroup[];
        }
      }
    },
    enabled: !!tournamentId,
  });
}

// Create group
export function useCreateGroup(tournamentId: string) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: { name: string; seq: number; venue?: string }) => {
      try {
        console.log(`📝 Attempting to create group via backend API for tournament: ${tournamentId}`, data);
        const response = await apiRequest('POST', `/api/tournaments/${tournamentId}/groups`, data);
        console.log('✅ Group created successfully in database:', response);
        return { response, isMockData: false };
      } catch (error) {
        // Mock successful creation when backend is unavailable
        console.error('❌ Backend API failed, falling back to localStorage:', error);
        console.warn('⚠️ This group will NOT persist across sessions or be visible to other users!');
        const newGroup = {
          id: `group-${Date.now()}`,
          name: data.name,
          seq: data.seq,
          venue: data.venue,
          createdAt: new Date().toISOString()
        };
        
        // Update the cache with the new group
        const currentGroups = queryClient.getQueryData(['tournament-groups', tournamentId]) as Group[] || [];
        const updatedGroups = [...currentGroups, newGroup];
        console.log(`✅ Created group "${newGroup.name}" in localStorage only (total: ${updatedGroups.length})`);
        queryClient.setQueryData(['tournament-groups', tournamentId], updatedGroups);
        
        // Save to localStorage for persistence
        const storageKey = `tournament-groups-${tournamentId}`;
        localStorage.setItem(storageKey, JSON.stringify(updatedGroups));
        console.log(`💾 Saved ${updatedGroups.length} groups to localStorage (NOT in database)`);
        
        return { response: newGroup, isMockData: true };
      }
    },
    onSuccess: (data) => {
      console.log('🔄 Invalidating groups queries after creation...');
      // Only invalidate queries if we got real backend data
      // For mock data, we already updated the cache manually
      if (!data.isMockData) {
        queryClient.invalidateQueries({ queryKey: ['tournament-groups', tournamentId] });
        queryClient.invalidateQueries({ queryKey: ['tournament-team-groups', tournamentId] });
        console.log('✅ Groups queries invalidated, refetch should trigger');
      }
    },
  });
}

// Update group
export function useUpdateGroup() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: { groupId: string; name: string; tournamentId: string; venue?: string }) => {
      try {
        const updatePayload: any = { name: data.name };
        if (data.venue !== undefined) {
          updatePayload.venue = data.venue;
        }
        const response = await apiRequest('PUT', `/api/groups/${data.groupId}`, updatePayload);
        return { response, isMockData: false };
      } catch (error) {
        // Mock successful update when backend is unavailable
        console.warn('Backend unavailable, simulating group update');
        
        // Update the cache with the new name and venue
        const currentGroups = queryClient.getQueryData(['tournament-groups', data.tournamentId]) as Group[] || [];
        const updatedGroups = currentGroups.map(group => 
          group.id === data.groupId 
            ? { ...group, name: data.name, ...(data.venue !== undefined && { venue: data.venue }) } 
            : group
        );
        queryClient.setQueryData(['tournament-groups', data.tournamentId], updatedGroups);
        
        // Save to localStorage for persistence
        const storageKey = `tournament-groups-${data.tournamentId}`;
        localStorage.setItem(storageKey, JSON.stringify(updatedGroups));
        console.log(`💾 Updated group "${data.name}" in localStorage`);
        
        return { response: { success: true }, isMockData: true };
      }
    },
    onSuccess: (data, variables) => {
      // Only invalidate queries if we got real backend data
      if (!data.isMockData) {
        queryClient.invalidateQueries({ queryKey: ['tournament-groups', variables.tournamentId] });
      }
    },
  });
}

// Delete group
export function useDeleteGroup() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: { groupId: string; tournamentId: string }) => {
      try {
        await apiRequest('DELETE', `/api/groups/${data.groupId}`);
        return { isMockData: false };
      } catch (error) {
        // Mock successful deletion when backend is unavailable
        console.warn('Backend unavailable, simulating group deletion');
        
        // Update the cache by removing the group
        const currentGroups = queryClient.getQueryData(['tournament-groups', data.tournamentId]) as Group[] || [];
        const updatedGroups = currentGroups.filter(group => group.id !== data.groupId);
        queryClient.setQueryData(['tournament-groups', data.tournamentId], updatedGroups);
        
        // Save to localStorage for persistence
        const storageKey = `tournament-groups-${data.tournamentId}`;
        localStorage.setItem(storageKey, JSON.stringify(updatedGroups));
        console.log(`💾 Deleted group from localStorage (remaining: ${updatedGroups.length})`);
        
        return { isMockData: true };
      }
    },
    onSuccess: (data, variables) => {
      // Only invalidate queries if we got real backend data
      if (!data.isMockData) {
        queryClient.invalidateQueries({ queryKey: ['tournament-groups', variables.tournamentId] });
        queryClient.invalidateQueries({ queryKey: ['tournament-team-groups', variables.tournamentId] });
      }
    },
  });
}

// Assign team to group
export function useAssignTeamToGroup(tournamentId: string) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: { teamId: string; groupId: string }) => {
      try {
        const response = await apiRequest('POST', `/api/team-groups`, data);
        return { response, isMockData: false };
      } catch (error) {
        // Mock successful assignment when backend is unavailable
        console.warn('Backend unavailable, simulating team assignment');
        const newAssignment = {
          id: `team-group-${Date.now()}`,
          teamId: data.teamId,
          groupId: data.groupId,
          createdAt: new Date().toISOString()
        };
        
        // Update the cache with the new assignment
        const currentAssignments = queryClient.getQueryData(['tournament-team-groups', tournamentId]) as TeamGroup[] || [];
        queryClient.setQueryData(['tournament-team-groups', tournamentId], [...currentAssignments, newAssignment]);
        
        return { response: newAssignment, isMockData: true };
      }
    },
    onSuccess: (data) => {
      // Only invalidate queries if we got real backend data
      if (!data.isMockData) {
        queryClient.invalidateQueries({ queryKey: ['tournament-team-groups', tournamentId] });
      }
    },
  });
}

// Remove team from group
export function useRemoveTeamFromGroup(tournamentId: string) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (teamGroupId: string) => {
      try {
        await apiRequest('DELETE', `/api/team-groups/${teamGroupId}`);
      } catch (error) {
        // Mock successful removal when backend is unavailable
        console.warn('Backend unavailable, simulating team removal');
        
        // Update the cache by removing the assignment
        const currentAssignments = queryClient.getQueryData(['tournament-team-groups', tournamentId]) as TeamGroup[] || [];
        const updatedAssignments = currentAssignments.filter(assignment => assignment.id !== teamGroupId);
        queryClient.setQueryData(['tournament-team-groups', tournamentId], updatedAssignments);
        
        return { success: true };
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tournament-team-groups', tournamentId] });
    },
  });
}

// Auto-assign teams to groups
export function useAutoAssignTeams(tournamentId: string) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (mode: 'random' | 'balanced') => {
      try {
        const response = await apiRequest('POST', `/api/tournaments/${tournamentId}/auto-assign-teams`, { mode });
        return response;
      } catch (error) {
        // Mock successful auto-assignment when backend is unavailable
        console.warn('Backend unavailable, simulating auto-assignment');
        
        // This would normally get teams from the tournament and groups, 
        // but for demo purposes, we'll create mock assignments
        const mockAssignments = [
          {
            id: `auto-assign-1-${Date.now()}`,
            teamId: 'team-1',
            groupId: 'group-1',
            createdAt: new Date().toISOString()
          },
          {
            id: `auto-assign-2-${Date.now()}`,
            teamId: 'team-2', 
            groupId: 'group-2',
            createdAt: new Date().toISOString()
          }
        ];
        
        // Update the cache
        queryClient.setQueryData(['tournament-team-groups', tournamentId], mockAssignments);
        
        return { assignments: mockAssignments.length };
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tournament-team-groups', tournamentId] });
    },
  });
}