'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Plus, Minus, FileText, Clock } from 'lucide-react';

interface Product {
    id: string;
    name: string;
    sku: string;
    price: number;
    description?: string;
}

interface Quote {
    id: string;
    quoteNumber: string;
    customerName: string;
    customerEmail: string;
    status: string;
    quotedAmount?: number;
    validUntil?: string;
    createdAt: string;
    items: Array<{
        quantity: number;
        product: {
            name: string;
            sku: string;
            price: number;
        };
    }>;
}

export default function QuotePage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [quotes, setQuotes] = useState<Quote[]>([]);
    const [loading, setLoading] = useState(true);
    const [requestOpen, setRequestOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Form state
    const [customerName, setCustomerName] = useState('');
    const [customerEmail, setCustomerEmail] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');
    const [companyName, setCompanyName] = useState('');
    const [message, setMessage] = useState('');
    const [selectedItems, setSelectedItems] = useState<Array<{ productId: string; quantity: number }>>([]);
    const [searchTerm, setSearchTerm] = useState('');

    const { toast } = useToast();

    useEffect(() => {
        fetchProducts();
        fetchQuotes();
    }, []);

    const fetchProducts = async () => {
        try {
            const response = await fetch('/api/v1/products?page=1&limit=100');
            const data = await response.json();

            if (data.success) {
                setProducts(data.data.products);
            }
        } catch (error) {
            console.error('Failed to fetch products:', error);
        }
    };

    const fetchQuotes = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');

            // Try authenticated request first
            let url = '/api/v1/quotes?page=1&limit=50';
            const headers: HeadersInit = {};

            if (token) {
                headers.Authorization = `Bearer ${token}`;
            }

            const response = await fetch(url, { headers });
            const data = await response.json();

            if (data.success) {
                setQuotes(data.data.quotes);
            }
        } catch (error) {
            console.error('Failed to fetch quotes:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddItem = (productId: string) => {
        setSelectedItems([...selectedItems, { productId, quantity: 1 }]);
    };

    const handleRemoveItem = (productId: string) => {
        setSelectedItems(selectedItems.filter((item) => item.productId !== productId));
    };

    const handleQuantityChange = (productId: string, quantity: number) => {
        if (quantity < 1) return;
        setSelectedItems(
            selectedItems.map((item) =>
                item.productId === productId ? { ...item, quantity } : item
            )
        );
    };

    const handleSubmit = async () => {
        // Validation
        if (!customerName.trim()) {
            toast({
                title: 'Validation Error',
                description: 'Please enter your name',
                variant: 'destructive',
            });
            return;
        }

        if (!customerEmail.trim() || !customerEmail.includes('@')) {
            toast({
                title: 'Validation Error',
                description: 'Please enter a valid email',
                variant: 'destructive',
            });
            return;
        }

        if (!customerPhone.trim()) {
            toast({
                title: 'Validation Error',
                description: 'Please enter your phone number',
                variant: 'destructive',
            });
            return;
        }

        if (selectedItems.length === 0) {
            toast({
                title: 'Validation Error',
                description: 'Please select at least one product',
                variant: 'destructive',
            });
            return;
        }

        try {
            setSubmitting(true);
            const token = localStorage.getItem('token');

            const headers: HeadersInit = {
                'Content-Type': 'application/json',
            };

            if (token) {
                headers.Authorization = `Bearer ${token}`;
            }

            const response = await fetch('/api/v1/quotes', {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    customerName,
                    customerEmail,
                    customerPhone,
                    companyName: companyName || undefined,
                    message: message || undefined,
                    items: selectedItems,
                }),
            });

            const data = await response.json();

            if (data.success) {
                toast({
                    title: 'Success',
                    description: `Quote request submitted! Quote #: ${data.data.quoteNumber}`,
                });

                // Reset form
                setCustomerName('');
                setCustomerEmail('');
                setCustomerPhone('');
                setCompanyName('');
                setMessage('');
                setSelectedItems([]);
                setRequestOpen(false);

                // Refresh quotes
                fetchQuotes();
            } else {
                toast({
                    title: 'Error',
                    description: data.error || 'Failed to submit quote request',
                    variant: 'destructive',
                });
            }
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to submit quote request',
                variant: 'destructive',
            });
        } finally {
            setSubmitting(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PENDING':
                return 'bg-yellow-100 text-yellow-800';
            case 'QUOTED':
                return 'bg-blue-100 text-blue-800';
            case 'ACCEPTED':
                return 'bg-green-100 text-green-800';
            case 'REJECTED':
                return 'bg-red-100 text-red-800';
            case 'EXPIRED':
                return 'bg-gray-100 text-gray-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const filteredProducts = products.filter((product) =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.sku.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const calculateTotal = () => {
        return selectedItems.reduce((sum, item) => {
            const product = products.find((p) => p.id === item.productId);
            return sum + (product ? product.price * item.quantity : 0);
        }, 0);
    };

    const calculateQuoteTotal = (quote: Quote) => {
        if (quote.quotedAmount) return quote.quotedAmount;
        return quote.items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
    };

    return (
        <div className="container mx-auto py-8 px-4">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Request a Quote</h1>
                <p className="text-muted-foreground">
                    Need a custom quote for bulk orders or special pricing? Submit your request below.
                </p>
            </div>

            {/* Request Quote Button */}
            <Card className="mb-8">
                <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="font-semibold mb-1">Get Custom Pricing</h3>
                            <p className="text-sm text-muted-foreground">
                                Submit a quote request for bulk orders, corporate purchases, or special requirements
                            </p>
                        </div>
                        <Button onClick={() => setRequestOpen(true)} size="lg">
                            <FileText className="mr-2 h-4 w-4" />
                            Request Quote
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* My Quotes */}
            <Card>
                <CardHeader>
                    <CardTitle>My Quote Requests</CardTitle>
                    <CardDescription>Track the status of your quote requests</CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="text-center py-8 text-muted-foreground">Loading quotes...</div>
                    ) : quotes.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                            <FileText className="mx-auto h-12 w-12 mb-4 opacity-20" />
                            <p>No quote requests yet</p>
                            <p className="text-sm mt-2">Click "Request Quote" above to get started</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {quotes.map((quote) => (
                                <div
                                    key={quote.id}
                                    className="border rounded-lg p-4 hover:bg-accent/50 transition-colors"
                                >
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="font-semibold">{quote.quoteNumber}</h3>
                                                <Badge className={getStatusColor(quote.status)}>
                                                    {quote.status}
                                                </Badge>
                                            </div>
                                            <div className="text-sm text-muted-foreground">
                                                {quote.items.length} item{quote.items.length !== 1 ? 's' : ''} • Submitted {new Date(quote.createdAt).toLocaleDateString()}
                                            </div>
                                        </div>

                                        <div className="text-right">
                                            <div className="font-semibold text-lg">
                                                ₹{calculateQuoteTotal(quote).toFixed(2)}
                                            </div>
                                            {quote.validUntil && (
                                                <div className="text-xs text-muted-foreground flex items-center gap-1">
                                                    <Clock className="h-3 w-3" />
                                                    Valid until {new Date(quote.validUntil).toLocaleDateString()}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Items List */}
                                    <div className="border-t pt-3 mt-3">
                                        <div className="space-y-2">
                                            {quote.items.map((item, index) => (
                                                <div key={index} className="flex justify-between text-sm">
                                                    <span className="text-muted-foreground">
                                                        {item.product.name} (x{item.quantity})
                                                    </span>
                                                    <span>₹{(item.product.price * item.quantity).toFixed(2)}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Status Message */}
                                    {quote.status === 'PENDING' && (
                                        <div className="mt-3 text-sm text-muted-foreground">
                                            Your quote request is being reviewed. We'll get back to you soon!
                                        </div>
                                    )}
                                    {quote.status === 'QUOTED' && (
                                        <div className="mt-3 text-sm text-blue-600">
                                            We've sent you a custom quote! Check your email for details.
                                        </div>
                                    )}
                                    {quote.status === 'ACCEPTED' && (
                                        <div className="mt-3 text-sm text-green-600">
                                            Quote accepted! We'll process your order shortly.
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Request Quote Dialog */}
            <Dialog open={requestOpen} onOpenChange={setRequestOpen}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Request a Quote</DialogTitle>
                        <DialogDescription>
                            Fill in your details and select the products you're interested in
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-6">
                        {/* Contact Information */}
                        <div>
                            <h3 className="font-semibold mb-3">Contact Information</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label>Name *</Label>
                                    <Input
                                        value={customerName}
                                        onChange={(e) => setCustomerName(e.target.value)}
                                        placeholder="Your full name"
                                    />
                                </div>
                                <div>
                                    <Label>Email *</Label>
                                    <Input
                                        type="email"
                                        value={customerEmail}
                                        onChange={(e) => setCustomerEmail(e.target.value)}
                                        placeholder="your@email.com"
                                    />
                                </div>
                                <div>
                                    <Label>Phone *</Label>
                                    <Input
                                        value={customerPhone}
                                        onChange={(e) => setCustomerPhone(e.target.value)}
                                        placeholder="+91 1234567890"
                                    />
                                </div>
                                <div>
                                    <Label>Company Name (Optional)</Label>
                                    <Input
                                        value={companyName}
                                        onChange={(e) => setCompanyName(e.target.value)}
                                        placeholder="Your company"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Product Selection */}
                        <div>
                            <h3 className="font-semibold mb-3">Select Products</h3>

                            {/* Search */}
                            <Input
                                placeholder="Search products..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="mb-3"
                            />

                            {/* Product List */}
                            <div className="border rounded-lg max-h-[300px] overflow-y-auto">
                                {filteredProducts.map((product) => {
                                    const selectedItem = selectedItems.find((item) => item.productId === product.id);

                                    return (
                                        <div
                                            key={product.id}
                                            className="border-b last:border-b-0 p-3 flex justify-between items-center hover:bg-accent/50"
                                        >
                                            <div className="flex-1">
                                                <p className="font-medium">{product.name}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    SKU: {product.sku} • ₹{product.price.toFixed(2)}
                                                </p>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                {selectedItem ? (
                                                    <>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => handleQuantityChange(product.id, selectedItem.quantity - 1)}
                                                        >
                                                            <Minus className="h-4 w-4" />
                                                        </Button>
                                                        <span className="w-12 text-center font-medium">
                                                            {selectedItem.quantity}
                                                        </span>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => handleQuantityChange(product.id, selectedItem.quantity + 1)}
                                                        >
                                                            <Plus className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="destructive"
                                                            onClick={() => handleRemoveItem(product.id)}
                                                        >
                                                            Remove
                                                        </Button>
                                                    </>
                                                ) : (
                                                    <Button size="sm" onClick={() => handleAddItem(product.id)}>
                                                        Add
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Selected Items Summary */}
                            {selectedItems.length > 0 && (
                                <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                    <p className="text-sm font-medium text-blue-900 mb-2">
                                        Selected Items ({selectedItems.length}):
                                    </p>
                                    <div className="space-y-1">
                                        {selectedItems.map((item) => {
                                            const product = products.find((p) => p.id === item.productId);
                                            return product ? (
                                                <div key={item.productId} className="text-sm text-blue-800 flex justify-between">
                                                    <span>{product.name} (x{item.quantity})</span>
                                                    <span>₹{(product.price * item.quantity).toFixed(2)}</span>
                                                </div>
                                            ) : null;
                                        })}
                                    </div>
                                    <div className="border-t border-blue-300 mt-2 pt-2 flex justify-between font-semibold text-blue-900">
                                        <span>Estimated Total:</span>
                                        <span>₹{calculateTotal().toFixed(2)}</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Additional Message */}
                        <div>
                            <Label>Additional Details (Optional)</Label>
                            <Textarea
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Any specific requirements, questions, or details about your order..."
                                rows={4}
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setRequestOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleSubmit} disabled={submitting}>
                            {submitting ? 'Submitting...' : 'Submit Quote Request'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
