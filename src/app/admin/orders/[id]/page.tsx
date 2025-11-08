'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
    ArrowLeft,
    Package,
    User,
    MapPin,
    CreditCard,
    Clock,
    Truck,
    CheckCircle,
    AlertCircle,
    RefreshCw,
    Edit,
    Save,
    X,
    FileText,
    Trash2,
    Lock,
    MessageSquare
} from 'lucide-react';
import { useAuthStore } from '@/lib/store/auth';
import { AdminSidebar } from '@/components/admin/sidebar';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';

interface OrderItem {
    id: string;
    productId: string;
    product: {
        name: string;
        images: string[];
        sku: string;
    };
    quantity: number;
    price: number;
    total: number;
}

interface OrderNote {
    id: string;
    content: string;
    isInternal: boolean;
    createdBy: {
        id: string;
        name: string;
        role: string;
    };
    createdAt: string;
}

interface Order {
    id: string;
    orderNumber: string;
    status: string;
    paymentStatus: string;
    paymentMethod: string;
    totalAmount: number;
    subtotal: number;
    shippingCost: number;
    taxAmount: number;
    user: {
        id: string;
        name: string;
        email: string;
        phone: string;
    };
    shippingAddress: {
        addressLine1: string;
        addressLine2?: string;
        city: string;
        state: string;
        postalCode: string;
        country: string;
    };
    items: OrderItem[];
    trackingNumber?: string;
    createdAt: string;
    updatedAt: string;
}

