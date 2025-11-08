'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
    ArrowLeft,
    Edit,
    Trash2,
    Package,
    DollarSign,
    BarChart3,
    Image as ImageIcon,
    FileText,
    Tag,
    AlertCircle,
    CheckCircle,
    TrendingUp,
    Eye,
    Copy,
    ExternalLink
} from 'lucide-react';
import { useAuthStore } from '@/lib/store/auth';
import { AdminSidebar } from '@/components/admin/sidebar';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';

interface Product {
    id: string;
    name: string;
    description: string;
    shortDesc: string;
    price: number;
    compareAtPrice?: number;
    sku: string;
    slug: string;
    category: {
        id: string;
        name: string;
        slug: string;
    };
    brand?: {
        id: string;
        name: string;
    };
    inventory: {
        quantity: number;
        trackQuantity: boolean;
    };
    isActive: boolean;
    featured: boolean;
    images: string[];
    specifications: Record<string, string>;
    customFields: Record<string, string>;
    tags?: string[];
    seoTitle?: string;
    seoDescription?: string;
    features?: string[];
    createdAt: string;
    updatedAt: string;
}

export default function ProductDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { token } = useAuthStore();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(true);
    const [product, setProduct] = useState<Product | null>(null);
    const [mainImage, setMainImage] = useState(0);

    useEffect(() => {
        if (params.id) {
            fetchProduct();
        }
    }, [params.id]);

    const fetchProduct = async () => {
        try {
            const response = await fetch(`/api/v1/products/${params.id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            const data = await response.json();

            if (data.success) {
                setProduct(data.data);
            } else {
                toast({
                    title: 'Error',
                    description: data.error || 'Failed to load product',
                    variant: 'destructive',
                });
            }
        } catch (err) {
            toast({
                title: 'Error',
                description: 'Failed to load product',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
            return;
        }

        try {
            const response = await fetch(`/api/v1/admin/products/${params.id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            const data = await response.json();

            if (data.success) {
                toast({
                    title: 'Success',
                    description: 'Product deleted successfully',
                });
                router.push('/admin/products');
            } else {
                toast({
                    title: 'Error',
                    description: data.error || 'Failed to delete product',
                    variant: 'destructive',
                });
            }
        } catch (err) {
            toast({
                title: 'Error',
                description: 'Failed to delete product',
                variant: 'destructive',
            });
        }
    };

    const handleToggleActive = async () => {
        if (!product) return;

        try {
            const response = await fetch(`/api/v1/admin/products/${params.id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ isActive: !product.isActive })
            });

            const data = await response.json();

            if (data.success) {
                setProduct({ ...product, isActive: !product.isActive });
                toast({
                    title: 'Success',
                    description: `Product ${!product.isActive ? 'activated' : 'deactivated'} successfully`,
                });
            } else {
                toast({
                    title: 'Error',
                    description: data.error || 'Failed to update product',
                    variant: 'destructive',
                });
            }
        } catch (err) {
            toast({
                title: 'Error',
                description: 'Failed to update product',
                variant: 'destructive',
            });
        }
    };

    const copyToClipboard = (text: string, label: string) => {
        navigator.clipboard.writeText(text);
        toast({
            title: 'Copied!',
            description: `${label} copied to clipboard`,
        });
    };

    if (isLoading) {
        return (
            <div className="flex min-h-screen bg-gray-50">
                <AdminSidebar />
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">Loading product details...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="flex min-h-screen bg-gray-50">
                <AdminSidebar />
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Product Not Found</h2>
                        <p className="text-gray-600 mb-6">The product you're looking for doesn't exist.</p>
                        <Button onClick={() => router.push('/admin/products')}>
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Products
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    const stockStatus = product.inventory.quantity > 0 ? 'In Stock' : 'Out of Stock';
    const stockColor = product.inventory.quantity > 0 ? 'text-green-600' : 'text-red-600';
    const lowStock = product.inventory.quantity > 0 && product.inventory.quantity <= 10;

    return (
        <div className="flex min-h-screen bg-gray-50">
            <AdminSidebar />
            <div className="flex-1">
                <div className="p-8">
                    {/* Header */}
                    <div className="mb-8">
                        <Button
                            variant="ghost"
                            onClick={() => router.push('/admin/products')}
                            className="mb-4"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Products
                        </Button>
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="flex items-center space-x-3 mb-2">
                                    <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
                                    <Badge variant={product.isActive ? 'default' : 'secondary'}>
                                        {product.isActive ? 'Active' : 'Inactive'}
                                    </Badge>
                                    {product.featured && (
                                        <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300">
                                            Featured
                                        </Badge>
                                    )}
                                    {lowStock && (
                                        <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-300">
                                            Low Stock
                                        </Badge>
                                    )}
                                </div>
                                <p className="text-gray-600">SKU: {product.sku}</p>
                            </div>
                            <div className="flex items-center space-x-3">
                                <Button
                                    variant="outline"
                                    onClick={() => window.open(`/products/${product.slug}`, '_blank')}
                                >
                                    <ExternalLink className="w-4 h-4 mr-2" />
                                    View Live
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={handleToggleActive}
                                >
                                    {product.isActive ? 'Deactivate' : 'Activate'}
                                </Button>
                                <Button
                                    variant="default"
                                    onClick={() => router.push(`/admin/products/${product.id}/edit`)}
                                >
                                    <Edit className="w-4 h-4 mr-2" />
                                    Edit Product
                                </Button>
                                <Button
                                    variant="destructive"
                                    onClick={handleDelete}
                                >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Delete
                                </Button>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Main Content */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Product Images */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center">
                                        <ImageIcon className="w-5 h-5 mr-2" />
                                        Product Images
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {product.images && product.images.length > 0 ? (
                                        <div className="space-y-4">
                                            {/* Main Image */}
                                            <div className="w-full h-96 bg-gray-100 rounded-lg overflow-hidden">
                                                <Image
                                                    src={product.images[mainImage]}
                                                    alt={product.name}
                                                    width={800}
                                                    height={600}
                                                    className="w-full h-full object-contain"
                                                />
                                            </div>
                                            {/* Thumbnails */}
                                            {product.images.length > 1 && (
                                                <div className="grid grid-cols-6 gap-2">
                                                    {product.images.map((image, index) => (
                                                        <button
                                                            key={index}
                                                            onClick={() => setMainImage(index)}
                                                            className={`h-20 bg-gray-100 rounded-lg overflow-hidden border-2 transition-colors ${mainImage === index
                                                                    ? 'border-green-600'
                                                                    : 'border-transparent hover:border-gray-300'
                                                                }`}
                                                        >
                                                            <Image
                                                                src={image}
                                                                alt={`${product.name} - ${index + 1}`}
                                                                width={100}
                                                                height={100}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="text-center py-12 bg-gray-50 rounded-lg">
                                            <ImageIcon className="w-16 h-16 text-gray-400 mx-auto mb-2" />
                                            <p className="text-gray-500">No images uploaded</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Product Details */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center">
                                        <FileText className="w-5 h-5 mr-2" />
                                        Product Details
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <Tabs defaultValue="description">
                                        <TabsList className="grid w-full grid-cols-4">
                                            <TabsTrigger value="description">Description</TabsTrigger>
                                            <TabsTrigger value="specifications">Specifications</TabsTrigger>
                                            <TabsTrigger value="features">Features</TabsTrigger>
                                            <TabsTrigger value="seo">SEO</TabsTrigger>
                                        </TabsList>

                                        <TabsContent value="description" className="space-y-4">
                                            <div>
                                                <h3 className="font-semibold text-gray-900 mb-2">Short Description</h3>
                                                <p className="text-gray-700">{product.shortDesc || 'No short description provided'}</p>
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-gray-900 mb-2">Full Description</h3>
                                                <div className="text-gray-700 whitespace-pre-wrap">
                                                    {product.description || 'No description provided'}
                                                </div>
                                            </div>
                                        </TabsContent>

                                        <TabsContent value="specifications">
                                            {product.specifications && Object.keys(product.specifications).length > 0 ? (
                                                <Table>
                                                    <TableBody>
                                                        {Object.entries(product.specifications).map(([key, value]) => (
                                                            <TableRow key={key}>
                                                                <TableCell className="font-medium">{key}</TableCell>
                                                                <TableCell>{value}</TableCell>
                                                            </TableRow>
                                                        ))}
                                                    </TableBody>
                                                </Table>
                                            ) : (
                                                <p className="text-gray-500 text-center py-8">No specifications added</p>
                                            )}
                                        </TabsContent>

                                        <TabsContent value="features">
                                            {product.features && product.features.length > 0 ? (
                                                <ul className="space-y-2">
                                                    {product.features.map((feature, index) => (
                                                        <li key={index} className="flex items-start">
                                                            <CheckCircle className="w-5 h-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                                                            <span className="text-gray-700">{feature}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            ) : (
                                                <p className="text-gray-500 text-center py-8">No features added</p>
                                            )}
                                        </TabsContent>

                                        <TabsContent value="seo" className="space-y-4">
                                            <div>
                                                <h3 className="font-semibold text-gray-900 mb-2">SEO Title</h3>
                                                <p className="text-gray-700">{product.seoTitle || product.name}</p>
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-gray-900 mb-2">SEO Description</h3>
                                                <p className="text-gray-700">{product.seoDescription || product.shortDesc || 'No SEO description'}</p>
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-gray-900 mb-2">URL Slug</h3>
                                                <div className="flex items-center space-x-2">
                                                    <code className="bg-gray-100 px-3 py-1 rounded text-sm flex-1">
                                                        /products/{product.slug}
                                                    </code>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => copyToClipboard(`/products/${product.slug}`, 'URL')}
                                                    >
                                                        <Copy className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </TabsContent>
                                    </Tabs>
                                </CardContent>
                            </Card>

                            {/* Custom Fields */}
                            {product.customFields && Object.keys(product.customFields).length > 0 && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Custom Fields</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <Table>
                                            <TableBody>
                                                {Object.entries(product.customFields).map(([key, value]) => (
                                                    <TableRow key={key}>
                                                        <TableCell className="font-medium">{key}</TableCell>
                                                        <TableCell>{value}</TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </CardContent>
                                </Card>
                            )}
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            {/* Pricing */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center text-base">
                                        <DollarSign className="w-4 h-4 mr-2" />
                                        Pricing
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div>
                                        <p className="text-sm text-gray-600 mb-1">Current Price</p>
                                        <p className="text-2xl font-bold text-gray-900">
                                            ₹{product.price.toLocaleString('en-IN')}
                                        </p>
                                    </div>
                                    {product.compareAtPrice && (
                                        <div>
                                            <p className="text-sm text-gray-600 mb-1">Compare at Price (MRP)</p>
                                            <div className="flex items-center space-x-2">
                                                <p className="text-lg text-gray-500 line-through">
                                                    ₹{product.compareAtPrice.toLocaleString('en-IN')}
                                                </p>
                                                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
                                                    {Math.round((1 - product.price / product.compareAtPrice) * 100)}% OFF
                                                </Badge>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Inventory */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center text-base">
                                        <Package className="w-4 h-4 mr-2" />
                                        Inventory
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600">Stock Status</span>
                                        <Badge variant={product.inventory.quantity > 0 ? 'default' : 'destructive'}>
                                            {stockStatus}
                                        </Badge>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600">Quantity</span>
                                        <span className={`text-lg font-semibold ${stockColor}`}>
                                            {product.inventory.quantity}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600">Track Quantity</span>
                                        <span className="text-sm">
                                            {product.inventory.trackQuantity ? 'Yes' : 'No'}
                                        </span>
                                    </div>
                                    {lowStock && (
                                        <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                                            <p className="text-sm text-orange-700 font-medium">
                                                ⚠️ Low stock alert! Only {product.inventory.quantity} items left.
                                            </p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Categories & Tags */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center text-base">
                                        <Tag className="w-4 h-4 mr-2" />
                                        Categories & Tags
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div>
                                        <p className="text-sm text-gray-600 mb-2">Category</p>
                                        <Badge variant="outline">{product.category.name}</Badge>
                                    </div>
                                    {product.brand && (
                                        <div>
                                            <p className="text-sm text-gray-600 mb-2">Brand</p>
                                            <Badge variant="outline">{product.brand.name}</Badge>
                                        </div>
                                    )}
                                    {product.tags && product.tags.length > 0 && (
                                        <div>
                                            <p className="text-sm text-gray-600 mb-2">Tags</p>
                                            <div className="flex flex-wrap gap-2">
                                                {product.tags.map((tag, index) => (
                                                    <Badge key={index} variant="secondary">
                                                        {tag}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Product Info */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base">Product Information</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Product ID</span>
                                        <div className="flex items-center space-x-2">
                                            <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                                                {product.id}
                                            </code>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => copyToClipboard(product.id, 'Product ID')}
                                                className="h-6 w-6 p-0"
                                            >
                                                <Copy className="w-3 h-3" />
                                            </Button>
                                        </div>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">SKU</span>
                                        <div className="flex items-center space-x-2">
                                            <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                                                {product.sku}
                                            </code>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => copyToClipboard(product.sku, 'SKU')}
                                                className="h-6 w-6 p-0"
                                            >
                                                <Copy className="w-3 h-3" />
                                            </Button>
                                        </div>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Created</span>
                                        <span className="text-gray-900">
                                            {new Date(product.createdAt).toLocaleDateString('en-IN', {
                                                day: 'numeric',
                                                month: 'short',
                                                year: 'numeric'
                                            })}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Last Updated</span>
                                        <span className="text-gray-900">
                                            {new Date(product.updatedAt).toLocaleDateString('en-IN', {
                                                day: 'numeric',
                                                month: 'short',
                                                year: 'numeric'
                                            })}
                                        </span>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
