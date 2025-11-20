import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Separator } from '../components/ui/separator';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Switch } from '../components/ui/switch';
import { 
  Users, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle,
  Download,
  UserCheck,
  TrendingUp,
  Settings,
  Shield,
  UserPlus,
  LayoutDashboard,
  Trophy,
  Calendar,
  MapPin,
  DollarSign,
  Camera,
  Handshake,
  BarChart3,
  Cog,
  UserCog,
  RefreshCw,
  Target,
  FileText,
  Database,
  LogOut
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/use-toast';
import RegistrationReviewQueue from '../components/RegistrationReviewQueue';
import EligibilityEngine from '../components/EligibilityEngine';
import AdminManagement from '../components/AdminManagement';
import TournamentRolesOverview from '../components/TournamentRolesOverview';
import AdminRequestManagement from '../components/AdminRequestManagement';
import { 
  useRegistrations, 
  useRegistrarStats, 
  useApproveRegistration, 
  useRejectRegistration,
  type RegistrarFilters 
} from '../hooks/useRegistrarConsole';

interface AdminStat {
  label: string;
  value: number;
  change: string;
  icon: any;
  color: string;
}

interface SystemConfig {
  maintenanceMode: boolean;
  registrationOpen: boolean;
  maxTeamsPerTournament: number;
  maxPlayersPerTeam: number;
  documentExpiryDays: number;
  autoApproval: boolean;
}

// Fetch real platform stats
const fetchPlatformStats = async () => {
  const response = await fetch('/api/platform/stats');
  if (!response.ok) throw new Error('Failed to fetch stats');
  return response.json();
};

const fetchAdminList = async () => {
  const response = await fetch('/api/admin/list');
  if (!response.ok) throw new Error('Failed to fetch admins');
  return response.json();
};

const defaultSystemConfig: SystemConfig = {
  maintenanceMode: false,
  registrationOpen: true,
  maxTeamsPerTournament: 32,
  maxPlayersPerTeam: 25,
  documentExpiryDays: 365,
  autoApproval: false
};

// Add keyboard shortcut support
const useKeyboardShortcuts = () => {
  React.useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      // Ctrl/Cmd + R for refresh
      if ((event.ctrlKey || event.metaKey) && event.key === 'r') {
        event.preventDefault();
        window.location.reload();
      }
      
      // Ctrl/Cmd + E for export
      if ((event.ctrlKey || event.metaKey) && event.key === 'e') {
        event.preventDefault();
        // Export functionality
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, []);
};

export default function AdminSuperHub() {
  const { user, currentOrgId } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedTournamentId, setSelectedTournamentId] = useState<string>('1');
  const [systemConfig, setSystemConfig] = useState<SystemConfig>(defaultSystemConfig);
  const { toast } = useToast();
  
  // Enable keyboard shortcuts
  useKeyboardShortcuts();

  // Use user's actual org ID or fallback to mock UUID for super admins
  const orgId = currentOrgId || user?.organizations?.[0]?.id || '550e8400-e29b-41d4-a716-446655440001';

  // Fetch real platform statistics
  const { data: platformStats, isLoading: statsLoading, refetch: refetchStats } = useQuery({
    queryKey: ['platformStats'],
    queryFn: fetchPlatformStats,
  });

  // Fetch admin list for counting
  const { data: adminData, isLoading: adminsLoading } = useQuery({
    queryKey: ['adminList'],
    queryFn: fetchAdminList,
  });

  // Data hooks for registrations
  const { data: registrations = [], isLoading } = useRegistrations(orgId, {});
  const { data: registrarStats } = useRegistrarStats(orgId);
  const approveRegistration = useApproveRegistration(orgId);
  const rejectRegistration = useRejectRegistration(orgId);

  // Calculate admin stats from real data
  const adminStats: AdminStat[] = [
    { 
      label: 'Total Users', 
      value: platformStats?.data?.totalUsers || 0, 
      change: '+0%', 
      icon: Users, 
      color: 'text-blue-600' 
    },
    { 
      label: 'Total Admins', 
      value: adminData?.data?.length || 0, 
      change: '+0%', 
      icon: UserCog, 
      color: 'text-green-600' 
    },
    { 
      label: 'Pending Reviews', 
      value: registrarStats?.pendingReview || 0, 
      change: '+0%', 
      icon: Clock, 
      color: 'text-yellow-600' 
    },
    { 
      label: 'Total Tournaments', 
      value: platformStats?.data?.totalTournaments || 0, 
      change: '+0%', 
      icon: Trophy, 
      color: 'text-purple-600' 
    },
  ];

  // Enhanced bulk action handlers
  const handleBulkApprove = async (registrationIds: string[], notes?: string) => {
    try {
      for (const id of registrationIds) {
        await approveRegistration.mutateAsync({ registrationId: id, notes });
      }
      toast({
        title: "Bulk Approval Complete",
        description: `${registrationIds.length} registrations approved successfully.`,
      });
    } catch (error) {
      toast({
        title: "Bulk Approval Failed",
        description: "Some registrations could not be approved.",
        variant: "destructive",
      });
    }
  };

  const handleBulkReject = async (registrationIds: string[], reason: string) => {
    try {
      for (const id of registrationIds) {
        await rejectRegistration.mutateAsync({ registrationId: id, reason });
      }
      toast({
        title: "Bulk Rejection Complete",
        description: `${registrationIds.length} registrations rejected.`,
      });
    } catch (error) {
      toast({
        title: "Bulk Rejection Failed", 
        description: "Some registrations could not be rejected.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Admin SuperHub</h1>
          <p className="text-muted-foreground">
            Comprehensive administrative control center for system management, registrations, analytics, and configuration
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => {
              refetchStats();
              toast({ title: "Refreshing data...", description: "Loading latest statistics" });
            }}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh All
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => {
              localStorage.removeItem('authToken');
              localStorage.removeItem('userId');
              window.location.href = '/auth/login';
            }}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
          <Button size="sm">
            <Download className="w-4 h-4 mr-2" />
            System Export
          </Button>
        </div>
      </div>

      {/* Quick Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {statsLoading || adminsLoading ? (
          <Card className="col-span-4">
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground">Loading statistics...</p>
            </CardContent>
          </Card>
        ) : (
          adminStats.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                      <p className="text-2xl font-bold">{stat.value}</p>
                      <p className="text-xs text-muted-foreground mt-1">{stat.change}</p>
                    </div>
                    <div className="p-3 bg-secondary rounded-full">
                      <IconComponent className={`w-6 h-6 ${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Main Tabs Interface */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <LayoutDashboard className="w-4 h-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="admins" className="flex items-center gap-2">
            <UserCog className="w-4 h-4" />
            Admin Management
          </TabsTrigger>
          <TabsTrigger value="registrations" className="flex items-center gap-2">
            <UserCheck className="w-4 h-4" />
            Registrations
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="configuration" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Configuration
          </TabsTrigger>
        </TabsList>

        {/* ADMIN MANAGEMENT TAB */}
        <TabsContent value="admins" className="space-y-6">
          <Tabs defaultValue="management" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="management">Admin Management</TabsTrigger>
              <TabsTrigger value="requests">Admin Requests</TabsTrigger>
              <TabsTrigger value="roles">Role Structure & Permissions</TabsTrigger>
            </TabsList>
            <TabsContent value="management">
              <AdminManagement />
            </TabsContent>
            <TabsContent value="requests">
              <AdminRequestManagement />
            </TabsContent>
            <TabsContent value="roles">
              <TournamentRolesOverview />
            </TabsContent>
          </Tabs>
        </TabsContent>

        {/* DASHBOARD TAB */}
        <TabsContent value="dashboard" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* System Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  System Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm">System Status</span>
                  <Badge variant="default">Operational</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Database Connection</span>
                  <Badge variant="default">{platformStats?.status === 'healthy' ? 'Connected' : 'Unknown'}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Total Users</span>
                  <Badge variant="outline">{platformStats?.data?.totalUsers || 0}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Total Organizations</span>
                  <Badge variant="secondary">{platformStats?.data?.totalOrganizations || 0}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Total Tournaments</span>
                  <Badge variant="secondary">{platformStats?.data?.totalTournaments || 0}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Total Teams</span>
                  <Badge variant="secondary">{platformStats?.data?.totalTeams || 0}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Total Players</span>
                  <Badge variant="secondary">{platformStats?.data?.totalPlayers || 0}</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {statsLoading ? (
                  <p className="text-sm text-muted-foreground">Loading recent activity...</p>
                ) : (
                  <>
                    <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                      <Users className="w-5 h-5 text-blue-600" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{platformStats?.data?.totalUsers || 0} total users in system</p>
                        <p className="text-xs text-muted-foreground">Across all organizations</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                      <Trophy className="w-5 h-5 text-green-600" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{platformStats?.data?.totalTournaments || 0} tournaments created</p>
                        <p className="text-xs text-muted-foreground">Active competitions</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                      <UserCog className="w-5 h-5 text-purple-600" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{adminData?.data?.length || 0} system administrators</p>
                        <p className="text-xs text-muted-foreground">Managing the platform</p>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Button 
                  variant="outline" 
                  className="h-20 flex flex-col gap-2" 
                  onClick={() => setActiveTab("registrations")}
                >
                  <UserCheck className="w-6 h-6" />
                  <span>Review Registrations</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="h-20 flex flex-col gap-2" 
                  onClick={() => setActiveTab("analytics")}
                >
                  <BarChart3 className="w-6 h-6" />
                  <span>View Analytics</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="h-20 flex flex-col gap-2" 
                  onClick={() => setActiveTab("configuration")}
                >
                  <Cog className="w-6 h-6" />
                  <span>System Settings</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="h-20 flex flex-col gap-2" 
                  onClick={() => setActiveTab("users")}
                >
                  <UserCog className="w-6 h-6" />
                  <span>Manage Users</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* REGISTRATIONS TAB - Integrating RegistrarConsole functionality */}
        <TabsContent value="registrations" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Registration Management</h2>
            <div className="flex gap-2">
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export Queue
              </Button>
            </div>
          </div>

          {/* Registration Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Pending Review</p>
                    <p className="text-2xl font-bold text-yellow-600">{registrarStats?.pendingReview || 0}</p>
                  </div>
                  <Clock className="w-8 h-8 text-yellow-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Approved Today</p>
                    <p className="text-2xl font-bold text-green-600">{registrarStats?.approvedToday || 0}</p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Issues</p>
                    <p className="text-2xl font-bold text-red-600">{registrarStats?.issues || 0}</p>
                  </div>
                  <AlertTriangle className="w-8 h-8 text-red-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Registered</p>
                    <p className="text-2xl font-bold text-blue-600">{registrarStats?.totalRegistered || 0}</p>
                  </div>
                  <Users className="w-8 h-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Registration Queue Component */}
          <Card>
            <CardContent className="p-6">
              <RegistrationReviewQueue
                onBulkApprove={handleBulkApprove}
                onBulkReject={handleBulkReject}
                tournamentId={selectedTournamentId}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* ANALYTICS TAB */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">System Analytics</h2>
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export Analytics
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>User Growth</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 bg-muted rounded-lg flex items-center justify-center">
                  <p className="text-muted-foreground">User Growth Chart Placeholder</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Registration Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 bg-muted rounded-lg flex items-center justify-center">
                  <p className="text-muted-foreground">Registration Trends Chart Placeholder</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">99.9%</div>
                  <div className="text-sm text-muted-foreground">System Uptime</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">2.3s</div>
                  <div className="text-sm text-muted-foreground">Avg Response Time</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">15.2K</div>
                  <div className="text-sm text-muted-foreground">Daily Active Users</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* CONFIGURATION TAB */}
        <TabsContent value="configuration" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">System Configuration</h2>
            <Button>
              <Settings className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>General Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Maintenance Mode</Label>
                    <p className="text-sm text-muted-foreground">Enable system maintenance mode</p>
                  </div>
                  <Switch 
                    checked={systemConfig.maintenanceMode}
                    onCheckedChange={(checked) => 
                      setSystemConfig(prev => ({ ...prev, maintenanceMode: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Registration Open</Label>
                    <p className="text-sm text-muted-foreground">Allow new player registrations</p>
                  </div>
                  <Switch 
                    checked={systemConfig.registrationOpen}
                    onCheckedChange={(checked) => 
                      setSystemConfig(prev => ({ ...prev, registrationOpen: checked }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>Max Teams Per Tournament</Label>
                  <Input 
                    type="number"
                    value={systemConfig.maxTeamsPerTournament}
                    onChange={(e) => 
                      setSystemConfig(prev => ({ ...prev, maxTeamsPerTournament: parseInt(e.target.value) }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>Max Players Per Team</Label>
                  <Input 
                    type="number"
                    value={systemConfig.maxPlayersPerTeam}
                    onChange={(e) => 
                      setSystemConfig(prev => ({ ...prev, maxPlayersPerTeam: parseInt(e.target.value) }))
                    }
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Document Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Document Expiry (Days)</Label>
                  <Input 
                    type="number"
                    value={systemConfig.documentExpiryDays}
                    onChange={(e) => 
                      setSystemConfig(prev => ({ ...prev, documentExpiryDays: parseInt(e.target.value) }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Auto Approval</Label>
                    <p className="text-sm text-muted-foreground">Automatically approve verified documents</p>
                  </div>
                  <Switch 
                    checked={systemConfig.autoApproval}
                    onCheckedChange={(checked) => 
                      setSystemConfig(prev => ({ ...prev, autoApproval: checked }))
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* USER MANAGEMENT TAB */}
        <TabsContent value="users" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">User Management</h2>
            <div className="flex gap-2">
              <Button variant="outline">
                <UserPlus className="w-4 h-4 mr-2" />
                Add User
              </Button>
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export Users
              </Button>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>User Directory</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <UserCog className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">User Management Interface</h3>
                <p className="text-muted-foreground">Comprehensive user management functionality would be implemented here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}