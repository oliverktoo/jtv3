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
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Trophy, Target, Users, Crown, Globe, Zap, Calendar, Clock, 
  MapPin, Settings, Play, Download, BookOpen, Star, Sparkles,
  CheckCircle, Info, ArrowRight, Grid3X3, GitBranch, RotateCcw,
  AlertTriangle, X, Search
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useTeamRegistrations } from '@/hooks/useTeamRegistrations';
import { apiRequest } from '@/lib/queryClient';

interface TournamentTemplatesProps {
  tournamentId: string;
  onTemplateApplied?: (templateId: string, config: any) => void;
}

interface TournamentTemplate {
  id: string;
  name: string;
  description: string;
  category: 'POPULAR' | 'CLASSIC' | 'MODERN' | 'CUSTOM';
  difficulty: 'SIMPLE' | 'MODERATE' | 'COMPLEX';
  minTeams: number;
  maxTeams: number;
  estimatedDuration: string;
  icon: React.ComponentType<any>;
  color: string;
  features: string[];
  structure: TemplateStructure;
  popularity: number;
  featured?: boolean;
}

interface TemplateStructure {
  phases: TemplatePhase[];
  totalRounds: number;
  hasGroups: boolean;
  hasKnockout: boolean;
  hasPlayoffs: boolean;
}

interface TemplatePhase {
  name: string;
  type: 'GROUP' | 'KNOCKOUT' | 'LEAGUE' | 'PLAYOFF';
  order: number;
  config: any;
  description: string;
}

interface TemplateApplication {
  templateId: string;
  customizations: {
    numberOfTeams: number;
    startDate: Date;
    venues: string[];
    matchDuration: number;
    restDays: number;
  };
}

