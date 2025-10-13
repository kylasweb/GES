import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { z } from 'zod';

const contentBlockSchema = z.object({
  type: z.enum(['HERO_BANNER', 'FEATURED_PRODUCTS', 'TESTIMONIALS', 'CATEGORIES', 'INFO_SECTION', 'PROMOTION_BANNER']),
  title: z.string().optional(),
  content: z.any(),
  order: z.number().int().min(0),
  isActive: z.boolean().default(true)
});

// Public GET endpoint
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const includeInactive = searchParams.get('includeInactive') === 'true';

    const where: any = {};

    if (!includeInactive) {
      where.isActive = true;
    }

    if (type) {
      where.type = type;
    }

    const contentBlocks = await db.contentBlock.findMany({
      where,
      orderBy: { order: 'asc' },
    });

    // Check if this is an admin request
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (token) {
      try {
        const user = await verifyToken(token);
        const adminRoles = ['SUPER_ADMIN', 'ORDER_MANAGER', 'FINANCE_MANAGER', 'CONTENT_MANAGER'];

        if (adminRoles.includes(user?.role || '')) {
          // Return full data for admin
          return NextResponse.json({
            success: true,
            data: contentBlocks
          });
        }
      } catch (err) {
        // Invalid token, continue with public response
      }
    }

    // Public response - only return active blocks
    return NextResponse.json({
      success: true,
      data: contentBlocks.filter(block => block.isActive)
    });
  } catch (error) {
    console.error('Get content blocks error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Admin POST endpoint
export async function POST(request: NextRequest) {
  try {
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

    // Create content block
    const contentBlock = await db.contentBlock.create({
      data: {
        type: validatedData.type,
        title: validatedData.title,
        content: validatedData.content,
        order: validatedData.order,
        isActive: validatedData.isActive
      }
    });

    return NextResponse.json({
      success: true,
      data: contentBlock
    });
  } catch (error) {
    console.error('Create content block error:', error);

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