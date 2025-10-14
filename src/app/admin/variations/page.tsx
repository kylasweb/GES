'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
    Plus,
    Edit,
    Trash2,
    Search,
    RefreshCw,
    Eye,
    Box,
    Package,
    DollarSign
} from 'lucide-react';
import { useAuthStore } from '@/lib/store/auth';
import { AdminSidebar } from '@/components/admin/sidebar';
import { toast } from 'sonner';

interface AttributeValue {
    id: string;
    name: string;
    attribute: {
        id: string;
        name: string;
        type: string;
    };
}

interface Product {
    id: string;
    name: string;
    sku: string;
}

interface Variation {
    id: string;
    sku?: string;
    price?: number;
    comparePrice?: number;
    costPrice?: number;
    quantity: number;
    weight?: number;
    dimensions?: {
        length?: number;
        width?: number;
        height?: number;
    };
    image?: string;
    isActive: boolean;
    sortOrder: number;
    product: Product;
    attributeValues: AttributeValue[];
    createdAt: string;
    updatedAt: string;
}

interface ProductOption {
    id: string;
    name: string;
    sku: string;
}

interface AttributeOption {
    id: string;
    name: string;
    type: string;
    values: Array<{
        id: string;
        name: string;
    }>;
}

export default function AdminVariationsPage() {
    const { user, token } = useAuthStore();
    const [variations, setVariations] = useState<Variation[]>([]);
    const [products, setProducts] = useState<ProductOption[]>([]);
    const [attributes, setAttributes] = useState<AttributeOption[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedProduct, setSelectedProduct] = useState<string>('');
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [selectedVariation, setSelectedVariation] = useState<Variation | null>(null);
    const [formData, setFormData] = useState({
        productId: '',
        sku: '',
        price: '',
        comparePrice: '',
        costPrice: '',
        quantity: 0,
        weight: '',
        length: '',
        width: '',
        height: '',
        image: '',
        isActive: true,
        sortOrder: 0,
        attributeValues: [] as string[],
    });

    const fetchVariations = async () => {
        try {
            setIsLoading(true);
            const url = selectedProduct
                ? `/api/v1/admin/variations?productId=${selectedProduct}`
                : '/api/v1/admin/variations';

            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error('Failed to fetch variations');
            }

            const data = await response.json();
            setVariations(data.variations);
        } catch (error) {
            console.error('Error fetching variations:', error);
            toast.error('Failed to load variations');
        } finally {
            setIsLoading(false);
        }
    };

    const fetchProducts = async () => {
        try {
            const response = await fetch('/api/v1/products', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error('Failed to fetch products');
            }

            const data = await response.json();
            setProducts(data.products || []);
        } catch (error) {
            console.error('Error fetching products:', error);
        }
    };

    const fetchAttributes = async () => {
        try {
            const response = await fetch('/api/v1/admin/attributes', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error('Failed to fetch attributes');
            }

            const data = await response.json();
            setAttributes(data.attributes || []);
        } catch (error) {
            console.error('Error fetching attributes:', error);
        }
    };

    useEffect(() => {
        fetchProducts();
        fetchAttributes();
    }, [token]);

    useEffect(() => {
        fetchVariations();
    }, [token, selectedProduct]);

    const handleCreate = async () => {
        try {
            const variationData = {
                productId: formData.productId,
                sku: formData.sku || undefined,
                price: formData.price ? parseFloat(formData.price) : undefined,
                comparePrice: formData.comparePrice ? parseFloat(formData.comparePrice) : undefined,
                costPrice: formData.costPrice ? parseFloat(formData.costPrice) : undefined,
                quantity: formData.quantity,
                weight: formData.weight ? parseFloat(formData.weight) : undefined,
                dimensions: {
                    length: formData.length ? parseFloat(formData.length) : undefined,
                    width: formData.width ? parseFloat(formData.width) : undefined,
                    height: formData.height ? parseFloat(formData.height) : undefined,
                },
                image: formData.image || undefined,
                isActive: formData.isActive,
                sortOrder: formData.sortOrder,
                attributeValues: formData.attributeValues,
            };

            const response = await fetch('/api/v1/admin/variations', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(variationData),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to create variation');
            }

            toast.success('Variation created successfully');
            setIsCreateDialogOpen(false);
            resetForm();
            fetchVariations();
        } catch (error) {
            console.error('Error creating variation:', error);
            toast.error(error instanceof Error ? error.message : 'Failed to create variation');
        }
    };

    const handleUpdate = async () => {
        if (!selectedVariation) return;

        try {
            const variationData = {
                sku: formData.sku || undefined,
                price: formData.price ? parseFloat(formData.price) : undefined,
                comparePrice: formData.comparePrice ? parseFloat(formData.comparePrice) : undefined,
                costPrice: formData.costPrice ? parseFloat(formData.costPrice) : undefined,
                quantity: formData.quantity,
                weight: formData.weight ? parseFloat(formData.weight) : undefined,
                dimensions: {
                    length: formData.length ? parseFloat(formData.length) : undefined,
                    width: formData.width ? parseFloat(formData.width) : undefined,
                    height: formData.height ? parseFloat(formData.height) : undefined,
                },
                image: formData.image || undefined,
                isActive: formData.isActive,
                sortOrder: formData.sortOrder,
                attributeValues: formData.attributeValues,
            };

            const response = await fetch(`/api/v1/admin/variations/${selectedVariation.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(variationData),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to update variation');
            }

            toast.success('Variation updated successfully');
            setIsEditDialogOpen(false);
            setSelectedVariation(null);
            resetForm();
            fetchVariations();
        } catch (error) {
            console.error('Error updating variation:', error);
            toast.error(error instanceof Error ? error.message : 'Failed to update variation');
        }
    };

    const handleDelete = async (variationId: string) => {
        try {
            const response = await fetch(`/api/v1/admin/variations/${variationId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to delete variation');
            }

            toast.success('Variation deleted successfully');
            fetchVariations();
        } catch (error) {
            console.error('Error deleting variation:', error);
            toast.error(error instanceof Error ? error.message : 'Failed to delete variation');
        }
    };

    const openEditDialog = (variation: Variation) => {
        setSelectedVariation(variation);
        setFormData({
            productId: variation.product.id,
            sku: variation.sku || '',
            price: variation.price?.toString() || '',
            comparePrice: variation.comparePrice?.toString() || '',
            costPrice: variation.costPrice?.toString() || '',
            quantity: variation.quantity,
            weight: variation.weight?.toString() || '',
            length: variation.dimensions?.length?.toString() || '',
            width: variation.dimensions?.width?.toString() || '',
            height: variation.dimensions?.height?.toString() || '',
            image: variation.image || '',
            isActive: variation.isActive,
            sortOrder: variation.sortOrder,
            attributeValues: variation.attributeValues.map(av => av.id),
        });
        setIsEditDialogOpen(true);
    };

    const resetForm = () => {
        setFormData({
            productId: '',
            sku: '',
            price: '',
            comparePrice: '',
            costPrice: '',
            quantity: 0,
            weight: '',
            length: '',
            width: '',
            height: '',
            image: '',
            isActive: true,
            sortOrder: 0,
            attributeValues: [],
        });
    };

    const filteredVariations = variations.filter(variation =>
        variation.product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        variation.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        variation.attributeValues.some(av => av.name.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const selectedProductAttributes = attributes.filter(attr =>
        products.find(p => p.id === formData.productId)?.id === formData.productId
    );

    return (
        <div className="flex h-screen bg-gray-50">
            <AdminSidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="bg-white shadow-sm border-b border-gray-200">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between items-center py-6">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">Variations</h1>
                                <p className="mt-1 text-sm text-gray-500">
                                    Manage product variations and their attributes
                                </p>
                            </div>
                            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button>
                                        <Plus className="w-4 h-4 mr-2" />
                                        Add Variation
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
                                    <DialogHeader>
                                        <DialogTitle>Create New Variation</DialogTitle>
                                        <DialogDescription>
                                            Add a new product variation with specific attributes.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="grid gap-4 py-4">
                                        <div className="grid grid-cols-4 items-center gap-4">
                                            <Label htmlFor="product" className="text-right">
                                                Product
                                            </Label>
                                            <Select
                                                value={formData.productId}
                                                onValueChange={(value) => setFormData({ ...formData, productId: value })}
                                            >
                                                <SelectTrigger className="col-span-3">
                                                    <SelectValue placeholder="Select a product" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {products.map((product) => (
                                                        <SelectItem key={product.id} value={product.id}>
                                                            {product.name} ({product.sku})
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        {formData.productId && (
                                            <>
                                                <div className="grid grid-cols-4 items-center gap-4">
                                                    <Label htmlFor="attributes" className="text-right">
                                                        Attributes
                                                    </Label>
                                                    <div className="col-span-3 space-y-2">
                                                        {attributes.map((attr) => (
                                                            <div key={attr.id} className="flex items-center space-x-2">
                                                                <Label className="text-sm font-medium w-20">{attr.name}:</Label>
                                                                <Select
                                                                    value={formData.attributeValues.find(id =>
                                                                        attr.values.some(v => v.id === id)
                                                                    ) || ''}
                                                                    onValueChange={(value) => {
                                                                        const newValues = formData.attributeValues.filter(id =>
                                                                            !attr.values.some(v => v.id === id)
                                                                        );
                                                                        if (value) newValues.push(value);
                                                                        setFormData({ ...formData, attributeValues: newValues });
                                                                    }}
                                                                >
                                                                    <SelectTrigger className="flex-1">
                                                                        <SelectValue placeholder={`Select ${attr.name}`} />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        {attr.values.map((value) => (
                                                                            <SelectItem key={value.id} value={value.id}>
                                                                                {value.name}
                                                                            </SelectItem>
                                                                        ))}
                                                                    </SelectContent>
                                                                </Select>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-4 items-center gap-4">
                                                    <Label htmlFor="sku" className="text-right">
                                                        SKU
                                                    </Label>
                                                    <Input
                                                        id="sku"
                                                        value={formData.sku}
                                                        onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                                                        className="col-span-3"
                                                        placeholder="Variation SKU"
                                                    />
                                                </div>

                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="grid grid-cols-2 items-center gap-2">
                                                        <Label htmlFor="price" className="text-right">
                                                            Price
                                                        </Label>
                                                        <Input
                                                            id="price"
                                                            type="number"
                                                            step="0.01"
                                                            value={formData.price}
                                                            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                                            placeholder="0.00"
                                                        />
                                                    </div>
                                                    <div className="grid grid-cols-2 items-center gap-2">
                                                        <Label htmlFor="comparePrice" className="text-right">
                                                            Compare Price
                                                        </Label>
                                                        <Input
                                                            id="comparePrice"
                                                            type="number"
                                                            step="0.01"
                                                            value={formData.comparePrice}
                                                            onChange={(e) => setFormData({ ...formData, comparePrice: e.target.value })}
                                                            placeholder="0.00"
                                                        />
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="grid grid-cols-2 items-center gap-2">
                                                        <Label htmlFor="quantity" className="text-right">
                                                            Quantity
                                                        </Label>
                                                        <Input
                                                            id="quantity"
                                                            type="number"
                                                            value={formData.quantity}
                                                            onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
                                                            placeholder="0"
                                                        />
                                                    </div>
                                                    <div className="grid grid-cols-2 items-center gap-2">
                                                        <Label htmlFor="weight" className="text-right">
                                                            Weight
                                                        </Label>
                                                        <Input
                                                            id="weight"
                                                            type="number"
                                                            step="0.01"
                                                            value={formData.weight}
                                                            onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                                                            placeholder="0.00"
                                                        />
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-3 gap-4">
                                                    <div className="grid grid-cols-2 items-center gap-2">
                                                        <Label htmlFor="length" className="text-right text-xs">
                                                            Length
                                                        </Label>
                                                        <Input
                                                            id="length"
                                                            type="number"
                                                            step="0.01"
                                                            value={formData.length}
                                                            onChange={(e) => setFormData({ ...formData, length: e.target.value })}
                                                            placeholder="0.00"
                                                        />
                                                    </div>
                                                    <div className="grid grid-cols-2 items-center gap-2">
                                                        <Label htmlFor="width" className="text-right text-xs">
                                                            Width
                                                        </Label>
                                                        <Input
                                                            id="width"
                                                            type="number"
                                                            step="0.01"
                                                            value={formData.width}
                                                            onChange={(e) => setFormData({ ...formData, width: e.target.value })}
                                                            placeholder="0.00"
                                                        />
                                                    </div>
                                                    <div className="grid grid-cols-2 items-center gap-2">
                                                        <Label htmlFor="height" className="text-right text-xs">
                                                            Height
                                                        </Label>
                                                        <Input
                                                            id="height"
                                                            type="number"
                                                            step="0.01"
                                                            value={formData.height}
                                                            onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                                                            placeholder="0.00"
                                                        />
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-4 items-center gap-4">
                                                    <Label htmlFor="image" className="text-right">
                                                        Image URL
                                                    </Label>
                                                    <Input
                                                        id="image"
                                                        value={formData.image}
                                                        onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                                                        className="col-span-3"
                                                        placeholder="https://example.com/image.jpg"
                                                    />
                                                </div>
                                            </>
                                        )}
                                    </div>
                                    <DialogFooter>
                                        <Button type="submit" onClick={handleCreate} disabled={!formData.productId}>
                                            Create Variation
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                        <Card>
                            <CardHeader>
                                <div className="flex justify-between items-center">
                                    <CardTitle>All Variations ({variations.length})</CardTitle>
                                    <div className="flex items-center space-x-4">
                                        <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                                            <SelectTrigger className="w-64">
                                                <SelectValue placeholder="Filter by product" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="">All Products</SelectItem>
                                                {products.map((product) => (
                                                    <SelectItem key={product.id} value={product.id}>
                                                        {product.name} ({product.sku})
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <div className="relative">
                                            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                            <Input
                                                placeholder="Search variations..."
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                className="pl-10 w-64"
                                            />
                                        </div>
                                        <Button variant="outline" size="sm" onClick={fetchVariations}>
                                            <RefreshCw className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {isLoading ? (
                                    <div className="flex justify-center items-center py-8">
                                        <RefreshCw className="w-6 h-6 animate-spin" />
                                        <span className="ml-2">Loading variations...</span>
                                    </div>
                                ) : (
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Product</TableHead>
                                                <TableHead>Attributes</TableHead>
                                                <TableHead>SKU</TableHead>
                                                <TableHead>Price</TableHead>
                                                <TableHead>Stock</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead className="text-right">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {filteredVariations.map((variation) => (
                                                <TableRow key={variation.id}>
                                                    <TableCell className="font-medium">
                                                        <div className="flex items-center">
                                                            <Package className="w-4 h-4 mr-2 text-gray-400" />
                                                            {variation.product.name}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex flex-wrap gap-1">
                                                            {variation.attributeValues.map((av) => (
                                                                <Badge key={av.id} variant="outline" className="text-xs">
                                                                    {av.attribute.name}: {av.name}
                                                                </Badge>
                                                            ))}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-gray-500">
                                                        {variation.sku || 'No SKU'}
                                                    </TableCell>
                                                    <TableCell>
                                                        {variation.price ? (
                                                            <div className="flex items-center">
                                                                <DollarSign className="w-3 h-3 mr-1" />
                                                                {variation.price.toFixed(2)}
                                                            </div>
                                                        ) : (
                                                            <span className="text-gray-400">Not set</span>
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant={variation.quantity > 0 ? 'default' : 'destructive'}>
                                                            {variation.quantity}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant={variation.isActive ? 'default' : 'secondary'}>
                                                            {variation.isActive ? 'Active' : 'Inactive'}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="flex justify-end space-x-2">
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => openEditDialog(variation)}
                                                            >
                                                                <Edit className="w-4 h-4" />
                                                            </Button>
                                                            <AlertDialog>
                                                                <AlertDialogTrigger asChild>
                                                                    <Button variant="outline" size="sm">
                                                                        <Trash2 className="w-4 h-4" />
                                                                    </Button>
                                                                </AlertDialogTrigger>
                                                                <AlertDialogContent>
                                                                    <AlertDialogHeader>
                                                                        <AlertDialogTitle>Delete Variation</AlertDialogTitle>
                                                                        <AlertDialogDescription>
                                                                            Are you sure you want to delete this variation? This action cannot be undone.
                                                                        </AlertDialogDescription>
                                                                    </AlertDialogHeader>
                                                                    <AlertDialogFooter>
                                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                        <AlertDialogAction
                                                                            onClick={() => handleDelete(variation.id)}
                                                                            className="bg-red-600 hover:bg-red-700"
                                                                        >
                                                                            Delete
                                                                        </AlertDialogAction>
                                                                    </AlertDialogFooter>
                                                                </AlertDialogContent>
                                                            </AlertDialog>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </main>
            </div>

            {/* Edit Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Edit Variation</DialogTitle>
                        <DialogDescription>
                            Update variation details and attributes.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right font-medium">
                                Product
                            </Label>
                            <div className="col-span-3 p-2 bg-gray-50 rounded text-sm">
                                {selectedVariation?.product.name} ({selectedVariation?.product.sku})
                            </div>
                        </div>

                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="edit-attributes" className="text-right">
                                Attributes
                            </Label>
                            <div className="col-span-3 space-y-2">
                                {attributes.map((attr) => (
                                    <div key={attr.id} className="flex items-center space-x-2">
                                        <Label className="text-sm font-medium w-20">{attr.name}:</Label>
                                        <Select
                                            value={formData.attributeValues.find(id =>
                                                attr.values.some(v => v.id === id)
                                            ) || ''}
                                            onValueChange={(value) => {
                                                const newValues = formData.attributeValues.filter(id =>
                                                    !attr.values.some(v => v.id === id)
                                                );
                                                if (value) newValues.push(value);
                                                setFormData({ ...formData, attributeValues: newValues });
                                            }}
                                        >
                                            <SelectTrigger className="flex-1">
                                                <SelectValue placeholder={`Select ${attr.name}`} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {attr.values.map((value) => (
                                                    <SelectItem key={value.id} value={value.id}>
                                                        {value.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="edit-sku" className="text-right">
                                SKU
                            </Label>
                            <Input
                                id="edit-sku"
                                value={formData.sku}
                                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                                className="col-span-3"
                                placeholder="Variation SKU"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid grid-cols-2 items-center gap-2">
                                <Label htmlFor="edit-price" className="text-right">
                                    Price
                                </Label>
                                <Input
                                    id="edit-price"
                                    type="number"
                                    step="0.01"
                                    value={formData.price}
                                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                    placeholder="0.00"
                                />
                            </div>
                            <div className="grid grid-cols-2 items-center gap-2">
                                <Label htmlFor="edit-comparePrice" className="text-right">
                                    Compare Price
                                </Label>
                                <Input
                                    id="edit-comparePrice"
                                    type="number"
                                    step="0.01"
                                    value={formData.comparePrice}
                                    onChange={(e) => setFormData({ ...formData, comparePrice: e.target.value })}
                                    placeholder="0.00"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid grid-cols-2 items-center gap-2">
                                <Label htmlFor="edit-quantity" className="text-right">
                                    Quantity
                                </Label>
                                <Input
                                    id="edit-quantity"
                                    type="number"
                                    value={formData.quantity}
                                    onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
                                    placeholder="0"
                                />
                            </div>
                            <div className="grid grid-cols-2 items-center gap-2">
                                <Label htmlFor="edit-weight" className="text-right">
                                    Weight
                                </Label>
                                <Input
                                    id="edit-weight"
                                    type="number"
                                    step="0.01"
                                    value={formData.weight}
                                    onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                                    placeholder="0.00"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <div className="grid grid-cols-2 items-center gap-2">
                                <Label htmlFor="edit-length" className="text-right text-xs">
                                    Length
                                </Label>
                                <Input
                                    id="edit-length"
                                    type="number"
                                    step="0.01"
                                    value={formData.length}
                                    onChange={(e) => setFormData({ ...formData, length: e.target.value })}
                                    placeholder="0.00"
                                />
                            </div>
                            <div className="grid grid-cols-2 items-center gap-2">
                                <Label htmlFor="edit-width" className="text-right text-xs">
                                    Width
                                </Label>
                                <Input
                                    id="edit-width"
                                    type="number"
                                    step="0.01"
                                    value={formData.width}
                                    onChange={(e) => setFormData({ ...formData, width: e.target.value })}
                                    placeholder="0.00"
                                />
                            </div>
                            <div className="grid grid-cols-2 items-center gap-2">
                                <Label htmlFor="edit-height" className="text-right text-xs">
                                    Height
                                </Label>
                                <Input
                                    id="edit-height"
                                    type="number"
                                    step="0.01"
                                    value={formData.height}
                                    onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                                    placeholder="0.00"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="edit-image" className="text-right">
                                Image URL
                            </Label>
                            <Input
                                id="edit-image"
                                value={formData.image}
                                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                                className="col-span-3"
                                placeholder="https://example.com/image.jpg"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit" onClick={handleUpdate}>
                            Update Variation
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}