import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";

interface CartItem {
  id: string;
  productId: string;
  name: string;
  seller: string;
  price: number;
  originalPrice?: number;
  quantity: number;
  variant?: {
    size?: string;
    color?: string;
    style?: string;
  };
  image: string;
  inStock: boolean;
  maxQuantity: number;
  shipping: {
    cost: number;
    estimatedDays: number;
    method: string;
  };
}

interface ShippingAddress {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  street: string;
  city: string;
  county: string;
  postalCode: string;
  isDefault: boolean;
}

interface PaymentMethod {
  id: string;
  type: 'mpesa' | 'card' | 'bank';
  label: string;
  details: string;
  fee: number;
  processingTime: string;
  available: boolean;
}

export default function ShoppingCart() {
  const [currentStep, setCurrentStep] = useState<'cart' | 'shipping' | 'payment' | 'review'>('cart');
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    street: "",
    city: "",
    county: "",
    postalCode: "",
    isDefault: false
  });
  const [selectedPayment, setSelectedPayment] = useState<string>("");
  const [orderNotes, setOrderNotes] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Sample cart data
  const sampleCartItems: CartItem[] = [
    {
      id: 'cart_001',
      productId: 'prod_001',
      name: 'Nairobi FC Official Home Jersey 2024',
      seller: 'Nairobi FC Official Store',
      price: 4500,
      originalPrice: 6000,
      quantity: 1,
      variant: { size: 'L', color: 'Blue' },
      image: '/api/placeholder/120/120',
      inStock: true,
      maxQuantity: 5,
      shipping: {
        cost: 300,
        estimatedDays: 3,
        method: 'Standard'
      }
    },
    {
      id: 'cart_002',
      productId: 'prod_002',
      name: 'Championship Celebration Scarf',
      seller: 'Sports Emporium',
      price: 2000,
      quantity: 2,
      image: '/api/placeholder/120/120',
      inStock: true,
      maxQuantity: 10,
      shipping: {
        cost: 200,
        estimatedDays: 2,
        method: 'Standard'
      }
    },
    {
      id: 'cart_003',
      productId: 'prod_003',
      name: 'Professional Training Kit',
      seller: 'Elite Sports Gear',
      price: 7500,
      quantity: 1,
      variant: { size: 'M' },
      image: '/api/placeholder/120/120',
      inStock: false,
      maxQuantity: 0,
      shipping: {
        cost: 500,
        estimatedDays: 5,
        method: 'Express'
      }
    }
  ];

  const paymentMethods: PaymentMethod[] = [
    {
      id: 'mpesa',
      type: 'mpesa',
      label: 'M-Pesa',
      details: 'Pay with your M-Pesa mobile wallet',
      fee: 0,
      processingTime: 'Instant',
      available: true
    },
    {
      id: 'airtel',
      type: 'mpesa',
      label: 'Airtel Money',
      details: 'Pay with your Airtel Money wallet',
      fee: 0,
      processingTime: 'Instant',
      available: true
    },
    {
      id: 'card',
      type: 'card',
      label: 'Credit/Debit Card',
      details: 'Visa, Mastercard accepted',
      fee: 50,
      processingTime: '1-2 minutes',
      available: true
    },
    {
      id: 'bank',
      type: 'bank',
      label: 'Bank Transfer',
      details: 'Direct bank transfer',
      fee: 25,
      processingTime: '1-2 business days',
      available: true
    }
  ];

  useState(() => {
    setCartItems(sampleCartItems);
  });

  const updateQuantity = (itemId: string, newQuantity: number) => {
    setCartItems(prev => prev.map(item => 
      item.id === itemId 
        ? { ...item, quantity: Math.max(0, Math.min(newQuantity, item.maxQuantity)) }
        : item
    ));
  };

  const removeItem = (itemId: string) => {
    setCartItems(prev => prev.filter(item => item.id !== itemId));
  };

  const calculateSubtotal = () => {
    return cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const calculateShipping = () => {
    return cartItems.reduce((sum, item) => sum + item.shipping.cost, 0);
  };

  const calculateTax = () => {
    return Math.round(calculateSubtotal() * 0.16); // 16% VAT
  };

  const calculateDiscount = () => {
    if (!appliedCoupon) return 0;
    const subtotal = calculateSubtotal();
    if (appliedCoupon.type === 'percentage') {
      return Math.round(subtotal * (appliedCoupon.value / 100));
    }
    return appliedCoupon.value;
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateShipping() + calculateTax() - calculateDiscount();
  };

  const applyCoupon = () => {
    // Sample coupon logic
    const sampleCoupons: any = {
      'WELCOME10': { type: 'percentage', value: 10, description: '10% off first order' },
      'SAVE500': { type: 'fixed', value: 500, description: 'KES 500 off' },
      'FREESHIP': { type: 'shipping', value: 0, description: 'Free shipping' }
    };

    if (sampleCoupons[couponCode.toUpperCase()]) {
      setAppliedCoupon(sampleCoupons[couponCode.toUpperCase()]);
    }
  };

  const getStepStatus = (step: string) => {
    const steps = ['cart', 'shipping', 'payment', 'review'];
    const currentIndex = steps.indexOf(currentStep);
    const stepIndex = steps.indexOf(step);
    
    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'current';
    return 'pending';
  };

  const canProceedToNext = () => {
    switch (currentStep) {
      case 'cart':
        return cartItems.length > 0 && cartItems.every(item => item.inStock);
      case 'shipping':
        return shippingAddress.firstName && shippingAddress.lastName && 
               shippingAddress.phone && shippingAddress.street && 
               shippingAddress.city && shippingAddress.county;
      case 'payment':
        return selectedPayment && agreedToTerms;
      default:
        return true;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">🛒 Shopping Cart & Checkout</h1>
        <p className="text-muted-foreground">Complete your purchase in a few easy steps</p>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {[
            { key: 'cart', label: '🛒 Cart', description: 'Review items' },
            { key: 'shipping', label: '📍 Shipping', description: 'Delivery address' },
            { key: 'payment', label: '💳 Payment', description: 'Payment method' },
            { key: 'review', label: '✅ Review', description: 'Confirm order' }
          ].map((step, index) => (
            <div key={step.key} className="flex items-center">
              <div className={`flex flex-col items-center ${index < 3 ? 'flex-1' : ''}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                  getStepStatus(step.key) === 'completed' ? 'bg-green-500 text-white' :
                  getStepStatus(step.key) === 'current' ? 'bg-blue-500 text-white' :
                  'bg-gray-200 text-gray-600'
                }`}>
                  {index + 1}
                </div>
                <div className="text-center mt-2">
                  <div className="text-sm font-medium">{step.label}</div>
                  <div className="text-xs text-muted-foreground">{step.description}</div>
                </div>
              </div>
              {index < 3 && (
                <div className={`flex-1 h-1 mx-4 rounded ${
                  getStepStatus(step.key) === 'completed' ? 'bg-green-500' : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {currentStep === 'cart' && (
            <Card>
              <CardHeader>
                <CardTitle>Shopping Cart ({cartItems.length} items)</CardTitle>
                <CardDescription>Review and modify your selected items</CardDescription>
              </CardHeader>
              <CardContent>
                {cartItems.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-6xl mb-4">🛒</div>
                    <h3 className="text-lg font-semibold mb-2">Your cart is empty</h3>
                    <p className="text-muted-foreground mb-4">Add some items to get started</p>
                    <Button>Continue Shopping</Button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {cartItems.map(item => (
                      <div key={item.id} className="flex items-start gap-4 p-4 border rounded-lg">
                        <img 
                          src={item.image} 
                          alt={item.name}
                          className="w-24 h-24 object-cover rounded"
                        />
                        
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="font-semibold">{item.name}</h3>
                              <p className="text-sm text-muted-foreground">Sold by {item.seller}</p>
                              {item.variant && (
                                <div className="flex gap-2 mt-1">
                                  {Object.entries(item.variant).map(([key, value]) => (
                                    <Badge key={key} variant="secondary" className="text-xs">
                                      {key}: {value}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                            </div>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => removeItem(item.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              🗑️
                            </Button>
                          </div>

                          <div className="flex items-center justify-between">
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

                            <div className="flex items-center gap-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                disabled={item.quantity <= 1}
                              >
                                −
                              </Button>
                              <span className="w-12 text-center">{item.quantity}</span>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                disabled={item.quantity >= item.maxQuantity || !item.inStock}
                              >
                                +
                              </Button>
                            </div>
                          </div>

                          {!item.inStock && (
                            <div className="mt-2 p-2 bg-red-50 text-red-700 text-sm rounded">
                              ⚠️ This item is currently out of stock
                            </div>
                          )}

                          <div className="mt-2 text-sm text-muted-foreground">
                            Shipping: {formatCurrency(item.shipping.cost)} • 
                            Estimated delivery: {item.shipping.estimatedDays} days
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* Coupon Code */}
                    <div className="border-t pt-4">
                      <h4 className="font-semibold mb-3">💰 Apply Coupon Code</h4>
                      <div className="flex gap-2">
                        <Input 
                          placeholder="Enter coupon code"
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value)}
                          className="flex-1"
                        />
                        <Button variant="outline" onClick={applyCoupon}>
                          Apply
                        </Button>
                      </div>
                      {appliedCoupon && (
                        <div className="mt-2 p-2 bg-green-50 text-green-700 text-sm rounded">
                          ✅ Coupon applied: {appliedCoupon.description}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {currentStep === 'shipping' && (
            <Card>
              <CardHeader>
                <CardTitle>📍 Shipping Information</CardTitle>
                <CardDescription>Where should we deliver your order?</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>First Name *</Label>
                    <Input 
                      value={shippingAddress.firstName}
                      onChange={(e) => setShippingAddress(prev => ({...prev, firstName: e.target.value}))}
                      placeholder="Enter first name"
                    />
                  </div>
                  <div>
                    <Label>Last Name *</Label>
                    <Input 
                      value={shippingAddress.lastName}
                      onChange={(e) => setShippingAddress(prev => ({...prev, lastName: e.target.value}))}
                      placeholder="Enter last name"
                    />
                  </div>
                  <div>
                    <Label>Phone Number *</Label>
                    <Input 
                      value={shippingAddress.phone}
                      onChange={(e) => setShippingAddress(prev => ({...prev, phone: e.target.value}))}
                      placeholder="+254 700 000 000"
                    />
                  </div>
                  <div>
                    <Label>Email Address</Label>
                    <Input 
                      value={shippingAddress.email}
                      onChange={(e) => setShippingAddress(prev => ({...prev, email: e.target.value}))}
                      placeholder="your.email@example.com"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label>Street Address *</Label>
                    <Textarea 
                      value={shippingAddress.street}
                      onChange={(e) => setShippingAddress(prev => ({...prev, street: e.target.value}))}
                      placeholder="Enter your full address including building, floor, apartment"
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label>City *</Label>
                    <Input 
                      value={shippingAddress.city}
                      onChange={(e) => setShippingAddress(prev => ({...prev, city: e.target.value}))}
                      placeholder="Enter city"
                    />
                  </div>
                  <div>
                    <Label>County *</Label>
                    <Select 
                      value={shippingAddress.county}
                      onValueChange={(value) => setShippingAddress(prev => ({...prev, county: value}))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select county" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="nairobi">Nairobi</SelectItem>
                        <SelectItem value="kiambu">Kiambu</SelectItem>
                        <SelectItem value="machakos">Machakos</SelectItem>
                        <SelectItem value="nakuru">Nakuru</SelectItem>
                        <SelectItem value="mombasa">Mombasa</SelectItem>
                        <SelectItem value="kisumu">Kisumu</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Postal Code</Label>
                    <Input 
                      value={shippingAddress.postalCode}
                      onChange={(e) => setShippingAddress(prev => ({...prev, postalCode: e.target.value}))}
                      placeholder="00100"
                    />
                  </div>

                  <div className="md:col-span-2 flex items-center space-x-2">
                    <Switch 
                      checked={shippingAddress.isDefault}
                      onCheckedChange={(checked) => setShippingAddress(prev => ({...prev, isDefault: checked}))}
                    />
                    <Label>Save as default shipping address</Label>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {currentStep === 'payment' && (
            <Card>
              <CardHeader>
                <CardTitle>💳 Payment Method</CardTitle>
                <CardDescription>Choose how you'd like to pay for your order</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {paymentMethods.map(method => (
                    <div 
                      key={method.id}
                      className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                        selectedPayment === method.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                      } ${!method.available ? 'opacity-50 cursor-not-allowed' : ''}`}
                      onClick={() => method.available && setSelectedPayment(method.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-4 h-4 rounded-full border-2 ${
                            selectedPayment === method.id ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                          }`}>
                            {selectedPayment === method.id && (
                              <div className="w-2 h-2 bg-white rounded-full m-auto mt-0.5"></div>
                            )}
                          </div>
                          <div>
                            <div className="font-semibold">{method.label}</div>
                            <div className="text-sm text-muted-foreground">{method.details}</div>
                          </div>
                        </div>
                        <div className="text-right text-sm">
                          <div className="font-medium">
                            {method.fee > 0 ? `+${formatCurrency(method.fee)}` : 'Free'}
                          </div>
                          <div className="text-muted-foreground">{method.processingTime}</div>
                        </div>
                      </div>
                    </div>
                  ))}

                  <Separator className="my-6" />

                  <div>
                    <Label>Order Notes (Optional)</Label>
                    <Textarea 
                      value={orderNotes}
                      onChange={(e) => setOrderNotes(e.target.value)}
                      placeholder="Any special instructions or notes for your order..."
                      rows={3}
                    />
                  </div>

                  <div className="flex items-start space-x-2">
                    <Switch 
                      checked={agreedToTerms}
                      onCheckedChange={setAgreedToTerms}
                    />
                    <Label className="text-sm">
                      I agree to the <span className="text-blue-600 cursor-pointer">Terms & Conditions</span> and 
                      <span className="text-blue-600 cursor-pointer"> Privacy Policy</span>
                    </Label>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {currentStep === 'review' && (
            <Card>
              <CardHeader>
                <CardTitle>✅ Review Your Order</CardTitle>
                <CardDescription>Please confirm all details before placing your order</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Order Items */}
                  <div>
                    <h4 className="font-semibold mb-3">📦 Order Items</h4>
                    <div className="space-y-3">
                      {cartItems.map(item => (
                        <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                          <div className="flex items-center gap-3">
                            <img src={item.image} alt={item.name} className="w-16 h-16 rounded" />
                            <div>
                              <div className="font-medium">{item.name}</div>
                              <div className="text-sm text-muted-foreground">
                                Qty: {item.quantity} • {item.seller}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold">{formatCurrency(item.price * item.quantity)}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Shipping Address */}
                  <div>
                    <h4 className="font-semibold mb-3">📍 Shipping Address</h4>
                    <div className="p-3 bg-gray-50 rounded">
                      <div className="font-medium">{shippingAddress.firstName} {shippingAddress.lastName}</div>
                      <div className="text-sm text-muted-foreground">
                        {shippingAddress.street}<br />
                        {shippingAddress.city}, {shippingAddress.county} {shippingAddress.postalCode}<br />
                        Phone: {shippingAddress.phone}
                      </div>
                    </div>
                  </div>

                  {/* Payment Method */}
                  <div>
                    <h4 className="font-semibold mb-3">💳 Payment Method</h4>
                    <div className="p-3 bg-gray-50 rounded">
                      <div className="font-medium">
                        {paymentMethods.find(m => m.id === selectedPayment)?.label}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {paymentMethods.find(m => m.id === selectedPayment)?.details}
                      </div>
                    </div>
                  </div>

                  {orderNotes && (
                    <div>
                      <h4 className="font-semibold mb-3">📝 Order Notes</h4>
                      <div className="p-3 bg-gray-50 rounded text-sm">
                        {orderNotes}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Order Summary Sidebar */}
        <div className="lg:col-span-1">
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle>💰 Order Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Subtotal ({cartItems.length} items)</span>
                  <span>{formatCurrency(calculateSubtotal())}</span>
                </div>
                
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>{formatCurrency(calculateShipping())}</span>
                </div>
                
                <div className="flex justify-between">
                  <span>Tax (VAT 16%)</span>
                  <span>{formatCurrency(calculateTax())}</span>
                </div>
                
                {appliedCoupon && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount ({couponCode})</span>
                    <span>-{formatCurrency(calculateDiscount())}</span>
                  </div>
                )}

                <Separator />
                
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>{formatCurrency(calculateTotal())}</span>
                </div>

                <div className="text-xs text-muted-foreground">
                  *Tax included • Final amount may vary
                </div>
              </div>

              <div className="mt-6 space-y-3">
                {currentStep !== 'review' ? (
                  <Button 
                    className="w-full" 
                    onClick={() => {
                      const steps = ['cart', 'shipping', 'payment', 'review'];
                      const currentIndex = steps.indexOf(currentStep);
                      if (currentIndex < steps.length - 1) {
                        setCurrentStep(steps[currentIndex + 1] as any);
                      }
                    }}
                    disabled={!canProceedToNext()}
                  >
                    {currentStep === 'cart' && '📍 Continue to Shipping'}
                    {currentStep === 'shipping' && '💳 Continue to Payment'}
                    {currentStep === 'payment' && '✅ Review Order'}
                  </Button>
                ) : (
                  <Button className="w-full" size="lg">
                    🚀 Place Order - {formatCurrency(calculateTotal())}
                  </Button>
                )}

                {currentStep !== 'cart' && (
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => {
                      const steps = ['cart', 'shipping', 'payment', 'review'];
                      const currentIndex = steps.indexOf(currentStep);
                      if (currentIndex > 0) {
                        setCurrentStep(steps[currentIndex - 1] as any);
                      }
                    }}
                  >
                    ← Back
                  </Button>
                )}

                <Button variant="ghost" className="w-full text-muted-foreground">
                  🛒 Continue Shopping
                </Button>
              </div>

              {/* Security Badges */}
              <div className="mt-6 pt-4 border-t">
                <div className="text-center space-y-2">
                  <div className="text-sm font-medium">🔒 Secure Checkout</div>
                  <div className="flex justify-center gap-2 text-xs text-muted-foreground">
                    <span>🛡️ SSL</span>
                    <span>✅ PCI</span>
                    <span>🔐 256-bit</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}