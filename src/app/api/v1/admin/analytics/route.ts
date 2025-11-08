import { NextRequest, NextResponse } from 'next/server';
import { db as prisma } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';

export async function GET(request: NextRequest) {
    try {
        // Verify authentication
        const user = await verifyAuth(request);
        if (!user || (user.role !== 'SUPER_ADMIN' && user.role !== 'ADMIN')) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const searchParams = request.nextUrl.searchParams;
        const period = searchParams.get('period') || '30d';

        // Calculate date range based on period
        const now = new Date();
        const startDate = new Date();

        switch (period) {
            case '7d':
                startDate.setDate(now.getDate() - 7);
                break;
            case '30d':
                startDate.setDate(now.getDate() - 30);
                break;
            case '90d':
                startDate.setDate(now.getDate() - 90);
                break;
            case '1y':
                startDate.setFullYear(now.getFullYear() - 1);
                break;
            default:
                startDate.setDate(now.getDate() - 30);
        }

        // Fetch analytics data
        const [
            totalOrders,
            totalRevenue,
            totalUsers,
            totalProducts,
            recentOrders
        ] = await Promise.all([
            prisma.order.count({
                where: {
                    createdAt: { gte: startDate }
                }
            }),
            prisma.order.aggregate({
                where: {
                    createdAt: { gte: startDate },
                    status: { notIn: ['CANCELLED', 'REFUNDED'] }
                },
                _sum: {
                    totalAmount: true
                }
            }),
            prisma.user.count({
                where: {
                    createdAt: { gte: startDate }
                }
            }),
            prisma.product.count(),
            prisma.order.findMany({
                where: {
                    createdAt: { gte: startDate }
                },
                orderBy: { createdAt: 'desc' },
                take: 10,
                select: {
                    id: true,
                    orderNumber: true,
                    totalAmount: true,
                    status: true,
                    createdAt: true
                }
            })
        ]);

        return NextResponse.json({
            period,
            totalOrders,
            totalRevenue: totalRevenue._sum.totalAmount || 0,
            totalUsers,
            totalProducts,
            recentOrders
        });
    } catch (error) {
        console.error('Error fetching analytics:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
