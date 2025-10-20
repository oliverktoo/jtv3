import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface StandingEntry {
  position: number;
  team: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  form?: string[];
  zone?: "promotion" | "relegation" | null;
}

interface StandingsTableProps {
  standings: StandingEntry[];
  showForm?: boolean;
}

const formColors: Record<string, string> = {
  W: "bg-chart-2 text-white",
  D: "bg-chart-4 text-white",
  L: "bg-destructive text-white",
};

export default function StandingsTable({
  standings,
  showForm = false,
}: StandingsTableProps) {
  return (
    <div className="rounded-lg border overflow-hidden">
      <Table>
        <TableHeader className="bg-muted/50">
          <TableRow>
            <TableHead className="w-12 text-center font-semibold">Pos</TableHead>
            <TableHead className="font-semibold">Team</TableHead>
            <TableHead className="w-16 text-center font-semibold">MP</TableHead>
            <TableHead className="w-16 text-center font-semibold">W</TableHead>
            <TableHead className="w-16 text-center font-semibold">D</TableHead>
            <TableHead className="w-16 text-center font-semibold">L</TableHead>
            <TableHead className="w-16 text-center font-semibold">GF</TableHead>
            <TableHead className="w-16 text-center font-semibold">GA</TableHead>
            <TableHead className="w-16 text-center font-semibold">GD</TableHead>
            <TableHead className="w-20 text-center font-semibold">Pts</TableHead>
            {showForm && (
              <TableHead className="w-32 text-center font-semibold">Form</TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {standings.map((entry, index) => (
            <TableRow
              key={index}
              className={
                entry.zone === "promotion"
                  ? "bg-chart-2/5"
                  : entry.zone === "relegation"
                  ? "bg-destructive/5"
                  : ""
              }
              data-testid={`row-standing-${index}`}
            >
              <TableCell className="text-center font-bold">
                {entry.position}
              </TableCell>
              <TableCell className="font-semibold" data-testid={`text-team-${index}`}>
                {entry.team}
              </TableCell>
              <TableCell className="text-center font-mono">{entry.played}</TableCell>
              <TableCell className="text-center font-mono">{entry.won}</TableCell>
              <TableCell className="text-center font-mono">{entry.drawn}</TableCell>
              <TableCell className="text-center font-mono">{entry.lost}</TableCell>
              <TableCell className="text-center font-mono">{entry.goalsFor}</TableCell>
              <TableCell className="text-center font-mono">{entry.goalsAgainst}</TableCell>
              <TableCell className="text-center font-mono">
                {entry.goalDifference > 0 ? "+" : ""}
                {entry.goalDifference}
              </TableCell>
              <TableCell className="text-center font-bold font-mono text-lg">
                {entry.points}
              </TableCell>
              {showForm && entry.form && (
                <TableCell>
                  <div className="flex gap-1 justify-center">
                    {entry.form.map((result, i) => (
                      <Badge
                        key={i}
                        className={`w-6 h-6 rounded-sm flex items-center justify-center p-0 text-xs ${
                          formColors[result] || "bg-muted"
                        }`}
                      >
                        {result}
                      </Badge>
                    ))}
                  </div>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
