import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Checkbox } from '../ui/checkbox';
import { Textarea } from '../ui/textarea';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import { Alert, AlertDescription } from '../ui/alert';
import { 
  Users, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle,
  Search,
  Filter,
  Download,
  UserCheck,
  Eye,
  MoreHorizontal,
  Mail,
  Phone,
  Loader2,
  Check,
  X,
  ChevronDown,
  Calendar,
  MapPin,
  Flag,
  UserPlus,
  Shield,
  RefreshCw,
  FileText,
  TrendingUp,
  Edit,
  Trash2,
  RotateCcw
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { useToast } from '../../hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';

interface TeamRegistration {
  id: string;
  team_id: string;
  tournament_id: string;
  registration_status: 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'WITHDRAWN';
  registration_date: string;
  approval_date?: string;
  rejection_date?: string;
  rejection_reason?: string;
  squad_size: number;
  jersey_colors?: string;
  notes?: string;
  teams?: {
    id: string;
    name: string;
    club_name?: string;
    county_id?: string;
    sub_county_id?: string;
    ward_id?: string;
    org_id?: string;
    contact_email: string;
    contact_phone?: string;
  };
  tournaments?: {
    id: string;
    name: string;
    sport_id?: string;
  };
  team: {
    id: string;
    name: string;
    club_name?: string;
    county_id?: string;
    sub_county_id?: string;
    ward_id?: string;
    org_id?: string;
    contact_email: string;
    contact_phone?: string;
    organizations?: {
      id: string;
      name: string;
    } | null;
    counties?: {
      id: string;
      name: string;
    } | null;
    sub_counties?: {
      id: string;
      name: string;
    } | null;
    wards?: {
      id: string;
      name: string;
    } | null;
  };
  tournament?: {
    id: string;
    name: string;
    sport_id?: string;
    sports?: {
      id: string;
      name: string;
      code: string;
    } | null;
  };
  created_at: string;
  updated_at: string;
}

interface RegistrationStats {
  total: number;
  by_status: {
    SUBMITTED: number;
    APPROVED: number;
    REJECTED: number;
    WITHDRAWN: number;
  };
  approval_rate: number;
  pending_review: number;
}

interface TournamentTeamRegistrationAdminProps {
  tournamentId: string;
  tournamentName: string;
}

export default function TournamentTeamRegistrationAdmin({ 
  tournamentId, 
  tournamentName 
}: TournamentTeamRegistrationAdminProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // State management
  const [selectedRegistrations, setSelectedRegistrations] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showApprovalDialog, setShowApprovalDialog] = useState(false);
  const [showRejectionDialog, setShowRejectionDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedRegistration, setSelectedRegistration] = useState<TeamRegistration | null>(null);
  const [approvalNotes, setApprovalNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [editFormData, setEditFormData] = useState({
    squad_size: 22,
    jersey_colors: '',
    notes: ''
  });

  // API calls
  const fetchRegistrations = async () => {
    let query = supabase
      .from('team_tournament_registrations')
      .select(`
        *,
        teams!inner (
          id,
          name,
          club_name,
          contact_email,
          contact_phone,
          county_id,
          sub_county_id,
          ward_id,
          org_id
        ),
        tournaments!inner (
          id,
          name,
          sport_id
        )
      `)
      .eq('tournament_id', tournamentId)
      .limit(100);

    // Apply status filter
    if (statusFilter !== 'all') {
      query = query.eq('registration_status', statusFilter);
    }

    // Apply search filter
    if (searchQuery) {
      query = query.or(`teams.name.ilike.%${searchQuery}%,teams.club_name.ilike.%${searchQuery}%`);
    }

    const { data, error } = await query;
    if (error) throw new Error(`Failed to fetch registrations: ${error.message}`);
    
    if (!data || data.length === 0) {
      return { data: [], total: 0 };
    }

    // Get unique IDs for additional data fetching
    const teamIds = Array.from(new Set(data.map(reg => reg.teams?.id).filter(Boolean)));
    const tournamentIds = Array.from(new Set(data.map(reg => reg.tournaments?.id).filter(Boolean)));
    const orgIds = Array.from(new Set(data.map(reg => reg.teams?.org_id).filter(Boolean)));
    const countyIds = Array.from(new Set(data.map(reg => reg.teams?.county_id).filter(Boolean)));
    const subCountyIds = Array.from(new Set(data.map(reg => reg.teams?.sub_county_id).filter(Boolean)));
    const wardIds = Array.from(new Set(data.map(reg => reg.teams?.ward_id).filter(Boolean)));
    const sportIds = Array.from(new Set(data.map(reg => reg.tournaments?.sport_id).filter(Boolean)));

    // Fetch related data separately to avoid relationship conflicts
    const [orgsData, countiesData, subCountiesData, wardsData, sportsData] = await Promise.all([
      orgIds.length > 0 ? supabase.from('organizations').select('id, name').in('id', orgIds) : { data: [] },
      countyIds.length > 0 ? supabase.from('counties').select('id, name').in('id', countyIds) : { data: [] },
      subCountyIds.length > 0 ? supabase.from('sub_counties').select('id, name').in('id', subCountyIds) : { data: [] },
      wardIds.length > 0 ? supabase.from('wards').select('id, name').in('id', wardIds) : { data: [] },
      sportIds.length > 0 ? supabase.from('sports').select('id, name, slug').in('id', sportIds) : { data: [] }
    ]);

    // Create lookup maps for efficient data joining
    const orgsMap = new Map((orgsData.data || []).map(org => [org.id, org]));
    const countiesMap = new Map((countiesData.data || []).map(county => [county.id, county]));
    const subCountiesMap = new Map((subCountiesData.data || []).map(sc => [sc.id, sc]));
    const wardsMap = new Map((wardsData.data || []).map(ward => [ward.id, ward]));
    const sportsMap = new Map((sportsData.data || []).map(sport => [sport.id, sport]));

    // Enhance the registration data with joined information
    const enhancedData = data.map(registration => ({
      ...registration,
      team: {
        ...registration.teams,
        organizations: registration.teams?.org_id ? orgsMap.get(registration.teams.org_id) : null,
        counties: registration.teams?.county_id ? countiesMap.get(registration.teams.county_id) : null,
        sub_counties: registration.teams?.sub_county_id ? subCountiesMap.get(registration.teams.sub_county_id) : null,
        wards: registration.teams?.ward_id ? wardsMap.get(registration.teams.ward_id) : null
      },
      tournament: {
        ...registration.tournaments,
        sports: registration.tournaments?.sport_id ? sportsMap.get(registration.tournaments.sport_id) : null
      }
    }));

    return { data: enhancedData, total: enhancedData.length };
  };

  const fetchStats = async () => {
    const { data, error } = await supabase
      .from('team_tournament_registrations')
      .select('registration_status')
      .eq('tournament_id', tournamentId);
    
    if (error) throw new Error(`Failed to fetch stats: ${error.message}`);
    
    // Calculate stats from the data
    const stats = {
      total: data?.length || 0,
      submitted: data?.filter(r => r.registration_status === 'SUBMITTED').length || 0,
      approved: data?.filter(r => r.registration_status === 'APPROVED').length || 0,
      rejected: data?.filter(r => r.registration_status === 'REJECTED').length || 0,
      withdrawn: data?.filter(r => r.registration_status === 'WITHDRAWN').length || 0,
    };
    
    return { data: stats };
  };

  // Queries
  const { data: registrationsData, isLoading, error } = useQuery({
    queryKey: ['tournament-registrations', tournamentId, statusFilter, searchQuery],
    queryFn: fetchRegistrations,
    refetchInterval: 30000, // Auto-refresh every 30 seconds
  });

  const { data: statsData } = useQuery({
    queryKey: ['tournament-registration-stats', tournamentId],
    queryFn: fetchStats,
    refetchInterval: 30000,
  });

  // Mutations
  const approveMutation = useMutation({
    mutationFn: async ({ registration_ids, notes }: { registration_ids: string[], notes?: string }) => {
      const approvalInfo = notes?.trim() ? `Approved by admin - ${notes.trim()}` : 'Approved by admin';
      const { data, error } = await supabase
        .from('team_tournament_registrations')
        .update({ 
          registration_status: 'APPROVED',
          approval_date: new Date().toISOString(),
          notes: approvalInfo
        })
        .in('id', registration_ids)
        .select();
      
      if (error) throw new Error(`Failed to approve registrations: ${error.message}`);
      return { approved_count: data?.length || 0, data };
    },
    onSuccess: (data) => {
      toast({
        title: "Teams Approved! ✅",
        description: `${data.approved_count} team registrations have been approved and can now participate in fixtures.`,
      });
      queryClient.invalidateQueries({ queryKey: ['tournament-registrations'] });
      queryClient.invalidateQueries({ queryKey: ['tournament-registration-stats'] });
      queryClient.invalidateQueries({ queryKey: ['tournament-teams'] }); // Refresh tournament teams for Jamii Fixtures
      setSelectedRegistrations([]);
      setShowApprovalDialog(false);
      setApprovalNotes('');
    },
    onError: (error) => {
      toast({
        title: "Approval Failed ❌",
        description: `Failed to approve team registrations: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  const rejectMutation = useMutation({
    mutationFn: async ({ registration_ids, reason }: { registration_ids: string[], reason: string }) => {
      const rejectionInfo = `Rejected by admin - Reason: ${reason.trim()}`;
      const { data, error } = await supabase
        .from('team_tournament_registrations')
        .update({ 
          registration_status: 'REJECTED',
          rejection_date: new Date().toISOString(),
          rejection_reason: reason.trim(),
          notes: rejectionInfo
        })
        .in('id', registration_ids)
        .select();
      
      if (error) throw new Error(`Failed to reject registrations: ${error.message}`);
      return { rejected_count: data?.length || 0, data };
    },
    onSuccess: (data) => {
      toast({
        title: "Teams Rejected",
        description: `${data.rejected_count} team registrations have been rejected.`,
      });
      queryClient.invalidateQueries({ queryKey: ['tournament-registrations'] });
      queryClient.invalidateQueries({ queryKey: ['tournament-registration-stats'] });
      setSelectedRegistrations([]);
      setShowRejectionDialog(false);
      setRejectionReason('');
    },
    onError: (error) => {
      toast({
        title: "Rejection Failed ❌",
        description: `Failed to reject team registrations: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  // Update registration mutation
  const updateMutation = useMutation({
    mutationFn: async ({ registration_id, updates }: { registration_id: string, updates: any }) => {
      const { data, error } = await supabase
        .from('team_tournament_registrations')
        .update(updates)
        .eq('id', registration_id)
        .select();
      
      if (error) throw new Error(`Failed to update registration: ${error.message}`);
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Registration Updated ✅",
        description: "Team registration has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['tournament-registrations'] });
      queryClient.invalidateQueries({ queryKey: ['tournament-registration-stats'] });
    },
    onError: (error) => {
      toast({
        title: "Update Failed ❌",
        description: `Failed to update registration: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  // Delete/Withdraw registration mutation
  const deleteMutation = useMutation({
    mutationFn: async (registration_id: string) => {
      const { data, error } = await supabase
        .from('team_tournament_registrations')
        .delete()
        .eq('id', registration_id)
        .select();
      
      if (error) throw new Error(`Failed to delete registration: ${error.message}`);
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Registration Deleted ✅",
        description: "Team registration has been removed from the tournament.",
      });
      queryClient.invalidateQueries({ queryKey: ['tournament-registrations'] });
      queryClient.invalidateQueries({ queryKey: ['tournament-registration-stats'] });
      queryClient.invalidateQueries({ queryKey: ['tournament-teams'] });
    },
    onError: (error) => {
      toast({
        title: "Delete Failed ❌",
        description: `Failed to delete registration: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  // Revoke approval mutation
  const revokeApprovalMutation = useMutation({
    mutationFn: async (registration_ids: string[]) => {
      const { data, error } = await supabase
        .from('team_tournament_registrations')
        .update({ 
          registration_status: 'SUBMITTED',
          approval_date: null,
          notes: 'Approval revoked by admin'
        })
        .in('id', registration_ids)
        .select();
      
      if (error) throw new Error(`Failed to revoke approval: ${error.message}`);
      return { revoked_count: data?.length || 0, data };
    },
    onSuccess: (data) => {
      toast({
        title: "Approval Revoked",
        description: `${data.revoked_count} team approval(s) have been revoked.`,
      });
      queryClient.invalidateQueries({ queryKey: ['tournament-registrations'] });
      queryClient.invalidateQueries({ queryKey: ['tournament-registration-stats'] });
      queryClient.invalidateQueries({ queryKey: ['tournament-teams'] });
      setSelectedRegistrations([]);
    },
    onError: (error) => {
      toast({
        title: "Revoke Failed ❌",
        description: `Failed to revoke approval: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  const registrations: TeamRegistration[] = registrationsData?.data || [];
  const stats: RegistrationStats = {
    total: statsData?.data?.total || 0,
    by_status: {
      SUBMITTED: statsData?.data?.submitted || 0,
      APPROVED: statsData?.data?.approved || 0,
      REJECTED: statsData?.data?.rejected || 0,
      WITHDRAWN: statsData?.data?.withdrawn || 0
    },
    approval_rate: statsData?.data?.total ? Math.round((statsData.data.approved / statsData.data.total) * 100) : 0,
    pending_review: statsData?.data?.submitted || 0
  };

  // Filtered registrations
  const filteredRegistrations = useMemo(() => {
    let filtered = registrations;

    if (statusFilter !== 'all') {
      filtered = filtered.filter(reg => reg.registration_status === statusFilter);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(reg => 
        reg.team.name.toLowerCase().includes(query) ||
        (reg.team as any).code?.toLowerCase().includes(query) ||
        reg.team.organizations?.name?.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [registrations, statusFilter, searchQuery]);

  // Helper functions
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'SUBMITTED':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" />Pending Review</Badge>;
      case 'APPROVED':
        return <Badge variant="default" className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>;
      case 'REJECTED':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
      case 'WITHDRAWN':
        return <Badge variant="outline"><Flag className="w-3 h-3 mr-1" />Withdrawn</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const selectableIds = filteredRegistrations
        .filter(reg => reg.registration_status !== 'REJECTED' && reg.registration_status !== 'WITHDRAWN')
        .map(reg => reg.id);
      setSelectedRegistrations(selectableIds);
    } else {
      setSelectedRegistrations([]);
    }
  };

  const handleSelectRegistration = (registrationId: string, checked: boolean) => {
    if (checked) {
      setSelectedRegistrations([...selectedRegistrations, registrationId]);
    } else {
      setSelectedRegistrations(selectedRegistrations.filter(id => id !== registrationId));
    }
  };

  const handleBulkApprove = () => {
    if (selectedRegistrations.length === 0) return;
    setShowApprovalDialog(true);
  };

  const handleBulkReject = () => {
    if (selectedRegistrations.length === 0) return;
    setShowRejectionDialog(true);
  };

  const confirmApproval = () => {
    approveMutation.mutate({ 
      registration_ids: selectedRegistrations,
      notes: approvalNotes.trim() || undefined
    });
  };

  const confirmRejection = () => {
    if (!rejectionReason.trim()) {
      toast({
        title: "Rejection Reason Required",
        description: "Please provide a reason for rejecting these registrations.",
        variant: "destructive",
      });
      return;
    }
    rejectMutation.mutate({ 
      registration_ids: selectedRegistrations,
      reason: rejectionReason.trim()
    });
  };

  const exportRegistrations = () => {
    // TODO: Implement CSV export
    toast({
      title: "Export Feature",
      description: "CSV export functionality will be implemented in the next update.",
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin" />
        <span className="ml-2 text-lg">Loading team registrations...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Alert className="border-red-200 bg-red-50">
        <AlertTriangle className="w-4 h-4" />
        <AlertDescription>
          Failed to load team registrations: {error.message}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Team Registrations</h2>
          <p className="text-muted-foreground">
            Manage team registrations for {tournamentName}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => queryClient.invalidateQueries()}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={exportRegistrations}>
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Teams</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending Review</p>
                <p className="text-2xl font-bold">{stats.pending_review}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Approved</p>
                <p className="text-2xl font-bold">{stats.by_status.APPROVED}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Approval Rate</p>
                <p className="text-2xl font-bold">{stats.approval_rate}%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Actions */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search teams..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="SUBMITTED">Pending Review</SelectItem>
              <SelectItem value="APPROVED">Approved</SelectItem>
              <SelectItem value="REJECTED">Rejected</SelectItem>
              <SelectItem value="WITHDRAWN">Withdrawn</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {selectedRegistrations.length > 0 && (
          <div className="flex gap-2">
            <Badge variant="secondary" className="px-3 py-1">
              {selectedRegistrations.length} selected
            </Badge>
            <Button 
              size="sm" 
              onClick={handleBulkApprove}
              disabled={approveMutation.isPending}
              className="bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Approve Selected
            </Button>
            <Button 
              size="sm" 
              variant="destructive"
              onClick={handleBulkReject}
              disabled={rejectMutation.isPending}
            >
              <XCircle className="w-4 h-4 mr-2" />
              Reject Selected
            </Button>
          </div>
        )}
      </div>

      {/* Registrations Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Team Registration Queue
            <Badge variant="outline">{filteredRegistrations.length} teams</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredRegistrations.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-medium">No team registrations found</p>
              <p className="text-muted-foreground">
                {statusFilter === 'all' ? 'No teams have registered yet' : `No ${statusFilter.toLowerCase()} registrations`}
              </p>
            </div>
          ) : (
            <div className="max-h-[500px] overflow-auto relative">
              <Table>
                <TableHeader className="sticky top-0 bg-white z-10">
                  <TableRow>
                    <TableHead className="w-12 bg-white">
                      <Checkbox
                        checked={selectedRegistrations.length > 0 && selectedRegistrations.length === filteredRegistrations.filter(reg => reg.registration_status !== 'REJECTED' && reg.registration_status !== 'WITHDRAWN').length}
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                    <TableHead className="bg-white">Team</TableHead>
                    <TableHead className="bg-white">Organization</TableHead>
                    <TableHead className="bg-white">Geography</TableHead>
                    <TableHead className="bg-white">Sport</TableHead>
                    <TableHead className="bg-white">Status</TableHead>
                    <TableHead className="bg-white">Squad Size</TableHead>
                    <TableHead className="bg-white">Registered</TableHead>
                    <TableHead className="bg-white">Contact</TableHead>
                    <TableHead className="w-20 bg-white">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                {filteredRegistrations.map((registration) => (
                  <TableRow key={registration.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedRegistrations.includes(registration.id)}
                        onCheckedChange={(checked) => handleSelectRegistration(registration.id, checked as boolean)}
                        disabled={registration.registration_status === 'REJECTED' || registration.registration_status === 'WITHDRAWN'}
                      />
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{registration.team.name}</p>
                        <p className="text-sm text-muted-foreground">{registration.team.club_name || 'N/A'}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm">
                        {registration.team.organizations?.name || 'Independent Team'}
                      </p>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {registration.team.wards?.name && (
                          <p className="font-medium">{registration.team.wards.name}</p>
                        )}
                        {registration.team.sub_counties?.name && (
                          <p className="text-xs text-muted-foreground">{registration.team.sub_counties.name}</p>
                        )}
                        {registration.team.counties?.name && (
                          <p className="text-xs text-muted-foreground">{registration.team.counties.name}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm">
                        {registration.tournament?.sports?.name || 'N/A'}
                      </p>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(registration.registration_status)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{registration.squad_size} players</Badge>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm">
                        {format(new Date(registration.registration_date), 'MMM d, yyyy')}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(registration.registration_date), { addSuffix: true })}
                      </p>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {registration.team.contact_email && (
                          <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                            <Mail className="w-3 h-3" />
                          </Button>
                        )}
                        {registration.team.contact_phone && (
                          <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                            <Phone className="w-3 h-3" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="h-8 w-8 p-0"
                          onClick={() => {
                            setSelectedRegistration(registration);
                            setShowDetailsDialog(true);
                          }}
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="h-8 w-8 p-0"
                              title="More Actions"
                            >
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedRegistration(registration);
                                setShowDetailsDialog(true);
                              }}
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedRegistration(registration);
                                setEditFormData({
                                  squad_size: registration.squad_size || 22,
                                  jersey_colors: registration.jersey_colors || '',
                                  notes: registration.notes || ''
                                });
                                setShowEditDialog(true);
                              }}
                            >
                              <Edit className="w-4 h-4 mr-2" />
                              Edit Details
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {registration.registration_status === 'SUBMITTED' && (
                              <>
                                <DropdownMenuItem
                                  onClick={() => {
                                    setSelectedRegistrations([registration.id]);
                                    setShowApprovalDialog(true);
                                  }}
                                  className="text-green-600"
                                >
                                  <CheckCircle className="w-4 h-4 mr-2" />
                                  Approve
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => {
                                    setSelectedRegistrations([registration.id]);
                                    setShowRejectionDialog(true);
                                  }}
                                  className="text-red-600"
                                >
                                  <XCircle className="w-4 h-4 mr-2" />
                                  Reject
                                </DropdownMenuItem>
                              </>
                            )}
                            {registration.registration_status === 'APPROVED' && (
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedRegistrations([registration.id]);
                                  revokeApprovalMutation.mutate([registration.id]);
                                }}
                                className="text-orange-600"
                              >
                                <RotateCcw className="w-4 h-4 mr-2" />
                                Revoke Approval
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedRegistration(registration);
                                setShowDeleteDialog(true);
                              }}
                              className="text-red-600"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete Registration
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {registration.team.contact_email && (
                              <DropdownMenuItem
                                onClick={() => window.location.href = `mailto:${registration.team.contact_email}`}
                              >
                                <Mail className="w-4 h-4 mr-2" />
                                Send Email
                              </DropdownMenuItem>
                            )}
                            {registration.team.contact_phone && (
                              <DropdownMenuItem
                                onClick={() => window.location.href = `tel:${registration.team.contact_phone}`}
                              >
                                <Phone className="w-4 h-4 mr-2" />
                                Call Team
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Approval Dialog */}
      <Dialog open={showApprovalDialog} onOpenChange={setShowApprovalDialog}>
        <DialogContent className="max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Approve Team Registrations</DialogTitle>
            <DialogDescription>
              You are about to approve {selectedRegistrations.length} team registration(s). 
              These teams will be able to participate in fixtures immediately.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 overflow-y-auto pr-2">
            <div>
              <label className="text-sm font-medium">Approval Notes (Optional)</label>
              <Textarea
                placeholder="Add any notes about this approval..."
                value={approvalNotes}
                onChange={(e) => setApprovalNotes(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setShowApprovalDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={confirmApproval}
              disabled={approveMutation.isPending}
              className="bg-green-600 hover:bg-green-700"
            >
              {approveMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Approve {selectedRegistrations.length} Team{selectedRegistrations.length > 1 ? 's' : ''}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rejection Dialog */}
      <Dialog open={showRejectionDialog} onOpenChange={setShowRejectionDialog}>
        <DialogContent className="max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Reject Team Registrations</DialogTitle>
            <DialogDescription>
              You are about to reject {selectedRegistrations.length} team registration(s). 
              Please provide a reason for the rejection.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 overflow-y-auto pr-2">
            <div>
              <label className="text-sm font-medium">Rejection Reason *</label>
              <Textarea
                placeholder="Provide a clear reason for rejecting these registrations..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={3}
                required
              />
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setShowRejectionDialog(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={confirmRejection}
              disabled={rejectMutation.isPending || !rejectionReason.trim()}
            >
              {rejectMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Reject {selectedRegistrations.length} Team{selectedRegistrations.length > 1 ? 's' : ''}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Team Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Team Registration Details</DialogTitle>
            <DialogDescription>
              Complete information for {selectedRegistration?.team.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 overflow-y-auto pr-2">
            {selectedRegistration && (
              <>
                {/* Team Basic Info */}
                <div className="space-y-2">
                  <h3 className="font-semibold text-sm">Team Information</h3>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-muted-foreground">Team Name:</span>
                      <p className="font-medium">{selectedRegistration.team.name}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Club Name:</span>
                      <p className="font-medium">{selectedRegistration.team.club_name || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Organization:</span>
                      <p className="font-medium">{selectedRegistration.team.organizations?.name || 'Independent'}</p>
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="space-y-2">
                  <h3 className="font-semibold text-sm">Contact Information</h3>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-muted-foreground">Email:</span>
                      <p className="font-medium">{selectedRegistration.team.contact_email || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Phone:</span>
                      <p className="font-medium">{selectedRegistration.team.contact_phone || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                {/* Geography */}
                <div className="space-y-2">
                  <h3 className="font-semibold text-sm">Geographic Location</h3>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-muted-foreground">County:</span>
                      <p className="font-medium">{selectedRegistration.team.counties?.name || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Sub-County:</span>
                      <p className="font-medium">{selectedRegistration.team.sub_counties?.name || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Ward:</span>
                      <p className="font-medium">{selectedRegistration.team.wards?.name || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                {/* Registration Info */}
                <div className="space-y-2">
                  <h3 className="font-semibold text-sm">Registration Details</h3>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-muted-foreground">Status:</span>
                      <div className="mt-1">
                        {selectedRegistration.registration_status === 'SUBMITTED' && (
                          <Badge className="bg-blue-500">Submitted</Badge>
                        )}
                        {selectedRegistration.registration_status === 'APPROVED' && (
                          <Badge className="bg-green-500">Approved</Badge>
                        )}
                        {selectedRegistration.registration_status === 'REJECTED' && (
                          <Badge className="bg-red-500">Rejected</Badge>
                        )}
                        {selectedRegistration.registration_status === 'WITHDRAWN' && (
                          <Badge className="bg-gray-500">Withdrawn</Badge>
                        )}
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Squad Size:</span>
                      <p className="font-medium">{selectedRegistration.squad_size} players</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Registration Date:</span>
                      <p className="font-medium">{format(new Date(selectedRegistration.registration_date), 'MMM d, yyyy')}</p>
                    </div>
                    {selectedRegistration.approval_date && (
                      <div>
                        <span className="text-muted-foreground">Approval Date:</span>
                        <p className="font-medium">{format(new Date(selectedRegistration.approval_date), 'MMM d, yyyy')}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Jersey Colors */}
                {selectedRegistration.jersey_colors && (
                  <div className="space-y-2">
                    <h3 className="font-semibold text-sm">Jersey Colors</h3>
                    <p className="text-sm text-muted-foreground">{selectedRegistration.jersey_colors}</p>
                  </div>
                )}

                {/* Notes */}
                {selectedRegistration.notes && (
                  <div className="space-y-2">
                    <h3 className="font-semibold text-sm">Notes</h3>
                    <p className="text-sm text-muted-foreground">{selectedRegistration.notes}</p>
                  </div>
                )}
              </>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDetailsDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Registration Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Registration Details</DialogTitle>
            <DialogDescription>
              Update registration information for {selectedRegistration?.team.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Squad Size</label>
              <Input
                type="number"
                value={editFormData.squad_size}
                onChange={(e) => setEditFormData({...editFormData, squad_size: parseInt(e.target.value) || 22})}
                min="11"
                max="35"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Jersey Colors</label>
              <Input
                type="text"
                value={editFormData.jersey_colors}
                onChange={(e) => setEditFormData({...editFormData, jersey_colors: e.target.value})}
                placeholder="e.g., Red and White"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Notes</label>
              <Textarea
                className="min-h-[100px]"
                value={editFormData.notes}
                onChange={(e) => setEditFormData({...editFormData, notes: e.target.value})}
                placeholder="Additional notes..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowEditDialog(false)}
              disabled={updateMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (selectedRegistration) {
                  updateMutation.mutate({
                    registration_id: selectedRegistration.id,
                    updates: editFormData
                  });
                  setShowEditDialog(false);
                }
              }}
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Registration</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the registration for {selectedRegistration?.team.name}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowDeleteDialog(false)}
              disabled={deleteMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (selectedRegistration) {
                  deleteMutation.mutate(selectedRegistration.id);
                  setShowDeleteDialog(false);
                }
              }}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}