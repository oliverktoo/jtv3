import { useState } from "react";
import { useLocation } from "wouter";
import { useOrganizations, useCounties, useSubCounties, useWards } from "../hooks/useReferenceData";
import { useCreateGlobalTeam, useAllTeams, useUpdateTeam, useDeleteTeam } from "../hooks/useTeams";
import { useTeamTournamentHistory } from "../hooks/useTeamRegistrations";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Badge } from "../components/ui/badge";
import { ScrollArea } from "../components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../components/ui/alert-dialog";
import { Users, Search, Trophy, Plus, MapPin, Mail, Edit, Trash2, MoreHorizontal, X } from "lucide-react";
import { useToast } from "../hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import GeographicSelector from "../components/GeographicSelector";
import { TournamentSelectionDialog } from "../components/TournamentSelectionDialog";

const teamSchema = z.object({
  name: z.string().min(1, "Team name is required"),
  orgId: z.string().optional().or(z.literal("")).or(z.literal("independent")), // Organization is optional for independent teams
  registrationStatus: z.enum(["ACTIVE", "PENDING", "DORMANT", "SUSPENDED", "DISBANDED"]).default("ACTIVE"),
  clubName: z.string().optional(),
  managerId: z.string().optional(),
  primaryContactEmail: z.string().email("Valid email is required").optional().or(z.literal("")),
  primaryContactPhone: z.string().optional(),
  contactEmail: z.string().email("Valid email is required").optional().or(z.literal("")),
  contactPhone: z.string().optional(),
  homeVenue: z.string().optional(),
  foundedDate: z.string().optional(),
  description: z.string().optional(),
  logoUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  maxPlayers: z.number().min(1, "Must have at least 1 player").max(50, "Maximum 50 players").default(22),
  countyId: z.string().min(1, "County is required"),
  subCountyId: z.string().min(1, "Sub-County is required"),
  wardId: z.string().min(1, "Ward registration is mandatory - teams must be registered to the lowest geographic area"),
});

type TeamFormValues = z.infer<typeof teamSchema>;

interface TeamCardProps {
  team: any;
  onEdit: (team: any) => void;
  onDelete: (team: any) => void;
  onManage: (team: any) => void;
  onTournaments: (team: any) => void;
}

