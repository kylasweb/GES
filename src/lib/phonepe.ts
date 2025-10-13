import { createHash, randomBytes } from 'crypto';
import { db } from '@/lib/db';

export interface PhonePePaymentRequest {
  merchantId: string;
  transactionId: string;
  amount: number;
  merchantUserId: string;
  redirectUrl: string;
  callbackUrl: string;
  mobileNumber: string;
  email?: string;
}

export interface PhonePePaymentResponse {
  success: boolean;
  data?: {
    redirectUrl: string;
    transactionId: string;
  };
  error?: string;
}

export interface PhonePeCallbackData {
  code: string;
  merchantId: string;
  transactionId: string;
  amount: number;
  providerReferenceId?: string;
  paymentState: string;
  payResponseCode?: string;
  responseCode?: string;
  addedOn?: string;
  paymentInstrument?: {
    type: string;
    cardType?: string;
    bankTransactionId?: string;
  };
}

class PhonePeService {
  private baseUrl: string;
  private saltKey: string;
  private saltIndex: string;
  private merchantId: string;

  constructor() {
    // PhonePe sandbox environment
    this.baseUrl = process.env.PHONEPE_ENV === 'production'
      ? 'https://api.phonepe.com/v1'
      : 'https://api-preprod.phonepe.com/v1';

    this.saltKey = process.env.PHONEPE_SALT_KEY || '';
    this.saltIndex = process.env.PHONEPE_SALT_INDEX || '1';
    this.merchantId = process.env.PHONEPE_MERCHANT_ID || '';
  }

  private generateChecksum(payload: string): string {
    const checksumString = `${payload}${this.saltKey}`;
    return createHash('sha256').update(checksumString).digest('hex') + `###${this.saltIndex}`;
  }

  private validateChecksum(payload: string, receivedChecksum: string): boolean {
    const expectedChecksum = this.generateChecksum(payload);
    return expectedChecksum === receivedChecksum;
  }

  async createPaymentOrder(request: PhonePePaymentRequest): Promise<PhonePePaymentResponse> {
    try {
      const payload = {
        merchantId: this.merchantId,
        merchantTransactionId: request.transactionId,
        amount: request.amount * 100, // Convert to paise
        redirectUrl: request.redirectUrl,
        redirectMode: 'REDIRECT',
        callbackUrl: request.callbackUrl,
        paymentInstrument: {
          type: 'PAY_PAGE'
        }
      };

      const base64Payload = Buffer.from(JSON.stringify(payload)).toString('base64');
      const checksum = this.generateChecksum(base64Payload);

      const response = await fetch(`${this.baseUrl}/pg/v1/pay`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-VERIFY': checksum,
          'accept': 'application/json'
        },
        body: JSON.stringify({
          request: base64Payload
        })
      });

      const data = await response.json();

