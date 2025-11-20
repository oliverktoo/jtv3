import { useState } from "react";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, MapPin, Clock, Filter } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { Match } from "@shared/schema";

interface Fixture {
  id: string;
  roundNumber: number;
  roundName: string;
  leg: number;
  stageName: string;
  groupName?: string;
  homeTeam: { id: string; name: string; logo_url?: string };
  awayTeam: { id: string; name: string; logo_url?: string };
  kickoff: string;
  venue: string;
  status: string;
  homeScore?: number | null;
  awayScore?: number | null;
}

interface FixturesListProps {
  tournamentId: string;
  onMatchClick?: (matchId: string) => void;
}

const statusColors: Record<string, string> = {
  SCHEDULED: "secondary",
  LIVE: "destructive",
  COMPLETED: "default",
  POSTPONED: "outline",
  CANCELLED: "outline",
};

export default function FixturesList({ tournamentId, onMatchClick }: FixturesListProps) {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [roundFilter, setRoundFilter] = useState<string>("all");

  const { data, isLoading, error } = useQuery<{ fixtures: Fixture[]; rounds: any[] }>({
    queryKey: [`/api/tournaments/${tournamentId}/fixtures`],
    queryFn: () => apiRequest("GET", `/api/tournaments/${tournamentId}/fixtures`),
    enabled: !!tournamentId,
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">Loading fixtures...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-destructive">Failed to load fixtures</p>
        </CardContent>
      </Card>
    );
  }

  const fixtures = data?.fixtures || [];
  const rounds = data?.rounds || [];

  if (fixtures.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">No fixtures generated yet</p>
        </CardContent>
      </Card>
    );
  }

  // Get unique rounds for filter
  const uniqueRounds = Array.from(new Set(fixtures.map(f => f.roundNumber))).sort((a, b) => a - b);

  // Apply filters
  const filteredFixtures = fixtures.filter(fixture => {
    const matchesStatus = statusFilter === "all" || fixture.status === statusFilter;
    const matchesRound = roundFilter === "all" || fixture.roundNumber === parseInt(roundFilter);
    return matchesStatus && matchesRound;
  });

  // Group by round
  const fixturesByRound = filteredFixtures.reduce((acc, fixture) => {
    const key = `Round ${fixture.roundNumber}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(fixture);
    return acc;
  }, {} as Record<string, Fixture[]>);

  return (
    <div className="space-y-4">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
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
            </div>
            <div className="flex-1">
              <Select value={roundFilter} onValueChange={setRoundFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by round" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Rounds</SelectItem>
                  {uniqueRounds.map(round => (
                    <SelectItem key={round} value={round.toString()}>
                      Round {round}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Fixtures by Round */}
      {Object.entries(fixturesByRound).map(([roundName, roundFixtures]) => (
        <Card key={roundName}>
          <CardHeader>
            <CardTitle className="text-xl">{roundName}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {roundFixtures.map(fixture => (
              <div
                key={fixture.id}
                className="border rounded-lg p-4 hover:bg-accent/50 cursor-pointer transition-colors"
                onClick={() => onMatchClick?.(fixture.id)}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>{format(new Date(fixture.kickoff), "EEE, MMM d, yyyy")}</span>
                    <Clock className="h-4 w-4 ml-2" />
                    <span>{format(new Date(fixture.kickoff), "HH:mm")}</span>
                  </div>
                  <Badge variant={statusColors[fixture.status] as any}>
                    {fixture.status}
                  </Badge>
                </div>

                <div className="grid grid-cols-[1fr,auto,1fr] items-center gap-4">
                  {/* Home Team */}
                  <div className="text-right">
                    <div className="font-semibold text-lg">{fixture.homeTeam.name}</div>
                  </div>

                  {/* Score or VS */}
                  <div className="text-center min-w-[80px]">
                    {fixture.status === "COMPLETED" && fixture.homeScore !== null && fixture.awayScore !== null ? (
                      <div className="text-2xl font-bold">
                        {fixture.homeScore} - {fixture.awayScore}
                      </div>
                    ) : (
                      <div className="text-xl font-semibold text-muted-foreground">vs</div>
                    )}
                  </div>

                  {/* Away Team */}
                  <div className="text-left">
                    <div className="font-semibold text-lg">{fixture.awayTeam.name}</div>
                  </div>
                </div>

                {/* Venue */}
                <div className="flex items-center gap-2 mt-3 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>{fixture.venue}</span>
                  {fixture.groupName && (
                    <>
                      <span className="mx-2">•</span>
                      <span>{fixture.groupName}</span>
                    </>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      ))}

      {filteredFixtures.length === 0 && (
        <Card>
          <CardContent className="p-6">
            <p className="text-center text-muted-foreground">
              No fixtures match the selected filters
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
