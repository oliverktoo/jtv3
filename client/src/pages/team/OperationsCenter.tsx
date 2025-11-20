import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface Operation {
  id: string;
  type: 'Match Day' | 'Training' | 'Travel' | 'Medical' | 'Administrative';
  title: string;
  date: string;
  time: string;
  location: string;
  status: 'Scheduled' | 'In Progress' | 'Completed' | 'Cancelled';
  priority: 'High' | 'Medium' | 'Low';
  assignee: string;
  checklist: ChecklistItem[];
}

interface ChecklistItem {
  id: string;
  task: string;
  completed: boolean;
  assignee: string;
  deadline?: string;
}

interface Resource {
  id: string;
  name: string;
  type: 'Equipment' | 'Venue' | 'Transport' | 'Personnel';
  availability: 'Available' | 'In Use' | 'Maintenance' | 'Reserved';
  location: string;
  nextAvailable?: string;
}

export default function OperationsCenter() {
  const operations: Operation[] = [
    {
      id: '1',
      type: 'Match Day',
      title: 'Nairobi FC vs Machakos United',
      date: '2024-11-22',
      time: '15:00',
      location: 'Kasarani Stadium',
      status: 'Scheduled',
      priority: 'High',
      assignee: 'Grace Mutindi',
      checklist: [
        { id: '1', task: 'Team bus booking', completed: true, assignee: 'James Mwenda' },
        { id: '2', task: 'Kit preparation', completed: true, assignee: 'Equipment Team' },
        { id: '3', task: 'Medical kit ready', completed: false, assignee: 'Mary Wanjiku', deadline: '2024-11-21' },
        { id: '4', task: 'Catering arrangements', completed: false, assignee: 'Admin Team', deadline: '2024-11-21' }
      ]
    },
    {
      id: '2',
      type: 'Training',
      title: 'Morning Training Session',
      date: '2024-11-16',
      time: '10:00',
      location: 'Training Ground A',
      status: 'In Progress',
      priority: 'Medium',
      assignee: 'John Kamau',
      checklist: [
        { id: '5', task: 'Pitch preparation', completed: true, assignee: 'Grounds Team' },
        { id: '6', task: 'Equipment setup', completed: true, assignee: 'James Mwenda' },
        { id: '7', task: 'Player attendance check', completed: false, assignee: 'Peter Njoroge' }
      ]
    }
  ];

  const resources: Resource[] = [
    { id: '1', name: 'Team Bus #1', type: 'Transport', availability: 'Reserved', location: 'Main Parking', nextAvailable: '2024-11-23' },
    { id: '2', name: 'Training Ground A', type: 'Venue', availability: 'In Use', location: 'Training Complex' },
    { id: '3', name: 'Medical Kit Set', type: 'Equipment', availability: 'Available', location: 'Medical Room' },
    { id: '4', name: 'Match Day Kits', type: 'Equipment', availability: 'Available', location: 'Equipment Room' },
    { id: '5', name: 'Team Bus #2', type: 'Transport', availability: 'Maintenance', location: 'Garage', nextAvailable: '2024-11-18' },
    { id: '6', name: 'Physiotherapist', type: 'Personnel', availability: 'Available', location: 'Medical Room' }
  ];

  const getStatusColor = (status: Operation['status']) => {
    switch (status) {
      case 'Scheduled': return 'bg-blue-100 text-blue-800';
      case 'In Progress': return 'bg-yellow-100 text-yellow-800';
      case 'Completed': return 'bg-green-100 text-green-800';
      case 'Cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: Operation['priority']) => {
    switch (priority) {
      case 'High': return 'bg-red-100 text-red-800 border-red-200';
      case 'Medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getResourceAvailabilityColor = (availability: Resource['availability']) => {
    switch (availability) {
      case 'Available': return 'bg-green-100 text-green-800';
      case 'In Use': return 'bg-yellow-100 text-yellow-800';
      case 'Maintenance': return 'bg-red-100 text-red-800';
      case 'Reserved': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Operations Center</h1>
          <p className="text-muted-foreground">Manage daily operations, logistics, and resource allocation</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">📊 Operations Report</Button>
          <Button>➕ New Operation</Button>
        </div>
      </div>

      {/* Operations Overview */}
      <section className="mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="text-xs">Today's Operations</CardDescription>
              <CardTitle className="text-2xl font-bold">8</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-xs text-muted-foreground">3 in progress</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="text-xs">Resources Active</CardDescription>
              <CardTitle className="text-2xl font-bold text-yellow-600">12</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-xs text-muted-foreground">2 in maintenance</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="text-xs">Pending Tasks</CardDescription>
              <CardTitle className="text-2xl font-bold text-orange-600">15</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-xs text-muted-foreground">3 overdue</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="text-xs">Weekly Efficiency</CardDescription>
              <CardTitle className="text-2xl font-bold text-green-600">94%</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-xs text-muted-foreground">+2% vs last week</div>
            </CardContent>
          </Card>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Operations List */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Active Operations</CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">🔍 Filter</Button>
                  <Button variant="outline" size="sm">📅 Calendar</Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Operation Type Filter */}
              <div className="flex gap-2 mb-6 overflow-x-auto">
                {['All', 'Match Day', 'Training', 'Travel', 'Medical', 'Administrative'].map(type => (
                  <button
                    key={type}
                    className={`px-4 py-2 rounded text-sm whitespace-nowrap ${
                      type === 'All' 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>

              {/* Operations Cards */}
              <div className="space-y-4">
                {operations.map(operation => (
                  <div key={operation.id} className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold">{operation.title}</h3>
                        <div className="text-sm text-muted-foreground">
                          {operation.date} at {operation.time} • {operation.location}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          Assigned to: {operation.assignee}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Badge className={getPriorityColor(operation.priority)} variant="secondary">
                          {operation.priority}
                        </Badge>
                        <Badge className={getStatusColor(operation.status)} variant="secondary">
                          {operation.status}
                        </Badge>
                      </div>
                    </div>

                    {/* Operation Checklist */}
                    <div className="bg-gray-50 rounded p-3">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-medium text-sm">Checklist Progress</h4>
                        <div className="text-xs text-muted-foreground">
                          {operation.checklist.filter(item => item.completed).length}/{operation.checklist.length} completed
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        {operation.checklist.slice(0, 3).map(item => (
                          <div key={item.id} className="flex items-center gap-2 text-sm">
                            <div className={`w-4 h-4 rounded border flex items-center justify-center ${
                              item.completed ? 'bg-green-500 border-green-500 text-white' : 'border-gray-300'
                            }`}>
                              {item.completed && '✓'}
                            </div>
                            <span className={item.completed ? 'line-through text-muted-foreground' : ''}>{item.task}</span>
                            <span className="text-xs text-muted-foreground">- {item.assignee}</span>
                            {item.deadline && !item.completed && (
                              <Badge variant="outline" className="text-xs">Due: {item.deadline}</Badge>
                            )}
                          </div>
                        ))}
                        {operation.checklist.length > 3 && (
                          <div className="text-xs text-muted-foreground">
                            +{operation.checklist.length - 3} more tasks...
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex justify-between items-center mt-3">
                      <div className="text-xs text-muted-foreground">
                        Type: {operation.type}
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">✏️ Edit</Button>
                        <Button variant="outline" size="sm">👁️ View</Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Load More */}
              <div className="text-center mt-6">
                <Button variant="outline">Load More Operations</Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Resource Availability */}
          <Card>
            <CardHeader>
              <CardTitle>Resource Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {resources.map(resource => (
                  <div key={resource.id} className="p-3 border rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-semibold text-sm">{resource.name}</h4>
                        <div className="text-xs text-muted-foreground">{resource.type} • {resource.location}</div>
                      </div>
                      <Badge className={getResourceAvailabilityColor(resource.availability)} variant="secondary">
                        {resource.availability}
                      </Badge>
                    </div>
                    {resource.nextAvailable && (
                      <div className="text-xs text-blue-600">
                        Next available: {resource.nextAvailable}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              
              <Button variant="outline" className="w-full mt-4">
                📋 Full Resource List
              </Button>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start">
                🚌 Book Transport
              </Button>
              <Button variant="outline" className="w-full justify-start">
                🏟️ Reserve Venue
              </Button>
              <Button variant="outline" className="w-full justify-start">
                📦 Request Equipment
              </Button>
              <Button variant="outline" className="w-full justify-start">
                🍽️ Arrange Catering
              </Button>
              <Button variant="outline" className="w-full justify-start">
                🏥 Medical Support
              </Button>
            </CardContent>
          </Card>

          {/* Today's Schedule */}
          <Card>
            <CardHeader>
              <CardTitle>Today's Schedule</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="p-3 border-l-4 border-blue-500 bg-blue-50">
                  <div className="font-medium text-sm">10:00 - Training Session</div>
                  <div className="text-xs text-muted-foreground">Training Ground A</div>
                </div>
                <div className="p-3 border-l-4 border-green-500 bg-green-50">
                  <div className="font-medium text-sm">14:00 - Team Meeting</div>
                  <div className="text-xs text-muted-foreground">Conference Room</div>
                </div>
                <div className="p-3 border-l-4 border-orange-500 bg-orange-50">
                  <div className="font-medium text-sm">16:00 - Equipment Check</div>
                  <div className="text-xs text-muted-foreground">Equipment Room</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Operations Alerts */}
          <Card>
            <CardHeader>
              <CardTitle>Operations Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="p-3 bg-red-50 border border-red-200 rounded">
                  <div className="font-medium text-sm text-red-800">🚨 Urgent</div>
                  <div className="text-xs text-red-600">Team Bus #2 in maintenance - backup needed</div>
                </div>
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
                  <div className="font-medium text-sm text-yellow-800">⚠️ Warning</div>
                  <div className="text-xs text-yellow-600">3 tasks overdue for next match</div>
                </div>
                <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                  <div className="font-medium text-sm text-blue-800">ℹ️ Info</div>
                  <div className="text-xs text-blue-600">Weekly operations review scheduled</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Performance Metrics */}
          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span>Operations Completed:</span>
                  <span className="font-bold">45/48</span>
                </div>
                <div className="flex justify-between">
                  <span>On-Time Performance:</span>
                  <span className="font-bold text-green-600">94%</span>
                </div>
                <div className="flex justify-between">
                  <span>Resource Utilization:</span>
                  <span className="font-bold">87%</span>
                </div>
                <div className="flex justify-between">
                  <span>Cost Efficiency:</span>
                  <span className="font-bold text-green-600">+5%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}