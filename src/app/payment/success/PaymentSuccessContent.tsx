'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Home, Download, Eye } from 'lucide-react';
import Link from 'next/link';

export default function PaymentSuccessContent() {
    const [isLoading, setIsLoading] = useState(true);
    const [paymentData, setPaymentData] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    const searchParams = useSearchParams();
    const router = useRouter();
    const transactionId = searchParams.get('transactionId');

    useEffect(() => {
        if (!transactionId) {
            setError('Transaction ID not found');
            setIsLoading(false);
            return;
        }

        checkPaymentStatus();
    }, [transactionId]);

    const checkPaymentStatus = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                router.push('/auth/login');
                return;
            }

            const response = await fetch(
                `/api/v1/payments/status?transactionId=${transactionId}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            const data = await response.json();

            if (data.success) {
                setPaymentData(data.data);
            } else {
                setError(data.error || 'Failed to fetch payment status');
            }
        } catch (err) {
            setError('Network error. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const downloadInvoice = async () => {
        if (!paymentData?.order?.id) return;

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/v1/orders/${paymentData.order.id}/invoice`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `invoice-${paymentData.transactionId}.pdf`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
            } else {
                setError('Failed to download invoice');
            }
        } catch (err) {
            setError('Failed to download invoice. Please try again.');
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Verifying payment...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4">
            <div className="max-w-4xl mx-auto">
                <Card className="mb-8">
                    <CardHeader className="text-center">
                        <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
                            <CheckCircle2 className="w-10 h-10 text-green-600" />
                        </div>
                        <CardTitle className="text-2xl text-green-600">Payment Successful!</CardTitle>
                        <p className="text-gray-600">
                            Thank you for your payment. Your transaction has been completed successfully.
                        </p>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {error && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                <p className="text-red-800 text-sm">{error}</p>
                            </div>
                        )}

                        {/* Transaction Details */}
                        {paymentData && (
                            <div className="bg-gray-50 rounded-lg p-6">
                                <h3 className="font-semibold text-lg mb-4">Transaction Details</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-gray-600">Transaction ID</p>
                                        <p className="font-medium">{paymentData.transactionId}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Payment Status</p>
                                        <p className="font-medium text-green-600 capitalize">
                                            {paymentData.status}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Amount Paid</p>
                                        <p className="font-medium text-lg">
                                            ₹{paymentData.amount.toLocaleString('en-IN')}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Payment Method</p>
                                        <p className="font-medium">{paymentData.paymentMethod}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Payment Date</p>
                                        <p className="font-medium">
                                            {new Date(paymentData.createdAt).toLocaleDateString('en-IN', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Order ID</p>
                                        <p className="font-medium">#{paymentData.order?.id}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4">
                            <Link href="/dashboard" className="flex-1">
                                <Button className="w-full">
                                    <Eye className="w-4 h-4 mr-2" />
                                    View Order Details
                                </Button>
                            </Link>
                            <Button
                                onClick={downloadInvoice}
                                variant="outline"
                                className="flex-1"
                                disabled={!paymentData?.order?.id}
                            >
                                <Download className="w-4 h-4 mr-2" />
                                Download Invoice
                            </Button>
                            <Link href="/" className="flex-1">
                                <Button variant="outline" className="w-full">
                                    <Home className="w-4 h-4 mr-2" />
                                    Back to Home
                                </Button>
                            </Link>
                        </div>

                        {/* Order Summary */}
                        {paymentData?.order && (
                            <div className="bg-gray-50 rounded-lg p-6">
                                <h4 className="font-semibold mb-4">Order Summary</h4>
                                <div className="space-y-3">
                                    {paymentData.order.items?.map((item: any, index: number) => (
                                        <div key={index} className="flex justify-between items-center">
                                            <div className="flex-1">
                                                <p className="font-medium">{item.product?.name}</p>
                                                <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                                            </div>
                                            <p className="font-medium">
                                                ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                                            </p>
                                        </div>
                                    ))}
                                    <div className="border-t pt-3">
                                        <div className="flex justify-between items-center font-semibold">
                                            <p>Total Amount</p>
                                            <p>₹{paymentData.amount.toLocaleString('en-IN')}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Next Steps */}
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                            <h4 className="font-semibold text-blue-900 mb-3">What's Next?</h4>
                            <div className="space-y-3">
                                <div className="flex items-start space-x-3">
                                    <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                                        1
                                    </div>
                                    <div>
                                        <p className="font-medium text-blue-900">Order Processing</p>
                                        <p className="text-sm text-blue-800">
                                            We'll start processing your order within 24 hours.
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-start space-x-3">
                                    <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                                        2
                                    </div>
                                    <div>
                                        <p className="font-medium text-blue-900">Shipping</p>
                                        <p className="text-sm text-blue-800">
                                            You'll receive tracking information once your order ships.
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-start space-x-3">
                                    <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                                        3
                                    </div>
                                    <div>
                                        <p className="font-medium text-blue-900">Delivery</p>
                                        <p className="text-sm text-blue-800">
                                            Expected delivery within 3-5 business days.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Contact Information */}
                        <div className="text-center text-gray-600">
                            <p>Questions about your order?</p>
                            <p className="font-medium">Contact us: +91-8010-123-456 | support@example.com</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}