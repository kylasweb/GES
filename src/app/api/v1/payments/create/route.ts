import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { phonePeService } from '@/lib/phonepe';
import { verifyToken } from '@/lib/auth';

const createPaymentSchema = z.object({
  orderId: z.string().min(1, 'Order ID is required'),
  mobileNumber: z.string().regex(/^[6-9]\d{9}$/, 'Invalid Indian mobile number'),
  email: z.string().email('Invalid email address').optional()
});

export async function POST(request: NextRequest) {
  try {
    // Get user from token
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const user = await verifyToken(token);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Invalid authentication' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = createPaymentSchema.parse(body);

    // Get order details
    const order = await db.order.findFirst({
      where: {
        id: validatedData.orderId,
        userId: user.id
      },
      include: {
        items: true
      }
    });

    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }

    if (order.paymentStatus === 'PAID') {
      return NextResponse.json(
        { success: false, error: 'Order already paid' },
        { status: 400 }
      );
    }

    // Generate transaction ID
    const transactionId = phonePeService.generateTransactionId();

    // Create transaction record
    await db.transaction.create({
      data: {
        transactionId,
        orderId: order.id,
        gateway: 'PHONEPE',
        amount: order.totalAmount,
        currency: 'INR',
        status: 'PENDING',
        paymentMethod: 'PHONEPE',
        provider: 'PHONEPE',
        createdAt: new Date()
      }
    });

    // Create PhonePe payment order
    const paymentResponse = await phonePeService.createPaymentOrder({
      merchantId: process.env.PHONEPE_MERCHANT_ID!,
      transactionId,
      amount: Number(order.totalAmount),
      merchantUserId: user.id,
      redirectUrl: `${process.env.NEXT_PUBLIC_APP_URL}/payment/success`,
      callbackUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/v1/payments/callback`,
      mobileNumber: validatedData.mobileNumber,
      email: validatedData.email
    });

    if (paymentResponse.success) {
      return NextResponse.json({
        success: true,
        data: {
          transactionId,
          redirectUrl: paymentResponse.data?.redirectUrl,
          amount: order.totalAmount,
          orderId: order.id
        }
      });
    } else {
      // Update transaction status to failed
      await db.transaction.update({
        where: { transactionId },
        data: {
          status: 'FAILED',
          updatedAt: new Date()
        }
      });

      return NextResponse.json(
        { success: false, error: paymentResponse.error },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Payment creation error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.issues[0].message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}