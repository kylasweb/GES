'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Package, Eye, CheckCircle, XCircle, Truck, Search, Filter } from 'lucide-react';

interface Return {
    id: string;
    returnNumber: string;
    reason: string;
    description: string;
    status: string;
    refundAmount: number;
    refundMethod?: string;
    trackingCode?: string;
    adminNotes?: string;
    requestedAt: string;
    approvedAt?: string;
    completedAt?: string;
    order: {
        orderNumber: string;
        totalAmount: number;
    };
    user: {
        name: string;
        email: string;
    };
    items: Array<{
        orderItemId: string;
        quantity: number;
        reason: string;
    }>;
    images?: string[];
}

const statusColors: Record<string, string> = {
    PENDING: 'bg-yellow-500',
    APPROVED: 'bg-blue-500',
    IN_TRANSIT: 'bg-purple-500',
    RECEIVED: 'bg-indigo-500',
    COMPLETED: 'bg-green-500',
    REJECTED: 'bg-red-500',
    CANCELLED: 'bg-gray-500',
};

const statusLabels: Record<string, string> = {
    PENDING: 'Pending Review',
    APPROVED: 'Approved',
    IN_TRANSIT: 'In Transit',
    RECEIVED: 'Received',
    COMPLETED: 'Completed',
    REJECTED: 'Rejected',
    CANCELLED: 'Cancelled',
};

