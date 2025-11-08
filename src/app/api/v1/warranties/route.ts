import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { z } from 'zod';

const warrantySchema = z.object({
    orderId: z.string(),
    productId: z.string(),
    warrantyPeriod: z.number().min(1).max(120) // months
});

export async function GET(request: NextRequest) {
    try {
        const token = request.headers.get('authorization')?.replace('Bearer ', '');
        if (!token) {
            return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
        }

        const user = await verifyToken(token);
        if (!user) {
            return NextResponse.json({ success: false, error: 'Invalid authentication' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const status = searchParams.get('status');
        const skip = (page - 1) * limit;

        const where: any = {};
        if (!['SUPER_ADMIN', 'ORDER_MANAGER'].includes(user.role || '')) {
            where.userId = user.id;
        }
        if (status) where.status = status;

        const [warranties, total] = await Promise.all([
            db.warranty.findMany({
                where,
                include: {
                    product: { select: { name: true, sku: true } },
                    order: { select: { orderNumber: true } },
                    claims: { orderBy: { createdAt: 'desc' } }
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit
            }),
            db.warranty.count({ where })
        ]);

        return NextResponse.json({
            success: true,
            data: warranties,
            pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
        });
    } catch (error) {
        console.error('Get warranties error:', error);
        return NextResponse.json({ success: false, error: 'Failed to fetch warranties' }, { status: 500 });
    }
}

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
        const validated = warrantySchema.parse(body);

        // Verify order belongs to user
        const order = await db.order.findFirst({
            where: { id: validated.orderId, userId: user.id },
            include: { items: true }
        });

        if (!order) {
            return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
        }

        // Check if product is in order
        const orderItem = order.items.find(item => item.productId === validated.productId);
        if (!orderItem) {
            return NextResponse.json({ success: false, error: 'Product not found in order' }, { status: 400 });
        }

        // Check if warranty already exists
        const existingWarranty = await db.warranty.findFirst({
            where: {
                orderId: validated.orderId,
                productId: validated.productId,
                userId: user.id
            }
        });

        if (existingWarranty) {
            return NextResponse.json({ success: false, error: 'Warranty already registered for this product' }, { status: 400 });
        }

        // Generate warranty number
        const warrantyNumber = `WAR-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

        // Calculate expiry date
        const expiryDate = new Date(order.createdAt);
        expiryDate.setMonth(expiryDate.getMonth() + validated.warrantyPeriod);

        const warranty = await db.warranty.create({
            data: {
                warrantyNumber,
                orderId: validated.orderId,
                productId: validated.productId,
                userId: user.id,
                purchaseDate: order.createdAt,
                warrantyPeriod: validated.warrantyPeriod,
                expiryDate,
                status: 'ACTIVE'
            },
            include: {
                product: { select: { name: true } },
                order: { select: { orderNumber: true } }
            }
        });

        return NextResponse.json({ success: true, data: warranty }, { status: 201 });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ success: false, error: 'Validation failed', details: error.errors }, { status: 400 });
        }
        console.error('Create warranty error:', error);
        return NextResponse.json({ success: false, error: 'Failed to register warranty' }, { status: 500 });
    }
}
