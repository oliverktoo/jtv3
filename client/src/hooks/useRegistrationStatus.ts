import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { toast } from './use-toast';

export type RegistrationStatus = 
  | 'DRAFT'           // Initial state - player started but hasn't submitted
  | 'SUBMITTED'       // Player completed all steps and submitted
  | 'IN_REVIEW'       // Admin is reviewing documents/eligibility
  | 'APPROVED'        // All checks passed, player is verified
  | 'REJECTED'        // Failed verification, needs correction
  | 'SUSPENDED'       // Temporary suspension (disciplinary)
  | 'INCOMPLETE';     // Missing required documents/information

export type StatusTransition = {
  id: string;
  playerId: string;
  fromStatus: RegistrationStatus | null;
  toStatus: RegistrationStatus;
  reason?: string;
  adminId?: string;
  adminNotes?: string;
  createdAt: string;
  automaticTransition: boolean;
};

export type RegistrationNotification = {
  id: string;
  playerId: string;
  type: 'STATUS_CHANGE' | 'DOCUMENT_REQUIRED' | 'VERIFICATION_COMPLETE' | 'ACTION_REQUIRED';
  title: string;
  message: string;
  status: RegistrationStatus;
  actionRequired?: boolean;
  actionUrl?: string;
  readAt?: string;
  createdAt: string;
};

// Hook to get current registration status
export function useRegistrationStatus(playerId: string) {
  return useQuery({
    queryKey: ['registrationStatus', playerId],
    queryFn: async () => {
      console.log('Fetching registration status for playerId:', playerId);
      
      const { data, error } = await supabase
        .from('player_registry')
        .select('registration_status, updated_at')
        .eq('id', playerId)
        .single();
      
      if (error) {
        console.error('Error fetching registration status:', error);
        throw error;
      }
      
      console.log('Registration status data:', data);
      return {
        status: data.registration_status as RegistrationStatus,
        lastUpdated: data.updated_at
      };
    },
    enabled: !!playerId,
  });
}

// Hook to get status transition history
export function useStatusTransitions(playerId: string) {
  return useQuery({
    queryKey: ['statusTransitions', playerId],
    queryFn: async () => {
      console.log('Mock status transitions for playerId:', playerId);
      // Return empty array since player_status_transitions table doesn't exist yet
      return [] as StatusTransition[];
    },
    enabled: !!playerId,
  });
}

// Hook to get player notifications
export function usePlayerNotifications(playerId: string) {
  return useQuery({
    queryKey: ['playerNotifications', playerId],
    queryFn: async () => {
      console.log('Mock player notifications for playerId:', playerId);
      // Return empty array since player_notifications table doesn't exist yet
      return [] as RegistrationNotification[];
    },
    enabled: !!playerId,
  });
}

// Hook to transition registration status
export function useUpdateRegistrationStatus() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (params: {
      playerId: string;
      newStatus: RegistrationStatus;
      reason?: string;
      adminNotes?: string;
      automatic?: boolean;
    }) => {
      const { playerId, newStatus, reason, adminNotes, automatic = false } = params;
      
      // Get current status first
      const { data: currentPlayer } = await supabase
        .from('player_registry')
        .select('status')
        .eq('id', playerId)
        .single();
      
      if (!currentPlayer) throw new Error('Player not found');
      
      const currentStatus = currentPlayer.status as RegistrationStatus;
      
      // Validate transition is allowed
      const allowedTransitions = getAllowedTransitions(currentStatus);
      if (!allowedTransitions.includes(newStatus)) {
        throw new Error(`Invalid transition from ${currentStatus} to ${newStatus}`);
      }
      
      // Update player status
      const { error: updateError } = await supabase
        .from('player_registry')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', playerId);
      
      if (updateError) throw updateError;
      
      // Record transition history
      const { error: transitionError } = await supabase
        .from('player_status_transitions')
        .insert({
          player_id: playerId,
          from_status: currentStatus,
          to_status: newStatus,
          reason: reason,
          admin_notes: adminNotes,
          automatic_transition: automatic,
          created_at: new Date().toISOString()
        });
      
      if (transitionError) throw transitionError;
      
      // Create notification for status change
      const notification = getStatusChangeNotification(newStatus, reason);
      const { error: notificationError } = await supabase
        .from('player_notifications')
        .insert({
          player_id: playerId,
          type: 'STATUS_CHANGE',
          title: notification.title,
          message: notification.message,
          status: newStatus,
          action_required: notification.actionRequired,
          action_url: notification.actionUrl,
          created_at: new Date().toISOString()
        });
      
      if (notificationError) throw notificationError;
      
      return { currentStatus, newStatus, reason };
    },
    onSuccess: (result, variables) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['registrationStatus', variables.playerId] });
      queryClient.invalidateQueries({ queryKey: ['statusTransitions', variables.playerId] });
      queryClient.invalidateQueries({ queryKey: ['playerNotifications', variables.playerId] });
      queryClient.invalidateQueries({ queryKey: ['playerProfile', variables.playerId] });
      
      // Show success toast
      toast({
        title: 'Status Updated',
        description: `Registration status changed from ${result.currentStatus} to ${result.newStatus}`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Status Update Failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

// Hook to mark notifications as read
export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (notificationId: string) => {
      const { error } = await supabase
        .from('player_notifications')
        .update({ read_at: new Date().toISOString() })
        .eq('id', notificationId);
      
      if (error) throw error;
      return notificationId;
    },
    onSuccess: (_, notificationId) => {
      queryClient.invalidateQueries({ queryKey: ['playerNotifications'] });
    },
  });
}

