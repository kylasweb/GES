import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

// Admin role check middleware
function checkAdminRole(user: any, requiredRoles: string[] = ['SUPER_ADMIN']) {
    const adminRoles = ['SUPER_ADMIN', 'ORDER_MANAGER', 'FINANCE_MANAGER', 'CONTENT_MANAGER'];
    return adminRoles.includes(user?.role || '') && requiredRoles.includes(user?.role || '');
}

export async function GET(request: NextRequest) {
    try {
        // Get user from token
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

        // Check if user has admin privileges
        if (!checkAdminRole(user, ['SUPER_ADMIN', 'ORDER_MANAGER', 'FINANCE_MANAGER', 'CONTENT_MANAGER'])) {
            return NextResponse.json(
                { success: false, error: 'Admin access required' },
                { status: 403 }
            );
        }

        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '100');
        const search = searchParams.get('search') || '';

        const where: any = {};

        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { sku: { contains: search, mode: 'insensitive' } },
                { category: { name: { contains: search, mode: 'insensitive' } } },
            ];
        }

        const skip = (page - 1) * limit;

        const [products, total] = await Promise.all([
            db.product.findMany({
                where,
                include: {
                    category: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                    inventory: {
                        select: {
                            quantity: true,
                        },
                    },
                },
                orderBy: {
                    createdAt: 'desc',
                },
                skip,
                take: limit,
            }),
            db.product.count({ where }),
        ]);

        return NextResponse.json({
            success: true,
            data: {
                products,
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit),
                },
            },
        });
    } catch (error) {
        console.error('Get admin products error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}