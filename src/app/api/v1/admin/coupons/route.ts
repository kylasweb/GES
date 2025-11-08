import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';

// Coupon validation schema
const couponSchema = z.object({
    code: z.string().min(3).max(50),
    description: z.string().optional(),
    type: z.enum(['PERCENTAGE', 'FIXED']),
    value: z.number().positive(),
    minOrderValue: z.number().positive().optional(),
    maxDiscount: z.number().positive().optional(),
    usageLimit: z.number().int().positive().optional(),
    perUserLimit: z.number().int().positive().optional(),
    validFrom: z.string().transform(str => new Date(str)),
    validUntil: z.string().transform(str => new Date(str)),
    isActive: z.boolean().default(true),
});

// GET /api/v1/admin/coupons - List all coupons
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');
        const skip = (page - 1) * limit;

        const [coupons, total] = await Promise.all([
            db.coupon.findMany({
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
            }),
            db.coupon.count(),
        ]); return NextResponse.json({
            success: true,
            data: {
                coupons,
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit),
                },
            },
        });
    } catch (error) {
        console.error('Error fetching coupons:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch coupons' },
            { status: 500 }
        );
    }
}

// POST /api/v1/admin/coupons - Create new coupon
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const validatedData = couponSchema.parse(body);

        // Check if coupon code already exists
        const existing = await db.coupon.findUnique({
            where: { code: validatedData.code.toUpperCase() },
        });

        if (existing) {
            return NextResponse.json(
                { success: false, error: 'Coupon code already exists' },
                { status: 400 }
            );
        }

        const coupon = await db.coupon.create({
            data: {
                ...validatedData,
                code: validatedData.code.toUpperCase(),
            },
        }); return NextResponse.json({
            success: true,
            data: coupon,
        });
    } catch (error) {
        console.error('Error creating coupon:', error);
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { success: false, error: 'Invalid coupon data', details: error.issues },
                { status: 400 }
            );
        }
        return NextResponse.json(
            { success: false, error: 'Failed to create coupon' },
            { status: 500 }
        );
    }
}