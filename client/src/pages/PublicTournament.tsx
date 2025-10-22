import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, MapPin, Trophy, Users } from "lucide-react";
import { format } from "date-fns";
import type { Tournament, Team } from "@shared/schema";

interface TeamStanding {
  teamId: string;
  teamName: string;
  position: number;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  form?: string[];
}

const statusColors: Record<string, string> = {
  DRAFT: "bg-muted text-muted-foreground",
  REGISTRATION: "bg-chart-4/10 text-chart-4 border-chart-4/20",
  ACTIVE: "bg-chart-2/10 text-chart-2 border-chart-2/20",
  COMPLETED: "bg-chart-3/10 text-chart-3 border-chart-3/20",
  ARCHIVED: "bg-muted text-muted-foreground",
};

const modelLabels: Record<string, string> = {
  ADMINISTRATIVE_WARD: "Ward Level",
  ADMINISTRATIVE_SUB_COUNTY: "Sub-County Level",
  ADMINISTRATIVE_COUNTY: "County Level",
  ADMINISTRATIVE_NATIONAL: "National Level",
  INTER_COUNTY: "Inter-County",
  INDEPENDENT: "Independent Tournament",
  LEAGUE: "League",
};

export default function PublicTournament() {
  const { slug } = useParams();

  const { data: tournament, isLoading: isTournamentLoading } = useQuery<Tournament>({
    queryKey: [`/api/tournaments/slug/${slug}`],
    enabled: !!slug,
  });

  const { data: teams = [], isLoading: isTeamsLoading } = useQuery<Team[]>({
    queryKey: [`/api/tournaments/${tournament?.id}/teams`],
    enabled: !!tournament?.id,
  });

  const { data: matches = [], isLoading: isMatchesLoading } = useQuery<any[]>({
    queryKey: [`/api/tournaments/${tournament?.id}/matches`],
    enabled: !!tournament?.id,
  });

  const { data: standings = [], isLoading: isStandingsLoading } = useQuery<TeamStanding[]>({
    queryKey: [`/api/tournaments/${tournament?.id}/standings`],
    enabled: !!tournament?.id,
  });

  if (isTournamentLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading tournament...</p>
        </div>
      </div>
    );
  }

  if (!tournament) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Tournament Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              The tournament you're looking for doesn't exist or has been removed.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="bg-primary text-primary-foreground py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-start gap-4 mb-4">
            <Trophy className="h-12 w-12 flex-shrink-0" data-testid="icon-tournament" />
            <div className="flex-1">
              <h1 className="text-4xl font-bold mb-2" data-testid="text-tournament-name">{tournament.name}</h1>
              <div className="flex flex-wrap gap-2 items-center">
                <Badge variant="secondary" className="text-sm" data-testid="badge-status">
                  {tournament.status}
                </Badge>
                <Badge variant="outline" className="text-sm" data-testid="badge-model">
                  {modelLabels[tournament.tournamentModel] || tournament.tournamentModel}
                </Badge>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-6 mt-6 text-sm">
            {tournament.startDate && (
              <div className="flex items-center gap-2" data-testid="info-start-date">
                <Calendar className="h-4 w-4" />
                <span>
                  {format(new Date(tournament.startDate), "MMM d, yyyy")}
                  {tournament.endDate && ` - ${format(new Date(tournament.endDate), "MMM d, yyyy")}`}
                </span>
              </div>
            )}
            <div className="flex items-center gap-2" data-testid="info-teams-count">
              <Users className="h-4 w-4" />
              <span>{teams.length} Teams</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="fixtures" className="w-full">
          <TabsList className="grid w-full grid-cols-3 max-w-md" data-testid="tabs-tournament">
            <TabsTrigger value="fixtures" data-testid="tab-fixtures">Fixtures</TabsTrigger>
            <TabsTrigger value="standings" data-testid="tab-standings">Standings</TabsTrigger>
            <TabsTrigger value="teams" data-testid="tab-teams">Teams</TabsTrigger>
          </TabsList>

          {/* Fixtures Tab */}
          <TabsContent value="fixtures" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Fixtures & Results</CardTitle>
              </CardHeader>
              <CardContent>
                {isMatchesLoading ? (
                  <p className="text-muted-foreground">Loading fixtures...</p>
                ) : matches.length === 0 ? (
                  <p className="text-muted-foreground">No fixtures scheduled yet.</p>
                ) : (
                  <div className="space-y-4">
                    {matches.map((matchData: any) => {
                      const match = matchData.match;
                      const homeTeam = matchData.homeTeam;
                      const awayTeam = matchData.awayTeam;
                      
                      return (
                        <div key={match.id} className="border rounded-lg p-4" data-testid={`match-${match.id}`}>
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex-1">
                              <p className="font-medium" data-testid={`text-home-team-${match.id}`}>
                                {homeTeam?.name || "TBD"}
                              </p>
                            </div>
                            <div className="text-center px-4">
                              {match.homeScore !== null && match.awayScore !== null ? (
                                <p className="text-2xl font-bold" data-testid={`text-score-${match.id}`}>
                                  {match.homeScore} - {match.awayScore}
                                </p>
                              ) : (
                                <p className="text-sm text-muted-foreground" data-testid={`text-kickoff-${match.id}`}>
                                  {format(new Date(match.kickoff), "MMM d, h:mm a")}
                                </p>
                              )}
                            </div>
                            <div className="flex-1 text-right">
                              <p className="font-medium" data-testid={`text-away-team-${match.id}`}>
                                {awayTeam?.name || "TBD"}
                              </p>
                            </div>
                          </div>
                          {match.venue && (
                            <p className="text-sm text-muted-foreground mt-2 flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {match.venue}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Standings Tab */}
          <TabsContent value="standings" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>League Table</CardTitle>
              </CardHeader>
              <CardContent>
                {isStandingsLoading ? (
                  <p className="text-muted-foreground">Loading standings...</p>
                ) : standings.length === 0 ? (
                  <p className="text-muted-foreground">No standings available yet. Matches need to be played first.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full" data-testid="table-standings">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-2">Pos</th>
                          <th className="text-left py-3 px-2">Team</th>
                          <th className="text-center py-3 px-2">P</th>
                          <th className="text-center py-3 px-2">W</th>
                          <th className="text-center py-3 px-2">D</th>
                          <th className="text-center py-3 px-2">L</th>
                          <th className="text-center py-3 px-2">GF</th>
                          <th className="text-center py-3 px-2">GA</th>
                          <th className="text-center py-3 px-2">GD</th>
                          <th className="text-center py-3 px-2 font-bold">Pts</th>
                        </tr>
                      </thead>
                      <tbody>
                        {standings.map((standing: TeamStanding, index: number) => (
                          <tr 
                            key={standing.teamId} 
                            className="border-b hover-elevate" 
                            data-testid={`row-standing-${standing.teamId}`}
                          >
                            <td className="py-3 px-2 font-medium">{index + 1}</td>
                            <td className="py-3 px-2 font-medium">{standing.teamName}</td>
                            <td className="text-center py-3 px-2">{standing.played}</td>
                            <td className="text-center py-3 px-2">{standing.won}</td>
                            <td className="text-center py-3 px-2">{standing.drawn}</td>
                            <td className="text-center py-3 px-2">{standing.lost}</td>
                            <td className="text-center py-3 px-2">{standing.goalsFor}</td>
                            <td className="text-center py-3 px-2">{standing.goalsAgainst}</td>
                            <td className="text-center py-3 px-2">{standing.goalDifference}</td>
                            <td className="text-center py-3 px-2 font-bold">{standing.points}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Teams Tab */}
          <TabsContent value="teams" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Participating Teams</CardTitle>
              </CardHeader>
              <CardContent>
                {isTeamsLoading ? (
                  <p className="text-muted-foreground">Loading teams...</p>
                ) : teams.length === 0 ? (
                  <p className="text-muted-foreground">No teams registered yet.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {teams.map((team: Team) => (
                      <Card key={team.id} data-testid={`card-team-${team.id}`}>
                        <CardHeader>
                          <CardTitle className="text-lg">{team.name}</CardTitle>
                        </CardHeader>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
