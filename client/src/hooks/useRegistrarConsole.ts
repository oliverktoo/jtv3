import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import type { PlayerRegistry } from '../../../shared/schema';

type RegistrationStatus = 'DRAFT' | 'SUBMITTED' | 'IN_REVIEW' | 'APPROVED' | 'REJECTED' | 'SUSPENDED' | 'INCOMPLETE';

export interface RegistrarFilters {
  status?: RegistrationStatus;
  priority?: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  tournament?: string;
  search?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
}

export interface RegistrationWithDetails extends PlayerRegistry {
  playerName: string;
  email: string;
  phone: string;
  tournament?: {
    id: string;
    name: string;
  };
  issues: string[];
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  documents: {
    nationalId: 'VERIFIED' | 'REJECTED' | 'PENDING' | 'MISSING';
    selfie: 'VERIFIED' | 'REJECTED' | 'PENDING' | 'MISSING';
    medical: 'VERIFIED' | 'REJECTED' | 'PENDING' | 'MISSING';
  };
}

export interface RegistrarStats {
  pendingReview: number;
  approvedToday: number;
  issues: number;
  totalRegistered: number;
  byStatus: Record<RegistrationStatus, number>;
  byPriority: Record<'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW', number>;
}

// Hook for fetching registrations with filters
export function useRegistrations(orgId: string, filters: RegistrarFilters = {}) {
  return useQuery({
    queryKey: ['registrations', orgId, filters],
    queryFn: async (): Promise<RegistrationWithDetails[]> => {
      console.log('useRegistrations called with:', { orgId, filters });
      
      let query = supabase
        .from('player_registry')
        .select(`
          *
        `)
        .eq('org_id', orgId);

      // Apply filters
      if (filters.status) {
        query = query.eq('registration_status', filters.status);
      }

      if (filters.tournament) {
        query = query.eq('tournamentId', filters.tournament);
      }

      if (filters.dateRange) {
        query = query
          .gte('created_at', filters.dateRange.start.toISOString())
          .lte('created_at', filters.dateRange.end.toISOString());
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase query error:', error);
        throw error;
      }

      console.log('Raw player registry data:', data?.length || 0, 'records found');
      if (data && data.length > 0) {
        console.log('Sample record:', data[0]);
      }

      if (!data) return [];

      // Transform data to include computed fields
      return data.map((reg: any) => {
        const playerName = `${reg.first_name || ''} ${reg.last_name || ''}`.trim();
        
        // Calculate priority based on status and issues
        let priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' = 'LOW';
        const issues: string[] = [];
        
        if (reg.registration_status === 'REJECTED') {
          priority = 'CRITICAL';
          issues.push('Registration rejected');
        } else if (reg.registration_status === 'IN_REVIEW') {
          priority = 'HIGH';
          if (!reg.medical_clearance_date) issues.push('Missing medical clearance');
          if (!reg.guardian_name && reg.dob) {
            const age = new Date().getFullYear() - new Date(reg.dob).getFullYear();
            if (age < 18) issues.push('Missing guardian consent');
          }
        } else if (reg.registration_status === 'DRAFT') {
          priority = 'MEDIUM';
          issues.push('Incomplete registration');
        }

        // Apply search filter if provided
        if (filters.search) {
          const searchTerm = filters.search.toLowerCase();
          const matchesSearch = 
            playerName.toLowerCase().includes(searchTerm) ||
            reg.email?.toLowerCase().includes(searchTerm) ||
            reg.phone?.includes(searchTerm);
          
          if (!matchesSearch) return null;
        }

        // Apply priority filter if provided
        if (filters.priority && priority !== filters.priority) {
          return null;
        }

        return {
          ...reg,
          registrationStatus: reg.registration_status, // Map snake_case to camelCase for UI
          createdAt: reg.created_at, // Map created_at for proper date display
          playerName,
          email: reg.email || '',
          phone: reg.phone || '',
          tournament: undefined, // No direct tournament relation in player_registry
          issues,
          priority,
          documents: {
            nationalId: reg.hashed_identity_keys ? 'VERIFIED' : 'MISSING',
            selfie: reg.photo_path ? 'VERIFIED' : 'MISSING',
            medical: reg.medical_clearance_date ? 'VERIFIED' : 'MISSING'
          }
        } as RegistrationWithDetails;
      }).filter((item): item is RegistrationWithDetails => item !== null);
    },
    enabled: !!orgId
  });
}

