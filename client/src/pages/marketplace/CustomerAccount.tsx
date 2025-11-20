import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface CustomerProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  avatar?: string;
  joinedDate: string;
  verified: boolean;
  loyaltyTier: 'Bronze' | 'Silver' | 'Gold' | 'Platinum';
  loyaltyPoints: number;
  totalSpent: number;
  totalOrders: number;
}

interface Order {
  id: string;
  orderNumber: string;
  date: string;
  status: 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  total: number;
  items: {
    name: string;
    quantity: number;
    price: number;
    image: string;
  }[];
  trackingNumber?: string;
  estimatedDelivery?: string;
}

interface WishlistItem {
  id: string;
  productId: string;
  name: string;
  seller: string;
  price: number;
  originalPrice?: number;
  image: string;
  inStock: boolean;
  addedDate: string;
}

interface Address {
  id: string;
  label: string;
  firstName: string;
  lastName: string;
  phone: string;
  street: string;
  city: string;
  county: string;
  postalCode: string;
  isDefault: boolean;
}

interface Notification {
  id: string;
  type: 'order' | 'promotion' | 'system' | 'security';
  title: string;
  message: string;
  date: string;
  read: boolean;
  actionUrl?: string;
}

export default function CustomerAccount() {
  const [activeTab, setActiveTab] = useState("overview");
  const [editingProfile, setEditingProfile] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Processing': return 'bg-yellow-100 text-yellow-800';
      case 'Shipped': return 'bg-blue-100 text-blue-800';
      case 'Delivered': return 'bg-green-100 text-green-800';
      case 'Cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'Bronze': return 'bg-yellow-600';
      case 'Silver': return 'bg-gray-400';
      case 'Gold': return 'bg-yellow-500';
      case 'Platinum': return 'bg-purple-500';
      default: return 'bg-gray-400';
    }
  };

  // Sample data
  const customerProfile: CustomerProfile = {
    id: 'cust_001',
    firstName: 'John',
    lastName: 'Kamau',
    email: 'john.kamau@email.com',
    phone: '+254 701 234 567',
    avatar: '/api/placeholder/80/80',
    joinedDate: '2024-01-15T00:00:00Z',
    verified: true,
    loyaltyTier: 'Gold',
    loyaltyPoints: 2450,
    totalSpent: 125000,
    totalOrders: 28
  };

  const recentOrders: Order[] = [
    {
      id: 'ord_001',
      orderNumber: 'ORD-2025-1045',
      date: '2025-10-31T14:30:00Z',
      status: 'Delivered',
      total: 10360,
      items: [
        { name: 'Official Home Jersey 2024', quantity: 1, price: 4500, image: '/api/placeholder/60/60' },
        { name: 'Championship Scarf', quantity: 2, price: 2000, image: '/api/placeholder/60/60' }
      ],
      trackingNumber: 'PK2025103101',
      estimatedDelivery: '2025-11-05T12:00:00Z'
    },
    {
      id: 'ord_002',
      orderNumber: 'ORD-2025-1032',
      date: '2025-10-25T09:15:00Z',
      status: 'Shipped',
      total: 7500,
      items: [
        { name: 'Training Kit Professional', quantity: 1, price: 7500, image: '/api/placeholder/60/60' }
      ],
      trackingNumber: 'PK2025102501'
    },
    {
      id: 'ord_003',
      orderNumber: 'ORD-2025-1018',
      date: '2025-10-18T16:45:00Z',
      status: 'Processing',
      total: 3200,
      items: [
        { name: 'Sports Water Bottle', quantity: 2, price: 800, image: '/api/placeholder/60/60' },
        { name: 'Team Badge Set', quantity: 1, price: 1600, image: '/api/placeholder/60/60' }
      ]
    }
  ];

  const wishlistItems: WishlistItem[] = [
    {
      id: 'wish_001',
      productId: 'prod_005',
      name: 'Limited Edition Away Jersey 2024',
      seller: 'Nairobi FC Official Store',
      price: 5500,
      originalPrice: 7000,
      image: '/api/placeholder/120/120',
      inStock: true,
      addedDate: '2025-10-28T00:00:00Z'
    },
    {
      id: 'wish_002',
      productId: 'prod_006',
      name: 'VIP Stadium Tour Experience',
      seller: 'Kasarani Stadium',
      price: 15000,
      image: '/api/placeholder/120/120',
      inStock: true,
      addedDate: '2025-10-20T00:00:00Z'
    },
    {
      id: 'wish_003',
      productId: 'prod_007',
      name: 'Professional Football Boots',
      seller: 'Elite Sports Gear',
      price: 12500,
      originalPrice: 15000,
      image: '/api/placeholder/120/120',
      inStock: false,
      addedDate: '2025-10-15T00:00:00Z'
    }
  ];

  const addresses: Address[] = [
    {
      id: 'addr_001',
      label: 'Home',
      firstName: 'John',
      lastName: 'Kamau',
      phone: '+254 701 234 567',
      street: 'Kenyatta Avenue, Building 15, Apt 3B',
      city: 'Nairobi',
      county: 'Nairobi',
      postalCode: '00100',
      isDefault: true
    },
    {
      id: 'addr_002',
      label: 'Office',
      firstName: 'John',
      lastName: 'Kamau',
      phone: '+254 701 234 567',
      street: 'Moi Avenue, Plaza Center, Floor 5',
      city: 'Nairobi',
      county: 'Nairobi',
      postalCode: '00200',
      isDefault: false
    }
  ];

  const notifications: Notification[] = [
    {
      id: 'notif_001',
      type: 'order',
      title: 'Order Delivered',
      message: 'Your order ORD-2025-1045 has been successfully delivered',
      date: '2025-11-01T10:30:00Z',
      read: false,
      actionUrl: '/orders/ord_001'
    },
    {
      id: 'notif_002',
      type: 'promotion',
      title: 'Weekend Sale - 25% Off',
      message: 'Special weekend discount on all team merchandise',
      date: '2025-10-31T08:00:00Z',
      read: false
    },
    {
      id: 'notif_003',
      type: 'system',
      title: 'Profile Updated',
      message: 'Your shipping address has been successfully updated',
      date: '2025-10-30T14:22:00Z',
      read: true
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Avatar className="w-16 h-16">
            <AvatarImage src={customerProfile.avatar} />
            <AvatarFallback>
              {customerProfile.firstName[0]}{customerProfile.lastName[0]}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-3xl font-bold">
              Welcome back, {customerProfile.firstName}!
            </h1>
            <p className="text-muted-foreground flex items-center gap-2">
              <span className={`w-3 h-3 rounded-full ${getTierColor(customerProfile.loyaltyTier)}`}></span>
              {customerProfile.loyaltyTier} Member • {customerProfile.loyaltyPoints} points
              {customerProfile.verified && <span className="text-green-600">✓ Verified</span>}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">📧 Support</Button>
          <Button>🛒 Continue Shopping</Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">{customerProfile.totalOrders}</div>
                <div className="text-sm text-muted-foreground">Total Orders</div>
              </div>
              <div className="text-2xl">📦</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">{formatCurrency(customerProfile.totalSpent)}</div>
                <div className="text-sm text-muted-foreground">Total Spent</div>
              </div>
              <div className="text-2xl">💰</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">{customerProfile.loyaltyPoints}</div>
                <div className="text-sm text-muted-foreground">Loyalty Points</div>
              </div>
              <div className="text-2xl">⭐</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">{wishlistItems.length}</div>
                <div className="text-sm text-muted-foreground">Wishlist Items</div>
              </div>
              <div className="text-2xl">❤️</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">📊 Overview</TabsTrigger>
          <TabsTrigger value="orders">📦 Orders</TabsTrigger>
          <TabsTrigger value="wishlist">❤️ Wishlist</TabsTrigger>
          <TabsTrigger value="addresses">📍 Addresses</TabsTrigger>
          <TabsTrigger value="profile">👤 Profile</TabsTrigger>
          <TabsTrigger value="settings">⚙️ Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Orders */}
            <Card>
              <CardHeader>
                <CardTitle>📦 Recent Orders</CardTitle>
                <CardDescription>Your latest purchases and their status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentOrders.slice(0, 3).map(order => (
                    <div key={order.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-semibold">{order.orderNumber}</div>
                        <Badge className={getStatusColor(order.status)} variant="secondary">
                          {order.status}
                        </Badge>
                      </div>
                      
                      <div className="text-sm text-muted-foreground mb-3">
                        {new Date(order.date).toLocaleDateString()} • {formatCurrency(order.total)}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {order.items.slice(0, 3).map((item, index) => (
                          <img 
                            key={index}
                            src={item.image} 
                            alt={item.name}
                            className="w-10 h-10 rounded object-cover"
                          />
                        ))}
                        {order.items.length > 3 && (
                          <div className="text-xs text-muted-foreground">
                            +{order.items.length - 3} more
                          </div>
                        )}
                      </div>

                      {order.trackingNumber && (
                        <div className="mt-3 pt-3 border-t">
                          <div className="text-xs text-muted-foreground">
                            Tracking: {order.trackingNumber}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                  
                  <Button variant="outline" className="w-full">
                    View All Orders →
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Loyalty Program */}
            <Card>
              <CardHeader>
                <CardTitle>⭐ Loyalty Rewards</CardTitle>
                <CardDescription>Your membership benefits and points</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className={`w-20 h-20 rounded-full ${getTierColor(customerProfile.loyaltyTier)} mx-auto mb-4 flex items-center justify-center text-white text-2xl font-bold`}>
                      {customerProfile.loyaltyTier[0]}
                    </div>
                    <div className="text-xl font-bold">{customerProfile.loyaltyTier} Member</div>
                    <div className="text-muted-foreground">
                      {customerProfile.loyaltyPoints} points available
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>Points to next tier</span>
                      <span className="font-medium">550 points</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`${getTierColor(customerProfile.loyaltyTier)} h-2 rounded-full`} 
                        style={{ width: '75%' }}
                      ></div>
                    </div>
                  </div>

                  <div className="bg-green-50 p-3 rounded-lg">
                    <div className="text-sm font-medium text-green-800">Available Rewards:</div>
                    <ul className="text-sm text-green-700 mt-1 space-y-1">
                      <li>• KES 500 off (1000 points)</li>
                      <li>• Free shipping (800 points)</li>
                      <li>• VIP access pass (2000 points)</li>
                    </ul>
                  </div>

                  <Button className="w-full">Redeem Points</Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>🚀 Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button variant="outline" className="h-20 flex flex-col gap-2">
                  <div className="text-2xl">🔄</div>
                  <div className="text-sm">Reorder</div>
                </Button>
                <Button variant="outline" className="h-20 flex flex-col gap-2">
                  <div className="text-2xl">📋</div>
                  <div className="text-sm">Track Order</div>
                </Button>
                <Button variant="outline" className="h-20 flex flex-col gap-2">
                  <div className="text-2xl">💬</div>
                  <div className="text-sm">Live Chat</div>
                </Button>
                <Button variant="outline" className="h-20 flex flex-col gap-2">
                  <div className="text-2xl">🎁</div>
                  <div className="text-sm">Gift Cards</div>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orders" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>📦 Order History</CardTitle>
              <CardDescription>All your past and current orders</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {recentOrders.map(order => (
                  <div key={order.id} className="border rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <div className="font-semibold text-lg">{order.orderNumber}</div>
                        <div className="text-sm text-muted-foreground">
                          Placed on {new Date(order.date).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className={getStatusColor(order.status)} variant="secondary">
                          {order.status}
                        </Badge>
                        <div className="text-lg font-bold text-green-600 mt-1">
                          {formatCurrency(order.total)}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {order.items.map((item, index) => (
                        <div key={index} className="flex items-center gap-4">
                          <img 
                            src={item.image} 
                            alt={item.name}
                            className="w-16 h-16 rounded object-cover"
                          />
                          <div className="flex-1">
                            <div className="font-medium">{item.name}</div>
                            <div className="text-sm text-muted-foreground">
                              Qty: {item.quantity} × {formatCurrency(item.price)}
                            </div>
                          </div>
                          <div className="text-right font-semibold">
                            {formatCurrency(item.price * item.quantity)}
                          </div>
                        </div>
                      ))}
                    </div>

                    {order.trackingNumber && (
                      <div className="mt-4 pt-4 border-t">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-sm font-medium">Tracking Number</div>
                            <div className="font-mono text-sm">{order.trackingNumber}</div>
                          </div>
                          <Button variant="outline" size="sm">
                            🔍 Track Package
                          </Button>
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2 mt-4">
                      <Button variant="outline" size="sm">📧 Contact Seller</Button>
                      <Button variant="outline" size="sm">🔄 Reorder</Button>
                      <Button variant="outline" size="sm">📄 Invoice</Button>
                      {order.status === 'Delivered' && (
                        <Button variant="outline" size="sm">⭐ Write Review</Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="wishlist" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>❤️ My Wishlist</CardTitle>
              <CardDescription>Items you've saved for later</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {wishlistItems.map(item => (
                  <div key={item.id} className="border rounded-lg p-4">
                    <div className="relative mb-4">
                      <img 
                        src={item.image} 
                        alt={item.name}
                        className="w-full h-48 object-cover rounded"
                      />
                      {!item.inStock && (
                        <div className="absolute inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center rounded">
                          <span className="text-white font-semibold">Out of Stock</span>
                        </div>
                      )}
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="absolute top-2 right-2 bg-white hover:bg-red-50 text-red-600"
                      >
                        🗑️
                      </Button>
                    </div>

                    <div className="space-y-2">
                      <h3 className="font-semibold line-clamp-2">{item.name}</h3>
                      <p className="text-sm text-muted-foreground">by {item.seller}</p>
                      
                      <div className="flex items-center gap-2">
                        <div className="text-lg font-bold text-green-600">
                          {formatCurrency(item.price)}
                        </div>
                        {item.originalPrice && (
                          <div className="text-sm text-muted-foreground line-through">
                            {formatCurrency(item.originalPrice)}
                          </div>
                        )}
                      </div>

                      <div className="text-xs text-muted-foreground">
                        Added on {new Date(item.addedDate).toLocaleDateString()}
                      </div>

                      <div className="flex gap-2 mt-3">
                        <Button 
                          className="flex-1" 
                          disabled={!item.inStock}
                        >
                          🛒 Add to Cart
                        </Button>
                        <Button variant="outline" size="sm">
                          👁️
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {wishlistItems.length === 0 && (
                <div className="text-center py-8">
                  <div className="text-6xl mb-4">💔</div>
                  <h3 className="text-lg font-semibold mb-2">Your wishlist is empty</h3>
                  <p className="text-muted-foreground mb-4">Save items you love for easy access later</p>
                  <Button>Start Shopping</Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="addresses" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">📍 Shipping Addresses</h2>
            <Button>➕ Add New Address</Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {addresses.map(address => (
              <Card key={address.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">
                      {address.label}
                      {address.isDefault && (
                        <Badge variant="secondary" className="ml-2">Default</Badge>
                      )}
                    </CardTitle>
                    <div className="flex gap-1">
                      <Button variant="outline" size="sm">✏️</Button>
                      <Button variant="outline" size="sm">🗑️</Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-sm space-y-1">
                    <div className="font-medium">{address.firstName} {address.lastName}</div>
                    <div>{address.street}</div>
                    <div>{address.city}, {address.county} {address.postalCode}</div>
                    <div>{address.phone}</div>
                  </div>
                  
                  {!address.isDefault && (
                    <Button variant="outline" size="sm" className="mt-3 w-full">
                      Set as Default
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>👤 Personal Information</CardTitle>
                  <CardDescription>Manage your account details</CardDescription>
                </div>
                <Button 
                  variant="outline"
                  onClick={() => setEditingProfile(!editingProfile)}
                >
                  {editingProfile ? 'Cancel' : 'Edit Profile'}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label>First Name</Label>
                  <Input 
                    value={customerProfile.firstName}
                    disabled={!editingProfile}
                  />
                </div>
                <div>
                  <Label>Last Name</Label>
                  <Input 
                    value={customerProfile.lastName}
                    disabled={!editingProfile}
                  />
                </div>
                <div>
                  <Label>Email Address</Label>
                  <Input 
                    value={customerProfile.email}
                    disabled={!editingProfile}
                  />
                </div>
                <div>
                  <Label>Phone Number</Label>
                  <Input 
                    value={customerProfile.phone}
                    disabled={!editingProfile}
                  />
                </div>
              </div>

              {editingProfile && (
                <div className="flex gap-2 mt-6">
                  <Button>Save Changes</Button>
                  <Button variant="outline" onClick={() => setEditingProfile(false)}>
                    Cancel
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Account Security */}
          <Card>
            <CardHeader>
              <CardTitle>🔒 Account Security</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 border rounded">
                <div>
                  <div className="font-medium">Password</div>
                  <div className="text-sm text-muted-foreground">Last changed 3 months ago</div>
                </div>
                <Button variant="outline" size="sm">Change Password</Button>
              </div>

              <div className="flex items-center justify-between p-3 border rounded">
                <div>
                  <div className="font-medium">Two-Factor Authentication</div>
                  <div className="text-sm text-muted-foreground">Add extra security to your account</div>
                </div>
                <Switch />
              </div>

              <div className="flex items-center justify-between p-3 border rounded">
                <div>
                  <div className="font-medium">Login Sessions</div>
                  <div className="text-sm text-muted-foreground">Manage your active sessions</div>
                </div>
                <Button variant="outline" size="sm">View Sessions</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>📧 Communication Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Order Updates</div>
                  <div className="text-sm text-muted-foreground">Notifications about your orders</div>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Promotional Emails</div>
                  <div className="text-sm text-muted-foreground">Special offers and discounts</div>
                </div>
                <Switch />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">SMS Notifications</div>
                  <div className="text-sm text-muted-foreground">Text messages for important updates</div>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Product Recommendations</div>
                  <div className="text-sm text-muted-foreground">Personalized product suggestions</div>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>🌍 Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Preferred Language</Label>
                <Select defaultValue="en">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="sw">Kiswahili</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Currency</Label>
                <Select defaultValue="kes">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="kes">Kenyan Shilling (KES)</SelectItem>
                    <SelectItem value="usd">US Dollar (USD)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Favorite Teams</Label>
                <div className="flex gap-2 mt-2">
                  <Badge variant="secondary">Nairobi FC</Badge>
                  <Badge variant="secondary">Gor Mahia</Badge>
                  <Button variant="outline" size="sm">+ Add Team</Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Account Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-red-600">⚠️ Account Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-3 border border-red-200 rounded">
                <div className="font-medium text-red-800">Download Your Data</div>
                <div className="text-sm text-red-600 mb-2">Get a copy of all your account data</div>
                <Button variant="outline" size="sm">Request Data Export</Button>
              </div>

              <div className="p-3 border border-red-200 rounded">
                <div className="font-medium text-red-800">Delete Account</div>
                <div className="text-sm text-red-600 mb-2">Permanently delete your account and all data</div>
                <Button variant="destructive" size="sm">Delete Account</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}