const TeamCard: React.FC<TeamCardProps> = ({ team, onEdit, onDelete, onManage, onTournaments }) => {
  // Temporarily disabled to reduce console noise until table exists
  // const { data: history = [] } = useTeamTournamentHistory(team.id);
  const history: any[] = [];
  const activeTournaments = history.filter((reg: any) => 
    reg.registration_status === 'APPROVED' || reg.registration_status === 'SUBMITTED'
  );
  
  const isIndependent = !(team.orgId || team.org_id);
  const teamStatus = team.registration_status || team.teamStatus || team.team_status || 'ACTIVE';

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-base font-semibold">{team.name}</CardTitle>
          {(team.clubName || team.club_name) && (
            <CardDescription>{team.clubName || team.club_name}</CardDescription>
          )}
        </div>
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            <Badge variant={isIndependent ? "outline" : "secondary"}>
              {isIndependent ? "Independent" : "Affiliated"}
            </Badge>
            <Badge variant={teamStatus === 'ACTIVE' ? "default" : "secondary"}>
              {teamStatus}
            </Badge>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(team)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit Team
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onDelete(team)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Team
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2 text-sm">
          {!isIndependent && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Users className="w-3 h-3" />
              <span>Primary Org: {team.organizations?.name}</span>
            </div>
          )}
          
          {(team.homeVenue || team.home_venue) && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="w-3 h-3" />
              <span>Home: {team.homeVenue || team.home_venue}</span>
            </div>
          )}
          
          {(team.primaryContactEmail || team.primary_contact_email || team.contactEmail || team.contact_email) && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Mail className="w-3 h-3" />
              <span>{team.primaryContactEmail || team.primary_contact_email || team.contactEmail || team.contact_email}</span>
            </div>
          )}

          {/* Geographic Registration Status */}
          <div className="flex items-center gap-2 text-xs">
            {(team.wardId || team.ward_id) ? (
              <div className="flex items-center gap-1 text-green-600 bg-green-50 px-2 py-1 rounded border">
                <MapPin className="w-3 h-3" />
                <span className="font-medium">Ward Registered</span>
                <span className="text-green-500">✓</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 text-red-600 bg-red-50 px-2 py-1 rounded border">
                <MapPin className="w-3 h-3" />
                <span className="font-medium">No Ward Registration</span>
                <span className="text-red-500">⚠️</span>
              </div>
            )}
          </div>

          {activeTournaments.length > 0 && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Trophy className="w-3 h-3" />
              <span>Active in {activeTournaments.length} tournament(s)</span>
            </div>
          )}
        </div>

        <div className="space-y-2">
          {history.length > 0 && (
            <div className="text-xs text-muted-foreground">
              <p>Tournament History: {history.length} registrations</p>
            </div>
          )}
          
          <div className="flex gap-2">
            <Button 
              size="sm" 
              variant="outline" 
              className="flex-1"
              onClick={() => onManage(team)}
              title="Manage team details, players, and settings"
            >
              <Users className="w-3 h-3 mr-1" />
              Manage
            </Button>
            
            <Button 
              size="sm" 
              variant="outline" 
              className="flex-1"
              onClick={() => onTournaments(team)}
              title="View and manage tournament registrations"
            >
              <Trophy className="w-3 h-3 mr-1" />
              Tournaments
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default function Teams() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateTeamDialogOpen, setIsCreateTeamDialogOpen] = useState(false);
  const [isEditTeamDialogOpen, setIsEditTeamDialogOpen] = useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<any>(null);
  const [selectedTeamStatus, setSelectedTeamStatus] = useState<string>("all");
  
  // Geographic filter state
  const [selectedCountyFilter, setSelectedCountyFilter] = useState<string>("all");
  const [selectedSubCountyFilter, setSelectedSubCountyFilter] = useState<string>("all");
  const [selectedWardFilter, setSelectedWardFilter] = useState<string>("all");
  
  const [isCreateConfirmOpen, setIsCreateConfirmOpen] = useState(false);
  const [isUpdateConfirmOpen, setIsUpdateConfirmOpen] = useState(false);
  const [pendingFormData, setPendingFormData] = useState<any>(null);
  const [isTournamentDialogOpen, setIsTournamentDialogOpen] = useState(false);
  const [selectedTeamForTournament, setSelectedTeamForTournament] = useState<any>(null);

  // Form management
  const { toast } = useToast();
  const [, navigate] = useLocation();

  // Get ALL teams (independent and affiliated)
  const { data: allTeams = [], isLoading: allTeamsLoading } = useAllTeams();
  const { mutate: createGlobalTeam, isPending: isCreateGlobalTeamLoading } = useCreateGlobalTeam();
  const { mutate: updateTeam, isPending: isUpdateTeamLoading } = useUpdateTeam();
  const { mutate: deleteTeam, isPending: isDeleteTeamLoading } = useDeleteTeam();
  const { data: organizations = [] } = useOrganizations();
  
  // Geographic data for filtering
  const { data: counties = [] } = useCounties();
  const { data: subCounties = [] } = useSubCounties(selectedCountyFilter !== "all" ? selectedCountyFilter : "");
  const { data: wards = [] } = useWards(selectedSubCountyFilter !== "all" ? selectedSubCountyFilter : "");

  const form = useForm<TeamFormValues>({
    resolver: zodResolver(teamSchema),
    defaultValues: {
      name: "",
      orgId: "independent",
      clubName: "",
      primaryContactEmail: "",
      primaryContactPhone: "",
      contactEmail: "",
      contactPhone: "",
      homeVenue: "",
      description: "",
      logoUrl: "",
      foundedDate: "",
      maxPlayers: 22,
      countyId: "",
      subCountyId: "",
      wardId: "",
    },
  });

  // Enhanced filter teams based on search, status, and geography
  const filteredTeams = allTeams.filter((team: any) => {
    // Text search filter
    const matchesSearch = team.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (team.clubName || team.club_name)?.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Status filter
    let matchesStatus = true;
    if (selectedTeamStatus === "active") matchesStatus = (team.registration_status || team.teamStatus || team.team_status) === "ACTIVE";
    else if (selectedTeamStatus === "dormant") matchesStatus = (team.registration_status || team.teamStatus || team.team_status) === "DORMANT";
    else if (selectedTeamStatus === "suspended") matchesStatus = (team.registration_status || team.teamStatus || team.team_status) === "SUSPENDED";
    else if (selectedTeamStatus === "disbanded") matchesStatus = (team.registration_status || team.teamStatus || team.team_status) === "DISBANDED";
    else if (selectedTeamStatus === "independent") matchesStatus = !(team.orgId || team.org_id);
    else if (selectedTeamStatus === "affiliated") matchesStatus = (team.orgId || team.org_id);
    
    // Geographic filters
    let matchesGeography = true;
    if (selectedCountyFilter !== "all") {
      matchesGeography = (team.countyId || team.county_id) === selectedCountyFilter;
    }
    if (selectedSubCountyFilter !== "all" && matchesGeography) {
      matchesGeography = (team.subCountyId || team.sub_county_id) === selectedSubCountyFilter;
    }
    if (selectedWardFilter !== "all" && matchesGeography) {
      matchesGeography = (team.wardId || team.ward_id) === selectedWardFilter;
    }
    
    return matchesSearch && matchesStatus && matchesGeography;
  });

  const handleCreateTeam = async (data: TeamFormValues) => {
    try {
      // Prepare team data with proper field mapping for the database
      const teamData = {
        name: data.name,
        primaryContactEmail: data.primaryContactEmail || undefined,
        primaryContactPhone: data.primaryContactPhone || undefined,
        contactEmail: data.contactEmail || undefined,
        contactPhone: data.contactPhone || undefined,
        homeVenue: data.homeVenue || undefined,
        description: data.description || undefined,
        clubName: data.clubName || undefined,
        logoUrl: data.logoUrl || undefined,
        foundedDate: data.foundedDate || undefined,
        maxPlayers: data.maxPlayers || 22,
        countyId: data.countyId || undefined,
        subCountyId: data.subCountyId || undefined,  
        wardId: data.wardId || undefined,
        // Handle orgId - null for independent teams, actual ID for affiliated teams
        orgId: (data.orgId && data.orgId !== "independent") ? data.orgId : undefined,
      };

      createGlobalTeam(teamData, {
        onSuccess: () => {
          const teamType = (data.orgId && data.orgId !== "independent") ? 'affiliated team' : 'independent team';
          toast({
            title: "Success",
            description: `${teamType} "${data.name}" has been created successfully`,
          });
          form.reset();
          setIsCreateTeamDialogOpen(false);
        },
        onError: (error: any) => {
          toast({
            title: "Error",
            description: error?.message || "Failed to create team",
            variant: "destructive",
          });
        }
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create team",
        variant: "destructive",
      });
    }
  };

  const handleEditTeam = (team: any) => {
    console.log('Opening edit form for team:', team);
    console.log('Geographic data from team:', {
      county_id: team.county_id,
      sub_county_id: team.sub_county_id, 
      ward_id: team.ward_id,
      county_name: team.county_name,
      sub_county_name: team.sub_county_name,
      ward_name: team.ward_name
    });
    
    setSelectedTeam(team);
    
    // Pre-populate form with existing team data including geographic information
    const formData = {
      name: team.name || "",
      orgId: team.orgId || team.org_id || undefined,  // Use undefined instead of null for optional fields
      registrationStatus: team.registration_status || team.registrationStatus || team.team_status || "ACTIVE",
      clubName: team.clubName || team.club_name || "",
      managerId: team.managerId || team.manager_id || "",
      primaryContactEmail: team.primaryContactEmail || team.primary_contact_email || "",
      primaryContactPhone: team.primaryContactPhone || team.primary_contact_phone || "",
      contactEmail: team.contactEmail || team.contact_email || "",
      contactPhone: team.contactPhone || team.contact_phone || "",
      homeVenue: team.homeVenue || team.home_venue || "",
      foundedDate: team.foundedDate || team.founded_date || "",
      description: team.description || "",
      logoUrl: team.logoUrl || team.logo_url || "",
      maxPlayers: team.maxPlayers || team.max_players || 22,
      countyId: team.countyId || team.county_id || "",
      subCountyId: team.subCountyId || team.sub_county_id || "",
      wardId: team.wardId || team.ward_id || "",
    };
    
    console.log('Form data being set:', formData);
    form.reset(formData);
    setIsEditTeamDialogOpen(true);
  };

  const handleUpdateTeam = async (data: TeamFormValues) => {
    if (!selectedTeam) return;
    
    try {
      // Log the form data received
      console.log('Updating team with form data:', data);
      
      // Prepare update data using fields that exist in the current database
      const updateData = {
        name: data.name,
        org_id: (data.orgId && data.orgId !== "independent") ? data.orgId : null,
        registration_status: data.registrationStatus || "ACTIVE",
        // Use existing contact fields (contact_email, contact_phone exist in DB)
        contact_email: data.primaryContactEmail || data.contactEmail || null,
        contact_phone: data.primaryContactPhone || data.contactPhone || null,
        // Include all available fields from the database
        club_name: data.clubName || null,
        manager_id: data.managerId || null,
        home_venue: data.homeVenue || null,
        founded_date: data.foundedDate || null,
        description: data.description || null,
        logo_url: data.logoUrl || null,
        max_players: data.maxPlayers || 22,
        // Geographic data - ensure proper mapping
        county_id: data.countyId || null,
        sub_county_id: data.subCountyId || null,
        ward_id: data.wardId || null,
      };

      console.log('Sending update data to API:', updateData);
      console.log('Geographic data being updated:', {
        county_id: updateData.county_id,
        sub_county_id: updateData.sub_county_id,
        ward_id: updateData.ward_id
      });

      updateTeam({ id: selectedTeam.id, data: updateData }, {
        onSuccess: () => {
          const geoUpdated = updateData.county_id || updateData.sub_county_id || updateData.ward_id;
          toast({
            title: "Success",
            description: `Team "${data.name}" has been updated successfully${geoUpdated ? ' - Geographic location updated!' : ''}`,
          });
          setIsEditTeamDialogOpen(false);
          setSelectedTeam(null);
        },
        onError: (error: any) => {
          toast({
            title: "Error",
            description: error?.message || "Failed to update team",
            variant: "destructive",
          });
        }
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update team",
        variant: "destructive",
      });
    }
  };

  const handleDeleteTeam = (team: any) => {
    setSelectedTeam(team);
    setIsDeleteAlertOpen(true);
  };

  const confirmDeleteTeam = () => {
    if (!selectedTeam) return;
    
    deleteTeam(selectedTeam.id, {
      onSuccess: () => {
        toast({
          title: "Success",
          description: `Team "${selectedTeam.name}" has been deleted successfully`,
        });
        setIsDeleteAlertOpen(false);
        setSelectedTeam(null);
      },
      onError: (error: any) => {
        toast({
          title: "Error",
          description: error?.message || "Failed to delete team",
          variant: "destructive",
        });
      }
    });
  };

  // Wrapper functions to show confirmation dialogs
  const handleCreateTeamWithConfirmation = (data: TeamFormValues) => {
    setPendingFormData(data);
    setIsCreateConfirmOpen(true);
  };

  const handleUpdateTeamWithConfirmation = (data: TeamFormValues) => {
    setPendingFormData(data);
    setIsUpdateConfirmOpen(true);
  };

  const confirmCreateTeam = async () => {
    if (pendingFormData) {
      await handleCreateTeam(pendingFormData);
      setIsCreateConfirmOpen(false);
      setPendingFormData(null);
    }
  };

  const confirmUpdateTeam = async () => {
    if (pendingFormData) {
      await handleUpdateTeam(pendingFormData);
      setIsUpdateConfirmOpen(false);
      setPendingFormData(null);
    }
  };

  const handleManageTeam = (team: any) => {
    // Navigate to team command center with team context
    console.log('Navigating to team management for:', team.name);
    
    // Store team data in sessionStorage for the command center to access
    sessionStorage.setItem('selectedTeam', JSON.stringify(team));
    
    // Navigate to team command center
    navigate(`/team/command?teamId=${team.id}&teamName=${encodeURIComponent(team.name)}`);
    
    toast({
      title: "Opening Team Management",
      description: `Navigating to command center for ${team.name}`,
    });
  };

  const handleTournamentTeam = (team: any) => {
    console.log('Opening tournament selection for team:', team);
    setSelectedTeamForTournament(team);
    setIsTournamentDialogOpen(true);
  };

  const handleTournamentDialogClose = () => {
    setIsTournamentDialogOpen(false);
    setSelectedTeamForTournament(null);
  };

  const handleTeamRegisteredForTournament = () => {
    // Refresh teams data to update any tournament-related info
    // The tournament selection dialog will handle the success feedback
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Team Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage all teams - independent and affiliated
          </p>
        </div>
        <Button 
          onClick={() => setIsCreateTeamDialogOpen(true)}
          data-testid="button-add-team"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Team
        </Button>
      </div>

      {/* Filters and Search */}
      <div className="flex items-center gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search teams by name or club..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
            data-testid="input-search-teams"
          />
        </div>
        <Select value={selectedTeamStatus} onValueChange={setSelectedTeamStatus}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Teams</SelectItem>
            <SelectItem value="active">Active Teams</SelectItem>
            <SelectItem value="dormant">Dormant Teams</SelectItem>
            <SelectItem value="suspended">Suspended Teams</SelectItem>
            <SelectItem value="disbanded">Disbanded Teams</SelectItem>
            <SelectItem value="independent">Independent Teams</SelectItem>
            <SelectItem value="affiliated">Affiliated Teams</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Geographic Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Geographic Filters:</span>
        </div>
        
        <div className="flex flex-col md:flex-row gap-2">
          {/* County Filter */}
          <Select value={selectedCountyFilter} onValueChange={(value) => {
            setSelectedCountyFilter(value);
            setSelectedSubCountyFilter("all"); // Reset dependent filters
            setSelectedWardFilter("all");
          }}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by county" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Counties</SelectItem>
              {counties.map((county) => (
                <SelectItem key={county.id} value={county.id}>
                  {county.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Sub-County Filter */}
          <Select 
            value={selectedSubCountyFilter} 
            onValueChange={(value) => {
              setSelectedSubCountyFilter(value);
              setSelectedWardFilter("all"); // Reset dependent filter
            }}
            disabled={selectedCountyFilter === "all"}
          >
            <SelectTrigger className="w-48">
              <SelectValue placeholder={
                selectedCountyFilter === "all" 
                  ? "Select county first" 
                  : "Filter by sub-county"
              } />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sub-Counties</SelectItem>
              {subCounties.map((subCounty) => (
                <SelectItem key={subCounty.id} value={subCounty.id}>
                  {subCounty.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Ward Filter */}
          <Select 
            value={selectedWardFilter} 
            onValueChange={setSelectedWardFilter}
            disabled={selectedSubCountyFilter === "all"}
          >
            <SelectTrigger className="w-48">
              <SelectValue placeholder={
                selectedSubCountyFilter === "all" 
                  ? "Select sub-county first" 
                  : "Filter by ward"
              } />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Wards</SelectItem>
              {wards.map((ward) => (
                <SelectItem key={ward.id} value={ward.id}>
                  {ward.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Clear Filters Button */}
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => {
              setSelectedTeamStatus("all");
              setSelectedCountyFilter("all");
              setSelectedSubCountyFilter("all");
              setSelectedWardFilter("all");
              setSearchQuery("");
            }}
            className="flex items-center gap-2"
          >
            <X className="h-4 w-4" />
            Clear Filters
          </Button>
        </div>
      </div>

      {/* Team Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Teams</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{allTeams.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Independent</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {allTeams.filter((t: any) => !(t.orgId || t.org_id)).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Affiliated</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {allTeams.filter((t: any) => (t.orgId || t.org_id)).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {allTeams.filter((t: any) => (t.registration_status || t.teamStatus || t.team_status) === 'ACTIVE').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Teams Content */}
      {allTeamsLoading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading teams...</p>
        </div>
      ) : filteredTeams.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed rounded-lg">
          <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground mb-4">No teams found</p>
          {searchQuery || selectedTeamStatus !== "all" ? (
            <p className="text-sm text-muted-foreground">Try adjusting your search or filters</p>
          ) : (
            <Button 
              onClick={() => setIsCreateTeamDialogOpen(true)}
              variant="outline"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create First Team
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTeams.map((team: any) => (
            <TeamCard 
              key={team.id} 
              team={team} 
              onEdit={handleEditTeam}
              onDelete={handleDeleteTeam}
              onManage={handleManageTeam}
              onTournaments={handleTournamentTeam}
            />
          ))}
        </div>
      )}

      {/* Create Team Dialog */}
      <Dialog open={isCreateTeamDialogOpen} onOpenChange={setIsCreateTeamDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[95vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Create New Team</DialogTitle>
            <DialogDescription>
              Create an independent team or affiliate with an organization. <strong>Ward registration is mandatory</strong> for tournament eligibility - teams must be registered at the ward level to participate in any tournament.
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <ScrollArea className="flex-1 max-h-[65vh] sm:max-h-[70vh] lg:max-h-[75vh] overflow-y-auto border-t">
              <form id="team-form" onSubmit={form.handleSubmit(handleCreateTeamWithConfirmation)} className="space-y-6 pr-6 pb-6 pt-4">
              
                {/* Organization Selection - Optional */}
                <div className="space-y-4">
                  <h4 className="text-sm font-medium text-muted-foreground">Organization Affiliation (Optional)</h4>
                  
                  <FormField
                    control={form.control}
                    name="orgId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Primary Organization</FormLabel>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Independent team (no organization)" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="independent">Independent Team</SelectItem>
                            {organizations.map((org: any) => (
                              <SelectItem key={org.id} value={org.id}>
                                {org.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="text-xs text-muted-foreground">
                    💡 Teams can be independent or affiliated with an organization. Independent teams can participate in open tournaments, while affiliated teams can represent their organization in league tournaments.
                  </div>
                </div>

                {/* Basic Information Section */}
                <div className="space-y-4">
                  <h4 className="text-sm font-medium text-muted-foreground">Basic Information</h4>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Team Name *</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter team name"
                              {...field}
                              data-testid="input-team-name"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="clubName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Club Name</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Official club name"
                              {...field}
                              data-testid="input-club-name"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="foundedDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Founded Date</FormLabel>
                          <FormControl>
                            <Input
                              type="date"
                              {...field}
                              data-testid="input-founded-date"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="maxPlayers"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Maximum Players</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="1"
                              max="50"
                              placeholder="22"
                              {...field}
                              onChange={(e) => field.onChange(Number(e.target.value))}
                              value={field.value || 22}
                              data-testid="input-max-players"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="managerId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Team Manager (Optional)</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Manager ID or leave empty to assign later"
                            {...field}
                            data-testid="input-manager-id"
                          />
                        </FormControl>
                        <FormMessage />
                        <p className="text-xs text-muted-foreground">
                          You can assign a team manager later from the team management section.
                        </p>
                      </FormItem>
                    )}
                  />
                </div>

                {/* Geographic Registration Section - REQUIRED AND PROMINENT */}
                <div className="space-y-4 bg-red-50 border-2 border-red-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-5 w-5 text-red-600" />
                    <h4 className="text-base font-bold text-red-900">📍 Geographic Registration (REQUIRED) *</h4>
                  </div>
                  <div className="text-sm text-red-800 bg-red-100 border border-red-300 rounded p-4">
                    <div className="font-semibold mb-2">🚨 MANDATORY REQUIREMENT</div>
                    <p><strong>Ward registration is required</strong> for all teams to participate in any tournament. This is not optional.</p>
                    <br />
                    <div className="font-semibold mb-1">Why Ward Registration?</div>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      <li><strong>Tournament Eligibility:</strong> Determines which tournaments your team can join</li>
                      <li><strong>Fair Competition:</strong> Ensures teams compete within appropriate geographic boundaries</li>
                      <li><strong>Automatic Qualification:</strong> Ward teams qualify for sub-county, county, and national tournaments</li>
                      <li><strong>Compliance:</strong> Required by tournament regulations and eligibility rules</li>
                    </ul>
                  </div>
                  <GeographicSelector
                    onLocationChange={(location) => {
                      form.setValue('countyId', location.countyId || '');
                      form.setValue('subCountyId', location.subCountyId || '');
                      form.setValue('wardId', location.wardId || '');
                    }}
                    value={{
                      countyId: form.watch('countyId'),
                      subCountyId: form.watch('subCountyId'),
                      wardId: form.watch('wardId'),
                    }}
                    level="ward"
                    className="border-2 border-red-300 rounded-lg p-4 bg-white shadow-sm"
                  />
                </div>

                {/* Contact Information Section */}
                <div className="space-y-4">
                  <h4 className="text-sm font-medium text-muted-foreground">Contact Information</h4>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="primaryContactEmail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Primary Contact Email</FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              placeholder="team@example.com"
                              {...field}
                              data-testid="input-primary-contact-email"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="primaryContactPhone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Primary Contact Phone</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="+254712345678"
                              {...field}
                              data-testid="input-primary-contact-phone"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Venue & Media Section */}
                <div className="space-y-4">
                  <h4 className="text-sm font-medium text-muted-foreground">Venue & Media</h4>
                  
                  <FormField
                    control={form.control}
                    name="homeVenue"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Home Venue</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Stadium or field name"
                            {...field}
                            data-testid="input-home-venue"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="logoUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Team Logo URL</FormLabel>
                        <FormControl>
                          <Input
                            type="url"
                            placeholder="https://example.com/logo.png"
                            {...field}
                            data-testid="input-logo-url"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <textarea
                            className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            placeholder="Brief description of the team..."
                            {...field}
                            data-testid="textarea-description"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

              </form>
            </ScrollArea>
            
            <DialogFooter className="border-t pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsCreateTeamDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isCreateGlobalTeamLoading}
                data-testid="button-submit-team"
                form="team-form"
              >
                {isCreateGlobalTeamLoading ? "Creating..." : "Create Team"}
              </Button>
            </DialogFooter>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Edit Team Dialog */}
      <Dialog open={isEditTeamDialogOpen} onOpenChange={setIsEditTeamDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[95vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Edit Team - Geographic Update Available</DialogTitle>
            <DialogDescription>
              Update team information including geographic location. <strong>Ward registration is required</strong> for tournament eligibility - you can change the team's residency below.
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <ScrollArea className="flex-1 max-h-[65vh] sm:max-h-[70vh] lg:max-h-[75vh] overflow-y-auto border-t">
              <form id="edit-team-form" onSubmit={form.handleSubmit(handleUpdateTeamWithConfirmation)} className="space-y-6 pr-6 pb-6 pt-4">
              
                {/* Organization and Status Management */}
                <div className="space-y-4">
                  <h4 className="text-sm font-medium text-muted-foreground">Team Status & Organization Affiliation</h4>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="orgId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Primary Organization</FormLabel>
                          <Select value={field.value || "independent"} onValueChange={(value) => field.onChange(value === "independent" ? null : value)}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select organization" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="independent">Independent Team</SelectItem>
                              {organizations.map((org: any) => (
                                <SelectItem key={org.id} value={org.id}>
                                  {org.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="registrationStatus"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Team Status</FormLabel>
                          <Select value={field.value} onValueChange={field.onChange}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select team status" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="ACTIVE">
                                <div className="flex items-center">
                                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                                  Active
                                </div>
                              </SelectItem>
                              <SelectItem value="PENDING">
                                <div className="flex items-center">
                                  <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2" />
                                  Pending
                                </div>
                              </SelectItem>
                              <SelectItem value="DORMANT">
                                <div className="flex items-center">
                                  <div className="w-2 h-2 bg-gray-500 rounded-full mr-2" />
                                  Dormant
                                </div>
                              </SelectItem>
                              <SelectItem value="SUSPENDED">
                                <div className="flex items-center">
                                  <div className="w-2 h-2 bg-red-500 rounded-full mr-2" />
                                  Suspended
                                </div>
                              </SelectItem>
                              <SelectItem value="DISBANDED">
                                <div className="flex items-center">
                                  <div className="w-2 h-2 bg-black rounded-full mr-2" />
                                  Disbanded
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Basic Information Section */}
                <div className="space-y-4">
                  <h4 className="text-sm font-medium text-muted-foreground">Basic Information</h4>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Team Name *</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter team name"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="clubName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Club Name</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Official club name"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="foundedDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Founded Date</FormLabel>
                          <FormControl>
                            <Input
                              type="date"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="maxPlayers"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Maximum Players</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="1"
                              max="50"
                              placeholder="22"
                              {...field}
                              onChange={(e) => field.onChange(Number(e.target.value))}
                              value={field.value || 22}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Enhanced Geographic Registration Section - EDIT MODE WITH RESIDENCY UPDATE */}
                <div className="space-y-4 bg-red-50 border-2 border-red-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-5 w-5 text-red-600" />
                    <h4 className="text-base font-bold text-red-900">📍 Geographic Registration (REQUIRED) *</h4>
                  </div>
                  <div className="text-sm text-red-800 bg-red-100 border border-red-300 rounded p-4">
                    <div className="font-semibold mb-2">🚨 MANDATORY REQUIREMENT</div>
                    <p><strong>Ward registration is required</strong> for all teams to participate in any tournament. This is not optional.</p>
                    <br />
                    <div className="font-semibold mb-1">Why Ward Registration?</div>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      <li><strong>Tournament Eligibility:</strong> Determines which tournaments your team can join</li>
                      <li><strong>Fair Competition:</strong> Ensures teams compete within appropriate geographic boundaries</li>
                      <li><strong>Automatic Qualification:</strong> Ward teams qualify for sub-county, county, and national tournaments</li>
                      <li><strong>Compliance:</strong> Required by tournament regulations and eligibility rules</li>
                    </ul>
                  </div>
                  
                  {/* Current Location Display */}
                  <div className="bg-blue-50 border border-blue-200 rounded p-3 mb-3">
                    <div className="font-medium text-blue-900 mb-1">Current Team Location:</div>
                    <div className="text-sm text-blue-800">
                      {selectedTeam && (selectedTeam.ward_name || selectedTeam.sub_county_name || selectedTeam.county_name) ? (
                        <>
                          <strong>Ward:</strong> {selectedTeam.ward_name || 'Not set'} <br/>
                          <strong>Sub-County:</strong> {selectedTeam.sub_county_name || 'Not set'} <br/>
                          <strong>County:</strong> {selectedTeam.county_name || 'Not set'}
                        </>
                      ) : (
                        <span className="text-red-600 font-medium">⚠️ No geographic location set - please select ward, sub-county, and county below</span>
                      )}
                    </div>
                  </div>

                  {/* Geographic Selector with Enhanced Edit Features */}
                  <div className="space-y-3">
                    <div className="text-sm font-medium text-gray-700">
                      Select new location (this will update the team's residency):
                    </div>
                    <GeographicSelector
                      key={`edit-geographic-${selectedTeam?.id || 'new'}-${isEditTeamDialogOpen}`}
                      onLocationChange={(location) => {
                        console.log('Geographic location updated for team edit:', location);
                        form.setValue('countyId', location.countyId || '');
                        form.setValue('subCountyId', location.subCountyId || '');
                        form.setValue('wardId', location.wardId || '');
                        // Trigger form validation after setting values
                        form.trigger(['countyId', 'subCountyId', 'wardId']);
                      }}
                      value={{
                        countyId: form.watch('countyId'),
                        subCountyId: form.watch('subCountyId'),
                        wardId: form.watch('wardId'),
                      }}
                      level="ward"
                      className="border-2 border-red-300 rounded-lg p-4 bg-white shadow-sm"
                    />
                    
                    {/* Updated Values Indicator */}
                    {(form.watch('countyId') || form.watch('subCountyId') || form.watch('wardId')) && (
                      <div className="bg-green-50 border border-green-200 rounded p-2 text-sm">
                        <div className="font-medium text-green-900">Updated Geographic Selection:</div>
                        <div className="text-green-800 text-xs mt-1">
                          County ID: {form.watch('countyId') || 'Not selected'} | 
                          SubCounty ID: {form.watch('subCountyId') || 'Not selected'} | 
                          Ward ID: {form.watch('wardId') || 'Not selected'}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Contact Information Section */}
                <div className="space-y-4">
                  <h4 className="text-sm font-medium text-muted-foreground">Contact Information</h4>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="primaryContactEmail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Primary Contact Email</FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              placeholder="team@example.com"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="primaryContactPhone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Primary Contact Phone</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="+254712345678"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Venue & Media Section */}
                <div className="space-y-4">
                  <h4 className="text-sm font-medium text-muted-foreground">Venue & Media</h4>
                  
                  <FormField
                    control={form.control}
                    name="homeVenue"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Home Venue</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Stadium or field name"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="logoUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Team Logo URL</FormLabel>
                        <FormControl>
                          <Input
                            type="url"
                            placeholder="https://example.com/logo.png"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <textarea
                            className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            placeholder="Brief description of the team..."
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

              </form>
            </ScrollArea>
            
            <DialogFooter className="border-t pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  setIsEditTeamDialogOpen(false);
                  setSelectedTeam(null);
                }}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isUpdateTeamLoading}
                form="edit-team-form"
              >
                {isUpdateTeamLoading ? "Updating..." : "Update Team"}
              </Button>
            </DialogFooter>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Alert */}
      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Team</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{selectedTeam?.name}"? This action cannot be undone and will also remove all tournament registrations for this team.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel 
              onClick={() => {
                setIsDeleteAlertOpen(false);
                setSelectedTeam(null);
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteTeam}
              disabled={isDeleteTeamLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleteTeamLoading ? "Deleting..." : "Delete Team"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Create Team Confirmation Alert */}
      <AlertDialog open={isCreateConfirmOpen} onOpenChange={setIsCreateConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Create New Team</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to create this new team? This action will add the team to your organization.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel 
              onClick={() => {
                setIsCreateConfirmOpen(false);
                setPendingFormData(null);
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmCreateTeam}
              disabled={isCreateGlobalTeamLoading}
            >
              {isCreateGlobalTeamLoading ? "Creating..." : "Create Team"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Update Team Confirmation Alert */}
      <AlertDialog open={isUpdateConfirmOpen} onOpenChange={setIsUpdateConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Update Team</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to update this team? This action will modify the team's information.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel 
              onClick={() => {
                setIsUpdateConfirmOpen(false);
                setPendingFormData(null);
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmUpdateTeam}
              disabled={isUpdateTeamLoading}
            >
              {isUpdateTeamLoading ? "Updating..." : "Update Team"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Tournament Selection Dialog */}
      <TournamentSelectionDialog
        team={selectedTeamForTournament}
        isOpen={isTournamentDialogOpen}
        onClose={handleTournamentDialogClose}
        onTeamRegistered={handleTeamRegisteredForTournament}
      />
    </div>
  );
}