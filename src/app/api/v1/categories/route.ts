import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { verifyAuth, requireAdmin } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const categories = await db.category.findMany({
      where: { isActive: true },
      include: {
        _count: {
          select: {
            products: {
              where: { isActive: true },
            },
          },
        },
      },
      orderBy: { sortOrder: 'asc' },
    });

    return NextResponse.json({ categories });
  } catch (error) {
    console.error('Get categories error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    const user = requireAdmin(request);

    const body = await request.json();

    const categorySchema = z.object({
      name: z.string().min(1, 'Category name is required'),
      slug: z.string().min(1, 'Category slug is required'),
      description: z.string().optional(),
      image: z.string().url().optional(),
      sortOrder: z.number().int().min(0).default(0),
      isActive: z.boolean().default(true),
    });

    const validatedData = categorySchema.parse(body);

    // Check if category name already exists
    const existingName = await db.category.findUnique({
      where: { name: validatedData.name },
    });

    if (existingName) {
      return NextResponse.json(
        { error: 'Category with this name already exists' },
        { status: 400 }
      );
    }

    // Check if slug already exists
    const existingSlug = await db.category.findUnique({
      where: { slug: validatedData.slug },
    });

    if (existingSlug) {
      return NextResponse.json(
        { error: 'Category with this slug already exists' },
        { status: 400 }
      );
    }

    // Create category
    const category = await db.category.create({
      data: validatedData,
    });

    return NextResponse.json({
      message: 'Category created successfully',
      category,
    }, { status: 201 });
  } catch (error) {
    console.error('Create category error:', error);

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