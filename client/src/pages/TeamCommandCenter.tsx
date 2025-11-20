import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
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
  MessageSquare,
  Settings,
  Activity,
  Zap,
  ArrowRightLeft,
  BarChart3,
  Shield,
  UserCog,
  Command
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
import TransferManagement from '../components/TransferManagement';
import AnalyticsCharts from '../components/AnalyticsCharts';

interface TeamMember {
  id: string;
  name: string;
  position: string;
  status: 'Active' | 'Injured' | 'Suspended';
  joinDate: string;
  performance: number;
}

interface TrainingSession {
  id: string;
  title: string;
  date: string;
  time: string;
  type: 'Technical' | 'Physical' | 'Tactical';
  attendance: number;
  maxCapacity: number;
}

interface TeamOperation {
  id: string;
  title: string;
  type: 'Match' | 'Training' | 'Meeting' | 'Travel';
  date: string;
  status: 'Scheduled' | 'In Progress' | 'Completed' | 'Cancelled';
  priority: 'High' | 'Medium' | 'Low';
}

// Mock data for new tabs
const mockTeamMembers: TeamMember[] = [
  { id: '1', name: 'John Doe', position: 'Forward', status: 'Active', joinDate: '2024-01-15', performance: 85 },
  { id: '2', name: 'Jane Smith', position: 'Midfielder', status: 'Active', joinDate: '2024-02-01', performance: 92 },
  { id: '3', name: 'Mike Johnson', position: 'Defender', status: 'Injured', joinDate: '2024-01-20', performance: 78 },
];

const mockTrainingSessions: TrainingSession[] = [
  { id: '1', title: 'Morning Technical Training', date: '2024-11-01', time: '09:00', type: 'Technical', attendance: 18, maxCapacity: 20 },
  { id: '2', title: 'Fitness Session', date: '2024-11-01', time: '16:00', type: 'Physical', attendance: 20, maxCapacity: 20 },
  { id: '3', title: 'Tactical Meeting', date: '2024-11-02', time: '10:00', type: 'Tactical', attendance: 22, maxCapacity: 25 },
];

const mockOperations: TeamOperation[] = [
  { id: '1', title: 'Match vs City FC', type: 'Match', date: '2024-11-03', status: 'Scheduled', priority: 'High' },
  { id: '2', title: 'Team Bus to Stadium', type: 'Travel', date: '2024-11-03', status: 'Scheduled', priority: 'Medium' },
  { id: '3', title: 'Weekly Team Meeting', type: 'Meeting', date: '2024-11-04', status: 'Scheduled', priority: 'Low' },
];

