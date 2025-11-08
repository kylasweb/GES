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
import { Shield, Plus, Upload, Trash2, FileText } from 'lucide-react';

interface Order {
    id: string;
    orderNumber: string;
    createdAt: string;
    items: Array<{
        id: string;
        productId: string;
        productName: string;
        quantity: number;
    }>;
}

interface Warranty {
    id: string;
    warrantyNumber: string;
    purchaseDate: string;
    warrantyPeriod: number;
    expiryDate: string;
    status: string;
    product: {
        name: string;
        sku: string;
    };
    order: {
        orderNumber: string;
    };
    claims: Array<{
        id: string;
        claimNumber: string;
        issue: string;
        status: string;
        submittedAt: string;
    }>;
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

export default function CustomerWarrantiesPage() {
    const [warranties, setWarranties] = useState<Warranty[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [registerOpen, setRegisterOpen] = useState(false);
    const [claimOpen, setClaimOpen] = useState(false);

    // Register warranty form
    const [selectedOrder, setSelectedOrder] = useState('');
    const [selectedProduct, setSelectedProduct] = useState('');
    const [warrantyPeriod, setWarrantyPeriod] = useState('12');
    const [registering, setRegistering] = useState(false);

    // Submit claim form
    const [selectedWarranty, setSelectedWarranty] = useState('');
    const [claimIssue, setClaimIssue] = useState('');
    const [claimDescription, setClaimDescription] = useState('');
    const [claimImages, setClaimImages] = useState<string[]>([]);
    const [uploading, setUploading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const { toast } = useToast();

    useEffect(() => {
        fetchWarranties();
        fetchOrders();
    }, []);

    const fetchWarranties = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/v1/warranties', {
                headers: { Authorization: `Bearer ${token}` },
            });

            const data = await response.json();
            if (data.success) {
                setWarranties(data.data);
            }
        } catch (error) {
            console.error('Failed to fetch warranties:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchOrders = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/v1/orders', {
                headers: { Authorization: `Bearer ${token}` },
            });

            const data = await response.json();
            if (data.success) {
                setOrders(data.data);
            }
        } catch (error) {
            console.error('Failed to fetch orders:', error);
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        try {
            setUploading(true);
            const token = localStorage.getItem('token');

            for (const file of Array.from(files)) {
                const formData = new FormData();
                formData.append('file', file);

                const response = await fetch('/api/v1/admin/upload', {
                    method: 'POST',
                    headers: { Authorization: `Bearer ${token}` },
                    body: formData,
                });

                const data = await response.json();
                if (data.success) {
                    setClaimImages(prev => [...prev, data.url]);
                }
            }

            toast({
                title: 'Success',
                description: 'Images uploaded successfully',
            });
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to upload images',
                variant: 'destructive',
            });
        } finally {
            setUploading(false);
        }
    };

    const handleRegisterWarranty = async () => {
        if (!selectedOrder || !selectedProduct || !warrantyPeriod) {
            toast({
                title: 'Validation Error',
                description: 'Please fill all required fields',
                variant: 'destructive',
            });
            return;
        }

        try {
            setRegistering(true);
            const token = localStorage.getItem('token');

            const response = await fetch('/api/v1/warranties', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    orderId: selectedOrder,
                    productId: selectedProduct,
                    warrantyPeriod: parseInt(warrantyPeriod),
                }),
            });

            const data = await response.json();

            if (data.success) {
                toast({
                    title: 'Success',
                    description: 'Warranty registered successfully',
                });
                setRegisterOpen(false);
                resetRegisterForm();
                fetchWarranties();
            } else {
                toast({
                    title: 'Error',
                    description: data.error || 'Failed to register warranty',
                    variant: 'destructive',
                });
            }
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to register warranty',
                variant: 'destructive',
            });
        } finally {
            setRegistering(false);
        }
    };

    const handleSubmitClaim = async () => {
        if (!selectedWarranty || !claimIssue || !claimDescription) {
            toast({
                title: 'Validation Error',
                description: 'Please fill all required fields',
                variant: 'destructive',
            });
            return;
        }

        try {
            setSubmitting(true);
            const token = localStorage.getItem('token');

            const response = await fetch('/api/v1/warranties/claims', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    warrantyId: selectedWarranty,
                    issue: claimIssue,
                    description: claimDescription,
                    images: claimImages,
                }),
            });

            const data = await response.json();

            if (data.success) {
                toast({
                    title: 'Success',
                    description: 'Warranty claim submitted successfully',
                });
                setClaimOpen(false);
                resetClaimForm();
                fetchWarranties();
            } else {
                toast({
                    title: 'Error',
                    description: data.error || 'Failed to submit claim',
                    variant: 'destructive',
                });
            }
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to submit claim',
                variant: 'destructive',
            });
        } finally {
            setSubmitting(false);
        }
    };

    const resetRegisterForm = () => {
        setSelectedOrder('');
        setSelectedProduct('');
        setWarrantyPeriod('12');
    };

    const resetClaimForm = () => {
        setSelectedWarranty('');
        setClaimIssue('');
        setClaimDescription('');
        setClaimImages([]);
    };

    const selectedOrderData = orders.find(o => o.id === selectedOrder);
    const activeWarranties = warranties.filter(w => w.status === 'ACTIVE');

    return (
        <div className="container mx-auto py-8 px-4 max-w-6xl">
            <div className="mb-8 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold mb-2">My Warranties</h1>
                    <p className="text-muted-foreground">Register warranties and submit claims</p>
                </div>
                <div className="flex gap-2">
                    <Button onClick={() => setRegisterOpen(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Register Warranty
                    </Button>
                    <Button variant="outline" onClick={() => setClaimOpen(true)}>
                        <FileText className="mr-2 h-4 w-4" />
                        Submit Claim
                    </Button>
                </div>
            </div>

            {/* Warranties List */}
            <Card>
                <CardHeader>
                    <CardTitle>My Warranties</CardTitle>
                    <CardDescription>View all registered warranties and claims</CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="text-center py-8">Loading...</div>
                    ) : warranties.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            <Shield className="mx-auto h-12 w-12 mb-4 opacity-50" />
                            <p>No warranties registered</p>
                            <p className="text-sm mt-2">Click "Register Warranty" to protect your purchase</p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Warranty #</TableHead>
                                    <TableHead>Product</TableHead>
                                    <TableHead>Period</TableHead>
                                    <TableHead>Expiry</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Claims</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {warranties.map((warranty) => (
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
                                                            <span className="text-xs text-muted-foreground">
                                                                {new Date(claim.submittedAt).toLocaleDateString()}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <span className="text-muted-foreground text-sm">No claims</span>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            {/* Register Warranty Dialog */}
            <Dialog open={registerOpen} onOpenChange={setRegisterOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Register Warranty</DialogTitle>
                        <DialogDescription>
                            Register a warranty for your purchased product
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="order">Select Order *</Label>
                            <Select value={selectedOrder} onValueChange={setSelectedOrder}>
                                <SelectTrigger id="order">
                                    <SelectValue placeholder="Choose an order" />
                                </SelectTrigger>
                                <SelectContent>
                                    {orders.map((order) => (
                                        <SelectItem key={order.id} value={order.id}>
                                            {order.orderNumber} ({new Date(order.createdAt).toLocaleDateString()})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {selectedOrderData && (
                            <div>
                                <Label htmlFor="product">Select Product *</Label>
                                <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                                    <SelectTrigger id="product">
                                        <SelectValue placeholder="Choose a product" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {selectedOrderData.items.map((item) => (
                                            <SelectItem key={item.id} value={item.productId}>
                                                {item.productName} (Qty: {item.quantity})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        <div>
                            <Label htmlFor="period">Warranty Period *</Label>
                            <Select value={warrantyPeriod} onValueChange={setWarrantyPeriod}>
                                <SelectTrigger id="period">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="6">6 Months</SelectItem>
                                    <SelectItem value="12">12 Months (1 Year)</SelectItem>
                                    <SelectItem value="24">24 Months (2 Years)</SelectItem>
                                    <SelectItem value="36">36 Months (3 Years)</SelectItem>
                                    <SelectItem value="60">60 Months (5 Years)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => { setRegisterOpen(false); resetRegisterForm(); }}>
                            Cancel
                        </Button>
                        <Button onClick={handleRegisterWarranty} disabled={registering}>
                            {registering ? 'Registering...' : 'Register Warranty'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Submit Claim Dialog */}
            <Dialog open={claimOpen} onOpenChange={setClaimOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Submit Warranty Claim</DialogTitle>
                        <DialogDescription>
                            File a claim for a product issue covered under warranty
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="warranty">Select Warranty *</Label>
                            <Select value={selectedWarranty} onValueChange={setSelectedWarranty}>
                                <SelectTrigger id="warranty">
                                    <SelectValue placeholder="Choose a warranty" />
                                </SelectTrigger>
                                <SelectContent>
                                    {activeWarranties.map((warranty) => (
                                        <SelectItem key={warranty.id} value={warranty.id}>
                                            {warranty.product.name} - {warranty.warrantyNumber}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label htmlFor="issue">Issue Summary *</Label>
                            <Input
                                id="issue"
                                placeholder="Brief description of the issue"
                                value={claimIssue}
                                onChange={(e) => setClaimIssue(e.target.value)}
                            />
                        </div>

                        <div>
                            <Label htmlFor="description">Detailed Description *</Label>
                            <Textarea
                                id="description"
                                placeholder="Describe the issue in detail (minimum 10 characters)..."
                                value={claimDescription}
                                onChange={(e) => setClaimDescription(e.target.value)}
                                rows={5}
                            />
                        </div>

                        <div>
                            <Label htmlFor="images">Upload Images (Optional)</Label>
                            <div className="mt-2">
                                <Input
                                    id="images"
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={handleImageUpload}
                                    disabled={uploading}
                                />
                                {uploading && <p className="text-sm text-muted-foreground mt-1">Uploading...</p>}
                                {claimImages.length > 0 && (
                                    <div className="grid grid-cols-4 gap-2 mt-2">
                                        {claimImages.map((img, idx) => (
                                            <div key={idx} className="relative">
                                                <img
                                                    src={img}
                                                    alt={`Upload ${idx + 1}`}
                                                    className="w-full h-20 object-cover rounded border"
                                                />
                                                <Button
                                                    size="sm"
                                                    variant="destructive"
                                                    className="absolute top-1 right-1 h-6 w-6 p-0"
                                                    onClick={() => setClaimImages(claimImages.filter((_, i) => i !== idx))}
                                                >
                                                    ×
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => { setClaimOpen(false); resetClaimForm(); }}>
                            Cancel
                        </Button>
                        <Button onClick={handleSubmitClaim} disabled={submitting || uploading}>
                            {submitting ? 'Submitting...' : 'Submit Claim'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
