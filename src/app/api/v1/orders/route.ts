import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

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
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {
      userId: user.id
    };

    if (status) {
      where.status = status.toUpperCase();
    }

    // Get orders with items and transactions
    const orders = await db.order.findMany({
      where,
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                images: true
              }
            }
          }
        },
        transactions: {
          select: {
            id: true,
            transactionId: true,
            status: true,
            paymentMethod: true,
            provider: true,
            createdAt: true
          },
          orderBy: {
            createdAt: 'desc'
          }
        },
        documents: {
          where: {
            type: 'INVOICE'
          },
          select: {
            id: true,
            fileUrl: true,
            createdAt: true
          }
        }
      },
      orderBy: {
        [sortBy]: sortOrder
      },
      skip,
      take: limit
    });

    // Get total count for pagination
    const totalOrders = await db.order.count({ where });

    // Format the response
    const formattedOrders = orders.map(order => ({
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
        status: transaction.status,
        paymentMethod: transaction.paymentMethod,
        provider: transaction.provider,
        createdAt: transaction.createdAt.toISOString()
      })),
      documents: order.documents.map(doc => ({
        id: doc.id,
        fileUrl: doc.fileUrl,
        createdAt: doc.createdAt.toISOString()
      }))
    }));

    return NextResponse.json({
      success: true,
      data: formattedOrders,
      pagination: {
        page,
        limit,
        total: totalOrders,
        pages: Math.ceil(totalOrders / limit)
      }
    });
  } catch (error) {
    console.error('Get orders error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

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

    const body = await request.json();
    const {
      items,
      shippingAddress,
      billingAddress,
      paymentMethod,
      notes
    } = body;

    // Validate required fields
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Order items are required' },
        { status: 400 }
      );
    }

    if (!shippingAddress) {
      return NextResponse.json(
        { success: false, error: 'Shipping address is required' },
        { status: 400 }
      );
    }

    if (!paymentMethod) {
      return NextResponse.json(
        { success: false, error: 'Payment method is required' },
        { status: 400 }
      );
    }

    // Calculate order totals
    let subtotal = 0;
    for (const item of items) {
      subtotal += item.price * item.quantity;
    }

    const taxAmount = subtotal * 0.18; // 18% GST
    const shippingAmount = subtotal >= 1000 ? 0 : 50; // Free shipping above ₹1000
    const discountAmount = 0; // No discount for now
    const totalAmount = subtotal + taxAmount + shippingAmount - discountAmount;

    // Generate order number
    const orderNumber = `ORD${Date.now()}${Math.random().toString(36).substr(2, 5).toUpperCase()}`;

    // Create order
    const order = await db.order.create({
      data: {
        orderNumber,
        userId: user.id,
        status: 'PENDING',
        paymentStatus: 'PENDING',
        paymentMethod: paymentMethod.toUpperCase(),
        currency: 'INR',
        subtotal,
        taxAmount,
        shippingAmount,
        discountAmount,
        totalAmount,
        notes,
        shippingAddress,
        billingAddress: billingAddress || shippingAddress,
        items: {
          create: items.map((item: any) => ({
            productId: item.productId,
            productName: item.productName || `Product ${item.productId}`,
            productSku: item.productSku || `SKU${item.productId}`,
            quantity: item.quantity,
            unitPrice: item.price,
            totalPrice: item.price * item.quantity
          }))
        }
      },
      include: {
        items: true
      }
    });

    // Create sales ledger entry
    await db.salesLedger.create({
      data: {
        orderId: order.id,
        orderNumber: order.orderNumber,
        description: `Order #${order.orderNumber} - ${items.length} items`,
        debitAmount: 0,
        creditAmount: totalAmount,
        balance: totalAmount,
        category: 'SALES',
        paymentMethod: paymentMethod.toUpperCase()
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        paymentStatus: order.paymentStatus,
        totalAmount: parseFloat(order.totalAmount.toString()),
        currency: order.currency,
        createdAt: order.createdAt.toISOString()
      }
    });
  } catch (error) {
    console.error('Create order error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}