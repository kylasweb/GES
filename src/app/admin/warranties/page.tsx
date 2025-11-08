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
import { Shield, Eye, Search, Filter, FileText } from 'lucide-react';

interface Warranty {
    id: string;
    warrantyNumber: string;
    purchaseDate: string;
    warrantyPeriod: number;
    expiryDate: string;
    status: string;
    registeredAt: string;
    product: {
        id: string;
        name: string;
        sku: string;
    };
    order: {
        orderNumber: string;
    };
    user: {
        name: string;
        email: string;
    };
    claims: Array<{
        id: string;
        claimNumber: string;
        issue: string;
        status: string;
        submittedAt: string;
    }>;
}

interface WarrantyClaim {
    id: string;
    claimNumber: string;
    issue: string;
    description: string;
    status: string;
    resolution?: string;
    adminNotes?: string;
    submittedAt: string;
    resolvedAt?: string;
    images?: string[];
    warranty: {
        warrantyNumber: string;
        product: {
            name: string;
        };
    };
}

const warrantyStatusColors: Record<string, string> = {
    ACTIVE: 'bg-green-500',
    CLAIMED: 'bg-blue-500',
    EXPIRED: 'bg-gray-500',
    VOID: 'bg-red-500',
};

const claimStatusColors: Record<string, string> = {
    SUBMITTED: 'bg-yellow-500',
    UNDER_REVIEW: 'bg-blue-500',
    APPROVED: 'bg-green-500',
    REJECTED: 'bg-red-500',
    IN_REPAIR: 'bg-purple-500',
    COMPLETED: 'bg-green-600',
};

