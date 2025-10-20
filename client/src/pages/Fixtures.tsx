import { useState } from "react";
import FixtureCard from "@/components/FixtureCard";
import { Button } from "@/components/ui/button";
import { Download, Filter } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

export default function Fixtures() {
  const [roundFilter, setRoundFilter] = useState("all");

  const fixtures = [
    {
      id: "1",
      homeTeam: "Tusker FC",
      awayTeam: "Gor Mahia",
      homeScore: 2,
      awayScore: 1,
      kickoff: "2025-10-11T13:00:00",
      venue: "Kasarani Stadium",
      status: "COMPLETED" as const,
      round: "Round 5",
      stage: "League",
    },
    {
      id: "2",
      homeTeam: "AFC Leopards",
      awayTeam: "Sofapaka",
      kickoff: "2025-10-18T13:00:00",
      venue: "Nyayo Stadium",
      status: "SCHEDULED" as const,
      round: "Round 6",
      stage: "League",
    },
    {
      id: "3",
      homeTeam: "Ulinzi Stars",
      awayTeam: "KCB FC",
      homeScore: 1,
      awayScore: 1,
      kickoff: "2025-10-12T13:00:00",
      venue: "Afraha Stadium",
      status: "COMPLETED" as const,
      round: "Round 5",
      stage: "League",
    },
    {
      id: "4",
      homeTeam: "Bandari FC",
      awayTeam: "Kakamega Homeboyz",
      kickoff: "2025-10-19T15:00:00",
      venue: "Mbaraki Stadium",
      status: "SCHEDULED" as const,
      round: "Round 6",
      stage: "League",
    },
    {
      id: "5",
      homeTeam: "Posta Rangers",
      awayTeam: "Nzoia Sugar",
      kickoff: "2025-10-20T13:00:00",
      venue: "Thika Stadium",
      status: "SCHEDULED" as const,
      round: "Round 6",
      stage: "League",
    },
  ];

  const filteredFixtures = fixtures.filter((fixture) => {
    if (roundFilter === "all") return true;
    return fixture.round === roundFilter;
  });

  const rounds = Array.from(new Set(fixtures.map((f) => f.round)));

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

      <div className="flex gap-4 items-center">
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

        <div className="flex gap-2">
          <Badge variant="outline" className="bg-chart-2/10 text-chart-2 border-chart-2/20">
            {fixtures.filter((f) => f.status === "COMPLETED").length} Completed
          </Badge>
          <Badge variant="outline" className="bg-muted text-muted-foreground">
            {fixtures.filter((f) => f.status === "SCHEDULED").length} Scheduled
          </Badge>
        </div>
      </div>

      <div className="space-y-4">
        {filteredFixtures.map((fixture) => (
          <FixtureCard
            key={fixture.id}
            {...fixture}
            onClick={() => console.log("View fixture", fixture.id)}
          />
        ))}
      </div>

      {filteredFixtures.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No fixtures found</p>
        </div>
      )}
    </div>
  );
}
