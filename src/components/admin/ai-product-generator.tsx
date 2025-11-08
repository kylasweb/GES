'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Wand2, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

declare global {
    interface Window {
        puter: any;
    }
}

interface AIProductGeneratorProps {
    isOpen: boolean;
    onClose: () => void;
    onProductGenerated: (product: any) => void;
    categories: { id: string; name: string }[];
    brands: { id: string; name: string }[];
}

const industries = [
    'Solar Energy',
    'Battery & Energy Storage',
    'Wind Energy',
    'Electric Vehicles',
    'Smart Home',
    'Agriculture',
    'Manufacturing',
    'Healthcare',
    'Education',
    'Retail',
    'Hospitality',
    'Transportation',
    'Real Estate',
    'Other'
];

export function AIProductGenerator({
    isOpen,
    onClose,
    onProductGenerated,
    categories,
    brands
}: AIProductGeneratorProps) {
    const { toast } = useToast();
    const [isGenerating, setIsGenerating] = useState(false);
    const [productName, setProductName] = useState('');
    const [industry, setIndustry] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedBrand, setSelectedBrand] = useState('');
    const [additionalInfo, setAdditionalInfo] = useState('');
    const [generatedProduct, setGeneratedProduct] = useState<any>(null);
    const [step, setStep] = useState<'input' | 'generating' | 'review'>('input');

    const initPuter = () => {
        if (typeof window !== 'undefined' && !window.puter) {
            const script = document.createElement('script');
            script.src = 'https://js.puter.com/v2/';
            document.head.appendChild(script);
        }
    };

    const generateProductDescription = async () => {
        if (!productName || !industry) {
            toast({
                title: 'Missing Information',
                description: 'Please provide product name and industry',
                variant: 'destructive',
            });
            return;
        }

        setIsGenerating(true);
        setStep('generating');
        initPuter();

        // Wait for Puter to load
        await new Promise(resolve => setTimeout(resolve, 1000));

        try {
            const categoryName = categories.find(c => c.id === selectedCategory)?.name || '';
            const brandName = brands.find(b => b.id === selectedBrand)?.name || '';

            const prompt = `Generate a comprehensive product listing for an e-commerce platform:

Product Name: ${productName}
Industry: ${industry}
Category: ${categoryName || 'Not specified'}
Brand: ${brandName || 'Not specified'}
Additional Info: ${additionalInfo || 'None'}

Please provide a detailed JSON response with the following structure:
{
  "name": "${productName}",
  "shortDescription": "A brief 1-2 sentence description",
  "longDescription": "A comprehensive 3-4 paragraph description highlighting features, benefits, and use cases",
  "suggestedPrice": "Suggested retail price in INR",
  "suggestedComparePrice": "Suggested compare-at price (20-30% higher)",
  "specifications": {
    "key1": "value1",
    "key2": "value2",
    // Include 5-10 relevant technical specifications
  },
  "customFields": {
    "warranty": "warranty period",
    "certification": "relevant certifications",
    "powerRating": "if applicable",
    // Other relevant custom fields
  },
  "features": ["feature 1", "feature 2", "feature 3", "feature 4", "feature 5"],
  "tags": ["tag1", "tag2", "tag3", "tag4"],
  "seoTitle": "SEO optimized title under 60 characters",
  "seoDescription": "SEO optimized description under 160 characters"
}

Make it professional, accurate, and tailored to the ${industry} industry.`;

            const response = await window.puter.ai.chat(prompt);

            // Try to extract JSON from the response
            let productData;
            try {
                // Try to parse as direct JSON
                productData = JSON.parse(response);
            } catch (e) {
                // Try to extract JSON from markdown code blocks
                const jsonMatch = response.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/);
                if (jsonMatch) {
                    productData = JSON.parse(jsonMatch[1]);
                } else {
                    // Try to find JSON in the text
                    const jsonStart = response.indexOf('{');
                    const jsonEnd = response.lastIndexOf('}') + 1;
                    if (jsonStart !== -1 && jsonEnd > jsonStart) {
                        productData = JSON.parse(response.substring(jsonStart, jsonEnd));
                    } else {
                        throw new Error('Could not parse AI response');
                    }
                }
            }

            // Generate SKU
            const sku = `${productName.substring(0, 3).toUpperCase()}-${Date.now().toString().substring(-6)}`;

            setGeneratedProduct({
                ...productData,
                sku,
                categoryId: selectedCategory,
                brandId: selectedBrand || undefined,
                price: productData.suggestedPrice || 0,
                comparePrice: productData.suggestedComparePrice || undefined,
                description: productData.longDescription || '',
                shortDesc: productData.shortDescription || '',
            });

            setStep('review');
            toast({
                title: 'Success',
                description: 'Product details generated successfully!',
            });
        } catch (error) {
            console.error('AI Generation error:', error);
            toast({
                title: 'Error',
                description: 'Failed to generate product details. Please try again.',
                variant: 'destructive',
            });
            setStep('input');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleConfirm = () => {
        onProductGenerated(generatedProduct);
        handleReset();
        onClose();
    };

    const handleReset = () => {
        setProductName('');
        setIndustry('');
        setSelectedCategory('');
        setSelectedBrand('');
        setAdditionalInfo('');
        setGeneratedProduct(null);
        setStep('input');
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => { if (!open) handleReset(); onClose(); }}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center text-2xl">
                        <Wand2 className="w-6 h-6 mr-2 text-purple-600" />
                        AI Product Generator
                    </DialogTitle>
                    <DialogDescription>
                        Generate comprehensive product details using AI. Just provide the product name and industry.
                    </DialogDescription>
                </DialogHeader>

                {step === 'input' && (
                    <div className="space-y-6 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="productName">Product Name *</Label>
                            <Input
                                id="productName"
                                value={productName}
                                onChange={(e) => setProductName(e.target.value)}
                                placeholder="e.g., 500W Monocrystalline Solar Panel"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="industry">Industry *</Label>
                            <Select value={industry} onValueChange={setIndustry}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select industry" />
                                </SelectTrigger>
                                <SelectContent>
                                    {industries.map((ind) => (
                                        <SelectItem key={ind} value={ind}>
                                            {ind}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="category">Category (Optional)</Label>
                                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categories.map((cat) => (
                                            <SelectItem key={cat.id} value={cat.id}>
                                                {cat.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="brand">Brand (Optional)</Label>
                                <Select value={selectedBrand} onValueChange={setSelectedBrand}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select brand" />
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

                        <div className="space-y-2">
                            <Label htmlFor="additionalInfo">Additional Information (Optional)</Label>
                            <Textarea
                                id="additionalInfo"
                                value={additionalInfo}
                                onChange={(e) => setAdditionalInfo(e.target.value)}
                                placeholder="Any specific features, specifications, or details you want to include..."
                                rows={3}
                            />
                        </div>
                    </div>
                )}

                {step === 'generating' && (
                    <div className="py-12 text-center space-y-4">
                        <Loader2 className="w-16 h-16 animate-spin mx-auto text-purple-600" />
                        <h3 className="text-xl font-semibold">Generating Product Details...</h3>
                        <p className="text-gray-600">AI is creating comprehensive product information for you</p>
                    </div>
                )}

                {step === 'review' && generatedProduct && (
                    <div className="space-y-4 py-4">
                        <div className="flex items-center space-x-2 text-green-600 mb-4">
                            <CheckCircle className="w-5 h-5" />
                            <span className="font-medium">Product details generated successfully!</span>
                        </div>

                        <Card>
                            <CardContent className="pt-6 space-y-4">
                                <div>
                                    <Label className="text-sm text-gray-600">Product Name</Label>
                                    <p className="font-semibold">{generatedProduct.name}</p>
                                </div>

                                <div>
                                    <Label className="text-sm text-gray-600">SKU</Label>
                                    <p className="font-mono">{generatedProduct.sku}</p>
                                </div>

                                <div>
                                    <Label className="text-sm text-gray-600">Short Description</Label>
                                    <p className="text-sm">{generatedProduct.shortDesc}</p>
                                </div>

                                <div>
                                    <Label className="text-sm text-gray-600">Long Description</Label>
                                    <p className="text-sm text-gray-700 max-h-40 overflow-y-auto">
                                        {generatedProduct.description}
                                    </p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label className="text-sm text-gray-600">Price</Label>
                                        <p className="font-semibold text-green-600">
                                            ₹{generatedProduct.price?.toLocaleString('en-IN') || '0'}
                                        </p>
                                    </div>
                                    {generatedProduct.comparePrice && (
                                        <div>
                                            <Label className="text-sm text-gray-600">Compare Price</Label>
                                            <p className="font-semibold text-gray-500 line-through">
                                                ₹{generatedProduct.comparePrice.toLocaleString('en-IN')}
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {generatedProduct.specifications && Object.keys(generatedProduct.specifications).length > 0 && (
                                    <div>
                                        <Label className="text-sm text-gray-600 mb-2 block">Specifications</Label>
                                        <div className="bg-gray-50 p-3 rounded space-y-1 text-sm max-h-40 overflow-y-auto">
                                            {Object.entries(generatedProduct.specifications).map(([key, value]) => (
                                                <div key={key} className="flex justify-between">
                                                    <span className="text-gray-600 capitalize">{key.replace(/_/g, ' ')}:</span>
                                                    <span className="font-medium">{String(value)}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {generatedProduct.features && generatedProduct.features.length > 0 && (
                                    <div>
                                        <Label className="text-sm text-gray-600 mb-2 block">Features</Label>
                                        <ul className="list-disc list-inside space-y-1 text-sm">
                                            {generatedProduct.features.map((feature: string, idx: number) => (
                                                <li key={idx}>{feature}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {generatedProduct.tags && generatedProduct.tags.length > 0 && (
                                    <div>
                                        <Label className="text-sm text-gray-600 mb-2 block">Tags</Label>
                                        <div className="flex flex-wrap gap-2">
                                            {generatedProduct.tags.map((tag: string, idx: number) => (
                                                <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <div className="flex items-start space-x-2 p-3 bg-amber-50 border border-amber-200 rounded">
                            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                            <div className="text-sm text-amber-800">
                                <strong>Review Required:</strong> Please review all generated details carefully.
                                You can edit any field after importing this product.
                            </div>
                        </div>
                    </div>
                )}

                <DialogFooter>
                    {step === 'input' && (
                        <>
                            <Button variant="outline" onClick={() => { handleReset(); onClose(); }}>
                                Cancel
                            </Button>
                            <Button
                                onClick={generateProductDescription}
                                disabled={!productName || !industry}
                            >
                                <Wand2 className="w-4 h-4 mr-2" />
                                Generate with AI
                            </Button>
                        </>
                    )}

                    {step === 'review' && (
                        <>
                            <Button variant="outline" onClick={handleReset}>
                                Start Over
                            </Button>
                            <Button onClick={handleConfirm}>
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Use This Product
                            </Button>
                        </>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