export default function AdminWarrantiesPage() {
    const [warranties, setWarranties] = useState<Warranty[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedWarranty, setSelectedWarranty] = useState<Warranty | null>(null);
    const [selectedClaim, setSelectedClaim] = useState<WarrantyClaim | null>(null);
    const [detailsOpen, setDetailsOpen] = useState(false);
    const [claimUpdateOpen, setClaimUpdateOpen] = useState(false);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [statusFilter, setStatusFilter] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    // Claim update form
    const [claimStatus, setClaimStatus] = useState('');
    const [resolution, setResolution] = useState('');
    const [adminNotes, setAdminNotes] = useState('');
    const [updating, setUpdating] = useState(false);

    const { toast } = useToast();

    useEffect(() => {
        fetchWarranties();
    }, [page, statusFilter]);

    const fetchWarranties = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const params = new URLSearchParams({
                page: page.toString(),
                limit: '10',
            });

            if (statusFilter) params.append('status', statusFilter);

            const response = await fetch(`/api/v1/warranties?${params}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            const data = await response.json();

            if (data.success) {
                setWarranties(data.data);
                setTotalPages(data.pagination.totalPages);
            } else {
                toast({
                    title: 'Error',
                    description: data.error || 'Failed to fetch warranties',
                    variant: 'destructive',
                });
            }
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to fetch warranties',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    const openDetails = (warranty: Warranty) => {
        setSelectedWarranty(warranty);
        setDetailsOpen(true);
    };

    const openClaimUpdate = async (claimId: string) => {
        try {
            const token = localStorage.getItem('token');

            // Fetch full claim details
            const warranty = warranties.find(w => w.claims.some(c => c.id === claimId));
            if (!warranty) return;

            const claim = warranty.claims.find(c => c.id === claimId);
            if (!claim) return;

            // For demo, we'll use the basic claim data
            // In production, you might want to fetch full claim details with images
            setSelectedClaim({
                ...claim,
                description: '',
                warranty: {
                    warrantyNumber: warranty.warrantyNumber,
                    product: warranty.product,
                },
            } as WarrantyClaim);

            setClaimStatus(claim.status);
            setResolution('');
            setAdminNotes('');
            setClaimUpdateOpen(true);
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to load claim details',
                variant: 'destructive',
            });
        }
    };

    const handleUpdateClaim = async () => {
        if (!selectedClaim) return;

        try {
            setUpdating(true);
            const token = localStorage.getItem('token');

            const response = await fetch(`/api/v1/warranties/claims?id=${selectedClaim.id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    status: claimStatus,
                    resolution: resolution || undefined,
                    adminNotes: adminNotes || undefined,
                }),
            });

            const data = await response.json();

            if (data.success) {
                toast({
                    title: 'Success',
                    description: 'Claim updated successfully',
                });
                setClaimUpdateOpen(false);
                fetchWarranties();
            } else {
                toast({
                    title: 'Error',
                    description: data.error || 'Failed to update claim',
                    variant: 'destructive',
                });
            }
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to update claim',
                variant: 'destructive',
            });
        } finally {
            setUpdating(false);
        }
    };

    const filteredWarranties = warranties.filter(warranty => {
        if (!searchQuery) return true;
        const query = searchQuery.toLowerCase();
        return (
            warranty.warrantyNumber.toLowerCase().includes(query) ||
            warranty.product.name.toLowerCase().includes(query) ||
            warranty.product.sku.toLowerCase().includes(query) ||
            warranty.user.name.toLowerCase().includes(query) ||
            warranty.user.email.toLowerCase().includes(query)
        );
    });

    return (
        <div className="container mx-auto py-8 px-4">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Warranty Management</h1>
                <p className="text-muted-foreground">Manage product warranties and claims</p>
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
                                    placeholder="Warranty #, Product, Customer..."
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
                                    <SelectItem value="ACTIVE">Active</SelectItem>
                                    <SelectItem value="CLAIMED">Claimed</SelectItem>
                                    <SelectItem value="EXPIRED">Expired</SelectItem>
                                    <SelectItem value="VOID">Void</SelectItem>
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

            {/* Warranties Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Warranties</CardTitle>
                    <CardDescription>
                        {filteredWarranties.length} warrant{filteredWarranties.length !== 1 ? 'ies' : 'y'} found
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="text-center py-8">Loading...</div>
                    ) : filteredWarranties.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            <Shield className="mx-auto h-12 w-12 mb-4 opacity-50" />
                            <p>No warranties found</p>
                        </div>
                    ) : (
                        <>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Warranty #</TableHead>
                                        <TableHead>Product</TableHead>
                                        <TableHead>Customer</TableHead>
                                        <TableHead>Period</TableHead>
                                        <TableHead>Expiry</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Claims</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredWarranties.map((warranty) => (
                                        <TableRow key={warranty.id}>
                                            <TableCell className="font-medium font-mono text-sm">
                                                {warranty.warrantyNumber}
                                            </TableCell>
                                            <TableCell>
                                                <div>
                                                    <div className="font-medium">{warranty.product.name}</div>
                                                    <div className="text-sm text-muted-foreground">{warranty.product.sku}</div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div>
                                                    <div className="font-medium">{warranty.user.name}</div>
                                                    <div className="text-sm text-muted-foreground">{warranty.user.email}</div>
                                                </div>
                                            </TableCell>
                                            <TableCell>{warranty.warrantyPeriod} months</TableCell>
                                            <TableCell>
                                                {new Date(warranty.expiryDate).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell>
                                                <Badge className={warrantyStatusColors[warranty.status]}>
                                                    {warranty.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                {warranty.claims.length > 0 ? (
                                                    <div className="space-y-1">
                                                        {warranty.claims.map(claim => (
                                                            <div key={claim.id} className="flex items-center gap-2">
                                                                <Badge
                                                                    className={claimStatusColors[claim.status]}
                                                                    variant="outline"
                                                                >
                                                                    {claim.status.replace(/_/g, ' ')}
                                                                </Badge>
                                                                <Button
                                                                    size="sm"
                                                                    variant="ghost"
                                                                    onClick={() => openClaimUpdate(claim.id)}
                                                                >
                                                                    <FileText className="h-3 w-3" />
                                                                </Button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <span className="text-muted-foreground text-sm">No claims</span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => openDetails(warranty)}
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Button>
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

            {/* Warranty Details Dialog */}
            <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Warranty Details - {selectedWarranty?.warrantyNumber}</DialogTitle>
                        <DialogDescription>View complete warranty information</DialogDescription>
                    </DialogHeader>

                    {selectedWarranty && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-muted-foreground">Product</Label>
                                    <p className="font-medium">{selectedWarranty.product.name}</p>
                                    <p className="text-sm text-muted-foreground">{selectedWarranty.product.sku}</p>
                                </div>
                                <div>
                                    <Label className="text-muted-foreground">Status</Label>
                                    <Badge className={warrantyStatusColors[selectedWarranty.status]}>
                                        {selectedWarranty.status}
                                    </Badge>
                                </div>
                                <div>
                                    <Label className="text-muted-foreground">Customer</Label>
                                    <p className="font-medium">{selectedWarranty.user.name}</p>
                                    <p className="text-sm text-muted-foreground">{selectedWarranty.user.email}</p>
                                </div>
                                <div>
                                    <Label className="text-muted-foreground">Order</Label>
                                    <p className="font-medium">{selectedWarranty.order.orderNumber}</p>
                                </div>
                                <div>
                                    <Label className="text-muted-foreground">Warranty Period</Label>
                                    <p className="font-medium">{selectedWarranty.warrantyPeriod} months</p>
                                </div>
                                <div>
                                    <Label className="text-muted-foreground">Purchase Date</Label>
                                    <p className="font-medium">
                                        {new Date(selectedWarranty.purchaseDate).toLocaleDateString()}
                                    </p>
                                </div>
                                <div>
                                    <Label className="text-muted-foreground">Expiry Date</Label>
                                    <p className="font-medium">
                                        {new Date(selectedWarranty.expiryDate).toLocaleDateString()}
                                    </p>
                                </div>
                                <div>
                                    <Label className="text-muted-foreground">Registered</Label>
                                    <p className="font-medium">
                                        {new Date(selectedWarranty.registeredAt).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>

                            {selectedWarranty.claims.length > 0 && (
                                <div>
                                    <Label className="text-muted-foreground">Claims History</Label>
                                    <div className="mt-2 space-y-2">
                                        {selectedWarranty.claims.map(claim => (
                                            <Card key={claim.id}>
                                                <CardContent className="pt-4">
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <p className="font-medium font-mono text-sm">{claim.claimNumber}</p>
                                                            <p className="text-sm mt-1">{claim.issue}</p>
                                                            <p className="text-xs text-muted-foreground mt-1">
                                                                Submitted: {new Date(claim.submittedAt).toLocaleDateString()}
                                                            </p>
                                                        </div>
                                                        <Badge className={claimStatusColors[claim.status]}>
                                                            {claim.status.replace(/_/g, ' ')}
                                                        </Badge>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Claim Update Dialog */}
            <Dialog open={claimUpdateOpen} onOpenChange={setClaimUpdateOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Update Claim - {selectedClaim?.claimNumber}</DialogTitle>
                        <DialogDescription>Update claim status and resolution</DialogDescription>
                    </DialogHeader>

                    {selectedClaim && (
                        <div className="space-y-4">
                            <div>
                                <Label className="text-muted-foreground">Product</Label>
                                <p className="font-medium">{selectedClaim.warranty.product.name}</p>
                            </div>

                            <div>
                                <Label className="text-muted-foreground">Issue</Label>
                                <p className="text-sm">{selectedClaim.issue}</p>
                            </div>

                            <div>
                                <Label htmlFor="claimStatus">Status *</Label>
                                <Select value={claimStatus} onValueChange={setClaimStatus}>
                                    <SelectTrigger id="claimStatus">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="SUBMITTED">Submitted</SelectItem>
                                        <SelectItem value="UNDER_REVIEW">Under Review</SelectItem>
                                        <SelectItem value="APPROVED">Approved</SelectItem>
                                        <SelectItem value="REJECTED">Rejected</SelectItem>
                                        <SelectItem value="IN_REPAIR">In Repair</SelectItem>
                                        <SelectItem value="COMPLETED">Completed</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label htmlFor="resolution">Resolution</Label>
                                <Textarea
                                    id="resolution"
                                    placeholder="Describe the resolution..."
                                    value={resolution}
                                    onChange={(e) => setResolution(e.target.value)}
                                    rows={3}
                                />
                            </div>

                            <div>
                                <Label htmlFor="adminNotes">Admin Notes</Label>
                                <Textarea
                                    id="adminNotes"
                                    placeholder="Internal notes..."
                                    value={adminNotes}
                                    onChange={(e) => setAdminNotes(e.target.value)}
                                    rows={3}
                                />
                            </div>
                        </div>
                    )}

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setClaimUpdateOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleUpdateClaim} disabled={updating}>
                            {updating ? 'Updating...' : 'Update Claim'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
