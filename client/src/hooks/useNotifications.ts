// React hook for managing notifications and real-time updates
import { useState, useEffect, useCallback } from 'react';
import { 
  NotificationService, 
  NotificationPayload, 
  NotificationDelivery,
  NotificationType,
  NotificationChannel,
  NotificationPriority
} from '@/lib/notificationSystem';
import { useSocket } from '@/hooks/useSocket';

export interface InAppNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  priority: NotificationPriority;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
  actionText?: string;
  metadata?: {
    tournamentId?: string;
    teamId?: string;
    matchId?: string;
  };
}

export interface NotificationPreferences {
  email: boolean;
  sms: boolean;
  push: boolean;
  inApp: boolean;
  types: {
    [key in NotificationType]: {
      enabled: boolean;
      channels: NotificationChannel[];
    };
  };
  quietHours: {
    enabled: boolean;
    start: string;
    end: string;
  };
}

export function useNotifications(userId?: string) {
  const [notifications, setNotifications] = useState<InAppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  
  const socket = useSocket();

  // Load notifications and preferences
  useEffect(() => {
    if (!userId) return;
    
    loadNotifications();
    loadPreferences();
  }, [userId]);

  // Listen for real-time notification updates
  useEffect(() => {
    if (!socket?.socket || !userId) return;

    const handleNewNotification = (notification: InAppNotification) => {
      setNotifications(prev => [notification, ...prev]);
      setUnreadCount(prev => prev + 1);
      
      // Show browser notification if supported and enabled
      showBrowserNotification(notification);
      
      console.log('📨 New notification received:', notification.title);
    };

    const handleNotificationRead = (notificationId: string) => {
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId 
            ? { ...notif, read: true }
            : notif
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    };

    socket.socket.on(`user:${userId}:notification`, handleNewNotification);
    socket.socket.on(`user:${userId}:notification_read`, handleNotificationRead);

    return () => {
      socket.socket?.off(`user:${userId}:notification`, handleNewNotification);
      socket.socket?.off(`user:${userId}:notification_read`, handleNotificationRead);
    };
  }, [socket, userId]);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      
      // In production, fetch from API
      const mockNotifications: InAppNotification[] = [
        {
          id: 'notif_001',
          type: NotificationType.REGISTRATION_APPROVED,
          title: 'Team Registration Approved!',
          message: 'Your team "AFC Leopards" has been approved for Kenyan Premier League 2024.',
          priority: NotificationPriority.HIGH,
          timestamp: new Date(Date.now() - 3600000),
          read: false,
          actionUrl: '/tournaments/kpl-2024/teams/afc-leopards',
          actionText: 'View Team Details',
          metadata: { tournamentId: 'kpl-2024', teamId: 'afc-leopards' }
        },
        {
          id: 'notif_002',
          type: NotificationType.FIXTURE_PUBLISHED,
          title: 'New Fixtures Available',
          message: 'Fixtures for Matchday 15 have been published. Check your upcoming matches.',
          priority: NotificationPriority.NORMAL,
          timestamp: new Date(Date.now() - 7200000),
          read: true,
          actionUrl: '/tournaments/kpl-2024/fixtures',
          actionText: 'View Fixtures',
          metadata: { tournamentId: 'kpl-2024' }
        },
        {
          id: 'notif_003',
          type: NotificationType.MATCH_REMINDER,
          title: 'Match Starting Soon',
          message: 'AFC Leopards vs Gor Mahia starts in 30 minutes at Nyayo Stadium.',
          priority: NotificationPriority.URGENT,
          timestamp: new Date(Date.now() - 1800000),
          read: false,
          actionUrl: '/matches/match-456',
          actionText: 'View Match',
          metadata: { matchId: 'match-456' }
        }
      ];
      
      setNotifications(mockNotifications);
      setUnreadCount(mockNotifications.filter(n => !n.read).length);
      
    } catch (error) {
      console.error('Failed to load notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadPreferences = async () => {
    try {
      // In production, fetch from API
      const mockPreferences: NotificationPreferences = {
        email: true,
        sms: true,
        push: true,
        inApp: true,
        types: {
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
            channels: [NotificationChannel.PUSH, NotificationChannel.SMS]
          },
          [NotificationType.RESULT_POSTED]: {
            enabled: true,
            channels: [NotificationChannel.IN_APP, NotificationChannel.PUSH]
          },
          // Add defaults for other types
          [NotificationType.TOURNAMENT_CREATED]: { enabled: false, channels: [] },
          [NotificationType.TOURNAMENT_UPDATED]: { enabled: true, channels: [NotificationChannel.IN_APP] },
          [NotificationType.TOURNAMENT_CANCELLED]: { enabled: true, channels: [NotificationChannel.EMAIL, NotificationChannel.SMS] },
          [NotificationType.FIXTURE_UPDATED]: { enabled: true, channels: [NotificationChannel.PUSH] },
          [NotificationType.RESULT_DISPUTED]: { enabled: true, channels: [NotificationChannel.EMAIL] },
          [NotificationType.SYSTEM_MAINTENANCE]: { enabled: true, channels: [NotificationChannel.EMAIL] },
          [NotificationType.DEADLINE_REMINDER]: { enabled: true, channels: [NotificationChannel.EMAIL, NotificationChannel.PUSH] },
          [NotificationType.REGISTRATION_SUBMITTED]: { enabled: false, channels: [] },
          [NotificationType.REGISTRATION_WITHDRAWN]: { enabled: true, channels: [NotificationChannel.IN_APP] }
        },
        quietHours: {
          enabled: true,
          start: '22:00',
          end: '07:00'
        }
      };
      
      setPreferences(mockPreferences);
      
    } catch (error) {
      console.error('Failed to load notification preferences:', error);
    }
  };

  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      // In production, update API
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId 
            ? { ...notif, read: true }
            : notif
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
      
      // Emit to socket for real-time updates
      if (socket) {
        socket.emit('notification:read', { notificationId, userId });
      }
      
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  }, [socket, userId]);

  const markAllAsRead = useCallback(async () => {
    try {
      const unreadNotifications = notifications.filter(n => !n.read);
      
      // In production, batch update API
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, read: true }))
      );
      setUnreadCount(0);
      
      // Emit to socket
      if (socket && unreadNotifications.length > 0) {
        socket.emit('notifications:read_all', { 
          notificationIds: unreadNotifications.map(n => n.id),
          userId 
        });
      }
      
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  }, [notifications, socket, userId]);

  const deleteNotification = useCallback(async (notificationId: string) => {
    try {
      const notification = notifications.find(n => n.id === notificationId);
      
      setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
      
      if (notification && !notification.read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      
      // In production, delete from API
      
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  }, [notifications]);

  const updatePreferences = useCallback(async (newPreferences: Partial<NotificationPreferences>) => {
    try {
      const updatedPreferences = { ...preferences, ...newPreferences } as NotificationPreferences;
      setPreferences(updatedPreferences);
      
      // In production, update API
      console.log('Updating notification preferences:', updatedPreferences);
      
    } catch (error) {
      console.error('Failed to update notification preferences:', error);
    }
  }, [preferences]);

  const sendTestNotification = useCallback(async (type: NotificationType) => {
    if (!userId) return;

    const testNotification: InAppNotification = {
      id: `test_${Date.now()}`,
      type,
      title: 'Test Notification',
      message: `This is a test ${type.replace('_', ' ')} notification.`,
      priority: NotificationPriority.NORMAL,
      timestamp: new Date(),
      read: false,
      actionUrl: '/dashboard',
      actionText: 'Go to Dashboard'
    };

    setNotifications(prev => [testNotification, ...prev]);
    setUnreadCount(prev => prev + 1);
    
    showBrowserNotification(testNotification);
    
  }, [userId]);

  const showBrowserNotification = (notification: InAppNotification) => {
    if (!('Notification' in window)) return;
    
    if (Notification.permission === 'granted') {
      const browserNotification = new Notification(notification.title, {
        body: notification.message,
        icon: '/logo.png',
        tag: notification.id,
        requireInteraction: notification.priority === NotificationPriority.URGENT
      });
      
      browserNotification.onclick = () => {
        if (notification.actionUrl) {
          window.open(notification.actionUrl, '_blank');
        }
        browserNotification.close();
      };
      
      // Auto close after 5 seconds for normal notifications
      if (notification.priority !== NotificationPriority.URGENT) {
        setTimeout(() => browserNotification.close(), 5000);
      }
    }
  };

  const requestNotificationPermission = useCallback(async () => {
    if (!('Notification' in window)) {
      console.log('This browser does not support notifications');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }

    return false;
  }, []);

  return {
    notifications,
    unreadCount,
    preferences,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    updatePreferences,
    sendTestNotification,
    requestNotificationPermission,
    refreshNotifications: loadNotifications
  };
}