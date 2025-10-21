import { useState } from "react";
import { useParams, Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Plus, Search, UserPlus, ArrowLeft } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { useTeamRoster, useCreateTournamentPlayer, useCreateRosterMember } from "@/hooks/useTournamentPlayers";
import { usePlayers } from "@/hooks/usePlayers";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { Team, Tournament } from "@shared/schema";
import { format } from "date-fns";

const addPlayerSchema = z.object({
  upid: z.string().min(1, "Player is required"),
  jerseyNumber: z.number().optional(),
  position: z.string().optional(),
});

type AddPlayerFormValues = z.infer<typeof addPlayerSchema>;

export default function TeamRoster() {
  const { teamId } = useParams();
  const { toast } = useToast();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPlayer, setSelectedPlayer] = useState<any>(null);

  const { data: team } = useQuery<Team>({
    queryKey: [`/api/teams/${teamId}`],
    enabled: !!teamId,
  });

  const { data: tournament } = useQuery<Tournament>({
    queryKey: [`/api/tournaments/${team?.tournamentId}`],
    enabled: !!team?.tournamentId,
  });

  const { data: roster = [], isLoading: isLoadingRoster } = useTeamRoster(teamId || "");
  const { data: players = [] } = usePlayers(tournament?.orgId || "");

  const createTournamentPlayer = useCreateTournamentPlayer(tournament?.id || "");
  const createRosterMember = useCreateRosterMember(teamId || "");

  const form = useForm<AddPlayerFormValues>({
    resolver: zodResolver(addPlayerSchema),
    defaultValues: {
      upid: "",
      jerseyNumber: undefined,
      position: "",
    },
  });

  const filteredPlayers = players.filter((player) => {
    const fullName = `${player.firstName} ${player.lastName}`.toLowerCase();
    const isInRoster = roster.some((r: any) => r.upid === player.id);
    return !isInRoster && fullName.includes(searchQuery.toLowerCase());
  });

  const onSubmit = async (data: AddPlayerFormValues) => {
    try {
      // Guard: Ensure tournament is loaded before proceeding
      if (!tournament) {
        toast({
          title: "Error",
          description: "Tournament data is not loaded yet. Please try again.",
          variant: "destructive",
        });
        return;
      }

      // First, check eligibility
      const eligibilityResponse = await apiRequest(
        "POST",
        `/api/tournaments/${tournament.id}/check-eligibility`,
        { upid: data.upid }
      );
      const eligibilityResult = await eligibilityResponse.json();

      if (!eligibilityResult.isEligible) {
        // Show detailed eligibility violations
        const violations = eligibilityResult.violations
          .map((v: any) => `• ${v.reason}`)
          .join("\n");
        
        toast({
          title: "Player not eligible",
          description: `${selectedPlayer?.firstName} ${selectedPlayer?.lastName} cannot be added to this tournament:\n\n${violations}`,
          variant: "destructive",
        });
        return;
      }

      // Player is eligible, proceed with normal flow
      // Create tournament player (TPID) if not already exists
      let tpid = "";
      try {
        const response = await createTournamentPlayer.mutateAsync({
          tournamentId: tournament.id,
          upid: data.upid,
          jerseyNumber: data.jerseyNumber,
          position: data.position,
        });
        const tournamentPlayer = await response.json();
        tpid = tournamentPlayer.id;
      } catch (error: any) {
        // If 409, player already exists in tournament (error.data is already parsed)
        if (error.status === 409) {
          tpid = error.data.tpid;
        } else {
          throw error;
        }
      }

      // Then, add to team roster
      await createRosterMember.mutateAsync({ tpid });

      toast({
        title: "Player added",
        description: `${selectedPlayer?.firstName} ${selectedPlayer?.lastName} has been added to the team roster.`,
      });

      setIsAddDialogOpen(false);
      form.reset();
      setSelectedPlayer(null);
      setSearchQuery("");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add player to roster",
        variant: "destructive",
      });
    }
  };

  const selectPlayer = (player: any) => {
    setSelectedPlayer(player);
    form.setValue("upid", player.id);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/tournaments">
            <Button variant="ghost" size="icon" data-testid="button-back">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold" data-testid="text-team-name">{team?.name}</h1>
            <p className="text-muted-foreground" data-testid="text-tournament-name">{tournament?.name}</p>
          </div>
        </div>

        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-player">
              <Plus className="h-4 w-4 mr-2" />
              Add Player
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add Player to Roster</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search players by name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                  data-testid="input-search-player"
                />
              </div>

              {selectedPlayer ? (
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Selected Player</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="font-medium" data-testid="text-selected-player">
                          {selectedPlayer.firstName} {selectedPlayer.lastName}
                        </p>
                        {selectedPlayer.dob && (
                          <p className="text-sm text-muted-foreground">
                            DOB: {format(new Date(selectedPlayer.dob), "PPP")}
                          </p>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedPlayer(null)}
                          className="mt-2"
                          type="button"
                          data-testid="button-change-player"
                        >
                          Change Player
                        </Button>
                      </CardContent>
                    </Card>

                    <FormField
                      control={form.control}
                      name="jerseyNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Jersey Number</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="10"
                              {...field}
                              onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                              data-testid="input-jersey-number"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="position"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Position</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Forward"
                              {...field}
                              data-testid="input-position"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button
                      type="submit"
                      className="w-full"
                      disabled={createTournamentPlayer.isPending || createRosterMember.isPending}
                      data-testid="button-submit-player"
                    >
                      {createTournamentPlayer.isPending || createRosterMember.isPending ? "Adding..." : "Add to Roster"}
                    </Button>
                  </form>
                </Form>
              ) : (
                <div className="max-h-[400px] overflow-y-auto">
                  {searchQuery && filteredPlayers.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">No players found</p>
                  ) : (
                    <div className="space-y-2">
                      {filteredPlayers.map((player) => (
                        <Card
                          key={player.id}
                          className="cursor-pointer hover-elevate active-elevate-2"
                          onClick={() => selectPlayer(player)}
                          data-testid={`card-player-${player.id}`}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium">
                                  {player.firstName} {player.lastName}
                                </p>
                                {player.dob && (
                                  <p className="text-sm text-muted-foreground">
                                    DOB: {format(new Date(player.dob), "PPP")}
                                  </p>
                                )}
                              </div>
                              <UserPlus className="h-4 w-4 text-muted-foreground" />
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Team Roster</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingRoster ? (
            <p className="text-center text-muted-foreground py-8">Loading roster...</p>
          ) : roster.length === 0 ? (
            <p className="text-center text-muted-foreground py-8" data-testid="text-empty-roster">
              No players in roster yet. Click "Add Player" to get started.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>#</TableHead>
                  <TableHead>Player Name</TableHead>
                  <TableHead>Position</TableHead>
                  <TableHead>Date of Birth</TableHead>
                  <TableHead>Joined</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {roster.map((member: any) => (
                  <TableRow key={member.id} data-testid={`row-roster-${member.id}`}>
                    <TableCell>{member.jerseyNumber || "-"}</TableCell>
                    <TableCell className="font-medium">
                      {member.firstName} {member.lastName}
                    </TableCell>
                    <TableCell>{member.position || "-"}</TableCell>
                    <TableCell>
                      {member.dob ? format(new Date(member.dob), "PP") : "-"}
                    </TableCell>
                    <TableCell>{format(new Date(member.joinedAt), "PP")}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
