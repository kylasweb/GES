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
import { ArrowLeft, Save, Package, Upload, X, Plus, ImageIcon, Sparkles, Wand2, FileText } from 'lucide-react';
import { useAuthStore } from '@/lib/store/auth';
import { AdminSidebar } from '@/components/admin/sidebar';
import { MediaPicker } from '@/components/media-picker';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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

export default function NewProductPage() {
    const { token } = useAuthStore();
    const router = useRouter();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [categories, setCategories] = useState<Category[]>([]);
    const [brands, setBrands] = useState<Brand[]>([]);
    const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);
    const [aiGenerated, setAiGenerated] = useState(false);

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

    // Fetch categories and brands on mount
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [categoriesRes, brandsRes] = await Promise.all([
                    fetch('/api/v1/admin/categories', {
                        headers: { 'Authorization': `Bearer ${token}` }
                    }),
                    fetch('/api/v1/admin/brands', {
                        headers: { 'Authorization': `Bearer ${token}` }
                    })
                ]);

                const categoriesData = await categoriesRes.json();
                const brandsData = await brandsRes.json();

                if (categoriesData.success) {
                    setCategories(categoriesData.data);
                }
                if (brandsData.success) {
                    setBrands(brandsData.data);
                }
            } catch (err) {
                console.error('Failed to fetch categories/brands:', err);
            }
        };

        if (token) {
            fetchData();
        }

        // Check for AI-generated product data
        const aiProductData = sessionStorage.getItem('aiGeneratedProduct');
        if (aiProductData) {
            try {
                const aiProduct = JSON.parse(aiProductData);
                setFormData(prev => ({
                    ...prev,
                    name: aiProduct.name || prev.name,
                    sku: aiProduct.sku || prev.sku,
                    description: aiProduct.description || aiProduct.longDescription || prev.description,
                    shortDesc: aiProduct.shortDesc || aiProduct.shortDescription || prev.shortDesc,
                    price: aiProduct.price || prev.price,
                    comparePrice: aiProduct.comparePrice || undefined,
                    categoryId: aiProduct.categoryId || prev.categoryId,
                    brandId: aiProduct.brandId || prev.brandId,
                    specifications: aiProduct.specifications || prev.specifications,
                    customFields: aiProduct.customFields || prev.customFields,
                    tags: aiProduct.tags || prev.tags,
                    seoTitle: aiProduct.seoTitle || prev.seoTitle,
                    seoDesc: aiProduct.seoDesc || aiProduct.seoDescription || prev.seoDesc,
                    features: aiProduct.features || prev.features,
                    images: aiProduct.images || prev.images // Add AI-generated images
                }));
                setAiGenerated(true);
                sessionStorage.removeItem('aiGeneratedProduct');

                const imageCount = aiProduct.images?.length || 0;
                toast({
                    title: 'AI Product Loaded',
                    description: imageCount > 0
                        ? `Product details and ${imageCount} images have been auto-filled.`
                        : 'Product details have been auto-filled. Add images to complete.',
                });
            } catch (err) {
                console.error('Failed to parse AI product data:', err);
            }
        }
    }, [token, toast]);

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
        setIsLoading(true);
        setError(null);
        setSuccess(null);

        try {
            // Generate slug from name
            const slug = formData.name
                .toLowerCase()
                .replace(/\s+/g, '-')
                .replace(/[^a-z0-9-]/g, '')
                + '-' + Date.now();

            const productData = {
                name: formData.name,
                slug,
                description: formData.description,
                shortDesc: formData.shortDesc,
                price: formData.price,
                comparePrice: formData.comparePrice,
                sku: formData.sku,
                categoryId: formData.categoryId,
                brandId: formData.brandId || undefined,
                type: 'SIMPLE' as const,
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
                }
            };

            const response = await fetch('/api/v1/products', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(productData)
            });

            const data = await response.json();

            if (data.success || response.ok) {
                setSuccess('Product created successfully!');
                toast({
                    title: 'Success',
                    description: 'Product has been created successfully',
                });
                setTimeout(() => {
                    router.push('/admin/products');
                }, 2000);
            } else {
                // Show detailed validation errors
                let errorMessage = data.error || 'Failed to create product';
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
            setError('Failed to create product');
        } finally {
            setIsLoading(false);
        }
    };

    // Add AI generation states
    const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);
    const [isGeneratingFeatures, setIsGeneratingFeatures] = useState(false);
    
    // Initialize Puter.js for AI functionality
    const initPuter = () => {
        if (typeof window !== 'undefined' && !window.puter) {
            const script = document.createElement('script');
            script.src = 'https://js.puter.com/v2/';
            script.async = true;
            document.head.appendChild(script);
        }
    };
    
    // Generate AI product description
    const generateDescription = async () => {
        if (!formData.name || !formData.categoryId) {
            toast({
                title: 'Missing Information',
                description: 'Please enter a product name and select a category first.',
                variant: 'destructive',
            });
            return;
        }
        
        setIsGeneratingDescription(true);
        initPuter();
        
        try {
            // Get category name for better context
            const categoryName = categories.find(cat => cat.id === formData.categoryId)?.name || '';
            
            const prompt = `Write a compelling product description for "${formData.name}" in the ${categoryName} category. Include key features, benefits, and a call-to-action. Keep it between 150-300 words and make it SEO-friendly.`;
            
            // Wait for Puter.js to load
            let attempts = 0;
            while (!window.puter && attempts < 50) {
                await new Promise(resolve => setTimeout(resolve, 100));
                attempts++;
            }
            
            if (!window.puter) {
                throw new Error('Failed to load AI service');
            }
            
            const response = await window.puter.ai.chat(prompt, { model: 'gpt-5-nano' });
            const description = response.trim();
            
            setFormData(prev => ({
                ...prev,
                description
            }));
            
            toast({
                title: 'Success',
                description: 'Product description generated successfully!',
            });
        } catch (error) {
            console.error('Error generating description:', error);
            toast({
                title: 'Error',
                description: 'Failed to generate description. Please try again.',
                variant: 'destructive',
            });
        } finally {
            setIsGeneratingDescription(false);
        }
    };
    
    // Generate AI product features
    const generateFeatures = async () => {
        if (!formData.name || !formData.categoryId) {
            toast({
                title: 'Missing Information',
                description: 'Please enter a product name and select a category first.',
                variant: 'destructive',
            });
            return;
        }
        
        setIsGeneratingFeatures(true);
        initPuter();
        
        try {
            // Get category name for better context
            const categoryName = categories.find(cat => cat.id === formData.categoryId)?.name || '';
            
            const prompt = `Generate 5-8 key features for "${formData.name}" in the ${categoryName} category. Return as a simple list with one feature per line, without numbering or bullet points.`;
            
            // Wait for Puter.js to load
            let attempts = 0;
            while (!window.puter && attempts < 50) {
                await new Promise(resolve => setTimeout(resolve, 100));
                attempts++;
            }
            
            if (!window.puter) {
                throw new Error('Failed to load AI service');
            }
            
            const response = await window.puter.ai.chat(prompt, { model: 'gpt-5-nano' });
            const featuresText = response.trim();
            const featuresArray = featuresText.split('\n').filter(feature => feature.trim() !== '');
            
            setFormData(prev => ({
                ...prev,
                features: featuresArray
            }));
            
            toast({
                title: 'Success',
                description: 'Product features generated successfully!',
            });
        } catch (error) {
            console.error('Error generating features:', error);
            toast({
                title: 'Error',
                description: 'Failed to generate features. Please try again.',
                variant: 'destructive',
            });
        } finally {
            setIsGeneratingFeatures(false);
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
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">Add New Product</h1>
                                <p className="text-gray-600 mt-2">
                                    Create a new product in your inventory.
                                </p>
                            </div>
                            {aiGenerated && (
                                <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                                    <Sparkles className="w-3 h-3 mr-1" />
                                    AI Generated
                                </Badge>
                            )}
                        </div>
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
                        {/* Required Fields Notice */}
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <p className="text-sm text-blue-800">
                                <span className="font-semibold">Required fields are marked with an asterisk (*)</span>
                                <br />
                                You must fill: Product Name, SKU, Description, Category, and Offer Price
                            </p>
                        </div>

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
                                            <div className="flex items-center justify-between">
                                                <Label htmlFor="description" className="text-sm font-medium">
                                                    Description <span className="text-red-500">*</span>
                                                </Label>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={generateDescription}
                                                    disabled={isGeneratingDescription || !formData.name || !formData.categoryId}
                                                    className="flex items-center gap-1"
                                                >
                                                    <Wand2 className="w-4 h-4" />
                                                    {isGeneratingDescription ? 'Generating...' : 'AI Generate'}
                                                </Button>
                                            </div>
                                            <Textarea
                                                id="description"
                                                value={formData.description}
                                                onChange={(e) => handleInputChange('description', e.target.value)}
                                                placeholder="Detailed product description (required)"
                                                rows={6}
                                                required
                                                className="resize-none border-gray-300 focus:border-blue-500"
                                            />
                                            <p className="text-xs text-gray-500 mt-1">Provide detailed information about the product</p>
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
                                                <p className="text-xs text-gray-500 mt-1">Choose product category</p>
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
                                                <p className="text-xs text-gray-500 mt-1">Maximum Retail Price</p>
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
                                                <p className="text-xs text-gray-500 mt-1">Actual selling price (discounted price)</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Features */}
                                <Card>
                                    <CardHeader>
                                        <div className="flex items-center justify-between">
                                            <CardTitle>Key Features</CardTitle>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={generateFeatures}
                                                disabled={isGeneratingFeatures || !formData.name || !formData.categoryId}
                                                className="flex items-center gap-1"
                                            >
                                                <Wand2 className="w-4 h-4" />
                                                {isGeneratingFeatures ? 'Generating...' : 'AI Generate'}
                                            </Button>
                                        </div>
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
                                                    <Badge key={index} variant="secondary" className="cursor-pointer hover:bg-gray-300">
                                                        {tag}
                                                        <X
                                                            className="w-3 h-3 ml-1"
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
                                            <Label htmlFor="featured">Featured Product</Label>
                                            <Switch
                                                id="featured"
                                                checked={formData.featured}
                                                onCheckedChange={(checked) => handleInputChange('featured', checked)}
                                            />
                                        </div>
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

                    {/* Media Picker */}
                    <MediaPicker
                        isOpen={isMediaPickerOpen}
                        onClose={() => setIsMediaPickerOpen(false)}
                        onSelect={handleMediaSelected}
                        multiple={true}
                        type="IMAGE"
                    />
                </div>
            </div>
        </div>
    );
}