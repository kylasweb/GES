'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import {
    AlertTriangle,
    Package,
    Search,
    Plus,
    Minus,
    TrendingUp,
    TrendingDown,
    AlertCircle,
    CheckCircle,
    Download,
    Edit,
    Trash2
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
    const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
    const [isBulkMode, setIsBulkMode] = useState(false);

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

    // Bulk operations
    const handleSelectItem = (itemId: string, checked: boolean) => {
        const newSelected = new Set(selectedItems);
        if (checked) {
            newSelected.add(itemId);
        } else {
            newSelected.delete(itemId);
        }
        setSelectedItems(newSelected);
        setIsBulkMode(newSelected.size > 0);
    };

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            const allIds = new Set(filteredInventory.map(i => i.id));
            setSelectedItems(allIds);
            setIsBulkMode(true);
        } else {
            setSelectedItems(new Set());
            setIsBulkMode(false);
        }
    };

    const handleBulkStockUpdate = async (quantityChange: number) => {
        if (selectedItems.size === 0) return;

        try {
            const updatePromises = Array.from(selectedItems).map(itemId => {
                const item = inventory.find(i => i.id === itemId);
                if (!item) return Promise.resolve(new Response(JSON.stringify({ success: false }), { status: 404 }));

                const newQuantity = Math.max(0, item.quantity + quantityChange);
                return fetch(`/api/v1/admin/inventory/${itemId}`, {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ quantity: newQuantity })
                });
            });

            const responses = await Promise.all(updatePromises);
            const results = await Promise.all(responses.map(async (r) => {
                if (r instanceof Response) {
                    return r.json();
                }
                return { success: false };
            }));

            const successCount = results.filter(r => r.success).length;
            const failCount = results.length - successCount;

            if (successCount > 0) {
                // Update local state
                setInventory(inventory.map(item => {
                    if (selectedItems.has(item.id)) {
                        const newQuantity = Math.max(0, item.quantity + quantityChange);
                        return { ...item, quantity: newQuantity, lastUpdated: new Date().toISOString() };
                    }
                    return item;
                }));
                setSelectedItems(new Set());
                setIsBulkMode(false);
                if (failCount > 0) {
                    setError(`${successCount} items updated, ${failCount} failed`);
                }
            } else {
                setError('Failed to update inventory');
            }
        } catch (err) {
            setError('Failed to update inventory');
        }
    };

    const handleBulkExport = () => {
        if (selectedItems.size === 0) return;

        const selectedInventoryData = inventory.filter(i => selectedItems.has(i.id));
        const csvContent = [
            ['Product Name', 'SKU', 'Current Stock', 'Reserved', 'Available', 'Low Stock Threshold', 'Reorder Point', 'Last Updated'],
            ...selectedInventoryData.map(item => [
                item.product.name,
                item.product.sku,
                item.quantity.toString(),
                item.reserved.toString(),
                (item.quantity - item.reserved).toString(),
                item.lowStockThreshold.toString(),
                item.reorderPoint.toString(),
                new Date(item.lastUpdated).toLocaleDateString()
            ])
        ].map(row => row.join(',')).join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `inventory_export_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    const handleCreateInventoryItem = async (itemData: {
        productId: string;
        quantity: number;
        lowStockThreshold: number;
        reorderPoint: number;
    }) => {
        try {
            const response = await fetch('/api/v1/admin/inventory', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(itemData)
            });

            const data = await response.json();

            if (data.success) {
                setInventory([...inventory, data.data]);
                setError(null);
            } else {
                setError(data.error || 'Failed to create inventory item');
            }
        } catch (err) {
            setError('Failed to create inventory item');
        }
    };

    const handleEditInventoryItem = async (itemId: string, itemData: Partial<InventoryItem>) => {
        try {
            const response = await fetch(`/api/v1/admin/inventory/${itemId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(itemData)
            });

            const data = await response.json();

            if (data.success) {
                setInventory(inventory.map(item =>
                    item.id === itemId ? { ...item, ...itemData } : item
                ));
                setError(null);
            } else {
                setError(data.error || 'Failed to update inventory item');
            }
        } catch (err) {
            setError('Failed to update inventory item');
        }
    };

    const handleDeleteInventoryItem = async (itemId: string) => {
        if (!confirm('Are you sure you want to delete this inventory item? This action cannot be undone.')) {
            return;
        }

        try {
            const response = await fetch(`/api/v1/admin/inventory/${itemId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            const data = await response.json();

            if (data.success) {
                setInventory(inventory.filter(item => item.id !== itemId));
                setError(null);
            } else {
                setError(data.error || 'Failed to delete inventory item');
            }
        } catch (err) {
            setError('Failed to delete inventory item');
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
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">Inventory Management</h1>
                                <p className="text-gray-600 mt-2">
                                    Monitor stock levels, manage inventory, and handle restocking.
                                </p>
                            </div>
                            <Button onClick={() => {
                                const productId = prompt('Enter Product ID:');
                                const quantity = parseInt(prompt('Enter initial quantity:') || '0');
                                const lowStockThreshold = parseInt(prompt('Enter low stock threshold:') || '5');
                                const reorderPoint = parseInt(prompt('Enter reorder point:') || '10');

                                if (productId && quantity >= 0) {
                                    handleCreateInventoryItem({
                                        productId,
                                        quantity,
                                        lowStockThreshold,
                                        reorderPoint
                                    });
                                }
                            }}>
                                <Plus className="w-4 h-4 mr-2" />
                                Add Item
                            </Button>
                        </div>
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

                    {/* Bulk Actions Toolbar */}
                    {isBulkMode && (
                        <Card className="mb-6 bg-blue-50 border-blue-200">
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-4">
                                        <span className="text-sm font-medium text-blue-900">
                                            {selectedItems.size} item{selectedItems.size !== 1 ? 's' : ''} selected
                                        </span>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleBulkStockUpdate(-1)}
                                            className="text-orange-700 border-orange-300 hover:bg-orange-50"
                                        >
                                            <Minus className="w-4 h-4 mr-2" />
                                            Decrease (-1)
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleBulkStockUpdate(1)}
                                            className="text-green-700 border-green-300 hover:bg-green-50"
                                        >
                                            <Plus className="w-4 h-4 mr-2" />
                                            Increase (+1)
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleBulkStockUpdate(10)}
                                            className="text-blue-700 border-blue-300 hover:bg-blue-50"
                                        >
                                            <Plus className="w-4 h-4 mr-2" />
                                            Increase (+10)
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={handleBulkExport}
                                            className="text-purple-700 border-purple-300 hover:bg-purple-50"
                                        >
                                            <Download className="w-4 h-4 mr-2" />
                                            Export CSV
                                        </Button>
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            setSelectedItems(new Set());
                                            setIsBulkMode(false);
                                        }}
                                    >
                                        Clear Selection
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}

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
                                        <TableHead className="w-12">
                                            <Checkbox
                                                checked={selectedItems.size === filteredInventory.length && filteredInventory.length > 0}
                                                onCheckedChange={(checked) => {
                                                    if (checked) {
                                                        setSelectedItems(new Set(filteredInventory.map(item => item.id)));
                                                        setIsBulkMode(true);
                                                    } else {
                                                        setSelectedItems(new Set());
                                                        setIsBulkMode(false);
                                                    }
                                                }}
                                            />
                                        </TableHead>
                                        <TableHead>Product</TableHead>
                                        <TableHead>SKU</TableHead>
                                        <TableHead>Available</TableHead>
                                        <TableHead>Reserved</TableHead>
                                        <TableHead>Total</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Actions</TableHead>
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
                                                    <Checkbox
                                                        checked={selectedItems.has(item.id)}
                                                        onCheckedChange={(checked) => {
                                                            const newSelected = new Set(selectedItems);
                                                            if (checked) {
                                                                newSelected.add(item.id);
                                                            } else {
                                                                newSelected.delete(item.id);
                                                            }
                                                            setSelectedItems(newSelected);
                                                            setIsBulkMode(newSelected.size > 0);
                                                        }}
                                                    />
                                                </TableCell>
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
                                                            onClick={() => {
                                                                const newThreshold = parseInt(prompt('Enter new low stock threshold:', item.lowStockThreshold.toString()) || '0');
                                                                const newReorderPoint = parseInt(prompt('Enter new reorder point:', item.reorderPoint.toString()) || '0');

                                                                if (newThreshold >= 0 && newReorderPoint >= 0) {
                                                                    handleEditInventoryItem(item.id, {
                                                                        lowStockThreshold: newThreshold,
                                                                        reorderPoint: newReorderPoint
                                                                    });
                                                                }
                                                            }}
                                                        >
                                                            <Edit className="w-4 h-4" />
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handleDeleteInventoryItem(item.id)}
                                                            className="text-red-600 hover:text-red-700"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
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