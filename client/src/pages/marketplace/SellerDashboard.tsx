import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

interface SellerProfile {
  id: string;
  businessName: string;
  displayName: string;
  type: 'Team' | 'Business' | 'Individual' | 'Official Partner';
  description: string;
  logo?: string;
  coverImage?: string;
  contact: {
    email: string;
    phone: string;
    address: string;
    website?: string;
  };
  verification: {
    status: 'Verified' | 'Pending' | 'Rejected' | 'Not Submitted';
    documents: string[];
    verifiedDate?: string;
    badgeLevel: 'Bronze' | 'Silver' | 'Gold' | 'Platinum';
  };
  metrics: {
    totalProducts: number;
    activeProducts: number;
    totalOrders: number;
    revenue: number;
    rating: number;
    reviewCount: number;
    joinedDate: string;
  };
  settings: {
    storeEnabled: boolean;
    acceptOrders: boolean;
    autoAcceptOrders: boolean;
    vacationMode: boolean;
    notificationsEnabled: boolean;
  };
}

interface SalesAnalytics {
  period: string;
  revenue: number;
  orders: number;
  averageOrderValue: number;
  topProducts: {
    id: string;
    name: string;
    sales: number;
    revenue: number;
  }[];
  customerMetrics: {
    newCustomers: number;
    returningCustomers: number;
    customerSatisfaction: number;
  };
  traffic: {
    storeViews: number;
    productViews: number;
    conversionRate: number;
  };
}

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: string;
  action: string;
  priority: 'High' | 'Medium' | 'Low';
  completed?: boolean;
}

interface RecentActivity {
  id: string;
  type: 'Order' | 'Product' | 'Review' | 'Payment' | 'Message' | 'System';
  title: string;
  description: string;
  timestamp: string;
  status?: string;
  amount?: number;
  urgent?: boolean;
}

