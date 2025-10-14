import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { verifyAuth, requireAdmin } from '@/lib/auth';

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const attribute = await db.productAttribute.findUnique({
            where: { id: params.id },
            include: {
                values: {
                    orderBy: { sortOrder: 'asc' },
                },
                _count: {
                    select: {
                        products: true,
                    },
                },
            },
        });

        if (!attribute) {
            return NextResponse.json(
                { error: 'Attribute not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({ attribute });
    } catch (error) {
        console.error('Get attribute error:', error);
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

        const attributeSchema = z.object({
            name: z.string().min(1, 'Attribute name is required'),
            slug: z.string().min(1, 'Attribute slug is required'),
            type: z.enum(['TEXT', 'COLOR', 'IMAGE', 'SELECT']).default('TEXT'),
            isVisible: z.boolean().default(true),
            isFilterable: z.boolean().default(false),
            sortOrder: z.number().int().min(0).default(0),
        });

        const validatedData = attributeSchema.parse(body);

        // Check if attribute exists
        const existingAttribute = await db.productAttribute.findUnique({
            where: { id: params.id },
        });

        if (!existingAttribute) {
            return NextResponse.json(
                { error: 'Attribute not found' },
                { status: 404 }
            );
        }

        // Check if slug conflicts with other attributes
        const existingSlug = await db.productAttribute.findFirst({
            where: {
                slug: validatedData.slug,
                id: { not: params.id },
            },
        });

        if (existingSlug) {
            return NextResponse.json(
                { error: 'Attribute with this slug already exists' },
                { status: 400 }
            );
        }

        // Update attribute
        const attribute = await db.productAttribute.update({
            where: { id: params.id },
            data: validatedData,
        });

        return NextResponse.json({
            message: 'Attribute updated successfully',
            attribute,
        });
    } catch (error) {
        console.error('Update attribute error:', error);

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

        // Check if attribute exists
        const existingAttribute = await db.productAttribute.findUnique({
            where: { id: params.id },
            include: {
                _count: {
                    select: {
                        products: true,
                    },
                },
            },
        });

        if (!existingAttribute) {
            return NextResponse.json(
                { error: 'Attribute not found' },
                { status: 404 }
            );
        }

        // Check if attribute has associated products
        if (existingAttribute._count.products > 0) {
            return NextResponse.json(
                { error: 'Cannot delete attribute with associated products. Please remove associations first.' },
                { status: 400 }
            );
        }

        // Delete attribute (this will cascade delete attribute values)
        await db.productAttribute.delete({
            where: { id: params.id },
        });

        return NextResponse.json({
            message: 'Attribute deleted successfully',
        });
    } catch (error) {
        console.error('Delete attribute error:', error);

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