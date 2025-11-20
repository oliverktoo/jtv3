import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  subcategory: string;
  sku: string;
  price: number;
  compareAtPrice?: number;
  cost: number;
  inventory: {
    quantity: number;
    trackQuantity: boolean;
    lowStockThreshold: number;
    allowBackorders: boolean;
  };
  images: string[];
  variants: ProductVariant[];
  specifications: { [key: string]: string };
  tags: string[];
  status: 'Active' | 'Draft' | 'Archived' | 'Out of Stock';
  visibility: 'Public' | 'Private' | 'Hidden';
  seo: {
    title: string;
    description: string;
    keywords: string[];
  };
  shipping: {
    weight: number;
    dimensions: {
      length: number;
      width: number;
      height: number;
    };
    requiresShipping: boolean;
    freeShipping: boolean;
  };
  performance: {
    views: number;
    sales: number;
    revenue: number;
    conversionRate: number;
    rating: number;
    reviewCount: number;
  };
  createdDate: string;
  lastModified: string;
}

interface ProductVariant {
  id: string;
  name: string;
  option: string; // Size, Color, Style, etc.
  value: string; // L, Red, Classic, etc.
  sku: string;
  price?: number;
  inventory: number;
  image?: string;
}

interface ProductCategory {
  id: string;
  name: string;
  subcategories: {
    id: string;
    name: string;
  }[];
}

interface ProductFormData {
  name: string;
  description: string;
  category: string;
  subcategory: string;
  price: string;
  compareAtPrice: string;
  cost: string;
  quantity: string;
  sku: string;
  weight: string;
  tags: string;
}

