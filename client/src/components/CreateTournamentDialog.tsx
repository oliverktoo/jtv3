import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useCreateTournament } from "@/hooks/useTournaments";
import { useOrganizations, useSports } from "@/hooks/useReferenceData";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import GeographicSelector from "./GeographicSelector";

const tournamentModels = [
  { value: "ADMINISTRATIVE_WARD", label: "Ward Level", description: "Teams from the selected ward can participate" },
  { value: "ADMINISTRATIVE_SUB_COUNTY", label: "Sub-County Level", description: "Teams from the selected sub-county can participate" },
  { value: "ADMINISTRATIVE_COUNTY", label: "County Level", description: "Teams from the selected county can participate" },
  { value: "ADMINISTRATIVE_NATIONAL", label: "National Level", description: "Teams from across the nation can participate" },
  { value: "INTER_COUNTY", label: "Inter-County", description: "Open to teams from multiple counties" },
  { value: "INDEPENDENT", label: "Independent", description: "Open to any registered team" },
  { value: "LEAGUE", label: "League System", description: "Restricted to teams from your organization" },
];

interface CreateTournamentDialogProps {
  trigger?: React.ReactNode;
}

export default function CreateTournamentDialog({
  trigger,
}: CreateTournamentDialogProps) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [selectedModel, setSelectedModel] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    season: "",
    sportId: "",
    orgId: "",
    startDate: "",
    endDate: "",
    // Geographic fields
    countyId: "",
    subCountyId: "",
    wardId: "",
    // Location names for display
    countyName: "",
    subCountyName: "",
    wardName: "",
    // Venue preferences
    preferredVenues: [] as string[],
  });

  const { toast } = useToast();
  const createTournament = useCreateTournament();
  const { data: organizations, isLoading: orgsLoading, error: orgsError } = useOrganizations();
  const { data: sports, isLoading: sportsLoading, error: sportsError } = useSports();
  
  // State for venues
  const [venues, setVenues] = useState<any[]>([]);
  const [venuesLoading, setVenuesLoading] = useState(false);
  
  // Use fallback orgId if no organizations loaded from API
  const orgId = organizations?.[0]?.id || "550e8400-e29b-41d4-a716-446655440001";

  // Fetch venues
  useEffect(() => {
    fetchVenues();
  }, []);

  const fetchVenues = async () => {
    try {
      setVenuesLoading(true);
      const data = await apiRequest('GET', '/api/fixtures/venues');
      if (data.success && data.venues) {
        setVenues(data.venues);
      }
    } catch (error) {
      console.error('Failed to fetch venues:', error);
    } finally {
      setVenuesLoading(false);
    }
  };

  // Auto-select organization logic
  useEffect(() => {
    if (organizations && organizations.length > 0) {
      // For LEAGUE tournaments: only auto-select if there's exactly one org
      if (selectedModel === "LEAGUE" && organizations.length === 1 && !formData.orgId) {
        setFormData(prev => ({ ...prev, orgId: organizations[0].id }));
      }
      // For non-LEAGUE tournaments: auto-select the first available org for administrative purposes
      else if (selectedModel && selectedModel !== "LEAGUE" && !formData.orgId) {
        setFormData(prev => ({ ...prev, orgId: organizations[0].id }));
      }
    }
  }, [organizations, selectedModel, formData.orgId]);

  const handleModelSelect = (model: string) => {
    setSelectedModel(model);
    setStep(2);
  };

  // Helper function to determine geographic level required
  const getGeographicLevel = (model: string): 'ward' | 'sub-county' | 'county' | 'none' => {
    switch (model) {
      case 'ADMINISTRATIVE_WARD':
        return 'ward';
      case 'ADMINISTRATIVE_SUB_COUNTY':
        return 'sub-county';
      case 'ADMINISTRATIVE_COUNTY':
        return 'county';
      case 'INTER_COUNTY':
        return 'county'; // Start from county level for multi-county
      case 'ADMINISTRATIVE_NATIONAL':
      case 'INDEPENDENT':
      case 'LEAGUE':
      default:
        return 'none';
    }
  };

  // Helper function to get geographic level description
  const getGeographicDescription = (model: string): string => {
    switch (model) {
      case 'ADMINISTRATIVE_WARD':
        return 'Select the specific ward, sub-county, and county. All three levels are required for ward-level tournaments.';
      case 'ADMINISTRATIVE_SUB_COUNTY':
        return 'Select the constituency/sub-county and county. Both are required for sub-county tournaments.';
      case 'ADMINISTRATIVE_COUNTY':
        return 'Select the county for this tournament. Only county selection is required.';
      case 'INTER_COUNTY':
        return 'Select the primary county. County selection is required for inter-county tournaments.';
      default:
        return '';
    }
  };

  const handleLocationChange = (location: any) => {
    setFormData(prev => ({
      ...prev,
      countyId: location.countyId || '',
      subCountyId: location.subCountyId || '',
      wardId: location.wardId || '',
      countyName: location.county || '',
      subCountyName: location.subCounty || '',
      wardName: location.ward || '',
    }));
  };

  const handleSubmit = async () => {
    // Validate organization selection - only required for LEAGUE tournaments
    if (selectedModel === "LEAGUE" && !formData.orgId) {
      toast({
        title: "Error", 
        description: "Please select an organization for league tournaments",
        variant: "destructive",
      });
      return;
    }

    // Validate basic fields
    if (!formData.name || !formData.season || !formData.sportId || !formData.startDate || !formData.endDate) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    // Validate geographic requirements - comprehensive hierarchical validation
    const validateAdministrativeArea = (model: string, data: any) => {
      // Ward-level tournaments require ward, sub-county, and county
      if (model === "ADMINISTRATIVE_WARD") {
        if (!data.wardId) return { valid: false, error: "Ward selection is required for ward-level tournaments" };
        if (!data.subCountyId) return { valid: false, error: "Sub-county selection is required for ward-level tournaments" };
        if (!data.countyId) return { valid: false, error: "County selection is required for ward-level tournaments" };
      }
      
      // Sub-county tournaments require sub-county and county
      if (model === "ADMINISTRATIVE_SUB_COUNTY") {
        if (!data.subCountyId) return { valid: false, error: "Sub-county selection is required for sub-county tournaments" };
        if (!data.countyId) return { valid: false, error: "County selection is required for sub-county tournaments" };
      }
      
      // County tournaments require county
      if (model === "ADMINISTRATIVE_COUNTY") {
        if (!data.countyId) return { valid: false, error: "County selection is required for county-level tournaments" };
      }
      
      // Inter-county tournaments require at least one county
      if (model === "INTER_COUNTY") {
        if (!data.countyId) return { valid: false, error: "County selection is required for inter-county tournaments" };
      }
      
      return { valid: true };
    };

    // Apply enhanced geographic validation
    const validation = validateAdministrativeArea(selectedModel, formData);
    if (!validation.valid) {
      toast({
        title: "Administrative Area Required",
        description: validation.error,
        variant: "destructive",
      });
      return;
    }

    try {
      const slug = formData.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
      
      // Determine participation model based on tournament type first
      const participationModel = (() => {
        switch (selectedModel) {
          case "LEAGUE":
            return "ORGANIZATIONAL";
          case "ADMINISTRATIVE_WARD":
          case "ADMINISTRATIVE_SUB_COUNTY":  
          case "ADMINISTRATIVE_COUNTY":
          case "ADMINISTRATIVE_NATIONAL":
            return "GEOGRAPHIC";
          case "INTER_COUNTY":
          case "INDEPENDENT":
            return "OPEN";
          default:
            return "ORGANIZATIONAL";
        }
      })();
      
      // Determine organization assignment based on tournament type and participation model
      let tournamentOrgId;
      
      if (selectedModel === "LEAGUE") {
        // League tournaments must be associated with the selected organization
        tournamentOrgId = formData.orgId;
      } else if (participationModel === "OPEN" && (selectedModel === "INDEPENDENT" || selectedModel === "INTER_COUNTY")) {
        // Independent/Inter-county tournaments use the first available organization as system organizer
        // This is for administrative purposes only - teams from any org can participate
        tournamentOrgId = organizations?.[0]?.id || orgId;
      } else {
        // Other tournament types use selected org or fallback
        tournamentOrgId = formData.orgId || organizations?.[0]?.id || orgId;
      }

      await createTournament.mutateAsync({
        orgId: tournamentOrgId,
        sportId: formData.sportId,
        name: formData.name,
        slug,
        season: formData.season,
        tournamentModel: selectedModel as any,
        participationModel: participationModel as any,
        startDate: formData.startDate,
        endDate: formData.endDate,
        status: "DRAFT",
        isPublished: false,
        // Geographic data
        countyId: formData.countyId || undefined,
        subCountyId: formData.subCountyId || undefined,
        wardId: formData.wardId || undefined,
        // Venue preferences
        preferredVenues: formData.preferredVenues.length > 0 ? formData.preferredVenues : undefined,
      });

      toast({
        title: "Success",
        description: `Tournament "${formData.name}" created successfully`,
      });

      setOpen(false);
      setStep(1);
      setSelectedModel("");
      setFormData({ 
        name: "", 
        season: "", 
        sportId: "",
        orgId: "",
        startDate: "", 
        endDate: "",
        countyId: "",
        subCountyId: "",
        wardId: "",
        countyName: "",
        subCountyName: "",
        wardName: "",
        preferredVenues: [],
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create tournament",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button data-testid="button-create-tournament">
            <Plus className="h-4 w-4 mr-2" />
            Create Tournament
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Tournament</DialogTitle>
          <DialogDescription>
            {step === 1
              ? "Select the tournament model that best fits your needs"
              : "Fill in the tournament details"}
          </DialogDescription>
        </DialogHeader>

        {step === 1 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            {tournamentModels.map((model) => (
              <Card
                key={model.value}
                className="p-4 hover-elevate cursor-pointer"
                onClick={() => handleModelSelect(model.value)}
                data-testid={`card-model-${model.value}`}
              >
                <h4 className="font-semibold mb-1">{model.label}</h4>
                <p className="text-sm text-muted-foreground">
                  {model.description}
                </p>
              </Card>
            ))}
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Tournament Name</Label>
              <Input
                id="name"
                placeholder="e.g., Nairobi County Championship"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                data-testid="input-tournament-name"
              />
            </div>

            {/* Organization field - Only show for LEAGUE tournaments */}
            {selectedModel === "LEAGUE" && (
              <div className="space-y-2">
                <Label htmlFor="organization">Organization *</Label>
                <Select
                  value={formData.orgId}
                  onValueChange={(value) =>
                    setFormData({ ...formData, orgId: value })
                  }
                >
                  <SelectTrigger data-testid="select-organization">
                    <SelectValue placeholder="Select organization" />
                  </SelectTrigger>
                  <SelectContent>
                    {orgsLoading ? (
                      <SelectItem value="" disabled>Loading organizations...</SelectItem>
                    ) : organizations && organizations.length > 0 ? (
                      organizations.map((org) => (
                        <SelectItem key={org.id} value={org.id}>
                          {org.name}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="" disabled>No organizations available</SelectItem>
                    )}
                  </SelectContent>
                </Select>
                {organizations && organizations.length === 1 && formData.orgId && (
                  <p className="text-xs text-muted-foreground">
                    Automatically selected the only available organization.
                  </p>
                )}
                {!organizations || organizations.length === 0 ? (
                  <p className="text-xs text-yellow-600">
                    No organizations available. Please create an organization first.
                  </p>
                ) : null}
                <p className="text-xs text-blue-600">
                  League tournaments restrict team participation to this organization only.
                </p>
              </div>
            )}

            {/* Auto-select organization for non-league tournaments */}
            {selectedModel && selectedModel !== "LEAGUE" && (
              <div className="space-y-2">
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-700">
                    <strong>
                      {selectedModel === "INDEPENDENT" ? "Independent Tournament:" : 
                       selectedModel === "INTER_COUNTY" ? "Inter-County Tournament:" : 
                       "Open Tournament:"}
                    </strong> Teams from any organization can participate in this{" "}
                    {selectedModel === "INDEPENDENT" ? "independent" :
                     selectedModel.replace("ADMINISTRATIVE_", "").toLowerCase().replace("_", " ")} tournament.
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    {selectedModel === "INDEPENDENT" || selectedModel === "INTER_COUNTY" ? 
                      "System organization auto-assigned for administrative purposes only." :
                      "Organization will be auto-assigned for administrative purposes."
                    }
                  </p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="season">Season</Label>
                <Input
                  id="season"
                  placeholder="e.g., 2025/26"
                  value={formData.season}
                  onChange={(e) =>
                    setFormData({ ...formData, season: e.target.value })
                  }
                  data-testid="input-season"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sport">Sport</Label>
                <Select
                  value={formData.sportId}
                  onValueChange={(value) =>
                    setFormData({ ...formData, sportId: value })
                  }
                >
                  <SelectTrigger data-testid="select-sport">
                    <SelectValue placeholder="Select sport" />
                  </SelectTrigger>
                  <SelectContent>
                    {sportsLoading ? (
                      <SelectItem value="" disabled>Loading sports...</SelectItem>
                    ) : sportsError ? (
                      <>
                        <SelectItem value="1">Football</SelectItem>
                        <SelectItem value="2">Basketball</SelectItem>
                        <SelectItem value="3">Volleyball</SelectItem>
                        <SelectItem value="4">Rugby</SelectItem>
                        <SelectItem value="5">Netball</SelectItem>
                      </>
                    ) : sports && sports.length > 0 ? (
                      sports.map((sport: any) => (
                        <SelectItem key={sport.id} value={sport.id}>
                          {sport.name}
                        </SelectItem>
                      ))
                    ) : (
                      <>
                        <SelectItem value="1">Football</SelectItem>
                        <SelectItem value="2">Basketball</SelectItem>
                        <SelectItem value="3">Volleyball</SelectItem>
                        <SelectItem value="4">Rugby</SelectItem>
                        <SelectItem value="5">Netball</SelectItem>
                      </>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) =>
                    setFormData({ ...formData, startDate: e.target.value })
                  }
                  data-testid="input-start-date"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) =>
                    setFormData({ ...formData, endDate: e.target.value })
                  }
                  data-testid="input-end-date"
                />
              </div>
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
                        id={`venue-${venue.id}`}
                        checked={formData.preferredVenues.includes(venue.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setFormData({
                              ...formData,
                              preferredVenues: [...formData.preferredVenues, venue.id],
                            });
                          } else {
                            setFormData({
                              ...formData,
                              preferredVenues: formData.preferredVenues.filter((id) => id !== venue.id),
                            });
                          }
                        }}
                      />
                      <label
                        htmlFor={`venue-${venue.id}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        {venue.name} {venue.location && `- ${venue.location}`}
                      </label>
                    </div>
                  ))}
                </div>
              )}
              {formData.preferredVenues.length > 0 && (
                <p className="text-xs text-blue-600">
                  {formData.preferredVenues.length} venue(s) selected
                </p>
              )}
            </div>

            {/* Geographic Selection - Only show for administrative tournaments */}
            {getGeographicLevel(selectedModel) !== 'none' && (
              <div className="space-y-4">
                <div className="border rounded-lg p-4 bg-muted/50">
                  <div className="mb-3">
                    <h4 className="font-semibold text-sm flex items-center gap-2">
                      📍 Tournament Location
                      <span className="text-xs font-normal text-muted-foreground">
                        (Required for {selectedModel.replace('ADMINISTRATIVE_', '').replace('_', ' ').toLowerCase()} tournaments)
                      </span>
                    </h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      {getGeographicDescription(selectedModel)}
                    </p>
                  </div>
                  <GeographicSelector
                    onLocationChange={handleLocationChange}
                    value={{
                      countyId: formData.countyId,
                      subCountyId: formData.subCountyId,
                      wardId: formData.wardId,
                    }}
                    level={getGeographicLevel(selectedModel) as 'ward' | 'sub-county' | 'county'}
                    required={true}
                  />
                </div>
              </div>
            )}

            <div className="flex gap-2 justify-end pt-4">
              <Button
                variant="outline"
                onClick={() => setStep(1)}
                data-testid="button-back"
                disabled={createTournament.isPending}
              >
                Back
              </Button>
              <Button 
                onClick={handleSubmit} 
                data-testid="button-submit"
                disabled={createTournament.isPending}
              >
                {createTournament.isPending ? "Creating..." : "Create Tournament"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
