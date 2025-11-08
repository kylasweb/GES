import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/v1/admin/newsletter - List all subscribers
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '50');
        const status = searchParams.get('status');
        const skip = (page - 1) * limit;

        const where = status ? { status: status as any } : {};

        const [subscribers, total] = await Promise.all([
            db.newsletter.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
            }),
            db.newsletter.count({ where }),
        ]);

        const stats = await db.newsletter.groupBy({
            by: ['status'],
            _count: true,
        });

        return NextResponse.json({
            success: true,
            data: {
                subscribers,
                stats: stats.reduce((acc, s) => ({ ...acc, [s.status]: s._count }), {}),
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit),
                },
            },
        });
    } catch (error) {
        console.error('Error fetching newsletter subscribers:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch subscribers' },
            { status: 500 }
        );
    }
}

// DELETE /api/v1/admin/newsletter - Delete subscribers
export async function DELETE(request: NextRequest) {
    try {
        const { ids } = await request.json();

        if (!ids || !Array.isArray(ids)) {
            return NextResponse.json(
                { success: false, error: 'Invalid request' },
                { status: 400 }
            );
        }

        await db.newsletter.deleteMany({
            where: { id: { in: ids } },
        });

        return NextResponse.json({
            success: true,
            message: `${ids.length} subscriber(s) deleted`,
        });
    } catch (error) {
        console.error('Error deleting subscribers:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to delete subscribers' },
            { status: 500 }
        );
    }
}
