import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface TicketEvent {
  id: string;
  name: string;
  type: 'Match' | 'Tournament' | 'Training' | 'Community Event';
  date: string;
  time: string;
  venue: string;
  capacity: number;
  soldTickets: number;
  revenue: number;
  status: 'Draft' | 'Published' | 'Selling' | 'Sold Out' | 'Past';
  ticketTypes: TicketType[];
}

interface TicketType {
  id: string;
  name: string;
  price: number;
  available: number;
  sold: number;
  description: string;
  perks?: string[];
}

interface SalesMetric {
  id: string;
  metric: string;
  value: string;
  change: string;
  trend: 'up' | 'down' | 'stable';
  period: string;
}

export default function EventManagement() {
  const events: TicketEvent[] = [
    {
      id: '1',
      name: 'Nairobi FC vs Machakos United - Governor\'s Cup Final',
      type: 'Match',
      date: '2024-11-22',
      time: '15:00',
      venue: 'Kasarani Stadium',
      capacity: 60000,
      soldTickets: 28500,
      revenue: 14250000,
      status: 'Selling',
      ticketTypes: [
        { id: '1', name: 'General Admission', price: 200, available: 15000, sold: 8500, description: 'Open terrace seating' },
        { id: '2', name: 'VIP Seating', price: 1500, available: 2000, sold: 1200, description: 'Premium seats with refreshments', perks: ['Reserved seating', 'Complimentary drinks', 'Program booklet'] },
        { id: '3', name: 'Corporate Box', price: 25000, available: 50, sold: 32, description: 'Private boxes for 20 people', perks: ['Private suite', 'Catering included', 'Dedicated service', 'VIP parking'] }
      ]
    },
    {
      id: '2',
      name: 'Youth Tournament - U17 Championship',
      type: 'Tournament',
      date: '2024-12-05',
      time: '09:00',
      venue: 'Nyayo Stadium',
      capacity: 30000,
      soldTickets: 1200,
      revenue: 360000,
      status: 'Published',
      ticketTypes: [
        { id: '4', name: 'Family Pass', price: 300, available: 5000, sold: 400, description: 'Entry for 2 adults + 2 children' },
        { id: '5', name: 'Student Discount', price: 100, available: 3000, sold: 800, description: 'Discounted tickets for students' }
      ]
    },
    {
      id: '3',
      name: 'Community Football Festival',
      type: 'Community Event',
      date: '2024-12-15',
      time: '10:00',
      venue: 'Uhuru Gardens',
      capacity: 5000,
      soldTickets: 0,
      revenue: 0,
      status: 'Draft',
      ticketTypes: [
        { id: '6', name: 'Free Entry', price: 0, available: 5000, sold: 0, description: 'Free community event' }
      ]
    }
  ];

  const salesMetrics: SalesMetric[] = [
    { id: '1', metric: 'Total Revenue', value: 'KSH 15.2M', change: '+12.5%', trend: 'up', period: 'This month' },
    { id: '2', metric: 'Tickets Sold', value: '32,450', change: '+8.3%', trend: 'up', period: 'This month' },
    { id: '3', metric: 'Events Created', value: '8', change: '+2', trend: 'up', period: 'This month' },
    { id: '4', metric: 'Avg Attendance', value: '78%', change: '-2.1%', trend: 'down', period: 'This month' }
  ];

  const getEventStatusColor = (status: TicketEvent['status']) => {
    switch (status) {
      case 'Draft': return 'bg-gray-100 text-gray-800';
      case 'Published': return 'bg-blue-100 text-blue-800';
      case 'Selling': return 'bg-green-100 text-green-800';
      case 'Sold Out': return 'bg-orange-100 text-orange-800';
      case 'Past': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getEventTypeColor = (type: TicketEvent['type']) => {
    switch (type) {
      case 'Match': return 'bg-red-100 text-red-800';
      case 'Tournament': return 'bg-blue-100 text-blue-800';
      case 'Training': return 'bg-green-100 text-green-800';
      case 'Community Event': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTrendColor = (trend: SalesMetric['trend']) => {
    switch (trend) {
      case 'up': return 'text-green-600';
      case 'down': return 'text-red-600';
      case 'stable': return 'text-gray-600';
      default: return 'text-gray-600';
    }
  };

  const getTrendIcon = (trend: SalesMetric['trend']) => {
    switch (trend) {
      case 'up': return '↗️';
      case 'down': return '↘️';
      case 'stable': return '➡️';
      default: return '➡️';
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
          <h1 className="text-3xl font-bold">Event Management</h1>
          <p className="text-muted-foreground">Create and manage ticketed events, matches, and tournaments</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">📊 Sales Report</Button>
          <Button>➕ Create Event</Button>
        </div>
      </div>

      {/* Sales Overview */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Sales Performance</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {salesMetrics.map(metric => (
            <Card key={metric.id}>
              <CardHeader className="pb-2">
                <CardDescription className="text-xs">{metric.metric}</CardDescription>
                <CardTitle className="text-2xl font-bold">{metric.value}</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center gap-1">
                  <span className={getTrendColor(metric.trend)}>
                    {getTrendIcon(metric.trend)}
                  </span>
                  <span className={`text-xs ${getTrendColor(metric.trend)}`}>
                    {metric.change}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {metric.period}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Events List */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Upcoming Events</CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">🔍 Filter</Button>
                  <Button variant="outline" size="sm">📅 Calendar View</Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {events.map(event => (
                  <div key={event.id} className="p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-semibold text-lg">{event.name}</h3>
                        <div className="text-sm text-muted-foreground">
                          📅 {event.date} at {event.time} • 📍 {event.venue}
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-end gap-2">
                        <Badge className={getEventTypeColor(event.type)} variant="secondary">
                          {event.type}
                        </Badge>
                        <Badge className={getEventStatusColor(event.status)} variant="secondary">
                          {event.status}
                        </Badge>
                      </div>
                    </div>

                    {/* Sales Summary */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <div className="text-xs text-muted-foreground">Capacity</div>
                        <div className="font-bold">{event.capacity.toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">Sold</div>
                        <div className="font-bold text-green-600">{event.soldTickets.toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">Revenue</div>
                        <div className="font-bold text-blue-600">{formatCurrency(event.revenue)}</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">Sold %</div>
                        <div className="font-bold">
                          {event.capacity > 0 ? Math.round((event.soldTickets / event.capacity) * 100) : 0}%
                        </div>
                      </div>
                    </div>

                    {/* Ticket Types */}
                    <div className="mb-4">
                      <div className="text-sm font-medium mb-2">Ticket Types:</div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {event.ticketTypes.map(ticketType => (
                          <div key={ticketType.id} className="p-3 bg-gray-50 rounded border">
                            <div className="flex justify-between items-start mb-1">
                              <h4 className="font-semibold text-sm">{ticketType.name}</h4>
                              <span className="font-bold text-green-600">
                                {ticketType.price === 0 ? 'FREE' : formatCurrency(ticketType.price)}
                              </span>
                            </div>
                            <div className="text-xs text-muted-foreground mb-2">{ticketType.description}</div>
                            <div className="flex justify-between text-xs">
                              <span>Sold: {ticketType.sold}/{ticketType.available}</span>
                              <span className="font-medium">
                                {ticketType.available > 0 ? Math.round((ticketType.sold / ticketType.available) * 100) : 0}%
                              </span>
                            </div>
                            {ticketType.available > 0 && (
                              <div className="w-full h-1.5 bg-gray-200 rounded-full mt-1 overflow-hidden">
                                <div 
                                  className="h-full bg-blue-500" 
                                  style={{width: `${(ticketType.sold / ticketType.available) * 100}%`}}
                                ></div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-between items-center">
                      <div className="text-xs text-muted-foreground">
                        Last updated: 2 hours ago
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">📊 Analytics</Button>
                        <Button variant="outline" size="sm">🎫 Manage Tickets</Button>
                        <Button variant="outline" size="sm">✏️ Edit Event</Button>
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
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start">
                🎫 Create New Event
              </Button>
              <Button variant="outline" className="w-full justify-start">
                📋 Duplicate Event
              </Button>
              <Button variant="outline" className="w-full justify-start">
                📊 Sales Dashboard
              </Button>
              <Button variant="outline" className="w-full justify-start">
                🎯 Marketing Tools
              </Button>
              <Button variant="outline" className="w-full justify-start">
                📧 Email Campaigns
              </Button>
            </CardContent>
          </Card>

          {/* Event Templates */}
          <Card>
            <CardHeader>
              <CardTitle>Event Templates</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="p-3 border rounded hover:bg-gray-50 cursor-pointer">
                  <div className="font-medium text-sm">League Match</div>
                  <div className="text-xs text-muted-foreground">Standard home match setup</div>
                </div>
                <div className="p-3 border rounded hover:bg-gray-50 cursor-pointer">
                  <div className="font-medium text-sm">Cup Final</div>
                  <div className="text-xs text-muted-foreground">Premium event with VIP options</div>
                </div>
                <div className="p-3 border rounded hover:bg-gray-50 cursor-pointer">
                  <div className="font-medium text-sm">Youth Tournament</div>
                  <div className="text-xs text-muted-foreground">Family-friendly pricing</div>
                </div>
                <div className="p-3 border rounded hover:bg-gray-50 cursor-pointer">
                  <div className="font-medium text-sm">Community Event</div>
                  <div className="text-xs text-muted-foreground">Free or low-cost event</div>
                </div>
              </div>
              
              <Button variant="outline" className="w-full mt-4">
                📋 Manage Templates
              </Button>
            </CardContent>
          </Card>

          {/* Revenue Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Revenue Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Match Tickets:</span>
                  <span className="font-bold">KSH 12.8M</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>VIP/Corporate:</span>
                  <span className="font-bold">KSH 2.1M</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Tournament Entry:</span>
                  <span className="font-bold">KSH 360K</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Processing Fees:</span>
                  <span className="font-bold text-red-600">-KSH 85K</span>
                </div>
                
                <div className="border-t pt-2">
                  <div className="flex justify-between font-bold">
                    <span>Net Revenue:</span>
                    <span className="text-green-600">KSH 15.2M</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Deadlines */}
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Deadlines</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="p-3 bg-red-50 border border-red-200 rounded">
                  <div className="font-medium text-sm text-red-800">🚨 Ticket Sales Close</div>
                  <div className="text-xs text-red-600">Governor's Cup Final - Nov 21, 6:00 PM</div>
                </div>
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
                  <div className="font-medium text-sm text-yellow-800">📋 Event Setup</div>
                  <div className="text-xs text-yellow-600">Youth Tournament - Dec 4, 12:00 PM</div>
                </div>
                <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                  <div className="font-medium text-sm text-blue-800">📧 Marketing Launch</div>
                  <div className="text-xs text-blue-600">Community Festival - Nov 25, 9:00 AM</div>
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
                  <div className="font-medium">1,250 tickets sold</div>
                  <div className="text-xs text-muted-foreground">Governor's Cup Final VIP section</div>
                  <div className="text-xs text-green-600">2 hours ago</div>
                </div>
                <div className="text-sm">
                  <div className="font-medium">New event created</div>
                  <div className="text-xs text-muted-foreground">Community Football Festival</div>
                  <div className="text-xs text-blue-600">1 day ago</div>
                </div>
                <div className="text-sm">
                  <div className="font-medium">Price updated</div>
                  <div className="text-xs text-muted-foreground">Youth Tournament student tickets</div>
                  <div className="text-xs text-orange-600">3 days ago</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}