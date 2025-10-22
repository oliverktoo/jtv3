import { useState, useEffect } from "react";
import { Search, Plus, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useOrganizations } from "@/hooks/useReferenceData";
import { useToast } from "@/hooks/use-toast";
import { insertDisciplinaryRecordSchema, type DisciplinaryRecord } from "@shared/schema";
import { format } from "date-fns";
import { queryClient, apiRequest } from "@/lib/queryClient";

const createDisciplinaryFormSchema = insertDisciplinaryRecordSchema.extend({
  upid: z.string().min(1, "Player is required"),
  incidentDate: z.string().min(1, "Incident date is required"),
  description: z.string().min(1, "Description is required"),
});

type CreateDisciplinaryFormValues = z.infer<typeof createDisciplinaryFormSchema>;

function useDisciplinaryRecords(orgId: string) {
  return useQuery<DisciplinaryRecord[]>({
    queryKey: ["/api/organizations", orgId, "disciplinary-records"],
    queryFn: async () => {
      const res = await fetch(`/api/organizations/${orgId}/disciplinary-records`);
      if (!res.ok) throw new Error("Failed to fetch disciplinary records");
      return res.json();
    },
    enabled: !!orgId,
  });
}

function useCreateDisciplinaryRecord() {
  return useMutation({
    mutationFn: async (data: CreateDisciplinaryFormValues) => {
      return apiRequest("POST", "/api/disciplinary-records", data);
    },
    onSuccess: (_result, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/organizations", variables.orgId, "disciplinary-records"] });
      queryClient.invalidateQueries({ queryKey: ["/api/disciplinary-records"] });
    },
  });
}

function useUpdateDisciplinaryRecord() {
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<DisciplinaryRecord> }) => {
      return apiRequest("PATCH", `/api/disciplinary-records/${id}`, data);
    },
    onSuccess: (_result, variables) => {
      if (variables.data.orgId) {
        queryClient.invalidateQueries({ queryKey: ["/api/organizations", variables.data.orgId, "disciplinary-records"] });
      }
      queryClient.invalidateQueries({ queryKey: ["/api/disciplinary-records"] });
    },
  });
}

function usePlayers(orgId: string) {
  return useQuery<any[]>({
    queryKey: ["/api/players", orgId],
    enabled: !!orgId,
  });
}

