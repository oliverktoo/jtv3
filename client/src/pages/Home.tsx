import { Trophy, Calendar, Users, Target } from "lucide-react";
import StatsPanel from "@/components/StatsPanel";
import TournamentCard from "@/components/TournamentCard";
import CreateTournamentDialog from "@/components/CreateTournamentDialog";
import { Button } from "@/components/ui/button";

export default function Home() {
  const stats = [
    { label: "Active Tournaments", value: "12", icon: Trophy, color: "bg-chart-1/10" },
    { label: "Upcoming Fixtures", value: "48", icon: Calendar, color: "bg-chart-2/10" },
    { label: "Registered Teams", value: "156", icon: Users, color: "bg-chart-3/10" },
    { label: "Matches Played", value: "234", icon: Target, color: "bg-chart-4/10" },
  ];

  const recentTournaments = [
    {
      id: "1",
      name: "Nairobi County Football Championship",
      model: "ADMINISTRATIVE_COUNTY" as const,
      status: "ACTIVE" as const,
      season: "2025/26",
      startDate: "2025-10-11",
      endDate: "2026-07-26",
      teamCount: 16,
      location: "Nairobi County",
      sport: "Football",
    },
    {
      id: "2",
      name: "Upper Rift Regional League Zone A",
      model: "LEAGUE" as const,
      status: "REGISTRATION" as const,
      season: "2025",
      startDate: "2025-11-01",
      endDate: "2026-05-30",
      teamCount: 12,
      location: "Rift Valley",
      sport: "Basketball",
    },
    {
      id: "3",
      name: "Westlands Ward Youth Tournament",
      model: "ADMINISTRATIVE_WARD" as const,
      status: "DRAFT" as const,
      season: "2025",
      startDate: "2025-12-01",
      endDate: "2025-12-15",
      sport: "Volleyball",
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Welcome to Jamii Tourney v3 - Your tournament management platform
          </p>
        </div>
        <CreateTournamentDialog />
      </div>

      <StatsPanel stats={stats} />

      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold">Recent Tournaments</h2>
          <Button variant="outline" data-testid="button-view-all">
            View All
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recentTournaments.map((tournament) => (
            <TournamentCard
              key={tournament.id}
              {...tournament}
              onView={() => console.log("View", tournament.id)}
              onEdit={() => console.log("Edit", tournament.id)}
              onDelete={() => console.log("Delete", tournament.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
