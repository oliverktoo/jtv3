import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { Match, InsertMatch } from "@shared/schema";

export function useMatches(tournamentId: string) {
  return useQuery<Match[]>({
    queryKey: ["matches", tournamentId],
    enabled: !!tournamentId,
    queryFn: async () => {
      if (!tournamentId) {
        return [];
      }
      
      try {
        // Try backend API first  
        const response = await apiRequest('GET', `/api/tournaments/${tournamentId}/matches`);
        const matches = response?.data || response || [];
        
        // Transform API response to expected frontend format
        if (Array.isArray(matches) && matches.length > 0) {
          const transformed = matches.map(match => ({
            match: {
              id: match.id,
              homeScore: match.home_score,
              awayScore: match.away_score,
              kickoff: match.kickoff,
              venue: match.venue,
              status: match.status,
              roundId: match.round_id
            },
            homeTeam: {
              id: match.home_team?.id,
              name: match.home_team?.name
            },
            awayTeam: {
              id: match.away_team?.id,
              name: match.away_team?.name
            },
            round: {
              id: match.rounds?.id,
              name: match.rounds?.name,
              number: match.rounds?.number
            }
          }));
          return transformed;
        }
        return [];
      } catch (apiError) {
        console.warn("API matches failed, trying Supabase:", apiError);
        
        try {
          // Fallback to Supabase
          const { data, error } = await supabase
            .from('matches')
            .select(`
              *,
              home_team:teams!home_team_id(id, name),
              away_team:teams!away_team_id(id, name),
              rounds!inner(
                *,
                stages!inner(
                  tournament_id
                )
              )
            `)
            .eq('rounds.stages.tournament_id', tournamentId)
            .order('kickoff', { ascending: true });
          
          if (error) {
            console.error("Matches Supabase error:", error);
            
            // Final fallback to localStorage
            const storedMatches = JSON.parse(localStorage.getItem(`tournament-fixtures-${tournamentId}`) || '[]');
            console.log("📅 Backend unavailable, loaded matches from localStorage:", storedMatches.length);
            return storedMatches;
          }
          
          return (data || []).map(match => ({
            ...match,
            createdAt: new Date(match.created_at),
            updatedAt: new Date(match.updated_at || match.created_at),
            matchDate: match.kickoff ? new Date(match.kickoff) : undefined,
            roundId: match.round_id,
            homeTeamId: match.home_team_id,
            awayTeamId: match.away_team_id,
            homeScore: match.home_score,
            awayScore: match.away_score
          }));
        } catch (supabaseError) {
          console.error("Supabase matches error:", supabaseError);
          
          // Final fallback to localStorage
          const storedMatches = JSON.parse(localStorage.getItem(`tournament-fixtures-${tournamentId}`) || '[]');
          console.log("📅 All backends unavailable, loaded matches from localStorage:", storedMatches.length);
          return storedMatches;
        }
      }
    }
  });
}

