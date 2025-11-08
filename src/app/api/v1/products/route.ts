import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { verifyAuth, requireAdmin } from '@/lib/auth';

const productQuerySchema = z.object({
  page: z.string().optional().default('1').transform(val => parseInt(val) || 1),
  limit: z.string().optional().default('20').transform(val => parseInt(val) || 20),
  category: z.string().optional(),
  featured: z.string().optional().transform(val => val === 'true'),
  search: z.string().optional(),
  sortBy: z.string().optional().default('createdAt'),
  sortOrder: z.string().optional().default('asc').transform(val => val === 'desc' ? 'desc' : 'asc'),
}).passthrough(); // Allow additional properties

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = productQuerySchema.parse(Object.fromEntries(searchParams));

    const where: any = {
      isActive: true,
    };

    if (query.category) {
      where.category = {
        slug: query.category,
      };
    }

    if (query.featured) {
      where.featured = true;
    }

    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
        { shortDesc: { contains: query.search, mode: 'insensitive' } },
        { sku: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const skip = (query.page - 1) * query.limit;

    const [products, total] = await Promise.all([
      db.product.findMany({
        where,
        include: {
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          inventory: {
            select: {
              quantity: true,
              lowStockThreshold: true,
            },
          },
          _count: {
            select: {
              reviews: true,
            },
          },
        },
        orderBy: {
          [query.sortBy]: query.sortOrder,
        },
        skip,
        take: query.limit,
      }),
      db.product.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        products,
        pagination: {
          page: query.page,
          limit: query.limit,
          total,
          pages: Math.ceil(total / query.limit),
        },
      },
    });
  } catch (error) {
    console.error('Get products error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid query parameters', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    const user = requireAdmin(request);

    const body = await request.json();

    const productSchema = z.object({
      name: z.string().min(1, 'Product name is required'),
      slug: z.string().min(1, 'Product slug is required'),
      description: z.string().min(1, 'Product description is required'),
      shortDesc: z.string().optional(),
      sku: z.string().min(1, 'SKU is required'),
      price: z.number().positive('Price must be positive'),
      comparePrice: z.number().positive().optional().nullable(),
      costPrice: z.number().positive().optional().nullable(),
      trackQuantity: z.boolean().optional().default(true),
      quantity: z.number().int().min(0).optional().default(0),
      weight: z.number().positive().optional().nullable(),
      dimensions: z.object({
        length: z.number().positive(),
        width: z.number().positive(),
        height: z.number().positive(),
      }).optional().nullable(),
      images: z.array(z.string()).default([]), // Allow non-URL strings for Cloudinary URLs
      tags: z.union([z.array(z.string()), z.string()]).optional().transform(val => {
        if (typeof val === 'string') return val.split(',').map(t => t.trim()).filter(Boolean);
        return val || [];
      }),
      isActive: z.boolean().default(true),
      featured: z.boolean().default(false),
      seoTitle: z.string().optional().nullable(),
      seoDesc: z.string().optional().nullable(),
      categoryId: z.string().min(1, 'Category is required'),
      brandId: z.string().optional().nullable(),
      type: z.string().optional().default('SIMPLE'),
      specifications: z.record(z.string()).optional().nullable(),
      customFields: z.record(z.string()).optional().nullable(),
      // Accept inventory from form but extract values
      inventory: z.object({
        quantity: z.number().int().min(0),
        trackQuantity: z.boolean(),
      }).optional(),
    }).transform(data => {
      // If inventory object provided, use those values
      if (data.inventory) {
        data.quantity = data.inventory.quantity;
        data.trackQuantity = data.inventory.trackQuantity;
      }
      return data;
    });

    const validatedData = productSchema.parse(body);

    // Check if SKU already exists
    const existingSku = await db.product.findUnique({
      where: { sku: validatedData.sku },
    });

    if (existingSku) {
      return NextResponse.json(
        { error: 'Product with this SKU already exists' },
        { status: 400 }
      );
    }

    // Check if slug already exists
    const existingSlug = await db.product.findUnique({
      where: { slug: validatedData.slug },
    });

    if (existingSlug) {
      return NextResponse.json(
        { error: 'Product with this slug already exists' },
        { status: 400 }
      );
    }

    // Verify category exists
    const category = await db.category.findUnique({
      where: { id: validatedData.categoryId },
    });

    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    // Create product
    const product = await db.product.create({
      data: {
        name: validatedData.name,
        slug: validatedData.slug,
        description: validatedData.description,
        shortDesc: validatedData.shortDesc,
        sku: validatedData.sku,
        price: validatedData.price,
        comparePrice: validatedData.comparePrice,
        costPrice: validatedData.costPrice,
        weight: validatedData.weight,
        dimensions: validatedData.dimensions,
        images: validatedData.images,
        tags: validatedData.tags,
        isActive: validatedData.isActive,
        featured: validatedData.featured,
        seoTitle: validatedData.seoTitle,
        seoDesc: validatedData.seoDesc,
        categoryId: validatedData.categoryId,
        specifications: validatedData.specifications,
        customFields: validatedData.customFields,
        inventory: validatedData.trackQuantity ? {
          create: {
            quantity: validatedData.quantity,
            lowStockThreshold: 10,
            reorderPoint: 5,
          },
        } : undefined,
      },
      include: {
        category: true,
        inventory: true,
      },
    });

    return NextResponse.json({
      message: 'Product created successfully',
      product,
    }, { status: 201 });
  } catch (error) {
    console.error('Create product error:', error);

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