export default function SellerDashboard() {
  const sellerProfile: SellerProfile = {
    id: 'seller_001',
    businessName: 'Nairobi FC Official Store',
    displayName: 'Nairobi FC',
    type: 'Team',
    description: 'Official merchandise and memorabilia from Kenya\'s premier football club. Established 2015.',
    contact: {
      email: 'store@nairobifc.com',
      phone: '+254 701 234 567',
      address: 'Kasarani Stadium, Nairobi, Kenya',
      website: 'www.nairobifc.com'
    },
    verification: {
      status: 'Verified',
      documents: ['Business License', 'Tax Certificate', 'Bank Statement', 'Identity Document'],
      verifiedDate: '2024-02-15',
      badgeLevel: 'Gold'
    },
    metrics: {
      totalProducts: 156,
      activeProducts: 142,
      totalOrders: 2350,
      revenue: 12500000,
      rating: 4.8,
      reviewCount: 890,
      joinedDate: '2024-01-15'
    },
    settings: {
      storeEnabled: true,
      acceptOrders: true,
      autoAcceptOrders: false,
      vacationMode: false,
      notificationsEnabled: true
    }
  };

  const salesAnalytics: SalesAnalytics = {
    period: 'November 2025',
    revenue: 2340000,
    orders: 456,
    averageOrderValue: 5132,
    topProducts: [
      {
        id: 'p001',
        name: 'Official Home Jersey 2024',
        sales: 89,
        revenue: 400500
      },
      {
        id: 'p002',
        name: 'Team Scarf - Championship Edition',
        sales: 124,
        revenue: 248000
      },
      {
        id: 'p003',
        name: 'Signed Football Collection',
        sales: 23,
        revenue: 345000
      }
    ],
    customerMetrics: {
      newCustomers: 145,
      returningCustomers: 311,
      customerSatisfaction: 4.7
    },
    traffic: {
      storeViews: 12450,
      productViews: 34560,
      conversionRate: 3.7
    }
  };

  const quickActions: QuickAction[] = [
    {
      id: 'qa001',
      title: 'Add New Products',
      description: 'List new merchandise for the championship',
      icon: '➕',
      action: 'add-product',
      priority: 'High'
    },
    {
      id: 'qa002',
      title: 'Process Pending Orders',
      description: '12 orders waiting for confirmation',
      icon: '📦',
      action: 'process-orders',
      priority: 'High'
    },
    {
      id: 'qa003',
      title: 'Update Inventory',
      description: 'Sync stock levels for popular items',
      icon: '📊',
      action: 'update-inventory',
      priority: 'Medium'
    },
    {
      id: 'qa004',
      title: 'Respond to Messages',
      description: '8 customer inquiries pending',
      icon: '💬',
      action: 'respond-messages',
      priority: 'Medium'
    },
    {
      id: 'qa005',
      title: 'Review Analytics',
      description: 'Check weekly performance report',
      icon: '📈',
      action: 'view-analytics',
      priority: 'Low',
      completed: true
    }
  ];

  const recentActivity: RecentActivity[] = [
    {
      id: 'ra001',
      type: 'Order',
      title: 'New Order Received',
      description: 'Order #ORD-2025-1045 - Official Jersey (Size L)',
      timestamp: '2025-10-31T14:30:00Z',
      status: 'Pending',
      amount: 4500,
      urgent: true
    },
    {
      id: 'ra002',
      type: 'Review',
      title: 'New Product Review',
      description: '5-star review for Championship Scarf',
      timestamp: '2025-10-31T13:45:00Z',
      status: 'Published'
    },
    {
      id: 'ra003',
      type: 'Payment',
      title: 'Payment Received',
      description: 'Weekly commission payment processed',
      timestamp: '2025-10-31T10:00:00Z',
      status: 'Completed',
      amount: 125000
    },
    {
      id: 'ra004',
      type: 'Product',
      title: 'Low Stock Alert',
      description: 'Home Jersey (Size M) - Only 3 items left',
      timestamp: '2025-10-31T09:15:00Z',
      status: 'Warning',
      urgent: true
    },
    {
      id: 'ra005',
      type: 'Message',
      title: 'Customer Inquiry',
      description: 'Question about shipping to Mombasa',
      timestamp: '2025-10-31T08:30:00Z',
      status: 'Unread'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Verified':
      case 'Completed':
      case 'Published':
        return 'bg-green-100 text-green-800';
      case 'Pending':
      case 'Unread':
        return 'bg-yellow-100 text-yellow-800';
      case 'Warning':
        return 'bg-orange-100 text-orange-800';
      case 'Rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: SellerProfile['type']) => {
    switch (type) {
      case 'Team': return 'bg-blue-100 text-blue-800';
      case 'Business': return 'bg-green-100 text-green-800';
      case 'Official Partner': return 'bg-purple-100 text-purple-800';
      case 'Individual': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: QuickAction['priority']) => {
    switch (priority) {
      case 'High': return 'bg-red-100 text-red-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Low': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getBadgeColor = (level: string) => {
    switch (level) {
      case 'Platinum': return 'bg-gray-800 text-white';
      case 'Gold': return 'bg-yellow-100 text-yellow-800';
      case 'Silver': return 'bg-gray-100 text-gray-800';
      case 'Bronze': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount: number) => {
    return `KES ${amount.toLocaleString()}`;
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Seller Dashboard</h1>
          <p className="text-muted-foreground">Manage your store and track performance</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">🏪 View Store</Button>
          <Button variant="outline">📊 Analytics</Button>
          <Button>➕ Add Product</Button>
        </div>
      </div>

      {/* Store Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">{formatCurrency(salesAnalytics.revenue)}</div>
            <div className="text-sm text-muted-foreground">Monthly Revenue</div>
            <div className="text-xs text-green-600 mt-1">+15% from last month</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">{salesAnalytics.orders}</div>
            <div className="text-sm text-muted-foreground">Total Orders</div>
            <div className="text-xs text-blue-600 mt-1">+8% from last month</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-purple-600">{sellerProfile.metrics.activeProducts}</div>
            <div className="text-sm text-muted-foreground">Active Products</div>
            <div className="text-xs text-purple-600 mt-1">of {sellerProfile.metrics.totalProducts} total</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-orange-600">{sellerProfile.metrics.rating}⭐</div>
            <div className="text-sm text-muted-foreground">Store Rating</div>
            <div className="text-xs text-orange-600 mt-1">{sellerProfile.metrics.reviewCount} reviews</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Store Profile */}
          <Card>
            <CardHeader>
              <CardTitle>Store Profile</CardTitle>
              <CardDescription>Your marketplace presence and verification status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center text-2xl font-bold">
                    {sellerProfile.displayName.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-xl font-semibold">{sellerProfile.businessName}</h3>
                      <Badge className={getTypeColor(sellerProfile.type)} variant="secondary">
                        {sellerProfile.type}
                      </Badge>
                      <Badge className={getBadgeColor(sellerProfile.verification.badgeLevel)} variant="secondary">
                        {sellerProfile.verification.badgeLevel} Seller
                      </Badge>
                    </div>
                    <p className="text-muted-foreground mb-3">{sellerProfile.description}</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Email:</span>
                        <span className="ml-2">{sellerProfile.contact.email}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Phone:</span>
                        <span className="ml-2">{sellerProfile.contact.phone}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Location:</span>
                        <span className="ml-2">{sellerProfile.contact.address}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Member Since:</span>
                        <span className="ml-2">{new Date(sellerProfile.metrics.joinedDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge className={getStatusColor(sellerProfile.verification.status)} variant="secondary">
                      {sellerProfile.verification.status}
                    </Badge>
                    <div className="text-sm text-muted-foreground mt-1">
                      Verification Status
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">Store Settings</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <div className="font-medium">Store Enabled</div>
                        <div className="text-sm text-muted-foreground">Your store is visible to customers</div>
                      </div>
                      <Switch checked={sellerProfile.settings.storeEnabled} />
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <div className="font-medium">Accept New Orders</div>
                        <div className="text-sm text-muted-foreground">Allow customers to place new orders</div>
                      </div>
                      <Switch checked={sellerProfile.settings.acceptOrders} />
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <div className="font-medium">Auto-Accept Orders</div>
                        <div className="text-sm text-muted-foreground">Automatically confirm orders without manual review</div>
                      </div>
                      <Switch checked={sellerProfile.settings.autoAcceptOrders} />
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <div className="font-medium">Vacation Mode</div>
                        <div className="text-sm text-muted-foreground">Temporarily pause your store</div>
                      </div>
                      <Switch checked={sellerProfile.settings.vacationMode} />
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm">✏️ Edit Profile</Button>
                  <Button variant="outline" size="sm">📄 Verification Docs</Button>
                  <Button variant="outline" size="sm">⚙️ Store Settings</Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sales Performance */}
          <Card>
            <CardHeader>
              <CardTitle>Sales Performance</CardTitle>
              <CardDescription>Current month analytics and trends</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 border rounded">
                    <div className="text-2xl font-bold text-green-600">{formatCurrency(salesAnalytics.averageOrderValue)}</div>
                    <div className="text-sm text-muted-foreground">Average Order Value</div>
                  </div>
                  <div className="text-center p-4 border rounded">
                    <div className="text-2xl font-bold text-blue-600">{salesAnalytics.traffic.conversionRate}%</div>
                    <div className="text-sm text-muted-foreground">Conversion Rate</div>
                  </div>
                  <div className="text-center p-4 border rounded">
                    <div className="text-2xl font-bold text-purple-600">{salesAnalytics.customerMetrics.customerSatisfaction}</div>
                    <div className="text-sm text-muted-foreground">Customer Satisfaction</div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">Top Selling Products</h4>
                  <div className="space-y-3">
                    {salesAnalytics.topProducts.map((product, index) => (
                      <div key={product.id} className="flex items-center justify-between p-3 border rounded">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-bold">
                            {index + 1}
                          </div>
                          <div>
                            <div className="font-medium">{product.name}</div>
                            <div className="text-sm text-muted-foreground">{product.sales} units sold</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-green-600">{formatCurrency(product.revenue)}</div>
                          <div className="text-sm text-muted-foreground">Revenue</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3">Customer Metrics</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">New Customers</span>
                        <span className="font-semibold">{salesAnalytics.customerMetrics.newCustomers}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Returning Customers</span>
                        <span className="font-semibold">{salesAnalytics.customerMetrics.returningCustomers}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Total This Month</span>
                        <span className="font-semibold">{salesAnalytics.customerMetrics.newCustomers + salesAnalytics.customerMetrics.returningCustomers}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-3">Traffic Analytics</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Store Views</span>
                        <span className="font-semibold">{salesAnalytics.traffic.storeViews.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Product Views</span>
                        <span className="font-semibold">{salesAnalytics.traffic.productViews.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Conversion Rate</span>
                        <span className="font-semibold">{salesAnalytics.traffic.conversionRate}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Important tasks and store management</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {quickActions.map(action => (
                  <div key={action.id} className={`flex items-center justify-between p-4 border rounded ${action.completed ? 'bg-gray-50' : ''}`}>
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">{action.icon}</div>
                      <div>
                        <div className={`font-medium ${action.completed ? 'line-through text-muted-foreground' : ''}`}>
                          {action.title}
                        </div>
                        <div className="text-sm text-muted-foreground">{action.description}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getPriorityColor(action.priority)} variant="secondary">
                        {action.priority}
                      </Badge>
                      {!action.completed && (
                        <Button size="sm">Take Action</Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest updates and notifications</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map(activity => (
                  <div key={activity.id} className="flex items-start gap-3 p-3 border rounded">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-sm">
                      {activity.type === 'Order' && '📦'}
                      {activity.type === 'Product' && '📊'}
                      {activity.type === 'Review' && '⭐'}
                      {activity.type === 'Payment' && '💰'}
                      {activity.type === 'Message' && '💬'}
                      {activity.type === 'System' && '⚙️'}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium">{activity.title}</h4>
                        {activity.status && (
                          <Badge className={getStatusColor(activity.status)} variant="secondary">
                            {activity.status}
                          </Badge>
                        )}
                        {activity.urgent && (
                          <Badge variant="secondary" className="bg-red-100 text-red-800">
                            🚨 Urgent
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{activity.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">{formatTimestamp(activity.timestamp)}</span>
                        {activity.amount && (
                          <span className="font-semibold text-green-600">{formatCurrency(activity.amount)}</span>
                        )}
                      </div>
                    </div>
                    <Button variant="outline" size="sm">View</Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Store Status */}
          <Card>
            <CardHeader>
              <CardTitle>Store Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-2xl mb-2">🟢</div>
                  <div className="font-semibold text-green-600">Store Active</div>
                  <div className="text-sm text-muted-foreground">All systems operational</div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Product Approval Rate</span>
                    <span className="font-semibold">98%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Order Processing</span>
                    <span className="font-semibold text-green-600">On Time</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Customer Response</span>
                    <span className="font-semibold">&lt; 2 hours</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pending Tasks */}
          <Card>
            <CardHeader>
              <CardTitle>Pending Tasks</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Orders to Process</span>
                <Badge variant="secondary" className="bg-red-100 text-red-800">12</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Messages to Reply</span>
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">8</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Products to Restock</span>
                <Badge variant="secondary" className="bg-orange-100 text-orange-800">5</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Reviews to Respond</span>
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">3</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Quick Statistics */}
          <Card>
            <CardHeader>
              <CardTitle>This Week</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Revenue</span>
                  <span className="font-bold text-green-600">KES 485K</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Orders</span>
                  <span className="font-bold">127</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">New Customers</span>
                  <span className="font-bold">34</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Store Views</span>
                  <span className="font-bold">2,850</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Links */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Links</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start" size="sm">
                📦 Manage Orders
              </Button>
              <Button variant="outline" className="w-full justify-start" size="sm">
                📊 Product Analytics
              </Button>
              <Button variant="outline" className="w-full justify-start" size="sm">
                💬 Customer Messages
              </Button>
              <Button variant="outline" className="w-full justify-start" size="sm">
                💰 Financial Reports
              </Button>
              <Button variant="outline" className="w-full justify-start" size="sm">
                🎯 Marketing Tools
              </Button>
            </CardContent>
          </Card>

          {/* Support */}
          <Card>
            <CardHeader>
              <CardTitle>Seller Support</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm">
                <div className="font-semibold">Need Help?</div>
                <div className="text-muted-foreground">Our seller support team is here to assist you</div>
              </div>
              
              <div className="space-y-2">
                <Button variant="outline" size="sm" className="w-full">
                  💬 Live Chat
                </Button>
                <Button variant="outline" size="sm" className="w-full">
                  📞 Call Support
                </Button>
                <Button variant="outline" size="sm" className="w-full">
                  📚 Help Center
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}