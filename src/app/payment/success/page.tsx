'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Home, Download, Eye } from 'lucide-react';
import Link from 'next/link';

export default function PaymentSuccessPage() {
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
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `/api/v1/orders/${paymentData.order.id}/invoice`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `invoice-${paymentData.order.id}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (err) {
      console.error('Error downloading invoice:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verifying payment status...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 className="w-8 h-8 text-red-600" />
            </div>
            <CardTitle className="text-red-600">Payment Verification Failed</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-600">{error}</p>
            <div className="space-y-2">
              <Button 
                onClick={() => window.location.reload()} 
                className="w-full"
              >
                Try Again
              </Button>
              <Link href="/contact">
                <Button variant="outline" className="w-full">
                  Contact Support
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
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
              Thank you for your purchase. Your order has been confirmed.
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Order Details */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="font-semibold text-lg mb-4">Order Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Order ID</p>
                  <p className="font-medium">{paymentData.order.id}</p>
                </div>
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
                  <p className="text-sm text-gray-600">Order Status</p>
                  <p className="font-medium text-blue-600 capitalize">
                    {paymentData.order.status}
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
              </div>
            </div>

            {/* Order Items */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="font-semibold text-lg mb-4">Order Items</h3>
              <div className="space-y-3">
                {paymentData.order.items.map((item: any, index: number) => (
                  <div key={index} className="flex justify-between items-center pb-3 border-b last:border-b-0">
                    <div>
                      <p className="font-medium">{item.productName}</p>
                      <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-medium">₹{item.total.toLocaleString('en-IN')}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/dashboard" className="flex-1">
                <Button className="w-full">
                  <Eye className="w-4 h-4 mr-2" />
                  View Order Details
                </Button>
              </Link>
              <Button 
                variant="outline" 
                onClick={downloadInvoice}
                className="flex-1"
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

            {/* Next Steps */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-2">What happens next?</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• You will receive an order confirmation email shortly</li>
                <li>• Our team will process your order within 1-2 business days</li>
                <li>• You will receive tracking information once your order ships</li>
                <li>• Estimated delivery: 3-7 business days</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}