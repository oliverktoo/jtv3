import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Users, Trophy, MoreVertical } from "lucide-react";
import { format } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export type TournamentModel =
  | "ADMINISTRATIVE_WARD"
  | "ADMINISTRATIVE_SUB_COUNTY"
  | "ADMINISTRATIVE_COUNTY"
  | "ADMINISTRATIVE_NATIONAL"
  | "INTER_COUNTY"
  | "INDEPENDENT"
  | "LEAGUE";

export type TournamentStatus =
  | "DRAFT"
  | "REGISTRATION"
  | "ACTIVE"
  | "COMPLETED"
  | "ARCHIVED";

interface TournamentCardProps {
  id: string;
  name: string;
  model: TournamentModel;
  status: TournamentStatus;
  season: string;
  startDate: string;
  endDate: string;
  teamCount?: number;
  location?: string;
  sport: string;
  onView?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

const modelLabels: Record<TournamentModel, string> = {
  ADMINISTRATIVE_WARD: "Ward",
  ADMINISTRATIVE_SUB_COUNTY: "Sub-County",
  ADMINISTRATIVE_COUNTY: "County",
  ADMINISTRATIVE_NATIONAL: "National",
  INTER_COUNTY: "Inter-County",
  INDEPENDENT: "Independent",
  LEAGUE: "League",
};

const statusColors: Record<TournamentStatus, string> = {
  DRAFT: "bg-muted text-muted-foreground",
  REGISTRATION: "bg-chart-4/10 text-chart-4 border-chart-4/20",
  ACTIVE: "bg-chart-2/10 text-chart-2 border-chart-2/20",
  COMPLETED: "bg-chart-3/10 text-chart-3 border-chart-3/20",
  ARCHIVED: "bg-muted text-muted-foreground",
};

export default function TournamentCard({
  id,
  name,
  model,
  status,
  season,
  startDate,
  endDate,
  teamCount = 0,
  location,
  sport,
  onView,
  onEdit,
  onDelete,
}: TournamentCardProps) {
  return (
    <Card
      className="hover-elevate p-6"
      data-testid={`card-tournament-${id}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <Badge variant="outline" className="font-mono text-xs">
              {modelLabels[model]}
            </Badge>
            <Badge className={statusColors[status]} variant="outline">
              {status}
            </Badge>
          </div>
          <h3 className="text-xl font-semibold mb-1 truncate" data-testid={`text-tournament-name-${id}`}>
            {name}
          </h3>
          <p className="text-sm text-muted-foreground mb-4">{season}</p>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Trophy className="h-4 w-4 text-muted-foreground" />
              <span className="text-foreground">{sport}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-foreground font-mono">
                {format(new Date(startDate), "MMM d, yyyy")} -{" "}
                {format(new Date(endDate), "MMM d, yyyy")}
              </span>
            </div>
            {location && (
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="text-foreground">{location}</span>
              </div>
            )}
            {teamCount > 0 && (
              <div className="flex items-center gap-2 text-sm">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-foreground">{teamCount} Teams</span>
              </div>
            )}
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              size="icon"
              variant="ghost"
              data-testid={`button-menu-${id}`}
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onView} data-testid={`button-view-${id}`}>
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onEdit} data-testid={`button-edit-${id}`}>
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={onDelete}
              className="text-destructive"
              data-testid={`button-delete-${id}`}
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </Card>
  );
}
