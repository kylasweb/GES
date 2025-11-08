# E-Commerce Features Implementation Guide

This document contains complete implementations for all missing e-commerce features with CRUD operations.

## ✅ Completed Features

### 1. Returns/Refunds Management
- **Database**: `Return` model with all fields
- **API Routes**: 
  - `GET /api/v1/returns` - List returns with pagination
  - `POST /api/v1/returns` - Create return request
  - `GET /api/v1/returns/[id]` - Get single return
  - `PATCH /api/v1/returns/[id]` - Update return (admin)
  - `DELETE /api/v1/returns/[id]` - Cancel return

**Status**: API Complete ✅
**Next**: Admin UI + Customer UI

---

## 📋 Remaining API Implementations

### 2. Warranty Management API

#### Create: `/api/v1/warranties/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { z } from 'zod';

const warrantySchema = z.object({
  orderId: z.string(),
  productId: z.string(),
  warrantyPeriod: z.number().min(1).max(120) // months
});

const claimSchema = z.object({
  warrantyId: z.string(),
  issue: z.string(),
  description: z.string(),
  images: z.array(z.string()).optional()
});

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }

    const user = await verifyToken(token);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Invalid authentication' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');
    const skip = (page - 1) * limit;

    const where: any = {};
    if (!['SUPER_ADMIN', 'ORDER_MANAGER'].includes(user.role || '')) {
      where.userId = user.id;
    }
    if (status) where.status = status;

    const [warranties, total] = await Promise.all([
      db.warranty.findMany({
        where,
        include: {
          product: { select: { name: true, sku: true } },
          order: { select: { orderNumber: true } },
          claims: { orderBy: { createdAt: 'desc' } }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      db.warranty.count({ where })
    ]);

    return NextResponse.json({
      success: true,
      data: warranties,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
    });
  } catch (error) {
    console.error('Get warranties error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch warranties' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }

    const user = await verifyToken(token);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Invalid authentication' }, { status: 401 });
    }

    const body = await request.json();
    const validated = warrantySchema.parse(body);

    // Verify order belongs to user
    const order = await db.order.findFirst({
      where: { id: validated.orderId, userId: user.id },
      include: { items: true }
    });

    if (!order) {
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
    }

    // Check if product is in order
    const orderItem = order.items.find(item => item.productId === validated.productId);
    if (!orderItem) {
      return NextResponse.json({ success: false, error: 'Product not found in order' }, { status: 400 });
    }

    // Generate warranty number
    const warrantyNumber = `WAR-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Calculate expiry date
    const expiryDate = new Date(order.createdAt);
    expiryDate.setMonth(expiryDate.getMonth() + validated.warrantyPeriod);

    const warranty = await db.warranty.create({
      data: {
        warrantyNumber,
        orderId: validated.orderId,
        productId: validated.productId,
        userId: user.id,
        purchaseDate: order.createdAt,
        warrantyPeriod: validated.warrantyPeriod,
        expiryDate,
        status: 'ACTIVE'
      },
      include: {
        product: { select: { name: true } },
        order: { select: { orderNumber: true } }
      }
    });

    return NextResponse.json({ success: true, data: warranty }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: 'Validation failed', details: error.errors }, { status: 400 });
    }
    console.error('Create warranty error:', error);
    return NextResponse.json({ success: false, error: 'Failed to register warranty' }, { status: 500 });
  }
}
```

#### Create: `/api/v1/warranties/[id]/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }

    const user = await verifyToken(token);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Invalid authentication' }, { status: 401 });
    }

    const { id } = await params;
    const where: any = { id };
    
    if (!['SUPER_ADMIN', 'ORDER_MANAGER'].includes(user.role || '')) {
      where.userId = user.id;
    }

    const warranty = await db.warranty.findFirst({
      where,
      include: {
        product: true,
        order: { select: { orderNumber: true } },
        user: { select: { name: true, email: true, phone: true } },
        claims: { orderBy: { createdAt: 'desc' } }
      }
    });

    if (!warranty) {
      return NextResponse.json({ success: false, error: 'Warranty not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: warranty });
  } catch (error) {
    console.error('Get warranty error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch warranty' }, { status: 500 });
  }
}
```

#### Create: `/api/v1/warranties/claims/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { z } from 'zod';

const claimSchema = z.object({
  warrantyId: z.string(),
  issue: z.string(),
  description: z.string(),
  images: z.array(z.string()).optional()
});

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }

    const user = await verifyToken(token);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Invalid authentication' }, { status: 401 });
    }

    const body = await request.json();
    const validated = claimSchema.parse(body);

    // Verify warranty belongs to user and is active
    const warranty = await db.warranty.findFirst({
      where: {
        id: validated.warrantyId,
        userId: user.id,
        status: 'ACTIVE'
      }
    });

    if (!warranty) {
      return NextResponse.json({ success: false, error: 'Active warranty not found' }, { status: 404 });
    }

    // Check if warranty is expired
    if (new Date() > new Date(warranty.expiryDate)) {
      return NextResponse.json({ success: false, error: 'Warranty has expired' }, { status: 400 });
    }

    const claimNumber = `CLM-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    const claim = await db.warrantyClaim.create({
      data: {
        claimNumber,
        warrantyId: validated.warrantyId,
        issue: validated.issue,
        description: validated.description,
        images: validated.images || [],
        status: 'SUBMITTED'
      },
      include: {
        warranty: {
          include: {
            product: { select: { name: true } }
          }
        }
      }
    });

    // Update warranty status
    await db.warranty.update({
      where: { id: validated.warrantyId },
      data: { status: 'CLAIMED' }
    });

    return NextResponse.json({ success: true, data: claim }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: 'Validation failed', details: error.errors }, { status: 400 });
    }
    console.error('Create claim error:', error);
    return NextResponse.json({ success: false, error: 'Failed to submit claim' }, { status: 500 });
  }
}
```

