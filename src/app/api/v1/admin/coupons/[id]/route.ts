import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';

const couponUpdateSchema = z.object({
    code: z.string().min(3).max(50).optional(),
    description: z.string().optional(),
    type: z.enum(['PERCENTAGE', 'FIXED']).optional(),
    value: z.number().positive().optional(),
    minOrderValue: z.number().positive().optional(),
    maxDiscount: z.number().positive().optional(),
    usageLimit: z.number().int().positive().optional(),
    perUserLimit: z.number().int().positive().optional(),
    validFrom: z.string().transform(str => new Date(str)).optional(),
    validUntil: z.string().transform(str => new Date(str)).optional(),
    isActive: z.boolean().optional(),
});

// GET /api/v1/admin/coupons/[id]
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const coupon = await db.coupon.findUnique({
            where: { id },
        });

        if (!coupon) {
            return NextResponse.json(
                { success: false, error: 'Coupon not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: coupon,
        });
    } catch (error) {
        console.error('Error fetching coupon:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch coupon' },
            { status: 500 }
        );
    }
}

// PUT /api/v1/admin/coupons/[id]
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const validatedData = couponUpdateSchema.parse(body);

        const coupon = await db.coupon.update({
            where: { id },
            data: validatedData,
        });

        return NextResponse.json({
            success: true,
            data: coupon,
        });
    } catch (error) {
        console.error('Error updating coupon:', error);
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { success: false, error: 'Invalid data', details: error.issues },
                { status: 400 }
            );
        }
        return NextResponse.json(
            { success: false, error: 'Failed to update coupon' },
            { status: 500 }
        );
    }
}

// DELETE /api/v1/admin/coupons/[id]
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        await db.coupon.delete({
            where: { id },
        });

        return NextResponse.json({
            success: true,
            message: 'Coupon deleted successfully',
        });
    } catch (error) {
        console.error('Error deleting coupon:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to delete coupon' },
            { status: 500 }
        );
    }
}
