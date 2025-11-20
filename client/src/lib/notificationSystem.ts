// Advanced Multi-Channel Notification System
// Supports in-app, email, SMS, and push notifications for tournament operations

export enum NotificationChannel {
  IN_APP = 'in_app',
  EMAIL = 'email',
  SMS = 'sms',
  PUSH = 'push',
  WEBHOOK = 'webhook'
}

export enum NotificationType {
  // Registration notifications
  REGISTRATION_SUBMITTED = 'registration_submitted',
  REGISTRATION_APPROVED = 'registration_approved', 
  REGISTRATION_REJECTED = 'registration_rejected',
  REGISTRATION_WITHDRAWN = 'registration_withdrawn',
  
  // Tournament notifications
  TOURNAMENT_CREATED = 'tournament_created',
  TOURNAMENT_UPDATED = 'tournament_updated',
  TOURNAMENT_CANCELLED = 'tournament_cancelled',
  
  // Fixture notifications
  FIXTURE_PUBLISHED = 'fixture_published',
  FIXTURE_UPDATED = 'fixture_updated',
  MATCH_REMINDER = 'match_reminder',
  
  // Result notifications
  RESULT_POSTED = 'result_posted',
  RESULT_DISPUTED = 'result_disputed',
  
  // System notifications
  SYSTEM_MAINTENANCE = 'system_maintenance',
  DEADLINE_REMINDER = 'deadline_reminder'
}

export enum NotificationPriority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  URGENT = 'urgent'
}

export interface NotificationRecipient {
  id: string;
  type: 'user' | 'team' | 'organization' | 'role';
  identifier: string; // User ID, team ID, org ID, or role name
  channels: NotificationChannel[];
  preferences?: {
    [key in NotificationType]?: {
      enabled: boolean;
      channels: NotificationChannel[];
      quiet_hours?: {
        start: string; // HH:mm format
        end: string;
      };
    };
  };
}

export interface NotificationTemplate {
  id: string;
  type: NotificationType;
  channel: NotificationChannel;
  subject?: string; // For email/push
  title: string;
  body: string;
  actionUrl?: string;
  actionText?: string;
  variables: string[]; // Template variables like {teamName}, {tournamentName}
}

export interface NotificationPayload {
  id: string;
  type: NotificationType;
  priority: NotificationPriority;
  recipients: NotificationRecipient[];
  data: Record<string, any>; // Context data for template variables
  scheduledFor?: Date; // For scheduled notifications
  expiresAt?: Date;
  metadata?: {
    tournamentId?: string;
    teamId?: string;
    organizationId?: string;
    userId?: string;
  };
}

export interface NotificationDelivery {
  id: string;
  notificationId: string;
  recipientId: string;
  channel: NotificationChannel;
  status: 'pending' | 'sent' | 'delivered' | 'failed' | 'expired';
  sentAt?: Date;
  deliveredAt?: Date;
  failureReason?: string;
  attempts: number;
  maxAttempts: number;
}

