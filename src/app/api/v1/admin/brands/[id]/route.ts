import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { verifyAuth, requireAdmin } from '@/lib/auth';

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const brand = await db.brand.findUnique({
            where: { id: params.id },
            include: {
                _count: {
                    select: {
                        products: {
                            where: { isActive: true },
                        },
                    },
                },
            },
        });

        if (!brand) {
            return NextResponse.json(
                { error: 'Brand not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({ brand });
    } catch (error) {
        console.error('Get brand error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        // Verify admin authentication
        requireAdmin(request);

        const body = await request.json();

        const brandSchema = z.object({
            name: z.string().min(1, 'Brand name is required'),
            slug: z.string().min(1, 'Brand slug is required'),
            description: z.string().optional(),
            logo: z.string().url().optional(),
            website: z.string().url().optional(),
            sortOrder: z.number().int().min(0).default(0),
            isActive: z.boolean().default(true),
        });

        const validatedData = brandSchema.parse(body);

        // Check if brand exists
        const existingBrand = await db.brand.findUnique({
            where: { id: params.id },
        });

        if (!existingBrand) {
            return NextResponse.json(
                { error: 'Brand not found' },
                { status: 404 }
            );
        }

        // Check if name conflicts with other brands
        const existingName = await db.brand.findFirst({
            where: {
                name: validatedData.name,
                id: { not: params.id },
            },
        });

        if (existingName) {
            return NextResponse.json(
                { error: 'Brand with this name already exists' },
                { status: 400 }
            );
        }

        // Check if slug conflicts with other brands
        const existingSlug = await db.brand.findFirst({
            where: {
                slug: validatedData.slug,
                id: { not: params.id },
            },
        });

        if (existingSlug) {
            return NextResponse.json(
                { error: 'Brand with this slug already exists' },
                { status: 400 }
            );
        }

        // Update brand
        const brand = await db.brand.update({
            where: { id: params.id },
            data: validatedData,
        });

        return NextResponse.json({
            message: 'Brand updated successfully',
            brand,
        });
    } catch (error) {
        console.error('Update brand error:', error);

        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: 'Validation failed', details: error.issues },
                { status: 400 }
            );
        }

        if (error instanceof Error && error.message === 'Authentication required') {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            );
        }

        if (error instanceof Error && error.message.includes('Access denied')) {
            return NextResponse.json(
                { error: 'Access denied' },
                { status: 403 }
            );
        }

        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        // Verify admin authentication
        requireAdmin(request);

        // Check if brand exists
        const existingBrand = await db.brand.findUnique({
            where: { id: params.id },
            include: {
                _count: {
                    select: {
                        products: true,
                    },
                },
            },
        });

        if (!existingBrand) {
            return NextResponse.json(
                { error: 'Brand not found' },
                { status: 404 }
            );
        }

        // Check if brand has associated products
        if (existingBrand._count.products > 0) {
            return NextResponse.json(
                { error: 'Cannot delete brand with associated products. Please reassign or remove products first.' },
                { status: 400 }
            );
        }

        // Delete brand
        await db.brand.delete({
            where: { id: params.id },
        });

        return NextResponse.json({
            message: 'Brand deleted successfully',
        });
    } catch (error) {
        console.error('Delete brand error:', error);

        if (error instanceof Error && error.message === 'Authentication required') {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            );
        }

        if (error instanceof Error && error.message.includes('Access denied')) {
            return NextResponse.json(
                { error: 'Access denied' },
                { status: 403 }
            );
        }

        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}