import { Trophy, Calendar, Users, Target } from "lucide-react";
import StatsPanel from "@/components/StatsPanel";
import TournamentCard from "@/components/TournamentCard";
import CreateTournamentDialog from "@/components/CreateTournamentDialog";
import { Button } from "@/components/ui/button";
import { useTournaments } from "@/hooks/useTournaments";
import { useOrganizations } from "@/hooks/useReferenceData";
import { Link, useLocation } from "wouter";

export default function Home() {
  const { data: organizations } = useOrganizations();
  const orgId = organizations?.[0]?.id || "";
  const { data: tournaments, isLoading } = useTournaments(orgId);
  const [, setLocation] = useLocation();

  if (isLoading || !tournaments) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  const activeTournaments = tournaments.filter((t) => t.status === "ACTIVE");
  const recentTournaments = tournaments.slice(0, 3);

  const stats = [
    { label: "Active Tournaments", value: activeTournaments.length.toString(), icon: Trophy, color: "bg-chart-1/10" },
    { label: "Total Tournaments", value: tournaments.length.toString(), icon: Calendar, color: "bg-chart-2/10" },
    { label: "Registered Teams", value: "156", icon: Users, color: "bg-chart-3/10" },
    { label: "Matches Played", value: "234", icon: Target, color: "bg-chart-4/10" },
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
          <Link href="/tournaments">
            <Button variant="outline" data-testid="button-view-all">
              View All
            </Button>
          </Link>
        </div>
        {recentTournaments.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed rounded-lg">
            <p className="text-muted-foreground mb-4">No tournaments yet</p>
            <CreateTournamentDialog trigger={<Button>Create Your First Tournament</Button>} />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentTournaments.map((tournament) => (
              <TournamentCard
                key={tournament.id}
                id={tournament.id}
                name={tournament.name}
                model={tournament.tournamentModel}
                status={tournament.status}
                season={tournament.season}
                startDate={tournament.startDate}
                endDate={tournament.endDate}
                sport="Football"
                onView={() => setLocation(`/tournaments/${tournament.id}`)}
                onEdit={() => console.log("Edit", tournament.id)}
                onDelete={() => console.log("Delete", tournament.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
