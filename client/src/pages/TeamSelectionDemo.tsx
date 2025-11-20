import React from 'react';
import { useParams } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { SeamlessTeamExperience } from '@/components/tournaments/SeamlessTeamExperience';
import { useAllTournaments } from '@/hooks/useTournaments';

const TeamSelectionDemo: React.FC = () => {
  const { tournamentId } = useParams();
  const { data: tournaments = [] } = useAllTournaments();
  
  // Use the provided tournament ID or fall back to the first available tournament
  const selectedTournament = tournamentId 
    ? tournaments.find(t => t.id === tournamentId) 
    : tournaments[0];

  const demoTournamentId = selectedTournament?.id || 'demo-tournament-id';
  const demoOrgId = selectedTournament?.orgId || 'demo-org-id';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="ghost"
              onClick={() => window.history.back()}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
            <Badge className="bg-green-500 text-white">
              ✨ Live Demo
            </Badge>
          </div>
          
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
              Seamless Team Selection
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Experience the future of tournament team registration with our intuitive, fast, and powerful interface.
            </p>
          </div>
        </div>

        {/* Tournament Context */}
        {selectedTournament && (
          <Card className="mb-8 bg-white/80 backdrop-blur">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold">{selectedTournament.name}</h2>
                  <p className="text-sm text-muted-foreground">
                    {selectedTournament.season} • {selectedTournament.tournamentModel}
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View Tournament
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Demo Experience */}
        <SeamlessTeamExperience 
          tournamentId={demoTournamentId}
          orgId={demoOrgId}
          tournamentName={selectedTournament?.name || 'Demo Tournament'}
        />

        {/* Instructions */}
        <Card className="mt-8 bg-blue-50/80">
          <CardHeader>
            <CardTitle className="text-lg text-blue-900">How to Access This in the App</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-semibold text-blue-800 mb-2">Method 1: Tournament Details</h4>
                <ol className="space-y-1 text-blue-700">
                  <li>1. Go to Tournaments page</li>
                  <li>2. Click "Manage" on any tournament</li>
                  <li>3. Stay on "Details" tab</li>
                  <li>4. Scroll to "Team Registration" section</li>
                </ol>
              </div>
              <div>
                <h4 className="font-semibold text-blue-800 mb-2">Method 2: Teams Tab</h4>
                <ol className="space-y-1 text-blue-700">
                  <li>1. Go to Tournaments page</li>
                  <li>2. Click "Manage" on any tournament</li>
                  <li>3. Click "Teams" tab</li>
                  <li>4. All new components are there</li>
                </ol>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TeamSelectionDemo;