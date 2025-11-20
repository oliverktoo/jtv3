import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import type { Transfer, InsertTransfer, UpdateTransfer } from '@shared/schema';

// Fetch transfers for an organization
export function useTransfers(orgId: string) {
  return useQuery<Transfer[]>({
    queryKey: ['transfers', orgId],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/transfers?orgId=${orgId}`);
      return response.json();
    },
    enabled: !!orgId,
  });
}

// Fetch transfers for a specific team (as requesting or receiving team)
export function useTeamTransfers(orgId: string, teamId: string) {
  return useQuery<Transfer[]>({
    queryKey: ['team-transfers', orgId, teamId],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/transfers/team/${teamId}?orgId=${orgId}`);
      return response.json();
    },
    enabled: !!orgId && !!teamId,
  });
}

// Fetch pending transfers that require action from a specific team
export function usePendingTransfers(orgId: string, teamId: string) {
  return useQuery<Transfer[]>({
    queryKey: ['pending-transfers', orgId, teamId],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/transfers/pending/${teamId}?orgId=${orgId}`);
      return response.json();
    },
    enabled: !!orgId && !!teamId,
  });
}

// Fetch transfer details with related player and team information
export function useTransferDetails(orgId: string, transferId: string) {
  return useQuery<Transfer & {
    player?: any;
    fromTeam?: any;
    toTeam?: any;
  }>({
    queryKey: ['transfer-details', orgId, transferId],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/transfers/${transferId}?orgId=${orgId}`);
      return response.json();
    },
    enabled: !!orgId && !!transferId,
  });
}

// Create a new transfer request
export function useCreateTransfer(orgId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (transferData: InsertTransfer) =>
      apiRequest('POST', '/api/transfers', { ...transferData, orgId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transfers', orgId] });
      queryClient.invalidateQueries({ queryKey: ['team-transfers', orgId] });
      queryClient.invalidateQueries({ queryKey: ['pending-transfers', orgId] });
    },
  });
}

// Update transfer status (approve, reject, complete, etc.)
export function useUpdateTransferStatus(orgId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ 
      transferId, 
      status, 
      notes 
    }: { 
      transferId: string; 
      status: string; 
      notes?: string;
    }) => 
      apiRequest('PATCH', `/api/transfers/${transferId}/status`, { status, notes, orgId }),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['transfers', orgId] });
      queryClient.invalidateQueries({ queryKey: ['team-transfers', orgId] });
      queryClient.invalidateQueries({ queryKey: ['pending-transfers', orgId] });
      queryClient.invalidateQueries({ queryKey: ['transfer-details', orgId, variables.transferId] });
    },
  });
}

// Update transfer details
export function useUpdateTransfer(orgId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ 
      transferId, 
      data 
    }: { 
      transferId: string; 
      data: Partial<UpdateTransfer>;
    }) => 
      apiRequest('PATCH', `/api/transfers/${transferId}`, { ...data, orgId }),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['transfers', orgId] });
      queryClient.invalidateQueries({ queryKey: ['team-transfers', orgId] });
      queryClient.invalidateQueries({ queryKey: ['transfer-details', orgId, variables.transferId] });
    },
  });
}

// Cancel a transfer request
export function useCancelTransfer(orgId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (transferId: string) => 
      apiRequest('PATCH', `/api/transfers/${transferId}/cancel`, { orgId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transfers', orgId] });
      queryClient.invalidateQueries({ queryKey: ['team-transfers', orgId] });
      queryClient.invalidateQueries({ queryKey: ['pending-transfers', orgId] });
    },
  });
}

// Bulk approve/reject multiple transfers
export function useBulkUpdateTransfers(orgId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ 
      transferIds, 
      status, 
      notes 
    }: { 
      transferIds: string[]; 
      status: string; 
      notes?: string;
    }) => 
      apiRequest('PATCH', '/api/transfers/bulk-update', { transferIds, status, notes, orgId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transfers', orgId] });
      queryClient.invalidateQueries({ queryKey: ['team-transfers', orgId] });
      queryClient.invalidateQueries({ queryKey: ['pending-transfers', orgId] });
    },
  });
}

// Get transfer statistics for analytics
export function useTransferStats(orgId: string, teamId?: string) {
  return useQuery<{
    totalTransfers: number;
    pendingTransfers: number;
    approvedTransfers: number;
    rejectedTransfers: number;
    completedTransfers: number;
    transfersByType: Record<string, number>;
    transfersByMonth: Array<{ month: string; count: number }>;
    averageProcessingTime: number;
  }>({
    queryKey: ['transfer-stats', orgId, teamId],
    queryFn: async () => {
      const url = teamId 
        ? `/api/transfers/stats?orgId=${orgId}&teamId=${teamId}`
        : `/api/transfers/stats?orgId=${orgId}`;
      const response = await apiRequest('GET', url);
      return response.json();
    },
    enabled: !!orgId,
  });
}