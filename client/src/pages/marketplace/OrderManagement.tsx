import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

interface Order {
  id: string;
  orderNumber: string;
  customer: {
    id: string;
    name: string;
    email: string;
    phone: string;
    address: {
      street: string;
      city: string;
      county: string;
      postalCode: string;
    };
  };
  items: OrderItem[];
  totals: {
    subtotal: number;
    shipping: number;
    tax: number;
    total: number;
  };
  payment: {
    method: 'M-Pesa' | 'Card' | 'Bank Transfer' | 'Cash on Delivery';
    status: 'Pending' | 'Paid' | 'Failed' | 'Refunded' | 'Partial';
    transactionId?: string;
    paidAmount: number;
    paidDate?: string;
  };
  shipping: {
    method: 'Standard' | 'Express' | 'Pickup' | 'Digital';
    carrier?: string;
    trackingNumber?: string;
    estimatedDelivery?: string;
    actualDelivery?: string;
    address: {
      street: string;
      city: string;
      county: string;
      postalCode: string;
    };
  };
  status: 'Pending' | 'Confirmed' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled' | 'Returned';
  notes: string;
  tags: string[];
  timeline: OrderEvent[];
  createdDate: string;
  updatedDate: string;
}

interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  productSku: string;
  variantId?: string;
  variantName?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  image?: string;
}

interface OrderEvent {
  id: string;
  type: 'Created' | 'Confirmed' | 'Payment' | 'Shipped' | 'Delivered' | 'Cancelled' | 'Note';
  title: string;
  description: string;
  timestamp: string;
  user?: string;
  metadata?: Record<string, any>;
}

interface OrderFilters {
  status: string;
  paymentStatus: string;
  dateRange: string;
  searchTerm: string;
}

