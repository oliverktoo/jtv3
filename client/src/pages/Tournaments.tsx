import React, { useState } from "react";
import { useLocation } from "wouter";
import { Trophy, Calendar, Users, Target } from "lucide-react";
import StatsPanel from "@/components/StatsPanel";
import TournamentCard from "@/components/TournamentCard";
import CreateTournamentDialog from "@/components/CreateTournamentDialog";
import EditTournamentDialog from "@/components/EditTournamentDialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTournaments, useDeleteTournament } from "@/hooks/useTournaments";
import { useOrganizations } from "@/hooks/useReferenceData";
import { useToast } from "@/hooks/use-toast";

export default function Tournaments() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [editingTournament, setEditingTournament] = useState<any>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedOrgId, setSelectedOrgId] = useState<string>("");
  
  const { toast } = useToast();
  const deleteTournament = useDeleteTournament();
  const [, setLocation] = useLocation();
  
  const { data: organizations } = useOrganizations();
  
  // Set default organization when organizations load
  const orgId = selectedOrgId || organizations?.[0]?.id || "";
  
  // Update selected org when organizations load
  React.useEffect(() => {
    if (organizations && organizations.length > 0 && !selectedOrgId) {
      setSelectedOrgId(organizations[0].id);
    }
  }, [organizations, selectedOrgId]);
  
  const { data: tournaments = [], isLoading } = useTournaments(orgId);

  // Fetch stats for all tournaments
  const { data: orgStats } = useQuery<any>({
    queryKey: ["/api/organizations", orgId, "stats"],
    queryFn: async () => {
      const response = await fetch(`/api/organizations/${orgId}/stats`);
      if (!response.ok) return { totalTeams: 0, completedMatches: 0 };
      return response.json();
    },
    enabled: !!orgId,
  });

  // Calculate tournament statistics
  const activeTournaments = tournaments.filter((t) => t.status === "ACTIVE");
  const completedTournaments = tournaments.filter((t) => t.status === "COMPLETED");
  
  const stats = [
    { label: "Active Tournaments", value: activeTournaments.length.toString(), icon: Trophy, color: "bg-chart-1/10" },
    { label: "Total Tournaments", value: tournaments.length.toString(), icon: Calendar, color: "bg-chart-2/10" },
    { label: "Registered Teams", value: (orgStats?.totalTeams || 0).toString(), icon: Users, color: "bg-chart-3/10" },
    { label: "Matches Played", value: (orgStats?.completedMatches || 0).toString(), icon: Target, color: "bg-chart-4/10" },
  ];

  // Filter tournaments based on search and status
  const filteredTournaments = tournaments.filter((tournament) => {
    const matchesSearch = tournament.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || tournament.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleView = (tournamentId: string) => {
    console.log("Navigating to tournament:", tournamentId);
    // Navigate to tournament detail page
    setLocation(`/tournaments/${tournamentId}`);
  };

  const handleEdit = (tournament: any) => {
    setEditingTournament(tournament);
    setShowEditDialog(true);
  };

  const handleDelete = async (tournamentId: string, tournamentName: string) => {
    if (window.confirm(`Are you sure you want to delete "${tournamentName}"? This action cannot be undone.`)) {
      try {
        await deleteTournament.mutateAsync({ id: tournamentId, orgId });
        toast({
          title: "Tournament deleted",
          description: `"${tournamentName}" has been successfully deleted.`,
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete tournament. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Loading tournaments...</p>
      </div>
    );
  }

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

      <StatsPanel stats={stats} />

      <div className="flex gap-4 flex-wrap">
        <Select value={selectedOrgId} onValueChange={setSelectedOrgId}>
          <SelectTrigger className="w-[220px]">
            <SelectValue placeholder="Select Organization" />
          </SelectTrigger>
          <SelectContent>
            {organizations?.map((org) => (
              <SelectItem key={org.id} value={org.id}>
                {org.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="relative flex-1 min-w-[300px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tournaments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
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
        <div className="text-center py-12 border-2 border-dashed rounded-lg">
          <p className="text-muted-foreground mb-4">
            {tournaments.length === 0 ? "No tournaments yet" : "No tournaments match your search criteria"}
          </p>
          {tournaments.length === 0 && (
            <CreateTournamentDialog trigger={<Button>Create Your First Tournament</Button>} />
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTournaments.map((tournament) => (
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
              location={(() => {
                // Build location string based on available geographic data
                const locations = [];
                if (tournament.wardName) locations.push(`${tournament.wardName} Ward`);
                if (tournament.subCountyName) locations.push(tournament.subCountyName);
                if (tournament.countyName) locations.push(`${tournament.countyName} County`);
                return locations.join(', ') || undefined;
              })()}
              onView={() => handleView(tournament.id)}
              onEdit={() => handleEdit(tournament)}
              onDelete={() => handleDelete(tournament.id, tournament.name)}
            />
          ))}
        </div>
      )}
      
      {editingTournament && (
        <EditTournamentDialog
          tournament={editingTournament}
          open={showEditDialog}
          onOpenChange={setShowEditDialog}
        />
      )}
    </div>
  );
}