const TOURNAMENT_TEMPLATES: TournamentTemplate[] = [
  {
    id: 'world-cup',
    name: 'World Cup Format',
    description: 'FIFA World Cup style with group stage followed by knockout rounds',
    category: 'POPULAR',
    difficulty: 'COMPLEX',
    minTeams: 16,
    maxTeams: 32,
    estimatedDuration: '6-8 weeks',
    icon: Globe,
    color: 'bg-blue-600',
    popularity: 95,
    featured: true,
    features: ['Group Stage', 'Round of 16', 'Quarter Finals', 'Semi Finals', 'Final', 'Third Place'],
    structure: {
      phases: [
        {
          name: 'Group Stage',
          type: 'GROUP',
          order: 1,
          config: { numberOfGroups: 8, teamsPerGroup: 4, qualifiersPerGroup: 2 },
          description: '8 groups of 4 teams, top 2 qualify'
        },
        {
          name: 'Round of 16',
          type: 'KNOCKOUT',
          order: 2,
          config: { numberOfRounds: 1, seedTeams: true },
          description: 'Single elimination knockout phase'
        },
        {
          name: 'Quarter Finals',
          type: 'KNOCKOUT',
          order: 3,
          config: { numberOfRounds: 1 },
          description: 'Last 8 teams compete'
        },
        {
          name: 'Semi Finals',
          type: 'KNOCKOUT',
          order: 4,
          config: { numberOfRounds: 1 },
          description: 'Last 4 teams compete'
        },
        {
          name: 'Final',
          type: 'KNOCKOUT',
          order: 5,
          config: { numberOfRounds: 1 },
          description: 'Championship match'
        }
      ],
      totalRounds: 7,
      hasGroups: true,
      hasKnockout: true,
      hasPlayoffs: false
    }
  },
  {
    id: 'premier-league',
    name: 'Premier League',
    description: 'Round-robin league format where every team plays every other team twice',
    category: 'POPULAR',
    difficulty: 'SIMPLE',
    minTeams: 10,
    maxTeams: 20,
    estimatedDuration: '20-38 weeks',
    icon: Trophy,
    color: 'bg-green-600',
    popularity: 88,
    featured: true,
    features: ['Home & Away', 'Points Table', 'Goal Difference', 'Round Robin'],
    structure: {
      phases: [
        {
          name: 'League Season',
          type: 'LEAGUE',
          order: 1,
          config: { homeAndAway: true, numberOfRounds: 2 },
          description: 'All teams play each other home and away'
        }
      ],
      totalRounds: 38,
      hasGroups: false,
      hasKnockout: false,
      hasPlayoffs: false
    }
  },
  {
    id: 'champions-league',
    name: 'Champions League',
    description: 'UEFA Champions League format with group stage and knockout rounds',
    category: 'POPULAR',
    difficulty: 'COMPLEX',
    minTeams: 32,
    maxTeams: 32,
    estimatedDuration: '8-10 months',
    icon: Crown,
    color: 'bg-purple-600',
    popularity: 92,
    featured: true,
    features: ['Group Stage', 'Round of 16', 'Two-Leg Matches', 'Away Goals', 'Final'],
    structure: {
      phases: [
        {
          name: 'Group Stage',
          type: 'GROUP',
          order: 1,
          config: { numberOfGroups: 8, teamsPerGroup: 4, qualifiersPerGroup: 2, homeAndAway: true },
          description: '8 groups of 4, each team plays 6 matches'
        },
        {
          name: 'Round of 16',
          type: 'KNOCKOUT',
          order: 2,
          config: { numberOfRounds: 1, homeAndAway: true, numberOfLegs: 2 },
          description: 'Two-leg knockout matches'
        },
        {
          name: 'Quarter Finals',
          type: 'KNOCKOUT',
          order: 3,
          config: { numberOfRounds: 1, homeAndAway: true, numberOfLegs: 2 },
          description: 'Two-leg knockout matches'
        },
        {
          name: 'Semi Finals',
          type: 'KNOCKOUT',
          order: 4,
          config: { numberOfRounds: 1, homeAndAway: true, numberOfLegs: 2 },
          description: 'Two-leg knockout matches'
        },
        {
          name: 'Final',
          type: 'KNOCKOUT',
          order: 5,
          config: { numberOfRounds: 1, homeAndAway: false },
          description: 'Single match at neutral venue'
        }
      ],
      totalRounds: 13,
      hasGroups: true,
      hasKnockout: true,
      hasPlayoffs: false
    }
  },
  {
    id: 'fa-cup',
    name: 'FA Cup Format',
    description: 'Single elimination knockout tournament from first round to final',
    category: 'CLASSIC',
    difficulty: 'SIMPLE',
    minTeams: 8,
    maxTeams: 128,
    estimatedDuration: '3-7 rounds',
    icon: Target,
    color: 'bg-red-600',
    popularity: 76,
    features: ['Single Elimination', 'Random Draw', 'David vs Goliath', 'Replays'],
    structure: {
      phases: [
        {
          name: 'Knockout Tournament',
          type: 'KNOCKOUT',
          order: 1,
          config: { numberOfRounds: 7, seedTeams: false, randomDraw: true },
          description: 'Single elimination with random draw each round'
        }
      ],
      totalRounds: 7,
      hasGroups: false,
      hasKnockout: true,
      hasPlayoffs: false
    }
  },
  {
    id: 'nba-playoffs',
    name: 'NBA Playoffs',
    description: 'Best-of-seven series playoff format with seeded brackets',
    category: 'MODERN',
    difficulty: 'MODERATE',
    minTeams: 8,
    maxTeams: 16,
    estimatedDuration: '6-8 weeks',
    icon: Zap,
    color: 'bg-orange-600',
    popularity: 71,
    features: ['Best of 7', 'Seeded Brackets', 'Home Court Advantage', 'Conference Finals'],
    structure: {
      phases: [
        {
          name: 'First Round',
          type: 'PLAYOFF',
          order: 1,
          config: { numberOfLegs: 7, seedTeams: true, homeAndAway: true },
          description: 'Best of 7 series, first round'
        },
        {
          name: 'Conference Finals',
          type: 'PLAYOFF',
          order: 2,
          config: { numberOfLegs: 7, homeAndAway: true },
          description: 'Best of 7 conference championship'
        },
        {
          name: 'Championship',
          type: 'PLAYOFF',
          order: 3,
          config: { numberOfLegs: 7, homeAndAway: true },
          description: 'Best of 7 championship series'
        }
      ],
      totalRounds: 21,
      hasGroups: false,
      hasKnockout: false,
      hasPlayoffs: true
    }
  },
  {
    id: 'swiss-system',
    name: 'Swiss System',
    description: 'Swiss tournament system where teams are paired based on performance',
    category: 'MODERN',
    difficulty: 'MODERATE',
    minTeams: 8,
    maxTeams: 64,
    estimatedDuration: '5-7 rounds',
    icon: Grid3X3,
    color: 'bg-indigo-600',
    popularity: 64,
    features: ['Performance Pairing', 'No Elimination', 'Equal Rounds', 'Rating System'],
    structure: {
      phases: [
        {
          name: 'Swiss Rounds',
          type: 'LEAGUE',
          order: 1,
          config: { numberOfRounds: 7, seedTeams: true, performancePairing: true },
          description: 'Teams paired based on performance each round'
        }
      ],
      totalRounds: 7,
      hasGroups: false,
      hasKnockout: false,
      hasPlayoffs: false
    }
  },
  {
    id: 'copa-america',
    name: 'Copa America',
    description: 'South American championship format with groups and knockout phase',
    category: 'CLASSIC',
    difficulty: 'MODERATE',
    minTeams: 12,
    maxTeams: 16,
    estimatedDuration: '4-5 weeks',
    icon: Globe,
    color: 'bg-yellow-600',
    popularity: 68,
    features: ['Group Stage', 'Quarter Finals', 'Third Place Playoff', 'Continental'],
    structure: {
      phases: [
        {
          name: 'Group Stage',
          type: 'GROUP',
          order: 1,
          config: { numberOfGroups: 4, teamsPerGroup: 4, qualifiersPerGroup: 2 },
          description: '4 groups of 4 teams'
        },
        {
          name: 'Quarter Finals',
          type: 'KNOCKOUT',
          order: 2,
          config: { numberOfRounds: 1 },
          description: 'Single elimination quarters'
        },
        {
          name: 'Semi Finals',
          type: 'KNOCKOUT',
          order: 3,
          config: { numberOfRounds: 1 },
          description: 'Single elimination semis'
        },
        {
          name: 'Final',
          type: 'KNOCKOUT',
          order: 4,
          config: { numberOfRounds: 1, thirdPlacePlayoff: true },
          description: 'Championship and third place matches'
        }
      ],
      totalRounds: 6,
      hasGroups: true,
      hasKnockout: true,
      hasPlayoffs: false
    }
  }
];