export default function OrderManagement() {
  const [activeTab, setActiveTab] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showOrderDetail, setShowOrderDetail] = useState(false);
  const [filters, setFilters] = useState<OrderFilters>({
    status: "all",
    paymentStatus: "all",
    dateRange: "all",
    searchTerm: ""
  });

  const orders: Order[] = [
    {
      id: 'ord_001',
      orderNumber: 'ORD-2025-1045',
      customer: {
        id: 'cust_001',
        name: 'John Kamau',
        email: 'john.kamau@email.com',
        phone: '+254 701 234 567',
        address: {
          street: 'Kenyatta Avenue, Building 15',
          city: 'Nairobi',
          county: 'Nairobi',
          postalCode: '00100'
        }
      },
      items: [
        {
          id: 'item_001',
          productId: 'prod_001',
          productName: 'Official Home Jersey 2024',
          productSku: 'NFC-HJ24-001',
          variantId: 'v3',
          variantName: 'Size: L',
          quantity: 1,
          unitPrice: 4500,
          totalPrice: 4500
        },
        {
          id: 'item_002',
          productId: 'prod_002',
          productName: 'Championship Celebration Scarf',
          productSku: 'NFC-CS24-001',
          quantity: 2,
          unitPrice: 2000,
          totalPrice: 4000
        }
      ],
      totals: {
        subtotal: 8500,
        shipping: 500,
        tax: 1360,
        total: 10360
      },
      payment: {
        method: 'M-Pesa',
        status: 'Paid',
        transactionId: 'MPE123456789',
        paidAmount: 10360,
        paidDate: '2025-10-31T14:30:00Z'
      },
      shipping: {
        method: 'Standard',
        carrier: 'Posta Kenya',
        trackingNumber: 'PK2025103101',
        estimatedDelivery: '2025-11-05T12:00:00Z',
        address: {
          street: 'Kenyatta Avenue, Building 15',
          city: 'Nairobi',
          county: 'Nairobi',
          postalCode: '00100'
        }
      },
      status: 'Confirmed',
      notes: 'Customer requested express processing due to upcoming match.',
      tags: ['Priority', 'Fan Order'],
      timeline: [
        {
          id: 'evt_001',
          type: 'Created',
          title: 'Order Created',
          description: 'Customer placed order online',
          timestamp: '2025-10-31T14:30:00Z'
        },
        {
          id: 'evt_002',
          type: 'Payment',
          title: 'Payment Received',
          description: 'M-Pesa payment confirmed - MPE123456789',
          timestamp: '2025-10-31T14:35:00Z'
        },
        {
          id: 'evt_003',
          type: 'Confirmed',
          title: 'Order Confirmed',
          description: 'Seller confirmed order and allocated inventory',
          timestamp: '2025-10-31T15:00:00Z'
        }
      ],
      createdDate: '2025-10-31T14:30:00Z',
      updatedDate: '2025-10-31T15:00:00Z'
    },
    {
      id: 'ord_002',
      orderNumber: 'ORD-2025-1046',
      customer: {
        id: 'cust_002',
        name: 'Mary Wanjiku',
        email: 'mary.wanjiku@email.com',
        phone: '+254 722 456 789',
        address: {
          street: 'Moi Avenue, Shop 45',
          city: 'Mombasa',
          county: 'Mombasa',
          postalCode: '80100'
        }
      },
      items: [
        {
          id: 'item_003',
          productId: 'prod_003',
          productName: 'Signed Match Ball Collection',
          productSku: 'NFC-SMB24-001',
          quantity: 1,
          unitPrice: 15000,
          totalPrice: 15000
        }
      ],
      totals: {
        subtotal: 15000,
        shipping: 0,
        tax: 2400,
        total: 17400
      },
      payment: {
        method: 'Bank Transfer',
        status: 'Pending',
        paidAmount: 0
      },
      shipping: {
        method: 'Express',
        carrier: 'DHL Kenya',
        estimatedDelivery: '2025-11-02T16:00:00Z',
        address: {
          street: 'Moi Avenue, Shop 45',
          city: 'Mombasa',
          county: 'Mombasa',
          postalCode: '80100'
        }
      },
      status: 'Pending',
      notes: 'High-value item - requires signature confirmation.',
      tags: ['High Value', 'Collectible'],
      timeline: [
        {
          id: 'evt_004',
          type: 'Created',
          title: 'Order Created',
          description: 'Customer placed order for signed ball',
          timestamp: '2025-10-31T16:15:00Z'
        }
      ],
      createdDate: '2025-10-31T16:15:00Z',
      updatedDate: '2025-10-31T16:15:00Z'
    },
    {
      id: 'ord_003',
      orderNumber: 'ORD-2025-1044',
      customer: {
        id: 'cust_003',
        name: 'Peter Ochieng',
        email: 'peter.ochieng@email.com',
        phone: '+254 733 567 890',
        address: {
          street: 'Oginga Odinga Street',
          city: 'Kisumu',
          county: 'Kisumu',
          postalCode: '40100'
        }
      },
      items: [
        {
          id: 'item_004',
          productId: 'prod_004',
          productName: 'Training Water Bottle',
          productSku: 'NFC-WB24-001',
          variantId: 'v1',
          variantName: 'Color: Blue',
          quantity: 5,
          unitPrice: 800,
          totalPrice: 4000
        }
      ],
      totals: {
        subtotal: 4000,
        shipping: 300,
        tax: 640,
        total: 4940
      },
      payment: {
        method: 'M-Pesa',
        status: 'Paid',
        transactionId: 'MPE987654321',
        paidAmount: 4940,
        paidDate: '2025-10-30T11:20:00Z'
      },
      shipping: {
        method: 'Standard',
        carrier: 'Posta Kenya',
        trackingNumber: 'PK2025103002',
        estimatedDelivery: '2025-11-04T14:00:00Z',
        actualDelivery: '2025-11-01T10:30:00Z',
        address: {
          street: 'Oginga Odinga Street',
          city: 'Kisumu',
          county: 'Kisumu',
          postalCode: '40100'
        }
      },
      status: 'Delivered',
      notes: 'Team bulk order for training sessions.',
      tags: ['Bulk Order', 'Team'],
      timeline: [
        {
          id: 'evt_005',
          type: 'Created',
          title: 'Order Created',
          description: 'Bulk order for training bottles',
          timestamp: '2025-10-30T11:15:00Z'
        },
        {
          id: 'evt_006',
          type: 'Payment',
          title: 'Payment Received',
          description: 'M-Pesa payment confirmed - MPE987654321',
          timestamp: '2025-10-30T11:20:00Z'
        },
        {
          id: 'evt_007',
          type: 'Confirmed',
          title: 'Order Confirmed',
          description: 'Order processed and prepared for shipping',
          timestamp: '2025-10-30T12:00:00Z'
        },
        {
          id: 'evt_008',
          type: 'Shipped',
          title: 'Order Shipped',
          description: 'Package dispatched via Posta Kenya - PK2025103002',
          timestamp: '2025-10-30T16:00:00Z'
        },
        {
          id: 'evt_009',
          type: 'Delivered',
          title: 'Order Delivered',
          description: 'Package successfully delivered to customer',
          timestamp: '2025-11-01T10:30:00Z'
        }
      ],
      createdDate: '2025-10-30T11:15:00Z',
      updatedDate: '2025-11-01T10:30:00Z'
    },
    {
      id: 'ord_004',
      orderNumber: 'ORD-2025-1043',
      customer: {
        id: 'cust_004',
        name: 'Sarah Nduta',
        email: 'sarah.nduta@email.com',
        phone: '+254 744 678 901',
        address: {
          street: 'Uhuru Highway, Block C',
          city: 'Nakuru',
          county: 'Nakuru',
          postalCode: '20100'
        }
      },
      items: [
        {
          id: 'item_005',
          productId: 'prod_001',
          productName: 'Official Home Jersey 2024',
          productSku: 'NFC-HJ24-001',
          variantId: 'v2',
          variantName: 'Size: M',
          quantity: 1,
          unitPrice: 4500,
          totalPrice: 4500
        }
      ],
      totals: {
        subtotal: 4500,
        shipping: 400,
        tax: 720,
        total: 5620
      },
      payment: {
        method: 'Card',
        status: 'Failed',
        paidAmount: 0
      },
      shipping: {
        method: 'Standard',
        estimatedDelivery: '2025-11-05T14:00:00Z',
        address: {
          street: 'Uhuru Highway, Block C',
          city: 'Nakuru',
          county: 'Nakuru',
          postalCode: '20100'
        }
      },
      status: 'Cancelled',
      notes: 'Payment failed multiple times. Customer requested cancellation.',
      tags: ['Payment Issues'],
      timeline: [
        {
          id: 'evt_010',
          type: 'Created',
          title: 'Order Created',
          description: 'Customer attempted to place order',
          timestamp: '2025-10-29T09:45:00Z'
        },
        {
          id: 'evt_011',
          type: 'Payment',
          title: 'Payment Failed',
          description: 'Card payment declined by bank',
          timestamp: '2025-10-29T09:48:00Z'
        },
        {
          id: 'evt_012',
          type: 'Cancelled',
          title: 'Order Cancelled',
          description: 'Cancelled due to repeated payment failures',
          timestamp: '2025-10-29T14:00:00Z'
        }
      ],
      createdDate: '2025-10-29T09:45:00Z',
      updatedDate: '2025-10-29T14:00:00Z'
    }
  ];

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Confirmed': return 'bg-blue-100 text-blue-800';
      case 'Processing': return 'bg-purple-100 text-purple-800';
      case 'Shipped': return 'bg-indigo-100 text-indigo-800';
      case 'Delivered': return 'bg-green-100 text-green-800';
      case 'Cancelled': return 'bg-red-100 text-red-800';
      case 'Returned': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (status: Order['payment']['status']) => {
    switch (status) {
      case 'Paid': return 'bg-green-100 text-green-800';
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Failed': return 'bg-red-100 text-red-800';
      case 'Refunded': return 'bg-purple-100 text-purple-800';
      case 'Partial': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount: number) => {
    return `KES ${amount.toLocaleString()}`;
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  const filteredOrders = orders.filter(order => {
    if (filters.status !== 'all' && order.status.toLowerCase() !== filters.status) return false;
    if (filters.paymentStatus !== 'all' && order.payment.status.toLowerCase() !== filters.paymentStatus) return false;
    if (filters.searchTerm && !order.orderNumber.toLowerCase().includes(filters.searchTerm.toLowerCase()) &&
        !order.customer.name.toLowerCase().includes(filters.searchTerm.toLowerCase()) &&
        !order.customer.email.toLowerCase().includes(filters.searchTerm.toLowerCase())) return false;
    return true;
  });

  const orderStats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'Pending').length,
    confirmed: orders.filter(o => o.status === 'Confirmed').length,
    processing: orders.filter(o => o.status === 'Processing').length,
    shipped: orders.filter(o => o.status === 'Shipped').length,
    delivered: orders.filter(o => o.status === 'Delivered').length,
    cancelled: orders.filter(o => o.status === 'Cancelled').length,
    returned: orders.filter(o => o.status === 'Returned').length
  };

  const revenueStats = {
    totalRevenue: orders.filter(o => o.payment.status === 'Paid').reduce((sum, o) => sum + o.totals.total, 0),
    pendingPayments: orders.filter(o => o.payment.status === 'Pending').reduce((sum, o) => sum + o.totals.total, 0),
    averageOrderValue: orders.length > 0 ? orders.reduce((sum, o) => sum + o.totals.total, 0) / orders.length : 0
  };

  const handleUpdateOrderStatus = (orderId: string, newStatus: Order['status']) => {
    console.log('Update order status:', orderId, newStatus);
    // Handle status update
  };

  const handleAddNote = (orderId: string, note: string) => {
    console.log('Add note to order:', orderId, note);
    // Handle adding note
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Order Management</h1>
          <p className="text-muted-foreground">Track and manage customer orders</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">📊 Reports</Button>
          <Button variant="outline">📤 Export Orders</Button>
          <Button variant="outline">🔄 Sync Status</Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">{orderStats.total}</div>
            <div className="text-sm text-muted-foreground">Total Orders</div>
            <div className="text-xs text-blue-600 mt-1">All time</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-yellow-600">{orderStats.pending + orderStats.confirmed}</div>
            <div className="text-sm text-muted-foreground">Active Orders</div>
            <div className="text-xs text-yellow-600 mt-1">Need attention</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">{formatCurrency(revenueStats.totalRevenue)}</div>
            <div className="text-sm text-muted-foreground">Total Revenue</div>
            <div className="text-xs text-green-600 mt-1">Confirmed payments</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-purple-600">{formatCurrency(Math.round(revenueStats.averageOrderValue))}</div>
            <div className="text-sm text-muted-foreground">Average Order</div>
            <div className="text-xs text-purple-600 mt-1">Per transaction</div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="all">All ({orderStats.total})</TabsTrigger>
          <TabsTrigger value="pending">Pending ({orderStats.pending})</TabsTrigger>
          <TabsTrigger value="confirmed">Confirmed ({orderStats.confirmed})</TabsTrigger>
          <TabsTrigger value="processing">Processing ({orderStats.processing})</TabsTrigger>
          <TabsTrigger value="shipped">Shipped ({orderStats.shipped})</TabsTrigger>
          <TabsTrigger value="delivered">Delivered ({orderStats.delivered})</TabsTrigger>
          <TabsTrigger value="issues">Issues ({orderStats.cancelled + orderStats.returned})</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="search">Search Orders</Label>
                  <Input
                    id="search"
                    placeholder="Order number, customer name..."
                    value={filters.searchTerm}
                    onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={filters.status} onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="All Statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="confirmed">Confirmed</SelectItem>
                      <SelectItem value="processing">Processing</SelectItem>
                      <SelectItem value="shipped">Shipped</SelectItem>
                      <SelectItem value="delivered">Delivered</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                      <SelectItem value="returned">Returned</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="payment">Payment Status</Label>
                  <Select value={filters.paymentStatus} onValueChange={(value) => setFilters(prev => ({ ...prev, paymentStatus: value }))}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="All Payment Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Payment Status</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                      <SelectItem value="refunded">Refunded</SelectItem>
                      <SelectItem value="partial">Partial</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <Button variant="outline" className="w-full">
                    🔍 Filter
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Orders List */}
          <Card>
            <CardHeader>
              <CardTitle>Orders ({filteredOrders.length})</CardTitle>
              <CardDescription>Manage customer orders and track their progress</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredOrders.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No orders found matching your criteria
                  </div>
                ) : (
                  filteredOrders.map(order => (
                    <div key={order.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-lg font-semibold">{order.orderNumber}</h3>
                            <Badge className={getStatusColor(order.status)} variant="secondary">
                              {order.status}
                            </Badge>
                            <Badge className={getPaymentStatusColor(order.payment.status)} variant="secondary">
                              {order.payment.status}
                            </Badge>
                            {order.tags.map(tag => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                          <div className="text-sm text-muted-foreground mb-2">
                            Customer: <span className="font-medium text-foreground">{order.customer.name}</span> • 
                            {order.customer.email} • {order.customer.phone}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Created: {formatTimestamp(order.createdDate)} • 
                            Updated: {formatTimestamp(order.updatedDate)}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-green-600">
                            {formatCurrency(order.totals.total)}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                          </div>
                        </div>
                      </div>

                      {/* Order Items */}
                      <div className="mb-4">
                        <div className="grid gap-2">
                          {order.items.map(item => (
                            <div key={item.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center text-xs">
                                  📦
                                </div>
                                <div>
                                  <div className="font-medium">{item.productName}</div>
                                  <div className="text-sm text-muted-foreground">
                                    {item.variantName && `${item.variantName} • `}
                                    SKU: {item.productSku} • Qty: {item.quantity}
                                  </div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="font-semibold">{formatCurrency(item.totalPrice)}</div>
                                <div className="text-sm text-muted-foreground">
                                  {formatCurrency(item.unitPrice)} each
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Order Totals */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <h4 className="font-semibold mb-2">Shipping Address</h4>
                          <div className="text-sm">
                            <div>{order.shipping.address.street}</div>
                            <div>{order.shipping.address.city}, {order.shipping.address.county}</div>
                            <div>{order.shipping.address.postalCode}</div>
                          </div>
                          {order.shipping.trackingNumber && (
                            <div className="mt-2 p-2 bg-blue-50 rounded">
                              <div className="text-sm">
                                <span className="font-medium">Tracking:</span> {order.shipping.trackingNumber}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {order.shipping.carrier} • Est. delivery: {order.shipping.estimatedDelivery ? new Date(order.shipping.estimatedDelivery).toLocaleDateString() : 'TBD'}
                              </div>
                            </div>
                          )}
                        </div>
                        <div>
                          <h4 className="font-semibold mb-2">Order Summary</h4>
                          <div className="space-y-1 text-sm">
                            <div className="flex justify-between">
                              <span>Subtotal:</span>
                              <span>{formatCurrency(order.totals.subtotal)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Shipping:</span>
                              <span>{formatCurrency(order.totals.shipping)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Tax:</span>
                              <span>{formatCurrency(order.totals.tax)}</span>
                            </div>
                            <div className="flex justify-between font-semibold border-t pt-1">
                              <span>Total:</span>
                              <span>{formatCurrency(order.totals.total)}</span>
                            </div>
                          </div>
                          {order.payment.method && (
                            <div className="mt-2 p-2 bg-green-50 rounded">
                              <div className="text-sm">
                                <span className="font-medium">Payment:</span> {order.payment.method}
                                {order.payment.transactionId && (
                                  <div className="text-xs text-muted-foreground">
                                    ID: {order.payment.transactionId}
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Notes */}
                      {order.notes && (
                        <div className="mb-4 p-3 bg-yellow-50 rounded">
                          <div className="text-sm">
                            <span className="font-medium">Note:</span> {order.notes}
                          </div>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex justify-between items-center">
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => {
                              setSelectedOrder(order);
                              setShowOrderDetail(true);
                            }}
                          >
                            👁️ View Details
                          </Button>
                          <Button variant="outline" size="sm">
                            📧 Contact Customer
                          </Button>
                          <Button variant="outline" size="sm">
                            📄 Print Invoice
                          </Button>
                        </div>
                        <div className="flex gap-2">
                          {order.status === 'Pending' && (
                            <Button size="sm" onClick={() => handleUpdateOrderStatus(order.id, 'Confirmed')}>
                              ✅ Confirm
                            </Button>
                          )}
                          {order.status === 'Confirmed' && (
                            <Button size="sm" onClick={() => handleUpdateOrderStatus(order.id, 'Processing')}>
                              ⚙️ Process
                            </Button>
                          )}
                          {order.status === 'Processing' && (
                            <Button size="sm" onClick={() => handleUpdateOrderStatus(order.id, 'Shipped')}>
                              🚚 Ship
                            </Button>
                          )}
                          <Select onValueChange={(value) => handleUpdateOrderStatus(order.id, value as Order['status'])}>
                            <SelectTrigger className="w-32">
                              <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Pending">Pending</SelectItem>
                              <SelectItem value="Confirmed">Confirmed</SelectItem>
                              <SelectItem value="Processing">Processing</SelectItem>
                              <SelectItem value="Shipped">Shipped</SelectItem>
                              <SelectItem value="Delivered">Delivered</SelectItem>
                              <SelectItem value="Cancelled">Cancelled</SelectItem>
                              <SelectItem value="Returned">Returned</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Order Detail Modal */}
      {showOrderDetail && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Order Details - {selectedOrder.orderNumber}</h2>
                <Button variant="outline" onClick={() => setShowOrderDetail(false)}>✖️</Button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Order Info */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Customer Information */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Customer Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <div className="space-y-2">
                            <div>
                              <Label className="text-sm font-medium">Name</Label>
                              <div className="text-sm">{selectedOrder.customer.name}</div>
                            </div>
                            <div>
                              <Label className="text-sm font-medium">Email</Label>
                              <div className="text-sm">{selectedOrder.customer.email}</div>
                            </div>
                            <div>
                              <Label className="text-sm font-medium">Phone</Label>
                              <div className="text-sm">{selectedOrder.customer.phone}</div>
                            </div>
                          </div>
                        </div>
                        <div>
                          <Label className="text-sm font-medium">Billing Address</Label>
                          <div className="text-sm space-y-1">
                            <div>{selectedOrder.customer.address.street}</div>
                            <div>{selectedOrder.customer.address.city}, {selectedOrder.customer.address.county}</div>
                            <div>{selectedOrder.customer.address.postalCode}</div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Order Items */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Order Items</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {selectedOrder.items.map(item => (
                          <div key={item.id} className="flex items-center justify-between p-4 border rounded">
                            <div className="flex items-center gap-4">
                              <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center">
                                📦
                              </div>
                              <div>
                                <div className="font-semibold">{item.productName}</div>
                                {item.variantName && (
                                  <div className="text-sm text-muted-foreground">{item.variantName}</div>
                                )}
                                <div className="text-sm text-muted-foreground">SKU: {item.productSku}</div>
                                <div className="text-sm">
                                  <span className="font-medium">Quantity:</span> {item.quantity} × {formatCurrency(item.unitPrice)}
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-bold text-green-600">{formatCurrency(item.totalPrice)}</div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Order Totals */}
                      <div className="mt-6 pt-6 border-t">
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span>Subtotal:</span>
                            <span>{formatCurrency(selectedOrder.totals.subtotal)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Shipping ({selectedOrder.shipping.method}):</span>
                            <span>{formatCurrency(selectedOrder.totals.shipping)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Tax (16%):</span>
                            <span>{formatCurrency(selectedOrder.totals.tax)}</span>
                          </div>
                          <div className="flex justify-between text-lg font-bold border-t pt-2">
                            <span>Total:</span>
                            <span>{formatCurrency(selectedOrder.totals.total)}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Order Timeline */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Order Timeline</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {selectedOrder.timeline.map((event, index) => (
                          <div key={event.id} className="flex gap-4">
                            <div className="flex flex-col items-center">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                                index === 0 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                              }`}>
                                {event.type === 'Created' && '📝'}
                                {event.type === 'Payment' && '💰'}
                                {event.type === 'Confirmed' && '✅'}
                                {event.type === 'Shipped' && '🚚'}
                                {event.type === 'Delivered' && '📦'}
                                {event.type === 'Cancelled' && '❌'}
                                {event.type === 'Note' && '📋'}
                              </div>
                              {index < selectedOrder.timeline.length - 1 && (
                                <div className="w-0.5 h-8 bg-gray-200 mt-2"></div>
                              )}
                            </div>
                            <div className="flex-1 pb-4">
                              <div className="flex items-center justify-between mb-1">
                                <h4 className="font-semibold">{event.title}</h4>
                                <span className="text-sm text-muted-foreground">
                                  {formatTimestamp(event.timestamp)}
                                </span>
                              </div>
                              <p className="text-sm text-muted-foreground">{event.description}</p>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Add Note */}
                      <div className="mt-6 pt-6 border-t">
                        <Label className="text-sm font-medium">Add Note</Label>
                        <div className="flex gap-2 mt-2">
                          <Textarea
                            placeholder="Add a note about this order..."
                            className="flex-1"
                            rows={2}
                          />
                          <Button onClick={() => handleAddNote(selectedOrder.id, 'Sample note')}>
                            Add Note
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                  {/* Order Status */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Order Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="text-center">
                          <Badge className={getStatusColor(selectedOrder.status)} variant="secondary">
                            {selectedOrder.status}
                          </Badge>
                          <div className="text-sm text-muted-foreground mt-2">
                            Current order status
                          </div>
                        </div>

                        <div>
                          <Label className="text-sm font-medium">Update Status</Label>
                          <Select 
                            value={selectedOrder.status} 
                            onValueChange={(value) => handleUpdateOrderStatus(selectedOrder.id, value as Order['status'])}
                          >
                            <SelectTrigger className="mt-1">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Pending">Pending</SelectItem>
                              <SelectItem value="Confirmed">Confirmed</SelectItem>
                              <SelectItem value="Processing">Processing</SelectItem>
                              <SelectItem value="Shipped">Shipped</SelectItem>
                              <SelectItem value="Delivered">Delivered</SelectItem>
                              <SelectItem value="Cancelled">Cancelled</SelectItem>
                              <SelectItem value="Returned">Returned</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Button className="w-full" size="sm">
                            📧 Email Customer
                          </Button>
                          <Button variant="outline" className="w-full" size="sm">
                            📄 Print Invoice
                          </Button>
                          <Button variant="outline" className="w-full" size="sm">
                            🔄 Refund Order
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Payment Information */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Payment Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div>
                          <Label className="text-sm font-medium">Payment Method</Label>
                          <div className="text-sm">{selectedOrder.payment.method}</div>
                        </div>
                        <div>
                          <Label className="text-sm font-medium">Payment Status</Label>
                          <div>
                            <Badge className={getPaymentStatusColor(selectedOrder.payment.status)} variant="secondary">
                              {selectedOrder.payment.status}
                            </Badge>
                          </div>
                        </div>
                        {selectedOrder.payment.transactionId && (
                          <div>
                            <Label className="text-sm font-medium">Transaction ID</Label>
                            <div className="text-sm font-mono">{selectedOrder.payment.transactionId}</div>
                          </div>
                        )}
                        <div>
                          <Label className="text-sm font-medium">Amount Paid</Label>
                          <div className="text-lg font-bold text-green-600">
                            {formatCurrency(selectedOrder.payment.paidAmount)}
                          </div>
                        </div>
                        {selectedOrder.payment.paidDate && (
                          <div>
                            <Label className="text-sm font-medium">Payment Date</Label>
                            <div className="text-sm">{formatTimestamp(selectedOrder.payment.paidDate)}</div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Shipping Information */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Shipping Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div>
                          <Label className="text-sm font-medium">Shipping Method</Label>
                          <div className="text-sm">{selectedOrder.shipping.method}</div>
                        </div>
                        {selectedOrder.shipping.carrier && (
                          <div>
                            <Label className="text-sm font-medium">Carrier</Label>
                            <div className="text-sm">{selectedOrder.shipping.carrier}</div>
                          </div>
                        )}
                        {selectedOrder.shipping.trackingNumber && (
                          <div>
                            <Label className="text-sm font-medium">Tracking Number</Label>
                            <div className="text-sm font-mono">{selectedOrder.shipping.trackingNumber}</div>
                          </div>
                        )}
                        <div>
                          <Label className="text-sm font-medium">Shipping Address</Label>
                          <div className="text-sm space-y-1">
                            <div>{selectedOrder.shipping.address.street}</div>
                            <div>{selectedOrder.shipping.address.city}, {selectedOrder.shipping.address.county}</div>
                            <div>{selectedOrder.shipping.address.postalCode}</div>
                          </div>
                        </div>
                        {selectedOrder.shipping.estimatedDelivery && (
                          <div>
                            <Label className="text-sm font-medium">Estimated Delivery</Label>
                            <div className="text-sm">{new Date(selectedOrder.shipping.estimatedDelivery).toLocaleDateString()}</div>
                          </div>
                        )}
                        {selectedOrder.shipping.actualDelivery && (
                          <div>
                            <Label className="text-sm font-medium">Delivered</Label>
                            <div className="text-sm text-green-600 font-semibold">
                              {formatTimestamp(selectedOrder.shipping.actualDelivery)}
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Order Tags */}
                  {selectedOrder.tags.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Order Tags</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-2">
                          {selectedOrder.tags.map(tag => (
                            <Badge key={tag} variant="outline">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}