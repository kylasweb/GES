'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
    ArrowLeft,
    Package,
    MapPin,
    CreditCard,
    Clock,
    Truck,
    CheckCircle,
    AlertCircle,
    RefreshCw,
    FileText,
    MessageSquare,
    Download
} from 'lucide-react';
import { useAuthStore } from '@/lib/store/auth';
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

export default function CustomerOrderDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { token, user } = useAuthStore();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(true);
    const [order, setOrder] = useState<Order | null>(null);
    const [notes, setNotes] = useState<OrderNote[]>([]);
    const [newNote, setNewNote] = useState('');
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
                // Verify this order belongs to the current user
                if (data.data.user.id !== user?.id) {
                    toast({
                        title: 'Access Denied',
                        description: 'You do not have permission to view this order',
                        variant: 'destructive',
                    });
                    router.push('/dashboard');
                    return;
                }
                setOrder(data.data);
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
                // Filter out internal notes for customers
                setNotes(data.data.filter((note: OrderNote) => !note.isInternal));
            }
        } catch (err) {
            console.error('Failed to load notes:', err);
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
                    isInternal: false
                })
            });

            const data = await response.json();

            if (data.success) {
                setNotes([data.data, ...notes]);
                setNewNote('');
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

    const getStatusIcon = (status: string) => {
        switch (status.toLowerCase()) {
            case 'delivered':
                return <CheckCircle className="w-6 h-6 text-green-600" />;
            case 'shipped':
                return <Truck className="w-6 h-6 text-blue-600" />;
            case 'processing':
                return <RefreshCw className="w-6 h-6 text-yellow-600" />;
            case 'cancelled':
                return <AlertCircle className="w-6 h-6 text-red-600" />;
            default:
                return <Clock className="w-6 h-6 text-gray-600" />;
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

    const getStatusMessage = (status: string) => {
        switch (status.toLowerCase()) {
            case 'pending':
                return 'Your order has been received and is awaiting processing.';
            case 'processing':
                return 'Your order is being prepared for shipment.';
            case 'shipped':
                return 'Your order is on its way!';
            case 'delivered':
                return 'Your order has been delivered. We hope you enjoy your purchase!';
            case 'cancelled':
                return 'This order has been cancelled.';
            default:
                return 'Order status update.';
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading order details...</p>
                </div>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center max-w-md mx-auto px-6">
                    <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Not Found</h2>
                    <p className="text-gray-600 mb-6">
                        We couldn't find the order you're looking for. It may have been removed or you may not have permission to view it.
                    </p>
                    <Button onClick={() => router.push('/dashboard')}>
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Dashboard
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-6xl mx-auto px-6 py-8">
                {/* Header */}
                <Button
                    variant="ghost"
                    onClick={() => router.push('/dashboard')}
                    className="mb-6"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Dashboard
                </Button>

                {/* Order Status Banner */}
                <Card className="mb-6 bg-gradient-to-r from-green-50 to-blue-50">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                {getStatusIcon(order.status)}
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-900">
                                        Order #{order.orderNumber}
                                    </h1>
                                    <p className="text-gray-600 mt-1">{getStatusMessage(order.status)}</p>
                                </div>
                            </div>
                            <Badge className={`${getStatusColor(order.status)} text-lg px-4 py-2`}>
                                {order.status.toUpperCase()}
                            </Badge>
                        </div>

                        {order.trackingNumber && (
                            <div className="mt-4 p-4 bg-white rounded-lg border border-blue-200">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600 mb-1">Tracking Number</p>
                                        <p className="font-mono text-lg font-semibold text-gray-900">
                                            {order.trackingNumber}
                                        </p>
                                    </div>
                                    <Button variant="outline" size="sm">
                                        <Truck className="w-4 h-4 mr-2" />
                                        Track Package
                                    </Button>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Order Items */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <Package className="w-5 h-5 mr-2" />
                                    Items in Your Order ({order.items.length})
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {order.items.map((item) => (
                                        <div key={item.id} className="flex items-start space-x-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors">
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
                                                        ₹{item.price.toLocaleString('en-IN')} each
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
                                        <span>Total Paid</span>
                                        <span>₹{order.totalAmount.toLocaleString('en-IN')}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Order Notes & Communication */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <MessageSquare className="w-5 h-5 mr-2" />
                                    Order Communication
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {/* Add Note Form */}
                                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                                    <p className="text-sm text-gray-600 mb-3">
                                        Have a question or comment about this order? Leave a note and we'll get back to you.
                                    </p>
                                    <Textarea
                                        placeholder="Type your message here..."
                                        value={newNote}
                                        onChange={(e) => setNewNote(e.target.value)}
                                        className="mb-3"
                                        rows={3}
                                    />
                                    <Button
                                        onClick={handleAddNote}
                                        disabled={!newNote.trim() || isSubmittingNote}
                                        size="sm"
                                    >
                                        {isSubmittingNote ? 'Sending...' : 'Send Message'}
                                    </Button>
                                </div>

                                {/* Notes List */}
                                <div className="space-y-3">
                                    {notes.length === 0 ? (
                                        <div className="text-center py-8 text-gray-500">
                                            <MessageSquare className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                                            <p>No messages yet.</p>
                                        </div>
                                    ) : (
                                        notes.map((note) => (
                                            <div
                                                key={note.id}
                                                className="p-4 rounded-lg border bg-white"
                                            >
                                                <div className="flex items-center space-x-2 mb-2">
                                                    <span className="font-medium text-gray-900">
                                                        {note.createdBy.name}
                                                    </span>
                                                    <Badge variant="outline" className="text-xs">
                                                        {note.createdBy.role}
                                                    </Badge>
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
                        {/* Order Details */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Order Details</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div>
                                    <p className="text-sm text-gray-600">Order Number</p>
                                    <p className="font-mono font-medium">{order.orderNumber}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Order Date</p>
                                    <p className="font-medium">
                                        {new Date(order.createdAt).toLocaleDateString('en-IN', {
                                            day: 'numeric',
                                            month: 'long',
                                            year: 'numeric'
                                        })}
                                    </p>
                                </div>
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
                                <div className="text-sm text-gray-700 space-y-1">
                                    <p className="font-medium">{order.user.name}</p>
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
                                    Payment Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div>
                                    <p className="text-sm text-gray-600">Payment Method</p>
                                    <p className="font-medium capitalize">{order.paymentMethod}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Payment Status</p>
                                    <Badge variant={order.paymentStatus === 'PAID' ? 'default' : 'secondary'}>
                                        {order.paymentStatus}
                                    </Badge>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Actions */}
                        <Card>
                            <CardContent className="p-4">
                                <Button variant="outline" className="w-full mb-2">
                                    <Download className="w-4 h-4 mr-2" />
                                    Download Invoice
                                </Button>
                                <Button variant="outline" className="w-full">
                                    <FileText className="w-4 h-4 mr-2" />
                                    Request Return
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
