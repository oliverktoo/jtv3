import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { useOrganizations } from "@/hooks/useReferenceData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Users, Search } from "lucide-react";

interface Team {
  id: string;
  tournamentId: string;
  name: string;
  createdAt: string;
}

interface Tournament {
  id: string;
  name: string;
  orgId: string;
}

export default function Teams() {
  const { data: organizations = [] } = useOrganizations();
  const [selectedOrg, setSelectedOrg] = useState<string>("");
  const [selectedTournament, setSelectedTournament] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: tournaments = [] } = useQuery<Tournament[]>({
    queryKey: [`/api/tournaments?orgId=${selectedOrg}`],
    enabled: !!selectedOrg,
  });

  const { data: teams = [], isLoading } = useQuery<Team[]>({
    queryKey: [`/api/tournaments/${selectedTournament}/teams`],
    enabled: !!selectedTournament,
  });

  const filteredTeams = teams.filter((team) =>
    team.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Teams</h1>
        <p className="text-muted-foreground mt-1">
          Manage tournament teams and rosters
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>Organization</Label>
          <Select value={selectedOrg} onValueChange={setSelectedOrg}>
            <SelectTrigger data-testid="select-organization">
              <SelectValue placeholder="Select organization" />
            </SelectTrigger>
            <SelectContent>
              {organizations.map((org) => (
                <SelectItem key={org.id} value={org.id}>
                  {org.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Tournament</Label>
          <Select
            value={selectedTournament}
            onValueChange={setSelectedTournament}
            disabled={!selectedOrg}
          >
            <SelectTrigger data-testid="select-tournament">
              <SelectValue placeholder="Select tournament" />
            </SelectTrigger>
            <SelectContent>
              {tournaments.map((tournament) => (
                <SelectItem key={tournament.id} value={tournament.id}>
                  {tournament.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search teams by name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
          data-testid="input-search-teams"
        />
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading teams...</p>
        </div>
      ) : !selectedTournament ? (
        <div className="text-center py-12 border-2 border-dashed rounded-lg">
          <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Select a tournament to view teams</p>
        </div>
      ) : filteredTeams.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed rounded-lg">
          <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground mb-4">No teams found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTeams.map((team) => (
            <Card key={team.id} className="hover-elevate">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-base font-semibold">{team.name}</CardTitle>
                <Badge variant="outline" data-testid={`badge-team-${team.id}`}>
                  Team
                </Badge>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Link href={`/teams/${team.id}/roster`}>
                    <Button className="w-full" variant="outline" data-testid={`button-view-roster-${team.id}`}>
                      <Users className="w-4 h-4 mr-2" />
                      View Roster
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
