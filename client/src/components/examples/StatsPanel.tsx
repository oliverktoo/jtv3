import StatsPanel from "../StatsPanel";
import { Trophy, Calendar, Users, Target } from "lucide-react";

export default function StatsPanelExample() {
  const stats = [
    { label: "Active Tournaments", value: "12", icon: Trophy, color: "bg-chart-1/10" },
    { label: "Upcoming Fixtures", value: "48", icon: Calendar, color: "bg-chart-2/10" },
    { label: "Registered Teams", value: "156", icon: Users, color: "bg-chart-3/10" },
    { label: "Matches Played", value: "234", icon: Target, color: "bg-chart-4/10" },
  ];

  return (
    <div className="p-8 bg-background">
      <StatsPanel stats={stats} />
    </div>
  );
}
