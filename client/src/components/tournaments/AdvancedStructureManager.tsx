import React, { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  Layers, GitBranch, Target, Users, Trophy, Settings, Plus, Edit, Trash2,
  ArrowDown, ArrowRight, Grid3X3, Zap, CheckCircle, AlertTriangle,
  Play, RotateCcw, Calendar, Clock, MapPin, Info, Shuffle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useStages } from '@/hooks/useStages';
import { useRounds } from '@/hooks/useRounds';
import { useMatches } from '@/hooks/useMatches';
import { useTeams } from '@/hooks/useTeams';
import { useAuth } from '@/hooks/useAuth';

interface AdvancedStructureManagerProps {
  tournamentId: string;
  onStructureComplete?: (structure: TournamentStructure) => void;
}

interface TournamentPhase {
  id: string;
  name: string;
  type: 'GROUP_STAGE' | 'KNOCKOUT' | 'LEAGUE' | 'PLAYOFF';
  order: number;
  config: PhaseConfig;
  status: 'DRAFT' | 'ACTIVE' | 'COMPLETED';
  teams?: TeamAllocation[];
  progression?: ProgressionRule[];
}

interface PhaseConfig {
  numberOfGroups?: number;
  teamsPerGroup?: number;
  numberOfRounds?: number;
  homeAndAway?: boolean;
  seedTeams?: boolean;
  qualifiersPerGroup?: number;
  wildcards?: number;
  byes?: number;
}

interface TeamAllocation {
  teamId: string;
  teamName: string;
  groupId?: string;
  seed?: number;
  qualified?: boolean;
}

interface ProgressionRule {
  fromPhase: string;
  toPhase: string;
  condition: 'TOP_N' | 'BOTTOM_N' | 'POSITION' | 'POINTS';
  value: number;
  groupQualifiers?: number;
}

interface TournamentStructure {
  id: string;
  name: string;
  phases: TournamentPhase[];
  totalTeams: number;
  estimatedDuration: number;
  complexity: 'SIMPLE' | 'MODERATE' | 'COMPLEX';
}

// Predefined phase templates
const PHASE_TEMPLATES = [
  {
    id: 'group-stage',
    name: 'Group Stage',
    type: 'GROUP_STAGE' as const,
    icon: Grid3X3,
    color: 'bg-blue-500',
    description: 'Teams divided into groups, play round-robin within groups',
    defaultConfig: {
      numberOfGroups: 4,
      teamsPerGroup: 4,
      numberOfRounds: 3,
      homeAndAway: false,
      qualifiersPerGroup: 2
    }
  },
  {
    id: 'knockout',
    name: 'Knockout Phase',
    type: 'KNOCKOUT' as const,
    icon: Target,
    color: 'bg-red-500',
    description: 'Single elimination tournament bracket',
    defaultConfig: {
      seedTeams: true,
      numberOfRounds: 4, // Round of 16, QF, SF, Final
      homeAndAway: false,
      byes: 0
    }
  },
  {
    id: 'league',
    name: 'League',
    type: 'LEAGUE' as const,
    icon: Trophy,
    color: 'bg-green-500',
    description: 'All teams play each other in round-robin format',
    defaultConfig: {
      homeAndAway: true,
      numberOfRounds: 2
    }
  },
  {
    id: 'playoff',
    name: 'Playoffs',
    type: 'PLAYOFF' as const,
    icon: Zap,
    color: 'bg-purple-500',
    description: 'Best-of series between qualified teams',
    defaultConfig: {
      seedTeams: true,
      numberOfRounds: 3,
      homeAndAway: true
    }
  }
];

