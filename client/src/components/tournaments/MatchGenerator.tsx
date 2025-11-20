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
import { Textarea } from '@/components/ui/textarea';
import { Calendar, Clock, MapPin, Users, Zap, Settings, Play, Shuffle, Target, RotateCcw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useMatches } from '@/hooks/useMatches';
import { useRounds } from '@/hooks/useRounds';
import { useStages } from '@/hooks/useStages';
import { useTeamRegistrations } from '@/hooks/useTeamRegistrations';
import { apiRequest } from '@/lib/queryClient';
import { useAuth } from '@/hooks/useAuth';
import { Match, Round, Stage, Team, InsertMatch } from '../../../shared/schema';
import { format, addDays, addWeeks } from 'date-fns';

interface MatchGeneratorProps {
  tournamentId: string;
  roundId?: string;
  onMatchesGenerated?: (matches: Match[]) => void;
}

interface MatchGenerationConfig {
  roundId: string;
  fixtureType: 'round-robin' | 'knockout' | 'group-stage' | 'playoff' | 'custom';
  startDate: Date;
  timeSlots: string[];
  venues: string[];
  homeAwayEnabled: boolean;
  legsEnabled: boolean;
  numberOfLegs: number;
  restDaysBetweenRounds: number;
  randomizeOrder: boolean;
  customNotes?: string;
}

interface FixturePreview {
  homeTeam: Team;
  awayTeam: Team;
  kickoff: Date;
  venue: string;
  leg: number;
}

const FIXTURE_TYPES = [
  {
    value: 'round-robin',
    label: 'Round Robin',
    description: 'Every team plays every other team',
    icon: RotateCcw,
    color: 'bg-blue-500'
  },
  {
    value: 'knockout',
    label: 'Knockout',
    description: 'Single elimination tournament',
    icon: Target,
    color: 'bg-red-500'
  },
  {
    value: 'group-stage',
    label: 'Group Stage',
    description: 'Teams divided into groups',
    icon: Users,
    color: 'bg-green-500'
  },
  {
    value: 'playoff',
    label: 'Playoff',
    description: 'Best-of series format',
    icon: Zap,
    color: 'bg-purple-500'
  },
  {
    value: 'custom',
    label: 'Custom',
    description: 'Manual fixture arrangement',
    icon: Settings,
    color: 'bg-gray-500'
  }
];

const DEFAULT_TIME_SLOTS = [
  '09:00', '11:00', '13:00', '15:00', '17:00', '19:00'
];

const DEFAULT_VENUES = [
  'Main Stadium', 'Training Ground A', 'Training Ground B', 'Community Field'
];

const FixturePreviewCard: React.FC<{ fixture: FixturePreview; index: number }> = ({ fixture, index }) => (
  <Card className="hover:shadow-sm transition-shadow">
    <CardContent className="p-4">
      <div className="flex items-center justify-between mb-2">
        <Badge variant="outline" className="text-xs">
          Match {index + 1}
        </Badge>
        {fixture.leg > 1 && (
          <Badge variant="secondary" className="text-xs">
            Leg {fixture.leg}
          </Badge>
        )}
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="font-medium text-sm">{fixture.homeTeam.name}</span>
          <span className="text-xs text-muted-foreground">vs</span>
          <span className="font-medium text-sm">{fixture.awayTeam.name}</span>
        </div>
        
        <Separator />
        
        <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            <span>{format(fixture.kickoff, 'MMM dd')}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>{format(fixture.kickoff, 'HH:mm')}</span>
          </div>
          <div className="flex items-center gap-1 col-span-2">
            <MapPin className="h-3 w-3" />
            <span>{fixture.venue}</span>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
);

