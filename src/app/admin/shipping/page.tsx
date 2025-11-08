'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { AdminSidebar } from '@/components/admin/sidebar';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Plus, Pencil, Trash2, Truck, ArrowUpDown } from 'lucide-react';
import { Switch } from '@/components/ui/switch';

interface ShippingMethod {
    id: string;
    name: string;
    description: string | null;
    type: 'FLAT_RATE' | 'FREE' | 'LOCAL_PICKUP' | 'ZONE_BASED';
    cost: number;
    minOrder: number | null;
    maxOrder: number | null;
    cities: string[] | null;
    isActive: boolean;
    sortOrder: number;
}

const SHIPPING_TYPES = [
    { value: 'FLAT_RATE', label: 'Flat Rate' },
    { value: 'FREE', label: 'Free Shipping' },
    { value: 'LOCAL_PICKUP', label: 'Local Pickup' },
    { value: 'ZONE_BASED', label: 'Zone Based' },
];

export default function ShippingMethodsPage() {
    const { toast } = useToast();
    const [methods, setMethods] = useState<ShippingMethod[]>([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingMethod, setEditingMethod] = useState<ShippingMethod | null>(null);

    const [formData, setFormData] = useState<{
        name: string;
        description: string;
        type: 'FLAT_RATE' | 'FREE' | 'LOCAL_PICKUP' | 'ZONE_BASED';
        cost: string;
        minOrder: string;
        maxOrder: string;
        cities: string;
        isActive: boolean;
        sortOrder: number;
    }>({
        name: '',
        description: '',
        type: 'FLAT_RATE',
        cost: '',
        minOrder: '',
        maxOrder: '',
        cities: '',
        isActive: true,
        sortOrder: 0,
    });

    useEffect(() => {
        fetchMethods();
    }, []);

    const fetchMethods = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/v1/admin/shipping-methods');
            const data = await response.json();
            setMethods(data || []);
        } catch (error) {
            console.error('Error fetching shipping methods:', error);
            toast({
                title: 'Error',
                description: 'Failed to fetch shipping methods',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const url = editingMethod
                ? `/api/v1/admin/shipping-methods/${editingMethod.id}`
                : '/api/v1/admin/shipping-methods';

            const method = editingMethod ? 'PUT' : 'POST';

            const citiesArray = formData.cities
                ? formData.cities.split(',').map((c) => c.trim()).filter((c) => c)
                : null;

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.name,
                    description: formData.description || null,
                    type: formData.type,
                    cost: parseFloat(formData.cost) || 0,
                    minOrder: formData.minOrder ? parseFloat(formData.minOrder) : null,
                    maxOrder: formData.maxOrder ? parseFloat(formData.maxOrder) : null,
                    cities: citiesArray,
                    isActive: formData.isActive,
                    sortOrder: formData.sortOrder,
                }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to save shipping method');
            }

            toast({
                title: 'Success',
                description: `Shipping method ${editingMethod ? 'updated' : 'created'} successfully`,
            });

            setDialogOpen(false);
            resetForm();
            fetchMethods();
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.message,
                variant: 'destructive',
            });
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this shipping method?')) return;

        try {
            const response = await fetch(`/api/v1/admin/shipping-methods/${id}`, {
                method: 'DELETE',
            });

            if (!response.ok) throw new Error('Failed to delete shipping method');

            toast({
                title: 'Success',
                description: 'Shipping method deleted successfully',
            });

            fetchMethods();
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to delete shipping method',
                variant: 'destructive',
            });
        }
    };

    const handleEdit = (method: ShippingMethod) => {
        setEditingMethod(method);
        setFormData({
            name: method.name,
            description: method.description || '',
            type: method.type,
            cost: method.cost.toString(),
            minOrder: method.minOrder?.toString() || '',
            maxOrder: method.maxOrder?.toString() || '',
            cities: Array.isArray(method.cities) ? method.cities.join(', ') : '',
            isActive: method.isActive,
            sortOrder: method.sortOrder,
        });
        setDialogOpen(true);
    };

    const resetForm = () => {
        setEditingMethod(null);
        setFormData({
            name: '',
            description: '',
            type: 'FLAT_RATE',
            cost: '',
            minOrder: '',
            maxOrder: '',
            cities: '',
            isActive: true,
            sortOrder: 0,
        });
    };

    const getTypeBadge = (type: string) => {
        const colors: Record<string, string> = {
            FLAT_RATE: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
            FREE: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
            LOCAL_PICKUP: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
            ZONE_BASED: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
        };

        return (
            <Badge className={colors[type] || 'bg-gray-100 text-gray-800'}>
                {type.replace('_', ' ')}
            </Badge>
        );
    };

    const activeCount = methods.filter((m) => m.isActive).length;

    return (
        <div className="flex min-h-screen bg-gray-50">
            <AdminSidebar />
            <div className="flex-1">
                <div className="container mx-auto p-6 space-y-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-bold">Shipping Methods</h1>
                            <p className="text-muted-foreground">Configure shipping options for your store</p>
                        </div>
                        <Button onClick={() => setDialogOpen(true)}>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Shipping Method
                        </Button>
                    </div>

                    {/* Stats Card */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Methods</CardTitle>
                                <Truck className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{methods.length}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Active</CardTitle>
                                <Truck className="h-4 w-4 text-green-600" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{activeCount}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Inactive</CardTitle>
                                <Truck className="h-4 w-4 text-gray-600" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{methods.length - activeCount}</div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Shipping Methods Table */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Shipping Methods</CardTitle>
                            <CardDescription>
                                {methods.length} shipping method{methods.length !== 1 ? 's' : ''} configured
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {loading ? (
                                <div className="text-center py-8">Loading...</div>
                            ) : methods.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    No shipping methods configured. Add one to get started.
                                </div>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>
                                                <div className="flex items-center gap-2">
                                                    <ArrowUpDown className="h-4 w-4" />
                                                    Order
                                                </div>
                                            </TableHead>
                                            <TableHead>Name</TableHead>
                                            <TableHead>Type</TableHead>
                                            <TableHead>Cost</TableHead>
                                            <TableHead>Min Order</TableHead>
                                            <TableHead>Max Order</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {methods.map((method) => (
                                            <TableRow key={method.id}>
                                                <TableCell className="font-mono text-sm">
                                                    {method.sortOrder}
                                                </TableCell>
                                                <TableCell className="font-medium">
                                                    <div>
                                                        <div>{method.name}</div>
                                                        {method.description && (
                                                            <div className="text-xs text-muted-foreground line-clamp-1">
                                                                {method.description}
                                                            </div>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell>{getTypeBadge(method.type)}</TableCell>
                                                <TableCell className="font-semibold">
                                                    {method.type === 'FREE' ? (
                                                        <span className="text-green-600">Free</span>
                                                    ) : (
                                                        `₹${method.cost.toFixed(2)}`
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    {method.minOrder ? `₹${method.minOrder.toFixed(2)}` : '-'}
                                                </TableCell>
                                                <TableCell>
                                                    {method.maxOrder ? `₹${method.maxOrder.toFixed(2)}` : '-'}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant={method.isActive ? 'default' : 'secondary'}>
                                                        {method.isActive ? 'Active' : 'Inactive'}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right space-x-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleEdit(method)}
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleDelete(method.id)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                    </Card>

                    {/* Create/Edit Dialog */}
                    <Dialog open={dialogOpen} onOpenChange={(open) => {
                        setDialogOpen(open);
                        if (!open) resetForm();
                    }}>
                        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle>
                                    {editingMethod ? 'Edit Shipping Method' : 'Add Shipping Method'}
                                </DialogTitle>
                                <DialogDescription>
                                    {editingMethod
                                        ? 'Update the shipping method details'
                                        : 'Configure a new shipping option for your customers'}
                                </DialogDescription>
                            </DialogHeader>

                            <form onSubmit={handleSubmit}>
                                <div className="grid gap-4 py-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="name">Method Name *</Label>
                                        <Input
                                            id="name"
                                            value={formData.name}
                                            onChange={(e) =>
                                                setFormData({ ...formData, name: e.target.value })
                                            }
                                            placeholder="e.g., Standard Delivery"
                                            required
                                        />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="description">Description</Label>
                                        <Textarea
                                            id="description"
                                            value={formData.description}
                                            onChange={(e) =>
                                                setFormData({ ...formData, description: e.target.value })
                                            }
                                            placeholder="Describe the shipping method"
                                            rows={3}
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="type">Shipping Type *</Label>
                                            <Select
                                                value={formData.type}
                                                onValueChange={(value: any) =>
                                                    setFormData({ ...formData, type: value })
                                                }
                                                required
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {SHIPPING_TYPES.map((type) => (
                                                        <SelectItem key={type.value} value={type.value}>
                                                            {type.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="cost">Shipping Cost (₹) *</Label>
                                            <Input
                                                id="cost"
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                value={formData.cost}
                                                onChange={(e) =>
                                                    setFormData({ ...formData, cost: e.target.value })
                                                }
                                                placeholder="0.00"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="minOrder">Min Order Value (₹)</Label>
                                            <Input
                                                id="minOrder"
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                value={formData.minOrder}
                                                onChange={(e) =>
                                                    setFormData({ ...formData, minOrder: e.target.value })
                                                }
                                                placeholder="Optional"
                                            />
                                            <p className="text-xs text-muted-foreground">
                                                Minimum cart value required
                                            </p>
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="maxOrder">Max Order Value (₹)</Label>
                                            <Input
                                                id="maxOrder"
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                value={formData.maxOrder}
                                                onChange={(e) =>
                                                    setFormData({ ...formData, maxOrder: e.target.value })
                                                }
                                                placeholder="Optional"
                                            />
                                            <p className="text-xs text-muted-foreground">
                                                Maximum cart value allowed
                                            </p>
                                        </div>
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="cities">Cities/Zones (comma-separated)</Label>
                                        <Textarea
                                            id="cities"
                                            value={formData.cities}
                                            onChange={(e) =>
                                                setFormData({ ...formData, cities: e.target.value })
                                            }
                                            placeholder="Mumbai, Delhi, Bangalore"
                                            rows={2}
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            Leave empty for all locations
                                        </p>
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="sortOrder">Sort Order</Label>
                                        <Input
                                            id="sortOrder"
                                            type="number"
                                            min="0"
                                            value={formData.sortOrder}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    sortOrder: parseInt(e.target.value) || 0,
                                                })
                                            }
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            Lower numbers appear first
                                        </p>
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        <Switch
                                            id="isActive"
                                            checked={formData.isActive}
                                            onCheckedChange={(checked) =>
                                                setFormData({ ...formData, isActive: checked })
                                            }
                                        />
                                        <Label htmlFor="isActive">Active</Label>
                                    </div>
                                </div>

                                <DialogFooter>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setDialogOpen(false)}
                                    >
                                        Cancel
                                    </Button>
                                    <Button type="submit">
                                        {editingMethod ? 'Update Method' : 'Create Method'}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>
        </div>
    );
}
