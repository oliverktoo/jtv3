import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { 
  Plus, 
  Settings, 
  Calendar, 
  Trophy, 
  Users, 
  Target,
  Edit,
  Trash2,
  ArrowRight,
  Play
} from "lucide-react";
import { useStages, useCreateStage, useUpdateStage, useDeleteStage } from "@/hooks/useStages";
import { useRounds, useCreateRound } from "@/hooks/useRounds";
import { useToast } from "@/hooks/use-toast";

interface TournamentStructureManagerProps {
  tournamentId: string;
  tournamentName: string;
}

export function TournamentStructureManager({ 
  tournamentId, 
  tournamentName 
}: TournamentStructureManagerProps) {
  const { toast } = useToast();
  const { data: stages, isLoading } = useStages(tournamentId);
  const createStage = useCreateStage();
  const updateStage = useUpdateStage();
  const deleteStage = useDeleteStage();
  const createRound = useCreateRound();

  const [isCreateStageOpen, setIsCreateStageOpen] = useState(false);
  const [newStageName, setNewStageName] = useState("");
  const [newStageType, setNewStageType] = useState<"LEAGUE" | "GROUP" | "KNOCKOUT">("LEAGUE");

  const handleCreateStage = async () => {
    if (!newStageName.trim()) {
      toast({
        title: "Error",
        description: "Stage name is required",
        variant: "destructive",
      });
      return;
    }

    createStage.mutate({
      tournamentId,
      name: newStageName,
      stageType: newStageType
    }, {
      onSuccess: () => {
        toast({
          title: "Success",
          description: `Stage "${newStageName}" created successfully`,
        });
        setIsCreateStageOpen(false);
        setNewStageName("");
        setNewStageType("LEAGUE");
      },
      onError: (error) => {
        console.error("Create stage error:", error);
        toast({
          title: "Error",
          description: "Failed to create stage. Please try again.",
          variant: "destructive",
        });
      },
    });
  };

  const handleDeleteStage = (stageId: string, stageName: string) => {
    if (confirm(`Are you sure you want to delete the stage "${stageName}"? This will also delete all rounds and matches in this stage.`)) {
      deleteStage.mutate(stageId, {
        onSuccess: () => {
          toast({
            title: "Success",
            description: `Stage "${stageName}" deleted successfully`,
          });
        },
        onError: (error) => {
          console.error("Delete stage error:", error);
          toast({
            title: "Error",
            description: "Failed to delete stage. Please try again.",
            variant: "destructive",
          });
        },
      });
    }
  };

  const getStageTypeColor = (type: string) => {
    switch (type) {
      case "LEAGUE": return "bg-blue-100 text-blue-800 border-blue-200";
      case "GROUP": return "bg-green-100 text-green-800 border-green-200";
      case "KNOCKOUT": return "bg-red-100 text-red-800 border-red-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStageTypeIcon = (type: string) => {
    switch (type) {
      case "LEAGUE": return <Trophy className="w-4 h-4" />;
      case "GROUP": return <Users className="w-4 h-4" />;
      case "KNOCKOUT": return <Target className="w-4 h-4" />;
      default: return <Settings className="w-4 h-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">Loading tournament structure...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Tournament Structure</h3>
          <p className="text-muted-foreground">Configure stages and rounds for {tournamentName}</p>
        </div>
        <Dialog open={isCreateStageOpen} onOpenChange={setIsCreateStageOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Stage
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Stage</DialogTitle>
              <DialogDescription>
                Add a new stage to your tournament structure
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="stage-name">Stage Name</Label>
                <Input
                  id="stage-name"
                  placeholder="e.g., Group Stage, Quarter Finals"
                  value={newStageName}
                  onChange={(e) => setNewStageName(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="stage-type">Stage Type</Label>
                <Select value={newStageType} onValueChange={(value: any) => setNewStageType(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select stage type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LEAGUE">League (Round Robin)</SelectItem>
                    <SelectItem value="GROUP">Group Stage</SelectItem>
                    <SelectItem value="KNOCKOUT">Knockout</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateStageOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateStage} disabled={createStage.isPending}>
                {createStage.isPending ? "Creating..." : "Create Stage"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Tournament Structure Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Structure Overview
          </CardTitle>
          <CardDescription>
            Multi-level tournament structure: Tournament → Stages → Rounds → Matches
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Trophy className="w-4 h-4" />
            <span className="font-medium">{tournamentName}</span>
            <ArrowRight className="w-3 h-3" />
            <span>{stages?.length || 0} Stages</span>
            <ArrowRight className="w-3 h-3" />
            <span>Rounds</span>
            <ArrowRight className="w-3 h-3" />
            <span>Matches</span>
          </div>
        </CardContent>
      </Card>

      {/* Stages List */}
      {stages && stages.length > 0 ? (
        <div className="space-y-4">
          <h4 className="text-md font-medium">Tournament Stages</h4>
          <div className="grid gap-4">
            {stages.map((stage, index) => (
              <StageCard
                key={stage.id}
                stage={stage}
                stageNumber={index + 1}
                onDelete={() => handleDeleteStage(stage.id, stage.name)}
                getStageTypeColor={getStageTypeColor}
                getStageTypeIcon={getStageTypeIcon}
              />
            ))}
          </div>
        </div>
      ) : (
        <Card>
          <CardContent className="py-8">
            <div className="text-center">
              <Trophy className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 text-sm font-semibold text-gray-900">No stages created</h3>
              <p className="mt-1 text-sm text-gray-500">
                Create your first tournament stage to begin setting up matches and fixtures.
              </p>
              <div className="mt-6">
                <Button onClick={() => setIsCreateStageOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create First Stage
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Quick Actions</CardTitle>
          <CardDescription>Common tournament structure operations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" size="sm">
              <Play className="w-4 h-4 mr-2" />
              Auto-Generate Structure
            </Button>
            <Button variant="outline" size="sm">
              <Calendar className="w-4 h-4 mr-2" />
              Schedule All Matches
            </Button>
            <Button variant="outline" size="sm">
              <Settings className="w-4 h-4 mr-2" />
              Competition Rules
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Stage Card Component
interface StageCardProps {
  stage: any;
  stageNumber: number;
  onDelete: () => void;
  getStageTypeColor: (type: string) => string;
  getStageTypeIcon: (type: string) => React.ReactNode;
}

function StageCard({ 
  stage, 
  stageNumber, 
  onDelete, 
  getStageTypeColor, 
  getStageTypeIcon 
}: StageCardProps) {
  const { data: rounds } = useRounds(stage.id);

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center text-primary font-medium text-sm">
              {stageNumber}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-medium">{stage.name}</h4>
                <Badge className={getStageTypeColor(stage.stageType)}>
                  {getStageTypeIcon(stage.stageType)}
                  <span className="ml-1">{stage.stageType}</span>
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {rounds?.length || 0} rounds configured
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm">
              <Edit className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={onDelete}>
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      {rounds && rounds.length > 0 && (
        <CardContent className="pt-0">
          <div className="text-xs text-muted-foreground">
            Rounds: {rounds.map(r => `Round ${r.number}`).join(", ")}
          </div>
        </CardContent>
      )}
    </Card>
  );
}

export default TournamentStructureManager;