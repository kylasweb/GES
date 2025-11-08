import { NextRequest, NextResponse } from 'next/server';
import { db as prisma } from '@/lib/db';

// GET /api/v1/admin/deals - List all flash deals with pagination
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const status = searchParams.get('status'); // active, upcoming, expired
        const skip = (page - 1) * limit;

        const now = new Date();
        let where: any = {};

        if (status === 'active') {
            where = {
                startDate: { lte: now },
                endDate: { gte: now },
                isActive: true,
            };
        } else if (status === 'upcoming') {
            where = {
                startDate: { gt: now },
                isActive: true,
            };
        } else if (status === 'expired') {
            where = {
                endDate: { lt: now },
            };
        }

        const [deals, total] = await Promise.all([
            prisma.deal.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            prisma.deal.count({ where }),
        ]);

        // Fetch product details separately
        const dealsWithProducts = await Promise.all(
            deals.map(async (deal) => {
                const product = await prisma.product.findUnique({
                    where: { id: deal.productId },
                    select: {
                        id: true,
                        name: true,
                        price: true,
                        images: true,
                    },
                });
                return { ...deal, product };
            })
        );

        return NextResponse.json({
            deals: dealsWithProducts,
            pagination: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error('Error fetching deals:', error);
        return NextResponse.json(
            { error: 'Failed to fetch deals' },
            { status: 500 }
        );
    }
}

// POST /api/v1/admin/deals - Create new flash deal
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { productId, title, description, discount, startDate, endDate, isActive } = body;

        // Validate required fields
        if (!productId || !title || !discount || !startDate || !endDate) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Validate discount percentage
        if (discount < 1 || discount > 99) {
            return NextResponse.json(
                { error: 'Discount must be between 1 and 99' },
                { status: 400 }
            );
        }

        // Validate dates
        const start = new Date(startDate);
        const end = new Date(endDate);
        if (start >= end) {
            return NextResponse.json(
                { error: 'End date must be after start date' },
                { status: 400 }
            );
        }

        // Check if product exists
        const product = await prisma.product.findUnique({
            where: { id: productId },
        });

        if (!product) {
            return NextResponse.json(
                { error: 'Product not found' },
                { status: 404 }
            );
        }

        // Check for overlapping deals on the same product
        const overlappingDeal = await prisma.deal.findFirst({
            where: {
                productId,
                isActive: true,
                OR: [
                    {
                        startDate: { lte: end },
                        endDate: { gte: start },
                    },
                ],
            },
        });

        if (overlappingDeal) {
            return NextResponse.json(
                { error: 'Product already has an active deal in this time period' },
                { status: 400 }
            );
        }

        const deal = await prisma.deal.create({
            data: {
                productId,
                title,
                description: description || null,
                discount,
                startDate: start,
                endDate: end,
                isActive: isActive !== false,
            },
        });

        // Fetch product details
        const productDetails = await prisma.product.findUnique({
            where: { id: productId },
            select: {
                id: true,
                name: true,
                price: true,
                images: true,
            },
        });

        return NextResponse.json({ ...deal, product: productDetails }, { status: 201 });
    } catch (error) {
        console.error('Error creating deal:', error);
        return NextResponse.json(
            { error: 'Failed to create deal' },
            { status: 500 }
        );
    }
}