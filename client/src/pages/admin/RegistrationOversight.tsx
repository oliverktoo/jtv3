import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function RegistrationOversight() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Registration Oversight</h1>
        <p className="text-muted-foreground">
          Manage player and team registrations with bulk processing tools
        </p>
      </div>

      {/* Quick Actions */}
      <section className="mb-8">
        <div className="flex flex-wrap gap-4">
          <button className="bg-primary text-primary-foreground px-4 py-2 rounded-lg">
            Bulk Approve
          </button>
          <button className="bg-green-600 text-white px-4 py-2 rounded-lg">
            Export Registrations
          </button>
          <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg">
            Import Players
          </button>
          <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg">
            Send Notifications
          </button>
        </div>
      </section>

      {/* Registration Queues */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Smart Queues</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-orange-200 bg-orange-50">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg">Pending Review</CardTitle>
                <Badge variant="default" className="bg-orange-100 text-orange-800">47</Badge>
              </div>
              <CardDescription>
                New registrations awaiting approval
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-white rounded border">
                  <div>
                    <div className="font-medium">John Mburu</div>
                    <div className="text-xs text-muted-foreground">Nairobi FC • Submitted 2h ago</div>
                  </div>
                  <div className="flex gap-1">
                    <button className="bg-green-600 text-white px-2 py-1 rounded text-xs">✓</button>
                    <button className="bg-red-600 text-white px-2 py-1 rounded text-xs">✗</button>
                  </div>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-white rounded border">
                  <div>
                    <div className="font-medium">Sarah Wanjiku</div>
                    <div className="text-xs text-muted-foreground">Nakuru Queens • Submitted 4h ago</div>
                  </div>
                  <div className="flex gap-1">
                    <button className="bg-green-600 text-white px-2 py-1 rounded text-xs">✓</button>
                    <button className="bg-red-600 text-white px-2 py-1 rounded text-xs">✗</button>
                  </div>
                </div>
                
                <button className="w-full text-primary text-sm hover:underline">
                  View all 47 pending →
                </button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg">Issues Found</CardTitle>
                <Badge variant="destructive">12</Badge>
              </div>
              <CardDescription>
                Registrations with validation errors
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="p-3 bg-white rounded border">
                  <div className="font-medium text-red-700">Missing Guardian Consent</div>
                  <div className="text-xs text-muted-foreground">Peter Mwangi (Age 16) - Thika United</div>
                  <div className="text-xs mt-1">
                    <button className="text-primary hover:underline">Request documents →</button>
                  </div>
                </div>
                
                <div className="p-3 bg-white rounded border">
                  <div className="font-medium text-red-700">ID Name Mismatch</div>
                  <div className="text-xs text-muted-foreground">David Ochieng - Eldoret City</div>
                  <div className="text-xs mt-1">
                    <button className="text-primary hover:underline">Review details →</button>
                  </div>
                </div>
                
                <button className="w-full text-primary text-sm hover:underline">
                  View all 12 issues →
                </button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-green-200 bg-green-50">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg">Ready to Approve</CardTitle>
                <Badge variant="default" className="bg-green-100 text-green-800">23</Badge>
              </div>
              <CardDescription>
                Clean registrations ready for bulk approval
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="p-3 bg-white rounded border">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-medium text-green-700">8 Players</div>
                      <div className="text-xs text-muted-foreground">Mombasa FC batch</div>
                    </div>
                    <button className="bg-green-600 text-white px-3 py-1 rounded text-xs">
                      Approve All
                    </button>
                  </div>
                </div>
                
                <div className="p-3 bg-white rounded border">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-medium text-green-700">15 Players</div>
                      <div className="text-xs text-muted-foreground">Various teams - Youth League</div>
                    </div>
                    <button className="bg-green-600 text-white px-3 py-1 rounded text-xs">
                      Approve All
                    </button>
                  </div>
                </div>
                
                <button className="w-full bg-green-600 text-white py-2 rounded text-sm font-medium">
                  Bulk Approve All 23
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Recent Activity */}
      <section>
        <h2 className="text-2xl font-bold mb-6">Recent Registration Activity</h2>
        
        <Card>
          <CardContent className="p-0">
            <div className="space-y-0">
              {[
                {
                  time: "5 minutes ago",
                  registrar: "Admin User",
                  action: "Approved batch of 8 players",
                  details: "Mombasa FC - Governor's Cup",
                  type: "approval"
                },
                {
                  time: "15 minutes ago",
                  registrar: "Mary Njeri",
                  action: "Requested additional documents",
                  details: "Peter Mwangi - Missing guardian consent",
                  type: "request"
                },
                {
                  time: "32 minutes ago",
                  registrar: "John Kamau",
                  action: "Rejected registration",
                  details: "Age verification failed - David Kimani",
                  type: "rejection"
                },
                {
                  time: "1 hour ago",
                  registrar: "System",
                  action: "Auto-flagged duplicate",
                  details: "Potential duplicate identity detected",
                  type: "flag"
                },
                {
                  time: "2 hours ago",
                  registrar: "Admin User",
                  action: "Bulk import completed",
                  details: "47 players imported via CSV - Youth Championship",
                  type: "import"
                }
              ].map((activity, index) => (
                <div key={index} className="flex items-center justify-between p-4 border-b last:border-b-0">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${
                      activity.type === 'approval' ? 'bg-green-500' :
                      activity.type === 'request' ? 'bg-orange-500' :
                      activity.type === 'rejection' ? 'bg-red-500' :
                      activity.type === 'flag' ? 'bg-yellow-500' :
                      'bg-blue-500'
                    }`}></div>
                    <div>
                      <div className="font-medium">{activity.action}</div>
                      <div className="text-sm text-muted-foreground">
                        {activity.details} • by {activity.registrar}
                      </div>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground">{activity.time}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}