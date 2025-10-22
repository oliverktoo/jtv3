import { useState } from "react";
import { Search, Plus, FileText, Calendar } from "lucide-react";
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
import { insertContractSchema, type Contract } from "@shared/schema";
import { format } from "date-fns";
import { queryClient, apiRequest } from "@/lib/queryClient";

const createContractFormSchema = insertContractSchema.extend({
  upid: z.string().min(1, "Player is required"),
  teamId: z.string().min(1, "Team is required"),
  startDate: z.string().min(1, "Start date is required"),
});

type CreateContractFormValues = z.infer<typeof createContractFormSchema>;

function useContracts(orgId: string) {
  return useQuery<Contract[]>({
    queryKey: ["/api/contracts", orgId],
    enabled: !!orgId,
  });
}

function useCreateContract() {
  return useMutation({
    mutationFn: async (data: CreateContractFormValues) => {
      return apiRequest("POST", "/api/contracts", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/contracts"] });
    },
  });
}

function useUpdateContract() {
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Contract> }) => {
      return apiRequest("PATCH", `/api/contracts/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/contracts"] });
    },
  });
}

function useDeleteContract() {
  return useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/contracts/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/contracts"] });
    },
  });
}

function usePlayers(orgId: string) {
  return useQuery({
    queryKey: ["/api/players", orgId],
    queryFn: async () => {
      const res = await fetch(`/api/players?orgId=${orgId}`);
      if (!res.ok) throw new Error("Failed to fetch players");
      return res.json();
    },
    enabled: !!orgId,
  });
}

function useTeams(tournamentId?: string) {
  return useQuery({
    queryKey: tournamentId ? ["/api/tournaments", tournamentId, "teams"] : ["/api/teams"],
    queryFn: async () => {
      const url = tournamentId ? `/api/tournaments/${tournamentId}/teams` : "/api/teams";
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch teams");
      return res.json();
    },
  });
}

const getStatusBadgeVariant = (status: string) => {
  switch (status) {
    case "ACTIVE":
      return "default";
    case "PENDING":
      return "secondary";
    case "EXPIRED":
    case "TERMINATED":
      return "outline";
    default:
      return "secondary";
  }
};

export default function Contracts() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const { toast } = useToast();

  const { data: organizations } = useOrganizations();
  const orgId = (organizations && organizations.length > 0) ? organizations[0].id : "";
  const { data: contracts, isLoading } = useContracts(orgId);
  const { data: players } = usePlayers(orgId);
  const { data: teams } = useTeams();
  const createContract = useCreateContract();
  const updateContract = useUpdateContract();
  const deleteContract = useDeleteContract();

  const form = useForm<CreateContractFormValues>({
    resolver: zodResolver(createContractFormSchema),
    defaultValues: {
      orgId,
      upid: "",
      teamId: "",
      status: "PENDING",
      contractType: "PERMANENT",
      startDate: "",
      endDate: "",
    },
  });

  const filteredContracts = (contracts || []).filter((contract) => {
    const player = players?.find((p: any) => p.upid === contract.upid);
    const team = teams?.find((t: any) => t.id === contract.teamId);
    const searchText = `${player?.firstName} ${player?.lastName} ${team?.name}`.toLowerCase();
    const matchesSearch = searchText.includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || contract.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const onSubmit = async (data: CreateContractFormValues) => {
    try {
      await createContract.mutateAsync(data);

      toast({
        title: "Contract created",
        description: "The contract has been created successfully.",
      });

      form.reset();
      setIsCreateDialogOpen(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create contract.",
        variant: "destructive",
      });
    }
  };

  const handleStatusChange = async (contractId: string, newStatus: string) => {
    try {
      await updateContract.mutateAsync({
        id: contractId,
        data: { status: newStatus as any },
      });

      toast({
        title: "Contract updated",
        description: "Contract status has been updated.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to update contract status.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (contractId: string) => {
    if (!confirm("Are you sure you want to delete this contract?")) {
      return;
    }

    try {
      await deleteContract.mutateAsync(contractId);

      toast({
        title: "Contract deleted",
        description: "The contract has been deleted.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to delete contract.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Loading contracts...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Contracts Management</h1>
          <p className="text-muted-foreground mt-1">
            Player-team contract tracking and lifecycle management
          </p>
        </div>

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-create-contract">
              <Plus className="w-4 h-4 mr-2" />
              Create Contract
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Contract</DialogTitle>
            </DialogHeader>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="upid"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Player *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value || undefined}>
                        <FormControl>
                          <SelectTrigger data-testid="select-player">
                            <SelectValue placeholder="Select player" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {players?.map((player: any) => (
                            <SelectItem key={player.upid} value={player.upid}>
                              {player.firstName} {player.lastName} ({player.upid})
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
                  name="teamId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Team *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value || undefined}>
                        <FormControl>
                          <SelectTrigger data-testid="select-team">
                            <SelectValue placeholder="Select team" />
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

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="contractType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contract Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value || undefined}>
                          <FormControl>
                            <SelectTrigger data-testid="select-contract-type">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="PERMANENT">Permanent</SelectItem>
                            <SelectItem value="LOAN">Loan</SelectItem>
                            <SelectItem value="TRIAL">Trial</SelectItem>
                            <SelectItem value="SHORT_TERM">Short Term</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value || undefined}>
                          <FormControl>
                            <SelectTrigger data-testid="select-status">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="PENDING">Pending</SelectItem>
                            <SelectItem value="ACTIVE">Active</SelectItem>
                            <SelectItem value="EXPIRED">Expired</SelectItem>
                            <SelectItem value="TERMINATED">Terminated</SelectItem>
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
                    name="startDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Start Date *</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} value={field.value || ""} data-testid="input-start-date" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="endDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>End Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} value={field.value || ""} data-testid="input-end-date" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <DialogFooter>
                  <Button type="submit" disabled={createContract.isPending} data-testid="button-submit-contract">
                    {createContract.isPending ? "Creating..." : "Create Contract"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search by player or team name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
            data-testid="input-search-contracts"
          />
        </div>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48" data-testid="select-status-filter">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Statuses</SelectItem>
            <SelectItem value="PENDING">Pending</SelectItem>
            <SelectItem value="ACTIVE">Active</SelectItem>
            <SelectItem value="EXPIRED">Expired</SelectItem>
            <SelectItem value="TERMINATED">Terminated</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filteredContracts.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="w-12 h-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No contracts found</p>
            <p className="text-sm text-muted-foreground">Create a contract to get started</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredContracts.map((contract) => {
            const player = players?.find((p: any) => p.upid === contract.upid);
            const team = teams?.find((t: any) => t.id === contract.teamId);

            return (
              <Card key={contract.id} data-testid={`card-contract-${contract.id}`}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <FileText className="w-5 h-5" />
                        {player?.firstName} {player?.lastName} → {team?.name}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        {contract.contractType.replace("_", " ")} Contract
                      </p>
                    </div>
                    <Badge variant={getStatusBadgeVariant(contract.status)} data-testid={`badge-status-${contract.id}`}>
                      {contract.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Player ID</p>
                      <p className="font-medium" data-testid={`text-player-id-${contract.id}`}>{contract.upid}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Start Date</p>
                      <p className="font-medium" data-testid={`text-start-date-${contract.id}`}>
                        {format(new Date(contract.startDate), "MMM d, yyyy")}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">End Date</p>
                      <p className="font-medium" data-testid={`text-end-date-${contract.id}`}>
                        {contract.endDate ? format(new Date(contract.endDate), "MMM d, yyyy") : "Open-ended"}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Created</p>
                      <p className="font-medium">
                        {format(new Date(contract.createdAt), "MMM d, yyyy")}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-4">
                    <Select
                      value={contract.status}
                      onValueChange={(value) => handleStatusChange(contract.id, value)}
                    >
                      <SelectTrigger className="w-40" data-testid={`select-change-status-${contract.id}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PENDING">Pending</SelectItem>
                        <SelectItem value="ACTIVE">Active</SelectItem>
                        <SelectItem value="EXPIRED">Expired</SelectItem>
                        <SelectItem value="TERMINATED">Terminated</SelectItem>
                      </SelectContent>
                    </Select>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(contract.id)}
                      data-testid={`button-delete-${contract.id}`}
                    >
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
