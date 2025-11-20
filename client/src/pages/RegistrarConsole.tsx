import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Separator } from '../components/ui/separator';
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
  UserPlus
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/use-toast';
import RegistrationReviewQueue from '../components/RegistrationReviewQueue';
import EligibilityEngine from '../components/EligibilityEngine';
import { 
  useRegistrations, 
  useRegistrarStats, 
  useApproveRegistration, 
  useRejectRegistration,
  type RegistrarFilters 
} from '../hooks/useRegistrarConsole';

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

const RegistrarConsole: React.FC = () => {
  const { user, currentOrgId } = useAuth();
  const [selectedTab, setSelectedTab] = useState('queue');
  const [selectedTournamentId, setSelectedTournamentId] = useState<string>('1');
  const { toast } = useToast();
  
  // Enable keyboard shortcuts
  useKeyboardShortcuts();

  const orgId = currentOrgId || '1'; // Fallback for dev

  // Data hooks
  const { data: registrations = [], isLoading } = useRegistrations(orgId, {});
  const { data: stats } = useRegistrarStats(orgId);
  const approveRegistration = useApproveRegistration(orgId);
  const rejectRegistration = useRejectRegistration(orgId);

  // Mock stats for development
  const mockStats = {
    pendingReview: 8,
    approvedToday: 3,
    issues: 2,
    totalRegistered: 45,
    byStatus: {
      DRAFT: 5,
      SUBMITTED: 8,
      IN_REVIEW: 12,
      APPROVED: 18,
      REJECTED: 2,
      SUSPENDED: 0,
      INCOMPLETE: 0
    },
    byPriority: {
      CRITICAL: 1,
      HIGH: 3,
      MEDIUM: 8,
      LOW: 33
    }
  };

  const displayStats = stats || mockStats;

  // Enhanced bulk action handlers for the new component
  const handleBulkApprove = async (registrationIds: string[], notes?: string) => {
    try {
      for (const id of registrationIds) {
        await approveRegistration.mutateAsync({ registrationId: id, notes });
      }
      toast({
        title: "Bulk Approval Successful",
        description: `Successfully approved ${registrationIds.length} registrations.`,
      });
    } catch (error) {
      console.error('Bulk approve failed:', error);
      throw new Error('Failed to approve registrations');
    }
  };

  const handleBulkReject = async (registrationIds: string[], reason: string) => {
    try {
      for (const id of registrationIds) {
        await rejectRegistration.mutateAsync({ registrationId: id, reason });
      }
      toast({
        title: "Bulk Rejection Successful",
        description: `Successfully rejected ${registrationIds.length} registrations.`,
      });
    } catch (error) {
      console.error('Bulk reject failed:', error);
      throw new Error('Failed to reject registrations');
    }
  };

  const handleRequestChanges = async (registrationIds: string[], changes: string) => {
    try {
      // Simulate API call - replace with actual implementation
      console.log('Requesting changes for:', registrationIds, 'Changes:', changes);
      
      toast({
        title: "Change Requests Sent",
        description: `Change requests sent for ${registrationIds.length} registrations.`,
      });
    } catch (error) {
      console.error('Request changes failed:', error);
      throw new Error('Failed to send change requests');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Registrar Console</h1>
              <p className="text-gray-600">Enhanced registration management with bulk operations</p>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
              <Button variant="outline" size="sm">
                <Shield className="h-4 w-4 mr-2" />
                Audit Log
              </Button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <Clock className="h-8 w-8 text-yellow-600 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">Pending Review</p>
                    <p className="text-2xl font-bold">{displayStats.pendingReview}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <CheckCircle className="h-8 w-8 text-green-600 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">Approved Today</p>
                    <p className="text-2xl font-bold">{displayStats.approvedToday}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <AlertTriangle className="h-8 w-8 text-red-600 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">Issues</p>
                    <p className="text-2xl font-bold">{displayStats.issues}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <UserCheck className="h-8 w-8 text-blue-600 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Registered</p>
                    <p className="text-2xl font-bold">{displayStats.totalRegistered}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="queue">
              <Clock className="w-4 h-4 mr-2" />
              Review Queue
            </TabsTrigger>
            <TabsTrigger value="eligibility">
              <Shield className="w-4 h-4 mr-2" />
              Eligibility
            </TabsTrigger>
            <TabsTrigger value="approved">
              <CheckCircle className="w-4 h-4 mr-2" />
              Approved
            </TabsTrigger>
            <TabsTrigger value="rejected">
              <XCircle className="w-4 h-4 mr-2" />
              Rejected
            </TabsTrigger>
            <TabsTrigger value="analytics">
              <TrendingUp className="w-4 h-4 mr-2" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="settings">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="queue" className="space-y-6">
            <RegistrationReviewQueue 
              orgId={orgId}
              onApprove={handleBulkApprove}
              onReject={handleBulkReject}
              onRequestChanges={handleRequestChanges}
            />
          </TabsContent>

          <TabsContent value="eligibility" className="space-y-6">
            <EligibilityEngine tournamentId={selectedTournamentId} />
          </TabsContent>

          <TabsContent value="approved" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  Approved Registrations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
                  <p className="text-gray-600">Approved registrations will be displayed here</p>
                  <p className="text-sm text-gray-500 mt-2">
                    This view will show all successfully approved player registrations
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="rejected" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <XCircle className="w-5 h-5 text-red-600" />
                  Rejected Registrations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <XCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
                  <p className="text-gray-600">Rejected registrations will be displayed here</p>
                  <p className="text-sm text-gray-500 mt-2">
                    This view will show all rejected player registrations with rejection reasons
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-blue-600" />
                    Registration Trends
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center py-4">
                      <TrendingUp className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                      <p className="text-gray-600">Registration analytics coming soon</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Performance Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Average Review Time</span>
                      <span className="font-medium">2.5 hours</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Approval Rate</span>
                      <span className="font-medium text-green-600">85%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">This Month</span>
                      <span className="font-medium">{displayStats.totalRegistered} registrations</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5 text-gray-600" />
                  Registrar Settings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-medium mb-3">Notification Preferences</h3>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2">
                        <input type="checkbox" defaultChecked />
                        <span className="text-sm">Email notifications for new registrations</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input type="checkbox" defaultChecked />
                        <span className="text-sm">SMS alerts for high-priority registrations</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input type="checkbox" />
                        <span className="text-sm">Daily summary reports</span>
                      </label>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="text-sm font-medium mb-3">Auto-Approval Rules</h3>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2">
                        <input type="checkbox" />
                        <span className="text-sm">Auto-approve registrations with all verified documents</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input type="checkbox" />
                        <span className="text-sm">Auto-approve returning players</span>
                      </label>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="text-sm font-medium mb-3">Quick Actions</h3>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <UserPlus className="w-4 h-4 mr-2" />
                        Bulk Import
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="w-4 h-4 mr-2" />
                        Export Templates
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default RegistrarConsole;