// Notification templates for different scenarios
export const NotificationTemplates: Record<string, NotificationTemplate> = {
  // Registration notifications
  registration_approved_email: {
    id: 'registration_approved_email',
    type: NotificationType.REGISTRATION_APPROVED,
    channel: NotificationChannel.EMAIL,
    subject: '✅ Team Registration Approved - {tournamentName}',
    title: 'Registration Approved!',
    body: `
      Congratulations! Your team "{teamName}" has been approved for {tournamentName}.
      
      Registration Details:
      - Team: {teamName} ({teamCode})
      - Tournament: {tournamentName}
      - Approval Date: {approvalDate}
      - Squad Size: {squadSize} players
      
      Next Steps:
      1. Review your team roster
      2. Check fixture schedules when published
      3. Prepare for the tournament
      
      Good luck in the tournament!
    `,
    actionUrl: '/tournaments/{tournamentId}/teams/{teamId}',
    actionText: 'View Team Details',
    variables: ['teamName', 'teamCode', 'tournamentName', 'approvalDate', 'squadSize', 'tournamentId', 'teamId']
  },

  registration_approved_sms: {
    id: 'registration_approved_sms',
    type: NotificationType.REGISTRATION_APPROVED,
    channel: NotificationChannel.SMS,
    title: 'Registration Approved',
    body: '✅ {teamName} approved for {tournamentName}! Check your email for details.',
    variables: ['teamName', 'tournamentName']
  },

  registration_rejected_email: {
    id: 'registration_rejected_email',
    type: NotificationType.REGISTRATION_REJECTED,
    channel: NotificationChannel.EMAIL,
    subject: '❌ Team Registration Status - {tournamentName}',
    title: 'Registration Update Required',
    body: `
      Your team registration for {tournamentName} requires attention.
      
      Team: {teamName} ({teamCode})
      Status: Registration not approved
      Reason: {rejectionReason}
      
      What to do next:
      1. Review the feedback provided
      2. Address the mentioned issues
      3. Resubmit your registration if applicable
      
      If you have questions, please contact the tournament organizers.
    `,
    actionUrl: '/tournaments/{tournamentId}/register',
    actionText: 'Update Registration',
    variables: ['teamName', 'teamCode', 'tournamentName', 'rejectionReason', 'tournamentId']
  },

  fixture_published_push: {
    id: 'fixture_published_push',
    type: NotificationType.FIXTURE_PUBLISHED,
    channel: NotificationChannel.PUSH,
    title: '📅 Fixtures Published',
    body: 'New fixtures are available for {tournamentName}. Check your upcoming matches!',
    actionUrl: '/tournaments/{tournamentId}/fixtures',
    actionText: 'View Fixtures',
    variables: ['tournamentName', 'tournamentId']
  },

  match_reminder_in_app: {
    id: 'match_reminder_in_app',
    type: NotificationType.MATCH_REMINDER,
    channel: NotificationChannel.IN_APP,
    title: '⚽ Match Reminder',
    body: '{teamName} vs {opponentName} starts in {timeUntilMatch} at {venue}',
    actionUrl: '/matches/{matchId}',
    actionText: 'View Match Details',
    variables: ['teamName', 'opponentName', 'timeUntilMatch', 'venue', 'matchId']
  }
};

export class NotificationService {
  private static deliveries: Map<string, NotificationDelivery> = new Map();
  private static notifications: Map<string, NotificationPayload> = new Map();

  // Send notification to multiple recipients via multiple channels
  static async sendNotification(payload: NotificationPayload): Promise<string[]> {
    const deliveryIds: string[] = [];
    
    for (const recipient of payload.recipients) {
      for (const channel of recipient.channels) {
        // Check if recipient has this notification type enabled for this channel
        if (this.isNotificationEnabled(recipient, payload.type, channel)) {
          const deliveryId = await this.createDelivery(payload, recipient, channel);
          deliveryIds.push(deliveryId);
          
          // Schedule or send immediately
          if (payload.scheduledFor && payload.scheduledFor > new Date()) {
            await this.scheduleDelivery(deliveryId, payload.scheduledFor);
          } else {
            await this.executeDelivery(deliveryId);
          }
        }
      }
    }
    
    // Store notification for tracking
    this.notifications.set(payload.id, payload);
    
    return deliveryIds;
  }