export function useStandings(tournamentId: string) {
  return useQuery<any[]>({
    queryKey: ["standings", tournamentId],
    queryFn: async () => {
      if (!tournamentId) {
        return [];
      }

      try {
        // Query matches for this specific tournament with completed scores
        const { data: matches, error } = await supabase
          .from('matches')
          .select(`
            *,
            home_team:teams!home_team_id(id, name),
            away_team:teams!away_team_id(id, name),
            rounds!inner(
              *,
              stages!inner(
                tournament_id
              )
            )
          `)
          .eq('rounds.stages.tournament_id', tournamentId)
          .not('home_score', 'is', null)
          .not('away_score', 'is', null);
        
        if (error) {
          console.error("Standings Supabase error:", error);
          return [];
        }
        
        const matchesData = matches || [];
        
        
        // If no completed matches, fetch all teams and show alphabetically
        if (matchesData.length === 0) {
          
          // First get all groups for this tournament
          const { data: stages } = await supabase
            .from('stages')
            .select('id')
            .eq('tournament_id', tournamentId)
            .limit(1)
            .single();
          
          if (!stages) {
            console.log('No stages found for tournament');
            return [];
          }
          
          const { data: groups } = await supabase
            .from('groups')
            .select('id, name')
            .eq('stage_id', stages.id);
          
          if (!groups || groups.length === 0) {
            console.log('No groups found for tournament');
            return [];
          }
          
          const groupIds = groups.map(g => g.id);
          
          // Now get all team-group assignments
          const { data: teamGroups, error: teamsError } = await supabase
            .from('team_groups')
            .select(`
              teams (
                id,
                name
              ),
              groups (
                id,
                name
              )
            `)
            .in('group_id', groupIds);
          
          if (teamsError) {
            console.error("Teams query error:", teamsError);
            return [];
          }
          
          // Group teams by their group and create standings for each group
          const groupedStandings: Record<string, any[]> = {};
          
          (teamGroups || [])
            .filter((tg: any) => tg.teams?.name && tg.groups?.name)
            .forEach((tg: any) => {
              const groupName = tg.groups.name;
              if (!groupedStandings[groupName]) {
                groupedStandings[groupName] = [];
              }
              groupedStandings[groupName].push({
                team: tg.teams.name,
                played: 0,
                won: 0,
                drawn: 0,
                lost: 0,
                goalsFor: 0,
                goalsAgainst: 0,
                goalDifference: 0,
                points: 0,
                groupName: groupName,
                form: []
              });
            });
          
          // Sort teams alphabetically within each group and assign positions
          const allStandings: any[] = [];
          Object.keys(groupedStandings).sort().forEach(groupName => {
            const groupTeams = groupedStandings[groupName]
              .sort((a, b) => a.team.localeCompare(b.team))
              .map((team, index) => ({
                ...team,
                position: index + 1
              }));
            allStandings.push(...groupTeams);
          });
          
          return allStandings;
        }
        
        // Fetch team-group assignments to know which group each team belongs to
        const { data: stages } = await supabase
          .from('stages')
          .select('id')
          .eq('tournament_id', tournamentId)
          .limit(1)
          .single();
        
        if (!stages) {
          console.log('No stages found for tournament');
          return [];
        }
        
        const { data: groups } = await supabase
          .from('groups')
          .select('id, name')
          .eq('stage_id', stages.id);
        
        if (!groups || groups.length === 0) {
          console.log('No groups found for tournament');
          return [];
        }
        
        const groupIds = groups.map(g => g.id);
        
        const { data: teamGroups } = await supabase
          .from('team_groups')
          .select(`
            team_id,
            group_id,
            teams (
              id,
              name
            ),
            groups (
              id,
              name
            )
          `)
          .in('group_id', groupIds);
        
        // Create a map of team_id to group_name
        const teamGroupMap: Record<string, string> = {};
        (teamGroups || []).forEach((tg: any) => {
          if (tg.team_id && tg.groups?.name) {
            teamGroupMap[tg.team_id] = tg.groups.name;
          }
        });
        
        // Simple standings calculation with form tracking
        const teamStats: Record<string, any> = {};
        
        // Sort matches by date to track form chronologically
        const sortedMatches = matchesData.sort((a, b) => {
          const dateA = new Date(a.kickoff || 0).getTime();
          const dateB = new Date(b.kickoff || 0).getTime();
          return dateA - dateB;
        });
        
        sortedMatches.forEach((match: any) => {
        const homeTeam = match.home_team;
        const awayTeam = match.away_team;
        
        if (!teamStats[homeTeam.id]) {
          teamStats[homeTeam.id] = {
            team: homeTeam,
            played: 0,
            won: 0,
            drawn: 0,
            lost: 0,
            goalsFor: 0,
            goalsAgainst: 0,
            goalDifference: 0,
            points: 0,
            form: []
          };
        }
        
        if (!teamStats[awayTeam.id]) {
          teamStats[awayTeam.id] = {
            team: awayTeam,
            played: 0,
            won: 0,
            drawn: 0,
            lost: 0,
            goalsFor: 0,
            goalsAgainst: 0,
            goalDifference: 0,
            points: 0,
            form: []
          };
        }
        
        const homeStats = teamStats[homeTeam.id];
        const awayStats = teamStats[awayTeam.id];
        
        homeStats.played++;
        awayStats.played++;
        homeStats.goalsFor += match.home_score;
        homeStats.goalsAgainst += match.away_score;
        awayStats.goalsFor += match.away_score;
        awayStats.goalsAgainst += match.home_score;
        
        if (match.home_score > match.away_score) {
          homeStats.won++;
          homeStats.points += 3;
          homeStats.form.push('W');
          awayStats.lost++;
          awayStats.form.push('L');
        } else if (match.away_score > match.home_score) {
          awayStats.won++;
          awayStats.points += 3;
          awayStats.form.push('W');
          homeStats.lost++;
          homeStats.form.push('L');
        } else {
          homeStats.drawn++;
          awayStats.drawn++;
          homeStats.points += 1;
          awayStats.points += 1;
          homeStats.form.push('D');
          awayStats.form.push('D');
        }
        
        homeStats.goalDifference = homeStats.goalsFor - homeStats.goalsAgainst;
        awayStats.goalDifference = awayStats.goalsFor - awayStats.goalsAgainst;
        
        // Add group name to stats
        if (!homeStats.groupName && teamGroupMap[homeTeam.id]) {
          homeStats.groupName = teamGroupMap[homeTeam.id];
        }
        if (!awayStats.groupName && teamGroupMap[awayTeam.id]) {
          awayStats.groupName = teamGroupMap[awayTeam.id];
        }
      });
      
      // Group standings by group and sort within each group
      const standingsByGroup: Record<string, any[]> = {};
      Object.values(teamStats).forEach((stats: any) => {
        const groupName = stats.groupName || 'Unknown Group';
        if (!standingsByGroup[groupName]) {
          standingsByGroup[groupName] = [];
        }
        standingsByGroup[groupName].push(stats);
      });
      
      // Sort teams within each group and assign positions
      const allStandings: any[] = [];
      Object.keys(standingsByGroup).sort().forEach(groupName => {
        const groupTeams = standingsByGroup[groupName]
          .sort((a, b) => {
            if (b.points !== a.points) return b.points - a.points;
            if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
            return b.goalsFor - a.goalsFor;
          })
          .map((stats, index) => ({
            position: index + 1,
            team: stats.team?.name || 'Unknown',
            played: stats.played,
            won: stats.won,
            drawn: stats.drawn,
            lost: stats.lost,
            goalsFor: stats.goalsFor,
            goalsAgainst: stats.goalsAgainst,
            goalDifference: stats.goalDifference,
            points: stats.points,
            groupName: groupName,
            form: stats.form.slice(-5) // Last 5 matches
          }));
        allStandings.push(...groupTeams);
      });

      return allStandings;
      } catch (error) {
        console.error("Standings calculation error:", error);
        return [];
      }
    },
    enabled: !!tournamentId,
  });
}

