import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// POST /api/v1/products/compare
export async function POST(request: NextRequest) {
    try {
        const { productIds } = await request.json();

        if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
            return NextResponse.json(
                { success: false, error: 'Product IDs are required' },
                { status: 400 }
            );
        }

        if (productIds.length > 4) {
            return NextResponse.json(
                { success: false, error: 'Maximum 4 products can be compared' },
                { status: 400 }
            );
        }

        const products = await db.product.findMany({
            where: {
                id: { in: productIds },
                isActive: true,
            },
            include: {
                category: true,
                brand: true,
                ProductToProductAttribute: {
                    include: {
                        product_attributes: true
                    }
                },
                reviews: {
                    select: {
                        rating: true,
                    },
                },
            },
        });

        // Calculate average ratings
        const productsWithRatings = products.map(product => {
            // Type assertion to help TypeScript understand the structure
            const productWithReviews = product as typeof product & { reviews: { rating: number }[] };
            const avgRating = productWithReviews.reviews.length > 0
                ? productWithReviews.reviews.reduce((sum, r) => sum + r.rating, 0) / productWithReviews.reviews.length
                : 0;

            return {
                ...product,
                averageRating: avgRating,
                reviewCount: productWithReviews.reviews.length,
                reviews: undefined, // Remove reviews array from response
            };
        });

        return NextResponse.json({
            success: true,
            data: productsWithRatings,
        });
    } catch (error) {
        console.error('Error comparing products:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to compare products' },
            { status: 500 }
        );
    }
}