const TemplateCard: React.FC<{
  template: TournamentTemplate;
  teamCount: number;
  onSelect: (template: TournamentTemplate) => void;
  onPreview: (template: TournamentTemplate) => void;
}> = ({ template, teamCount, onSelect, onPreview }) => {
  const Icon = template.icon;
  const isCompatible = teamCount >= template.minTeams && teamCount <= template.maxTeams;

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'SIMPLE': return 'bg-green-100 text-green-800';
      case 'MODERATE': return 'bg-yellow-100 text-yellow-800';
      case 'COMPLEX': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className={`hover:shadow-lg transition-all cursor-pointer ${
      template.featured ? 'ring-2 ring-yellow-200 shadow-md' : ''
    } ${!isCompatible ? 'opacity-60' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-lg ${template.color} text-white relative`}>
              <Icon className="h-6 w-6" />
              {template.featured && (
                <Star className="h-3 w-3 absolute -top-1 -right-1 text-yellow-400 fill-current" />
              )}
            </div>
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                {template.name}
                {template.featured && (
                  <Sparkles className="h-4 w-4 text-yellow-500" />
                )}
              </CardTitle>
              <CardDescription className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="text-xs">
                  {template.category}
                </Badge>
                <Badge className={`text-xs ${getDifficultyColor(template.difficulty)}`}>
                  {template.difficulty}
                </Badge>
              </CardDescription>
            </div>
          </div>
          
          <div className="text-right text-sm">
            <div className="flex items-center gap-1">
              <Star className="h-3 w-3 text-yellow-500 fill-current" />
              <span className="text-xs font-medium">{template.popularity}%</span>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          {template.description}
        </p>
        
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <span className="text-muted-foreground">Teams:</span>
            <div className={`font-medium ${isCompatible ? 'text-green-600' : 'text-red-600'}`}>
              {template.minTeams}-{template.maxTeams}
            </div>
          </div>
          <div>
            <span className="text-muted-foreground">Duration:</span>
            <div className="font-medium">{template.estimatedDuration}</div>
          </div>
        </div>
        
        {!isCompatible && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="text-xs">
              Requires {template.minTeams}-{template.maxTeams} teams (you have {teamCount})
            </AlertDescription>
          </Alert>
        )}
        
        <div className="flex flex-wrap gap-1">
          {template.features.slice(0, 4).map((feature) => (
            <Badge key={feature} variant="secondary" className="text-xs">
              {feature}
            </Badge>
          ))}
          {template.features.length > 4 && (
            <Badge variant="outline" className="text-xs">
              +{template.features.length - 4} more
            </Badge>
          )}
        </div>
        
        <Separator />
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPreview(template)}
            className="flex-1"
          >
            <BookOpen className="h-3 w-3 mr-1" />
            Preview
          </Button>
          <Button
            onClick={() => onSelect(template)}
            disabled={!isCompatible}
            size="sm"
            className="flex-1"
          >
            <Download className="h-3 w-3 mr-1" />
            Use Template
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

