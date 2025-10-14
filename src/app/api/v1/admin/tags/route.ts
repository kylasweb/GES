import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { verifyAuth, requireAdmin } from '@/lib/auth';

export async function GET(request: NextRequest) {
    try {
        const tags = await db.productTag.findMany({
            include: {
                _count: {
                    select: {
                        products: true,
                    },
                },
            },
            orderBy: { name: 'asc' },
        });

        return NextResponse.json({ tags });
    } catch (error) {
        console.error('Get tags error:', error);
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

        const tagSchema = z.object({
            name: z.string().min(1, 'Tag name is required'),
            slug: z.string().min(1, 'Tag slug is required'),
            isActive: z.boolean().default(true),
        });

        const validatedData = tagSchema.parse(body);

        // Check if tag name already exists
        const existingName = await db.productTag.findUnique({
            where: { name: validatedData.name },
        });

        if (existingName) {
            return NextResponse.json(
                { error: 'Tag with this name already exists' },
                { status: 400 }
            );
        }

        // Check if slug already exists
        const existingSlug = await db.productTag.findUnique({
            where: { slug: validatedData.slug },
        });

        if (existingSlug) {
            return NextResponse.json(
                { error: 'Tag with this slug already exists' },
                { status: 400 }
            );
        }

        // Create tag
        const tag = await db.productTag.create({
            data: validatedData,
        });

        return NextResponse.json({
            message: 'Tag created successfully',
            tag,
        }, { status: 201 });
    } catch (error) {
        console.error('Create tag error:', error);

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