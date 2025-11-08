'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from '@/components/ui/chart';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { useToast } from '@/hooks/use-toast';
import {
    TrendingUp,
    DollarSign,
    Users,
    Package,
    AlertTriangle,
    Download,
    Calendar
} from 'lucide-react';

interface ReportData {
    summary: {
        totalOrders: number;
        totalRevenue: number;
        totalCustomers: number;
        pendingOrders: number;
        lowStockProducts: number;
    };
    recentOrders: Array<{
        id: string;
        orderNumber: string;
        totalAmount: number;
        status: string;
        createdAt: string;
        user: {
            name: string;
            email: string;
        };
    }>;
    topProducts: Array<{
        id: string;
        name: string;
        sku: string;
        price: number;
        quantity: number;
    }>;
    dailySales: Array<{
        date: string;
        sales: number;
        revenue: number;
    }>;
}

export default function AdminReportsPage() {
    const [reportData, setReportData] = useState<ReportData | null>(null);
    const [loading, setLoading] = useState(true);
    const [period, setPeriod] = useState('30');
    const [exportType, setExportType] = useState<'orders' | 'products' | 'customers'>('orders');
    const [exporting, setExporting] = useState(false);

    const { toast } = useToast();

    useEffect(() => {
        fetchReports();
    }, [period]);

    const fetchReports = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');

            const response = await fetch(`/api/v1/admin/reports?period=${period}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            const data = await response.json();

            if (data.success) {
                setReportData(data.data);
            } else {
                toast({
                    title: 'Error',
                    description: data.error || 'Failed to fetch reports',
                    variant: 'destructive',
                });
            }
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to fetch reports',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleExport = async () => {
        try {
            setExporting(true);
            const token = localStorage.getItem('token');

            const response = await fetch(`/api/v1/admin/export?type=${exportType}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${exportType}-${Date.now()}.csv`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);

                toast({
                    title: 'Success',
                    description: 'Export downloaded successfully',
                });
            } else {
                toast({
                    title: 'Error',
                    description: 'Failed to export data',
                    variant: 'destructive',
                });
            }
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to export data',
                variant: 'destructive',
            });
        } finally {
            setExporting(false);
        }
    };

    if (loading) {
        return (
            <div className="container mx-auto py-8 px-4">
                <div className="text-center py-20">Loading reports...</div>
            </div>
        );
    }

    if (!reportData) {
        return (
            <div className="container mx-auto py-8 px-4">
                <div className="text-center py-20 text-muted-foreground">No data available</div>
            </div>
        );
    }

    const chartConfig = {
        sales: {
            label: "Sales",
            color: "hsl(var(--chart-1))",
        },
        revenue: {
            label: "Revenue",
            color: "hsl(var(--chart-2))",
        },
    };

    return (
        <div className="container mx-auto py-8 px-4">
            {/* Header */}
            <div className="mb-8 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold mb-2">Analytics & Reports</h1>
                    <p className="text-muted-foreground">Business insights and performance metrics</p>
                </div>

                <div className="flex gap-2">
                    <Select value={period} onValueChange={setPeriod}>
                        <SelectTrigger className="w-[180px]">
                            <Calendar className="mr-2 h-4 w-4" />
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="7">Last 7 Days</SelectItem>
                            <SelectItem value="30">Last 30 Days</SelectItem>
                            <SelectItem value="90">Last 90 Days</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5 mb-8">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                        <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{reportData.summary.totalOrders}</div>
                        <p className="text-xs text-muted-foreground">Last {period} days</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">₹{reportData.summary.totalRevenue.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">Last {period} days</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">New Customers</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{reportData.summary.totalCustomers}</div>
                        <p className="text-xs text-muted-foreground">Last {period} days</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{reportData.summary.pendingOrders}</div>
                        <p className="text-xs text-muted-foreground">Awaiting processing</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{reportData.summary.lowStockProducts}</div>
                        <p className="text-xs text-muted-foreground">Products {"<"} 10 units</p>
                    </CardContent>
                </Card>
            </div>

            {/* Charts */}
            <div className="grid gap-4 md:grid-cols-2 mb-8">
                {/* Daily Sales Chart */}
                <Card>
                    <CardHeader>
                        <CardTitle>Daily Sales</CardTitle>
                        <CardDescription>Number of orders per day</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer config={chartConfig} className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={reportData.dailySales}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis
                                        dataKey="date"
                                        tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                    />
                                    <YAxis />
                                    <ChartTooltip content={<ChartTooltipContent />} />
                                    <Bar dataKey="sales" fill="var(--color-sales)" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </ChartContainer>
                    </CardContent>
                </Card>

                {/* Daily Revenue Chart */}
                <Card>
                    <CardHeader>
                        <CardTitle>Daily Revenue</CardTitle>
                        <CardDescription>Revenue generated per day</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer config={chartConfig} className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={reportData.dailySales}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis
                                        dataKey="date"
                                        tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                    />
                                    <YAxis />
                                    <ChartTooltip content={<ChartTooltipContent />} />
                                    <Line
                                        type="monotone"
                                        dataKey="revenue"
                                        stroke="var(--color-revenue)"
                                        strokeWidth={2}
                                        dot={{ r: 4 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </ChartContainer>
                    </CardContent>
                </Card>
            </div>

            {/* Tables */}
            <div className="grid gap-4 md:grid-cols-2 mb-8">
                {/* Recent Orders */}
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Orders</CardTitle>
                        <CardDescription>Latest 10 orders</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {reportData.recentOrders.map((order) => (
                                <div key={order.id} className="flex items-center justify-between border-b pb-2">
                                    <div className="flex-1">
                                        <p className="font-medium text-sm">{order.orderNumber}</p>
                                        <p className="text-xs text-muted-foreground">{order.user.name}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-medium text-sm">₹{order.totalAmount.toFixed(2)}</p>
                                        <p className="text-xs text-muted-foreground">{order.status}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Top Products */}
                <Card>
                    <CardHeader>
                        <CardTitle>Low Stock Products</CardTitle>
                        <CardDescription>Products needing restock</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {reportData.topProducts.map((product) => (
                                <div key={product.id} className="flex items-center justify-between border-b pb-2">
                                    <div className="flex-1">
                                        <p className="font-medium text-sm">{product.name}</p>
                                        <p className="text-xs text-muted-foreground">{product.sku}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-medium text-sm">₹{product.price.toFixed(2)}</p>
                                        <p className="text-xs text-red-500">Stock: {product.quantity}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Export Section */}
            <Card>
                <CardHeader>
                    <CardTitle>Export Data</CardTitle>
                    <CardDescription>Download reports in CSV format</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex gap-4 items-end">
                        <div className="flex-1">
                            <Select value={exportType} onValueChange={(value: any) => setExportType(value)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="orders">Orders</SelectItem>
                                    <SelectItem value="products">Products</SelectItem>
                                    <SelectItem value="customers">Customers</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <Button onClick={handleExport} disabled={exporting}>
                            <Download className="mr-2 h-4 w-4" />
                            {exporting ? 'Exporting...' : 'Export CSV'}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