  // Create delivery record
  private static async createDelivery(
    notification: NotificationPayload,
    recipient: NotificationRecipient,
    channel: NotificationChannel
  ): Promise<string> {
    const delivery: NotificationDelivery = {
      id: `delivery_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      notificationId: notification.id,
      recipientId: recipient.id,
      channel,
      status: 'pending',
      attempts: 0,
      maxAttempts: this.getMaxAttempts(channel, notification.priority)
    };
    
    this.deliveries.set(delivery.id, delivery);
    return delivery.id;
  }

  // Execute notification delivery
  private static async executeDelivery(deliveryId: string): Promise<void> {
    const delivery = this.deliveries.get(deliveryId);
    if (!delivery) return;
    
    const notification = this.notifications.get(delivery.notificationId);
    if (!notification) return;

    delivery.attempts++;
    delivery.status = 'pending';
    
    try {
      const template = this.getTemplate(notification.type, delivery.channel);
      if (!template) {
        throw new Error(`No template found for ${notification.type}:${delivery.channel}`);
      }

      const content = this.renderTemplate(template, notification.data);
      
      switch (delivery.channel) {
        case NotificationChannel.EMAIL:
          await this.sendEmail(delivery.recipientId, content);
          break;
        case NotificationChannel.SMS:
          await this.sendSMS(delivery.recipientId, content);
          break;
        case NotificationChannel.IN_APP:
          await this.sendInApp(delivery.recipientId, content);
          break;
        case NotificationChannel.PUSH:
          await this.sendPush(delivery.recipientId, content);
          break;
        case NotificationChannel.WEBHOOK:
          await this.sendWebhook(delivery.recipientId, content, notification);
          break;
      }
      
      delivery.status = 'sent';
      delivery.sentAt = new Date();
      
      console.log(`✅ Notification delivered: ${delivery.channel} to ${delivery.recipientId}`);
      
    } catch (error) {
      delivery.status = 'failed';
      delivery.failureReason = error instanceof Error ? error.message : String(error);
      
      console.error(`❌ Notification delivery failed: ${error instanceof Error ? error.message : String(error)}`);
      
      // Retry logic
      if (delivery.attempts < delivery.maxAttempts) {
        setTimeout(() => this.executeDelivery(deliveryId), this.getRetryDelay(delivery.attempts));
      }
    }
  }

  // Channel-specific delivery methods
  private static async sendEmail(recipientId: string, content: any): Promise<void> {
    // Email delivery implementation
    console.log(`📧 Sending email to ${recipientId}:`, content.subject);
    
    // In production, integrate with:
    // - SendGrid, AWS SES, Mailgun, etc.
    // - SMTP servers
    // - Organization email systems
    
    // Mock implementation
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  private static async sendSMS(recipientId: string, content: any): Promise<void> {
    // SMS delivery implementation
    console.log(`📱 Sending SMS to ${recipientId}:`, content.body.substring(0, 50) + '...');
    
    // In production, integrate with:
    // - Twilio, AWS SNS, Africa's Talking
    // - Local SMS gateways
    // - Telecom providers
    
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  private static async sendInApp(recipientId: string, content: any): Promise<void> {
    // In-app notification implementation
    console.log(`🔔 Sending in-app notification to ${recipientId}:`, content.title);
    
    // In production:
    // - Store in notifications table
    // - Send via WebSocket to active sessions
    // - Update notification count/badge
    
    await new Promise(resolve => setTimeout(resolve, 50));
  }

  private static async sendPush(recipientId: string, content: any): Promise<void> {
    // Push notification implementation
    console.log(`📲 Sending push notification to ${recipientId}:`, content.title);
    
    // In production, integrate with:
    // - Firebase Cloud Messaging (FCM)
    // - Apple Push Notification Service (APNs)
    // - Web Push API
    
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  private static async sendWebhook(recipientId: string, content: any, notification: NotificationPayload): Promise<void> {
    // Webhook delivery implementation
    console.log(`🔗 Sending webhook to ${recipientId}:`, notification.type);
    
    // In production:
    // - HTTP POST to registered webhook URLs
    // - Include authentication headers
    // - Handle webhook responses and retries
    
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  // Utility methods
  private static isNotificationEnabled(
    recipient: NotificationRecipient,
    type: NotificationType,
    channel: NotificationChannel
  ): boolean {
    if (!recipient.preferences) return true;
    
    const preference = recipient.preferences[type];
    if (!preference) return true;
    
    return preference.enabled && preference.channels.includes(channel);
  }

  private static getTemplate(type: NotificationType, channel: NotificationChannel): NotificationTemplate | undefined {
    const templateKey = `${type}_${channel}`;
    return NotificationTemplates[templateKey];
  }

  private static renderTemplate(template: NotificationTemplate, data: Record<string, any>): any {
    let renderedBody = template.body;
    let renderedTitle = template.title;
    let renderedSubject = template.subject;
    
    // Replace template variables
    template.variables.forEach(variable => {
      const value = data[variable] || `{${variable}}`;
      const regex = new RegExp(`{${variable}}`, 'g');
      
      renderedBody = renderedBody.replace(regex, value);
      renderedTitle = renderedTitle.replace(regex, value);
      if (renderedSubject) {
        renderedSubject = renderedSubject.replace(regex, value);
      }
    });
    
    return {
      title: renderedTitle,
      body: renderedBody,
      subject: renderedSubject,
      actionUrl: template.actionUrl ? this.renderUrl(template.actionUrl, data) : undefined,
      actionText: template.actionText
    };
  }

  private static renderUrl(template: string, data: Record<string, any>): string {
    let rendered = template;
    Object.entries(data).forEach(([key, value]) => {
      rendered = rendered.replace(`{${key}}`, value);
    });
    return rendered;
  }

  private static getMaxAttempts(channel: NotificationChannel, priority: NotificationPriority): number {
    const maxAttempts = {
      [NotificationChannel.EMAIL]: { low: 2, normal: 3, high: 5, urgent: 7 },
      [NotificationChannel.SMS]: { low: 1, normal: 2, high: 3, urgent: 5 },
      [NotificationChannel.IN_APP]: { low: 1, normal: 1, high: 2, urgent: 3 },
      [NotificationChannel.PUSH]: { low: 1, normal: 2, high: 3, urgent: 5 },
      [NotificationChannel.WEBHOOK]: { low: 3, normal: 5, high: 7, urgent: 10 }
    };
    
    return maxAttempts[channel][priority];
  }

  private static getRetryDelay(attempt: number): number {
    // Exponential backoff: 1s, 2s, 4s, 8s, etc.
    return Math.pow(2, attempt) * 1000;
  }

  private static async scheduleDelivery(deliveryId: string, scheduledFor: Date): Promise<void> {
    const delay = scheduledFor.getTime() - Date.now();
    if (delay > 0) {
      setTimeout(() => this.executeDelivery(deliveryId), delay);
      console.log(`📅 Scheduled delivery ${deliveryId} for ${scheduledFor.toISOString()}`);
    } else {
      await this.executeDelivery(deliveryId);
    }
  }

  // Bulk notification methods
  static async sendBulkNotification(
    type: NotificationType,
    recipients: NotificationRecipient[],
    data: Record<string, any>,
    priority: NotificationPriority = NotificationPriority.NORMAL
  ): Promise<string[]> {
    const notification: NotificationPayload = {
      id: `bulk_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      priority,
      recipients,
      data
    };
    
    return this.sendNotification(notification);
  }