export default function Disciplinary() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedOrgId, setSelectedOrgId] = useState("");
  const { toast } = useToast();

  const { data: organizations } = useOrganizations();
  const { data: records, isLoading } = useDisciplinaryRecords(selectedOrgId);
  const { data: players } = usePlayers(selectedOrgId);
  const createRecord = useCreateDisciplinaryRecord();
  const updateRecord = useUpdateDisciplinaryRecord();

  // Initialize selectedOrgId when organizations load
  useEffect(() => {
    if (organizations && organizations.length > 0 && !selectedOrgId) {
      setSelectedOrgId(organizations[0].id);
    }
  }, [organizations, selectedOrgId]);

  const form = useForm<CreateDisciplinaryFormValues>({
    resolver: zodResolver(createDisciplinaryFormSchema),
    defaultValues: {
      upid: "",
      orgId: "",
      tournamentId: "",
      matchId: "",
      incidentType: "WARNING",
      incidentDate: new Date().toISOString().split("T")[0],
      description: "",
      matchesSuspended: 0,
      fineAmount: 0,
      servingStartDate: "",
      servingEndDate: "",
      appealDate: "",
      appealOutcome: "",
      issuedBy: "",
      notes: "",
    },
  });

  // Update form's orgId when selectedOrgId changes
  useEffect(() => {
    if (selectedOrgId) {
      form.setValue("orgId", selectedOrgId);
    }
  }, [selectedOrgId, form]);

  const handleCreateRecord = async (data: CreateDisciplinaryFormValues) => {
    try {
      await createRecord.mutateAsync(data);
      toast({
        title: "Disciplinary record created",
        description: "The disciplinary record has been created successfully.",
      });
      form.reset();
      setIsCreateDialogOpen(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create disciplinary record",
        variant: "destructive",
      });
    }
  };

  const handleStatusUpdate = async (recordId: string, newStatus: string, orgId: string) => {
    try {
      await updateRecord.mutateAsync({
        id: recordId,
        data: { status: newStatus as any, orgId },
      });
      toast({
        title: "Status updated",
        description: `Disciplinary record status updated to ${newStatus}.`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update status",
        variant: "destructive",
      });
    }
  };

  const filteredRecords = records?.filter((record) => {
    const player = players?.find((p: any) => p.id === record.upid);
    const playerName = player ? `${player.firstName} ${player.lastName}` : "";
    const matchesSearch = playerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || record.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "destructive";
      case "SERVED":
        return "secondary";
      case "APPEALED":
        return "default";
      case "OVERTURNED":
        return "outline";
      case "CANCELLED":
        return "outline";
      default:
        return "secondary";
    }
  };

  const getIncidentTypeBadgeVariant = (type: string) => {
    switch (type) {
      case "RED_CARD":
        return "destructive";
      case "YELLOW_CARD":
        return "default";
      case "SUSPENSION":
        return "destructive";
      case "FINE":
        return "secondary";
      case "WARNING":
        return "outline";
      default:
        return "secondary";
    }
  };

  return (
    <div className="h-full flex flex-col p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Disciplinary Records</h1>
          <p className="text-muted-foreground">Track player discipline and sanctions</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-create-record">
              <Plus className="w-4 h-4 mr-2" />
              Add Record
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Disciplinary Record</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleCreateRecord)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="upid"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Player</FormLabel>
                      <FormControl>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger data-testid="select-player">
                            <SelectValue placeholder="Select player" />
                          </SelectTrigger>
                          <SelectContent>
                            {players?.map((player: any) => (
                              <SelectItem key={player.id} value={player.id}>
                                {player.firstName} {player.lastName}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="incidentType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Incident Type</FormLabel>
                      <FormControl>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger data-testid="select-incident-type">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="YELLOW_CARD">Yellow Card</SelectItem>
                            <SelectItem value="RED_CARD">Red Card</SelectItem>
                            <SelectItem value="SUSPENSION">Suspension</SelectItem>
                            <SelectItem value="FINE">Fine</SelectItem>
                            <SelectItem value="WARNING">Warning</SelectItem>
                            <SelectItem value="MISCONDUCT">Misconduct</SelectItem>
                            <SelectItem value="OTHER">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="incidentDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Incident Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} data-testid="input-incident-date" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea {...field} data-testid="textarea-description" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="matchesSuspended"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Matches Suspended</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            value={field.value || 0} 
                            onChange={e => field.onChange(parseInt(e.target.value) || 0)} 
                            data-testid="input-matches-suspended" 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="fineAmount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fine Amount</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            value={field.value || 0} 
                            onChange={e => field.onChange(parseInt(e.target.value) || 0)} 
                            data-testid="input-fine-amount" 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="servingStartDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Serving Start Date</FormLabel>
                        <FormControl>
                          <Input type="date" value={field.value || ""} onChange={field.onChange} data-testid="input-serving-start" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="servingEndDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Serving End Date</FormLabel>
                        <FormControl>
                          <Input type="date" value={field.value || ""} onChange={field.onChange} data-testid="input-serving-end" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="issuedBy"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Issued By</FormLabel>
                      <FormControl>
                        <Input value={field.value || ""} onChange={field.onChange} data-testid="input-issued-by" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes</FormLabel>
                      <FormControl>
                        <Textarea value={field.value || ""} onChange={field.onChange} data-testid="textarea-notes" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <DialogFooter>
                  <Button type="submit" disabled={createRecord.isPending} data-testid="button-submit-record">
                    {createRecord.isPending ? "Creating..." : "Create Record"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center gap-4">
        <Select value={selectedOrgId} onValueChange={setSelectedOrgId}>
          <SelectTrigger className="w-64" data-testid="select-organization">
            <SelectValue placeholder="Select organization" />
          </SelectTrigger>
          <SelectContent>
            {organizations?.map((org: any) => (
              <SelectItem key={org.id} value={org.id}>
                {org.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48" data-testid="select-status-filter">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Statuses</SelectItem>
            <SelectItem value="ACTIVE">Active</SelectItem>
            <SelectItem value="SERVED">Served</SelectItem>
            <SelectItem value="APPEALED">Appealed</SelectItem>
            <SelectItem value="OVERTURNED">Overturned</SelectItem>
            <SelectItem value="CANCELLED">Cancelled</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search by player or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
            data-testid="input-search"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading disciplinary records...</p>
        </div>
      ) : !filteredRecords || filteredRecords.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <AlertTriangle className="w-12 h-12 text-muted-foreground mb-4" />
          <p className="text-lg font-medium">No disciplinary records found</p>
          <p className="text-sm text-muted-foreground">Create your first disciplinary record to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredRecords.map((record) => {
            const player = players?.find((p: any) => p.id === record.upid);
            return (
              <Card key={record.id} data-testid={`card-record-${record.id}`}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="flex items-center gap-2">
                        {player ? `${player.firstName} ${player.lastName}` : "Unknown Player"}
                        <Badge variant={getIncidentTypeBadgeVariant(record.incidentType)} className="text-xs">
                          {record.incidentType.replace("_", " ")}
                        </Badge>
                      </CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">{record.description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={getStatusBadgeVariant(record.status)} data-testid={`badge-status-${record.id}`}>
                        {record.status}
                      </Badge>
                      <Select
                        value={record.status}
                        onValueChange={(value) => handleStatusUpdate(record.id, value, record.orgId)}
                      >
                        <SelectTrigger className="w-32 h-8" data-testid={`select-update-status-${record.id}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ACTIVE">Active</SelectItem>
                          <SelectItem value="SERVED">Served</SelectItem>
                          <SelectItem value="APPEALED">Appealed</SelectItem>
                          <SelectItem value="OVERTURNED">Overturned</SelectItem>
                          <SelectItem value="CANCELLED">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Incident Date</p>
                      <p className="font-medium">{format(new Date(record.incidentDate), "MMM d, yyyy")}</p>
                    </div>
                    {record.matchesSuspended && record.matchesSuspended > 0 && (
                      <div>
                        <p className="text-muted-foreground">Matches Suspended</p>
                        <p className="font-medium">{record.matchesSuspended}</p>
                      </div>
                    )}
                    {record.fineAmount && record.fineAmount > 0 && (
                      <div>
                        <p className="text-muted-foreground">Fine Amount</p>
                        <p className="font-medium">KSh {record.fineAmount.toLocaleString()}</p>
                      </div>
                    )}
                    {record.servingStartDate && (
                      <div>
                        <p className="text-muted-foreground">Serving Period</p>
                        <p className="font-medium">
                          {format(new Date(record.servingStartDate), "MMM d")} - {record.servingEndDate ? format(new Date(record.servingEndDate), "MMM d") : "Ongoing"}
                        </p>
                      </div>
                    )}
                    {record.issuedBy && (
                      <div>
                        <p className="text-muted-foreground">Issued By</p>
                        <p className="font-medium">{record.issuedBy}</p>
                      </div>
                    )}
                  </div>
                  {record.notes && (
                    <div className="mt-4 pt-4 border-t">
                      <p className="text-xs text-muted-foreground">Notes</p>
                      <p className="text-sm">{record.notes}</p>
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
