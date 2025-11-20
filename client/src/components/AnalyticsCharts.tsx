import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ComposedChart,
} from "recharts";
import { TrendingUp, TrendingDown, Users, Target, Trophy, Activity } from "lucide-react";

// Chart configuration for consistent theming
const chartConfig = {
  primary: {
    label: "Primary",
    color: "hsl(var(--primary))",
  },
  secondary: {
    label: "Secondary", 
    color: "hsl(var(--secondary))",
  },
  success: {
    label: "Success",
    color: "#10b981",
  },
  warning: {
    label: "Warning",
    color: "#f59e0b",
  },
  danger: {
    label: "Danger",
    color: "#ef4444",
  },
  info: {
    label: "Info",
    color: "#3b82f6",
  },
};

// Mock data for various charts
const playerRegistrationTrends = [
  { month: "Jan", registrations: 45, completed: 38, active: 35 },
  { month: "Feb", registrations: 52, completed: 45, active: 42 },
  { month: "Mar", registrations: 48, completed: 41, active: 38 },
  { month: "Apr", registrations: 61, completed: 54, active: 51 },
  { month: "May", registrations: 67, completed: 59, active: 56 },
  { month: "Jun", registrations: 73, completed: 68, active: 64 },
  { month: "Jul", registrations: 69, completed: 62, active: 59 },
  { month: "Aug", registrations: 78, completed: 71, active: 68 },
  { month: "Sep", registrations: 82, completed: 76, active: 72 },
  { month: "Oct", registrations: 89, completed: 82, active: 79 },
];

const positionDistribution = [
  { name: "Defenders", value: 8, percentage: 36, color: "#3b82f6" },
  { name: "Midfielders", value: 6, percentage: 27, color: "#10b981" },
  { name: "Forwards", value: 5, percentage: 23, color: "#f59e0b" },
  { name: "Goalkeepers", value: 3, percentage: 14, color: "#ef4444" },
];

const tournamentPerformance = [
  { tournament: "County Cup", wins: 8, draws: 3, losses: 1, goals: 24, points: 27 },
  { tournament: "Regional League", wins: 6, draws: 4, losses: 2, goals: 18, points: 22 },
  { tournament: "Inter-School", wins: 7, draws: 2, losses: 3, goals: 21, points: 23 },
  { tournament: "Championship", wins: 5, draws: 5, losses: 2, goals: 16, points: 20 },
];

const weeklyActivity = [
  { day: "Mon", invitations: 12, responses: 8, registrations: 5 },
  { day: "Tue", invitations: 15, responses: 11, registrations: 7 },
  { day: "Wed", invitations: 18, responses: 14, registrations: 9 },
  { day: "Thu", invitations: 14, responses: 10, registrations: 6 },
  { day: "Fri", invitations: 16, responses: 12, registrations: 8 },
  { day: "Sat", invitations: 10, responses: 6, registrations: 3 },
  { day: "Sun", invitations: 8, responses: 5, registrations: 2 },
];

const teamRadarData = [
  { metric: "Attack", value: 85, fullMark: 100 },
  { metric: "Defense", value: 78, fullMark: 100 },
  { metric: "Midfield", value: 82, fullMark: 100 },
  { metric: "Discipline", value: 90, fullMark: 100 },
  { metric: "Fitness", value: 76, fullMark: 100 },
  { metric: "Teamwork", value: 88, fullMark: 100 },
];

interface AnalyticsChartsProps {
  className?: string;
}

export default function AnalyticsCharts({ className }: AnalyticsChartsProps) {
  return (
    <div className={`space-y-6 ${className}`}>
      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Players</p>
                <p className="text-2xl font-bold">89</p>
                <p className="text-xs text-green-600 flex items-center">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  +12% from last month
                </p>
              </div>
              <Users className="w-5 h-5 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Completion Rate</p>
                <p className="text-2xl font-bold">92%</p>
                <p className="text-xs text-green-600 flex items-center">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  +8% from last month
                </p>
              </div>
              <Target className="w-5 h-5 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Teams</p>
                <p className="text-2xl font-bold">4</p>
                <p className="text-xs text-red-600 flex items-center">
                  <TrendingDown className="w-3 h-3 mr-1" />
                  -1 from last month
                </p>
              </div>
              <Trophy className="w-5 h-5 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Win Rate</p>
                <p className="text-2xl font-bold">68%</p>
                <p className="text-xs text-green-600 flex items-center">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  +5% from last month
                </p>
              </div>
              <Activity className="w-5 h-5 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Player Registration Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Player Registration Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={playerRegistrationTrends}>
                  <defs>
                    <linearGradient id="registrations" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="completed" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area
                    type="monotone"
                    dataKey="registrations"
                    stackId="1"
                    stroke="#3b82f6"
                    fillOpacity={1}
                    fill="url(#registrations)"
                    name="Total Registrations"
                  />
                  <Area
                    type="monotone"
                    dataKey="completed"
                    stackId="2"
                    stroke="#10b981"
                    fillOpacity={1}
                    fill="url(#completed)"
                    name="Completed"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Position Distribution Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Team Position Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={positionDistribution}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, percentage }) => `${name}: ${percentage}%`}
                    labelLine={false}
                  >
                    {positionDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Weekly Activity Pattern */}
        <Card>
          <CardHeader>
            <CardTitle>Weekly Activity Pattern</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={weeklyActivity}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Legend />
                  <Bar dataKey="invitations" fill="#3b82f6" name="Invitations Sent" />
                  <Bar dataKey="responses" fill="#10b981" name="Responses" />
                  <Line type="monotone" dataKey="registrations" stroke="#f59e0b" strokeWidth={3} name="Registrations" />
                </ComposedChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Team Performance Radar */}
        <Card>
          <CardHeader>
            <CardTitle>Team Performance Radar</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={teamRadarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="metric" />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} />
                  <Radar
                    name="Team Performance"
                    dataKey="value"
                    stroke="#3b82f6"
                    fill="#3b82f6"
                    fillOpacity={0.3}
                    strokeWidth={2}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                </RadarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Tournament Performance Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>Tournament Performance Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={tournamentPerformance} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="tournament" type="category" width={100} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Legend />
                <Bar dataKey="wins" stackId="results" fill="#10b981" name="Wins" />
                <Bar dataKey="draws" stackId="results" fill="#f59e0b" name="Draws" />
                <Bar dataKey="losses" stackId="results" fill="#ef4444" name="Losses" />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}