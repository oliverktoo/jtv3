import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Edit, Save, X, Clock, CheckCircle, PlayCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useUpdateMatch } from '@/hooks/useMatches';
import { useTournamentWebSocket, type MatchUpdate } from '@/hooks/useTournamentWebSocket';
import { WebSocketStatus } from '../WebSocketStatus';

interface MatchScoreEditorProps {
  matches: any[];
  tournamentId: string;
  onScoreUpdate?: (matchId: string, homeScore: number, awayScore: number) => void;
}

export function MatchScoreEditor({ matches, tournamentId, onScoreUpdate }: MatchScoreEditorProps) {
  const [editingMatchId, setEditingMatchId] = useState<string | null>(null);
  const [homeScore, setHomeScore] = useState<number>(0);
  const [awayScore, setAwayScore] = useState<number>(0);
  const [matchStatus, setMatchStatus] = useState<string>('SCHEDULED');
  const { toast } = useToast();
  
  // Use the proper update match mutation that invalidates standings
  const updateMatchMutation = useUpdateMatch(tournamentId);
  
  // WebSocket integration for real-time updates
  const { 
    connected, 
    reconnecting, 
    error,
    lastMatchUpdate 
  } = useTournamentWebSocket({
    tournamentId,
    autoConnect: true,
    onMatchUpdate: (update: MatchUpdate) => {
      toast({
        title: "⚡ Live Update",
        description: `${update.homeTeam} ${update.homeScore} - ${update.awayScore} ${update.awayTeam}`,
        duration: 3000
      });
    }
  });

  // Show toast when WebSocket connection changes
  useEffect(() => {
    if (connected && !reconnecting) {
      toast({
        title: "🔌 Connected",
        description: "Receiving live match updates",
        duration: 2000
      });
    }
  }, [connected, reconnecting, toast]);
  
  const handleEditMatch = (match: any) => {
    setEditingMatchId(match.id);
    setHomeScore(match.homeScore ?? match.home_score ?? 0);
    setAwayScore(match.awayScore ?? match.away_score ?? 0);
    setMatchStatus(match.status || 'SCHEDULED');
  };
  
  const handleSaveScore = (matchId: string) => {
    // Update match in database with proper field names
    updateMatchMutation.mutate({
      id: matchId,
      data: {
        home_score: homeScore,
        away_score: awayScore,
        status: matchStatus
      }
    }, {
      onSuccess: () => {
        toast({
          title: "✅ Score Updated",
          description: "Match score and standings have been updated"
        });
        setEditingMatchId(null);
        
        // Call the optional callback
        if (onScoreUpdate) {
          onScoreUpdate(matchId, homeScore, awayScore);
        }
      },
      onError: (error: any) => {
        toast({
          title: "❌ Update Failed",
          description: error.message || "Failed to update score",
          variant: "destructive"
        });
      }
    });
  };
  
  const handleCancelEdit = () => {
    setEditingMatchId(null);
    setHomeScore(0);
    setAwayScore(0);
    setMatchStatus('SCHEDULED');
  };
  
  const getStatusBadge = (status: string) => {
    const upperStatus = status?.toUpperCase() || 'SCHEDULED';
    switch (upperStatus) {
      case 'COMPLETED':
        return <Badge className="bg-green-500"><CheckCircle className="w-3 h-3 mr-1" />FT</Badge>;
      case 'LIVE':
        return <Badge className="bg-red-500 animate-pulse"><PlayCircle className="w-3 h-3 mr-1" />LIVE</Badge>;
      case 'HALFTIME':
        return <Badge className="bg-orange-500"><Clock className="w-3 h-3 mr-1" />HT</Badge>;
      default:
        return <Badge variant="outline"><Clock className="w-3 h-3 mr-1" />Scheduled</Badge>;
    }
  };
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5" />
              Match Score Editor
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Update match scores and status. Changes reflect immediately in standings.
            </p>
          </div>
          <WebSocketStatus 
            connected={connected} 
            reconnecting={reconnecting} 
            error={error}
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {matches.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No matches available. Generate fixtures first.
            </div>
          ) : (
            matches.map((match) => (
              <div 
                key={match.id} 
                className="border rounded-lg p-4 hover:border-blue-300 transition-colors"
              >
                {editingMatchId === match.id ? (
                  // Edit Mode
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-muted-foreground">
                        {formatDate(match.kickoff)}
                      </div>
                      <Select value={matchStatus} onValueChange={setMatchStatus}>
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="SCHEDULED">Scheduled</SelectItem>
                          <SelectItem value="LIVE">Live</SelectItem>
                          <SelectItem value="HALFTIME">Half Time</SelectItem>
                          <SelectItem value="COMPLETED">Full Time</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="grid grid-cols-[1fr_auto_1fr] gap-4 items-center">
                      <div className="text-right">
                        <div className="font-semibold">{match.homeTeamName}</div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          min="0"
                          value={homeScore}
                          onChange={(e) => setHomeScore(parseInt(e.target.value) || 0)}
                          className="w-16 text-center text-xl font-bold"
                        />
                        <span className="text-muted-foreground">-</span>
                        <Input
                          type="number"
                          min="0"
                          value={awayScore}
                          onChange={(e) => setAwayScore(parseInt(e.target.value) || 0)}
                          className="w-16 text-center text-xl font-bold"
                        />
                      </div>
                      
                      <div className="text-left">
                        <div className="font-semibold">{match.awayTeamName}</div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 justify-end">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleCancelEdit}
                      >
                        <X className="w-4 h-4 mr-1" />
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleSaveScore(match.id)}
                        disabled={updateMatchMutation.isPending}
                      >
                        <Save className="w-4 h-4 mr-1" />
                        {updateMatchMutation.isPending ? 'Saving...' : 'Save'}
                      </Button>
                    </div>
                  </div>
                ) : (
                  // View Mode
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-muted-foreground">
                        {formatDate(match.kickoff)}
                      </div>
                      {getStatusBadge(match.status)}
                    </div>
                    
                    <div className="grid grid-cols-[1fr_auto_1fr] gap-4 items-center">
                      <div className="text-right">
                        <div className="font-semibold">{match.homeTeamName}</div>
                      </div>
                      
                      <div className="text-center">
                        <div className="text-2xl font-bold">
                          {match.homeScore ?? '-'} : {match.awayScore ?? '-'}
                        </div>
                      </div>
                      
                      <div className="text-left">
                        <div className="font-semibold">{match.awayTeamName}</div>
                      </div>
                    </div>
                    
                    <div className="flex justify-end">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditMatch(match)}
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Edit Score
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
        
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm">
          <p className="font-semibold text-green-900 flex items-center gap-2">
            ⚡ Real-time Updates Active
            {lastMatchUpdate && (
              <Badge variant="outline" className="ml-2">
                Last: {new Date(lastMatchUpdate.timestamp).toLocaleTimeString()}
              </Badge>
            )}
          </p>
          <p className="text-green-700 mt-1">
            Score updates broadcast instantly to all connected users via WebSocket.
            {!connected && ' (Currently offline - changes will sync when reconnected)'}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
