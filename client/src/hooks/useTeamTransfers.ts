import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export interface TeamTransferRequest {
  teamId: string;
  toOrgId: string;
  transferReason: string;
  transferType: "VOLUNTARY" | "ADMINISTRATIVE" | "DISCIPLINARY" | "DISSOLUTION";
}

export interface TeamTransferHistoryRecord {
  id: string;
  teamId: string;
  fromOrgId: string;
  toOrgId: string;
  transferDate: string;
  transferReason: string | null;
  transferType: string;
  transferStatus: string;
  requestedBy: string | null;
  approvedBy: string | null;
  adminNotes: string | null;
  playerCount: number | null;
  activeRegistrations: number | null;
  createdAt: string;
  updatedAt: string;
  // Related data
  fromOrganization?: { id: string; name: string };
  toOrganization?: { id: string; name: string };
  team?: { id: string; name: string };
}

/**
 * Get transfer history for a specific team
 */
export function useTeamTransferHistory(teamId: string) {
  return useQuery({
    queryKey: ["teamTransferHistory", teamId],
    queryFn: async (): Promise<TeamTransferHistoryRecord[]> => {
      const response = await apiRequest("GET", `/api/teams/${teamId}/transfer-history`);
      return response;
    },
    enabled: !!teamId,
  });
}

/**
 * Get all pending team transfer requests for organization admin review
 */
export function usePendingTeamTransfers(orgId: string) {
  return useQuery({
    queryKey: ["pendingTeamTransfers", orgId],
    queryFn: async (): Promise<TeamTransferHistoryRecord[]> => {
      const response = await apiRequest("GET", `/api/organizations/${orgId}/pending-transfers`);
      return response;
    },
    enabled: !!orgId,
  });
}

/**
 * Get transfer history for an organization (both incoming and outgoing)
 */
export function useOrganizationTransferHistory(orgId: string) {
  return useQuery({
    queryKey: ["organizationTransferHistory", orgId],
    queryFn: async (): Promise<TeamTransferHistoryRecord[]> => {
      const response = await apiRequest("GET", `/api/organizations/${orgId}/transfer-history`);
      return response;
    },
    enabled: !!orgId,
  });
}

/**
 * Request a team transfer to another organization
 */
export function useRequestTeamTransfer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: TeamTransferRequest): Promise<TeamTransferHistoryRecord> => {
      const response = await apiRequest("POST", "/api/team-transfers/request", request);
      return response;
    },
    onSuccess: (data) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ["teamTransferHistory", data.teamId] });
      queryClient.invalidateQueries({ queryKey: ["pendingTeamTransfers", data.fromOrgId] });
      queryClient.invalidateQueries({ queryKey: ["pendingTeamTransfers", data.toOrgId] });
      queryClient.invalidateQueries({ queryKey: ["organizationTransferHistory", data.fromOrgId] });
      queryClient.invalidateQueries({ queryKey: ["organizationTransferHistory", data.toOrgId] });
    },
  });
}

/**
 * Approve a team transfer request (admin only)
 */
export function useApproveTeamTransfer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      transferId,
      adminNotes,
    }: {
      transferId: string;
      adminNotes?: string;
    }): Promise<TeamTransferHistoryRecord> => {
      const response = await apiRequest("POST", `/api/team-transfers/${transferId}/approve`, { adminNotes });
      return response;
    },
    onSuccess: (data) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ["teamTransferHistory", data.teamId] });
      queryClient.invalidateQueries({ queryKey: ["pendingTeamTransfers"] });
      queryClient.invalidateQueries({ queryKey: ["organizationTransferHistory"] });
      queryClient.invalidateQueries({ queryKey: ["teams"] });
      queryClient.invalidateQueries({ queryKey: ["allTeams"] });
    },
  });
}

/**
 * Reject a team transfer request (admin only)
 */
export function useRejectTeamTransfer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      transferId,
      rejectionReason,
      adminNotes,
    }: {
      transferId: string;
      rejectionReason: string;
      adminNotes?: string;
    }): Promise<TeamTransferHistoryRecord> => {
      const response = await apiRequest("POST", `/api/team-transfers/${transferId}/reject`, { rejectionReason, adminNotes });
      return response;
    },
    onSuccess: (data) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ["teamTransferHistory", data.teamId] });
      queryClient.invalidateQueries({ queryKey: ["pendingTeamTransfers"] });
      queryClient.invalidateQueries({ queryKey: ["organizationTransferHistory"] });
    },
  });
}

/**
 * Cancel a team transfer request (requester only)
 */
export function useCancelTeamTransfer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      transferId,
      cancellationReason,
    }: {
      transferId: string;
      cancellationReason?: string;
    }): Promise<TeamTransferHistoryRecord> => {
      const response = await apiRequest("POST", `/api/team-transfers/${transferId}/cancel`, { cancellationReason });
      return response;
    },
    onSuccess: (data) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ["teamTransferHistory", data.teamId] });
      queryClient.invalidateQueries({ queryKey: ["pendingTeamTransfers"] });
      queryClient.invalidateQueries({ queryKey: ["organizationTransferHistory"] });
    },
  });
}

/**
 * Check if a team can be transferred (validation)
 */
export function useTeamTransferEligibility(teamId: string) {
  return useQuery({
    queryKey: ["teamTransferEligibility", teamId],
    queryFn: async (): Promise<{
      canTransfer: boolean;
      reasons: string[];
      warnings: string[];
      activeRegistrations: number;
      playerCount: number;
    }> => {
      const response = await apiRequest("GET", `/api/teams/${teamId}/transfer-eligibility`);
      return response;
    },
    enabled: !!teamId,
  });
}