import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { 
  useAvailableTeamsForTournament,
  useRegisterTeamForTournament,
  useTeamRegistrations,
  useUpdateTeamRegistration,
  useWithdrawTeamFromTournament
} from "@/hooks/useTeamRegistrations";
import { Users, Trophy, Calendar, AlertTriangle, CheckCircle, Clock, XCircle } from "lucide-react";

interface TeamRegistrationManagerProps {
  tournamentId: string;
  orgId: string;
  canManageRegistrations?: boolean;
}

interface RegisterTeamDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tournamentId: string;
  orgId: string;
}

const RegisterTeamDialog: React.FC<RegisterTeamDialogProps> = ({
  open,
  onOpenChange,
  tournamentId,
  orgId,
}) => {
  const [selectedTeamId, setSelectedTeamId] = useState<string>("");
  const [formData, setFormData] = useState({
    squadSize: 22,
    jerseyColors: "",
    coachName: "",
    notes: "",
  });

  const { toast } = useToast();
  const { data: availableTeams = [], isLoading } = useAvailableTeamsForTournament(tournamentId, orgId);
  const registerTeam = useRegisterTeamForTournament();

  const handleSubmit = async () => {
    if (!selectedTeamId) {
      toast({
        title: "Error",
        description: "Please select a team",
        variant: "destructive",
      });
      return;
    }

    try {
      await registerTeam.mutateAsync({
        teamId: selectedTeamId,
        tournamentId,
        orgId,
        registrationStatus: "SUBMITTED",
        squadSize: formData.squadSize,
        jerseyColors: formData.jerseyColors || null,
        coachName: formData.coachName || null,
        notes: formData.notes || null,
      });

      toast({
        title: "Success",
        description: "Team registered for tournament successfully",
      });

      onOpenChange(false);
      setSelectedTeamId("");
      setFormData({
        squadSize: 22,
        jerseyColors: "",
        coachName: "",
        notes: "",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to register team",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Register Team for Tournament</DialogTitle>
          <DialogDescription>
            Register an existing team for this tournament. Teams can only be registered for one active tournament per organization.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="team">Select Team *</Label>
            <Select value={selectedTeamId} onValueChange={setSelectedTeamId}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a team to register" />
              </SelectTrigger>
              <SelectContent>
                {isLoading ? (
                  <SelectItem value="loading" disabled>Loading teams...</SelectItem>
                ) : availableTeams.length === 0 ? (
                  <SelectItem value="no-teams" disabled>No available teams</SelectItem>
                ) : (
                  availableTeams.map((team: any) => (
                    <SelectItem key={team.id} value={team.id}>
                      {team.name} {team.club_name && `(${team.club_name})`}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            {availableTeams.length === 0 && !isLoading && (
              <p className="text-sm text-muted-foreground">
                All teams in this organization are either already registered for this tournament or for other active tournaments.
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="squadSize">Squad Size</Label>
              <Input
                id="squadSize"
                type="number"
                min="11"
                max="50"
                value={formData.squadSize}
                onChange={(e) =>
                  setFormData({ ...formData, squadSize: Number(e.target.value) })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="coachName">Head Coach</Label>
              <Input
                id="coachName"
                placeholder="Enter coach name"
                value={formData.coachName}
                onChange={(e) =>
                  setFormData({ ...formData, coachName: e.target.value })
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="jerseyColors">Jersey Colors</Label>
            <Input
              id="jerseyColors"
              placeholder="e.g., Home: Blue/White, Away: Red/Black"
              value={formData.jerseyColors}
              onChange={(e) =>
                setFormData({ ...formData, jerseyColors: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Registration Notes</Label>
            <Textarea
              id="notes"
              placeholder="Any additional information about this registration..."
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={registerTeam.isPending || !selectedTeamId}
          >
            {registerTeam.isPending ? "Registering..." : "Register Team"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'DRAFT':
      return <Clock className="w-4 h-4 text-gray-500" />;
    case 'SUBMITTED':
      return <Clock className="w-4 h-4 text-blue-500" />;
    case 'IN_REVIEW':
      return <Clock className="w-4 h-4 text-yellow-500" />;
    case 'APPROVED':
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    case 'REJECTED':
      return <XCircle className="w-4 h-4 text-red-500" />;
    case 'SUSPENDED':
      return <AlertTriangle className="w-4 h-4 text-orange-500" />;
    default:
      return <Clock className="w-4 h-4 text-gray-500" />;
  }
};

const getStatusColor = (status: string): "default" | "secondary" | "destructive" | "outline" => {
  switch (status) {
    case 'APPROVED':
      return "default"; // Green
    case 'REJECTED':
    case 'SUSPENDED':
      return "destructive"; // Red
    case 'SUBMITTED':
    case 'IN_REVIEW':
      return "secondary"; // Blue
    default:
      return "outline"; // Gray
  }
};

export default function TeamRegistrationManager({
  tournamentId,
  orgId,
  canManageRegistrations = false,
}: TeamRegistrationManagerProps) {
  const [showRegisterDialog, setShowRegisterDialog] = useState(false);
  const [selectedRegistration, setSelectedRegistration] = useState<any>(null);

  const { toast } = useToast();
  const { data: registrations = [], isLoading } = useTeamRegistrations(tournamentId);
  const updateRegistration = useUpdateTeamRegistration();
  const withdrawTeam = useWithdrawTeamFromTournament();

  const handleStatusChange = async (registrationId: string, newStatus: string) => {
    try {
      await updateRegistration.mutateAsync({
        id: registrationId,
        data: { registrationStatus: newStatus as any },
      });

      toast({
        title: "Success",
        description: `Registration status updated to ${newStatus.toLowerCase()}`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update registration status",
        variant: "destructive",
      });
    }
  };

  const handleWithdrawTeam = async (registrationId: string, teamName: string) => {
    if (!confirm(`Are you sure you want to withdraw ${teamName} from this tournament?`)) {
      return;
    }

    try {
      await withdrawTeam.mutateAsync(registrationId);
      toast({
        title: "Success",
        description: `${teamName} has been withdrawn from the tournament`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to withdraw team",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Loading team registrations...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Team Registrations</h3>
          <p className="text-sm text-muted-foreground">
            Manage team participation in this tournament
          </p>
        </div>
        
        <Button onClick={() => setShowRegisterDialog(true)}>
          <Users className="w-4 h-4 mr-2" />
          Register Team
        </Button>
      </div>

      {registrations.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Trophy className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h4 className="text-lg font-medium mb-2">No Teams Registered</h4>
            <p className="text-muted-foreground mb-4">
              No teams have been registered for this tournament yet.
            </p>
            <Button onClick={() => setShowRegisterDialog(true)}>
              Register First Team
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {registrations.map((registration: any) => (
            <Card key={registration.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base">
                      {registration.teams?.name}
                    </CardTitle>
                    {registration.teams?.club_name && (
                      <CardDescription>
                        {registration.teams.club_name}
                      </CardDescription>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(registration.registration_status)}
                    <Badge variant={getStatusColor(registration.registration_status)}>
                      {registration.registration_status}
                    </Badge>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-medium">Squad Size</p>
                    <p className="text-muted-foreground">{registration.squad_size || 22}</p>
                  </div>
                  <div>
                    <p className="font-medium">Registered</p>
                    <p className="text-muted-foreground">
                      {new Date(registration.registration_date).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {registration.coach_name && (
                  <div className="text-sm">
                    <p className="font-medium">Head Coach</p>
                    <p className="text-muted-foreground">{registration.coach_name}</p>
                  </div>
                )}

                {registration.jersey_colors && (
                  <div className="text-sm">
                    <p className="font-medium">Jersey Colors</p>
                    <p className="text-muted-foreground">{registration.jersey_colors}</p>
                  </div>
                )}

                {canManageRegistrations && (
                  <div className="flex flex-wrap gap-2 pt-2">
                    {registration.registration_status === 'SUBMITTED' && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => handleStatusChange(registration.id, 'APPROVED')}
                          disabled={updateRegistration.isPending}
                        >
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleStatusChange(registration.id, 'REJECTED')}
                          disabled={updateRegistration.isPending}
                        >
                          Reject
                        </Button>
                      </>
                    )}
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleWithdrawTeam(registration.id, registration.teams?.name)}
                      disabled={withdrawTeam.isPending}
                    >
                      Withdraw
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <RegisterTeamDialog
        open={showRegisterDialog}
        onOpenChange={setShowRegisterDialog}
        tournamentId={tournamentId}
        orgId={orgId}
      />
    </div>
  );
}