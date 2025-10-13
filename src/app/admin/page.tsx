'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart3, 
  Users, 
  ShoppingCart, 
  Package, 
  DollarSign,
  TrendingUp,
  TrendingDown,
  Eye,
  Edit,
  Trash2,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Clock,
  Truck
} from 'lucide-react';
import { useAuthStore } from '@/lib/store/auth';
import Link from 'next/link';

interface DashboardStats {
  totalOrders: number;
  totalRevenue: number;
  totalUsers: number;
  totalProducts: number;
  pendingOrders: number;
  processingOrders: number;
  shippedOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  recentOrders: any[];
  topProducts: any[];
  lowStockProducts: any[];
}

export default function AdminDashboard() {
  const { user, token } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      window.location.href = '/auth/login';
      return;
    }

    // Check if user is admin
    if (!['SUPER_ADMIN', 'ORDER_MANAGER', 'FINANCE_MANAGER', 'CONTENT_MANAGER'].includes(user?.role || '')) {
      window.location.href = '/dashboard';
      return;
    }

    fetchDashboardData();
  }, [token, user]);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/v1/admin/dashboard', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();

      if (data.success) {
        setStats(data.data);
      } else {
        setError(data.error || 'Failed to load dashboard data');
      }
    } catch (err) {
      setError('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'shipped':
        return <Truck className="w-4 h-4 text-blue-600" />;
      case 'processing':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'cancelled':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Manage your e-commerce platform and monitor performance.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {stats && (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <DollarSign className="h-8 w-8 text-green-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                      <p className="text-2xl font-bold text-gray-900">
                        ₹{stats.totalRevenue.toLocaleString('en-IN')}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <ShoppingCart className="h-8 w-8 text-blue-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Total Orders</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.totalOrders}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Users className="h-8 w-8 text-purple-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Total Users</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Package className="h-8 w-8 text-orange-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Total Products</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.totalProducts}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Order Status Stats */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Clock className="h-6 w-6 text-yellow-600" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-600">Pending</p>
                      <p className="text-xl font-bold text-gray-900">{stats.pendingOrders}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <RefreshCw className="h-6 w-6 text-blue-600" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-600">Processing</p>
                      <p className="text-xl font-bold text-gray-900">{stats.processingOrders}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Truck className="h-6 w-6 text-indigo-600" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-600">Shipped</p>
                      <p className="text-xl font-bold text-gray-900">{stats.shippedOrders}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-600">Delivered</p>
                      <p className="text-xl font-bold text-gray-900">{stats.deliveredOrders}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <AlertCircle className="h-6 w-6 text-red-600" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-600">Cancelled</p>
                      <p className="text-xl font-bold text-gray-900">{stats.cancelledOrders}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <Tabs defaultValue="orders" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="orders">Recent Orders</TabsTrigger>
                <TabsTrigger value="products">Top Products</TabsTrigger>
                <TabsTrigger value="inventory">Low Stock</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
              </TabsList>

              {/* Recent Orders */}
              <TabsContent value="orders" className="space-y-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="flex items-center">
                      <ShoppingCart className="w-5 h-5 mr-2" />
                      Recent Orders
                    </CardTitle>
                    <Link href="/admin/orders">
                      <Button variant="outline" size="sm">
                        View All Orders
                      </Button>
                    </Link>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {stats.recentOrders.map((order) => (
                        <div key={order.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-2">
                                <h3 className="font-semibold">Order #{order.orderNumber}</h3>
                                <Badge className={getStatusColor(order.status)}>
                                  <div className="flex items-center">
                                    {getStatusIcon(order.status)}
                                    <span className="ml-1">{order.status}</span>
                                  </div>
                                </Badge>
                                <Badge variant="outline">{order.paymentStatus}</Badge>
                              </div>
                              <p className="text-sm text-gray-600 mb-1">
                                Customer: {order.user?.name || 'Unknown'} | {order.user?.email || 'No email'}
                              </p>
                              <p className="text-sm text-gray-600">
                                {order.items?.length || 0} items | 
                                Total: ₹{order.totalAmount?.toLocaleString('en-IN') || 0}
                              </p>
                              <p className="text-xs text-gray-500">
                                {new Date(order.createdAt).toLocaleDateString('en-IN', {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </p>
                            </div>
                            <div className="flex space-x-2">
                              <Button variant="outline" size="sm">
                                <Eye className="w-4 h-4 mr-2" />
                                View
                              </Button>
                              <Button variant="outline" size="sm">
                                <Edit className="w-4 h-4 mr-2" />
                                Edit
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Top Products */}
              <TabsContent value="products" className="space-y-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="flex items-center">
                      <TrendingUp className="w-5 h-5 mr-2" />
                      Top Selling Products
                    </CardTitle>
                    <Link href="/admin/products">
                      <Button variant="outline" size="sm">
                        Manage Products
                      </Button>
                    </Link>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {stats.topProducts.map((product, index) => (
                        <div key={product.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center space-x-4">
                            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                              <span className="text-sm font-bold text-green-600">#{index + 1}</span>
                            </div>
                            <div>
                              <h3 className="font-semibold">{product.name}</h3>
                              <p className="text-sm text-gray-600">{product.category}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">{product.totalSold} sold</p>
                            <p className="text-sm text-gray-600">₹{product.revenue.toLocaleString('en-IN')}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Low Stock Alert */}
              <TabsContent value="inventory" className="space-y-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="flex items-center">
                      <AlertCircle className="w-5 h-5 mr-2 text-orange-600" />
                      Low Stock Alert
                    </CardTitle>
                    <Link href="/admin/inventory">
                      <Button variant="outline" size="sm">
                        Manage Inventory
                      </Button>
                    </Link>
                  </CardHeader>
                  <CardContent>
                    {stats.lowStockProducts.length === 0 ? (
                      <div className="text-center py-8">
                        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">All Products in Stock</h3>
                        <p className="text-gray-600">
                          Great! All products have sufficient inventory.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {stats.lowStockProducts.map((product) => (
                          <div key={product.id} className="flex items-center justify-between p-4 border border-orange-200 bg-orange-50 rounded-lg">
                            <div className="flex items-center space-x-4">
                              <AlertCircle className="w-5 h-5 text-orange-600" />
                              <div>
                                <h3 className="font-semibold">{product.name}</h3>
                                <p className="text-sm text-gray-600">SKU: {product.sku}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-orange-600">{product.quantity} left</p>
                              <p className="text-sm text-gray-600">Threshold: {product.lowStockThreshold}</p>
                            </div>
                            <Button variant="outline" size="sm">
                              Restock
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Analytics */}
              <TabsContent value="analytics" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <Link href="/admin/products/new">
                        <Button className="w-full justify-start">
                          <Package className="w-4 h-4 mr-2" />
                          Add New Product
                        </Button>
                      </Link>
                      <Link href="/admin/orders">
                        <Button variant="outline" className="w-full justify-start">
                          <ShoppingCart className="w-4 h-4 mr-2" />
                          Manage Orders
                        </Button>
                      </Link>
                      <Link href="/admin/users">
                        <Button variant="outline" className="w-full justify-start">
                          <Users className="w-4 h-4 mr-2" />
                          Manage Users
                        </Button>
                      </Link>
                      <Link href="/admin/content">
                        <Button variant="outline" className="w-full justify-start">
                          <Edit className="w-4 h-4 mr-2" />
                          Manage Content
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>System Health</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Database</span>
                        <Badge className="bg-green-100 text-green-800">Healthy</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Payment Gateway</span>
                        <Badge className="bg-green-100 text-green-800">Connected</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Email Service</span>
                        <Badge className="bg-green-100 text-green-800">Active</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Storage</span>
                        <Badge className="bg-green-100 text-green-800">Available</Badge>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </div>
  );
}