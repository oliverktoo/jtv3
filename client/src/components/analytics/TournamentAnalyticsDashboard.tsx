// Tournament Analytics Dashboard - Comprehensive insights and metrics
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Trophy,
  MapPin,
  Calendar,
  Target,
  Award,
  Activity,
  Globe,
  Filter,
  Download,
  RefreshCw
} from 'lucide-react';
import { format } from 'date-fns';

// Analytics interfaces
interface TournamentStats {
  totalTournaments: number;
  activeTournaments: number;
  completedTournaments: number;
  totalTeams: number;
  totalPlayers: number;
  totalMatches: number;
  averageTeamsPerTournament: number;
  registrationRate: number;
  completionRate: number;
}

interface RegistrationTrend {
  date: string;
  registrations: number;
  approvals: number;
  rejections: number;
  cumulative: number;
}

interface GeographicDistribution {
  county: string;
  teams: number;
  players: number;
  tournaments: number;
  percentage: number;
}

interface PerformanceMetrics {
  tournamentId: string;
  tournamentName: string;
  teamsRegistered: number;
  teamsApproved: number;
  matchesCompleted: number;
  totalMatches: number;
  avgGoalsPerMatch: number;
  competitiveness: number; // Based on score differences
  popularity: number; // Based on registrations vs capacity
}

interface PredictiveInsights {
  projectedRegistrations: number;
  estimatedCompletionDate: string;
  riskFactors: Array<{
    factor: string;
    severity: 'low' | 'medium' | 'high';
    impact: string;
  }>;
  recommendations: Array<{
    title: string;
    description: string;
    priority: 'low' | 'medium' | 'high';
  }>;
}

