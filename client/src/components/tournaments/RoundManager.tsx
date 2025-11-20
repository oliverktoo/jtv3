import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Plus, Edit, Trash2, Calendar, Users, Trophy, Target, ArrowRight, RotateCcw, Zap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRounds } from '@/hooks/useRounds';
import { useMatches } from '@/hooks/useMatches';
import { useStages } from '@/hooks/useStages';
import { apiRequest } from '@/lib/queryClient';
import { useAuth } from '@/hooks/useAuth';
import { InsertRound, Stage, Match } from '../../../../shared/schema';

// Use the Round type from the hook to avoid conflicts
type Round = {
  id: string;
  stageId?: string | null;
  groupId?: string | null;
  number: number;
  leg: number;
  name?: string;
  createdAt: Date;
};

interface RoundManagerProps {
  tournamentId: string;
  onRoundCreated?: (round: Round) => void;
}

interface RoundFormData {
  stageId: string;
  groupId?: string;
  number: number;
  leg: number;
  name: string;
}

const ROUND_TYPES = [
  { value: 'group', label: 'Group Round', icon: Users, color: 'bg-blue-500' },
  { value: 'knockout', label: 'Knockout Round', icon: Target, color: 'bg-red-500' },
  { value: 'league', label: 'League Round', icon: Trophy, color: 'bg-green-500' },
  { value: 'playoff', label: 'Playoff Round', icon: Zap, color: 'bg-purple-500' },
];

