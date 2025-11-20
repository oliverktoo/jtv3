import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  Zap, 
  Search, 
  Trophy,
  Target,
  CheckCircle2,
  Clock,
  Plus,
  ArrowRight
} from 'lucide-react';
import { SeamlessTeamSelector } from './SeamlessTeamSelector';
import { QuickTeamRegistration } from './QuickTeamRegistration';
import { RegisteredTeamsDashboard } from './RegisteredTeamsDashboard';

interface SeamlessTeamExperienceProps {
  tournamentId: string;
  orgId: string;
  tournamentName?: string;
}

export const SeamlessTeamExperience: React.FC<SeamlessTeamExperienceProps> = ({
  tournamentId,
  orgId,
  tournamentName = 'Tournament'
}) => {
  const [activeDemo, setActiveDemo] = useState('quick');

  const features = [
    {
      id: 'quick',
      title: 'Quick Registration',
      icon: <Zap className="w-5 h-5" />,
      description: 'Instant team registration with smart search',
      color: 'text-green-600 bg-green-50'
    },
    {
      id: 'advanced',
      title: 'Advanced Selection',
      icon: <Search className="w-5 h-5" />,
      description: 'Comprehensive team browser with filters',
      color: 'text-blue-600 bg-blue-50'
    },
    {
      id: 'bulk',
      title: 'Bulk Registration',
      icon: <Users className="w-5 h-5" />,
      description: 'Register multiple teams at once',
      color: 'text-purple-600 bg-purple-50'
    },
    {
      id: 'dashboard',
      title: 'Team Dashboard',
      icon: <Trophy className="w-5 h-5" />,
      description: 'Manage registered teams with visual insights',
      color: 'text-orange-600 bg-orange-50'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold">Seamless Team Selection Experience</h1>
        <p className="text-muted-foreground">
          Modern, intuitive team registration for {tournamentName}
        </p>
      </div>

      {/* Feature Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {features.map((feature) => (
          <Card 
            key={feature.id}
            className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
              activeDemo === feature.id ? 'ring-2 ring-primary' : ''
            }`}
            onClick={() => setActiveDemo(feature.id)}
          >
            <CardContent className="p-4">
              <div className={`rounded-lg p-3 ${feature.color} mb-3 w-fit`}>
                {feature.icon}
              </div>
              <h3 className="font-semibold text-sm mb-1">{feature.title}</h3>
              <p className="text-xs text-muted-foreground">{feature.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Interactive Demo */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                {features.find(f => f.id === activeDemo)?.icon}
                {features.find(f => f.id === activeDemo)?.title} Demo
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {features.find(f => f.id === activeDemo)?.description}
              </p>
            </div>
            <Badge variant="outline">Interactive</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeDemo} onValueChange={setActiveDemo}>
            <TabsList className="grid grid-cols-4 w-full">
              <TabsTrigger value="quick">Quick</TabsTrigger>
              <TabsTrigger value="advanced">Advanced</TabsTrigger>
              <TabsTrigger value="bulk">Bulk</TabsTrigger>
              <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            </TabsList>

            <TabsContent value="quick" className="space-y-4 mt-6">
              <div className="text-center space-y-4">
                <div className="max-w-md mx-auto">
                  <QuickTeamRegistration 
                    tournamentId={tournamentId}
                    orgId={orgId}
                  />
                </div>
                <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <span>Search, select, and register in seconds</span>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="advanced" className="space-y-4 mt-6">
              <div className="text-center space-y-4">
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">Advanced Team Browser</h3>
                  <p className="text-sm text-muted-foreground max-w-lg mx-auto">
                    Browse teams with advanced filters, view detailed information, and make informed registration decisions.
                  </p>
                </div>
                
                <SeamlessTeamSelector 
                  tournamentId={tournamentId}
                  orgId={orgId}
                  mode="bulk"
                  trigger={
                    <Button size="lg" className="w-64">
                      <Search className="w-4 h-4 mr-2" />
                      Open Advanced Browser
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  }
                />
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <Target className="w-4 h-4 text-blue-500" />
                    <span>Smart filtering by location</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Search className="w-4 h-4 text-green-500" />
                    <span>Real-time search</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4 text-purple-500" />
                    <span>Team insights & stats</span>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="bulk" className="space-y-4 mt-6">
              <div className="text-center space-y-4">
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">Bulk Team Registration</h3>
                  <p className="text-sm text-muted-foreground max-w-lg mx-auto">
                    Register multiple teams simultaneously with our efficient bulk registration interface.
                  </p>
                </div>
                
                <SeamlessTeamSelector 
                  tournamentId={tournamentId}
                  orgId={orgId}
                  mode="bulk"
                  trigger={
                    <Button size="lg" variant="outline" className="w-64">
                      <Users className="w-4 h-4 mr-2" />
                      Open Bulk Registration
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  }
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    <span>Multi-select interface</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-blue-500" />
                    <span>Batch processing</span>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="dashboard" className="space-y-4 mt-6">
              <div className="space-y-4">
                <div className="text-center space-y-2">
                  <h3 className="text-lg font-semibold">Registered Teams Dashboard</h3>
                  <p className="text-sm text-muted-foreground">
                    Monitor and manage all registered teams with comprehensive insights
                  </p>
                </div>
                
                <RegisteredTeamsDashboard 
                  tournamentId={tournamentId}
                  canManageRegistrations={true}
                />
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Benefits Summary */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50">
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <h3 className="text-lg font-semibold">Why Teams Love This Experience</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center space-y-2">
                <div className="bg-white rounded-full p-3 w-fit mx-auto">
                  <Zap className="w-6 h-6 text-yellow-500" />
                </div>
                <h4 className="font-medium">Lightning Fast</h4>
                <p className="text-sm text-muted-foreground">
                  Register teams in under 10 seconds with our quick registration
                </p>
              </div>
              <div className="text-center space-y-2">
                <div className="bg-white rounded-full p-3 w-fit mx-auto">
                  <Search className="w-6 h-6 text-blue-500" />
                </div>
                <h4 className="font-medium">Smart Discovery</h4>
                <p className="text-sm text-muted-foreground">
                  Find the right teams with intelligent search and filtering
                </p>
              </div>
              <div className="text-center space-y-2">
                <div className="bg-white rounded-full p-3 w-fit mx-auto">
                  <Trophy className="w-6 h-6 text-green-500" />
                </div>
                <h4 className="font-medium">Complete Management</h4>
                <p className="text-sm text-muted-foreground">
                  Full oversight with visual dashboards and team insights
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SeamlessTeamExperience;