  // Get delivery status
  static getDeliveryStatus(deliveryId: string): NotificationDelivery | undefined {
    return this.deliveries.get(deliveryId);
  }

  // Get all deliveries for a notification
  static getNotificationDeliveries(notificationId: string): NotificationDelivery[] {
    return Array.from(this.deliveries.values())
      .filter(delivery => delivery.notificationId === notificationId);
  }
}

// Notification preference management
export class NotificationPreferenceManager {
  static updateUserPreferences(
    userId: string,
    preferences: NotificationRecipient['preferences']
  ): void {
    console.log(`Updating notification preferences for user ${userId}:`, preferences);
    
    // In production:
    // - Save to database
    // - Validate preferences
    // - Apply organization-level overrides
    // - Notify user of changes
  }

  static getDefaultPreferences(): NotificationRecipient['preferences'] {
    return {
      [NotificationType.REGISTRATION_APPROVED]: {
        enabled: true,
        channels: [NotificationChannel.EMAIL, NotificationChannel.IN_APP, NotificationChannel.SMS]
      },
      [NotificationType.REGISTRATION_REJECTED]: {
        enabled: true,
        channels: [NotificationChannel.EMAIL, NotificationChannel.IN_APP]
      },
      [NotificationType.FIXTURE_PUBLISHED]: {
        enabled: true,
        channels: [NotificationChannel.EMAIL, NotificationChannel.PUSH]
      },
      [NotificationType.MATCH_REMINDER]: {
        enabled: true,
        channels: [NotificationChannel.PUSH, NotificationChannel.SMS],
        quiet_hours: {
          start: '22:00',
          end: '07:00'
        }
      }
    };
  }
}