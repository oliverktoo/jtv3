import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import type { 
  InvitationTemplate, 
  InsertInvitationTemplate, 
  UpdateInvitationTemplate 
} from '@shared/schema';

// Hook to get invitation templates for an organization
export function useInvitationTemplates(orgId: string, managerId?: string) {
  return useQuery<InvitationTemplate[]>({
    queryKey: ['invitationTemplates', orgId, managerId],
    queryFn: async () => {
      let query = supabase
        .from('invitation_templates')
        .select('*')
        .eq('org_id', orgId)
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: false });

      // If managerId provided, include manager-specific templates
      if (managerId) {
        query = query.or(`manager_id.eq.${managerId},manager_id.is.null`);
      } else {
        query = query.is('manager_id', null);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      return data as InvitationTemplate[];
    },
    enabled: !!orgId,
  });
}

// Hook to get a specific template
export function useInvitationTemplate(templateId: string) {
  return useQuery<InvitationTemplate>({
    queryKey: ['invitationTemplate', templateId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('invitation_templates')
        .select('*')
        .eq('id', templateId)
        .single();

      if (error) throw error;
      return data as InvitationTemplate;
    },
    enabled: !!templateId,
  });
}

// Hook to create a new template
export function useCreateInvitationTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (template: InsertInvitationTemplate): Promise<InvitationTemplate> => {
      const { data, error } = await supabase
        .from('invitation_templates')
        .insert(template)
        .select('*')
        .single();

      if (error) throw error;
      return data as InvitationTemplate;
    },
    onSuccess: (data) => {
      // Invalidate and refetch templates
      queryClient.invalidateQueries({ 
        queryKey: ['invitationTemplates', data.orgId] 
      });
    },
  });
}

// Hook to update an existing template
export function useUpdateInvitationTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      templateId, 
      updates 
    }: { 
      templateId: string; 
      updates: UpdateInvitationTemplate 
    }): Promise<InvitationTemplate> => {
      const { data, error } = await supabase
        .from('invitation_templates')
        .update(updates)
        .eq('id', templateId)
        .select('*')
        .single();

      if (error) throw error;
      return data as InvitationTemplate;
    },
    onSuccess: (data) => {
      // Update specific template in cache
      queryClient.setQueryData(['invitationTemplate', data.id], data);
      
      // Invalidate templates list
      queryClient.invalidateQueries({ 
        queryKey: ['invitationTemplates', data.orgId] 
      });
    },
  });
}

// Hook to delete a template
export function useDeleteInvitationTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (templateId: string): Promise<void> => {
      const { error } = await supabase
        .from('invitation_templates')
        .delete()
        .eq('id', templateId);

      if (error) throw error;
    },
    onSuccess: (_, templateId) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: ['invitationTemplate', templateId] });
      
      // Invalidate templates lists
      queryClient.invalidateQueries({ queryKey: ['invitationTemplates'] });
    },
  });
}

// Hook to get email statistics for templates
export function useTemplateEmailStats(templateId: string, timeRange: string = '30days') {
  return useQuery({
    queryKey: ['templateEmailStats', templateId, timeRange],
    queryFn: async () => {
      const daysBack = timeRange === '7days' ? 7 : timeRange === '90days' ? 90 : 30;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - daysBack);

      // Get email statistics for this template
      const { data, error } = await supabase
        .from('invitation_email_log')
        .select(`
          delivery_status,
          opened_at,
          clicked_at,
          sent_at,
          team_invitations!inner(*)
        `)
        .gte('sent_at', startDate.toISOString());

      if (error) throw error;

      // Calculate template-specific statistics
      const stats = {
        totalSent: data.length,
        delivered: data.filter(log => log.delivery_status === 'DELIVERED').length,
        opened: data.filter(log => log.opened_at !== null).length,
        clicked: data.filter(log => log.clicked_at !== null).length,
        deliveryRate: 0,
        openRate: 0,
        clickRate: 0,
      };

      stats.deliveryRate = stats.totalSent > 0 ? (stats.delivered / stats.totalSent) * 100 : 0;
      stats.openRate = stats.delivered > 0 ? (stats.opened / stats.delivered) * 100 : 0;
      stats.clickRate = stats.opened > 0 ? (stats.clicked / stats.opened) * 100 : 0;

      return stats;
    },
    enabled: !!templateId,
  });
}

// Hook to preview a template with sample data
export function useTemplatePreview() {
  return useMutation({
    mutationFn: async ({
      template,
      variables
    }: {
      template: { subjectTemplate: string; bodyTemplate: string };
      variables: Record<string, string>;
    }) => {
      // Simple template rendering function
      const renderTemplate = (templateStr: string, vars: Record<string, string>) => {
        let rendered = templateStr;
        Object.entries(vars).forEach(([key, value]) => {
          const placeholder = `{{${key}}}`;
          rendered = rendered.replace(new RegExp(placeholder, 'g'), value || '');
        });
        return rendered;
      };

      return {
        subject: renderTemplate(template.subjectTemplate, variables),
        body: renderTemplate(template.bodyTemplate, variables),
      };
    },
  });
}

// Hook to duplicate a template
export function useDuplicateTemplate() {
  const queryClient = useQueryClient();
  const createTemplate = useCreateInvitationTemplate();

  return useMutation({
    mutationFn: async (templateId: string): Promise<InvitationTemplate> => {
      // First get the original template
      const { data: originalTemplate, error } = await supabase
        .from('invitation_templates')
        .select('*')
        .eq('id', templateId)
        .single();

      if (error) throw error;

      // Create a new template with copied data
      const newTemplate: InsertInvitationTemplate = {
        orgId: originalTemplate.org_id,
        managerId: originalTemplate.manager_id,
        name: `${originalTemplate.name} (Copy)`,
        templateType: originalTemplate.template_type,
        subjectTemplate: originalTemplate.subject_template,
        bodyTemplate: originalTemplate.body_template,
        isDefault: false, // Copies should never be default
        variables: originalTemplate.variables,
      };

      return createTemplate.mutateAsync(newTemplate);
    },
  });
}

// Hook to set a template as default
export function useSetDefaultTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      templateId, 
      orgId, 
      templateType 
    }: { 
      templateId: string; 
      orgId: string; 
      templateType: string; 
    }): Promise<void> => {
      // First unset any existing default for this type and org
      await supabase
        .from('invitation_templates')
        .update({ isDefault: false })
        .eq('org_id', orgId)
        .eq('template_type', templateType)
        .eq('is_default', true);

      // Then set the new default
      const { error } = await supabase
        .from('invitation_templates')
        .update({ isDefault: true })
        .eq('id', templateId);

      if (error) throw error;
    },
    onSuccess: (_, { orgId }) => {
      // Invalidate templates to refresh the list
      queryClient.invalidateQueries({ 
        queryKey: ['invitationTemplates', orgId] 
      });
    },
  });
}