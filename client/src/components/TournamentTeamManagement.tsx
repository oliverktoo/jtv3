import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "./ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { 
  MapPin, 
  Users, 
  Mail, 
  Phone, 
  Trash2, 
  Edit, 
  Calendar,
  Shield,
  Plus,
  Search,
  Filter
} from "lucide-react";
import { 
  useTournamentTeams, 
  useUnregisterTeamFromTournament,
  useUpdateTeamTournamentRegistration 
} from "../hooks/useTournamentTeams";
import { TournamentTeamSearch } from "./TournamentTeamSearch";
import { QuickTeamAddition } from "./QuickTeamAddition";
import { BulkTeamRegistration } from "./BulkTeamRegistration";
import { toast } from "../hooks/use-toast";

interface TournamentTeamManagementProps {
  tournament: {
    id: string;
    name: string;
    tournament_model: string;
    county_id?: string;
    sub_county_id?: string;
    ward_id?: string;
  };
}

export function TournamentTeamManagement({ tournament }: TournamentTeamManagementProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  
  const { data: registeredTeams = [], isLoading, refetch } = useTournamentTeams(tournament.id);
  const { mutate: unregisterTeam } = useUnregisterTeamFromTournament();
  const { mutate: updateRegistration } = useUpdateTeamTournamentRegistration();

  // Filter teams based on search and status
  const filteredTeams = registeredTeams.filter((registration: any) => {
    const team = registration.teams;
    const matchesSearch = team?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         team?.club_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         "";
    
    const matchesStatus = statusFilter === "all" || 
                         registration.registration_status.toLowerCase() === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleRemoveTeam = (registrationId: string, teamName: string) => {
    if (!confirm(`Are you sure you want to remove ${teamName} from this tournament?`)) {
      return;
    }

    unregisterTeam(
      { registrationId, tournamentId: tournament.id },
      {
        onSuccess: () => {
          toast({
            title: "Team Removed",
            description: `${teamName} has been removed from the tournament`,
          });
        },
        onError: (error: any) => {
          toast({
            title: "Error",
            description: error.message || "Failed to remove team",
            variant: "destructive",
          });
        },
      }
    );
  };

  const handleStatusUpdate = (registrationId: string, newStatus: string, teamName: string) => {
    updateRegistration(
      {
        registrationId,
        tournamentId: tournament.id,
        data: { registrationStatus: newStatus as any },
      },
      {
        onSuccess: () => {
          toast({
            title: "Status Updated",
            description: `${teamName} registration status updated to ${newStatus}`,
          });
        },
        onError: (error: any) => {
          toast({
            title: "Error", 
            description: error.message || "Failed to update status",
            variant: "destructive",
          });
        },
      }
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "APPROVED": return "bg-green-100 text-green-800";
      case "PENDING": return "bg-yellow-100 text-yellow-800";
      case "REJECTED": return "bg-red-100 text-red-800";
      case "DRAFT": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading tournament teams...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2" />
                Tournament Teams
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Manage team registrations for {tournament.name}
              </p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <QuickTeamAddition
                tournamentId={tournament.id}
                tournamentName={tournament.name}
                onTeamAdded={refetch}
              />
              <BulkTeamRegistration
                tournamentId={tournament.id}
                tournamentName={tournament.name}
                onTeamsRegistered={refetch}
              />
              <TournamentTeamSearch
                tournamentId={tournament.id}
                tournamentName={tournament.name}
                onTeamRegistered={refetch}
              />
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="search">Search Teams</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search by team name or club..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="sm:w-48">
              <Label htmlFor="status">Registration Status</Label>
              <select
                id="status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="draft">Draft</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Teams Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Registered Teams ({filteredTeams.length})</CardTitle>
            <Badge variant="secondary">
              {registeredTeams.filter((r: any) => r.registration_status === "APPROVED").length} Approved
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {filteredTeams.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No teams found</h3>
              <p className="text-gray-500 mb-4">
                {searchTerm || statusFilter !== "all" 
                  ? "No teams match your current filters." 
                  : "No teams have registered for this tournament yet."
                }
              </p>
              {(!searchTerm && statusFilter === "all") && (
                <TournamentTeamSearch
                  tournamentId={tournament.id}
                  tournamentName={tournament.name}
                  onTeamRegistered={refetch}
                />
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Team</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Registration Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTeams.map((registration: any) => {
                  const team = registration.teams;
                  return (
                    <TableRow key={registration.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{team.name}</div>
                          {team.club_name && (
                            <div className="text-sm text-muted-foreground">
                              {team.club_name}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <MapPin className="h-3 w-3 mr-1" />
                          <div>
                            {team.wards?.name && <div>{team.wards.name}</div>}
                            {team.sub_counties?.name && <div>{team.sub_counties.name}</div>}
                            {team.counties?.name && <div>{team.counties.name}</div>}
                          </div>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="space-y-1">
                          {team.contact_email && (
                            <div className="flex items-center text-xs text-muted-foreground">
                              <Mail className="h-3 w-3 mr-1" />
                              {team.contact_email}
                            </div>
                          )}
                          {team.contact_phone && (
                            <div className="flex items-center text-xs text-muted-foreground">
                              <Phone className="h-3 w-3 mr-1" />
                              {team.contact_phone}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <Badge className={getStatusColor(registration.registration_status)}>
                          {registration.registration_status}
                        </Badge>
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Calendar className="h-3 w-3 mr-1" />
                          {new Date(registration.registration_date).toLocaleDateString()}
                        </div>
                      </TableCell>
                      
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end space-x-2">
                          {registration.registration_status === "PENDING" && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleStatusUpdate(registration.id, "APPROVED", team.name)}
                              >
                                <Shield className="h-3 w-3 mr-1" />
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleStatusUpdate(registration.id, "REJECTED", team.name)}
                              >
                                Reject
                              </Button>
                            </>
                          )}
                          
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRemoveTeam(registration.id, team.name)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">
              {registeredTeams.length}
            </div>
            <p className="text-xs text-muted-foreground">Total Registered</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">
              {registeredTeams.filter((r: any) => r.registration_status === "APPROVED").length}
            </div>
            <p className="text-xs text-muted-foreground">Approved Teams</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-yellow-600">
              {registeredTeams.filter((r: any) => r.registration_status === "PENDING").length}
            </div>
            <p className="text-xs text-muted-foreground">Pending Review</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-600">
              {registeredTeams.filter((r: any) => r.registration_status === "REJECTED").length}
            </div>
            <p className="text-xs text-muted-foreground">Rejected</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}