import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

// Types from the enhanced eligibility engine
export interface EligibilityCheckResult {
  isEligible: boolean;
  violations: EligibilityViolation[];
  warnings: EligibilityWarning[];
  summary: EligibilitySummary;
}

export interface EligibilityViolation {
  ruleId: string;
  ruleName: string;
  ruleType: string;
  reason: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  canOverride: boolean;
  suggestedAction?: string;
}

export interface EligibilityWarning {
  ruleId: string;
  ruleName: string;
  ruleType: string;
  message: string;
  suggestedAction?: string;
}

export interface EligibilitySummary {
  overallStatus: 'ELIGIBLE' | 'INELIGIBLE' | 'PENDING_REVIEW' | 'NEEDS_ACTION';
  registrationStatus: string;
  documentsVerified: boolean;
  consentsGranted: boolean;
  medicalClearanceValid: boolean;
  ageEligible: boolean;
  geographicEligible: boolean;
  nextSteps: string[];
}

export interface EligibilityRule {
  id: string;
  tournamentId: string;
  ruleType: string;
  name: string;
  description?: string;
  config: Record<string, any>;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Hook to check player eligibility for a specific tournament
export function usePlayerEligibility(upid: string, tournamentId: string) {
  return useQuery({
    queryKey: ['playerEligibility', upid, tournamentId],
    queryFn: async () => {
      if (!upid || !tournamentId) return null;
      
      const response = await fetch(`/api/players/${upid}/eligibility/${tournamentId}`);
      if (!response.ok) {
        throw new Error('Failed to check eligibility');
      }
      return response.json() as Promise<EligibilityCheckResult>;
    },
    enabled: !!(upid && tournamentId),
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Hook to get eligibility summary for player across all tournaments
export function usePlayerEligibilitySummary(upid: string) {
  return useQuery({
    queryKey: ['playerEligibilitySummary', upid],
    queryFn: async () => {
      if (!upid) return null;
      
      const response = await fetch(`/api/players/${upid}/eligibility/summary`);
      if (!response.ok) {
        throw new Error('Failed to get eligibility summary');
      }
      return response.json();
    },
    enabled: !!upid,
  });
}

// Hook to get eligibility rules for a tournament
export function useTournamentEligibilityRules(tournamentId: string) {
  return useQuery({
    queryKey: ['tournamentEligibilityRules', tournamentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('eligibility_rules')
        .select('*')
        .eq('tournament_id', tournamentId)
        .eq('is_active', true)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      return data as EligibilityRule[];
    },
    enabled: !!tournamentId,
  });
}

// Hook to create or update eligibility rules
export function useManageEligibilityRules() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (params: {
      action: 'create' | 'update' | 'delete';
      rule?: Partial<EligibilityRule>;
      ruleId?: string;
    }) => {
      const { action, rule, ruleId } = params;
      
      switch (action) {
        case 'create':
          if (!rule) throw new Error('Rule data required for creation');
          const { data: createData, error: createError } = await supabase
            .from('eligibility_rules')
            .insert([{
              tournament_id: rule.tournamentId,
              rule_type: rule.ruleType,
              name: rule.name,
              description: rule.description,
              config: rule.config,
              is_active: rule.isActive ?? true,
            }])
            .select()
            .single();
          
          if (createError) throw createError;
          return createData;
          
        case 'update':
          if (!ruleId || !rule) throw new Error('Rule ID and data required for update');
          const { data: updateData, error: updateError } = await supabase
            .from('eligibility_rules')
            .update({
              rule_type: rule.ruleType,
              name: rule.name,
              description: rule.description,
              config: rule.config,
              is_active: rule.isActive,
              updated_at: new Date().toISOString(),
            })
            .eq('id', ruleId)
            .select()
            .single();
          
          if (updateError) throw updateError;
          return updateData;
          
        case 'delete':
          if (!ruleId) throw new Error('Rule ID required for deletion');
          const { error: deleteError } = await supabase
            .from('eligibility_rules')
            .delete()
            .eq('id', ruleId);
          
          if (deleteError) throw deleteError;
          return { id: ruleId };
          
        default:
          throw new Error('Invalid action');
      }
    },
    onSuccess: (_, variables) => {
      // Invalidate related queries
      if (variables.rule?.tournamentId) {
        queryClient.invalidateQueries({ 
          queryKey: ['tournamentEligibilityRules', variables.rule.tournamentId] 
        });
      }
      queryClient.invalidateQueries({ queryKey: ['playerEligibility'] });
      queryClient.invalidateQueries({ queryKey: ['playerEligibilitySummary'] });
    },
  });
}

// Hook to bulk check eligibility for multiple players
export function useBulkEligibilityCheck() {
  return useMutation({
    mutationFn: async (params: {
      playerIds: string[];
      tournamentId: string;
    }) => {
      const response = await fetch('/api/eligibility/bulk-check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });
      
      if (!response.ok) {
        throw new Error('Failed to perform bulk eligibility check');
      }
      
      return response.json();
    },
  });
}

// Hook to request eligibility override
export function useEligibilityOverride() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (params: {
      upid: string;
      tournamentId: string;
      violationRuleId: string;
      reason: string;
      requestedBy: string;
    }) => {
      const response = await fetch('/api/eligibility/request-override', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });
      
      if (!response.ok) {
        throw new Error('Failed to request eligibility override');
      }
      
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: ['playerEligibility', variables.upid, variables.tournamentId] 
      });
    },
  });
}

