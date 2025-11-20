// Advanced Notification Center - Admin interface for notification management
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Bell, 
  Send, 
  Settings, 
  Users, 
  Mail, 
  MessageSquare, 
  Smartphone,
  Webhook,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  TrendingUp,
  Filter,
  Search
} from 'lucide-react';
import { 
  NotificationService, 
  NotificationChannel, 
  NotificationType, 
  NotificationPriority,
  NotificationPayload,
  NotificationRecipient,
  NotificationDelivery
} from '@/lib/notificationSystem';

interface NotificationStats {
  totalSent: number;
  delivered: number;
  failed: number;
  pending: number;
  deliveryRate: number;
  channels: {
    [key in NotificationChannel]: {
      sent: number;
      delivered: number;
      failed: number;
    };
  };
}

interface BulkNotificationForm {
  type: NotificationType;
  priority: NotificationPriority;
  channels: NotificationChannel[];
  recipients: string[];
  customMessage?: string;
  scheduledFor?: string;
}

export function NotificationCenter() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState<NotificationStats>({
    totalSent: 1247,
    delivered: 1189,
    failed: 23,
    pending: 35,
    deliveryRate: 95.3,
    channels: {
      [NotificationChannel.EMAIL]: { sent: 542, delivered: 521, failed: 12 },
      [NotificationChannel.SMS]: { sent: 318, delivered: 312, failed: 6 },
      [NotificationChannel.IN_APP]: { sent: 287, delivered: 287, failed: 0 },
      [NotificationChannel.PUSH]: { sent: 78, delivered: 69, failed: 4 },
      [NotificationChannel.WEBHOOK]: { sent: 22, delivered: 20, failed: 1 }
    }
  });

  const [deliveries, setDeliveries] = useState<NotificationDelivery[]>([]);
  const [bulkForm, setBulkForm] = useState<BulkNotificationForm>({
    type: NotificationType.REGISTRATION_APPROVED,
    priority: NotificationPriority.NORMAL,
    channels: [NotificationChannel.EMAIL],
    recipients: []
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    // In production, fetch real notification deliveries
    const mockDeliveries: NotificationDelivery[] = [
      {
        id: 'del_001',
        notificationId: 'notif_001',
        recipientId: 'team_afc_leopards',
        channel: NotificationChannel.EMAIL,
        status: 'delivered',
        sentAt: new Date(Date.now() - 3600000),
        deliveredAt: new Date(Date.now() - 3500000),
        attempts: 1,
        maxAttempts: 3
      },
      {
        id: 'del_002',
        notificationId: 'notif_001',
        recipientId: 'team_gor_mahia',
        channel: NotificationChannel.SMS,
        status: 'failed',
        sentAt: new Date(Date.now() - 7200000),
        failureReason: 'Invalid phone number',
        attempts: 2,
        maxAttempts: 3
      },
      {
        id: 'del_003',
        notificationId: 'notif_002',
        recipientId: 'user_coach_001',
        channel: NotificationChannel.PUSH,
        status: 'pending',
        attempts: 0,
        maxAttempts: 2
      }
    ];
    setDeliveries(mockDeliveries);
  }, []);

  const handleSendBulkNotification = async () => {
    try {
      const recipients: NotificationRecipient[] = bulkForm.recipients.map(id => ({
        id,
        type: 'user',
        identifier: id,
        channels: bulkForm.channels
      }));

      const mockData = {
        tournamentName: 'Kenyan Premier League 2024',
        teamName: 'Selected Teams',
        approvalDate: new Date().toLocaleDateString()
      };

      const deliveryIds = await NotificationService.sendBulkNotification(
        bulkForm.type,
        recipients,
        mockData,
        bulkForm.priority
      );

      console.log(`✅ Bulk notification sent to ${recipients.length} recipients`);
      console.log(`📊 Created ${deliveryIds.length} delivery records`);

      // Reset form
      setBulkForm({
        type: NotificationType.REGISTRATION_APPROVED,
        priority: NotificationPriority.NORMAL,
        channels: [NotificationChannel.EMAIL],
        recipients: []
      });

    } catch (error) {
      console.error('Failed to send bulk notification:', error);
    }
  };

  const getChannelIcon = (channel: NotificationChannel) => {
    switch (channel) {
      case NotificationChannel.EMAIL: return <Mail className="h-4 w-4" />;
      case NotificationChannel.SMS: return <MessageSquare className="h-4 w-4" />;
      case NotificationChannel.IN_APP: return <Bell className="h-4 w-4" />;
      case NotificationChannel.PUSH: return <Smartphone className="h-4 w-4" />;
      case NotificationChannel.WEBHOOK: return <Webhook className="h-4 w-4" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'failed': return <XCircle className="h-4 w-4 text-red-600" />;
      case 'pending': return <Clock className="h-4 w-4 text-yellow-600" />;
      default: return <AlertCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  const filteredDeliveries = deliveries.filter(delivery => {
    const matchesSearch = delivery.recipientId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         delivery.notificationId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || delivery.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Notification Center</h1>
        <p className="text-gray-600">Manage multi-channel notifications and communication preferences</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="send">Send Notifications</TabsTrigger>
          <TabsTrigger value="deliveries">Delivery Log</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
        </TabsList>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard" className="space-y-6">
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Sent</CardTitle>
                <Send className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalSent.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  +12% from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Delivery Rate</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.deliveryRate}%</div>
                <p className="text-xs text-muted-foreground">
                  {stats.delivered}/{stats.totalSent} delivered
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Failed</CardTitle>
                <XCircle className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{stats.failed}</div>
                <p className="text-xs text-muted-foreground">
                  Requires attention
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending</CardTitle>
                <Clock className="h-4 w-4 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
                <p className="text-xs text-muted-foreground">
                  In queue
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Channel Performance */}
          <Card>
            <CardHeader>
              <CardTitle>Channel Performance</CardTitle>
              <CardDescription>Delivery statistics by notification channel</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(stats.channels).map(([channel, channelStats]) => (
                  <div key={channel} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      {getChannelIcon(channel as NotificationChannel)}
                      <div>
                        <div className="font-medium capitalize">{channel.replace('_', ' ')}</div>
                        <div className="text-sm text-gray-600">
                          {channelStats.sent} sent • {channelStats.delivered} delivered • {channelStats.failed} failed
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">
                        {((channelStats.delivered / channelStats.sent) * 100).toFixed(1)}%
                      </div>
                      <div className="text-sm text-gray-600">Success rate</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Send Notifications Tab */}
        <TabsContent value="send" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Send Bulk Notification</CardTitle>
              <CardDescription>Send notifications to multiple recipients across different channels</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="notification-type">Notification Type</Label>
                  <Select 
                    value={bulkForm.type} 
                    onValueChange={(value) => setBulkForm({...bulkForm, type: value as NotificationType})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={NotificationType.REGISTRATION_APPROVED}>Registration Approved</SelectItem>
                      <SelectItem value={NotificationType.REGISTRATION_REJECTED}>Registration Rejected</SelectItem>
                      <SelectItem value={NotificationType.FIXTURE_PUBLISHED}>Fixture Published</SelectItem>
                      <SelectItem value={NotificationType.MATCH_REMINDER}>Match Reminder</SelectItem>
                      <SelectItem value={NotificationType.TOURNAMENT_UPDATED}>Tournament Updated</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select 
                    value={bulkForm.priority} 
                    onValueChange={(value) => setBulkForm({...bulkForm, priority: value as NotificationPriority})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={NotificationPriority.LOW}>Low</SelectItem>
                      <SelectItem value={NotificationPriority.NORMAL}>Normal</SelectItem>
                      <SelectItem value={NotificationPriority.HIGH}>High</SelectItem>
                      <SelectItem value={NotificationPriority.URGENT}>Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Delivery Channels</Label>
                <div className="flex flex-wrap gap-4">
                  {Object.values(NotificationChannel).map(channel => (
                    <div key={channel} className="flex items-center space-x-2">
                      <Checkbox
                        id={channel}
                        checked={bulkForm.channels.includes(channel)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setBulkForm({
                              ...bulkForm,
                              channels: [...bulkForm.channels, channel]
                            });
                          } else {
                            setBulkForm({
                              ...bulkForm,
                              channels: bulkForm.channels.filter(c => c !== channel)
                            });
                          }
                        }}
                      />
                      <label htmlFor={channel} className="flex items-center space-x-2 capitalize cursor-pointer">
                        {getChannelIcon(channel)}
                        <span>{channel.replace('_', ' ')}</span>
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="recipients">Recipients (User/Team IDs)</Label>
                <Textarea
                  id="recipients"
                  placeholder="Enter recipient IDs, one per line"
                  value={bulkForm.recipients.join('\n')}
                  onChange={(e) => setBulkForm({
                    ...bulkForm,
                    recipients: e.target.value.split('\n').filter(id => id.trim())
                  })}
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="scheduled">Schedule For (Optional)</Label>
                <Input
                  id="scheduled"
                  type="datetime-local"
                  value={bulkForm.scheduledFor || ''}
                  onChange={(e) => setBulkForm({...bulkForm, scheduledFor: e.target.value})}
                />
              </div>

              <Button 
                onClick={handleSendBulkNotification}
                disabled={bulkForm.recipients.length === 0 || bulkForm.channels.length === 0}
                className="w-full"
              >
                <Send className="w-4 h-4 mr-2" />
                Send Notification
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Delivery Log Tab */}
        <TabsContent value="deliveries" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Delivery Log</CardTitle>
              <CardDescription>Track the status of all notification deliveries</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search deliveries..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                </div>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-[180px]">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Delivery List */}
              <div className="space-y-2">
                {filteredDeliveries.map((delivery) => (
                  <div key={delivery.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      {getStatusIcon(delivery.status)}
                      <div>
                        <div className="font-medium">{delivery.recipientId}</div>
                        <div className="text-sm text-gray-600">
                          {delivery.notificationId} • {delivery.channel}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div className="text-sm">
                          {delivery.sentAt ? delivery.sentAt.toLocaleString() : 'Not sent'}
                        </div>
                        <div className="text-xs text-gray-600">
                          Attempts: {delivery.attempts}/{delivery.maxAttempts}
                        </div>
                      </div>
                      
                      <Badge variant={
                        delivery.status === 'delivered' ? 'default' :
                        delivery.status === 'failed' ? 'destructive' :
                        'secondary'
                      }>
                        {delivery.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>

              {filteredDeliveries.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No deliveries found matching your criteria
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Preferences Tab */}
        <TabsContent value="preferences" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Templates</CardTitle>
              <CardDescription>Manage notification templates for different scenarios</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.values(NotificationType).slice(0, 5).map((type) => (
                  <div key={type} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-medium capitalize">{type.replace('_', ' ')}</div>
                      <Button variant="outline" size="sm">
                        <Settings className="w-4 h-4 mr-2" />
                        Edit Template
                      </Button>
                    </div>
                    <div className="text-sm text-gray-600">
                      Available channels: Email, SMS, In-App, Push
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Global Settings</CardTitle>
              <CardDescription>Configure organization-wide notification settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Enable Email Notifications</div>
                  <div className="text-sm text-gray-600">Allow email delivery for all notification types</div>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Enable SMS Notifications</div>
                  <div className="text-sm text-gray-600">Allow SMS delivery for urgent notifications</div>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Retry Failed Deliveries</div>
                  <div className="text-sm text-gray-600">Automatically retry failed notification deliveries</div>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="space-y-2">
                <Label>Quiet Hours (No SMS/Push)</Label>
                <div className="flex space-x-2">
                  <Input type="time" defaultValue="22:00" className="flex-1" />
                  <span className="self-center">to</span>
                  <Input type="time" defaultValue="07:00" className="flex-1" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}