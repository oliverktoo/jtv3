import { useQuery } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";

export interface PlayerProfile {
  id: string;
  org_id: string;
  hashed_identity_keys: string;
  first_name: string;
  last_name: string;
  dob: string;
  sex: "MALE" | "FEMALE" | "OTHER";
  nationality: string;
  photo_path?: string;
  ward_id?: string;
  status: "ACTIVE" | "INACTIVE" | "SUSPENDED" | "RETIRED";
  registration_status: "DRAFT" | "SUBMITTED" | "IN_REVIEW" | "APPROVED" | "REJECTED" | "SUSPENDED" | "INCOMPLETE";
  email?: string;
  phone?: string;
  created_at: string;
  updated_at: string;
}

export interface PlayerDocument {
  id: string;
  upid: string;
  document_type: string;
  file_path: string;
  verification_status: "PENDING" | "VERIFIED" | "REJECTED";
  uploaded_at: string;
  verified_at?: string;
  verified_by?: string;
  rejection_reason?: string;
}

export interface PlayerConsent {
  id: string;
  upid: string;
  consent_type: "PLAYER_TERMS" | "DATA_PROCESSING" | "MEDIA_CONSENT" | "GUARDIAN_CONSENT";
  is_consented: boolean;
  consent_timestamp?: string;
  withdrawal_timestamp?: string;
  consent_version: string;
}

export interface TournamentParticipation {
  id: string;
  tournament_name: string;
  tournament_status: "DRAFT" | "REGISTRATION" | "ACTIVE" | "COMPLETED" | "ARCHIVED";
  registration_date: string;
  player_status: "REGISTERED" | "CONFIRMED" | "WITHDRAWN";
  team_name?: string;
}

// Hook to get all players for selection
export function useAllPlayers(orgId: string) {
  return useQuery({
    queryKey: ['allPlayers', orgId],
    queryFn: async () => {
      console.log('Fetching all players for orgId:', orgId);
      
      const { data, error } = await supabase
        .from('player_registry')
        .select('*')
        .eq('org_id', orgId)
        .order('created_at', { ascending: false });
        
      if (error) {
        console.error('Error fetching players:', error);
        throw error;
      }
      
      console.log('Players fetched:', data?.length || 0, 'records');
      return data as PlayerProfile[];
    },
    enabled: !!orgId,
  });
}

// Hook to get player profile by ID
export function usePlayerProfile(playerId: string) {
  return useQuery({
    queryKey: ['playerProfile', playerId],
    queryFn: async () => {
      if (!playerId) {
        throw new Error('Player ID is required');
      }
      
      console.log('Fetching player profile for ID:', playerId);
      
      const { data, error } = await supabase
        .from('player_registry')
        .select(`
          *,
          ward:wards!ward_id (
            id,
            name,
            sub_county:sub_counties!sub_county_id (
              name,
              county:counties!county_id (
                name
              )
            )
          )
        `)
        .eq('id', playerId)
        .single();
        
      if (error) {
        console.error('Error fetching player profile:', error);
        throw error;
      }
      
      console.log('Player profile fetched:', data);
      return data as PlayerProfile & {
        ward?: {
          id: string;
          name: string;
          sub_county?: {
            name: string;
            county?: {
              name: string;
            };
          };
        };
      };
    },
    enabled: !!playerId,
  });
}

// Hook to get player documents
export function usePlayerDocuments(playerId: string) {
  return useQuery({
    queryKey: ['playerDocuments', playerId],
    queryFn: async () => {
      if (!playerId) {
        throw new Error('Player ID is required');
      }
      
      console.log('Fetching player documents for ID:', playerId);
      
      const { data, error } = await supabase
        .from('player_documents')
        .select('*')
        .eq('upid', playerId)
        .order('created_at', { ascending: false });
        
      if (error) {
        console.error('Error fetching player documents:', error);
        throw error;
      }
      
      console.log('Player documents fetched:', data?.length || 0, 'records');
      
      // Transform to match expected interface
      const transformedDocs = data?.map(doc => ({
        id: doc.id,
        upid: doc.upid,
        document_type: doc.doc_type,
        file_path: doc.document_path,
        verification_status: doc.verified ? 'VERIFIED' as const : 'PENDING' as const,
        uploaded_at: doc.created_at,
        verified_at: doc.verified_at || undefined,
        verified_by: doc.uploaded_by || undefined,
        rejection_reason: undefined // Not in current schema
      })) || [];
      
      return transformedDocs as PlayerDocument[];
    },
    enabled: !!playerId,
  });
}

