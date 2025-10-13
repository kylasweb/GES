import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

// Admin role check middleware
function checkAdminRole(user: any, requiredRoles: string[] = ['SUPER_ADMIN']) {
  const adminRoles = ['SUPER_ADMIN', 'ORDER_MANAGER', 'FINANCE_MANAGER', 'CONTENT_MANAGER'];
  return adminRoles.includes(user?.role || '') && requiredRoles.includes(user?.role || '');
}

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

    // Check if user has admin privileges
    if (!checkAdminRole(user, ['SUPER_ADMIN', 'ORDER_MANAGER', 'FINANCE_MANAGER', 'CONTENT_MANAGER'])) {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      );
    }

    // Get dashboard stats
    const [
      totalOrders,
      totalRevenue,
      totalUsers,
      totalProducts,
      orderStatusCounts,
      recentOrders,
      topProducts,
      lowStockProducts
    ] = await Promise.all([
      // Total orders
      db.order.count(),
      
      // Total revenue (from completed orders)
      db.order.aggregate({
        where: {
          paymentStatus: 'PAID'
        },
        _sum: {
          totalAmount: true
        }
      }),
      
      // Total users
      db.user.count({
        where: {
          isActive: true
        }
      }),
      
      // Total products
      db.product.count({
        where: {
          isActive: true
        }
      }),
      
      // Order status counts
      db.order.groupBy({
        by: ['status'],
        _count: {
          status: true
        }
      }),
      
      // Recent orders (last 10)
      db.order.findMany({
        take: 10,
        orderBy: {
          createdAt: 'desc'
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          items: {
            select: {
              id: true
            }
          }
        }
      }),
      
      // Top selling products
      db.orderItem.groupBy({
        by: ['productId'],
        _sum: {
          quantity: true,
          totalPrice: true
        },
        orderBy: {
          _sum: {
            quantity: 'desc'
          }
        },
        take: 5
      }),
      
      // Low stock products
      db.productInventory.findMany({
        where: {
          quantity: {
            lte: db.productInventory.fields.lowStockThreshold
          }
        },
        include: {
          product: {
            select: {
              id: true,
              name: true,
              sku: true
            }
          }
        },
        orderBy: {
          quantity: 'asc'
        },
        take: 10
      })
    ]);

    // Get product details for top products
    const topProductIds = topProducts.map(p => p.productId);
    const topProductDetails = await db.product.findMany({
      where: {
        id: {
          in: topProductIds
        }
      },
      include: {
        category: {
          select: {
            name: true
          }
        }
      }
    });

    // Format top products with details
    const formattedTopProducts = topProducts.map((product, index) => {
      const details = topProductDetails.find(p => p.id === product.productId);
      return {
        id: product.productId,
        name: details?.name || `Product ${product.productId}`,
        category: details?.category?.name || 'Unknown',
        totalSold: product._sum.quantity || 0,
        revenue: parseFloat(product._sum.totalPrice?.toString() || '0')
      };
    });

    // Format order status counts
    const statusCounts = {
      pending: 0,
      processing: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0
    };

    orderStatusCounts.forEach(count => {
      const status = count.status.toLowerCase();
      if (status in statusCounts) {
        statusCounts[status as keyof typeof statusCounts] = count._count.status;
      }
    });

    // Format recent orders
    const formattedRecentOrders = recentOrders.map(order => ({
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      paymentStatus: order.paymentStatus,
      totalAmount: parseFloat(order.totalAmount.toString()),
      createdAt: order.createdAt.toISOString(),
      user: order.user,
      items: order.items
    }));

    // Format low stock products
    const formattedLowStockProducts = lowStockProducts.map(inventory => ({
      id: inventory.product.id,
      name: inventory.product.name,
      sku: inventory.product.sku,
      quantity: inventory.quantity,
      lowStockThreshold: inventory.lowStockThreshold
    }));

    const dashboardStats = {
      totalOrders,
      totalRevenue: parseFloat(totalRevenue._sum.totalAmount?.toString() || '0'),
      totalUsers,
      totalProducts,
      pendingOrders: statusCounts.pending,
      processingOrders: statusCounts.processing,
      shippedOrders: statusCounts.shipped,
      deliveredOrders: statusCounts.delivered,
      cancelledOrders: statusCounts.cancelled,
      recentOrders: formattedRecentOrders,
      topProducts: formattedTopProducts,
      lowStockProducts: formattedLowStockProducts
    };

    return NextResponse.json({
      success: true,
      data: dashboardStats
    });
  } catch (error) {
    console.error('Admin dashboard error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}