import { supabase } from '../lib/supabase';
import type { 
  TeamInvitation, 
  InvitationTemplate, 
  InsertInvitationEmailLog,
  TeamManager,
  Team 
} from '@shared/schema';

// Email service configuration
interface EmailConfig {
  fromEmail: string;
  fromName: string;
  replyTo?: string;
  provider: 'SUPABASE' | 'SENDGRID' | 'RESEND';
}

// Template variables for email rendering
interface TemplateVariables {
  team_name: string;
  position: string;
  player_name: string;
  custom_message: string;
  registration_link: string;
  expiry_date: string;
  manager_name: string;
  tournament_name?: string;
  organization_name?: string;
}

// Email sending result
interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
  deliveryStatus: 'SENT' | 'FAILED';
}

// Batch email sending result
interface BulkEmailResult {
  totalSent: number;
  successful: number;
  failed: number;
  results: Array<{
    invitationId: string;
    email: string;
    success: boolean;
    messageId?: string;
    error?: string;
  }>;
}

export class InvitationEmailService {
  private config: EmailConfig;

  constructor(config?: Partial<EmailConfig>) {
    this.config = {
      fromEmail: 'noreply@jamiitourney.com',
      fromName: 'Jamii Tourney',
      replyTo: 'support@jamiitourney.com',
      provider: 'SUPABASE',
      ...config
    };
  }

  /**
   * Send a single invitation email
   */
  async sendInvitationEmail(
    invitation: TeamInvitation,
    manager: TeamManager,
    team: Team,
    template?: InvitationTemplate,
    emailType: 'INITIAL_INVITE' | 'REMINDER' | 'FOLLOW_UP' = 'INITIAL_INVITE'
  ): Promise<EmailResult> {
    try {
      // Get or create template
      const emailTemplate = template || await this.getDefaultTemplate(invitation.orgId, emailType);
      
      // Prepare template variables
      const variables: TemplateVariables = {
        team_name: team.name,
        position: invitation.position || 'Team Member',
        player_name: `${invitation.firstName} ${invitation.lastName}`,
        custom_message: invitation.customMessage || 'We would love to have you join our team!',
        registration_link: invitation.registrationLink,
        expiry_date: invitation.expiresAt ? new Date(invitation.expiresAt).toLocaleDateString() : '',
        manager_name: `${manager.firstName} ${manager.lastName}`,
        tournament_name: '', // Would be populated if tournament data available
        organization_name: 'Jamii Tourney'
      };

      // Render email content
      const subject = this.renderTemplate(emailTemplate.subjectTemplate, variables);
      const body = this.renderTemplate(emailTemplate.bodyTemplate, variables);

      // Send email based on provider
      const result = await this.sendEmail({
        to: invitation.email,
        subject,
        body,
        invitationId: invitation.id
      });

      // Log email delivery
      await this.logEmailDelivery({
        invitationId: invitation.id,
        emailType,
        recipientEmail: invitation.email,
        subject,
        deliveryStatus: result.deliveryStatus,
        deliveryMessage: result.error || 'Email sent successfully',
        provider: this.config.provider,
        providerMessageId: result.messageId
      });

      // Update invitation tracking
      if (result.success && emailType === 'INITIAL_INVITE') {
        await this.updateInvitationEmailTracking(invitation.id, 'sent');
      } else if (result.success && emailType === 'REMINDER') {
        await this.updateInvitationEmailTracking(invitation.id, 'reminder');
      }

      return result;
    } catch (error) {
      console.error('Failed to send invitation email:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        deliveryStatus: 'FAILED'
      };
    }
  }

