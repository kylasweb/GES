'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { Search, Eye, CreditCard, History } from 'lucide-react';

interface GiftCard {
    id: string;
    code: string;
    initialAmount: number;
    currentBalance: number;
    status: string;
    expiresAt: string;
    createdAt: string;
    userId?: string;
    recipientEmail?: string;
    recipientName?: string;
    senderName?: string;
    message?: string;
    user?: {
        name: string;
        email: string;
    };
    transactions: Array<{
        id: string;
        amount: number;
        type: string;
        orderId?: string;
        createdAt: string;
    }>;
}

export default function AdminGiftCardsPage() {
    const [giftCards, setGiftCards] = useState<GiftCard[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [selectedCard, setSelectedCard] = useState<GiftCard | null>(null);
    const [detailsOpen, setDetailsOpen] = useState(false);
    const [updateOpen, setUpdateOpen] = useState(false);
    const [status, setStatus] = useState('');
    const [updating, setUpdating] = useState(false);

    const { toast } = useToast();

    useEffect(() => {
        fetchGiftCards();
    }, [statusFilter]);

    const fetchGiftCards = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');

            let url = '/api/v1/admin/gift-cards?page=1&limit=100';
            if (statusFilter !== 'ALL') {
                url += `&status=${statusFilter}`;
            }

            const response = await fetch(url, {
                headers: { Authorization: `Bearer ${token}` },
            });

            const data = await response.json();

            if (data.success) {
                setGiftCards(data.data.giftCards);
            } else {
                toast({
                    title: 'Error',
                    description: data.error || 'Failed to fetch gift cards',
                    variant: 'destructive',
                });
            }
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to fetch gift cards',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleViewDetails = (card: GiftCard) => {
        setSelectedCard(card);
        setDetailsOpen(true);
    };

    const handleOpenUpdate = (card: GiftCard) => {
        setSelectedCard(card);
        setStatus(card.status);
        setUpdateOpen(true);
    };

    const handleUpdate = async () => {
        if (!selectedCard) return;

        try {
            setUpdating(true);
            const token = localStorage.getItem('token');

            const response = await fetch(`/api/v1/admin/gift-cards?id=${selectedCard.id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ status }),
            });

            const data = await response.json();

            if (data.success) {
                toast({
                    title: 'Success',
                    description: 'Gift card updated successfully',
                });
                setUpdateOpen(false);
                fetchGiftCards();
            } else {
                toast({
                    title: 'Error',
                    description: data.error || 'Failed to update gift card',
                    variant: 'destructive',
                });
            }
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to update gift card',
                variant: 'destructive',
            });
        } finally {
            setUpdating(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'ACTIVE':
                return 'bg-green-100 text-green-800';
            case 'USED':
                return 'bg-blue-100 text-blue-800';
            case 'EXPIRED':
                return 'bg-gray-100 text-gray-800';
            case 'CANCELLED':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getTransactionTypeColor = (type: string) => {
        return type === 'PURCHASE' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800';
    };

    const filteredCards = giftCards.filter((card) => {
        const searchLower = searchTerm.toLowerCase();
        return (
            card.code.toLowerCase().includes(searchLower) ||
            (card.recipientEmail && card.recipientEmail.toLowerCase().includes(searchLower)) ||
            (card.recipientName && card.recipientName.toLowerCase().includes(searchLower)) ||
            (card.senderName && card.senderName.toLowerCase().includes(searchLower))
        );
    });

    if (loading) {
        return (
            <div className="container mx-auto py-8 px-4">
                <div className="text-center py-20">Loading gift cards...</div>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-8 px-4">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Gift Cards Management</h1>
                <p className="text-muted-foreground">Manage and track all gift cards</p>
            </div>

            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-4 mb-6">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Total Cards</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{giftCards.length}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Active</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">
                            {giftCards.filter((c) => c.status === 'ACTIVE').length}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Total Value</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            ₹{giftCards.reduce((sum, c) => sum + c.currentBalance, 0).toLocaleString()}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Used/Expired</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-gray-600">
                            {giftCards.filter((c) => c.status === 'USED' || c.status === 'EXPIRED').length}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <Card className="mb-6">
                <CardContent className="pt-6">
                    <div className="flex gap-4 flex-wrap">
                        <div className="flex-1 min-w-[200px]">
                            <div className="relative">
                                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search by code, recipient, sender..."
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
                                <SelectItem value="ACTIVE">Active</SelectItem>
                                <SelectItem value="USED">Used</SelectItem>
                                <SelectItem value="EXPIRED">Expired</SelectItem>
                                <SelectItem value="CANCELLED">Cancelled</SelectItem>
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

            {/* Gift Cards List */}
            <Card>
                <CardHeader>
                    <CardTitle>Gift Cards ({filteredCards.length})</CardTitle>
                    <CardDescription>All gift card purchases and their transaction history</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {filteredCards.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground">
                                No gift cards found
                            </div>
                        ) : (
                            filteredCards.map((card) => (
                                <div
                                    key={card.id}
                                    className="border rounded-lg p-4 hover:bg-accent/50 transition-colors"
                                >
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <CreditCard className="h-4 w-4 text-muted-foreground" />
                                                <span className="font-mono font-semibold">{card.code}</span>
                                                <Badge className={getStatusColor(card.status)}>
                                                    {card.status}
                                                </Badge>
                                            </div>
                                            <div className="text-sm text-muted-foreground">
                                                {card.senderName && `From: ${card.senderName}`}
                                                {card.recipientName && ` • To: ${card.recipientName}`}
                                            </div>
                                            {card.recipientEmail && (
                                                <div className="text-sm text-muted-foreground">
                                                    {card.recipientEmail}
                                                </div>
                                            )}
                                        </div>

                                        <div className="text-right">
                                            <div className="font-semibold text-lg">
                                                ₹{card.currentBalance.toFixed(2)}
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                                of ₹{card.initialAmount.toFixed(2)}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex gap-2 text-xs text-muted-foreground mb-3">
                                        <span>Created: {new Date(card.createdAt).toLocaleDateString()}</span>
                                        <span>•</span>
                                        <span>Expires: {new Date(card.expiresAt).toLocaleDateString()}</span>
                                        {card.transactions.length > 0 && (
                                            <>
                                                <span>•</span>
                                                <span>{card.transactions.length} transaction(s)</span>
                                            </>
                                        )}
                                    </div>

                                    <div className="flex gap-2">
                                        <Button variant="outline" size="sm" onClick={() => handleViewDetails(card)}>
                                            <Eye className="mr-2 h-4 w-4" />
                                            View Details
                                        </Button>

                                        <Button variant="outline" size="sm" onClick={() => handleOpenUpdate(card)}>
                                            Update Status
                                        </Button>
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
                        <DialogTitle>Gift Card Details</DialogTitle>
                        <DialogDescription>Complete gift card information</DialogDescription>
                    </DialogHeader>

                    {selectedCard && (
                        <div className="space-y-6">
                            {/* Basic Info */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-muted-foreground">Card Code</p>
                                    <p className="font-mono font-semibold">{selectedCard.code}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Status</p>
                                    <Badge className={getStatusColor(selectedCard.status)}>
                                        {selectedCard.status}
                                    </Badge>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Initial Amount</p>
                                    <p className="font-semibold">₹{selectedCard.initialAmount.toFixed(2)}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Current Balance</p>
                                    <p className="font-semibold text-lg">₹{selectedCard.currentBalance.toFixed(2)}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Created</p>
                                    <p>{new Date(selectedCard.createdAt).toLocaleString()}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Expires</p>
                                    <p>{new Date(selectedCard.expiresAt).toLocaleDateString()}</p>
                                </div>
                            </div>

                            {/* Gift Details */}
                            {(selectedCard.senderName || selectedCard.recipientName || selectedCard.message) && (
                                <div className="border-t pt-4">
                                    <h3 className="font-semibold mb-3">Gift Details</h3>
                                    <div className="space-y-2">
                                        {selectedCard.senderName && (
                                            <div>
                                                <p className="text-sm text-muted-foreground">From</p>
                                                <p>{selectedCard.senderName}</p>
                                            </div>
                                        )}
                                        {selectedCard.recipientName && (
                                            <div>
                                                <p className="text-sm text-muted-foreground">To</p>
                                                <p>{selectedCard.recipientName}</p>
                                            </div>
                                        )}
                                        {selectedCard.recipientEmail && (
                                            <div>
                                                <p className="text-sm text-muted-foreground">Recipient Email</p>
                                                <p>{selectedCard.recipientEmail}</p>
                                            </div>
                                        )}
                                        {selectedCard.message && (
                                            <div>
                                                <p className="text-sm text-muted-foreground">Message</p>
                                                <p className="text-sm italic">"{selectedCard.message}"</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Transaction History */}
                            {selectedCard.transactions.length > 0 && (
                                <div className="border-t pt-4">
                                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                                        <History className="h-4 w-4" />
                                        Transaction History
                                    </h3>
                                    <div className="border rounded-lg divide-y">
                                        {selectedCard.transactions.map((transaction) => (
                                            <div key={transaction.id} className="p-3 flex justify-between items-center">
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <Badge className={getTransactionTypeColor(transaction.type)}>
                                                            {transaction.type}
                                                        </Badge>
                                                        {transaction.orderId && (
                                                            <span className="text-xs text-muted-foreground">
                                                                Order #{transaction.orderId}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-xs text-muted-foreground mt-1">
                                                        {new Date(transaction.createdAt).toLocaleString()}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <p className={`font-semibold ${transaction.type === 'PURCHASE' ? 'text-green-600' : 'text-orange-600'}`}>
                                                        {transaction.type === 'PURCHASE' ? '+' : '-'}₹{transaction.amount.toFixed(2)}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Update Status Dialog */}
            <Dialog open={updateOpen} onOpenChange={setUpdateOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Update Gift Card Status</DialogTitle>
                        <DialogDescription>
                            Change the status of gift card {selectedCard?.code}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        <div>
                            <Select value={status} onValueChange={setStatus}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ACTIVE">Active</SelectItem>
                                    <SelectItem value="USED">Used</SelectItem>
                                    <SelectItem value="EXPIRED">Expired</SelectItem>
                                    <SelectItem value="CANCELLED">Cancelled</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                            <p className="text-sm text-amber-900">
                                <strong>Note:</strong> Changing the status to CANCELLED or EXPIRED will prevent this card from being used.
                            </p>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setUpdateOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleUpdate} disabled={updating}>
                            {updating ? 'Updating...' : 'Update Status'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
