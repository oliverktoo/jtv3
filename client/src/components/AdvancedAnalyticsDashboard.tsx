import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  ScatterChart,
  Scatter,
  Treemap,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  Users,
  Trophy,
  Activity,
  Calendar,
  Target,
  Zap,
  Download,
  Filter,
  RefreshCw,
  BarChart3,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import * as XLSX from "xlsx";
import { format } from "date-fns";

// Chart configuration
const chartConfig = {
  primary: { label: "Primary", color: "hsl(var(--primary))" },
  secondary: { label: "Secondary", color: "hsl(var(--secondary))" },
  success: { label: "Success", color: "#10b981" },
  warning: { label: "Warning", color: "#f59e0b" },
  danger: { label: "Danger", color: "#ef4444" },
  info: { label: "Info", color: "#3b82f6" },
  purple: { label: "Purple", color: "#8b5cf6" },
  pink: { label: "Pink", color: "#ec4899" },
};

// Enhanced mock data with more realistic trends
const timeSeriesData = [
  { date: "2024-01-01", players: 45, teams: 3, tournaments: 1, registrations: 12, transfers: 2 },
  { date: "2024-02-01", players: 52, teams: 4, tournaments: 2, registrations: 18, transfers: 4 },
  { date: "2024-03-01", players: 48, teams: 4, tournaments: 2, registrations: 15, transfers: 3 },
  { date: "2024-04-01", players: 61, teams: 5, tournaments: 3, registrations: 22, transfers: 6 },
  { date: "2024-05-01", players: 67, teams: 5, tournaments: 3, registrations: 28, transfers: 8 },
  { date: "2024-06-01", players: 73, teams: 6, tournaments: 4, registrations: 32, transfers: 10 },
  { date: "2024-07-01", players: 69, teams: 6, tournaments: 4, registrations: 25, transfers: 7 },
  { date: "2024-08-01", players: 78, teams: 7, tournaments: 5, registrations: 35, transfers: 12 },
  { date: "2024-09-01", players: 82, teams: 7, tournaments: 5, registrations: 38, transfers: 15 },
  { date: "2024-10-01", players: 89, teams: 8, tournaments: 6, registrations: 42, transfers: 18 },
];

const performanceMetrics = [
  { category: "Registration Efficiency", current: 92, target: 95, benchmark: 88 },
  { category: "Player Retention", current: 85, target: 90, benchmark: 78 },
  { category: "Team Formation Speed", current: 78, target: 85, benchmark: 72 },
  { category: "Tournament Success Rate", current: 68, target: 75, benchmark: 65 },
  { category: "Response Time (hours)", current: 2.4, target: 2.0, benchmark: 3.1 },
];

const geographicDistribution = [
  { county: "Nairobi", players: 34, teams: 3, color: "#3b82f6" },
  { county: "Kiambu", players: 28, teams: 2, color: "#10b981" },
  { county: "Machakos", players: 15, teams: 2, color: "#f59e0b" },
  { county: "Kajiado", players: 12, teams: 1, color: "#ef4444" },
];

const ageGroupAnalysis = [
  { ageGroup: "U-16", male: 25, female: 18, total: 43 },
  { ageGroup: "U-18", male: 22, female: 15, total: 37 },
  { ageGroup: "U-21", male: 18, female: 12, total: 30 },
  { ageGroup: "Senior", male: 15, female: 8, total: 23 },
];

const transferTrends = [
  { month: "Jan", incoming: 2, outgoing: 1, net: 1 },
  { month: "Feb", incoming: 4, outgoing: 2, net: 2 },
  { month: "Mar", incoming: 3, outgoing: 4, net: -1 },
  { month: "Apr", incoming: 6, outgoing: 3, net: 3 },
  { month: "May", incoming: 8, outgoing: 4, net: 4 },
  { month: "Jun", incoming: 10, outgoing: 6, net: 4 },
  { month: "Jul", incoming: 7, outgoing: 8, net: -1 },
  { month: "Aug", incoming: 12, outgoing: 5, net: 7 },
  { month: "Sep", incoming: 15, outgoing: 7, net: 8 },
  { month: "Oct", incoming: 18, outgoing: 9, net: 9 },
];

interface AdvancedAnalyticsDashboardProps {
  orgId?: string;
  className?: string;
}

