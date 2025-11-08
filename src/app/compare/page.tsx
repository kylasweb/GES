'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Search, X, ShoppingCart, Plus, Check } from 'lucide-react';
import Image from 'next/image';

interface Product {
    id: string;
    name: string;
    sku: string;
    price: number;
    compareAtPrice?: number;
    description?: string;
    images?: string[];
    category?: {
        name: string;
    };
    brand?: {
        name: string;
    };
    specifications?: any;
    quantity: number;
    status: string;
}

export default function ComparePage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('ALL');
    const [loading, setLoading] = useState(true);

    const { toast } = useToast();
    const MAX_COMPARE = 4;

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/v1/products?page=1&limit=100');
            const data = await response.json();

            if (data.success) {
                setProducts(data.data.products);
            } else {
                toast({
                    title: 'Error',
                    description: 'Failed to fetch products',
                    variant: 'destructive',
                });
            }
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to fetch products',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleAddToCompare = (product: Product) => {
        if (selectedProducts.length >= MAX_COMPARE) {
            toast({
                title: 'Limit Reached',
                description: `You can only compare up to ${MAX_COMPARE} products at a time`,
                variant: 'destructive',
            });
            return;
        }

        if (selectedProducts.find((p) => p.id === product.id)) {
            toast({
                title: 'Already Added',
                description: 'This product is already in the comparison',
                variant: 'destructive',
            });
            return;
        }

        setSelectedProducts([...selectedProducts, product]);
        toast({
            title: 'Added to Comparison',
            description: `${product.name} added to comparison`,
        });
    };

    const handleRemoveFromCompare = (productId: string) => {
        setSelectedProducts(selectedProducts.filter((p) => p.id !== productId));
    };

    const handleClearAll = () => {
        setSelectedProducts([]);
        toast({
            title: 'Cleared',
            description: 'All products removed from comparison',
        });
    };

    const filteredProducts = products.filter((product) => {
        const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.sku.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = categoryFilter === 'ALL' ||
            (product.category && product.category.name === categoryFilter);
        const notSelected = !selectedProducts.find((p) => p.id === product.id);

        return matchesSearch && matchesCategory && notSelected;
    });

    const categories = Array.from(new Set(products.map((p) => p.category?.name).filter(Boolean)));

    const getComparisonRows = () => {
        if (selectedProducts.length === 0) return [];

        const rows = [
            { label: 'Product Image', key: 'image', type: 'image' },
            { label: 'Name', key: 'name', type: 'text' },
            { label: 'SKU', key: 'sku', type: 'text' },
            { label: 'Price', key: 'price', type: 'price' },
            { label: 'Category', key: 'category', type: 'category' },
            { label: 'Brand', key: 'brand', type: 'brand' },
            { label: 'Availability', key: 'availability', type: 'availability' },
            { label: 'Description', key: 'description', type: 'text' },
        ];

        // Add specification rows if any product has specifications
        const allSpecs = new Set<string>();
        selectedProducts.forEach((product) => {
            if (product.specifications) {
                Object.keys(product.specifications).forEach((key) => allSpecs.add(key));
            }
        });

        allSpecs.forEach((spec) => {
            rows.push({ label: spec, key: spec, type: 'specification' });
        });

        return rows;
    };

    const getCellValue = (product: Product, row: any) => {
        switch (row.type) {
            case 'image':
                return product.images && product.images.length > 0 ? product.images[0] : null;
            case 'price':
                return (
                    <div>
                        <div className="text-lg font-bold">₹{product.price.toFixed(2)}</div>
                        {product.compareAtPrice && product.compareAtPrice > product.price && (
                            <div className="text-sm text-muted-foreground line-through">
                                ₹{product.compareAtPrice.toFixed(2)}
                            </div>
                        )}
                    </div>
                );
            case 'category':
                return product.category?.name || 'N/A';
            case 'brand':
                return product.brand?.name || 'N/A';
            case 'availability':
                return product.quantity > 0 ? (
                    <Badge className="bg-green-100 text-green-800">In Stock ({product.quantity})</Badge>
                ) : (
                    <Badge variant="secondary">Out of Stock</Badge>
                );
            case 'specification':
                return product.specifications?.[row.key] || 'N/A';
            default:
                return product[row.key as keyof Product] || 'N/A';
        }
    };

    if (loading) {
        return (
            <div className="container mx-auto py-8 px-4">
                <div className="text-center py-20">Loading products...</div>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-8 px-4">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Compare Products</h1>
                <p className="text-muted-foreground">
                    Compare up to {MAX_COMPARE} products side-by-side to make an informed decision
                </p>
            </div>

            {/* Selected Products Bar */}
            {selectedProducts.length > 0 && (
                <Card className="mb-6 border-blue-200 bg-blue-50">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-blue-900">
                                Comparing {selectedProducts.length} of {MAX_COMPARE} products
                            </h3>
                            <Button variant="outline" size="sm" onClick={handleClearAll}>
                                <X className="mr-2 h-4 w-4" />
                                Clear All
                            </Button>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {selectedProducts.map((product) => (
                                <div key={product.id} className="bg-white rounded-lg p-3 relative">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="absolute -top-2 -right-2 h-6 w-6 p-0 rounded-full bg-red-500 text-white hover:bg-red-600"
                                        onClick={() => handleRemoveFromCompare(product.id)}
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>

                                    {product.images && product.images.length > 0 && (
                                        <div className="relative h-24 mb-2 bg-gray-100 rounded">
                                            <Image
                                                src={product.images[0]}
                                                alt={product.name}
                                                fill
                                                className="object-contain p-2"
                                            />
                                        </div>
                                    )}

                                    <p className="font-medium text-sm line-clamp-2">{product.name}</p>
                                    <p className="text-xs text-muted-foreground">{product.sku}</p>
                                </div>
                            ))}

                            {/* Empty slots */}
                            {[...Array(MAX_COMPARE - selectedProducts.length)].map((_, i) => (
                                <div
                                    key={`empty-${i}`}
                                    className="bg-white rounded-lg p-3 border-2 border-dashed border-gray-300 flex items-center justify-center h-32"
                                >
                                    <div className="text-center text-muted-foreground">
                                        <Plus className="h-8 w-8 mx-auto mb-2 opacity-30" />
                                        <p className="text-xs">Add Product</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Comparison Table */}
            {selectedProducts.length >= 2 && (
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle>Product Comparison</CardTitle>
                        <CardDescription>Detailed side-by-side comparison</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr>
                                        <th className="border p-3 bg-gray-50 text-left font-semibold w-48">
                                            Feature
                                        </th>
                                        {selectedProducts.map((product) => (
                                            <th key={product.id} className="border p-3 bg-gray-50 text-center min-w-[200px]">
                                                <div className="font-semibold text-sm">{product.name}</div>
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {getComparisonRows().map((row, index) => (
                                        <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                            <td className="border p-3 font-medium text-sm">{row.label}</td>
                                            {selectedProducts.map((product) => (
                                                <td key={product.id} className="border p-3 text-center">
                                                    {row.type === 'image' ? (
                                                        getCellValue(product, row) ? (
                                                            <div className="relative h-32 bg-gray-100 rounded mx-auto">
                                                                <Image
                                                                    src={getCellValue(product, row) as string}
                                                                    alt={product.name}
                                                                    fill
                                                                    className="object-contain p-2"
                                                                />
                                                            </div>
                                                        ) : (
                                                            <div className="h-32 bg-gray-100 rounded flex items-center justify-center text-muted-foreground">
                                                                No Image
                                                            </div>
                                                        )
                                                    ) : (
                                                        <div className="text-sm">{getCellValue(product, row)}</div>
                                                    )}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}

                                    {/* Add to Cart Row */}
                                    <tr className="bg-blue-50">
                                        <td className="border p-3 font-semibold">Actions</td>
                                        {selectedProducts.map((product) => (
                                            <td key={product.id} className="border p-3 text-center">
                                                <Button
                                                    size="sm"
                                                    disabled={product.quantity === 0}
                                                    className="w-full"
                                                >
                                                    <ShoppingCart className="mr-2 h-4 w-4" />
                                                    Add to Cart
                                                </Button>
                                            </td>
                                        ))}
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Product Selection */}
            <Card>
                <CardHeader>
                    <CardTitle>Add Products to Compare</CardTitle>
                    <CardDescription>
                        {selectedProducts.length === 0
                            ? 'Select products to start comparing'
                            : `Select ${MAX_COMPARE - selectedProducts.length} more product${MAX_COMPARE - selectedProducts.length !== 1 ? 's' : ''}`}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {/* Filters */}
                    <div className="flex gap-4 mb-6">
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search products..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-9"
                                />
                            </div>
                        </div>

                        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                            <SelectTrigger className="w-[200px]">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">All Categories</SelectItem>
                                {categories.map((category) => (
                                    <SelectItem key={category} value={category!}>
                                        {category}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Products Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {filteredProducts.length === 0 ? (
                            <div className="col-span-full text-center py-12 text-muted-foreground">
                                No products found
                            </div>
                        ) : (
                            filteredProducts.slice(0, 12).map((product) => (
                                <Card key={product.id} className="hover:shadow-md transition-shadow">
                                    <CardContent className="p-4">
                                        {product.images && product.images.length > 0 && (
                                            <div className="relative h-32 mb-3 bg-gray-100 rounded">
                                                <Image
                                                    src={product.images[0]}
                                                    alt={product.name}
                                                    fill
                                                    className="object-contain p-2"
                                                />
                                            </div>
                                        )}

                                        <h3 className="font-semibold text-sm mb-1 line-clamp-2">{product.name}</h3>
                                        <p className="text-xs text-muted-foreground mb-2">{product.sku}</p>

                                        <div className="flex items-center justify-between mb-3">
                                            <div>
                                                <div className="font-bold">₹{product.price.toFixed(2)}</div>
                                                {product.compareAtPrice && product.compareAtPrice > product.price && (
                                                    <div className="text-xs text-muted-foreground line-through">
                                                        ₹{product.compareAtPrice.toFixed(2)}
                                                    </div>
                                                )}
                                            </div>

                                            {product.quantity > 0 ? (
                                                <Badge variant="secondary" className="text-xs">
                                                    <Check className="h-3 w-3 mr-1" />
                                                    In Stock
                                                </Badge>
                                            ) : (
                                                <Badge variant="secondary" className="text-xs">Out</Badge>
                                            )}
                                        </div>

                                        <Button
                                            size="sm"
                                            className="w-full"
                                            onClick={() => handleAddToCompare(product)}
                                            disabled={selectedProducts.length >= MAX_COMPARE}
                                        >
                                            <Plus className="mr-2 h-4 w-4" />
                                            Add to Compare
                                        </Button>
                                    </CardContent>
                                </Card>
                            ))
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