export default function TeamCommandCenter() {
  const { user } = useAuth();
  const [location] = useLocation();
  
  // Get team data from sessionStorage and URL parameters
  const [selectedTeamData, setSelectedTeamData] = useState<any>(null);
  
  useEffect(() => {
    // Try to get team data from sessionStorage first
    const storedTeam = sessionStorage.getItem('selectedTeam');
    if (storedTeam) {
      try {
        const teamData = JSON.parse(storedTeam);
        setSelectedTeamData(teamData);
      } catch (error) {
        console.error('Error parsing stored team data:', error);
      }
    }
    
    // Also check URL parameters for teamId
    const urlParams = new URLSearchParams(location.split('?')[1] || '');
    const teamIdFromUrl = urlParams.get('teamId');
    const teamNameFromUrl = urlParams.get('teamName');
    
    if (teamIdFromUrl && !selectedTeamData) {
      // If we have URL params but no stored data, create basic team object
      setSelectedTeamData({
        id: teamIdFromUrl,
        name: teamNameFromUrl ? decodeURIComponent(teamNameFromUrl) : 'Unknown Team'
      });
    }
  }, [location]);

  const managerId = 'demo-manager-1';
  const orgId = selectedTeamData?.org_id || user?.currentOrgId || '550e8400-e29b-41d4-a716-446655440001';

  const [activeTab, setActiveTab] = useState('command');
  const [showBulkInviteDialog, setShowBulkInviteDialog] = useState(false);
  const [selectedTournament, setSelectedTournament] = useState<string>('');
  
  // Form states
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

  // Mock data for missing hook data - simplified for display
  const mockInvitations: any[] = [
    {
      id: '1',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@email.com',
      phoneNumber: '+254712345678',
      position: 'FORWARD',
      invitedAt: new Date('2024-10-28T10:00:00Z'),
      registrationLink: 'https://jamii-tourney.com/register/abc123',
      status: 'PENDING',
      remindersSent: 1,
      lastReminderAt: new Date('2024-10-30T08:00:00Z')
    },
    {
      id: '2',
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane.smith@email.com',
      position: 'MIDFIELDER',
      invitedAt: new Date('2024-10-25T14:30:00Z'),
      completedAt: new Date('2024-10-26T16:45:00Z'),
      registrationLink: 'https://jamii-tourney.com/register/def456',
      status: 'COMPLETED',
      remindersSent: 0
    }
  ];

  const mockStats = {
    totalInvitations: 25,
    completedRegistrations: 18,
    pendingInvitations: 5,
    expiredInvitations: 2,
    completionRate: 72,
    avgResponseTime: '2.3 days'
  };

  const displayInvitations = invitations.length > 0 ? invitations : mockInvitations;
  const displayStats = stats || mockStats;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': case 'Active': case 'Completed': return 'bg-green-100 text-green-800';
      case 'STARTED': case 'In Progress': return 'bg-blue-100 text-blue-800';
      case 'PENDING': case 'Scheduled': return 'bg-yellow-100 text-yellow-800';
      case 'EXPIRED': case 'Injured': case 'Cancelled': return 'bg-red-100 text-red-800';
      case 'Suspended': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED': case 'Completed': case 'Active': return <CheckCircle className="w-4 h-4" />;
      case 'STARTED': case 'In Progress': return <Clock className="w-4 h-4" />;
      case 'PENDING': case 'Scheduled': return <AlertCircle className="w-4 h-4" />;
      case 'EXPIRED': case 'Cancelled': case 'Injured': case 'Suspended': return <XCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'bg-red-100 text-red-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
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

    const emails = bulkEmails.split('\\n').filter(email => email.trim());
    
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
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to send invitations. Please try again.',
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Command className="h-8 w-8 text-primary" />
            Team Command Center
            {selectedTeamData && (
              <Badge variant="outline" className="ml-2 text-sm">
                {selectedTeamData.name}
              </Badge>
            )}
          </h1>
          <p className="text-muted-foreground mt-1">
            {selectedTeamData 
              ? `Managing ${selectedTeamData.name} - Comprehensive team operations hub`
              : "Comprehensive team management and operations hub"
            }
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button size="sm">
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      {/* Comprehensive Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-8">
          <TabsTrigger value="command" className="flex items-center gap-1">
            <Command className="w-4 h-4" />
            Command
          </TabsTrigger>
          <TabsTrigger value="roster" className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            Roster
          </TabsTrigger>
          <TabsTrigger value="staff" className="flex items-center gap-1">
            <UserCog className="w-4 h-4" />
            Staff
          </TabsTrigger>
          <TabsTrigger value="operations" className="flex items-center gap-1">
            <Activity className="w-4 h-4" />
            Operations
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-1">
            <BarChart3 className="w-4 h-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="training" className="flex items-center gap-1">
            <Zap className="w-4 h-4" />
            Training
          </TabsTrigger>
          <TabsTrigger value="transfers" className="flex items-center gap-1">
            <ArrowRightLeft className="w-4 h-4" />
            Transfers
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-1">
            <Settings className="w-4 h-4" />
            Settings
          </TabsTrigger>
        </TabsList>

        {/* Command Center Tab */}
        <TabsContent value="command" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Team Size</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">23</div>
                <p className="text-xs text-muted-foreground">+2 from last month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Players</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">21</div>
                <p className="text-xs text-muted-foreground">91% availability</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Upcoming Matches</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">3</div>
                <p className="text-xs text-muted-foreground">Next: Nov 3, 2024</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Team Performance</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">87%</div>
                <p className="text-xs text-muted-foreground">+5% from last week</p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activities */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activities</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {mockOperations.slice(0, 5).map((operation) => (
                <div key={operation.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(operation.status)}
                      <div>
                        <p className="font-medium">{operation.title}</p>
                        <p className="text-sm text-muted-foreground">{operation.date}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={getPriorityColor(operation.priority)}>
                      {operation.priority}
                    </Badge>
                    <Badge variant="outline" className={getStatusColor(operation.status)}>
                      {operation.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Roster Management Tab */}
        <TabsContent value="roster" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Team Roster</h2>
            <div className="flex gap-2">
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
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="tournament">Tournament</Label>
                      <Select value={selectedTournament} onValueChange={setSelectedTournament}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select tournament" />
                        </SelectTrigger>
                        <SelectContent>
                          {tournaments.map((tournament: any) => (
                            <SelectItem key={tournament.id} value={tournament.id}>
                              {tournament.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="emails">Player Emails (one per line)</Label>
                      <Textarea
                        id="emails"
                        placeholder="player1@email.com&#10;player2@email.com&#10;player3@email.com"
                        value={bulkEmails}
                        onChange={(e) => setBulkEmails(e.target.value)}
                        rows={6}
                      />
                    </div>
                    <div>
                      <Label htmlFor="message">Custom Message (Optional)</Label>
                      <Textarea
                        id="message"
                        placeholder="Welcome to our team! Please complete your registration..."
                        value={inviteMessage}
                        onChange={(e) => setInviteMessage(e.target.value)}
                        rows={3}
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setShowBulkInviteDialog(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleBulkInvite} disabled={bulkInvite.isPending}>
                        {bulkInvite.isPending ? (
                          <>
                            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                            Sending...
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4 mr-2" />
                            Send Invitations
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Current Players</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockTeamMembers.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="font-medium">{member.name}</p>
                        <p className="text-sm text-muted-foreground">{member.position}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-sm font-medium">Performance: {member.performance}%</p>
                        <p className="text-xs text-muted-foreground">Joined: {member.joinDate}</p>
                      </div>
                      <Badge variant="outline" className={getStatusColor(member.status)}>
                        {getStatusIcon(member.status)}
                        <span className="ml-1">{member.status}</span>
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Player Invitations Section */}
          <Card>
            <CardHeader>
              <CardTitle>Player Invitations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {displayInvitations.map((invitation) => (
                  <div key={invitation.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="font-medium">{invitation.firstName} {invitation.lastName}</p>
                        <p className="text-sm text-muted-foreground">{invitation.email}</p>
                        {invitation.position && (
                          <Badge variant="outline" className="mt-1">
                            {invitation.position}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right text-sm">
                        <p>Invited: {invitation.invitedAt ? new Date(invitation.invitedAt).toLocaleDateString() : 'N/A'}</p>
                        {invitation.completedAt && (
                          <p className="text-green-600">
                            Completed: {new Date(invitation.completedAt).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                      <Badge variant="outline" className={getStatusColor(invitation.status || 'PENDING')}>
                        {getStatusIcon(invitation.status || 'PENDING')}
                        <span className="ml-1">{invitation.status || 'PENDING'}</span>
                      </Badge>
                      {invitation.status === 'PENDING' && (
                        <Button size="sm" variant="outline">
                          <Mail className="w-4 h-4 mr-1" />
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

        {/* Staff Organization Tab */}
        <TabsContent value="staff" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Team Staff</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center py-8 text-muted-foreground">
                  <UserCog className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Staff management functionality coming soon</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Operations Center Tab */}
        <TabsContent value="operations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Team Operations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockOperations.map((operation) => (
                  <div key={operation.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="font-medium">{operation.title}</p>
                        <p className="text-sm text-muted-foreground">{operation.type} • {operation.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className={getPriorityColor(operation.priority)}>
                        {operation.priority}
                      </Badge>
                      <Badge variant="outline" className={getStatusColor(operation.status)}>
                        {getStatusIcon(operation.status)}
                        <span className="ml-1">{operation.status}</span>
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Team Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <AnalyticsCharts />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Training Management Tab */}
        <TabsContent value="training" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Training Sessions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockTrainingSessions.map((session) => (
                  <div key={session.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="font-medium">{session.title}</p>
                        <p className="text-sm text-muted-foreground">{session.date} at {session.time}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right text-sm">
                        <p>Attendance: {session.attendance}/{session.maxCapacity}</p>
                        <Progress value={(session.attendance / session.maxCapacity) * 100} className="w-20" />
                      </div>
                      <Badge variant="outline">
                        {session.type}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Transfers Tab */}
        <TabsContent value="transfers" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Transfer Management</CardTitle>
            </CardHeader>
            <CardContent>
              <TransferManagement orgId={orgId} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Team Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Team Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center py-8 text-muted-foreground">
                  <Settings className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Team settings functionality coming soon</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}