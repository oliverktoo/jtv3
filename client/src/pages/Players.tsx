import { useState } from "react";
import { Search, Plus, User, FileText, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery } from "@tanstack/react-query";
import { usePlayers, useCreatePlayer } from "@/hooks/usePlayers";
import { useOrganizations } from "@/hooks/useReferenceData";
import { useToast } from "@/hooks/use-toast";
import { insertPlayerRegistrySchema, type Contract } from "@shared/schema";
import { format } from "date-fns";

const createPlayerFormSchema = insertPlayerRegistrySchema.extend({
  docType: z.string().optional(),
  docNumber: z.string().optional(),
});

type CreatePlayerFormValues = z.infer<typeof createPlayerFormSchema>;

function PlayerContracts({ upid }: { upid: string }) {
  const [isOpen, setIsOpen] = useState(false);
  
  const { data: contracts, isLoading } = useQuery<Contract[]>({
    queryKey: ["/api/players", upid, "contracts"],
    enabled: isOpen,
  });

  const { data: teams } = useQuery({
    queryKey: ["/api/teams"],
    queryFn: async () => {
      const res = await fetch("/api/teams");
      if (!res.ok) throw new Error("Failed to fetch teams");
      return res.json();
    },
    enabled: isOpen && !!contracts,
  });

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

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-between"
          data-testid={`button-view-contracts-${upid}`}
        >
          <span>Contract History</span>
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="pt-3">
        {isLoading ? (
          <p className="text-sm text-muted-foreground text-center py-2">Loading contracts...</p>
        ) : !contracts || contracts.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-2">No contracts found</p>
        ) : (
          <div className="space-y-2">
            {contracts.map((contract) => {
              const team = teams?.find((t: any) => t.id === contract.teamId);
              return (
                <div
                  key={contract.id}
                  className="border rounded-md p-3 text-sm"
                  data-testid={`contract-item-${contract.id}`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="font-medium">{team?.name || "Unknown Team"}</div>
                    <Badge variant={getStatusBadgeVariant(contract.status)} className="text-xs">
                      {contract.status}
                    </Badge>
                  </div>
                  <div className="space-y-1 text-xs text-muted-foreground">
                    <div>Type: {contract.contractType.replace("_", " ")}</div>
                    <div>
                      Period: {format(new Date(contract.startDate), "MMM d, yyyy")} -{" "}
                      {contract.endDate ? format(new Date(contract.endDate), "MMM d, yyyy") : "Open-ended"}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CollapsibleContent>
    </Collapsible>
  );
}

export default function Players() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const { toast } = useToast();

  const { data: organizations } = useOrganizations();
  const orgId = (organizations && organizations.length > 0) ? organizations[0].id : "";
  const { data: players, isLoading } = usePlayers(orgId);
  const createPlayer = useCreatePlayer(orgId);

  const form = useForm<CreatePlayerFormValues>({
    resolver: zodResolver(createPlayerFormSchema),
    defaultValues: {
      orgId,
      firstName: "",
      lastName: "",
      sex: "MALE",
      status: "ACTIVE",
    },
  });

  const filteredPlayers = (players || []).filter((player) => {
    const fullName = `${player.firstName} ${player.lastName}`.toLowerCase();
    return fullName.includes(searchQuery.toLowerCase());
  });

  const onSubmit = async (data: CreatePlayerFormValues) => {
    try {
      // Server will handle hashing of identity keys
      await createPlayer.mutateAsync(data);

      toast({
        title: "Player created",
        description: `${data.firstName} ${data.lastName} has been added to the registry.`,
      });

      form.reset();
      setIsCreateDialogOpen(false);
    } catch (error: any) {
      if (error.response?.status === 409) {
        toast({
          title: "Duplicate player detected",
          description: "A player with this identity already exists.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to create player.",
          variant: "destructive",
        });
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Loading players...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Player Registry</h1>
          <p className="text-muted-foreground mt-1">
            Universal Player ID (UPID) management system
          </p>
        </div>

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-create-player">
              <Plus className="w-4 h-4 mr-2" />
              Add Player
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Player</DialogTitle>
            </DialogHeader>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name *</FormLabel>
                        <FormControl>
                          <Input {...field} data-testid="input-first-name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name *</FormLabel>
                        <FormControl>
                          <Input {...field} data-testid="input-last-name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="dob"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date of Birth</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} value={field.value || ""} data-testid="input-dob" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="sex"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sex</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value || undefined}>
                          <FormControl>
                            <SelectTrigger data-testid="select-sex">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="MALE">Male</SelectItem>
                            <SelectItem value="FEMALE">Female</SelectItem>
                            <SelectItem value="OTHER">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="nationality"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nationality</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value || ""} placeholder="e.g., Kenyan" data-testid="input-nationality" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="border-t pt-4 mt-4">
                  <h3 className="text-sm font-semibold mb-3">Identity Document (Optional)</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="docType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Document Type</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-doc-type">
                                <SelectValue placeholder="Select document type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="NATIONAL_ID">National ID</SelectItem>
                              <SelectItem value="PASSPORT">Passport</SelectItem>
                              <SelectItem value="BIRTH_CERTIFICATE">Birth Certificate</SelectItem>
                              <SelectItem value="GUARDIAN_ID">Guardian ID</SelectItem>
                              <SelectItem value="OTHER">Other</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="docNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Document Number</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Document number" data-testid="input-doc-number" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createPlayer.isPending} data-testid="button-submit-player">
                    {createPlayer.isPending ? "Creating..." : "Create Player"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search players by name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
          data-testid="input-search-players"
        />
      </div>

      {filteredPlayers.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed rounded-lg">
          <User className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground mb-4">No players found</p>
          <Button onClick={() => setIsCreateDialogOpen(true)} data-testid="button-create-first-player">
            Add Your First Player
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPlayers.map((player) => (
            <Card key={player.id} className="hover-elevate">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-base font-semibold">
                  {player.firstName} {player.lastName}
                </CardTitle>
                <Badge variant={player.status === "ACTIVE" ? "default" : "secondary"} data-testid={`badge-status-${player.id}`}>
                  {player.status}
                </Badge>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <FileText className="w-4 h-4" />
                    <span>UPID: {player.id.slice(0, 8)}...</span>
                  </div>
                  {player.dob && (
                    <div className="text-muted-foreground">
                      DOB: {format(new Date(player.dob), "MMM d, yyyy")}
                    </div>
                  )}
                  {player.nationality && (
                    <div className="text-muted-foreground">
                      {player.nationality}
                    </div>
                  )}
                  {player.sex && (
                    <div className="text-muted-foreground">
                      {player.sex}
                    </div>
                  )}
                  <div className="text-xs text-muted-foreground pt-2">
                    Registered {format(new Date(player.createdAt), "MMM d, yyyy")}
                  </div>
                </div>
                <div className="border-t mt-4 pt-4">
                  <PlayerContracts upid={player.id} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
