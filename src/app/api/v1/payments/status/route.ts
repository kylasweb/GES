import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { phonePeService } from '@/lib/phonepe';
import { verifyToken } from '@/lib/auth';

const statusSchema = z.object({
  transactionId: z.string().min(1, 'Transaction ID is required')
});

export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const transactionId = searchParams.get('transactionId');

    if (!transactionId) {
      return NextResponse.json(
        { success: false, error: 'Transaction ID is required' },
        { status: 400 }
      );
    }

    // Validate transaction ID format
    statusSchema.parse({ transactionId });

    // Get transaction from database
    const transaction = await db.transaction.findFirst({
      where: {
        transactionId,
        order: {
          userId: user.id
        }
      },
      include: {
        order: {
          include: {
            items: {
              include: {
                product: true
              }
            }
          }
        }
      }
    });

    if (!transaction) {
      return NextResponse.json(
        { success: false, error: 'Transaction not found' },
        { status: 404 }
      );
    }

    // Check payment status with PhonePe
    const phonePeStatus = await phonePeService.checkPaymentStatus(transactionId);

    if (phonePeStatus.success && phonePeStatus.status !== transaction.status) {
      // Update transaction status if it has changed
      await db.transaction.update({
        where: { transactionId },
        data: {
          status: phonePeStatus.status,
          gatewayResponse: phonePeStatus.data,
          updatedAt: new Date()
        }
      });

      transaction.status = phonePeStatus.status;
    }

    return NextResponse.json({
      success: true,
      data: {
        transactionId: transaction.transactionId,
        status: transaction.status,
        amount: transaction.amount,
        currency: transaction.currency,
        paymentMethod: transaction.paymentMethod,
        createdAt: transaction.createdAt,
        updatedAt: transaction.updatedAt,
        order: {
          id: transaction.order.id,
          status: transaction.order.status,
          paymentStatus: transaction.order.paymentStatus,
          totalAmount: transaction.order.totalAmount,
          items: transaction.order.items.map(item => ({
            id: item.id,
            productName: item.product.name,
            quantity: item.quantity,
            price: item.unitPrice,
            total: Number(item.unitPrice) * item.quantity
          }))
        }
      }
    });
  } catch (error) {
    console.error('Payment status check error:', error);

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