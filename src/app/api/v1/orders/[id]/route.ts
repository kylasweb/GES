import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export async function GET(
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

    const orderId = id;

    // Get order with full details
    const order = await db.order.findFirst({
      where: {
        id: orderId,
        userId: user.id
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                images: true,
                description: true,
                shortDesc: true
              }
            }
          }
        },
        transactions: {
          orderBy: {
            createdAt: 'desc'
          }
        },
        documents: {
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    });

    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }

    // Format the response
    const formattedOrder = {
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      paymentStatus: order.paymentStatus,
      paymentMethod: order.paymentMethod,
      currency: order.currency,
      subtotal: parseFloat(order.subtotal.toString()),
      taxAmount: parseFloat(order.taxAmount.toString()),
      shippingAmount: parseFloat(order.shippingAmount.toString()),
      discountAmount: parseFloat(order.discountAmount.toString()),
      totalAmount: parseFloat(order.totalAmount.toString()),
      notes: order.notes,
      shippingAddress: order.shippingAddress,
      billingAddress: order.billingAddress,
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
      items: order.items.map(item => ({
        id: item.id,
        productId: item.productId,
        productName: item.productName,
        productSku: item.productSku,
        quantity: item.quantity,
        unitPrice: parseFloat(item.unitPrice.toString()),
        totalPrice: parseFloat(item.totalPrice.toString()),
        product: item.product
      })),
      transactions: order.transactions.map(transaction => ({
        id: transaction.id,
        transactionId: transaction.transactionId,
        gateway: transaction.gateway,
        gatewayTransactionId: transaction.gatewayTransactionId,
        amount: parseFloat(transaction.amount.toString()),
        currency: transaction.currency,
        paymentMethod: transaction.paymentMethod,
        provider: transaction.provider,
        status: transaction.status,
        metadata: transaction.metadata,
        gatewayResponse: transaction.gatewayResponse,
        createdAt: transaction.createdAt.toISOString(),
        updatedAt: transaction.updatedAt.toISOString()
      })),
      documents: order.documents.map(doc => ({
        id: doc.id,
        type: doc.type,
        name: doc.name,
        fileUrl: doc.fileUrl,
        fileSize: doc.fileSize,
        mimeType: doc.mimeType,
        metadata: doc.metadata,
        createdAt: doc.createdAt.toISOString()
      }))
    };

    return NextResponse.json({
      success: true,
      data: formattedOrder
    });
  } catch (error) {
    console.error('Get order error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

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

    const orderId = id;
    const body = await request.json();
    const { action } = body;

    // Get order first
    const order = await db.order.findFirst({
      where: {
        id: orderId,
        userId: user.id
      }
    });

    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }

    // Handle different actions
    switch (action) {
      case 'cancel':
        // Only allow cancellation for pending orders
        if (!['PENDING', 'AWAITING_PAYMENT', 'COD_PENDING'].includes(order.status)) {
          return NextResponse.json(
            { success: false, error: 'Order cannot be cancelled at this stage' },
            { status: 400 }
          );
        }

        await db.order.update({
          where: { id: orderId },
          data: {
            status: 'CANCELLED',
            updatedAt: new Date()
          }
        });

        // Update payment status if needed
        if (order.paymentStatus === 'PENDING') {
          await db.order.update({
            where: { id: orderId },
            data: {
              paymentStatus: 'FAILED',
              updatedAt: new Date()
            }
          });
        }

        break;

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      message: `Order ${action} successful`
    });
  } catch (error) {
    console.error('Update order error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}