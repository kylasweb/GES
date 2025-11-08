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
import { Package, Plus, Eye, XCircle, Upload, Trash2 } from 'lucide-react';

interface Order {
    id: string;
    orderNumber: string;
    totalAmount: number;
    createdAt: string;
    items: Array<{
        id: string;
        productName: string;
        quantity: number;
        price: number;
    }>;
}

interface Return {
    id: string;
    returnNumber: string;
    reason: string;
    status: string;
    refundAmount: number;
    requestedAt: string;
    order: {
        orderNumber: string;
    };
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

export default function CustomerReturnsPage() {
    const [returns, setReturns] = useState<Return[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [createOpen, setCreateOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState('');
    const [selectedItems, setSelectedItems] = useState<Array<{ orderItemId: string; quantity: number; reason: string }>>([]);
    const [reason, setReason] = useState('');
    const [description, setDescription] = useState('');
    const [images, setImages] = useState<string[]>([]);
    const [uploading, setUploading] = useState(false);
    const [creating, setCreating] = useState(false);

    const { toast } = useToast();

    useEffect(() => {
        fetchReturns();
        fetchOrders();
    }, []);

    const fetchReturns = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/v1/returns', {
                headers: { Authorization: `Bearer ${token}` },
            });

            const data = await response.json();
            if (data.success) {
                setReturns(data.data);
            }
        } catch (error) {
            console.error('Failed to fetch returns:', error);
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
                // Filter orders that are eligible for return (within 30 days)
                const thirtyDaysAgo = new Date();
                thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

                const eligibleOrders = data.data.filter((order: Order) =>
                    new Date(order.createdAt) >= thirtyDaysAgo
                );
                setOrders(eligibleOrders);
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
                    setImages(prev => [...prev, data.url]);
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

    const handleCreateReturn = async () => {
        if (!selectedOrder || !reason || !description || selectedItems.length === 0) {
            toast({
                title: 'Validation Error',
                description: 'Please fill all required fields and select at least one item',
                variant: 'destructive',
            });
            return;
        }

        try {
            setCreating(true);
            const token = localStorage.getItem('token');

            const response = await fetch('/api/v1/returns', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    orderId: selectedOrder,
                    reason,
                    description,
                    items: selectedItems,
                    images,
                }),
            });

            const data = await response.json();

