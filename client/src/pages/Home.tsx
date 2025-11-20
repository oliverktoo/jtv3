import { 
  Trophy, Users, FileText, Calendar, Building, 
  ArrowRight, TrendingUp, Activity, Award,
  Target, CheckCircle2, Clock, MapPin,
  Zap, BarChart3, Shield, Sparkles
} from "lucide-react";
import StatsPanel from "@/components/StatsPanel";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";

export default function Home() {
  const { user } = useAuth();
  
  // Fetch real platform statistics from Supabase
  const { data: platformStats, isLoading: isPlatformLoading } = useQuery<any>({
    queryKey: ["platform-stats"],
    queryFn: async () => {
      // Get counts from multiple tables
      const [orgs, tournaments, teams, players] = await Promise.all([
        supabase.from('organizations').select('id', { count: 'exact' }),
        supabase.from('tournaments').select('id', { count: 'exact' }),
        supabase.from('teams').select('id', { count: 'exact' }),
        supabase.from('player_registry').select('id', { count: 'exact' })
      ]);

      return {
        organizations: orgs.count || 0,
        tournaments: tournaments.count || 0,
        teams: teams.count || 0,
        players: players.count || 0
      };
    },
  });

  // Fetch additional tournament statistics from Supabase
  const { data: tournamentsData, isLoading: isTournamentsLoading } = useQuery<any>({
    queryKey: ["tournaments-all"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tournaments')
        .select('*');
      if (error) {
        throw new Error(`Failed to fetch tournaments: ${error.message}`);
      }
      return data || [];
    },
  });

  // Fetch team statistics from Supabase
  const { data: teamsData, isLoading: isTeamsLoading } = useQuery<any>({
    queryKey: ["teams-all"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('teams')
        .select('*');
      if (error) {
        throw new Error(`Failed to fetch teams: ${error.message}`);
      }
      return data || [];
    },
  });

  const isLoading = isPlatformLoading || isTournamentsLoading || isTeamsLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  // Calculate real-time statistics
  const tournaments = tournamentsData || [];
  const teams = teamsData || [];
  
  // Calculate active tournaments (published and not ended)
  const activeTournaments = tournaments.filter((t: any) => 
    t.is_published && t.status !== 'COMPLETED'
  ).length;
  
  // Calculate team status distribution
  const activeTeams = teams.filter((t: any) => 
    (t.team_status || t.registration_status || 'ACTIVE') === 'ACTIVE'
  ).length;
  
  // Calculate independent vs affiliated teams
  const independentTeams = teams.filter((t: any) => !t.org_id).length;
  
  // Real platform statistics using actual data
  const stats = [
    { 
      label: "Organizations", 
      value: (platformStats?.organizations || 0).toString(), 
      icon: Building, 
      color: "bg-chart-1/10" 
    },
    { 
      label: "Active Teams", 
      value: activeTeams.toString(), 
      icon: Users, 
      color: "bg-chart-2/10",
      subtitle: `${independentTeams} independent`
    },
    { 
      label: "Tournaments", 
      value: (platformStats?.tournaments || 0).toString(), 
      icon: Trophy, 
      color: "bg-chart-3/10",
      subtitle: `${activeTournaments} active`
    },
    { 
      label: "Players", 
      value: (platformStats?.players || 0).toString(), 
      icon: Users, 
      color: "bg-chart-4/10" 
    },
  ];

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary/90 to-primary/80 p-8 md:p-12 text-white shadow-2xl">
        <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,transparent,rgba(255,255,255,0.6))]" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
              <Trophy className="h-8 w-8" />
            </div>
            <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm">
              <Sparkles className="w-3 h-3 mr-1" />
              Platform v3.0
            </Badge>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold mb-3 tracking-tight">
            Welcome back, {user?.firstName || 'Admin'}! 👋
          </h1>
          <p className="text-lg md:text-xl text-white/90 mb-6 max-w-2xl">
            Manage tournaments, teams, and players with Kenya's most comprehensive sports management platform
          </p>
          
          <div className="flex flex-wrap gap-3">
            <Link href="/tournament-hub">
              <Button size="lg" variant="secondary" className="shadow-lg">
                <Trophy className="w-4 h-4 mr-2" />
                Tournament Hub
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link href="/players">
              <Button size="lg" variant="outline" className="bg-white/10 border-white/30 text-white hover:bg-white/20">
                <Users className="w-4 h-4 mr-2" />
                Player Management
              </Button>
            </Link>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute -top-12 -right-12 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-white/10 rounded-full blur-3xl" />
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-blue-500 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Organizations</CardTitle>
            <Building className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{platformStats?.organizations || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              <TrendingUp className="w-3 h-3 inline mr-1" />
              Active organizations
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tournaments</CardTitle>
            <Trophy className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{platformStats?.tournaments || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              <Activity className="w-3 h-3 inline mr-1" />
              {activeTournaments} currently active
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Teams</CardTitle>
            <Users className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{platformStats?.teams || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              <CheckCircle2 className="w-3 h-3 inline mr-1" />
              {activeTeams} active teams
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Players</CardTitle>
            <Award className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{platformStats?.players || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              <Shield className="w-3 h-3 inline mr-1" />
              Registered athletes
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions Grid */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold">Quick Actions</h2>
            <p className="text-muted-foreground">Jump to your most-used features</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link href="/tournament-hub">
            <Card className="group cursor-pointer hover:shadow-xl hover:scale-[1.02] transition-all duration-200 border-2 hover:border-primary">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl text-white shadow-lg group-hover:shadow-blue-500/50 transition-shadow">
                    <Trophy className="h-6 w-6" />
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                </div>
                <CardTitle className="mt-4">Tournament Hub</CardTitle>
                <CardDescription className="mt-2">
                  Complete tournament management - fixtures, stages, teams, and standings all in one place
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/teams">
            <Card className="group cursor-pointer hover:shadow-xl hover:scale-[1.02] transition-all duration-200 border-2 hover:border-primary">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl text-white shadow-lg group-hover:shadow-purple-500/50 transition-shadow">
                    <Users className="h-6 w-6" />
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                </div>
                <CardTitle className="mt-4">Team Management</CardTitle>
                <CardDescription className="mt-2">
                  Register and manage teams, handle approvals, and organize rosters
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/players">
            <Card className="group cursor-pointer hover:shadow-xl hover:scale-[1.02] transition-all duration-200 border-2 hover:border-primary">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl text-white shadow-lg group-hover:shadow-green-500/50 transition-shadow">
                    <Award className="h-6 w-6" />
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                </div>
                <CardTitle className="mt-4">Player Registry</CardTitle>
                <CardDescription className="mt-2">
                  Register players, manage documents, verify eligibility and issue ID cards
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/matchday">
            <Card className="group cursor-pointer hover:shadow-xl hover:scale-[1.02] transition-all duration-200 border-2 hover:border-primary">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="p-3 bg-gradient-to-br from-red-500 to-red-600 rounded-xl text-white shadow-lg group-hover:shadow-red-500/50 transition-shadow">
                    <Activity className="h-6 w-6" />
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                </div>
                <CardTitle className="mt-4">Match Operations</CardTitle>
                <CardDescription className="mt-2">
                  Live match control, scoring, statistics tracking and real-time updates
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/reports">
            <Card className="group cursor-pointer hover:shadow-xl hover:scale-[1.02] transition-all duration-200 border-2 hover:border-primary">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="p-3 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl text-white shadow-lg group-hover:shadow-orange-500/50 transition-shadow">
                    <BarChart3 className="h-6 w-6" />
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                </div>
                <CardTitle className="mt-4">Reports & Analytics</CardTitle>
                <CardDescription className="mt-2">
                  Generate comprehensive reports, export data and analyze performance
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/admin">
            <Card className="group cursor-pointer hover:shadow-xl hover:scale-[1.02] transition-all duration-200 border-2 hover:border-primary">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="p-3 bg-gradient-to-br from-slate-500 to-slate-600 rounded-xl text-white shadow-lg group-hover:shadow-slate-500/50 transition-shadow">
                    <Shield className="h-6 w-6" />
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                </div>
                <CardTitle className="mt-4">Administration</CardTitle>
                <CardDescription className="mt-2">
                  System settings, user management, organizations and platform configuration
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>
        </div>
      </div>

      {/* Active Tournaments & Team Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Tournaments */}
        <Card className="shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Trophy className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle>Active Tournaments</CardTitle>
                  <CardDescription>Currently running competitions</CardDescription>
                </div>
              </div>
              <Link href="/tournament-hub">
                <Button variant="ghost" size="sm">
                  View All
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {tournaments.length > 0 ? (
              <div className="space-y-3">
                {tournaments
                  .filter((t: any) => t.is_published && t.status !== 'COMPLETED')
                  .slice(0, 4)
                  .map((tournament: any) => (
                    <div key={tournament.id} className="flex items-center justify-between p-4 bg-accent/50 rounded-lg hover:bg-accent transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded">
                          <Trophy className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{tournament.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {tournament.organizations?.name || 'Independent'}
                          </p>
                        </div>
                      </div>
                      <Badge variant={tournament.status === 'ACTIVE' ? 'default' : 'secondary'}>
                        {tournament.status || 'DRAFT'}
                      </Badge>
                    </div>
                  ))}
                {tournaments.filter((t: any) => t.is_published && t.status !== 'COMPLETED').length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Clock className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No active tournaments at the moment</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Trophy className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No tournaments created yet</p>
                <Link href="/tournament-hub">
                  <Button variant="outline" size="sm" className="mt-3">
                    Create Tournament
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Team Statistics */}
        <Card className="shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/10 rounded-lg">
                  <Users className="h-5 w-5 text-purple-500" />
                </div>
                <div>
                  <CardTitle>Team Statistics</CardTitle>
                  <CardDescription>Registration overview</CardDescription>
                </div>
              </div>
              <Link href="/teams">
                <Button variant="ghost" size="sm">
                  View All
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-green-500/10 rounded-lg">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-medium">Active Teams</p>
                    <p className="text-sm text-muted-foreground">Approved & playing</p>
                  </div>
                </div>
                <span className="text-2xl font-bold text-green-600">{activeTeams}</span>
              </div>

              <div className="flex items-center justify-between p-4 bg-yellow-500/10 rounded-lg">
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-yellow-600" />
                  <div>
                    <p className="font-medium">Pending Approval</p>
                    <p className="text-sm text-muted-foreground">Awaiting review</p>
                  </div>
                </div>
                <span className="text-2xl font-bold text-yellow-600">
                  {teams.filter((t: any) => (t.registration_status || 'ACTIVE') === 'PENDING').length}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-blue-500/10 rounded-lg text-center">
                  <Target className="h-4 w-4 text-blue-600 mx-auto mb-1" />
                  <p className="text-2xl font-bold text-blue-600">{independentTeams}</p>
                  <p className="text-xs text-muted-foreground">Independent</p>
                </div>
                <div className="p-3 bg-purple-500/10 rounded-lg text-center">
                  <Building className="h-4 w-4 text-purple-600 mx-auto mb-1" />
                  <p className="text-2xl font-bold text-purple-600">
                    {teams.filter((t: any) => t.org_id).length}
                  </p>
                  <p className="text-xs text-muted-foreground">Affiliated</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Platform Features Banner */}
      <Card className="bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 border-primary/20">
        <CardContent className="p-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-primary/20 rounded-xl">
              <Zap className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h3 className="text-2xl font-bold">Powerful Tournament Management</h3>
              <p className="text-muted-foreground">Everything you need in one platform</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex gap-3">
              <div className="shrink-0 p-2 bg-white rounded-lg h-fit">
                <Trophy className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h4 className="font-semibold mb-1">Multi-Stage Tournaments</h4>
                <p className="text-sm text-muted-foreground">
                  Support for league, group, and knockout stages with automated fixtures
                </p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <div className="shrink-0 p-2 bg-white rounded-lg h-fit">
                <MapPin className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h4 className="font-semibold mb-1">Geographic Management</h4>
                <p className="text-sm text-muted-foreground">
                  County, Sub-County, and Ward-level tournament organization
                </p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <div className="shrink-0 p-2 bg-white rounded-lg h-fit">
                <Shield className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h4 className="font-semibold mb-1">Player Eligibility</h4>
                <p className="text-sm text-muted-foreground">
                  Automated eligibility checks, document verification, and compliance
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
