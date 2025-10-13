'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  CheckCircle, 
  Package, 
  Truck, 
  Mail, 
  Phone, 
  MapPin,
  ArrowRight,
  Star,
  Heart,
  Share2,
  Download,
  RefreshCw,
  Shield,
  Clock,
  Users
} from 'lucide-react';
import { Header } from '@/components/layout/header';

interface OrderDetails {
  orderNumber: string;
  date: string;
  status: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    image: string;
  }>;
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  shippingAddress: {
    name: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  estimatedDelivery: string;
}

export default function ThankYouPage() {
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const [emailSent, setEmailSent] = useState(false);

  useEffect(() => {
    // Get order details from URL params or localStorage
    const urlParams = new URLSearchParams(window.location.search);
    const orderNumber = urlParams.get('order');
    
    if (orderNumber) {
      // Mock order details - in real app, fetch from API
      const mockOrder: OrderDetails = {
        orderNumber,
        date: new Date().toLocaleDateString(),
        status: 'processing',
        items: [
          {
            name: 'Premium Solar Panel 400W',
            quantity: 2,
            price: 899.99,
            image: '/solar-panel.jpg'
          },
          {
            name: 'Lithium Battery 12V 100Ah',
            quantity: 1,
            price: 699.99,
            image: '/battery.jpg'
          }
        ],
        subtotal: 2499.97,
        shipping: 0,
        tax: 199.99,
        total: 2699.96,
        shippingAddress: {
          name: 'John Doe',
          address: '123 Green Street',
          city: 'Eco City',
          state: 'CA',
          zipCode: '90210',
          country: 'United States'
        },
        estimatedDelivery: '5-7 business days'
      };
      setOrderDetails(mockOrder);
    }

    // Simulate sending confirmation email
    setTimeout(() => setEmailSent(true), 2000);
  }, []);

  const handleShareOrder = () => {
    if (orderDetails) {
      const shareText = `I just placed an order with Green Energy Solutions! Order #${orderDetails.orderNumber}`;
      if (navigator.share) {
        navigator.share({
          title: 'Green Energy Solutions Order',
          text: shareText,
          url: window.location.href
        });
      } else {
        // Fallback - copy to clipboard
        navigator.clipboard.writeText(shareText);
        alert('Order details copied to clipboard!');
      }
    }
  };

  const handleDownloadInvoice = () => {
    // Mock download - in real app, generate PDF
    alert('Invoice download would start here');
  };

  const handleTrackOrder = () => {
    if (orderDetails) {
      window.location.href = `/account?tab=orders&order=${orderDetails.orderNumber}`;
    }
  };

  if (!orderDetails) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-cyan-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your order details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-cyan-50 to-blue-50">
      <Header />
      
      <div className="container px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Success Message */}
          <div className="text-center space-y-4">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900">Thank You!</h1>
            <p className="text-xl text-gray-600">
              Your order has been successfully placed and is now being processed.
            </p>
            <div className="flex items-center justify-center space-x-2">
              <Badge className="bg-green-100 text-green-800 text-lg px-4 py-2">
                Order #{orderDetails.orderNumber}
              </Badge>
              <Badge variant="outline" className="text-lg px-4 py-2">
                <Clock className="h-4 w-4 mr-1" />
                {orderDetails.status}
              </Badge>
            </div>
          </div>

          {/* Email Confirmation */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <Mail className="h-6 w-6 text-blue-600" />
                <div className="flex-1">
                  <p className="font-medium text-blue-900">
                    {emailSent ? 'Confirmation email sent!' : 'Sending confirmation email...'}
                  </p>
                  <p className="text-sm text-blue-700">
                    We've sent a detailed confirmation to your email address.
                  </p>
                </div>
                {emailSent && <CheckCircle className="h-5 w-5 text-green-600" />}
              </div>
            </CardContent>
          </Card>

          {/* Order Details */}
          <div className="grid md:grid-cols-2 gap-8">
            {/* Order Items */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg mb-4 flex items-center">
                  <Package className="h-5 w-5 mr-2" />
                  Order Items
                </h3>
                <div className="space-y-4">
                  {orderDetails.items.map((item, index) => (
                    <div key={index} className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-emerald-100 rounded-lg flex items-center justify-center">
                        <img 
                          src={item.image} 
                          alt={item.name}
                          className="w-12 h-12 object-cover rounded"
                          onError={(e) => {
                            e.currentTarget.src = '/placeholder-product.png';
                          }}
                        />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                      </div>
                      <p className="font-semibold">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  ))}
                  <Separator />
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Subtotal</span>
                      <span>${orderDetails.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Shipping</span>
                      <span>{orderDetails.shipping === 0 ? 'FREE' : `$${orderDetails.shipping.toFixed(2)}`}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tax</span>
                      <span>${orderDetails.tax.toFixed(2)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total</span>
                      <span className="text-green-600">${orderDetails.total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Shipping & Delivery */}
            <div className="space-y-6">
              {/* Shipping Address */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-lg mb-4 flex items-center">
                    <MapPin className="h-5 w-5 mr-2" />
                    Shipping Address
                  </h3>
                  <div className="space-y-2">
                    <p className="font-medium">{orderDetails.shippingAddress.name}</p>
                    <p className="text-gray-600">{orderDetails.shippingAddress.address}</p>
                    <p className="text-gray-600">
                      {orderDetails.shippingAddress.city}, {orderDetails.shippingAddress.state} {orderDetails.shippingAddress.zipCode}
                    </p>
                    <p className="text-gray-600">{orderDetails.shippingAddress.country}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Delivery Info */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-lg mb-4 flex items-center">
                    <Truck className="h-5 w-5 mr-2" />
                    Delivery Information
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Estimated Delivery</span>
                      <span className="font-medium">{orderDetails.estimatedDelivery}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Shipping Method</span>
                      <span className="font-medium">Standard Shipping</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Tracking</span>
                      <Button variant="outline" size="sm" onClick={handleTrackOrder}>
                        Track Order
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Action Buttons */}
          <Card>
            <CardContent className="p-6">
              <div className="grid md:grid-cols-2 gap-4">
                <Button 
                  variant="outline" 
                  onClick={handleDownloadInvoice}
                  className="w-full"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download Invoice
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleShareOrder}
                  className="w-full"
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Share Order
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Next Steps */}
          <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
            <CardContent className="p-6">
              <h3 className="font-semibold text-lg mb-4">What happens next?</h3>
              <div className="grid md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Mail className="h-6 w-6 text-green-600" />
                  </div>
                  <p className="text-sm font-medium">Confirmation Email</p>
                  <p className="text-xs text-gray-600">Check your inbox</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Package className="h-6 w-6 text-blue-600" />
                  </div>
                  <p className="text-sm font-medium">Order Processing</p>
                  <p className="text-xs text-gray-600">1-2 business days</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Truck className="h-6 w-6 text-yellow-600" />
                  </div>
                  <p className="text-sm font-medium">Shipped</p>
                  <p className="text-xs text-gray-600">Tracking number sent</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <CheckCircle className="h-6 w-6 text-purple-600" />
                  </div>
                  <p className="text-sm font-medium">Delivered</p>
                  <p className="text-xs text-gray-600">5-7 business days</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Customer Support */}
          <Card>
            <CardContent className="p-6">
              <div className="text-center space-y-4">
                <h3 className="font-semibold text-lg">Need Help?</h3>
                <p className="text-gray-600">
                  Our customer support team is here to help you with any questions about your order.
                </p>
                <div className="flex justify-center space-x-4">
                  <Button variant="outline">
                    <Phone className="h-4 w-4 mr-2" />
                    Call Support
                  </Button>
                  <Button variant="outline">
                    <Mail className="h-4 w-4 mr-2" />
                    Email Support
                  </Button>
                  <Button variant="outline">
                    <Users className="h-4 w-4 mr-2" />
                    Live Chat
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Continue Shopping */}
          <div className="text-center space-y-4">
            <h3 className="font-semibold text-lg">Continue Your Green Journey</h3>
            <p className="text-gray-600">
              Explore more eco-friendly products and accessories for your sustainable lifestyle.
            </p>
            <div className="flex justify-center space-x-4">
              <Link href="/products">
                <Button className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700">
                  Continue Shopping
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
              <Link href="/account">
                <Button variant="outline">
                  View My Orders
                </Button>
              </Link>
            </div>
          </div>

          {/* Review Invitation */}
          <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
            <CardContent className="p-6">
              <div className="text-center space-y-4">
                <div className="flex justify-center">
                  <Star className="h-8 w-8 text-yellow-500" />
                </div>
                <h3 className="font-semibold text-lg">Share Your Experience</h3>
                <p className="text-gray-600">
                  Once you receive your order, we'd love to hear your feedback!
                </p>
                <Button variant="outline">
                  <Heart className="h-4 w-4 mr-2" />
                  Remind Me to Review
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}