const PhaseCard: React.FC<{
  phase: TournamentPhase;
  phaseIndex: number;
  totalPhases: number;
  onEdit: (phase: TournamentPhase) => void;
  onDelete: (phaseId: string) => void;
  onMoveUp: (phaseId: string) => void;
  onMoveDown: (phaseId: string) => void;
}> = ({ phase, phaseIndex, totalPhases, onEdit, onDelete, onMoveUp, onMoveDown }) => {
  const template = PHASE_TEMPLATES.find(t => t.type === phase.type);
  const Icon = template?.icon || Settings;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DRAFT': return 'bg-gray-500';
      case 'ACTIVE': return 'bg-blue-500';
      case 'COMPLETED': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getPhaseStats = () => {
    const stats = [];
    if (phase.config.numberOfGroups) {
      stats.push(`${phase.config.numberOfGroups} groups`);
    }
    if (phase.config.teamsPerGroup) {
      stats.push(`${phase.config.teamsPerGroup} teams/group`);
    }
    if (phase.config.numberOfRounds) {
      stats.push(`${phase.config.numberOfRounds} rounds`);
    }
    return stats.join(' • ');
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex flex-col items-center gap-1">
              <Badge variant="outline" className="text-xs px-2">
                Phase {phase.order}
              </Badge>
              <div className={`p-2 rounded-lg ${template?.color} text-white`}>
                <Icon className="h-4 w-4" />
              </div>
            </div>
            <div>
              <CardTitle className="text-lg">{phase.name}</CardTitle>
              <CardDescription className="flex items-center gap-2">
                {template?.name}
                <Badge 
                  variant="secondary" 
                  className={`text-xs ${getStatusColor(phase.status)}`}
                >
                  {phase.status}
                </Badge>
              </CardDescription>
            </div>
          </div>
          
          <div className="flex flex-col gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onMoveUp(phase.id)}
              disabled={phaseIndex === 0}
            >
              ↑
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onMoveDown(phase.id)}
              disabled={phaseIndex === totalPhases - 1}
            >
              ↓
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">
          {template?.description}
        </p>
        
        <div className="text-xs text-muted-foreground">
          {getPhaseStats()}
        </div>
        
        <Separator />
        
        {/* Team allocation preview */}
        {phase.teams && phase.teams.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Users className="h-3 w-3" />
              <span className="text-sm font-medium">Teams ({phase.teams.length})</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {phase.teams.slice(0, 6).map((team) => (
                <Badge key={team.teamId} variant="outline" className="text-xs">
                  {team.teamName}
                </Badge>
              ))}
              {phase.teams.length > 6 && (
                <Badge variant="outline" className="text-xs">
                  +{phase.teams.length - 6} more
                </Badge>
              )}
            </div>
          </div>
        )}
        
        {/* Progression rules */}
        {phase.progression && phase.progression.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <ArrowRight className="h-3 w-3" />
              <span className="text-sm font-medium">Progression</span>
            </div>
            {phase.progression.map((rule, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {rule.condition === 'TOP_N' ? `Top ${rule.value}` : 
                 rule.condition === 'BOTTOM_N' ? `Bottom ${rule.value}` :
                 `Position ${rule.value}`} advance
              </Badge>
            ))}
          </div>
        )}
        
        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(phase)}
            className="flex-1"
          >
            <Edit className="h-3 w-3 mr-1" />
            Edit
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => onDelete(phase.id)}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </CardContent>
      
      {/* Connection arrow to next phase */}
      {phaseIndex < totalPhases - 1 && (
        <div className="flex justify-center pb-4">
          <ArrowDown className="h-6 w-6 text-muted-foreground" />
        </div>
      )}
    </Card>
  );
};

