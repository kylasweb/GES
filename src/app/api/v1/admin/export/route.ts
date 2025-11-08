import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

// GET - Export data as CSV
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
        const type = searchParams.get('type'); // orders, products, customers
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');

        if (!type || !['orders', 'products', 'customers'].includes(type)) {
            return NextResponse.json({ success: false, error: 'Invalid export type' }, { status: 400 });
        }

        let csv = '';
        let filename = '';

        if (type === 'orders') {
            const where: any = {};
            if (startDate && endDate) {
                where.createdAt = {
                    gte: new Date(startDate),
                    lte: new Date(endDate)
                };
            }

            const orders = await db.order.findMany({
                where,
                include: {
                    user: { select: { name: true, email: true } }
                },
                orderBy: { createdAt: 'desc' }
            });

            csv = 'Order Number,Customer Name,Customer Email,Total Amount,Status,Payment Method,Created At\n';
            orders.forEach(order => {
                csv += `${order.orderNumber},"${order.user.name}",${order.user.email},${order.totalAmount},${order.status},${order.paymentMethod},${order.createdAt.toISOString()}\n`;
            });
            filename = `orders-${Date.now()}.csv`;
        }

        if (type === 'products') {
            const products = await db.product.findMany({
                orderBy: { createdAt: 'desc' }
            });

            csv = 'Name,SKU,Price,Quantity,Status,Created At\n';
            products.forEach(product => {
                csv += `"${product.name}",${product.sku},${product.price},${product.quantity},${product.status},${product.createdAt.toISOString()}\n`;
            });
            filename = `products-${Date.now()}.csv`;
        }

        if (type === 'customers') {
            const where: any = {};
            if (startDate && endDate) {
                where.createdAt = {
                    gte: new Date(startDate),
                    lte: new Date(endDate)
                };
            }

            const users = await db.user.findMany({
                where: {
                    ...where,
                    role: 'CUSTOMER'
                },
                select: {
                    name: true,
                    email: true,
                    phone: true,
                    createdAt: true,
                    _count: {
                        select: { orders: true }
                    }
                },
                orderBy: { createdAt: 'desc' }
            });

            csv = 'Name,Email,Phone,Total Orders,Registered At\n';
            users.forEach(user => {
                csv += `"${user.name}",${user.email},${user.phone || 'N/A'},${user._count.orders},${user.createdAt.toISOString()}\n`;
            });
            filename = `customers-${Date.now()}.csv`;
        }

        return new NextResponse(csv, {
            status: 200,
            headers: {
                'Content-Type': 'text/csv',
                'Content-Disposition': `attachment; filename="${filename}"`
            }
        });
    } catch (error) {
        console.error('Export error:', error);
        return NextResponse.json({ success: false, error: 'Failed to export data' }, { status: 500 });
    }
}
