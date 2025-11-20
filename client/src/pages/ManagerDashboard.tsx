import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import TransferManagement from '../components/TransferManagement';
import AnalyticsCharts from '../components/AnalyticsCharts';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Progress } from '../components/ui/progress';
import { Separator } from '../components/ui/separator';
import { 
  Plus, 
  Send, 
  Users, 
  UserPlus, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Mail, 
  Phone, 
  Download, 
  Copy, 
  RefreshCw,
  AlertCircle,
  Calendar,
  Target,
  TrendingUp,
  MessageSquare
} from 'lucide-react';
import { 
  useManagerDashboard,
  useTeamInvitations,
  useBulkInvite,
  useResendInvitations,
  useTeamStats,
  type PlayerInvitation
} from '../hooks/useManagerDashboard';
import { toast } from '../hooks/use-toast';
import { useTournaments } from '../hooks/useTournaments';
import { useAuth } from '../hooks/useAuth';

interface PlayerInvitation {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  position?: string;
  invitedAt: string;
  completedAt?: string;
  registrationLink: string;
  status: 'PENDING' | 'STARTED' | 'COMPLETED' | 'EXPIRED';
  remindersSent: number;
  lastReminderAt?: string;
}

export default function ManagerDashboard() {
  const { user } = useAuth();
  const managerId = 'demo-manager-1'; // In real app, from auth
  const orgId = user?.currentOrgId || '550e8400-e29b-41d4-a716-446655440001'; // Match existing data

  const [activeTab, setActiveTab] = useState('overview');
  const [showBulkInviteDialog, setShowBulkInviteDialog] = useState(false);
  const [selectedTournament, setSelectedTournament] = useState<string>('');
  
  // Bulk invite form state
  const [bulkEmails, setBulkEmails] = useState('');
  const [inviteMessage, setInviteMessage] = useState('');
  const [selectedPositions, setSelectedPositions] = useState<string[]>([]);

  // Hooks
  const { data: dashboardData, isLoading: dashboardLoading } = useManagerDashboard(managerId, orgId);
  const { data: invitations = [], isLoading: invitationsLoading } = useTeamInvitations(managerId, orgId);
  const { data: stats } = useTeamStats(managerId, orgId);
  const { data: tournaments = [], isLoading: tournamentsLoading } = useTournaments(orgId);
  const bulkInvite = useBulkInvite(managerId, orgId);
  const resendInvitations = useResendInvitations(managerId, orgId);

  // Mock data for development
  const mockInvitations: PlayerInvitation[] = [
    {
      id: '1',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      phoneNumber: '+254712345678',
      position: 'Forward',
      invitedAt: '2024-10-25T10:00:00Z',
      completedAt: '2024-10-26T14:30:00Z',
      registrationLink: 'https://jamiitourney.com/register/abc123',
      status: 'COMPLETED',
      remindersSent: 1,
      lastReminderAt: '2024-10-25T18:00:00Z'
    },
    {
      id: '2',
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane.smith@example.com',
      phoneNumber: '+254723456789',
      position: 'Midfielder',
      invitedAt: '2024-10-25T10:00:00Z',
      registrationLink: 'https://jamiitourney.com/register/def456',
      status: 'STARTED',
      remindersSent: 2,
      lastReminderAt: '2024-10-27T10:00:00Z'
    },
    {
      id: '3',
      firstName: 'Mike',
      lastName: 'Johnson',
      email: 'mike.johnson@example.com',
      position: 'Goalkeeper',
      invitedAt: '2024-10-25T10:00:00Z',
      registrationLink: 'https://jamiitourney.com/register/ghi789',
      status: 'PENDING',
      remindersSent: 0
    },
    {
      id: '4',
      firstName: 'Sarah',
      lastName: 'Wilson',
      email: 'sarah.wilson@example.com',
      phoneNumber: '+254734567890',
      position: 'Defender',
      invitedAt: '2024-10-20T10:00:00Z',
      registrationLink: 'https://jamiitourney.com/register/jkl012',
      status: 'EXPIRED',
      remindersSent: 3,
      lastReminderAt: '2024-10-28T10:00:00Z'
    }
  ];

  const mockStats = {
    totalInvited: 4,
    completedRegistrations: 1,
    pendingRegistrations: 2,
    expiredInvitations: 1,
    averageCompletionTime: '1.5 days',
    completionRate: 25,
    activeReminders: 2,
    totalTeams: 1
  };

  const displayInvitations = invitations.length > 0 ? invitations : mockInvitations;
  const displayStats = stats || mockStats;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'bg-green-100 text-green-800';
      case 'STARTED': return 'bg-blue-100 text-blue-800';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'EXPIRED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED': return <CheckCircle className="w-4 h-4" />;
      case 'STARTED': return <Clock className="w-4 h-4" />;
      case 'PENDING': return <AlertCircle className="w-4 h-4" />;
      case 'EXPIRED': return <XCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const handleBulkInvite = async () => {
    if (!bulkEmails.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter at least one email address.',
        variant: 'destructive'
      });
      return;
    }

    const emails = bulkEmails.split('\n').filter(email => email.trim());
    
    try {
      await bulkInvite.mutateAsync({
        emails,
        tournamentId: selectedTournament,
        message: inviteMessage,
        positions: selectedPositions
      });

      toast({
        title: 'Invitations Sent',
        description: `Successfully sent ${emails.length} invitations.`
      });

      setShowBulkInviteDialog(false);
      setBulkEmails('');
      setInviteMessage('');
      setSelectedPositions([]);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to send invitations. Please try again.',
        variant: 'destructive'
      });
    }
  };

  const handleResendInvitation = async (invitationId: string) => {
    try {
      await resendInvitations.mutateAsync({ invitationIds: [invitationId] });
      toast({
        title: 'Reminder Sent',
        description: 'Registration reminder sent successfully.'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to send reminder.',
        variant: 'destructive'
      });
    }
  };

  const copyRegistrationLink = (link: string) => {
    navigator.clipboard.writeText(link);
    toast({
      title: 'Copied',
      description: 'Registration link copied to clipboard.'
    });
  };

  if (dashboardLoading || invitationsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading manager dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Manager Dashboard</h1>
              <p className="text-gray-600 mt-1">Manage player registrations and team rosters</p>
            </div>
            
            <div className="flex items-center space-x-3">
              <Dialog open={showBulkInviteDialog} onOpenChange={setShowBulkInviteDialog}>
                <DialogTrigger asChild>
                  <Button>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Invite Players
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Bulk Player Invitations</DialogTitle>
                    <DialogDescription>
                      Send registration invitations to multiple players at once.
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-6">
                    <div>
                      <Label htmlFor="tournament">Tournament</Label>
                      <Select value={selectedTournament} onValueChange={setSelectedTournament}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select tournament" />
                        </SelectTrigger>
                        <SelectContent>
                          {tournamentsLoading ? (
                            <SelectItem value="loading" disabled>Loading tournaments...</SelectItem>
                          ) : tournaments.length > 0 ? (
                            tournaments.map((tournament) => (
                              <SelectItem key={tournament.id} value={tournament.id}>
                                {tournament.name}
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem value="no-tournaments" disabled>No tournaments available</SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="emails">Player Emails (one per line)</Label>
                      <Textarea
                        id="emails"
                        placeholder="john.doe@example.com&#10;jane.smith@example.com&#10;mike.johnson@example.com"
                        value={bulkEmails}
                        onChange={(e) => setBulkEmails(e.target.value)}
                        rows={6}
                        className="font-mono text-sm"
                      />
                      <p className="text-sm text-gray-600 mt-1">
                        Enter one email address per line
                      </p>
                    </div>

                    <div>
                      <Label htmlFor="message">Custom Message (optional)</Label>
                      <Textarea
                        id="message"
                        placeholder="Welcome to our team! Please complete your registration using the link below..."
                        value={inviteMessage}
                        onChange={(e) => setInviteMessage(e.target.value)}
                        rows={3}
                      />
                    </div>

                    <div className="flex justify-end space-x-3">
                      <Button variant="outline" onClick={() => setShowBulkInviteDialog(false)}>
                        Cancel
                      </Button>
                      <Button 
                        onClick={handleBulkInvite} 
                        disabled={bulkInvite.isPending}
                      >
                        {bulkInvite.isPending ? (
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Send className="w-4 h-4 mr-2" />
                        )}
                        Send Invitations
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="invitations">Invitations</TabsTrigger>
            <TabsTrigger value="roster">Team Roster</TabsTrigger>
            <TabsTrigger value="transfers">Transfers</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Invited</p>
                      <p className="text-3xl font-bold text-gray-900">{displayStats.totalInvited}</p>
                    </div>
                    <div className="p-3 bg-blue-100 rounded-full">
                      <Send className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Completed</p>
                      <p className="text-3xl font-bold text-green-600">{displayStats.completedRegistrations}</p>
                    </div>
                    <div className="p-3 bg-green-100 rounded-full">
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Pending</p>
                      <p className="text-3xl font-bold text-yellow-600">{displayStats.pendingRegistrations}</p>
                    </div>
                    <div className="p-3 bg-yellow-100 rounded-full">
                      <Clock className="w-6 h-6 text-yellow-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Completion Rate</p>
                      <p className="text-3xl font-bold text-blue-600">{displayStats.completionRate}%</p>
                    </div>
                    <div className="p-3 bg-purple-100 rounded-full">
                      <Target className="w-6 h-6 text-purple-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Completion Progress */}
            <Card>
              <CardHeader>
                <CardTitle>Registration Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span>Overall Completion</span>
                    <span>{displayStats.completionRate}%</span>
                  </div>
                  <Progress value={displayStats.completionRate} className="h-2" />
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{displayStats.completedRegistrations}</div>
                      <div className="text-sm text-gray-600">Completed</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{displayStats.pendingRegistrations}</div>
                      <div className="text-sm text-gray-600">In Progress</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-yellow-600">{displayStats.activeReminders}</div>
                      <div className="text-sm text-gray-600">Need Reminder</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-600">{displayStats.expiredInvitations}</div>
                      <div className="text-sm text-gray-600">Expired</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {displayInvitations.slice(0, 5).map((invitation: PlayerInvitation) => (
                    <div key={invitation.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        {getStatusIcon(invitation.status)}
                        <div>
                          <p className="font-medium">
                            {invitation.firstName} {invitation.lastName}
                          </p>
                          <p className="text-sm text-gray-600">{invitation.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={getStatusColor(invitation.status)}>
                          {invitation.status}
                        </Badge>
                        {invitation.status !== 'COMPLETED' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleResendInvitation(invitation.id)}
                          >
                            <MessageSquare className="w-4 h-4 mr-1" />
                            Remind
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Other tab contents will continue... */}
          <TabsContent value="invitations" className="space-y-6">
            {/* Invitations Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold">Player Invitations</h2>
                <p className="text-gray-600">Manage and track all player invitation campaigns</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Export List
                </Button>
                <Button size="sm" onClick={() => setShowBulkInviteDialog(true)}>
                  <Send className="w-4 h-4 mr-2" />
                  Send Invitations
                </Button>
              </div>
            </div>

            {/* Invitation Status Overview */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {[
                { label: 'Total Sent', value: mockInvitations.length, icon: Send, color: 'blue' },
                { label: 'Pending', value: mockInvitations.filter(i => i.status === 'PENDING').length, icon: Clock, color: 'yellow' },
                { label: 'Started', value: mockInvitations.filter(i => i.status === 'STARTED').length, icon: RefreshCw, color: 'blue' },
                { label: 'Completed', value: mockInvitations.filter(i => i.status === 'COMPLETED').length, icon: CheckCircle, color: 'green' },
                { label: 'Expired', value: mockInvitations.filter(i => i.status === 'EXPIRED').length, icon: XCircle, color: 'red' }
              ].map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <Card key={index}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">{stat.label}</p>
                          <p className="text-2xl font-bold">{stat.value}</p>
                        </div>
                        <Icon className={`w-5 h-5 text-${stat.color}-600`} />
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Invitation Management Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Bulk Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Button 
                    variant="outline" 
                    className="h-20 flex flex-col items-center justify-center gap-2"
                    onClick={() => {
                      const pendingIds = mockInvitations
                        .filter(inv => inv.status === 'PENDING')
                        .map(inv => inv.id);
                      if (pendingIds.length > 0) {
                        resendInvitations.mutate({ invitationIds: pendingIds });
                      }
                    }}
                  >
                    <RefreshCw className="w-5 h-5" />
                    <span className="text-sm">Resend Pending</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-20 flex flex-col items-center justify-center gap-2"
                  >
                    <Copy className="w-5 h-5" />
                    <span className="text-sm">Copy Links</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-20 flex flex-col items-center justify-center gap-2"
                  >
                    <Download className="w-5 h-5" />
                    <span className="text-sm">Export Progress</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-20 flex flex-col items-center justify-center gap-2"
                  >
                    <MessageSquare className="w-5 h-5" />
                    <span className="text-sm">Send Reminders</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Detailed Invitations List */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>All Invitations</CardTitle>
                  <div className="flex gap-2">
                    <Select defaultValue="all">
                      <SelectTrigger className="w-[120px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="started">Started</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="expired">Expired</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button variant="outline" size="sm">
                      <RefreshCw className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {displayInvitations.map((invitation: PlayerInvitation) => (
                    <div key={invitation.id} className="border rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                            <span className="font-medium text-gray-600">
                              {invitation.firstName[0]}{invitation.lastName[0]}
                            </span>
                          </div>
                          <div>
                            <h3 className="font-semibold">{invitation.firstName} {invitation.lastName}</h3>
                            <div className="text-sm text-gray-600 space-y-1">
                              <div className="flex items-center gap-1">
                                <Mail className="w-3 h-3" />
                                {invitation.email}
                              </div>
                              {invitation.phoneNumber && (
                                <div className="flex items-center gap-1">
                                  <Phone className="w-3 h-3" />
                                  {invitation.phoneNumber}
                                </div>
                              )}
                              <div className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                Invited: {new Date(invitation.invitedAt).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4">
                          <div className="text-center">
                            <Badge 
                              className={
                                invitation.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                                invitation.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                                invitation.status === 'STARTED' ? 'bg-blue-100 text-blue-700' :
                                'bg-red-100 text-red-700'
                              }
                            >
                              {invitation.status}
                            </Badge>
                            {invitation.position && (
                              <div className="text-xs text-gray-500 mt-1">{invitation.position}</div>
                            )}
                          </div>
                          
                          <div className="text-center text-sm">
                            <div className="text-gray-600">Reminders</div>
                            <div className="font-medium">{invitation.remindersSent}</div>
                            {invitation.lastReminderAt && (
                              <div className="text-xs text-gray-500">
                                Last: {new Date(invitation.lastReminderAt).toLocaleDateString()}
                              </div>
                            )}
                          </div>
                          
                          <div className="flex flex-col gap-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => {
                                navigator.clipboard.writeText(invitation.registrationLink);
                                toast({
                                  title: "Link copied!",
                                  description: "Registration link copied to clipboard"
                                });
                              }}
                            >
                              <Copy className="w-3 h-3 mr-1" />
                              Copy Link
                            </Button>
                            <Button 
                              size="sm"
                              onClick={() => resendInvitations.mutate({ invitationIds: [invitation.id] })}
                              disabled={resendInvitations.isPending}
                            >
                              <Send className="w-3 h-3 mr-1" />
                              Resend
                            </Button>
                          </div>
                        </div>
                      </div>
                      
                      {invitation.customMessage && (
                        <div className="mt-3 p-3 bg-gray-50 rounded text-sm">
                          <span className="font-medium">Custom message: </span>
                          {invitation.customMessage}
                        </div>
                      )}
                      
                      <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                        <span>Registration Link: {invitation.registrationLink}</span>
                        <div className="flex gap-2">
                          {invitation.status === 'COMPLETED' && invitation.completedAt && (
                            <span className="text-green-600">
                              ✓ Completed {new Date(invitation.completedAt).toLocaleDateString()}
                            </span>
                          )}
                          <Button variant="ghost" size="sm" className="h-6 px-2 text-red-600 hover:text-red-700">
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {displayInvitations.length === 0 && (
                    <div className="text-center py-12">
                      <Send className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-600 mb-2">No invitations yet</h3>
                      <p className="text-gray-500 mb-6">Start building your team by sending player invitations</p>
                      <Button onClick={() => setShowBulkInviteDialog(true)}>
                        <Send className="w-4 h-4 mr-2" />
                        Send Your First Invitations
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="roster" className="space-y-6">
            {/* Roster Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold">Team Roster Management</h2>
                <p className="text-gray-600">Manage your team members, positions, and roster status</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Export Roster
                </Button>
                <Button size="sm" onClick={() => setShowBulkInviteDialog(true)}>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Add Players
                </Button>
              </div>
            </div>

            {/* Roster Statistics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total Players</p>
                      <p className="text-2xl font-bold">{mockInvitations.length + 8}</p>
                    </div>
                    <Users className="w-5 h-5 text-blue-600" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Active</p>
                      <p className="text-2xl font-bold text-green-600">18</p>
                    </div>
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Pending</p>
                      <p className="text-2xl font-bold text-yellow-600">{mockInvitations.filter(inv => inv.status === 'PENDING').length}</p>
                    </div>
                    <Clock className="w-5 h-5 text-yellow-600" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Positions Filled</p>
                      <p className="text-2xl font-bold text-purple-600">15/22</p>
                    </div>
                    <Target className="w-5 h-5 text-purple-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Position Requirements */}
            <Card>
              <CardHeader>
                <CardTitle>Position Requirements</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { position: 'Goalkeeper', filled: 2, required: 3, color: 'blue' },
                    { position: 'Defender', filled: 6, required: 8, color: 'green' },
                    { position: 'Midfielder', filled: 4, required: 6, color: 'yellow' },
                    { position: 'Forward', filled: 3, required: 5, color: 'red' }
                  ].map((pos) => (
                    <div key={pos.position} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{pos.position}</span>
                        <span className="text-sm text-gray-600">{pos.filled}/{pos.required}</span>
                      </div>
                      <Progress 
                        value={(pos.filled / pos.required) * 100} 
                        className="h-2"
                      />
                      <div className="text-xs text-gray-500">
                        {pos.required - pos.filled} more needed
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Current Roster Table */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Current Roster</CardTitle>
                  <div className="flex gap-2">
                    <Select defaultValue="all">
                      <SelectTrigger className="w-[150px]">
                        <SelectValue placeholder="Filter by status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Players</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select defaultValue="all-positions">
                      <SelectTrigger className="w-[150px]">
                        <SelectValue placeholder="Filter by position" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all-positions">All Positions</SelectItem>
                        <SelectItem value="goalkeeper">Goalkeeper</SelectItem>
                        <SelectItem value="defender">Defender</SelectItem>
                        <SelectItem value="midfielder">Midfielder</SelectItem>
                        <SelectItem value="forward">Forward</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Player</th>
                        <th className="text-left p-2">Position</th>
                        <th className="text-left p-2">Status</th>
                        <th className="text-left p-2">Joined Date</th>
                        <th className="text-left p-2">Contact</th>
                        <th className="text-left p-2">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* Active Players */}
                      {[
                        { name: 'John Doe', position: 'Goalkeeper', status: 'Active', joined: '2024-01-15', email: 'john@example.com', phone: '+254700123456' },
                        { name: 'Jane Smith', position: 'Defender', status: 'Active', joined: '2024-01-20', email: 'jane@example.com', phone: '+254700123457' },
                        { name: 'Mike Johnson', position: 'Midfielder', status: 'Active', joined: '2024-02-01', email: 'mike@example.com', phone: '+254700123458' },
                        { name: 'Sarah Wilson', position: 'Forward', status: 'Active', joined: '2024-02-05', email: 'sarah@example.com', phone: '+254700123459' }
                      ].map((player, index) => (
                        <tr key={index} className="border-b hover:bg-gray-50">
                          <td className="p-2">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                                <span className="text-sm font-medium">{player.name.split(' ').map(n => n[0]).join('')}</span>
                              </div>
                              <span className="font-medium">{player.name}</span>
                            </div>
                          </td>
                          <td className="p-2">
                            <Badge variant="secondary">{player.position}</Badge>
                          </td>
                          <td className="p-2">
                            <Badge variant="default" className="bg-green-100 text-green-700">{player.status}</Badge>
                          </td>
                          <td className="p-2 text-sm text-gray-600">{player.joined}</td>
                          <td className="p-2">
                            <div className="text-sm">
                              <div className="flex items-center gap-1">
                                <Mail className="w-3 h-3" />
                                {player.email}
                              </div>
                              <div className="flex items-center gap-1 mt-1">
                                <Phone className="w-3 h-3" />
                                {player.phone}
                              </div>
                            </div>
                          </td>
                          <td className="p-2">
                            <div className="flex gap-1">
                              <Button variant="ghost" size="sm">
                                Edit
                              </Button>
                              <Button variant="ghost" size="sm" className="text-red-600">
                                Remove
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {/* Pending Invitations */}
                      {mockInvitations.slice(0, 3).map((invitation: PlayerInvitation) => (
                        <tr key={invitation.id} className="border-b hover:bg-gray-50">
                          <td className="p-2">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                                <span className="text-sm font-medium">{invitation.firstName[0]}{invitation.lastName[0]}</span>
                              </div>
                              <span className="font-medium">{invitation.firstName} {invitation.lastName}</span>
                            </div>
                          </td>
                          <td className="p-2">
                            <Badge variant="outline">{invitation.position || 'Not assigned'}</Badge>
                          </td>
                          <td className="p-2">
                            <Badge 
                              variant="secondary" 
                              className={
                                invitation.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                                invitation.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                                invitation.status === 'STARTED' ? 'bg-blue-100 text-blue-700' :
                                'bg-red-100 text-red-700'
                              }
                            >
                              {invitation.status}
                            </Badge>
                          </td>
                          <td className="p-2 text-sm text-gray-600">{new Date(invitation.invitedAt).toLocaleDateString()}</td>
                          <td className="p-2">
                            <div className="text-sm">
                              <div className="flex items-center gap-1">
                                <Mail className="w-3 h-3" />
                                {invitation.email}
                              </div>
                              {invitation.phoneNumber && (
                                <div className="flex items-center gap-1 mt-1">
                                  <Phone className="w-3 h-3" />
                                  {invitation.phoneNumber}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="p-2">
                            <div className="flex gap-1">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => resendInvitations.mutate({ invitationIds: [invitation.id] })}
                              >
                                <RefreshCw className="w-3 h-3 mr-1" />
                                Resend
                              </Button>
                              <Button variant="ghost" size="sm" className="text-red-600">
                                Cancel
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Transfers Tab */}
          <TabsContent value="transfers" className="space-y-6">
            <TransferManagement orgId={user?.currentOrgId || ''} teamId="team-123" />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            {/* Analytics Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold">Team Analytics</h2>
                <p className="text-gray-600">Insights and trends for your team management</p>
              </div>
              <div className="flex gap-2">
                <Select defaultValue="30days">
                  <SelectTrigger className="w-[150px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7days">Last 7 days</SelectItem>
                    <SelectItem value="30days">Last 30 days</SelectItem>
                    <SelectItem value="90days">Last 90 days</SelectItem>
                    <SelectItem value="1year">Last year</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Export Report
                </Button>
              </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Avg. Response Time</p>
                      <p className="text-2xl font-bold">2.4 days</p>
                      <p className="text-xs text-green-600 flex items-center">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        15% faster
                      </p>
                    </div>
                    <Clock className="w-5 h-5 text-blue-600" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Best Position Fill</p>
                      <p className="text-2xl font-bold">Defender</p>
                      <p className="text-xs text-green-600">85% success rate</p>
                    </div>
                    <Target className="w-5 h-5 text-green-600" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Peak Invite Time</p>
                      <p className="text-2xl font-bold">2-4 PM</p>
                      <p className="text-xs text-blue-600">65% open rate</p>
                    </div>
                    <Calendar className="w-5 h-5 text-purple-600" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Team Score</p>
                      <p className="text-2xl font-bold">8.7/10</p>
                      <p className="text-xs text-green-600">Above average</p>
                    </div>
                    <TrendingUp className="w-5 h-5 text-yellow-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Advanced Analytics Charts */}
            <AnalyticsCharts className="mt-6" />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}