  /**
   * Send bulk invitation emails
   */
  async sendBulkInvitations(
    invitations: TeamInvitation[],
    manager: TeamManager,
    team: Team,
    template?: InvitationTemplate
  ): Promise<BulkEmailResult> {
    const results: BulkEmailResult['results'] = [];
    let successful = 0;
    let failed = 0;

    // Send emails in batches to avoid rate limiting
    const batchSize = 10;
    for (let i = 0; i < invitations.length; i += batchSize) {
      const batch = invitations.slice(i, i + batchSize);
      
      const batchPromises = batch.map(async (invitation) => {
        const result = await this.sendInvitationEmail(invitation, manager, team, template);
        
        const emailResult = {
          invitationId: invitation.id,
          email: invitation.email,
          success: result.success,
          messageId: result.messageId,
          error: result.error
        };

        if (result.success) {
          successful++;
        } else {
          failed++;
        }

        results.push(emailResult);
        return emailResult;
      });

      await Promise.all(batchPromises);
      
      // Add delay between batches to respect rate limits
      if (i + batchSize < invitations.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    return {
      totalSent: invitations.length,
      successful,
      failed,
      results
    };
  }

  /**
   * Send reminder emails to pending invitations
   */
  async sendReminderEmails(invitationIds: string[]): Promise<BulkEmailResult> {
    try {
      // Fetch invitations with related data
      const { data: invitationsData, error } = await supabase
        .from('team_invitations')
        .select(`
          *,
          team_managers!inner(*),
          teams!inner(*)
        `)
        .in('id', invitationIds)
        .eq('status', 'PENDING');

      if (error) throw error;

      const results: BulkEmailResult['results'] = [];
      let successful = 0;
      let failed = 0;

      for (const data of invitationsData) {
        const invitation = data as TeamInvitation;
        const manager = data.team_managers as TeamManager;
        const team = data.teams as Team;

        const result = await this.sendInvitationEmail(
          invitation, 
          manager, 
          team, 
          undefined, 
          'REMINDER'
        );

        results.push({
          invitationId: invitation.id,
          email: invitation.email,
          success: result.success,
          messageId: result.messageId,
          error: result.error
        });

        if (result.success) {
          successful++;
        } else {
          failed++;
        }
      }

      return {
        totalSent: invitationsData.length,
        successful,
        failed,
        results
      };
    } catch (error) {
      console.error('Failed to send reminder emails:', error);
      throw error;
    }
  }

  /**
   * Get default email template for organization
   */
  private async getDefaultTemplate(
    orgId: string, 
    templateType: 'INITIAL_INVITE' | 'REMINDER' | 'FOLLOW_UP'
  ): Promise<InvitationTemplate> {
    const { data, error } = await supabase
      .from('invitation_templates')
      .select('*')
      .eq('org_id', orgId)
      .eq('template_type', templateType)
      .eq('is_default', true)
      .single();

    if (error || !data) {
      // Return built-in default template
      return this.getBuiltInTemplate(templateType);
    }

    return data as InvitationTemplate;
  }

  /**
   * Get built-in default templates when no custom template exists
   */
  private getBuiltInTemplate(templateType: string): InvitationTemplate {
    const templates = {
      'INITIAL_INVITE': {
        id: 'builtin-initial',
        orgId: '',
        managerId: null,
        name: 'Built-in Initial Invitation',
        templateType: 'INITIAL_INVITE' as const,
        subjectTemplate: 'Invitation to Join {{team_name}} - {{position}} Position',
        bodyTemplate: `Dear {{player_name}},

You have been invited to join {{team_name}} for the {{position}} position.

{{custom_message}}

To complete your registration, please click the link below:
{{registration_link}}

This invitation expires on {{expiry_date}}.

Best regards,
{{manager_name}}
{{team_name}}`,
        isDefault: true,
        variables: null,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      'REMINDER': {
        id: 'builtin-reminder',
        orgId: '',
        managerId: null,
        name: 'Built-in Reminder',
        templateType: 'REMINDER' as const,
        subjectTemplate: 'Reminder: Complete Your Registration for {{team_name}}',
        bodyTemplate: `Hi {{player_name}},

This is a friendly reminder that your invitation to join {{team_name}} is still pending.

We are excited to have you on our team for the {{position}} position!

Please complete your registration by clicking here: {{registration_link}}

If you have any questions, feel free to reach out.

Cheers,
{{manager_name}}`,
        isDefault: true,
        variables: null,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      'FOLLOW_UP': {
        id: 'builtin-followup',
        orgId: '',
        managerId: null,
        name: 'Built-in Follow-up',
        templateType: 'FOLLOW_UP' as const,
        subjectTemplate: 'Follow-up: {{team_name}} Registration Status',
        bodyTemplate: `Hello {{player_name}},

We noticed you started your registration for {{team_name}} but haven't completed it yet.

We're still excited to have you join us for the {{position}} position!

Please complete your registration here: {{registration_link}}

This invitation expires on {{expiry_date}}.

If you have any questions, please don't hesitate to reach out.

Best regards,
{{manager_name}}
{{team_name}}`,
        isDefault: true,
        variables: null,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    };

    return templates[templateType as keyof typeof templates] || templates['INITIAL_INVITE'];
  }

  /**
   * Render email template with variables
   */
  private renderTemplate(template: string, variables: TemplateVariables): string {
    let rendered = template;
    
    Object.entries(variables).forEach(([key, value]) => {
      const placeholder = `{{${key}}}`;
      rendered = rendered.replace(new RegExp(placeholder, 'g'), value || '');
    });

    return rendered;
  }

  /**
   * Send email using configured provider
   */
  private async sendEmail({
    to,
    subject,
    body,
    invitationId
  }: {
    to: string;
    subject: string;
    body: string;
    invitationId: string;
  }): Promise<EmailResult> {
    try {
      if (this.config.provider === 'SUPABASE') {
        // For demo purposes, we'll simulate email sending
        // In production, you would integrate with Supabase Auth or another email service
        console.log(`[EMAIL SIMULATION] Sending to: ${to}`);
        console.log(`[EMAIL SIMULATION] Subject: ${subject}`);
        console.log(`[EMAIL SIMULATION] Body: ${body.substring(0, 100)}...`);

        // Simulate success with mock message ID
        return {
          success: true,
          messageId: `mock_${Date.now()}_${invitationId}`,
          deliveryStatus: 'SENT'
        };
      }

      // Add other email providers here (SendGrid, Resend, etc.)
      throw new Error(`Email provider ${this.config.provider} not implemented`);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        deliveryStatus: 'FAILED'
      };
    }
  }

  /**
   * Log email delivery to database
   */
  private async logEmailDelivery(logData: InsertInvitationEmailLog): Promise<void> {
    try {
      const { error } = await supabase
        .from('invitation_email_log')
        .insert(logData);

      if (error) {
        console.error('Failed to log email delivery:', error);
      }
    } catch (error) {
      console.error('Failed to log email delivery:', error);
    }
  }

  /**
   * Update invitation email tracking counters
   */
  private async updateInvitationEmailTracking(
    invitationId: string, 
    action: 'sent' | 'reminder'
  ): Promise<void> {
    try {
      if (action === 'reminder') {
        const { error } = await supabase
          .from('team_invitations')
          .update({
            remindersSent: supabase.rpc('increment_reminders', { invitation_id: invitationId }),
            lastReminderAt: new Date().toISOString()
          })
          .eq('id', invitationId);

        if (error) {
          console.error('Failed to update reminder tracking:', error);
        }
      }
      // Additional tracking logic can be added here
    } catch (error) {
      console.error('Failed to update invitation tracking:', error);
    }
  }

  /**
   * Track email opens (called when tracking pixel is loaded)
   */
  async trackEmailOpen(invitationId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('team_invitations')
        .update({
          emailOpens: supabase.rpc('increment_opens', { invitation_id: invitationId }),
          lastActivityAt: new Date().toISOString()
        })
        .eq('id', invitationId);

      // Also log the open event
      await supabase
        .from('invitation_email_log')
        .update({ openedAt: new Date().toISOString() })
        .eq('invitation_id', invitationId)
        .is('opened_at', null);

      if (error) {
        console.error('Failed to track email open:', error);
      }
    } catch (error) {
      console.error('Failed to track email open:', error);
    }
  }

  /**
   * Track email link clicks
   */
  async trackEmailClick(invitationId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('team_invitations')
        .update({
          linkClicks: supabase.rpc('increment_clicks', { invitation_id: invitationId }),
          lastActivityAt: new Date().toISOString()
        })
        .eq('id', invitationId);

      // Also log the click event
      await supabase
        .from('invitation_email_log')
        .update({ clickedAt: new Date().toISOString() })
        .eq('invitation_id', invitationId)
        .is('clicked_at', null);

      if (error) {
        console.error('Failed to track email click:', error);
      }
    } catch (error) {
      console.error('Failed to track email click:', error);
    }
  }

  /**
   * Get email delivery statistics for manager dashboard
   */
  async getEmailStats(managerId: string, orgId: string, timeRange: string = '30days') {
    try {
      const daysBack = timeRange === '7days' ? 7 : timeRange === '90days' ? 90 : 30;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - daysBack);

      const { data, error } = await supabase
        .from('invitation_email_log')
        .select(`
          delivery_status,
          email_type,
          sent_at,
          opened_at,
          clicked_at,
          team_invitations!inner(manager_id, org_id)
        `)
        .eq('team_invitations.manager_id', managerId)
        .eq('team_invitations.org_id', orgId)
        .gte('sent_at', startDate.toISOString());

      if (error) throw error;

      // Calculate statistics
      const stats = {
        totalSent: data.length,
        delivered: data.filter((log: any) => log.delivery_status === 'DELIVERED').length,
        bounced: data.filter((log: any) => log.delivery_status === 'BOUNCED').length,
        opened: data.filter((log: any) => log.opened_at !== null).length,
        clicked: data.filter((log: any) => log.clicked_at !== null).length,
        openRate: 0,
        clickRate: 0,
        deliveryRate: 0
      };

      stats.deliveryRate = stats.totalSent > 0 ? (stats.delivered / stats.totalSent) * 100 : 0;
      stats.openRate = stats.delivered > 0 ? (stats.opened / stats.delivered) * 100 : 0;
      stats.clickRate = stats.opened > 0 ? (stats.clicked / stats.opened) * 100 : 0;

      return stats;
    } catch (error) {
      console.error('Failed to get email stats:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const invitationEmailService = new InvitationEmailService();

// Export types for use in other modules
export type { 
  EmailResult, 
  BulkEmailResult, 
  TemplateVariables, 
  EmailConfig 
};