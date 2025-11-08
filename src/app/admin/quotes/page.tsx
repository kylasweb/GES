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
import { Search, Eye, Edit, CheckCircle, XCircle, FileText } from 'lucide-react';

interface Quote {
    id: string;
    quoteNumber: string;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    companyName?: string;
    status: string;
    quotedAmount?: number;
    validUntil?: string;
    adminNotes?: string;
    createdAt: string;
    user?: {
        name: string;
        email: string;
    };
    items: Array<{
        id: string;
        quantity: number;
        product: {
            id: string;
            name: string;
            sku: string;
            price: number;
        };
    }>;
    convertedToOrderId?: string;
}

export default function AdminQuotesPage() {
    const [quotes, setQuotes] = useState<Quote[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);
    const [detailsOpen, setDetailsOpen] = useState(false);
    const [updateOpen, setUpdateOpen] = useState(false);
    const [convertOpen, setConvertOpen] = useState(false);

    // Update form state
    const [status, setStatus] = useState('');
    const [quotedAmount, setQuotedAmount] = useState('');
    const [validUntil, setValidUntil] = useState('');
    const [adminNotes, setAdminNotes] = useState('');
    const [updating, setUpdating] = useState(false);
    const [converting, setConverting] = useState(false);

    const { toast } = useToast();

    useEffect(() => {
        fetchQuotes();
    }, [statusFilter]);

    const fetchQuotes = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');

            let url = '/api/v1/quotes?page=1&limit=100';
            if (statusFilter !== 'ALL') {
                url += `&status=${statusFilter}`;
            }

            const response = await fetch(url, {
                headers: { Authorization: `Bearer ${token}` },
            });

            const data = await response.json();

            if (data.success) {
                setQuotes(data.data.quotes);
            } else {
                toast({
                    title: 'Error',
                    description: data.error || 'Failed to fetch quotes',
                    variant: 'destructive',
                });
            }
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to fetch quotes',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleViewDetails = (quote: Quote) => {
        setSelectedQuote(quote);
        setDetailsOpen(true);
    };

    const handleOpenUpdate = (quote: Quote) => {
        setSelectedQuote(quote);
        setStatus(quote.status);
        setQuotedAmount(quote.quotedAmount?.toString() || '');
        setValidUntil(quote.validUntil ? new Date(quote.validUntil).toISOString().split('T')[0] : '');
        setAdminNotes(quote.adminNotes || '');
        setUpdateOpen(true);
    };

    const handleOpenConvert = (quote: Quote) => {
        setSelectedQuote(quote);
        setConvertOpen(true);
    };

    const handleUpdate = async () => {
        if (!selectedQuote) return;

        try {
            setUpdating(true);
            const token = localStorage.getItem('token');

            const response = await fetch(`/api/v1/quotes/${selectedQuote.id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    status,
                    quotedAmount: quotedAmount ? parseFloat(quotedAmount) : undefined,
                    validUntil: validUntil || undefined,
                    adminNotes: adminNotes || undefined,
                }),
            });

            const data = await response.json();

            if (data.success) {
                toast({
                    title: 'Success',
                    description: 'Quote updated successfully',
                });
                setUpdateOpen(false);
                fetchQuotes();
            } else {
                toast({
                    title: 'Error',
                    description: data.error || 'Failed to update quote',
                    variant: 'destructive',
                });
            }
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to update quote',
                variant: 'destructive',
            });
        } finally {
            setUpdating(false);
        }
    };

    const handleConvert = async () => {
        if (!selectedQuote) return;

        try {
            setConverting(true);
            const token = localStorage.getItem('token');

            const response = await fetch(`/api/v1/quotes/${selectedQuote.id}/convert`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const data = await response.json();

            if (data.success) {
                toast({
                    title: 'Success',
                    description: `Quote converted to order ${data.data.orderNumber}`,
                });
                setConvertOpen(false);
                fetchQuotes();
            } else {
                toast({
                    title: 'Error',
                    description: data.error || 'Failed to convert quote',
                    variant: 'destructive',
                });
            }
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to convert quote',
                variant: 'destructive',
            });
        } finally {
            setConverting(false);
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

    const filteredQuotes = quotes.filter((quote) => {
        const searchLower = searchTerm.toLowerCase();
        return (
            quote.quoteNumber.toLowerCase().includes(searchLower) ||
            quote.customerName.toLowerCase().includes(searchLower) ||
            quote.customerEmail.toLowerCase().includes(searchLower) ||
            (quote.companyName && quote.companyName.toLowerCase().includes(searchLower)) ||
            (quote.user && quote.user.name.toLowerCase().includes(searchLower))
        );
    });

    const calculateTotal = (quote: Quote) => {
        return quote.items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
    };

    if (loading) {
        return (
            <div className="container mx-auto py-8 px-4">
                <div className="text-center py-20">Loading quotes...</div>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-8 px-4">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Quotes Management</h1>
                <p className="text-muted-foreground">Manage customer quote requests and convert to orders</p>
            </div>

            {/* Filters */}
            <Card className="mb-6">
                <CardContent className="pt-6">
                    <div className="flex gap-4 flex-wrap">
                        <div className="flex-1 min-w-[200px]">
                            <div className="relative">
                                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search by quote #, customer, company..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-9"
                                />
                            </div>
                        </div>

                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">All Status</SelectItem>
                                <SelectItem value="PENDING">Pending</SelectItem>
                                <SelectItem value="QUOTED">Quoted</SelectItem>
                                <SelectItem value="ACCEPTED">Accepted</SelectItem>
                                <SelectItem value="REJECTED">Rejected</SelectItem>
                                <SelectItem value="EXPIRED">Expired</SelectItem>
                            </SelectContent>
                        </Select>

                        {searchTerm && (
                            <Button variant="outline" onClick={() => setSearchTerm('')}>
                                Clear Search
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Quotes List */}
            <Card>
                <CardHeader>
                    <CardTitle>Quotes ({filteredQuotes.length})</CardTitle>
                    <CardDescription>Review and manage customer quote requests</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {filteredQuotes.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground">
                                No quotes found
                            </div>
                        ) : (
                            filteredQuotes.map((quote) => (
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
                                                {quote.convertedToOrderId && (
                                                    <Badge variant="outline" className="bg-purple-50 text-purple-700">
                                                        Converted
                                                    </Badge>
                                                )}
                                            </div>
                                            <div className="text-sm text-muted-foreground">
                                                {quote.customerName} ({quote.customerEmail})
                                                {quote.companyName && ` • ${quote.companyName}`}
                                            </div>
                                        </div>

                                        <div className="text-right">
                                            <div className="font-semibold">
                                                {quote.quotedAmount ? `₹${quote.quotedAmount.toFixed(2)}` : `₹${calculateTotal(quote).toFixed(2)}`}
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                                {quote.items.length} item{quote.items.length !== 1 ? 's' : ''}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex gap-2 text-xs text-muted-foreground mb-3">
                                        <span>Created: {new Date(quote.createdAt).toLocaleDateString()}</span>
                                        {quote.validUntil && (
                                            <>
                                                <span>•</span>
                                                <span>Valid until: {new Date(quote.validUntil).toLocaleDateString()}</span>
                                            </>
                                        )}
                                    </div>

                                    <div className="flex gap-2">
                                        <Button variant="outline" size="sm" onClick={() => handleViewDetails(quote)}>
                                            <Eye className="mr-2 h-4 w-4" />
                                            View Details
                                        </Button>

                                        <Button variant="outline" size="sm" onClick={() => handleOpenUpdate(quote)}>
                                            <Edit className="mr-2 h-4 w-4" />
                                            Update
                                        </Button>

                                        {quote.status === 'ACCEPTED' && !quote.convertedToOrderId && (
                                            <Button size="sm" onClick={() => handleOpenConvert(quote)}>
                                                <CheckCircle className="mr-2 h-4 w-4" />
                                                Convert to Order
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Details Dialog */}
            <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Quote Details</DialogTitle>
                        <DialogDescription>Complete quote information</DialogDescription>
                    </DialogHeader>

                    {selectedQuote && (
                        <div className="space-y-6">
                            {/* Basic Info */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-muted-foreground">Quote Number</Label>
                                    <p className="font-medium">{selectedQuote.quoteNumber}</p>
                                </div>
                                <div>
                                    <Label className="text-muted-foreground">Status</Label>
                                    <div>
                                        <Badge className={getStatusColor(selectedQuote.status)}>
                                            {selectedQuote.status}
                                        </Badge>
                                    </div>
                                </div>
                                <div>
                                    <Label className="text-muted-foreground">Customer Name</Label>
                                    <p className="font-medium">{selectedQuote.customerName}</p>
                                </div>
                                <div>
                                    <Label className="text-muted-foreground">Email</Label>
                                    <p className="font-medium">{selectedQuote.customerEmail}</p>
                                </div>
                                <div>
                                    <Label className="text-muted-foreground">Phone</Label>
                                    <p className="font-medium">{selectedQuote.customerPhone}</p>
                                </div>
                                {selectedQuote.companyName && (
                                    <div>
                                        <Label className="text-muted-foreground">Company</Label>
                                        <p className="font-medium">{selectedQuote.companyName}</p>
                                    </div>
                                )}
                                <div>
                                    <Label className="text-muted-foreground">Created</Label>
                                    <p className="font-medium">{new Date(selectedQuote.createdAt).toLocaleString()}</p>
                                </div>
                                {selectedQuote.validUntil && (
                                    <div>
                                        <Label className="text-muted-foreground">Valid Until</Label>
                                        <p className="font-medium">{new Date(selectedQuote.validUntil).toLocaleDateString()}</p>
                                    </div>
                                )}
                            </div>

                            {/* Items */}
                            <div>
                                <Label className="text-muted-foreground mb-2 block">Requested Items</Label>
                                <div className="border rounded-lg divide-y">
                                    {selectedQuote.items.map((item) => (
                                        <div key={item.id} className="p-3 flex justify-between">
                                            <div>
                                                <p className="font-medium">{item.product.name}</p>
                                                <p className="text-sm text-muted-foreground">SKU: {item.product.sku}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-medium">₹{item.product.price.toFixed(2)}</p>
                                                <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Pricing */}
                            <div className="border-t pt-4">
                                <div className="flex justify-between mb-2">
                                    <span className="text-muted-foreground">Subtotal:</span>
                                    <span className="font-medium">₹{calculateTotal(selectedQuote).toFixed(2)}</span>
                                </div>
                                {selectedQuote.quotedAmount && (
                                    <div className="flex justify-between text-lg font-bold">
                                        <span>Quoted Amount:</span>
                                        <span>₹{selectedQuote.quotedAmount.toFixed(2)}</span>
                                    </div>
                                )}
                            </div>

                            {/* Admin Notes */}
                            {selectedQuote.adminNotes && (
                                <div>
                                    <Label className="text-muted-foreground">Admin Notes</Label>
                                    <p className="mt-1 text-sm whitespace-pre-wrap">{selectedQuote.adminNotes}</p>
                                </div>
                            )}

                            {/* Converted Order */}
                            {selectedQuote.convertedToOrderId && (
                                <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                                    <p className="text-sm text-purple-900">
                                        <FileText className="inline mr-2 h-4 w-4" />
                                        This quote has been converted to an order
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Update Dialog */}
            <Dialog open={updateOpen} onOpenChange={setUpdateOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Update Quote</DialogTitle>
                        <DialogDescription>
                            Update quote status and pricing for {selectedQuote?.quoteNumber}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        <div>
                            <Label>Status</Label>
                            <Select value={status} onValueChange={setStatus}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="PENDING">Pending</SelectItem>
                                    <SelectItem value="QUOTED">Quoted</SelectItem>
                                    <SelectItem value="ACCEPTED">Accepted</SelectItem>
                                    <SelectItem value="REJECTED">Rejected</SelectItem>
                                    <SelectItem value="EXPIRED">Expired</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label>Quoted Amount (₹)</Label>
                            <Input
                                type="text"
                                value={quotedAmount}
                                onChange={(e) => setQuotedAmount(e.target.value)}
                                placeholder="Enter custom quote amount"
                            />
                        </div>

                        <div>
                            <Label>Valid Until</Label>
                            <Input
                                type="date"
                                value={validUntil}
                                onChange={(e) => setValidUntil(e.target.value)}
                            />
                        </div>

                        <div>
                            <Label>Admin Notes</Label>
                            <Textarea
                                value={adminNotes}
                                onChange={(e) => setAdminNotes(e.target.value)}
                                placeholder="Internal notes about this quote..."
                                rows={3}
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setUpdateOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleUpdate} disabled={updating}>
                            {updating ? 'Updating...' : 'Update Quote'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Convert Dialog */}
            <Dialog open={convertOpen} onOpenChange={setConvertOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Convert to Order</DialogTitle>
                        <DialogDescription>
                            Convert this quote into an order for {selectedQuote?.customerName}
                        </DialogDescription>
                    </DialogHeader>

                    {selectedQuote && (
                        <div className="space-y-4">
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <p className="text-sm text-blue-900 mb-2">
                                    This will create a new order with:
                                </p>
                                <ul className="text-sm text-blue-800 space-y-1 ml-4">
                                    <li>• All items from the quote</li>
                                    <li>• Amount: ₹{(selectedQuote.quotedAmount || calculateTotal(selectedQuote)).toFixed(2)}</li>
                                    <li>• Status: PENDING (awaiting payment)</li>
                                </ul>
                            </div>

                            <p className="text-sm text-muted-foreground">
                                The customer will need to complete payment to finalize the order.
                            </p>
                        </div>
                    )}

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setConvertOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleConvert} disabled={converting}>
                            {converting ? 'Converting...' : 'Convert to Order'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
