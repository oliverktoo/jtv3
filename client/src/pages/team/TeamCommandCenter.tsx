import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function TeamCommandCenter() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-xl font-bold">
            NFC
          </div>
          <div>
            <h1 className="text-3xl font-bold">Nairobi FC</h1>
            <p className="text-muted-foreground">Team Management Dashboard • Est. 1985</p>
          </div>
        </div>
      </div>

      {/* Team Performance Overview */}
      <section className="mb-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription className="text-xs">League Position</CardDescription>
              <CardTitle className="text-3xl font-bold text-green-600">1st</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-xs text-muted-foreground">+3 points clear</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription className="text-xs">Matches Played</CardDescription>
              <CardTitle className="text-3xl font-bold text-blue-600">12</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-xs text-muted-foreground">8W 2D 2L</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription className="text-xs">Goals Scored</CardDescription>
              <CardTitle className="text-3xl font-bold text-purple-600">42</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-xs text-muted-foreground">3.5 per match</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription className="text-xs">Squad Size</CardDescription>
              <CardTitle className="text-3xl font-bold text-orange-600">28</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-xs text-muted-foreground">2 injured</div>
            </CardContent>
          </Card>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Upcoming Fixtures */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Upcoming Fixtures</CardTitle>
                <button className="text-primary text-sm hover:underline">View All</button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 border rounded-lg bg-blue-50">
                  <div>
                    <h3 className="font-semibold">Nairobi FC vs Machakos United</h3>
                    <div className="text-sm text-muted-foreground">Governor's Cup • Home</div>
                    <div className="text-xs text-blue-600">Nov 22, 2025 • 15:00 • Kasarani Stadium</div>
                  </div>
                  <div className="text-right">
                    <Badge variant="default" className="mb-2">NEXT MATCH</Badge>
                    <div className="text-xs text-muted-foreground">In 7 days</div>
                  </div>
                </div>

                <div className="flex justify-between items-center p-4 border rounded-lg">
                  <div>
                    <h3 className="font-semibold">Eldoret City vs Nairobi FC</h3>
                    <div className="text-sm text-muted-foreground">League • Away</div>
                    <div className="text-xs text-muted-foreground">Nov 29, 2025 • 16:00 • Eldoret Stadium</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-muted-foreground">In 14 days</div>
                  </div>
                </div>

                <div className="flex justify-between items-center p-4 border rounded-lg">
                  <div>
                    <h3 className="font-semibold">Nairobi FC vs Garissa FC</h3>
                    <div className="text-sm text-muted-foreground">League • Home</div>
                    <div className="text-xs text-muted-foreground">Dec 5, 2025 • 15:30 • Nyayo Stadium</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-muted-foreground">In 21 days</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Squad Status */}
          <Card>
            <CardHeader>
              <CardTitle>Squad Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3">Available Players</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center p-2 bg-green-50 border border-green-200 rounded">
                      <span className="text-sm font-medium">Goalkeepers</span>
                      <Badge variant="default" className="bg-green-100 text-green-800">3/3</Badge>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-green-50 border border-green-200 rounded">
                      <span className="text-sm font-medium">Defenders</span>
                      <Badge variant="default" className="bg-green-100 text-green-800">8/10</Badge>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-green-50 border border-green-200 rounded">
                      <span className="text-sm font-medium">Midfielders</span>
                      <Badge variant="default" className="bg-green-100 text-green-800">9/10</Badge>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-green-50 border border-green-200 rounded">
                      <span className="text-sm font-medium">Forwards</span>
                      <Badge variant="default" className="bg-green-100 text-green-800">6/8</Badge>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">Injury List</h4>
                  <div className="space-y-2">
                    <div className="p-3 bg-red-50 border border-red-200 rounded">
                      <div className="font-medium text-sm">David Kimani</div>
                      <div className="text-xs text-muted-foreground">Midfielder • Knee injury</div>
                      <div className="text-xs text-red-600">Expected return: Dec 1</div>
                    </div>
                    <div className="p-3 bg-red-50 border border-red-200 rounded">
                      <div className="font-medium text-sm">Paul Mwangi</div>
                      <div className="text-xs text-muted-foreground">Defender • Ankle sprain</div>
                      <div className="text-xs text-red-600">Expected return: Nov 25</div>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <h4 className="font-semibold mb-2 text-sm">Suspended</h4>
                    <div className="p-2 bg-yellow-50 border border-yellow-200 rounded text-center text-sm text-yellow-700">
                      No suspended players
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Performance */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { match: "Nairobi FC 2-1 Kiambu United", result: "W", date: "Nov 15", competition: "Governor's Cup Final" },
                  { match: "Thika United 0-3 Nairobi FC", result: "W", date: "Nov 10", competition: "Governor's Cup Semi" },
                  { match: "Nairobi FC 1-1 Nakuru FC", result: "D", date: "Nov 5", competition: "League" },
                  { match: "Mombasa FC 1-2 Nairobi FC", result: "W", date: "Oct 28", competition: "League" },
                  { match: "Nairobi FC 0-1 Eldoret City", result: "L", date: "Oct 21", competition: "League" }
                ].map((match, index) => (
                  <div key={index} className="flex justify-between items-center p-3 border rounded">
                    <div>
                      <div className="font-medium text-sm">{match.match}</div>
                      <div className="text-xs text-muted-foreground">{match.competition} • {match.date}</div>
                    </div>
                    <Badge variant={
                      match.result === 'W' ? 'default' : 
                      match.result === 'D' ? 'secondary' : 
                      'destructive'
                    } className={
                      match.result === 'W' ? 'bg-green-100 text-green-800' : 
                      match.result === 'D' ? 'bg-yellow-100 text-yellow-800' : 
                      'bg-red-100 text-red-800'
                    }>
                      {match.result}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Team Management</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <button className="w-full bg-primary text-primary-foreground py-2 rounded text-sm">
                👥 Manage Squad
              </button>
              <button className="w-full bg-green-600 text-white py-2 rounded text-sm">
                📋 Training Schedule
              </button>
              <button className="w-full bg-blue-600 text-white py-2 rounded text-sm">
                🔄 Transfer Hub
              </button>
              <button className="w-full bg-purple-600 text-white py-2 rounded text-sm">
                📊 Team Analytics
              </button>
              <button className="w-full border border-gray-300 text-gray-700 py-2 rounded text-sm">
                ⚙️ Team Settings
              </button>
            </CardContent>
          </Card>

          {/* Staff */}
          <Card>
            <CardHeader>
              <CardTitle>Coaching Staff</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                    JK
                  </div>
                  <div>
                    <div className="font-medium text-sm">John Kamau</div>
                    <div className="text-xs text-muted-foreground">Head Coach</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                    PN
                  </div>
                  <div>
                    <div className="font-medium text-sm">Peter Njoroge</div>
                    <div className="text-xs text-muted-foreground">Assistant Coach</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                    MW
                  </div>
                  <div>
                    <div className="font-medium text-sm">Mary Wanjiku</div>
                    <div className="text-xs text-muted-foreground">Physiotherapist</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Team Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Season Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span>League Points:</span>
                  <span className="font-bold">26</span>
                </div>
                <div className="flex justify-between">
                  <span>Goal Difference:</span>
                  <span className="font-bold text-green-600">+28</span>
                </div>
                <div className="flex justify-between">
                  <span>Clean Sheets:</span>
                  <span className="font-bold">6</span>
                </div>
                <div className="flex justify-between">
                  <span>Win Rate:</span>
                  <span className="font-bold">67%</span>
                </div>
                <div className="flex justify-between">
                  <span>Home Record:</span>
                  <span className="font-bold">5W 1D 0L</span>
                </div>
                <div className="flex justify-between">
                  <span>Away Record:</span>
                  <span className="font-bold">3W 1D 2L</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card>
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                  <div className="font-medium text-sm">Training Session</div>
                  <div className="text-xs text-muted-foreground">Tomorrow 10:00 AM</div>
                </div>
                <div className="p-3 bg-orange-50 border border-orange-200 rounded">
                  <div className="font-medium text-sm">Medical Check</div>
                  <div className="text-xs text-muted-foreground">David Kimani - Nov 20</div>
                </div>
                <div className="p-3 bg-green-50 border border-green-200 rounded">
                  <div className="font-medium text-sm">Registration</div>
                  <div className="text-xs text-muted-foreground">New player approved</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}