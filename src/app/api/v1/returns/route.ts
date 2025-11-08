import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { z } from 'zod';

const returnSchema = z.object({
    orderId: z.string().min(1, 'Order ID is required'),
    reason: z.enum(['DEFECTIVE', 'WRONG_ITEM', 'NOT_AS_DESCRIBED', 'CHANGED_MIND', 'ARRIVED_LATE', 'DAMAGED', 'OTHER']),
    description: z.string().optional(),
    items: z.array(z.object({
        orderItemId: z.string(),
        quantity: z.number().min(1),
        reason: z.string()
    })),
    images: z.array(z.string()).optional()
});

// GET - List returns
export async function GET(request: NextRequest) {
    try {
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
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const status = searchParams.get('status');
        const skip = (page - 1) * limit;

        // Build where clause
        const where: any = {};

        // Non-admin users can only see their own returns
        if (!['SUPER_ADMIN', 'ORDER_MANAGER'].includes(user.role || '')) {
            where.userId = user.id;
        }

        if (status) {
            where.status = status;
        }

        const [returns, total] = await Promise.all([
            db.return.findMany({
                where,
                include: {
                    order: {
                        select: {
                            orderNumber: true,
                            totalAmount: true
                        }
                    },
                    user: {
                        select: {
                            name: true,
                            email: true
                        }
                    }
                },
                orderBy: {
                    createdAt: 'desc'
                },
                skip,
                take: limit
            }),
            db.return.count({ where })
        ]);

        return NextResponse.json({
            success: true,
            data: returns,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Get returns error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch returns' },
            { status: 500 }
        );
    }
}

// POST - Create return request
export async function POST(request: NextRequest) {
    try {
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
        const validated = returnSchema.parse(body);

        // Verify order belongs to user
        const order = await db.order.findFirst({
            where: {
                id: validated.orderId,
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

        // Check if order can be returned (e.g., within 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        if (new Date(order.createdAt) < thirtyDaysAgo) {
            return NextResponse.json(
                { success: false, error: 'Return period has expired (30 days)' },
                { status: 400 }
            );
        }

        // Calculate refund amount
        let refundAmount = 0;
        for (const item of validated.items) {
            const orderItem = order.items.find(oi => oi.id === item.orderItemId);
            if (orderItem) {
                refundAmount += Number(orderItem.totalPrice) * (item.quantity / orderItem.quantity);
            }
        }

        // Generate unique return number
        const returnNumber = `RET-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

        // Create return request
        const returnRequest = await db.return.create({
            data: {
                returnNumber,
                orderId: validated.orderId,
                userId: user.id,
                reason: validated.reason,
                description: validated.description,
                items: validated.items,
                images: validated.images || [],
                refundAmount,
                status: 'PENDING'
            },
            include: {
                order: {
                    select: {
                        orderNumber: true
                    }
                }
            }
        });

        return NextResponse.json({
            success: true,
            data: returnRequest
        }, { status: 201 });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { success: false, error: 'Validation failed', details: error.errors },
                { status: 400 }
            );
        }
        console.error('Create return error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to create return request' },
            { status: 500 }
        );
    }
}
