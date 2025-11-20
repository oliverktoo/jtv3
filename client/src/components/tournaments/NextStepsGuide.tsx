import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  CheckCircle, 
  Clock, 
  ArrowRight, 
  Users, 
  Calendar, 
  Target,
  PlayCircle,
  Settings,
  Trophy,
  AlertCircle,
  Info
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface NextStepsGuideProps {
  tournamentId: string;
  hasGroups: boolean;
  hasTeamAssignments: boolean;
  hasStages: boolean;
  hasRounds: boolean;
  hasMatches: boolean;
  isActive: boolean;
  onNavigateToTab?: (tab: string) => void;
}

interface Step {
  id: string;
  title: string;
  description: string;
  status: 'completed' | 'current' | 'pending';
  action?: {
    label: string;
    tab?: string;
    onClick?: () => void;
  };
  icon: React.ReactNode;
  estimatedTime?: string;
}

export const NextStepsGuide: React.FC<NextStepsGuideProps> = ({
  tournamentId,
  hasGroups,
  hasTeamAssignments,
  hasStages,
  hasRounds,
  hasMatches,
  isActive,
  onNavigateToTab
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  // Calculate progress and determine current step
  const steps: Step[] = [
    {
      id: 'groups',
      title: 'Create Tournament Groups',
      description: 'Organize teams into groups or divisions for structured competition',
      status: hasGroups ? 'completed' : 'current',
      action: hasGroups ? undefined : {
        label: 'Create Groups',
        tab: 'teams',
        onClick: () => onNavigateToTab?.('teams')
      },
      icon: <Users className="w-5 h-5" />,
      estimatedTime: '5 minutes'
    },
    {
      id: 'assignments',
      title: 'Assign Teams to Groups',
      description: 'Place registered teams into their respective groups or divisions',
      status: hasTeamAssignments ? 'completed' : hasGroups ? 'current' : 'pending',
      action: hasTeamAssignments ? undefined : hasGroups ? {
        label: 'Assign Teams',
        tab: 'teams',
        onClick: () => onNavigateToTab?.('teams')
      } : undefined,
      icon: <Target className="w-5 h-5" />,
      estimatedTime: '10 minutes'
    },
    {
      id: 'structure',
      title: 'Set Up Tournament Structure',
      description: 'Create stages (Group Stage, Knockout, etc.) and define competition format',
      status: hasStages ? 'completed' : hasTeamAssignments ? 'current' : 'pending',
      action: hasStages ? undefined : hasTeamAssignments ? {
        label: 'Configure Structure',
        tab: 'structure',
        onClick: () => onNavigateToTab?.('structure')
      } : undefined,
      icon: <Settings className="w-5 h-5" />,
      estimatedTime: '15 minutes'
    },
    {
      id: 'rounds',
      title: 'Create Rounds & Rules',
      description: 'Define rounds within each stage and set match rules, scoring, and regulations',
      status: hasRounds ? 'completed' : hasStages ? 'current' : 'pending',
      action: hasRounds ? undefined : hasStages ? {
        label: 'Create Rounds',
        tab: 'structure',
        onClick: () => onNavigateToTab?.('structure')
      } : undefined,
      icon: <Calendar className="w-5 h-5" />,
      estimatedTime: '10 minutes'
    },
    {
      id: 'fixtures',
      title: 'Generate Fixtures',
      description: 'Create actual matches between teams with dates, times, and venues',
      status: hasMatches ? 'completed' : hasRounds ? 'current' : 'pending',
      action: hasMatches ? undefined : hasRounds ? {
        label: 'Generate Matches',
        tab: 'structure',
        onClick: () => onNavigateToTab?.('structure')
      } : undefined,
      icon: <PlayCircle className="w-5 h-5" />,
      estimatedTime: '5 minutes'
    },
    {
      id: 'launch',
      title: 'Launch Tournament',
      description: 'Activate the tournament and begin match day operations',
      status: isActive ? 'completed' : hasMatches ? 'current' : 'pending',
      action: isActive ? undefined : hasMatches ? {
        label: 'Launch Tournament',
        onClick: () => {
          // Handle tournament activation
          console.log('Launching tournament...');
        }
      } : undefined,
      icon: <Trophy className="w-5 h-5" />,
      estimatedTime: '2 minutes'
    }
  ];

  const completedSteps = steps.filter(step => step.status === 'completed').length;
  const totalSteps = steps.length;
  const progressPercentage = (completedSteps / totalSteps) * 100;
  const currentStep = steps.find(step => step.status === 'current');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600';
      case 'current': return 'text-blue-600';
      case 'pending': return 'text-gray-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'current': return <Clock className="w-4 h-4 text-blue-600" />;
      case 'pending': return <div className="w-4 h-4 rounded-full border-2 border-gray-300" />;
      default: return <div className="w-4 h-4 rounded-full border-2 border-gray-300" />;
    }
  };

  return (
    <Card className="mb-6 border-blue-200 bg-blue-50/50">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Trophy className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-lg">Tournament Setup Progress</CardTitle>
              <CardDescription>
                Complete these steps to launch your tournament successfully
              </CardDescription>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? 'Collapse' : 'Expand'}
          </Button>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">Progress: {completedSteps} of {totalSteps} steps completed</span>
            <span className="text-muted-foreground">{Math.round(progressPercentage)}%</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="pt-0">
          {/* Current Step Alert */}
          {currentStep && (
            <Alert className="mb-4 border-blue-200 bg-blue-50">
              <Info className="h-4 w-4" />
              <AlertDescription className="flex items-center justify-between">
                <div>
                  <strong>Next Step:</strong> {currentStep.title} 
                  {currentStep.estimatedTime && (
                    <span className="text-muted-foreground ml-1">
                      (Est. {currentStep.estimatedTime})
                    </span>
                  )}
                </div>
                {currentStep.action && (
                  <Button 
                    size="sm" 
                    onClick={currentStep.action.onClick}
                    className="ml-4"
                  >
                    {currentStep.action.label}
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                )}
              </AlertDescription>
            </Alert>
          )}

          {/* Steps List */}
          <div className="space-y-3">
            {steps.map((step, index) => (
              <div key={step.id}>
                <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-white/50 transition-colors">
                  <div className="flex-shrink-0 mt-0.5">
                    {getStatusIcon(step.status)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`font-medium ${getStatusColor(step.status)}`}>
                        {step.title}
                      </span>
                      {step.estimatedTime && step.status !== 'completed' && (
                        <Badge variant="outline" className="text-xs">
                          {step.estimatedTime}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {step.description}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {step.status === 'completed' && (
                      <Badge variant="secondary" className="text-xs">
                        Done
                      </Badge>
                    )}
                    {step.action && step.status !== 'completed' && (
                      <Button 
                        size="sm" 
                        variant={step.status === 'current' ? 'default' : 'outline'}
                        onClick={step.action.onClick}
                        disabled={step.status === 'pending'}
                      >
                        {step.action.label}
                        <ArrowRight className="w-4 h-4 ml-1" />
                      </Button>
                    )}
                  </div>
                </div>
                
                {index < steps.length - 1 && (
                  <Separator className="ml-8 my-1" />
                )}
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="mt-6 p-4 bg-white rounded-lg border">
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Quick Actions
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => onNavigateToTab?.('teams')}
              >
                <Users className="w-4 h-4 mr-2" />
                Manage Teams
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => onNavigateToTab?.('structure')}
              >
                <Target className="w-4 h-4 mr-2" />
                Configure Structure
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => onNavigateToTab?.('details')}
              >
                <Settings className="w-4 h-4 mr-2" />
                Tournament Settings
              </Button>
            </div>
          </div>

          {/* Help Section */}
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-gray-700 mb-1">Need Help?</p>
                <p className="text-gray-600">
                  Each step has guided wizards and templates to make setup easy. 
                  Click on any action button to get started with that step.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
};

export default NextStepsGuide;