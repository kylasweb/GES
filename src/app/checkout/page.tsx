'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  ArrowRight, 
  Truck, 
  CreditCard, 
  MapPin, 
  CheckCircle,
  Shield,
  Phone,
  Mail,
  User,
  Package,
  Clock
} from 'lucide-react';
import { useCart, useCartItems, useCartTotal } from '@/hooks/use-cart';
import { Header } from '@/components/layout/header';

type CheckoutStep = 'shipping' | 'payment' | 'review' | 'confirmation';

interface ShippingInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

interface PaymentInfo {
  method: 'card' | 'paypal';
  cardNumber: string;
  cardName: string;
  expiryDate: string;
  cvv: string;
}

export default function CheckoutPage() {
  const cartItems = useCartItems();
  const cartTotal = useCartTotal();
  const { clearCart } = useCart();
  
  const [currentStep, setCurrentStep] = useState<CheckoutStep>('shipping');
  const [shippingInfo, setShippingInfo] = useState<ShippingInfo>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'United States'
  });
  
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo>({
    method: 'card',
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: ''
  });
  
  const [shippingMethod, setShippingMethod] = useState('standard');
  const [saveInfo, setSaveInfo] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');

  const shipping = cartTotal > 100 ? 0 : shippingMethod === 'express' ? 19.99 : 9.99;
  const tax = cartTotal * 0.08;
  const finalTotal = cartTotal + shipping + tax;

  const steps = [
    { id: 'shipping', label: 'Shipping', icon: MapPin },
    { id: 'payment', label: 'Payment', icon: CreditCard },
    { id: 'review', label: 'Review', icon: Package },
    { id: 'confirmation', label: 'Confirmation', icon: CheckCircle }
  ];

  const handleShippingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentStep('payment');
  };

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentStep('review');
  };

  const handlePlaceOrder = () => {
    // Generate order number
    const orderNum = `GE-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
    setOrderNumber(orderNum);
    setCurrentStep('confirmation');
    clearCart();
  };

  const getStepIcon = (step: typeof steps[0]) => {
    const isActive = currentStep === step.id;
    const isCompleted = steps.findIndex(s => s.id === currentStep) > steps.findIndex(s => s.id === step.id);
    
    return (
      <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all ${
        isActive 
          ? 'border-green-600 bg-green-600 text-white' 
          : isCompleted 
            ? 'border-green-600 bg-green-600 text-white'
            : 'border-gray-300 bg-white text-gray-400'
      }`}>
        {isCompleted ? (
          <CheckCircle className="h-5 w-5" />
        ) : (
          <step.icon className="h-5 w-5" />
        )}
      </div>
    );
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-cyan-50 to-blue-50">
        <Header />
        <div className="container px-4 py-16">
          <div className="max-w-2xl mx-auto text-center">
            <Card className="p-8">
              <h1 className="text-2xl font-bold mb-4">Your cart is empty</h1>
              <p className="text-gray-600 mb-6">Add some products to your cart before checkout.</p>
              <Link href="/products">
                <Button className="bg-gradient-to-r from-green-600 to-emerald-600">
                  Continue Shopping
                </Button>
              </Link>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-cyan-50 to-blue-50">
      <Header />
      
      <div className="container px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div className="flex flex-col items-center">
                    {getStepIcon(step)}
                    <span className={`mt-2 text-sm font-medium ${
                      currentStep === step.id ? 'text-green-600' : 
                      steps.findIndex(s => s.id === currentStep) > index ? 'text-green-600' : 'text-gray-400'
                    }`}>
                      {step.label}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`w-full h-0.5 mx-4 ${
                      steps.findIndex(s => s.id === currentStep) > index ? 'bg-green-600' : 'bg-gray-300'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {/* Shipping Step */}
              {currentStep === 'shipping' && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <MapPin className="h-5 w-5" />
                      <span>Shipping Information</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleShippingSubmit} className="space-y-6">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="firstName">First Name</Label>
                          <Input
                            id="firstName"
                            value={shippingInfo.firstName}
                            onChange={(e) => setShippingInfo({...shippingInfo, firstName: e.target.value})}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="lastName">Last Name</Label>
                          <Input
                            id="lastName"
                            value={shippingInfo.lastName}
                            onChange={(e) => setShippingInfo({...shippingInfo, lastName: e.target.value})}
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={shippingInfo.email}
                          onChange={(e) => setShippingInfo({...shippingInfo, email: e.target.value})}
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="phone">Phone</Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={shippingInfo.phone}
                          onChange={(e) => setShippingInfo({...shippingInfo, phone: e.target.value})}
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="address">Address</Label>
                        <Input
                          id="address"
                          value={shippingInfo.address}
                          onChange={(e) => setShippingInfo({...shippingInfo, address: e.target.value})}
                          required
                        />
                      </div>

                      <div className="grid md:grid-cols-3 gap-4">
                        <div>
                          <Label htmlFor="city">City</Label>
                          <Input
                            id="city"
                            value={shippingInfo.city}
                            onChange={(e) => setShippingInfo({...shippingInfo, city: e.target.value})}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="state">State</Label>
                          <Input
                            id="state"
                            value={shippingInfo.state}
                            onChange={(e) => setShippingInfo({...shippingInfo, state: e.target.value})}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="zipCode">ZIP Code</Label>
                          <Input
                            id="zipCode"
                            value={shippingInfo.zipCode}
                            onChange={(e) => setShippingInfo({...shippingInfo, zipCode: e.target.value})}
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="country">Country</Label>
                        <Input
                          id="country"
                          value={shippingInfo.country}
                          onChange={(e) => setShippingInfo({...shippingInfo, country: e.target.value})}
                          required
                        />
                      </div>

                      <div>
                        <Label>Shipping Method</Label>
                        <RadioGroup value={shippingMethod} onValueChange={setShippingMethod}>
                          <div className="flex items-center space-x-2 p-3 border rounded-lg">
                            <RadioGroupItem value="standard" id="standard" />
                            <Label htmlFor="standard" className="flex-1 cursor-pointer">
                              <div className="flex justify-between">
                                <span>Standard Shipping</span>
                                <span>{shipping === 0 ? 'FREE' : '$9.99'}</span>
                              </div>
                              <p className="text-sm text-gray-500">5-7 business days</p>
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2 p-3 border rounded-lg">
                            <RadioGroupItem value="express" id="express" />
                            <Label htmlFor="express" className="flex-1 cursor-pointer">
                              <div className="flex justify-between">
                                <span>Express Shipping</span>
                                <span>$19.99</span>
                              </div>
                              <p className="text-sm text-gray-500">2-3 business days</p>
                            </Label>
                          </div>
                        </RadioGroup>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="saveInfo" 
                          checked={saveInfo}
                          onCheckedChange={(checked) => setSaveInfo(checked as boolean)}
                        />
                        <Label htmlFor="saveInfo">Save this information for next time</Label>
                      </div>

                      <div className="flex justify-between">
                        <Link href="/cart">
                          <Button variant="outline">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Cart
                          </Button>
                        </Link>
                        <Button type="submit" className="bg-gradient-to-r from-green-600 to-emerald-600">
                          Continue to Payment
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              )}

              {/* Payment Step */}
              {currentStep === 'payment' && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <CreditCard className="h-5 w-5" />
                      <span>Payment Information</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handlePaymentSubmit} className="space-y-6">
                      <div>
                        <Label>Payment Method</Label>
                        <RadioGroup value={paymentInfo.method} onValueChange={(value) => setPaymentInfo({...paymentInfo, method: value as 'card' | 'paypal'})}>
                          <div className="flex items-center space-x-2 p-3 border rounded-lg">
                            <RadioGroupItem value="card" id="card" />
                            <Label htmlFor="card" className="flex-1 cursor-pointer">
                              Credit/Debit Card
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2 p-3 border rounded-lg">
                            <RadioGroupItem value="paypal" id="paypal" />
                            <Label htmlFor="paypal" className="flex-1 cursor-pointer">
                              PayPal
                            </Label>
                          </div>
                        </RadioGroup>
                      </div>

                      {paymentInfo.method === 'card' && (
                        <>
                          <div>
                            <Label htmlFor="cardNumber">Card Number</Label>
                            <Input
                              id="cardNumber"
                              placeholder="1234 5678 9012 3456"
                              value={paymentInfo.cardNumber}
                              onChange={(e) => setPaymentInfo({...paymentInfo, cardNumber: e.target.value})}
                              required
                            />
                          </div>

                          <div>
                            <Label htmlFor="cardName">Name on Card</Label>
                            <Input
                              id="cardName"
                              value={paymentInfo.cardName}
                              onChange={(e) => setPaymentInfo({...paymentInfo, cardName: e.target.value})}
                              required
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="expiryDate">Expiry Date</Label>
                              <Input
                                id="expiryDate"
                                placeholder="MM/YY"
                                value={paymentInfo.expiryDate}
                                onChange={(e) => setPaymentInfo({...paymentInfo, expiryDate: e.target.value})}
                                required
                              />
                            </div>
                            <div>
                              <Label htmlFor="cvv">CVV</Label>
                              <Input
                                id="cvv"
                                placeholder="123"
                                value={paymentInfo.cvv}
                                onChange={(e) => setPaymentInfo({...paymentInfo, cvv: e.target.value})}
                                required
                              />
                            </div>
                          </div>
                        </>
                      )}

                      <div className="bg-blue-50 p-4 rounded-lg">
                        <div className="flex items-center space-x-2 text-blue-800">
                          <Shield className="h-4 w-4" />
                          <span className="text-sm font-medium">Secure Payment</span>
                        </div>
                        <p className="text-sm text-blue-700 mt-1">
                          Your payment information is encrypted and secure. We never store your card details.
                        </p>
                      </div>

                      <div className="flex justify-between">
                        <Button variant="outline" onClick={() => setCurrentStep('shipping')}>
                          <ArrowLeft className="h-4 w-4 mr-2" />
                          Back to Shipping
                        </Button>
                        <Button type="submit" className="bg-gradient-to-r from-green-600 to-emerald-600">
                          Review Order
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              )}

              {/* Review Step */}
              {currentStep === 'review' && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Package className="h-5 w-5" />
                      <span>Order Review</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Shipping Info */}
                    <div>
                      <h3 className="font-semibold mb-3">Shipping Address</h3>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="font-medium">
                          {shippingInfo.firstName} {shippingInfo.lastName}
                        </p>
                        <p className="text-sm text-gray-600">{shippingInfo.address}</p>
                        <p className="text-sm text-gray-600">
                          {shippingInfo.city}, {shippingInfo.state} {shippingInfo.zipCode}
                        </p>
                        <p className="text-sm text-gray-600">{shippingInfo.country}</p>
                        <p className="text-sm text-gray-600">{shippingInfo.email}</p>
                        <p className="text-sm text-gray-600">{shippingInfo.phone}</p>
                      </div>
                    </div>

                    {/* Payment Info */}
                    <div>
                      <h3 className="font-semibold mb-3">Payment Method</h3>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="font-medium capitalize">
                          {paymentInfo.method === 'card' ? 'Credit Card' : 'PayPal'}
                        </p>
                        {paymentInfo.method === 'card' && (
                          <p className="text-sm text-gray-600">
                            •••• •••• •••• {paymentInfo.cardNumber.slice(-4)}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Order Items */}
                    <div>
                      <h3 className="font-semibold mb-3">Order Items</h3>
                      <div className="space-y-3">
                        {cartItems.map((item) => (
                          <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center space-x-3">
                              <img 
                                src={item.image} 
                                alt={item.name}
                                className="w-12 h-12 object-cover rounded"
                                onError={(e) => {
                                  e.currentTarget.src = '/placeholder-product.png';
                                }}
                              />
                              <div>
                                <p className="font-medium">{item.name}</p>
                                <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                              </div>
                            </div>
                            <p className="font-medium">
                              ${(item.price * item.quantity).toFixed(2)}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-between">
                      <Button variant="outline" onClick={() => setCurrentStep('payment')}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Payment
                      </Button>
                      <Button 
                        onClick={handlePlaceOrder}
                        className="bg-gradient-to-r from-green-600 to-emerald-600"
                      >
                        Place Order
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Confirmation Step */}
              {currentStep === 'confirmation' && (
                <Card>
                  <CardContent className="p-8 text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="h-8 w-8 text-green-600" />
                    </div>
                    <h1 className="text-2xl font-bold mb-2">Order Confirmed!</h1>
                    <p className="text-gray-600 mb-6">
                      Thank you for your purchase. Your order has been successfully placed.
                    </p>
                    <div className="bg-gray-50 p-4 rounded-lg mb-6">
                      <p className="text-sm text-gray-600">Order Number</p>
                      <p className="text-xl font-bold text-green-600">{orderNumber}</p>
                    </div>
                    <p className="text-sm text-gray-600 mb-6">
                      You will receive a confirmation email shortly with your order details.
                    </p>
                    <div className="flex justify-center space-x-4">
                      <Link href="/account">
                        <Button variant="outline">View My Orders</Button>
                      </Link>
                      <Link href="/">
                        <Button className="bg-gradient-to-r from-green-600 to-emerald-600">
                          Continue Shopping
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Order Summary Sidebar */}
            {currentStep !== 'confirmation' && (
              <div className="lg:col-span-1">
                <Card className="sticky top-24">
                  <CardHeader>
                    <CardTitle>Order Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      {cartItems.map((item) => (
                        <div key={item.id} className="flex justify-between text-sm">
                          <span className="text-gray-600">
                            {item.name} x {item.quantity}
                          </span>
                          <span className="font-medium">
                            ${(item.price * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Subtotal</span>
                        <span className="font-medium">${cartTotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Shipping</span>
                        <span className="font-medium">
                          {shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Tax</span>
                        <span className="font-medium">${tax.toFixed(2)}</span>
                      </div>
                    </div>

                    <Separator />

                    <div className="flex justify-between text-lg font-bold">
                      <span>Total</span>
                      <span className="text-green-600">${finalTotal.toFixed(2)}</span>
                    </div>

                    {shipping === 0 && (
                      <div className="bg-green-50 p-3 rounded-lg text-sm text-green-800">
                        <Truck className="h-4 w-4 inline mr-1" />
                        You've qualified for free shipping!
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}