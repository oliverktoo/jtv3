import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import { toast } from "@/hooks/use-toast";
import { useAutoStatusTransition } from "./useRegistrationStatus";

// Helper function to create identity hash
async function createIdentityHash(orgId: string, type: string, value: string): Promise<string> {
  const salt = "jamii-tourney-salt"; // In production, use process.env.HASH_SALT
  const encoder = new TextEncoder();
  const data = encoder.encode(`${orgId}:${type}:${value}:${salt}`);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Types based on our schema
export interface PlayerRegistration {
  id: number;
  upid: string;
  identityKeyHash: string;
  firstName: string;
  lastName: string;
  dob: string;
  nationality?: string;
  sex: "MALE" | "FEMALE" | "OTHER";
  email?: string;
  phone?: string;
  wardId?: number;
  profileImage?: string;
  orgId: string;
  registrationStatus?: "DRAFT" | "SUBMITTED" | "IN_REVIEW" | "APPROVED" | "REJECTED" | "SUSPENDED" | "INCOMPLETE";
  status?: string;
  selfiePath?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  guardianName?: string;
  guardianPhone?: string;
  guardianEmail?: string;
  guardianRelationship?: string;
  medicalClearanceDate?: string;
  medicalClearanceStatus?: "VALID" | "EXPIRED" | "PENDING" | "REJECTED";
  medicalExpiryDate?: string;
  preferredPosition?: string;
  shirtNumber?: number;
  eligibilityStatus?: string;
  lastEligibilityCheck?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface PlayerConsent {
  id: string;
  upid: string;
  orgId: string;
  consentType: "PLAYER_TERMS" | "DATA_PROCESSING" | "MEDIA_CONSENT" | "GUARDIAN_CONSENT";
  isConsented: boolean;
  consentTimestamp?: string;
  withdrawalTimestamp?: string;
  consentVersion: string;
  ipAddress?: string;
  userAgent?: string;
  guardianName?: string;
  guardianRelationship?: string;
  guardianSignature?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface NewPlayerRegistration {
  orgId: string;
  firstName: string;
  lastName: string;
  dob: string;
  sex: "MALE" | "FEMALE" | "OTHER";
  email?: string;
  phone?: string;
  nationality?: string;
  wardId?: number;
  selfiePath?: string;
}

// Hook to start a new player registration
export function useStartPlayerRegistration() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: NewPlayerRegistration) => {
      // Generate identity hash for duplicate detection (similar to server-side logic)
      const generateIdentityHash = async (orgId: string, firstName: string, lastName: string, dob: string) => {
        const identity = `${orgId}:NAME_DOB:${firstName}${lastName}${dob}`;
        const encoder = new TextEncoder();
        const data = encoder.encode(identity);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      };

      const hashedIdentityKeys = await generateIdentityHash(
        data.orgId, 
        data.firstName, 
        data.lastName, 
        data.dob
      );

      // Insert new player record using Supabase client
      const { data: playerData, error } = await supabase
        .from('player_registry')
        .insert({
          org_id: data.orgId,
          first_name: data.firstName,
          last_name: data.lastName,
          email: data.email,
          phone: data.phone,
          dob: data.dob,
          sex: data.sex,
          nationality: data.nationality || 'KENYA',
          ward_id: data.wardId,
          photo_path: data.selfiePath,
          hashed_identity_keys: hashedIdentityKeys,
          registration_status: 'DRAFT',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        throw new Error(error.message || 'Failed to start registration');
      }

      return {
        upid: playerData.id, // Use player_registry.id as upid for other tables
        playerId: playerData.id,
        status: playerData.registration_status,
        firstName: playerData.first_name,
        lastName: playerData.last_name
      };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['players'] });
      toast({
        title: "Registration Started",
        description: `Draft registration created for ${data.firstName} ${data.lastName}. UPID: ${data.upid}`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Registration Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });
}

// Hook to get player by UPID
export function usePlayerByUpid(upid?: string) {
  return useQuery({
    queryKey: ['player', upid],
    queryFn: async () => {
      if (!upid) return null;
      
      // Try backend API first, fallback to Supabase
      try {
        const response = await fetch(`/api/player-registration/${upid}/status`);
        if (response.ok) {
          return await response.json();
        }
      } catch (error) {
        console.warn('Backend API unavailable, using Supabase fallback');
      }
      
      // Fallback to Supabase
      const { data, error } = await supabase
        .from('player_registry')
        .select('*')
        .eq('id', upid)  // Use 'id' column, not 'upid'
        .single();
        
      if (error) throw error;
      return data as PlayerRegistration;
    },
    enabled: !!upid
  });
}

// Hook to get player by ID (for backward compatibility)
export function usePlayerById(playerId?: string) {
  return useQuery({
    queryKey: ['player', playerId],
    queryFn: async () => {
      if (!playerId) return null;
      
      const { data, error } = await supabase
        .from('player_registry')
        .select('*')
        .eq('id', playerId)
        .single();
        
      if (error) throw error;
      return data as PlayerRegistration;
    },
    enabled: !!playerId
  });
}



// Hook to update player registration
export function useUpdatePlayerRegistration() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ upid, updates }: { upid: string; updates: Partial<PlayerRegistration> }) => {
      // Convert camelCase to snake_case for database
      const updateData: any = {
        updated_at: new Date().toISOString()
      };
      
      if (updates.firstName) updateData.first_name = updates.firstName;
      if (updates.lastName) updateData.last_name = updates.lastName;
      if (updates.email) updateData.email = updates.email;
      if (updates.phone) updateData.phone = updates.phone;
      if (updates.nationality) updateData.nationality = updates.nationality;
      if (updates.wardId) updateData.ward_id = updates.wardId;
      if (updates.profileImage) updateData.profile_image = updates.profileImage;
      if (updates.registrationStatus) updateData.registration_status = updates.registrationStatus;
      if (updates.status) updateData.status = updates.status;
      
      const { data, error } = await supabase
        .from('player_registry')
        .update(updateData)
        .eq('id', upid)  // Use 'id' column, not 'upid'
        .select()
        .single();
        
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['player', data.id] });
      queryClient.invalidateQueries({ queryKey: ['players'] });
      toast({
        title: "Registration Updated",
        description: "Player registration has been updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });
}

// Hook to submit registration for review
export function useSubmitRegistration() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (upid: string) => {
      // Update status to submitted using Supabase client
      const { data, error } = await supabase
        .from('player_registry')
        .update({ 
          registration_status: 'SUBMITTED',
          updated_at: new Date().toISOString()
        })
        .eq('id', upid)  // Use 'id' column, not 'upid'
        .select()
        .single();

      if (error) {
        throw new Error(error.message || 'Failed to submit registration');
      }

      return { success: true, data };
    },
    onSuccess: (result, upid) => {
      queryClient.invalidateQueries({ queryKey: ['player', upid] });
      toast({
        title: "Registration Submitted",
        description: "Your registration has been submitted for review",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Submission Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });
}

// Hook to review registration (approve/reject/request changes)
export function useReviewRegistration() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      upid, 
      action, 
      comments 
    }: { 
      upid: string; 
      action: 'approve' | 'reject' | 'request_changes';
      comments?: string;
    }) => {
      let decision: string;
      
      switch (action) {
        case "approve":
          decision = "APPROVED";
          break;
        case "reject":
          decision = "REJECTED";
          break;
        case "request_changes":
          decision = "IN_REVIEW";
          break;
        default:
          throw new Error("Invalid action");
      }
      
      // Use the new backend API endpoint
      const response = await fetch(`/api/player-registration/${upid}/review`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          decision,
          reason: comments,
          adminNotes: comments
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to review registration');
      }

      const result = await response.json();
      return { player: result, action, comments };
    },
    onSuccess: ({ player, action }) => {
      queryClient.invalidateQueries({ queryKey: ['player', player.upid] });
      queryClient.invalidateQueries({ queryKey: ['players'] });
      toast({
        title: `Registration ${action === 'approve' ? 'Approved' : action === 'reject' ? 'Rejected' : 'Changes Requested'}`,
        description: `Registration for ${player.firstName} ${player.lastName} has been ${action}d`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Review Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });
}

