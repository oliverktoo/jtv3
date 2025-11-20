import React, { useState } from 'react';
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
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Zap, Settings, Play, Users, Target, RotateCcw, Calendar, 
  Clock, CheckCircle, AlertTriangle, Info, Shuffle, Trophy,
  ArrowRight, GitBranch, Grid3X3, Layers
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useStages } from '@/hooks/useStages';
import { useRounds } from '@/hooks/useRounds';
import { useMatches } from '@/hooks/useMatches';
import { useTeamRegistrations } from '@/hooks/useTeamRegistrations';
import { useAuth } from '@/hooks/useAuth';
import { format, addDays } from 'date-fns';

// Type definitions (would normally be imported from shared schema)
interface Stage {
  id: string;
  name: string;
  type: string;
}

interface Round {
  id: string;
  stageId: string;
  number: number;
}

interface Match {
  id: string;
  roundId: string;
}

interface Team {
  id: string;
  name: string;
}

interface FixtureAutomationProps {
  tournamentId: string;
  onAutomationComplete?: (generatedFixtures: any) => void;
}

interface AutomationConfig {
  stageType: 'LEAGUE' | 'GROUP' | 'KNOCKOUT' | 'MIXED';
  numberOfGroups?: number;
  teamsPerGroup?: number;
  knockoutFromGroupStage?: boolean;
  qualifiersPerGroup?: number;
  automaticRoundGeneration: boolean;
  automaticMatchGeneration: boolean;
  schedulingPreferences: {
    startDate: Date;
    matchDayInterval: number; // days between match days
    matchesPerDay: number;
    preferredTimeSlots: string[];
    venues: string[];
  };
  competitionFormat: {
    homeAndAway: boolean;
    numberOfLegs: number;
    seedTeams: boolean;
    randomDraw: boolean;
  };
}

interface AutomationStep {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'running' | 'completed' | 'error';
  progress?: number;
  details?: string;
}

const STAGE_CONFIGURATIONS = [
  {
    id: 'LEAGUE',
    name: 'League Format',
    description: 'All teams play each other in a single league table',
    icon: Trophy,
    color: 'bg-green-500',
    features: ['Round Robin', 'Points Table', 'Home & Away']
  },
  {
    id: 'GROUP',
    name: 'Group Stage',
    description: 'Teams divided into groups, play within groups',
    icon: Grid3X3,
    color: 'bg-blue-500',
    features: ['Multiple Groups', 'Group Winners', 'Qualification Rules']
  },
  {
    id: 'KNOCKOUT',
    name: 'Knockout Tournament',
    description: 'Single elimination tournament bracket',
    icon: Target,
    color: 'bg-red-500',
    features: ['Elimination', 'Seeding', 'Bracket Format']
  },
  {
    id: 'MIXED',
    name: 'Mixed Format',
    description: 'Group stage followed by knockout rounds',
    icon: GitBranch,
    color: 'bg-purple-500',
    features: ['Group Stage', 'Knockout Phase', 'Complex Structure']
  }
];

const DEFAULT_TIME_SLOTS = ['10:00', '13:00', '16:00'];
const DEFAULT_VENUES = ['Main Stadium', 'Training Ground A', 'Training Ground B'];

