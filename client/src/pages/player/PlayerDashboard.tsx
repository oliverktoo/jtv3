import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function PlayerDashboard() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-2xl font-bold">
            JM
          </div>
          <div>
            <h1 className="text-3xl font-bold">John Mburu</h1>
            <p className="text-muted-foreground">Forward • Nairobi FC • #9</p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <section className="mb-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription className="text-xs">Goals This Season</CardDescription>
              <CardTitle className="text-3xl font-bold text-green-600">18</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-xs text-muted-foreground">+3 this month</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription className="text-xs">Matches Played</CardDescription>
              <CardTitle className="text-3xl font-bold text-blue-600">12</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-xs text-muted-foreground">1.5 goals/match</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription className="text-xs">Assists</CardDescription>
              <CardTitle className="text-3xl font-bold text-purple-600">7</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-xs text-muted-foreground">2nd in league</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription className="text-xs">Team Rating</CardDescription>
              <CardTitle className="text-3xl font-bold text-orange-600">8.4</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-xs text-muted-foreground">Excellent form</div>
            </CardContent>
          </Card>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Matches */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { 
                    match: "Nairobi FC 2-1 Kiambu United", 
                    date: "Nov 15, 2025", 
                    performance: "1 Goal, 1 Assist", 
                    rating: 9.2,
                    competition: "Governor's Cup Final"
                  },
                  { 
                    match: "Thika United 0-3 Nairobi FC", 
                    date: "Nov 10, 2025", 
                    performance: "2 Goals", 
                    rating: 8.8,
                    competition: "Governor's Cup Semi"
                  },
                  { 
                    match: "Nairobi FC 1-1 Nakuru FC", 
                    date: "Nov 5, 2025", 
                    performance: "1 Goal", 
                    rating: 7.9,
                    competition: "Governor's Cup Quarter"
                  },
                  { 
                    match: "Mombasa FC 1-2 Nairobi FC", 
                    date: "Oct 28, 2025", 
                    performance: "1 Assist", 
                    rating: 7.6,
                    competition: "Governor's Cup R16"
                  }
                ].map((match, index) => (
                  <div key={index} className="flex justify-between items-center p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="font-semibold">{match.match}</div>
                      <div className="text-sm text-muted-foreground">{match.competition}</div>
                      <div className="text-sm text-green-600 font-medium">{match.performance}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-lg">{match.rating}</div>
                      <div className="text-xs text-muted-foreground">{match.date}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Achievements */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Achievements</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">🏆</span>
                    <span className="font-semibold">Top Scorer</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Leading scorer in Governor's Cup with 8 goals
                  </div>
                </div>
                
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">⚽</span>
                    <span className="font-semibold">Hat-trick Hero</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Scored hat-trick vs Eldoret City (Oct 15)
                  </div>
                </div>
                
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">📊</span>
                    <span className="font-semibold">Consistency</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Scored in 8 consecutive matches
                  </div>
                </div>
                
                <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">🎯</span>
                    <span className="font-semibold">Team Player</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    7 assists - helping teammates succeed
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Upcoming Fixtures */}
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Fixtures</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="p-3 border rounded">
                  <div className="font-medium text-sm">Nairobi FC vs Machakos United</div>
                  <div className="text-xs text-muted-foreground">Nov 22, 2025 • 15:00</div>
                  <div className="text-xs text-blue-600">League Match</div>
                </div>
                <div className="p-3 border rounded">
                  <div className="font-medium text-sm">Eldoret City vs Nairobi FC</div>
                  <div className="text-xs text-muted-foreground">Nov 29, 2025 • 16:00</div>
                  <div className="text-xs text-blue-600">League Match</div>
                </div>
                <div className="p-3 border rounded">
                  <div className="font-medium text-sm">Nairobi FC vs Garissa FC</div>
                  <div className="text-xs text-muted-foreground">Dec 5, 2025 • 15:30</div>
                  <div className="text-xs text-blue-600">League Match</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Season Progress */}
          <Card>
            <CardHeader>
              <CardTitle>Season Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Goals Target</span>
                    <span>18/25</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{width: '72%'}}></div>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">7 goals to target</div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Matches Played</span>
                    <span>12/20</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{width: '60%'}}></div>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">8 matches remaining</div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Training Sessions</span>
                    <span>45/60</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-purple-600 h-2 rounded-full" style={{width: '75%'}}></div>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">15 sessions remaining</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <button className="w-full bg-primary text-primary-foreground py-2 rounded text-sm">
                📝 Update Profile
              </button>
              <button className="w-full bg-green-600 text-white py-2 rounded text-sm">
                📋 Training Schedule
              </button>
              <button className="w-full bg-blue-600 text-white py-2 rounded text-sm">
                📊 View Full Stats
              </button>
              <button className="w-full border border-gray-300 text-gray-700 py-2 rounded text-sm">
                ⚙️ Privacy Settings
              </button>
            </CardContent>
          </Card>

          {/* Team Status */}
          <Card>
            <CardHeader>
              <CardTitle>Team Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span>Position in Squad:</span>
                  <Badge variant="secondary">Regular Starter</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Contract Status:</span>
                  <Badge variant="default" className="bg-green-100 text-green-800">Active</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Injury Status:</span>
                  <Badge variant="default" className="bg-green-100 text-green-800">Fit</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Disciplinary:</span>
                  <Badge variant="outline">Clean Record</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}