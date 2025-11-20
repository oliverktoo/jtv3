import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import { useUpdateTournament } from "@/hooks/useTournaments";
import { useSports } from "@/hooks/useReferenceData";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

const tournamentStatuses = [
  { value: "DRAFT", label: "Draft" },
  { value: "REGISTRATION", label: "Registration Open" },
  { value: "ACTIVE", label: "Active" },
  { value: "COMPLETED", label: "Completed" },
  { value: "ARCHIVED", label: "Archived" },
];

interface EditTournamentDialogProps {
  tournament: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function EditTournamentDialog({
  tournament,
  open,
  onOpenChange,
}: EditTournamentDialogProps) {
  const [formData, setFormData] = useState({
    name: "",
    season: "",
    status: "DRAFT",
    startDate: "",
    endDate: "",
    preferredVenues: [] as string[],
  });

  // State for venues
  const [venues, setVenues] = useState<any[]>([]);
  const [venuesLoading, setVenuesLoading] = useState(false);

  const { data: sports = [] } = useSports();
  const updateTournament = useUpdateTournament();
  const { toast } = useToast();

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
        console.log('EditTournamentDialog: Loaded venues:', data.venues.length);
      }
    } catch (error) {
      console.error('Failed to fetch venues:', error);
    } finally {
      setVenuesLoading(false);
    }
  };

  useEffect(() => {
    if (tournament) {
      setFormData({
        name: tournament.name || "",
        season: tournament.season || "",
        status: tournament.status || "DRAFT",
        startDate: tournament.startDate || "",
        endDate: tournament.endDate || "",
        preferredVenues: tournament.preferredVenues || [],
      });
    }
  }, [tournament]);

  const handleSubmit = async () => {
    if (!formData.name || !formData.season || !formData.startDate || !formData.endDate) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      await updateTournament.mutateAsync({
        id: tournament.id,
        data: {
          name: formData.name,
          season: formData.season,
          status: formData.status as any,
          startDate: formData.startDate,
          endDate: formData.endDate,
          preferredVenues: formData.preferredVenues.length > 0 ? formData.preferredVenues : undefined,
        },
      });

      toast({
        title: "Success",
        description: `Tournament "${formData.name}" updated successfully`,
      });

      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update tournament",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Edit Tournament</DialogTitle>
          <DialogDescription>
            Update tournament details and settings
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 overflow-y-auto flex-1 pr-2">
          <div>
            <Label htmlFor="name">Tournament Name *</Label>
            <Input
              id="name"
              placeholder="Enter tournament name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="season">Season *</Label>
            <Input
              id="season"
              placeholder="e.g., 2024-25"
              value={formData.season}
              onChange={(e) => setFormData({ ...formData, season: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="status">Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value) => setFormData({ ...formData, status: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {tournamentStatuses.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startDate">Start Date *</Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="endDate">End Date *</Label>
              <Input
                id="endDate"
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
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
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={updateTournament.isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={updateTournament.isPending}
          >
            {updateTournament.isPending ? "Updating..." : "Update Tournament"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}