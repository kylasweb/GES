import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { phonePeService } from '@/lib/phonepe';
import { verifyToken } from '@/lib/auth';

const refundSchema = z.object({
  transactionId: z.string().min(1, 'Transaction ID is required'),
  amount: z.number().positive('Amount must be positive'),
  reason: z.string().min(1, 'Reason is required').max(500, 'Reason too long')
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
    const validatedData = refundSchema.parse(body);

    // Get transaction details
    const transaction = await db.transaction.findFirst({
      where: {
        transactionId: validatedData.transactionId,
        order: {
          userId: user.id
        }
      },
      include: {
        order: true
      }
    });

    if (!transaction) {
      return NextResponse.json(
        { success: false, error: 'Transaction not found' },
        { status: 404 }
      );
    }

    if (transaction.status !== 'COMPLETED') {
      return NextResponse.json(
        { success: false, error: 'Only completed transactions can be refunded' },
        { status: 400 }
      );
    }

    if (validatedData.amount > Number(transaction.amount)) {
      return NextResponse.json(
        { success: false, error: 'Refund amount cannot exceed transaction amount' },
        { status: 400 }
      );
    }

    // Check if refund already exists
    const existingRefund = await db.refund.findFirst({
      where: {
        transactionId: validatedData.transactionId,
        status: 'COMPLETED'
      }
    });

    if (existingRefund) {
      return NextResponse.json(
        { success: false, error: 'Refund already processed for this transaction' },
        { status: 400 }
      );
    }

    // Initiate refund with PhonePe
    const refundResult = await phonePeService.initiateRefund(
      validatedData.transactionId,
      validatedData.amount,
      validatedData.reason
    );

    if (refundResult.success) {
      return NextResponse.json({
        success: true,
        data: {
          refundId: refundResult.refundId,
          transactionId: validatedData.transactionId,
          amount: validatedData.amount,
          reason: validatedData.reason,
          status: 'PENDING'
        }
      });
    } else {
      return NextResponse.json(
        { success: false, error: refundResult.error },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Refund creation error:', error);

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

// Get refund status
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

    // Get refund details
    const refunds = await db.refund.findMany({
      where: {
        transactionId,
        transaction: {
          order: {
            userId: user.id
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({
      success: true,
      data: refunds.map(refund => ({
        refundId: refund.refundId,
        transactionId: refund.transactionId,
        amount: refund.amount,
        reason: refund.reason,
        status: refund.status,
        createdAt: refund.createdAt,
        updatedAt: refund.updatedAt
      }))
    });
  } catch (error) {
    console.error('Refund status check error:', error);

    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}