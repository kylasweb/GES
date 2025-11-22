'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Save, Package, Upload, X, Plus, ImageIcon, RefreshCw } from 'lucide-react';
import { useAuthStore } from '@/lib/store/auth';
import { AdminSidebar } from '@/components/admin/sidebar';
import { MediaPicker } from '@/components/media-picker';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

interface ProductFormData {
    name: string;
    description: string;
    shortDesc: string;
    price: number;
    comparePrice?: number;
    sku: string;
    categoryId: string;
    brandId: string;
    quantity: number;
    trackQuantity: boolean;
    isActive: boolean;
    featured: boolean;
    images: string[];
    specifications: Record<string, string>;
    customFields: Record<string, string>;
    tags?: string[];
    seoTitle?: string;
    seoDesc?: string;
    features?: string[];
}

interface Category {
    id: string;
    name: string;
    slug: string;
}

interface Brand {
    id: string;
    name: string;
    slug: string;
}

export default function EditProductPage() {
    const { token } = useAuthStore();
    const router = useRouter();
    const params = useParams();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [categories, setCategories] = useState<Category[]>([]);
    const [brands, setBrands] = useState<Brand[]>([]);
    const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);

    const [formData, setFormData] = useState<ProductFormData>({
        name: '',
        description: '',
        shortDesc: '',
        price: 0,
        comparePrice: undefined,
        sku: '',
        categoryId: '',
        brandId: '',
        quantity: 0,
        trackQuantity: true,
        isActive: true,
        featured: false,
        images: [],
        specifications: {},
        customFields: {},
        tags: [],
        seoTitle: '',
        seoDesc: '',
        features: []
    });

    const [newSpecKey, setNewSpecKey] = useState('');
    const [newSpecValue, setNewSpecValue] = useState('');
    const [newCustomKey, setNewCustomKey] = useState('');
    const [newCustomValue, setNewCustomValue] = useState('');
    const [newTag, setNewTag] = useState('');
    const [newFeature, setNewFeature] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [productRes, categoriesRes, brandsRes] = await Promise.all([
                    fetch(`/api/v1/admin/products/${params.id}`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    }),
                    fetch('/api/v1/admin/categories', {
                        headers: { 'Authorization': `Bearer ${token}` }
                    }),
                    fetch('/api/v1/admin/brands', {
                        headers: { 'Authorization': `Bearer ${token}` }
                    })
                ]);

                const productData = await productRes.json();
                const categoriesData = await categoriesRes.json();
                const brandsData = await brandsRes.json();

                if (categoriesData.success) {
                    setCategories(categoriesData.data);
                }
                if (brandsData.success) {
                    setBrands(brandsData.data);
                }

                if (productData.success) {
                    const p = productData.data;
                    setFormData({
                        name: p.name,
                        description: p.description || '',
                        shortDesc: p.shortDesc || '',
                        price: p.price,
                        comparePrice: p.compareAtPrice,
                        sku: p.sku,
                        categoryId: p.category.id,
                        brandId: p.brand?.id || '',
                        quantity: p.inventory.quantity,
                        trackQuantity: p.inventory.trackQuantity,
                        isActive: p.isActive,
                        featured: p.featured,
                        images: p.images || [],
                        specifications: p.specifications || {},
                        customFields: p.customFields || {},
                        tags: p.tags || [],
                        seoTitle: p.seoTitle || '',
                        seoDesc: p.seoDescription || '',
                        features: p.features || []
                    });
                } else {
                    setError(productData.error || 'Failed to load product');
                    toast({
                        title: 'Error',
                        description: productData.error || 'Failed to load product',
                        variant: 'destructive',
                    });
                }
            } catch (err) {
                console.error('Failed to fetch data:', err);
                setError('Failed to load product data');
            } finally {
                setIsLoading(false);
            }
        };

        if (token && params.id) {
            fetchData();
        }
    }, [token, params.id, toast]);

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

    const addCustomField = () => {
        if (newCustomKey && newCustomValue) {
            setFormData(prev => ({
                ...prev,
                customFields: {
                    ...prev.customFields,
                    [newCustomKey]: newCustomValue
                }
            }));
            setNewCustomKey('');
            setNewCustomValue('');
        }
    };

    const removeCustomField = (key: string) => {
        setFormData(prev => {
            const newFields = { ...prev.customFields };
            delete newFields[key];
            return {
                ...prev,
                customFields: newFields
            };
        });
    };

    const addTag = () => {
        if (newTag && !formData.tags?.includes(newTag)) {
            setFormData(prev => ({
                ...prev,
                tags: [...(prev.tags || []), newTag]
            }));
            setNewTag('');
        }
    };

    const removeTag = (tag: string) => {
        setFormData(prev => ({
            ...prev,
            tags: prev.tags?.filter(t => t !== tag) || []
        }));
    };

    const addFeature = () => {
        if (newFeature && !formData.features?.includes(newFeature)) {
            setFormData(prev => ({
                ...prev,
                features: [...(prev.features || []), newFeature]
            }));
            setNewFeature('');
        }
    };

    const removeFeature = (feature: string) => {
        setFormData(prev => ({
            ...prev,
            features: prev.features?.filter(f => f !== feature) || []
        }));
    };

    const handleMediaSelected = (urls: string[]) => {
        setFormData(prev => ({
            ...prev,
            images: [...prev.images, ...urls]
        }));
        setIsMediaPickerOpen(false);
    };

    const removeImage = (index: number) => {
        setFormData(prev => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        try {
            const productData = {
                name: formData.name,
                description: formData.description,
                shortDesc: formData.shortDesc,
                price: formData.price,
                comparePrice: formData.comparePrice,
                sku: formData.sku,
                categoryId: formData.categoryId,
                brandId: formData.brandId || undefined,
                isActive: formData.isActive,
                featured: formData.featured,
                images: formData.images,
                specifications: Object.keys(formData.specifications).length > 0 ? formData.specifications : undefined,
                customFields: Object.keys(formData.customFields).length > 0 ? formData.customFields : undefined,
                tags: formData.tags && formData.tags.length > 0 ? formData.tags.join(',') : undefined,
                seoTitle: formData.seoTitle || undefined,
                seoDesc: formData.seoDesc || undefined,
                inventory: {
                    quantity: formData.quantity,
                    trackQuantity: formData.trackQuantity
                },
                features: formData.features
            };

            const response = await fetch(`/api/v1/products/${params.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(productData)
            });

            const data = await response.json();

            if (data.success || response.ok) {
                toast({
                    title: 'Success',
                    description: 'Product updated successfully',
                });
                router.push('/admin/products');
            } else {
                let errorMessage = data.error || 'Failed to update product';
                if (data.details && Array.isArray(data.details)) {
                    errorMessage = 'Validation errors:\n' + data.details.map((d: any) =>
                        `• ${d.path?.join('.') || 'Field'}: ${d.message}`
                    ).join('\n');
                }
                setError(errorMessage);
                toast({
                    title: 'Validation Failed',
                    description: errorMessage,
                    variant: 'destructive',
                });
            }
        } catch (err) {
            setError('Failed to update product');
            toast({
                title: 'Error',
                description: 'Failed to update product',
                variant: 'destructive',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex min-h-screen bg-gray-50">
                <AdminSidebar />
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">Loading product data...</p>
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
                        <Link href="/admin/products">
                            <Button variant="outline" className="mb-4">
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Back to Products
                            </Button>
                        </Link>
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">Edit Product</h1>
                                <p className="text-gray-600 mt-2">
                                    Update product details and inventory.
                                </p>
                            </div>
                            <div className="flex space-x-3">
                                <Button
                                    variant="outline"
                                    onClick={() => router.push(`/admin/products/${params.id}`)}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleSubmit}
                                    disabled={isSubmitting}
                                    className="bg-green-600 hover:bg-green-700"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                                            Updating...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="w-4 h-4 mr-2" />
                                            Update Product
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-red-800 whitespace-pre-line">{error}</p>
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
                                                <Label htmlFor="name" className="text-sm font-medium">
                                                    Product Name <span className="text-red-500">*</span>
                                                </Label>
                                                <Input
                                                    id="name"
                                                    value={formData.name}
                                                    onChange={(e) => handleInputChange('name', e.target.value)}
                                                    placeholder="Enter product name"
                                                    required
                                                    className="border-gray-300 focus:border-blue-500"
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="sku" className="text-sm font-medium">
                                                    SKU <span className="text-red-500">*</span>
                                                </Label>
                                                <Input
                                                    id="sku"
                                                    value={formData.sku}
                                                    onChange={(e) => handleInputChange('sku', e.target.value)}
                                                    placeholder="Enter SKU (e.g., PROD-001)"
                                                    required
                                                    className="border-gray-300 focus:border-blue-500"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <Label htmlFor="shortDesc">Short Description</Label>
                                            <Textarea
                                                id="shortDesc"
                                                value={formData.shortDesc}
                                                onChange={(e) => handleInputChange('shortDesc', e.target.value)}
                                                placeholder="Brief product description for listings"
                                                rows={2}
                                            />
                                        </div>

                                        <div>
                                            <Label htmlFor="description" className="text-sm font-medium">
                                                Description <span className="text-red-500">*</span>
                                            </Label>
                                            <Textarea
                                                id="description"
                                                value={formData.description}
                                                onChange={(e) => handleInputChange('description', e.target.value)}
                                                placeholder="Detailed product description (required)"
                                                rows={6}
                                                required
                                                className="resize-none border-gray-300 focus:border-blue-500"
                                            />
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <Label htmlFor="category" className="text-sm font-medium">
                                                    Category <span className="text-red-500">*</span>
                                                </Label>
                                                <Select value={formData.categoryId} onValueChange={(value) => handleInputChange('categoryId', value)} required>
                                                    <SelectTrigger className="border-gray-300 focus:border-blue-500">
                                                        <SelectValue placeholder="Select category" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {categories.map((category) => (
                                                            <SelectItem key={category.id} value={category.id}>
                                                                {category.name}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div>
                                                <Label htmlFor="brand" className="text-sm font-medium">Brand (Optional)</Label>
                                                <Select value={formData.brandId} onValueChange={(value) => handleInputChange('brandId', value)}>
                                                    <SelectTrigger className="border-gray-300">
                                                        <SelectValue placeholder="Select brand (optional)" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {brands.map((brand) => (
                                                            <SelectItem key={brand.id} value={brand.id}>
                                                                {brand.name}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <Label htmlFor="comparePrice" className="text-sm font-medium">MRP (₹) (Optional)</Label>
                                                <Input
                                                    id="comparePrice"
                                                    type="text"
                                                    value={formData.comparePrice || ''}
                                                    onChange={(e) => handleInputChange('comparePrice', parseFloat(e.target.value) || undefined)}
                                                    placeholder="0.00"
                                                    className="border-gray-300"
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="price" className="text-sm font-medium">
                                                    Offer Price (₹) <span className="text-red-500">*</span>
                                                </Label>
                                                <Input
                                                    id="price"
                                                    type="text"
                                                    value={formData.price}
                                                    onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                                                    placeholder="0.00"
                                                    required
                                                    className="border-gray-300 focus:border-blue-500"
                                                />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Features */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Key Features</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="flex space-x-2">
                                            <Input
                                                placeholder="Enter a feature"
                                                value={newFeature}
                                                onChange={(e) => setNewFeature(e.target.value)}
                                                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                                            />
                                            <Button type="button" onClick={addFeature} variant="outline">
                                                <Plus className="w-4 h-4" />
                                            </Button>
                                        </div>

                                        {formData.features && formData.features.length > 0 && (
                                            <ul className="space-y-2">
                                                {formData.features.map((feature, index) => (
                                                    <li key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                                        <span className="text-sm">• {feature}</span>
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => removeFeature(feature)}
                                                        >
                                                            <X className="w-4 h-4" />
                                                        </Button>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </CardContent>
                                </Card>

                                {/* Inventory */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Inventory</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <Label htmlFor="quantity">Current Stock</Label>
                                                <Input
                                                    id="quantity"
                                                    type="text"
                                                    value={formData.quantity}
                                                    onChange={(e) => handleInputChange('quantity', parseInt(e.target.value) || 0)}
                                                    placeholder="0"
                                                />
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <Label htmlFor="trackQuantity">Track Quantity</Label>
                                                <Switch
                                                    id="trackQuantity"
                                                    checked={formData.trackQuantity}
                                                    onCheckedChange={(checked) => handleInputChange('trackQuantity', checked)}
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
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => removeSpecification(key)}
                                                        >
                                                            <X className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>

                                {/* Custom Fields */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Custom Fields</CardTitle>
                                        <p className="text-sm text-gray-500">Add any custom product attributes (e.g., warranty, certifications)</p>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <Input
                                                placeholder="Field name (e.g., Warranty)"
                                                value={newCustomKey}
                                                onChange={(e) => setNewCustomKey(e.target.value)}
                                            />
                                            <div className="flex space-x-2">
                                                <Input
                                                    placeholder="Value (e.g., 2 years)"
                                                    value={newCustomValue}
                                                    onChange={(e) => setNewCustomValue(e.target.value)}
                                                />
                                                <Button type="button" onClick={addCustomField} variant="outline">
                                                    <Plus className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>

                                        {Object.entries(formData.customFields).length > 0 && (
                                            <div className="space-y-2">
                                                {Object.entries(formData.customFields).map(([key, value]) => (
                                                    <div key={key} className="flex items-center justify-between p-2 bg-blue-50 rounded">
                                                        <span className="font-medium text-blue-900">{key}:</span>
                                                        <span className="text-blue-800">{value}</span>
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => removeCustomField(key)}
                                                        >
                                                            <X className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>

                                {/* SEO */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle>SEO Settings</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div>
                                            <Label htmlFor="seoTitle">SEO Title</Label>
                                            <Input
                                                id="seoTitle"
                                                value={formData.seoTitle}
                                                onChange={(e) => handleInputChange('seoTitle', e.target.value)}
                                                placeholder="SEO optimized title (60 characters recommended)"
                                                maxLength={60}
                                            />
                                            <p className="text-xs text-gray-500 mt-1">{formData.seoTitle?.length || 0}/60 characters</p>
                                        </div>
                                        <div>
                                            <Label htmlFor="seoDesc">SEO Description</Label>
                                            <Textarea
                                                id="seoDesc"
                                                value={formData.seoDesc}
                                                onChange={(e) => handleInputChange('seoDesc', e.target.value)}
                                                placeholder="SEO optimized description (160 characters recommended)"
                                                rows={3}
                                                maxLength={160}
                                            />
                                            <p className="text-xs text-gray-500 mt-1">{formData.seoDesc?.length || 0}/160 characters</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Sidebar */}
                            <div className="space-y-6">
                                {/* Images */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center">
                                            <ImageIcon className="w-5 h-5 mr-2" />
                                            Product Images
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <Button
                                            type="button"
                                            onClick={() => setIsMediaPickerOpen(true)}
                                            variant="outline"
                                            className="w-full"
                                        >
                                            <ImageIcon className="w-4 h-4 mr-2" />
                                            Select from Media Library
                                        </Button>

                                        {formData.images.length > 0 && (
                                            <div className="space-y-2">
                                                <Label>Selected Images ({formData.images.length})</Label>
                                                <div className="grid grid-cols-2 gap-2">
                                                    {formData.images.map((image, index) => (
                                                        <div key={index} className="relative group">
                                                            <img
                                                                src={image}
                                                                alt={`Product ${index + 1}`}
                                                                className="w-full h-24 object-cover rounded border"
                                                            />
                                                            <Button
                                                                type="button"
                                                                variant="destructive"
                                                                size="sm"
                                                                className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                                                onClick={() => removeImage(index)}
                                                            >
                                                                <X className="w-3 h-3" />
                                                            </Button>
                                                            {index === 0 && (
                                                                <Badge className="absolute bottom-1 left-1 text-xs">Main</Badge>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>

                                {/* Tags */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Tags</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="flex space-x-2">
                                            <Input
                                                placeholder="Add a tag"
                                                value={newTag}
                                                onChange={(e) => setNewTag(e.target.value)}
                                                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                                            />
                                            <Button type="button" onClick={addTag} variant="outline">
                                                <Plus className="w-4 h-4" />
                                            </Button>
                                        </div>

                                        {formData.tags && formData.tags.length > 0 && (
                                            <div className="flex flex-wrap gap-2">
                                                {formData.tags.map((tag, index) => (
                                                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                                                        {tag}
                                                        <X
                                                            className="w-3 h-3 cursor-pointer hover:text-red-500"
                                                            onClick={() => removeTag(tag)}
                                                        />
                                                    </Badge>
                                                ))}
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>

                                {/* Status */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Product Status</CardTitle>
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
                                            <Label htmlFor="featured">Featured Product</Label>
                                            <Switch
                                                id="featured"
                                                checked={formData.featured}
                                                onCheckedChange={(checked) => handleInputChange('featured', checked)}
                                            />
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </form>
                </div>
            </div>

            <MediaPicker
                isOpen={isMediaPickerOpen}
                onClose={() => setIsMediaPickerOpen(false)}
                onSelect={handleMediaSelected}
                multiple={true}
            />
        </div>
    );
}
