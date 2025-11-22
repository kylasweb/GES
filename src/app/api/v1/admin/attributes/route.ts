import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { verifyAuth, requireAdmin } from '@/lib/auth';

export async function GET(request: NextRequest) {
    try {
        const attributes = await db.productAttribute.findMany({
            include: {
                values: {
                    orderBy: { sortOrder: 'asc' },
                },
                _count: {
                    select: {
                        ProductToProductAttribute: true,
                    },
                },
            },
            orderBy: { sortOrder: 'asc' },
        });

        return NextResponse.json({ attributes });
    } catch (error) {
        console.error('Get attributes error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
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

        // Check if attribute slug already exists
        const existingSlug = await db.productAttribute.findUnique({
            where: { slug: validatedData.slug },
        });

        if (existingSlug) {
            return NextResponse.json(
                { error: 'Attribute with this slug already exists' },
                { status: 400 }
            );
        }

        // Create attribute
        const attribute = await db.productAttribute.create({
            data: validatedData,
        });

        return NextResponse.json({
            message: 'Attribute created successfully',
            attribute,
        }, { status: 201 });
    } catch (error) {
        console.error('Create attribute error:', error);

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