import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { MapPin, Clock } from "lucide-react";

export type MatchStatus = "SCHEDULED" | "LIVE" | "COMPLETED" | "POSTPONED" | "CANCELLED";

interface FixtureCardProps {
  id: string;
  homeTeam: string;
  awayTeam: string;
  homeScore?: number;
  awayScore?: number;
  kickoff: string;
  venue?: string;
  status: MatchStatus;
  round?: string;
  stage?: string;
  onClick?: () => void;
}

const statusColors: Record<MatchStatus, string> = {
  SCHEDULED: "bg-muted text-muted-foreground",
  LIVE: "bg-chart-2/10 text-chart-2 border-chart-2/20",
  COMPLETED: "bg-chart-3/10 text-chart-3 border-chart-3/20",
  POSTPONED: "bg-chart-4/10 text-chart-4 border-chart-4/20",
  CANCELLED: "bg-destructive/10 text-destructive border-destructive/20",
};

export default function FixtureCard({
  id,
  homeTeam,
  awayTeam,
  homeScore,
  awayScore,
  kickoff,
  venue,
  status,
  round,
  stage,
  onClick,
}: FixtureCardProps) {
  const kickoffDate = new Date(kickoff);
  const isCompleted = status === "COMPLETED";

  return (
    <Card
      className="p-6 hover-elevate cursor-pointer"
      onClick={onClick}
      data-testid={`card-fixture-${id}`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {round && (
            <span className="text-sm text-muted-foreground font-medium">
              {round}
            </span>
          )}
          {stage && (
            <Badge variant="outline" className="text-xs">
              {stage}
            </Badge>
          )}
        </div>
        <Badge variant="outline" className={statusColors[status]}>
          {status}
        </Badge>
      </div>

      <div className="grid grid-cols-[1fr_auto_1fr] gap-4 items-center mb-4">
        <div className="text-right">
          <p className="font-semibold text-lg" data-testid={`text-home-team-${id}`}>
            {homeTeam}
          </p>
        </div>

        <div className="flex items-center justify-center min-w-[80px]">
          {isCompleted && homeScore !== undefined && awayScore !== undefined ? (
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold font-mono" data-testid={`text-home-score-${id}`}>
                {homeScore}
              </span>
              <span className="text-2xl font-bold text-muted-foreground">-</span>
              <span className="text-2xl font-bold font-mono" data-testid={`text-away-score-${id}`}>
                {awayScore}
              </span>
            </div>
          ) : (
            <div className="text-center">
              <p className="text-sm text-muted-foreground">VS</p>
            </div>
          )}
        </div>

        <div className="text-left">
          <p className="font-semibold text-lg" data-testid={`text-away-team-${id}`}>
            {awayTeam}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-1">
          <Clock className="h-4 w-4" />
          <span className="font-mono">
            {format(kickoffDate, "EEE, MMM d")} • {format(kickoffDate, "HH:mm")}
          </span>
        </div>
        {venue && (
          <>
            <span>•</span>
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              <span>{venue}</span>
            </div>
          </>
        )}
      </div>
    </Card>
  );
}
