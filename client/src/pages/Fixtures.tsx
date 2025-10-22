import { useState, useEffect } from "react";
import FixtureCard from "@/components/FixtureCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Download, Filter, Plus, Edit } from "lucide-react";
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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useOrganizations } from "@/hooks/useReferenceData";
import { useTournaments } from "@/hooks/useTournaments";
import { useMatches, useUpdateMatch } from "@/hooks/useMatches";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

const recordResultSchema = z.object({
  homeScore: z.number().min(0, "Score must be 0 or greater"),
  awayScore: z.number().min(0, "Score must be 0 or greater"),
  status: z.enum(["SCHEDULED", "LIVE", "COMPLETED", "POSTPONED", "CANCELLED"]),
});

type RecordResultFormValues = z.infer<typeof recordResultSchema>;

export default function Fixtures() {
  const [selectedOrgId, setSelectedOrgId] = useState("");
  const [selectedTournamentId, setSelectedTournamentId] = useState("");
  const [roundFilter, setRoundFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isRecordDialogOpen, setIsRecordDialogOpen] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<any>(null);
  const { toast } = useToast();

  const { data: organizations } = useOrganizations();
  const { data: tournaments } = useTournaments(selectedOrgId);
  const { data: matchesData = [], isLoading } = useMatches(selectedTournamentId);
  const updateMatch = useUpdateMatch(selectedTournamentId);

  const form = useForm<RecordResultFormValues>({
    resolver: zodResolver(recordResultSchema),
    defaultValues: {
      homeScore: 0,
      awayScore: 0,
      status: "COMPLETED",
    },
  });

  // Initialize selectedOrgId when organizations load
  useEffect(() => {
    if (organizations && organizations.length > 0 && !selectedOrgId) {
      setSelectedOrgId(organizations[0].id);
    }
  }, [organizations, selectedOrgId]);

  // Initialize selectedTournamentId when tournaments load
  useEffect(() => {
    if (tournaments && tournaments.length > 0 && !selectedTournamentId) {
      const activeTournament = tournaments.find((t) => t.status === "ACTIVE") || tournaments[0];
      setSelectedTournamentId(activeTournament.id);
    }
  }, [tournaments, selectedTournamentId]);

  const handleRecordResult = async (values: RecordResultFormValues) => {
    if (!selectedMatch) return;

    try {
      await updateMatch.mutateAsync({
        id: selectedMatch.match.id,
        data: {
          homeScore: values.homeScore,
          awayScore: values.awayScore,
          status: values.status,
        },
      });
      
      toast({
        title: "Result recorded",
        description: `Match result has been updated successfully.`,
      });
      
      setIsRecordDialogOpen(false);
      setSelectedMatch(null);
      form.reset();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to record match result.",
        variant: "destructive",
      });
    }
  };

  const openRecordDialog = (match: any) => {
    setSelectedMatch(match);
    form.reset({
      homeScore: match.match.homeScore || 0,
      awayScore: match.match.awayScore || 0,
      status: match.match.status,
    });
    setIsRecordDialogOpen(true);
  };

  // Transform matches data for FixtureCard
  const fixtures = matchesData.map((m: any) => ({
    id: m.match.id,
    homeTeam: m.homeTeam?.name || "TBD",
    awayTeam: m.awayTeam?.name || "TBD",
    homeScore: m.match.homeScore,
    awayScore: m.match.awayScore,
    kickoff: m.match.kickoff,
    venue: m.match.venue,
    status: m.match.status,
    round: m.round?.name || `Round ${m.round?.number || 1}`,
    stage: "League",
  }));

  const filteredFixtures = fixtures.filter((fixture: any) => {
    const matchesRound = roundFilter === "all" || fixture.round === roundFilter;
    const matchesStatus = statusFilter === "all" || fixture.status === statusFilter;
    return matchesRound && matchesStatus;
  });

  const rounds = Array.from(new Set(fixtures.map((f: any) => f.round)));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Loading fixtures...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Fixtures</h1>
          <p className="text-muted-foreground mt-1">
            View and manage match schedules
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" data-testid="button-export-fixtures">
            <Download className="h-4 w-4 mr-2" />
            Export to Excel
          </Button>
        </div>
      </div>

      <div className="flex gap-4 items-center flex-wrap">
        <Select value={selectedOrgId} onValueChange={setSelectedOrgId}>
          <SelectTrigger className="w-[220px]" data-testid="select-organization">
            <SelectValue placeholder="Select organization" />
          </SelectTrigger>
          <SelectContent>
            {organizations?.map((org) => (
              <SelectItem key={org.id} value={org.id}>
                {org.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedTournamentId} onValueChange={setSelectedTournamentId}>
          <SelectTrigger className="w-[220px]" data-testid="select-tournament">
            <SelectValue placeholder="Select tournament" />
          </SelectTrigger>
          <SelectContent>
            {tournaments?.map((tournament) => (
              <SelectItem key={tournament.id} value={tournament.id}>
                {tournament.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={roundFilter} onValueChange={setRoundFilter}>
            <SelectTrigger className="w-[180px]" data-testid="select-filter-round">
              <SelectValue placeholder="Filter by round" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Rounds</SelectItem>
              {rounds.map((round) => (
                <SelectItem key={round} value={round}>
                  {round}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]" data-testid="select-filter-status">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="SCHEDULED">Scheduled</SelectItem>
            <SelectItem value="LIVE">Live</SelectItem>
            <SelectItem value="COMPLETED">Completed</SelectItem>
            <SelectItem value="POSTPONED">Postponed</SelectItem>
            <SelectItem value="CANCELLED">Cancelled</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex gap-2 ml-auto">
          <Badge variant="outline" className="bg-chart-2/10 text-chart-2 border-chart-2/20">
            {fixtures.filter((f: any) => f.status === "COMPLETED").length} Completed
          </Badge>
          <Badge variant="outline" className="bg-muted text-muted-foreground">
            {fixtures.filter((f: any) => f.status === "SCHEDULED").length} Scheduled
          </Badge>
        </div>
      </div>

      {filteredFixtures.length === 0 && selectedTournamentId && (
        <div className="text-center py-12 border-2 border-dashed rounded-lg">
          <p className="text-muted-foreground mb-4">No fixtures found for this tournament</p>
          <p className="text-sm text-muted-foreground">
            Generate fixtures from the tournament detail page
          </p>
        </div>
      )}

      {!selectedTournamentId && (
        <div className="text-center py-12 border-2 border-dashed rounded-lg">
          <p className="text-muted-foreground">Select a tournament to view fixtures</p>
        </div>
      )}

      <div className="space-y-4">
        {filteredFixtures.map((fixture: any) => {
          const matchData = matchesData.find((m: any) => m.match.id === fixture.id);
          return (
            <div key={fixture.id} className="relative group">
              <FixtureCard {...fixture} onClick={() => {}} />
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    openRecordDialog(matchData);
                  }}
                  data-testid={`button-record-result-${fixture.id}`}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Record Result
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      <Dialog open={isRecordDialogOpen} onOpenChange={setIsRecordDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record Match Result</DialogTitle>
          </DialogHeader>
          {selectedMatch && (
            <div className="mb-4">
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-2">
                  {selectedMatch.round?.name || `Round ${selectedMatch.round?.number}`}
                </p>
                <div className="flex items-center justify-center gap-4">
                  <span className="font-semibold">{selectedMatch.homeTeam?.name || "TBD"}</span>
                  <span className="text-muted-foreground">vs</span>
                  <span className="font-semibold">{selectedMatch.awayTeam?.name || "TBD"}</span>
                </div>
                {selectedMatch.match.kickoff && (
                  <p className="text-sm text-muted-foreground mt-2">
                    {format(new Date(selectedMatch.match.kickoff), "EEE, MMM d • HH:mm")}
                  </p>
                )}
              </div>
            </div>
          )}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleRecordResult)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="homeScore"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Home Score</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          data-testid="input-home-score"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="awayScore"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Away Score</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          data-testid="input-away-score"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Match Status</FormLabel>
                    <FormControl>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger data-testid="select-match-status">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="SCHEDULED">Scheduled</SelectItem>
                          <SelectItem value="LIVE">Live</SelectItem>
                          <SelectItem value="COMPLETED">Completed</SelectItem>
                          <SelectItem value="POSTPONED">Postponed</SelectItem>
                          <SelectItem value="CANCELLED">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsRecordDialogOpen(false)}
                  data-testid="button-cancel-result"
                >
                  Cancel
                </Button>
                <Button type="submit" data-testid="button-submit-result">
                  Save Result
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
