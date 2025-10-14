'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Save, Package, Upload } from 'lucide-react';
import { useAuthStore } from '@/lib/store/auth';
import { AdminSidebar } from '@/components/admin/sidebar';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface ProductFormData {
    name: string;
    description: string;
    price: number;
    sku: string;
    category: string;
    brand: string;
    stock: number;
    minStock: number;
    maxStock: number;
    isActive: boolean;
    isFeatured: boolean;
    images: string[];
    specifications: Record<string, string>;
}

const categories = [
    'Solar Panels',
    'Batteries',
    'Inverters',
    'Accessories',
    'Installation Kits'
];

const brands = [
    'GreenEnergy',
    'SolarTech',
    'PowerMax',
    'EcoPower',
    'SunLight'
];

export default function NewProductPage() {
    const { token } = useAuthStore();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const [formData, setFormData] = useState<ProductFormData>({
        name: '',
        description: '',
        price: 0,
        sku: '',
        category: '',
        brand: '',
        stock: 0,
        minStock: 5,
        maxStock: 100,
        isActive: true,
        isFeatured: false,
        images: [],
        specifications: {}
    });

    const [newSpecKey, setNewSpecKey] = useState('');
    const [newSpecValue, setNewSpecValue] = useState('');

    const handleInputChange = (field: keyof ProductFormData, value: any) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const addSpecification = () => {
        if (newSpecKey && newSpecValue) {
            setFormData(prev => ({
                ...prev,
                specifications: {
                    ...prev.specifications,
                    [newSpecKey]: newSpecValue
                }
            }));
            setNewSpecKey('');
            setNewSpecValue('');
        }
    };

    const removeSpecification = (key: string) => {
        setFormData(prev => {
            const newSpecs = { ...prev.specifications };
            delete newSpecs[key];
            return {
                ...prev,
                specifications: newSpecs
            };
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        setSuccess(null);

        try {
            const response = await fetch('/api/v1/products', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (data.success) {
                setSuccess('Product created successfully!');
                setTimeout(() => {
                    router.push('/admin/products');
                }, 2000);
            } else {
                setError(data.error || 'Failed to create product');
            }
        } catch (err) {
            setError('Failed to create product');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen bg-gray-50">
            <AdminSidebar />
            <div className="flex-1">
                <div className="p-8">
                    {/* Header */}
                    <div className="mb-8">
                        <Link href="/admin/products">
                            <Button variant="outline" className="mb-4">
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Back to Products
                            </Button>
                        </Link>
                        <h1 className="text-3xl font-bold text-gray-900">Add New Product</h1>
                        <p className="text-gray-600 mt-2">
                            Create a new product in your inventory.
                        </p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-red-800">{error}</p>
                        </div>
                    )}

                    {success && (
                        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                            <p className="text-green-800">{success}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Main Form */}
                            <div className="lg:col-span-2 space-y-6">
                                {/* Basic Information */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center">
                                            <Package className="w-5 h-5 mr-2" />
                                            Basic Information
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <Label htmlFor="name">Product Name *</Label>
                                                <Input
                                                    id="name"
                                                    value={formData.name}
                                                    onChange={(e) => handleInputChange('name', e.target.value)}
                                                    placeholder="Enter product name"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="sku">SKU *</Label>
                                                <Input
                                                    id="sku"
                                                    value={formData.sku}
                                                    onChange={(e) => handleInputChange('sku', e.target.value)}
                                                    placeholder="Enter SKU"
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <Label htmlFor="description">Description</Label>
                                            <Textarea
                                                id="description"
                                                value={formData.description}
                                                onChange={(e) => handleInputChange('description', e.target.value)}
                                                placeholder="Enter product description"
                                                rows={4}
                                            />
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div>
                                                <Label htmlFor="category">Category *</Label>
                                                <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select category" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {categories.map((category) => (
                                                            <SelectItem key={category} value={category}>
                                                                {category}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div>
                                                <Label htmlFor="brand">Brand</Label>
                                                <Select value={formData.brand} onValueChange={(value) => handleInputChange('brand', value)}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select brand" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {brands.map((brand) => (
                                                            <SelectItem key={brand} value={brand}>
                                                                {brand}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div>
                                                <Label htmlFor="price">Price (₹) *</Label>
                                                <Input
                                                    id="price"
                                                    type="number"
                                                    value={formData.price}
                                                    onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                                                    placeholder="0.00"
                                                    min="0"
                                                    step="0.01"
                                                    required
                                                />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Inventory */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Inventory</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div>
                                                <Label htmlFor="stock">Current Stock</Label>
                                                <Input
                                                    id="stock"
                                                    type="number"
                                                    value={formData.stock}
                                                    onChange={(e) => handleInputChange('stock', parseInt(e.target.value) || 0)}
                                                    placeholder="0"
                                                    min="0"
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="minStock">Minimum Stock</Label>
                                                <Input
                                                    id="minStock"
                                                    type="number"
                                                    value={formData.minStock}
                                                    onChange={(e) => handleInputChange('minStock', parseInt(e.target.value) || 0)}
                                                    placeholder="5"
                                                    min="0"
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="maxStock">Maximum Stock</Label>
                                                <Input
                                                    id="maxStock"
                                                    type="number"
                                                    value={formData.maxStock}
                                                    onChange={(e) => handleInputChange('maxStock', parseInt(e.target.value) || 0)}
                                                    placeholder="100"
                                                    min="0"
                                                />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Specifications */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Specifications</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <Input
                                                placeholder="Specification name (e.g., Power Output)"
                                                value={newSpecKey}
                                                onChange={(e) => setNewSpecKey(e.target.value)}
                                            />
                                            <div className="flex space-x-2">
                                                <Input
                                                    placeholder="Value (e.g., 500W)"
                                                    value={newSpecValue}
                                                    onChange={(e) => setNewSpecValue(e.target.value)}
                                                />
                                                <Button type="button" onClick={addSpecification} variant="outline">
                                                    Add
                                                </Button>
                                            </div>
                                        </div>

                                        {Object.entries(formData.specifications).length > 0 && (
                                            <div className="space-y-2">
                                                {Object.entries(formData.specifications).map(([key, value]) => (
                                                    <div key={key} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                                        <span className="font-medium">{key}:</span>
                                                        <span>{value}</span>
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => removeSpecification(key)}
                                                        >
                                                            Remove
                                                        </Button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Sidebar */}
                            <div className="space-y-6">
                                {/* Status */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Status</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <Label htmlFor="isActive">Active</Label>
                                            <Switch
                                                id="isActive"
                                                checked={formData.isActive}
                                                onCheckedChange={(checked) => handleInputChange('isActive', checked)}
                                            />
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <Label htmlFor="isFeatured">Featured Product</Label>
                                            <Switch
                                                id="isFeatured"
                                                checked={formData.isFeatured}
                                                onCheckedChange={(checked) => handleInputChange('isFeatured', checked)}
                                            />
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Images */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center">
                                            <Upload className="w-5 h-5 mr-2" />
                                            Images
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                                            <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                                            <p className="text-sm text-gray-600">
                                                Drag and drop images here, or click to browse
                                            </p>
                                            <Button type="button" variant="outline" className="mt-2">
                                                Browse Files
                                            </Button>
                                        </div>
                                        {formData.images.length > 0 && (
                                            <div className="mt-4 space-y-2">
                                                {formData.images.map((image, index) => (
                                                    <Badge key={index} variant="secondary">
                                                        Image {index + 1}
                                                    </Badge>
                                                ))}
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>

                                {/* Actions */}
                                <Card>
                                    <CardContent className="pt-6">
                                        <Button
                                            type="submit"
                                            className="w-full"
                                            disabled={isLoading}
                                        >
                                            <Save className="w-4 h-4 mr-2" />
                                            {isLoading ? 'Creating...' : 'Create Product'}
                                        </Button>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}