export default function AdvancedAnalyticsDashboard({ orgId, className }: AdvancedAnalyticsDashboardProps) {
  const [timeRange, setTimeRange] = useState("30days");
  const [activeTab, setActiveTab] = useState("overview");
  const [chartType, setChartType] = useState("area");
  const { toast } = useToast();

  // Simulated API queries - replace with real data hooks
  const { data: dashboardData, isLoading, refetch } = useQuery({
    queryKey: [`/api/analytics/dashboard/${orgId}`, timeRange],
    queryFn: async () => {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      return {
        summary: {
          totalPlayers: 89,
          totalTeams: 8,
          totalTournaments: 6,
          activeTransfers: 12,
          completionRate: 92,
          winRate: 68,
          responseTime: 2.4,
          growthRate: 15.2
        },
        trends: timeSeriesData,
        performance: performanceMetrics,
        geographic: geographicDistribution,
        ageGroups: ageGroupAnalysis,
        transfers: transferTrends
      };
    },
    enabled: !!orgId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const exportAnalytics = () => {
    if (!dashboardData) return;

    const wb = XLSX.utils.book_new();
    
    // Summary sheet
    const summaryData = Object.entries(dashboardData.summary).map(([key, value]) => ({
      Metric: key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()),
      Value: value
    }));
    const summaryWs = XLSX.utils.json_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, summaryWs, "Summary");

    // Trends sheet
    const trendsWs = XLSX.utils.json_to_sheet(dashboardData.trends);
    XLSX.utils.book_append_sheet(wb, trendsWs, "Trends");

    // Performance sheet
    const performanceWs = XLSX.utils.json_to_sheet(dashboardData.performance);
    XLSX.utils.book_append_sheet(wb, performanceWs, "Performance");

    const filename = `Analytics_Dashboard_${format(new Date(), "yyyy-MM-dd_HHmm")}.xlsx`;
    XLSX.writeFile(wb, filename);

    toast({
      title: "Export successful",
      description: `Analytics exported to ${filename}`,
    });
  };

  if (isLoading) {
    return (
      <div className={`${className} space-y-6`}>
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center gap-2">
            <RefreshCw className="w-5 h-5 animate-spin" />
            <p className="text-muted-foreground">Loading analytics...</p>
          </div>
        </div>
      </div>
    );
  }

  const summary = dashboardData?.summary || {
    totalPlayers: 0,
    totalTeams: 0,
    totalTournaments: 0,
    activeTransfers: 0,
    completionRate: 0,
    winRate: 0,
    responseTime: 0,
    growthRate: 0
  };

  return (
    <div className={`${className} space-y-6`}>
      {/* Header with Controls */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Advanced Analytics</h2>
          <p className="text-muted-foreground">Comprehensive insights and performance metrics</p>
        </div>
        <div className="flex gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">Last 7 days</SelectItem>
              <SelectItem value="30days">Last 30 days</SelectItem>
              <SelectItem value="90days">Last 90 days</SelectItem>
              <SelectItem value="1year">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={exportAnalytics}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
        <Card className="col-span-2">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Players</p>
                <p className="text-2xl font-bold">{summary.totalPlayers}</p>
                <p className="text-xs text-green-600 flex items-center">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  +{summary.growthRate}% growth
                </p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-2">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Completion Rate</p>
                <p className="text-2xl font-bold">{summary.completionRate}%</p>
                <p className="text-xs text-green-600 flex items-center">
                  <Target className="w-3 h-3 mr-1" />
                  Above target
                </p>
              </div>
              <Trophy className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-2">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Teams</p>
                <p className="text-2xl font-bold">{summary.totalTeams}</p>
                <p className="text-xs text-blue-600 flex items-center">
                  <Activity className="w-3 h-3 mr-1" />
                  {summary.totalTournaments} tournaments
                </p>
              </div>
              <Zap className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-2">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Response</p>
                <p className="text-2xl font-bold">{summary.responseTime}h</p>
                <p className="text-xs text-green-600 flex items-center">
                  <TrendingDown className="w-3 h-3 mr-1" />
                  30% faster
                </p>
              </div>
              <Calendar className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="geographic">Geographic</TabsTrigger>
          <TabsTrigger value="demographics">Demographics</TabsTrigger>
          <TabsTrigger value="transfers">Transfers</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="flex gap-2 mb-4">
            <Badge variant="outline" className="cursor-pointer" onClick={() => setChartType("area")}>
              <BarChart3 className="w-3 h-3 mr-1" />
              Area Chart
            </Badge>
            <Badge variant="outline" className="cursor-pointer" onClick={() => setChartType("line")}>
              <LineChartIcon className="w-3 h-3 mr-1" />
              Line Chart
            </Badge>
            <Badge variant="outline" className="cursor-pointer" onClick={() => setChartType("bar")}>
              <PieChartIcon className="w-3 h-3 mr-1" />
              Bar Chart
            </Badge>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Growth Trends Over Time</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    {chartType === "area" ? (
                      <AreaChart data={timeSeriesData}>
                        <defs>
                          <linearGradient id="players" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                          </linearGradient>
                          <linearGradient id="registrations" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" tickFormatter={(date) => format(new Date(date), "MMM")} />
                        <YAxis />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Legend />
                        <Area type="monotone" dataKey="players" stackId="1" stroke="#3b82f6" fillOpacity={1} fill="url(#players)" name="Players" />
                        <Area type="monotone" dataKey="registrations" stackId="2" stroke="#10b981" fillOpacity={1} fill="url(#registrations)" name="Registrations" />
                      </AreaChart>
                    ) : chartType === "line" ? (
                      <LineChart data={timeSeriesData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" tickFormatter={(date) => format(new Date(date), "MMM")} />
                        <YAxis />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Legend />
                        <Line type="monotone" dataKey="players" stroke="#3b82f6" strokeWidth={3} name="Players" />
                        <Line type="monotone" dataKey="teams" stroke="#10b981" strokeWidth={3} name="Teams" />
                        <Line type="monotone" dataKey="tournaments" stroke="#f59e0b" strokeWidth={3} name="Tournaments" />
                      </LineChart>
                    ) : (
                      <BarChart data={timeSeriesData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" tickFormatter={(date) => format(new Date(date), "MMM")} />
                        <YAxis />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Legend />
                        <Bar dataKey="registrations" fill="#3b82f6" name="Registrations" />
                        <Bar dataKey="transfers" fill="#10b981" name="Transfers" />
                      </BarChart>
                    )}
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance vs Targets</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={performanceMetrics} layout="horizontal">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" domain={[0, 100]} />
                      <YAxis dataKey="category" type="category" width={120} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Legend />
                      <Bar dataKey="current" fill="#3b82f6" name="Current" />
                      <Bar dataKey="target" fill="#10b981" name="Target" />
                      <Bar dataKey="benchmark" fill="#f59e0b" name="Industry Benchmark" />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {performanceMetrics.map((metric, index) => (
              <Card key={index}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">{metric.category}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold">{metric.current}{metric.category.includes("Time") ? "h" : "%"}</span>
                      <Badge variant={metric.current >= metric.target ? "default" : "secondary"}>
                        {metric.current >= metric.target ? "On Target" : "Below Target"}
                      </Badge>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${Math.min((metric.current / Math.max(metric.target, 100)) * 100, 100)}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Target: {metric.target}{metric.category.includes("Time") ? "h" : "%"}</span>
                      <span>Benchmark: {metric.benchmark}{metric.category.includes("Time") ? "h" : "%"}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Geographic Tab */}
        <TabsContent value="geographic" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Geographic Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={geographicDistribution}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="players"
                        label={({ county, players }) => `${county}: ${players}`}
                      >
                        {geographicDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <ChartTooltip content={<ChartTooltipContent />} />
                    </PieChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>County Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {geographicDistribution.map((county, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-4 h-4 rounded" style={{ backgroundColor: county.color }}></div>
                        <div>
                          <p className="font-medium">{county.county}</p>
                          <p className="text-sm text-muted-foreground">{county.teams} teams</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold">{county.players}</p>
                        <p className="text-xs text-muted-foreground">players</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Demographics Tab */}
        <TabsContent value="demographics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Age Group & Gender Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={ageGroupAnalysis}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="ageGroup" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Legend />
                    <Bar dataKey="male" fill="#3b82f6" name="Male" />
                    <Bar dataKey="female" fill="#ec4899" name="Female" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Transfers Tab */}
        <TabsContent value="transfers" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Transfer Activity Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={transferTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Legend />
                    <Line type="monotone" dataKey="incoming" stroke="#10b981" strokeWidth={3} name="Incoming Transfers" />
                    <Line type="monotone" dataKey="outgoing" stroke="#ef4444" strokeWidth={3} name="Outgoing Transfers" />
                    <Line type="monotone" dataKey="net" stroke="#3b82f6" strokeWidth={3} name="Net Transfers" />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}