export default function OrderDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { token, user } = useAuthStore();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(true);
    const [order, setOrder] = useState<Order | null>(null);
    const [notes, setNotes] = useState<OrderNote[]>([]);
    const [isEditing, setIsEditing] = useState(false);
    const [editedStatus, setEditedStatus] = useState('');
    const [editedTracking, setEditedTracking] = useState('');
    const [newNote, setNewNote] = useState('');
    const [isNoteInternal, setIsNoteInternal] = useState(false);
    const [isSubmittingNote, setIsSubmittingNote] = useState(false);

    useEffect(() => {
        if (params.id) {
            fetchOrder();
            fetchNotes();
        }
    }, [params.id]);

    const fetchOrder = async () => {
        try {
            const response = await fetch(`/api/v1/orders/${params.id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            const data = await response.json();

            if (data.success) {
                setOrder(data.data);
                setEditedStatus(data.data.status);
                setEditedTracking(data.data.trackingNumber || '');
            } else {
                toast({
                    title: 'Error',
                    description: data.error || 'Failed to load order',
                    variant: 'destructive',
                });
            }
        } catch (err) {
            toast({
                title: 'Error',
                description: 'Failed to load order',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    };

    const fetchNotes = async () => {
        try {
            const response = await fetch(`/api/v1/order-notes?orderId=${params.id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            const data = await response.json();

            if (data.success) {
                setNotes(data.data);
            }
        } catch (err) {
            console.error('Failed to load notes:', err);
        }
    };

    const handleUpdateOrder = async () => {
        if (!order) return;

        try {
            const response = await fetch(`/api/v1/orders/${order.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    status: editedStatus,
                    trackingNumber: editedTracking || undefined
                })
            });

            const data = await response.json();

            if (data.success) {
                setOrder({ ...order, status: editedStatus, trackingNumber: editedTracking });
                setIsEditing(false);
                toast({
                    title: 'Success',
                    description: 'Order updated successfully',
                });
            } else {
                toast({
                    title: 'Error',
                    description: data.error || 'Failed to update order',
                    variant: 'destructive',
                });
            }
        } catch (err) {
            toast({
                title: 'Error',
                description: 'Failed to update order',
                variant: 'destructive',
            });
        }
    };

    const handleAddNote = async () => {
        if (!newNote.trim()) return;

        setIsSubmittingNote(true);

        try {
            const response = await fetch('/api/v1/order-notes', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    orderId: params.id,
                    content: newNote.trim(),
                    isInternal: isNoteInternal
                })
            });

            const data = await response.json();

            if (data.success) {
                setNotes([data.data, ...notes]);
                setNewNote('');
                setIsNoteInternal(false);
                toast({
                    title: 'Success',
                    description: 'Note added successfully',
                });
            } else {
                toast({
                    title: 'Error',
                    description: data.error || 'Failed to add note',
                    variant: 'destructive',
                });
            }
        } catch (err) {
            toast({
                title: 'Error',
                description: 'Failed to add note',
                variant: 'destructive',
            });
        } finally {
            setIsSubmittingNote(false);
        }
    };

    const handleDeleteNote = async (noteId: string) => {
        if (!confirm('Are you sure you want to delete this note?')) return;

        try {
            const response = await fetch(`/api/v1/order-notes/${noteId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            const data = await response.json();

            if (data.success) {
                setNotes(notes.filter(n => n.id !== noteId));
                toast({
                    title: 'Success',
                    description: 'Note deleted successfully',
                });
            } else {
                toast({
                    title: 'Error',
                    description: data.error || 'Failed to delete note',
                    variant: 'destructive',
                });
            }
        } catch (err) {
            toast({
                title: 'Error',
                description: 'Failed to delete note',
                variant: 'destructive',
            });
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status.toLowerCase()) {
            case 'delivered':
                return <CheckCircle className="w-5 h-5 text-green-600" />;
            case 'shipped':
                return <Truck className="w-5 h-5 text-blue-600" />;
            case 'processing':
                return <RefreshCw className="w-5 h-5 text-yellow-600" />;
            case 'cancelled':
                return <AlertCircle className="w-5 h-5 text-red-600" />;
            default:
                return <Clock className="w-5 h-5 text-gray-600" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'delivered':
                return 'bg-green-100 text-green-800';
            case 'shipped':
                return 'bg-blue-100 text-blue-800';
            case 'processing':
                return 'bg-yellow-100 text-yellow-800';
            case 'cancelled':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    if (isLoading) {
        return (
            <div className="flex min-h-screen bg-gray-50">
                <AdminSidebar />
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">Loading order details...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="flex min-h-screen bg-gray-50">
                <AdminSidebar />
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Not Found</h2>
                        <p className="text-gray-600 mb-6">The order you're looking for doesn't exist.</p>
                        <Button onClick={() => router.push('/admin/orders')}>
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Orders
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-gray-50">
            <AdminSidebar />
            <div className="flex-1">
                <div className="p-8">
                    {/* Header */}
                    <div className="mb-8">
                        <Button
                            variant="ghost"
                            onClick={() => router.push('/admin/orders')}
                            className="mb-4"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Orders
                        </Button>
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">
                                    Order #{order.orderNumber}
                                </h1>
                                <p className="text-gray-600 mt-1">
                                    Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', {
                                        day: 'numeric',
                                        month: 'long',
                                        year: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                </p>
                            </div>
                            <div className="flex items-center space-x-3">
                                {getStatusIcon(order.status)}
                                <Badge className={`${getStatusColor(order.status)} text-base px-4 py-2`}>
                                    {order.status.toUpperCase()}
                                </Badge>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Main Content */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Order Items */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center">
                                        <Package className="w-5 h-5 mr-2" />
                                        Order Items ({order.items.length})
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {order.items.map((item) => (
                                            <div key={item.id} className="flex items-start space-x-4 p-4 border rounded-lg">
                                                <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                                    {item.product.images?.[0] && (
                                                        <Image
                                                            src={item.product.images[0]}
                                                            alt={item.product.name}
                                                            width={80}
                                                            height={80}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    )}
                                                </div>
                                                <div className="flex-1">
                                                    <h3 className="font-medium text-gray-900">{item.product.name}</h3>
                                                    <p className="text-sm text-gray-600 mt-1">SKU: {item.product.sku}</p>
                                                    <div className="flex items-center space-x-4 mt-2">
                                                        <span className="text-sm text-gray-600">
                                                            Quantity: {item.quantity}
                                                        </span>
                                                        <span className="text-sm text-gray-600">
                                                            Price: ₹{item.price.toLocaleString('en-IN')}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-semibold text-gray-900">
                                                        ₹{item.total.toLocaleString('en-IN')}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Order Totals */}
                                    <div className="mt-6 pt-6 border-t space-y-2">
                                        <div className="flex justify-between text-gray-600">
                                            <span>Subtotal</span>
                                            <span>₹{order.subtotal.toLocaleString('en-IN')}</span>
                                        </div>
                                        <div className="flex justify-between text-gray-600">
                                            <span>Shipping</span>
                                            <span>₹{order.shippingCost.toLocaleString('en-IN')}</span>
                                        </div>
                                        <div className="flex justify-between text-gray-600">
                                            <span>Tax</span>
                                            <span>₹{order.taxAmount.toLocaleString('en-IN')}</span>
                                        </div>
                                        <div className="flex justify-between text-xl font-bold text-gray-900 pt-2 border-t">
                                            <span>Total</span>
                                            <span>₹{order.totalAmount.toLocaleString('en-IN')}</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Order Notes */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center">
                                        <MessageSquare className="w-5 h-5 mr-2" />
                                        Order Notes
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {/* Add Note Form */}
                                    <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                                        <Textarea
                                            placeholder="Add a note about this order..."
                                            value={newNote}
                                            onChange={(e) => setNewNote(e.target.value)}
                                            className="mb-3"
                                            rows={3}
                                        />
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-2">
                                                <Checkbox
                                                    id="internal-note"
                                                    checked={isNoteInternal}
                                                    onCheckedChange={(checked) => setIsNoteInternal(checked as boolean)}
                                                />
                                                <label
                                                    htmlFor="internal-note"
                                                    className="text-sm text-gray-700 cursor-pointer flex items-center"
                                                >
                                                    <Lock className="w-4 h-4 mr-1" />
                                                    Internal note (not visible to customer)
                                                </label>
                                            </div>
                                            <Button
                                                onClick={handleAddNote}
                                                disabled={!newNote.trim() || isSubmittingNote}
                                                size="sm"
                                            >
                                                {isSubmittingNote ? 'Adding...' : 'Add Note'}
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Notes List */}
                                    <div className="space-y-3">
                                        {notes.length === 0 ? (
                                            <div className="text-center py-8 text-gray-500">
                                                <FileText className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                                                <p>No notes yet. Add one above to get started.</p>
                                            </div>
                                        ) : (
                                            notes.map((note) => (
                                                <div
                                                    key={note.id}
                                                    className={`p-4 rounded-lg border ${note.isInternal
                                                            ? 'bg-yellow-50 border-yellow-200'
                                                            : 'bg-white border-gray-200'
                                                        }`}
                                                >
                                                    <div className="flex items-start justify-between mb-2">
                                                        <div className="flex items-center space-x-2">
                                                            <span className="font-medium text-gray-900">
                                                                {note.createdBy.name}
                                                            </span>
                                                            <Badge variant="outline" className="text-xs">
                                                                {note.createdBy.role}
                                                            </Badge>
                                                            {note.isInternal && (
                                                                <Badge variant="secondary" className="text-xs">
                                                                    <Lock className="w-3 h-3 mr-1" />
                                                                    Internal
                                                                </Badge>
                                                            )}
                                                        </div>
                                                        {note.createdBy.id === user?.id && (
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleDeleteNote(note.id)}
                                                                className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </Button>
                                                        )}
                                                    </div>
                                                    <p className="text-gray-700 whitespace-pre-wrap">{note.content}</p>
                                                    <p className="text-xs text-gray-500 mt-2">
                                                        {new Date(note.createdAt).toLocaleString('en-IN', {
                                                            day: 'numeric',
                                                            month: 'short',
                                                            year: 'numeric',
                                                            hour: '2-digit',
                                                            minute: '2-digit'
                                                        })}
                                                    </p>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            {/* Order Status */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base">Order Status</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {isEditing ? (
                                        <>
                                            <div>
                                                <label className="text-sm font-medium text-gray-700 mb-2 block">
                                                    Status
                                                </label>
                                                <Select value={editedStatus} onValueChange={setEditedStatus}>
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="PENDING">Pending</SelectItem>
                                                        <SelectItem value="PROCESSING">Processing</SelectItem>
                                                        <SelectItem value="SHIPPED">Shipped</SelectItem>
                                                        <SelectItem value="DELIVERED">Delivered</SelectItem>
                                                        <SelectItem value="CANCELLED">Cancelled</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div>
                                                <label className="text-sm font-medium text-gray-700 mb-2 block">
                                                    Tracking Number (optional)
                                                </label>
                                                <Input
                                                    value={editedTracking}
                                                    onChange={(e) => setEditedTracking(e.target.value)}
                                                    placeholder="Enter tracking number"
                                                />
                                            </div>
                                            <div className="flex space-x-2">
                                                <Button onClick={handleUpdateOrder} size="sm" className="flex-1">
                                                    <Save className="w-4 h-4 mr-1" />
                                                    Save
                                                </Button>
                                                <Button
                                                    onClick={() => {
                                                        setIsEditing(false);
                                                        setEditedStatus(order.status);
                                                        setEditedTracking(order.trackingNumber || '');
                                                    }}
                                                    variant="outline"
                                                    size="sm"
                                                    className="flex-1"
                                                >
                                                    <X className="w-4 h-4 mr-1" />
                                                    Cancel
                                                </Button>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div>
                                                <p className="text-sm text-gray-600 mb-1">Current Status</p>
                                                <Badge className={getStatusColor(order.status)}>
                                                    {order.status}
                                                </Badge>
                                            </div>
                                            {order.trackingNumber && (
                                                <div>
                                                    <p className="text-sm text-gray-600 mb-1">Tracking Number</p>
                                                    <p className="font-mono text-sm">{order.trackingNumber}</p>
                                                </div>
                                            )}
                                            <Button onClick={() => setIsEditing(true)} size="sm" className="w-full">
                                                <Edit className="w-4 h-4 mr-2" />
                                                Update Status
                                            </Button>
                                        </>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Customer */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base flex items-center">
                                        <User className="w-4 h-4 mr-2" />
                                        Customer
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    <p className="font-medium text-gray-900">{order.user.name}</p>
                                    <p className="text-sm text-gray-600">{order.user.email}</p>
                                    {order.user.phone && (
                                        <p className="text-sm text-gray-600">{order.user.phone}</p>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Shipping Address */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base flex items-center">
                                        <MapPin className="w-4 h-4 mr-2" />
                                        Shipping Address
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-sm text-gray-600 space-y-1">
                                        <p>{order.shippingAddress.addressLine1}</p>
                                        {order.shippingAddress.addressLine2 && (
                                            <p>{order.shippingAddress.addressLine2}</p>
                                        )}
                                        <p>
                                            {order.shippingAddress.city}, {order.shippingAddress.state}
                                        </p>
                                        <p>{order.shippingAddress.postalCode}</p>
                                        <p>{order.shippingAddress.country}</p>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Payment */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base flex items-center">
                                        <CreditCard className="w-4 h-4 mr-2" />
                                        Payment
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-600">Method</span>
                                        <span className="text-sm font-medium capitalize">
                                            {order.paymentMethod}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-600">Status</span>
                                        <Badge variant={order.paymentStatus === 'PAID' ? 'default' : 'secondary'}>
                                            {order.paymentStatus}
                                        </Badge>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