// Hook to record player consent
export function useRecordConsent() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (consentData: {
      upid: string;
      consentType: string;
      isConsented: boolean;
      guardianName?: string;
      guardianRelationship?: string;
    }) => {
      console.log('Recording consent:', consentData);
      // Map consent types to database enum values - handle exact field names from PlayerRegistration component
      const consentTypeMapping: Record<string, string> = {
        'playerTermsConsent': 'PLAYER_TERMS',
        'dataProcessingConsent': 'DATA_PROCESSING',
        'mediaConsent': 'MEDIA_CONSENT',
        'guardianConsent': 'GUARDIAN_CONSENT',
        // Backward compatibility mappings
        'playerTerms': 'PLAYER_TERMS',
        'dataProcessing': 'DATA_PROCESSING', 
        'player_terms': 'PLAYER_TERMS',
        'data_processing': 'DATA_PROCESSING',
        'media_consent': 'MEDIA_CONSENT',
        'guardian_consent': 'GUARDIAN_CONSENT'
      };

      const mappedConsentType = consentTypeMapping[consentData.consentType] || 'PLAYER_TERMS';
      console.log(`Mapping consent type: ${consentData.consentType} -> ${mappedConsentType}`);

      // Handle media consent gracefully if database doesn't support it yet
      if (mappedConsentType === 'MEDIA_CONSENT') {
        // First try to insert with MEDIA_CONSENT
        const { data: testData, error: testError } = await supabase
          .from('player_consents')
          .insert({
            upid: consentData.upid,
            consent_type: 'MEDIA_CONSENT',
            granted: consentData.isConsented,
            granted_at: new Date().toISOString(),
            ip_address: '127.0.0.1',
            user_agent: navigator.userAgent,
            version: 1
          })
          .select()
          .single();

        if (testError && testError.message.includes('invalid input value for enum')) {
          console.warn('⚠️ MEDIA_CONSENT not supported in database yet. Skipping media consent recording.');
          // Return success but indicate it was skipped
          return { 
            success: true, 
            data: null, 
            message: 'Media consent acknowledged (database update needed to persist)' 
          };
        } else if (testError) {
          throw new Error(testError.message || 'Failed to record media consent');
        } else {
          return { success: true, data: testData, message: `Media consent recorded successfully` };
        }
      }

      // Insert consent record using Supabase client with correct field names from actual database
      const { data, error } = await supabase
        .from('player_consents')
        .insert({
          upid: consentData.upid,
          consent_type: mappedConsentType,
          granted: consentData.isConsented, // Correct field name: 'granted' not 'is_consented'
          granted_at: new Date().toISOString(), // Correct field name: 'granted_at' not 'consent_timestamp'
          ip_address: '127.0.0.1',
          user_agent: navigator.userAgent,
          version: 1 // Correct field name: 'version' not 'consent_version', and it's an integer
        })
        .select()
        .single();

      if (error) {
        throw new Error(error.message || 'Failed to record consent');
      }

      return { success: true, data, message: `${consentData.consentType} consent recorded successfully` };
    },
    onSuccess: (result, variables) => {
      queryClient.invalidateQueries({ queryKey: ['consents', variables.upid] });
      console.log('✅ Consent recorded successfully:', result);
      toast({
        title: "Consent Recorded",
        description: result.message || `${variables.consentType} consent has been ${variables.isConsented ? 'given' : 'withdrawn'}`,
      });
    },
    onError: (error: any) => {
      console.error('❌ Consent recording failed:', error);
      toast({
        title: "Consent Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });
}

// Hook to get player consents
export function usePlayerConsents(upid?: string) {
  return useQuery({
    queryKey: ['consents', upid],
    queryFn: async () => {
      if (!upid) return [];
      
      const { data, error } = await supabase
        .from('player_consents')
        .select('*')
        .eq('upid', upid)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      return data as PlayerConsent[];
    },
    enabled: !!upid
  });
}

// Hook to update medical clearance
export function useUpdateMedicalClearance() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      upid, 
      medicalData 
    }: { 
      upid: string; 
      medicalData: {
        status?: "VALID" | "EXPIRED" | "PENDING" | "REJECTED";
        clearanceDate?: string;
        expiryDate?: string;
        notes?: string;
      }
    }) => {
      // Use the new backend API endpoint
      const response = await fetch(`/api/player-registration/${upid}/medical`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(medicalData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update medical clearance');
      }

      return await response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['player', data.upid] });
      toast({
        title: "Medical Clearance Updated",
        description: "Medical clearance status has been updated",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Medical Update Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });
}