// Hook to get player consents
export function usePlayerConsents(playerId: string) {
  return useQuery({
    queryKey: ['playerConsents', playerId],
    queryFn: async () => {
      if (!playerId) {
        throw new Error('Player ID is required');
      }
      
      console.log('Fetching player consents for ID:', playerId);
      
      const { data, error } = await supabase
        .from('player_consents')
        .select('*')
        .eq('upid', playerId)
        .order('created_at', { ascending: false });
        
      if (error) {
        console.error('Error fetching player consents:', error);
        throw error;
      }
      
      console.log('Player consents fetched:', data?.length || 0, 'records');
      
      // Transform to match expected interface  
      const transformedConsents = data?.map(consent => ({
        id: consent.id,
        upid: consent.upid,
        consent_type: consent.consent_type as "PLAYER_TERMS" | "DATA_PROCESSING" | "MEDIA_CONSENT" | "GUARDIAN_CONSENT",
        is_consented: consent.granted,
        consent_timestamp: consent.granted_at,
        withdrawal_timestamp: undefined, // Not in current schema
        consent_version: consent.version?.toString() || '1'
      })) || [];
      
      return transformedConsents as PlayerConsent[];
    },
    enabled: !!playerId,
  });
}

// Hook to get tournament participation history
export function useTournamentParticipation(playerId: string) {
  return useQuery({
    queryKey: ['tournamentParticipation', playerId],
    queryFn: async () => {
      if (!playerId) {
        throw new Error('Player ID is required');
      }
      
      // This would join with tournaments and tournament_players tables
      // For now, return mock data since we need to set up those relationships
      console.log('Mock tournament participation for playerId:', playerId);
      const mockData: TournamentParticipation[] = [
        {
          id: '1',
          tournament_name: 'Nairobi County Championship 2024',
          tournament_status: 'COMPLETED',
          registration_date: '2024-01-15',
          player_status: 'CONFIRMED',
          team_name: 'Nairobi Stars FC'
        },
        {
          id: '2', 
          tournament_name: 'Central Kenya League',
          tournament_status: 'ACTIVE',
          registration_date: '2024-10-01',
          player_status: 'REGISTERED',
          team_name: 'Kiambu United'
        }
      ];
      
      // TODO: Replace with actual query when tournament tables are set up
      return mockData;
    },
    enabled: !!playerId,
  });
}

// Hook to get player statistics
export function usePlayerStats(playerId: string) {
  return useQuery({
    queryKey: ['playerStats', playerId],
    queryFn: async () => {
      if (!playerId) {
        throw new Error('Player ID is required');
      }
      
      console.log('Calculating player stats for ID:', playerId);
      
      try {
        // Get documents count
        const { data: documents, error: docsError } = await supabase
          .from('player_documents')
          .select('id, verified')
          .eq('upid', playerId);
          
        if (docsError) throw docsError;
        
        // Get consents count  
        const { data: consents, error: consentsError } = await supabase
          .from('player_consents')
          .select('id')
          .eq('upid', playerId);
          
        if (consentsError) throw consentsError;
        
        // Get player registration status
        const { data: player, error: playerError } = await supabase
          .from('player_registry')
          .select('registration_status')
          .eq('id', playerId)
          .single();
          
        if (playerError) throw playerError;

        const stats = {
          totalTournaments: 0, // TODO: Implement when tournament tables are set up
          activeTournaments: 0, // TODO: Implement when tournament tables are set up
          documentsUploaded: documents?.length || 0,
          documentsVerified: documents?.filter(doc => doc.verified).length || 0,
          registrationStatus: player?.registration_status || 'DRAFT',
        };

        console.log('Player stats calculated:', stats);
        return stats;
      } catch (error) {
        console.error('Error calculating player stats:', error);
        // Return default stats on error
        return {
          totalTournaments: 0,
          activeTournaments: 0,
          documentsUploaded: 0,
          documentsVerified: 0,
          registrationStatus: 'DRAFT' as const,
        };
      }
    },
    enabled: !!playerId,
  });
}