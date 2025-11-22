'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Package,
    Plus,
    Search,
    Edit,
    Trash2,
    Eye,
    MoreHorizontal,
    Filter,
    Sparkles,
    CheckSquare,
    Square,
    Download,
    Upload,
    FileSpreadsheet
} from 'lucide-react';
import { useAuthStore } from '@/lib/store/auth';
import Link from 'next/link';
import { AdminSidebar } from '@/components/admin/sidebar';
import { AITools } from '@/components/admin/ai-tools';
import { AIProductGenerator } from '@/components/admin/ai-product-generator';
import { ExportButton } from '@/components/admin/export-button';
import { BulkImport } from '@/components/admin/bulk-import';
import { useRouter } from 'next/navigation';

interface Product {
    id: string;
    name: string;
    sku: string;
    price: number;
    category: {
        name: string;
    };
    inventory: {
        quantity: number;
    };
    isActive: boolean;
    featured: boolean;
    createdAt: string;
}

interface Category {
    id: string;
    name: string;
}

interface Brand {
    id: string;
    name: string;
}

export default function ProductsManagementPage() {
    const { token } = useAuthStore();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [brands, setBrands] = useState<Brand[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [isAIToolsOpen, setIsAIToolsOpen] = useState(false);
    const [isAIGeneratorOpen, setIsAIGeneratorOpen] = useState(false);
    const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());
    const [isBulkMode, setIsBulkMode] = useState(false);
    const [isBulkUploadOpen, setIsBulkUploadOpen] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isUploading, setIsUploading] = useState(false);

    useEffect(() => {
        fetchProducts();
        fetchCategories();
        fetchBrands();
    }, []);

    const fetchProducts = async () => {
        try {
            const response = await fetch('/api/v1/admin/products?limit=100', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            const data = await response.json();

            if (data.success) {
                setProducts(data.data.products);
            } else {
                setError(data.error || 'Failed to load products');
            }
        } catch (err) {
            setError('Failed to load products');
        } finally {
            setIsLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await fetch('/api/v1/admin/categories', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) {
                setCategories(data.data);
            }
        } catch (err) {
            console.error('Failed to fetch categories');
        }
    };

    const fetchBrands = async () => {
        try {
            const response = await fetch('/api/v1/admin/brands', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) {
                setBrands(data.data);
            }
        } catch (err) {
            console.error('Failed to fetch brands');
        }
    };

    const handleAIProductGenerated = (product: any) => {
        // Store the AI-generated product in session storage to pass to the new product page
        sessionStorage.setItem('aiGeneratedProduct', JSON.stringify(product));
        router.push('/admin/products/new');
    };

    const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleDelete = async (productId: string) => {
        if (!confirm('Are you sure you want to delete this product?')) return;

        try {
            const response = await fetch(`/api/v1/products/${productId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            const data = await response.json();

            if (data.success) {
                setProducts(products.filter(p => p.id !== productId));
            } else {
                setError(data.error || 'Failed to delete product');
            }
        } catch (err) {
            setError('Failed to delete product');
        }
    };

    // Bulk operations
    const handleSelectProduct = (productId: string, checked: boolean) => {
        const newSelected = new Set(selectedProducts);
        if (checked) {
            newSelected.add(productId);
        } else {
            newSelected.delete(productId);
        }
        setSelectedProducts(newSelected);
        setIsBulkMode(newSelected.size > 0);
    };

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            const allIds = new Set(filteredProducts.map(p => p.id));
            setSelectedProducts(allIds);
            setIsBulkMode(true);
        } else {
            setSelectedProducts(new Set());
            setIsBulkMode(false);
        }
    };

    const handleBulkDelete = async () => {
        if (selectedProducts.size === 0) return;
        if (!confirm(`Are you sure you want to delete ${selectedProducts.size} products?`)) return;

        try {
            const deletePromises = Array.from(selectedProducts).map(productId =>
                fetch(`/api/v1/products/${productId}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}` }
                })
            );

            const responses = await Promise.all(deletePromises);
            const results = await Promise.all(responses.map(r => r.json()));

            const successCount = results.filter(r => r.success).length;
            const failCount = results.length - successCount;

            if (successCount > 0) {
                setProducts(products.filter(p => !selectedProducts.has(p.id)));
                setSelectedProducts(new Set());
                setIsBulkMode(false);
                if (failCount > 0) {
                    setError(`${successCount} products deleted, ${failCount} failed`);
                }
            } else {
                setError('Failed to delete products');
            }
        } catch (err) {
            setError('Failed to delete products');
        }
    };

    const handleBulkStatusUpdate = async (isActive: boolean) => {
        if (selectedProducts.size === 0) return;

        try {
            const updatePromises = Array.from(selectedProducts).map(productId =>
                fetch(`/api/v1/products/${productId}`, {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ isActive })
                })
            );

            const responses = await Promise.all(updatePromises);
            const results = await Promise.all(responses.map(r => r.json()));

            const successCount = results.filter(r => r.success).length;
            const failCount = results.length - successCount;

            if (successCount > 0) {
                // Update local state
                setProducts(products.map(p =>
                    selectedProducts.has(p.id) ? { ...p, isActive } : p
                ));
                setSelectedProducts(new Set());
                setIsBulkMode(false);
                if (failCount > 0) {
                    setError(`${successCount} products updated, ${failCount} failed`);
                }
            } else {
                setError('Failed to update products');
            }
        } catch (err) {
            setError('Failed to update products');
        }
    };

    const handleBulkFeatureUpdate = async (featured: boolean) => {
        if (selectedProducts.size === 0) return;

        try {
            const updatePromises = Array.from(selectedProducts).map(productId =>
                fetch(`/api/v1/products/${productId}`, {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ featured })
                })
            );

            const responses = await Promise.all(updatePromises);
            const results = await Promise.all(responses.map(r => r.json()));

            const successCount = results.filter(r => r.success).length;
            const failCount = results.length - successCount;

            if (successCount > 0) {
                // Update local state
                setProducts(products.map(p =>
                    selectedProducts.has(p.id) ? { ...p, featured } : p
                ));
                setSelectedProducts(new Set());
                setIsBulkMode(false);
                if (failCount > 0) {
                    setError(`${successCount} products updated, ${failCount} failed`);
                }
            } else {
                setError('Failed to update products');
            }
        } catch (err) {
            setError('Failed to update products');
        }
    };

    const handleDownloadTemplate = () => {
        // Create sample CSV template
        const headers = [
            'name',
            'sku',
            'description',
            'shortDesc',
            'price',
            'comparePrice',
            'costPrice',
            'trackQuantity',
            'quantity',
            'weight',
            'categoryName',
            'brandName',
            'isActive',
            'featured',
            'seoTitle',
            'seoDesc',
            'images'
        ];

        const sampleData = [
            'Sample Product 1',
            'SP001',
            'This is a detailed description of the product',
            'Short description',
            '99.99',
            '129.99',
            '50.00',
            'true',
            '100',
            '1.5',
            'Electronics',
            'Sample Brand',
            'true',
            'false',
            'Sample Product SEO Title',
            'Sample product SEO description',
            'https://example.com/image1.jpg,https://example.com/image2.jpg'
        ];

        const csvContent = [headers.join(','), sampleData.join(',')].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', 'product_bulk_upload_template.csv');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleBulkUpload = async (file: File) => {
        if (!file) return;

        setIsUploading(true);
        setUploadProgress(0);

        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await fetch('/api/v1/admin/products/bulk-upload', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData,
            });

            const data = await response.json();

            if (data.success) {
                setError(`Successfully uploaded ${data.data.successful} products. ${data.data.failed} failed.`);
                fetchProducts(); // Refresh the list
            } else {
                setError(data.error || 'Failed to upload products');
            }
        } catch (err) {
            setError('Failed to upload products');
        } finally {
            setIsUploading(false);
            setUploadProgress(0);
            setIsBulkUploadOpen(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex min-h-screen bg-gray-50">
                <AdminSidebar />
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">Loading products...</p>
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
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Products Management</h1>
                            <p className="text-gray-600 mt-2">
                                Manage your product catalog, inventory, and pricing.
                            </p>
                        </div>
                        <div className="flex items-center space-x-3">
                            <Button
                                variant="outline"
                                onClick={() => setIsAIGeneratorOpen(true)}
                                className="flex items-center bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700"
                            >
                                <Sparkles className="w-4 h-4 mr-2" />
                                Generate with AI
                            </Button>
                            <ExportButton type="products" />
                            <Button
                                variant="outline"
                                onClick={handleDownloadTemplate}
                                className="flex items-center"
                            >
                                <FileSpreadsheet className="w-4 h-4 mr-2" />
                                Download Template
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => setIsBulkUploadOpen(true)}
                                className="flex items-center"
                            >
                                <Upload className="w-4 h-4 mr-2" />
                                Bulk Upload
                            </Button>
                            <Link href="/admin/products/new">
                                <Button className="flex items-center">
                                    <Plus className="w-4 h-4 mr-2" />
                                    Add New Product
                                </Button>
                            </Link>
                        </div>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-red-800">{error}</p>
                        </div>
                    )}

                    {/* Search and Filters */}
                    <Card className="mb-6">
                        <CardContent className="p-6">
                            <div className="flex items-center space-x-4">
                                <div className="flex-1 relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                    <Input
                                        placeholder="Search products by name, SKU, or category..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                                <Button variant="outline">
                                    <Filter className="w-4 h-4 mr-2" />
                                    Filters
                                </Button>
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
                                            {selectedProducts.size} product{selectedProducts.size !== 1 ? 's' : ''} selected
                                        </span>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleBulkStatusUpdate(true)}
                                            className="text-green-700 border-green-300 hover:bg-green-50"
                                        >
                                            Activate
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleBulkStatusUpdate(false)}
                                            className="text-orange-700 border-orange-300 hover:bg-orange-50"
                                        >
                                            Deactivate
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleBulkFeatureUpdate(true)}
                                            className="text-purple-700 border-purple-300 hover:bg-purple-50"
                                        >
                                            Feature
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleBulkFeatureUpdate(false)}
                                            className="text-gray-700 border-gray-300 hover:bg-gray-50"
                                        >
                                            Unfeature
                                        </Button>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                                setSelectedProducts(new Set());
                                                setIsBulkMode(false);
                                            }}
                                        >
                                            Clear Selection
                                        </Button>
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            onClick={handleBulkDelete}
                                        >
                                            <Trash2 className="w-4 h-4 mr-2" />
                                            Delete Selected
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Products Table */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <Package className="w-5 h-5 mr-2" />
                                Products ({filteredProducts.length})
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-12">
                                            <Checkbox
                                                checked={selectedProducts.size === filteredProducts.length && filteredProducts.length > 0}
                                                onCheckedChange={handleSelectAll}
                                            />
                                        </TableHead>
                                        <TableHead>Product</TableHead>
                                        <TableHead>SKU</TableHead>
                                        <TableHead>Category</TableHead>
                                        <TableHead>Price</TableHead>
                                        <TableHead>Stock</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredProducts.map((product) => (
                                        <TableRow key={product.id}>
                                            <TableCell>
                                                <Checkbox
                                                    checked={selectedProducts.has(product.id)}
                                                    onCheckedChange={(checked) => handleSelectProduct(product.id, checked as boolean)}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <div>
                                                    <p className="font-medium">{product.name}</p>
                                                    {product.featured && (
                                                        <Badge variant="secondary" className="mt-1">Featured</Badge>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="font-mono text-sm">{product.sku}</TableCell>
                                            <TableCell>{product.category.name}</TableCell>
                                            <TableCell>₹{product.price.toLocaleString('en-IN')}</TableCell>
                                            <TableCell>
                                                <span className={product.inventory.quantity > 10 ? 'text-green-600' : 'text-orange-600'}>
                                                    {product.inventory.quantity}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={product.isActive ? 'default' : 'secondary'}>
                                                    {product.isActive ? 'Active' : 'Inactive'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center space-x-2">
                                                    <Link href={`/admin/products/${product.id}`}>
                                                        <Button variant="outline" size="sm">
                                                            <Eye className="w-4 h-4" />
                                                        </Button>
                                                    </Link>
                                                    <Link href={`/admin/products/${product.id}/edit`}>
                                                        <Button variant="outline" size="sm">
                                                            <Edit className="w-4 h-4" />
                                                        </Button>
                                                    </Link>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => {
                                                            setSelectedProduct(product);
                                                            setIsAIToolsOpen(true);
                                                        }}
                                                        className="text-purple-600 hover:text-purple-700"
                                                    >
                                                        <Sparkles className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleDelete(product.id)}
                                                        className="text-red-600 hover:text-red-700"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>

                            {filteredProducts.length === 0 && (
                                <div className="text-center py-12">
                                    <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
                                    <p className="text-gray-600 mb-4">
                                        {searchTerm ? 'Try adjusting your search terms.' : 'Get started by adding your first product.'}
                                    </p>
                                    {!searchTerm && (
                                        <Link href="/admin/products/new">
                                            <Button>
                                                <Plus className="w-4 h-4 mr-2" />
                                                Add New Product
                                            </Button>
                                        </Link>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                    
                    <div className="mt-8">
                        <BulkImport 
                            type="products" 
                            onImportComplete={fetchProducts}
                        />
                    </div>
                </div>
            </div>

            <Dialog open={isAIToolsOpen} onOpenChange={setIsAIToolsOpen}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center">
                            <Sparkles className="w-5 h-5 mr-2 text-purple-600" />
                            AI Content Generator - {selectedProduct?.name}
                        </DialogTitle>
                    </DialogHeader>
                    {selectedProduct && (
                        <AITools
                            productName={selectedProduct!.name}
                            productCategory={selectedProduct!.category.name}
                            onDescriptionGenerated={(description) => {
                                // Could auto-fill form fields here
                                console.log('Generated description:', description);
                            }}
                            onTitleGenerated={(title) => {
                                console.log('Generated title:', title);
                            }}
                            onImageGenerated={(imageUrl) => {
                                console.log('Generated image:', imageUrl);
                            }}
                            onContentGenerated={(content) => {
                                console.log('Generated content:', content);
                            }}
                        />
                    )}
                </DialogContent>
            </Dialog>

            {/* AI Product Generator */}
            <AIProductGenerator
                isOpen={isAIGeneratorOpen}
                onClose={() => setIsAIGeneratorOpen(false)}
                onProductGenerated={handleAIProductGenerated}
                categories={categories}
                brands={brands}
            />

            {/* Bulk Upload Dialog */}
            <Dialog open={isBulkUploadOpen} onOpenChange={setIsBulkUploadOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center">
                            <Upload className="w-5 h-5 mr-2 text-blue-600" />
                            Bulk Upload Products
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="text-sm text-gray-600">
                            Upload a CSV file with product data. Make sure to use the template format.
                        </div>

                        {isUploading && (
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span>Uploading...</span>
                                    <span>{uploadProgress}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                        style={{ width: `${uploadProgress}%` }}
                                    ></div>
                                </div>
                            </div>
                        )}

                        <div className="flex items-center justify-center w-full">
                            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    <FileSpreadsheet className="w-8 h-8 mb-3 text-gray-400" />
                                    <p className="mb-2 text-sm text-gray-500">
                                        <span className="font-semibold">Click to upload</span> or drag and drop
                                    </p>
                                    <p className="text-xs text-gray-500">CSV files only</p>
                                </div>
                                <input
                                    type="file"
                                    className="hidden"
                                    accept=".csv"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                            handleBulkUpload(file);
                                        }
                                    }}
                                    disabled={isUploading}
                                />
                            </label>
                        </div>

                        <div className="flex justify-between">
                            <Button
                                variant="outline"
                                onClick={handleDownloadTemplate}
                                disabled={isUploading}
                            >
                                <Download className="w-4 h-4 mr-2" />
                                Download Template
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => setIsBulkUploadOpen(false)}
                                disabled={isUploading}
                            >
                                Cancel
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