// Hook to upload player documents
export function useUploadPlayerDocument() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      upid, 
      file, 
      docType 
    }: { 
      upid: string; 
      file: File; 
      docType: "ID_CARD" | "BIRTH_CERTIFICATE" | "PASSPORT" | "MEDICAL_CERTIFICATE" | "PHOTO" | "GUARDIAN_ID";
    }) => {
      // Upload file to Supabase Storage using existing uploadFile function
      const uploadResult = await import('../lib/fileUpload').then(module => 
        module.uploadFile(file, 'player-documents', 'documents')
      );

      if (!uploadResult.success) {
        throw new Error(uploadResult.error || 'Failed to upload document');
      }

      // Map frontend document types to database enum values
      const docTypeMapping: Record<string, string> = {
        'ID_CARD': 'NATIONAL_ID',
        'BIRTH_CERTIFICATE': 'BIRTH_CERTIFICATE', 
        'PASSPORT': 'PASSPORT',
        'MEDICAL_CERTIFICATE': 'OTHER',
        'PHOTO': 'OTHER',
        'GUARDIAN_ID': 'NATIONAL_ID' // Guardian ID maps to NATIONAL_ID but we'll track it separately
      };

      const mappedDocType = docTypeMapping[docType] || 'OTHER';

      // Generate a simple hash for doc_number_hash (required field)
      const generateSimpleHash = (upid: string, docType: string) => {
        const data = `${upid}:${docType}:${Date.now()}`;
        return btoa(data).replace(/[+/=]/g, '').substring(0, 32);
      };

      // Record document in database using correct schema
      // Use doc_number_hash prefix to distinguish guardian documents
      const hashPrefix = docType === 'GUARDIAN_ID' ? 'GUARDIAN_' : '';
      const documentHash = hashPrefix + generateSimpleHash(upid, docType);
      
      const { data, error } = await supabase
        .from('player_documents')
        .insert({
          upid: upid,
          doc_type: mappedDocType,
          doc_number_hash: documentHash,
          document_path: uploadResult.url || uploadResult.path,
          verified: false,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        throw new Error(error.message || 'Failed to record document');
      }

      return { success: true, data };
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['player-documents', variables.upid] });
      toast({
        title: "Document Uploaded",
        description: `${variables.docType} has been uploaded successfully`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Upload Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });
}

// Hook to get player documents
export function usePlayerDocuments(upid?: string) {
  return useQuery({
    queryKey: ['player-documents', upid],
    queryFn: async () => {
      if (!upid) return [];
      
      // Use Supabase client directly
      const { data, error } = await supabase
        .from('player_documents')
        .select('*')
        .eq('upid', upid)
        .order('created_at', { ascending: false });
        
      if (error) {
        return [];
      }
      
      return data || [];
    },
    enabled: !!upid
  });
}

// Simplified hook to trigger status check when needed
export function useTriggerStatusCheck() {
  const { checkAndTransition } = useAutoStatusTransition();
  
  return {
    triggerStatusCheck: checkAndTransition,
  };
}