const PhaseConfigurationDialog: React.FC<{
  phase?: TournamentPhase;
  isOpen: boolean;
  onClose: () => void;
  onSave: (phase: Omit<TournamentPhase, 'id'>) => void;
  totalTeams: number;
  existingPhases: TournamentPhase[];
}> = ({ phase, isOpen, onClose, onSave, totalTeams, existingPhases }) => {
  const [formData, setFormData] = useState<Omit<TournamentPhase, 'id'>>(() => ({
    name: phase?.name || '',
    type: phase?.type || 'GROUP_STAGE',
    order: phase?.order || existingPhases.length + 1,
    config: phase?.config || PHASE_TEMPLATES[0].defaultConfig,
    status: phase?.status || 'DRAFT',
    teams: phase?.teams || [],
    progression: phase?.progression || []
  }));

  const selectedTemplate = PHASE_TEMPLATES.find(t => t.type === formData.type);

  const handleSave = () => {
    onSave(formData);
    onClose();
  };

  const calculateTeamDistribution = () => {
    if (formData.type === 'GROUP_STAGE' && formData.config.numberOfGroups && formData.config.teamsPerGroup) {
      const totalCapacity = formData.config.numberOfGroups * formData.config.teamsPerGroup;
      return {
        capacity: totalCapacity,
        overflow: totalTeams > totalCapacity,
        underflow: totalTeams < totalCapacity
      };
    }
    return null;
  };

  const distribution = calculateTeamDistribution();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {phase ? 'Edit Phase' : 'Add Tournament Phase'}
          </DialogTitle>
          <DialogDescription>
            Configure the phase settings and team allocation rules
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 max-h-[60vh] overflow-y-auto">
          {/* Basic Information */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phaseName">Phase Name *</Label>
                <Input
                  id="phaseName"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Group Stage, Quarter Finals"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phaseOrder">Phase Order</Label>
                <Input
                  id="phaseOrder"
                  type="number"
                  value={formData.order}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    order: parseInt(e.target.value) || 1 
                  })}
                  min={1}
                />
              </div>
            </div>

            {/* Phase Type Selection */}
            <div className="space-y-3">
              <Label>Phase Type *</Label>
              <div className="grid grid-cols-2 gap-3">
                {PHASE_TEMPLATES.map((template) => {
                  const Icon = template.icon;
                  const isSelected = formData.type === template.type;
                  
                  return (
                    <Card
                      key={template.id}
                      className={`cursor-pointer transition-all ${
                        isSelected 
                          ? 'ring-2 ring-primary border-primary' 
                          : 'hover:border-primary/50'
                      }`}
                      onClick={() => setFormData({ 
                        ...formData, 
                        type: template.type,
                        config: { ...template.defaultConfig }
                      })}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-center gap-2">
                          <div className={`p-1 rounded ${template.color} text-white`}>
                            <Icon className="h-4 w-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm">{template.name}</p>
                            <p className="text-xs text-muted-foreground truncate">
                              {template.description}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          </div>

          <Separator />

          {/* Phase-specific Configuration */}
          <div className="space-y-4">
            <h4 className="font-medium">Phase Configuration</h4>
            
            {formData.type === 'GROUP_STAGE' && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="numberOfGroups">Number of Groups</Label>
                  <Input
                    id="numberOfGroups"
                    type="number"
                    value={formData.config.numberOfGroups || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      config: {
                        ...formData.config,
                        numberOfGroups: parseInt(e.target.value) || undefined
                      }
                    })}
                    min={2}
                    max={8}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="teamsPerGroup">Teams per Group</Label>
                  <Input
                    id="teamsPerGroup"
                    type="number"
                    value={formData.config.teamsPerGroup || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      config: {
                        ...formData.config,
                        teamsPerGroup: parseInt(e.target.value) || undefined
                      }
                    })}
                    min={2}
                    max={8}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="qualifiersPerGroup">Qualifiers per Group</Label>
                  <Input
                    id="qualifiersPerGroup"
                    type="number"
                    value={formData.config.qualifiersPerGroup || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      config: {
                        ...formData.config,
                        qualifiersPerGroup: parseInt(e.target.value) || undefined
                      }
                    })}
                    min={1}
                    max={4}
                  />
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="numberOfRounds">Number of Rounds</Label>
                <Input
                  id="numberOfRounds"
                  type="number"
                  value={formData.config.numberOfRounds || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    config: {
                      ...formData.config,
                      numberOfRounds: parseInt(e.target.value) || undefined
                    }
                  })}
                  min={1}
                  max={10}
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Home & Away</Label>
                <p className="text-xs text-muted-foreground">
                  Each match played twice with reversed venues
                </p>
              </div>
              <Switch
                checked={formData.config.homeAndAway || false}
                onCheckedChange={(checked) => setFormData({
                  ...formData,
                  config: {
                    ...formData.config,
                    homeAndAway: checked
                  }
                })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Seed Teams</Label>
                <p className="text-xs text-muted-foreground">
                  Use team rankings for better matchups
                </p>
              </div>
              <Switch
                checked={formData.config.seedTeams || false}
                onCheckedChange={(checked) => setFormData({
                  ...formData,
                  config: {
                    ...formData.config,
                    seedTeams: checked
                  }
                })}
              />
            </div>

            {/* Team distribution warning */}
            {distribution && (
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  {distribution.overflow && (
                    <span className="text-orange-600">
                      Warning: {totalTeams} teams exceed capacity of {distribution.capacity} teams
                    </span>
                  )}
                  {distribution.underflow && (
                    <span className="text-blue-600">
                      Note: {totalTeams} teams will fill {distribution.capacity} available spots
                    </span>
                  )}
                </AlertDescription>
              </Alert>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!formData.name || !formData.type}>
            {phase ? 'Update Phase' : 'Add Phase'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export const AdvancedStructureManager: React.FC<AdvancedStructureManagerProps> = ({ 
  tournamentId,
  onStructureComplete
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [structure, setStructure] = useState<TournamentStructure>({
    id: tournamentId,
    name: 'Custom Tournament Structure',
    phases: [],
    totalTeams: 0,
    estimatedDuration: 0,
    complexity: 'SIMPLE'
  });

  const [editingPhase, setEditingPhase] = useState<TournamentPhase | null>(null);
  const [isPhaseDialogOpen, setIsPhaseDialogOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Queries
  const { data: teams = [] } = useTeams(user?.currentOrgId || '');
  const { data: stages = [] } = useStages(user?.currentOrgId || '');

  // Update total teams when teams data changes
  React.useEffect(() => {
    setStructure(prev => ({ ...prev, totalTeams: teams.length }));
  }, [teams.length]);

  const handleAddPhase = () => {
    setEditingPhase(null);
    setIsPhaseDialogOpen(true);
  };

  const handleEditPhase = (phase: TournamentPhase) => {
    setEditingPhase(phase);
    setIsPhaseDialogOpen(true);
  };

  const handleSavePhase = (phaseData: Omit<TournamentPhase, 'id'>) => {
    if (editingPhase) {
      // Update existing phase
      setStructure(prev => ({
        ...prev,
        phases: prev.phases.map(p => 
          p.id === editingPhase.id 
            ? { ...phaseData, id: editingPhase.id }
            : p
        )
      }));
    } else {
      // Add new phase
      const newPhase: TournamentPhase = {
        ...phaseData,
        id: `phase-${Date.now()}`
      };
      setStructure(prev => ({
        ...prev,
        phases: [...prev.phases, newPhase].sort((a, b) => a.order - b.order)
      }));
    }
  };

  const handleDeletePhase = (phaseId: string) => {
    if (confirm('Are you sure you want to delete this phase?')) {
      setStructure(prev => ({
        ...prev,
        phases: prev.phases.filter(p => p.id !== phaseId)
      }));
    }
  };

  const handleMovePhase = (phaseId: string, direction: 'up' | 'down') => {
    setStructure(prev => {
      const phases = [...prev.phases];
      const index = phases.findIndex(p => p.id === phaseId);
      const newIndex = direction === 'up' ? index - 1 : index + 1;
      
      if (newIndex >= 0 && newIndex < phases.length) {
        [phases[index], phases[newIndex]] = [phases[newIndex], phases[index]];
        
        // Update order numbers
        phases.forEach((phase, i) => {
          phase.order = i + 1;
        });
      }
      
      return { ...prev, phases };
    });
  };

  const generateStructure = useMutation({
    mutationFn: async (tournamentStructure: TournamentStructure) => {
      const response = await fetch(`/api/tournaments/${tournamentId}/structure/generate?orgId=${user?.currentOrgId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(tournamentStructure),
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate tournament structure');
      }
      
      return response.json();
    },
    onSuccess: (result) => {
      setIsGenerating(false);
      queryClient.invalidateQueries({ queryKey: ['stages'] });
      queryClient.invalidateQueries({ queryKey: ['rounds'] });
      queryClient.invalidateQueries({ queryKey: ['matches'] });
      
      onStructureComplete?.(structure);
      
      toast({
        title: "Structure Generated!",
        description: "Advanced tournament structure has been created successfully.",
      });
    },
    onError: (error: any) => {
      setIsGenerating(false);
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate tournament structure",
        variant: "destructive",
      });
    },
  });

  const handleGenerateStructure = async () => {
    setIsGenerating(true);
    generateStructure.mutate(structure);
  };

  const getComplexityLevel = () => {
    const phaseCount = structure.phases.length;
    if (phaseCount <= 1) return 'SIMPLE';
    if (phaseCount <= 3) return 'MODERATE';
    return 'COMPLEX';
  };

  const estimateDuration = () => {
    // Simple estimation based on phases and team count
    let totalRounds = 0;
    structure.phases.forEach(phase => {
      totalRounds += phase.config.numberOfRounds || 1;
      if (phase.config.homeAndAway) totalRounds *= 2;
    });
    
    return Math.ceil(totalRounds * 1.5); // Weeks
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Advanced Structure Manager</h3>
          <p className="text-sm text-muted-foreground">
            Design complex tournament structures with multiple phases and progression rules
          </p>
        </div>
        <Button onClick={handleAddPhase}>
          <Plus className="h-4 w-4 mr-2" />
          Add Phase
        </Button>
      </div>

      {/* Structure Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layers className="h-5 w-5" />
            Tournament Structure Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{structure.phases.length}</div>
              <div className="text-sm text-muted-foreground">Phases</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{structure.totalTeams}</div>
              <div className="text-sm text-muted-foreground">Teams</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{estimateDuration()}</div>
              <div className="text-sm text-muted-foreground">Est. Weeks</div>
            </div>
            <div className="text-center">
              <Badge variant={
                getComplexityLevel() === 'SIMPLE' ? 'default' :
                getComplexityLevel() === 'MODERATE' ? 'secondary' : 'destructive'
              } className="text-sm">
                {getComplexityLevel()}
              </Badge>
              <div className="text-sm text-muted-foreground mt-1">Complexity</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Phase Configuration */}
      {structure.phases.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <GitBranch className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Phases Configured</h3>
            <p className="text-sm text-muted-foreground text-center max-w-sm mb-4">
              Start building your tournament structure by adding phases. Each phase can have different formats and progression rules.
            </p>
            <Button onClick={handleAddPhase}>
              <Plus className="h-4 w-4 mr-2" />
              Add First Phase
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {structure.phases
            .sort((a, b) => a.order - b.order)
            .map((phase, index) => (
              <PhaseCard
                key={phase.id}
                phase={phase}
                phaseIndex={index}
                totalPhases={structure.phases.length}
                onEdit={handleEditPhase}
                onDelete={handleDeletePhase}
                onMoveUp={(phaseId) => handleMovePhase(phaseId, 'up')}
                onMoveDown={(phaseId) => handleMovePhase(phaseId, 'down')}
              />
            ))}

          {/* Generate Structure Button */}
          <Card>
            <CardContent className="flex items-center justify-between p-6">
              <div>
                <h4 className="font-medium">Ready to Generate?</h4>
                <p className="text-sm text-muted-foreground">
                  Create all stages, rounds, and initial team allocations based on your configuration
                </p>
              </div>
              <Button 
                onClick={handleGenerateStructure}
                disabled={isGenerating || structure.phases.length === 0}
                size="lg"
              >
                {isGenerating ? (
                  <>
                    <Shuffle className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Generate Structure
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Phase Configuration Dialog */}
      <PhaseConfigurationDialog
        phase={editingPhase || undefined}
        isOpen={isPhaseDialogOpen}
        onClose={() => {
          setIsPhaseDialogOpen(false);
          setEditingPhase(null);
        }}
        onSave={handleSavePhase}
        totalTeams={structure.totalTeams}
        existingPhases={structure.phases}
      />
    </div>
  );
};

export default AdvancedStructureManager;