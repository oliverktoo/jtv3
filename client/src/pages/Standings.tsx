import StandingsTable from "@/components/StandingsTable";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function Standings() {
  const standings = [
    {
      position: 1,
      team: "Tusker FC",
      played: 10,
      won: 7,
      drawn: 2,
      lost: 1,
      goalsFor: 21,
      goalsAgainst: 8,
      goalDifference: 13,
      points: 23,
      form: ["W", "W", "D", "W", "W"],
      zone: "promotion" as const,
    },
    {
      position: 2,
      team: "Gor Mahia",
      played: 10,
      won: 7,
      drawn: 1,
      lost: 2,
      goalsFor: 19,
      goalsAgainst: 10,
      goalDifference: 9,
      points: 22,
      form: ["W", "L", "W", "W", "D"],
      zone: "promotion" as const,
    },
    {
      position: 3,
      team: "AFC Leopards",
      played: 10,
      won: 6,
      drawn: 2,
      lost: 2,
      goalsFor: 17,
      goalsAgainst: 11,
      goalDifference: 6,
      points: 20,
      form: ["W", "D", "W", "L", "W"],
    },
    {
      position: 4,
      team: "KCB FC",
      played: 10,
      won: 5,
      drawn: 3,
      lost: 2,
      goalsFor: 15,
      goalsAgainst: 10,
      goalDifference: 5,
      points: 18,
      form: ["D", "W", "W", "D", "L"],
    },
    {
      position: 5,
      team: "Ulinzi Stars",
      played: 10,
      won: 4,
      drawn: 4,
      lost: 2,
      goalsFor: 14,
      goalsAgainst: 11,
      goalDifference: 3,
      points: 16,
      form: ["D", "W", "D", "W", "D"],
    },
    {
      position: 6,
      team: "Bandari FC",
      played: 10,
      won: 4,
      drawn: 3,
      lost: 3,
      goalsFor: 13,
      goalsAgainst: 12,
      goalDifference: 1,
      points: 15,
      form: ["W", "L", "D", "W", "D"],
    },
    {
      position: 7,
      team: "Kakamega Homeboyz",
      played: 10,
      won: 4,
      drawn: 2,
      lost: 4,
      goalsFor: 12,
      goalsAgainst: 13,
      goalDifference: -1,
      points: 14,
      form: ["L", "W", "L", "D", "W"],
    },
    {
      position: 8,
      team: "Sofapaka",
      played: 10,
      won: 3,
      drawn: 4,
      lost: 3,
      goalsFor: 11,
      goalsAgainst: 12,
      goalDifference: -1,
      points: 13,
      form: ["D", "L", "D", "W", "D"],
    },
    {
      position: 9,
      team: "Posta Rangers",
      played: 10,
      won: 3,
      drawn: 3,
      lost: 4,
      goalsFor: 10,
      goalsAgainst: 13,
      goalDifference: -3,
      points: 12,
      form: ["L", "D", "W", "L", "D"],
    },
    {
      position: 10,
      team: "Nzoia Sugar",
      played: 10,
      won: 2,
      drawn: 4,
      lost: 4,
      goalsFor: 9,
      goalsAgainst: 14,
      goalDifference: -5,
      points: 10,
      form: ["D", "L", "L", "D", "W"],
    },
    {
      position: 11,
      team: "Kariobangi Sharks",
      played: 10,
      won: 2,
      drawn: 3,
      lost: 5,
      goalsFor: 8,
      goalsAgainst: 15,
      goalDifference: -7,
      points: 9,
      form: ["L", "D", "L", "W", "L"],
    },
    {
      position: 12,
      team: "Mathare United",
      played: 10,
      won: 2,
      drawn: 2,
      lost: 6,
      goalsFor: 7,
      goalsAgainst: 16,
      goalDifference: -9,
      points: 8,
      form: ["L", "L", "D", "L", "W"],
    },
    {
      position: 13,
      team: "Vihiga Bullets",
      played: 10,
      won: 1,
      drawn: 3,
      lost: 6,
      goalsFor: 6,
      goalsAgainst: 18,
      goalDifference: -12,
      points: 6,
      form: ["L", "D", "L", "L", "D"],
      zone: "relegation" as const,
    },
    {
      position: 14,
      team: "Wazito FC",
      played: 10,
      won: 1,
      drawn: 2,
      lost: 7,
      goalsFor: 5,
      goalsAgainst: 19,
      goalDifference: -14,
      points: 5,
      form: ["L", "L", "D", "L", "L"],
      zone: "relegation" as const,
    },
  ];

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

      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Division 1 - 2025/26 Season</h2>
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
    </div>
  );
}