export default function ProductManagement() {
  const [activeTab, setActiveTab] = useState("list");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showNewProductForm, setShowNewProductForm] = useState(false);
  const [formData, setFormData] = useState<ProductFormData>({
    name: "",
    description: "",
    category: "",
    subcategory: "",
    price: "",
    compareAtPrice: "",
    cost: "",
    quantity: "",
    sku: "",
    weight: "",
    tags: ""
  });

  const productCategories: ProductCategory[] = [
    {
      id: 'apparel',
      name: 'Team Apparel',
      subcategories: [
        { id: 'jerseys', name: 'Jerseys & Uniforms' },
        { id: 'casual', name: 'Casual Wear' },
        { id: 'accessories', name: 'Accessories' },
        { id: 'footwear', name: 'Footwear' }
      ]
    },
    {
      id: 'equipment',
      name: 'Sports Equipment',
      subcategories: [
        { id: 'balls', name: 'Balls & Equipment' },
        { id: 'training', name: 'Training Gear' },
        { id: 'protective', name: 'Protective Gear' },
        { id: 'maintenance', name: 'Maintenance' }
      ]
    },
    {
      id: 'memorabilia',
      name: 'Memorabilia',
      subcategories: [
        { id: 'signed', name: 'Signed Items' },
        { id: 'collectibles', name: 'Collectibles' },
        { id: 'photos', name: 'Photos & Prints' },
        { id: 'trophies', name: 'Trophies & Awards' }
      ]
    },
    {
      id: 'fan_gear',
      name: 'Fan Gear',
      subcategories: [
        { id: 'scarves', name: 'Scarves & Banners' },
        { id: 'caps', name: 'Caps & Hats' },
        { id: 'flags', name: 'Flags & Pennants' },
        { id: 'souvenirs', name: 'Souvenirs' }
      ]
    }
  ];

  const products: Product[] = [
    {
      id: 'prod_001',
      name: 'Official Home Jersey 2024',
      description: 'Official Nairobi FC home jersey for the 2024 season. Premium quality fabric with moisture-wicking technology.',
      category: 'apparel',
      subcategory: 'jerseys',
      sku: 'NFC-HJ24-001',
      price: 4500,
      compareAtPrice: 5500,
      cost: 2250,
      inventory: {
        quantity: 145,
        trackQuantity: true,
        lowStockThreshold: 20,
        allowBackorders: false
      },
      images: ['/jersey-home-front.jpg', '/jersey-home-back.jpg'],
      variants: [
        { id: 'v1', name: 'Size', option: 'Size', value: 'S', sku: 'NFC-HJ24-S', inventory: 25 },
        { id: 'v2', name: 'Size', option: 'Size', value: 'M', sku: 'NFC-HJ24-M', inventory: 45 },
        { id: 'v3', name: 'Size', option: 'Size', value: 'L', sku: 'NFC-HJ24-L', inventory: 35 },
        { id: 'v4', name: 'Size', option: 'Size', value: 'XL', sku: 'NFC-HJ24-XL', inventory: 25 },
        { id: 'v5', name: 'Size', option: 'Size', value: 'XXL', sku: 'NFC-HJ24-XXL', inventory: 15 }
      ],
      specifications: {
        'Material': '100% Polyester',
        'Care Instructions': 'Machine wash cold',
        'Fit': 'Athletic Fit',
        'Origin': 'Made in Kenya'
      },
      tags: ['jersey', 'official', '2024', 'home', 'nairobi fc'],
      status: 'Active',
      visibility: 'Public',
      seo: {
        title: 'Official Nairobi FC Home Jersey 2024 - Premium Quality',
        description: 'Get the official Nairobi FC 2024 home jersey. Premium quality with moisture-wicking technology. Available in all sizes.',
        keywords: ['nairobi fc', 'jersey', 'home jersey', '2024', 'official merchandise']
      },
      shipping: {
        weight: 0.3,
        dimensions: { length: 30, width: 25, height: 2 },
        requiresShipping: true,
        freeShipping: false
      },
      performance: {
        views: 2450,
        sales: 89,
        revenue: 400500,
        conversionRate: 3.6,
        rating: 4.8,
        reviewCount: 67
      },
      createdDate: '2024-02-15T10:00:00Z',
      lastModified: '2024-10-30T15:30:00Z'
    },
    {
      id: 'prod_002',
      name: 'Championship Celebration Scarf',
      description: 'Limited edition scarf commemorating Nairobi FC\'s championship victory. Premium knit with embroidered details.',
      category: 'fan_gear',
      subcategory: 'scarves',
      sku: 'NFC-CS24-001',
      price: 2000,
      compareAtPrice: 2500,
      cost: 800,
      inventory: {
        quantity: 87,
        trackQuantity: true,
        lowStockThreshold: 15,
        allowBackorders: true
      },
      images: ['/scarf-championship.jpg'],
      variants: [],
      specifications: {
        'Material': 'Acrylic Knit',
        'Size': '140cm x 18cm',
        'Care': 'Hand wash recommended',
        'Edition': 'Limited Edition'
      },
      tags: ['scarf', 'championship', 'limited edition', 'memorabilia'],
      status: 'Active',
      visibility: 'Public',
      seo: {
        title: 'Championship Scarf - Limited Edition Nairobi FC',
        description: 'Celebrate Nairobi FC\'s championship with this limited edition premium scarf. Perfect for fans and collectors.',
        keywords: ['championship scarf', 'nairobi fc', 'limited edition', 'fan gear', 'memorabilia']
      },
      shipping: {
        weight: 0.2,
        dimensions: { length: 25, width: 20, height: 3 },
        requiresShipping: true,
        freeShipping: true
      },
      performance: {
        views: 1850,
        sales: 124,
        revenue: 248000,
        conversionRate: 6.7,
        rating: 4.9,
        reviewCount: 89
      },
      createdDate: '2024-03-10T14:00:00Z',
      lastModified: '2024-10-29T11:15:00Z'
    },
    {
      id: 'prod_003',
      name: 'Signed Match Ball Collection',
      description: 'Authentic match ball signed by the entire 2024 championship team. Comes with certificate of authenticity.',
      category: 'memorabilia',
      subcategory: 'signed',
      sku: 'NFC-SMB24-001',
      price: 15000,
      compareAtPrice: 18000,
      cost: 7500,
      inventory: {
        quantity: 12,
        trackQuantity: true,
        lowStockThreshold: 5,
        allowBackorders: false
      },
      images: ['/signed-ball.jpg', '/certificate.jpg'],
      variants: [],
      specifications: {
        'Ball Type': 'Official Match Ball',
        'Signatures': 'Full Team 2024',
        'Authentication': 'Certificate Included',
        'Display': 'Premium Display Case'
      },
      tags: ['signed', 'match ball', 'authentic', 'collectible', 'certificate'],
      status: 'Active',
      visibility: 'Public',
      seo: {
        title: 'Signed Match Ball - 2024 Championship Team Collection',
        description: 'Own a piece of history with this signed match ball from Nairobi FC\'s championship season. Authenticated and certified.',
        keywords: ['signed ball', 'championship', 'collectible', 'authentic', 'memorabilia']
      },
      shipping: {
        weight: 1.2,
        dimensions: { length: 25, width: 25, height: 25 },
        requiresShipping: true,
        freeShipping: true
      },
      performance: {
        views: 890,
        sales: 23,
        revenue: 345000,
        conversionRate: 2.6,
        rating: 5.0,
        reviewCount: 18
      },
      createdDate: '2024-04-05T09:30:00Z',
      lastModified: '2024-10-28T16:45:00Z'
    },
    {
      id: 'prod_004',
      name: 'Training Water Bottle',
      description: 'Official Nairobi FC training water bottle. BPA-free with ergonomic design and team logo.',
      category: 'equipment',
      subcategory: 'training',
      sku: 'NFC-WB24-001',
      price: 800,
      cost: 300,
      inventory: {
        quantity: 5,
        trackQuantity: true,
        lowStockThreshold: 10,
        allowBackorders: true
      },
      images: ['/water-bottle.jpg'],
      variants: [
        { id: 'v1', name: 'Color', option: 'Color', value: 'Blue', sku: 'NFC-WB24-BLU', inventory: 2 },
        { id: 'v2', name: 'Color', option: 'Color', value: 'White', sku: 'NFC-WB24-WHT', inventory: 3 }
      ],
      specifications: {
        'Capacity': '750ml',
        'Material': 'BPA-Free Plastic',
        'Design': 'Ergonomic Grip',
        'Features': 'Leak-proof Cap'
      },
      tags: ['water bottle', 'training', 'bpa free', 'official'],
      status: 'Out of Stock',
      visibility: 'Public',
      seo: {
        title: 'Official Training Water Bottle - Nairobi FC',
        description: 'Stay hydrated with the official Nairobi FC training water bottle. BPA-free and ergonomic design.',
        keywords: ['water bottle', 'training gear', 'nairobi fc', 'bpa free']
      },
      shipping: {
        weight: 0.1,
        dimensions: { length: 25, width: 8, height: 8 },
        requiresShipping: true,
        freeShipping: false
      },
      performance: {
        views: 650,
        sales: 156,
        revenue: 124800,
        conversionRate: 24.0,
        rating: 4.5,
        reviewCount: 34
      },
      createdDate: '2024-01-20T12:00:00Z',
      lastModified: '2024-10-31T09:00:00Z'
    }
  ];

  const getStatusColor = (status: Product['status']) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-800';
      case 'Draft': return 'bg-yellow-100 text-yellow-800';
      case 'Out of Stock': return 'bg-red-100 text-red-800';
      case 'Archived': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getVisibilityColor = (visibility: Product['visibility']) => {
    switch (visibility) {
      case 'Public': return 'bg-blue-100 text-blue-800';
      case 'Private': return 'bg-purple-100 text-purple-800';
      case 'Hidden': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount: number) => {
    return `KES ${amount.toLocaleString()}`;
  };

  const handleInputChange = (field: keyof ProductFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    // Handle form submission
    setShowNewProductForm(false);
    setFormData({
      name: "",
      description: "",
      category: "",
      subcategory: "",
      price: "",
      compareAtPrice: "",
      cost: "",
      quantity: "",
      sku: "",
      weight: "",
      tags: ""
    });
  };

  const lowStockProducts = products.filter(p => p.inventory.quantity <= p.inventory.lowStockThreshold);
  const outOfStockProducts = products.filter(p => p.status === 'Out of Stock');
  const totalProducts = products.length;
  const activeProducts = products.filter(p => p.status === 'Active').length;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Product Management</h1>
          <p className="text-muted-foreground">Manage your store inventory and product listings</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">📊 Analytics</Button>
          <Button variant="outline">📤 Export</Button>
          <Button onClick={() => setShowNewProductForm(true)}>➕ Add Product</Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">{totalProducts}</div>
            <div className="text-sm text-muted-foreground">Total Products</div>
            <div className="text-xs text-blue-600 mt-1">{activeProducts} active</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">{activeProducts}</div>
            <div className="text-sm text-muted-foreground">Active Products</div>
            <div className="text-xs text-green-600 mt-1">Ready for sale</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-orange-600">{lowStockProducts.length}</div>
            <div className="text-sm text-muted-foreground">Low Stock</div>
            <div className="text-xs text-orange-600 mt-1">Need restocking</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-600">{outOfStockProducts.length}</div>
            <div className="text-sm text-muted-foreground">Out of Stock</div>
            <div className="text-xs text-red-600 mt-1">Immediate attention</div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="list">📋 Product List</TabsTrigger>
          <TabsTrigger value="categories">🏷️ Categories</TabsTrigger>
          <TabsTrigger value="inventory">📦 Inventory</TabsTrigger>
          <TabsTrigger value="analytics">📊 Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="search">Search Products</Label>
                  <Input
                    id="search"
                    placeholder="Search by name or SKU..."
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {productCategories.map(category => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="All Statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
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

          {/* Product List */}
          <Card>
            <CardHeader>
              <CardTitle>Products ({products.length})</CardTitle>
              <CardDescription>Manage your product catalog and inventory</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {products.map(product => (
                  <div key={product.id} className="border rounded-lg p-4">
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                        📷
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold text-lg">{product.name}</h3>
                            <p className="text-sm text-muted-foreground mb-2">{product.description}</p>
                            <div className="flex items-center gap-2 mb-2">
                              <Badge className={getStatusColor(product.status)} variant="secondary">
                                {product.status}
                              </Badge>
                              <Badge className={getVisibilityColor(product.visibility)} variant="secondary">
                                {product.visibility}
                              </Badge>
                              <span className="text-sm text-muted-foreground">SKU: {product.sku}</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-xl font-bold text-green-600">
                              {formatCurrency(product.price)}
                            </div>
                            {product.compareAtPrice && (
                              <div className="text-sm text-muted-foreground line-through">
                                {formatCurrency(product.compareAtPrice)}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
                          <div>
                            <div className="text-sm text-muted-foreground">Inventory</div>
                            <div className={`font-semibold ${product.inventory.quantity <= product.inventory.lowStockThreshold ? 'text-red-600' : 'text-green-600'}`}>
                              {product.inventory.quantity} units
                            </div>
                            {product.inventory.quantity <= product.inventory.lowStockThreshold && (
                              <div className="text-xs text-red-600">Low stock warning</div>
                            )}
                          </div>
                          <div>
                            <div className="text-sm text-muted-foreground">Sales</div>
                            <div className="font-semibold">{product.performance.sales} sold</div>
                            <div className="text-xs text-green-600">{formatCurrency(product.performance.revenue)}</div>
                          </div>
                          <div>
                            <div className="text-sm text-muted-foreground">Rating</div>
                            <div className="font-semibold">{product.performance.rating}⭐</div>
                            <div className="text-xs text-muted-foreground">{product.performance.reviewCount} reviews</div>
                          </div>
                          <div>
                            <div className="text-sm text-muted-foreground">Conversion</div>
                            <div className="font-semibold">{product.performance.conversionRate}%</div>
                            <div className="text-xs text-blue-600">{product.performance.views} views</div>
                          </div>
                        </div>

                        {product.variants.length > 0 && (
                          <div className="mt-4">
                            <div className="text-sm text-muted-foreground mb-2">Variants:</div>
                            <div className="flex flex-wrap gap-2">
                              {product.variants.map(variant => (
                                <Badge key={variant.id} variant="outline" className="text-xs">
                                  {variant.value}: {variant.inventory}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="flex justify-end gap-2 mt-4">
                          <Button variant="outline" size="sm" onClick={() => setSelectedProduct(product)}>
                            👁️ View
                          </Button>
                          <Button variant="outline" size="sm">
                            ✏️ Edit
                          </Button>
                          <Button variant="outline" size="sm">
                            📊 Analytics
                          </Button>
                          <Button variant="outline" size="sm">
                            📦 Inventory
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Product Categories</CardTitle>
              <CardDescription>Organize your products with categories and subcategories</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {productCategories.map(category => (
                  <div key={category.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-semibold">{category.name}</h3>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">Add Subcategory</Button>
                        <Button variant="outline" size="sm">Edit</Button>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {category.subcategories.map(subcategory => (
                        <div key={subcategory.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                          <span>{subcategory.name}</span>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="sm">✏️</Button>
                            <Button variant="ghost" size="sm">🗑️</Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inventory" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Low Stock Alert */}
            <Card>
              <CardHeader>
                <CardTitle className="text-red-600">🚨 Low Stock Alerts</CardTitle>
                <CardDescription>Products that need immediate restocking</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {lowStockProducts.map(product => (
                    <div key={product.id} className="flex items-center justify-between p-3 border border-red-200 rounded">
                      <div>
                        <div className="font-medium">{product.name}</div>
                        <div className="text-sm text-muted-foreground">SKU: {product.sku}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-red-600">{product.inventory.quantity} left</div>
                        <div className="text-xs text-muted-foreground">Threshold: {product.inventory.lowStockThreshold}</div>
                      </div>
                    </div>
                  ))}
                  {lowStockProducts.length === 0 && (
                    <div className="text-center py-4 text-muted-foreground">
                      All products are well-stocked! 🎉
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Inventory Summary */}
            <Card>
              <CardHeader>
                <CardTitle>📊 Inventory Summary</CardTitle>
                <CardDescription>Overview of your current stock levels</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 border rounded">
                      <div className="text-2xl font-bold text-blue-600">{totalProducts}</div>
                      <div className="text-sm text-muted-foreground">Total SKUs</div>
                    </div>
                    <div className="text-center p-3 border rounded">
                      <div className="text-2xl font-bold text-green-600">
                        {products.reduce((sum, p) => sum + p.inventory.quantity, 0)}
                      </div>
                      <div className="text-sm text-muted-foreground">Total Units</div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm">Well Stocked</span>
                      <span className="font-semibold text-green-600">
                        {products.filter(p => p.inventory.quantity > p.inventory.lowStockThreshold).length}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Low Stock</span>
                      <span className="font-semibold text-orange-600">{lowStockProducts.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Out of Stock</span>
                      <span className="font-semibold text-red-600">{outOfStockProducts.length}</span>
                    </div>
                  </div>

                  <div className="pt-4">
                    <Button className="w-full">📈 Inventory Report</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Inventory Actions */}
          <Card>
            <CardHeader>
              <CardTitle>📦 Bulk Inventory Actions</CardTitle>
              <CardDescription>Update multiple products at once</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button variant="outline" className="h-20 flex-col">
                  <div className="text-2xl mb-2">📤</div>
                  <div>Export Inventory</div>
                </Button>
                <Button variant="outline" className="h-20 flex-col">
                  <div className="text-2xl mb-2">📥</div>
                  <div>Import Updates</div>
                </Button>
                <Button variant="outline" className="h-20 flex-col">
                  <div className="text-2xl mb-2">🔄</div>
                  <div>Bulk Update</div>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Performance Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>📈 Performance Overview</CardTitle>
                <CardDescription>Product performance metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 border rounded">
                      <div className="text-2xl font-bold text-green-600">
                        {formatCurrency(products.reduce((sum, p) => sum + p.performance.revenue, 0))}
                      </div>
                      <div className="text-sm text-muted-foreground">Total Revenue</div>
                    </div>
                    <div className="text-center p-3 border rounded">
                      <div className="text-2xl font-bold text-blue-600">
                        {products.reduce((sum, p) => sum + p.performance.sales, 0)}
                      </div>
                      <div className="text-sm text-muted-foreground">Total Sales</div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-semibold">Top Performers</h4>
                    {products
                      .sort((a, b) => b.performance.revenue - a.performance.revenue)
                      .slice(0, 3)
                      .map((product, index) => (
                        <div key={product.id} className="flex items-center justify-between p-3 border rounded">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-bold">
                              {index + 1}
                            </div>
                            <div>
                              <div className="font-medium">{product.name}</div>
                              <div className="text-sm text-muted-foreground">{product.performance.sales} sales</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold text-green-600">{formatCurrency(product.performance.revenue)}</div>
                            <div className="text-sm text-muted-foreground">{product.performance.rating}⭐</div>
                          </div>
                        </div>
                      ))
                    }
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Conversion Analysis */}
            <Card>
              <CardHeader>
                <CardTitle>🎯 Conversion Analysis</CardTitle>
                <CardDescription>Product view and conversion rates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {products.map(product => (
                    <div key={product.id} className="p-3 border rounded">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{product.name}</span>
                        <span className="text-sm font-semibold text-blue-600">{product.performance.conversionRate}%</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
                        <div>Views: {product.performance.views}</div>
                        <div>Sales: {product.performance.sales}</div>
                        <div>Rating: {product.performance.rating}⭐</div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${Math.min(product.performance.conversionRate * 10, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* New Product Form Modal */}
      {showNewProductForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Add New Product</h2>
                <Button variant="outline" onClick={() => setShowNewProductForm(false)}>✖️</Button>
              </div>

              <form onSubmit={handleFormSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Product Name*</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="Enter product name"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="sku">SKU*</Label>
                    <Input
                      id="sku"
                      value={formData.sku}
                      onChange={(e) => handleInputChange('sku', e.target.value)}
                      placeholder="Product SKU"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Product description"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="category">Category*</Label>
                    <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {productCategories.map(category => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="subcategory">Subcategory</Label>
                    <Select value={formData.subcategory} onValueChange={(value) => handleInputChange('subcategory', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select subcategory" />
                      </SelectTrigger>
                      <SelectContent>
                        {formData.category && productCategories
                          .find(c => c.id === formData.category)?.subcategories
                          .map(sub => (
                            <SelectItem key={sub.id} value={sub.id}>
                              {sub.name}
                            </SelectItem>
                          ))
                        }
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="price">Price (KES)*</Label>
                    <Input
                      id="price"
                      type="number"
                      value={formData.price}
                      onChange={(e) => handleInputChange('price', e.target.value)}
                      placeholder="0"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="compareAtPrice">Compare at Price (KES)</Label>
                    <Input
                      id="compareAtPrice"
                      type="number"
                      value={formData.compareAtPrice}
                      onChange={(e) => handleInputChange('compareAtPrice', e.target.value)}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <Label htmlFor="cost">Cost per Item (KES)</Label>
                    <Input
                      id="cost"
                      type="number"
                      value={formData.cost}
                      onChange={(e) => handleInputChange('cost', e.target.value)}
                      placeholder="0"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="quantity">Quantity*</Label>
                    <Input
                      id="quantity"
                      type="number"
                      value={formData.quantity}
                      onChange={(e) => handleInputChange('quantity', e.target.value)}
                      placeholder="0"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="weight">Weight (kg)</Label>
                    <Input
                      id="weight"
                      type="number"
                      step="0.1"
                      value={formData.weight}
                      onChange={(e) => handleInputChange('weight', e.target.value)}
                      placeholder="0.0"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="tags">Tags</Label>
                  <Input
                    id="tags"
                    value={formData.tags}
                    onChange={(e) => handleInputChange('tags', e.target.value)}
                    placeholder="Separate tags with commas"
                  />
                </div>

                <div className="flex gap-4">
                  <div className="flex items-center space-x-2">
                    <Switch id="track-quantity" />
                    <Label htmlFor="track-quantity">Track Quantity</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="requires-shipping" />
                    <Label htmlFor="requires-shipping">Requires Shipping</Label>
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setShowNewProductForm(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Create Product</Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Product Detail Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Product Details</h2>
                <Button variant="outline" onClick={() => setSelectedProduct(null)}>✖️</Button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                    📷 Product Image
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold mb-2">Product Information</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">SKU:</span>
                          <span>{selectedProduct.sku}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Category:</span>
                          <span>{productCategories.find(c => c.id === selectedProduct.category)?.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Weight:</span>
                          <span>{selectedProduct.shipping.weight} kg</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Created:</span>
                          <span>{new Date(selectedProduct.createdDate).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-2">Specifications</h3>
                      <div className="space-y-1 text-sm">
                        {Object.entries(selectedProduct.specifications).map(([key, value]) => (
                          <div key={key} className="flex justify-between">
                            <span className="text-muted-foreground">{key}:</span>
                            <span>{value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <h1 className="text-2xl font-bold mb-2">{selectedProduct.name}</h1>
                    <p className="text-muted-foreground mb-4">{selectedProduct.description}</p>
                    
                    <div className="flex items-center gap-2 mb-4">
                      <Badge className={getStatusColor(selectedProduct.status)} variant="secondary">
                        {selectedProduct.status}
                      </Badge>
                      <Badge className={getVisibilityColor(selectedProduct.visibility)} variant="secondary">
                        {selectedProduct.visibility}
                      </Badge>
                    </div>

                    <div className="flex items-baseline gap-2 mb-4">
                      <span className="text-2xl font-bold text-green-600">
                        {formatCurrency(selectedProduct.price)}
                      </span>
                      {selectedProduct.compareAtPrice && (
                        <span className="text-lg text-muted-foreground line-through">
                          {formatCurrency(selectedProduct.compareAtPrice)}
                        </span>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-3">Performance Metrics</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 border rounded">
                        <div className="text-xl font-bold text-green-600">{formatCurrency(selectedProduct.performance.revenue)}</div>
                        <div className="text-xs text-muted-foreground">Revenue</div>
                      </div>
                      <div className="text-center p-3 border rounded">
                        <div className="text-xl font-bold text-blue-600">{selectedProduct.performance.sales}</div>
                        <div className="text-xs text-muted-foreground">Units Sold</div>
                      </div>
                      <div className="text-center p-3 border rounded">
                        <div className="text-xl font-bold text-purple-600">{selectedProduct.performance.views}</div>
                        <div className="text-xs text-muted-foreground">Page Views</div>
                      </div>
                      <div className="text-center p-3 border rounded">
                        <div className="text-xl font-bold text-orange-600">{selectedProduct.performance.conversionRate}%</div>
                        <div className="text-xs text-muted-foreground">Conversion</div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-3">Inventory Status</h3>
                    <div className="p-4 border rounded">
                      <div className="flex items-center justify-between mb-2">
                        <span>Current Stock:</span>
                        <span className={`font-bold ${selectedProduct.inventory.quantity <= selectedProduct.inventory.lowStockThreshold ? 'text-red-600' : 'text-green-600'}`}>
                          {selectedProduct.inventory.quantity} units
                        </span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Low stock threshold: {selectedProduct.inventory.lowStockThreshold}
                      </div>
                    </div>
                  </div>

                  {selectedProduct.variants.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-3">Variants</h3>
                      <div className="space-y-2">
                        {selectedProduct.variants.map(variant => (
                          <div key={variant.id} className="flex items-center justify-between p-3 border rounded">
                            <div>
                              <span className="font-medium">{variant.value}</span>
                              <span className="text-sm text-muted-foreground ml-2">({variant.sku})</span>
                            </div>
                            <span className="font-semibold">{variant.inventory} units</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button className="flex-1">✏️ Edit Product</Button>
                    <Button variant="outline">📊 View Analytics</Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}