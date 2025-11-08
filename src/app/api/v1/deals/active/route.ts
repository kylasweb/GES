import { NextRequest, NextResponse } from 'next/server';
import { db as prisma } from '@/lib/db';

// GET /api/v1/deals/active - Get all active flash deals
export async function GET(request: NextRequest) {
    try {
        const now = new Date();

        const deals = await prisma.deal.findMany({
            where: {
                startDate: { lte: now },
                endDate: { gte: now },
                isActive: true,
            },
            orderBy: { endDate: 'asc' },
        });

        // Fetch product details for each deal
        const dealsWithProducts = await Promise.all(
            deals.map(async (deal) => {
                const product = await prisma.product.findUnique({
                    where: { id: deal.productId },
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                        price: true,
                        images: true,
                        category: {
                            select: {
                                name: true,
                                slug: true,
                            },
                        },
                    },
                });
                return { ...deal, product };
            })
        ); return NextResponse.json(dealsWithProducts);
    } catch (error) {
        console.error('Error fetching active deals:', error);
        return NextResponse.json(
            { error: 'Failed to fetch active deals' },
            { status: 500 }
        );
    }
}