import React, { useState } from "react";
import { Plus, Edit, Trash2, Play, ChevronDown, ChevronUp, AlertCircle, CheckCircle, Layers } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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
import { useToast } from "@/hooks/use-toast";
import { useStages, useCreateStage, useUpdateStage, useDeleteStage } from "@/hooks/useStages";
import { useTournamentGroups } from "@/hooks/useGroups";
import GenerateFixturesDialog from "@/components/GenerateFixturesDialog";

interface StageManagerProps {
  tournamentId: string;
  tournamentName: string;
  tournamentFormat?: string;
}

interface StageFormData {
  name: string;
  stageType: "LEAGUE" | "GROUP" | "KNOCKOUT";
  seq?: number;
}

const stageTypeLabels = {
  LEAGUE: "League/Round-Robin",
  GROUP: "Group Stage",
  KNOCKOUT: "Knockout",
};

const stageTypeDescriptions = {
  LEAGUE: "All teams play against each other in a league format",
  GROUP: "Teams divided into groups, top teams advance",
  KNOCKOUT: "Single elimination or two-leg knockout matches",
};

const stageTypeColors = {
  LEAGUE: "bg-blue-100 text-blue-800 border-blue-200",
  GROUP: "bg-green-100 text-green-800 border-green-200",
  KNOCKOUT: "bg-red-100 text-red-800 border-red-200",
};

