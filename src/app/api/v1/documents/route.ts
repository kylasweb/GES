import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { z } from 'zod';

const documentSchema = z.object({
  orderId: z.string().min(1, 'Order ID is required'),
  type: z.enum(['INVOICE', 'SHIPPING_LABEL', 'PACKING_SLIP', 'RECEIPT', 'REFUND_NOTE']),
  name: z.string().min(1, 'Document name is required'),
  fileUrl: z.string().url('Valid file URL is required'),
  fileSize: z.number().positive('File size must be positive'),
  mimeType: z.string().min(1, 'MIME type is required'),
  metadata: z.any().optional()
});

// GET documents
export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('orderId');
    const type = searchParams.get('type');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    if (orderId) {
      // Check if user has access to this order
      const order = await db.order.findFirst({
        where: {
          id: orderId,
          OR: [
            { userId: user.id },
            // Admin users can access all orders
            ...(user.role === 'SUPER_ADMIN' || user.role === 'ORDER_MANAGER' || user.role === 'FINANCE_MANAGER'
              ? [{}]
              : [])
          ]
        }
      });

      if (!order) {
        return NextResponse.json(
          { success: false, error: 'Order not found or access denied' },
          { status: 404 }
        );
      }

      where.orderId = orderId;
    } else {
      // If no orderId, user can only see their own order documents
      if (!['SUPER_ADMIN', 'ORDER_MANAGER', 'FINANCE_MANAGER'].includes(user.role || '')) {
        where.order = {
          userId: user.id
        };
      }
    }

    if (type) {
      where.type = type.toUpperCase();
    }

    // Get documents
    const documents = await db.document.findMany({
      where,
      include: {
        order: {
          select: {
            id: true,
            orderNumber: true,
            userId: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip,
      take: limit
    });

    // Get total count
    const totalDocuments = await db.document.count({ where });

    return NextResponse.json({
      success: true,
      data: documents,
      pagination: {
        page,
        limit,
        total: totalDocuments,
        pages: Math.ceil(totalDocuments / limit)
      }
    });
  } catch (error) {
    console.error('Get documents error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST create document
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

    // Check admin permissions for document creation
    const adminRoles = ['SUPER_ADMIN', 'ORDER_MANAGER', 'FINANCE_MANAGER'];
    if (!adminRoles.includes(user?.role || '')) {
      return NextResponse.json(
        { success: false, error: 'Document creation access required' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validatedData = documentSchema.parse(body);

    // Check if order exists
    const order = await db.order.findUnique({
      where: { id: validatedData.orderId }
    });

    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }

    // Create document
    const document = await db.document.create({
      data: {
        orderId: validatedData.orderId,
        type: validatedData.type,
        name: validatedData.name,
        fileUrl: validatedData.fileUrl,
        fileSize: validatedData.fileSize,
        mimeType: validatedData.mimeType,
        metadata: validatedData.metadata
      }
    });

    return NextResponse.json({
      success: true,
      data: document
    });
  } catch (error) {
    console.error('Create document error:', error);

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