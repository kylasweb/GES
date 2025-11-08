import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { z } from 'zod';

const alertSchema = z.object({
    productId: z.string(),
    email: z.string().email()
});

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const validated = alertSchema.parse(body);

        // Check if product exists and is out of stock
        const product = await db.product.findUnique({
            where: { id: validated.productId },
            select: { id: true, name: true, quantity: true }
        });

        if (!product) {
            return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
        }

        if (product.quantity > 0) {
            return NextResponse.json({ success: false, error: 'Product is in stock' }, { status: 400 });
        }

        // Check if alert already exists
        const existing = await db.stockAlert.findFirst({
            where: {
                productId: validated.productId,
                email: validated.email,
                status: 'PENDING'
            }
        });

        if (existing) {
            return NextResponse.json({ success: true, message: 'Alert already registered' });
        }

        const alert = await db.stockAlert.create({
            data: {
                productId: validated.productId,
                email: validated.email,
                status: 'PENDING'
            },
            include: {
                product: { select: { name: true } }
            }
        });

        return NextResponse.json({ success: true, data: alert }, { status: 201 });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ success: false, error: 'Validation failed', details: error.errors }, { status: 400 });
        }
        console.error('Create alert error:', error);
        return NextResponse.json({ success: false, error: 'Failed to create stock alert' }, { status: 500 });
    }
}
