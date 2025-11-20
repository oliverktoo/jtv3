import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  currency: string;
  category: string;
  subcategory: string;
  seller: {
    id: string;
    name: string;
    type: 'Team' | 'Business' | 'Individual' | 'Official Partner';
    rating: number;
    verified: boolean;
    location: string;
  };
  images: string[];
  inStock: boolean;
  stockQuantity?: number;
  ratings: {
    average: number;
    count: number;
  };
  tags: string[];
  features: string[];
  shipping: {
    freeShipping: boolean;
    estimatedDays: number;
    cost?: number;
  };
  promotion?: {
    type: 'Discount' | 'Flash Sale' | 'Bundle' | 'Tournament Special';
    label: string;
    expiresAt: string;
  };
}

interface MarketplaceCategory {
  id: string;
  name: string;
  icon: string;
  productCount: number;
  featuredProducts: Product[];
  trending: boolean;
}

interface FeaturedSeller {
  id: string;
  name: string;
  type: 'Team' | 'Business' | 'Individual' | 'Official Partner';
  logo?: string;
  description: string;
  rating: number;
  totalProducts: number;
  totalSales: number;
  verified: boolean;
  specialization: string[];
  location: string;
  joinedDate: string;
}

export default function MarketplaceHub() {
  const featuredProducts: Product[] = [
    {
      id: 'p001',
      name: 'Nairobi FC Official Home Jersey 2024',
      description: 'Official match-worn jersey with player signatures and team crest. Premium polyester fabric with moisture-wicking technology.',
      price: 4500,
      originalPrice: 6000,
      currency: 'KES',
      category: 'Team Merchandise',
      subcategory: 'Jerseys',
      seller: {
        id: 's001',
        name: 'Nairobi FC Official Store',
        type: 'Team',
        rating: 4.8,
        verified: true,
        location: 'Nairobi, Kenya'
      },
      images: ['/api/placeholder/300/300'],
      inStock: true,
      stockQuantity: 45,
      ratings: {
        average: 4.7,
        count: 156
      },
      tags: ['Official', 'Limited Edition', 'Signed'],
      features: ['Moisture-wicking', 'Official team crest', 'Player signatures', 'Premium fabric'],
      shipping: {
        freeShipping: true,
        estimatedDays: 2
      },
      promotion: {
        type: 'Tournament Special',
        label: '25% Off - Championship Finals',
        expiresAt: '2025-11-15T23:59:59Z'
      }
    },
    {
      id: 'p002',
      name: 'Professional Football Boots - Nike Mercurial',
      description: 'High-performance football boots designed for speed and agility. Lightweight construction with advanced traction technology.',
      price: 12500,
      currency: 'KES',
      category: 'Sports Equipment',
      subcategory: 'Footwear',
      seller: {
        id: 's002',
        name: 'SportsPro Kenya',
        type: 'Business',
        rating: 4.6,
        verified: true,
        location: 'Mombasa, Kenya'
      },
      images: ['/api/placeholder/300/300'],
      inStock: true,
      stockQuantity: 23,
      ratings: {
        average: 4.5,
        count: 89
      },
      tags: ['Nike', 'Professional', 'Speed'],
      features: ['Lightweight design', 'Advanced traction', 'Breathable material', 'Professional grade'],
      shipping: {
        freeShipping: false,
        estimatedDays: 3,
        cost: 300
      }
    },
    {
      id: 'p003',
      name: 'Complete Training Kit - Cones & Bibs Set',
      description: 'Professional training equipment set including 20 cones, 15 training bibs, and carrying bag. Perfect for team training sessions.',
      price: 3200,
      currency: 'KES',
      category: 'Training Equipment',
      subcategory: 'Accessories',
      seller: {
        id: 's003',
        name: 'Coach Equipment Hub',
        type: 'Business',
        rating: 4.9,
        verified: true,
        location: 'Kisumu, Kenya'
      },
      images: ['/api/placeholder/300/300'],
      inStock: true,
      stockQuantity: 67,
      ratings: {
        average: 4.8,
        count: 234
      },
      tags: ['Training', 'Complete Set', 'Professional'],
      features: ['20 traffic cones', '15 training bibs', 'Carrying bag included', 'Weather resistant'],
      shipping: {
        freeShipping: true,
        estimatedDays: 4
      }
    },
    {
      id: 'p004',
      name: 'Personalized Player Performance Report',
      description: 'Comprehensive performance analysis with video breakdown, statistics, and improvement recommendations by certified coaches.',
      price: 2500,
      currency: 'KES',
      category: 'Digital Services',
      subcategory: 'Analysis',
      seller: {
        id: 's004',
        name: 'ProAnalytics Kenya',
        type: 'Business',
        rating: 4.7,
        verified: true,
        location: 'Nairobi, Kenya'
      },
      images: ['/api/placeholder/300/300'],
      inStock: true,
      ratings: {
        average: 4.9,
        count: 67
      },
      tags: ['Digital', 'Analysis', 'Professional'],
      features: ['Video analysis', 'Statistical breakdown', 'Expert recommendations', 'Digital delivery'],
      shipping: {
        freeShipping: true,
        estimatedDays: 1
      }
    }
  ];

  const categories: MarketplaceCategory[] = [
    {
      id: 'cat001',
      name: 'Team Merchandise',
      icon: '👕',
      productCount: 1250,
      featuredProducts: featuredProducts.slice(0, 2),
      trending: true
    },
    {
      id: 'cat002',
      name: 'Sports Equipment',
      icon: '⚽',
      productCount: 890,
      featuredProducts: featuredProducts.slice(1, 3),
      trending: true
    },
    {
      id: 'cat003',
      name: 'Training Gear',
      icon: '🏃‍♂️',
      productCount: 670,
      featuredProducts: featuredProducts.slice(2, 4),
      trending: false
    },
    {
      id: 'cat004',
      name: 'Fan Accessories',
      icon: '🧢',
      productCount: 450,
      featuredProducts: featuredProducts.slice(0, 1),
      trending: false
    },
    {
      id: 'cat005',
      name: 'Digital Services',
      icon: '💻',
      productCount: 125,
      featuredProducts: featuredProducts.slice(3, 4),
      trending: true
    },
    {
      id: 'cat006',
      name: 'Experiences',
      icon: '🎫',
      productCount: 89,
      featuredProducts: [],
      trending: false
    }
  ];

  const featuredSellers: FeaturedSeller[] = [
    {
      id: 'fs001',
      name: 'Nairobi FC Official Store',
      type: 'Team',
      description: 'Official merchandise and memorabilia from Kenya\'s premier football club',
      rating: 4.8,
      totalProducts: 156,
      totalSales: 45000,
      verified: true,
      specialization: ['Team Merchandise', 'Collectibles', 'Match Tickets'],
      location: 'Nairobi, Kenya',
      joinedDate: '2024-01-15'
    },
    {
      id: 'fs002',
      name: 'SportsPro Kenya',
      type: 'Business',
      description: 'Premium sports equipment and professional gear for athletes and teams',
      rating: 4.6,
      totalProducts: 340,
      totalSales: 120000,
      verified: true,
      specialization: ['Equipment', 'Footwear', 'Professional Gear'],
      location: 'Mombasa, Kenya',
      joinedDate: '2023-08-20'
    },
    {
      id: 'fs003',
      name: 'Coach Equipment Hub',
      type: 'Business',
      description: 'Complete training solutions and coaching equipment for all skill levels',
      rating: 4.9,
      totalProducts: 89,
      totalSales: 67000,
      verified: true,
      specialization: ['Training Equipment', 'Coaching Tools', 'Team Accessories'],
      location: 'Kisumu, Kenya',
      joinedDate: '2023-11-10'
    }
  ];

  const flashSales = featuredProducts.filter(p => p.promotion?.type === 'Flash Sale' || p.promotion?.type === 'Tournament Special');

  const formatCurrency = (amount: number, currency: string) => {
    return `${currency} ${amount.toLocaleString()}`;
  };

  const getSellerTypeColor = (type: FeaturedSeller['type']) => {
    switch (type) {
      case 'Team': return 'bg-blue-100 text-blue-800';
      case 'Business': return 'bg-green-100 text-green-800';
      case 'Official Partner': return 'bg-purple-100 text-purple-800';
      case 'Individual': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPromotionColor = (type: string) => {
    switch (type) {
      case 'Flash Sale': return 'bg-red-100 text-red-800';
      case 'Tournament Special': return 'bg-orange-100 text-orange-800';
      case 'Bundle': return 'bg-purple-100 text-purple-800';
      case 'Discount': return 'bg-green-100 text-green-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Sports Marketplace</h1>
          <p className="text-muted-foreground">Your one-stop shop for everything sports in Kenya</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">🏪 Sell on Marketplace</Button>
          <Button variant="outline">❤️ My Wishlist</Button>
          <Button>🛒 Cart (3)</Button>
        </div>
      </div>

      {/* Marketplace Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">3,500+</div>
            <div className="text-sm text-muted-foreground">Products Available</div>
            <div className="text-xs text-blue-600 mt-1">Across all categories</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">150+</div>
            <div className="text-sm text-muted-foreground">Verified Sellers</div>
            <div className="text-xs text-green-600 mt-1">Teams & businesses</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-purple-600">25,000+</div>
            <div className="text-sm text-muted-foreground">Happy Customers</div>
            <div className="text-xs text-purple-600 mt-1">Satisfied buyers</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-orange-600">4.8⭐</div>
            <div className="text-sm text-muted-foreground">Average Rating</div>
            <div className="text-xs text-orange-600 mt-1">Customer satisfaction</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Featured Products */}
          <Card>
            <CardHeader>
              <CardTitle>Featured Products</CardTitle>
              <CardDescription>Handpicked items from top sellers</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {featuredProducts.map(product => (
                  <div key={product.id} className="border rounded-lg p-4 hover:shadow-lg transition-shadow">
                    <div className="relative mb-4">
                      <img 
                        src={product.images[0]} 
                        alt={product.name}
                        className="w-full h-48 object-cover rounded"
                      />
                      {product.promotion && (
                        <Badge className={`absolute top-2 left-2 ${getPromotionColor(product.promotion.type)}`} variant="secondary">
                          {product.promotion.label}
                        </Badge>
                      )}
                      {!product.inStock && (
                        <div className="absolute inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center rounded">
                          <span className="text-white font-semibold">Out of Stock</span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <h3 className="font-semibold text-lg line-clamp-2">{product.name}</h3>
                      
                      <div className="flex items-center gap-2">
                        <Badge className={getSellerTypeColor(product.seller.type)} variant="secondary">
                          {product.seller.type}
                        </Badge>
                        {product.seller.verified && (
                          <Badge variant="outline" className="text-xs">
                            ✓ Verified
                          </Badge>
                        )}
                      </div>

                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {product.description}
                      </p>

                      <div className="flex items-center gap-2">
                        <div className="flex items-center text-yellow-500">
                          {'⭐'.repeat(Math.floor(product.ratings.average))}
                          <span className="text-sm text-muted-foreground ml-1">
                            ({product.ratings.count})
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-xl font-bold text-green-600">
                            {formatCurrency(product.price, product.currency)}
                          </div>
                          {product.originalPrice && (
                            <div className="text-sm text-muted-foreground line-through">
                              {formatCurrency(product.originalPrice, product.currency)}
                            </div>
                          )}
                        </div>
                        <div className="text-right">
                          {product.shipping.freeShipping && (
                            <div className="text-xs text-green-600">Free Shipping</div>
                          )}
                          <div className="text-xs text-muted-foreground">
                            {product.shipping.estimatedDays} days delivery
                          </div>
                        </div>
                      </div>

                      {product.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {product.tags.slice(0, 3).map((tag, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}

                      <div className="flex gap-2 pt-2">
                        <Button className="flex-1" disabled={!product.inStock}>
                          🛒 Add to Cart
                        </Button>
                        <Button variant="outline" size="sm">
                          ❤️
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="text-center mt-6">
                <Button variant="outline">View All Featured Products</Button>
              </div>
            </CardContent>
          </Card>

          {/* Product Categories */}
          <Card>
            <CardHeader>
              <CardTitle>Shop by Category</CardTitle>
              <CardDescription>Explore our wide range of sports products and services</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories.map(category => (
                  <div key={category.id} className="border rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="text-3xl">{category.icon}</div>
                      <div>
                        <h3 className="font-semibold">{category.name}</h3>
                        <div className="text-sm text-muted-foreground">
                          {category.productCount.toLocaleString()} products
                        </div>
                      </div>
                      {category.trending && (
                        <Badge variant="secondary" className="bg-red-100 text-red-800 ml-auto">
                          🔥 Trending
                        </Badge>
                      )}
                    </div>
                    
                    <div className="text-sm text-muted-foreground">
                      Popular items in this category
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Featured Sellers */}
          <Card>
            <CardHeader>
              <CardTitle>Featured Sellers</CardTitle>
              <CardDescription>Top-rated stores and official team shops</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {featuredSellers.map(seller => (
                  <div key={seller.id} className="border rounded-lg p-4">
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center text-2xl font-bold">
                        {seller.name.charAt(0)}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-lg">{seller.name}</h3>
                          <Badge className={getSellerTypeColor(seller.type)} variant="secondary">
                            {seller.type}
                          </Badge>
                          {seller.verified && (
                            <Badge variant="outline" className="text-xs bg-green-50 text-green-700">
                              ✓ Verified Seller
                            </Badge>
                          )}
                        </div>
                        
                        <p className="text-muted-foreground mb-3">{seller.description}</p>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                          <div>
                            <div className="text-sm text-muted-foreground">Rating</div>
                            <div className="flex items-center gap-1">
                              <span className="font-semibold">{seller.rating}</span>
                              <span className="text-yellow-500">⭐</span>
                            </div>
                          </div>
                          <div>
                            <div className="text-sm text-muted-foreground">Products</div>
                            <div className="font-semibold">{seller.totalProducts}</div>
                          </div>
                          <div>
                            <div className="text-sm text-muted-foreground">Total Sales</div>
                            <div className="font-semibold text-green-600">KES {seller.totalSales.toLocaleString()}</div>
                          </div>
                          <div>
                            <div className="text-sm text-muted-foreground">Location</div>
                            <div className="font-semibold">{seller.location}</div>
                          </div>
                        </div>
                        
                        <div className="flex flex-wrap gap-1 mb-3">
                          {seller.specialization.map((spec, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {spec}
                            </Badge>
                          ))}
                        </div>
                        
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">🏪 Visit Store</Button>
                          <Button variant="outline" size="sm">👥 Follow</Button>
                          <Button variant="outline" size="sm">💬 Contact</Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Flash Sales & Promotions */}
          {flashSales.length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <CardTitle>⚡ Flash Sales & Special Offers</CardTitle>
                  <Badge variant="secondary" className="bg-red-100 text-red-800">
                    🔥 Limited Time
                  </Badge>
                </div>
                <CardDescription>Exclusive deals and tournament specials</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {flashSales.map(product => (
                    <div key={product.id} className="border rounded-lg p-4 bg-gradient-to-r from-red-50 to-orange-50">
                      <div className="flex gap-4">
                        <img 
                          src={product.images[0]} 
                          alt={product.name}
                          className="w-20 h-20 object-cover rounded"
                        />
                        <div className="flex-1">
                          <h4 className="font-semibold line-clamp-2">{product.name}</h4>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-lg font-bold text-green-600">
                              {formatCurrency(product.price, product.currency)}
                            </span>
                            {product.originalPrice && (
                              <span className="text-sm text-muted-foreground line-through">
                                {formatCurrency(product.originalPrice, product.currency)}
                              </span>
                            )}
                          </div>
                          {product.promotion && (
                            <Badge className={getPromotionColor(product.promotion.type)} variant="secondary">
                              {product.promotion.label}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <Button className="w-full mt-3" size="sm">
                        🛒 Buy Now
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Search & Filters */}
          <Card>
            <CardHeader>
              <CardTitle>Search & Filters</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <input 
                  type="text" 
                  placeholder="Search products..." 
                  className="w-full p-2 border rounded"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Price Range</label>
                <div className="flex gap-2 mt-1">
                  <input type="number" placeholder="Min" className="w-full p-2 border rounded text-sm" />
                  <input type="number" placeholder="Max" className="w-full p-2 border rounded text-sm" />
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium">Seller Type</label>
                <div className="space-y-2 mt-1">
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" />
                    Teams
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" />
                    Businesses
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" />
                    Official Partners
                  </label>
                </div>
              </div>
              
              <Button className="w-full">Apply Filters</Button>
            </CardContent>
          </Card>

          {/* Quick Categories */}
          <Card>
            <CardHeader>
              <CardTitle>Popular Categories</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start" size="sm">
                👕 Team Jerseys
              </Button>
              <Button variant="outline" className="w-full justify-start" size="sm">
                👟 Football Boots
              </Button>
              <Button variant="outline" className="w-full justify-start" size="sm">
                ⚽ Training Equipment
              </Button>
              <Button variant="outline" className="w-full justify-start" size="sm">
                🧢 Fan Accessories
              </Button>
              <Button variant="outline" className="w-full justify-start" size="sm">
                🎫 Match Tickets
              </Button>
            </CardContent>
          </Card>

          {/* Trending Searches */}
          <Card>
            <CardHeader>
              <CardTitle>Trending Searches</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-red-500">🔥</span>
                  <span>Championship Final Jerseys</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-orange-500">📈</span>
                  <span>Nike Football Boots</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-green-500">⭐</span>
                  <span>Training Cones Set</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-blue-500">💎</span>
                  <span>Team Scarves</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-purple-500">🎯</span>
                  <span>Match Analysis</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Seller Benefits */}
          <Card>
            <CardHeader>
              <CardTitle>Sell on Marketplace</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="text-sm">
                  <div className="font-semibold text-green-600">✓ Low Commission Rates</div>
                  <div className="text-muted-foreground">Starting from just 3%</div>
                </div>
                <div className="text-sm">
                  <div className="font-semibold text-green-600">✓ Targeted Audience</div>
                  <div className="text-muted-foreground">Passionate sports fans</div>
                </div>
                <div className="text-sm">
                  <div className="font-semibold text-green-600">✓ Easy Setup</div>
                  <div className="text-muted-foreground">Start selling in minutes</div>
                </div>
                <div className="text-sm">
                  <div className="font-semibold text-green-600">✓ Marketing Support</div>
                  <div className="text-muted-foreground">Promotional opportunities</div>
                </div>
                <Button className="w-full mt-3">
                  🏪 Start Selling
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Customer Support */}
          <Card>
            <CardHeader>
              <CardTitle>Need Help?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start" size="sm">
                💬 Live Chat
              </Button>
              <Button variant="outline" className="w-full justify-start" size="sm">
                📞 Call Support
              </Button>
              <Button variant="outline" className="w-full justify-start" size="sm">
                📧 Email Us
              </Button>
              <Button variant="outline" className="w-full justify-start" size="sm">
                ❓ FAQ Center
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}