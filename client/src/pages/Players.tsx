import { useState } from "react";
import { Search, Plus, User, FileText } from "lucide-react";
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
import { usePlayers, useCreatePlayer } from "@/hooks/usePlayers";
import { useOrganizations } from "@/hooks/useReferenceData";
import { useToast } from "@/hooks/use-toast";
import { insertPlayerRegistrySchema } from "@shared/schema";
import { format } from "date-fns";

const createPlayerFormSchema = insertPlayerRegistrySchema.extend({
  docType: z.string().optional(),
  docNumber: z.string().optional(),
});

type CreatePlayerFormValues = z.infer<typeof createPlayerFormSchema>;

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
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
