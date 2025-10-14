import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { z } from 'zod';

const contentBlockSchema = z.object({
  type: z.enum(['HERO_BANNER', 'FEATURED_PRODUCTS', 'TESTIMONIALS', 'CATEGORIES', 'INFO_SECTION', 'PROMOTION_BANNER']).optional(),
  title: z.string().optional(),
  content: z.any().optional(),
  order: z.number().int().min(0).optional(),
  isActive: z.boolean().optional()
});

// GET individual content block
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const contentBlock = await db.contentBlock.findUnique({
      where: { id }
    });

    if (!contentBlock) {
      return NextResponse.json(
        { success: false, error: 'Content block not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: contentBlock
    });
  } catch (error) {
    console.error('Get content block error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT update content block
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    // Get user from token
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const user = await verifyToken(token);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Invalid authentication' },
        { status: 401 }
      );
    }

    // Check admin permissions
    const adminRoles = ['SUPER_ADMIN', 'CONTENT_MANAGER'];
    if (!adminRoles.includes(user?.role || '')) {
      return NextResponse.json(
        { success: false, error: 'Content management access required' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validatedData = contentBlockSchema.parse(body);

    // Check if content block exists
    const existingBlock = await db.contentBlock.findUnique({
      where: { id }
    });

    if (!existingBlock) {
      return NextResponse.json(
        { success: false, error: 'Content block not found' },
        { status: 404 }
      );
    }

    // Update content block
    const updatedBlock = await db.contentBlock.update({
      where: { id: params.id },
      data: validatedData
    });

    return NextResponse.json({
      success: true,
      data: updatedBlock
    });
  } catch (error) {
    console.error('Update content block error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.issues[0].message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE content block
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    // Get user from token
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const user = await verifyToken(token);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Invalid authentication' },
        { status: 401 }
      );
    }

    // Check admin permissions
    const adminRoles = ['SUPER_ADMIN', 'CONTENT_MANAGER'];
    if (!adminRoles.includes(user?.role || '')) {
      return NextResponse.json(
        { success: false, error: 'Content management access required' },
        { status: 403 }
      );
    }

    // Check if content block exists
    const existingBlock = await db.contentBlock.findUnique({
      where: { id }
    });

    if (!existingBlock) {
      return NextResponse.json(
        { success: false, error: 'Content block not found' },
        { status: 404 }
      );
    }

    // Delete content block
    await db.contentBlock.delete({
      where: { id }
    });

    return NextResponse.json({
      success: true,
      message: 'Content block deleted successfully'
    });
  } catch (error) {
    console.error('Delete content block error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}