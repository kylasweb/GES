'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
    AlertTriangle,
    Package,
    Search,
    Plus,
    Minus,
    TrendingUp,
    TrendingDown,
    AlertCircle,
    CheckCircle
} from 'lucide-react';
import { useAuthStore } from '@/lib/store/auth';
import { AdminSidebar } from '@/components/admin/sidebar';

interface InventoryItem {
    id: string;
    product: {
        id: string;
        name: string;
        sku: string;
        price: number;
    };
    quantity: number;
    reserved: number;
    lowStockThreshold: number;
    reorderPoint: number;
    lastUpdated: string;
}

export default function InventoryManagementPage() {
    const { token } = useAuthStore();
    const [isLoading, setIsLoading] = useState(true);
    const [inventory, setInventory] = useState<InventoryItem[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [updatingStock, setUpdatingStock] = useState<string | null>(null);

    useEffect(() => {
        fetchInventory();
    }, []);

    const fetchInventory = async () => {
        try {
            const response = await fetch('/api/v1/admin/inventory', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            const data = await response.json();

            if (data.success) {
                setInventory(data.data);
            } else {
                setError(data.error || 'Failed to load inventory');
            }
        } catch (err) {
            setError('Failed to load inventory');
        } finally {
            setIsLoading(false);
        }
    };

    const handleStockUpdate = async (inventoryId: string, newQuantity: number) => {
        if (newQuantity < 0) return;

        setUpdatingStock(inventoryId);
        try {
            const response = await fetch(`/api/v1/admin/inventory/${inventoryId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ quantity: newQuantity })
            });

            const data = await response.json();

            if (data.success) {
                setInventory(inventory.map(item =>
                    item.id === inventoryId ? { ...item, quantity: newQuantity, lastUpdated: new Date().toISOString() } : item
                ));
            } else {
                setError(data.error || 'Failed to update stock');
            }
        } catch (err) {
            setError('Failed to update stock');
        } finally {
            setUpdatingStock(null);
        }
    };

    const getStockStatus = (item: InventoryItem) => {
        const available = item.quantity - item.reserved;
        if (available <= 0) return { status: 'Out of Stock', color: 'bg-red-100 text-red-800', icon: AlertCircle };
        if (available <= item.lowStockThreshold) return { status: 'Low Stock', color: 'bg-orange-100 text-orange-800', icon: AlertTriangle };
        return { status: 'In Stock', color: 'bg-green-100 text-green-800', icon: CheckCircle };
    };

    const filteredInventory = inventory.filter(item =>
        item.product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.product.sku.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const lowStockItems = filteredInventory.filter(item => item.quantity - item.reserved <= item.lowStockThreshold);
    const outOfStockItems = filteredInventory.filter(item => item.quantity - item.reserved <= 0);

    if (isLoading) {
        return (
            <div className="flex min-h-screen bg-gray-50">
                <AdminSidebar />
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">Loading inventory...</p>
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
                        <h1 className="text-3xl font-bold text-gray-900">Inventory Management</h1>
                        <p className="text-gray-600 mt-2">
                            Monitor stock levels, manage inventory, and handle restocking.
                        </p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-red-800">{error}</p>
                        </div>
                    )}

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center">
                                    <Package className="h-8 w-8 text-blue-600" />
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-gray-600">Total Items</p>
                                        <p className="text-2xl font-bold text-gray-900">{filteredInventory.length}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center">
                                    <CheckCircle className="h-8 w-8 text-green-600" />
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-gray-600">In Stock</p>
                                        <p className="text-2xl font-bold text-gray-900">
                                            {filteredInventory.filter(item => item.quantity - item.reserved > item.lowStockThreshold).length}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center">
                                    <AlertTriangle className="h-8 w-8 text-orange-600" />
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-gray-600">Low Stock</p>
                                        <p className="text-2xl font-bold text-gray-900">{lowStockItems.length}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center">
                                    <AlertCircle className="h-8 w-8 text-red-600" />
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-gray-600">Out of Stock</p>
                                        <p className="text-2xl font-bold text-gray-900">{outOfStockItems.length}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Search */}
                    <Card className="mb-6">
                        <CardContent className="p-6">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <Input
                                    placeholder="Search inventory by product name or SKU..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Inventory Table */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <Package className="w-5 h-5 mr-2" />
                                Inventory Items
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Product</TableHead>
                                        <TableHead>SKU</TableHead>
                                        <TableHead>Available</TableHead>
                                        <TableHead>Reserved</TableHead>
                                        <TableHead>Total</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredInventory.map((item) => {
                                        const stockStatus = getStockStatus(item);
                                        const StatusIcon = stockStatus.icon;
                                        const available = item.quantity - item.reserved;

                                        return (
                                            <TableRow key={item.id}>
                                                <TableCell>
                                                    <div>
                                                        <p className="font-medium">{item.product.name}</p>
                                                        <p className="text-sm text-gray-600">₹{item.product.price.toLocaleString('en-IN')}</p>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="font-mono text-sm">{item.product.sku}</TableCell>
                                                <TableCell className="font-medium">{available}</TableCell>
                                                <TableCell>{item.reserved}</TableCell>
                                                <TableCell>{item.quantity}</TableCell>
                                                <TableCell>
                                                    <Badge className={stockStatus.color}>
                                                        <StatusIcon className="w-3 h-3 mr-1" />
                                                        {stockStatus.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center space-x-2">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handleStockUpdate(item.id, item.quantity - 1)}
                                                            disabled={updatingStock === item.id || item.quantity <= 0}
                                                        >
                                                            <Minus className="w-4 h-4" />
                                                        </Button>
                                                        <Input
                                                            type="number"
                                                            value={item.quantity}
                                                            onChange={(e) => {
                                                                const newQuantity = parseInt(e.target.value) || 0;
                                                                setInventory(inventory.map(inv =>
                                                                    inv.id === item.id ? { ...inv, quantity: newQuantity } : inv
                                                                ));
                                                            }}
                                                            onBlur={(e) => handleStockUpdate(item.id, parseInt(e.target.value) || 0)}
                                                            className="w-20 h-8 text-center"
                                                            disabled={updatingStock === item.id}
                                                        />
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handleStockUpdate(item.id, item.quantity + 1)}
                                                            disabled={updatingStock === item.id}
                                                        >
                                                            <Plus className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>

                            {filteredInventory.length === 0 && (
                                <div className="text-center py-12">
                                    <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">No inventory items found</h3>
                                    <p className="text-gray-600">
                                        {searchTerm ? 'Try adjusting your search terms.' : 'Inventory items will appear here once products are added.'}
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}