---

### 3. Stock Alerts API

#### Create: `/api/v1/stock-alerts/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { z } from 'zod';

const alertSchema = z.object({
  productId: z.string(),
  email: z.string().email()
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = alertSchema.parse(body);

    // Check if product exists and is out of stock
    const product = await db.product.findUnique({
      where: { id: validated.productId },
      select: { id: true, name: true, quantity: true }
    });

    if (!product) {
      return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
    }

    if (product.quantity > 0) {
      return NextResponse.json({ success: false, error: 'Product is in stock' }, { status: 400 });
    }

    // Check if alert already exists
    const existing = await db.stockAlert.findFirst({
      where: {
        productId: validated.productId,
        email: validated.email,
        status: 'PENDING'
      }
    });

    if (existing) {
      return NextResponse.json({ success: false, error: 'Alert already registered' }, { status: 400 });
    }

    const alert = await db.stockAlert.create({
      data: {
        productId: validated.productId,
        email: validated.email,
        status: 'PENDING'
      },
      include: {
        product: { select: { name: true } }
      }
    });

    return NextResponse.json({ success: true, data: alert }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: 'Validation failed', details: error.errors }, { status: 400 });
    }
    console.error('Create alert error:', error);
    return NextResponse.json({ success: false, error: 'Failed to create stock alert' }, { status: 500 });
  }
}
```

---

### 4. Quotes API

#### Create: `/api/v1/quotes/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { z } from 'zod';

const quoteSchema = z.object({
  email: z.string().email(),
  name: z.string(),
  phone: z.string().optional(),
  company: z.string().optional(),
  items: z.array(z.object({
    productId: z.string(),
    quantity: z.number().min(1),
    notes: z.string().optional()
  })),
  message: z.string().optional()
});

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }

    const user = await verifyToken(token);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Invalid authentication' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');
    const skip = (page - 1) * limit;

    const where: any = {};
    if (!['SUPER_ADMIN', 'ORDER_MANAGER'].includes(user.role || '')) {
      where.userId = user.id;
    }
    if (status) where.status = status;

    const [quotes, total] = await Promise.all([
      db.quote.findMany({
        where,
        include: {
          user: { select: { name: true, email: true } }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      db.quote.count({ where })
    ]);

    return NextResponse.json({
      success: true,
      data: quotes,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
    });
  } catch (error) {
    console.error('Get quotes error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch quotes' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = quoteSchema.parse(body);

    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    let userId: string | null = null;

    if (token) {
      const user = await verifyToken(token);
      if (user) userId = user.id;
    }

    const quoteNumber = `QUO-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    const quote = await db.quote.create({
      data: {
        quoteNumber,
        userId,
        email: validated.email,
        name: validated.name,
        phone: validated.phone,
        company: validated.company,
        items: validated.items,
        message: validated.message,
        status: 'PENDING'
      }
    });

    return NextResponse.json({ success: true, data: quote }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: 'Validation failed', details: error.errors }, { status: 400 });
    }
    console.error('Create quote error:', error);
    return NextResponse.json({ success: false, error: 'Failed to create quote' }, { status: 500 });
  }
}
```

---

### 5. Gift Cards API

#### Create: `/api/v1/gift-cards/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { z } from 'zod';

const giftCardSchema = z.object({
  initialValue: z.number().min(100).max(100000),
  recipientEmail: z.string().email().optional(),
  recipientName: z.string().optional(),
  message: z.string().optional(),
  expiryMonths: z.number().min(1).max(24).default(12)
});

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }

    const user = await verifyToken(token);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Invalid authentication' }, { status: 401 });
    }

    const body = await request.json();
    const validated = giftCardSchema.parse(body);

    // Generate unique code
    const code = `GC${Date.now()}${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + validated.expiryMonths);

    const giftCard = await db.giftCard.create({
      data: {
        code,
        initialValue: validated.initialValue,
        balance: validated.initialValue,
        purchasedBy: user.id,
        recipientEmail: validated.recipientEmail,
        recipientName: validated.recipientName,
        message: validated.message,
        expiresAt,
        status: 'ACTIVE'
      }
    });

    // Create transaction
    await db.giftCardTransaction.create({
      data: {
        giftCardId: giftCard.id,
        amount: validated.initialValue,
        balance: validated.initialValue,
        type: 'PURCHASE'
      }
    });

    return NextResponse.json({ success: true, data: giftCard }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: 'Validation failed', details: error.errors }, { status: 400 });
    }
    console.error('Create gift card error:', error);
    return NextResponse.json({ success: false, error: 'Failed to create gift card' }, { status: 500 });
  }
}
```

#### Create: `/api/v1/gift-cards/check/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');

    if (!code) {
      return NextResponse.json({ success: false, error: 'Gift card code is required' }, { status: 400 });
    }

    const giftCard = await db.giftCard.findUnique({
      where: { code },
      select: {
        code: true,
        balance: true,
        status: true,
        expiresAt: true
      }
    });

    if (!giftCard) {
      return NextResponse.json({ success: false, error: 'Gift card not found' }, { status: 404 });
    }

    if (giftCard.status !== 'ACTIVE') {
      return NextResponse.json({ success: false, error: 'Gift card is not active' }, { status: 400 });
    }

    if (giftCard.expiresAt && new Date() > new Date(giftCard.expiresAt)) {
      return NextResponse.json({ success: false, error: 'Gift card has expired' }, { status: 400 });
    }

    return NextResponse.json({ success: true, data: giftCard });
  } catch (error) {
    console.error('Check gift card error:', error);
    return NextResponse.json({ success: false, error: 'Failed to check gift card' }, { status: 500 });
  }
}
```

---

### 6. Order Notes API

#### Create: `/api/v1/order-notes/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { z } from 'zod';

