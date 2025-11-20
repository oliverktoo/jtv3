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
import { Switch } from "@/components/ui/switch";
import { Calendar as CalendarIcon } from "lucide-react";
import { useGenerateFixtures } from "@/hooks/useMatches";
import { useToast } from "@/hooks/use-toast";

interface GenerateFixturesDialogProps {
  tournamentId: string;
  stageId?: string;
  stageName?: string;
  stageType?: string;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export default function GenerateFixturesDialog({
  tournamentId,
  stageId,
  stageName,
  stageType,
  trigger,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
}: GenerateFixturesDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = controlledOnOpenChange || setInternalOpen;
  
  const [formData, setFormData] = useState({
    startDate: "",
    kickoffTime: "13:00",
    weekendsOnly: true,
    homeAndAway: true,
    venue: "",
  });

  const { toast } = useToast();
  const generateFixtures = useGenerateFixtures(tournamentId);

  const handleSubmit = async () => {
    if (!formData.startDate) {
      toast({
        title: "Error",
        description: "Please select a start date",
        variant: "destructive",
      });
      return;
    }

    try {
      // Include stageId in the request if provided
      const requestData = stageId 
        ? { ...formData, stageId }
        : formData;
        
      const result = await generateFixtures.mutateAsync(requestData);
      toast({
        title: "Success",
        description: (result as any).message || `Fixtures generated successfully${stageName ? ` for ${stageName}` : ''}`,
      });
      setOpen(false);
      setFormData({
        startDate: "",
        kickoffTime: "13:00",
        weekendsOnly: true,
        homeAndAway: true,
        venue: "",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to generate fixtures",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button data-testid="button-generate-fixtures">
            <CalendarIcon className="h-4 w-4 mr-2" />
            Generate Fixtures
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Generate Fixtures{stageName ? ` - ${stageName}` : ''}</DialogTitle>
          <DialogDescription>
            Configure fixture generation settings{stageType ? ` for ${stageType} format` : ''}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4 overflow-y-auto pr-2">
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
            <Label htmlFor="kickoffTime">Kickoff Time</Label>
            <Input
              id="kickoffTime"
              type="time"
              value={formData.kickoffTime}
              onChange={(e) =>
                setFormData({ ...formData, kickoffTime: e.target.value })
              }
              data-testid="input-kickoff-time"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="venue">Venue (Optional)</Label>
            <Input
              id="venue"
              placeholder="e.g., City Stadium"
              value={formData.venue}
              onChange={(e) =>
                setFormData({ ...formData, venue: e.target.value })
              }
              data-testid="input-venue"
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="weekendsOnly">Weekends Only</Label>
            <Switch
              id="weekendsOnly"
              checked={formData.weekendsOnly}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, weekendsOnly: checked })
              }
              data-testid="switch-weekends-only"
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="homeAndAway">Home & Away</Label>
            <Switch
              id="homeAndAway"
              checked={formData.homeAndAway}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, homeAndAway: checked })
              }
              data-testid="switch-home-and-away"
            />
          </div>

          <div className="flex gap-2 justify-end pt-4">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              data-testid="button-cancel"
              disabled={generateFixtures.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              data-testid="button-submit"
              disabled={generateFixtures.isPending}
            >
              {generateFixtures.isPending ? "Generating..." : "Generate"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
