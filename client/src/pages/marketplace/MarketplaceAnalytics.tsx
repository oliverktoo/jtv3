import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface AnalyticsMetric {
  id: string;
  name: string;
  value: number;
  change: number;
  changeType: 'increase' | 'decrease' | 'stable';
  format: 'currency' | 'number' | 'percentage';
  period: string;
}

interface RevenueData {
  period: string;
  revenue: number;
  orders: number;
  products: number;
  commission: number;
}

interface ProductPerformance {
  id: string;
  name: string;
  category: string;
  seller: string;
  revenue: number;
  sales: number;
  views: number;
  conversionRate: number;
  rating: number;
  trend: 'up' | 'down' | 'stable';
}

interface CustomerInsight {
  id: string;
  metric: string;
  value: string;
  description: string;
  trend: number;
}

interface GeographicData {
  county: string;
  revenue: number;
  orders: number;
  customers: number;
  growth: number;
}

export default function MarketplaceAnalytics() {
  const [selectedPeriod, setSelectedPeriod] = useState("7d");
  const [selectedMetric, setSelectedMetric] = useState("revenue");
  const [activeTab, setActiveTab] = useState("overview");

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-KE').format(num);
  };

  const getChangeColor = (changeType: string) => {
    switch (changeType) {
      case 'increase': return 'text-green-600';
      case 'decrease': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getChangeIcon = (changeType: string) => {
    switch (changeType) {
      case 'increase': return '📈';
      case 'decrease': return '📉';
      default: return '➖';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return '🔼';
      case 'down': return '🔽';
      default: return '➡️';
    }
  };

  // Sample analytics data
  const keyMetrics: AnalyticsMetric[] = [
    {
      id: 'revenue',
      name: 'Total Revenue',
      value: 12500000,
      change: 18.5,
      changeType: 'increase',
      format: 'currency',
      period: 'Last 30 days'
    },
    {
      id: 'orders',
      name: 'Total Orders',
      value: 2456,
      change: 12.3,
      changeType: 'increase',
      format: 'number',
      period: 'Last 30 days'
    },
    {
      id: 'conversion',
      name: 'Conversion Rate',
      value: 4.2,
      change: -2.1,
      changeType: 'decrease',
      format: 'percentage',
      period: 'Last 30 days'
    },
    {
      id: 'aov',
      name: 'Avg Order Value',
      value: 5089,
      change: 7.8,
      changeType: 'increase',
      format: 'currency',
      period: 'Last 30 days'
    },
    {
      id: 'customers',
      name: 'Active Customers',
      value: 18734,
      change: 15.2,
      changeType: 'increase',
      format: 'number',
      period: 'Last 30 days'
    },
    {
      id: 'sellers',
      name: 'Active Sellers',
      value: 342,
      change: 8.7,
      changeType: 'increase',
      format: 'number',
      period: 'Last 30 days'
    }
  ];

  const revenueData: RevenueData[] = [
    { period: 'Week 1', revenue: 2800000, orders: 456, products: 89, commission: 140000 },
    { period: 'Week 2', revenue: 3200000, orders: 523, products: 95, commission: 160000 },
    { period: 'Week 3', revenue: 2900000, orders: 478, products: 87, commission: 145000 },
    { period: 'Week 4', revenue: 3600000, orders: 599, products: 102, commission: 180000 }
  ];

  const topProducts: ProductPerformance[] = [
    {
      id: 'p001',
      name: 'Official Home Jersey 2024',
      category: 'Team Merchandise',
      seller: 'Nairobi FC Official Store',
      revenue: 890000,
      sales: 198,
      views: 4567,
      conversionRate: 4.3,
      rating: 4.8,
      trend: 'up'
    },
    {
      id: 'p002',
      name: 'Championship Scarf Collection',
      category: 'Fan Accessories',
      seller: 'Sports Emporium',
      revenue: 456000,
      sales: 228,
      views: 3890,
      conversionRate: 5.9,
      rating: 4.6,
      trend: 'up'
    },
    {
      id: 'p003',
      name: 'Professional Training Kit',
      category: 'Sports Equipment',
      seller: 'Elite Sports Gear',
      revenue: 675000,
      sales: 89,
      views: 2345,
      conversionRate: 3.8,
      rating: 4.9,
      trend: 'stable'
    },
    {
      id: 'p004',
      name: 'Match Day Experience Package',
      category: 'Experiences',
      seller: 'Kasarani Stadium',
      revenue: 1200000,
      sales: 45,
      views: 1678,
      conversionRate: 2.7,
      rating: 5.0,
      trend: 'up'
    }
  ];

  const customerInsights: CustomerInsight[] = [
    {
      id: 'retention',
      metric: 'Customer Retention',
      value: '72%',
      description: 'Customers who made repeat purchases',
      trend: 5.2
    },
    {
      id: 'lifetime',
      metric: 'Customer Lifetime Value',
      value: 'KES 24,500',
      description: 'Average customer spend over lifetime',
      trend: 12.8
    },
    {
      id: 'acquisition',
      metric: 'Customer Acquisition Cost',
      value: 'KES 1,250',
      description: 'Average cost to acquire new customer',
      trend: -8.3
    },
    {
      id: 'satisfaction',
      metric: 'Customer Satisfaction',
      value: '4.7/5.0',
      description: 'Average rating across all interactions',
      trend: 3.1
    }
  ];

  const geographicData: GeographicData[] = [
    { county: 'Nairobi', revenue: 4500000, orders: 892, customers: 5678, growth: 18.2 },
    { county: 'Kiambu', revenue: 1800000, orders: 356, customers: 2234, growth: 15.7 },
    { county: 'Machakos', revenue: 1200000, orders: 234, customers: 1456, growth: 22.1 },
    { county: 'Nakuru', revenue: 980000, orders: 198, customers: 1123, growth: 12.9 },
    { county: 'Mombasa', revenue: 2100000, orders: 423, customers: 2890, growth: 20.5 },
    { county: 'Kisumu', revenue: 850000, orders: 167, customers: 987, growth: 16.8 }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">📊 Marketplace Analytics</h1>
          <p className="text-muted-foreground">Comprehensive business intelligence and performance insights</p>
        </div>
        <div className="flex gap-2">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">Last 24h</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">📥 Export Report</Button>
          <Button>📧 Schedule Report</Button>
        </div>
      </div>

      {/* Key Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {keyMetrics.map(metric => (
          <Card key={metric.id}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {metric.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">
                  {metric.format === 'currency' && formatCurrency(metric.value)}
                  {metric.format === 'number' && formatNumber(metric.value)}
                  {metric.format === 'percentage' && `${metric.value}%`}
                </div>
                <div className={`flex items-center text-sm ${getChangeColor(metric.changeType)}`}>
                  <span className="mr-1">{getChangeIcon(metric.changeType)}</span>
                  {Math.abs(metric.change)}%
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {metric.period}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">📈 Overview</TabsTrigger>
          <TabsTrigger value="products">🛍️ Products</TabsTrigger>
          <TabsTrigger value="customers">👥 Customers</TabsTrigger>
          <TabsTrigger value="geography">🗺️ Geography</TabsTrigger>
          <TabsTrigger value="forecasting">🔮 Forecasting</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Revenue Trends */}
          <Card>
            <CardHeader>
              <CardTitle>💰 Revenue Trends</CardTitle>
              <CardDescription>Weekly revenue and commission breakdown</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {revenueData.map((data, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold">{data.period}</h3>
                      <div className="text-xl font-bold text-green-600">
                        {formatCurrency(data.revenue)}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <div className="text-muted-foreground">Orders</div>
                        <div className="font-semibold">{formatNumber(data.orders)}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Products Sold</div>
                        <div className="font-semibold">{formatNumber(data.products)}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Platform Commission</div>
                        <div className="font-semibold text-blue-600">
                          {formatCurrency(data.commission)}
                        </div>
                      </div>
                    </div>
                    
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                      <div 
                        className="bg-green-600 h-2 rounded-full" 
                        style={{ width: `${(data.revenue / 4000000) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Insights */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>🎯 Performance Highlights</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div>
                      <div className="font-semibold text-green-800">Top Revenue Day</div>
                      <div className="text-sm text-green-600">Sunday generated 32% of weekly sales</div>
                    </div>
                    <div className="text-2xl">🏆</div>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div>
                      <div className="font-semibold text-blue-800">Best Category</div>
                      <div className="text-sm text-blue-600">Team merchandise leads with 45% share</div>
                    </div>
                    <div className="text-2xl">⚽</div>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                    <div>
                      <div className="font-semibold text-purple-800">Growth Opportunity</div>
                      <div className="text-sm text-purple-600">Sports equipment has 78% conversion potential</div>
                    </div>
                    <div className="text-2xl">🚀</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>⚠️ Action Required</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                    <div>
                      <div className="font-semibold text-yellow-800">Low Stock Alert</div>
                      <div className="text-sm text-yellow-600">23 products need restocking</div>
                    </div>
                    <Button size="sm" variant="outline">View</Button>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                    <div>
                      <div className="font-semibold text-red-800">Declining Products</div>
                      <div className="text-sm text-red-600">8 products showing sales decline</div>
                    </div>
                    <Button size="sm" variant="outline">Review</Button>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                    <div>
                      <div className="font-semibold text-orange-800">Seller Issues</div>
                      <div className="text-sm text-orange-600">5 sellers need verification updates</div>
                    </div>
                    <Button size="sm" variant="outline">Contact</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="products" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>🏅 Top Performing Products</CardTitle>
              <CardDescription>Products ranked by revenue and performance metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topProducts.map((product, index) => (
                  <div key={product.id} className="border rounded-lg p-4">
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-bold">
                        {index + 1}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-lg">{product.name}</h3>
                          <Badge variant="secondary">{product.category}</Badge>
                          <span className="text-xl">{getTrendIcon(product.trend)}</span>
                        </div>
                        
                        <p className="text-sm text-muted-foreground mb-3">
                          Sold by {product.seller}
                        </p>
                        
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                          <div>
                            <div className="text-muted-foreground">Revenue</div>
                            <div className="font-semibold text-green-600">
                              {formatCurrency(product.revenue)}
                            </div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">Sales</div>
                            <div className="font-semibold">{formatNumber(product.sales)}</div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">Views</div>
                            <div className="font-semibold">{formatNumber(product.views)}</div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">Conversion</div>
                            <div className="font-semibold text-blue-600">
                              {product.conversionRate}%
                            </div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">Rating</div>
                            <div className="font-semibold">
                              {product.rating}⭐
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <Button variant="outline" size="sm">📊 View Details</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="customers" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>👥 Customer Intelligence</CardTitle>
              <CardDescription>Deep insights into customer behavior and preferences</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {customerInsights.map(insight => (
                  <div key={insight.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">{insight.metric}</h3>
                      <div className={`flex items-center text-sm ${insight.trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        <span className="mr-1">{insight.trend >= 0 ? '📈' : '📉'}</span>
                        {Math.abs(insight.trend)}%
                      </div>
                    </div>
                    
                    <div className="text-2xl font-bold mb-1">{insight.value}</div>
                    <p className="text-sm text-muted-foreground">{insight.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Customer Segments */}
          <Card>
            <CardHeader>
              <CardTitle>🎯 Customer Segments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="border rounded-lg p-4 bg-blue-50">
                    <div className="text-center">
                      <div className="text-3xl mb-2">🏆</div>
                      <div className="text-xl font-bold">VIP Customers</div>
                      <div className="text-2xl font-bold text-blue-600 my-2">342</div>
                      <div className="text-sm text-muted-foreground">
                        Spend over KES 50,000 annually
                      </div>
                    </div>
                  </div>
                  
                  <div className="border rounded-lg p-4 bg-green-50">
                    <div className="text-center">
                      <div className="text-3xl mb-2">🎉</div>
                      <div className="text-xl font-bold">Regular Buyers</div>
                      <div className="text-2xl font-bold text-green-600 my-2">2,156</div>
                      <div className="text-sm text-muted-foreground">
                        3+ purchases in last 6 months
                      </div>
                    </div>
                  </div>
                  
                  <div className="border rounded-lg p-4 bg-yellow-50">
                    <div className="text-center">
                      <div className="text-3xl mb-2">🌱</div>
                      <div className="text-xl font-bold">New Customers</div>
                      <div className="text-2xl font-bold text-yellow-600 my-2">1,489</div>
                      <div className="text-sm text-muted-foreground">
                        First purchase in last 30 days
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="geography" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>🗺️ Geographic Performance</CardTitle>
              <CardDescription>Revenue and customer distribution across Kenya</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {geographicData.map(location => (
                  <div key={location.county} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-lg">{location.county} County</h3>
                        <div className={`text-sm ${location.growth >= 15 ? 'text-green-600' : 'text-blue-600'}`}>
                          Growth: {location.growth}% ↗️
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-green-600">
                          {formatCurrency(location.revenue)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {formatNumber(location.orders)} orders
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <div className="text-muted-foreground">Customers</div>
                        <div className="font-semibold">{formatNumber(location.customers)}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Avg Order</div>
                        <div className="font-semibold">
                          {formatCurrency(location.revenue / location.orders)}
                        </div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Market Share</div>
                        <div className="font-semibold">
                          {((location.revenue / 12500000) * 100).toFixed(1)}%
                        </div>
                      </div>
                    </div>
                    
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${(location.revenue / 4500000) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="forecasting" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>🔮 Revenue Forecasting</CardTitle>
              <CardDescription>AI-powered predictions and business projections</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Forecast Summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="border rounded-lg p-4 bg-gradient-to-br from-blue-50 to-blue-100">
                    <div className="text-center">
                      <div className="text-2xl mb-2">📊</div>
                      <div className="text-lg font-semibold">Next Month</div>
                      <div className="text-2xl font-bold text-blue-600 my-2">
                        {formatCurrency(14200000)}
                      </div>
                      <div className="text-sm text-green-600">+13.6% projected growth</div>
                    </div>
                  </div>
                  
                  <div className="border rounded-lg p-4 bg-gradient-to-br from-green-50 to-green-100">
                    <div className="text-center">
                      <div className="text-2xl mb-2">📈</div>
                      <div className="text-lg font-semibold">Next Quarter</div>
                      <div className="text-2xl font-bold text-green-600 my-2">
                        {formatCurrency(43800000)}
                      </div>
                      <div className="text-sm text-green-600">+18.2% projected growth</div>
                    </div>
                  </div>
                  
                  <div className="border rounded-lg p-4 bg-gradient-to-br from-purple-50 to-purple-100">
                    <div className="text-center">
                      <div className="text-2xl mb-2">🎯</div>
                      <div className="text-lg font-semibold">Year End</div>
                      <div className="text-2xl font-bold text-purple-600 my-2">
                        {formatCurrency(189000000)}
                      </div>
                      <div className="text-sm text-green-600">+22.5% projected growth</div>
                    </div>
                  </div>
                </div>

                {/* AI Insights */}
                <div className="border rounded-lg p-6 bg-gradient-to-r from-purple-50 to-blue-50">
                  <h3 className="text-lg font-semibold mb-4">🤖 AI Business Insights</h3>
                  
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="text-xl">🔍</div>
                      <div>
                        <div className="font-semibold">Market Opportunity</div>
                        <div className="text-sm text-muted-foreground">
                          Sports equipment category shows 89% growth potential based on current trends and seasonal patterns
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="text-xl">📅</div>
                      <div>
                        <div className="font-semibold">Seasonal Prediction</div>
                        <div className="text-sm text-muted-foreground">
                          Expect 34% revenue spike during football season (March-June) - recommend increasing inventory
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="text-xl">💡</div>
                      <div>
                        <div className="font-semibold">Strategic Recommendation</div>
                        <div className="text-sm text-muted-foreground">
                          Partner with 3 more premium teams to expand merchandise offerings and capture additional market share
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Risk Factors */}
                <div className="border rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-4">⚠️ Risk Assessment</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <h4 className="font-medium text-red-700">Potential Challenges</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                          <span>Economic fluctuations affecting purchasing power</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                          <span>Seasonal variations in sports activities</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                          <span>Increased competition from online platforms</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <h4 className="font-medium text-green-700">Mitigation Strategies</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                          <span>Diversify product categories and price points</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                          <span>Implement flexible payment and loyalty programs</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                          <span>Enhance customer experience and service quality</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}