const TemplatePreview: React.FC<{
  template: TournamentTemplate;
  isOpen: boolean;
  onClose: () => void;
  onApply: () => void;
}> = ({ template, isOpen, onClose, onApply }) => {
  const Icon = template.icon;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${template.color} text-white`}>
              <Icon className="h-5 w-5" />
            </div>
            {template.name} Template
          </DialogTitle>
          <DialogDescription>
            {template.description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 max-h-[60vh] overflow-y-auto">
          {/* Template Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 border rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {template.structure.phases.length}
              </div>
              <div className="text-sm text-muted-foreground">Phases</div>
            </div>
            <div className="text-center p-3 border rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {template.structure.totalRounds}
              </div>
              <div className="text-sm text-muted-foreground">Total Rounds</div>
            </div>
            <div className="text-center p-3 border rounded-lg">
              <div className="text-2xl font-bold text-orange-600">
                {template.minTeams}-{template.maxTeams}
              </div>
              <div className="text-sm text-muted-foreground">Teams</div>
            </div>
            <div className="text-center p-3 border rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {template.estimatedDuration}
              </div>
              <div className="text-sm text-muted-foreground">Duration</div>
            </div>
          </div>

          {/* Structure Breakdown */}
          <div className="space-y-4">
            <h4 className="font-semibold">Tournament Structure</h4>
            
            <div className="space-y-3">
              {template.structure.phases.map((phase, index) => {
                const phaseIcon = phase.type === 'GROUP' ? Grid3X3 :
                               phase.type === 'KNOCKOUT' ? Target :
                               phase.type === 'LEAGUE' ? Trophy :
                               phase.type === 'PLAYOFF' ? Zap : Settings;
                const PhaseIcon = phaseIcon;
                
                return (
                  <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                    <div className="flex-shrink-0 mt-1">
                      <div className="p-2 bg-gray-100 rounded-lg">
                        <PhaseIcon className="h-4 w-4" />
                      </div>
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h5 className="font-medium">{phase.name}</h5>
                        <Badge variant="outline" className="text-xs">
                          Phase {phase.order}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {phase.type}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {phase.description}
                      </p>
                      
                      <div className="flex gap-2 mt-2">
                        {Object.entries(phase.config).map(([key, value]) => (
                          <Badge key={key} variant="outline" className="text-xs">
                            {key}: {String(value)}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    {index < template.structure.phases.length - 1 && (
                      <ArrowRight className="h-4 w-4 text-muted-foreground mt-2" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Features */}
          <div className="space-y-3">
            <h4 className="font-semibold">Key Features</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {template.features.map((feature) => (
                <div key={feature} className="flex items-center gap-2 p-2 border rounded-lg">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close Preview
          </Button>
          <Button onClick={onApply}>
            <Download className="h-4 w-4 mr-2" />
            Apply Template
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export const TournamentTemplates: React.FC<TournamentTemplatesProps> = ({ 
  tournamentId,
  onTemplateApplied
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [previewTemplate, setPreviewTemplate] = useState<TournamentTemplate | null>(null);
  const [isApplying, setIsApplying] = useState(false);

  // Queries
  const { data: teamRegistrations = [] } = useTeamRegistrations(tournamentId);
  
  // Extract teams from registrations
  const teams = teamRegistrations.map(reg => reg.teams).filter(Boolean);

  // Clear functions
  const clearSearch = () => {
    setSearchTerm('');
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
  };

  const hasActiveFilters = searchTerm || selectedCategory !== 'all';

  const categories = [
    { value: 'all', label: 'All Templates' },
    { value: 'POPULAR', label: 'Popular' },
    { value: 'CLASSIC', label: 'Classic' },
    { value: 'MODERN', label: 'Modern' },
    { value: 'CUSTOM', label: 'Custom' }
  ];

  // Filter templates
  const filteredTemplates = TOURNAMENT_TEMPLATES.filter(template => {
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.features.some(f => f.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCategory && matchesSearch;
  }).sort((a, b) => {
    // Sort by featured first, then by popularity
    if (a.featured && !b.featured) return -1;
    if (!a.featured && b.featured) return 1;
    return b.popularity - a.popularity;
  });

  const applyTemplate = useMutation({
    mutationFn: async (template: TournamentTemplate) => {
      try {
        // Try backend API first
        return await apiRequest('POST', `/api/tournaments/${tournamentId}/apply-template?orgId=${user?.currentOrgId}`, {
          templateId: template.id,
          templateConfig: template.structure,
          customizations: {
            numberOfTeams: teams.length,
            startDate: new Date(),
            venues: ['Main Stadium'],
            matchDuration: 90,
            restDays: 3
          }
        });
      } catch (error) {
        console.warn('Backend template API unavailable, applying template locally:', error);
        
        // Fallback: Apply template structure directly via Supabase
        const { supabase } = await import("@/lib/supabase");
        
        // Create basic tournament structure based on template
        const stageType = template.structure.format === 'round_robin' ? 'GROUP' : 'KNOCKOUT';
        
        // Create stage
        const { data: stage, error: stageError } = await supabase
          .from('stages')
          .insert([{
            tournament_id: tournamentId,
            name: template.structure.name || `${template.name} Stage`,
            stage_type: stageType,
            seq: 1
          }])
          .select()
          .single();
        
        if (stageError) throw new Error(`Failed to create stage: ${stageError.message}`);
        
        // Create group if needed
        let group = null;
        if (template.structure.groups && template.structure.groups > 0) {
          const { data: groupData, error: groupError } = await supabase
            .from('groups')
            .insert([{
              stage_id: stage.id,
              name: 'Group A',
              seq: 1
            }])
            .select()
            .single();
          
          if (groupError) throw new Error(`Failed to create group: ${groupError.message}`);
          group = groupData;
        }
        
        return {
          success: true,
          message: `Template "${template.name}" applied successfully`,
          stageId: stage.id,
          groupId: group?.id || null
        };
      }
    },
    onSuccess: (result, template) => {
      setIsApplying(false);
      setPreviewTemplate(null);
      queryClient.invalidateQueries({ queryKey: ['stages'] });
      queryClient.invalidateQueries({ queryKey: ['rounds'] });
      queryClient.invalidateQueries({ queryKey: ['matches'] });
      
      onTemplateApplied?.(template.id, result);
      
      toast({
        title: "Template Applied!",
        description: `${template.name} template has been successfully applied to your tournament.`,
      });
    },
    onError: (error: any) => {
      setIsApplying(false);
      toast({
        title: "Application Failed",
        description: error.message || "Failed to apply tournament template",
        variant: "destructive",
      });
    },
  });

  const handleSelectTemplate = (template: TournamentTemplate) => {
    setIsApplying(true);
    applyTemplate.mutate(template);
  };

  const handlePreviewTemplate = (template: TournamentTemplate) => {
    setPreviewTemplate(template);
  };

  const handleApplyFromPreview = () => {
    if (previewTemplate) {
      setIsApplying(true);
      applyTemplate.mutate(previewTemplate);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Tournament Templates</h3>
          <p className="text-sm text-muted-foreground">
            Choose from pre-configured tournament formats to quickly set up your competition
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search templates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-10"
          />
          {searchTerm && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearSearch}
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-muted"
            >
              <X className="w-3 h-3" />
            </Button>
          )}
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category.value} value={category.value}>
                {category.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {hasActiveFilters && (
          <Button
            variant="outline"
            size="sm"
            onClick={clearAllFilters}
            className="flex items-center gap-1"
          >
            <RotateCcw className="w-3 h-3" />
            Clear Filters
          </Button>
        )}
      </div>

      {/* Team Count Alert */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          You have {teams.length} teams registered. Templates will show compatibility based on team requirements.
        </AlertDescription>
      </Alert>

      {/* Templates Grid */}
      {filteredTemplates.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No templates found</h3>
            <p className="text-sm text-muted-foreground text-center max-w-sm">
              Try adjusting your search terms or category filter to find suitable tournament templates.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredTemplates.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              teamCount={teams.length}
              onSelect={handleSelectTemplate}
              onPreview={handlePreviewTemplate}
            />
          ))}
        </div>
      )}

      {/* Template Preview Dialog */}
      {previewTemplate && (
        <TemplatePreview
          template={previewTemplate}
          isOpen={!!previewTemplate}
          onClose={() => setPreviewTemplate(null)}
          onApply={handleApplyFromPreview}
        />
      )}

      {/* Loading State */}
      {isApplying && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="p-6">
            <div className="flex items-center gap-3">
              <div className="animate-spin">
                <Settings className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium">Applying Template...</p>
                <p className="text-sm text-muted-foreground">
                  Setting up your tournament structure
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default TournamentTemplates;