import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface SalesData {
  id: string;
  period: string;
  revenue: number;
  ticketsSold: number;
  events: number;
  avgTicketPrice: number;
  conversionRate: number;
  refunds: number;
}

interface TopSellingEvent {
  id: string;
  name: string;
  date: string;
  revenue: number;
  ticketsSold: number;
  capacity: number;
  soldOutTime?: string;
}

interface SalesChannel {
  id: string;
  name: string;
  revenue: number;
  percentage: number;
  ticketsSold: number;
  commission: number;
}

interface PaymentMethod {
  id: string;
  method: string;
  revenue: number;
  transactions: number;
  percentage: number;
  avgValue: number;
}

export default function SalesDashboard() {
  const salesData: SalesData[] = [
    { id: '1', period: 'Today', revenue: 1250000, ticketsSold: 856, events: 2, avgTicketPrice: 1460, conversionRate: 68, refunds: 12 },
    { id: '2', period: 'This Week', revenue: 8750000, ticketsSold: 5234, events: 8, avgTicketPrice: 1672, conversionRate: 71, refunds: 45 },
    { id: '3', period: 'This Month', revenue: 28500000, ticketsSold: 18750, events: 24, avgTicketPrice: 1520, conversionRate: 65, refunds: 189 },
    { id: '4', period: 'This Year', revenue: 185500000, ticketsSold: 128450, events: 156, avgTicketPrice: 1444, conversionRate: 69, refunds: 1256 }
  ];

  const topEvents: TopSellingEvent[] = [
    { id: '1', name: 'Nairobi FC vs Machakos United - Final', date: '2024-11-22', revenue: 14250000, ticketsSold: 28500, capacity: 60000, soldOutTime: '48 hours' },
    { id: '2', name: 'Kenya Premier League - Derby Match', date: '2024-11-08', revenue: 8900000, ticketsSold: 22400, capacity: 45000, soldOutTime: '72 hours' },
    { id: '3', name: 'Youth Championship Final', date: '2024-10-25', revenue: 2100000, ticketsSold: 8500, capacity: 15000 },
    { id: '4', name: 'Community Cup Semi-Final', date: '2024-10-18', revenue: 1850000, ticketsSold: 7200, capacity: 12000 }
  ];

  const salesChannels: SalesChannel[] = [
    { id: '1', name: 'Online Portal', revenue: 18500000, percentage: 65, ticketsSold: 12250, commission: 925000 },
    { id: '2', name: 'Mobile App', revenue: 7125000, percentage: 25, ticketsSold: 4688, commission: 356250 },
    { id: '3', name: 'Stadium Box Office', revenue: 2850000, percentage: 10, ticketsSold: 1875, commission: 0 },
  ];

  const paymentMethods: PaymentMethod[] = [
    { id: '1', method: 'M-Pesa', revenue: 15800000, transactions: 9450, percentage: 55, avgValue: 1672 },
    { id: '2', method: 'Card Payment', revenue: 8900000, transactions: 4250, percentage: 31, avgValue: 2094 },
    { id: '3', method: 'Bank Transfer', revenue: 3200000, transactions: 890, percentage: 11, avgValue: 3595 },
    { id: '4', method: 'Cash', revenue: 850000, percentage: 3, transactions: 623, avgValue: 1364 }
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getChannelColor = (index: number) => {
    const colors = ['bg-blue-100 text-blue-800', 'bg-green-100 text-green-800', 'bg-purple-100 text-purple-800'];
    return colors[index % colors.length];
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Sales Dashboard</h1>
          <p className="text-muted-foreground">Real-time ticket sales analytics and performance metrics</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">📊 Export Report</Button>
          <Button variant="outline">📈 Advanced Analytics</Button>
          <Button>🔄 Refresh Data</Button>
        </div>
      </div>

      {/* Sales Overview Cards */}
      <section className="mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {salesData.map(data => (
            <Card key={data.id}>
              <CardHeader className="pb-2">
                <CardDescription className="text-xs">{data.period}</CardDescription>
                <CardTitle className="text-2xl font-bold text-green-600">
                  {formatCurrency(data.revenue)}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-1">
                <div className="text-xs text-muted-foreground">
                  {data.ticketsSold.toLocaleString()} tickets • {data.events} events
                </div>
                <div className="text-xs text-muted-foreground">
                  Avg: {formatCurrency(data.avgTicketPrice)} • Conv: {data.conversionRate}%
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Dashboard */}
        <div className="lg:col-span-2 space-y-6">
          {/* Top Selling Events */}
          <Card>
            <CardHeader>
              <CardTitle>Top Selling Events</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topEvents.map((event, index) => (
                  <div key={event.id} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-sm">
                          {index + 1}
                        </div>
                        <div>
                          <h4 className="font-semibold">{event.name}</h4>
                          <div className="text-sm text-muted-foreground">📅 {event.date}</div>
                        </div>
                      </div>
                      
                      {event.soldOutTime && (
                        <Badge className="bg-orange-100 text-orange-800" variant="secondary">
                          Sold Out
                        </Badge>
                      )}
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <div className="text-xs text-muted-foreground">Revenue</div>
                        <div className="font-bold text-green-600">{formatCurrency(event.revenue)}</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">Tickets Sold</div>
                        <div className="font-bold">{event.ticketsSold.toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">Capacity</div>
                        <div className="font-bold">{event.capacity.toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">Sold %</div>
                        <div className="font-bold text-blue-600">
                          {Math.round((event.ticketsSold / event.capacity) * 100)}%
                        </div>
                      </div>
                    </div>

                    {event.soldOutTime && (
                      <div className="mt-2 text-xs text-orange-600">
                        🔥 Sold out in {event.soldOutTime}
                      </div>
                    )}

                    <div className="mt-3">
                      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-green-500 to-blue-500" 
                          style={{width: `${(event.ticketsSold / event.capacity) * 100}%`}}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Sales by Channel */}
          <Card>
            <CardHeader>
              <CardTitle>Sales Channels Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {salesChannels.map((channel, index) => (
                  <div key={channel.id} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-semibold flex items-center gap-2">
                          {channel.name}
                          <Badge className={getChannelColor(index)} variant="secondary">
                            {channel.percentage}%
                          </Badge>
                        </h4>
                        <div className="text-sm text-muted-foreground">
                          {channel.ticketsSold.toLocaleString()} tickets sold
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-green-600">{formatCurrency(channel.revenue)}</div>
                        <div className="text-xs text-muted-foreground">
                          Commission: {formatCurrency(channel.commission)}
                        </div>
                      </div>
                    </div>
                    
                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-500" 
                        style={{width: `${channel.percentage}%`}}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Payment Methods */}
          <Card>
            <CardHeader>
              <CardTitle>Payment Methods</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {paymentMethods.map(method => (
                  <div key={method.id} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold">{method.method}</h4>
                      <Badge variant="outline">{method.percentage}%</Badge>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Revenue:</span>
                        <span className="font-bold text-green-600">{formatCurrency(method.revenue)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Transactions:</span>
                        <span className="font-bold">{method.transactions.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Avg Value:</span>
                        <span className="font-bold">{formatCurrency(method.avgValue)}</span>
                      </div>
                    </div>

                    <div className="mt-3">
                      <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-purple-500" 
                          style={{width: `${method.percentage}%`}}
                        ></div>
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
          {/* Real-time Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Live Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center p-4 bg-green-50 border border-green-200 rounded">
                  <div className="text-2xl font-bold text-green-600">156</div>
                  <div className="text-sm text-green-700">Tickets sold in last hour</div>
                </div>
                
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span>Active Buyers:</span>
                    <span className="font-bold text-blue-600">42</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Cart Abandonment:</span>
                    <span className="font-bold text-orange-600">15%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Avg Session Time:</span>
                    <span className="font-bold">4m 23s</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Peak Hour:</span>
                    <span className="font-bold">2:00 PM - 4:00 PM</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Revenue Targets */}
          <Card>
            <CardHeader>
              <CardTitle>Revenue Targets</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Monthly Target</span>
                    <span>KSH 30M</span>
                  </div>
                  <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div className="w-4/5 h-full bg-green-500"></div>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    95% complete • KSH 28.5M achieved
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Quarterly Target</span>
                    <span>KSH 85M</span>
                  </div>
                  <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div className="w-3/4 h-full bg-blue-500"></div>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    73% complete • KSH 62M achieved
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Annual Target</span>
                    <span>KSH 200M</span>
                  </div>
                  <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div className="w-5/6 h-full bg-purple-500"></div>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    93% complete • KSH 185.5M achieved
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Top Customers */}
          <Card>
            <CardHeader>
              <CardTitle>Top Customers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { name: 'Corporate Sponsors Ltd', spent: 2450000, tickets: 98 },
                  { name: 'Nairobi Sports Club', spent: 1850000, tickets: 156 },
                  { name: 'University of Nairobi', spent: 980000, tickets: 245 },
                  { name: 'Kenya Football Fans', spent: 750000, tickets: 89 }
                ].map((customer, index) => (
                  <div key={index} className="flex justify-between items-center p-3 border rounded">
                    <div>
                      <div className="font-medium text-sm">{customer.name}</div>
                      <div className="text-xs text-muted-foreground">{customer.tickets} tickets</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-green-600 text-sm">
                        {formatCurrency(customer.spent)}
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
                📊 Generate Report
              </Button>
              <Button variant="outline" className="w-full justify-start">
                💰 Process Refunds
              </Button>
              <Button variant="outline" className="w-full justify-start">
                📧 Send Invoices
              </Button>
              <Button variant="outline" className="w-full justify-start">
                📈 Marketing Analytics
              </Button>
              <Button variant="outline" className="w-full justify-start">
                ⚙️ Sales Settings
              </Button>
            </CardContent>
          </Card>

          {/* Alerts */}
          <Card>
            <CardHeader>
              <CardTitle>Sales Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="p-3 bg-green-50 border border-green-200 rounded">
                  <div className="font-medium text-sm text-green-800">🎉 Target Achieved</div>
                  <div className="text-xs text-green-600">Monthly revenue target reached!</div>
                </div>
                <div className="p-3 bg-orange-50 border border-orange-200 rounded">
                  <div className="font-medium text-sm text-orange-800">⚠️ High Demand</div>
                  <div className="text-xs text-orange-600">Governor's Cup selling fast - 85% sold</div>
                </div>
                <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                  <div className="font-medium text-sm text-blue-800">📊 Report Ready</div>
                  <div className="text-xs text-blue-600">Weekly sales report generated</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}