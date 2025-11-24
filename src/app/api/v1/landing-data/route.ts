import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Cache the landing data for 5 minutes to reduce database queries
let cachedData: any = null;
let cacheTime = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export async function GET() {
    try {
        const now = Date.now();

        // Return cached data if still valid
        if (cachedData && (now - cacheTime) < CACHE_DURATION) {
            return NextResponse.json(cachedData);
        }

        // Fetch all data needed for landing pages
        const [categories, products, deals] = await Promise.all([
            db.category.findMany({
                where: { isActive: true },
                take: 8,
                orderBy: { sortOrder: 'asc' }
            }),
            db.product.findMany({
                where: {
                    isActive: true,
                    featured: true
                },
                include: {
                    category: true,
                    brand: true
                },
                take: 12,
                orderBy: { id: 'asc' }
            }),
            db.deal.findMany({
                where: { isActive: true },
                take: 6,
                orderBy: { id: 'asc' }
            })
        ]);

        // Fetch product details for each deal (similar to the active deals API)
        const dealsWithProducts = await Promise.all(
            deals.map(async (deal) => {
                const product = await db.product.findUnique({
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
        );

        const landingData = { categories, products, deals: dealsWithProducts };

        // Update cache
        cachedData = landingData;
        cacheTime = now;

        return NextResponse.json(landingData);
    } catch (error) {
        console.error('Error fetching landing data:', error);

        // Return empty data on error
        return NextResponse.json({
            categories: [],
            products: [],
            deals: []
        });
    }
}