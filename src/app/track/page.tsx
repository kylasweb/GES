'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Search, 
  Package, 
  Truck, 
  MapPin, 
  Clock,
  CheckCircle,
  ArrowRight,
  Phone,
  Mail,
  Calendar,
  User,
  BarChart3,
  RefreshCw,
  Bell,
  Download
} from 'lucide-react';
import { Header } from '@/components/layout/header';

interface TrackingStep {
  id: string;
  title: string;
  description: string;
  time: string;
  completed: boolean;
  current: boolean;
}

interface OrderTracking {
  orderNumber: string;
  status: 'processing' | 'shipped' | 'out-for-delivery' | 'delivered';
  estimatedDelivery: string;
  currentLocation: string;
  trackingNumber: string;
  carrier: string;
  steps: TrackingStep[];
  customerInfo: {
    name: string;
    email: string;
    phone: string;
  };
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
}

export default function TrackOrderPage() {
  const [trackingNumber, setTrackingNumber] = useState('');
  const [orderData, setOrderData] = useState<OrderTracking | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleTrackOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Simulate API call
    setTimeout(() => {
      // Mock tracking data
      const mockData: OrderTracking = {
        orderNumber: 'GE-2024-001',
        status: 'shipped',
        estimatedDelivery: '2024-02-01',
        currentLocation: 'Distribution Center, Los Angeles, CA',
        trackingNumber: trackingNumber,
        carrier: 'Green Energy Express',
        steps: [
          {
            id: '1',
            title: 'Order Confirmed',
            description: 'Your order has been received and is being processed',
            time: '2024-01-25 10:30 AM',
            completed: true,
            current: false
          },
          {
            id: '2',
            title: 'Order Processing',
            description: 'Your items are being prepared for shipment',
            time: '2024-01-25 2:00 PM',
            completed: true,
            current: false
          },
          {
            id: '3',
            title: 'Shipped',
            description: 'Your order has been shipped and is on its way',
            time: '2024-01-26 9:15 AM',
            completed: true,
            current: true
          },
          {
            id: '4',
            title: 'Out for Delivery',
            description: 'Your package is out for delivery',
            time: 'Expected by 6:00 PM',
            completed: false,
            current: false
          },
          {
            id: '5',
            title: 'Delivered',
            description: 'Your package has been delivered',
            time: 'Expected today',
            completed: false,
            current: false
          }
        ],
        customerInfo: {
          name: 'John Doe',
          email: 'john.doe@example.com',
          phone: '+1 (555) 123-4567'
        },
        shippingAddress: {
          street: '123 Green Street',
          city: 'Eco City',
          state: 'CA',
          zipCode: '90210',
          country: 'United States'
        },
        items: [
          {
            name: 'Premium Solar Panel 400W',
            quantity: 2,
            price: 899.99
          },
          {
            name: 'Lithium Battery 12V 100Ah',
            quantity: 1,
            price: 699.99
          }
        ]
      };

      setOrderData(mockData);
      setLoading(false);
    }, 1500);
  };

  const getStatusColor = (status: OrderTracking['status']) => {
    switch (status) {
      case 'processing':
        return 'bg-yellow-100 text-yellow-800';
      case 'shipped':
        return 'bg-blue-100 text-blue-800';
      case 'out-for-delivery':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: OrderTracking['status']) => {
    switch (status) {
      case 'processing':
        return <Package className="h-5 w-5" />;
      case 'shipped':
        return <Truck className="h-5 w-5" />;
      case 'out-for-delivery':
        return <MapPin className="h-5 w-5" />;
      case 'delivered':
        return <CheckCircle className="h-5 w-5" />;
      default:
        return <Package className="h-5 w-5" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-cyan-50 to-blue-50">
      <Header />
      
      <div className="container px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Page Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Track Your Order</h1>
            <p className="text-gray-600">
              Enter your tracking number to get real-time updates on your delivery
            </p>
          </div>

          {/* Tracking Form */}
          {!orderData && (
            <Card className="mb-8">
              <CardContent className="p-6">
                <form onSubmit={handleTrackOrder} className="space-y-4">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Enter tracking number (e.g., TRK123456789)"
                        value={trackingNumber}
                        onChange={(e) => setTrackingNumber(e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                    <Button 
                      type="submit" 
                      disabled={loading}
                      className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                    >
                      {loading ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          Tracking...
                        </>
                      ) : (
                        <>
                          <Search className="h-4 w-4 mr-2" />
                          Track Order
                        </>
                      )}
                    </Button>
                  </div>
                  {error && (
                    <p className="text-red-600 text-sm">{error}</p>
                  )}
                </form>
              </CardContent>
            </Card>
          )}

          {/* Tracking Results */}
          {orderData && (
            <div className="space-y-6">
              {/* Order Status Card */}
              <Card className="border-l-4 border-l-green-500">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        Order #{orderData.orderNumber}
                      </h2>
                      <div className="flex items-center space-x-4">
                        <Badge className={getStatusColor(orderData.status)}>
                          {getStatusIcon(orderData.status)}
                          <span className="ml-1 capitalize">
                            {orderData.status.replace('-', ' ')}
                          </span>
                        </Badge>
                        <span className="text-sm text-gray-600">
                          Tracking: {orderData.trackingNumber}
                        </span>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setOrderData(null);
                        setTrackingNumber('');
                      }}
                    >
                      Track Another Order
                    </Button>
                  </div>

                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="flex items-center space-x-3">
                      <Truck className="h-8 w-8 text-blue-600" />
                      <div>
                        <p className="text-sm text-gray-600">Carrier</p>
                        <p className="font-medium">{orderData.carrier}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Calendar className="h-8 w-8 text-green-600" />
                      <div>
                        <p className="text-sm text-gray-600">Estimated Delivery</p>
                        <p className="font-medium">{orderData.estimatedDelivery}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <MapPin className="h-8 w-8 text-purple-600" />
                      <div>
                        <p className="text-sm text-gray-600">Current Location</p>
                        <p className="font-medium">{orderData.currentLocation}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Tracking Timeline */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="h-5 w-5 mr-2" />
                    Tracking History
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {orderData.steps.map((step, index) => (
                      <div key={step.id} className="flex items-start space-x-4">
                        <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                          step.completed 
                            ? 'bg-green-600 text-white' 
                            : step.current 
                              ? 'bg-blue-600 text-white' 
                              : 'bg-gray-300 text-gray-600'
                        }`}>
                          {step.completed ? (
                            <CheckCircle className="h-5 w-5" />
                          ) : step.current ? (
                            <Truck className="h-5 w-5" />
                          ) : (
                            <Clock className="h-5 w-5" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h3 className={`font-semibold ${
                              step.current ? 'text-blue-600' : step.completed ? 'text-green-600' : 'text-gray-600'
                            }`}>
                              {step.title}
                            </h3>
                            <span className="text-sm text-gray-500">{step.time}</span>
                          </div>
                          <p className="text-gray-600 text-sm mt-1">{step.description}</p>
                        </div>
                        {index < orderData.steps.length - 1 && (
                          <div className={`absolute left-5 mt-10 w-0.5 h-16 ${
                            step.completed ? 'bg-green-600' : 'bg-gray-300'
                          }`} />
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Delivery Details */}
              <div className="grid md:grid-cols-2 gap-6">
                {/* Shipping Address */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <MapPin className="h-5 w-5 mr-2" />
                      Delivery Address
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p className="font-medium">{orderData.customerInfo.name}</p>
                      <p className="text-gray-600">{orderData.shippingAddress.street}</p>
                      <p className="text-gray-600">
                        {orderData.shippingAddress.city}, {orderData.shippingAddress.state} {orderData.shippingAddress.zipCode}
                      </p>
                      <p className="text-gray-600">{orderData.shippingAddress.country}</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Contact Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <User className="h-5 w-5 mr-2" />
                      Contact Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <Mail className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">{orderData.customerInfo.email}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">{orderData.customerInfo.phone}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Order Items */}
              <Card>
                <CardHeader>
                  <CardTitle>Order Items</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {orderData.items.map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                        </div>
                        <p className="font-semibold">${(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Actions */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button variant="outline" className="w-full sm:w-auto">
                      <Bell className="h-4 w-4 mr-2" />
                      Get Notifications
                    </Button>
                    <Button variant="outline" className="w-full sm:w-auto">
                      <Download className="h-4 w-4 mr-2" />
                      Download Receipt
                    </Button>
                    <Button variant="outline" className="w-full sm:w-auto">
                      <Phone className="h-4 w-4 mr-2" />
                      Contact Support
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Help Section */}
          {!orderData && (
            <Card className="mt-8 bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200">
              <CardContent className="p-6">
                <div className="text-center">
                  <h3 className="font-semibold text-lg mb-2">Need Help?</h3>
                  <p className="text-gray-600 mb-4">
                    If you have any questions about your order, our customer support team is here to help.
                  </p>
                  <div className="flex justify-center space-x-4">
                    <Link href="/contact">
                      <Button variant="outline">
                        <Phone className="h-4 w-4 mr-2" />
                        Contact Support
                      </Button>
                    </Link>
                    <Link href="/account">
                      <Button variant="outline">
                        <Package className="h-4 w-4 mr-2" />
                        My Orders
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}