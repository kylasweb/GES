'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    BarChart3,
    TrendingUp,
    Users,
    ShoppingCart,
    Package,
    DollarSign,
    Eye,
    Calendar,
    Download
} from 'lucide-react';
import { useAuthStore } from '@/lib/store/auth';
import { AdminSidebar } from '@/components/admin/sidebar';

interface AnalyticsData {
    totalRevenue: number;
    totalOrders: number;
    totalUsers: number;
    totalProducts: number;
    revenueGrowth: number;
    ordersGrowth: number;
    usersGrowth: number;
    productsGrowth: number;
    recentOrders: Array<{
        id: string;
        customerName: string;
        amount: number;
        status: string;
        createdAt: string;
    }>;
    topProducts: Array<{
        id: string;
        name: string;
        sales: number;
        revenue: number;
    }>;
    monthlyRevenue: Array<{
        month: string;
        revenue: number;
        orders: number;
    }>;
}

export default function AnalyticsPage() {
    const { token } = useAuthStore();
    const [isLoading, setIsLoading] = useState(true);
    const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
    const [timeRange, setTimeRange] = useState('30d');
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchAnalytics();
    }, [timeRange]);

    const fetchAnalytics = async () => {
        try {
            const response = await fetch(`/api/v1/admin/analytics?period=${timeRange}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            const data = await response.json();

            if (data.success) {
                setAnalytics(data.data);
            } else {
                setError(data.error || 'Failed to load analytics');
            }
        } catch (err) {
            setError('Failed to load analytics');
        } finally {
            setIsLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'completed':
            case 'delivered':
                return 'bg-green-100 text-green-800';
            case 'processing':
                return 'bg-blue-100 text-blue-800';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'cancelled':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    if (isLoading) {
        return (
            <div className="flex min-h-screen bg-gray-50">
                <AdminSidebar />
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">Loading analytics...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-gray-50">
            <AdminSidebar />
            <div className="flex-1">
                <div className="p-8">
                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
                                <p className="text-gray-600 mt-2">
                                    Monitor your business performance and insights.
                                </p>
                            </div>
                            <div className="flex items-center space-x-4">
                                <Select value={timeRange} onValueChange={setTimeRange}>
                                    <SelectTrigger className="w-32">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="7d">Last 7 days</SelectItem>
                                        <SelectItem value="30d">Last 30 days</SelectItem>
                                        <SelectItem value="90d">Last 90 days</SelectItem>
                                        <SelectItem value="1y">Last year</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Button variant="outline">
                                    <Download className="w-4 h-4 mr-2" />
                                    Export
                                </Button>
                            </div>
                        </div>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-red-800">{error}</p>
                        </div>
                    )}

                    {analytics && (
                        <>
                            {/* Key Metrics */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                                <Card>
                                    <CardContent className="p-6">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                                                <p className="text-2xl font-bold text-gray-900">
                                                    ₹{analytics.totalRevenue.toLocaleString('en-IN')}
                                                </p>
                                                <p className="text-sm text-green-600 flex items-center mt-1">
                                                    <TrendingUp className="w-4 h-4 mr-1" />
                                                    +{analytics.revenueGrowth}%
                                                </p>
                                            </div>
                                            <DollarSign className="w-8 h-8 text-green-600" />
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardContent className="p-6">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                                                <p className="text-2xl font-bold text-gray-900">
                                                    {analytics.totalOrders.toLocaleString()}
                                                </p>
                                                <p className="text-sm text-green-600 flex items-center mt-1">
                                                    <TrendingUp className="w-4 h-4 mr-1" />
                                                    +{analytics.ordersGrowth}%
                                                </p>
                                            </div>
                                            <ShoppingCart className="w-8 h-8 text-blue-600" />
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardContent className="p-6">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-medium text-gray-600">Total Users</p>
                                                <p className="text-2xl font-bold text-gray-900">
                                                    {analytics.totalUsers.toLocaleString()}
                                                </p>
                                                <p className="text-sm text-green-600 flex items-center mt-1">
                                                    <TrendingUp className="w-4 h-4 mr-1" />
                                                    +{analytics.usersGrowth}%
                                                </p>
                                            </div>
                                            <Users className="w-8 h-8 text-purple-600" />
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardContent className="p-6">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-medium text-gray-600">Total Products</p>
                                                <p className="text-2xl font-bold text-gray-900">
                                                    {analytics.totalProducts.toLocaleString()}
                                                </p>
                                                <p className="text-sm text-green-600 flex items-center mt-1">
                                                    <TrendingUp className="w-4 h-4 mr-1" />
                                                    +{analytics.productsGrowth}%
                                                </p>
                                            </div>
                                            <Package className="w-8 h-8 text-orange-600" />
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                {/* Revenue Chart Placeholder */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center">
                                            <BarChart3 className="w-5 h-5 mr-2" />
                                            Revenue Trend
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                                            <div className="text-center">
                                                <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                                                <p className="text-gray-600">Revenue chart will be displayed here</p>
                                                <p className="text-sm text-gray-500 mt-1">
                                                    Monthly data: {analytics.monthlyRevenue.length} months
                                                </p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Recent Orders */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center">
                                            <ShoppingCart className="w-5 h-5 mr-2" />
                                            Recent Orders
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            {analytics.recentOrders.slice(0, 5).map((order) => (
                                                <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                                    <div>
                                                        <p className="font-medium text-sm">{order.customerName}</p>
                                                        <p className="text-xs text-gray-600">
                                                            {new Date(order.createdAt).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="font-medium text-sm">
                                                            ₹{order.amount.toLocaleString('en-IN')}
                                                        </p>
                                                        <Badge className={getStatusColor(order.status)}>
                                                            {order.status}
                                                        </Badge>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Top Products */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center">
                                            <Package className="w-5 h-5 mr-2" />
                                            Top Products
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            {analytics.topProducts.slice(0, 5).map((product, index) => (
                                                <div key={product.id} className="flex items-center justify-between">
                                                    <div className="flex items-center space-x-3">
                                                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-sm font-medium text-green-800">
                                                            {index + 1}
                                                        </div>
                                                        <div>
                                                            <p className="font-medium text-sm">{product.name}</p>
                                                            <p className="text-xs text-gray-600">
                                                                {product.sales} sales
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <p className="font-medium text-sm">
                                                        ₹{product.revenue.toLocaleString('en-IN')}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Quick Stats */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center">
                                            <Eye className="w-5 h-5 mr-2" />
                                            Quick Insights
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm text-gray-600">Average Order Value</span>
                                                <span className="font-medium">
                                                    ₹{analytics.totalOrders > 0
                                                        ? (analytics.totalRevenue / analytics.totalOrders).toLocaleString('en-IN', { maximumFractionDigits: 0 })
                                                        : '0'
                                                    }
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm text-gray-600">Conversion Rate</span>
                                                <span className="font-medium">2.4%</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm text-gray-600">Customer Lifetime Value</span>
                                                <span className="font-medium">
                                                    ₹{(analytics.totalRevenue / Math.max(analytics.totalUsers, 1)).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm text-gray-600">Inventory Turnover</span>
                                                <span className="font-medium">4.2x</span>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}