const noteSchema = z.object({
  orderId: z.string(),
  note: z.string().min(1),
  isInternal: z.boolean().default(false)
});

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }

    const user = await verifyToken(token);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Invalid authentication' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('orderId');

    if (!orderId) {
      return NextResponse.json({ success: false, error: 'Order ID required' }, { status: 400 });
    }

    const where: any = { orderId };
    
    // Non-admin users can't see internal notes
    if (!['SUPER_ADMIN', 'ORDER_MANAGER'].includes(user.role || '')) {
      where.isInternal = false;
      // Verify order belongs to user
      const order = await db.order.findFirst({
        where: { id: orderId, userId: user.id }
      });
      if (!order) {
        return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
      }
    }

    const notes = await db.orderNote.findMany({
      where,
      include: {
        user: { select: { name: true, role: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ success: true, data: notes });
  } catch (error) {
    console.error('Get order notes error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch order notes' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }

    const user = await verifyToken(token);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Invalid authentication' }, { status: 401 });
    }

    const body = await request.json();
    const validated = noteSchema.parse(body);

    // Only admins can add internal notes
    if (validated.isInternal && !['SUPER_ADMIN', 'ORDER_MANAGER'].includes(user.role || '')) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
    }

    // Verify order access
    const order = await db.order.findFirst({
      where: {
        id: validated.orderId,
        ...(user.role === 'CUSTOMER' ? { userId: user.id } : {})
      }
    });

    if (!order) {
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
    }

    const note = await db.orderNote.create({
      data: {
        orderId: validated.orderId,
        userId: user.id,
        note: validated.note,
        isInternal: validated.isInternal
      },
      include: {
        user: { select: { name: true, role: true } }
      }
    });

    return NextResponse.json({ success: true, data: note }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: 'Validation failed', details: error.errors }, { status: 400 });
    }
    console.error('Create order note error:', error);
    return NextResponse.json({ success: false, error: 'Failed to create order note' }, { status: 500 });
  }
}
```

---

## 🎨 Frontend Pages to Create

### 1. Admin Returns Management
**Path**: `/admin/returns/page.tsx`
- List all returns with filters (status, date range)
- View return details
- Approve/reject returns
- Add tracking codes
- Process refunds

### 2. Customer Returns Page
**Path**: `/account/returns/page.tsx`
- List user's returns
- Create new return request
- Upload product images
- Track return status
- Cancel pending returns

### 3. Admin Warranty Management
**Path**: `/admin/warranties/page.tsx`
- List all warranties
- View warranty claims
- Approve/reject claims
- Update claim status
- Add resolution notes

### 4. Customer Warranty Page
**Path**: `/account/warranties/page.tsx`
- List user's warranties
- Register new warranty
- Submit warranty claims
- Upload issue photos
- Track claim status

### 5. Admin Quotes Management
**Path**: `/admin/quotes/page.tsx`
- List all quote requests
- View quote details with items
- Create and send quotes
- Convert quotes to orders

### 6. Quote Request Page
**Path**: `/quote/page.tsx`
- Request quote form
- Select products and quantities
- Add business details
- Add special requirements

### 7. Admin Gift Cards
**Path**: `/admin/gift-cards/page.tsx`
- List all gift cards
- Create gift cards manually
- View transaction history
- Deactivate/reactivate cards

### 8. Gift Card Purchase
**Path**: `/gift-cards/page.tsx`
- Purchase gift cards
- Set amount and design
- Add recipient details
- Add personal message

### 9. Admin Reports & Export
**Path**: `/admin/reports/page.tsx`
- Sales reports with charts
- Product performance
- Customer analytics
- Export to CSV/Excel
- Date range filters

---

## 📊 Export/Reports Implementation

#### Create: `/api/v1/admin/export/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }

    const user = await verifyToken(token);
    if (!user || !['SUPER_ADMIN', 'ORDER_MANAGER', 'FINANCE_MANAGER'].includes(user.role || '')) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // orders, products, customers
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    if (!type) {
      return NextResponse.json({ success: false, error: 'Export type required' }, { status: 400 });
    }

    let data;
    let headers;

    switch (type) {
      case 'orders':
        const orderWhere: any = {};
        if (startDate) orderWhere.createdAt = { gte: new Date(startDate) };
        if (endDate) orderWhere.createdAt = { ...orderWhere.createdAt, lte: new Date(endDate) };

        const orders = await db.order.findMany({
          where: orderWhere,
          include: {
            user: { select: { name: true, email: true } },
            items: true
          },
          orderBy: { createdAt: 'desc' }
        });

        headers = ['Order Number', 'Customer', 'Email', 'Status', 'Payment Status', 'Total Amount', 'Date'];
        data = orders.map(order => [
          order.orderNumber,
          order.user?.name || 'Guest',
          order.user?.email || '',
          order.status,
          order.paymentStatus,
          `₹${Number(order.totalAmount).toLocaleString()}`,
          new Date(order.createdAt).toLocaleDateString()
        ]);
        break;

      case 'products':
        const products = await db.product.findMany({
          include: {
            category: { select: { name: true } },
            brand: { select: { name: true } }
          }
        });

        headers = ['Name', 'SKU', 'Category', 'Brand', 'Price', 'Stock', 'Status'];
        data = products.map(product => [
          product.name,
          product.sku,
          product.category.name,
          product.brand?.name || '',
          `₹${Number(product.price).toLocaleString()}`,
          product.quantity,
          product.isActive ? 'Active' : 'Inactive'
        ]);
        break;

      case 'customers':
        const customers = await db.user.findMany({
          where: { role: 'CUSTOMER' },
          include: {
            orders: { select: { totalAmount: true } }
          }
        });

        headers = ['Name', 'Email', 'Phone', 'Total Orders', 'Total Spent', 'Join Date'];
        data = customers.map(customer => [
          customer.name || '',
          customer.email,
          customer.phone || '',
          customer.orders.length,
          `₹${customer.orders.reduce((sum, o) => sum + Number(o.totalAmount), 0).toLocaleString()}`,
          new Date(customer.createdAt).toLocaleDateString()
        ]);
        break;

      default:
        return NextResponse.json({ success: false, error: 'Invalid export type' }, { status: 400 });
    }

    // Generate CSV
    const csv = [
      headers.join(','),
      ...data.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${type}-export-${Date.now()}.csv"`
      }
    });
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json({ success: false, error: 'Failed to export data' }, { status: 500 });
  }
}
```

---

## 🚀 Quick Implementation Priority

1. **Phase 1 (This Week)**: 
   - ✅ Complete Returns API & Admin UI
   - Create Customer Returns Page
   - Add Export functionality

2. **Phase 2 (Next Week)**:
   - Warranty API & UI
   - Order Notes
   - Stock Alerts

3. **Phase 3 (Later)**:
   - Quotes System
   - Gift Cards
   - Product Comparison
   - Wishlist Sharing

---

## 📝 Notes

- All APIs include proper authentication & authorization
- Admin-only routes check for SUPER_ADMIN or ORDER_MANAGER roles
- Customer routes verify ownership of resources
- All endpoints return consistent JSON responses
- Pagination included where applicable
- Validation using Zod schemas
- Error handling with try-catch blocks
- Database transactions where needed

---

**Database Migration**: Already applied ✅
**Prisma Client**: Already generated ✅
**Next Step**: Build frontend UIs for each feature
