import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { verifyAuth, requireAdmin } from '@/lib/auth';
import { logAuditTrail } from '@/lib/audit-trail';

export async function GET(request: NextRequest) {
    try {
        const brands = await db.brand.findMany({
            orderBy: { sortOrder: 'asc' },
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

        return NextResponse.json({ success: true, data: brands });
    } catch (error) {
        console.error('Get brands error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
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

        // Check if brand name already exists
        const existingName = await db.brand.findUnique({
            where: { name: validatedData.name },
        });

        if (existingName) {
            return NextResponse.json(
                { error: 'Brand with this name already exists' },
                { status: 400 }
            );
        }

        // Check if slug already exists
        const existingSlug = await db.brand.findUnique({
            where: { slug: validatedData.slug },
        });

        if (existingSlug) {
            return NextResponse.json(
                { error: 'Brand with this slug already exists' },
                { status: 400 }
            );
        }

        // Create brand
        const brand = await db.brand.create({
            data: validatedData,
        });

        // Get user for audit trail
        const user = requireAdmin(request);

        // Log audit trail
        if (user) {
            await logAuditTrail({
                userId: user.id,
                tableName: 'brands',
                recordId: brand.id,
                action: 'INSERT',
                newValues: brand
            });
        }

        return NextResponse.json({
            message: 'Brand created successfully',
            brand,
        }, { status: 201 });
    } catch (error) {
        console.error('Create brand error:', error);

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