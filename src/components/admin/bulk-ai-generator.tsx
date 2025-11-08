'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Upload, Download, Sparkles, AlertCircle, CheckCircle2, FileText, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface BulkProduct {
    name: string;
    industry: string;
    category?: string;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    error?: string;
    data?: any;
}

export function BulkAIGenerator() {
    const [products, setProducts] = useState<BulkProduct[]>([]);
    const [csvText, setCsvText] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [progress, setProgress] = useState(0);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.name.endsWith('.csv')) {
            toast.error('Please upload a CSV file');
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            const text = event.target?.result as string;
            setCsvText(text);
            parseCSV(text);
        };
        reader.readAsText(file);
    };

    const parseCSV = (text: string) => {
        const lines = text.trim().split('\n');
        if (lines.length < 2) {
            toast.error('CSV must have at least a header row and one data row');
            return;
        }

        const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
        const nameIndex = headers.findIndex(h => h.includes('name') || h.includes('product'));
        const industryIndex = headers.findIndex(h => h.includes('industry') || h.includes('category') || h.includes('type'));

        if (nameIndex === -1) {
            toast.error('CSV must have a "name" or "product" column');
            return;
        }

        const parsedProducts: BulkProduct[] = [];
        for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(',').map(v => v.trim());
            if (values[nameIndex]) {
                parsedProducts.push({
                    name: values[nameIndex],
                    industry: industryIndex !== -1 ? values[industryIndex] : 'renewable energy',
                    status: 'pending'
                });
            }
        }

        setProducts(parsedProducts);
        toast.success(`Loaded ${parsedProducts.length} products from CSV`);
    };

    const handleManualInput = () => {
        if (!csvText.trim()) {
            toast.error('Please enter product data');
            return;
        }
        parseCSV(csvText);
    };

    const generateSampleCSV = () => {
        const sample = `Product Name,Industry,Category
Solar Panel 400W,solar energy,solar-panels
Lithium Battery 5kWh,energy storage,batteries
Smart Inverter 3000W,solar energy,accessories
Wind Turbine 1kW,wind energy,solar-panels
Solar Water Heater,solar thermal,accessories`;

        const blob = new Blob([sample], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'bulk-products-sample.csv';
        a.click();
        window.URL.revokeObjectURL(url);
        toast.success('Sample CSV downloaded');
    };

    const generateAllProducts = async () => {
        if (products.length === 0) {
            toast.error('No products to generate');
            return;
        }

        setIsProcessing(true);
        setProgress(0);

        const updatedProducts = [...products];

        for (let i = 0; i < updatedProducts.length; i++) {
            const product = updatedProducts[i];

            // Update status to processing
            product.status = 'processing';
            setProducts([...updatedProducts]);

            try {
                // Call AI generation API
                const response = await fetch('/api/v1/admin/products/ai-generate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        productName: product.name,
                        industry: product.industry,
                        category: product.category
                    })
                });

                if (response.ok) {
                    const data = await response.json();
                    product.status = 'completed';
                    product.data = data;
                } else {
                    throw new Error('Generation failed');
                }
            } catch (error) {
                product.status = 'failed';
                product.error = 'Failed to generate product';
            }

            // Update progress
            setProgress(((i + 1) / updatedProducts.length) * 100);
            setProducts([...updatedProducts]);

            // Small delay to avoid rate limits
            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        setIsProcessing(false);

        const completed = updatedProducts.filter(p => p.status === 'completed').length;
        const failed = updatedProducts.filter(p => p.status === 'failed').length;

        toast.success(`Generation complete! ${completed} succeeded, ${failed} failed`);
    };

    const exportResults = () => {
        const completedProducts = products.filter(p => p.status === 'completed');
        if (completedProducts.length === 0) {
            toast.error('No completed products to export');
            return;
        }

        const jsonData = JSON.stringify(completedProducts.map(p => p.data), null, 2);
        const blob = new Blob([jsonData], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'bulk-generated-products.json';
        a.click();
        window.URL.revokeObjectURL(url);
        toast.success('Results exported');
    };

    const resetGenerator = () => {
        setProducts([]);
        setCsvText('');
        setProgress(0);
        setIsProcessing(false);
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-yellow-500" />
                        Bulk AI Product Generator
                    </CardTitle>
                    <CardDescription>
                        Upload a CSV file or paste data to generate multiple products at once using AI
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Upload Section */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <Label>Upload CSV File</Label>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={generateSampleCSV}
                                className="text-xs"
                            >
                                <Download className="h-3 w-3 mr-1" />
                                Download Sample
                            </Button>
                        </div>

                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                            <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                            <Input
                                type="file"
                                accept=".csv"
                                onChange={handleFileUpload}
                                disabled={isProcessing}
                                className="max-w-xs mx-auto"
                            />
                            <p className="text-sm text-gray-500 mt-2">
                                CSV must have columns: Product Name, Industry (optional)
                            </p>
                        </div>
                    </div>

                    {/* Manual Input */}
                    <div className="space-y-2">
                        <Label>Or Paste CSV Data</Label>
                        <Textarea
                            placeholder="Product Name,Industry&#10;Solar Panel 400W,solar energy&#10;Lithium Battery 5kWh,energy storage"
                            value={csvText}
                            onChange={(e) => setCsvText(e.target.value)}
                            disabled={isProcessing}
                            rows={6}
                            className="font-mono text-sm"
                        />
                        <Button
                            onClick={handleManualInput}
                            disabled={isProcessing || !csvText.trim()}
                            variant="outline"
                            size="sm"
                        >
                            <FileText className="h-4 w-4 mr-2" />
                            Parse Data
                        </Button>
                    </div>

                    {/* Products List */}
                    {products.length > 0 && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="font-semibold">Products Queue ({products.length})</h3>
                                <div className="flex gap-2">
                                    <Button
                                        onClick={generateAllProducts}
                                        disabled={isProcessing}
                                        className="bg-gradient-to-r from-purple-600 to-blue-600"
                                    >
                                        {isProcessing ? (
                                            <>
                                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                Generating...
                                            </>
                                        ) : (
                                            <>
                                                <Sparkles className="h-4 w-4 mr-2" />
                                                Generate All ({products.length})
                                            </>
                                        )}
                                    </Button>
                                    {!isProcessing && (
                                        <>
                                            <Button onClick={exportResults} variant="outline">
                                                <Download className="h-4 w-4 mr-2" />
                                                Export
                                            </Button>
                                            <Button onClick={resetGenerator} variant="outline">
                                                Reset
                                            </Button>
                                        </>
                                    )}
                                </div>
                            </div>

                            {isProcessing && (
                                <div className="space-y-2">
                                    <Progress value={progress} className="w-full" />
                                    <p className="text-sm text-gray-500 text-center">
                                        {Math.round(progress)}% Complete
                                    </p>
                                </div>
                            )}

                            <div className="max-h-96 overflow-y-auto space-y-2 border rounded-lg p-4">
                                {products.map((product, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                                    >
                                        <div className="flex-1">
                                            <p className="font-medium">{product.name}</p>
                                            <p className="text-sm text-gray-500">{product.industry}</p>
                                        </div>
                                        <div>
                                            {product.status === 'pending' && (
                                                <Badge variant="secondary">Pending</Badge>
                                            )}
                                            {product.status === 'processing' && (
                                                <Badge className="bg-blue-500">
                                                    <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                                                    Processing
                                                </Badge>
                                            )}
                                            {product.status === 'completed' && (
                                                <Badge className="bg-green-500">
                                                    <CheckCircle2 className="h-3 w-3 mr-1" />
                                                    Completed
                                                </Badge>
                                            )}
                                            {product.status === 'failed' && (
                                                <Badge variant="destructive">
                                                    <AlertCircle className="h-3 w-3 mr-1" />
                                                    Failed
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Instructions */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                            <AlertCircle className="h-4 w-4" />
                            How to use
                        </h4>
                        <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                            <li>Download the sample CSV to see the required format</li>
                            <li>Add your products with name and industry/category</li>
                            <li>Upload the CSV or paste the data directly</li>
                            <li>Click "Generate All" to start bulk generation</li>
                            <li>AI will generate full product details for each item</li>
                            <li>Export results as JSON and import into product form</li>
                        </ul>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