const AutomationProgress: React.FC<{ 
  steps: AutomationStep[];
  currentStep: number;
}> = ({ steps, currentStep }) => {
  const completedSteps = steps.filter(s => s.status === 'completed').length;
  const totalProgress = (completedSteps / steps.length) * 100;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5" />
          Automation Progress
        </CardTitle>
        <CardDescription>
          Step {currentStep + 1} of {steps.length}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Overall Progress</span>
            <span>{Math.round(totalProgress)}%</span>
          </div>
          <Progress value={totalProgress} className="w-full" />
        </div>

        <div className="space-y-3">
          {steps.map((step, index) => {
            const isActive = index === currentStep;
            const isCompleted = step.status === 'completed';
            const isError = step.status === 'error';
            
            return (
              <div 
                key={step.id}
                className={`flex items-start gap-3 p-3 rounded-lg border ${
                  isActive ? 'border-primary bg-primary/5' :
                  isCompleted ? 'border-green-200 bg-green-50' :
                  isError ? 'border-red-200 bg-red-50' :
                  'border-gray-200 bg-gray-50'
                }`}
              >
                <div className="flex-shrink-0 mt-1">
                  {isCompleted ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : isError ? (
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                  ) : isActive ? (
                    <div className="h-4 w-4 rounded-full bg-primary animate-pulse" />
                  ) : (
                    <div className="h-4 w-4 rounded-full bg-gray-300" />
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{step.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {step.description}
                  </p>
                  {step.details && (
                    <p className="text-xs text-muted-foreground mt-1 italic">
                      {step.details}
                    </p>
                  )}
                  {step.progress !== undefined && isActive && (
                    <Progress value={step.progress} className="w-full mt-2 h-1" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

const ConfigurationForm: React.FC<{
  config: AutomationConfig;
  teams: Team[];
  onConfigChange: (config: AutomationConfig) => void;
  onStart: () => void;
  isRunning: boolean;
}> = ({ config, teams, onConfigChange, onStart, isRunning }) => {
  const selectedFormat = STAGE_CONFIGURATIONS.find(f => f.id === config.stageType);
  const FormatIcon = selectedFormat?.icon || Settings;

  const calculateGroupConfiguration = (totalTeams: number, groupCount: number) => {
    const baseTeamsPerGroup = Math.floor(totalTeams / groupCount);
    const remainder = totalTeams % groupCount;
    return {
      baseTeamsPerGroup,
      groupsWithExtra: remainder,
      maxTeamsPerGroup: baseTeamsPerGroup + (remainder > 0 ? 1 : 0)
    };
  };

  const groupConfig = config.stageType === 'GROUP' && config.numberOfGroups 
    ? calculateGroupConfiguration(teams.length, config.numberOfGroups)
    : null;

  return (
    <div className="space-y-6">
      {/* Stage Type Selection */}
      <div className="space-y-3">
        <Label>Tournament Format *</Label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {STAGE_CONFIGURATIONS.map((format) => {
            const Icon = format.icon;
            const isSelected = config.stageType === format.id;
            
            return (
              <Card
                key={format.id}
                className={`cursor-pointer transition-all ${
                  isSelected 
                    ? 'ring-2 ring-primary border-primary' 
                    : 'hover:border-primary/50'
                }`}
                onClick={() => onConfigChange({ 
                  ...config, 
                  stageType: format.id as any 
                })}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${format.color} text-white`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">{format.name}</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        {format.description}
                      </p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {format.features.map((feature) => (
                          <Badge key={feature} variant="secondary" className="text-xs">
                            {feature}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Teams Overview */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          {teams.length} teams are registered for this tournament
        </AlertDescription>
      </Alert>

      {/* Group Stage Configuration */}
      {(config.stageType === 'GROUP' || config.stageType === 'MIXED') && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Group Stage Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="numberOfGroups">Number of Groups *</Label>
                <Input
                  id="numberOfGroups"
                  type="number"
                  value={config.numberOfGroups || ''}
                  onChange={(e) => onConfigChange({ 
                    ...config, 
                    numberOfGroups: parseInt(e.target.value) || undefined
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
                  value={config.qualifiersPerGroup || ''}
                  onChange={(e) => onConfigChange({ 
                    ...config, 
                    qualifiersPerGroup: parseInt(e.target.value) || undefined
                  })}
                  min={1}
                  max={4}
                />
              </div>
            </div>

            {groupConfig && (
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Groups will have {groupConfig.baseTeamsPerGroup}-{groupConfig.maxTeamsPerGroup} teams each.
                  {groupConfig.groupsWithExtra > 0 && 
                    ` ${groupConfig.groupsWithExtra} group(s) will have an extra team.`
                  }
                </AlertDescription>
              </Alert>
            )}

            {config.stageType === 'MIXED' && (
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Knockout Phase</Label>
                  <p className="text-xs text-muted-foreground">
                    Follow group stage with knockout rounds
                  </p>
                </div>
                <Switch
                  checked={config.knockoutFromGroupStage}
                  onCheckedChange={(checked) => onConfigChange({ 
                    ...config, 
                    knockoutFromGroupStage: checked 
                  })}
                />
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Automation Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Automation Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Auto-generate Rounds</Label>
                <p className="text-xs text-muted-foreground">
                  Automatically create tournament rounds
                </p>
              </div>
              <Switch
                checked={config.automaticRoundGeneration}
                onCheckedChange={(checked) => onConfigChange({ 
                  ...config, 
                  automaticRoundGeneration: checked 
                })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Auto-generate Matches</Label>
                <p className="text-xs text-muted-foreground">
                  Automatically create match fixtures
                </p>
              </div>
              <Switch
                checked={config.automaticMatchGeneration}
                onCheckedChange={(checked) => onConfigChange({ 
                  ...config, 
                  automaticMatchGeneration: checked 
                })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Scheduling Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Scheduling Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Tournament Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={format(config.schedulingPreferences.startDate, 'yyyy-MM-dd')}
                onChange={(e) => onConfigChange({
                  ...config,
                  schedulingPreferences: {
                    ...config.schedulingPreferences,
                    startDate: new Date(e.target.value)
                  }
                })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="matchDayInterval">Days Between Match Days</Label>
              <Input
                id="matchDayInterval"
                type="number"
                value={config.schedulingPreferences.matchDayInterval}
                onChange={(e) => onConfigChange({
                  ...config,
                  schedulingPreferences: {
                    ...config.schedulingPreferences,
                    matchDayInterval: parseInt(e.target.value) || 1
                  }
                })}
                min={1}
                max={14}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="matchesPerDay">Matches Per Day</Label>
              <Input
                id="matchesPerDay"
                type="number"
                value={config.schedulingPreferences.matchesPerDay}
                onChange={(e) => onConfigChange({
                  ...config,
                  schedulingPreferences: {
                    ...config.schedulingPreferences,
                    matchesPerDay: parseInt(e.target.value) || 1
                  }
                })}
                min={1}
                max={10}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Competition Format */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Competition Format</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Home & Away</Label>
                <p className="text-xs text-muted-foreground">
                  Each team plays both home and away
                </p>
              </div>
              <Switch
                checked={config.competitionFormat.homeAndAway}
                onCheckedChange={(checked) => onConfigChange({
                  ...config,
                  competitionFormat: {
                    ...config.competitionFormat,
                    homeAndAway: checked
                  }
                })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Seed Teams</Label>
                <p className="text-xs text-muted-foreground">
                  Use team rankings for seeding
                </p>
              </div>
              <Switch
                checked={config.competitionFormat.seedTeams}
                onCheckedChange={(checked) => onConfigChange({
                  ...config,
                  competitionFormat: {
                    ...config.competitionFormat,
                    seedTeams: checked
                  }
                })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Random Draw</Label>
                <p className="text-xs text-muted-foreground">
                  Randomize team assignments
                </p>
              </div>
              <Switch
                checked={config.competitionFormat.randomDraw}
                onCheckedChange={(checked) => onConfigChange({
                  ...config,
                  competitionFormat: {
                    ...config.competitionFormat,
                    randomDraw: checked
                  }
                })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Start Button */}
      <Button 
        onClick={onStart} 
        disabled={isRunning || teams.length === 0}
        size="lg"
        className="w-full"
      >
        {isRunning ? (
          <>
            <Zap className="h-5 w-5 mr-2 animate-spin" />
            Running Automation...
          </>
        ) : (
          <>
            <Play className="h-5 w-5 mr-2" />
            Start Automated Setup
          </>
        )}
      </Button>
    </div>
  );
};

export const FixtureAutomation: React.FC<FixtureAutomationProps> = ({ 
  tournamentId,
  onAutomationComplete
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [config, setConfig] = useState<AutomationConfig>({
    stageType: 'LEAGUE',
    numberOfGroups: 4,
    teamsPerGroup: 4,
    knockoutFromGroupStage: true,
    qualifiersPerGroup: 2,
    automaticRoundGeneration: true,
    automaticMatchGeneration: true,
    schedulingPreferences: {
      startDate: addDays(new Date(), 7),
      matchDayInterval: 3,
      matchesPerDay: 4,
      preferredTimeSlots: DEFAULT_TIME_SLOTS,
      venues: DEFAULT_VENUES,
    },
    competitionFormat: {
      homeAndAway: true,
      numberOfLegs: 1,
      seedTeams: false,
      randomDraw: true,
    }
  });

  const [isRunning, setIsRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [automationSteps, setAutomationSteps] = useState<AutomationStep[]>([
    {
      id: 'validate',
      title: 'Validate Configuration',
      description: 'Checking tournament setup and team registrations',
      status: 'pending'
    },
    {
      id: 'stages',
      title: 'Create Tournament Stages',
      description: 'Setting up competition stages and structure',
      status: 'pending'
    },
    {
      id: 'groups',
      title: 'Organize Teams',
      description: 'Assigning teams to groups or brackets',
      status: 'pending'
    },
    {
      id: 'rounds',
      title: 'Generate Rounds',
      description: 'Creating tournament rounds and matchdays',
      status: 'pending'
    },
    {
      id: 'fixtures',
      title: 'Generate Fixtures',
      description: 'Creating match fixtures and schedules',
      status: 'pending'
    },
    {
      id: 'finalize',
      title: 'Finalize Setup',
      description: 'Completing tournament initialization',
      status: 'pending'
    }
  ]);

  // Queries
  const { data: teamRegistrations = [] } = useTeamRegistrations(tournamentId);
  const { data: stages = [] } = useStages(user?.currentOrgId || '');

  // Extract teams from tournament registrations
  const tournamentTeams = teamRegistrations.map(reg => reg.teams).filter(Boolean);

  const runAutomation = useMutation({
    mutationFn: async (automationConfig: AutomationConfig) => {
      const response = await fetch(`/api/tournaments/${tournamentId}/automate?orgId=${user?.currentOrgId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(automationConfig),
      });
      
      if (!response.ok) {
        throw new Error('Failed to run automation');
      }
      
      return response.json();
    },
    onSuccess: (result) => {
      setIsRunning(false);
      queryClient.invalidateQueries({ queryKey: ['stages'] });
      queryClient.invalidateQueries({ queryKey: ['rounds'] });
      queryClient.invalidateQueries({ queryKey: ['matches'] });
      
      onAutomationComplete?.(result);
      
      toast({
        title: "Automation Complete!",
        description: "Tournament structure has been automatically generated.",
      });
    },
    onError: (error: any) => {
      setIsRunning(false);
      
      // Mark current step as error
      setAutomationSteps(prev => prev.map((step, index) => 
        index === currentStep 
          ? { ...step, status: 'error', details: error.message }
          : step
      ));
      
      toast({
        title: "Automation Failed",
        description: error.message || "Failed to complete automated setup",
        variant: "destructive",
      });
    },
  });

  const handleStartAutomation = async () => {
    setIsRunning(true);
    setCurrentStep(0);
    
    // Reset all steps to pending
    setAutomationSteps(prev => prev.map(step => ({ ...step, status: 'pending' as const })));
    
    // Simulate step progression
    const stepDelay = 1500; // 1.5 seconds per step
    
    for (let i = 0; i < automationSteps.length; i++) {
      setCurrentStep(i);
      
      // Mark current step as running
      setAutomationSteps(prev => prev.map((step, index) => 
        index === i 
          ? { ...step, status: 'running', progress: 0 }
          : step
      ));
      
      // Simulate progress within step
      for (let progress = 0; progress <= 100; progress += 20) {
        setAutomationSteps(prev => prev.map((step, index) => 
          index === i 
            ? { ...step, progress }
            : step
        ));
        await new Promise(resolve => setTimeout(resolve, stepDelay / 5));
      }
      
      // Mark step as completed
      setAutomationSteps(prev => prev.map((step, index) => 
        index === i 
          ? { ...step, status: 'completed', progress: 100 }
          : step
      ));
    }
    
    // Run the actual automation
    runAutomation.mutate(config);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Fixture Automation</h3>
          <p className="text-sm text-muted-foreground">
            Automatically generate complete tournament structures and fixtures
          </p>
        </div>
      </div>

      {isRunning ? (
        <AutomationProgress steps={automationSteps} currentStep={currentStep} />
      ) : (
        <ConfigurationForm
          config={config}
          teams={tournamentTeams}
          onConfigChange={setConfig}
          onStart={handleStartAutomation}
          isRunning={isRunning}
        />
      )}
    </div>
  );
};

export default FixtureAutomation;