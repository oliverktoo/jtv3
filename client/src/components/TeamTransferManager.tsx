import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { useOrganizations } from "@/hooks/useReferenceData";
import {
  useTeamTransferHistory,
  useRequestTeamTransfer,
  useTeamTransferEligibility,
  useApproveTeamTransfer,
  useRejectTeamTransfer,
  useCancelTeamTransfer,
  TeamTransferHistoryRecord,
} from "@/hooks/useTeamTransfers";
import { 
  ArrowRight, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Building,
  Users,
  Calendar,
  FileText,
  Info,
  Ban
} from "lucide-react";

interface TeamTransferManagerProps {
  teamId: string;
  teamName: string;
  currentOrgId: string;
  currentOrgName: string;
  onTransferComplete?: (newOrgId: string) => void;
}

interface TransferRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  teamId: string;
  teamName: string;
  currentOrgId: string;
  eligibility: any;
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'PENDING':
      return <Clock className="w-4 h-4 text-yellow-500" />;
    case 'APPROVED':
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    case 'REJECTED':
      return <XCircle className="w-4 h-4 text-red-500" />;
    case 'CANCELLED':
      return <Ban className="w-4 h-4 text-gray-500" />;
    case 'IN_PROGRESS':
      return <Clock className="w-4 h-4 text-blue-500" />;
    default:
      return <Clock className="w-4 h-4 text-gray-500" />;
  }
};

const getStatusColor = (status: string): "default" | "secondary" | "destructive" | "outline" => {
  switch (status) {
    case 'APPROVED':
      return "default"; // Green
    case 'REJECTED':
      return "destructive"; // Red
    case 'PENDING':
    case 'IN_PROGRESS':
      return "secondary"; // Blue
    default:
      return "outline"; // Gray
  }
};

const getTransferTypeLabel = (type: string) => {
  switch (type) {
    case 'VOLUNTARY':
      return 'Voluntary Transfer';
    case 'ADMINISTRATIVE':
      return 'Administrative Transfer';
    case 'DISCIPLINARY':
      return 'Disciplinary Transfer';
    case 'DISSOLUTION':
      return 'Organization Dissolution';
    default:
      return type;
  }
};

