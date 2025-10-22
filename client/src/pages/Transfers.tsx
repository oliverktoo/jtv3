import { useState } from "react";
import { Search, Plus, ArrowRight, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useOrganizations } from "@/hooks/useReferenceData";
import { useToast } from "@/hooks/use-toast";
import { insertTransferSchema, type Transfer } from "@shared/schema";
import { format } from "date-fns";
import { queryClient, apiRequest } from "@/lib/queryClient";

const createTransferFormSchema = insertTransferSchema.extend({
  upid: z.string().min(1, "Player is required"),
  toTeamId: z.string().min(1, "Destination team is required"),
  requestDate: z.string().min(1, "Request date is required"),
});

type CreateTransferFormValues = z.infer<typeof createTransferFormSchema>;

function useTransfers(orgId: string) {
  return useQuery<Transfer[]>({
    queryKey: ["/api/organizations", orgId, "transfers"],
    queryFn: async () => {
      const res = await fetch(`/api/organizations/${orgId}/transfers`);
      if (!res.ok) throw new Error("Failed to fetch transfers");
      return res.json();
    },
    enabled: !!orgId,
  });
}

function useCreateTransfer() {
  return useMutation({
    mutationFn: async (data: CreateTransferFormValues) => {
      return apiRequest("POST", "/api/transfers", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/organizations"] });
    },
  });
}

function useUpdateTransfer() {
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Transfer> }) => {
      return apiRequest("PATCH", `/api/transfers/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/organizations"] });
    },
  });
}

function usePlayers(orgId: string) {
  return useQuery<any[]>({
    queryKey: ["/api/players", orgId],
    enabled: !!orgId,
  });
}

function useTeams(orgId: string) {
  return useQuery<any[]>({
    queryKey: ["/api/teams", orgId],
    enabled: !!orgId,
  });
}

export default function Transfers() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedOrgId, setSelectedOrgId] = useState("");
  const { toast } = useToast();

  const { data: organizations } = useOrganizations();
  const { data: transfers, isLoading } = useTransfers(selectedOrgId);
  const { data: players } = usePlayers(selectedOrgId);
  const { data: teams } = useTeams(selectedOrgId);
  const createTransfer = useCreateTransfer();
  const updateTransfer = useUpdateTransfer();

  const form = useForm<CreateTransferFormValues>({
    resolver: zodResolver(createTransferFormSchema),
    defaultValues: {
      upid: "",
      fromTeamId: "",
      toTeamId: "",
      orgId: "",
      transferType: "PERMANENT",
      requestDate: new Date().toISOString().split("T")[0],
      effectiveDate: "",
      expiryDate: "",
      terms: null,
      notes: "",
    },
  });

  const handleCreateTransfer = async (data: CreateTransferFormValues) => {
    try {
      await createTransfer.mutateAsync(data);
      toast({
        title: "Transfer created",
        description: "The transfer request has been created successfully.",
      });
      form.reset();
      setIsCreateDialogOpen(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create transfer",
        variant: "destructive",
      });
    }
  };

  const handleStatusUpdate = async (transferId: string, newStatus: string) => {
    try {
      await updateTransfer.mutateAsync({
        id: transferId,
        data: { status: newStatus as any },
      });
      toast({
        title: "Transfer updated",
        description: `Transfer status updated to ${newStatus}.`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update transfer",
        variant: "destructive",
      });
    }
  };

  const filteredTransfers = transfers?.filter((transfer) => {
    const player = players?.find((p: any) => p.id === transfer.upid);
    const playerName = player ? `${player.firstName} ${player.lastName}` : "";
    const matchesSearch = playerName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || transfer.status === statusFilter;
    return matchesSearch && matchesStatus;
  }) || [];

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "APPROVED":
      case "COMPLETED":
        return "default";
      case "PENDING":
        return "secondary";
      case "REJECTED":
      case "CANCELLED":
        return "outline";
      default:
        return "secondary";
    }
  };

  if (!selectedOrgId && organizations && organizations.length > 0) {
    setSelectedOrgId(organizations[0].id);
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Transfer Management</h1>
          <p className="text-muted-foreground">Manage player transfers between teams</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-create-transfer">
              <Plus className="w-4 h-4 mr-2" />
              Create Transfer
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Transfer Request</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleCreateTransfer)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="orgId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Organization</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-org">
                            <SelectValue placeholder="Select organization" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {organizations?.map((org: any) => (
                            <SelectItem key={org.id} value={org.id}>
                              {org.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="upid"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Player</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-player">
                            <SelectValue placeholder="Select player" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {players?.map((player: any) => (
                            <SelectItem key={player.id} value={player.id}>
                              {player.firstName} {player.lastName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="fromTeamId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>From Team (Optional)</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value || undefined}>
                          <FormControl>
                            <SelectTrigger data-testid="select-from-team">
                              <SelectValue placeholder="Select current team" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="none">None (New Registration)</SelectItem>
                            {teams?.map((team: any) => (
                              <SelectItem key={team.id} value={team.id}>
                                {team.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="toTeamId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>To Team *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-to-team">
                              <SelectValue placeholder="Select destination team" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {teams?.map((team: any) => (
                              <SelectItem key={team.id} value={team.id}>
                                {team.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="transferType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Transfer Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-transfer-type">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="PERMANENT">Permanent</SelectItem>
                            <SelectItem value="LOAN">Loan</SelectItem>
                            <SelectItem value="LOAN_RETURN">Loan Return</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="requestDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Request Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} data-testid="input-request-date" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="effectiveDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Effective Date (Optional)</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} value={field.value || ""} data-testid="input-effective-date" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="expiryDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Expiry Date (For Loans)</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} value={field.value || ""} data-testid="input-expiry-date" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes (Optional)</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value || ""} placeholder="Additional notes" data-testid="input-notes" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createTransfer.isPending} data-testid="button-submit-transfer">
                    {createTransfer.isPending ? "Creating..." : "Create Transfer"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search transfers by player name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
            data-testid="input-search-transfers"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48" data-testid="select-status-filter">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Statuses</SelectItem>
            <SelectItem value="PENDING">Pending</SelectItem>
            <SelectItem value="APPROVED">Approved</SelectItem>
            <SelectItem value="REJECTED">Rejected</SelectItem>
            <SelectItem value="COMPLETED">Completed</SelectItem>
            <SelectItem value="CANCELLED">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading transfers...</p>
        </div>
      ) : filteredTransfers.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed rounded-lg">
          <ArrowRight className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground mb-4">No transfers found</p>
          <Button onClick={() => setIsCreateDialogOpen(true)} data-testid="button-create-first-transfer">
            Create Your First Transfer
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredTransfers.map((transfer) => {
            const player = players?.find((p: any) => p.id === transfer.upid);
            const fromTeam = teams?.find((t: any) => t.id === transfer.fromTeamId);
            const toTeam = teams?.find((t: any) => t.id === transfer.toTeamId);

            return (
              <Card key={transfer.id} className="hover-elevate" data-testid={`card-transfer-${transfer.id}`}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <CardTitle className="text-lg">
                        {player ? `${player.firstName} ${player.lastName}` : "Unknown Player"}
                      </CardTitle>
                      <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                        <span className="font-medium">{fromTeam?.name || "Free Agent"}</span>
                        <ArrowRight className="w-4 h-4" />
                        <span className="font-medium">{toTeam?.name || "Unknown Team"}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={getStatusBadgeVariant(transfer.status)} data-testid={`badge-status-${transfer.id}`}>
                        {transfer.status}
                      </Badge>
                      <Select
                        value={transfer.status}
                        onValueChange={(value) => handleStatusUpdate(transfer.id, value)}
                      >
                        <SelectTrigger className="w-32 h-8" data-testid={`select-update-status-${transfer.id}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="PENDING">Pending</SelectItem>
                          <SelectItem value="APPROVED">Approved</SelectItem>
                          <SelectItem value="REJECTED">Rejected</SelectItem>
                          <SelectItem value="COMPLETED">Completed</SelectItem>
                          <SelectItem value="CANCELLED">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Type</p>
                      <p className="font-medium">{transfer.transferType.replace("_", " ")}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Request Date</p>
                      <p className="font-medium">
                        {transfer.requestDate ? format(new Date(transfer.requestDate), "MMM d, yyyy") : "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Effective Date</p>
                      <p className="font-medium">
                        {transfer.effectiveDate ? format(new Date(transfer.effectiveDate), "MMM d, yyyy") : "Not set"}
                      </p>
                    </div>
                  </div>
                  {transfer.expiryDate && (
                    <div className="mt-3 text-sm">
                      <p className="text-muted-foreground">Expiry Date (Loan)</p>
                      <p className="font-medium">{format(new Date(transfer.expiryDate), "MMM d, yyyy")}</p>
                    </div>
                  )}
                  {transfer.notes && (
                    <div className="mt-3 text-sm">
                      <p className="text-muted-foreground">Notes</p>
                      <p>{transfer.notes}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