const MatchGenerationForm: React.FC<{
  rounds: Round[];
  teams: Team[];
  config: MatchGenerationConfig;
  onConfigChange: (config: MatchGenerationConfig) => void;
  onGenerate: () => void;
  onPreview: () => void;
  isGenerating: boolean;
  isPreviewing: boolean;
}> = ({ rounds, teams, config, onConfigChange, onGenerate, onPreview, isGenerating, isPreviewing }) => {
  const [timeSlot, setTimeSlot] = useState('');
  const [venue, setVenue] = useState('');

  const selectedRound = rounds.find(r => r.id === config.roundId);
  const fixtureType = FIXTURE_TYPES.find(f => f.value === config.fixtureType);
  const TypeIcon = fixtureType?.icon || Settings;

  const addTimeSlot = () => {
    if (timeSlot && !config.timeSlots.includes(timeSlot)) {
      onConfigChange({
        ...config,
        timeSlots: [...config.timeSlots, timeSlot].sort()
      });
      setTimeSlot('');
    }
  };

  const removeTimeSlot = (slot: string) => {
    onConfigChange({
      ...config,
      timeSlots: config.timeSlots.filter(s => s !== slot)
    });
  };

  const addVenue = () => {
    if (venue && !config.venues.includes(venue)) {
      onConfigChange({
        ...config,
        venues: [...config.venues, venue]
      });
      setVenue('');
    }
  };

  const removeVenue = (venueToRemove: string) => {
    onConfigChange({
      ...config,
      venues: config.venues.filter(v => v !== venueToRemove)
    });
  };

  return (
    <div className="space-y-6">
      {/* Round Selection */}
      <div className="space-y-2">
        <Label>Tournament Round *</Label>
        <Select 
          value={config.roundId} 
          onValueChange={(value) => onConfigChange({ ...config, roundId: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a round" />
          </SelectTrigger>
          <SelectContent>
            {rounds.map((round) => (
              <SelectItem key={round.id} value={round.id}>
                {round.name || `Round ${round.number}`}
                {round.leg > 1 && ` (Leg ${round.leg})`}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {selectedRound && (
          <p className="text-sm text-muted-foreground">
            {teams.length} teams available for fixture generation
          </p>
        )}
      </div>

      {/* Fixture Type */}
      <div className="space-y-3">
        <Label>Fixture Type *</Label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {FIXTURE_TYPES.map((type) => {
            const Icon = type.icon;
            return (
              <Card 
                key={type.value}
                className={`cursor-pointer transition-all ${
                  config.fixtureType === type.value 
                    ? 'ring-2 ring-primary border-primary' 
                    : 'hover:border-primary/50'
                }`}
                onClick={() => onConfigChange({ ...config, fixtureType: type.value as any })}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${type.color} text-white`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm">{type.label}</h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        {type.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      <Separator />

      {/* Scheduling Configuration */}
      <div className="space-y-4">
        <h4 className="font-medium">Scheduling Configuration</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="startDate">Start Date *</Label>
            <Input
              id="startDate"
              type="date"
              value={format(config.startDate, 'yyyy-MM-dd')}
              onChange={(e) => onConfigChange({ 
                ...config, 
                startDate: new Date(e.target.value) 
              })}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="restDays">Rest Days Between Rounds</Label>
            <Input
              id="restDays"
              type="number"
              value={config.restDaysBetweenRounds}
              onChange={(e) => onConfigChange({ 
                ...config, 
                restDaysBetweenRounds: parseInt(e.target.value) || 0 
              })}
              min={0}
              max={14}
            />
          </div>
        </div>

        {/* Time Slots */}
        <div className="space-y-2">
          <Label>Match Time Slots</Label>
          <div className="flex gap-2">
            <Input
              type="time"
              value={timeSlot}
              onChange={(e) => setTimeSlot(e.target.value)}
              placeholder="Add time slot"
            />
            <Button type="button" onClick={addTimeSlot} variant="outline">
              Add
            </Button>
          </div>
          <div className="flex flex-wrap gap-1 mt-2">
            {config.timeSlots.map((slot) => (
              <Badge 
                key={slot} 
                variant="secondary" 
                className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                onClick={() => removeTimeSlot(slot)}
              >
                {slot} ×
              </Badge>
            ))}
          </div>
        </div>

        {/* Venues */}
        <div className="space-y-2">
          <Label>Match Venues</Label>
          <div className="flex gap-2">
            <Input
              value={venue}
              onChange={(e) => setVenue(e.target.value)}
              placeholder="Add venue"
            />
            <Button type="button" onClick={addVenue} variant="outline">
              Add
            </Button>
          </div>
          <div className="flex flex-wrap gap-1 mt-2">
            {config.venues.map((v) => (
              <Badge 
                key={v} 
                variant="secondary" 
                className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                onClick={() => removeVenue(v)}
              >
                {v} ×
              </Badge>
            ))}
          </div>
        </div>
      </div>

      <Separator />

      {/* Advanced Options */}
      <div className="space-y-4">
        <h4 className="font-medium">Advanced Options</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Home & Away</Label>
              <p className="text-xs text-muted-foreground">
                Enable home and away designations
              </p>
            </div>
            <Switch
              checked={config.homeAwayEnabled}
              onCheckedChange={(checked) => onConfigChange({ 
                ...config, 
                homeAwayEnabled: checked 
              })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Two-Leg Matches</Label>
              <p className="text-xs text-muted-foreground">
                Generate return fixtures
              </p>
            </div>
            <Switch
              checked={config.legsEnabled}
              onCheckedChange={(checked) => onConfigChange({ 
                ...config, 
                legsEnabled: checked,
                numberOfLegs: checked ? 2 : 1
              })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Randomize Order</Label>
              <p className="text-xs text-muted-foreground">
                Shuffle fixture order
              </p>
            </div>
            <Switch
              checked={config.randomizeOrder}
              onCheckedChange={(checked) => onConfigChange({ 
                ...config, 
                randomizeOrder: checked 
              })}
            />
          </div>
        </div>

        {config.legsEnabled && (
          <div className="space-y-2">
            <Label htmlFor="numberOfLegs">Number of Legs</Label>
            <Select
              value={config.numberOfLegs.toString()}
              onValueChange={(value) => onConfigChange({ 
                ...config, 
                numberOfLegs: parseInt(value) 
              })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Single Leg</SelectItem>
                <SelectItem value="2">Two Legs</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="customNotes">Custom Notes (Optional)</Label>
          <Textarea
            id="customNotes"
            value={config.customNotes || ''}
            onChange={(e) => onConfigChange({ 
              ...config, 
              customNotes: e.target.value 
            })}
            placeholder="Additional instructions for fixture generation..."
            rows={3}
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 pt-4">
        <Button 
          onClick={onPreview}
          variant="outline"
          disabled={!config.roundId || isPreviewing}
          className="flex-1"
        >
          {isPreviewing ? (
            <>
              <Shuffle className="h-4 w-4 mr-2 animate-spin" />
              Generating Preview...
            </>
          ) : (
            <>
              <Settings className="h-4 w-4 mr-2" />
              Preview Fixtures
            </>
          )}
        </Button>
        <Button 
          onClick={onGenerate}
          disabled={!config.roundId || isGenerating}
          className="flex-1"
        >
          {isGenerating ? (
            <>
              <Play className="h-4 w-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Play className="h-4 w-4 mr-2" />
              Generate Matches
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export const MatchGenerator: React.FC<MatchGeneratorProps> = ({ 
  tournamentId, 
  roundId,
  onMatchesGenerated 
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [config, setConfig] = useState<MatchGenerationConfig>({
    roundId: roundId || '',
    fixtureType: 'round-robin',
    startDate: addDays(new Date(), 7), // Start next week
    timeSlots: ['13:00', '15:00'],
    venues: ['Main Stadium'],
    homeAwayEnabled: true,
    legsEnabled: false,
    numberOfLegs: 1,
    restDaysBetweenRounds: 3,
    randomizeOrder: false,
  });

  const [fixturePreview, setFixturePreview] = useState<FixturePreview[]>([]);
  const [showPreview, setShowPreview] = useState(false);

  // Queries
  const { data: rounds = [] } = useRounds(user?.currentOrgId || '', tournamentId);
  const { data: teamRegistrations = [] } = useTeamRegistrations(tournamentId);
  const { data: matches = [] } = useMatches(user?.currentOrgId || '');

  // Extract teams from tournament registrations
  const tournamentTeams = teamRegistrations.map(reg => reg.teams).filter(Boolean);

  // Mutations
  const generatePreviewMutation = useMutation({
    mutationFn: async (generationConfig: MatchGenerationConfig) => {
      const response = await fetch(`/api/tournaments/${tournamentId}/fixtures/preview?orgId=${user?.currentOrgId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(generationConfig),
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate preview');
      }
      
      return response.json();
    },
    onSuccess: (preview: FixturePreview[]) => {
      setFixturePreview(preview);
      setShowPreview(true);
      toast({
        title: "Preview Generated",
        description: `Generated ${preview.length} fixture(s) for preview`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to generate fixture preview",
        variant: "destructive",
      });
    },
  });

  const generateMatchesMutation = useMutation({
    mutationFn: async (generationConfig: MatchGenerationConfig) => {
      const response = await fetch(`/api/tournaments/${tournamentId}/fixtures/generate?orgId=${user?.currentOrgId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(generationConfig),
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate matches');
      }
      
      return response.json();
    },
    onSuccess: (newMatches: Match[]) => {
      queryClient.invalidateQueries({ queryKey: ['matches'] });
      onMatchesGenerated?.(newMatches);
      setShowPreview(false);
      toast({
        title: "Success",
        description: `Generated ${newMatches.length} match(es) successfully!`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to generate matches",
        variant: "destructive",
      });
    },
  });

  const handlePreview = () => {
    generatePreviewMutation.mutate(config);
  };

  const handleGenerate = () => {
    if (showPreview) {
      // Generate from preview
      generateMatchesMutation.mutate(config);
    } else {
      // Generate directly
      generateMatchesMutation.mutate(config);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Match Generator</h3>
          <p className="text-sm text-muted-foreground">
            Automatically generate matches and fixtures for tournament rounds
          </p>
        </div>
      </div>

      <Tabs value={showPreview ? 'preview' : 'config'} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger 
            value="config"
            onClick={() => setShowPreview(false)}
          >
            Configuration
          </TabsTrigger>
          <TabsTrigger 
            value="preview"
            disabled={fixturePreview.length === 0}
          >
            Preview ({fixturePreview.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="config" className="space-y-4">
          <MatchGenerationForm
            rounds={rounds}
            teams={tournamentTeams}
            config={config}
            onConfigChange={setConfig}
            onGenerate={handleGenerate}
            onPreview={handlePreview}
            isGenerating={generateMatchesMutation.isPending}
            isPreviewing={generatePreviewMutation.isPending}
          />
        </TabsContent>

        <TabsContent value="preview" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Fixture Preview</h4>
              <p className="text-sm text-muted-foreground">
                Review the generated fixtures before confirming
              </p>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline"
                onClick={() => setShowPreview(false)}
              >
                Back to Config
              </Button>
              <Button 
                onClick={handleGenerate}
                disabled={generateMatchesMutation.isPending}
              >
                {generateMatchesMutation.isPending ? (
                  <>
                    <Play className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Confirm & Generate
                  </>
                )}
              </Button>
            </div>
          </div>

          <ScrollArea className="h-[600px]">
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {fixturePreview.map((fixture, index) => (
                <FixturePreviewCard 
                  key={`${fixture.homeTeam.id}-${fixture.awayTeam.id}-${index}`}
                  fixture={fixture}
                  index={index}
                />
              ))}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MatchGenerator;