import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { z } from 'zod';
import { Decimal } from '@prisma/client/runtime/library';

const giftCardSchema = z.object({
    amount: z.number().positive().min(100).max(50000),
    recipientEmail: z.string().email(),
    recipientName: z.string().min(1),
    message: z.string().optional()
});

const checkBalanceSchema = z.object({
    code: z.string().min(1)
});

const applyGiftCardSchema = z.object({
    code: z.string().min(1),
    orderId: z.string()
});

// Helper function to convert Decimal to number
function toNumber(value: Decimal | number): number {
    if (typeof value === 'number') {
        return value;
    }
    return typeof value === 'object' && 'toNumber' in value
        ? (value as Decimal).toNumber()
        : Number(value);
}

// Helper function to handle nullable dates
function safeDate(date: Date | null): Date {
    return date ? new Date(date) : new Date();
}

// POST - Purchase gift card
export async function POST(request: NextRequest) {
    try {
        const token = request.headers.get('authorization')?.replace('Bearer ', '');
        if (!token) {
            return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
        }

        const user = await verifyToken(token);
        if (!user) {
            return NextResponse.json({ success: false, error: 'Invalid authentication' }, { status: 401 });
        }

        const body = await request.json();
        const validated = giftCardSchema.parse(body);

        // Generate unique code
        const code = `GC-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

        // Set expiry to 1 year from now
        const expiresAt = new Date();
        expiresAt.setFullYear(expiresAt.getFullYear() + 1);

        const giftCard = await db.giftCard.create({
            data: {
                code,
                initialValue: validated.amount,
                balance: validated.amount,
                currency: 'INR',
                purchasedBy: user.id,
                recipientEmail: validated.recipientEmail,
                recipientName: validated.recipientName,
                message: validated.message,
                status: 'ACTIVE',
                expiresAt
            }
        });

        return NextResponse.json({ success: true, data: giftCard }, { status: 201 });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ success: false, error: 'Validation failed', details: error.issues }, { status: 400 });
        }
        console.error('Create gift card error:', error);
        return NextResponse.json({ success: false, error: 'Failed to create gift card' }, { status: 500 });
    }
}

// GET - Check gift card balance
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const code = searchParams.get('code');

        if (!code) {
            return NextResponse.json({ success: false, error: 'Gift card code required' }, { status: 400 });
        }

        const giftCard = await db.giftCard.findUnique({
            where: { code },
            select: {
                id: true,
                code: true,
                balance: true,
                currency: true,
                status: true,
                expiresAt: true
            }
        });

        if (!giftCard) {
            return NextResponse.json({ success: false, error: 'Gift card not found' }, { status: 404 });
        }

        // Check if expired
        if (new Date() > safeDate(giftCard.expiresAt)) {
            if (giftCard.status !== 'EXPIRED') {
                await db.giftCard.update({
                    where: { code },
                    data: { status: 'EXPIRED' }
                });
            }
            return NextResponse.json({
                success: false,
                error: 'Gift card has expired',
                data: { ...giftCard, status: 'EXPIRED' }
            }, { status: 400 });
        }

        if (giftCard.status !== 'ACTIVE') {
            return NextResponse.json({
                success: false,
                error: `Gift card is ${giftCard.status.toLowerCase()}`,
                data: giftCard
            }, { status: 400 });
        }

        return NextResponse.json({ success: true, data: giftCard });
    } catch (error) {
        console.error('Check balance error:', error);
        return NextResponse.json({ success: false, error: 'Failed to check balance' }, { status: 500 });
    }
}

// POST - Apply gift card to order
export async function PATCH(request: NextRequest) {
    try {
        const token = request.headers.get('authorization')?.replace('Bearer ', '');
        if (!token) {
            return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
        }

        const user = await verifyToken(token);
        if (!user) {
            return NextResponse.json({ success: false, error: 'Invalid authentication' }, { status: 401 });
        }

        const body = await request.json();
        const validated = applyGiftCardSchema.parse(body);

        // Get gift card
        const giftCard = await db.giftCard.findUnique({
            where: { code: validated.code }
        });

        if (!giftCard) {
            return NextResponse.json({ success: false, error: 'Gift card not found' }, { status: 404 });
        }

        if (giftCard.status !== 'ACTIVE') {
            return NextResponse.json({ success: false, error: 'Gift card is not active' }, { status: 400 });
        }

        if (new Date() > safeDate(giftCard.expiresAt)) {
            return NextResponse.json({ success: false, error: 'Gift card has expired' }, { status: 400 });
        }

        if (toNumber(giftCard.balance) <= 0) {
            return NextResponse.json({ success: false, error: 'Gift card has zero balance' }, { status: 400 });
        }

        // Get order
        const order = await db.order.findUnique({
            where: { id: validated.orderId }
        });

        if (!order) {
            return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
        }

        if (order.userId !== user.id) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
        }

        // Calculate amount to redeem
        const redeemAmount = Math.min(toNumber(giftCard.balance), toNumber(order.totalAmount));
        const newBalance = toNumber(giftCard.balance) - redeemAmount;

        // Create transaction and update gift card
        const [transaction, updatedGiftCard] = await Promise.all([
            db.giftCardTransaction.create({
                data: {
                    giftCardId: giftCard.id,
                    orderId: order.id,
                    amount: redeemAmount,
                    balance: newBalance,
                    type: 'REDEEM'
                }
            }),
            db.giftCard.update({
                where: { id: giftCard.id },
                data: {
                    balance: newBalance,
                    status: newBalance === 0 ? 'USED' : 'ACTIVE'
                }
            })
        ]);

        // Update order amount
        const updatedOrderAmount = toNumber(order.totalAmount) - redeemAmount;
        await db.order.update({
            where: { id: order.id },
            data: {
                totalAmount: updatedOrderAmount
            }
        });

        return NextResponse.json({
            success: true,
            data: {
                giftCard: updatedGiftCard,
                transaction,
                redeemedAmount: redeemAmount
            }
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ success: false, error: 'Validation failed', details: error.issues }, { status: 400 });
        }
        console.error('Apply gift card error:', error);
        return NextResponse.json({ success: false, error: 'Failed to apply gift card' }, { status: 500 });
    }
}