// Helper function to get allowed status transitions
function getAllowedTransitions(currentStatus: RegistrationStatus): RegistrationStatus[] {
  const transitions: Record<RegistrationStatus, RegistrationStatus[]> = {
    DRAFT: ['SUBMITTED', 'INCOMPLETE'],
    SUBMITTED: ['IN_REVIEW', 'INCOMPLETE'],
    IN_REVIEW: ['APPROVED', 'REJECTED', 'INCOMPLETE'],
    APPROVED: ['SUSPENDED', 'IN_REVIEW'], // Can be re-reviewed if issues found
    REJECTED: ['DRAFT', 'IN_REVIEW'], // Can restart or be re-reviewed after corrections
    SUSPENDED: ['IN_REVIEW', 'APPROVED'], // Can be reinstated
    INCOMPLETE: ['DRAFT', 'SUBMITTED'] // Can restart or resubmit when complete
  };
  
  return transitions[currentStatus] || [];
}

// Helper function to generate status change notifications
function getStatusChangeNotification(status: RegistrationStatus, reason?: string): {
  title: string;
  message: string;
  actionRequired: boolean;
  actionUrl?: string;
} {
  switch (status) {
    case 'SUBMITTED':
      return {
        title: 'Registration Submitted Successfully',
        message: 'Your registration has been submitted and is now under review. We will notify you once the review is complete.',
        actionRequired: false
      };
    
    case 'IN_REVIEW':
      return {
        title: 'Registration Under Review',
        message: 'Our team is reviewing your registration documents and eligibility. This process typically takes 2-3 business days.',
        actionRequired: false
      };
    
    case 'APPROVED':
      return {
        title: 'Registration Approved! 🎉',
        message: 'Congratulations! Your registration has been approved and you can now participate in tournaments.',
        actionRequired: false,
        actionUrl: '/tournaments'
      };
    
    case 'REJECTED':
      return {
        title: 'Registration Requires Attention',
        message: `Your registration needs some corrections. ${reason || 'Please review the requirements and resubmit.'}`,
        actionRequired: true,
        actionUrl: '/profile'
      };
    
    case 'INCOMPLETE':
      return {
        title: 'Registration Incomplete',
        message: `Please complete your registration. ${reason || 'Some required information or documents are missing.'}`,
        actionRequired: true,
        actionUrl: '/register'
      };
    
    case 'SUSPENDED':
      return {
        title: 'Registration Suspended',
        message: `Your registration has been temporarily suspended. ${reason || 'Please contact support for more information.'}`,
        actionRequired: true,
        actionUrl: '/support'
      };
    
    default:
      return {
        title: 'Status Updated',
        message: 'Your registration status has been updated.',
        actionRequired: false
      };
  }
}

// Hook for automatic status transitions based on conditions
export function useAutoStatusTransition() {
  const updateStatus = useUpdateRegistrationStatus();
  
  const checkAndTransition = async (playerId: string) => {
    try {
      // Get player data with documents and consents
      const { data: player } = await supabase
        .from('player_registry')
        .select(`
          id,
          status,
          first_name,
          last_name,
          dob,
          sex,
          nationality,
          id_number,
          phone_number,
          email
        `)
        .eq('id', playerId)
        .single();
      
      if (!player) return;
      
      const { data: documents } = await supabase
        .from('player_documents')
        .select('document_type, verification_status')
        .eq('player_id', playerId);
      
      const { data: consents } = await supabase
        .from('player_consents')
        .select('consent_type, granted')
        .eq('upid', playerId)
        .eq('granted', true);
      
      const currentStatus = player.status as RegistrationStatus;
      
      // Check if all required data is complete
      const hasRequiredPersonalInfo = !!(
        player.first_name && 
        player.last_name && 
        player.dob && 
        player.sex &&
        player.nationality &&
        player.id_number &&
        player.phone_number && 
        player.email
      );
      
      const requiredDocuments = ['NATIONAL_ID', 'SELFIE'];
      const uploadedDocs = documents?.map(d => d.document_type) || [];
      const hasRequiredDocuments = requiredDocuments.every(doc => uploadedDocs.includes(doc));
      
      const requiredConsents = ['TERMS_CONDITIONS', 'DATA_PROCESSING'];
      const grantedConsents = consents?.map(c => c.consent_type) || [];
      const hasRequiredConsents = requiredConsents.every(consent => grantedConsents.includes(consent));
      
      const verifiedDocs = documents?.filter(d => d.verification_status === 'VERIFIED') || [];
      const allDocsVerified = uploadedDocs.length > 0 && verifiedDocs.length === uploadedDocs.length;
      
      // Determine appropriate status transition
      if (currentStatus === 'DRAFT') {
        if (hasRequiredPersonalInfo && hasRequiredDocuments && hasRequiredConsents) {
          await updateStatus.mutateAsync({
            playerId,
            newStatus: 'SUBMITTED',
            reason: 'All required information completed',
            automatic: true
          });
        }
      } else if (currentStatus === 'SUBMITTED') {
        if (!hasRequiredPersonalInfo || !hasRequiredDocuments || !hasRequiredConsents) {
          await updateStatus.mutateAsync({
            playerId,
            newStatus: 'INCOMPLETE',
            reason: 'Missing required information or documents',
            automatic: true
          });
        } else {
          await updateStatus.mutateAsync({
            playerId,
            newStatus: 'IN_REVIEW',
            reason: 'Submitted for administrative review',
            automatic: true
          });
        }
      } else if (currentStatus === 'IN_REVIEW') {
        if (allDocsVerified) {
          await updateStatus.mutateAsync({
            playerId,
            newStatus: 'APPROVED',
            reason: 'All documents verified and eligibility confirmed',
            automatic: true
          });
        }
      }
      
    } catch (error) {
      console.error('Auto status transition failed:', error);
    }
  };
  
  return { checkAndTransition };
}