// Hook for registrar statistics
export function useRegistrarStats(orgId: string) {
  return useQuery({
    queryKey: ['registrar-stats', orgId],
    queryFn: async (): Promise<RegistrarStats> => {
      console.log('useRegistrarStats called with orgId:', orgId);
      
      // Get all registrations for this org
      const { data: registrations, error } = await supabase
        .from('player_registry')
        .select('registration_status, created_at')
        .eq('org_id', orgId);

      if (error) {
        console.error('Stats query error:', error);
        throw error;
      }

      console.log('Stats data fetched:', registrations?.length || 0, 'records');

      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      const stats: RegistrarStats = {
        pendingReview: 0,
        approvedToday: 0,
        issues: 0,
        totalRegistered: registrations?.length || 0,
        byStatus: {
          DRAFT: 0,
          SUBMITTED: 0,
          IN_REVIEW: 0,
          APPROVED: 0,
          REJECTED: 0,
          SUSPENDED: 0,
          INCOMPLETE: 0
        },
        byPriority: {
          CRITICAL: 0,
          HIGH: 0,
          MEDIUM: 0,
          LOW: 0
        }
      };

      if (registrations) {
        registrations.forEach((reg: any) => {
          // Count by status
          if (reg.registration_status) {
            stats.byStatus[reg.registration_status as RegistrationStatus]++;

            // Count pending review
            if (reg.registration_status === 'SUBMITTED' || reg.registration_status === 'IN_REVIEW') {
              stats.pendingReview++;
            }

            // Count approved today
            if (reg.registration_status === 'APPROVED' && new Date(reg.created_at) >= todayStart) {
              stats.approvedToday++;
            }

            // Count issues
            if (reg.registration_status === 'REJECTED' || reg.registration_status === 'IN_REVIEW') {
              stats.issues++;
            }

            // Calculate priority distribution (simplified)
            if (reg.registration_status === 'REJECTED') {
              stats.byPriority.CRITICAL++;
            } else if (reg.registration_status === 'IN_REVIEW') {
              stats.byPriority.HIGH++;
            } else if (reg.registration_status === 'DRAFT') {
              stats.byPriority.MEDIUM++;
            } else {
              stats.byPriority.LOW++;
            }
          }
        });
      }

      console.log('Computed stats:', stats);
      return stats;
    },
    enabled: !!orgId,
    refetchInterval: 30000 // Refresh every 30 seconds
  });
}

// Hook for approving a registration
export function useApproveRegistration(orgId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ registrationId, notes }: { registrationId: string; notes?: string }) => {
      const { data, error } = await supabase
        .from('player_registry')
        .update({
          registration_status: 'APPROVED',
          updated_at: new Date().toISOString(),
          notes
        })
        .eq('id', registrationId)
        .eq('org_id', orgId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      // Invalidate and refetch registrations
      queryClient.invalidateQueries({ queryKey: ['registrations', orgId] });
      queryClient.invalidateQueries({ queryKey: ['registrar-stats', orgId] });
    }
  });
}

// Hook for rejecting a registration
export function useRejectRegistration(orgId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ registrationId, reason }: { registrationId: string; reason: string }) => {
      const { data, error } = await supabase
        .from('player_registry')
        .update({
          registration_status: 'REJECTED',
          updated_at: new Date().toISOString(),
          notes: reason
        })
        .eq('id', registrationId)
        .eq('org_id', orgId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      // Invalidate and refetch registrations
      queryClient.invalidateQueries({ queryKey: ['registrations', orgId] });
      queryClient.invalidateQueries({ queryKey: ['registrar-stats', orgId] });
    }
  });
}

// Hook for bulk actions
export function useBulkActions(orgId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      registrationIds, 
      action, 
      reason 
    }: { 
      registrationIds: string[]; 
      action: 'approve' | 'reject'; 
      reason?: string; 
    }) => {
      const updates = action === 'approve' 
        ? {
            registration_status: 'APPROVED',
            approved_at: new Date().toISOString()
          }
        : {
            registration_status: 'REJECTED',
            updated_at: new Date().toISOString(),
            notes: reason
          };

      const { data, error } = await supabase
        .from('player_registry')
        .update(updates)
        .in('id', registrationIds)
        .eq('org_id', orgId)
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      // Invalidate and refetch registrations
      queryClient.invalidateQueries({ queryKey: ['registrations', orgId] });
      queryClient.invalidateQueries({ queryKey: ['registrar-stats', orgId] });
    }
  });
}

// Hook for exporting registration data
export function useExportRegistrations(orgId: string) {
  return useMutation({
    mutationFn: async (filters: RegistrarFilters = {}) => {
      let query = supabase
        .from('player_registry')
        .select(`*`)
        .eq('org_id', orgId);

      // Apply filters
      if (filters.status) {
        query = query.eq('registration_status', filters.status);
      }

      if (filters.dateRange) {
        query = query
          .gte('created_at', filters.dateRange.start.toISOString())
          .lte('created_at', filters.dateRange.end.toISOString());
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;

      // Transform data for export
      return data.map((reg: any) => ({
        'Player Name': `${reg.first_name || ''} ${reg.last_name || ''}`.trim(),
        'Email': reg.email || '',
        'Phone': reg.phone || '',
        'National ID': reg.national_id || '',
        'Date of Birth': reg.dob || '',
        'Status': reg.registration_status,
        'Submitted At': new Date(reg.created_at).toLocaleString(),
        'Medical Clearance': reg.medical_clearance_date ? 'Yes' : 'No',
        'Guardian Name': reg.guardian_name || '',
        'Notes': reg.notes || ''
      }));
    }
  });
}

// Hook for getting registration details
export function useRegistrationDetails(registrationId: string, orgId: string) {
  return useQuery({
    queryKey: ['registration-details', registrationId, orgId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('player_registry')
        .select(`*`)
        .eq('id', registrationId)
        .eq('org_id', orgId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!registrationId && !!orgId
  });
}