import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// POST /api/v1/coupons/validate
export async function POST(request: NextRequest) {
    try {
        const { code, orderValue } = await request.json();

        if (!code) {
            return NextResponse.json(
                { success: false, error: 'Coupon code is required' },
                { status: 400 }
            );
        }

        const coupon = await db.coupon.findUnique({
            where: { code: code.toUpperCase() },
        });

        if (!coupon) {
            return NextResponse.json(
                { success: false, error: 'Invalid coupon code' },
                { status: 404 }
            );
        }

        // Check if coupon is active
        if (!coupon.isActive) {
            return NextResponse.json(
                { success: false, error: 'This coupon is no longer active' },
                { status: 400 }
            );
        }

        // Check validity period
        const now = new Date();
        if (now < coupon.validFrom || now > coupon.validUntil) {
            return NextResponse.json(
                { success: false, error: 'This coupon has expired or is not yet valid' },
                { status: 400 }
            );
        }

        // Check usage limit
        if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
            return NextResponse.json(
                { success: false, error: 'This coupon has reached its usage limit' },
                { status: 400 }
            );
        }

        // Check minimum order value
        if (coupon.minOrderValue && orderValue < parseFloat(coupon.minOrderValue.toString())) {
            return NextResponse.json(
                {
                    success: false,
                    error: `Minimum order value of ₹${coupon.minOrderValue} required`
                },
                { status: 400 }
            );
        }

        // Calculate discount
        let discount = 0;
        if (coupon.type === 'PERCENTAGE') {
            discount = (orderValue * parseFloat(coupon.value.toString())) / 100;
            if (coupon.maxDiscount && discount > parseFloat(coupon.maxDiscount.toString())) {
                discount = parseFloat(coupon.maxDiscount.toString());
            }
        } else {
            discount = parseFloat(coupon.value.toString());
        }

        return NextResponse.json({
            success: true,
            data: {
                code: coupon.code,
                type: coupon.type,
                discount: discount,
                description: coupon.description,
            },
        });
    } catch (error) {
        console.error('Error validating coupon:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to validate coupon' },
            { status: 500 }
        );
    }
}
