import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar, Clock, User, FileText, CheckCircle, XCircle, AlertCircle, Send, Filter, Eye, Edit, Trash2, Plus, Download } from 'lucide-react';
import { format } from 'date-fns';
import { useTransfers, useTeamTransfers, usePendingTransfers, useUpdateTransferStatus, useCreateTransfer, useCancelTransfer, useBulkUpdateTransfers, useTransferStats } from '../hooks/useTransfers';
import { useAuth } from '../hooks/useAuth';
import { usePlayers } from '../hooks/usePlayers';
import { useTeams } from '../hooks/useTeams';
import { useToast } from '../hooks/use-toast';

interface TransferManagementProps {
  orgId: string;
  teamId?: string;
}

export default function TransferManagement({ orgId, teamId }: TransferManagementProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedTransfers, setSelectedTransfers] = useState<string[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [selectedTransfer, setSelectedTransfer] = useState<any>(null);
  
  // Queries
  const { data: transfers, isLoading: transfersLoading } = useTransfers(orgId);
  const { data: teamTransfers, isLoading: teamTransfersLoading } = useTeamTransfers(orgId, teamId || '');
  const { data: pendingTransfers, isLoading: pendingLoading } = usePendingTransfers(orgId, teamId || '');
  const { data: transferStats } = useTransferStats(orgId, teamId);
  const { data: players } = usePlayers(orgId);
  const { data: teams } = useTeams(orgId);
  
  // Mutations
  const updateTransferStatus = useUpdateTransferStatus(orgId);
  const createTransfer = useCreateTransfer(orgId);
  const cancelTransfer = useCancelTransfer(orgId);
  const bulkUpdateTransfers = useBulkUpdateTransfers(orgId);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'APPROVED': return 'bg-green-100 text-green-800 border-green-200';
      case 'REJECTED': return 'bg-red-100 text-red-800 border-red-200';
      case 'COMPLETED': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'CANCELLED': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'PERMANENT': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'LOAN': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'LOAN_RETURN': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleStatusUpdate = async (transferId: string, status: string) => {
    try {
      await updateTransferStatus.mutateAsync({
        transferId,
        status,
        notes: `Status updated to ${status} by ${user?.email}`
      });
      toast({
        title: 'Success',
        description: `Transfer ${status.toLowerCase()} successfully`
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update transfer status',
        variant: 'destructive'
      });
    }
  };

  const handleBulkAction = async (action: string) => {
    if (selectedTransfers.length === 0) {
      toast({
        title: 'Error',
        description: 'Please select transfers to update',
        variant: 'destructive'
      });
      return;
    }

    try {
      await bulkUpdateTransfers.mutateAsync({
        transferIds: selectedTransfers,
        status: action,
        notes: `Bulk ${action} by ${user?.email}`
      });
      toast({
        title: 'Success',
        description: `${selectedTransfers.length} transfers ${action.toLowerCase()} successfully`
      });
      setSelectedTransfers([]);
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to ${action.toLowerCase()} transfers`,
        variant: 'destructive'
      });
    }
  };

  const filteredTransfers = teamId ? teamTransfers : transfers;
  const displayTransfers = filteredTransfers?.filter(transfer => 
    filterStatus === 'all' || transfer.status === filterStatus
  ) || [];

  const CreateTransferDialog = () => {
    const [formData, setFormData] = useState({
      upid: '',
      fromTeamId: '',
      toTeamId: teamId || '',
      transferType: 'PERMANENT',
      requestDate: new Date().toISOString().split('T')[0],
      effectiveDate: '',
      notes: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      try {
        await createTransfer.mutateAsync({
          ...formData,
          requestDate: new Date(formData.requestDate),
          effectiveDate: formData.effectiveDate ? new Date(formData.effectiveDate) : null,
          orgId,
        } as any);
        toast({
          title: 'Success',
          description: 'Transfer request created successfully'
        });
        setShowCreateDialog(false);
        setFormData({
          upid: '',
          fromTeamId: '',
          toTeamId: teamId || '',
          transferType: 'PERMANENT',
          requestDate: new Date().toISOString().split('T')[0],
          effectiveDate: '',
          notes: ''
        });
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to create transfer request',
          variant: 'destructive'
        });
      }
    };

    return (
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create Transfer Request</DialogTitle>
            <DialogDescription>
              Submit a new transfer request for a player.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="upid">Player</Label>
                <Select value={formData.upid} onValueChange={(value) => setFormData({ ...formData, upid: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select player" />
                  </SelectTrigger>
                  <SelectContent>
                    {players?.map((player) => (
                      <SelectItem key={player.id} value={player.id.toString()}>
                        {player.firstName} {player.lastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="transferType">Transfer Type</Label>
                <Select value={formData.transferType} onValueChange={(value) => setFormData({ ...formData, transferType: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PERMANENT">Permanent</SelectItem>
                    <SelectItem value="LOAN">Loan</SelectItem>
                    <SelectItem value="LOAN_RETURN">Loan Return</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fromTeamId">From Team</Label>
                <Select value={formData.fromTeamId} onValueChange={(value) => setFormData({ ...formData, fromTeamId: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select team" />
                  </SelectTrigger>
                  <SelectContent>
                    {teams?.map((team) => (
                      <SelectItem key={team.id} value={team.id}>
                        {team.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="toTeamId">To Team</Label>
                <Select value={formData.toTeamId} onValueChange={(value) => setFormData({ ...formData, toTeamId: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select team" />
                  </SelectTrigger>
                  <SelectContent>
                    {teams?.map((team) => (
                      <SelectItem key={team.id} value={team.id}>
                        {team.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="requestDate">Request Date</Label>
                <Input
                  id="requestDate"
                  type="date"
                  value={formData.requestDate}
                  onChange={(e) => setFormData({ ...formData, requestDate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="effectiveDate">Effective Date</Label>
                <Input
                  id="effectiveDate"
                  type="date"
                  value={formData.effectiveDate}
                  onChange={(e) => setFormData({ ...formData, effectiveDate: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Additional transfer details..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createTransfer.isPending}>
                {createTransfer.isPending ? 'Creating...' : 'Create Transfer'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    );
  };

  const TransferDetailsDialog = () => {
    if (!selectedTransfer) return null;

    return (
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Transfer Details</DialogTitle>
            <DialogDescription>
              Complete information about this transfer request.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Transfer Information</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Status:</span>
                    <Badge className={getStatusColor(selectedTransfer.status)}>
                      {selectedTransfer.status}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Type:</span>
                    <Badge className={getTypeColor(selectedTransfer.transferType)}>
                      {selectedTransfer.transferType}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Request Date:</span>
                    <span className="text-sm">{format(new Date(selectedTransfer.requestDate), 'MMM dd, yyyy')}</span>
                  </div>
                  {selectedTransfer.effectiveDate && (
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Effective Date:</span>
                      <span className="text-sm">{format(new Date(selectedTransfer.effectiveDate), 'MMM dd, yyyy')}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Actions</h3>
                <div className="flex flex-col gap-2">
                  {selectedTransfer.status === 'PENDING' && (
                    <>
                      <Button
                        size="sm"
                        onClick={() => handleStatusUpdate(selectedTransfer.id, 'APPROVED')}
                        className="w-full"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Approve Transfer
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleStatusUpdate(selectedTransfer.id, 'REJECTED')}
                        className="w-full"
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Reject Transfer
                      </Button>
                    </>
                  )}
                  {selectedTransfer.status === 'APPROVED' && (
                    <Button
                      size="sm"
                      onClick={() => handleStatusUpdate(selectedTransfer.id, 'COMPLETED')}
                      className="w-full"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Complete Transfer
                    </Button>
                  )}
                  {['PENDING', 'APPROVED'].includes(selectedTransfer.status) && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleStatusUpdate(selectedTransfer.id, 'CANCELLED')}
                      className="w-full"
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Cancel Transfer
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {selectedTransfer.notes && (
              <div>
                <h3 className="text-lg font-medium mb-2">Notes</h3>
                <p className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
                  {selectedTransfer.notes}
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDetailsDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };

  if (transfersLoading || teamTransfersLoading || pendingLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Transfer Stats */}
      {transferStats && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total</p>
                  <p className="text-2xl font-bold">{transferStats.totalTransfers}</p>
                </div>
                <FileText className="w-5 h-5 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending</p>
                  <p className="text-2xl font-bold text-yellow-600">{transferStats.pendingTransfers}</p>
                </div>
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Approved</p>
                  <p className="text-2xl font-bold text-green-600">{transferStats.approvedTransfers}</p>
                </div>
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Completed</p>
                  <p className="text-2xl font-bold text-blue-600">{transferStats.completedTransfers}</p>
                </div>
                <User className="w-5 h-5 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Rejected</p>
                  <p className="text-2xl font-bold text-red-600">{transferStats.rejectedTransfers}</p>
                </div>
                <XCircle className="w-5 h-5 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Transfer Management */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Transfer Management</CardTitle>
              <CardDescription>
                Manage player transfers and track their status
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="APPROVED">Approved</SelectItem>
                  <SelectItem value="REJECTED">Rejected</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="w-4 h-4 mr-2" />
                New Transfer
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Bulk Actions */}
          {selectedTransfers.length > 0 && (
            <div className="mb-4 p-3 bg-muted rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm">
                  {selectedTransfers.length} transfer(s) selected
                </span>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => handleBulkAction('APPROVED')}>
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Approve
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => handleBulkAction('REJECTED')}>
                    <XCircle className="w-4 h-4 mr-1" />
                    Reject
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setSelectedTransfers([])}>
                    Clear
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Transfers Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedTransfers.length === displayTransfers.length && displayTransfers.length > 0}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedTransfers(displayTransfers.map(t => t.id));
                        } else {
                          setSelectedTransfers([]);
                        }
                      }}
                    />
                  </TableHead>
                  <TableHead>Player</TableHead>
                  <TableHead>From Team</TableHead>
                  <TableHead>To Team</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Request Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayTransfers.map((transfer) => (
                  <TableRow key={transfer.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedTransfers.includes(transfer.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedTransfers([...selectedTransfers, transfer.id]);
                          } else {
                            setSelectedTransfers(selectedTransfers.filter(id => id !== transfer.id));
                          }
                        }}
                      />
                    </TableCell>
                    <TableCell className="font-medium">
                      {/* Player name would be populated from joined data */}
                      Player #{transfer.upid.slice(-6)}
                    </TableCell>
                    <TableCell>
                      {/* Team name would be populated from joined data */}
                      {transfer.fromTeamId ? `Team #${transfer.fromTeamId.slice(-6)}` : 'N/A'}
                    </TableCell>
                    <TableCell>
                      {/* Team name would be populated from joined data */}
                      Team #{transfer.toTeamId.slice(-6)}
                    </TableCell>
                    <TableCell>
                      <Badge className={getTypeColor(transfer.transferType)}>
                        {transfer.transferType}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(transfer.status)}>
                        {transfer.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {format(new Date(transfer.requestDate), 'MMM dd, yyyy')}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setSelectedTransfer(transfer);
                            setShowDetailsDialog(true);
                          }}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        {transfer.status === 'PENDING' && (
                          <>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleStatusUpdate(transfer.id, 'APPROVED')}
                            >
                              <CheckCircle className="w-4 h-4 text-green-600" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleStatusUpdate(transfer.id, 'REJECTED')}
                            >
                              <XCircle className="w-4 h-4 text-red-600" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {displayTransfers.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No transfers found. Create your first transfer request to get started.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialogs */}
      <CreateTransferDialog />
      <TransferDetailsDialog />
    </div>
  );
}