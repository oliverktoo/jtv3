import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface PerformanceMetric {
  id: string;
  category: 'Attack' | 'Defense' | 'Possession' | 'Fitness' | 'Set Pieces';
  metric: string;
  value: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  comparison: string;
  ranking: number;
  benchmarkValue: number;
}

interface PlayerStat {
  id: string;
  name: string;
  position: string;
  matches: number;
  goals: number;
  assists: number;
  rating: number;
  passAccuracy: number;
  tackles: number;
  distance: number;
  minutesPlayed: number;
}

interface TacticalInsight {
  id: string;
  title: string;
  category: 'Formation' | 'Style' | 'Weakness' | 'Strength';
  description: string;
  recommendation: string;
  impact: 'High' | 'Medium' | 'Low';
  dataPoints: string[];
}

export default function TeamAnalytics() {
  const performanceMetrics: PerformanceMetric[] = [
    { id: '1', category: 'Attack', metric: 'Goals Per Game', value: 2.8, unit: 'goals', trend: 'up', comparison: '+0.3 vs league avg', ranking: 2, benchmarkValue: 2.1 },
    { id: '2', category: 'Defense', metric: 'Goals Conceded', value: 0.9, unit: 'goals', trend: 'down', comparison: '-0.4 vs league avg', ranking: 1, benchmarkValue: 1.3 },
    { id: '3', category: 'Possession', metric: 'Ball Possession', value: 58.4, unit: '%', trend: 'stable', comparison: '+4.2% vs league avg', ranking: 4, benchmarkValue: 54.2 },
    { id: '4', category: 'Fitness', metric: 'Distance Covered', value: 112.6, unit: 'km', trend: 'up', comparison: '+2.1km vs league avg', ranking: 3, benchmarkValue: 110.5 },
    { id: '5', category: 'Set Pieces', metric: 'Conversion Rate', value: 18.7, unit: '%', trend: 'up', comparison: '+3.2% vs league avg', ranking: 1, benchmarkValue: 15.5 }
  ];

  const topPlayers: PlayerStat[] = [
    { id: '1', name: 'Samuel Ochieng', position: 'ST', matches: 12, goals: 18, assists: 4, rating: 8.7, passAccuracy: 82, tackles: 12, distance: 118.5, minutesPlayed: 1020 },
    { id: '2', name: 'Eric Mutua', position: 'LW', matches: 11, goals: 8, assists: 12, rating: 8.2, passAccuracy: 79, tackles: 28, distance: 125.3, minutesPlayed: 945 },
    { id: '3', name: 'Michael Otieno', position: 'CB', matches: 12, goals: 2, assists: 1, rating: 8.1, passAccuracy: 91, tackles: 45, distance: 108.2, minutesPlayed: 1080 },
    { id: '4', name: 'James Wanjiku', position: 'GK', matches: 12, goals: 0, assists: 0, rating: 7.9, passAccuracy: 68, tackles: 0, distance: 45.2, minutesPlayed: 1080 }
  ];

  const tacticalInsights: TacticalInsight[] = [
    {
      id: '1',
      title: 'Strong Right Flank Attack',
      category: 'Strength',
      description: 'Team shows exceptional attacking output through right wing position',
      recommendation: 'Continue exploiting right flank, consider tactical variations to maintain unpredictability',
      impact: 'High',
      dataPoints: ['65% of goals from right side', '89% crossing accuracy', 'Right winger 12 assists']
    },
    {
      id: '2',
      title: 'Vulnerability to Counter Attacks',
      category: 'Weakness',
      description: 'Team struggles when defending against quick transitions',
      recommendation: 'Improve defensive shape and transition speed, practice counter-press scenarios',
      impact: 'High',
      dataPoints: ['78% goals conceded from counters', 'Slow transition time', 'High line positioning issues']
    },
    {
      id: '3',
      title: '4-3-3 Formation Dominance',
      category: 'Formation',
      description: 'Optimal performance observed in 4-3-3 tactical setup',
      recommendation: 'Maintain primary formation while developing 4-2-3-1 alternative',
      impact: 'Medium',
      dataPoints: ['83% win rate in 4-3-3', 'Best possession stats', 'Improved pressing coordination']
    }
  ];

  const getTrendColor = (trend: PerformanceMetric['trend']) => {
    switch (trend) {
      case 'up': return 'text-green-600';
      case 'down': return 'text-red-600';
      case 'stable': return 'text-gray-600';
      default: return 'text-gray-600';
    }
  };

  const getTrendIcon = (trend: PerformanceMetric['trend']) => {
    switch (trend) {
      case 'up': return '↗️';
      case 'down': return '↘️';
      case 'stable': return '➡️';
      default: return '➡️';
    }
  };

  const getCategoryColor = (category: PerformanceMetric['category']) => {
    switch (category) {
      case 'Attack': return 'bg-red-100 text-red-800';
      case 'Defense': return 'bg-blue-100 text-blue-800';
      case 'Possession': return 'bg-purple-100 text-purple-800';
      case 'Fitness': return 'bg-green-100 text-green-800';
      case 'Set Pieces': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getInsightImpactColor = (impact: TacticalInsight['impact']) => {
    switch (impact) {
      case 'High': return 'bg-red-100 text-red-800 border-red-200';
      case 'Medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getInsightCategoryColor = (category: TacticalInsight['category']) => {
    switch (category) {
      case 'Strength': return 'bg-green-100 text-green-800';
      case 'Weakness': return 'bg-red-100 text-red-800';
      case 'Formation': return 'bg-blue-100 text-blue-800';
      case 'Style': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 8.5) return 'text-green-600 font-bold';
    if (rating >= 7.5) return 'text-yellow-600 font-bold';
    return 'text-red-600 font-bold';
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Team Analytics</h1>
          <p className="text-muted-foreground">Comprehensive performance analysis and tactical insights</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">📊 Export Report</Button>
          <Button variant="outline">📅 Historical Data</Button>
          <Button>🎯 Custom Analysis</Button>
        </div>
      </div>

      {/* Performance Overview */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Performance Metrics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {performanceMetrics.map(metric => (
            <Card key={metric.id}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <Badge className={getCategoryColor(metric.category)} variant="secondary">
                    {metric.category}
                  </Badge>
                  <span className="text-xs font-bold bg-gray-100 px-2 py-1 rounded">
                    #{metric.ranking}
                  </span>
                </div>
                <CardDescription className="text-xs">{metric.metric}</CardDescription>
                <CardTitle className="text-2xl font-bold">
                  {metric.value}
                  <span className="text-sm font-normal text-muted-foreground ml-1">
                    {metric.unit}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center gap-1">
                  <span className={getTrendColor(metric.trend)}>
                    {getTrendIcon(metric.trend)}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {metric.comparison}
                  </span>
                </div>
                <div className="mt-2">
                  <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-500" 
                      style={{
                        width: `${(metric.value / (metric.benchmarkValue * 1.5)) * 100}%`
                      }}
                    ></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Analytics */}
        <div className="lg:col-span-2 space-y-6">
          {/* Player Performance */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Top Performers</CardTitle>
                <Button variant="outline" size="sm">👥 Full Squad Stats</Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topPlayers.map((player, index) => (
                  <div key={player.id} className="p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-sm">
                          {index + 1}
                        </div>
                        <div>
                          <h4 className="font-semibold">{player.name}</h4>
                          <div className="text-sm text-muted-foreground">{player.position} • {player.matches} matches</div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className={`text-lg font-bold ${getRatingColor(player.rating)}`}>
                          {player.rating}
                        </div>
                        <div className="text-xs text-muted-foreground">Avg Rating</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-6 gap-3 text-sm">
                      <div>
                        <div className="text-xs text-muted-foreground">Goals</div>
                        <div className="font-bold text-green-600">{player.goals}</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">Assists</div>
                        <div className="font-bold text-blue-600">{player.assists}</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">Pass %</div>
                        <div className="font-bold">{player.passAccuracy}%</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">Tackles</div>
                        <div className="font-bold">{player.tackles}</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">Distance</div>
                        <div className="font-bold">{player.distance}km</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">Minutes</div>
                        <div className="font-bold">{player.minutesPlayed}'</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Tactical Insights */}
          <Card>
            <CardHeader>
              <CardTitle>Tactical Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {tacticalInsights.map(insight => (
                  <div key={insight.id} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-semibold">{insight.title}</h4>
                        <div className="text-sm text-muted-foreground">{insight.description}</div>
                      </div>
                      
                      <div className="flex flex-col items-end gap-1">
                        <Badge className={getInsightCategoryColor(insight.category)} variant="secondary">
                          {insight.category}
                        </Badge>
                        <Badge className={getInsightImpactColor(insight.impact)} variant="secondary">
                          {insight.impact} Impact
                        </Badge>
                      </div>
                    </div>

                    <div className="bg-blue-50 p-3 rounded mb-3">
                      <div className="text-sm font-medium text-blue-800 mb-1">💡 Recommendation</div>
                      <div className="text-sm text-blue-700">{insight.recommendation}</div>
                    </div>

                    <div>
                      <div className="text-xs font-medium text-muted-foreground mb-2">Key Data Points:</div>
                      <div className="flex flex-wrap gap-2">
                        {insight.dataPoints.map((point, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {point}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Season Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Season Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">1st</div>
                  <div className="text-sm text-muted-foreground">League Position</div>
                </div>
                
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span>Matches Played:</span>
                    <span className="font-bold">12</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Wins:</span>
                    <span className="font-bold text-green-600">8</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Draws:</span>
                    <span className="font-bold text-yellow-600">2</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Losses:</span>
                    <span className="font-bold text-red-600">2</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Points:</span>
                    <span className="font-bold">26</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Goal Difference:</span>
                    <span className="font-bold text-green-600">+23</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Form Guide */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Form</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-1 mb-4">
                {['W', 'W', 'D', 'W', 'L'].map((result, index) => (
                  <div
                    key={index}
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                      result === 'W' ? 'bg-green-500 text-white' :
                      result === 'D' ? 'bg-yellow-500 text-white' :
                      'bg-red-500 text-white'
                    }`}
                  >
                    {result}
                  </div>
                ))}
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Win Rate:</span>
                  <span className="font-bold text-green-600">67%</span>
                </div>
                <div className="flex justify-between">
                  <span>Home Record:</span>
                  <span className="font-bold">5-1-0</span>
                </div>
                <div className="flex justify-between">
                  <span>Away Record:</span>
                  <span className="font-bold">3-1-2</span>
                </div>
                <div className="flex justify-between">
                  <span>Scoring Form:</span>
                  <span className="font-bold text-green-600">High</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Comparative Analysis */}
          <Card>
            <CardHeader>
              <CardTitle>League Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Goals Scored</span>
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div className="w-full h-full bg-green-500"></div>
                    </div>
                    <span className="text-xs font-medium">#1</span>
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm">Goals Conceded</span>
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div className="w-full h-full bg-green-500"></div>
                    </div>
                    <span className="text-xs font-medium">#1</span>
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm">Possession</span>
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div className="w-3/4 h-full bg-blue-500"></div>
                    </div>
                    <span className="text-xs font-medium">#4</span>
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm">Passing Accuracy</span>
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div className="w-5/6 h-full bg-purple-500"></div>
                    </div>
                    <span className="text-xs font-medium">#3</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Analytics Tools */}
          <Card>
            <CardHeader>
              <CardTitle>Analysis Tools</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start">
                📊 Player Comparison
              </Button>
              <Button variant="outline" className="w-full justify-start">
                🎯 Formation Analysis
              </Button>
              <Button variant="outline" className="w-full justify-start">
                📈 Trend Analysis
              </Button>
              <Button variant="outline" className="w-full justify-start">
                ⚡ Heat Maps
              </Button>
              <Button variant="outline" className="w-full justify-start">
                🏆 Opposition Scout
              </Button>
            </CardContent>
          </Card>

          {/* Data Insights */}
          <Card>
            <CardHeader>
              <CardTitle>Key Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="p-3 bg-green-50 border border-green-200 rounded">
                  <div className="font-medium text-sm text-green-800">🎯 Strength</div>
                  <div className="text-xs text-green-600">Excellent conversion rate in final third</div>
                </div>
                <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                  <div className="font-medium text-sm text-blue-800">📊 Opportunity</div>
                  <div className="text-xs text-blue-600">Improve possession in midfield third</div>
                </div>
                <div className="p-3 bg-orange-50 border border-orange-200 rounded">
                  <div className="font-medium text-sm text-orange-800">⚠️ Watch</div>
                  <div className="text-xs text-orange-600">Fatigue levels rising in key players</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}