      if (data.success) {
        const redirectUrl = `${data.data.instrumentResponse.redirectInfo.url}?transactionId=${request.transactionId}`;

        return {
          success: true,
          data: {
            redirectUrl,
            transactionId: request.transactionId
          }
        };
      } else {
        return {
          success: false,
          error: data.message || 'Failed to create payment order'
        };
      }
    } catch (error) {
      console.error('PhonePe payment error:', error);
      return {
        success: false,
        error: 'Payment service unavailable'
      };
    }
  }

  async checkPaymentStatus(transactionId: string): Promise<{
    success: boolean;
    status: string;
    data?: any;
    error?: string;
  }> {
    try {
      const endpoint = `/pg/v1/status/${this.merchantId}/${transactionId}`;
      const checksum = this.generateChecksum(endpoint);

      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-VERIFY': checksum,
          'X-MERCHANT-ID': this.merchantId,
          'accept': 'application/json'
        }
      });

      const data = await response.json();

      if (data.success) {
        return {
          success: true,
          status: data.data.state,
          data: data.data
        };
      } else {
        return {
          success: false,
          status: 'FAILED',
          error: data.message || 'Payment status check failed'
        };
      }
    } catch (error) {
      console.error('PhonePe status check error:', error);
      return {
        success: false,
        status: 'FAILED',
        error: 'Payment status service unavailable'
      };
    }
  }

  async processCallback(callbackData: any, headers: Headers): Promise<{
    success: boolean;
    transactionId: string;
    status: string;
    error?: string;
  }> {
    try {
      // Extract the response from callback
      const response = callbackData.response;
      const receivedChecksum = headers.get('x-verify');

      if (!receivedChecksum) {
        return {
          success: false,
          transactionId: '',
          status: 'FAILED',
          error: 'Missing checksum'
        };
      }

      // Validate checksum
      const base64Response = Buffer.from(JSON.stringify(response)).toString('base64');
      if (!this.validateChecksum(base64Response, receivedChecksum)) {
        return {
          success: false,
          transactionId: '',
          status: 'FAILED',
          error: 'Invalid checksum'
        };
      }

      const transactionId = response.merchantTransactionId;
      const paymentState = response.state;

      // Update payment status in database
      await this.updatePaymentStatus(transactionId, paymentState, response);

      return {
        success: true,
        transactionId,
        status: paymentState
      };
    } catch (error) {
      console.error('PhonePe callback processing error:', error);
      return {
        success: false,
        transactionId: '',
        status: 'FAILED',
        error: 'Callback processing failed'
      };
    }
  }

  private async updatePaymentStatus(
    transactionId: string,
    status: string,
    response: any
  ): Promise<void> {
    try {
      // Find the transaction record
      const transaction = await db.transaction.findUnique({
        where: { transactionId }
      });

      if (!transaction) {
        console.error('Transaction not found:', transactionId);
        return;
      }

      // Update transaction status
      await db.transaction.update({
        where: { transactionId },
        data: {
          status: status === 'COMPLETED' ? 'COMPLETED' : 'FAILED',
          paymentMethod: 'PHONEPE',
          provider: 'PHONEPE',
          gatewayTransactionId: response.transactionId,
          gatewayResponse: response,
          updatedAt: new Date()
        }
      });

      // If payment is successful, update order status
      if (status === 'COMPLETED') {
        await db.order.update({
          where: { id: transaction.orderId },
          data: {
            status: 'PROCESSING',
            paymentStatus: 'PAID',
            updatedAt: new Date()
          }
        });

        // Update product inventory
        const orderItems = await db.orderItem.findMany({
          where: { orderId: transaction.orderId }
        });

        for (const item of orderItems) {
          await db.productInventory.update({
            where: { productId: item.productId },
            data: {
              quantity: {
                decrement: item.quantity
              }
            }
          });
        }
      } else {
        // Payment failed, update order status
        await db.order.update({
          where: { id: transaction.orderId },
          data: {
            status: 'CANCELLED',
            paymentStatus: 'FAILED',
            updatedAt: new Date()
          }
        });
      }
    } catch (error) {
      console.error('Error updating payment status:', error);
    }
  }

  generateTransactionId(): string {
    const timestamp = Date.now();
    const random = randomBytes(4).toString('hex').toUpperCase();
    return `TXN${timestamp}${random}`;
  }

  async initiateRefund(
    transactionId: string,
    amount: number,
    reason: string
  ): Promise<{
    success: boolean;
    refundId?: string;
    error?: string;
  }> {
    try {
      const refundTransactionId = this.generateTransactionId();

      const payload = {
        merchantId: this.merchantId,
        merchantTransactionId: refundTransactionId,
        originalTransactionId: transactionId,
        amount: amount * 100, // Convert to paise
        callbacks: [
          {
            url: `${process.env.NEXT_PUBLIC_APP_URL}/api/v1/payments/refund/callback`
          }
        ]
      };

      const base64Payload = Buffer.from(JSON.stringify(payload)).toString('base64');
      const checksum = this.generateChecksum(base64Payload);

      const response = await fetch(`${this.baseUrl}/pg/v1/refund`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-VERIFY': checksum,
          'accept': 'application/json'
        },
        body: JSON.stringify({
          request: base64Payload
        })
      });

      const data = await response.json();

      if (data.success) {
        // Create refund record in database
        await db.refund.create({
          data: {
            refundId: refundTransactionId,
            transactionId,
            amount,
            reason,
            status: 'PENDING',
            createdAt: new Date()
          }
        });

        return {
          success: true,
          refundId: refundTransactionId
        };
      } else {
        return {
          success: false,
          error: data.message || 'Refund initiation failed'
        };
      }
    } catch (error) {
      console.error('PhonePe refund error:', error);
      return {
        success: false,
        error: 'Refund service unavailable'
      };
    }
  }
}

export const phonePeService = new PhonePeService();