// Hook to get eligibility statistics for tournaments
export function useEligibilityStats(tournamentId?: string) {
  return useQuery({
    queryKey: ['eligibilityStats', tournamentId],
    queryFn: async () => {
      const url = tournamentId 
        ? `/api/tournaments/${tournamentId}/eligibility/stats`
        : '/api/eligibility/stats';
        
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to get eligibility statistics');
      }
      return response.json();
    },
  });
}

// Helper hook for common eligibility checks
export function useEligibilityHelpers() {
  const checkAge = (dateOfBirth: string, minAge?: number, maxAge?: number, calculationDate = new Date()) => {
    const birthDate = new Date(dateOfBirth);
    const ageInYears = Math.floor((calculationDate.getTime() - birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
    
    const violations = [];
    
    if (minAge !== undefined && ageInYears < minAge) {
      violations.push(`Player is ${ageInYears} years old, minimum age is ${minAge}`);
    }
    
    if (maxAge !== undefined && ageInYears > maxAge) {
      violations.push(`Player is ${ageInYears} years old, maximum age is ${maxAge}`);
    }
    
    return {
      age: ageInYears,
      isEligible: violations.length === 0,
      violations,
    };
  };

  const checkDocumentRequirements = (
    documents: Array<{ documentType: string; verificationStatus: string }>,
    requiredDocs: string[]
  ) => {
    const verifiedDocs = documents
      .filter(d => d.verificationStatus === 'VERIFIED')
      .map(d => d.documentType);
    
    const missingDocs = requiredDocs.filter(doc => !verifiedDocs.includes(doc));
    
    return {
      isComplete: missingDocs.length === 0,
      missingDocuments: missingDocs,
      verifiedDocuments: verifiedDocs,
    };
  };

  const checkConsentRequirements = (
    consents: Array<{ consentType: string; isConsented: boolean }>,
    requiredConsents: string[]
  ) => {
    const grantedConsents = consents
      .filter(c => c.isConsented)
      .map(c => c.consentType);
    
    const missingConsents = requiredConsents.filter(consent => !grantedConsents.includes(consent));
    
    return {
      isComplete: missingConsents.length === 0,
      missingConsents,
      grantedConsents,
    };
  };

  const getEligibilityStatusColor = (status: string) => {
    switch (status) {
      case 'ELIGIBLE': return 'green';
      case 'INELIGIBLE': return 'red';
      case 'PENDING_REVIEW': return 'yellow';
      case 'NEEDS_ACTION': return 'orange';
      default: return 'gray';
    }
  };

  const getViolationSeverityColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL': return 'red';
      case 'HIGH': return 'orange';
      case 'MEDIUM': return 'yellow';
      case 'LOW': return 'blue';
      default: return 'gray';
    }
  };

  return {
    checkAge,
    checkDocumentRequirements,
    checkConsentRequirements,
    getEligibilityStatusColor,
    getViolationSeverityColor,
  };
}