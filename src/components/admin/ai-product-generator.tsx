'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Wand2, Loader2, CheckCircle, AlertCircle, Image as ImageIcon, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

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
    const [step, setStep] = useState<'input' | 'generating' | 'generating-images' | 'review'>('input');
    const [generatedImages, setGeneratedImages] = useState<string[]>([]);
    const [imageGenerationEnabled, setImageGenerationEnabled] = useState(true);

    const initPuter = () => {
        if (typeof window !== 'undefined' && !window.puter) {
            const script = document.createElement('script');
            script.src = 'https://js.puter.com/v2/';
            document.head.appendChild(script);
        }
    };

    const generateProductImages = async (productData: any) => {
        setStep('generating-images');

        try {
            const images: string[] = [];
            const imageCount = 3; // Generate 3 images

            // Create image prompts based on product
            const basePrompt = `Professional product photography of ${productData.name}, ${productData.shortDescription || productData.shortDesc}. High quality, well-lit, white background, commercial photography style`;

            const prompts = [
                `${basePrompt}, front view, centered`,
                `${basePrompt}, angled view, 45 degrees`,
                `${basePrompt}, detail shot, close-up`
            ];

            for (let i = 0; i < imageCount; i++) {
                try {
                    const imageUrl = await window.puter.ai.txt2img(prompts[i]);
                    if (imageUrl) {
                        images.push(imageUrl);
                    }
                } catch (error) {
                    console.error(`Error generating image ${i + 1}:`, error);
                }
            }

            setGeneratedImages(images);

            if (images.length > 0) {
                toast({
                    title: 'Images Generated',
                    description: `Generated ${images.length} product images`,
                });
            } else {
                toast({
                    title: 'Image Generation Failed',
                    description: 'Could not generate images. You can add them manually later.',
                    variant: 'destructive',
                });
            }
        } catch (error) {
            console.error('Image generation error:', error);
            toast({
                title: 'Image Generation Failed',
                description: 'Could not generate images. You can add them manually later.',
                variant: 'destructive',
            });
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

            // Check if image generation is enabled
            if (imageGenerationEnabled) {
                await generateProductImages(productData);
            }
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
        // Include generated images in the product data
        const productWithImages = {
            ...generatedProduct,
            images: generatedImages
        };
        onProductGenerated(productWithImages);
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
        setGeneratedImages([]);
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

                        <div className="flex items-center space-x-2 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                            <input
                                type="checkbox"
                                id="generateImages"
                                checked={imageGenerationEnabled}
                                onChange={(e) => setImageGenerationEnabled(e.target.checked)}
                                className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                            />
                            <Label htmlFor="generateImages" className="flex items-center gap-2 cursor-pointer">
                                <Sparkles className="w-4 h-4 text-purple-600" />
                                <span>Generate product images with AI (3 images)</span>
                                <Badge variant="secondary" className="ml-2">New</Badge>
                            </Label>
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

                {step === 'generating-images' && (
                    <div className="py-12 text-center space-y-4">
                        <div className="relative">
                            <Loader2 className="w-16 h-16 animate-spin mx-auto text-purple-600" />
                            <ImageIcon className="w-8 h-8 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-purple-400" />
                        </div>
                        <h3 className="text-xl font-semibold">Generating Product Images...</h3>
                        <p className="text-gray-600">Creating professional product photography with AI</p>
                        <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                            <Sparkles className="w-4 h-4" />
                            <span>This may take a moment</span>
                        </div>
                    </div>
                )}

                {step === 'review' && generatedProduct && (
                    <div className="space-y-4 py-4">
                        <div className="flex items-center space-x-2 text-green-600 mb-4">
                            <CheckCircle className="w-5 h-5" />
                            <span className="font-medium">Product details generated successfully!</span>
                        </div>

                        {/* Generated Images */}
                        {generatedImages.length > 0 && (
                            <Card className="bg-purple-50 border-purple-200">
                                <CardContent className="pt-6">
                                    <div className="flex items-center gap-2 mb-3">
                                        <ImageIcon className="w-5 h-5 text-purple-600" />
                                        <Label className="text-sm text-purple-900 font-semibold">
                                            Generated Images ({generatedImages.length})
                                        </Label>
                                    </div>
                                    <div className="grid grid-cols-3 gap-3">
                                        {generatedImages.map((image, idx) => (
                                            <div key={idx} className="relative group">
                                                <img
                                                    src={image}
                                                    alt={`Generated ${idx + 1}`}
                                                    className="w-full h-32 object-cover rounded-lg border-2 border-purple-300"
                                                />
                                                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all rounded-lg flex items-center justify-center">
                                                    <Badge className="opacity-0 group-hover:opacity-100 transition-opacity">
                                                        Image {idx + 1}
                                                    </Badge>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

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
