import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface Player {
  id: string;
  name: string;
  position: string;
  age: number;
  jersey: number;
  status: 'Available' | 'Injured' | 'Suspended' | 'International Duty';
  contract: string;
  value: string;
}

interface Staff {
  id: string;
  name: string;
  role: string;
  department: string;
  experience: string;
  license: string;
}

export default function RosterManagement() {
  const players: Player[] = [
    { id: '1', name: 'James Wanjiku', position: 'GK', age: 25, jersey: 1, status: 'Available', contract: '2026', value: '2.5M' },
    { id: '2', name: 'Michael Otieno', position: 'CB', age: 28, jersey: 4, status: 'Available', contract: '2025', value: '3.2M' },
    { id: '3', name: 'David Kimani', position: 'CM', age: 24, jersey: 8, status: 'Injured', contract: '2027', value: '4.1M' },
    { id: '4', name: 'Paul Mwangi', position: 'RB', age: 26, jersey: 2, status: 'Injured', contract: '2025', value: '2.8M' },
    { id: '5', name: 'Samuel Ochieng', position: 'ST', age: 22, jersey: 9, status: 'Available', contract: '2028', value: '5.5M' },
    { id: '6', name: 'Eric Mutua', position: 'LW', age: 23, jersey: 11, status: 'Available', contract: '2026', value: '3.8M' },
  ];

  const staff: Staff[] = [
    { id: '1', name: 'John Kamau', role: 'Head Coach', department: 'Technical', experience: '15 years', license: 'CAF A' },
    { id: '2', name: 'Peter Njoroge', role: 'Assistant Coach', department: 'Technical', experience: '8 years', license: 'CAF B' },
    { id: '3', name: 'Mary Wanjiku', role: 'Physiotherapist', department: 'Medical', experience: '10 years', license: 'Licensed' },
    { id: '4', name: 'Grace Mutindi', role: 'Team Manager', department: 'Administration', experience: '12 years', license: 'FKF Certified' },
  ];

  const getStatusColor = (status: Player['status']) => {
    switch (status) {
      case 'Available': return 'bg-green-100 text-green-800';
      case 'Injured': return 'bg-red-100 text-red-800';
      case 'Suspended': return 'bg-orange-100 text-orange-800';
      case 'International Duty': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Squad Management</h1>
          <p className="text-muted-foreground">Manage players, staff, and team composition</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">📊 Squad Report</Button>
          <Button>➕ Add Player</Button>
        </div>
      </div>

      {/* Squad Summary */}
      <section className="mb-8">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="text-xs">Total Squad</CardDescription>
              <CardTitle className="text-2xl font-bold">28</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="text-xs">Available</CardDescription>
              <CardTitle className="text-2xl font-bold text-green-600">26</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="text-xs">Injured</CardDescription>
              <CardTitle className="text-2xl font-bold text-red-600">2</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="text-xs">Suspended</CardDescription>
              <CardTitle className="text-2xl font-bold text-orange-600">0</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="text-xs">Avg Age</CardDescription>
              <CardTitle className="text-2xl font-bold">24.6</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="text-xs">Squad Value</CardDescription>
              <CardTitle className="text-2xl font-bold">85M</CardTitle>
            </CardHeader>
          </Card>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Player Roster */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Player Roster</CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">🔍 Filter</Button>
                  <Button variant="outline" size="sm">📄 Export</Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Position Filter Tabs */}
              <div className="flex gap-2 mb-6 overflow-x-auto">
                {['All', 'GK', 'DEF', 'MID', 'FWD'].map(pos => (
                  <button
                    key={pos}
                    className={`px-4 py-2 rounded text-sm whitespace-nowrap ${
                      pos === 'All' 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {pos}
                  </button>
                ))}
              </div>

              {/* Players List */}
              <div className="space-y-3">
                {players.map(player => (
                  <div key={player.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-lg">
                        {player.jersey}
                      </div>
                      <div>
                        <h3 className="font-semibold">{player.name}</h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>{player.position}</span>
                          <span>•</span>
                          <span>{player.age} years</span>
                          <span>•</span>
                          <span>Contract: {player.contract}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="font-semibold text-sm">{player.value}</div>
                        <Badge className={getStatusColor(player.status)} variant="secondary">
                          {player.status}
                        </Badge>
                      </div>
                      <button className="p-2 hover:bg-gray-200 rounded">⋮</button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Load More */}
              <div className="text-center mt-6">
                <Button variant="outline">Load More Players (22 remaining)</Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Position Analysis */}
          <Card>
            <CardHeader>
              <CardTitle>Position Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Goalkeepers</span>
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div className="w-full h-full bg-green-500"></div>
                    </div>
                    <span className="text-xs font-medium">3/3</span>
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm">Defenders</span>
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div className="w-4/5 h-full bg-yellow-500"></div>
                    </div>
                    <span className="text-xs font-medium">8/10</span>
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm">Midfielders</span>
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div className="w-5/6 h-full bg-blue-500"></div>
                    </div>
                    <span className="text-xs font-medium">10/12</span>
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm">Forwards</span>
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div className="w-3/4 h-full bg-red-500"></div>
                    </div>
                    <span className="text-xs font-medium">6/8</span>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                <div className="text-sm font-medium text-yellow-800">⚠️ Position Alert</div>
                <div className="text-xs text-yellow-700">Consider signing 2 more defenders for depth</div>
              </div>
            </CardContent>
          </Card>

          {/* Technical Staff */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Technical Staff</CardTitle>
                <Button variant="outline" size="sm">➕ Add Staff</Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {staff.map(member => (
                  <div key={member.id} className="p-3 border rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold text-sm">{member.name}</h4>
                        <div className="text-xs text-muted-foreground">{member.role}</div>
                        <div className="text-xs text-blue-600">{member.license}</div>
                      </div>
                      <div className="text-right text-xs text-muted-foreground">
                        {member.experience}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start">
                📝 Update Player Info
              </Button>
              <Button variant="outline" className="w-full justify-start">
                🔄 Transfer Player
              </Button>
              <Button variant="outline" className="w-full justify-start">
                🏥 Medical Update
              </Button>
              <Button variant="outline" className="w-full justify-start">
                📋 Contract Renewal
              </Button>
              <Button variant="outline" className="w-full justify-start">
                💰 Salary Management
              </Button>
            </CardContent>
          </Card>

          {/* Contract Alerts */}
          <Card>
            <CardHeader>
              <CardTitle>Contract Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="p-3 bg-red-50 border border-red-200 rounded">
                  <div className="font-medium text-sm text-red-800">Expires in 6 months</div>
                  <div className="text-xs text-red-600">Michael Otieno, Paul Mwangi</div>
                </div>
                <div className="p-3 bg-orange-50 border border-orange-200 rounded">
                  <div className="font-medium text-sm text-orange-800">Renewal Due</div>
                  <div className="text-xs text-orange-600">Contract discussions needed</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}