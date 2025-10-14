'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { XCircle, RefreshCw, Home, Phone } from 'lucide-react';
import Link from 'next/link';

export default function PaymentFailedContent() {
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
                router.push('/auth');
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

    const retryPayment = async () => {
        if (!paymentData?.order?.id) return;

        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/v1/payments/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    orderId: paymentData.order.id,
                    mobileNumber: '9999999999', // Default or get from user profile
                    email: 'user@example.com' // Default or get from user profile
                })
            });

            const data = await response.json();

            if (data.success) {
                // Redirect to PhonePe payment page
                window.location.href = data.data.redirectUrl;
            } else {
                setError(data.error || 'Failed to retry payment');
            }
        } catch (err) {
            setError('Failed to retry payment. Please try again.');
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Checking payment status...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4">
            <div className="max-w-4xl mx-auto">
                <Card className="mb-8">
                    <CardHeader className="text-center">
                        <div className="mx-auto w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-4">
                            <XCircle className="w-10 h-10 text-red-600" />
                        </div>
                        <CardTitle className="text-2xl text-red-600">Payment Failed</CardTitle>
                        <p className="text-gray-600">
                            We're sorry, but your payment could not be processed successfully.
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
                                        <p className="font-medium text-red-600 capitalize">
                                            {paymentData.status}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Amount</p>
                                        <p className="font-medium text-lg">
                                            ₹{paymentData.amount.toLocaleString('en-IN')}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Payment Method</p>
                                        <p className="font-medium">{paymentData.paymentMethod}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4">
                            <Button
                                onClick={retryPayment}
                                className="flex-1"
                                disabled={!paymentData?.order?.id}
                            >
                                <RefreshCw className="w-4 h-4 mr-2" />
                                Retry Payment
                            </Button>
                            <Link href="/dashboard" className="flex-1">
                                <Button variant="outline" className="w-full">
                                    View Order Details
                                </Button>
                            </Link>
                            <Link href="/" className="flex-1">
                                <Button variant="outline" className="w-full">
                                    <Home className="w-4 h-4 mr-2" />
                                    Back to Home
                                </Button>
                            </Link>
                        </div>

                        {/* Help Section */}
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                            <h4 className="font-semibold text-blue-900 mb-3">Need Help?</h4>
                            <div className="space-y-3">
                                <div className="flex items-start space-x-3">
                                    <Phone className="w-5 h-5 text-blue-600 mt-0.5" />
                                    <div>
                                        <p className="font-medium text-blue-900">Customer Support</p>
                                        <p className="text-sm text-blue-800">
                                            Call us at: +91-8010-123-456 (Mon-Sat, 9AM-6PM)
                                        </p>
                                    </div>
                                </div>
                                <div className="text-sm text-blue-800">
                                    <p className="font-medium mb-1">Common payment issues:</p>
                                    <ul className="space-y-1 ml-4">
                                        <li>• Insufficient bank balance</li>
                                        <li>• Incorrect card details or OTP</li>
                                        <li>• Bank server issues</li>
                                        <li>• Transaction timeout</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* Alternative Payment Options */}
                        <div className="bg-gray-50 rounded-lg p-6">
                            <h4 className="font-semibold mb-3">Alternative Payment Options</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="border rounded-lg p-4">
                                    <h5 className="font-medium mb-2">Net Banking</h5>
                                    <p className="text-sm text-gray-600">
                                        Pay directly from your bank account
                                    </p>
                                </div>
                                <div className="border rounded-lg p-4">
                                    <h5 className="font-medium mb-2">UPI Apps</h5>
                                    <p className="text-sm text-gray-600">
                                        Use Google Pay, Paytm, or other UPI apps
                                    </p>
                                </div>
                                <div className="border rounded-lg p-4">
                                    <h5 className="font-medium mb-2">Wallets</h5>
                                    <p className="text-sm text-gray-600">
                                        Pay using PhonePe, Amazon Pay, etc.
                                    </p>
                                </div>
                                <div className="border rounded-lg p-4">
                                    <h5 className="font-medium mb-2">COD (Cash on Delivery)</h5>
                                    <p className="text-sm text-gray-600">
                                        Pay when you receive your order
                                    </p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}