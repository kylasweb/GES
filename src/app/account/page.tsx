'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  User,
  Package,
  MapPin,
  CreditCard,
  Settings,
  LogOut,
  Eye,
  Download,
  Truck,
  CheckCircle,
  Clock,
  XCircle,
  Bell,
  Shield,
  Heart,
  Star
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useCart } from '@/hooks/use-cart';
import Link from 'next/link';

interface Order {
  id: string;
  orderNumber: string;
  date: string;
  status: 'processing' | 'shipped' | 'delivered' | 'cancelled';
  total: number;
  items: number;
  trackingNumber?: string;
}

interface Address {
  id: string;
  type: 'billing' | 'shipping';
  name: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault: boolean;
}

export default function AccountPage() {
  const { user, logout } = useAuth();
  const { clearCart } = useCart();
  const [activeTab, setActiveTab] = useState('dashboard');

  // Mock data - in real app, this would come from API
  const orders: Order[] = [
    {
      id: '1',
      orderNumber: 'GE-2024-001',
      date: '2024-01-15',
      status: 'delivered',
      total: 2499.99,
      items: 2,
      trackingNumber: 'TRK123456789'
    },
    {
      id: '2',
      orderNumber: 'GE-2024-002',
      date: '2024-01-20',
      status: 'shipped',
      total: 1299.99,
      items: 1,
      trackingNumber: 'TRK987654321'
    },
    {
      id: '3',
      orderNumber: 'GE-2024-003',
      date: '2024-01-25',
      status: 'processing',
      total: 3499.99,
      items: 3
    }
  ];

  const addresses: Address[] = [
    {
      id: '1',
      type: 'shipping',
      name: 'John Doe',
      street: '123 Green Street',
      city: 'Eco City',
      state: 'CA',
      zipCode: '90210',
      country: 'United States',
      isDefault: true
    },
    {
      id: '2',
      type: 'billing',
      name: 'John Doe',
      street: '123 Green Street',
      city: 'Eco City',
      state: 'CA',
      zipCode: '90210',
      country: 'United States',
      isDefault: true
    }
  ];

  const getStatusIcon = (status: Order['status']) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'shipped':
        return <Truck className="h-4 w-4 text-blue-600" />;
      case 'processing':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'shipped':
        return 'bg-blue-100 text-blue-800';
      case 'processing':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleLogout = async () => {
    await logout();
    clearCart();
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-cyan-50 to-blue-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Sign In Required</CardTitle>
            <CardDescription>Please sign in to access your account</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Link href="/auth">
              <Button className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700">
                Sign In
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-cyan-50 to-blue-50">
      <div className="container px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Account Header */}
          <div className="mb-8">
            <Card className="bg-gradient-to-r from-green-600 to-emerald-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-16 w-16 border-2 border-white">
                      <AvatarImage src="" />
                      <AvatarFallback className="bg-white/20 text-white text-xl">
                        {user.name?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h1 className="text-2xl font-bold">{user.name}</h1>
                      <p className="text-green-100">{user.email}</p>
                      <div className="flex items-center space-x-2 mt-2">
                        <Badge className="bg-white/20 text-white">
                          Member since 2024
                        </Badge>
                        <Badge className="bg-yellow-400 text-yellow-900">
                          <Star className="h-3 w-3 mr-1" />
                          Gold Member
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    onClick={handleLogout}
                    className="border-white text-white hover:bg-white hover:text-green-600"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Account Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="dashboard" className="flex items-center space-x-2">
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">Dashboard</span>
              </TabsTrigger>
              <TabsTrigger value="orders" className="flex items-center space-x-2">
                <Package className="h-4 w-4" />
                <span className="hidden sm:inline">Orders</span>
              </TabsTrigger>
              <TabsTrigger value="addresses" className="flex items-center space-x-2">
                <MapPin className="h-4 w-4" />
                <span className="hidden sm:inline">Addresses</span>
              </TabsTrigger>
              <TabsTrigger value="payment" className="flex items-center space-x-2">
                <CreditCard className="h-4 w-4" />
                <span className="hidden sm:inline">Payment</span>
              </TabsTrigger>
              <TabsTrigger value="wishlist" className="flex items-center space-x-2">
                <Heart className="h-4 w-4" />
                <span className="hidden sm:inline">Wishlist</span>
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center space-x-2">
                <Settings className="h-4 w-4" />
                <span className="hidden sm:inline">Settings</span>
              </TabsTrigger>
            </TabsList>

            {/* Dashboard Tab */}
            <TabsContent value="dashboard" className="space-y-6">
              <div className="grid md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                    <Package className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">12</div>
                    <p className="text-xs text-muted-foreground">+2 from last month</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">$8,499.96</div>
                    <p className="text-xs text-muted-foreground">+$1,299.99 from last month</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Wishlist Items</CardTitle>
                    <Heart className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">5</div>
                    <p className="text-xs text-muted-foreground">2 on sale now</p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Orders</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {orders.slice(0, 3).map((order) => (
                      <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          {getStatusIcon(order.status)}
                          <div>
                            <p className="font-medium">{order.orderNumber}</p>
                            <p className="text-sm text-muted-foreground">{order.date}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">${order.total.toFixed(2)}</p>
                          <Badge className={getStatusColor(order.status)}>
                            {order.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Link href="/account?tab=orders">
                    <Button variant="outline" className="w-full mt-4">
                      View All Orders
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Orders Tab */}
            <TabsContent value="orders" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Order History</CardTitle>
                  <CardDescription>View and track all your orders</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <div key={order.id} className="border rounded-lg p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h3 className="font-semibold text-lg">{order.orderNumber}</h3>
                            <p className="text-sm text-muted-foreground">Placed on {order.date}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-lg">${order.total.toFixed(2)}</p>
                            <Badge className={getStatusColor(order.status)}>
                              {getStatusIcon(order.status)}
                              <span className="ml-1">{order.status}</span>
                            </Badge>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <p className="text-sm text-muted-foreground">
                            {order.items} {order.items === 1 ? 'item' : 'items'}
                          </p>
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </Button>
                            {order.trackingNumber && (
                              <Button variant="outline" size="sm">
                                <Truck className="h-4 w-4 mr-2" />
                                Track
                              </Button>
                            )}
                            <Button variant="outline" size="sm">
                              <Download className="h-4 w-4 mr-2" />
                              Invoice
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Addresses Tab */}
            <TabsContent value="addresses" className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold">Shipping Addresses</h2>
                  <p className="text-muted-foreground">Manage your delivery addresses</p>
                </div>
                <Button className="bg-gradient-to-r from-green-600 to-emerald-600">
                  Add New Address
                </Button>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {addresses.map((address) => (
                  <Card key={address.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="capitalize">{address.type} Address</CardTitle>
                        {address.isDefault && (
                          <Badge className="bg-green-100 text-green-800">Default</Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <p className="font-medium">{address.name}</p>
                        <p className="text-sm text-muted-foreground">{address.street}</p>
                        <p className="text-sm text-muted-foreground">
                          {address.city}, {address.state} {address.zipCode}
                        </p>
                        <p className="text-sm text-muted-foreground">{address.country}</p>
                      </div>
                      <div className="flex space-x-2 mt-4">
                        <Button variant="outline" size="sm">Edit</Button>
                        {!address.isDefault && (
                          <Button variant="outline" size="sm">Set as Default</Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Payment Tab */}
            <TabsContent value="payment" className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold">Payment Methods</h2>
                  <p className="text-muted-foreground">Manage your payment options</p>
                </div>
                <Button className="bg-gradient-to-r from-green-600 to-emerald-600">
                  Add Payment Method
                </Button>
              </div>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <CreditCard className="h-8 w-8 text-blue-600" />
                      <div>
                        <p className="font-medium">•••• •••• •••• 4242</p>
                        <p className="text-sm text-muted-foreground">Expires 12/25</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className="bg-green-100 text-green-800">Default</Badge>
                      <Button variant="outline" size="sm">Edit</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Wishlist Tab */}
            <TabsContent value="wishlist" className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold">My Wishlist</h2>
                <p className="text-muted-foreground">Items you've saved for later</p>
              </div>

              <Card>
                <CardContent className="p-6">
                  <div className="text-center py-8">
                    <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-muted-foreground">Your wishlist is empty</p>
                    <Link href="/products">
                      <Button className="mt-4 bg-gradient-to-r from-green-600 to-emerald-600">
                        Browse Products
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings" className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold">Account Settings</h2>
                <p className="text-muted-foreground">Manage your account preferences</p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Profile Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="name">Full Name</Label>
                      <Input id="name" defaultValue={user.name || ''} />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" defaultValue={user.email} />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone</Label>
                      <Input id="phone" type="tel" placeholder="+1 (555) 123-4567" />
                    </div>
                    <Button className="bg-gradient-to-r from-green-600 to-emerald-600">
                      Update Profile
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Notifications</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Bell className="h-4 w-4" />
                        <span>Email Notifications</span>
                      </div>
                      <Button variant="outline" size="sm">Configure</Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Truck className="h-4 w-4" />
                        <span>Order Updates</span>
                      </div>
                      <Button variant="outline" size="sm">Configure</Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Heart className="h-4 w-4" />
                        <span>Wishlist Alerts</span>
                      </div>
                      <Button variant="outline" size="sm">Configure</Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Security</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Shield className="h-4 w-4" />
                      <span>Change Password</span>
                    </div>
                    <Button variant="outline" size="sm">Update</Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Shield className="h-4 w-4" />
                      <span>Two-Factor Authentication</span>
                    </div>
                    <Button variant="outline" size="sm">Enable</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}