// Client-side fixture generation as fallback
function generateFixturesOffline(teams: any[], data: any) {
  const { startDate, kickoffTime = "13:00", weekendsOnly = true, homeAndAway = true, venue } = data;
  
  if (teams.length < 2) {
    throw new Error("At least 2 teams required to generate fixtures");
  }

  const fixtures = [];
  const rounds = [];
  let matchId = 1;
  let roundNumber = 1;
  
  // Simple round-robin generator
  const numTeams = teams.length;
  const numRounds = numTeams % 2 === 0 ? numTeams - 1 : numTeams;
  
  for (let round = 0; round < numRounds; round++) {
    const roundMatches = [];
    
    for (let match = 0; match < Math.floor(numTeams / 2); match++) {
      const home = (round + match) % (numTeams - 1);
      const away = (numTeams - 1 - match + round) % (numTeams - 1);
      
      // If we have odd number of teams, one team gets a bye
      if (numTeams % 2 === 1) {
        if (home === numTeams - 1 || away === numTeams - 1) continue;
      }
      
      const homeTeam = teams[home];
      const awayTeam = teams[away === numTeams - 1 ? numTeams - 1 : away];
      
      if (homeTeam && awayTeam && homeTeam.id !== awayTeam.id) {
        roundMatches.push({
          id: `match-${matchId++}`,
          homeTeam: homeTeam.name,
          awayTeam: awayTeam.name,
          homeTeamId: homeTeam.id,
          awayTeamId: awayTeam.id,
          kickoff: kickoffTime,
          venue: venue || "TBD",
          status: "SCHEDULED",
        });
      }
    }
    
    if (roundMatches.length > 0) {
      rounds.push({
        id: `round-${roundNumber}`,
        number: roundNumber++,
        name: `Round ${roundNumber - 1}`,
        matches: roundMatches,
      });
      fixtures.push(...roundMatches);
    }
  }
  
  // If home and away, double the fixtures
  if (homeAndAway) {
    const returnFixtures = fixtures.map(match => ({
      ...match,
      id: `match-${matchId++}`,
      homeTeam: match.awayTeam,
      awayTeam: match.homeTeam,
      homeTeamId: match.awayTeamId,
      awayTeamId: match.homeTeamId,
    }));
    
    const returnRounds = returnFixtures.reduce((acc: any[], match, index) => {
      const roundIndex = Math.floor(index / Math.floor(numTeams / 2));
      if (!acc[roundIndex]) {
        acc[roundIndex] = {
          id: `round-${roundNumber + roundIndex}`,
          number: roundNumber + roundIndex,
          name: `Round ${roundNumber + roundIndex}`,
          matches: [],
        };
      }
      acc[roundIndex].matches.push(match);
      return acc;
    }, []);
    
    rounds.push(...returnRounds);
    fixtures.push(...returnFixtures);
  }
  
  return { fixtures, rounds, message: `Generated ${fixtures.length} fixtures across ${rounds.length} rounds (offline mode)` };
}

