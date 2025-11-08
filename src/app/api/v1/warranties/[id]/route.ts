import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const token = request.headers.get('authorization')?.replace('Bearer ', '');
        if (!token) {
            return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
        }

        const user = await verifyToken(token);
        if (!user) {
            return NextResponse.json({ success: false, error: 'Invalid authentication' }, { status: 401 });
        }

        const { id } = await params;
        const where: any = { id };

        if (!['SUPER_ADMIN', 'ORDER_MANAGER'].includes(user.role || '')) {
            where.userId = user.id;
        }

        const warranty = await db.warranty.findFirst({
            where,
            include: {
                product: true,
                order: { select: { orderNumber: true } },
                user: { select: { name: true, email: true, phone: true } },
                claims: { orderBy: { createdAt: 'desc' } }
            }
        });

        if (!warranty) {
            return NextResponse.json({ success: false, error: 'Warranty not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: warranty });
    } catch (error) {
        console.error('Get warranty error:', error);
        return NextResponse.json({ success: false, error: 'Failed to fetch warranty' }, { status: 500 });
    }
}
