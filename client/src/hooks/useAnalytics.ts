import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

// Types for analytics data
export interface AnalyticsOverview {
  totalPlayers: number;
  totalTeams: number;
  totalTournaments: number;
  activeTransfers: number;
  completionRate: number;
  winRate: number;
  responseTime: number;
  growthRate: number;
}

export interface TimeSeriesData {
  date: string;
  players: number;
  teams: number;
  tournaments: number;
  registrations: number;
  transfers: number;
}

export interface PerformanceMetric {
  category: string;
  current: number;
  target: number;
  benchmark: number;
}

export interface GeographicData {
  county: string;
  players: number;
  teams: number;
  color?: string;
}

export interface DemographicData {
  ageGroup: string;
  male: number;
  female: number;
  total: number;
}

export interface TransferTrend {
  month: string;
  incoming: number;
  outgoing: number;
  net: number;
}

export interface PlayerEngagement {
  playerId: string;
  playerName: string;
  engagementScore: number;
  lastActivity: string;
  activeDays: number;
  completedActions: number;
}

export interface TournamentInsights {
  tournamentId: string;
  tournamentName: string;
  participationRate: number;
  averageScore: number;
  competitionLevel: "LOW" | "MEDIUM" | "HIGH";
  completionTime: number;
}

// Hook for overview analytics
export function useAnalyticsOverview(orgId: string, timeRange: string = "30days") {
  return useQuery<AnalyticsOverview>({
    queryKey: [`/api/organizations/${orgId}/analytics/overview`, timeRange],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/organizations/${orgId}/analytics/overview?timeRange=${timeRange}`);
      return response.json();
    },
    enabled: !!orgId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Hook for time series data
export function useAnalyticsTimeSeries(orgId: string, timeRange: string = "30days") {
  return useQuery<TimeSeriesData[]>({
    queryKey: [`/api/organizations/${orgId}/analytics/timeseries`, timeRange],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/organizations/${orgId}/analytics/timeseries?timeRange=${timeRange}`);
      return response.json();
    },
    enabled: !!orgId,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

// Hook for performance metrics
export function usePerformanceMetrics(orgId: string, timeRange: string = "30days") {
  return useQuery<PerformanceMetric[]>({
    queryKey: [`/api/organizations/${orgId}/analytics/performance`, timeRange],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/organizations/${orgId}/analytics/performance?timeRange=${timeRange}`);
      return response.json();
    },
    enabled: !!orgId,
    staleTime: 15 * 60 * 1000, // 15 minutes
  });
}

// Hook for geographic distribution
export function useGeographicAnalytics(orgId: string) {
  return useQuery<GeographicData[]>({
    queryKey: [`/api/organizations/${orgId}/analytics/geographic`],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/organizations/${orgId}/analytics/geographic`);
      return response.json();
    },
    enabled: !!orgId,
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
}

// Hook for demographic analysis
export function useDemographicAnalytics(orgId: string) {
  return useQuery<DemographicData[]>({
    queryKey: [`/api/organizations/${orgId}/analytics/demographics`],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/organizations/${orgId}/analytics/demographics`);
      return response.json();
    },
    enabled: !!orgId,
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
}

// Hook for transfer trends
export function useTransferTrends(orgId: string, timeRange: string = "12months") {
  return useQuery<TransferTrend[]>({
    queryKey: [`/api/organizations/${orgId}/analytics/transfers`, timeRange],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/organizations/${orgId}/analytics/transfers?timeRange=${timeRange}`);
      return response.json();
    },
    enabled: !!orgId,
    staleTime: 15 * 60 * 1000, // 15 minutes
  });
}

// Hook for player engagement analytics
export function usePlayerEngagement(orgId: string, teamId?: string) {
  return useQuery<PlayerEngagement[]>({
    queryKey: [`/api/organizations/${orgId}/analytics/player-engagement`, teamId],
    queryFn: async () => {
      const url = teamId 
        ? `/api/organizations/${orgId}/analytics/player-engagement?teamId=${teamId}`
        : `/api/organizations/${orgId}/analytics/player-engagement`;
      const response = await apiRequest('GET', url);
      return response.json();
    },
    enabled: !!orgId,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

// Hook for tournament insights
export function useTournamentInsights(orgId: string, timeRange: string = "6months") {
  return useQuery<TournamentInsights[]>({
    queryKey: [`/api/organizations/${orgId}/analytics/tournaments`, timeRange],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/organizations/${orgId}/analytics/tournaments?timeRange=${timeRange}`);
      return response.json();
    },
    enabled: !!orgId,
    staleTime: 20 * 60 * 1000, // 20 minutes
  });
}

// Hook for real-time analytics updates
export function useRealTimeAnalytics(orgId: string, enabled: boolean = false) {
  return useQuery({
    queryKey: [`/api/organizations/${orgId}/analytics/realtime`],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/organizations/${orgId}/analytics/realtime`);
      return response.json();
    },
    enabled: enabled && !!orgId,
    refetchInterval: 30 * 1000, // Refetch every 30 seconds
    staleTime: 0, // Always considered stale for real-time updates
  });
}

// Hook for custom analytics queries
export function useCustomAnalytics(
  orgId: string, 
  query: {
    metrics: string[];
    filters?: Record<string, any>;
    groupBy?: string;
    timeRange?: string;
  }
) {
  return useQuery({
    queryKey: [`/api/organizations/${orgId}/analytics/custom`, JSON.stringify(query)],
    queryFn: async () => {
      const response = await apiRequest('POST', `/api/organizations/${orgId}/analytics/custom`, query);
      return response.json();
    },
    enabled: !!orgId && query.metrics.length > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Mutation for saving analytics configurations
export function useSaveAnalyticsConfig() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ orgId, config }: { orgId: string; config: any }) => {
      const response = await apiRequest('POST', `/api/organizations/${orgId}/analytics/config`, config);
      return response.json();
    },
    onSuccess: (_, { orgId }) => {
      // Invalidate analytics queries to refetch with new config
      queryClient.invalidateQueries({ queryKey: [`/api/organizations/${orgId}/analytics`] });
    },
  });
}

// Mutation for exporting analytics data
export function useExportAnalytics() {
  return useMutation({
    mutationFn: async ({ 
      orgId, 
      exportType, 
      timeRange, 
      format 
    }: { 
      orgId: string; 
      exportType: string; 
      timeRange: string; 
      format: 'excel' | 'csv' | 'pdf';
    }) => {
      const response = await apiRequest('POST', `/api/organizations/${orgId}/analytics/export`, {
        exportType,
        timeRange,
        format
      });
      return response.blob();
    },
  });
}

// Utility hook for analytics alerts and insights
export function useAnalyticsAlerts(orgId: string) {
  return useQuery({
    queryKey: [`/api/organizations/${orgId}/analytics/alerts`],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/organizations/${orgId}/analytics/alerts`);
      return response.json();
    },
    enabled: !!orgId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 5 * 60 * 1000, // Check for new alerts every 5 minutes
  });
}