const RoundCard: React.FC<{ 
  round: Round; 
  stage: Stage;
  matchCount: number; 
  onEdit: (round: Round) => void; 
  onDelete: (roundId: string) => void; 
  onGenerateMatches: (roundId: string) => void;
}> = ({ round, stage, matchCount, onEdit, onDelete, onGenerateMatches }) => {
  const getRoundTypeInfo = (stageType: string) => {
    const type = ROUND_TYPES.find(t => t.value === stageType.toLowerCase()) || ROUND_TYPES[0];
    return type;
  };

  const typeInfo = getRoundTypeInfo(stage.stageType);
  const TypeIcon = typeInfo.icon;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${typeInfo.color} text-white`}>
              <TypeIcon className="h-4 w-4" />
            </div>
            <div>
              <CardTitle className="text-lg">
                {round.name || `Round ${round.number}`}
                {round.leg > 1 && ` (Leg ${round.leg})`}
              </CardTitle>
              <CardDescription>
                {stage.name} • {typeInfo.label}
              </CardDescription>
            </div>
          </div>
          <Badge variant="secondary" className="text-xs">
            {matchCount} matches
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>Round {round.number}</span>
            </div>
            {round.leg > 1 && (
              <div className="flex items-center gap-1">
                <RotateCcw className="h-3 w-3" />
                <span>Leg {round.leg}</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(round)}
            className="flex-1"
          >
            <Edit className="h-3 w-3 mr-1" />
            Edit
          </Button>
          {matchCount === 0 && (
            <Button
              variant="default"
              size="sm"
              onClick={() => onGenerateMatches(round.id)}
              className="flex-1"
            >
              <Plus className="h-3 w-3 mr-1" />
              Generate Matches
            </Button>
          )}
          <Button
            variant="destructive"
            size="sm"
            onClick={() => onDelete(round.id)}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

const RoundForm: React.FC<{
  round?: Round;
  stages: Stage[];
  onSubmit: (data: RoundFormData) => void;
  onClose: () => void;
}> = ({ round, stages, onSubmit, onClose }) => {
  const [formData, setFormData] = useState<RoundFormData>({
    stageId: round?.stageId || '',
    groupId: round?.groupId || undefined,
    number: round?.number || 1,
    leg: round?.leg || 1,
    name: round?.name || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="stageId">Stage *</Label>
          <Select 
            value={formData.stageId} 
            onValueChange={(value) => setFormData({ ...formData, stageId: value })}
            required
          >
            <SelectTrigger>
              <SelectValue placeholder="Select stage" />
            </SelectTrigger>
            <SelectContent>
              {stages.map((stage) => (
                <SelectItem key={stage.id} value={stage.id}>
                  {stage.name} ({stage.stageType})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="number">Round Number *</Label>
          <Input
            id="number"
            type="number"
            value={formData.number}
            onChange={(e) => setFormData({ ...formData, number: parseInt(e.target.value) })}
            min={1}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="leg">Leg Number</Label>
          <Input
            id="leg"
            type="number"
            value={formData.leg}
            onChange={(e) => setFormData({ ...formData, leg: parseInt(e.target.value) })}
            min={1}
            max={2}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="name">Round Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g., Quarter Final, Group A Round 1"
          />
        </div>
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit">
          {round ? 'Update Round' : 'Create Round'}
        </Button>
      </DialogFooter>
    </form>
  );
};

export const RoundManager: React.FC<RoundManagerProps> = ({ 
  tournamentId, 
  onRoundCreated 
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [editingRound, setEditingRound] = useState<Round | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedStageId, setSelectedStageId] = useState<string>('all');

  // Queries
  const { data: stages = [] } = useStages(tournamentId);
  const { data: rounds = [] } = useRounds(user?.currentOrgId || '', tournamentId);

  // Group rounds by stage
  const roundsByStage = rounds.reduce((acc, round) => {
    const stageId = round.stageId || 'no-stage';
    if (!acc[stageId]) acc[stageId] = [];
    acc[stageId].push(round);
    return acc;
  }, {} as Record<string, Round[]>);

  // Get match counts for rounds
  const { data: allMatches = [] } = useMatches(tournamentId);
  const matchCounts = allMatches.reduce((acc, match) => {
    acc[match.roundId] = (acc[match.roundId] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Mutations
  const createRoundMutation = useMutation({
    mutationFn: async (data: RoundFormData) => {
      const roundData: InsertRound = {
        stageId: data.stageId,
        groupId: data.groupId,
        number: data.number,
        leg: data.leg,
        name: data.name || null,
      };
      
      return apiRequest('POST', `/api/tournaments/${tournamentId}/rounds?orgId=${user?.currentOrgId}`, roundData);
    },
    onSuccess: (newRound) => {
      queryClient.invalidateQueries({ queryKey: ['rounds'] });
      setIsCreateDialogOpen(false);
      onRoundCreated?.(newRound);
      toast({
        title: "Success",
        description: "Round created successfully!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create round",
        variant: "destructive",
      });
    },
  });

  const updateRoundMutation = useMutation({
    mutationFn: async ({ roundId, data }: { roundId: string; data: Partial<RoundFormData> }) => {
      return apiRequest('PATCH', `/api/tournaments/${tournamentId}/rounds/${roundId}?orgId=${user?.currentOrgId}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rounds'] });
      setEditingRound(null);
      toast({
        title: "Success",
        description: "Round updated successfully!",
      });
    },
  });

  const deleteRoundMutation = useMutation({
    mutationFn: async (roundId: string) => {
      return apiRequest('DELETE', `/api/tournaments/${tournamentId}/rounds/${roundId}?orgId=${user?.currentOrgId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rounds'] });
      toast({
        title: "Success",
        description: "Round deleted successfully!",
      });
    },
  });

  const generateMatchesMutation = useMutation({
    mutationFn: async (roundId: string) => {
      return apiRequest('POST', `/api/tournaments/${tournamentId}/rounds/${roundId}/generate-matches?orgId=${user?.currentOrgId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['matches'] });
      toast({
        title: "Success",
        description: "Matches generated successfully!",
      });
    },
  });

  const handleCreateRound = (data: RoundFormData) => {
    createRoundMutation.mutate(data);
  };

  const handleUpdateRound = (data: RoundFormData) => {
    if (!editingRound) return;
    updateRoundMutation.mutate({ roundId: editingRound.id, data });
  };

  const handleDeleteRound = (roundId: string) => {
    if (confirm('Are you sure you want to delete this round? This will also delete all associated matches.')) {
      deleteRoundMutation.mutate(roundId);
    }
  };

  const handleGenerateMatches = (roundId: string) => {
    generateMatchesMutation.mutate(roundId);
  };

  const filteredStages = selectedStageId === 'all' ? stages : stages.filter(s => s.id === selectedStageId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Round Management</h3>
          <p className="text-sm text-muted-foreground">
            Manage rounds within tournament stages and generate matches
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Round
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Round</DialogTitle>
              <DialogDescription>
                Add a new round to a tournament stage
              </DialogDescription>
            </DialogHeader>
            <RoundForm 
              stages={stages} 
              onSubmit={handleCreateRound}
              onClose={() => setIsCreateDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Stage Filter */}
      <div className="flex items-center gap-4">
        <Label htmlFor="stage-filter">Filter by Stage:</Label>
        <Select value={selectedStageId} onValueChange={setSelectedStageId}>
          <SelectTrigger className="w-[200px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Stages</SelectItem>
            {stages.map((stage) => (
              <SelectItem key={stage.id} value={stage.id}>
                {stage.name} ({stage.stageType})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Rounds by Stage */}
      <div className="space-y-6">
        {filteredStages.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Trophy className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No stages found</h3>
              <p className="text-sm text-muted-foreground text-center max-w-sm">
                Create tournament stages first before adding rounds
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredStages.map((stage) => {
            const stageRounds = roundsByStage[stage.id] || [];
            return (
              <Card key={stage.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {stage.name}
                        <Badge variant="outline">{stage.stageType}</Badge>
                      </CardTitle>
                      <CardDescription>
                        {stageRounds.length} rounds • {stageRounds.reduce((sum, round) => sum + (matchCounts[round.id] || 0), 0)} total matches
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {stageRounds.length === 0 ? (
                    <div className="text-center py-8">
                      <ArrowRight className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">No rounds in this stage</p>
                    </div>
                  ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {stageRounds
                        .sort((a, b) => a.number - b.number || a.leg - b.leg)
                        .map((round) => (
                          <RoundCard
                            key={round.id}
                            round={round}
                            stage={stage}
                            matchCount={matchCounts[round.id] || 0}
                            onEdit={setEditingRound}
                            onDelete={handleDeleteRound}
                            onGenerateMatches={handleGenerateMatches}
                          />
                        ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editingRound} onOpenChange={(open) => !open && setEditingRound(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Round</DialogTitle>
            <DialogDescription>
              Update round information
            </DialogDescription>
          </DialogHeader>
          {editingRound && (
            <RoundForm 
              round={editingRound}
              stages={stages} 
              onSubmit={handleUpdateRound}
              onClose={() => setEditingRound(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RoundManager;