            if (data.success) {
                toast({
                    title: 'Success',
                    description: 'Return request submitted successfully',
                });
                setCreateOpen(false);
                resetForm();
                fetchReturns();
            } else {
                toast({
                    title: 'Error',
                    description: data.error || 'Failed to create return request',
                    variant: 'destructive',
                });
            }
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to create return request',
                variant: 'destructive',
            });
        } finally {
            setCreating(false);
        }
    };

    const handleCancelReturn = async (returnId: string) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/v1/returns/${returnId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
            });

            const data = await response.json();

            if (data.success) {
                toast({
                    title: 'Success',
                    description: 'Return cancelled successfully',
                });
                fetchReturns();
            } else {
                toast({
                    title: 'Error',
                    description: data.error || 'Failed to cancel return',
                    variant: 'destructive',
                });
            }
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to cancel return',
                variant: 'destructive',
            });
        }
    };

    const resetForm = () => {
        setSelectedOrder('');
        setSelectedItems([]);
        setReason('');
        setDescription('');
        setImages([]);
    };

    const addItemToReturn = (orderItemId: string) => {
        if (selectedItems.find(item => item.orderItemId === orderItemId)) {
            toast({
                title: 'Error',
                description: 'Item already added',
                variant: 'destructive',
            });
            return;
        }

        setSelectedItems([...selectedItems, { orderItemId, quantity: 1, reason: '' }]);
    };

    const removeItemFromReturn = (orderItemId: string) => {
        setSelectedItems(selectedItems.filter(item => item.orderItemId !== orderItemId));
    };

    const updateItemQuantity = (orderItemId: string, quantity: number) => {
        setSelectedItems(selectedItems.map(item =>
            item.orderItemId === orderItemId ? { ...item, quantity } : item
        ));
    };

    const updateItemReason = (orderItemId: string, reason: string) => {
        setSelectedItems(selectedItems.map(item =>
            item.orderItemId === orderItemId ? { ...item, reason } : item
        ));
    };

    const selectedOrderData = orders.find(o => o.id === selectedOrder);

    return (
        <div className="container mx-auto py-8 px-4 max-w-6xl">
            <div className="mb-8 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold mb-2">My Returns</h1>
                    <p className="text-muted-foreground">Request returns and track their status</p>
                </div>
                <Button onClick={() => setCreateOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Request Return
                </Button>
            </div>

            {/* Returns List */}
            <Card>
                <CardHeader>
                    <CardTitle>Return History</CardTitle>
                    <CardDescription>View all your return requests</CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="text-center py-8">Loading...</div>
                    ) : returns.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            <Package className="mx-auto h-12 w-12 mb-4 opacity-50" />
                            <p>No returns yet</p>
                            <p className="text-sm mt-2">Click "Request Return" to start a return</p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Return #</TableHead>
                                    <TableHead>Order #</TableHead>
                                    <TableHead>Reason</TableHead>
                                    <TableHead>Refund Amount</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Requested</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {returns.map((returnItem) => (
                                    <TableRow key={returnItem.id}>
                                        <TableCell className="font-medium">{returnItem.returnNumber}</TableCell>
                                        <TableCell>{returnItem.order.orderNumber}</TableCell>
                                        <TableCell>{returnItem.reason.replace(/_/g, ' ')}</TableCell>
                                        <TableCell>₹{returnItem.refundAmount.toFixed(2)}</TableCell>
                                        <TableCell>
                                            <Badge className={statusColors[returnItem.status]}>
                                                {returnItem.status.replace(/_/g, ' ')}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {new Date(returnItem.requestedAt).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell>
                                            {returnItem.status === 'PENDING' && (
                                                <Button
                                                    size="sm"
                                                    variant="destructive"
                                                    onClick={() => handleCancelReturn(returnItem.id)}
                                                >
                                                    <XCircle className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            {/* Create Return Dialog */}
            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Request Return</DialogTitle>
                        <DialogDescription>
                            Select an order and items to return (within 30 days of purchase)
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
                                            {order.orderNumber} - ₹{order.totalAmount} ({new Date(order.createdAt).toLocaleDateString()})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {selectedOrderData && (
                            <div>
                                <Label>Select Items to Return *</Label>
                                <div className="border rounded-lg p-4 space-y-2 mt-2">
                                    {selectedOrderData.items.map((item) => {
                                        const isSelected = selectedItems.find(si => si.orderItemId === item.id);
                                        return (
                                            <div key={item.id} className="flex items-center justify-between p-2 border rounded">
                                                <div className="flex-1">
                                                    <p className="font-medium">{item.productName}</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        Qty: {item.quantity} × ₹{item.price}
                                                    </p>
                                                </div>
                                                {isSelected ? (
                                                    <div className="flex gap-2 items-center">
                                                        <Input
                                                            type="number"
                                                            min="1"
                                                            max={item.quantity}
                                                            value={isSelected.quantity}
                                                            onChange={(e) => updateItemQuantity(item.id, parseInt(e.target.value))}
                                                            className="w-20"
                                                        />
                                                        <Button
                                                            size="sm"
                                                            variant="destructive"
                                                            onClick={() => removeItemFromReturn(item.id)}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                ) : (
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => addItemToReturn(item.id)}
                                                    >
                                                        Add
                                                    </Button>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        <div>
                            <Label htmlFor="reason">Return Reason *</Label>
                            <Select value={reason} onValueChange={setReason}>
                                <SelectTrigger id="reason">
                                    <SelectValue placeholder="Select a reason" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="DEFECTIVE">Defective Product</SelectItem>
                                    <SelectItem value="WRONG_ITEM">Wrong Item Received</SelectItem>
                                    <SelectItem value="NOT_AS_DESCRIBED">Not as Described</SelectItem>
                                    <SelectItem value="SIZE_ISSUE">Size Issue</SelectItem>
                                    <SelectItem value="QUALITY_ISSUE">Quality Issue</SelectItem>
                                    <SelectItem value="CHANGED_MIND">Changed Mind</SelectItem>
                                    <SelectItem value="OTHER">Other</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label htmlFor="description">Description *</Label>
                            <Textarea
                                id="description"
                                placeholder="Please describe the issue in detail (minimum 10 characters)..."
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows={4}
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
                                {images.length > 0 && (
                                    <div className="grid grid-cols-4 gap-2 mt-2">
                                        {images.map((img, idx) => (
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
                                                    onClick={() => setImages(images.filter((_, i) => i !== idx))}
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
                        <Button variant="outline" onClick={() => { setCreateOpen(false); resetForm(); }}>
                            Cancel
                        </Button>
                        <Button onClick={handleCreateReturn} disabled={creating || uploading}>
                            {creating ? 'Submitting...' : 'Submit Return Request'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
