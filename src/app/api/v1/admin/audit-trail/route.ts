import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

export async function GET(request: NextRequest) {
    try {
        // Verify admin authentication
        const user = requireAdmin(request);

        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '50');
        const table = searchParams.get('table') || '';
        const action = searchParams.get('action') || '';
        const search = searchParams.get('search') || '';

        const where: any = {};

        // Apply filters
        if (table) {
            where.tableName = table;
        }

        if (action) {
            where.action = action;
        }

        if (search) {
            where.OR = [
                { userId: { contains: search } },
                { tableName: { contains: search, mode: 'insensitive' } },
                { recordId: { contains: search } },
            ];
        }

        const skip = (page - 1) * limit;

        const [auditLogs, total] = await Promise.all([
            db.auditTrail.findMany({
                where,
                include: {
                    user: {
                        select: {
                            name: true,
                            email: true,
                        },
                    },
                },
                orderBy: {
                    timestamp: 'desc',
                },
                skip,
                take: limit,
            }),
            db.auditTrail.count({ where }),
        ]);

        return NextResponse.json({
            success: true,
            data: auditLogs,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error('Get audit trail error:', error);

        if (error instanceof Error && error.message === 'Authentication required') {
            return NextResponse.json(
                { success: false, error: 'Authentication required' },
                { status: 401 }
            );
        }

        if (error instanceof Error && error.message.includes('Access denied')) {
            return NextResponse.json(
                { success: false, error: 'Access denied' },
                { status: 403 }
            );
        }

        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}