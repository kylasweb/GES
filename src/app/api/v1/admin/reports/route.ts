import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { OrderStatus } from '@prisma/client';

// GET - Dashboard reports
export async function GET(request: NextRequest) {
    try {
        const token = request.headers.get('authorization')?.replace('Bearer ', '');
        if (!token) {
            return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
        }

        const user = await verifyToken(token);
        if (!user || !['SUPER_ADMIN', 'ORDER_MANAGER'].includes(user.role || '')) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
        }

        const { searchParams } = new URL(request.url);
        const period = searchParams.get('period') || '30'; // days
        const days = parseInt(period);

        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        // Get statistics
        const [
            totalOrders,
            totalRevenue,
            totalCustomers,
            pendingOrders,
            lowStockProducts,
            recentOrders,
            topProducts
        ] = await Promise.all([
            // Total orders in period
            db.order.count({
                where: { createdAt: { gte: startDate } }
            }),

            // Total revenue in period
            db.order.aggregate({
                where: {
                    createdAt: { gte: startDate },
                    status: { in: [OrderStatus.PROCESSING, OrderStatus.SHIPPED, OrderStatus.DELIVERED] }
                },
                _sum: { totalAmount: true }
            }),

            // Total new customers in period
            db.user.count({
                where: {
                    createdAt: { gte: startDate },
                    role: 'CUSTOMER'
                }
            }),

            // Pending orders
            db.order.count({
                where: { status: OrderStatus.PENDING }
            }),

            // Low stock products (quantity < 10)
            db.product.count({
                where: { quantity: { lt: 10 } }
            }),

            // Recent orders
            db.order.findMany({
                take: 10,
                orderBy: { createdAt: 'desc' },
                include: {
                    user: { select: { name: true, email: true } }
                }
            }),

            // Top selling products (this is approximate without proper sales tracking)
            db.product.findMany({
                where: {
                    quantity: { lt: 50 } // Products with lower stock might be selling better
                },
                take: 10,
                orderBy: { quantity: 'asc' },
                select: {
                    id: true,
                    name: true,
                    sku: true,
                    price: true,
                    quantity: true
                }
            })
        ]);

        // Get daily sales for chart
        const dailySales = await db.$queryRaw<Array<{ date: string; sales: number; revenue: number }>>`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as sales,
        SUM(total_amount) as revenue
      FROM orders
      WHERE created_at >= ${startDate}
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `;

        return NextResponse.json({
            success: true,
            data: {
                summary: {
                    totalOrders,
                    totalRevenue: totalRevenue._sum?.totalAmount ? Number(totalRevenue._sum.totalAmount) : 0,
                    totalCustomers,
                    pendingOrders,
                    lowStockProducts
                },
                recentOrders,
                topProducts,
                dailySales
            }
        });
    } catch (error) {
        console.error('Reports error:', error);
        return NextResponse.json({ success: false, error: 'Failed to generate reports' }, { status: 500 });
    }
}