export function StageManager({ tournamentId, tournamentName, tournamentFormat }: StageManagerProps) {
  const { toast } = useToast();
  const { data: stages, isLoading } = useStages(tournamentId);
  const createStageMutation = useCreateStage();
  const updateStageMutation = useUpdateStage();
  const deleteStageMutation = useDeleteStage();

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedStage, setSelectedStage] = useState<any>(null);
  const [expandedStage, setExpandedStage] = useState<string | null>(null);
  const [isGenerateDialogOpen, setIsGenerateDialogOpen] = useState(false);
  const [selectedStageForFixtures, setSelectedStageForFixtures] = useState<any>(null);

  const [formData, setFormData] = useState<StageFormData>({
    name: "",
    stageType: "LEAGUE",
    seq: undefined,
  });

  // Get groups for each stage
  const { data: tournamentGroups } = useTournamentGroups(tournamentId);

  const resetForm = () => {
    setFormData({
      name: "",
      stageType: "LEAGUE",
      seq: undefined,
    });
  };

  const handleCreateStage = async () => {
    if (!formData.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Stage name is required",
        variant: "destructive",
      });
      return;
    }

    try {
      await createStageMutation.mutateAsync({
        tournamentId,
        name: formData.name,
        stageType: formData.stageType,
        seq: formData.seq || (stages?.length || 0) + 1,
      });

      toast({
        title: "Stage Created",
        description: `"${formData.name}" has been created successfully`,
      });

      setIsCreateDialogOpen(false);
      resetForm();
    } catch (error: any) {
      toast({
        title: "Creation Failed",
        description: error.message || "Failed to create stage",
        variant: "destructive",
      });
    }
  };

  const handleEditStage = async () => {
    if (!selectedStage || !formData.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Stage name is required",
        variant: "destructive",
      });
      return;
    }

    try {
      await updateStageMutation.mutateAsync({
        id: selectedStage.id,
        tournamentId,
        data: {
          name: formData.name,
          stageType: formData.stageType,
          seq: formData.seq,
        },
      });

      toast({
        title: "Stage Updated",
        description: `"${formData.name}" has been updated successfully`,
      });

      setIsEditDialogOpen(false);
      setSelectedStage(null);
      resetForm();
    } catch (error: any) {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update stage",
        variant: "destructive",
      });
    }
  };

  const handleDeleteStage = async () => {
    if (!selectedStage) return;

    try {
      await deleteStageMutation.mutateAsync({
        id: selectedStage.id,
        tournamentId,
      });

      toast({
        title: "Stage Deleted",
        description: `"${selectedStage.name}" has been deleted successfully`,
      });

      setIsDeleteDialogOpen(false);
      setSelectedStage(null);
    } catch (error: any) {
      toast({
        title: "Deletion Failed",
        description: error.message || "Cannot delete stage with existing groups or fixtures",
        variant: "destructive",
      });
    }
  };

  const openEditDialog = (stage: any) => {
    setSelectedStage(stage);
    setFormData({
      name: stage.name,
      stageType: stage.stageType,
      seq: stage.seq,
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (stage: any) => {
    setSelectedStage(stage);
    setIsDeleteDialogOpen(true);
  };

  const openGenerateFixtures = (stage: any) => {
    setSelectedStageForFixtures(stage);
    setIsGenerateDialogOpen(true);
  };

  const getGroupsForStage = (stageId: string) => {
    return tournamentGroups?.filter(group => group.stageId === stageId) || [];
  };

  const getStageProgress = (stage: any) => {
    const groups = getGroupsForStage(stage.id);
    const hasGroups = groups.length > 0;
    // TODO: Check for fixtures/matches
    const hasFixtures = false; // This will be implemented when we link to matches

    return {
      hasGroups,
      hasFixtures,
      groupCount: groups.length,
    };
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Loading stages...</p>
          </div>
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
              <CardTitle className="text-2xl flex items-center gap-2">
                <Layers className="w-6 h-6" />
                Tournament Stages
              </CardTitle>
              <CardDescription className="mt-2">
                Define how "{tournamentName}" progresses from start to finish. Each stage can have different formats and advancement rules.
              </CardDescription>
            </div>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Stage
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Info Alert */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Tournament Structure</AlertTitle>
        <AlertDescription>
          Stages define the competition format. For example: "Group Stage" → "Quarter Finals" → "Semi Finals" → "Final".
          Each stage can generate its own fixtures and have different rules.
        </AlertDescription>
      </Alert>

      {/* Stages List */}
      {stages && stages.length > 0 ? (
        <div className="space-y-4">
          {stages
            .sort((a, b) => a.seq - b.seq)
            .map((stage, index) => {
              const progress = getStageProgress(stage);
              const isExpanded = expandedStage === stage.id;
              const groups = getGroupsForStage(stage.id);

              return (
                <Card key={stage.id} className="border-l-4 border-l-primary">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <Badge variant="outline" className="text-lg px-3 py-1">
                            Stage {index + 1}
                          </Badge>
                          <CardTitle className="text-xl">{stage.name}</CardTitle>
                          <Badge className={`${stageTypeColors[stage.stageType]} border`}>
                            {stageTypeLabels[stage.stageType]}
                          </Badge>
                        </div>
                        <CardDescription className="mt-2">
                          {stageTypeDescriptions[stage.stageType]}
                        </CardDescription>

                        {/* Progress Indicators */}
                        <div className="flex items-center gap-4 mt-3">
                          <div className="flex items-center gap-2">
                            {progress.hasGroups ? (
                              <CheckCircle className="w-4 h-4 text-green-600" />
                            ) : (
                              <AlertCircle className="w-4 h-4 text-amber-600" />
                            )}
                            <span className="text-sm">
                              {progress.groupCount} {progress.groupCount === 1 ? "Group" : "Groups"}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            {progress.hasFixtures ? (
                              <CheckCircle className="w-4 h-4 text-green-600" />
                            ) : (
                              <AlertCircle className="w-4 h-4 text-amber-600" />
                            )}
                            <span className="text-sm">Fixtures</span>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openGenerateFixtures(stage)}
                        >
                          <Play className="w-4 h-4 mr-2" />
                          Generate Fixtures
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditDialog(stage)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openDeleteDialog(stage)}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setExpandedStage(isExpanded ? null : stage.id)}
                        >
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardHeader>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <CardContent className="border-t bg-muted/30">
                      <div className="space-y-4">
                        {/* Groups */}
                        {groups.length > 0 ? (
                          <div>
                            <h4 className="font-semibold mb-2">Groups in this stage:</h4>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                              {groups.map(group => (
                                <Badge key={group.id} variant="secondary" className="justify-center py-2">
                                  {group.name}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <Alert>
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>
                              No groups assigned to this stage yet. Create groups or generate fixtures to populate this stage.
                            </AlertDescription>
                          </Alert>
                        )}

                        {/* Stage Details */}
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-4 border-t">
                          <div>
                            <p className="text-sm text-muted-foreground">Sequence</p>
                            <p className="font-medium">Position {stage.seq}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Created</p>
                            <p className="font-medium">
                              {new Date(stage.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Stage ID</p>
                            <p className="font-mono text-xs">{stage.id.slice(0, 8)}...</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  )}
                </Card>
              );
            })}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <Layers className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No stages defined</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Create your first stage to define how this tournament will be played.
              </p>
              <Button onClick={() => setIsCreateDialogOpen(true)} className="mt-6">
                <Plus className="w-4 h-4 mr-2" />
                Create First Stage
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Create Stage Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create New Stage</DialogTitle>
            <DialogDescription>
              Define a stage for your tournament structure. Stages are played in sequence order.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="stage-name">Stage Name *</Label>
              <Input
                id="stage-name"
                placeholder="e.g., Group Stage, Quarter Finals, Semi Finals"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="stage-type">Stage Type *</Label>
              <Select
                value={formData.stageType}
                onValueChange={(value: any) => setFormData({ ...formData, stageType: value })}
              >
                <SelectTrigger id="stage-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(stageTypeLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      <div>
                        <div className="font-medium">{label}</div>
                        <div className="text-xs text-muted-foreground">
                          {stageTypeDescriptions[value as keyof typeof stageTypeDescriptions]}
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="stage-seq">Sequence (Optional)</Label>
              <Input
                id="stage-seq"
                type="number"
                min="1"
                placeholder="Auto-assigned if not specified"
                value={formData.seq || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    seq: e.target.value ? parseInt(e.target.value) : undefined,
                  })
                }
              />
              <p className="text-xs text-muted-foreground">
                Stages are played in sequence order. Leave empty to add at the end.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsCreateDialogOpen(false);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateStage} disabled={createStageMutation.isPending}>
              {createStageMutation.isPending ? "Creating..." : "Create Stage"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Stage Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Stage</DialogTitle>
            <DialogDescription>Update stage details and configuration.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-stage-name">Stage Name *</Label>
              <Input
                id="edit-stage-name"
                placeholder="e.g., Group Stage, Quarter Finals"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-stage-type">Stage Type *</Label>
              <Select
                value={formData.stageType}
                onValueChange={(value: any) => setFormData({ ...formData, stageType: value })}
              >
                <SelectTrigger id="edit-stage-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(stageTypeLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      <div>
                        <div className="font-medium">{label}</div>
                        <div className="text-xs text-muted-foreground">
                          {stageTypeDescriptions[value as keyof typeof stageTypeDescriptions]}
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-stage-seq">Sequence</Label>
              <Input
                id="edit-stage-seq"
                type="number"
                min="1"
                value={formData.seq || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    seq: e.target.value ? parseInt(e.target.value) : undefined,
                  })
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsEditDialogOpen(false);
                setSelectedStage(null);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleEditStage} disabled={updateStageMutation.isPending}>
              {updateStageMutation.isPending ? "Updating..." : "Update Stage"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Stage</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{selectedStage?.name}"? This action cannot be undone
              and will remove all associated groups and fixtures.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedStage(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteStage}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteStageMutation.isPending ? "Deleting..." : "Delete Stage"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Generate Fixtures Dialog */}
      {selectedStageForFixtures && (
        <GenerateFixturesDialog
          tournamentId={tournamentId}
          stageId={selectedStageForFixtures.id}
          stageName={selectedStageForFixtures.name}
          stageType={selectedStageForFixtures.stageType}
          open={isGenerateDialogOpen}
          onOpenChange={(open) => {
            setIsGenerateDialogOpen(open);
            if (!open) setSelectedStageForFixtures(null);
          }}
        />
      )}
    </div>
  );
}
