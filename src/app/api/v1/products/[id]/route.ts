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

    const product = await db.product.findUnique({
      where: {
        id,
        isActive: true,
      },
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
            reserved: true,
            lowStockThreshold: true,
            reorderPoint: true,
          },
        },
        reviews: {
          where: { isActive: true },
          include: {
            user: {
              select: {
                id: true,
                name: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ product });
  } catch (error) {
    console.error('Get product error:', error);
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

    const productSchema = z.object({
      name: z.string().min(1, 'Product name is required').optional(),
      slug: z.string().min(1, 'Product slug is required').optional(),
      description: z.string().min(1, 'Product description is required').optional(),
      shortDesc: z.string().optional(),
      sku: z.string().min(1, 'SKU is required').optional(),
      price: z.number().positive('Price must be positive').optional(),
      comparePrice: z.number().positive().optional(),
      costPrice: z.number().positive().optional(),
      trackQuantity: z.boolean().optional(),
      quantity: z.number().int().min(0).optional(),
      weight: z.number().positive().optional(),
      dimensions: z.object({
        length: z.number().positive(),
        width: z.number().positive(),
        height: z.number().positive(),
      }).optional(),
      images: z.array(z.string().url()).optional(),
      tags: z.array(z.string()).optional(),
      isActive: z.boolean().optional(),
      featured: z.boolean().optional(),
      seoTitle: z.string().optional(),
      seoDesc: z.string().optional(),
      categoryId: z.string().min(1, 'Category is required').optional(),
    });

    const validatedData = productSchema.parse(body);

    // Check if product exists
    const existingProduct = await db.product.findUnique({
      where: { id },
    });

    if (!existingProduct) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Check if SKU already exists (if changing)
    if (validatedData.sku && validatedData.sku !== existingProduct.sku) {
      const existingSku = await db.product.findUnique({
        where: { sku: validatedData.sku },
      });

      if (existingSku) {
        return NextResponse.json(
          { error: 'Product with this SKU already exists' },
          { status: 400 }
        );
      }
    }

    // Check if slug already exists (if changing)
    if (validatedData.slug && validatedData.slug !== existingProduct.slug) {
      const existingSlug = await db.product.findUnique({
        where: { slug: validatedData.slug },
      });

      if (existingSlug) {
        return NextResponse.json(
          { error: 'Product with this slug already exists' },
          { status: 400 }
        );
      }
    }

    // Verify category exists (if changing)
    if (validatedData.categoryId) {
      const category = await db.category.findUnique({
        where: { id: validatedData.categoryId },
      });

      if (!category) {
        return NextResponse.json(
          { error: 'Category not found' },
          { status: 404 }
        );
      }
    }

    // Update product
    const updateData: any = { ...validatedData };

    // Handle inventory update
    if (validatedData.trackQuantity !== undefined || validatedData.quantity !== undefined) {
      const currentInventory = await db.productInventory.findUnique({
        where: { productId: id },
      });

      if (validatedData.trackQuantity === false) {
        // Remove inventory tracking
        if (currentInventory) {
          await db.productInventory.delete({
            where: { productId: id },
          });
        }
      } else {
        // Update or create inventory
        const inventoryData: any = {};
        if (validatedData.quantity !== undefined) {
          inventoryData.quantity = validatedData.quantity;
        }

        if (currentInventory) {
          await db.productInventory.update({
            where: { productId: id },
            data: inventoryData,
          });
        } else {
          await db.productInventory.create({
            data: {
              productId: id,
              quantity: validatedData.quantity || 0,
              lowStockThreshold: 10,
              reorderPoint: 5,
            },
          });
        }
      }

      // Remove these from the main product update
      delete updateData.trackQuantity;
      delete updateData.quantity;
    }

    const product = await db.product.update({
      where: { id },
      data: updateData,
      include: {
        category: true,
        inventory: true,
      },
    });

    return NextResponse.json({
      message: 'Product updated successfully',
      product,
    });
  } catch (error) {
    console.error('Update product error:', error);

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

    // Check if product exists
    const existingProduct = await db.product.findUnique({
      where: { id },
      include: {
        orderItems: true,
      },
    });

    if (!existingProduct) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Check if product has orders
    if (existingProduct.orderItems.length > 0) {
      // Soft delete instead of hard delete
      await db.product.update({
        where: { id },
        data: { isActive: false },
      });

      return NextResponse.json({
        message: 'Product deactivated successfully (has existing orders)',
      });
    }

    // Hard delete if no orders
    await db.product.delete({
      where: { id },
    });

    return NextResponse.json({
      message: 'Product deleted successfully',
    });
  } catch (error) {
    console.error('Delete product error:', error);

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