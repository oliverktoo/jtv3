import React, { useState } from 'react';
import { 
  Users, 
  Trophy, 
  Target, 
  MoreVertical,
  CheckCircle2,
  Clock,
  XCircle,
  AlertTriangle,
  Mail,
  Phone,
  MapPin,
  Star,
  Calendar,
  Edit,
  Trash2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { 
  useTeamRegistrations, 
  useUpdateTeamRegistration, 
  useWithdrawTeamFromTournament 
} from '@/hooks/useTeamRegistrations';

interface RegisteredTeamsDashboardProps {
  tournamentId: string;
  canManageRegistrations?: boolean;
  onEditRegistration?: (registration: any) => void;
}

export const RegisteredTeamsDashboard: React.FC<RegisteredTeamsDashboardProps> = ({
  tournamentId,
  canManageRegistrations = false,
  onEditRegistration
}) => {
  const [withdrawingTeam, setWithdrawingTeam] = useState<string | null>(null);
  
  const { toast } = useToast();
  const { data: registrations = [], isLoading } = useTeamRegistrations(tournamentId);
  const updateRegistration = useUpdateTeamRegistration();
  const withdrawTeam = useWithdrawTeamFromTournament();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'REJECTED':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'SUSPENDED':
        return <AlertTriangle className="w-4 h-4 text-orange-500" />;
      case 'IN_REVIEW':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'SUBMITTED':
        return <Clock className="w-4 h-4 text-blue-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case 'APPROVED':
        return "default";
      case 'REJECTED':
      case 'SUSPENDED':
        return "destructive";
      case 'SUBMITTED':
      case 'IN_REVIEW':
        return "secondary";
      default:
        return "outline";
    }
  };

  const handleStatusChange = async (registrationId: string, newStatus: string) => {
    try {
      await updateRegistration.mutateAsync({
        id: registrationId,
        data: { registrationStatus: newStatus as any },
      });

      toast({
        title: "Status updated",
        description: `Registration status changed to ${newStatus.toLowerCase()}`,
      });
    } catch (error: any) {
      toast({
        title: "Update failed",
        description: error.message || "Failed to update registration status",
        variant: "destructive"
      });
    }
  };

  const handleWithdrawTeam = async () => {
    if (!withdrawingTeam) return;

    try {
      await withdrawTeam.mutateAsync(withdrawingTeam);
      toast({
        title: "Team withdrawn",
        description: "Team has been successfully withdrawn from the tournament",
      });
      setWithdrawingTeam(null);
    } catch (error: any) {
      toast({
        title: "Withdrawal failed",
        description: error.message || "Failed to withdraw team",
        variant: "destructive"
      });
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center">
            <Clock className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-muted-foreground">Loading registered teams...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!Array.isArray(registrations) || registrations.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-12">
          <div className="text-center">
            <Trophy className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h4 className="text-lg font-medium mb-2">No Teams Registered</h4>
            <p className="text-muted-foreground">
              Register teams to get started with this tournament.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Group registrations by status
  const groupedRegistrations = (Array.isArray(registrations) ? registrations : []).reduce((acc: any, reg: any) => {
    const status = reg.registrationStatus || 'DRAFT';
    if (!acc[status]) acc[status] = [];
    acc[status].push(reg);
    return acc;
  }, {});

  const statusOrder = ['APPROVED', 'SUBMITTED', 'IN_REVIEW', 'DRAFT', 'SUSPENDED', 'REJECTED'];
  const orderedGroups = statusOrder.filter(status => groupedRegistrations[status]);

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">
              {groupedRegistrations['APPROVED']?.length || 0}
            </div>
            <p className="text-xs text-muted-foreground">Approved</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">
              {(groupedRegistrations['SUBMITTED']?.length || 0) + (groupedRegistrations['IN_REVIEW']?.length || 0)}
            </div>
            <p className="text-xs text-muted-foreground">Pending</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-orange-600">
              {groupedRegistrations['SUSPENDED']?.length || 0}
            </div>
            <p className="text-xs text-muted-foreground">Suspended</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">
              {registrations.length}
            </div>
            <p className="text-xs text-muted-foreground">Total Teams</p>
          </CardContent>
        </Card>
      </div>

      {/* Teams by Status */}
      {orderedGroups.map(status => (
        <div key={status}>
          <div className="flex items-center space-x-2 mb-3">
            {getStatusIcon(status)}
            <h3 className="text-lg font-semibold">
              {status.replace('_', ' ')} Teams
            </h3>
            <Badge variant={getStatusColor(status)}>
              {groupedRegistrations[status].length}
            </Badge>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {groupedRegistrations[status].map((registration: any) => (
              <Card key={registration.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={registration.teams?.logo_url} />
                        <AvatarFallback className="bg-primary/10 font-semibold">
                          {registration.teams?.name?.substring(0, 2).toUpperCase() || 'T'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-base">
                          {registration.teams?.name || 'Unknown Team'}
                        </CardTitle>
                        {registration.teams?.club_name && (
                          <p className="text-sm text-muted-foreground">
                            {registration.teams.club_name}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {onEditRegistration && (
                          <>
                            <DropdownMenuItem onClick={() => onEditRegistration(registration)}>
                              <Edit className="w-4 h-4 mr-2" />
                              Edit Registration
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                          </>
                        )}
                        
                        {canManageRegistrations && (
                          <>
                            {registration.registrationStatus === 'SUBMITTED' && (
                              <>
                                <DropdownMenuItem 
                                  onClick={() => handleStatusChange(registration.id, 'APPROVED')}
                                >
                                  <CheckCircle2 className="w-4 h-4 mr-2" />
                                  Approve
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => handleStatusChange(registration.id, 'REJECTED')}
                                >
                                  <XCircle className="w-4 h-4 mr-2" />
                                  Reject
                                </DropdownMenuItem>
                              </>
                            )}
                            
                            {registration.registrationStatus === 'APPROVED' && (
                              <DropdownMenuItem 
                                onClick={() => handleStatusChange(registration.id, 'SUSPENDED')}
                              >
                                <AlertTriangle className="w-4 h-4 mr-2" />
                                Suspend
                              </DropdownMenuItem>
                            )}
                            
                            <DropdownMenuSeparator />
                          </>
                        )}
                        
                        <DropdownMenuItem 
                          onClick={() => setWithdrawingTeam(registration.id)}
                          className="text-destructive"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Withdraw Team
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Badge variant={getStatusColor(registration.registrationStatus || 'DRAFT')}>
                      {registration.registrationStatus || 'DRAFT'}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {registration.squadSize || 22} players
                    </span>
                  </div>
                  
                  {registration.coachName && (
                    <div className="flex items-center space-x-2">
                      <Star className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">Coach: {registration.coachName}</span>
                    </div>
                  )}
                  
                  {registration.jerseyColors && (
                    <div className="text-sm">
                      <span className="font-medium">Jersey:</span> {registration.jerseyColors}
                    </div>
                  )}
                  
                  {registration.teams?.county_name && (
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">{registration.teams.county_name}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                    <Calendar className="w-3 h-3" />
                    <span>
                      Registered {new Date(registration.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  
                  {registration.notes && (
                    <div className="text-sm text-muted-foreground bg-muted/50 p-2 rounded">
                      {registration.notes}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}

      {/* Withdraw Confirmation Dialog */}
      <AlertDialog open={!!withdrawingTeam} onOpenChange={() => setWithdrawingTeam(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Withdraw Team</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to withdraw this team from the tournament? 
              This action cannot be undone and the team will need to register again if they want to participate.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleWithdrawTeam}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Withdraw Team
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default RegisteredTeamsDashboard;