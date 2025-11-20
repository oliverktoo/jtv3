import React, { useState, useEffect } from "react";
import { useLocation, useParams } from "wouter";
import { 
  Trophy, 
  Calendar, 
  Users, 
  Target, 
  Settings, 
  BarChart3, 
  ListChecks, 
  Eye,
  Plus,
  Search,
  Download,
  Filter,
  Edit,
  ArrowLeft,
  Trash2,
  MoreHorizontal,
  Wrench,
  X,
  RotateCcw,
  AlertTriangle,
  AlertCircle,
  CheckCircle,
  MapPin,
  Save,
  ChevronDown
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";

// Import existing components and hooks
import StatsPanel from "@/components/StatsPanel";
import TournamentCard from "@/components/TournamentCard";
import CreateTournamentDialog from "@/components/CreateTournamentDialog";
import EditTournamentDialog from "@/components/EditTournamentDialog";
import FixtureCard from "@/components/FixtureCard";
import StandingsTable from "@/components/StandingsTable";
import GenerateFixturesDialog from "@/components/GenerateFixturesDialog";
import TeamRegistrationManager from "@/components/TeamRegistrationManager";
import TournamentStructureManager from "@/components/TournamentStructureManager";
import { MatchGenerator } from "@/components/tournaments/MatchGenerator";
import { SeamlessTeamSelector } from "@/components/tournaments/SeamlessTeamSelector";
import { TeamGroupManager } from "@/components/tournaments/TeamGroupManager";
import { ManualFixtureGenerator } from "@/components/tournaments/ManualFixtureGenerator";
import { QuickTeamRegistration } from "@/components/tournaments/QuickTeamRegistration";
import { RegisteredTeamsDashboard } from "@/components/tournaments/RegisteredTeamsDashboard";
import { NextStepsGuide } from "@/components/tournaments/NextStepsGuide";
import EnterpriseFixtureManager from "@/components/tournaments/enterprise/EnterpriseFixtureManager";
import { VenueManager } from "@/components/tournaments/VenueManager";
import { StageManager } from "@/components/tournaments/StageManager";
import GeographicSelector from "@/components/GeographicSelector";
import TeamAssignmentFunctionalityTest from "@/components/tournaments/TeamAssignmentFunctionalityTest";
import { useAllTournaments, useDeleteTournament, useCreateTournament, useUpdateTournament } from "@/hooks/useTournaments";
import { queryClient } from "@/lib/queryClient";
import { useOrganizations, useSports, useCounties, useSubCounties, useWards } from "@/hooks/useReferenceData";
import { useMatches, useUpdateMatch, useStandings } from "@/hooks/useMatches";
import { useTeamsForTournament } from "@/hooks/useTeams";
import { useTournamentPlayers } from "@/hooks/useTournamentPlayers";
import { useTournamentGroups, useTournamentTeamGroups } from "@/hooks/useGroups";
import { useStages } from "@/hooks/useStages";
import TournamentTeamRegistrationAdmin from "@/components/tournament/TournamentTeamRegistrationAdmin";
import { format } from "date-fns";
import * as XLSX from "xlsx";

// Tournament form schema with conditional geographic requirements
const tournamentSchema = z.object({
  name: z.string().min(1, "Tournament name is required"),
  slug: z.string().min(1, "Tournament slug is required"),
  orgId: z.string().optional(), // Organization is now optional for independent tournaments
  sportId: z.string().min(1, "Sport is required"),
  season: z.string().min(1, "Season is required"),
  tournamentModel: z.enum([
    "ADMINISTRATIVE_WARD",
    "ADMINISTRATIVE_SUB_COUNTY", 
    "ADMINISTRATIVE_COUNTY",
    "ADMINISTRATIVE_NATIONAL",
    "INTER_COUNTY",
    "INDEPENDENT",
    "LEAGUE"
  ]),
  federationType: z.enum(["FKF", "SCHOOLS", "CORPORATE", "OTHER"]).default("OTHER"),
  status: z.enum(["DRAFT", "REGISTRATION", "ACTIVE", "COMPLETED", "ARCHIVED"]).default("DRAFT"),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  countyId: z.string().optional(),
  subCountyId: z.string().optional(),
  wardId: z.string().optional(),
  customRules: z.string().optional(),
  leagueStructure: z.string().optional(),
  isPublished: z.boolean().default(false),
}).refine((data) => {
  // Administrative area requirements based on tournament model
  const { tournamentModel, countyId, subCountyId, wardId } = data;
  
  // Ward-level tournaments require ward, sub-county, and county
  if (tournamentModel === "ADMINISTRATIVE_WARD") {
    if (!wardId) return false;
    if (!subCountyId) return false;
    if (!countyId) return false;
  }
  
  // Sub-county tournaments require sub-county and county
  if (tournamentModel === "ADMINISTRATIVE_SUB_COUNTY") {
    if (!subCountyId) return false;
    if (!countyId) return false;
  }
  
  // County tournaments require county
  if (tournamentModel === "ADMINISTRATIVE_COUNTY") {
    if (!countyId) return false;
  }
  
  // Inter-county tournaments require at least one county
  if (tournamentModel === "INTER_COUNTY") {
    if (!countyId) return false;
  }
  
  return true;
}, {
  message: "Administrative area selection is required for this tournament level",
  path: ["countyId"], // This will show error on county field
});

type TournamentFormValues = z.infer<typeof tournamentSchema>;

const statusColors: Record<string, string> = {
  DRAFT: "bg-muted text-muted-foreground",
  REGISTRATION: "bg-chart-4/10 text-chart-4 border-chart-4/20",
  ACTIVE: "bg-chart-2/10 text-chart-2 border-chart-2/20",
  COMPLETED: "bg-chart-3/10 text-chart-3 border-chart-3/20",
  ARCHIVED: "bg-muted text-muted-foreground",
};

const modelLabels: Record<string, string> = {
  ADMINISTRATIVE_WARD: "Ward",
  ADMINISTRATIVE_SUB_COUNTY: "Sub-County",
  ADMINISTRATIVE_COUNTY: "County",
  ADMINISTRATIVE_NATIONAL: "National",
  INTER_COUNTY: "Inter-County",
  INDEPENDENT: "Independent",
  LEAGUE: "League",
};

const modelColors: Record<string, string> = {
  ADMINISTRATIVE_WARD: "bg-green-100 text-green-800 border-green-200",
  ADMINISTRATIVE_SUB_COUNTY: "bg-blue-100 text-blue-800 border-blue-200",
  ADMINISTRATIVE_COUNTY: "bg-purple-100 text-purple-800 border-purple-200",
  ADMINISTRATIVE_NATIONAL: "bg-red-100 text-red-800 border-red-200",
  INTER_COUNTY: "bg-orange-100 text-orange-800 border-orange-200",
  INDEPENDENT: "bg-gray-100 text-gray-800 border-gray-200",
  LEAGUE: "bg-indigo-100 text-indigo-800 border-indigo-200",
};

const getBorderColorForModel = (model: string): string => {
  const borderColorMap: Record<string, string> = {
    ADMINISTRATIVE_WARD: "border-l-green-500",
    ADMINISTRATIVE_SUB_COUNTY: "border-l-blue-500",
    ADMINISTRATIVE_COUNTY: "border-l-purple-500",
    ADMINISTRATIVE_NATIONAL: "border-l-red-500",
    INTER_COUNTY: "border-l-orange-500",
    INDEPENDENT: "border-l-gray-500",
    LEAGUE: "border-l-indigo-500",
  };
  return borderColorMap[model] || "border-l-gray-300";
};

// Enhanced Tournament Card with CRUD operations
interface EnhancedTournamentCardProps {
  tournament: any;
  onEdit: (tournament: any) => void;
  onDelete: (tournament: any) => void;
  onManage: (tournament: any) => void;
  selectedTournamentId?: string;
}

const EnhancedTournamentCard: React.FC<EnhancedTournamentCardProps> = ({ 
  tournament, 
  onEdit, 
  onDelete, 
  onManage,
  selectedTournamentId 
}) => {
  const isIndependent = !tournament.orgId;
  const isManaging = selectedTournamentId === tournament.id;
  
  // Get border color based on tournament model
  const getBorderColor = (model: string) => {
    const colorMap: Record<string, string> = {
      ADMINISTRATIVE_WARD: "border-l-green-500",
      ADMINISTRATIVE_SUB_COUNTY: "border-l-blue-500",
      ADMINISTRATIVE_COUNTY: "border-l-purple-500",
      ADMINISTRATIVE_NATIONAL: "border-l-red-500",
      INTER_COUNTY: "border-l-orange-500",
      INDEPENDENT: "border-l-gray-500",
      LEAGUE: "border-l-indigo-500",
    };
    return colorMap[model] || "border-l-gray-300";
  };
  
  return (
    <Card className={`hover:shadow-lg transition-all duration-200 border-l-4 ${getBorderColor(tournament.tournamentModel)} hover:scale-[1.02] ${isManaging ? 'ring-2 ring-primary shadow-lg' : ''} relative`}>
      {isManaging && (
        <div className="absolute top-2 right-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full z-10">
          Managing
        </div>
      )}
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-base font-semibold">{tournament.name}</CardTitle>
          <CardDescription>{tournament.season}</CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={isIndependent ? "outline" : "secondary"}>
            {isIndependent ? "Independent" : "Affiliated"}
          </Badge>
          <Badge className={statusColors[tournament.status] || "bg-gray-100"}>
            {tournament.status}
          </Badge>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(tournament)}>
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDelete(tournament)} className="text-red-600">
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Badge 
              className={`border ${modelColors[tournament.tournamentModel] || "bg-gray-100 text-gray-800 border-gray-200"}`}
            >
              {modelLabels[tournament.tournamentModel] || tournament.tournamentModel}
            </Badge>
            {tournament.organizationName && (
              <div className="text-sm text-muted-foreground">
                Organizer: <span className="font-medium">{tournament.organizationName}</span>
              </div>
            )}
          </div>

          {tournament.startDate && tournament.endDate && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="w-3 h-3" />
              <span>
                {format(new Date(tournament.startDate), "MMM dd")} - {format(new Date(tournament.endDate), "MMM dd, yyyy")}
              </span>
            </div>
          )}
          
          <div className="flex gap-2">
            <Button 
              size="sm" 
              variant={selectedTournamentId === tournament.id ? "default" : "outline"}
              className="flex-1 hover:shadow-sm transition-all"
              onClick={() => onManage(tournament)}
              title="Access comprehensive tournament management dashboard"
            >
              <Settings className="w-3 h-3 mr-1" />
              {selectedTournamentId === tournament.id ? 'Managing' : 'Manage'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default function TournamentSuperHub() {
  const [activeTab, setActiveTab] = useState("tournaments");
  const [managementTab, setManagementTab] = useState("stages");
  
  // Handle URL parameters for direct tab navigation
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tabParam = urlParams.get('tab');
    if (tabParam && tabParam === 'jamii-fixtures' && activeTab === 'details') {
      // Set the nested tab state directly
      setManagementTab('jamii-fixtures');
      
      // Scroll to management tabs area
      setTimeout(() => {
        const managementTabs = document.getElementById('management-tabs-navigation');
        if (managementTabs) {
          const rect = managementTabs.getBoundingClientRect();
          const offset = window.pageYOffset + rect.top - 120;
          window.scrollTo({ top: offset, behavior: 'smooth' });
        }
      }, 300);
    } else if (tabParam && tabParam === 'jamii-fixtures') {
      // Switch to details tab first
      setActiveTab('details');
      setManagementTab('jamii-fixtures');
    }
  }, [activeTab]);

  // Redirect fixtures tab to details tab (where jamii-fixtures is nested)
  useEffect(() => {
    if (activeTab === 'fixtures') {
      // Immediate redirect without delay
      setActiveTab('details');
      setManagementTab('jamii-fixtures');
      
      // Also scroll to the nested tabs area after a short delay
      setTimeout(() => {
        const managementTabs = document.getElementById('management-tabs-navigation');
        if (managementTabs) {
          const rect = managementTabs.getBoundingClientRect();
          const offset = window.pageYOffset + rect.top - 120;
          window.scrollTo({ top: offset, behavior: 'smooth' });
        }
      }, 300);
    }
  }, [activeTab]);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [modelFilter, setModelFilter] = useState("all");
  const [selectedTournamentId, setSelectedTournamentId] = useState("");
  const [editingTournament, setEditingTournament] = useState<any>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  
  // New CRUD state management
  const [isCreateTournamentDialogOpen, setIsCreateTournamentDialogOpen] = useState(false);
  const [isEditTournamentDialogOpen, setIsEditTournamentDialogOpen] = useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [selectedTournament, setSelectedTournament] = useState<any>(null);
  const [selectedTournamentStatus, setSelectedTournamentStatus] = useState<string>("all");
  const [isCreateConfirmOpen, setIsCreateConfirmOpen] = useState(false);
  const [isUpdateConfirmOpen, setIsUpdateConfirmOpen] = useState(false);
  const [pendingFormData, setPendingFormData] = useState<any>(null);
  
  // Venue preferences state
  const [venues, setVenues] = useState<any[]>([]);
  const [venuesLoading, setVenuesLoading] = useState(false);
  const [selectedVenues, setSelectedVenues] = useState<string[]>([]);
  
  const { toast } = useToast();
  const { mutate: deleteTournament, isPending: isDeleteTournamentLoading } = useDeleteTournament();
  const { mutate: createTournament, isPending: isCreateTournamentLoading } = useCreateTournament();
  const { mutate: updateTournament, isPending: isUpdateTournamentLoading } = useUpdateTournament();
  const [, setLocation] = useLocation();

  // Clear functions
  const clearSearch = () => {
    setSearchTerm("");
  };

  const clearAllFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setModelFilter("all");
  };

  const hasActiveFilters = searchTerm || statusFilter !== "all" || modelFilter !== "all";
  const params = useParams();
  
  // Form management
  const form = useForm<TournamentFormValues>({
    resolver: zodResolver(tournamentSchema),
    defaultValues: {
      name: "",
      slug: "",
      orgId: "independent",
      sportId: "",
      season: "",
      tournamentModel: "INDEPENDENT",
      federationType: "OTHER",
      status: "DRAFT",
      startDate: "",
      endDate: "",
      countyId: "",
      subCountyId: "",
      wardId: "",
      customRules: "",
      leagueStructure: "",
      isPublished: false,
    },
  });
  
  // Removed organization filtering - now shows all tournaments like Teams page

  // Check for tournament detail view
  useEffect(() => {
    if (params && params.id) {
      setSelectedTournamentId(params.id);
      setActiveTab("details");
    }
  }, [params]);
  
  // Data fetching
  const { data: tournaments = [], isLoading } = useAllTournaments();
  
  // Force refresh tournament data on component mount to ensure latest data
  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: ["tournaments"] });
  }, []);
  
  // Fetch venues for preferences
  useEffect(() => {
    const fetchVenues = async () => {
      try {
        setVenuesLoading(true);
        const data = await apiRequest('GET', '/api/fixtures/venues');
        if (data.success && data.venues) {
          setVenues(data.venues);
          console.log('TournamentSuperHub: Loaded venues:', data.venues.length);
        }
      } catch (error) {
        console.error('Failed to fetch venues:', error);
      } finally {
        setVenuesLoading(false);
      }
    };
    fetchVenues();
  }, []);
  
  const { data: matchesData = [] } = useMatches(selectedTournamentId);
  const matches = Array.isArray(matchesData) ? matchesData : [];
  const { data: standingsData = [] } = useStandings(selectedTournamentId);
  const { data: organizations = [] } = useOrganizations();
  const { data: sports = [] } = useSports();
  
  // Geographic data for administrative area requirements
  const { data: counties = [] } = useCounties();
  
  // Watch form values for conditional geographic data loading
  const selectedCountyId = form?.watch('countyId');
  const selectedSubCountyId = form?.watch('subCountyId');
  const selectedTournamentModel = form?.watch('tournamentModel');
  
  const { data: subCounties = [] } = useSubCounties(selectedCountyId || '');
  const { data: wards = [] } = useWards(selectedSubCountyId || '');
  
  // Tournament-specific data for management dashboard
  // Get teams for the selected tournament
  const { data: tournamentTeams } = useTeamsForTournament(selectedTournamentId || '');
  
  // Get players for the selected tournament
  const { data: tournamentPlayers } = useTournamentPlayers(selectedTournamentId || '');
  
  // Get groups and team assignments for the selected tournament
  const { data: tournamentGroups } = useTournamentGroups(selectedTournamentId || '');
  const { data: teamGroups } = useTournamentTeamGroups(selectedTournamentId || '');
  
  // Get stages for the selected tournament
  const { data: tournamentStages } = useStages(selectedTournamentId || '');

  // Calculate stats from tournament data directly (no organization filtering)
  const orgStats = {
    totalTeams: 0, // Will be calculated when needed
    completedMatches: 0 // Will be calculated when needed
  };

  // Filter tournaments based on search, status, and model
  const filteredTournaments = tournaments?.filter(tournament => {
    const matchesSearch = tournament.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || tournament.status === statusFilter;
    const matchesModel = modelFilter === "all" || tournament.tournamentModel === modelFilter;
    return matchesSearch && matchesStatus && matchesModel;
  }) || [];

  const stats = [
    {
      label: "Total Tournaments",
      value: tournaments?.length || 0,
      icon: Trophy,
    },
    {
      label: "Displayed Tournaments", 
      value: filteredTournaments?.length || 0,
      icon: ListChecks,
    },
    {
      label: "Active Tournaments",
      value: tournaments?.filter(t => t.status === "ACTIVE").length || 0,
      icon: Target,
    },
    {
      label: "Total Teams",
      value: orgStats?.totalTeams || 0,
      icon: Users,
    },
    {
      label: "Scheduled Matches",
      value: matches?.filter(m => m.status === "SCHEDULED").length || 0,
      icon: Calendar,
    },
  ];

  // CRUD Handler Functions
  const handleCreateTournament = async (data: TournamentFormValues) => {
    try {
      // Generate slug from name if not provided
      const slug = data.slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      
      // Determine if this is an independent tournament (many-to-many participation model)
      const isIndependent = !data.orgId || data.orgId === "independent" || data.orgId === "system";
      
      // Prepare tournament data with all required fields
      const tournamentData = {
        name: data.name,
        slug,
        sportId: data.sportId,
        season: data.season,
        tournamentModel: data.tournamentModel,
        // Note: participationModel field doesn't exist in current DB schema
        federationType: data.federationType,
        status: data.status,
        startDate: data.startDate || undefined,
        endDate: data.endDate || undefined,
        countyId: data.countyId || undefined,
        subCountyId: data.subCountyId || undefined,
        wardId: data.wardId || undefined,
        customRules: data.customRules || undefined,
        leagueStructure: data.leagueStructure || undefined,
        isPublished: data.isPublished,
      };

      // System org ID for independent tournaments
      const SYSTEM_ORG_ID = '00000000-0000-0000-0000-000000000000';
      
      // For independent tournaments, explicitly set System org ID
      // For organizational tournaments, pass the specific orgId
      const finalTournamentData = isIndependent
        ? { ...tournamentData, orgId: SYSTEM_ORG_ID } // Explicitly set System org
        : { ...tournamentData, orgId: data.orgId };   // Set specific org ID

      createTournament(finalTournamentData as any, {
        onSuccess: () => {
          const tournamentType = (data.orgId && data.orgId !== "independent") ? 'affiliated tournament' : 'independent tournament';
          toast({
            title: "Success",
            description: `${tournamentType} "${data.name}" has been created successfully`,
          });
          form.reset();
          setIsCreateTournamentDialogOpen(false);
        },
        onError: (error: any) => {
          console.error("Create tournament error:", error);
          const errorMessage = error?.message || "Failed to create tournament. Please try again.";
          toast({
            title: "Error",
            description: errorMessage,
            variant: "destructive",
          });
        },
      });
    } catch (error) {
      console.error("Tournament creation error:", error);
      toast({
        title: "Error",
        description: "Failed to create tournament. Please check your input and try again.",
        variant: "destructive",
      });
    }
  };

  const handleEditTournament = (tournament: any) => {
    setSelectedTournament(tournament);
    
    // Populate form with tournament data
    form.reset({
      name: tournament.name || "",
      slug: tournament.slug || "",
      orgId: tournament.orgId || "independent",
      sportId: tournament.sportId || "",
      season: tournament.season || "",
      tournamentModel: tournament.tournamentModel || "INDEPENDENT",
      federationType: tournament.federationType || "OTHER",
      status: tournament.status || "DRAFT",
      startDate: tournament.startDate ? format(new Date(tournament.startDate), "yyyy-MM-dd") : "",
      endDate: tournament.endDate ? format(new Date(tournament.endDate), "yyyy-MM-dd") : "",
      countyId: tournament.countyId || "",
      subCountyId: tournament.subCountyId || "",
      wardId: tournament.wardId || "",
      customRules: tournament.customRules || "",
      leagueStructure: tournament.leagueStructure || "",
      isPublished: tournament.isPublished || false,
    });
    
    // Load venue preferences
    setSelectedVenues(tournament.preferredVenues || []);
    
    setIsEditTournamentDialogOpen(true);
  };

  const handleUpdateTournament = async (data: TournamentFormValues) => {
    if (!selectedTournament) return;

    try {
      const updateData = {
        name: data.name,
        slug: data.slug,
        sportId: data.sportId,
        season: data.season,
        tournamentModel: data.tournamentModel,
        federationType: data.federationType,
        status: data.status,
        startDate: data.startDate || undefined,
        endDate: data.endDate || undefined,
        countyId: data.countyId || undefined,
        subCountyId: data.subCountyId || undefined,
        wardId: data.wardId || undefined,
        customRules: data.customRules || undefined,
        leagueStructure: data.leagueStructure || undefined,
        isPublished: data.isPublished,
        preferredVenues: selectedVenues.length > 0 ? selectedVenues : undefined,
      };

      // Handle organization assignment - System org ID for independent tournaments
      const SYSTEM_ORG_ID = '00000000-0000-0000-0000-000000000000';
      const finalUpdateData = data.orgId === "independent" 
        ? { ...updateData, orgId: SYSTEM_ORG_ID } // Explicitly set System org for independent
        : data.orgId 
        ? { ...updateData, orgId: data.orgId }    // Set specific org ID
        : { ...updateData };                      // No orgId change

      updateTournament({ id: selectedTournament.id, data: finalUpdateData }, {
        onSuccess: () => {
          toast({
            title: "Success",
            description: `Tournament "${data.name}" has been updated successfully`,
          });
          form.reset();
          setIsEditTournamentDialogOpen(false);
          setSelectedTournament(null);
        },
        onError: (error: any) => {
          console.error("Update tournament error:", error);
          const errorMessage = error?.message || "Failed to update tournament. Please try again.";
          toast({
            title: "Error",
            description: errorMessage,
            variant: "destructive",
          });
        },
      });
    } catch (error) {
      console.error("Tournament update error:", error);
      toast({
        title: "Error",
        description: "Failed to update tournament. Please check your input and try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteTournament = (tournament: any) => {
    setSelectedTournament(tournament);
    setIsDeleteAlertOpen(true);
  };

  const confirmDeleteTournament = () => {
    if (!selectedTournament) return;

    deleteTournament({ id: selectedTournament.id }, {
      onSuccess: () => {
        toast({
          title: "Success",
          description: `Tournament "${selectedTournament.name}" has been deleted successfully`,
        });
        setIsDeleteAlertOpen(false);
        setSelectedTournament(null);
      },
      onError: (error: any) => {
        console.error("Delete tournament error:", error);
        const errorMessage = error?.message || "Failed to delete tournament. Please try again.";
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
      },
    });
  };

  const handleManageTournament = (tournament: any) => {
    // Set the selected tournament for management
    setSelectedTournament(tournament);
    setSelectedTournamentId(tournament.id);
    
    // Switch to the comprehensive management tab
    setActiveTab("details");
    
    // Update URL if needed (optional)
    // setLocation(`/tournaments/${tournament.id}`);
    
    // Show a toast to confirm management mode
    toast({
      title: "Tournament Management",
      description: `Now managing: ${tournament.name}`,
    });
  };

  const handleTogglePublished = async (tournament: any) => {
    const newPublishedState = !tournament.isPublished;
    
    updateTournament({ 
      id: tournament.id,
      data: { isPublished: newPublishedState }
    }, {
      onSuccess: () => {
        toast({
          title: "Success",
          description: `Tournament "${tournament.name}" has been ${newPublishedState ? 'published' : 'unpublished'} successfully`,
        });
      },
      onError: (error) => {
        console.error("Toggle published error:", error);
        toast({
          title: "Error",
          description: "Failed to update tournament publication status. Please try again.",
          variant: "destructive",
        });
      },
    });
  };

  const currentSelectedTournament = tournaments?.find(t => t.id === selectedTournamentId);

  const exportTournamentsToExcel = () => {
    const worksheetData = filteredTournaments.map(tournament => ({
      Name: tournament.name,
      Model: modelLabels[tournament.tournamentModel] || tournament.tournamentModel,
      Sport: tournament.sportId 
        ? sports.find(sport => sport.id === tournament.sportId)?.name || tournament.sportId
        : "Unknown",
      Status: tournament.status,
      "Start Date": tournament.startDate ? format(new Date(tournament.startDate), "dd/MM/yyyy") : "",
      "End Date": tournament.endDate ? format(new Date(tournament.endDate), "dd/MM/yyyy") : "",
      Season: tournament.season,
    }));

    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Tournaments");
    XLSX.writeFile(workbook, `tournaments-${format(new Date(), "yyyy-MM-dd")}.xlsx`);
    
    toast({
      title: "Export successful",
      description: "Tournaments data has been exported to Excel.",
    });
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar Navigation */}
      <div className="w-64 bg-card border-r overflow-y-auto shadow-sm">
        {/* Header */}
        <div className="p-4 border-b bg-gradient-to-r from-primary/5 to-primary/10">
          <div className="flex items-center gap-2 mb-1">
            <Trophy className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-bold text-primary">Tournament Hub</h2>
          </div>
          <p className="text-xs text-muted-foreground">Manage & Navigate</p>
        </div>
        
        <nav className="p-3 space-y-1">
          {/* Overview Section */}
          <div className="mb-4">
            <p className="px-3 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Overview</p>
            
            <button
              onClick={() => setActiveTab("tournaments")}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === "tournaments" 
                  ? "bg-primary text-primary-foreground shadow-md" 
                  : "text-foreground hover:bg-muted"
              }`}
            >
              <Trophy className="w-4 h-4 shrink-0" />
              <span>All Tournaments</span>
            </button>

            <button
              onClick={() => setActiveTab("details")}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === "details" 
                  ? "bg-primary text-primary-foreground shadow-md" 
                  : "text-foreground hover:bg-muted"
              }`}
            >
              <Eye className="w-4 h-4 shrink-0" />
              <span>Manage Details</span>
            </button>
          </div>

          {/* Tournament Structure Section */}
          <div className="mb-4">
            <p className="px-3 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Tournament Setup</p>
            
            <div>
              <button
                onClick={() => {
                  if (activeTab === "structure") {
                    setActiveTab("tournaments");
                  } else {
                    setActiveTab("structure");
                    setManagementTab("stages");
                  }
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  activeTab === "structure" 
                    ? "bg-primary text-primary-foreground shadow-md" 
                    : "text-foreground hover:bg-muted"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Settings className="w-4 h-4 shrink-0" />
                  <span>Structure</span>
                </div>
                <ChevronDown className={`w-4 h-4 shrink-0 transition-transform duration-200 ${
                  activeTab === "structure" ? "rotate-180" : ""
                }`} />
              </button>
              
              {/* Structure Submenu */}
              {activeTab === "structure" && (
                <div className="ml-4 mt-2 space-y-0.5 border-l-2 border-primary/30 pl-3">
                  <button
                    onClick={() => setManagementTab("stages")}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-all ${
                      managementTab === "stages" 
                        ? "bg-primary/10 text-primary font-medium" 
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    <Target className="w-3.5 h-3.5 shrink-0" />
                    <span>Stages</span>
                  </button>
                  
                  <button
                    onClick={() => setManagementTab("teams")}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-all ${
                      managementTab === "teams" 
                        ? "bg-primary/10 text-primary font-medium" 
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    <Users className="w-3.5 h-3.5 shrink-0" />
                    <span>Teams</span>
                  </button>
                  
                  <button
                    onClick={() => setManagementTab("groups")}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-all ${
                      managementTab === "groups" 
                        ? "bg-primary/10 text-primary font-medium" 
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    <Users className="w-3.5 h-3.5 shrink-0" />
                    <span>Groups</span>
                  </button>
                  
                  <button
                    onClick={() => setManagementTab("venues")}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-all ${
                      managementTab === "venues" 
                        ? "bg-primary/10 text-primary font-medium" 
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    <MapPin className="w-3.5 h-3.5 shrink-0" />
                    <span>Venues</span>
                  </button>
                  
                  <div className="my-1 border-t border-border/50" />
                  
                  <button
                    onClick={() => setManagementTab("team-registrations")}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-all ${
                      managementTab === "team-registrations" 
                        ? "bg-primary/10 text-primary font-medium" 
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    <CheckCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>Registrations</span>
                  </button>
                  
                  <button
                    onClick={() => setManagementTab("jamii-fixtures")}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-all ${
                      managementTab === "jamii-fixtures" 
                        ? "bg-primary/10 text-primary font-medium" 
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    <Calendar className="w-3.5 h-3.5 shrink-0" />
                    <span>Fixtures</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Competition Section */}
          <div className="mb-4">
            <p className="px-3 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Competition</p>
            
            <button
              onClick={() => setActiveTab("standings")}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === "standings" 
                  ? "bg-primary text-primary-foreground shadow-md" 
                  : "text-foreground hover:bg-muted"
              }`}
            >
              <BarChart3 className="w-4 h-4 shrink-0" />
              <span>Standings</span>
            </button>

            <button
              onClick={() => setActiveTab("public")}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === "public" 
                  ? "bg-primary text-primary-foreground shadow-md" 
                  : "text-foreground hover:bg-muted"
              }`}
            >
              <Eye className="w-4 h-4 shrink-0" />
              <span>Public View</span>
            </button>
          </div>

          {/* Configuration Section */}
          <div>
            <p className="px-3 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Configuration</p>
            
            <button
              onClick={() => setActiveTab("settings")}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === "settings" 
                  ? "bg-primary text-primary-foreground shadow-md" 
                  : "text-foreground hover:bg-muted"
              }`}
            >
              <ListChecks className="w-4 h-4 shrink-0" />
              <span>Settings</span>
            </button>
          </div>
        </nav>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Tournament Management Hub</h1>
          <p className="text-muted-foreground">
            Comprehensive tournament management, fixtures, and standings
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportTournamentsToExcel}>
            <Download className="w-4 h-4 mr-2" />
            Export Data
          </Button>
          <Button onClick={() => setIsCreateTournamentDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create Tournament
          </Button>
        </div>
      </div>

      {/* Organization selector removed - now shows all tournaments like Teams page */}

      {/* Stats Panel */}
      <div className="mb-8">
        <StatsPanel stats={stats} />
      </div>

      {/* Tournament Distribution by Level */}
      <div className="mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Tournament Distribution by Level</CardTitle>
            <CardDescription>Breakdown of tournaments across different administrative levels</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
              {Object.entries(modelLabels).map(([key, label]) => {
                const count = tournaments?.filter(t => t.tournamentModel === key).length || 0;
                return (
                  <div key={key} className="text-center">
                    <div className={`w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center text-white font-bold ${
                      key === 'ADMINISTRATIVE_WARD' ? 'bg-green-500' :
                      key === 'ADMINISTRATIVE_SUB_COUNTY' ? 'bg-blue-500' :
                      key === 'ADMINISTRATIVE_COUNTY' ? 'bg-purple-500' :
                      key === 'ADMINISTRATIVE_NATIONAL' ? 'bg-red-500' :
                      key === 'INTER_COUNTY' ? 'bg-orange-500' :
                      key === 'INDEPENDENT' ? 'bg-gray-500' :
                      'bg-indigo-500'
                    }`}>
                      {count}
                    </div>
                    <p className="text-sm font-medium">{label}</p>
                    <p className="text-xs text-muted-foreground">
                      {tournaments?.length ? Math.round((count / tournaments.length) * 100) : 0}%
                    </p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs - Now controlled by sidebar */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        {/* Tournaments Tab */}
        <TabsContent value="tournaments" className="space-y-6">
          <div className="flex gap-4 items-center flex-wrap">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search tournaments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-10"
              />
              {searchTerm && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearSearch}
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-muted"
                >
                  <X className="w-3 h-3" />
                </Button>
              )}
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="DRAFT">Draft</SelectItem>
                <SelectItem value="REGISTRATION">Registration</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
                <SelectItem value="ARCHIVED">Archived</SelectItem>
              </SelectContent>
            </Select>
            <Select value={modelFilter} onValueChange={setModelFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="ADMINISTRATIVE_WARD">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    Ward
                  </div>
                </SelectItem>
                <SelectItem value="ADMINISTRATIVE_SUB_COUNTY">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    Sub-County
                  </div>
                </SelectItem>
                <SelectItem value="ADMINISTRATIVE_COUNTY">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                    County
                  </div>
                </SelectItem>
                <SelectItem value="ADMINISTRATIVE_NATIONAL">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    National
                  </div>
                </SelectItem>
                <SelectItem value="INTER_COUNTY">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                    Inter-County
                  </div>
                </SelectItem>
                <SelectItem value="INDEPENDENT">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-gray-500"></div>
                    Independent
                  </div>
                </SelectItem>
                <SelectItem value="LEAGUE">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-indigo-500"></div>
                    League
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            {hasActiveFilters && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearAllFilters}
                className="flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                Clear Filters
              </Button>
            )}
          </div>

          {/* Color Legend */}
          <div className="bg-muted/30 rounded-lg p-4">
            <h3 className="text-sm font-medium mb-3 text-muted-foreground">Tournament Levels</h3>
            <div className="flex flex-wrap gap-4">
              {Object.entries(modelLabels).map(([key, label]) => (
                <div key={key} className="flex items-center gap-2">
                  <Badge className={`border text-xs ${modelColors[key]}`}>
                    {label}
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoading ? (
              <div className="col-span-full text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="mt-2 text-muted-foreground">Loading tournaments...</p>
              </div>
            ) : filteredTournaments.length > 0 ? (
              filteredTournaments.map((tournament) => (
                <EnhancedTournamentCard
                  key={tournament.id}
                  tournament={tournament}
                  onEdit={handleEditTournament}
                  onDelete={handleDeleteTournament}
                  onManage={handleManageTournament}
                  selectedTournamentId={selectedTournamentId}
                />
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <Trophy className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-2 text-sm font-semibold text-gray-900">No tournaments</h3>
                <p className="mt-1 text-sm text-gray-500">Get started by creating a new tournament.</p>
                <div className="mt-6">
                  <CreateTournamentDialog />
                </div>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Tournament Management Hub - Enhanced Details Tab */}
        <TabsContent value="details" className="space-y-6">
          {selectedTournament ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <Button 
                  variant="ghost" 
                  onClick={() => setActiveTab("tournaments")}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Tournaments
                </Button>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleEditTournament(selectedTournament)}>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Tournament
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Export Data
                  </Button>
                </div>
              </div>

              {/* Tournament Header Card */}
              <Card className={`border-l-4 ${getBorderColorForModel(selectedTournament.tournamentModel)}`}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-2xl flex items-center gap-3">
                        {selectedTournament.name}
                        <Badge className={`${modelColors[selectedTournament.tournamentModel] || "bg-gray-100 text-gray-800 border-gray-200"} border`}>
                          {modelLabels[selectedTournament.tournamentModel] || selectedTournament.tournamentModel}
                        </Badge>
                      </CardTitle>
                      <CardDescription className="text-lg">Season: {selectedTournament.season}</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={`${statusColors[selectedTournament.status]} text-sm px-3 py-1`}>
                        {selectedTournament.status}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-muted-foreground">Organization</p>
                      <p className="text-base font-medium">{selectedTournament.organizationName || "Independent Tournament"}</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-muted-foreground">Sport</p>
                      <p className="text-base">
                        {selectedTournament.sportId 
                          ? sports.find(sport => sport.id === selectedTournament.sportId)?.name || selectedTournament.sportId
                          : "Not specified"}
                      </p>
                    </div>
                    {selectedTournament.startDate && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-muted-foreground">Start Date</p>
                        <p className="text-base">{format(new Date(selectedTournament.startDate), "MMM dd, yyyy")}</p>
                      </div>
                    )}
                    {selectedTournament.endDate && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-muted-foreground">End Date</p>
                        <p className="text-base">{format(new Date(selectedTournament.endDate), "MMM dd, yyyy")}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Management Actions Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                
                {/* Team Management */}
                <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setActiveTab("teams")}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Users className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">Team Management</CardTitle>
                        <CardDescription>Register and manage teams</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Registered Teams:</span>
                      <span className="font-semibold text-blue-600">{tournamentTeams?.length || 0}</span>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" className="flex-1" onClick={(e) => { e.stopPropagation(); setActiveTab("teams"); }}>
                        <Plus className="w-4 h-4 mr-1" />
                        Add Team
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1" onClick={(e) => { e.stopPropagation(); setActiveTab("teams"); }}>
                        View All
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Fixture Management */}
                <Card className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">Fixtures & Matches</CardTitle>
                        <CardDescription>Schedule and manage matches</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Total Matches:</span>
                      <span className="font-semibold">{matches?.length || 0}</span>
                    </div>
                    <div className="flex gap-2">
                      <GenerateFixturesDialog 
                        tournamentId={selectedTournament.id}
                      />
                      <Button size="sm" variant="outline" className="flex-1" onClick={() => {
                        // First switch to the details tab and set the nested tab
                        setActiveTab("details");
                        setManagementTab("jamii-fixtures");
                        
                        // Then scroll to show the nested tabs area
                        setTimeout(() => {
                          const managementTabs = document.getElementById('management-tabs-navigation');
                          const tournamentTabs = document.getElementById('tabs-navigation');
                          
                          if (managementTabs) {
                            const rect = managementTabs.getBoundingClientRect();
                            const offset = window.pageYOffset + rect.top - 120; // 120px padding from top
                            window.scrollTo({ top: offset, behavior: 'smooth' });
                          } else if (tournamentTabs) {
                            const rect = tournamentTabs.getBoundingClientRect();
                            const offset = window.pageYOffset + rect.top - 80;
                            window.scrollTo({ top: offset, behavior: 'smooth' });
                          } else {
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }
                        }, 300);
                      }}>
                        View All
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Results & Standings */}
                <Card className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                        <BarChart3 className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">Results & Standings</CardTitle>
                        <CardDescription>Match results and league table</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Completed:</span>
                      <span className="font-semibold">{matches?.filter(m => m?.match?.status === "COMPLETED" || m?.status === "COMPLETED").length || 0}</span>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" className="flex-1">
                        <Edit className="w-4 h-4 mr-1" />
                        Update
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1" onClick={() => setActiveTab("standings")}>
                        View Table
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Player Registry */}
                <Card className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                        <Users className="w-5 h-5 text-orange-600" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">Player Registry</CardTitle>
                        <CardDescription>Manage player registrations</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Total Players:</span>
                      <span className="font-semibold">{tournamentPlayers?.length || 0}</span>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" className="flex-1">
                        <Plus className="w-4 h-4 mr-1" />
                        Register
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1">
                        View All
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Tournament Structure */}
                <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setActiveTab("structure")}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                        <Settings className="w-5 h-5 text-indigo-600" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">Tournament Structure</CardTitle>
                        <CardDescription>Multi-level configuration</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Teams:</span>
                      <span className="font-semibold text-indigo-600">{tournamentTeams?.length || 0}</span>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" className="flex-1" onClick={(e) => { e.stopPropagation(); setActiveTab("structure"); }}>
                        <Settings className="w-4 h-4 mr-1" />
                        Configure
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1" onClick={(e) => { e.stopPropagation(); setActiveTab("structure"); }}>
                        View All
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Tournament Settings */}
                <Card className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                        <ListChecks className="w-5 h-5 text-red-600" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">Tournament Settings</CardTitle>
                        <CardDescription>Rules and configuration</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Published:</span>
                      <span className={`font-semibold ${selectedTournament.isPublished ? 'text-green-600' : 'text-gray-500'}`}>
                        {selectedTournament.isPublished ? 'Yes' : 'No'}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" className="flex-1" onClick={() => setActiveTab("settings")}>
                        <ListChecks className="w-4 h-4 mr-1" />
                        Configure
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1">
                        Rules
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Public View */}
                <Card className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                        <Eye className="w-5 h-5 text-indigo-600" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">Public View</CardTitle>
                        <CardDescription>Fan and media access</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Status:</span>
                      <span className="font-semibold">{selectedTournament.isPublished ? 'Live' : 'Private'}</span>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" className="flex-1" onClick={() => setActiveTab("public")}>
                        <Eye className="w-4 h-4 mr-1" />
                        Preview
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1">
                        Share
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Seamless Team Registration Section */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Quick Team Registration Widget */}
                <QuickTeamRegistration 
                  tournamentId={selectedTournament.id} 
                  orgId={selectedTournament.orgId}
                  onTeamRegistered={() => {
                    // Refresh data if needed
                  }}
                />
                
                {/* Advanced Team Selection */}
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">Team Registration</CardTitle>
                        <CardDescription>Register teams for this tournament</CardDescription>
                      </div>
                      <div className="flex space-x-2">
                        <SeamlessTeamSelector 
                          tournamentId={selectedTournament.id}
                          orgId={selectedTournament.orgId}
                          mode="bulk"
                          trigger={
                            <Button>
                              <Plus className="w-4 h-4 mr-2" />
                              Register Team
                            </Button>
                          }
                        />
                        <SeamlessTeamSelector 
                          tournamentId={selectedTournament.id}
                          orgId={selectedTournament.orgId}
                          mode="bulk"
                          trigger={
                            <Button variant="outline">
                              <Users className="w-4 h-4 mr-2" />
                              Bulk Register
                            </Button>
                          }
                        />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <RegisteredTeamsDashboard 
                      tournamentId={selectedTournament.id}
                      canManageRegistrations={true}
                    />
                  </CardContent>
                </Card>
              </div>

              {/* Quick Actions Bar */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Quick Actions</CardTitle>
                  <CardDescription>Common tournament management tasks</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-3">
                    <GenerateFixturesDialog 
                      tournamentId={selectedTournament.id}
                    />
                    <Button variant="outline" size="sm" onClick={() => setActiveTab("fixtures")}>
                      <Calendar className="w-4 h-4 mr-2" />
                      View Fixtures
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setActiveTab("standings")}>
                      <BarChart3 className="w-4 h-4 mr-2" />
                      View Standings
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4 mr-2" />
                      Export Report
                    </Button>
                    <Button variant="outline" size="sm">
                      <Target className="w-4 h-4 mr-2" />
                      Tournament Stats
                    </Button>
                    <Button 
                      size="sm" 
                      variant={selectedTournament.isPublished ? "outline" : "default"}
                      onClick={() => handleTogglePublished(selectedTournament)}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      {selectedTournament.isPublished ? 'Unpublish' : 'Publish'} Tournament
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="text-center py-12">
              <Trophy className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 text-sm font-semibold text-gray-900">No tournament selected</h3>
              <p className="mt-1 text-sm text-gray-500">Select a tournament to access the management hub and all tournament operations.</p>
              <div className="mt-6">
                <Button onClick={() => setActiveTab("tournaments")}>
                  <Trophy className="w-4 h-4 mr-2" />
                  View Tournaments
                </Button>
              </div>
            </div>
          )}
        </TabsContent>

        {/* Structure Tab - Complete Structure Management */}
        <TabsContent value="structure" className="space-y-6">
          {selectedTournament ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold">Tournament Structure Management</h2>
                  <p className="text-muted-foreground">{selectedTournament.name} - Complete Structure Configuration</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Export All
                  </Button>
                </div>
              </div>
              
              {/* Structure content controlled by sidebar submenu */}
              <Tabs value={managementTab} onValueChange={setManagementTab} className="w-full">
                {/* Stages Management */}
                <TabsContent value="stages" className="mt-6">
                  <StageManager 
                    tournamentId={selectedTournament.id}
                    tournamentName={selectedTournament.name}
                    tournamentFormat={selectedTournament.tournamentModel}
                  />
                </TabsContent>

                {/* Teams Management */}
                <TabsContent value="teams" className="mt-6">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-xl font-semibold">Participating Teams</h2>
                        <p className="text-muted-foreground">{selectedTournament.name} - Teams registered and approved for tournament</p>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          onClick={() => setManagementTab('team-registrations')}
                          className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Registration Queue
                        </Button>
                        <SeamlessTeamSelector 
                          tournamentId={selectedTournament.id}
                          orgId={selectedTournament.orgId}
                          mode="bulk"
                          trigger={
                            <Button>
                              <Plus className="w-4 h-4 mr-2" />
                              Register Team
                            </Button>
                          }
                        />
                        <Button variant="outline">
                          <Download className="w-4 h-4 mr-2" />
                          Export Teams
                        </Button>
                      </div>
                    </div>
                    
                    <Alert className="bg-blue-50 border-blue-200">
                      <AlertCircle className="h-4 w-4 text-blue-600" />
                      <AlertTitle className="text-blue-900">About Teams & Registrations</AlertTitle>
                      <AlertDescription className="text-blue-800">
                        <strong>This tab shows:</strong> Teams that are already participating in the tournament (approved teams).
                        <br />
                        <strong>To approve/reject pending registrations:</strong> Go to the <strong>Registration Queue</strong> tab.
                      </AlertDescription>
                    </Alert>
                    
                    <NextStepsGuide 
                      tournamentId={selectedTournament.id}
                      hasGroups={(tournamentGroups?.length ?? 0) > 0}
                      hasTeamAssignments={(teamGroups?.length ?? 0) > 0}
                      hasStages={(tournamentStages?.length ?? 0) > 0}
                      hasRounds={(matches?.length ?? 0) > 0}
                      hasMatches={(matches?.length ?? 0) > 0}
                      isActive={selectedTournament.status === 'ACTIVE'}
                      onNavigateToTab={setActiveTab}
                    />
                    
                    <QuickTeamRegistration 
                      tournamentId={selectedTournament.id} 
                      orgId={selectedTournament.orgId}
                    />
                    
                    <RegisteredTeamsDashboard 
                      tournamentId={selectedTournament.id}
                      canManageRegistrations={true}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium text-muted-foreground">
                            Registered Teams
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold text-blue-600">
                            {tournamentTeams?.length || 0}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Active registrations
                          </p>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium text-muted-foreground">
                            Total Players
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold text-green-600">
                            {tournamentPlayers?.length || 0}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Across all teams
                          </p>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium text-muted-foreground">
                            Average Squad Size
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold text-purple-600">
                            {tournamentTeams?.length ? Math.round((tournamentPlayers?.length || 0) / tournamentTeams.length) : 0}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Players per team
                          </p>
                        </CardContent>
                      </Card>
                    </div>

                    {tournamentTeams && tournamentTeams.length > 0 && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Registered Teams</CardTitle>
                          <CardDescription>Teams participating in this tournament</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {tournamentTeams.map((team: any) => (
                              <Card key={team.id} className="p-4 hover:shadow-md transition-shadow">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <Users className="w-5 h-5 text-blue-600" />
                                  </div>
                                  <div className="flex-1">
                                    <h4 className="font-medium">{team.name}</h4>
                                    <p className="text-sm text-muted-foreground">
                                      Status: {team.registration_status || 'Registered'}
                                    </p>
                                  </div>
                                </div>
                              </Card>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </TabsContent>

                {/* Groups Management */}
                <TabsContent value="groups" className="mt-6">
                  <TeamGroupManager tournamentId={selectedTournament.id} />
                </TabsContent>

                {/* Venues Management */}
                <TabsContent value="venues" className="mt-6">
                  <VenueManager tournamentId={selectedTournament.id} />
                </TabsContent>

                {/* Team Registration Management */}
                <TabsContent value="team-registrations" className="mt-6">
                  <TournamentTeamRegistrationAdmin 
                    tournamentId={selectedTournament.id}
                    tournamentName={selectedTournament.name}
                  />
                </TabsContent>

                {/* Enterprise Fixture Manager */}
                <TabsContent value="jamii-fixtures" className="mt-6">
                  <EnterpriseFixtureManager 
                    tournamentId={selectedTournament.id}
                    tournamentName={selectedTournament.name}
                    onFixturesGenerated={(fixtures) => {
                      console.log('Enterprise fixtures generated:', fixtures);
                      toast({
                        title: "Enterprise Fixtures Generated",
                        description: `Generated ${fixtures.length} professional fixtures for ${selectedTournament.name}`
                      });
                    }}
                  />
                </TabsContent>
              </Tabs>
            </div>
          ) : (
            <div className="text-center py-12">
              <Settings className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 text-sm font-semibold text-gray-900">No tournament selected</h3>
              <p className="mt-1 text-sm text-gray-500">Select a tournament to access comprehensive structure management tools.</p>
              <div className="mt-6">
                <Button onClick={() => setActiveTab("tournaments")}>
                  <Trophy className="w-4 h-4 mr-2" />
                  View Tournaments
                </Button>
              </div>
            </div>
          )}
        </TabsContent>

        {/* Standings Tab */}
        <TabsContent value="standings" className="space-y-6">
          {selectedTournamentId ? (
            <div className="space-y-6">
              {/* All Fixtures/Matches Section */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Tournament Fixtures</CardTitle>
                      <CardDescription>All matches for this tournament</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant="secondary">
                        {matches.length} total
                      </Badge>
                      <Badge className="bg-green-500">
                        {matches.filter(m => m?.match?.status === "COMPLETED" || m?.status === "COMPLETED").length} completed
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {matches.length > 0 ? (
                    <div className="space-y-4">
                      {/* Completed Matches */}
                      {matches.filter(m => m?.match?.status === "COMPLETED" || m?.status === "COMPLETED").length > 0 && (
                        <div>
                          <h3 className="font-semibold text-sm mb-3 text-green-600">Completed Matches</h3>
                          <div className="space-y-2">
                            {matches
                              .filter(m => m?.match?.status === "COMPLETED" || m?.status === "COMPLETED")
                              .slice(0, 5)
                              .map((match, index) => {
                                const homeTeam = match.homeTeam || match.home_team;
                                const awayTeam = match.awayTeam || match.away_team;
                                const homeScore = match.match?.homeScore ?? match.homeScore ?? match.home_score ?? 0;
                                const awayScore = match.match?.awayScore ?? match.awayScore ?? match.away_score ?? 0;
                                const matchDate = match.match?.kickoff || match.kickoff;
                                
                                return (
                                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors bg-green-50">
                                    <div className="flex-1">
                                      <div className="flex items-center justify-between">
                                        <span className="font-medium">{homeTeam?.name || 'TBD'}</span>
                                        <span className="text-lg font-bold mx-4">{homeScore}</span>
                                      </div>
                                      <div className="flex items-center justify-between mt-1">
                                        <span className="font-medium">{awayTeam?.name || 'TBD'}</span>
                                        <span className="text-lg font-bold mx-4">{awayScore}</span>
                                      </div>
                                    </div>
                                    <div className="ml-4 text-right">
                                      <div className="text-xs text-muted-foreground">
                                        {matchDate ? new Date(matchDate).toLocaleDateString() : 'TBD'}
                                      </div>
                                      <Badge className="mt-1 bg-green-500">FT</Badge>
                                    </div>
                                  </div>
                                );
                              })}
                          </div>
                        </div>
                      )}

                      {/* Upcoming/Scheduled Matches */}
                      {matches.filter(m => (m?.match?.status || m?.status) !== "COMPLETED").length > 0 && (
                        <div>
                          <h3 className="font-semibold text-sm mb-3 text-blue-600">Upcoming Fixtures</h3>
                          <div className="space-y-2">
                            {matches
                              .filter(m => (m?.match?.status || m?.status) !== "COMPLETED")
                              .slice(0, 10)
                              .map((match, index) => {
                                const homeTeam = match.homeTeam || match.home_team;
                                const awayTeam = match.awayTeam || match.away_team;
                                const matchDate = match.match?.kickoff || match.kickoff;
                                const venue = match.match?.venue || match.venue;
                                const round = match.round || match.rounds;
                                
                                return (
                                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                                    <div className="flex-1">
                                      <div className="flex items-center justify-between">
                                        <span className="font-medium">{homeTeam?.name || 'TBD'}</span>
                                        <span className="text-sm text-muted-foreground mx-4">vs</span>
                                      </div>
                                      <div className="flex items-center justify-between mt-1">
                                        <span className="font-medium">{awayTeam?.name || 'TBD'}</span>
                                        <span className="text-sm text-muted-foreground mx-4"></span>
                                      </div>
                                      {venue && (
                                        <div className="text-xs text-muted-foreground mt-1">
                                          📍 {venue}
                                        </div>
                                      )}
                                    </div>
                                    <div className="ml-4 text-right">
                                      <div className="text-xs text-muted-foreground">
                                        {round?.name || 'Round TBD'}
                                      </div>
                                      <div className="text-xs font-medium mt-1">
                                        {matchDate ? new Date(matchDate).toLocaleDateString() : 'TBD'}
                                      </div>
                                      <Badge className="mt-1" variant="outline">Scheduled</Badge>
                                    </div>
                                  </div>
                                );
                              })}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <p>No fixtures found</p>
                      <p className="text-sm mt-1">Generate fixtures in Jamii Fixtures tab</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Standings Table */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold">Tournament Standings</h2>
                  {selectedTournament && (
                    <p className="text-muted-foreground">{selectedTournament.name}</p>
                  )}
                </div>
                <Button variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Export Standings
                </Button>
              </div>
              
              {standingsData.length > 0 ? (
                <div className="space-y-6">
                  {/* Group standings by group name */}
                  {Array.from(new Set(standingsData.map(s => s.groupName))).sort().map(groupName => {
                    const groupStandings = standingsData.filter(s => s.groupName === groupName);
                    return (
                      <div key={groupName}>
                        <h3 className="text-lg font-semibold mb-3">{groupName}</h3>
                        <StandingsTable standings={groupStandings} showForm={true} />
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <BarChart3 className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-2 text-sm font-semibold text-gray-900">No standings available</h3>
                  <p className="mt-1 text-sm text-gray-500">Standings will appear once matches are played and results recorded.</p>
                  <Button className="mt-4" onClick={() => setActiveTab("jamii-fixtures")}>
                    Update Match Scores
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <BarChart3 className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 text-sm font-semibold text-gray-900">Select a tournament</h3>
              <p className="mt-1 text-sm text-gray-500">Choose a tournament to view its standings.</p>
              <div className="mt-6">
                <Button onClick={() => setActiveTab("tournaments")}>
                  Select Tournament
                </Button>
              </div>
            </div>
          )}
        </TabsContent>

        {/* Public View Tab */}
        <TabsContent value="public" className="space-y-6">
          {selectedTournament ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold">Public Tournament View</h2>
                  <p className="text-muted-foreground">Preview and share public tournament information</p>
                </div>
                <Button variant="outline" onClick={() => {
                  const publicUrl = `${window.location.origin}/public/tournament/${selectedTournament.id}`;
                  navigator.clipboard.writeText(publicUrl);
                  toast({ title: "Link copied!", description: "Public tournament link copied to clipboard" });
                }}>
                  <Eye className="w-4 h-4 mr-2" />
                  Copy Public Link
                </Button>
              </div>

              {/* Tournament Public Info */}
              <Card>
                <CardHeader>
                  <CardTitle>Tournament Information</CardTitle>
                  <CardDescription>Information visible to the public</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Tournament Name</p>
                      <p className="text-lg font-semibold">{selectedTournament.name}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Status</p>
                      <Badge className={statusColors[selectedTournament.status]}>{selectedTournament.status}</Badge>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Season</p>
                      <p>{selectedTournament.season}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Tournament Type</p>
                      <p>{modelLabels[selectedTournament.tournamentModel]}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Public Standings Preview */}
              {standingsData.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Current Standings</CardTitle>
                    <CardDescription>Live standings visible to fans</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {Array.from(new Set(standingsData.map((s: any) => s.groupName))).sort().slice(0, 2).map((groupName) => {
                      const groupStandings = standingsData.filter((s: any) => s.groupName === groupName);
                      return (
                        <div key={groupName} className="mb-4">
                          <h4 className="font-semibold mb-2">{groupName}</h4>
                          <StandingsTable standings={groupStandings.slice(0, 5)} showForm={false} />
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>
              )}

              {/* Recent Matches */}
              {matches.filter(m => m?.match?.status === "COMPLETED" || m?.status === "COMPLETED").length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Results</CardTitle>
                    <CardDescription>Latest match results</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {matches
                        .filter(m => m?.match?.status === "COMPLETED" || m?.status === "COMPLETED")
                        .slice(0, 5)
                        .map((match, index) => {
                          const homeTeam = match.homeTeam || match.home_team;
                          const awayTeam = match.awayTeam || match.away_team;
                          const homeScore = match.match?.homeScore ?? match.homeScore ?? match.home_score ?? 0;
                          const awayScore = match.match?.awayScore ?? match.awayScore ?? match.away_score ?? 0;
                          
                          return (
                            <div key={index} className="flex items-center justify-between p-3 border rounded-lg bg-green-50">
                              <div className="flex-1">
                                <div className="flex items-center justify-between">
                                  <span className="font-medium">{homeTeam?.name || 'TBD'}</span>
                                  <span className="text-lg font-bold mx-4">{homeScore}</span>
                                </div>
                                <div className="flex items-center justify-between mt-1">
                                  <span className="font-medium">{awayTeam?.name || 'TBD'}</span>
                                  <span className="text-lg font-bold mx-4">{awayScore}</span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <Target className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 text-sm font-semibold text-gray-900">Select a tournament</h3>
              <p className="mt-1 text-sm text-gray-500">Choose a tournament to view its public page.</p>
              <Button className="mt-6" onClick={() => setActiveTab("tournaments")}>
                Select Tournament
              </Button>
            </div>
          )}
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          {selectedTournament ? (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold">Tournament Settings</h2>
                <p className="text-muted-foreground">Configure tournament rules and display options</p>
              </div>

              {/* Scoring Settings */}
              <Card>
                <CardHeader>
                  <CardTitle>Scoring Rules</CardTitle>
                  <CardDescription>Points awarded for match results</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label>Win</Label>
                      <Input type="number" defaultValue="3" className="mt-1" />
                    </div>
                    <div>
                      <Label>Draw</Label>
                      <Input type="number" defaultValue="1" className="mt-1" />
                    </div>
                    <div>
                      <Label>Loss</Label>
                      <Input type="number" defaultValue="0" className="mt-1" />
                    </div>
                  </div>
                  <Button size="sm" disabled>
                    <Save className="w-4 h-4 mr-2" />
                    Save Scoring Rules
                  </Button>
                </CardContent>
              </Card>

              {/* Display Settings */}
              <Card>
                <CardHeader>
                  <CardTitle>Display Options</CardTitle>
                  <CardDescription>Customize how tournament information is displayed</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Show team logos</p>
                      <p className="text-sm text-muted-foreground">Display team logos in fixtures and standings</p>
                    </div>
                    <input type="checkbox" defaultChecked className="h-5 w-5" disabled />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Show player statistics</p>
                      <p className="text-sm text-muted-foreground">Display individual player stats in public view</p>
                    </div>
                    <input type="checkbox" defaultChecked className="h-5 w-5" disabled />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Enable live updates</p>
                      <p className="text-sm text-muted-foreground">Real-time score updates via WebSocket</p>
                    </div>
                    <input type="checkbox" defaultChecked className="h-5 w-5" disabled />
                  </div>
                </CardContent>
              </Card>

              {/* Notification Settings */}
              <Card>
                <CardHeader>
                  <CardTitle>Notifications</CardTitle>
                  <CardDescription>Configure tournament notifications</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Match result notifications</p>
                      <p className="text-sm text-muted-foreground">Notify when match results are recorded</p>
                    </div>
                    <input type="checkbox" defaultChecked className="h-5 w-5" disabled />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Team registration alerts</p>
                      <p className="text-sm text-muted-foreground">Notify when teams register or need approval</p>
                    </div>
                    <input type="checkbox" defaultChecked className="h-5 w-5" disabled />
                  </div>
                </CardContent>
              </Card>

              <div className="text-sm text-muted-foreground italic">
                💡 Settings persistence coming soon - values are currently display-only
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <Settings className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 text-sm font-semibold text-gray-900">Select a tournament</h3>
              <p className="mt-1 text-sm text-gray-500">Choose a tournament to configure its settings.</p>
              <Button className="mt-6" onClick={() => setActiveTab("tournaments")}>
                Select Tournament
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Edit Tournament Dialog */}
      {showEditDialog && editingTournament && (
        <EditTournamentDialog
          tournament={editingTournament}
          open={showEditDialog}
          onOpenChange={setShowEditDialog}
        />
      )}

      {/* Create Tournament Dialog */}
      <Dialog open={isCreateTournamentDialogOpen} onOpenChange={setIsCreateTournamentDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Tournament</DialogTitle>
            <DialogDescription>
              Create a new tournament. You can choose to affiliate it with an organization or keep it independent.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleCreateTournament)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tournament Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter tournament name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="slug"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>URL Slug</FormLabel>
                      <FormControl>
                        <Input placeholder="tournament-name-2025" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="orgId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Organization</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select organization" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="independent">Independent Tournament</SelectItem>
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
                  name="sportId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sport *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select sport" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {sports.map((sport: any) => (
                            <SelectItem key={sport.id} value={sport.id}>
                              {sport.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="season"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Season *</FormLabel>
                      <FormControl>
                        <Input placeholder="2025" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="tournamentModel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tournament Model *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select model" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="INDEPENDENT">Independent</SelectItem>
                          <SelectItem value="ADMINISTRATIVE_WARD">Administrative - Ward</SelectItem>
                          <SelectItem value="ADMINISTRATIVE_SUB_COUNTY">Administrative - Sub County</SelectItem>
                          <SelectItem value="ADMINISTRATIVE_COUNTY">Administrative - County</SelectItem>
                          <SelectItem value="ADMINISTRATIVE_NATIONAL">Administrative - National</SelectItem>
                          <SelectItem value="INTER_COUNTY">Inter-County</SelectItem>
                          <SelectItem value="LEAGUE">League</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Administrative Area Selection (conditional based on tournament model) */}
              {(selectedTournamentModel === "ADMINISTRATIVE_WARD" || 
                selectedTournamentModel === "ADMINISTRATIVE_SUB_COUNTY" || 
                selectedTournamentModel === "ADMINISTRATIVE_COUNTY" || 
                selectedTournamentModel === "INTER_COUNTY") && (
                <div className="space-y-4">
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-yellow-600" />
                      <p className="text-sm text-yellow-800 font-medium">
                        Administrative Area Required
                      </p>
                    </div>
                    <p className="text-sm text-yellow-700 mt-1">
                      {selectedTournamentModel === "ADMINISTRATIVE_WARD" && "Ward, Sub-County, and County selection required for ward-level tournaments."}
                      {selectedTournamentModel === "ADMINISTRATIVE_SUB_COUNTY" && "Sub-County and County selection required for sub-county tournaments."}
                      {selectedTournamentModel === "ADMINISTRATIVE_COUNTY" && "County selection required for county-level tournaments."}
                      {selectedTournamentModel === "INTER_COUNTY" && "County selection required for inter-county tournaments."}
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    {/* County Selection */}
                    <FormField
                      control={form.control}
                      name="countyId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            County *
                          </FormLabel>
                          <Select onValueChange={(value) => {
                            field.onChange(value);
                            // Clear dependent fields when county changes
                            form.setValue('subCountyId', '');
                            form.setValue('wardId', '');
                          }} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select county" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {counties.map((county) => (
                                <SelectItem key={county.id} value={county.id}>
                                  {county.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Sub-County Selection (only if county selected and sub-county required) */}
                    {selectedCountyId && (selectedTournamentModel === "ADMINISTRATIVE_WARD" || selectedTournamentModel === "ADMINISTRATIVE_SUB_COUNTY") && (
                      <FormField
                        control={form.control}
                        name="subCountyId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Sub-County *
                            </FormLabel>
                            <Select onValueChange={(value) => {
                              field.onChange(value);
                              // Clear ward when sub-county changes
                              form.setValue('wardId', '');
                            }} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select sub-county" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {subCounties.map((subCounty) => (
                                  <SelectItem key={subCounty.id} value={subCounty.id}>
                                    {subCounty.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}

                    {/* Ward Selection (only if sub-county selected and ward required) */}
                    {selectedSubCountyId && selectedTournamentModel === "ADMINISTRATIVE_WARD" && (
                      <FormField
                        control={form.control}
                        name="wardId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Ward *
                            </FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select ward" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {wards.map((ward) => (
                                  <SelectItem key={ward.id} value={ward.id}>
                                    {ward.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="federationType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Federation Type *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="FKF">Football Kenya Federation</SelectItem>
                          <SelectItem value="SCHOOLS">Schools</SelectItem>
                          <SelectItem value="CORPORATE">Corporate</SelectItem>
                          <SelectItem value="OTHER">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>End Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Geographic fields temporarily simplified for CRUD functionality */}
              <div className="text-sm text-muted-foreground">
                Geographic restrictions (County/Sub-County/Ward) can be configured after creation.
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsCreateTournamentDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isCreateTournamentLoading}>
                  {isCreateTournamentLoading ? "Creating..." : "Create Tournament"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Edit Tournament Dialog */}
      <Dialog open={isEditTournamentDialogOpen} onOpenChange={setIsEditTournamentDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Tournament</DialogTitle>
            <DialogDescription>
              Update tournament information. You can change organization affiliation or make it independent.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleUpdateTournament)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tournament Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter tournament name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="slug"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>URL Slug</FormLabel>
                      <FormControl>
                        <Input placeholder="tournament-name-2025" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="orgId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Organization</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select organization" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="independent">Independent Tournament</SelectItem>
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
                  name="sportId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sport *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select sport" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {sports.map((sport: any) => (
                            <SelectItem key={sport.id} value={sport.id}>
                              {sport.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-4 gap-4">
                <FormField
                  control={form.control}
                  name="season"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Season *</FormLabel>
                      <FormControl>
                        <Input placeholder="2025" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="DRAFT">Draft</SelectItem>
                          <SelectItem value="REGISTRATION">Registration Open</SelectItem>
                          <SelectItem value="ACTIVE">Active</SelectItem>
                          <SelectItem value="COMPLETED">Completed</SelectItem>
                          <SelectItem value="ARCHIVED">Archived</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="tournamentModel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tournament Model *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select model" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="INDEPENDENT">Independent</SelectItem>
                          <SelectItem value="ADMINISTRATIVE_WARD">Administrative - Ward</SelectItem>
                          <SelectItem value="ADMINISTRATIVE_SUB_COUNTY">Administrative - Sub County</SelectItem>
                          <SelectItem value="ADMINISTRATIVE_COUNTY">Administrative - County</SelectItem>
                          <SelectItem value="ADMINISTRATIVE_NATIONAL">Administrative - National</SelectItem>
                          <SelectItem value="INTER_COUNTY">Inter-County</SelectItem>
                          <SelectItem value="LEAGUE">League</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="federationType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Federation Type *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="FKF">Football Kenya Federation</SelectItem>
                          <SelectItem value="SCHOOLS">Schools</SelectItem>
                          <SelectItem value="CORPORATE">Corporate</SelectItem>
                          <SelectItem value="OTHER">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>End Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Geographic fields temporarily simplified for CRUD functionality */}
              <div className="text-sm text-muted-foreground">
                Geographic restrictions (County/Sub-County/Ward) can be configured after creation.
              </div>

              {/* Venue Preferences */}
              <div className="space-y-2">
                <Label>Preferred Venues (Optional)</Label>
                <p className="text-xs text-muted-foreground">
                  Select venues that will be available for this tournament's matches
                </p>
                {venuesLoading ? (
                  <p className="text-sm text-muted-foreground">Loading venues...</p>
                ) : venues.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No venues available. Create venues first.</p>
                ) : (
                  <div className="border rounded-lg p-3 max-h-48 overflow-y-auto space-y-2">
                    {venues.map((venue) => (
                      <div key={venue.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`venue-superhub-${venue.id}`}
                          checked={selectedVenues.includes(venue.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedVenues([...selectedVenues, venue.id]);
                            } else {
                              setSelectedVenues(selectedVenues.filter((id) => id !== venue.id));
                            }
                          }}
                        />
                        <label
                          htmlFor={`venue-superhub-${venue.id}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                        >
                          {venue.name} {venue.location && `- ${venue.location}`}
                        </label>
                      </div>
                    ))}
                  </div>
                )}
                {selectedVenues.length > 0 && (
                  <p className="text-xs text-blue-600">
                    {selectedVenues.length} venue(s) selected
                  </p>
                )}
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsEditTournamentDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isUpdateTournamentLoading}>
                  {isUpdateTournamentLoading ? "Updating..." : "Update Tournament"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Tournament Alert Dialog */}
      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Tournament</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{selectedTournament?.name}"? This action cannot be undone and will remove all tournament data including fixtures, results, and registrations.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDeleteTournament}
              disabled={isDeleteTournamentLoading}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleteTournamentLoading ? "Deleting..." : "Delete Tournament"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
        </div>
      </div>
    </div>
  );
}