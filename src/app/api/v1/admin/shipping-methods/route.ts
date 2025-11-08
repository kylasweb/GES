import { NextRequest, NextResponse } from 'next/server';
import { db as prisma } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';

// GET /api/v1/admin/shipping-methods - List all shipping methods
export async function GET(request: NextRequest) {
    try {
        // Verify authentication
        const user = await verifyAuth(request);
        if (!user || (user.role !== 'SUPER_ADMIN' && user.role !== 'ADMIN')) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const searchParams = request.nextUrl.searchParams;
        const isActive = searchParams.get('isActive');

        let where: any = {};
        if (isActive !== null) {
            where.isActive = isActive === 'true';
        }

        const methods = await prisma.shippingMethod.findMany({
            where,
            orderBy: { sortOrder: 'asc' },
        });

        return NextResponse.json(methods);
    } catch (error) {
        console.error('Error fetching shipping methods:', error);
        return NextResponse.json(
            { error: 'Failed to fetch shipping methods' },
            { status: 500 }
        );
    }
}

// POST /api/v1/admin/shipping-methods - Create new shipping method
export async function POST(request: NextRequest) {
    try {
        // Verify authentication
        const user = await verifyAuth(request);
        if (!user || (user.role !== 'SUPER_ADMIN' && user.role !== 'ADMIN')) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const {
            name,
            description,
            type,
            cost,
            minOrder,
            maxOrder,
            cities,
            isActive,
            sortOrder,
        } = body;

        // Validate required fields
        if (!name || cost === undefined) {
            return NextResponse.json(
                { error: 'Name and cost are required' },
                { status: 400 }
            );
        }

        const method = await prisma.shippingMethod.create({
            data: {
                name,
                description: description || null,
                type: type || 'FLAT_RATE',
                cost,
                minOrder: minOrder || null,
                maxOrder: maxOrder || null,
                cities: cities || null,
                isActive: isActive !== false,
                sortOrder: sortOrder || 0,
            },
        });

        return NextResponse.json(method, { status: 201 });
    } catch (error) {
        console.error('Error creating shipping method:', error);
        return NextResponse.json(
            { error: 'Failed to create shipping method' },
            { status: 500 }
        );
    }
}
