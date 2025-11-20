import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Checkbox } from './ui/checkbox';
import { Textarea } from './ui/textarea';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Alert, AlertDescription } from './ui/alert';
import { 
  Users, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle,
  FileText,
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
  UserPlus
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { useToast } from '../hooks/use-toast';
import * as XLSX from 'xlsx';

export interface RegistrationReviewItem {
  id: string;
  upid: string;
  playerName: string;
  email: string;
  phone?: string;
  dateOfBirth: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  nationality: string;
  position: string;
  teamName?: string;
  registrationStatus: 'DRAFT' | 'SUBMITTED' | 'IN_REVIEW' | 'APPROVED' | 'REJECTED' | 'INCOMPLETE';
  submittedAt: string;
  documentStatus: {
    identity: 'PENDING' | 'VERIFIED' | 'REJECTED';
    medical: 'PENDING' | 'VERIFIED' | 'REJECTED';
    photo: 'PENDING' | 'VERIFIED' | 'REJECTED';
  };
  eligibilityStatus: 'PASS' | 'FAIL' | 'PENDING';
  eligibilityIssues: string[];
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  reviewNotes?: string;
  county: string;
  subCounty?: string;
  ward?: string;
}

export interface RegistrationReviewQueueProps {
  orgId: string;
  onApprove?: (registrationIds: string[], notes?: string) => Promise<void>;
  onReject?: (registrationIds: string[], reason: string) => Promise<void>;
  onRequestChanges?: (registrationIds: string[], changes: string) => Promise<void>;
}

const statusColors = {
  'DRAFT': 'bg-gray-100 text-gray-800',
  'SUBMITTED': 'bg-blue-100 text-blue-800',
  'IN_REVIEW': 'bg-yellow-100 text-yellow-800',
  'APPROVED': 'bg-green-100 text-green-800',
  'REJECTED': 'bg-red-100 text-red-800',
  'INCOMPLETE': 'bg-orange-100 text-orange-800',
};

const priorityColors = {
  'HIGH': 'bg-red-100 text-red-800',
  'MEDIUM': 'bg-yellow-100 text-yellow-800',
  'LOW': 'bg-green-100 text-green-800',
};

const documentStatusIcons = {
  'PENDING': <Clock className="w-4 h-4 text-yellow-600" />,
  'VERIFIED': <CheckCircle className="w-4 h-4 text-green-600" />,
  'REJECTED': <XCircle className="w-4 h-4 text-red-600" />,
};

export default function RegistrationReviewQueue({ 
  orgId, 
  onApprove, 
  onReject, 
  onRequestChanges 
}: RegistrationReviewQueueProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [eligibilityFilter, setEligibilityFilter] = useState<string>('all');
  const [showBulkDialog, setShowBulkDialog] = useState(false);
  const [bulkAction, setBulkAction] = useState<'approve' | 'reject' | 'request-changes'>('approve');
  const [bulkNotes, setBulkNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Mock data for development - replace with real data hook
  const mockRegistrations: RegistrationReviewItem[] = [
    {
      id: '1',
      upid: 'UP001234',
      playerName: 'John Kamau Mwangi',
      email: 'john.kamau@example.com',
      phone: '+254712345678',
      dateOfBirth: '1995-06-15',
      gender: 'MALE',
      nationality: 'Kenyan',
      position: 'Midfielder',
      teamName: 'Nairobi United FC',
      registrationStatus: 'SUBMITTED',
      submittedAt: '2024-10-29T14:30:00Z',
      documentStatus: {
        identity: 'VERIFIED',
        medical: 'PENDING',
        photo: 'VERIFIED'
      },
      eligibilityStatus: 'PENDING',
      eligibilityIssues: ['Medical clearance required'],
      priority: 'HIGH',
      county: 'Nairobi',
      subCounty: 'Westlands',
      ward: 'Parklands'
    },
    {
      id: '2',
      upid: 'UP001235',
      playerName: 'Mary Wanjiku Njeri',
      email: 'mary.wanjiku@example.com',
      phone: '+254723456789',
      dateOfBirth: '1998-03-22',
      gender: 'FEMALE',
      nationality: 'Kenyan',
      position: 'Forward',
      teamName: 'Kiambu Queens FC',
      registrationStatus: 'IN_REVIEW',
      submittedAt: '2024-10-28T10:15:00Z',
      documentStatus: {
        identity: 'VERIFIED',
        medical: 'VERIFIED',
        photo: 'REJECTED'
      },
      eligibilityStatus: 'FAIL',
      eligibilityIssues: ['Photo quality insufficient', 'Age verification needed'],
      priority: 'MEDIUM',
      county: 'Kiambu',
      subCounty: 'Kiambu',
      ward: 'Township'
    },
    {
      id: '3',
      upid: 'UP001236',
      playerName: 'Peter Ochieng Otieno',
      email: 'peter.ochieng@example.com',
      dateOfBirth: '1993-11-08',
      gender: 'MALE',
      nationality: 'Kenyan',
      position: 'Goalkeeper',
      teamName: 'Kisumu Lakeside FC',
      registrationStatus: 'APPROVED',
      submittedAt: '2024-10-27T16:45:00Z',
      documentStatus: {
        identity: 'VERIFIED',
        medical: 'VERIFIED',
        photo: 'VERIFIED'
      },
      eligibilityStatus: 'PASS',
      eligibilityIssues: [],
      priority: 'LOW',
      county: 'Kisumu',
      subCounty: 'Kisumu East',
      ward: 'Central'
    },
  ];

  const registrations = mockRegistrations;

  // Filter registrations based on current filters
  const filteredRegistrations = useMemo(() => {
    return registrations.filter(registration => {
      const matchesSearch = !searchTerm || 
        registration.playerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        registration.upid.toLowerCase().includes(searchTerm.toLowerCase()) ||
        registration.email.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || registration.registrationStatus === statusFilter;
      const matchesPriority = priorityFilter === 'all' || registration.priority === priorityFilter;
      const matchesEligibility = eligibilityFilter === 'all' || registration.eligibilityStatus === eligibilityFilter;
      
      return matchesSearch && matchesStatus && matchesPriority && matchesEligibility;
    });
  }, [registrations, searchTerm, statusFilter, priorityFilter, eligibilityFilter]);

  // Selection handlers
  const toggleSelection = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredRegistrations.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredRegistrations.map(r => r.id)));
    }
  };

  // Bulk action handlers
  const handleBulkAction = async () => {
    if (selectedIds.size === 0) {
      toast({
        title: "No Selection",
        description: "Please select at least one registration to perform bulk action.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    
    try {
      const selectedIdArray = Array.from(selectedIds);
      
      switch (bulkAction) {
        case 'approve':
          await onApprove?.(selectedIdArray, bulkNotes);
          toast({
            title: "Bulk Approval Complete",
            description: `Successfully approved ${selectedIdArray.length} registrations.`
          });
          break;
        case 'reject':
          if (!bulkNotes.trim()) {
            toast({
              title: "Reason Required",
              description: "Please provide a reason for rejection.",
              variant: "destructive"
            });
            return;
          }
          await onReject?.(selectedIdArray, bulkNotes);
          toast({
            title: "Bulk Rejection Complete",
            description: `Successfully rejected ${selectedIdArray.length} registrations.`
          });
          break;
        case 'request-changes':
          if (!bulkNotes.trim()) {
            toast({
              title: "Changes Required",
              description: "Please specify what changes are needed.",
              variant: "destructive"
            });
            return;
          }
          await onRequestChanges?.(selectedIdArray, bulkNotes);
          toast({
            title: "Change Requests Sent",
            description: `Successfully sent change requests for ${selectedIdArray.length} registrations.`
          });
          break;
      }
      
      setSelectedIds(new Set());
      setBulkNotes('');
      setShowBulkDialog(false);
    } catch (error) {
      toast({
        title: "Bulk Action Failed",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Export functionality
  const handleExport = () => {
    const exportData = filteredRegistrations.map(registration => ({
      'UPID': registration.upid,
      'Player Name': registration.playerName,
      'Email': registration.email,
      'Phone': registration.phone || 'N/A',
      'Date of Birth': format(new Date(registration.dateOfBirth), 'yyyy-MM-dd'),
      'Gender': registration.gender,
      'Nationality': registration.nationality,
      'Position': registration.position,
      'Team': registration.teamName || 'N/A',
      'Status': registration.registrationStatus,
      'Priority': registration.priority,
      'Eligibility': registration.eligibilityStatus,
      'Identity Doc': registration.documentStatus.identity,
      'Medical Doc': registration.documentStatus.medical,
      'Photo': registration.documentStatus.photo,
      'County': registration.county,
      'Sub County': registration.subCounty || 'N/A',
      'Ward': registration.ward || 'N/A',
      'Submitted': format(new Date(registration.submittedAt), 'yyyy-MM-dd HH:mm'),
      'Issues': registration.eligibilityIssues.join('; ') || 'None',
      'Review Notes': registration.reviewNotes || 'N/A'
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Player Registrations');

    // Auto-size columns
    const maxWidth = exportData.reduce((acc, row) => {
      Object.entries(row).forEach(([key, value]) => {
        const len = value.toString().length;
        acc[key] = Math.max(acc[key] || 0, len);
      });
      return acc;
    }, {} as Record<string, number>);

    ws['!cols'] = Object.values(maxWidth).map(w => ({ wch: Math.min(w + 2, 50) }));

    const filename = `Player_Registrations_${format(new Date(), 'yyyy-MM-dd_HHmm')}.xlsx`;
    XLSX.writeFile(wb, filename);

    toast({
      title: "Export Successful",
      description: `Registration data exported to ${filename}`
    });
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'HIGH': return <Flag className="w-4 h-4 text-red-600" />;
      case 'MEDIUM': return <Flag className="w-4 h-4 text-yellow-600" />;
      case 'LOW': return <Flag className="w-4 h-4 text-green-600" />;
      default: return null;
    }
  };

  const getEligibilityIcon = (status: string) => {
    switch (status) {
      case 'PASS': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'FAIL': return <XCircle className="w-4 h-4 text-red-600" />;
      case 'PENDING': return <Clock className="w-4 h-4 text-yellow-600" />;
      default: return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Registrations</p>
                <p className="text-2xl font-bold">{registrations.length}</p>
              </div>
              <Users className="w-5 h-5 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending Review</p>
                <p className="text-2xl font-bold">
                  {registrations.filter(r => ['SUBMITTED', 'IN_REVIEW'].includes(r.registrationStatus)).length}
                </p>
              </div>
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">High Priority</p>
                <p className="text-2xl font-bold">
                  {registrations.filter(r => r.priority === 'HIGH').length}
                </p>
              </div>
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Eligibility Issues</p>
                <p className="text-2xl font-bold">
                  {registrations.filter(r => r.eligibilityStatus === 'FAIL').length}
                </p>
              </div>
              <XCircle className="w-5 h-5 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Actions */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col gap-4">
            {/* Search and Filters Row */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, UPID, or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="SUBMITTED">Submitted</SelectItem>
                  <SelectItem value="IN_REVIEW">In Review</SelectItem>
                  <SelectItem value="APPROVED">Approved</SelectItem>
                  <SelectItem value="REJECTED">Rejected</SelectItem>
                  <SelectItem value="INCOMPLETE">Incomplete</SelectItem>
                </SelectContent>
              </Select>

              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priority</SelectItem>
                  <SelectItem value="HIGH">High</SelectItem>
                  <SelectItem value="MEDIUM">Medium</SelectItem>
                  <SelectItem value="LOW">Low</SelectItem>
                </SelectContent>
              </Select>

              <Select value={eligibilityFilter} onValueChange={setEligibilityFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Eligibility" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Eligibility</SelectItem>
                  <SelectItem value="PASS">Pass</SelectItem>
                  <SelectItem value="FAIL">Fail</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Action Buttons Row */}
            <div className="flex flex-col md:flex-row justify-between gap-4">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setBulkAction('approve');
                    setShowBulkDialog(true);
                  }}
                  disabled={selectedIds.size === 0}
                >
                  <Check className="w-4 h-4 mr-2" />
                  Bulk Approve ({selectedIds.size})
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setBulkAction('reject');
                    setShowBulkDialog(true);
                  }}
                  disabled={selectedIds.size === 0}
                >
                  <X className="w-4 h-4 mr-2" />
                  Bulk Reject ({selectedIds.size})
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setBulkAction('request-changes');
                    setShowBulkDialog(true);
                  }}
                  disabled={selectedIds.size === 0}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Request Changes ({selectedIds.size})
                </Button>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleExport}>
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => window.location.reload()}
                >
                  <Loader2 className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
              </div>
            </div>

            {/* Results Summary */}
            <div className="text-sm text-muted-foreground">
              Showing {filteredRegistrations.length} of {registrations.length} registrations
              {selectedIds.size > 0 && (
                <span className="ml-2 text-blue-600 font-medium">
                  • {selectedIds.size} selected
                </span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Registration Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedIds.size === filteredRegistrations.length && filteredRegistrations.length > 0}
                      onCheckedChange={toggleSelectAll}
                      aria-label="Select all registrations"
                    />
                  </TableHead>
                  <TableHead>Player</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Team & Position</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Documents</TableHead>
                  <TableHead>Eligibility</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRegistrations.map((registration) => (
                  <TableRow 
                    key={registration.id}
                    className={selectedIds.has(registration.id) ? "bg-blue-50" : ""}
                  >
                    <TableCell>
                      <Checkbox
                        checked={selectedIds.has(registration.id)}
                        onCheckedChange={() => toggleSelection(registration.id)}
                        aria-label={`Select ${registration.playerName}`}
                      />
                    </TableCell>
                    
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{registration.playerName}</span>
                          {getPriorityIcon(registration.priority)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {registration.upid}
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-sm">
                          <Mail className="w-3 h-3" />
                          {registration.email}
                        </div>
                        {registration.phone && (
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Phone className="w-3 h-3" />
                            {registration.phone}
                          </div>
                        )}
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium">{registration.teamName || 'No Team'}</div>
                        <div className="text-sm text-muted-foreground">
                          {registration.position}
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="space-y-2">
                        <Badge className={statusColors[registration.registrationStatus]}>
                          {registration.registrationStatus}
                        </Badge>
                        <Badge className={priorityColors[registration.priority]} variant="outline">
                          {registration.priority}
                        </Badge>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-1">
                            {documentStatusIcons[registration.documentStatus.identity]}
                            <span className="text-xs">ID</span>
                          </div>
                          <div className="flex items-center gap-1">
                            {documentStatusIcons[registration.documentStatus.medical]}
                            <span className="text-xs">Medical</span>
                          </div>
                          <div className="flex items-center gap-1">
                            {documentStatusIcons[registration.documentStatus.photo]}
                            <span className="text-xs">Photo</span>
                          </div>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getEligibilityIcon(registration.eligibilityStatus)}
                        <span className="text-sm">{registration.eligibilityStatus}</span>
                        {registration.eligibilityIssues.length > 0 && (
                          <AlertTriangle className="w-4 h-4 text-yellow-600" />
                        )}
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="space-y-1 text-sm">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {registration.county}
                        </div>
                        {registration.subCounty && (
                          <div className="text-muted-foreground">{registration.subCounty}</div>
                        )}
                        {registration.ward && (
                          <div className="text-muted-foreground text-xs">{registration.ward}</div>
                        )}
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="text-sm">
                        <div>{format(new Date(registration.submittedAt), 'MMM dd')}</div>
                        <div className="text-muted-foreground text-xs">
                          {formatDistanceToNow(new Date(registration.submittedAt), { addSuffix: true })}
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <UserCheck className="w-4 h-4 mr-2" />
                            Quick Approve
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>
                            <FileText className="w-4 h-4 mr-2" />
                            Add Review Note
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Mail className="w-4 h-4 mr-2" />
                            Contact Player
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredRegistrations.length === 0 && (
            <div className="text-center py-12">
              <Users className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No registrations found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm || statusFilter !== 'all' || priorityFilter !== 'all' || eligibilityFilter !== 'all'
                  ? 'Try adjusting your filters or search terms.'
                  : 'No player registrations have been submitted yet.'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bulk Action Dialog */}
      <Dialog open={showBulkDialog} onOpenChange={setShowBulkDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {bulkAction === 'approve' && 'Bulk Approve Registrations'}
              {bulkAction === 'reject' && 'Bulk Reject Registrations'}
              {bulkAction === 'request-changes' && 'Request Changes for Registrations'}
            </DialogTitle>
            <DialogDescription>
              You are about to {bulkAction.replace('-', ' ')} {selectedIds.size} registration(s).
              {bulkAction !== 'approve' && ' Please provide a reason below.'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <Textarea
              placeholder={
                bulkAction === 'approve' ? 'Optional notes for approval...' :
                bulkAction === 'reject' ? 'Reason for rejection (required)...' :
                'Specify what changes are needed (required)...'
              }
              value={bulkNotes}
              onChange={(e) => setBulkNotes(e.target.value)}
              rows={4}
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBulkDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleBulkAction}
              disabled={loading || (bulkAction !== 'approve' && !bulkNotes.trim())}
            >
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {bulkAction === 'approve' && 'Approve'}
              {bulkAction === 'reject' && 'Reject'}
              {bulkAction === 'request-changes' && 'Send Requests'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}