export default function AdminReturnsPage() {
    const [returns, setReturns] = useState<Return[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedReturn, setSelectedReturn] = useState<Return | null>(null);
    const [detailsOpen, setDetailsOpen] = useState(false);
    const [updateOpen, setUpdateOpen] = useState(false);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [statusFilter, setStatusFilter] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    // Update form state
    const [updateStatus, setUpdateStatus] = useState('');
    const [trackingCode, setTrackingCode] = useState('');
    const [refundMethod, setRefundMethod] = useState('');
    const [adminNotes, setAdminNotes] = useState('');
    const [updating, setUpdating] = useState(false);

    const { toast } = useToast();

    useEffect(() => {
        fetchReturns();
    }, [page, statusFilter]);

    const fetchReturns = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const params = new URLSearchParams({
                page: page.toString(),
                limit: '10',
            });

            if (statusFilter) params.append('status', statusFilter);

            const response = await fetch(`/api/v1/returns?${params}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            const data = await response.json();

            if (data.success) {
                setReturns(data.data);
                setTotalPages(data.pagination.totalPages);
            } else {
                toast({
                    title: 'Error',
                    description: data.error || 'Failed to fetch returns',
                    variant: 'destructive',
                });
            }
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to fetch returns',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    const openDetails = (returnItem: Return) => {
        setSelectedReturn(returnItem);
        setDetailsOpen(true);
    };

    const openUpdate = (returnItem: Return) => {
        setSelectedReturn(returnItem);
        setUpdateStatus(returnItem.status);
        setTrackingCode(returnItem.trackingCode || '');
        setRefundMethod(returnItem.refundMethod || '');
        setAdminNotes(returnItem.adminNotes || '');
        setUpdateOpen(true);
    };

    const handleUpdate = async () => {
        if (!selectedReturn) return;

        try {
            setUpdating(true);
            const token = localStorage.getItem('token');

            const response = await fetch(`/api/v1/returns/${selectedReturn.id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    status: updateStatus,
                    trackingCode: trackingCode || undefined,
                    refundMethod: refundMethod || undefined,
                    adminNotes: adminNotes || undefined,
                }),
            });

            const data = await response.json();

            if (data.success) {
                toast({
                    title: 'Success',
                    description: 'Return updated successfully',
                });
                setUpdateOpen(false);
                fetchReturns();
            } else {
                toast({
                    title: 'Error',
                    description: data.error || 'Failed to update return',
                    variant: 'destructive',
                });
            }
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to update return',
                variant: 'destructive',
            });
        } finally {
            setUpdating(false);
        }
    };

    const filteredReturns = returns.filter(ret => {
        if (!searchQuery) return true;
        const query = searchQuery.toLowerCase();
        return (
            ret.returnNumber.toLowerCase().includes(query) ||
            ret.order.orderNumber.toLowerCase().includes(query) ||
            ret.user.name.toLowerCase().includes(query) ||
            ret.user.email.toLowerCase().includes(query)
        );
    });

    return (
        <div className="container mx-auto py-8 px-4">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Returns Management</h1>
                <p className="text-muted-foreground">Manage customer return requests and refunds</p>
            </div>

            {/* Filters */}
            <Card className="mb-6">
                <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <Label htmlFor="search">Search</Label>
                            <div className="relative">
                                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="search"
                                    placeholder="Return #, Order #, Customer..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-9"
                                />
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="status">Status Filter</Label>
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger id="status">
                                    <SelectValue placeholder="All Statuses" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="">All Statuses</SelectItem>
                                    <SelectItem value="PENDING">Pending Review</SelectItem>
                                    <SelectItem value="APPROVED">Approved</SelectItem>
                                    <SelectItem value="IN_TRANSIT">In Transit</SelectItem>
                                    <SelectItem value="RECEIVED">Received</SelectItem>
                                    <SelectItem value="COMPLETED">Completed</SelectItem>
                                    <SelectItem value="REJECTED">Rejected</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex items-end">
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setStatusFilter('');
                                    setSearchQuery('');
                                }}
                            >
                                <Filter className="mr-2 h-4 w-4" />
                                Clear Filters
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Returns Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Return Requests</CardTitle>
                    <CardDescription>
                        {filteredReturns.length} return{filteredReturns.length !== 1 ? 's' : ''} found
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="text-center py-8">Loading...</div>
                    ) : filteredReturns.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            <Package className="mx-auto h-12 w-12 mb-4 opacity-50" />
                            <p>No returns found</p>
                        </div>
                    ) : (
                        <>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Return #</TableHead>
                                        <TableHead>Order #</TableHead>
                                        <TableHead>Customer</TableHead>
                                        <TableHead>Reason</TableHead>
                                        <TableHead>Refund Amount</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Requested</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredReturns.map((returnItem) => (
                                        <TableRow key={returnItem.id}>
                                            <TableCell className="font-medium">{returnItem.returnNumber}</TableCell>
                                            <TableCell>{returnItem.order.orderNumber}</TableCell>
                                            <TableCell>
                                                <div>
                                                    <div className="font-medium">{returnItem.user.name}</div>
                                                    <div className="text-sm text-muted-foreground">{returnItem.user.email}</div>
                                                </div>
                                            </TableCell>
                                            <TableCell>{returnItem.reason.replace(/_/g, ' ')}</TableCell>
                                            <TableCell>₹{returnItem.refundAmount.toFixed(2)}</TableCell>
                                            <TableCell>
                                                <Badge className={statusColors[returnItem.status]}>
                                                    {statusLabels[returnItem.status]}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                {new Date(returnItem.requestedAt).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex gap-2">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => openDetails(returnItem)}
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                    {returnItem.status === 'PENDING' && (
                                                        <Button
                                                            size="sm"
                                                            variant="default"
                                                            onClick={() => openUpdate(returnItem)}
                                                        >
                                                            <CheckCircle className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                    {['APPROVED', 'IN_TRANSIT', 'RECEIVED'].includes(returnItem.status) && (
                                                        <Button
                                                            size="sm"
                                                            variant="secondary"
                                                            onClick={() => openUpdate(returnItem)}
                                                        >
                                                            <Truck className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="flex justify-center gap-2 mt-6">
                                    <Button
                                        variant="outline"
                                        onClick={() => setPage(p => Math.max(1, p - 1))}
                                        disabled={page === 1}
                                    >
                                        Previous
                                    </Button>
                                    <span className="flex items-center px-4">
                                        Page {page} of {totalPages}
                                    </span>
                                    <Button
                                        variant="outline"
                                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                        disabled={page === totalPages}
                                    >
                                        Next
                                    </Button>
                                </div>
                            )}
                        </>
                    )}
                </CardContent>
            </Card>

            {/* Details Dialog */}
            <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Return Details - {selectedReturn?.returnNumber}</DialogTitle>
                        <DialogDescription>
                            View complete return information
                        </DialogDescription>
                    </DialogHeader>

                    {selectedReturn && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-muted-foreground">Order Number</Label>
                                    <p className="font-medium">{selectedReturn.order.orderNumber}</p>
                                </div>
                                <div>
                                    <Label className="text-muted-foreground">Status</Label>
                                    <Badge className={statusColors[selectedReturn.status]}>
                                        {statusLabels[selectedReturn.status]}
                                    </Badge>
                                </div>
                                <div>
                                    <Label className="text-muted-foreground">Customer</Label>
                                    <p className="font-medium">{selectedReturn.user.name}</p>
                                    <p className="text-sm text-muted-foreground">{selectedReturn.user.email}</p>
                                </div>
                                <div>
                                    <Label className="text-muted-foreground">Refund Amount</Label>
                                    <p className="font-medium">₹{selectedReturn.refundAmount.toFixed(2)}</p>
                                </div>
                            </div>

                            <div>
                                <Label className="text-muted-foreground">Return Reason</Label>
                                <p className="font-medium">{selectedReturn.reason.replace(/_/g, ' ')}</p>
                            </div>

                            <div>
                                <Label className="text-muted-foreground">Description</Label>
                                <p className="text-sm">{selectedReturn.description}</p>
                            </div>

                            {selectedReturn.trackingCode && (
                                <div>
                                    <Label className="text-muted-foreground">Tracking Code</Label>
                                    <p className="font-medium font-mono">{selectedReturn.trackingCode}</p>
                                </div>
                            )}

                            {selectedReturn.refundMethod && (
                                <div>
                                    <Label className="text-muted-foreground">Refund Method</Label>
                                    <p className="font-medium">{selectedReturn.refundMethod.replace(/_/g, ' ')}</p>
                                </div>
                            )}

                            {selectedReturn.adminNotes && (
                                <div>
                                    <Label className="text-muted-foreground">Admin Notes</Label>
                                    <p className="text-sm">{selectedReturn.adminNotes}</p>
                                </div>
                            )}

                            {selectedReturn.images && selectedReturn.images.length > 0 && (
                                <div>
                                    <Label className="text-muted-foreground">Images</Label>
                                    <div className="grid grid-cols-3 gap-2 mt-2">
                                        {selectedReturn.images.map((img, idx) => (
                                            <img
                                                key={idx}
                                                src={img}
                                                alt={`Return image ${idx + 1}`}
                                                className="w-full h-24 object-cover rounded border"
                                            />
                                        ))}
                                    </div>
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
                        <DialogTitle>Update Return - {selectedReturn?.returnNumber}</DialogTitle>
                        <DialogDescription>
                            Update return status and details
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="updateStatus">Status *</Label>
                            <Select value={updateStatus} onValueChange={setUpdateStatus}>
                                <SelectTrigger id="updateStatus">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="PENDING">Pending Review</SelectItem>
                                    <SelectItem value="APPROVED">Approved</SelectItem>
                                    <SelectItem value="IN_TRANSIT">In Transit</SelectItem>
                                    <SelectItem value="RECEIVED">Received</SelectItem>
                                    <SelectItem value="COMPLETED">Completed</SelectItem>
                                    <SelectItem value="REJECTED">Rejected</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label htmlFor="trackingCode">Tracking Code</Label>
                            <Input
                                id="trackingCode"
                                placeholder="Enter tracking code"
                                value={trackingCode}
                                onChange={(e) => setTrackingCode(e.target.value)}
                            />
                        </div>

                        <div>
                            <Label htmlFor="refundMethod">Refund Method</Label>
                            <Select value={refundMethod} onValueChange={setRefundMethod}>
                                <SelectTrigger id="refundMethod">
                                    <SelectValue placeholder="Select refund method" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ORIGINAL_PAYMENT">Original Payment Method</SelectItem>
                                    <SelectItem value="STORE_CREDIT">Store Credit</SelectItem>
                                    <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
                                    <SelectItem value="CHECK">Check</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label htmlFor="adminNotes">Admin Notes</Label>
                            <Textarea
                                id="adminNotes"
                                placeholder="Internal notes about this return..."
                                value={adminNotes}
                                onChange={(e) => setAdminNotes(e.target.value)}
                                rows={4}
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setUpdateOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleUpdate} disabled={updating}>
                            {updating ? 'Updating...' : 'Update Return'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