export function useGenerateFixtures(tournamentId: string) {
  return useMutation({
    mutationFn: async (data: {
      startDate: string;
      kickoffTime?: string;
      weekendsOnly?: boolean;
      homeAndAway?: boolean;
      venue?: string;
    }) => {
      console.log("Generate fixtures data:", data);
      
      try {
        // Try backend API first
        const response = await apiRequest(
          'POST',
          `/api/tournaments/${tournamentId}/generate-fixtures`,
          data
        );
        
        return response;
      } catch (error: any) {
        console.warn("Backend fixture generation failed, falling back to offline mode:", error);
        
        // Get teams from localStorage or mock data for offline generation
        const storedTeams = JSON.parse(localStorage.getItem(`tournament-teams-${tournamentId}`) || '[]');
        
        if (storedTeams.length === 0) {
          // Create mock teams if no data available
          const mockTeams = [
            { id: 'team-1', name: 'Team Alpha' },
            { id: 'team-2', name: 'Team Beta' },
            { id: 'team-3', name: 'Team Gamma' },
            { id: 'team-4', name: 'Team Delta' },
          ];
          
          console.log("Using mock teams for fixture generation:", mockTeams);
          const result = generateFixturesOffline(mockTeams, data);
          
          // Store generated fixtures in localStorage
          localStorage.setItem(`tournament-fixtures-${tournamentId}`, JSON.stringify(result.fixtures));
          localStorage.setItem(`tournament-rounds-${tournamentId}`, JSON.stringify(result.rounds));
          
          return result;
        } else {
          console.log("Using stored teams for fixture generation:", storedTeams);
          const result = generateFixturesOffline(storedTeams, data);
          
          // Store generated fixtures in localStorage
          localStorage.setItem(`tournament-fixtures-${tournamentId}`, JSON.stringify(result.fixtures));
          localStorage.setItem(`tournament-rounds-${tournamentId}`, JSON.stringify(result.rounds));
          
          return result;
        }
      }
    },
    onSuccess: () => {
      // Invalidate related queries after fixture generation
      queryClient.invalidateQueries({ queryKey: ["matches", tournamentId] });
      queryClient.invalidateQueries({ queryKey: ["rounds", tournamentId] });
      queryClient.invalidateQueries({ queryKey: ["stages", tournamentId] });
    },
  });
}

export function useUpdateMatch(tournamentId: string) {
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<InsertMatch> }) => {
      console.log('🔄 Updating match:', id, 'with data:', JSON.stringify(data, null, 2));
      
      const { data: match, error } = await supabase
        .from('matches')
        .update(data)
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        console.error("❌ Update match Supabase error:");
        console.error("   Error code:", error.code);
        console.error("   Error message:", error.message);
        console.error("   Error details:", error.details);
        console.error("   Error hint:", error.hint);
        console.error("   Match ID:", id);
        console.error("   Update data:", JSON.stringify(data, null, 2));
        throw error;
      }
      
      return match;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["matches", tournamentId] });
      queryClient.invalidateQueries({ queryKey: ["standings", tournamentId] });
    },
  });
}

export function useCreateMatch(tournamentId: string) {
  return useMutation({
    mutationFn: async (data: Omit<InsertMatch, "tournamentId">) => {
      const { data: match, error } = await supabase
        .from('matches')
        .insert({ ...data, tournament_id: tournamentId })
        .select()
        .single();
      
      if (error) {
        console.error("Create match Supabase error:", error);
        throw error;
      }
      
      return match;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["matches", tournamentId] });
      queryClient.invalidateQueries({ queryKey: ["standings", tournamentId] });
    },
  });
}

export function useDeleteMatch(tournamentId: string) {
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('matches')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error("Delete match Supabase error:", error);
        throw error;
      }
      
      return { id };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["matches", tournamentId] });
      queryClient.invalidateQueries({ queryKey: ["standings", tournamentId] });
    },
  });
}
