import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

// GET - List all gift cards (admin only)
export async function GET(request: NextRequest) {
    try {
        const token = request.headers.get('authorization')?.replace('Bearer ', '');
        if (!token) {
            return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
        }

        const user = await verifyToken(token);
        if (!user || !['SUPER_ADMIN', 'ORDER_MANAGER'].includes(user.role || '')) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
        }

        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const status = searchParams.get('status');

        const where: any = {};
        if (status) where.status = status;

        const skip = (page - 1) * limit;

        const [giftCards, total] = await Promise.all([
            db.giftCard.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    transactions: {
                        orderBy: { createdAt: 'desc' },
                        take: 5
                    }
                }
            }),
            db.giftCard.count({ where })
        ]);

        return NextResponse.json({
            success: true,
            data: giftCards,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Get gift cards error:', error);
        return NextResponse.json({ success: false, error: 'Failed to fetch gift cards' }, { status: 500 });
    }
}

// PATCH - Update gift card status (admin only)
export async function PATCH(request: NextRequest) {
    try {
        const token = request.headers.get('authorization')?.replace('Bearer ', '');
        if (!token) {
            return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
        }

        const user = await verifyToken(token);
        if (!user || !['SUPER_ADMIN'].includes(user.role || '')) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
        }

        const { searchParams } = new URL(request.url);
        const giftCardId = searchParams.get('id');

        if (!giftCardId) {
            return NextResponse.json({ success: false, error: 'Gift card ID required' }, { status: 400 });
        }

        const body = await request.json();
        const { status } = body;

        if (!status || !['ACTIVE', 'USED', 'EXPIRED', 'CANCELLED'].includes(status)) {
            return NextResponse.json({ success: false, error: 'Invalid status' }, { status: 400 });
        }

        const giftCard = await db.giftCard.update({
            where: { id: giftCardId },
            data: { status }
        });

        return NextResponse.json({ success: true, data: giftCard });
    } catch (error) {
        console.error('Update gift card error:', error);
        return NextResponse.json({ success: false, error: 'Failed to update gift card' }, { status: 500 });
    }
}
