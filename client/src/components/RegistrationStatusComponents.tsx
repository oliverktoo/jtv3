import React from 'react';
import { Badge } from './ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Alert, AlertDescription } from './ui/alert';
import { 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  XCircle, 
  Pause, 
  FileText,
  ArrowRight,
  Bell,
  AlertCircle
} from 'lucide-react';
import { 
  RegistrationStatus, 
  StatusTransition, 
  RegistrationNotification,
  useRegistrationStatus,
  useStatusTransitions,
  usePlayerNotifications,
  useMarkNotificationRead
} from '../hooks/useRegistrationStatus';
import { formatDistanceToNow } from 'date-fns';

interface StatusBadgeProps {
  status: RegistrationStatus;
  size?: 'sm' | 'md' | 'lg';
}

export function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const getStatusConfig = (status: RegistrationStatus) => {
    switch (status) {
      case 'DRAFT':
        return {
          label: 'Draft',
          variant: 'secondary' as const,
          icon: FileText,
          color: 'text-gray-600'
        };
      case 'SUBMITTED':
        return {
          label: 'Submitted',
          variant: 'secondary' as const,
          icon: Clock,
          color: 'text-blue-600'
        };
      case 'IN_REVIEW':
        return {
          label: 'Under Review',
          variant: 'secondary' as const,
          icon: Clock,
          color: 'text-yellow-600'
        };
      case 'APPROVED':
        return {
          label: 'Approved',
          variant: 'secondary' as const,
          icon: CheckCircle,
          color: 'text-green-600'
        };
      case 'REJECTED':
        return {
          label: 'Needs Attention',
          variant: 'destructive' as const,
          icon: AlertTriangle,
          color: 'text-red-600'
        };
      case 'SUSPENDED':
        return {
          label: 'Suspended',
          variant: 'destructive' as const,
          icon: Pause,
          color: 'text-red-600'
        };
      case 'INCOMPLETE':
        return {
          label: 'Incomplete',
          variant: 'secondary' as const,
          icon: XCircle,
          color: 'text-orange-600'
        };
      default:
        return {
          label: status || 'Unknown',
          variant: 'secondary' as const,
          icon: AlertCircle,
          color: 'text-gray-500'
        };
    }
  };

  const config = getStatusConfig(status);
  if (!config) {
    return <span className="text-gray-500">Invalid Status</span>;
  }
  
  const Icon = config.icon;
  
  const sizeClass = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-2'
  }[size];

  return (
    <Badge variant={config.variant} className={`${sizeClass} ${config.color} border-current`}>
      <Icon className="w-3 h-3 mr-1" />
      {config.label}
    </Badge>
  );
}

interface RegistrationProgressProps {
  status: RegistrationStatus;
  className?: string;
}

export function RegistrationProgress({ status, className }: RegistrationProgressProps) {
  const getProgress = (status: RegistrationStatus): number => {
    switch (status) {
      case 'DRAFT': return 20;
      case 'INCOMPLETE': return 40;
      case 'SUBMITTED': return 60;
      case 'IN_REVIEW': return 80;
      case 'APPROVED': return 100;
      case 'REJECTED': return 60; // Can resume from where they left off
      case 'SUSPENDED': return 100; // Complete but suspended
      default: return 0;
    }
  };

  const getProgressColor = (status: RegistrationStatus): string => {
    switch (status) {
      case 'APPROVED': return 'bg-green-500';
      case 'REJECTED': return 'bg-red-500';
      case 'SUSPENDED': return 'bg-red-500';
      case 'IN_REVIEW': return 'bg-yellow-500';
      default: return 'bg-blue-500';
    }
  };

  const progress = getProgress(status);
  const colorClass = getProgressColor(status);

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium">Registration Progress</span>
        <span className="text-sm text-gray-500">{progress}%</span>
      </div>
      <Progress value={progress} className="h-2" />
    </div>
  );
}

interface StatusTimelineProps {
  playerId: string;
}

