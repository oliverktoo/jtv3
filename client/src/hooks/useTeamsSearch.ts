import { useQuery } from "@tanstack/react-query";
import { useState, useEffect, useCallback } from "react";

export interface TeamSearchResult {
  id: string;
  name: string;
  club_name?: string;
  logo_url?: string;
  team_status: string;
  org_id?: string;
  organizations?: {
    name: string;
  };
}

export interface TeamsSearchResponse {
  data: TeamSearchResult[];
  success: boolean;
  total: number;
}

// Hook to search teams with debouncing
export function useTeamsSearch(searchQuery?: string, orgId?: string, enabled: boolean = true) {
  const [debouncedQuery, setDebouncedQuery] = useState(searchQuery || '');

  // Debounce the search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery || '');
    }, 300); // 300ms debounce

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchTeams = useCallback(async (): Promise<TeamsSearchResponse> => {
    const params = new URLSearchParams();
    
    if (debouncedQuery.trim()) {
      params.append('q', debouncedQuery.trim());
    }
    
    if (orgId) {
      params.append('orgId', orgId);
    }

    const url = `/api/teams/search${params.toString() ? '?' + params.toString() : ''}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch teams: ${response.status}`);
    }
    
    return response.json();
  }, [debouncedQuery, orgId]);

  return useQuery<TeamsSearchResponse, Error>({
    queryKey: ['teams', 'search', debouncedQuery, orgId],
    queryFn: fetchTeams,
    enabled: enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    retry: 2,
  });
}

// Hook to get a single team by ID
export function useTeam(teamId?: string) {
  return useQuery<TeamSearchResult, Error>({
    queryKey: ['teams', teamId],
    queryFn: async () => {
      if (!teamId) {
        throw new Error('Team ID is required');
      }

      const response = await fetch(`/api/teams/${teamId}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch team: ${response.status}`);
      }
      
      const data = await response.json();
      return data.data || data; // Handle both wrapped and unwrapped responses
    },
    enabled: !!teamId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

// Hook to get all available teams (no search)
export function useAvailableTeams(orgId?: string) {
  return useQuery<TeamsSearchResponse, Error>({
    queryKey: ['teams', 'available', orgId],
    queryFn: async () => {
      const params = new URLSearchParams();
      
      if (orgId) {
        params.append('orgId', orgId);
      }

      const url = `/api/teams/search${params.toString() ? '?' + params.toString() : ''}`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch teams: ${response.status}`);
      }
      
      return response.json();
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
}