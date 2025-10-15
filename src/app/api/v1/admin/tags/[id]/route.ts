import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { verifyAuth, requireAdmin } from '@/lib/auth';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    try {
        const tag = await db.productTag.findUnique({
            where: { id },
            include: {
                _count: {
                    select: {
                        products: true,
                    },
                },
            },
        });

        if (!tag) {
            return NextResponse.json(
                { error: 'Tag not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({ tag });
    } catch (error) {
        console.error('Get tag error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
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

        // Check if tag exists
        const existingTag = await db.productTag.findUnique({
            where: { id },
        });

        if (!existingTag) {
            return NextResponse.json(
                { error: 'Tag not found' },
                { status: 404 }
            );
        }

        // Check if name conflicts with other tags
        const existingName = await db.productTag.findFirst({
            where: {
                name: validatedData.name,
                id: { not: id },
            },
        });

        if (existingName) {
            return NextResponse.json(
                { error: 'Tag with this name already exists' },
                { status: 400 }
            );
        }

        // Check if slug conflicts with other tags
        const existingSlug = await db.productTag.findFirst({
            where: {
                slug: validatedData.slug,
                id: { not: id },
            },
        });

        if (existingSlug) {
            return NextResponse.json(
                { error: 'Tag with this slug already exists' },
                { status: 400 }
            );
        }

        // Update tag
        const tag = await db.productTag.update({
            where: { id },
            data: validatedData,
        });

        return NextResponse.json({
            message: 'Tag updated successfully',
            tag,
        });
    } catch (error) {
        console.error('Update tag error:', error);

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
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    try {
        // Verify admin authentication
        requireAdmin(request);

        // Check if tag exists
        const existingTag = await db.productTag.findUnique({
            where: { id },
        });

        if (!existingTag) {
            return NextResponse.json(
                { error: 'Tag not found' },
                { status: 404 }
            );
        }

        // Delete tag
        await db.productTag.delete({
            where: { id },
        });

        return NextResponse.json({
            message: 'Tag deleted successfully',
        });
    } catch (error) {
        console.error('Delete tag error:', error);

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