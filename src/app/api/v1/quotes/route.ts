import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { z } from 'zod';

const quoteSchema = z.object({
    email: z.string().email(),
    name: z.string().min(1),
    phone: z.string().min(10),
    company: z.string().optional(),
    items: z.array(z.object({
        productId: z.string(),
        quantity: z.number().min(1)
    })),
    message: z.string().optional()
});

// GET - List quotes
export async function GET(request: NextRequest) {
    try {
        const token = request.headers.get('authorization')?.replace('Bearer ', '');
        const user = token ? await verifyToken(token) : null;

        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const status = searchParams.get('status');

        const isAdmin = user && ['SUPER_ADMIN', 'ORDER_MANAGER'].includes(user.role || '');

        const where: any = {};

        if (status) where.status = status;

        // Non-admin users can only see their own quotes
        if (!isAdmin && user) {
            where.userId = user.id;
        } else if (!isAdmin) {
            return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
        }

        const skip = (page - 1) * limit;

        const [quotes, total] = await Promise.all([
            db.quote.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    user: { select: { name: true, email: true } }
                }
            }),
            db.quote.count({ where })
        ]);

        return NextResponse.json({
            success: true,
            data: quotes,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Get quotes error:', error);
        return NextResponse.json({ success: false, error: 'Failed to fetch quotes' }, { status: 500 });
    }
}

// POST - Request quote
export async function POST(request: NextRequest) {
    try {
        const token = request.headers.get('authorization')?.replace('Bearer ', '');
        const user = token ? await verifyToken(token) : null;

        const body = await request.json();
        const validated = quoteSchema.parse(body);

        // Verify all products exist
        const productIds = validated.items.map(item => item.productId);
        const products = await db.product.findMany({
            where: { id: { in: productIds } }
        });

        if (products.length !== productIds.length) {
            return NextResponse.json({ success: false, error: 'One or more products not found' }, { status: 404 });
        }

        const quoteNumber = `QTE-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

        const quote = await db.quote.create({
            data: {
                quoteNumber,
                userId: user?.id,
                email: validated.email,
                name: validated.name,
                phone: validated.phone,
                company: validated.company,
                items: validated.items,
                message: validated.message,
                status: 'PENDING'
            }
        });

        return NextResponse.json({ success: true, data: quote }, { status: 201 });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ success: false, error: 'Validation failed', details: error.issues }, { status: 400 });
        }
        console.error('Create quote error:', error);
        return NextResponse.json({ success: false, error: 'Failed to create quote' }, { status: 500 });
    }
}
