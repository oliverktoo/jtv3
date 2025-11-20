import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useTournaments } from './useTournaments';
import { invitationEmailService } from '../services/invitationEmailService';
import type { 
  TeamInvitation, 
  TeamManager, 
  Team,
  InsertTeamInvitation,
  ManagerTeamAssignment 
} from '@shared/schema';

// Extended types for Manager Dashboard UI
export interface PlayerInvitation extends TeamInvitation {
  // Additional UI-specific properties can be added here if needed
}

export interface ManagerStats {
  totalInvited: number;
  completedRegistrations: number;
  pendingRegistrations: number;
  expiredInvitations: number;
  averageCompletionTime: string;
  completionRate: number;
  activeReminders: number;
  totalTeams: number;
}

export interface BulkInviteParams {
  emails: string[];
  tournamentId?: string;
  message?: string;
  positions?: string[];
}

export interface ManagerDashboardData {
  manager: {
    id: string;
    name: string;
    email: string;
    teams: string[];
  };
  invitations: TeamInvitation[];
  stats: ManagerStats;
}

// Hook to get manager dashboard data
export function useManagerDashboard(managerId: string, orgId: string) {
  return useQuery({
    queryKey: ['managerDashboard', managerId, orgId],
    queryFn: async (): Promise<ManagerDashboardData> => {
      // For now, return mock data since manager tables don't exist yet
      const mockData: ManagerDashboardData = {
        manager: {
          id: managerId,
          name: 'John Manager',
          email: 'john.manager@example.com',
          teams: ['Team A', 'Team B']
        },
        invitations: [],
        stats: {
          totalInvited: 0,
          completedRegistrations: 0,
          pendingRegistrations: 0,
          expiredInvitations: 0,
          averageCompletionTime: '0 days',
          completionRate: 0,
          activeReminders: 0,
          totalTeams: 0
        }
      };
      
      return mockData;
    },
    enabled: !!managerId && !!orgId,
  });
}

// Hook to get team invitations
export function useTeamInvitations(managerId: string, orgId: string) {
  return useQuery({
    queryKey: ['teamInvitations', managerId, orgId],
    queryFn: async (): Promise<TeamInvitation[]> => {
      
      // TODO: Replace with actual database query when team_invitations table exists
      // const { data, error } = await supabase
      //   .from('team_invitations')
      //   .select('*')
      //   .eq('manager_id', managerId)
      //   .eq('org_id', orgId)
      //   .order('invited_at', { ascending: false });

      // if (error) {
      //   console.error('Error fetching team invitations:', error);
      //   throw error;
      // }

      // Return empty array for now
      return [] as TeamInvitation[];
    },
    enabled: !!managerId && !!orgId,
  });
}

// Hook to get team stats
export function useTeamStats(managerId: string, orgId: string) {
  return useQuery({
    queryKey: ['teamStats', managerId, orgId],
    queryFn: async (): Promise<ManagerStats> => {
      
      // TODO: Calculate real stats from team_invitations and player_registry tables
      const mockStats: ManagerStats = {
        totalInvited: 0,
        completedRegistrations: 0,
        pendingRegistrations: 0,
        expiredInvitations: 0,
        averageCompletionTime: '0 days',
        completionRate: 0,
        activeReminders: 0,
        totalTeams: 1
      };
      
      return mockStats;
    },
    enabled: !!managerId && !!orgId,
  });
}

// Hook for bulk player invitations
export function useBulkInvite(managerId: string, orgId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: BulkInviteParams): Promise<TeamInvitation[]> => {
      // Create invitation records in database
      const invitations = params.emails.map(email => ({
        managerId,
        orgId,
        tournamentId: params.tournamentId || null,
        firstName: email.split('@')[0].split('.')[0] || 'Player', // Extract from email
        lastName: email.split('@')[0].split('.')[1] || 'Name',
        email,
        phoneNumber: null,
        position: params.positions && params.positions.length > 0 ? params.positions[0] : null,
        customMessage: params.customMessage || null,
      }));

      // Insert invitations into database
      const { data: insertedInvitations, error } = await supabase
        .from('team_invitations')
        .insert(invitations)
        .select('*');

      if (error) throw error;

      // Get manager and team data for email sending
      const { data: managerData, error: managerError } = await supabase
        .from('team_managers')
        .select('*')
        .eq('id', managerId)
        .single();

      if (managerError) throw managerError;

      const { data: teamData, error: teamError } = await supabase
        .from('teams')
        .select('*')
        .eq('manager_id', managerId)
        .single();

      if (teamError) {
        // If no team found, create a default team record
        console.warn('No team found for manager, using default team info');
      }

      // Send emails for all invitations
      if (insertedInvitations && managerData) {
        const emailResults = await invitationEmailService.sendBulkInvitations(
          insertedInvitations as TeamInvitation[],
          managerData as TeamManager,
          teamData as Team || {
            id: 'default',
            name: 'Team',
            orgId,
            tournamentId: null,
            managerId,
            clubName: null,
            registrationStatus: 'ACTIVE' as const,
            maxPlayers: 22,
            contactEmail: managerData.email,
            contactPhone: managerData.phoneNumber,
            homeVenue: null,
            foundedDate: null,
            description: null,
            logoUrl: null,
            createdAt: new Date(),
            updatedAt: new Date()
          }
        );

        console.log(`Sent ${emailResults.successful} out of ${emailResults.totalSent} emails`);
      }

      return insertedInvitations as TeamInvitation[];
      // const { data, error } = await supabase
      //   .from('team_invitations')
      //   .insert(
      //     params.emails.map(email => ({
      //       manager_id: managerId,
      //       org_id: orgId,
      //       tournament_id: params.tournamentId,
      //       email,
      //       custom_message: params.message,
      //       status: 'PENDING',
      //       invited_at: new Date().toISOString(),
      //       registration_link: generateRegistrationLink(email, orgId)
      //     }))
      //   )
      //   .select();

      // if (error) throw error;

      // For now, simulate success
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockInvitations: TeamInvitation[] = params.emails.map((email, index) => ({
        id: `invite-${Date.now()}-${index}`,
        managerId,
        orgId,
        tournamentId: params.tournamentId,
        firstName: email.split('@')[0].split('.')[0] || 'Player',
        lastName: email.split('@')[0].split('.')[1] || `${index + 1}`,
        email,
        invitedAt: new Date().toISOString(),
        registrationLink: `https://jamiitourney.com/register/${generateId()}`,
        status: 'PENDING',
        remindersSent: 0,
        customMessage: params.message
      }));

      return mockInvitations;
    },
    onSuccess: () => {
      // Invalidate related queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['teamInvitations', managerId, orgId] });
      queryClient.invalidateQueries({ queryKey: ['teamStats', managerId, orgId] });
      queryClient.invalidateQueries({ queryKey: ['managerDashboard', managerId, orgId] });
    }
  });
}

