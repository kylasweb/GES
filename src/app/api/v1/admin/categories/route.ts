import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';

export async function GET(request: NextRequest) {
    try {
        // Verify authentication for admin routes
        const user = verifyAuth(request);
        if (!user || (user.role !== 'SUPER_ADMIN' && user.role !== 'ADMIN')) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const categories = await db.category.findMany({
            include: {
                _count: {
                    select: {
                        products: true,
                    },
                },
            },
            orderBy: { sortOrder: 'asc' },
        });

        return NextResponse.json({
            success: true,
            data: categories,
        });
    } catch (error) {
        console.error('Get categories error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const user = verifyAuth(request);
        if (!user || (user.role !== 'SUPER_ADMIN' && user.role !== 'ADMIN')) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const body = await request.json();

        // Check if category with same name or slug exists
        const existing = await db.category.findFirst({
            where: {
                OR: [
                    { name: body.name },
                    { slug: body.slug },
                ],
            },
        });

        if (existing) {
            return NextResponse.json(
                { success: false, error: 'Category with this name or slug already exists' },
                { status: 400 }
            );
        }

        const category = await db.category.create({
            data: {
                name: body.name,
                slug: body.slug,
                description: body.description,
                image: body.image,
                sortOrder: body.sortOrder || 0,
                isActive: body.isActive !== undefined ? body.isActive : true,
            },
        });

        return NextResponse.json({
            success: true,
            data: category,
            message: 'Category created successfully',
        }, { status: 201 });
    } catch (error) {
        console.error('Create category error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function PUT(request: NextRequest) {
    try {
        const user = verifyAuth(request);
        if (!user || (user.role !== 'SUPER_ADMIN' && user.role !== 'ADMIN')) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { id, ...data } = body;

        if (!id) {
            return NextResponse.json(
                { success: false, error: 'Category ID is required' },
                { status: 400 }
            );
        }

        const category = await db.category.update({
            where: { id },
            data,
        });

        return NextResponse.json({
            success: true,
            data: category,
            message: 'Category updated successfully',
        });
    } catch (error) {
        console.error('Update category error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}
