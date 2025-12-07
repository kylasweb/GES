import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { z } from 'zod';
import { PaymentMethod } from '@prisma/client';

const convertSchema = z.object({
    shippingAddress: z.string().min(10),
    paymentMethod: z.nativeEnum(PaymentMethod)
});

// POST - Convert quote to order (admin only)
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const token = request.headers.get('authorization')?.replace('Bearer ', '');
        if (!token) {
            return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
        }

        const { id } = await params;
        const user = await verifyToken(token);
        if (!user || !['SUPER_ADMIN', 'ORDER_MANAGER'].includes(user.role || '')) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
        }

        const body = await request.json();
        const validated = convertSchema.parse(body);

        const quote = await db.quote.findUnique({
            where: { id }
        });

        if (!quote) {
            return NextResponse.json({ success: false, error: 'Quote not found' }, { status: 404 });
        }

        if (quote.status !== 'ACCEPTED') {
            return NextResponse.json({ success: false, error: 'Quote must be accepted before converting' }, { status: 400 });
        }

        if (quote.convertedToOrderId) {
            return NextResponse.json({ success: false, error: 'Quote already converted to order' }, { status: 400 });
        }

        if (!quote.quotedAmount) {
            return NextResponse.json({ success: false, error: 'Quote must have a quoted amount' }, { status: 400 });
        }

        // Create order from quote
        const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

        const order = await db.order.create({
            data: {
                orderNumber,
                userId: quote.userId!,
                subtotal: quote.quotedAmount,
                taxAmount: 0,
                shippingAmount: 0,
                discountAmount: 0,
                totalAmount: quote.quotedAmount,
                shippingAddress: validated.shippingAddress,
                paymentMethod: validated.paymentMethod,
                status: 'PENDING'
            }
        });

        // Update quote
        await db.quote.update({
            where: { id },
            data: {
                convertedToOrderId: order.id,
                status: 'ACCEPTED'
            }
        });

        return NextResponse.json({
            success: true,
            data: { order, quote }
        }, { status: 201 });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ success: false, error: 'Validation failed', details: error.issues }, { status: 400 });
        }
        console.error('Convert quote error:', error);
        return NextResponse.json({ success: false, error: 'Failed to convert quote' }, { status: 500 });
    }
}