import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface Ticket {
  id: string;
  eventName: string;
  ticketType: string;
  holderName: string;
  seatNumber?: string;
  qrCode: string;
  purchaseDate: string;
  price: number;
  status: 'Valid' | 'Used' | 'Expired' | 'Refunded' | 'Suspicious';
  entryTime?: string;
  gateUsed?: string;
}

interface AccessPoint {
  id: string;
  name: string;
  location: string;
  status: 'Online' | 'Offline' | 'Maintenance';
  scansToday: number;
  lastScan: string;
  capacity: number;
  currentOccupancy: number;
}

interface ScanEvent {
  id: string;
  timestamp: string;
  ticketId: string;
  holderName: string;
  gate: string;
  result: 'Success' | 'Invalid' | 'Already Used' | 'Expired';
  operator: string;
}

interface SecurityAlert {
  id: string;
  type: 'Duplicate Entry' | 'Invalid Ticket' | 'Capacity Exceeded' | 'System Error';
  description: string;
  timestamp: string;
  severity: 'High' | 'Medium' | 'Low';
  resolved: boolean;
}

export default function AccessControl() {
  const recentScans: ScanEvent[] = [
    { id: '1', timestamp: '14:23:45', ticketId: 'TKT-001234', holderName: 'John Kamau', gate: 'Gate A', result: 'Success', operator: 'Security-1' },
    { id: '2', timestamp: '14:23:42', ticketId: 'TKT-001235', holderName: 'Mary Wanjiku', gate: 'Gate B', result: 'Success', operator: 'Security-2' },
    { id: '3', timestamp: '14:23:38', ticketId: 'TKT-001236', holderName: 'Peter Mwangi', gate: 'Gate A', result: 'Invalid', operator: 'Security-1' },
    { id: '4', timestamp: '14:23:35', ticketId: 'TKT-001237', holderName: 'Grace Mutindi', gate: 'Gate C', result: 'Already Used', operator: 'Security-3' },
    { id: '5', timestamp: '14:23:30', ticketId: 'TKT-001238', holderName: 'David Kiprotich', gate: 'Gate B', result: 'Success', operator: 'Security-2' }
  ];

  const accessPoints: AccessPoint[] = [
    { id: '1', name: 'Main Gate A', location: 'North Entrance', status: 'Online', scansToday: 1245, lastScan: '14:23:45', capacity: 5000, currentOccupancy: 3240 },
    { id: '2', name: 'VIP Gate B', location: 'West Entrance', status: 'Online', scansToday: 342, lastScan: '14:23:30', capacity: 1000, currentOccupancy: 780 },
    { id: '3', name: 'Family Gate C', location: 'South Entrance', status: 'Online', scansToday: 856, lastScan: '14:22:18', capacity: 2000, currentOccupancy: 1456 },
    { id: '4', name: 'Student Gate D', location: 'East Entrance', status: 'Offline', scansToday: 0, lastScan: '13:45:00', capacity: 1500, currentOccupancy: 0 },
  ];

  const securityAlerts: SecurityAlert[] = [
    { id: '1', type: 'Duplicate Entry', description: 'Same QR code scanned at multiple gates within 30 seconds', timestamp: '14:20:15', severity: 'High', resolved: false },
    { id: '2', type: 'Invalid Ticket', description: 'Multiple attempts with fake QR codes at Gate A', timestamp: '14:18:32', severity: 'Medium', resolved: true },
    { id: '3', type: 'System Error', description: 'Scanner connectivity issue at Gate D', timestamp: '13:45:00', severity: 'High', resolved: false },
  ];

  const tickets: Ticket[] = [
    { id: '1', eventName: 'Nairobi FC vs Machakos United', ticketType: 'VIP', holderName: 'John Kamau', seatNumber: 'A-15', qrCode: 'QR123456789', purchaseDate: '2024-11-15', price: 1500, status: 'Used', entryTime: '14:23:45', gateUsed: 'Gate A' },
    { id: '2', eventName: 'Nairobi FC vs Machakos United', ticketType: 'General', holderName: 'Mary Wanjiku', qrCode: 'QR123456790', purchaseDate: '2024-11-16', price: 200, status: 'Valid' },
    { id: '3', eventName: 'Youth Tournament', ticketType: 'Family', holderName: 'Peter Mwangi', qrCode: 'QR123456791', purchaseDate: '2024-11-10', price: 300, status: 'Suspicious' }
  ];

  const getStatusColor = (status: Ticket['status']) => {
    switch (status) {
      case 'Valid': return 'bg-green-100 text-green-800';
      case 'Used': return 'bg-blue-100 text-blue-800';
      case 'Expired': return 'bg-gray-100 text-gray-800';
      case 'Refunded': return 'bg-yellow-100 text-yellow-800';
      case 'Suspicious': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getAccessPointStatusColor = (status: AccessPoint['status']) => {
    switch (status) {
      case 'Online': return 'bg-green-100 text-green-800';
      case 'Offline': return 'bg-red-100 text-red-800';
      case 'Maintenance': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getScanResultColor = (result: ScanEvent['result']) => {
    switch (result) {
      case 'Success': return 'bg-green-100 text-green-800';
      case 'Invalid': return 'bg-red-100 text-red-800';
      case 'Already Used': return 'bg-orange-100 text-orange-800';
      case 'Expired': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getAlertSeverityColor = (severity: SecurityAlert['severity']) => {
    switch (severity) {
      case 'High': return 'bg-red-100 text-red-800 border-red-200';
      case 'Medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Access Control Center</h1>
          <p className="text-muted-foreground">Real-time ticket scanning, QR validation, and venue access management</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">📊 Security Report</Button>
          <Button variant="outline">📱 Mobile Scanner</Button>
          <Button>🚨 Emergency Override</Button>
        </div>
      </div>

      {/* Real-time Overview */}
      <section className="mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="text-xs">Total Entries Today</CardDescription>
              <CardTitle className="text-2xl font-bold text-green-600">2,443</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-xs text-muted-foreground">+156 in last hour</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="text-xs">Current Occupancy</CardDescription>
              <CardTitle className="text-2xl font-bold text-blue-600">5,476</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-xs text-muted-foreground">65% capacity</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="text-xs">Invalid Attempts</CardDescription>
              <CardTitle className="text-2xl font-bold text-orange-600">23</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-xs text-muted-foreground">0.9% of total scans</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="text-xs">Active Scanners</CardDescription>
              <CardTitle className="text-2xl font-bold text-purple-600">3/4</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-xs text-muted-foreground">1 offline</div>
            </CardContent>
          </Card>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Control Panel */}
        <div className="lg:col-span-2 space-y-6">
          {/* QR Code Scanner Interface */}
          <Card>
            <CardHeader>
              <CardTitle>QR Code Scanner</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Scanner Display */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <div className="w-32 h-32 mx-auto mb-4 bg-gray-100 rounded-lg flex items-center justify-center">
                    <div className="text-gray-400 text-4xl">📷</div>
                  </div>
                  <div className="text-lg font-semibold mb-2">Ready to Scan</div>
                  <div className="text-sm text-muted-foreground mb-4">
                    Position QR code within the scanner frame
                  </div>
                  <Button className="w-full">📱 Activate Scanner</Button>
                </div>

                {/* Manual Entry */}
                <div className="space-y-4">
                  <h3 className="font-semibold">Manual Ticket Verification</h3>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Ticket ID / QR Code</label>
                    <input 
                      type="text" 
                      placeholder="Enter ticket number or scan QR"
                      className="w-full p-2 border rounded text-sm"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Access Point</label>
                    <select className="w-full p-2 border rounded text-sm">
                      <option value="">Select Gate</option>
                      <option value="gate-a">Main Gate A</option>
                      <option value="gate-b">VIP Gate B</option>
                      <option value="gate-c">Family Gate C</option>
                    </select>
                  </div>
                  
                  <Button variant="outline" className="w-full">🔍 Verify Ticket</Button>
                  
                  <div className="p-3 bg-green-50 border border-green-200 rounded">
                    <div className="font-semibold text-green-800">✅ Last Scan Result</div>
                    <div className="text-sm text-green-700">Valid ticket - Access granted</div>
                    <div className="text-xs text-green-600">John Kamau • VIP Section A-15</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Access Points Status */}
          <Card>
            <CardHeader>
              <CardTitle>Access Points Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {accessPoints.map(point => (
                  <div key={point.id} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-semibold">{point.name}</h4>
                        <div className="text-sm text-muted-foreground">{point.location}</div>
                      </div>
                      <Badge className={getAccessPointStatusColor(point.status)} variant="secondary">
                        {point.status}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                      <div>
                        <div className="text-xs text-muted-foreground">Scans Today</div>
                        <div className="font-bold">{point.scansToday.toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">Last Scan</div>
                        <div className="font-bold">{point.lastScan}</div>
                      </div>
                    </div>

                    {/* Occupancy Bar */}
                    <div className="mb-3">
                      <div className="flex justify-between text-xs text-muted-foreground mb-1">
                        <span>Occupancy</span>
                        <span>{point.currentOccupancy}/{point.capacity}</span>
                      </div>
                      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${
                            (point.currentOccupancy / point.capacity) > 0.8 
                              ? 'bg-red-500' 
                              : (point.currentOccupancy / point.capacity) > 0.6 
                              ? 'bg-yellow-500' 
                              : 'bg-green-500'
                          }`}
                          style={{width: `${(point.currentOccupancy / point.capacity) * 100}%`}}
                        ></div>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {Math.round((point.currentOccupancy / point.capacity) * 100)}% capacity
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        {point.status === 'Online' ? '🔄' : '🔧'} 
                        {point.status === 'Online' ? 'Reset' : 'Fix'}
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1">📊 Stats</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Scan Activity */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Recent Scan Activity</CardTitle>
                <Button variant="outline" size="sm">🔄 Auto-refresh: ON</Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentScans.map(scan => (
                  <div key={scan.id} className="flex items-center justify-between p-3 border rounded">
                    <div className="flex items-center gap-3">
                      <div className="text-sm font-mono">{scan.timestamp}</div>
                      <div>
                        <div className="font-semibold text-sm">{scan.holderName}</div>
                        <div className="text-xs text-muted-foreground">
                          {scan.ticketId} • {scan.gate} • {scan.operator}
                        </div>
                      </div>
                    </div>
                    
                    <Badge className={getScanResultColor(scan.result)} variant="secondary">
                      {scan.result}
                    </Badge>
                  </div>
                ))}
              </div>
              
              <div className="text-center mt-4">
                <Button variant="outline">📋 View Full Log</Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Security Alerts */}
          <Card>
            <CardHeader>
              <CardTitle>Security Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {securityAlerts.map(alert => (
                  <div key={alert.id} className={`p-3 border rounded ${getAlertSeverityColor(alert.severity)}`}>
                    <div className="flex justify-between items-start mb-2">
                      <div className="font-semibold text-sm">{alert.type}</div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {alert.severity}
                        </Badge>
                        {alert.resolved && (
                          <Badge className="bg-green-100 text-green-800" variant="secondary">
                            ✓
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="text-sm mb-2">{alert.description}</div>
                    <div className="text-xs text-muted-foreground">{alert.timestamp}</div>
                    
                    {!alert.resolved && (
                      <div className="flex gap-2 mt-2">
                        <Button variant="outline" size="sm">🔧 Resolve</Button>
                        <Button variant="outline" size="sm">👁️ Details</Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              
              {securityAlerts.filter(alert => !alert.resolved).length === 0 && (
                <div className="text-center py-4 text-green-600">
                  ✅ No active security alerts
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Security Controls</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start">
                🚨 Emergency Lockdown
              </Button>
              <Button variant="outline" className="w-full justify-start">
                📱 Deploy Mobile Units
              </Button>
              <Button variant="outline" className="w-full justify-start">
                🔧 System Diagnostics
              </Button>
              <Button variant="outline" className="w-full justify-start">
                📊 Generate Report
              </Button>
              <Button variant="outline" className="w-full justify-start">
                ⚙️ Scanner Settings
              </Button>
            </CardContent>
          </Card>

          {/* Ticket Validation */}
          <Card>
            <CardHeader>
              <CardTitle>Ticket Lookup</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <input 
                  type="text" 
                  placeholder="Enter ticket ID or holder name"
                  className="w-full p-2 border rounded text-sm"
                />
                <Button variant="outline" className="w-full">🔍 Search Tickets</Button>
                
                <div className="border-t pt-3">
                  <div className="text-sm font-semibold mb-2">Recent Lookups:</div>
                  <div className="space-y-2">
                    {tickets.slice(0, 3).map(ticket => (
                      <div key={ticket.id} className="p-2 border rounded text-xs">
                        <div className="font-medium">{ticket.holderName}</div>
                        <div className="text-muted-foreground">{ticket.ticketType} • {ticket.qrCode}</div>
                        <Badge className={getStatusColor(ticket.status)} variant="secondary">
                          {ticket.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* System Status */}
          <Card>
            <CardHeader>
              <CardTitle>System Health</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span>Scanner Network:</span>
                  <span className="font-bold text-green-600">✅ Online</span>
                </div>
                <div className="flex justify-between">
                  <span>Database Sync:</span>
                  <span className="font-bold text-green-600">✅ Active</span>
                </div>
                <div className="flex justify-between">
                  <span>QR Validation:</span>
                  <span className="font-bold text-green-600">✅ Working</span>
                </div>
                <div className="flex justify-between">
                  <span>Backup Systems:</span>
                  <span className="font-bold text-green-600">✅ Ready</span>
                </div>
                <div className="flex justify-between">
                  <span>Last Backup:</span>
                  <span className="font-bold">2 hours ago</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Daily Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Today's Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span>Valid Entries:</span>
                  <span className="font-bold text-green-600">2,420</span>
                </div>
                <div className="flex justify-between">
                  <span>Invalid Attempts:</span>
                  <span className="font-bold text-red-600">23</span>
                </div>
                <div className="flex justify-between">
                  <span>Peak Hour:</span>
                  <span className="font-bold">2:00-3:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span>Success Rate:</span>
                  <span className="font-bold text-green-600">99.1%</span>
                </div>
                <div className="flex justify-between">
                  <span>Avg Scan Time:</span>
                  <span className="font-bold">1.2 seconds</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}