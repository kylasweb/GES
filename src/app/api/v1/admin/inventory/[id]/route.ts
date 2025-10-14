import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

// Admin role check middleware
function checkAdminRole(user: any, requiredRoles: string[] = ['SUPER_ADMIN']) {
  const adminRoles = ['SUPER_ADMIN', 'ORDER_MANAGER', 'FINANCE_MANAGER', 'CONTENT_MANAGER'];
  return adminRoles.includes(user?.role || '') && requiredRoles.includes(user?.role || '');
}

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
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

    // Check if user has admin privileges
    if (!checkAdminRole(user, ['SUPER_ADMIN', 'ORDER_MANAGER', 'FINANCE_MANAGER', 'CONTENT_MANAGER'])) {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { quantity, lowStockThreshold, reorderPoint } = body;

    // Validate input
    if (quantity !== undefined && (typeof quantity !== 'number' || quantity < 0)) {
      return NextResponse.json(
        { success: false, error: 'Invalid quantity' },
        { status: 400 }
      );
    }

    // Check if inventory item exists
    const inventoryItem = await db.productInventory.findUnique({
      where: { id }
    });

    if (!inventoryItem) {
      return NextResponse.json(
        { success: false, error: 'Inventory item not found' },
        { status: 404 }
      );
    }

    // Update inventory
    const updateData: any = { lastUpdated: new Date() };
    if (quantity !== undefined) updateData.quantity = quantity;
    if (lowStockThreshold !== undefined) updateData.lowStockThreshold = lowStockThreshold;
    if (reorderPoint !== undefined) updateData.reorderPoint = reorderPoint;

    const updatedInventory = await db.productInventory.update({
      where: { id },
      data: updateData,
      include: {
        product: {
          select: {
            id: true,
            name: true,
            sku: true,
            price: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Inventory updated successfully',
      data: updatedInventory
    });
  } catch (error) {
    console.error('Update inventory error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}