const TransferRequestDialog: React.FC<TransferRequestDialogProps> = ({
  open,
  onOpenChange,
  teamId,
  teamName,
  currentOrgId,
  eligibility,
}) => {
  const [formData, setFormData] = useState({
    toOrgId: "",
    transferReason: "",
    transferType: "VOLUNTARY" as const,
  });

  const { toast } = useToast();
  const { data: organizations = [] } = useOrganizations();
  const requestTransfer = useRequestTeamTransfer();

  const availableOrgs = organizations.filter((org: any) => org.id !== currentOrgId);

  const handleSubmit = async () => {
    if (!formData.toOrgId) {
      toast({
        title: "Error",
        description: "Please select a destination organization",
        variant: "destructive",
      });
      return;
    }

    if (!formData.transferReason.trim()) {
      toast({
        title: "Error",
        description: "Please provide a reason for the transfer",
        variant: "destructive",
      });
      return;
    }

    try {
      await requestTransfer.mutateAsync({
        teamId,
        toOrgId: formData.toOrgId,
        transferReason: formData.transferReason,
        transferType: formData.transferType,
      });

      toast({
        title: "Transfer Request Submitted",
        description: `Transfer request for ${teamName} has been submitted successfully`,
      });

      onOpenChange(false);
      setFormData({
        toOrgId: "",
        transferReason: "",
        transferType: "VOLUNTARY",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to submit transfer request",
        variant: "destructive",
      });
    }
  };

  if (!eligibility?.canTransfer) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Transfer Not Available</DialogTitle>
            <DialogDescription>
              This team cannot be transferred at this time.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 border rounded-lg bg-yellow-50 border-yellow-200">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-yellow-600 mt-1" />
                <div>
                  <h4 className="font-medium text-yellow-800">Transfer Blocked</h4>
                  <ul className="mt-2 space-y-1 text-sm text-yellow-700">
                    {eligibility?.reasons?.map((reason: string, index: number) => (
                      <li key={index}>• {reason}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Request Team Transfer</DialogTitle>
          <DialogDescription>
            Request to transfer {teamName} to a different organization. This action requires approval.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Eligibility Warnings */}
          {eligibility?.warnings && eligibility.warnings.length > 0 && (
            <div className="p-4 border rounded-lg bg-orange-50 border-orange-200">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-orange-600 mt-1" />
                <div>
                  <h4 className="font-medium text-orange-800">Important Notes</h4>
                  <ul className="mt-2 space-y-1 text-sm text-orange-700">
                    {eligibility.warnings.map((warning: string, index: number) => (
                      <li key={index}>• {warning}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Transfer Impact */}
          <div className="grid grid-cols-2 gap-4 p-4 border rounded-lg bg-blue-50">
            <div className="text-center">
              <Users className="w-6 h-6 mx-auto text-blue-600 mb-1" />
              <p className="text-sm font-medium">Players</p>
              <p className="text-lg font-bold text-blue-800">{eligibility?.playerCount || 0}</p>
            </div>
            <div className="text-center">
              <Calendar className="w-6 h-6 mx-auto text-blue-600 mb-1" />
              <p className="text-sm font-medium">Active Registrations</p>
              <p className="text-lg font-bold text-blue-800">{eligibility?.activeRegistrations || 0}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="toOrgId">Destination Organization *</Label>
              <Select value={formData.toOrgId} onValueChange={(value) => setFormData({ ...formData, toOrgId: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select destination organization" />
                </SelectTrigger>
                <SelectContent>
                  {availableOrgs.map((org: any) => (
                    <SelectItem key={org.id} value={org.id}>
                      {org.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="transferType">Transfer Type *</Label>
              <Select
                value={formData.transferType}
                onValueChange={(value) => setFormData({ ...formData, transferType: value as any })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="VOLUNTARY">Voluntary Transfer</SelectItem>
                  <SelectItem value="ADMINISTRATIVE">Administrative Transfer</SelectItem>
                  <SelectItem value="DISCIPLINARY">Disciplinary Transfer</SelectItem>
                  <SelectItem value="DISSOLUTION">Organization Dissolution</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="transferReason">Reason for Transfer *</Label>
              <Textarea
                id="transferReason"
                placeholder="Please provide a detailed explanation for the transfer request..."
                value={formData.transferReason}
                onChange={(e) => setFormData({ ...formData, transferReason: e.target.value })}
                rows={4}
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={requestTransfer.isPending}
          >
            {requestTransfer.isPending ? "Submitting..." : "Submit Transfer Request"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default function TeamTransferManager({
  teamId,
  teamName,
  currentOrgId,
  currentOrgName,
  onTransferComplete,
}: TeamTransferManagerProps) {
  const [showTransferDialog, setShowTransferDialog] = useState(false);
  const [selectedTransfer, setSelectedTransfer] = useState<TeamTransferHistoryRecord | null>(null);
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  const { toast } = useToast();
  const { data: history = [], isLoading } = useTeamTransferHistory(teamId);
  const { data: eligibility } = useTeamTransferEligibility(teamId);
  const approveTransfer = useApproveTeamTransfer();
  const rejectTransfer = useRejectTeamTransfer();
  const cancelTransfer = useCancelTeamTransfer();

  const pendingTransfer = history.find(t => t.transferStatus === 'PENDING' || t.transferStatus === 'IN_PROGRESS');
  const canRequestTransfer = !pendingTransfer && eligibility?.canTransfer;

  const handleApprove = async (transferId: string) => {
    try {
      await approveTransfer.mutateAsync({ transferId });
      toast({
        title: "Transfer Approved",
        description: "Team transfer has been approved and completed",
      });
      if (onTransferComplete) {
        const transfer = history.find(t => t.id === transferId);
        if (transfer) onTransferComplete(transfer.toOrgId);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to approve transfer",
        variant: "destructive",
      });
    }
  };

  const handleReject = async (transferId: string, reason: string) => {
    try {
      await rejectTransfer.mutateAsync({ transferId, rejectionReason: reason });
      toast({
        title: "Transfer Rejected",
        description: "Team transfer has been rejected",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to reject transfer",
        variant: "destructive",
      });
    }
  };

  const handleCancel = async () => {
    if (!selectedTransfer) return;

    try {
      await cancelTransfer.mutateAsync({
        transferId: selectedTransfer.id,
        cancellationReason: "Cancelled by requester",
      });
      toast({
        title: "Transfer Cancelled",
        description: "Team transfer request has been cancelled",
      });
      setShowCancelDialog(false);
      setSelectedTransfer(null);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to cancel transfer",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Loading transfer history...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Team Transfers</h3>
          <p className="text-sm text-muted-foreground">
            Manage team ownership transfers between organizations
          </p>
        </div>
        
        <Button
          onClick={() => setShowTransferDialog(true)}
          disabled={!canRequestTransfer}
          title={!canRequestTransfer ? "Transfer not available or already pending" : "Request team transfer"}
        >
          <ArrowRight className="w-4 h-4 mr-2" />
          Request Transfer
        </Button>
      </div>

      {/* Current Status */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Current Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <Building className="w-5 h-5 text-muted-foreground" />
            <div>
              <p className="font-medium">{teamName}</p>
              <p className="text-sm text-muted-foreground">Currently with {currentOrgName}</p>
            </div>
          </div>

          {pendingTransfer && (
            <div className="p-3 border rounded-lg bg-yellow-50 border-yellow-200">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  {getStatusIcon(pendingTransfer.transferStatus)}
                  <div>
                    <p className="font-medium text-yellow-800">Transfer Pending</p>
                    <p className="text-sm text-yellow-700">
                      Transfer to {pendingTransfer.toOrganization?.name} is {pendingTransfer.transferStatus.toLowerCase()}
                    </p>
                  </div>
                </div>
                {pendingTransfer.transferStatus === 'PENDING' && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSelectedTransfer(pendingTransfer);
                      setShowCancelDialog(true);
                    }}
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </div>
          )}

          {!eligibility?.canTransfer && !pendingTransfer && (
            <div className="p-3 border rounded-lg bg-red-50 border-red-200">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5" />
                <div>
                  <p className="font-medium text-red-800">Transfer Blocked</p>
                  <p className="text-sm text-red-700">This team cannot be transferred at this time.</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Transfer History */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Transfer History</CardTitle>
          <CardDescription>
            Previous transfer requests and completed transfers
          </CardDescription>
        </CardHeader>
        <CardContent>
          {history.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No transfer history</p>
            </div>
          ) : (
            <div className="space-y-4">
              {history.map((transfer) => (
                <div key={transfer.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(transfer.transferStatus)}
                        <div>
                          <p className="font-medium">
                            {transfer.fromOrganization?.name} → {transfer.toOrganization?.name}
                          </p>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>{getTransferTypeLabel(transfer.transferType)}</span>
                            <span>•</span>
                            <span>{new Date(transfer.transferDate).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>

                      {transfer.transferReason && (
                        <p className="text-sm text-muted-foreground pl-7">
                          Reason: {transfer.transferReason}
                        </p>
                      )}

                      {transfer.adminNotes && (
                        <p className="text-sm text-muted-foreground pl-7">
                          Admin Notes: {transfer.adminNotes}
                        </p>
                      )}
                    </div>

                    <Badge variant={getStatusColor(transfer.transferStatus)}>
                      {transfer.transferStatus}
                    </Badge>
                  </div>

                  {transfer.transferStatus === 'PENDING' && (
                    <div className="flex gap-2 mt-4 pl-7">
                      <Button
                        size="sm"
                        onClick={() => handleApprove(transfer.id)}
                        disabled={approveTransfer.isPending}
                      >
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleReject(transfer.id, "Rejected by admin")}
                        disabled={rejectTransfer.isPending}
                      >
                        Reject
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Transfer Request Dialog */}
      <TransferRequestDialog
        open={showTransferDialog}
        onOpenChange={setShowTransferDialog}
        teamId={teamId}
        teamName={teamName}
        currentOrgId={currentOrgId}
        eligibility={eligibility}
      />

      {/* Cancel Transfer Dialog */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Transfer Request</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel the transfer request for {teamName}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Request</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancel}
              disabled={cancelTransfer.isPending}
            >
              {cancelTransfer.isPending ? "Cancelling..." : "Cancel Transfer"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}