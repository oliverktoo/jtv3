import { useState, useEffect } from "react";
import StandingsTable from "@/components/StandingsTable";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useOrganizations } from "@/hooks/useReferenceData";
import { useTournaments } from "@/hooks/useTournaments";
import { useStandings } from "@/hooks/useMatches";

export default function Standings() {
  const [selectedOrgId, setSelectedOrgId] = useState("");
  const [selectedTournamentId, setSelectedTournamentId] = useState("");

  const { data: organizations } = useOrganizations();
  const { data: tournaments } = useTournaments(selectedOrgId);
  const { data: standingsData = [], isLoading } = useStandings(selectedTournamentId);

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

  const selectedTournament = tournaments?.find((t) => t.id === selectedTournamentId);

  // Transform API standings data to component format
  const standings = standingsData.map((s: any, index: number) => ({
    position: s.position || index + 1,
    team: s.teamName || s.team || "Unknown Team",
    played: s.played || 0,
    won: s.won || 0,
    drawn: s.drawn || 0,
    lost: s.lost || 0,
    goalsFor: s.goalsFor || 0,
    goalsAgainst: s.goalsAgainst || 0,
    goalDifference: s.goalDifference || 0,
    points: s.points || 0,
    form: s.form || [],
    zone: s.zone,
  }));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Loading standings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Standings</h1>
          <p className="text-muted-foreground mt-1">
            Current league table and team rankings
          </p>
        </div>
        <Button variant="outline" data-testid="button-export-standings">
          <Download className="h-4 w-4 mr-2" />
          Export to Excel
        </Button>
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
      </div>

      {!selectedTournamentId && (
        <div className="text-center py-12 border-2 border-dashed rounded-lg">
          <p className="text-muted-foreground">Select a tournament to view standings</p>
        </div>
      )}

      {selectedTournamentId && standings.length === 0 && (
        <div className="text-center py-12 border-2 border-dashed rounded-lg">
          <p className="text-muted-foreground mb-2">No standings available</p>
          <p className="text-sm text-muted-foreground">
            Standings will be calculated once matches are completed
          </p>
        </div>
      )}

      {selectedTournamentId && standings.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">
              {selectedTournament?.name || "Tournament Standings"}
            </h2>
            <div className="flex gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-chart-2/30 border border-chart-2/50"></div>
                <span className="text-muted-foreground">Promotion Zone</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-destructive/30 border border-destructive/50"></div>
                <span className="text-muted-foreground">Relegation Zone</span>
              </div>
            </div>
          </div>

          <StandingsTable standings={standings} showForm />

          <div className="mt-6 p-4 bg-muted/30 rounded-lg">
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold">Tiebreaker Order:</span> Points &gt;
              Goal Difference &gt; Goals For &gt; Head-to-Head
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
