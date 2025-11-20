import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, TrendingUp, TrendingDown, Minus, RefreshCw } from 'lucide-react';
import { useTournamentWebSocket, type StandingsUpdate } from '@/hooks/useTournamentWebSocket';
import { WebSocketStatus } from '../WebSocketStatus';
import { useToast } from '@/hooks/use-toast';

interface StandingsProps {
  groupId: string;
  groupName: string;
  teams: any[];
  matches: any[];
  progressionRules?: {
    qualifiedCount: number; // Top N teams qualify directly
    playoffCount: number; // Next M teams go to playoffs
  };
}

interface TeamStats {
  teamId: string;
  teamName: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  form: string[]; // Last 5 results: 'W', 'D', 'L'
  position: number;
  status: 'qualified' | 'playoff' | 'eliminated' | 'active';
}

export function GroupStandings({ groupId, groupName, teams, matches, progressionRules }: StandingsProps) {
  const { toast } = useToast();
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [animateUpdate, setAnimateUpdate] = useState(false);

  // WebSocket integration - we'll need tournamentId, so let's extract it from matches
  const tournamentId = matches[0]?.tournamentId || matches[0]?.tournament_id;
  
  const { 
    connected, 
    reconnecting,
    error,
    lastStandingsUpdate 
  } = useTournamentWebSocket({
    tournamentId,
    autoConnect: !!tournamentId,
    onStandingsUpdate: (update: StandingsUpdate) => {
      setLastUpdate(new Date());
      setAnimateUpdate(true);
      setTimeout(() => setAnimateUpdate(false), 1000);
      
      toast({
        title: "📊 Standings Updated",
        description: "Group standings have been recalculated",
        duration: 2000
      });
    }
  });
  
  const calculateStandings = (): TeamStats[] => {
    const stats: Record<string, TeamStats> = {};
    
    // Initialize stats for all teams
    teams.forEach(team => {
      stats[team.id] = {
        teamId: team.id,
        teamName: team.name,
        played: 0,
        won: 0,
        drawn: 0,
        lost: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        goalDifference: 0,
        points: 0,
        form: [],
        position: 0,
        status: 'active'
      };
    });
    
    // Calculate stats from completed matches (uppercase COMPLETED to match database enum)
    const groupMatches = matches.filter(m => m.groupId === groupId && (m.status === 'COMPLETED' || m.status === 'completed'));
    
    groupMatches.forEach(match => {
      const homeTeam = stats[match.homeTeamId];
      const awayTeam = stats[match.awayTeamId];
      
      if (!homeTeam || !awayTeam) return;
      
      const homeScore = match.homeScore ?? 0;
      const awayScore = match.awayScore ?? 0;
      
      // Update played
      homeTeam.played++;
      awayTeam.played++;
      
      // Update goals
      homeTeam.goalsFor += homeScore;
      homeTeam.goalsAgainst += awayScore;
      awayTeam.goalsFor += awayScore;
      awayTeam.goalsAgainst += homeScore;
      
      // Determine result
      if (homeScore > awayScore) {
        homeTeam.won++;
        homeTeam.points += 3;
        homeTeam.form.push('W');
        awayTeam.lost++;
        awayTeam.form.push('L');
      } else if (homeScore < awayScore) {
        awayTeam.won++;
        awayTeam.points += 3;
        awayTeam.form.push('W');
        homeTeam.lost++;
        homeTeam.form.push('L');
      } else {
        homeTeam.drawn++;
        homeTeam.points++;
        homeTeam.form.push('D');
        awayTeam.drawn++;
        awayTeam.points++;
        awayTeam.form.push('D');
      }
    });
    
    // Calculate goal difference
    Object.values(stats).forEach(team => {
      team.goalDifference = team.goalsFor - team.goalsAgainst;
      team.form = team.form.slice(-5); // Keep last 5 matches
    });
    
    // Sort teams by standings rules: Points → GD → GF → H2H
    const sortedTeams = Object.values(stats).sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
      if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
      return a.teamName.localeCompare(b.teamName);
    });
    
    // Assign positions and progression status
    sortedTeams.forEach((team, index) => {
      team.position = index + 1;
      
      if (progressionRules) {
        if (index < progressionRules.qualifiedCount) {
          team.status = 'qualified';
        } else if (index < progressionRules.qualifiedCount + progressionRules.playoffCount) {
          team.status = 'playoff';
        } else {
          team.status = 'eliminated';
        }
      }
    });
    
    return sortedTeams;
  };
  
  const standings = calculateStandings();
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'qualified':
        return <Badge className="bg-green-500 hover:bg-green-600"><TrendingUp className="w-3 h-3 mr-1" />Qualified</Badge>;
      case 'playoff':
        return <Badge className="bg-yellow-500 hover:bg-yellow-600"><Minus className="w-3 h-3 mr-1" />Playoff</Badge>;
      case 'eliminated':
        return <Badge variant="destructive"><TrendingDown className="w-3 h-3 mr-1" />Eliminated</Badge>;
      default:
        return null;
    }
  };
  
  const getFormIndicator = (result: string) => {
    switch (result) {
      case 'W':
        return <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center text-white text-xs font-bold">W</div>;
      case 'D':
        return <div className="w-6 h-6 rounded-full bg-yellow-500 flex items-center justify-center text-white text-xs font-bold">D</div>;
      case 'L':
        return <div className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center text-white text-xs font-bold">L</div>;
      default:
        return null;
    }
  };
  
  const getPositionColor = (position: number, status: string) => {
    if (status === 'qualified') return 'bg-green-50 border-l-4 border-green-500';
    if (status === 'playoff') return 'bg-yellow-50 border-l-4 border-yellow-500';
    if (status === 'eliminated') return 'bg-red-50 border-l-4 border-red-500';
    return '';
  };
  
  return (
    <Card className={animateUpdate ? 'ring-2 ring-blue-500 transition-all' : ''}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              {groupName} - Standings
              {animateUpdate && <RefreshCw className="h-4 w-4 animate-spin text-blue-500" />}
            </CardTitle>
            {lastUpdate && (
              <p className="text-xs text-muted-foreground mt-1">
                Last updated: {lastUpdate.toLocaleTimeString()}
              </p>
            )}
          </div>
          {tournamentId && (
            <WebSocketStatus 
              connected={connected} 
              reconnecting={reconnecting} 
              error={error}
              showText={false}
            />
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 px-2 font-semibold">#</th>
                <th className="text-left py-2 px-4 font-semibold">Team</th>
                <th className="text-center py-2 px-2 font-semibold">P</th>
                <th className="text-center py-2 px-2 font-semibold">W</th>
                <th className="text-center py-2 px-2 font-semibold">D</th>
                <th className="text-center py-2 px-2 font-semibold">L</th>
                <th className="text-center py-2 px-2 font-semibold">GF</th>
                <th className="text-center py-2 px-2 font-semibold">GA</th>
                <th className="text-center py-2 px-2 font-semibold">GD</th>
                <th className="text-center py-2 px-2 font-semibold">Pts</th>
                <th className="text-left py-2 px-2 font-semibold">Form</th>
                {progressionRules && <th className="text-left py-2 px-4 font-semibold">Status</th>}
              </tr>
            </thead>
            <tbody>
              {standings.map((team) => (
                <tr 
                  key={team.teamId} 
                  className={`border-b hover:bg-gray-50 ${getPositionColor(team.position, team.status)}`}
                >
                  <td className="py-3 px-2 font-bold text-center">{team.position}</td>
                  <td className="py-3 px-4 font-medium">{team.teamName}</td>
                  <td className="text-center py-3 px-2">{team.played}</td>
                  <td className="text-center py-3 px-2">{team.won}</td>
                  <td className="text-center py-3 px-2">{team.drawn}</td>
                  <td className="text-center py-3 px-2">{team.lost}</td>
                  <td className="text-center py-3 px-2 font-medium">{team.goalsFor}</td>
                  <td className="text-center py-3 px-2">{team.goalsAgainst}</td>
                  <td className={`text-center py-3 px-2 font-semibold ${team.goalDifference > 0 ? 'text-green-600' : team.goalDifference < 0 ? 'text-red-600' : ''}`}>
                    {team.goalDifference > 0 ? '+' : ''}{team.goalDifference}
                  </td>
                  <td className="text-center py-3 px-2 font-bold text-lg">{team.points}</td>
                  <td className="py-3 px-2">
                    <div className="flex gap-1">
                      {team.form.map((result, idx) => (
                        <React.Fragment key={idx}>{getFormIndicator(result)}</React.Fragment>
                      ))}
                    </div>
                  </td>
                  {progressionRules && (
                    <td className="py-3 px-4">{getStatusBadge(team.status)}</td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {progressionRules && (
          <div className="mt-4 flex flex-wrap gap-4 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded"></div>
              <span>Top {progressionRules.qualifiedCount} qualify directly</span>
            </div>
            {progressionRules.playoffCount > 0 && (
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                <span>Next {progressionRules.playoffCount} to playoffs</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded"></div>
              <span>Eliminated</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
