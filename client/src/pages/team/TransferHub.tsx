import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface Transfer {
  id: string;
  type: 'Incoming' | 'Outgoing' | 'Loan In' | 'Loan Out';
  player: string;
  position: string;
  fromClub?: string;
  toClub?: string;
  fee: string;
  status: 'Negotiating' | 'Medical' | 'Completed' | 'Cancelled' | 'Pending';
  agent: string;
  deadline: string;
  priority: 'High' | 'Medium' | 'Low';
}

interface Scout {
  id: string;
  name: string;
  region: string;
  expertise: string;
  activeTargets: number;
  reportsSubmitted: number;
}

interface Target {
  id: string;
  name: string;
  club: string;
  position: string;
  age: number;
  value: string;
  rating: number;
  status: 'Watching' | 'Interested' | 'Negotiating' | 'Rejected';
  scout: string;
  lastUpdate: string;
}

export default function TransferHub() {
  const transfers: Transfer[] = [
    {
      id: '1',
      type: 'Incoming',
      player: 'Kevin Omondi',
      position: 'CAM',
      fromClub: 'Eldoret City FC',
      fee: '3.5M KSH',
      status: 'Medical',
      agent: 'Sports Pro Agency',
      deadline: '2024-12-01',
      priority: 'High'
    },
    {
      id: '2',
      type: 'Outgoing',
      player: 'Francis Waweru',
      position: 'RB',
      toClub: 'Mombasa FC',
      fee: '2.8M KSH',
      status: 'Negotiating',
      agent: 'Elite Sports',
      deadline: '2024-11-25',
      priority: 'Medium'
    },
    {
      id: '3',
      type: 'Loan In',
      player: 'Anthony Njuguna',
      position: 'ST',
      fromClub: 'Thika United',
      fee: 'Loan Fee: 500K',
      status: 'Completed',
      agent: 'Direct',
      deadline: '2024-11-20',
      priority: 'Low'
    }
  ];

  const scouts: Scout[] = [
    { id: '1', name: 'Patrick Kiprotich', region: 'Rift Valley', expertise: 'Youth Development', activeTargets: 8, reportsSubmitted: 24 },
    { id: '2', name: 'Grace Wambui', region: 'Central Kenya', expertise: 'Senior Players', activeTargets: 5, reportsSubmitted: 18 },
    { id: '3', name: 'Ahmed Hassan', region: 'Coast Region', expertise: 'Technical Players', activeTargets: 12, reportsSubmitted: 31 }
  ];

  const targets: Target[] = [
    { id: '1', name: 'Moses Wanjala', club: 'Kakamega Homeboyz', position: 'CB', age: 23, value: '4.2M', rating: 8.5, status: 'Interested', scout: 'Patrick Kiprotich', lastUpdate: '2 days ago' },
    { id: '2', name: 'Diana Awuor', club: 'Vihiga Queens', position: 'GK', age: 21, value: '2.1M', rating: 7.8, status: 'Watching', scout: 'Grace Wambui', lastUpdate: '1 week ago' },
    { id: '3', name: 'Ibrahim Rashid', club: 'Bandari FC', position: 'LW', age: 19, value: '1.8M', rating: 8.2, status: 'Negotiating', scout: 'Ahmed Hassan', lastUpdate: '3 days ago' }
  ];

  const getTransferStatusColor = (status: Transfer['status']) => {
    switch (status) {
      case 'Negotiating': return 'bg-yellow-100 text-yellow-800';
      case 'Medical': return 'bg-blue-100 text-blue-800';
      case 'Completed': return 'bg-green-100 text-green-800';
      case 'Cancelled': return 'bg-red-100 text-red-800';
      case 'Pending': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTransferTypeColor = (type: Transfer['type']) => {
    switch (type) {
      case 'Incoming': return 'bg-green-100 text-green-800 border-green-200';
      case 'Outgoing': return 'bg-red-100 text-red-800 border-red-200';
      case 'Loan In': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Loan Out': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTargetStatusColor = (status: Target['status']) => {
    switch (status) {
      case 'Watching': return 'bg-blue-100 text-blue-800';
      case 'Interested': return 'bg-yellow-100 text-yellow-800';
      case 'Negotiating': return 'bg-green-100 text-green-800';
      case 'Rejected': return 'bg-red-100 text-red-800';
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
          <h1 className="text-3xl font-bold">Transfer Hub</h1>
          <p className="text-muted-foreground">Manage player transfers, scouting, and recruitment activities</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">📊 Transfer Report</Button>
          <Button>➕ New Transfer</Button>
        </div>
      </div>

      {/* Transfer Window Status */}
      <section className="mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="text-xs">Window Status</CardDescription>
              <CardTitle className="text-2xl font-bold text-green-600">OPEN</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-xs text-muted-foreground">Closes in 45 days</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="text-xs">Active Transfers</CardDescription>
              <CardTitle className="text-2xl font-bold">7</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-xs text-muted-foreground">3 incoming, 2 outgoing, 2 loans</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="text-xs">Scout Targets</CardDescription>
              <CardTitle className="text-2xl font-bold text-blue-600">25</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-xs text-muted-foreground">8 high priority</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="text-xs">Transfer Budget</CardDescription>
              <CardTitle className="text-2xl font-bold text-purple-600">15M</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-xs text-muted-foreground">8.5M remaining</div>
            </CardContent>
          </Card>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Active Transfers */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Active Transfers</CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">🔍 Filter</Button>
                  <Button variant="outline" size="sm">📄 Export</Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {transfers.map(transfer => (
                  <div key={transfer.id} className="p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold">{transfer.player}</h3>
                        <div className="text-sm text-muted-foreground">
                          {transfer.position} • {transfer.type === 'Incoming' ? `from ${transfer.fromClub}` : `to ${transfer.toClub}`}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Agent: {transfer.agent} • Deadline: {transfer.deadline}
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-end gap-2">
                        <Badge className={getTransferTypeColor(transfer.type)} variant="secondary">
                          {transfer.type}
                        </Badge>
                        <Badge className={getTransferStatusColor(transfer.status)} variant="secondary">
                          {transfer.status}
                        </Badge>
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-semibold text-green-600">{transfer.fee}</div>
                        <div className="text-xs text-muted-foreground">Transfer Fee</div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">📋 Details</Button>
                        <Button variant="outline" size="sm">✏️ Update</Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Scout Targets */}
          <Card>
            <CardHeader>
              <CardTitle>Priority Targets</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {targets.map(target => (
                  <div key={target.id} className="p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-semibold">{target.name}</h4>
                        <div className="text-sm text-muted-foreground">
                          {target.position} • {target.club} • Age: {target.age}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Scout: {target.scout} • Updated: {target.lastUpdate}
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="font-semibold">{target.value} KSH</div>
                        <div className={`text-sm ${getRatingColor(target.rating)}`}>
                          Rating: {target.rating}/10
                        </div>
                        <Badge className={getTargetStatusColor(target.status)} variant="secondary">
                          {target.status}
                        </Badge>
                      </div>
                    </div>

                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm">👁️ Scout Report</Button>
                      <Button variant="outline" size="sm">🎯 Make Offer</Button>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="text-center mt-4">
                <Button variant="outline">View All Targets (22 more)</Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Scouting Network */}
          <Card>
            <CardHeader>
              <CardTitle>Scouting Network</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {scouts.map(scout => (
                  <div key={scout.id} className="p-3 border rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold text-sm">{scout.name}</h4>
                        <div className="text-xs text-muted-foreground">{scout.region}</div>
                        <div className="text-xs text-blue-600">{scout.expertise}</div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
                      <div>
                        <span className="text-muted-foreground">Targets: </span>
                        <span className="font-bold">{scout.activeTargets}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Reports: </span>
                        <span className="font-bold">{scout.reportsSubmitted}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <Button variant="outline" className="w-full mt-4">
                👥 Manage Scouts
              </Button>
            </CardContent>
          </Card>

          {/* Transfer Budget */}
          <Card>
            <CardHeader>
              <CardTitle>Transfer Budget</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-2xl font-bold">15.0M KSH</div>
                  <div className="text-sm text-muted-foreground">Total Budget</div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>Spent:</span>
                    <span className="font-bold text-red-600">6.5M</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Committed:</span>
                    <span className="font-bold text-yellow-600">2.0M</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Available:</span>
                    <span className="font-bold text-green-600">6.5M</span>
                  </div>
                </div>
                
                <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500" style={{width: '57%'}}></div>
                </div>
                
                <div className="text-xs text-muted-foreground text-center">
                  57% of budget utilized
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Transfer Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start">
                🎯 Add Target Player
              </Button>
              <Button variant="outline" className="w-full justify-start">
                📝 Submit Scout Report
              </Button>
              <Button variant="outline" className="w-full justify-start">
                💼 Contact Agent
              </Button>
              <Button variant="outline" className="w-full justify-start">
                📊 Market Analysis
              </Button>
              <Button variant="outline" className="w-full justify-start">
                🔄 Loan Deals
              </Button>
            </CardContent>
          </Card>

          {/* Transfer Deadlines */}
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Deadlines</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="p-3 bg-red-50 border border-red-200 rounded">
                  <div className="font-medium text-sm text-red-800">Francis Waweru</div>
                  <div className="text-xs text-red-600">Contract negotiation - Nov 25</div>
                </div>
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
                  <div className="font-medium text-sm text-yellow-800">Kevin Omondi</div>
                  <div className="text-xs text-yellow-600">Medical completion - Dec 1</div>
                </div>
                <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                  <div className="font-medium text-sm text-blue-800">Transfer Window</div>
                  <div className="text-xs text-blue-600">Closes - Dec 31</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="text-sm">
                  <div className="font-medium">New scout report received</div>
                  <div className="text-xs text-muted-foreground">Moses Wanjala - CB assessment</div>
                  <div className="text-xs text-blue-600">2 hours ago</div>
                </div>
                <div className="text-sm">
                  <div className="font-medium">Transfer completed</div>
                  <div className="text-xs text-muted-foreground">Anthony Njuguna - Loan In</div>
                  <div className="text-xs text-green-600">1 day ago</div>
                </div>
                <div className="text-sm">
                  <div className="font-medium">Target status updated</div>
                  <div className="text-xs text-muted-foreground">Ibrahim Rashid - Negotiating</div>
                  <div className="text-xs text-yellow-600">3 days ago</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}