import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { verifyAuth, requireAdmin } from '@/lib/auth';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const category = await db.category.findUnique({
      where: {
        id,
        isActive: true,
      },
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

    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ category });
  } catch (error) {
    console.error('Get category error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    // Verify admin authentication
    const user = requireAdmin(request);
    const { id } = await params;

    const body = await request.json();

    const categorySchema = z.object({
      name: z.string().min(1, 'Category name is required').optional(),
      slug: z.string().min(1, 'Category slug is required').optional(),
      description: z.string().optional(),
      image: z.string().url().optional(),
      sortOrder: z.number().int().min(0).optional(),
      isActive: z.boolean().optional(),
    });

    const validatedData = categorySchema.parse(body);

    // Check if category exists
    const existingCategory = await db.category.findUnique({
      where: { id },
    });

    if (!existingCategory) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    // Check if name already exists (if changing)
    if (validatedData.name && validatedData.name !== existingCategory.name) {
      const existingName = await db.category.findUnique({
        where: { name: validatedData.name },
      });

      if (existingName) {
        return NextResponse.json(
          { error: 'Category with this name already exists' },
          { status: 400 }
        );
      }
    }

    // Check if slug already exists (if changing)
    if (validatedData.slug && validatedData.slug !== existingCategory.slug) {
      const existingSlug = await db.category.findUnique({
        where: { slug: validatedData.slug },
      });

      if (existingSlug) {
        return NextResponse.json(
          { error: 'Category with this slug already exists' },
          { status: 400 }
        );
      }
    }

    // Update category
    const category = await db.category.update({
      where: { id },
      data: validatedData,
    });

    return NextResponse.json({
      message: 'Category updated successfully',
      category,
    });
  } catch (error) {
    console.error('Update category error:', error);

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

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    // Verify admin authentication
    const user = requireAdmin(request);
    const { id } = await params;

    // Check if category exists
    const existingCategory = await db.category.findUnique({
      where: { id },
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

    if (!existingCategory) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    // Check if category has products
    if (existingCategory._count.products > 0) {
      return NextResponse.json(
        { error: 'Cannot delete category with existing products' },
        { status: 400 }
      );
    }

    // Delete category
    await db.category.delete({
      where: { id },
    });

    return NextResponse.json({
      message: 'Category deleted successfully',
    });
  } catch (error) {
    console.error('Delete category error:', error);

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