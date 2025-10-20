import { useState } from "react";
import TournamentCard from "@/components/TournamentCard";
import CreateTournamentDialog from "@/components/CreateTournamentDialog";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Tournaments() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const tournaments = [
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
    {
      id: "4",
      name: "Inter-County Basketball Derby",
      model: "INTER_COUNTY" as const,
      status: "ACTIVE" as const,
      season: "2025",
      startDate: "2025-10-01",
      endDate: "2025-12-20",
      teamCount: 8,
      location: "Multiple Counties",
      sport: "Basketball",
    },
    {
      id: "5",
      name: "National Schools Championship",
      model: "ADMINISTRATIVE_NATIONAL" as const,
      status: "COMPLETED" as const,
      season: "2024/25",
      startDate: "2024-09-01",
      endDate: "2025-06-30",
      teamCount: 32,
      location: "National",
      sport: "Rugby",
    },
  ];

  const filteredTournaments = tournaments.filter((tournament) => {
    const matchesSearch = tournament.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || tournament.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Tournaments</h1>
          <p className="text-muted-foreground mt-1">
            Manage all your tournaments in one place
          </p>
        </div>
        <CreateTournamentDialog />
      </div>

      <div className="flex gap-4 flex-wrap">
        <div className="relative flex-1 min-w-[300px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tournaments..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
            data-testid="input-search-tournaments"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]" data-testid="select-filter-status">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="DRAFT">Draft</SelectItem>
            <SelectItem value="REGISTRATION">Registration</SelectItem>
            <SelectItem value="ACTIVE">Active</SelectItem>
            <SelectItem value="COMPLETED">Completed</SelectItem>
            <SelectItem value="ARCHIVED">Archived</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filteredTournaments.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No tournaments found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTournaments.map((tournament) => (
            <TournamentCard
              key={tournament.id}
              {...tournament}
              onView={() => console.log("View", tournament.id)}
              onEdit={() => console.log("Edit", tournament.id)}
              onDelete={() => console.log("Delete", tournament.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
