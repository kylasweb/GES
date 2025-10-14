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

        // Get order details
        const order = await db.order.findFirst({
            where: {
                id: orderId,
                userId: user.id
            },
            include: {
                items: {
                    include: {
                        product: true
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

        // Check if invoice already exists
        const existingInvoice = await db.document.findFirst({
            where: {
                orderId: orderId,
                type: 'INVOICE'
            }
        });

        if (existingInvoice) {
            // Return existing invoice
            return NextResponse.redirect(existingInvoice.fileUrl);
        }

        // Generate invoice HTML
        const invoiceHtml = generateInvoiceHTML(order, user);

        // For now, return HTML response (in production, you'd generate PDF)
        return new NextResponse(invoiceHtml, {
            headers: {
                'Content-Type': 'text/html',
                'Content-Disposition': `inline; filename="invoice-${order.orderNumber}.html"`
            }
        });
    } catch (error) {
        console.error('Generate invoice error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}

function generateInvoiceHTML(order: any, user: any): string {
    const shippingAddress = order.shippingAddress;
    const items = order.items;
    const subtotal = parseFloat(order.subtotal.toString());
    const taxAmount = parseFloat(order.taxAmount.toString());
    const shippingAmount = parseFloat(order.shippingAmount.toString());
    const totalAmount = parseFloat(order.totalAmount.toString());

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Invoice #${order.orderNumber}</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .invoice-container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            padding: 40px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 40px;
            border-bottom: 2px solid #10b981;
            padding-bottom: 20px;
        }
        .logo {
            font-size: 24px;
            font-weight: bold;
            color: #10b981;
        }
        .invoice-details {
            text-align: right;
        }
        .invoice-number {
            font-size: 18px;
            font-weight: bold;
            color: #374151;
        }
        .invoice-date {
            color: #6b7280;
            font-size: 14px;
        }
        .company-info {
            margin-bottom: 30px;
        }
        .company-name {
            font-size: 20px;
            font-weight: bold;
            color: #374151;
            margin-bottom: 10px;
        }
        .company-address {
            color: #6b7280;
            line-height: 1.6;
        }
        .billing-info {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 40px;
            margin-bottom: 30px;
        }
        .info-section {
            background: #f9fafb;
            padding: 20px;
            border-radius: 6px;
        }
        .info-title {
            font-weight: bold;
            color: #374151;
            margin-bottom: 10px;
            font-size: 14px;
            text-transform: uppercase;
        }
        .info-content {
            color: #6b7280;
            line-height: 1.6;
        }
        .items-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }
        .items-table th {
            background: #f9fafb;
            padding: 12px;
            text-align: left;
            font-weight: 600;
            color: #374151;
            border-bottom: 2px solid #e5e7eb;
        }
        .items-table td {
            padding: 12px;
            border-bottom: 1px solid #e5e7eb;
        }
        .items-table .text-right {
            text-align: right;
        }
        .totals {
            display: flex;
            justify-content: flex-end;
            margin-top: 20px;
        }
        .totals-table {
            width: 300px;
        }
        .totals-table td {
            padding: 8px 12px;
        }
        .totals-table .label {
            color: #6b7280;
        }
        .totals-table .value {
            text-align: right;
            font-weight: 600;
        }
        .totals-table .total-row {
            border-top: 2px solid #e5e7eb;
            font-size: 18px;
            color: #10b981;
        }
        .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            text-align: center;
            color: #6b7280;
            font-size: 14px;
        }
        .status-badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
        }
        .status-paid {
            background: #d1fae5;
            color: #065f46;
        }
        .status-pending {
            background: #fed7aa;
            color: #92400e;
        }
    </style>
</head>
<body>
    <div class="invoice-container">
        <div class="header">
            <div class="logo">
                🌱 Green Energy Solutions
            </div>
            <div class="invoice-details">
                <div class="invoice-number">INVOICE #${order.orderNumber}</div>
                <div class="invoice-date">Date: ${new Date(order.createdAt).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    })}</div>
                <div class="status-badge status-${order.paymentStatus.toLowerCase()}">
                    ${order.paymentStatus}
                </div>
            </div>
        </div>

        <div class="company-info">
            <div class="company-name">Green Energy Solutions</div>
            <div class="company-address">
                123, Eco Park, Sector 45, Gurgaon, Haryana 122002<br>
                GSTIN: 06AAHCG1234B1ZV<br>
                Email: support@greenenergysolutions.in<br>
                Phone: +91-8010-123-456
            </div>
        </div>

        <div class="billing-info">
            <div class="info-section">
                <div class="info-title">Bill To</div>
                <div class="info-content">
                    ${shippingAddress?.fullName || 'Customer'}<br>
                    ${shippingAddress?.address || ''}<br>
                    ${shippingAddress?.city || ''}, ${shippingAddress?.state || ''} - ${shippingAddress?.postalCode || ''}<br>
                    ${shippingAddress?.phone || ''}<br>
                    ${user?.email || ''}
                </div>
            </div>
            <div class="info-section">
                <div class="info-title">Payment Information</div>
                <div class="info-content">
                    Payment Method: ${order.paymentMethod}<br>
                    Payment Status: ${order.paymentStatus}<br>
                    Order Status: ${order.status}<br>
                    Currency: ${order.currency}
                </div>
            </div>
        </div>

        <table class="items-table">
            <thead>
                <tr>
                    <th>Product Description</th>
                    <th>SKU</th>
                    <th class="text-right">Quantity</th>
                    <th class="text-right">Unit Price</th>
                    <th class="text-right">Total</th>
                </tr>
            </thead>
            <tbody>
                ${items.map((item: any) => `
                    <tr>
                        <td>${item.productName}</td>
                        <td>${item.productSku}</td>
                        <td class="text-right">${item.quantity}</td>
                        <td class="text-right">₹${parseFloat(item.unitPrice.toString()).toLocaleString('en-IN')}</td>
                        <td class="text-right">₹${parseFloat(item.totalPrice.toString()).toLocaleString('en-IN')}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>

        <div class="totals">
            <table class="totals-table">
                <tr>
                    <td class="label">Subtotal:</td>
                    <td class="value">₹${subtotal.toLocaleString('en-IN')}</td>
                </tr>
                <tr>
                    <td class="label">GST (18%):</td>
                    <td class="value">₹${taxAmount.toLocaleString('en-IN')}</td>
                </tr>
                <tr>
                    <td class="label">Shipping:</td>
                    <td class="value">₹${shippingAmount.toLocaleString('en-IN')}</td>
                </tr>
                <tr>
                    <td class="label">Discount:</td>
                    <td class="value">-₹${parseFloat(order.discountAmount.toString()).toLocaleString('en-IN')}</td>
                </tr>
                <tr class="total-row">
                    <td class="label">Total:</td>
                    <td class="value">₹${totalAmount.toLocaleString('en-IN')}</td>
                </tr>
            </table>
        </div>

        <div class="footer">
            <p>Thank you for your business! This is a computer-generated invoice and does not require a signature.</p>
            <p>For any queries, please contact us at support@greenenergysolutions.in or call +91-8010-123-456</p>
        </div>
    </div>
</body>
</html>
  `;
}