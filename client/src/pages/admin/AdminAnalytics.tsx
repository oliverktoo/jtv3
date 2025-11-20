import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function AdminAnalytics() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Analytics Dashboard</h1>
        <p className="text-muted-foreground">
          Platform performance metrics and insights
        </p>
      </div>

      {/* KPI Overview */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Key Performance Indicators</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription className="text-xs">Total Tournaments</CardDescription>
              <CardTitle className="text-3xl font-bold text-blue-600">47</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center text-sm">
                <span className="text-green-600">↗ +12%</span>
                <span className="text-muted-foreground ml-2">vs last month</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription className="text-xs">Active Players</CardDescription>
              <CardTitle className="text-3xl font-bold text-green-600">2,847</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center text-sm">
                <span className="text-green-600">↗ +8%</span>
                <span className="text-muted-foreground ml-2">vs last month</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription className="text-xs">Registered Teams</CardDescription>
              <CardTitle className="text-3xl font-bold text-purple-600">384</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center text-sm">
                <span className="text-green-600">↗ +15%</span>
                <span className="text-muted-foreground ml-2">vs last month</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription className="text-xs">Total Matches</CardDescription>
              <CardTitle className="text-3xl font-bold text-orange-600">1,256</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center text-sm">
                <span className="text-green-600">↗ +22%</span>
                <span className="text-muted-foreground ml-2">vs last month</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Charts Section */}
      <section className="mb-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Tournament Registrations (Last 6 Months)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <div className="text-6xl mb-2">📊</div>
                  <div>Registration Trend Chart</div>
                  <div className="text-sm">(Chart component integration needed)</div>
                </div>
              </div>
              <div className="mt-4 flex justify-between text-sm">
                <span className="text-muted-foreground">Peak: September 2025</span>
                <span className="font-medium">127 new registrations</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>User Engagement by Role</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <div className="text-6xl mb-2">🥧</div>
                  <div>Role Distribution Chart</div>
                  <div className="text-sm">(Chart component integration needed)</div>
                </div>
              </div>
              <div className="mt-4 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Players</span>
                  <Badge variant="secondary">68%</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Team Managers</span>
                  <Badge variant="secondary">18%</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Officials</span>
                  <Badge variant="secondary">14%</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Recent Activity */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Recent Platform Activity</h2>
        
        <Card>
          <CardContent className="p-0">
            <div className="space-y-0">
              {[
                {
                  time: "2 minutes ago",
                  action: "New tournament created",
                  details: "Coastal Championship 2025 by Mombasa FC Admin",
                  type: "tournament"
                },
                {
                  time: "15 minutes ago",
                  action: "Bulk player registration",
                  details: "43 players registered by Nakuru United",
                  type: "registration"
                },
                {
                  time: "1 hour ago",
                  action: "Match result submitted",
                  details: "Nairobi FC 2-1 Kiambu United (Final)",
                  type: "match"
                },
                {
                  time: "2 hours ago",
                  action: "New team registered",
                  details: "Eldoret Rangers joined Youth Championship",
                  type: "team"
                },
                {
                  time: "3 hours ago",
                  action: "Disciplinary action",
                  details: "Yellow card issued to John Doe (Match #1256)",
                  type: "discipline"
                }
              ].map((activity, index) => (
                <div key={index} className="flex items-center justify-between p-4 border-b last:border-b-0">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${
                      activity.type === 'tournament' ? 'bg-blue-500' :
                      activity.type === 'registration' ? 'bg-green-500' :
                      activity.type === 'match' ? 'bg-orange-500' :
                      activity.type === 'team' ? 'bg-purple-500' :
                      'bg-red-500'
                    }`}></div>
                    <div>
                      <div className="font-medium">{activity.action}</div>
                      <div className="text-sm text-muted-foreground">{activity.details}</div>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground">{activity.time}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Performance Metrics */}
      <section>
        <h2 className="text-2xl font-bold mb-6">System Performance</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Response Times</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">API Endpoints</span>
                  <Badge variant="default" className="bg-green-100 text-green-800">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span>
                    85ms avg
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Database Queries</span>
                  <Badge variant="default" className="bg-green-100 text-green-800">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span>
                    42ms avg
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Page Load Times</span>
                  <Badge variant="default" className="bg-yellow-100 text-yellow-800">
                    <span className="w-2 h-2 bg-yellow-500 rounded-full mr-1"></span>
                    1.2s avg
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">System Health</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Server Uptime</span>
                  <Badge variant="default" className="bg-green-100 text-green-800">99.8%</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Database Status</span>
                  <Badge variant="default" className="bg-green-100 text-green-800">Healthy</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Storage Usage</span>
                  <Badge variant="secondary">67% (2.1GB)</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Traffic Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Daily Active Users</span>
                  <span className="font-bold">1,247</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Peak Concurrent</span>
                  <span className="font-bold">342 users</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Mobile Traffic</span>
                  <Badge variant="secondary">73%</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}