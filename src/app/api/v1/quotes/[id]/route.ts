import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { z } from 'zod';

const updateQuoteSchema = z.object({
    status: z.enum(['PENDING', 'QUOTED', 'ACCEPTED', 'REJECTED', 'EXPIRED']).optional(),
    quotedAmount: z.number().positive().optional(),
    validUntil: z.string().optional(),
    adminNotes: z.string().optional()
});

// GET - Get single quote
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const token = request.headers.get('authorization')?.replace('Bearer ', '');
        const user = token ? await verifyToken(token) : null;

        const { id } = await params;
        const quote = await db.quote.findUnique({
            where: { id },
            include: {
                user: { select: { name: true, email: true, phone: true } }
            }
        });

        if (!quote) {
            return NextResponse.json({ success: false, error: 'Quote not found' }, { status: 404 });
        }

        const isAdmin = user && ['SUPER_ADMIN', 'ORDER_MANAGER'].includes(user.role || '');

        if (!isAdmin && (!user || quote.userId !== user.id)) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
        }

        return NextResponse.json({ success: true, data: quote });
    } catch (error) {
        console.error('Get quote error:', error);
        return NextResponse.json({ success: false, error: 'Failed to fetch quote' }, { status: 500 });
    }
}

// PATCH - Update quote (admin only)
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const token = request.headers.get('authorization')?.replace('Bearer ', '');
        if (!token) {
            return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
        }

        const { id } = await params;
        const user = await verifyToken(token);
        if (!user || !['SUPER_ADMIN', 'ORDER_MANAGER'].includes(user.role || '')) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
        }

        const body = await request.json();
        const validated = updateQuoteSchema.parse(body);

        const updateData: any = {};
        if (validated.status) updateData.status = validated.status;
        if (validated.quotedAmount) updateData.quotedAmount = validated.quotedAmount;
        if (validated.validUntil) updateData.validUntil = new Date(validated.validUntil);
        if (validated.adminNotes !== undefined) updateData.adminNotes = validated.adminNotes;

        const quote = await db.quote.update({
            where: { id },
            data: updateData
        });

        return NextResponse.json({ success: true, data: quote });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ success: false, error: 'Validation failed', details: error.issues }, { status: 400 });
        }
        console.error('Update quote error:', error);
        return NextResponse.json({ success: false, error: 'Failed to update quote' }, { status: 500 });
    }
}