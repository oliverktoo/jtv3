import { useState } from "react";
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
import { Plus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useCreateTournament } from "@/hooks/useTournaments";
import { useOrganizations, useSports } from "@/hooks/useReferenceData";
import { useToast } from "@/hooks/use-toast";

const tournamentModels = [
  { value: "ADMINISTRATIVE_WARD", label: "Ward Level", description: "Ward-based tournament" },
  { value: "ADMINISTRATIVE_SUB_COUNTY", label: "Sub-County Level", description: "Sub-county tournament" },
  { value: "ADMINISTRATIVE_COUNTY", label: "County Level", description: "County-wide tournament" },
  { value: "ADMINISTRATIVE_NATIONAL", label: "National Level", description: "National championship" },
  { value: "INTER_COUNTY", label: "Inter-County", description: "Multi-county competition" },
  { value: "INDEPENDENT", label: "Independent", description: "Open registration" },
  { value: "LEAGUE", label: "League System", description: "Full league format" },
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
    startDate: "",
    endDate: "",
  });

  const { toast } = useToast();
  const createTournament = useCreateTournament();
  const { organizations } = useOrganizations();
  const { sports } = useSports();
  
  const orgId = organizations?.[0]?.id || "";

  const handleModelSelect = (model: string) => {
    setSelectedModel(model);
    setStep(2);
  };

  const handleSubmit = async () => {
    if (!orgId) {
      toast({
        title: "Error",
        description: "Organization not found",
        variant: "destructive",
      });
      return;
    }

    if (!formData.name || !formData.season || !formData.sportId || !formData.startDate || !formData.endDate) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      const slug = formData.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
      
      await createTournament.mutateAsync({
        orgId,
        sportId: formData.sportId,
        name: formData.name,
        slug,
        season: formData.season,
        tournamentModel: selectedModel as any,
        startDate: formData.startDate,
        endDate: formData.endDate,
        status: "DRAFT",
        isPublished: false,
      });

      toast({
        title: "Success",
        description: `Tournament "${formData.name}" created successfully`,
      });

      setOpen(false);
      setStep(1);
      setSelectedModel("");
      setFormData({ name: "", season: "", sportId: "", startDate: "", endDate: "" });
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
                    {sports.map((sport) => (
                      <SelectItem key={sport.id} value={sport.id}>
                        {sport.name}
                      </SelectItem>
                    ))}
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
