import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function CompetitionManagement() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-4">Competition Management</h1>
          <p className="text-muted-foreground">
            Advanced tournament configuration and management tools
          </p>
        </div>
        <button className="bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium">
          Create Competition
        </button>
      </div>

      {/* Quick Stats */}
      <section className="mb-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription className="text-xs">Active Competitions</CardDescription>
              <CardTitle className="text-2xl font-bold text-blue-600">12</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription className="text-xs">Pending Approval</CardDescription>
              <CardTitle className="text-2xl font-bold text-orange-600">5</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription className="text-xs">Completed</CardDescription>
              <CardTitle className="text-2xl font-bold text-green-600">28</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription className="text-xs">Total Participants</CardDescription>
              <CardTitle className="text-2xl font-bold text-purple-600">2,847</CardTitle>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* Competition List */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6">All Competitions</h2>
        
        <div className="space-y-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-semibold">Governor's Cup 2025</h3>
                    <Badge variant="default" className="bg-green-100 text-green-800">LIVE</Badge>
                    <Badge variant="outline">County Level</Badge>
                  </div>
                  <p className="text-muted-foreground mb-4">
                    Premier county championship featuring top teams from across the region
                  </p>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Format:</span>
                      <div className="font-medium">League + Knockout</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Teams:</span>
                      <div className="font-medium">16 registered</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Matches:</span>
                      <div className="font-medium">45 scheduled</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Progress:</span>
                      <div className="font-medium">Semi-finals</div>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-2 ml-4">
                  <button className="bg-primary text-primary-foreground px-4 py-2 rounded text-sm">
                    Manage
                  </button>
                  <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded text-sm">
                    View Details
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-semibold">Women's Premier League</h3>
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">ACTIVE</Badge>
                    <Badge variant="outline">National Level</Badge>
                  </div>
                  <p className="text-muted-foreground mb-4">
                    National women's football league with teams from major counties
                  </p>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Format:</span>
                      <div className="font-medium">League</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Teams:</span>
                      <div className="font-medium">12 registered</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Matches:</span>
                      <div className="font-medium">66 scheduled</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Progress:</span>
                      <div className="font-medium">Round 8 of 11</div>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-2 ml-4">
                  <button className="bg-primary text-primary-foreground px-4 py-2 rounded text-sm">
                    Manage
                  </button>
                  <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded text-sm">
                    View Details
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-semibold">Youth Championship U-17</h3>
                    <Badge variant="outline" className="border-orange-200 text-orange-600">UPCOMING</Badge>
                    <Badge variant="outline">National Level</Badge>
                  </div>
                  <p className="text-muted-foreground mb-4">
                    Annual under-17 championship for youth development
                  </p>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Format:</span>
                      <div className="font-medium">Knockout</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Teams:</span>
                      <div className="font-medium">32 expected</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Registration:</span>
                      <div className="font-medium">Opens Dec 1</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Start Date:</span>
                      <div className="font-medium">Dec 15, 2025</div>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-2 ml-4">
                  <button className="bg-primary text-primary-foreground px-4 py-2 rounded text-sm">
                    Configure
                  </button>
                  <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded text-sm">
                    View Details
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Competition Templates */}
      <section>
        <h2 className="text-2xl font-bold mb-6">Competition Templates</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="border-2 border-dashed border-gray-300 hover:border-primary transition-colors cursor-pointer">
            <CardContent className="p-6 text-center">
              <div className="text-4xl mb-4">🏆</div>
              <h3 className="font-semibold mb-2">League Tournament</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Round-robin format with home/away fixtures
              </p>
              <button className="w-full bg-primary text-primary-foreground py-2 rounded">
                Use Template
              </button>
            </CardContent>
          </Card>

          <Card className="border-2 border-dashed border-gray-300 hover:border-primary transition-colors cursor-pointer">
            <CardContent className="p-6 text-center">
              <div className="text-4xl mb-4">⚽</div>
              <h3 className="font-semibold mb-2">Knockout Cup</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Single elimination tournament format
              </p>
              <button className="w-full bg-primary text-primary-foreground py-2 rounded">
                Use Template
              </button>
            </CardContent>
          </Card>

          <Card className="border-2 border-dashed border-gray-300 hover:border-primary transition-colors cursor-pointer">
            <CardContent className="p-6 text-center">
              <div className="text-4xl mb-4">🥇</div>
              <h3 className="font-semibold mb-2">Hybrid Format</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Group stage followed by knockout rounds
              </p>
              <button className="w-full bg-primary text-primary-foreground py-2 rounded">
                Use Template
              </button>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}