export function StatusTimeline({ playerId }: StatusTimelineProps) {
  const { data: transitions = [], isLoading } = useStatusTransitions(playerId);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Status History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-4">
            <div className="animate-pulse text-gray-500">Loading timeline...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (transitions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Status History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-gray-500">
            No status changes recorded yet.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Status History</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {transitions.map((transition, index) => (
            <div key={transition.id} className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <ArrowRight className="w-4 h-4 text-blue-600" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <StatusBadge status={transition.toStatus} size="sm" />
                  <span className="text-xs text-gray-500">
                    {formatDistanceToNow(new Date(transition.createdAt), { addSuffix: true })}
                  </span>
                  {transition.automaticTransition && (
                    <Badge variant="outline" className="text-xs">Auto</Badge>
                  )}
                </div>
                {transition.reason && (
                  <p className="text-sm text-gray-600 mt-1">{transition.reason}</p>
                )}
                {transition.adminNotes && (
                  <p className="text-xs text-gray-500 mt-1 italic">
                    Admin: {transition.adminNotes}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

interface NotificationCenterProps {
  playerId: string;
}

export function NotificationCenter({ playerId }: NotificationCenterProps) {
  const { data: notifications = [], isLoading } = usePlayerNotifications(playerId);
  const markAsRead = useMarkNotificationRead();
  
  const unreadNotifications = notifications.filter(n => !n.readAt);

  const handleMarkAsRead = (notificationId: string) => {
    markAsRead.mutate(notificationId);
  };

  const getNotificationIcon = (type: RegistrationNotification['type']) => {
    switch (type) {
      case 'STATUS_CHANGE':
        return CheckCircle;
      case 'DOCUMENT_REQUIRED':
        return FileText;
      case 'VERIFICATION_COMPLETE':
        return CheckCircle;
      case 'ACTION_REQUIRED':
        return AlertTriangle;
      default:
        return Bell;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Bell className="w-4 h-4 mr-2" />
            Notifications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse text-gray-500">Loading notifications...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <Bell className="w-4 h-4 mr-2" />
            Notifications
          </div>
          {unreadNotifications.length > 0 && (
            <Badge variant="destructive" className="text-xs">
              {unreadNotifications.length} new
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {notifications.length === 0 ? (
          <div className="text-center py-4 text-gray-500">
            No notifications yet.
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.slice(0, 5).map((notification) => {
              const Icon = getNotificationIcon(notification.type);
              const isUnread = !notification.readAt;
              
              return (
                <div
                  key={notification.id}
                  className={`p-3 rounded-lg border ${
                    isUnread 
                      ? 'bg-blue-50 border-blue-200' 
                      : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <Icon className={`w-5 h-5 ${
                        notification.actionRequired 
                          ? 'text-red-500' 
                          : 'text-blue-500'
                      }`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium">{notification.title}</h4>
                        <span className="text-xs text-gray-500">
                          {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                      
                      <div className="flex items-center justify-between mt-2">
                        <StatusBadge status={notification.status} size="sm" />
                        <div className="space-x-2">
                          {notification.actionUrl && notification.actionRequired && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => window.location.href = notification.actionUrl!}
                            >
                              Take Action
                            </Button>
                          )}
                          {isUnread && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleMarkAsRead(notification.id)}
                            >
                              Mark Read
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            
            {notifications.length > 5 && (
              <Button variant="outline" className="w-full">
                View All Notifications ({notifications.length})
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface StatusSummaryProps {
  playerId: string;
}

export function StatusSummary({ playerId }: StatusSummaryProps) {
  const { data: statusData, isLoading } = useRegistrationStatus(playerId);
  const { data: notifications = [] } = usePlayerNotifications(playerId);
  
  const actionRequiredCount = notifications.filter(n => n.actionRequired && !n.readAt).length;
  
  if (isLoading || !statusData) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-8 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getStatusMessage = (status: RegistrationStatus) => {
    switch (status) {
      case 'DRAFT':
        return 'Complete your registration to participate in tournaments.';
      case 'SUBMITTED':
        return 'Your registration has been submitted and is being processed.';
      case 'IN_REVIEW':
        return 'We are reviewing your documents and eligibility.';
      case 'APPROVED':
        return 'You are approved and can participate in tournaments!';
      case 'REJECTED':
        return 'Your registration needs some corrections. Please review the requirements.';
      case 'SUSPENDED':
        return 'Your registration is temporarily suspended. Contact support for assistance.';
      case 'INCOMPLETE':
        return 'Please complete all required information and upload documents.';
    }
  };

  const needsAttention = ['REJECTED', 'INCOMPLETE', 'SUSPENDED'].includes(statusData.status);

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold">Registration Status</h3>
            <p className="text-sm text-gray-600">
              Last updated {formatDistanceToNow(new Date(statusData.lastUpdated), { addSuffix: true })}
            </p>
          </div>
          <StatusBadge status={statusData.status} size="lg" />
        </div>
        
        <RegistrationProgress status={statusData.status} className="mb-4" />
        
        <p className="text-sm text-gray-700 mb-4">
          {getStatusMessage(statusData.status)}
        </p>

        {needsAttention && (
          <Alert variant="destructive" className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Action required: {getStatusMessage(statusData.status)}
            </AlertDescription>
          </Alert>
        )}

        {actionRequiredCount > 0 && (
          <Alert className="mb-4">
            <Bell className="h-4 w-4" />
            <AlertDescription>
              You have {actionRequiredCount} notification{actionRequiredCount !== 1 ? 's' : ''} requiring attention.
            </AlertDescription>
          </Alert>
        )}

        <div className="flex space-x-2">
          {statusData.status === 'DRAFT' || statusData.status === 'INCOMPLETE' && (
            <Button onClick={() => window.location.href = '/register'}>
              Complete Registration
            </Button>
          )}
          {statusData.status === 'REJECTED' && (
            <Button onClick={() => window.location.href = '/register'}>
              Fix Issues
            </Button>
          )}
          {statusData.status === 'APPROVED' && (
            <Button onClick={() => window.location.href = '/tournaments'}>
              Browse Tournaments
            </Button>
          )}
          <Button variant="outline" onClick={() => window.location.href = '/profile'}>
            View Profile
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}