// Hook for resending invitations
export function useResendInvitations(managerId: string, orgId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ invitationIds }: { invitationIds: string[] }): Promise<void> => {
      // Send reminder emails using the email service
      const emailResults = await invitationEmailService.sendReminderEmails(invitationIds);
      
      console.log(`Resent ${emailResults.successful} out of ${emailResults.totalSent} reminder emails`);
      // const { error } = await supabase
      //   .from('team_invitations')
      //   .update({
      //     reminders_sent: supabase.raw('reminders_sent + 1'),
      //     last_reminder_at: new Date().toISOString()
      //   })
      //   .in('id', invitationIds);

      // if (error) throw error;

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teamInvitations', managerId, orgId] });
      queryClient.invalidateQueries({ queryKey: ['teamStats', managerId, orgId] });
    }
  });
}

// Hook to get manager teams
export function useManagerTeams(managerId: string, orgId: string) {
  return useQuery({
    queryKey: ['managerTeams', managerId, orgId],
    queryFn: async () => {
      
      // TODO: Query actual teams table when available
      // const { data, error } = await supabase
      //   .from('teams')
      //   .select('*')
      //   .eq('manager_id', managerId)
      //   .eq('org_id', orgId);

      // if (error) throw error;

      // Return mock teams for now
      return [
        {
          id: 'team-1',
          name: 'Parklands FC',
          sport: 'Football',
          division: 'Premier League',
          players: 15,
          status: 'ACTIVE'
        }
      ];
    },
    enabled: !!managerId && !!orgId,
  });
}

// Hook for tournament selection
export function useAvailableTournaments(orgId: string) {
  return useQuery({
    queryKey: ['availableTournaments', orgId],
    queryFn: async () => {
      
      // TODO: Query actual tournaments table
      // const { data, error } = await supabase
      //   .from('tournaments')
      //   .select('id, name, sport, status, registration_deadline')
      //   .eq('org_id', orgId)
      //   .eq('status', 'REGISTRATION')
      //   .order('registration_deadline');

      // if (error) throw error;

      // Return mock tournaments
      return [
        {
          id: 'tournament-1',
          name: 'Nairobi County Championship',
          sport: 'Football',
          status: 'REGISTRATION',
          registrationDeadline: '2024-12-15'
        },
        {
          id: 'tournament-2',
          name: 'Inter-Ward League',
          sport: 'Football',
          status: 'REGISTRATION',
          registrationDeadline: '2024-11-30'
        }
      ];
    },
    enabled: !!orgId,
  });
}

// Utility function to generate unique IDs
function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

// Utility function to generate registration links
function generateRegistrationLink(email: string, orgId: string): string {
  const token = btoa(`${email}:${orgId}:${Date.now()}`);
  return `https://jamiitourney.com/register/${token}`;
}

// Hook for invitation analytics
export function useInvitationAnalytics(managerId: string, orgId: string, timeRange: 'week' | 'month' | 'quarter' = 'month') {
  return useQuery({
    queryKey: ['invitationAnalytics', managerId, orgId, timeRange],
    queryFn: async () => {
      // TODO: Implement actual analytics queries
      const mockAnalytics = {
        invitationTrends: [
          { date: '2024-10-01', sent: 5, completed: 2 },
          { date: '2024-10-08', sent: 8, completed: 3 },
          { date: '2024-10-15', sent: 12, completed: 7 },
          { date: '2024-10-22', sent: 6, completed: 4 },
          { date: '2024-10-29', sent: 10, completed: 6 }
        ],
        completionByPosition: [
          { position: 'Forward', completed: 8, total: 12 },
          { position: 'Midfielder', completed: 6, total: 10 },
          { position: 'Defender', completed: 9, total: 11 },
          { position: 'Goalkeeper', completed: 2, total: 3 }
        ],
        averageResponseTime: {
          fastest: '2 hours',
          slowest: '5 days',
          average: '1.5 days'
        },
        reminderEffectiveness: {
          firstReminder: 65,
          secondReminder: 25,
          thirdReminder: 10
        }
      };

      return mockAnalytics;
    },
    enabled: !!managerId && !!orgId,
  });
}