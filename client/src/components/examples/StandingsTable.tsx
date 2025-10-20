import StandingsTable from "../StandingsTable";

export default function StandingsTableExample() {
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
      position: 14,
      team: "Wazito FC",
      played: 10,
      won: 1,
      drawn: 2,
      lost: 7,
      goalsFor: 6,
      goalsAgainst: 20,
      goalDifference: -14,
      points: 5,
      form: ["L", "L", "D", "L", "L"],
      zone: "relegation" as const,
    },
  ];

  return (
    <div className="p-8 bg-background">
      <div className="mb-4">
        <h3 className="text-xl font-semibold mb-2">Division 1 Standings</h3>
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
    </div>
  );
}
