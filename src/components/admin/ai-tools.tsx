'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Sparkles,
    Image as ImageIcon,
    FileText,
    Search,
    Wand2,
    Upload,
    Download,
    Copy,
    RefreshCw
} from 'lucide-react';

// Declare puter globally
declare global {
    interface Window {
        puter: any;
    }
}

interface AIToolsProps {
    productName?: string;
    productCategory?: string;
    onDescriptionGenerated?: (description: string) => void;
    onTitleGenerated?: (title: string) => void;
    onImageGenerated?: (imageUrl: string) => void;
    onContentGenerated?: (content: string) => void;
}

export function AITools({
    productName = '',
    productCategory = '',
    onDescriptionGenerated,
    onTitleGenerated,
    onImageGenerated,
    onContentGenerated
}: AIToolsProps) {
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedContent, setGeneratedContent] = useState<string>('');
    const [referenceImage, setReferenceImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string>('');
    const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);

    // Initialize Puter.js
    const initPuter = () => {
        if (typeof window !== 'undefined' && !window.puter) {
            const script = document.createElement('script');
            script.src = 'https://js.puter.com/v2/';
            script.async = true;
            document.head.appendChild(script);
        }
    };

    // Generate SEO-optimized product title
    const generateTitle = async () => {
        if (!productName || !productCategory) {
            alert('Please provide product name and category first');
            return;
        }

        setIsGenerating(true);
        initPuter();

        try {
            const prompt = `Generate an SEO-optimized product title for: ${productName} in the ${productCategory} category. Make it compelling, include relevant keywords, and keep it under 60 characters.`;

            const response = await window.puter.ai.chat(prompt, { model: 'gpt-5-nano' });
            const title = response.trim();

            setGeneratedContent(title);
            onTitleGenerated?.(title);
        } catch (error) {
            console.error('Error generating title:', error);
            alert('Failed to generate title. Please try again.');
        } finally {
            setIsGenerating(false);
        }
    };

    // Generate product description
    const generateDescription = async () => {
        if (!productName || !productCategory) {
            alert('Please provide product name and category first');
            return;
        }

        setIsGenerating(true);
        initPuter();

        try {
            const prompt = `Write a compelling product description for "${productName}" in the ${productCategory} category. Include key features, benefits, and a call-to-action. Keep it between 150-300 words and make it SEO-friendly.`;

            const response = await window.puter.ai.chat(prompt, { model: 'gpt-5-nano' });
            const description = response.trim();

            setGeneratedContent(description);
            onDescriptionGenerated?.(description);
        } catch (error) {
            console.error('Error generating description:', error);
            alert('Failed to generate description. Please try again.');
        } finally {
            setIsGenerating(false);
        }
    };

    // Generate product image
    const generateImage = async (prompt: string) => {
        if (!prompt.trim()) {
            alert('Please provide an image description');
            return;
        }

        setIsGenerating(true);
        initPuter();

        try {
            const image = await window.puter.ai.txt2img(prompt, false); // false = not test mode
            const imageUrl = URL.createObjectURL(image);

            setImagePreview(imageUrl);
            onImageGenerated?.(imageUrl);
        } catch (error) {
            console.error('Error generating image:', error);
            alert('Failed to generate image. Please try again.');
        } finally {
            setIsGenerating(false);
        }
    };

    // Generate image with reference
    const generateImageWithReference = async (prompt: string) => {
        if (!referenceImage) {
            alert('Please upload a reference image first');
            return;
        }

        setIsGenerating(true);
        initPuter();

        try {
            // Convert file to base64
            const reader = new FileReader();
            reader.onload = async (e) => {
                const base64Image = e.target?.result as string;

                const fullPrompt = `Generate a product image based on this reference image and description: "${prompt}". Maintain the style and quality of the reference image.`;

                const image = await window.puter.ai.chat(fullPrompt, base64Image, {
                    model: 'gpt-5-nano',
                    imageGeneration: true
                });

                const imageUrl = URL.createObjectURL(image);
                setImagePreview(imageUrl);
                onImageGenerated?.(imageUrl);
                setIsGenerating(false);
            };
            reader.readAsDataURL(referenceImage);
        } catch (error) {
            console.error('Error generating image with reference:', error);
            alert('Failed to generate image. Please try again.');
            setIsGenerating(false);
        }
    };

    // Generate page content
    const generatePageContent = async (contentType: string) => {
        if (!productName || !productCategory) {
            alert('Please provide product name and category first');
            return;
        }

        setIsGenerating(true);
        initPuter();

        try {
            let prompt = '';

            switch (contentType) {
                case 'features':
                    prompt = `Generate a detailed features section for "${productName}" in the ${productCategory} category. Include 5-8 key features with descriptions.`;
                    break;
                case 'specifications':
                    prompt = `Generate technical specifications for "${productName}" in the ${productCategory} category. Include relevant specs like dimensions, materials, weight, etc.`;
                    break;
                case 'faq':
                    prompt = `Generate 5 common FAQs for "${productName}" in the ${productCategory} category with detailed answers.`;
                    break;
                case 'meta':
                    prompt = `Generate SEO meta description and keywords for "${productName}" in the ${productCategory} category.`;
                    break;
                default:
                    prompt = `Generate compelling content for "${productName}" in the ${productCategory} category.`;
            }

            const response = await window.puter.ai.chat(prompt, { model: 'gpt-5-nano' });
            const content = response.trim();

            setGeneratedContent(content);
            onContentGenerated?.(content);
        } catch (error) {
            console.error('Error generating content:', error);
            alert('Failed to generate content. Please try again.');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setReferenceImage(file);
            const reader = new FileReader();
            reader.onload = (e) => {
                setImagePreview(e.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const copyToClipboard = async (text: string) => {
        try {
            await navigator.clipboard.writeText(text);
            alert('Copied to clipboard!');
        } catch (error) {
            console.error('Failed to copy:', error);
        }
    };

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle className="flex items-center">
                    <Sparkles className="w-5 h-5 mr-2 text-purple-600" />
                    AI Content Generator
                </CardTitle>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="text" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="text">Text Content</TabsTrigger>
                        <TabsTrigger value="images">Images</TabsTrigger>
                        <TabsTrigger value="seo">SEO Tools</TabsTrigger>
                    </TabsList>

                    <TabsContent value="text" className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Button
                                onClick={generateTitle}
                                disabled={isGenerating || !productName}
                                className="flex items-center"
                            >
                                <Wand2 className="w-4 h-4 mr-2" />
                                {isGenerating ? 'Generating...' : 'Generate Title'}
                            </Button>

                            <Button
                                onClick={generateDescription}
                                disabled={isGenerating || !productName}
                                className="flex items-center"
                            >
                                <FileText className="w-4 h-4 mr-2" />
                                {isGenerating ? 'Generating...' : 'Generate Description'}
                            </Button>
                        </div>

                        <div className="space-y-2">
                            <Label>Generated Content:</Label>
                            <Textarea
                                value={generatedContent}
                                onChange={(e) => setGeneratedContent(e.target.value)}
                                placeholder="Generated content will appear here..."
                                rows={6}
                            />
                            {generatedContent && (
                                <div className="flex space-x-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => copyToClipboard(generatedContent)}
                                    >
                                        <Copy className="w-4 h-4 mr-2" />
                                        Copy
                                    </Button>
                                </div>
                            )}
                        </div>
                    </TabsContent>

                    <TabsContent value="images" className="space-y-4">
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="image-prompt">Image Description:</Label>
                                <Input
                                    id="image-prompt"
                                    placeholder="Describe the image you want to generate..."
                                    className="mt-1"
                                />
                            </div>

                            <div className="flex space-x-2">
                                <Button
                                    onClick={() => {
                                        const prompt = (document.getElementById('image-prompt') as HTMLInputElement)?.value;
                                        generateImage(prompt);
                                    }}
                                    disabled={isGenerating}
                                    className="flex items-center"
                                >
                                    <ImageIcon className="w-4 h-4 mr-2" />
                                    {isGenerating ? 'Generating...' : 'Generate Image'}
                                </Button>

                                <Dialog open={isImageDialogOpen} onOpenChange={setIsImageDialogOpen}>
                                    <DialogTrigger asChild>
                                        <Button variant="outline" className="flex items-center">
                                            <Upload className="w-4 h-4 mr-2" />
                                            With Reference
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-md">
                                        <DialogHeader>
                                            <DialogTitle>Generate Image with Reference</DialogTitle>
                                        </DialogHeader>
                                        <div className="space-y-4">
                                            <div>
                                                <Label htmlFor="reference-upload">Upload Reference Image:</Label>
                                                <Input
                                                    id="reference-upload"
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={handleImageUpload}
                                                    className="mt-1"
                                                />
                                            </div>

                                            {imagePreview && (
                                                <div className="text-center">
                                                    <img
                                                        src={imagePreview}
                                                        alt="Reference"
                                                        className="max-w-full h-32 object-contain mx-auto border rounded"
                                                    />
                                                </div>
                                            )}

                                            <div>
                                                <Label htmlFor="ref-image-prompt">Image Description:</Label>
                                                <Input
                                                    id="ref-image-prompt"
                                                    placeholder="Describe how to modify the reference image..."
                                                    className="mt-1"
                                                />
                                            </div>

                                            <Button
                                                onClick={() => {
                                                    const prompt = (document.getElementById('ref-image-prompt') as HTMLInputElement)?.value;
                                                    generateImageWithReference(prompt);
                                                    setIsImageDialogOpen(false);
                                                }}
                                                disabled={isGenerating || !referenceImage}
                                                className="w-full"
                                            >
                                                {isGenerating ? 'Generating...' : 'Generate with Reference'}
                                            </Button>
                                        </div>
                                    </DialogContent>
                                </Dialog>
                            </div>

                            {imagePreview && (
                                <div className="text-center">
                                    <img
                                        src={imagePreview}
                                        alt="Generated"
                                        className="max-w-full h-64 object-contain mx-auto border rounded"
                                    />
                                    <div className="mt-2 flex justify-center space-x-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                                const link = document.createElement('a');
                                                link.href = imagePreview;
                                                link.download = 'generated-image.png';
                                                link.click();
                                            }}
                                        >
                                            <Download className="w-4 h-4 mr-2" />
                                            Download
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </TabsContent>

                    <TabsContent value="seo" className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Button
                                onClick={() => generatePageContent('meta')}
                                disabled={isGenerating || !productName}
                                className="flex items-center"
                            >
                                <Search className="w-4 h-4 mr-2" />
                                {isGenerating ? 'Generating...' : 'SEO Meta'}
                            </Button>

                            <Button
                                onClick={() => generatePageContent('features')}
                                disabled={isGenerating || !productName}
                                className="flex items-center"
                            >
                                <FileText className="w-4 h-4 mr-2" />
                                {isGenerating ? 'Generating...' : 'Features List'}
                            </Button>

                            <Button
                                onClick={() => generatePageContent('specifications')}
                                disabled={isGenerating || !productName}
                                className="flex items-center"
                            >
                                <RefreshCw className="w-4 h-4 mr-2" />
                                {isGenerating ? 'Generating...' : 'Specifications'}
                            </Button>

                            <Button
                                onClick={() => generatePageContent('faq')}
                                disabled={isGenerating || !productName}
                                className="flex items-center"
                            >
                                <Badge className="w-4 h-4 mr-2" />
                                {isGenerating ? 'Generating...' : 'FAQ Section'}
                            </Button>
                        </div>

                        <div className="space-y-2">
                            <Label>Generated SEO Content:</Label>
                            <Textarea
                                value={generatedContent}
                                onChange={(e) => setGeneratedContent(e.target.value)}
                                placeholder="Generated SEO content will appear here..."
                                rows={8}
                            />
                            {generatedContent && (
                                <div className="flex space-x-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => copyToClipboard(generatedContent)}
                                    >
                                        <Copy className="w-4 h-4 mr-2" />
                                        Copy
                                    </Button>
                                </div>
                            )}
                        </div>
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
}