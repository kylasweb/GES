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
import { Plus, Pencil, Trash2, Clock, TrendingUp } from 'lucide-react';
import { Switch } from '@/components/ui/switch';

interface Product {
    id: string;
    name: string;
    price: number;
    images: string[];
    stock: number;
}

interface Deal {
    id: string;
    productId: string;
    title: string;
    description: string | null;
    discount: number;
    startDate: string;
    endDate: string;
    isActive: boolean;
    product: Product;
}export default function FlashDealsPage() {
    const { toast } = useToast();
    const [deals, setDeals] = useState<Deal[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingDeal, setEditingDeal] = useState<Deal | null>(null);
    const [statusFilter, setStatusFilter] = useState<string>('all');

    const [formData, setFormData] = useState({
        productId: '',
        title: '',
        description: '',
        discount: 10,
        startDate: '',
        endDate: '',
        isActive: true,
    }); useEffect(() => {
        fetchDeals();
        fetchProducts();
    }, [statusFilter]);

    const fetchDeals = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            if (statusFilter !== 'all') {
                params.append('status', statusFilter);
            }

            const response = await fetch(`/api/v1/admin/deals?${params.toString()}`);
            const data = await response.json();
            // Ensure we always set an array
            setDeals(Array.isArray(data.deals) ? data.deals : []);
        } catch (error) {
            console.error('Error fetching deals:', error);
            setDeals([]); // Set empty array on error
            toast({
                title: 'Error',
                description: 'Failed to fetch flash deals',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    const fetchProducts = async () => {
        try {
            const response = await fetch('/api/v1/products?limit=100');
            const data = await response.json();
            setProducts(data.data?.products || data.products || []);
        } catch (error) {
            console.error('Error fetching products:', error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const url = editingDeal
                ? `/api/v1/admin/deals/${editingDeal.id}`
                : '/api/v1/admin/deals';

            const method = editingDeal ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            }); if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to save deal');
            }

            toast({
                title: 'Success',
                description: `Flash deal ${editingDeal ? 'updated' : 'created'} successfully`,
            });

            setDialogOpen(false);
            resetForm();
            fetchDeals();
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.message,
                variant: 'destructive',
            });
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this flash deal?')) return;

        try {
            const response = await fetch(`/api/v1/admin/deals/${id}`, {
                method: 'DELETE',
            });

            if (!response.ok) throw new Error('Failed to delete deal');

            toast({
                title: 'Success',
                description: 'Flash deal deleted successfully',
            });

            fetchDeals();
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to delete flash deal',
                variant: 'destructive',
            });
        }
    };

    const handleEdit = (deal: Deal) => {
        setEditingDeal(deal);
        setFormData({
            productId: deal.productId,
            title: deal.title,
            description: deal.description || '',
            discount: deal.discount,
            startDate: new Date(deal.startDate).toISOString().slice(0, 16),
            endDate: new Date(deal.endDate).toISOString().slice(0, 16),
            isActive: deal.isActive,
        });
        setDialogOpen(true);
    };

    const resetForm = () => {
        setEditingDeal(null);
        setFormData({
            productId: '',
            title: '',
            description: '',
            discount: 10,
            startDate: '',
            endDate: '',
            isActive: true,
        });
    };

    const getDealStatus = (deal: Deal) => {
        const now = new Date();
        const start = new Date(deal.startDate);
        const end = new Date(deal.endDate);

        if (!deal.isActive) return 'inactive';
        if (now < start) return 'upcoming';
        if (now > end) return 'expired';
        return 'active';
    };

    const getStatusBadge = (status: string) => {
        const variants: Record<string, any> = {
            active: 'default',
            upcoming: 'secondary',
            expired: 'outline',
            inactive: 'destructive',
        };

        return (
            <Badge variant={variants[status] || 'default'}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </Badge>
        );
    };

    const calculateDiscountedPrice = (originalPrice: number, discount: number) => {
        return originalPrice - (originalPrice * discount) / 100;
    }; const stats = {
        total: deals.length,
        active: deals.filter((d) => getDealStatus(d) === 'active').length,
        upcoming: deals.filter((d) => getDealStatus(d) === 'upcoming').length,
        expired: deals.filter((d) => getDealStatus(d) === 'expired').length,
    };

    return (
        <div className="flex min-h-screen bg-gray-50">
            <AdminSidebar />
            <div className="flex-1">
                <div className="container mx-auto p-6 space-y-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-bold">Flash Deals</h1>
                            <p className="text-muted-foreground">Manage time-limited discount offers</p>
                        </div>
                        <Button onClick={() => setDialogOpen(true)}>
                            <Plus className="mr-2 h-4 w-4" />
                            Create Flash Deal
                        </Button>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Deals</CardTitle>
                                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats.total}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Active</CardTitle>
                                <Clock className="h-4 w-4 text-green-600" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats.active}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
                                <Clock className="h-4 w-4 text-blue-600" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats.upcoming}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Expired</CardTitle>
                                <Clock className="h-4 w-4 text-gray-600" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats.expired}</div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Filters */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Filters</CardTitle>
                            <CardDescription>Filter flash deals by status</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-[200px]">
                                    <SelectValue placeholder="Filter by status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Deals</SelectItem>
                                    <SelectItem value="active">Active</SelectItem>
                                    <SelectItem value="upcoming">Upcoming</SelectItem>
                                    <SelectItem value="expired">Expired</SelectItem>
                                </SelectContent>
                            </Select>
                        </CardContent>
                    </Card>

                    {/* Deals Table */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Flash Deals</CardTitle>
                            <CardDescription>
                                {deals.length} deal{deals.length !== 1 ? 's' : ''} found
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {loading ? (
                                <div className="text-center py-8">Loading...</div>
                            ) : deals.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    No flash deals found
                                </div>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Product/Deal</TableHead>
                                            <TableHead>Discount</TableHead>
                                            <TableHead>Original Price</TableHead>
                                            <TableHead>Deal Price</TableHead>
                                            <TableHead>Start Date</TableHead>
                                            <TableHead>End Date</TableHead>
                                            <TableHead>Description</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {deals.map((deal) => (
                                            <TableRow key={deal.id}>
                                                <TableCell className="font-medium">
                                                    <div>
                                                        <div>{deal.product.name}</div>
                                                        <div className="text-xs text-muted-foreground">{deal.title}</div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="secondary">{deal.discount}% OFF</Badge>
                                                </TableCell>
                                                <TableCell>₹{deal.product.price.toFixed(2)}</TableCell>
                                                <TableCell className="font-bold text-green-600">
                                                    ₹{calculateDiscountedPrice(deal.product.price, deal.discount).toFixed(2)}
                                                </TableCell>
                                                <TableCell>
                                                    {new Date(deal.startDate).toLocaleString()}
                                                </TableCell>
                                                <TableCell>
                                                    {new Date(deal.endDate).toLocaleString()}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="text-xs text-muted-foreground">
                                                        {deal.description || '-'}
                                                    </div>
                                                </TableCell>
                                                <TableCell>{getStatusBadge(getDealStatus(deal))}</TableCell>
                                                <TableCell className="text-right space-x-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleEdit(deal)}
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleDelete(deal.id)}
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
                        <DialogContent className="max-w-2xl">
                            <DialogHeader>
                                <DialogTitle>
                                    {editingDeal ? 'Edit Flash Deal' : 'Create Flash Deal'}
                                </DialogTitle>
                                <DialogDescription>
                                    {editingDeal
                                        ? 'Update the flash deal details'
                                        : 'Create a new time-limited discount offer'}
                                </DialogDescription>
                            </DialogHeader>

                            <form onSubmit={handleSubmit}>
                                <div className="grid gap-4 py-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="productId">Product *</Label>
                                        <Select
                                            value={formData.productId}
                                            onValueChange={(value) =>
                                                setFormData({ ...formData, productId: value })
                                            }
                                            required
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select a product" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {products.map((product) => (
                                                    <SelectItem key={product.id} value={product.id}>
                                                        {product.name} - ₹{product.price}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="title">Deal Title *</Label>
                                        <Input
                                            id="title"
                                            value={formData.title}
                                            onChange={(e) =>
                                                setFormData({ ...formData, title: e.target.value })
                                            }
                                            placeholder="e.g., Weekend Special"
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
                                            placeholder="Describe the deal"
                                            rows={3}
                                        />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="discount">Discount Percentage (%) *</Label>
                                        <Input
                                            id="discount"
                                            type="number"
                                            min="1"
                                            max="99"
                                            value={formData.discount}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    discount: parseInt(e.target.value) || 0,
                                                })
                                            }
                                            required
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="startDate">Start Date & Time *</Label>
                                            <Input
                                                id="startDate"
                                                type="datetime-local"
                                                value={formData.startDate}
                                                onChange={(e) =>
                                                    setFormData({ ...formData, startDate: e.target.value })
                                                }
                                                required
                                            />
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="endDate">End Date & Time *</Label>
                                            <Input
                                                id="endDate"
                                                type="datetime-local"
                                                value={formData.endDate}
                                                onChange={(e) =>
                                                    setFormData({ ...formData, endDate: e.target.value })
                                                }
                                                required
                                            />
                                        </div>
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
                                        {editingDeal ? 'Update Deal' : 'Create Deal'}
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