export function TournamentAnalyticsDashboard() {
  const [selectedTimeframe, setSelectedTimeframe] = useState('30d');
  const [selectedTournament, setSelectedTournament] = useState('all');
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  
  // Mock data - in production, fetch from API
  const [stats, setStats] = useState<TournamentStats>({
    totalTournaments: 47,
    activeTournaments: 12,
    completedTournaments: 35,
    totalTeams: 284,
    totalPlayers: 6840,
    totalMatches: 1247,
    averageTeamsPerTournament: 18.5,
    registrationRate: 87.3,
    completionRate: 94.6
  });

  const [registrationTrends, setRegistrationTrends] = useState<RegistrationTrend[]>([
    { date: '2024-01-01', registrations: 12, approvals: 10, rejections: 2, cumulative: 12 },
    { date: '2024-01-02', registrations: 18, approvals: 15, rejections: 3, cumulative: 30 },
    { date: '2024-01-03', registrations: 25, approvals: 22, rejections: 3, cumulative: 55 },
    { date: '2024-01-04', registrations: 31, approvals: 28, rejections: 3, cumulative: 86 },
    { date: '2024-01-05', registrations: 22, approvals: 19, rejections: 3, cumulative: 108 },
    { date: '2024-01-06', registrations: 15, approvals: 13, rejections: 2, cumulative: 123 },
    { date: '2024-01-07', registrations: 28, approvals: 25, rejections: 3, cumulative: 151 }
  ]);

  const [geographicData, setGeographicData] = useState<GeographicDistribution[]>([
    { county: 'Nairobi', teams: 89, players: 2134, tournaments: 18, percentage: 31.3 },
    { county: 'Mombasa', teams: 56, players: 1344, tournaments: 12, percentage: 19.7 },
    { county: 'Kisumu', teams: 41, players: 984, tournaments: 9, percentage: 14.4 },
    { county: 'Nakuru', teams: 34, players: 816, tournaments: 6, percentage: 12.0 },
    { county: 'Eldoret', teams: 28, players: 672, tournaments: 4, percentage: 9.9 },
    { county: 'Meru', teams: 21, players: 504, tournaments: 3, percentage: 7.4 },
    { county: 'Thika', teams: 15, players: 360, tournaments: 2, percentage: 5.3 }
  ]);

  const [performanceData, setPerformanceData] = useState<PerformanceMetrics[]>([
    {
      tournamentId: 'kpl_2024',
      tournamentName: 'Kenyan Premier League 2024',
      teamsRegistered: 32,
      teamsApproved: 28,
      matchesCompleted: 156,
      totalMatches: 168,
      avgGoalsPerMatch: 2.4,
      competitiveness: 87.5,
      popularity: 125.8
    },
    {
      tournamentId: 'nsf_2024',
      tournamentName: 'National Super Cup 2024',
      teamsRegistered: 24,
      teamsApproved: 22,
      matchesCompleted: 89,
      totalMatches: 96,
      avgGoalsPerMatch: 2.8,
      competitiveness: 92.1,
      popularity: 110.3
    }
  ]);

  const [insights, setInsights] = useState<PredictiveInsights>({
    projectedRegistrations: 342,
    estimatedCompletionDate: '2024-06-15',
    riskFactors: [
      {
        factor: 'Weather Disruption Risk',
        severity: 'medium',
        impact: 'May delay 15-20% of scheduled matches during rainy season'
      },
      {
        factor: 'Facility Availability',
        severity: 'low',
        impact: 'Some venues may require maintenance scheduling'
      }
    ],
    recommendations: [
      {
        title: 'Increase Registration Outreach',
        description: 'Target counties with lower participation rates for the next tournament cycle',
        priority: 'high'
      },
      {
        title: 'Optimize Fixture Scheduling',
        description: 'Consider weather patterns and facility availability for better completion rates',
        priority: 'medium'
      }
    ]
  });

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658'];

  const refreshData = async () => {
    setLoading(true);
    // In production, fetch fresh data from API
    await new Promise(resolve => setTimeout(resolve, 1000));
    setLoading(false);
  };

  const exportData = (format: 'csv' | 'pdf' | 'excel') => {
    console.log(`Exporting analytics data as ${format}`);
    // In production, implement actual export functionality
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tournament Analytics</h1>
          <p className="text-gray-600">Comprehensive insights and performance metrics</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" onClick={refreshData} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tournaments</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTournaments}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="w-3 h-3 mr-1 text-green-600" />
              <span className="text-green-600">+12%</span>
              <span className="ml-1">vs last period</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Teams</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTeams}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="w-3 h-3 mr-1 text-green-600" />
              <span className="text-green-600">+8%</span>
              <span className="ml-1">vs last period</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Registration Rate</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.registrationRate}%</div>
            <Progress value={stats.registrationRate} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completionRate}%</div>
            <Progress value={stats.completionRate} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="registrations">Registrations</TabsTrigger>
          <TabsTrigger value="geographic">Geographic</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Tournament Status Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Tournament Status Distribution</CardTitle>
                <CardDescription>Current status of all tournaments</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Active', value: stats.activeTournaments, color: '#0088FE' },
                        { name: 'Completed', value: stats.completedTournaments, color: '#00C49F' },
                        { name: 'Planning', value: 8, color: '#FFBB28' }
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {geographicData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Activity Timeline */}
            <Card>
              <CardHeader>
                <CardTitle>Activity Timeline</CardTitle>
                <CardDescription>Recent tournament activity over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={registrationTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(date) => format(new Date(date), 'MMM dd')}
                    />
                    <YAxis />
                    <Tooltip 
                      labelFormatter={(date) => format(new Date(date), 'MMMM dd, yyyy')}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="cumulative" 
                      stroke="#8884d8" 
                      fill="#8884d8" 
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Registration Trends Tab */}
        <TabsContent value="registrations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Registration Trends</CardTitle>
              <CardDescription>Daily registration, approval, and rejection patterns</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={registrationTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(date) => format(new Date(date), 'MMM dd')}
                  />
                  <YAxis />
                  <Tooltip 
                    labelFormatter={(date) => format(new Date(date), 'MMMM dd, yyyy')}
                  />
                  <Legend />
                  <Bar dataKey="registrations" stackId="a" fill="#8884d8" name="Registrations" />
                  <Bar dataKey="approvals" stackId="a" fill="#82ca9d" name="Approvals" />
                  <Bar dataKey="rejections" stackId="a" fill="#ffc658" name="Rejections" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Registration Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Average Processing Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">2.4 hours</div>
                <p className="text-xs text-muted-foreground">From submission to decision</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Peak Registration Days</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">Mon-Wed</div>
                <p className="text-xs text-muted-foreground">67% of weekly registrations</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Approval Rate Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <div className="text-2xl font-bold text-green-600">89.2%</div>
                  <TrendingUp className="w-4 h-4 ml-2 text-green-600" />
                </div>
                <p className="text-xs text-muted-foreground">+5.3% improvement this month</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Geographic Distribution Tab */}
        <TabsContent value="geographic" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Geographic Distribution</CardTitle>
              <CardDescription>Team and player distribution across Kenyan counties</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={geographicData} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="county" type="category" width={80} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="teams" fill="#8884d8" name="Teams" />
                  <Bar dataKey="players" fill="#82ca9d" name="Players" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Top Counties */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Top Counties by Teams</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {geographicData.slice(0, 5).map((county, index) => (
                  <div key={county.county} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Badge variant="outline" className="w-6 h-6 p-0 flex items-center justify-center mr-3">
                        {index + 1}
                      </Badge>
                      <span className="font-medium">{county.county}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">{county.teams} teams</div>
                      <div className="text-xs text-muted-foreground">{county.percentage}%</div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Coverage Analysis</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Counties Covered</span>
                    <span className="font-medium">42/47 (89%)</span>
                  </div>
                  <Progress value={89} />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Urban Penetration</span>
                    <span className="font-medium">94%</span>
                  </div>
                  <Progress value={94} />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Rural Penetration</span>
                    <span className="font-medium">67%</span>
                  </div>
                  <Progress value={67} />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Tournament Performance Metrics</CardTitle>
              <CardDescription>Detailed performance analysis by tournament</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {performanceData.map((tournament) => (
                  <div key={tournament.tournamentId} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold">{tournament.tournamentName}</h3>
                      <Badge variant={tournament.competitiveness > 85 ? 'default' : 'secondary'}>
                        {tournament.competitiveness > 85 ? 'High Performance' : 'Good Performance'}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{tournament.teamsApproved}</div>
                        <div className="text-xs text-muted-foreground">Teams Approved</div>
                        <div className="text-xs">({tournament.teamsRegistered} registered)</div>
                      </div>
                      
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">{tournament.matchesCompleted}</div>
                        <div className="text-xs text-muted-foreground">Matches Completed</div>
                        <div className="text-xs">({tournament.totalMatches} total)</div>
                      </div>
                      
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">{tournament.avgGoalsPerMatch}</div>
                        <div className="text-xs text-muted-foreground">Goals per Match</div>
                      </div>
                      
                      <div className="text-center">
                        <div className="text-2xl font-bold text-orange-600">{tournament.popularity}%</div>
                        <div className="text-xs text-muted-foreground">Popularity Index</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Predictive Insights Tab */}
        <TabsContent value="insights" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Projections */}
            <Card>
              <CardHeader>
                <CardTitle>Predictive Analytics</CardTitle>
                <CardDescription>AI-powered forecasting and projections</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center mb-2">
                    <TrendingUp className="w-5 h-5 text-blue-600 mr-2" />
                    <span className="font-medium">Projected Registrations</span>
                  </div>
                  <div className="text-2xl font-bold text-blue-600">{insights.projectedRegistrations}</div>
                  <p className="text-sm text-muted-foreground">Expected for next tournament cycle</p>
                </div>
                
                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center mb-2">
                    <Calendar className="w-5 h-5 text-green-600 mr-2" />
                    <span className="font-medium">Estimated Completion</span>
                  </div>
                  <div className="text-2xl font-bold text-green-600">{insights.estimatedCompletionDate}</div>
                  <p className="text-sm text-muted-foreground">Based on current progress</p>
                </div>
              </CardContent>
            </Card>

            {/* Risk Factors */}
            <Card>
              <CardHeader>
                <CardTitle>Risk Assessment</CardTitle>
                <CardDescription>Potential risks and mitigation strategies</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {insights.riskFactors.map((risk, index) => (
                    <div key={index} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{risk.factor}</span>
                        <Badge variant={
                          risk.severity === 'high' ? 'destructive' :
                          risk.severity === 'medium' ? 'default' : 'secondary'
                        }>
                          {risk.severity}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{risk.impact}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle>Strategic Recommendations</CardTitle>
              <CardDescription>Data-driven suggestions for improvement</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {insights.recommendations.map((recommendation, index) => (
                  <div key={index} className="flex items-start space-x-3 p-4 border rounded-lg">
                    <div className="flex-shrink-0">
                      <Badge variant={
                        recommendation.priority === 'high' ? 'destructive' :
                        recommendation.priority === 'medium' ? 'default' : 'secondary'
                      }>
                        {recommendation.priority}
                      </Badge>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium mb-1">{recommendation.title}</h4>
                      <p className="text-sm text-muted-foreground">{recommendation.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}